import imaplib
import email
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
import smtplib
import logging  # Aggiungiamo l'importazione del modulo logging

import io
import os
from dotenv import load_dotenv

# Optional import per logging (non usato dalla GUI)
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

# librerie per leggere pdf
import pdfplumber

# Librerie opzionali per OCR
try:
    from pdf2image import convert_from_bytes
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

# FPDF opzionale per creazione PDF
try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False

load_dotenv()

# Configuration mail from .env file
imap_host = os.getenv('IMAP')
smtp_host = os.getenv('SMTP')
email_account = os.getenv('EMAIL') # Get email from environment variable
email_password = os.getenv('EMAIL_PASSWORD')  # Get password from environment variable

# controlla mail non lette e returna email_message
def check_for_new_emails(email_account):
    email_messages = []
    mail = imaplib.IMAP4_SSL(imap_host)
    mail.login(email_account, email_password)
    mail.select('inbox')
    status, messages = mail.search(None, 'UNSEEN')
    if status == 'OK':
        for num in messages[0].split():
            status, data = mail.fetch(num, '(RFC822)')
            if status == 'OK':
                email_message = email.message_from_bytes(data[0][1])
                email_messages.append(email_message)

    mail.close()
    mail.logout()
    return(email_messages)

# salva l'allegato della mail
def save_attachment(msg, download_folder=r"#allegati"):

        att_path = "No attachment found."
        for part in msg.walk():
            if part.get_content_maintype() == 'multipart':
                continue
            if part.get('Content-Disposition') is None:
                continue

            filename = part.get_filename()
            att_path = os.path.join(download_folder, filename)

            if not os.path.isfile(att_path):
                fp = open(att_path, 'wb')
                fp.write(part.get_payload(decode=True))
                fp.close()
        return att_path

# legge l'allegato pdf della mail
def read_pdf_attachment(msg):
    pdf_content = "No PDF attachment found."
    
    # Loop through all parts of the email
    for part in msg.walk():
        # Skip multipart containers
        if part.get_content_maintype() == 'multipart':
            continue
        
        # Check for 'attachment' or 'inline' disposition
        content_disposition = part.get("Content-Disposition", "")
        if "attachment" in content_disposition or "inline" in content_disposition:
            
            # Check if the part is a PDF (even if mislabeled as octet-stream)
            if part.get_content_type() in ['application/pdf', 'application/octet-stream']:
                pdf_data = part.get_payload(decode=True)
                if pdf_data:
                    # Use BytesIO to handle the PDF content
                    pdf_file = io.BytesIO(pdf_data)
                    
                    # Try to extract text using pdfplumber
                    try:
                        with pdfplumber.open(pdf_file) as pdf:
                            pdf_content = ""
                            for page in pdf.pages:
                                text = page.extract_text()
                                if text:
                                    pdf_content += text
                    except Exception as e:
                        pdf_content = f"Error reading PDF with pdfplumber: {str(e)}"
                    
                    # If no text extracted, fallback to OCR (se disponibile)
                    if not pdf_content.strip() and OCR_AVAILABLE:
                        try:
                            images = convert_from_bytes(pdf_data)  # Convert PDF pages to images
                            for image in images:
                                pdf_content += pytesseract.image_to_string(image)
                        except Exception as e:
                            pdf_content += f"\nError extracting text with OCR: {str(e)}"
                    elif not pdf_content.strip():
                        pdf_content = "[PDF senza testo - OCR non disponibile]"
    
    return pdf_content

# dalla mail estrae il corpo e returna body (con soggetto all'inizio)
def get_email_body(email_message):
    if email_message is None:
        return ""
    body = ""
    subject = email_message.get('Subject', '')  # Ottieni l'oggetto del messaggio
    if email_message.is_multipart():
        for part in email_message.walk():
            ctype = part.get_content_type()
            cdispo = str(part.get('Content-Disposition'))

            # skip any text/plain (txt) attachments
            if ctype == 'text/plain' and 'attachment' not in cdispo:
                body = part.get_payload(decode=True)  # decode
                break
    # not multipart - i.e. plain text, no attachments, keeping fingers crossed
    else:
        body = email_message.get_payload(decode=True)
        print("Corpo dell'email: ", body)

    # Concatena l'oggetto e il corpo del messaggio
    body = f"{subject}\n\n{body.decode('utf-8', errors='ignore')}"
    return body

# dalla mail estrae il corpo del testo e anche quello del pdf allegato e returna content
def get_email_content(email_message):
    if email_message is None:
        return ""
    body = ""
    pdf_content = ""
    subject = email_message.get('Subject', '')  # Ottieni l'oggetto del messaggio
    if email_message.is_multipart():
        for part in email_message.walk():
            ctype = part.get_content_type()
            cdispo = str(part.get('Content-Disposition'))

            # skip any text/plain (txt) attachments
            if ctype == 'text/plain' and 'attachment' not in cdispo:
                body = part.get_payload(decode=True)  # decode
            elif ctype == 'application/pdf':
                pdf_data = part.get_payload(decode=True)
                pdf_file = io.BytesIO(pdf_data)
                with pdfplumber.open(pdf_file) as pdf:
                    for page in pdf.pages:
                        pdf_content += page.extract_text()
    # not multipart - i.e. plain text, no attachments, keeping fingers crossed
    else:
        body = email_message.get_payload(decode=True)
        print("Corpo dell'email: ", body)

    # Concatena l'oggetto, il corpo del messaggio e il contenuto del PDF
    content = f"{subject}\n\n{body.decode('utf-8', errors='ignore')}\n\n{pdf_content}"
    return str(content)

# Invia llm_response come risposta all'email
def send_email_response(llm_response, geocode_result, email_message, sql_response):
    # Create a multipart message
    msg = MIMEMultipart()
    # Add the email body
    body = MIMEText(llm_response + "\n\n" + str(geocode_result))
    msg.attach(body)
    # Attach the PDF
    with open("email.pdf", "rb") as f:
        attach = MIMEApplication(f.read(), _subtype="pdf")
        attach.add_header('Content-Disposition', 'attachment', filename=str("email.pdf"))
        msg.attach(attach)
    # Write sql_response to a text file and attach it
    with open("sql_response.txt", "w") as f:
        f.write(sql_response)
    with open("sql_response.txt", "rb") as f:
        attach = MIMEApplication(f.read(), _subtype="txt")
        attach.add_header('Content-Disposition', 'attachment', filename=str("sql_response.txt"))
        msg.attach(attach)
    
    with smtplib.SMTP_SSL(smtp_host, 465) as smtp:  # Nota l'uso di SMTP_SSL e la porta 465
        smtp.login(email_account, email_password)
        # Includi sia i destinatari 'To' che 'Cc' quando invii il messaggio
        recipients = [email_message['From']]
        if 'Cc' in email_message:
            recipients += [email.strip() for email in email_message['Cc'].split(',') if email.strip() != email_account] # Non includere l'indirizzo email dell'account, sennò entra in loop
        smtp.send_message(msg, to_addrs=recipients)

# DEPRECATED - This function is replaced by the one in redirect_engine.py
# Keeping here temporarily for backward compatibility
def redirect_mail(*args, **kwargs):
    logging.warning("Using deprecated redirect_mail from process_mail. Please use the one from redirect_engine.")
    from modules.redirect_engine import redirect_mail as redirect_mail_new
    
    # Convert arguments to match new function signature
    if len(args) == 4:  # Old function signature
        geocode_result, body, email_message, sql_response = args
        return redirect_mail_new(geocode_result, body, email_message, sql_response, None)
    elif len(args) == 5:  # New function signature
        return redirect_mail_new(*args)
    else:
        # Emergency fallback
        with smtplib.SMTP_SSL(smtp_host, 465) as smtp:
            smtp.login(email_account, email_password)
            error_msg = MIMEMultipart()
            error_msg['Subject'] = "Error in redirect_mail function"
            error_msg['From'] = email_account
            error_msg['To'] = email_account  # Send to self instead of hardcoded email
            error_body = MIMEText(f"Invalid arguments to redirect_mail: {args}, {kwargs}")
            error_msg.attach(error_body)
            smtp.send_message(error_msg, to_addrs=[email_account])

# Funzione per salvare la domanda e la risposta in un file di log excel e 
def save_qa_to_log(question, answer):
    """Salva Q&A in log. Richiede pandas installato."""
    if not PANDAS_AVAILABLE:
        # Fallback a solo text se pandas non disponibile
        with open('ai_logs.txt', 'a') as f:
            f.write(f'Domanda: {question}\nRisposta: {answer}\n\n')
        return
    
    data = {'Domanda': [question], 'Risposta': [answer]}
    df = pd.DataFrame(data)
    try:
        existing_df = pd.read_excel('ai_logs.xlsx')
        updated_df = pd.concat([existing_df, df], ignore_index=True)
        updated_df.to_excel('ai_logs.xlsx', index=False)
    except FileNotFoundError:
        df.to_excel('ai_logs.xlsx', index=False)
    except Exception as e:
        print("Errore durante il salvataggio nel file di log:", str(e))
    else:
        print("Salvataggio nel file di log completato con successo.")
    #save also in a text file
    with open('ai_logs.txt', 'a') as f:
        f.write(f'Domanda: {question}\nRisposta: {answer}\n\n')
        #save_qa_to_vector_store(f)

# Funzione per creare un pdf con il contenuto dell'email che è la variabile body
def create_pdf(email_message):
    """Crea PDF del corpo email. Richiede fpdf installato."""
    if not FPDF_AVAILABLE:
        logging.warning("FPDF non disponibile, impossibile creare PDF")
        return False
    
    # Estrai il corpo dell'email
    email_body = get_email_body(email_message)
    # Crea un nuovo oggetto PDF
    pdf = FPDF()
    # Aggiungi una nuova pagina
    pdf.add_page()
    # Imposta il font
    pdf.set_font("Arial", size = 12)
    # Rimuovi o sostituisci i caratteri non validi
    email_body = email_body.encode('latin-1', errors='replace').decode('latin-1')
    # Aggiungi il corpo dell'email al PDF
    pdf.multi_cell(0, 4, txt = email_body)
    # Salva il PDF
    pdf.output("email.pdf")
    return True

# Funzione per estrarre testo dal pdf in allegato, prende in ingresso la stringa della posizione del pdf e ritorna un array di stringhe, non deve sforare però  
#il limite di characters massimi accettabili dal modello
#TODO: encoding e decoding deve essere valutato
def extract_text_from_pdf(pdf_path, max_chars=32768):
    total_chars = 0
    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text is None:
                continue
            
            num_chars = len(page_text)

            # Check if adding this page exceeds the max character limit
            if total_chars + num_chars > max_chars:
                # Calculate how many characters we can still add
                remaining_chars = max_chars - total_chars
                # Add only the part of the text that fits in the remaining characters
                text += page_text[:remaining_chars]
                break
            else:
                # Add the whole page text if within limits
                text += page_text + "\n"
                total_chars += num_chars

    return text
