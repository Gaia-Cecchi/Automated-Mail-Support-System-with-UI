"""
Simplified module for email ticket processing.
Uses direct Groq/Ollama APIs without Langchain dependencies.
"""
import json
import logging
import os
from typing import Dict, List, Optional, Tuple
from email.message import Message

logger = logging.getLogger(__name__)


class TicketProcessorSimple:
    """
    Simplified ticket processor using direct APIs.
    Compatible with Groq and Ollama (OpenAI-compatible format).
    """
    
    def __init__(self, api_key: str, provider: str = "groq", model: str = None, api_base: str = None):
        """
        Args:
            api_key: Provider API key (or "ollama" for local Ollama)
            provider: "groq" or "ollama"
            model: Model name (default: llama-3.1-8b-instant for Groq, llama3.1 for Ollama)
            api_base: API base URL (optional, for custom Ollama)
        """
        self.api_key = api_key
        self.provider = provider.lower()
        
        if model:
            self.model = model
        elif self.provider == "ollama":
            self.model = "llama3.1"
        else:
            self.model = "llama-3.1-8b-instant"
        
        # API endpoint
        if api_base:
            self.api_base = api_base
        elif self.provider == "ollama":
            self.api_base = "http://localhost:11434/v1"
        else:
            self.api_base = "https://api.groq.com/openai/v1"
    
    def analyze_email(
        self, 
        subject: str, 
        body: str, 
        pdf_content: str,
        reparti: List[Dict[str, str]]
    ) -> Optional[Dict]:
        """
        Analyze email with LLM and suggest department.
        
        Args:
            subject: Email subject
            body: Email body
            pdf_content: Content extracted from PDF attachment
            reparti: Departments list [{"nome": "...", "descrizione": "...", "email": "..."}]
        
        Returns:
            Dict with: reparto_suggerito, confidence, summary, reasoning
        """
        try:
            import requests
            
            # Combine content
            full_content = f"Subject: {subject}\n\n{body}"
            if pdf_content and pdf_content.strip():
                full_content += f"\n\nPDF Attachment:\n{pdf_content[:2000]}"  # Limit length
            
            # Build departments description
            reparti_desc = "\n".join([
                f"- {r['nome']}: {r.get('descrizione', 'No description')}"
                for r in reparti
            ])
            
            # Prompt
            system_prompt = """You are an AI assistant expert in classifying support tickets.
Analyze the provided email and determine which department should handle it.
Respond ONLY with valid JSON in the format:
{
    "reparto_suggerito": "exact_department_name",
    "confidence": 85,
    "summary": "Brief problem summary (max 100 characters)",
    "reasoning": "Choice reasoning (max 150 characters)"
}"""

            user_prompt = f"""Available departments:
{reparti_desc}

Email to analyze:
{full_content[:3000]}

Choose one of the departments listed above. If confidence < 70%, indicate need for human review."""

            # Chiamata API
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0,
            }
            
            # Groq supports response_format to force JSON
            if self.provider == "groq":
                payload["response_format"] = {"type": "json_object"}
            
            response = requests.post(
                f"{self.api_base}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"API error {response.status_code}: {response.text}")
                return None
            
            result_text = response.json()["choices"][0]["message"]["content"]
            result = json.loads(result_text)
            
            # Validate
            required = ['reparto_suggerito', 'confidence', 'summary']
            if not all(k in result for k in required):
                logger.error(f"Incomplete response: {result}")
                return None
            
            # Validate department exists
            reparto_nomi = [r['nome'].lower() for r in reparti]
            if result['reparto_suggerito'].lower() not in reparto_nomi:
                logger.warning(f"Department '{result['reparto_suggerito']}' not found")
                # Fallback to first
                if reparti:
                    result['reparto_suggerito'] = reparti[0]['nome']
                    result['confidence'] = max(0, result.get('confidence', 50) - 30)
            
            logger.info(f"✅ Analysis: {result['reparto_suggerito']} ({result['confidence']}%)")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return None
        except Exception as e:
            logger.error(f"Analysis error: {e}", exc_info=True)
            return None
    
    def get_reparto_details(
        self, 
        reparto_nome: str, 
        reparti: List[Dict[str, str]]
    ) -> Optional[Dict[str, str]]:
        """Find department details by name"""
        for r in reparti:
            if r['nome'].lower() == reparto_nome.lower():
                return r
        return None
    
    def process_ticket(
        self,
        email_message: Message,
        subject: str,
        body: str,
        pdf_content: str,
        reparti: List[Dict[str, str]]
    ) -> Tuple[Optional[Dict], Optional[Dict]]:
        """
        Process ticket: analyze and determine routing.
        
        Returns:
            Tuple (analysis_result, department_details) or (None, None) on error
        """
        try:
            analysis = self.analyze_email(subject, body, pdf_content, reparti)
            
            if not analysis:
                return None, None
            
            reparto = self.get_reparto_details(
                analysis['reparto_suggerito'],
                reparti
            )
            
            if not reparto:
                logger.error(f"Department not found: {analysis['reparto_suggerito']}")
                return analysis, None
            
            return analysis, reparto
            
        except Exception as e:
            logger.error(f"Ticket processing error: {e}", exc_info=True)
            return None, None
