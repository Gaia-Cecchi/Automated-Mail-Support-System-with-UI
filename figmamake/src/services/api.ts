/**
 * API Service for Email Support System
 * Handles all communication with Flask backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface EmailCredentials {
  server: string;
  username: string;
  password: string;
  imap: string;
  smtp: string;
}

export interface GroqConfig {
  apiKey: string;
  model: string;
}

export interface OllamaConfig {
  url: string;
  model: string;
}

export interface AzureConfig {
  apiKey: string;
  enabled: boolean;
}

export interface AutomationConfig {
  enabled: boolean;
  checkInterval: number;
}

export interface Department {
  nome: string;
  descrizione: string;
  email: string;
}

export interface AppSettings {
  emailCredentials: EmailCredentials;
  groq: GroqConfig;
  ollama: OllamaConfig;
  azure: AzureConfig;
  automaticRouting: AutomationConfig;
  departments: Department[];
  notificationsEnabled: boolean;
  darkMode: boolean;
  language: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  attachments: string[];
  status: 'not_processed' | 'forwarded' | 'cancelled';
  aiSummary?: string;
  aiReasoning?: string;
  suggestedDepartment?: string;
  forwardedToDepartment?: string;
  confidence?: number;
  pdfContent?: string;
}

export interface EmailAnalysis {
  reparto_suggerito: string;
  confidence: number;
  summary: string;
  reasoning: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // ============= SETTINGS =============

  async getSettings(): Promise<AppSettings> {
    return this.request<AppSettings>('/settings');
  }

  async saveSettings(settings: AppSettings): Promise<{ success: boolean; message: string }> {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // ============= DEPARTMENTS =============

  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/departments');
  }

  async addDepartment(department: Department): Promise<{ success: boolean; message: string }> {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(department),
    });
  }

  async deleteDepartment(nome: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/departments/${encodeURIComponent(nome)}`, {
      method: 'DELETE',
    });
  }

  // ============= EMAILS =============

  async checkEmails(): Promise<{
    success: boolean;
    count: number;
    emails: Email[];
  }> {
    return this.request('/emails/check', {
      method: 'POST',
    });
  }

  async processEmail(email: Email): Promise<{
    success: boolean;
    analysis: EmailAnalysis;
    suggestedDepartment: string;
    departmentEmail: string;
  }> {
    return this.request('/emails/process', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forwardEmail(
    email: Email,
    department: string,
    analysis?: EmailAnalysis
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request('/emails/forward', {
      method: 'POST',
      body: JSON.stringify({
        email,
        department,
        analysis,
      }),
    });
  }

  // ============= AUTOMATION =============

  async startAutomation(): Promise<{ success: boolean; message: string }> {
    return this.request('/automation/start', {
      method: 'POST',
    });
  }

  async stopAutomation(): Promise<{ success: boolean; message: string }> {
    return this.request('/automation/stop', {
      method: 'POST',
    });
  }

  async getAutomationStatus(): Promise<{
    enabled: boolean;
    checkInterval: number;
  }> {
    return this.request('/automation/status');
  }

  // ============= HEALTH CHECK =============

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
  }> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
