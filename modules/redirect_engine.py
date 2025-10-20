from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langsmith import traceable, Client
import uuid
from dotenv import load_dotenv
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import json
import os

load_dotenv()

# Import configuration
try:
    from config import Config
    email_account = Config.EMAIL_ACCOUNT
    email_password = Config.EMAIL_PASSWORD
    smtp_host = Config.SMTP_HOST
    RECIPIENTS = Config.RECIPIENTS
    USE_TEST_RECIPIENTS = Config.USE_TEST
except ImportError:
    # Fallback to old configuration if config.py not found
    logging.warning("config.py not found, using legacy configuration")
    email_account = os.getenv('EMAIL')
    email_password = os.getenv('EMAIL_PASSWORD')
    smtp_host = os.getenv('SMTP')
    USE_TEST_RECIPIENTS = os.getenv('USE_TEST_RECIPIENTS', 'false').lower() == 'true'
    suffix = '_TEST' if USE_TEST_RECIPIENTS else '_PROD'
    RECIPIENTS = {
        'nord': os.getenv(f'RECIPIENTS_NORD{suffix}'),
        'centro': os.getenv(f'RECIPIENTS_CENTRO{suffix}'),
        'sud': os.getenv(f'RECIPIENTS_SUD{suffix}')
    }

client = Client()

def route_mail(body, llm):
    run_id = str(uuid.uuid4())
    langsmith_extra={"run_id": run_id}
    # Define the prompts
    prompt_base = PromptTemplate(input_variables=['topic'], template=
    """
    Ruolo: sei un assistente AI con grande esperienza nel leggere e comprendere le richieste di assistenza tecnica
    
    Task: Leggi la seguente email e individua:
    - l'indirizzo in cui è stata richiesta assistenza. Ignora l'indirizzo della sede aziendale. Deve essere una unica stringa di un unico campo JSON
    - quale e' il problema e crea un riassunto
    - quale apparecchiatura è guasta
    La tua risposta deve contenere solo l'indirizzo (aggiungi sempre Italy), il riassunto della richiesta di assistenza, l'apparecchiatura guasta. Tutto sempre e solo in formato JSON. Se non trovi un indirizzo, il problema o la apparecchiatura non inventare mai, ma scrivi solo 'not found'
    - calcola un livello di confidenza da 0% a 100% della tua comprensione, dove 0% è il valore più basso e 100% è il valore più alto. Serve a mettere in evidenza le richieste ambigue che necessitano di un controllo umano, come ad esempio dati mancanti, richieste poco chiare, ecc...

    Eccezione importante:
    - Se la email riguarda la visione/estrazione/consegna delle registrazioni video per le forze dell'ordine (es. carabinieri, polizia, autorità, forze dell’ordine, denuncia, indagini), considera la richiesta valida anche senza guasto e imposta sempre equipment a 'videosorveglianza'.

    Contesto: Le informazioni che trovi servono al tecnico per andare a risolvere il problema, quindi devi essere preciso e sintetico. Verrà usato per classificare le richieste di assistenza in base all'area geografica italiana (NORD, CENTRO, SUD).
    
    Output: JSON con chiave 'summary','equipment','address','confidence'
    
    Email: {topic}
    """
    )

    # Define the chain
    chain = prompt_base | llm | StrOutputParser()

    # Get LLM response
    llm_response = chain.invoke({"topic": body}, {"run_id": run_id})

    #save the prompt
    prompt_base.save('prompt_base.json')

    return llm_response, run_id

def redirect_mail(geocode_result, body, email_message, sql_response, response_json=None):
    try:
        # Log parameters for debugging
        logging.info(f"redirect_mail called with: geocode_result={type(geocode_result)}, response_json={type(response_json)}")
        
        # Extract confidence level from response_json if provided, otherwise set default
        confidence_level = response_json.get('confidence', 0) if response_json else 0
        
        # Create the email message
        msg = MIMEMultipart()
        msg['Subject'] = email_message.get('Subject', 'No Subject')
        msg['From'] = email_account if email_account else "default@example.com"

        # Log the confidence level for debugging
        logging.info(f"Confidence level: {confidence_level}")

        # Determine recipient based on confidence level
        if not isinstance(confidence_level, int):
            try:
                confidence_level = int(confidence_level)
            except (ValueError, TypeError):
                confidence_level = 0
                logging.error("Could not convert confidence level to integer. Using default value: 0")
        
        if confidence_level < 90:
            logging.warning(f"Low confidence level ({confidence_level}). Forwarding to control email.")
            recipients = os.getenv('CONTROL_EMAIL', email_account)  # Use env variable or fallback to account email
        else:
            macro_area = geocode_result.get('macro_area', '').lower() if geocode_result else ''
            recipients = RECIPIENTS.get(macro_area, os.getenv('CONTROL_EMAIL', email_account))  # Use env variable or fallback
            
            # Log which recipient set is being used (for debugging)
            env_type = "TEST" if USE_TEST_RECIPIENTS else "PRODUCTION"
            logging.info(f"Using {env_type} recipient for {macro_area}: {recipients}")

        # Set the 'To' header in the email
        msg['To'] = recipients

        # Compose the new email body
        new_body = f"""
        --------
        AI Analysis - Identified data:

        Confidence Level: {confidence_level}
        {sql_response}

        {geocode_result}
        ---------

        {body}  # Original email body
        """

        # Attach the new body
        msg.attach(MIMEText(new_body, 'plain'))

        # Attach any PDFs from the original email
        for part in email_message.walk():
            if part.get_content_type() == 'application/pdf' or (part.get_content_type() == 'application/octet-stream' and part.get_filename().endswith('.pdf')):
                pdf_attachment = part.get_payload(decode=True)
                if pdf_attachment:
                    filename = part.get_filename() or "attachment.pdf"
                    part_attachment = MIMEApplication(pdf_attachment, _subtype="pdf")
                    part_attachment.add_header('Content-Disposition', 'attachment', filename=filename)
                    msg.attach(part_attachment)

        # Send the email
        with smtplib.SMTP_SSL(smtp_host, 465) as smtp:
            smtp.login(email_account, email_password)
            # Use this form to ensure the recipient is in the "To" field and not BCC
            smtp.send_message(msg)
            logging.info(f"Email redirected to {recipients}")

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        # Forward the email to the control email in case of any error
        control_email = os.getenv('CONTROL_EMAIL', email_account)
        with smtplib.SMTP_SSL(smtp_host, 465) as smtp:
            smtp.login(email_account, email_password)
            error_msg = MIMEMultipart()
            error_msg['Subject'] = "Error in Email Processing"
            error_msg['From'] = email_account
            error_msg['To'] = control_email
            error_body = MIMEText(f"An error occurred: {str(e)}\n\nOriginal email body:\n{body}")
            error_msg.attach(error_body)
            # Use the simple form of send_message
            smtp.send_message(error_msg)
            logging.info(f"Error email sent to {control_email}")
