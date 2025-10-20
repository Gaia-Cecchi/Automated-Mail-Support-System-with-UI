"""
Module for email retrieval via IMAP
"""
import imaplib
import email
from email.header import decode_header
from email.message import Message
from typing import List, Tuple, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class MailFetcher:
    """Manages retrieval of unread emails from an IMAP server"""
    
    def __init__(self, imap_server: str, email_user: str, email_password: str):
        self.imap_server = imap_server
        self.email_user = email_user
        self.email_password = email_password
    
    def fetch_unread_emails(self) -> List[Tuple[Message, Dict[str, str]]]:
        """
        Retrieve all unread emails
        
        Returns:
            List of tuples (message, metadata) where metadata contains:
            - from: sender
            - subject: subject
            - date: date
            - body: message body
        """
        emails = []
        
        try:
            # IMAP connection
            mail = imaplib.IMAP4_SSL(self.imap_server)
            mail.login(self.email_user, self.email_password)
            mail.select('inbox')
            
            # Search unread emails
            status, messages = mail.search(None, 'UNSEEN')
            
            if status != 'OK':
                logger.error("Error searching unread emails")
                return emails
            
            email_ids = messages[0].split()
            
            for email_id in email_ids:
                status, msg_data = mail.fetch(email_id, '(RFC822)')
                
                if status != 'OK':
                    continue
                
                # Parse message
                msg = email.message_from_bytes(msg_data[0][1])
                
                # Extract metadata
                subject = self._decode_header(msg.get('Subject', ''))
                from_addr = self._decode_header(msg.get('From', ''))
                date_str = msg.get('Date', '')
                
                # Extract body
                body = self._extract_body(msg)
                
                metadata = {
                    'from': from_addr,
                    'subject': subject,
                    'date': date_str,
                    'body': body
                }
                
                emails.append((msg, metadata))
            
            mail.close()
            mail.logout()
            
        except Exception as e:
            logger.error(f"Error retrieving emails: {e}")
        
        return emails
    
    def _decode_header(self, header: Optional[str]) -> str:
        """Decode email header"""
        if not header:
            return ""
        
        decoded_parts = decode_header(header)
        result = []
        
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                result.append(part.decode(encoding or 'utf-8', errors='ignore'))
            else:
                result.append(str(part))
        
        return ''.join(result)
    
    def _extract_body(self, msg: Message) -> str:
        """Extract message body"""
        body = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                
                if content_type == 'text/plain':
                    try:
                        payload = part.get_payload(decode=True)
                        if payload:
                            body = payload.decode('utf-8', errors='ignore')
                            break
                    except Exception as e:
                        logger.warning(f"Error decoding message part: {e}")
        else:
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    body = payload.decode('utf-8', errors='ignore')
            except Exception as e:
                logger.warning(f"Error decoding message: {e}")
        
        return body.strip()
