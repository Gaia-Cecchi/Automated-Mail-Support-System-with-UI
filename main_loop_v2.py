from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
import json
import time
import os
from dotenv import load_dotenv
from modules.redirect_engine import route_mail, redirect_mail
from modules.sql_engine import json_to_sql
from modules.process_mail import (check_for_new_emails, 
                                    get_email_body,
                                    read_pdf_attachment)
from modules.azure_maps_full import get_location_details
import logging
from logging.handlers import RotatingFileHandler
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

load_dotenv()

# Import configuration
try:
    from config import Config
    Config.validate_config()
    email_account = Config.EMAIL_ACCOUNT
    email_password = Config.EMAIL_PASSWORD
    smtp_host = Config.SMTP_HOST
    AZURE_API_KEY = Config.AZURE_API_KEY
    CHECK_INTERVAL = Config.CHECK_INTERVAL
    control_email = Config.CONTROL_EMAIL
except ImportError:
    # Fallback to old configuration
    email_account = os.getenv('EMAIL')
    email_password = os.getenv('EMAIL_PASSWORD')
    smtp_host = os.getenv('SMTP')
    AZURE_API_KEY = os.getenv("AZURE_API_KEY")
    CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', 60))
    control_email = os.getenv('CONTROL_EMAIL', email_account)

if not email_account or not email_password or not AZURE_API_KEY:
    print("Missing environment variables.")
    exit(1)

# Initialize LLM (Groq consigliato per velocità, Ollama per locale)
groq = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", response_format={"type": "json_object"})
ollama = ChatOllama(model="llama3.1", temperature=0.0, format='json', stop=["<|start_header_id|>", "<|end_header_id|>", "<eot_id>", "<|reserved_special_token"])

# Usa Groq come default (più veloce)
llm = groq

# Setup logging with rotation
os.makedirs('logs', exist_ok=True)
log_handler = RotatingFileHandler('logs/main_loop.log', maxBytes=10*1024*1024, backupCount=5)
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
log_handler.setFormatter(log_formatter)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(log_handler)
logger.addHandler(logging.StreamHandler())  # Also log to console

# Initialize metrics tracking
try:
    from metrics import ProcessingMetrics
    metrics = ProcessingMetrics()
except ImportError:
    metrics = None
    logger.warning("metrics.py not found, metrics tracking disabled")

# Track processed emails to avoid duplicates
processed_emails = set()

def validate_llm_response(response_str):
    """Validate LLM JSON response structure"""
    try:
        response_json = json.loads(response_str)
        required_fields = ['address', 'problem', 'equipment', 'confidence']
        
        for field in required_fields:
            if field not in response_json:
                logger.error(f"Missing required field: {field}")
                return None
        
        # Validate confidence is a number between 0-100
        confidence = response_json.get('confidence')
        if not isinstance(confidence, (int, float)) or not (0 <= confidence <= 100):
            logger.error(f"Invalid confidence value: {confidence}")
            return None
        
        return response_json
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        return None

logger.info("🚀 Main loop started")
logger.info(f"📧 Email account: {email_account}")
logger.info(f"⏱️ Check interval: {CHECK_INTERVAL} seconds")
logger.info(f"📝 Test mode: {os.getenv('USE_TEST_RECIPIENTS', 'false')}")



while True:
    try:
        logger.info("⏳ Waiting for next check...")
        email_messages = check_for_new_emails(email_account)
        
        if not email_messages:
            logger.info("✅ No new emails")
        
        for email_message in email_messages:
            # Generate a unique email ID to avoid duplicate processing
            email_id = f"{email_message.get('From', '')}-{email_message.get('Subject', '')}-{email_message.get('Date', '')}"
            
            if email_id in processed_emails:
                logger.info(f"⏭️ Skipping duplicate email: {email_id[:50]}...")
                continue
            
            try:
                logger.info("📩 New email found, starting processing...")

                # Extract email body
                body = get_email_body(email_message)
                logger.info("✅ Email body extracted")

                # Extract PDF content
                pdf_content = read_pdf_attachment(email_message)
                logger.info("✅ PDF content extracted")

                # Combine PDF content with email body
                content = body + pdf_content

                # Route mail with LLM
                llm_response, run_id = route_mail(content, llm)
                logger.info(f"🤖 LLM response generated (run_id: {run_id})")

                # Validate JSON response
                response_json = validate_llm_response(llm_response)
                if not response_json:
                    logger.error("❌ Invalid LLM response")
                    redirect_mail(None, body, email_message, "Invalid JSON response", None)
                    if metrics:
                        metrics.record_failure()
                    continue

                # Track low confidence
                if response_json.get('confidence', 0) < 50:
                    logger.warning(f"⚠️ Low confidence: {response_json.get('confidence')}")
                    if metrics:
                        metrics.record_low_confidence()

                # Extract address and geocode
                address_found = response_json.get('address')
                geocode_result = None
                if address_found:
                    geocode_result = get_location_details(address_found, AZURE_API_KEY)
                    logger.info(f"📍 Geocode result: {geocode_result}")
                else:
                    logger.warning("⚠️ No address found in response")

                # Generate SQL
                sql_response = json_to_sql(response_json)
                logger.info(f"💾 SQL entry generated")

                # Redirect email
                redirect_mail(geocode_result, body, email_message, sql_response, response_json)
                logger.info("✅ Email redirected successfully")
                
                # Mark as processed
                processed_emails.add(email_id)
                if metrics:
                    metrics.record_success()
                
            except Exception as e:
                logger.error(f"❌ Error processing email: {e}", exc_info=True)
                if metrics:
                    metrics.record_failure()
                
                try:
                    redirect_mail(None, get_email_body(email_message), email_message, f"Processing error: {str(e)}", None)
                except Exception as error:
                    logger.error(f"❌ Failed to redirect error email: {error}")
                    # Emergency fallback
                    with smtplib.SMTP_SSL(smtp_host, 465) as smtp:
                        smtp.login(email_account, email_password)
                        error_msg = MIMEMultipart()
                        error_msg['Subject'] = "Critical Error in Email Processing"
                        error_msg['From'] = email_account
                        error_msg['To'] = control_email
                        error_text = f"Critical error occurred: {str(e)}\n\nFailed to redirect: {str(error)}"
                        error_msg.attach(MIMEText(error_text))
                        smtp.send_message(error_msg, to_addrs=[control_email])

        # Log metrics periodically (every 10 checks)
        if metrics and metrics.total_processed % 10 == 0 and metrics.total_processed > 0:
            metrics.log_stats(logger)
            metrics.save()

        logger.info(f"💤 Sleeping for {CHECK_INTERVAL} seconds...")
        time.sleep(CHECK_INTERVAL)
        
    except KeyboardInterrupt:
        logger.info("⛔ Manual interruption")
        if metrics:
            metrics.log_stats(logger)
            metrics.save()
        break
    except Exception as e:
        logger.error(f"❌ Error in main loop: {e}", exc_info=True)
        time.sleep(10)  # Sleep a bit before retrying
