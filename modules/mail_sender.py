"""
Module for sending mail via SMTP with attachments support.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class MailSender:
    """Manages mail sending via SMTP with PDF attachments support"""
    
    def __init__(self, smtp_server: str, smtp_user: str, smtp_pass: str, smtp_port: int = 465):
        self.smtp_server = smtp_server
        self.smtp_user = smtp_user
        self.smtp_pass = smtp_pass
        self.smtp_port = smtp_port
    
    def send_forwarded_mail(
        self,
        to_email: str,
        original_from: str,
        original_subject: str,
        original_body: str,
        original_date: str,
        reparto_nome: str,
        analysis_summary: str = None,
        confidence: int = None,
        email_message = None
    ) -> bool:
        """
        Send forwarded email to appropriate department with AI analysis and attachments.
        
        Args:
            to_email: Recipient email
            original_from: Original sender
            original_subject: Original subject
            original_body: Original body
            original_date: Original date
            reparto_nome: Destination department name
            analysis_summary: LLM analysis summary (optional)
            confidence: Analysis confidence level 0-100 (optional)
            email_message: Original email object to extract PDF attachments (optional)
        
        Returns:
            True if sending succeeded, False otherwise
        """
        try:
            smtp = smtplib.SMTP_SSL(self.smtp_server, self.smtp_port)
            smtp.login(self.smtp_user, self.smtp_pass)
            
            fwd_msg = MIMEMultipart()
            fwd_msg['Subject'] = f"[ROUTED TICKET - {reparto_nome}] {original_subject}"
            fwd_msg['From'] = self.smtp_user
            fwd_msg['To'] = to_email
            
            # AI analysis section if present
            ai_section = ""
            if analysis_summary or confidence is not None:
                confidence_status = ""
                if confidence is not None:
                    if confidence < 70:
                        confidence_status = "⚠️ REQUIRES HUMAN REVIEW"
                    else:
                        confidence_status = "✅ High confidence"
                
                ai_section = f"""
===== AI ANALYSIS =====
Summary: {analysis_summary or 'N/A'}
Confidence: {confidence}% {confidence_status}

"""
            
            # Compose full body
            body_text = f"""
===== AUTOMATED TICKET - DEPARTMENT {reparto_nome.upper()} =====

Sender: {original_from}
Date: {original_date}
Subject: {original_subject}

{ai_section}===== ORIGINAL MESSAGE =====
{original_body}

===== END MESSAGE =====
"""
            
            fwd_msg.attach(MIMEText(body_text, 'plain'))
            
            # Attach PDF if present in original email
            if email_message:
                pdf_count = 0
                for part in email_message.walk():
                    # Check if PDF
                    is_pdf = (part.get_content_type() == 'application/pdf' or 
                             (part.get_content_type() == 'application/octet-stream' and 
                              part.get_filename() and part.get_filename().lower().endswith('.pdf')))
                    
                    if is_pdf:
                        pdf_data = part.get_payload(decode=True)
                        if pdf_data:
                            filename = part.get_filename() or f"attachment_{pdf_count}.pdf"
                            pdf_attachment = MIMEApplication(pdf_data, _subtype="pdf")
                            pdf_attachment.add_header('Content-Disposition', 'attachment', filename=filename)
                            fwd_msg.attach(pdf_attachment)
                            pdf_count += 1
                            logger.info(f"PDF attachment added: {filename}")
                
                if pdf_count > 0:
                    logger.info(f"Total PDF attachments: {pdf_count}")
            
            # Send
            smtp.sendmail(self.smtp_user, to_email, fwd_msg.as_string())
            smtp.quit()
            
            logger.info(f"✅ Mail forwarded successfully to {to_email} (department: {reparto_nome})")
            return True
        
        except Exception as e:
            logger.error(f"❌ Error sending mail: {e}")
            return False
