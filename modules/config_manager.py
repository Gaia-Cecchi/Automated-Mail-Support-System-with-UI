"""
Module for centralized configuration management.
"""
import json
import os
from pathlib import Path
from typing import Dict, Any, Optional

try:
    from dotenv import dotenv_values
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False


class ConfigManager:
    """Manages loading/saving configuration from JSON files and .env"""
    
    def __init__(self, config_file: str = 'config.json', env_file: Optional[str] = None):
        self.config_file = config_file
        self.env_file = env_file or os.path.join(os.path.dirname(config_file), '..', '.env')
        self._config = {}
        self.load()
    
    def load(self) -> Dict[str, Any]:
        """Load configuration with precedence: config.json > .env > default"""
        self._config = {}
        
        # 1. Load from JSON file if exists
        if os.path.exists(self.config_file):
            with open(self.config_file) as f:
                self._config.update(json.load(f))
        
        # 2. Load from .env if available
        if DOTENV_AVAILABLE and os.path.exists(self.env_file):
            env = dotenv_values(self.env_file)
            env = {k.strip(): v.strip() for k, v in env.items() if v is not None}
            
            # Map .env keys (JSON takes precedence if already present)
            env_mapping = {
                'EMAIL': 'EMAIL',
                'EMAIL_PASSWORD': 'EMAIL_PASSWORD',
                'IMAP': 'IMAP',
                'SMTP': 'SMTP',
                'GROQ_API_KEY': 'GROQ_API_KEY',
                'OLLAMA_URL': 'OLLAMA_URL',
                'AZURE_API_KEY': 'AZURE_API_KEY',
            }
            
            for env_key, config_key in env_mapping.items():
                if config_key not in self._config and env_key in env:
                    self._config[config_key] = env[env_key]
        
        return self._config
    
    def save(self) -> None:
        """Save configuration to JSON file"""
        os.makedirs(os.path.dirname(self.config_file) or '.', exist_ok=True)
        with open(self.config_file, 'w') as f:
            json.dump(self._config, f, indent=2)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value"""
        return self._config.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Set configuration value"""
        self._config[key] = value
    
    def get_all(self) -> Dict[str, Any]:
        """Get all configuration"""
        return self._config.copy()
    
    def validate(self, required_keys: list) -> bool:
        """Validate that all required keys are present"""
        missing = [k for k in required_keys if k not in self._config or not self._config[k]]
        if missing:
            raise ValueError(f"Incomplete configuration. Missing keys: {', '.join(missing)}")
        return True
