"""
Flask API Backend for Email Support System
Connects React frontend with Python email processing modules
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from datetime import datetime
import logging
from threading import Thread
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from modules.mail_fetcher import MailFetcher
from modules.mail_sender import MailSender
from modules.ticket_processor_simple import TicketProcessorSimple
from modules.process_mail import read_pdf_attachment
from modules.config_manager import ConfigManager
from modules.reparti_manager import RepartiManager
from modules.stats_manager import StatsManager
from modules.email_storage import EmailStorage

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global state
config_manager = ConfigManager('config_api.json')
reparti_manager = RepartiManager('reparti_api.json')
stats_manager = StatsManager('email_stats.json')
email_storage = EmailStorage('emails.json')
ticket_processor = None
automation_thread = None
automation_enabled = False

# Log initial configuration
logger.info(f"Config file: config_api.json")
logger.info(f"Departments file: reparti_api.json")
logger.info(f"Initial departments loaded: {reparti_manager.get_all()}")
logger.info(f"Number of departments: {len(reparti_manager.get_all())}")

def get_ticket_processor():
    """Initialize ticket processor with current settings - Ollama only"""
    global ticket_processor
    
    ollama_url = config_manager.get('OLLAMA_URL', 'http://localhost:11434/v1')
    ollama_model = config_manager.get('OLLAMA_MODEL', 'gemma3:4b')
    
    logger.info(f"Using Ollama: {ollama_url} with model {ollama_model}")
    
    ticket_processor = TicketProcessorSimple(
        api_key="ollama",
        provider="ollama",
        model=ollama_model,
        api_base=ollama_url
    )
    
    return ticket_processor

# ============= SETTINGS ENDPOINTS =============

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get current system settings"""
    try:
        logger.info(f"GET /api/settings called")
        logger.info(f"reparti_manager instance: {id(reparti_manager)}")
        logger.info(f"reparti_manager._reparti: {reparti_manager._reparti}")
        
        departments = reparti_manager.get_all()
        logger.info(f"GET /api/settings - Departments returned: {departments}")
        logger.info(f"GET /api/settings - Number of departments: {len(departments)}")
        
        settings = {
            'emailCredentials': {
                'server': config_manager.get('IMAP', ''),
                'username': config_manager.get('EMAIL', ''),
                'password': config_manager.get('EMAIL_PASSWORD', ''),
                'imap': config_manager.get('IMAP', ''),
                'smtp': config_manager.get('SMTP', '')
            },
            'groq': {
                'apiKey': config_manager.get('GROQ_API_KEY', ''),
                'model': config_manager.get('GROQ_MODEL', 'llama-3.1-8b-instant')
            },
            'ollama': {
                'url': config_manager.get('OLLAMA_URL', 'http://localhost:11434/v1'),
                'model': config_manager.get('OLLAMA_MODEL', 'llama3.1')
            },
            'azure': {
                'apiKey': config_manager.get('AZURE_API_KEY', ''),
                'enabled': bool(config_manager.get('AZURE_API_KEY', ''))
            },
            'automaticRouting': {
                'enabled': config_manager.get('AUTOMATIC_ROUTING', False),
                'checkInterval': int(config_manager.get('CHECK_INTERVAL', 5))
            },
            'departments': departments,
            'notificationsEnabled': config_manager.get('NOTIFICATIONS', True),
            'darkMode': config_manager.get('DARK_MODE', False),
            'language': config_manager.get('LANGUAGE', 'en')
        }
        return jsonify(settings), 200
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def save_settings():
    """Save system settings"""
    try:
        data = request.json
        
        # Save email credentials
        if 'emailCredentials' in data:
            creds = data['emailCredentials']
            config_manager.set('EMAIL', creds.get('username', ''))
            config_manager.set('EMAIL_PASSWORD', creds.get('password', ''))
            config_manager.set('IMAP', creds.get('imap', ''))
            config_manager.set('SMTP', creds.get('smtp', ''))
        
        # Save AI provider settings
        if 'groq' in data:
            config_manager.set('GROQ_API_KEY', data['groq'].get('apiKey', ''))
            config_manager.set('GROQ_MODEL', data['groq'].get('model', 'llama-3.1-8b-instant'))
        
        if 'ollama' in data:
            config_manager.set('OLLAMA_URL', data['ollama'].get('url', ''))
            config_manager.set('OLLAMA_MODEL', data['ollama'].get('model', 'llama3.1'))
        
        # Save Azure settings
        if 'azure' in data:
            config_manager.set('AZURE_API_KEY', data['azure'].get('apiKey', ''))
        
        # Save automation settings
        if 'automaticRouting' in data:
            config_manager.set('AUTOMATIC_ROUTING', data['automaticRouting'].get('enabled', False))
            config_manager.set('CHECK_INTERVAL', data['automaticRouting'].get('checkInterval', 5))
        
        # Save UI preferences
        config_manager.set('NOTIFICATIONS', data.get('notificationsEnabled', True))
        config_manager.set('DARK_MODE', data.get('darkMode', False))
        config_manager.set('LANGUAGE', data.get('language', 'en'))
        
        config_manager.save()
        
        # Update departments (only if explicitly provided and not empty)
        if 'departments' in data:
            logger.info(f"POST /api/settings - Departments in request: {data['departments']}")
            
            # Only update if departments list is not empty or if explicitly clearing
            if data['departments'] or data.get('clearDepartments', False):
                # Clear and re-add departments
                for dept in reparti_manager.get_all():
                    reparti_manager.remove_reparto(dept['nome'])
                
                for dept in data['departments']:
                    reparti_manager.add_reparto(
                        dept['nome'],
                        dept['descrizione'],
                        dept['email']
                    )
                reparti_manager.save()
                logger.info(f"Departments updated. New count: {len(reparti_manager.get_all())}")
            else:
                logger.warning("Received empty departments list - keeping existing departments")
        
        return jsonify({'success': True, 'message': 'Settings saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error saving settings: {e}")
        return jsonify({'error': str(e)}), 500

# ============= DEPARTMENTS ENDPOINTS =============

@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Get all departments"""
    try:
        departments = reparti_manager.get_all()
        return jsonify(departments), 200
    except Exception as e:
        logger.error(f"Error getting departments: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/departments', methods=['POST'])
def add_department():
    """Add a new department"""
    try:
        data = request.json
        success = reparti_manager.add_reparto(
            data['nome'],
            data['descrizione'],
            data['email']
        )
        
        if success:
            reparti_manager.save()
            return jsonify({'success': True, 'message': 'Department added'}), 201
        else:
            return jsonify({'error': 'Department already exists'}), 400
    except Exception as e:
        logger.error(f"Error adding department: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/departments/<string:nome>', methods=['DELETE'])
def delete_department(nome):
    """Delete a department"""
    try:
        reparti_manager.remove_reparto(nome)
        reparti_manager.save()
        return jsonify({'success': True, 'message': 'Department deleted'}), 200
    except Exception as e:
        logger.error(f"Error deleting department: {e}")
        return jsonify({'error': str(e)}), 500

# ============= EMAIL ENDPOINTS =============

@app.route('/api/emails/check', methods=['POST'])
def check_emails():
    """Check for new unread emails"""
    try:
        # Get credentials
        imap = config_manager.get('IMAP')
        email = config_manager.get('EMAIL')
        password = config_manager.get('EMAIL_PASSWORD')
        
        if not all([imap, email, password]):
            return jsonify({'error': 'Email credentials not configured'}), 400
        
        # Fetch emails
        fetcher = MailFetcher(imap, email, password)
        email_messages = fetcher.fetch_unread_emails()
        
        # Convert to JSON format
        emails = []
        for msg, metadata in email_messages:
            # Extract PDF if present
            pdf_content = read_pdf_attachment(msg)
            
            email_data = {
                'id': f"{metadata['from']}-{metadata['subject']}-{metadata['date']}",
                'sender': metadata['from'],
                'subject': metadata['subject'],
                'body': metadata['body'],
                'timestamp': metadata['date'],
                'attachments': [],  # TODO: Extract attachment info
                'status': 'not_processed',
                'pdfContent': pdf_content,
                # Store raw message for later processing
                '_rawMessage': None  # Cannot serialize email.message.Message
            }
            
            # Store the raw message in a cache (in production use Redis/DB)
            # For now we'll process immediately if AI is configured
            
            emails.append(email_data)
        
        return jsonify({
            'success': True,
            'count': len(emails),
            'emails': emails
        }), 200
        
    except Exception as e:
        logger.error(f"Error checking emails: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails/process', methods=['POST'])
def process_email():
    """Process an email with AI analysis"""
    try:
        data = request.json
        email_data = data['email']
        
        # Get processor
        processor = get_ticket_processor()
        
        # Get departments
        reparti = reparti_manager.get_all()
        logger.info(f"Departments loaded: {reparti}")
        logger.info(f"Number of departments: {len(reparti)}")
        
        if not reparti:
            logger.error("No departments configured!")
            return jsonify({'error': 'No departments configured'}), 400
        
        # Analyze with AI
        # Note: We don't have the original email.message.Message object in API
        # Pass None for email_message as it's not used in analyze_email
        analysis, reparto = processor.process_ticket(
            email_message=None,
            subject=email_data['subject'],
            body=email_data['body'],
            pdf_content=email_data.get('pdfContent', ''),
            reparti=reparti
        )
        
        if not analysis or not reparto:
            return jsonify({'error': 'AI analysis failed'}), 500
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'suggestedDepartment': reparto['nome'],
            'departmentEmail': reparto['email']
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing email: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails/forward', methods=['POST'])
def forward_email():
    """Forward an email to a department"""
    try:
        data = request.json
        email_data = data['email']
        department = data['department']
        analysis = data.get('analysis', {})
        
        # Get SMTP credentials
        smtp = config_manager.get('SMTP')
        email = config_manager.get('EMAIL')
        password = config_manager.get('EMAIL_PASSWORD')
        
        if not all([smtp, email, password]):
            return jsonify({'error': 'SMTP credentials not configured'}), 400
        
        # Send email
        sender = MailSender(smtp, email, password)
        
        # Find department email
        dept = next((d for d in reparti_manager.get_all() if d['nome'] == department), None)
        if not dept:
            return jsonify({'error': 'Department not found'}), 404
        
        success = sender.send_forwarded_mail(
            to_email=dept['email'],
            original_from=email_data['sender'],
            original_subject=email_data['subject'],
            original_body=email_data['body'],
            original_date=email_data['timestamp'],
            reparto_nome=department,
            analysis_summary=analysis.get('summary'),
            confidence=analysis.get('confidence'),
            email_message=None  # TODO: Handle attachments
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Email forwarded to {department}'
            }), 200
        else:
            return jsonify({'error': 'Failed to send email'}), 500
        
    except Exception as e:
        logger.error(f"Error forwarding email: {e}")
        return jsonify({'error': str(e)}), 500

# ============= AUTOMATION ENDPOINTS =============

@app.route('/api/automation/start', methods=['POST'])
def start_automation():
    """Start automatic email processing loop"""
    global automation_enabled, automation_thread
    
    try:
        if automation_enabled:
            return jsonify({'message': 'Automation already running'}), 200
        
        automation_enabled = True
        
        def automation_loop():
            """Background thread for automatic processing"""
            global automation_enabled
            
            check_interval = int(config_manager.get('CHECK_INTERVAL', 5)) * 60
            
            while automation_enabled:
                try:
                    logger.info("Automation: Checking for new emails...")
                    
                    # Check for emails
                    # Similar to check_emails endpoint but process automatically
                    
                    time.sleep(check_interval)
                except Exception as e:
                    logger.error(f"Automation error: {e}")
                    time.sleep(10)
        
        automation_thread = Thread(target=automation_loop, daemon=True)
        automation_thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Automation started'
        }), 200
        
    except Exception as e:
        logger.error(f"Error starting automation: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/automation/stop', methods=['POST'])
def stop_automation():
    """Stop automatic email processing loop"""
    global automation_enabled
    
    automation_enabled = False
    
    return jsonify({
        'success': True,
        'message': 'Automation stopped'
    }), 200

@app.route('/api/automation/status', methods=['GET'])
def automation_status():
    """Get automation status"""
    return jsonify({
        'enabled': automation_enabled,
        'checkInterval': int(config_manager.get('CHECK_INTERVAL', 5))
    }), 200

# ============= STATISTICS ENDPOINTS =============

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get email statistics"""
    try:
        stats = stats_manager.get_stats()
        logger.info(f"GET /api/stats - Returning stats: {stats}")
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats/received', methods=['POST'])
def update_received():
    """Update received email count"""
    try:
        data = request.json
        count = data.get('count', 1)
        
        stats = stats_manager.update_received_count(count)
        logger.info(f"Updated received count: +{count}")
        
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error updating received count: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats/processed', methods=['POST'])
def update_processed():
    """Update processed email stats"""
    try:
        data = request.json
        department = data.get('department', 'Unknown')
        confidence = data.get('confidence', 0.0)
        
        stats = stats_manager.update_processed_email(department, confidence)
        logger.info(f"Updated processed stats for department: {department} (confidence: {confidence})")
        
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error updating processed stats: {e}")
        return jsonify({'error': str(e)})

@app.route('/api/stats/reset', methods=['POST'])
def reset_stats():
    """Reset all statistics"""
    try:
        stats = stats_manager.reset_stats()
        logger.info("Stats reset to default")
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error resetting stats: {e}")
        return jsonify({'error': str(e)}), 500

# ============= EMAIL STORAGE =============

@app.route('/api/emails/storage', methods=['GET'])
def get_stored_emails():
    """Get all stored emails"""
    try:
        emails = email_storage.get_all_emails()
        logger.info(f"Retrieved {len(emails)} emails from storage")
        return jsonify(emails), 200
    except Exception as e:
        logger.error(f"Error getting stored emails: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails/storage', methods=['POST'])
def save_emails():
    """Save all emails to storage"""
    try:
        data = request.get_json()
        emails = data.get('emails', [])
        result = email_storage.save_all_emails(emails)
        logger.info(f"Saved {len(emails)} emails to storage")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error saving emails: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails/storage/<email_id>', methods=['DELETE'])
def delete_stored_email(email_id):
    """Delete a specific email from storage"""
    try:
        result = email_storage.delete_email(email_id)
        return jsonify(result), 200 if result['success'] else 404
    except Exception as e:
        logger.error(f"Error deleting email: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/emails/storage/clear', methods=['POST'])
def clear_stored_emails():
    """Clear all emails from storage"""
    try:
        result = email_storage.clear_all_emails()
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error clearing emails: {e}")
        return jsonify({'error': str(e)}), 500

# ============= HEALTH CHECK =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    # Initialize configuration files if they don't exist
    if not os.path.exists('config_api.json'):
        config_manager.save()
    if not os.path.exists('reparti_api.json'):
        reparti_manager.save()
    
    logger.info("Starting Flask API server...")
    logger.info("API available at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
