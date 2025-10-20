import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Email
    EMAIL_ACCOUNT = os.getenv('EMAIL')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
    IMAP_HOST = os.getenv('IMAP', 'imap.gmail.com')
    SMTP_HOST = os.getenv('SMTP', 'smtp.gmail.com')
    CONTROL_EMAIL = os.getenv('CONTROL_EMAIL', EMAIL_ACCOUNT)
    
    # Recipients
    USE_TEST = os.getenv('USE_TEST_RECIPIENTS', 'false').lower() == 'true'
    suffix = '_TEST' if USE_TEST else '_PROD'
    RECIPIENTS = {
        'nord': os.getenv(f'RECIPIENTS_NORD{suffix}'),
        'centro': os.getenv(f'RECIPIENTS_CENTRO{suffix}'),
        'sud': os.getenv(f'RECIPIENTS_SUD{suffix}')
    }
    
    # API Keys
    AZURE_API_KEY = os.getenv('AZURE_API_KEY')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    LANGSMITH_API_KEY = os.getenv('LANGSMITH_API_KEY')
    
    # LLM
    LLM_MODEL = os.getenv('LLM_MODEL', 'meta-llama/llama-4-scout-17b-16e-instruct')
    LLM_TEMPERATURE = float(os.getenv('LLM_TEMPERATURE', '0.0'))
    CONFIDENCE_THRESHOLD = int(os.getenv('CONFIDENCE_THRESHOLD', '90'))
    
    # Processing
    POLL_INTERVAL = int(os.getenv('POLL_INTERVAL', '60'))
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '10'))

# Validazione configurazione
def validate_config():
    required = [
        ('EMAIL', Config.EMAIL_ACCOUNT),
        ('EMAIL_PASSWORD', Config.EMAIL_PASSWORD),
        ('AZURE_API_KEY', Config.AZURE_API_KEY)
    ]
    missing = [name for name, value in required if value is None]
    if missing:
        raise ValueError(f"Missing required configuration: {', '.join(missing)}. Check .env file.")

validate_config()
