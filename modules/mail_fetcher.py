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
        """Extract message body (prefers plain text, converts HTML if needed)"""
        body = ""
        html_body = ""
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get('Content-Disposition', ''))
                
                # Preferisci text/plain
                if content_type == 'text/plain' and 'attachment' not in content_disposition:
                    try:
                        payload = part.get_payload(decode=True)
                        if payload:
                            body = payload.decode('utf-8', errors='ignore')
                            break
                    except Exception as e:
                        logger.warning(f"Error decoding text/plain part: {e}")
                
                # Se non troviamo text/plain, salva HTML
                elif content_type == 'text/html' and 'attachment' not in content_disposition and not body:
                    try:
                        payload = part.get_payload(decode=True)
                        if payload:
                            html_body = payload.decode('utf-8', errors='ignore')
                    except Exception as e:
                        logger.warning(f"Error decoding text/html part: {e}")
        else:
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    # Controlla se è HTML
                    content_type = msg.get_content_type()
                    decoded = payload.decode('utf-8', errors='ignore')
                    
                    if content_type == 'text/html':
                        html_body = decoded
                    else:
                        body = decoded
            except Exception as e:
                logger.warning(f"Error decoding message: {e}")
        
        # Se abbiamo solo HTML, convertiamolo in testo
        if not body and html_body:
            body = self._html_to_text(html_body)
        
        return body.strip()
    
    def _html_to_text(self, html_content: str) -> str:
        """Convert HTML to plain text"""
        try:
            from html.parser import HTMLParser
            import re
            
            class HTMLTextExtractor(HTMLParser):
                def __init__(self):
                    super().__init__()
                    self.text = []
                    self.skip_tags = {'script', 'style', 'head', 'title', 'meta', '[document]'}
                    self.current_tag = None
                
                def handle_starttag(self, tag, attrs):
                    self.current_tag = tag
                    # Aggiungi spazio dopo link
                    if tag == 'a':
                        for attr, value in attrs:
                            if attr == 'href':
                                self.text.append(f' ')
                
                def handle_endtag(self, tag):
                    self.current_tag = None
                    # Aggiungi nuova riga dopo elementi blocco
                    if tag in {'p', 'div', 'br', 'tr', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
                        self.text.append('\n')
                
                def handle_data(self, data):
                    if self.current_tag not in self.skip_tags:
                        text = data.strip()
                        if text:
                            self.text.append(text + ' ')
            
            parser = HTMLTextExtractor()
            parser.feed(html_content)
            text = ''.join(parser.text)
            
            # Pulisci il testo
            text = re.sub(r'\n\s*\n', '\n\n', text)  # Rimuovi righe vuote multiple
            text = re.sub(r' +', ' ', text)  # Rimuovi spazi multipli
            text = text.strip()
            
            return text
            
        except Exception as e:
            logger.warning(f"Error converting HTML to text: {e}")
            # Fallback: rimozione tag HTML con regex
            import re
            text = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
            text = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
            text = re.sub(r'<[^>]+>', '', text)
            text = re.sub(r'\s+', ' ', text)
            return text.strip()
