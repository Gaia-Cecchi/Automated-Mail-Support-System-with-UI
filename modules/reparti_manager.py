"""
Module for departments management (routing configuration).
"""
import json
import os
from typing import List, Dict, Optional


class RepartiManager:
    """Manages loading/saving departments for email routing"""
    
    def __init__(self, reparti_file: str = 'reparti_config.json'):
        self.reparti_file = reparti_file
        self._reparti = []
        self.load()
    
    def load(self) -> List[Dict[str, str]]:
        """Load departments from JSON file"""
        if os.path.exists(self.reparti_file):
            with open(self.reparti_file) as f:
                self._reparti = json.load(f)
        else:
            self._reparti = []
        return self._reparti
    
    def save(self) -> None:
        """Save departments to JSON file"""
        os.makedirs(os.path.dirname(self.reparti_file) or '.', exist_ok=True)
        with open(self.reparti_file, 'w') as f:
            json.dump(self._reparti, f, indent=2)
    
    def add_reparto(self, nome: str, descrizione: str, email: str) -> bool:
        """Add a department"""
        if not nome or not email:
            return False
        
        # Check duplicates
        if any(r['nome'] == nome for r in self._reparti):
            return False
        
        self._reparti.append({
            'nome': nome,
            'descrizione': descrizione,
            'email': email
        })
        return True
    
    def remove_reparto(self, nome: str) -> bool:
        """Remove a department by name"""
        original_len = len(self._reparti)
        self._reparti = [r for r in self._reparti if r['nome'] != nome]
        return len(self._reparti) < original_len
    
    def get_reparto(self, nome: str) -> Optional[Dict[str, str]]:
        """Get department by name"""
        for r in self._reparti:
            if r['nome'] == nome:
                return r
        return None
    
    def get_all(self) -> List[Dict[str, str]]:
        """Get all departments"""
        return self._reparti.copy()
    
    def clear(self) -> None:
        """Clear departments list"""
        self._reparti = []
