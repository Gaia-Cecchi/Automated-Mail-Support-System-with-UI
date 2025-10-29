"""
Email Storage Manager for Email Support System
Handles persistent storage of emails
"""
import json
import os
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class EmailStorage:
    """Manages email persistence with file storage"""
    
    def __init__(self, storage_file: str = 'emails.json'):
        """
        Initialize the email storage manager
        
        Args:
            storage_file: Path to the emails JSON file
        """
        self.storage_file = storage_file
        logger.info(f"EmailStorage initialized with file: {self.storage_file}")
    
    def _load_emails(self) -> List[Dict[str, Any]]:
        """Load emails from JSON file"""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, 'r', encoding='utf-8') as f:
                    emails = json.load(f)
                    logger.info(f"Loaded {len(emails)} emails from {self.storage_file}")
                    return emails
            except Exception as e:
                logger.error(f"Error loading emails from {self.storage_file}: {e}")
                return []
        else:
            logger.info(f"Emails file {self.storage_file} not found, starting with empty list")
            return []
    
    def _save_emails(self, emails: List[Dict[str, Any]]) -> None:
        """Save emails to JSON file"""
        try:
            with open(self.storage_file, 'w', encoding='utf-8') as f:
                json.dump(emails, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(emails)} emails to {self.storage_file}")
        except Exception as e:
            logger.error(f"Error saving emails to {self.storage_file}: {e}")
    
    def get_all_emails(self) -> List[Dict[str, Any]]:
        """Get all stored emails"""
        return self._load_emails()
    
    def save_all_emails(self, emails: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Save all emails (replaces existing file)
        
        Args:
            emails: List of email dictionaries
            
        Returns:
            Status dictionary
        """
        self._save_emails(emails)
        return {
            'success': True,
            'count': len(emails),
            'timestamp': datetime.now().isoformat()
        }
    
    def add_email(self, email: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a single email to storage
        
        Args:
            email: Email dictionary
            
        Returns:
            Status dictionary
        """
        emails = self._load_emails()
        emails.append(email)
        self._save_emails(emails)
        
        logger.info(f"Added email: {email.get('id', 'unknown')}")
        return {
            'success': True,
            'id': email.get('id'),
            'total_count': len(emails)
        }
    
    def update_email(self, email_id: str, updated_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing email
        
        Args:
            email_id: ID of the email to update
            updated_data: Dictionary with updated fields
            
        Returns:
            Status dictionary
        """
        emails = self._load_emails()
        updated = False
        
        for i, email in enumerate(emails):
            if email.get('id') == email_id:
                emails[i].update(updated_data)
                updated = True
                break
        
        if updated:
            self._save_emails(emails)
            logger.info(f"Updated email: {email_id}")
            return {'success': True, 'id': email_id}
        else:
            logger.warning(f"Email not found for update: {email_id}")
            return {'success': False, 'error': 'Email not found'}
    
    def delete_email(self, email_id: str) -> Dict[str, Any]:
        """
        Delete an email from storage
        
        Args:
            email_id: ID of the email to delete
            
        Returns:
            Status dictionary
        """
        emails = self._load_emails()
        original_count = len(emails)
        emails = [e for e in emails if e.get('id') != email_id]
        
        if len(emails) < original_count:
            self._save_emails(emails)
            logger.info(f"Deleted email: {email_id}")
            return {'success': True, 'id': email_id, 'remaining': len(emails)}
        else:
            logger.warning(f"Email not found for deletion: {email_id}")
            return {'success': False, 'error': 'Email not found'}
    
    def clear_all_emails(self) -> Dict[str, Any]:
        """
        Clear all emails from storage
        
        Returns:
            Status dictionary
        """
        emails = self._load_emails()
        count = len(emails)
        self._save_emails([])
        logger.info(f"Cleared all {count} emails")
        return {'success': True, 'cleared_count': count}
