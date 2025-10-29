export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  aiSummary: string;
  aiReasoning?: string;
  suggestedDepartment: string;
  confidence: number;
  timestamp: string | Date; // Support both formats - when email was received
  processedAt?: string | Date; // When email was processed/forwarded
  attachments: string[];
  status: 'not_processed' | 'forwarded' | 'cancelled' | 'analyzing' | 'error';
  forwardedToDepartment?: string;
  error?: string;
  notes?: string;
  pdfContent?: string; // Add missing field
}

export interface Department {
  nome: string;
  descrizione: string;
  email: string;
  colore?: string; // Colore associato al department (es. '#FF6B6B', '#4ECDC4', etc.)
}

export interface AppSettings {
  emailCredentials: {
    server: string;
    username: string;
    password: string;
    imap: string;
    smtp: string;
  };
  groq: {
    apiKey: string;
    model: string;
  };
  ollama: {
    url: string;
    model: string;
  };
  azure: {
    apiKey: string;
    enabled: boolean;
  };
  automaticRouting: {
    enabled: boolean;
    checkInterval: number; // minutes
  };
  departments: Department[];
  notificationsEnabled: boolean;
  darkMode: boolean;
  language: 'en' | 'it';
}
