# 🔗 Integrazione Frontend React con Backend Python

## Architettura del Sistema

```
┌─────────────────────────────────────────────┐
│         React Frontend (Figma Make)         │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   Components (TSX)                    │ │
│  │   - EmailList                         │ │
│  │   - EmailDetail                       │ │
│  │   - SettingsDialog                    │ │
│  └───────────────────────────────────────┘ │
│                    ↓                        │
│  ┌───────────────────────────────────────┐ │
│  │   API Service (api.ts)                │ │
│  │   - REST Client                       │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    ↓ HTTP/REST
┌─────────────────────────────────────────────┐
│         Flask Backend (Python)              │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   API Endpoints (api.py)              │ │
│  │   - /api/emails/check                 │ │
│  │   - /api/emails/process               │ │
│  │   - /api/emails/forward               │ │
│  │   - /api/settings                     │ │
│  │   - /api/departments                  │ │
│  │   - /api/automation/*                 │ │
│  └───────────────────────────────────────┘ │
│                    ↓                        │
│  ┌───────────────────────────────────────┐ │
│  │   Python Modules                      │ │
│  │   - MailFetcher (IMAP)                │ │
│  │   - MailSender (SMTP)                 │ │
│  │   - TicketProcessorSimple (AI)        │ │
│  │   - ConfigManager                     │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         External Services                   │
│  - Gmail/IMAP/SMTP                          │
│  - Groq API (AI)                            │
│  - Ollama (AI locale)                       │
│  - Azure Maps (geolocalizzazione)           │
└─────────────────────────────────────────────┘
```

## 📦 Setup Completo

### 1. Backend Python

```bash
# Naviga nella cartella backend
cd "C:\Users\gaia1\Desktop\UDOO Lab\Progetti\SAAM\Automated Mail Support System\code\backend"

# Installa dipendenze Flask (se non già installate)
pip install flask flask-cors

# Avvia il server API
python api.py
```

Il server sarà disponibile su: **http://localhost:5000**

### 2. Frontend React

```bash
# Naviga nella cartella figmamake
cd "C:\Users\gaia1\Desktop\UDOO Lab\Progetti\SAAM\Automated Mail Support System\code\figmamake"

# Installa dipendenze
npm install

# Avvia il dev server
npm run dev
```

Il frontend sarà disponibile su: **http://localhost:5173** (o porta simile)

## 🔄 Modifiche Necessarie al Frontend

### App.tsx - Integrazione con API Reale

Sostituisci i mock data con chiamate API reali. Ecco le modifiche principali:

```tsx
import { apiService, Email } from './services/api';

// In App.tsx, sostituisci handleCheckMail:
const handleCheckMail = async () => {
  try {
    const result = await apiService.checkEmails();
    
    if (result.success && result.emails.length > 0) {
      // Trasforma le email dal backend al formato frontend
      const newEmails = result.emails.map(email => ({
        ...email,
        timestamp: new Date(email.timestamp),
        aiSummary: '',
        aiReasoning: '',
        suggestedDepartment: '',
        confidence: 0
      }));
      
      setEmails(prev => [...newEmails, ...prev]);
      
      toast.success(t('emailChecked'), {
        description: `${t('foundNewEmails')}: ${result.count}`,
        duration: 3000
      });
    } else {
      toast.info(t('noNewEmails'), {
        description: t('noNewEmailsDescription'),
        duration: 3000
      });
    }
  } catch (error) {
    toast.error('Errore', {
      description: error instanceof Error ? error.message : 'Errore sconosciuto',
      duration: 5000
    });
  }
};

// Sostituisci handleProcess:
const handleProcess = async (emailId: string) => {
  const email = emails.find(e => e.id === emailId);
  if (!email || email.status !== 'not_processed') return;

  try {
    // Mostra loading toast
    const loadingToast = toast.loading('🤖 Analisi AI in corso...');
    
    // Chiama API per analisi
    const result = await apiService.processEmail(email);
    
    toast.dismiss(loadingToast);
    
    if (result.success) {
      // Aggiorna l'email con i risultati dell'analisi
      const updatedEmail = {
        ...email,
        aiSummary: result.analysis.summary,
        aiReasoning: result.analysis.reasoning,
        suggestedDepartment: result.suggestedDepartment,
        confidence: result.analysis.confidence
      };
      
      setEmails(prev =>
        prev.map(e => (e.id === emailId ? updatedEmail : e))
      );
      
      setEmailToProcess(updatedEmail);
      setEmailsToProcess([updatedEmail]);
      setProcessDialogOpen(true);
    }
  } catch (error) {
    toast.error('Errore analisi', {
      description: error instanceof Error ? error.message : 'Errore sconosciuto',
      duration: 5000
    });
  }
};

// Sostituisci handleConfirmProcess:
const handleConfirmProcess = async () => {
  if (emailsToProcess.length === 0) return;

  try {
    // Invia email per ogni elemento selezionato
    for (const email of emailsToProcess) {
      const analysis = {
        reparto_suggerito: email.suggestedDepartment || '',
        confidence: email.confidence || 0,
        summary: email.aiSummary || '',
        reasoning: email.aiReasoning || ''
      };
      
      await apiService.forwardEmail(
        email,
        email.suggestedDepartment || '',
        analysis
      );
    }
    
    // Aggiorna lo stato
    const processedIds = emailsToProcess.map(e => e.id);
    setEmails(prev =>
      prev.map(email =>
        processedIds.includes(email.id)
          ? { 
              ...email, 
              status: 'forwarded' as const,
              forwardedToDepartment: email.suggestedDepartment
            }
          : email
      )
    );

    setProcessDialogOpen(false);
    
    toast.success(`✅ ${emailsToProcess.length === 1 ? t('emailForwarded') : t('emailsForwarded')}`, {
      description: `${emailsToProcess.length} email processate con successo`,
      duration: 3000
    });

    setEmailToProcess(null);
    setEmailsToProcess([]);
  } catch (error) {
    toast.error('Errore invio', {
      description: error instanceof Error ? error.message : 'Errore sconosciuto',
      duration: 5000
    });
  }
};
```

### SettingsDialog.tsx - Caricamento e Salvataggio Impostazioni

```tsx
import { apiService } from '../services/api';

// Quando si apre il dialog, carica le impostazioni dal backend
useEffect(() => {
  const loadSettings = async () => {
    try {
      const settings = await apiService.getSettings();
      // Popola i campi del form
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  if (open) {
    loadSettings();
  }
}, [open]);

// Quando si salva, invia al backend
const handleSave = async (newSettings: AppSettings) => {
  try {
    await apiService.saveSettings(newSettings);
    toast.success('Impostazioni salvate');
  } catch (error) {
    toast.error('Errore salvataggio');
  }
};
```

## 🔌 Endpoint API Disponibili

### Email Management
- **POST** `/api/emails/check` - Controlla nuove email (IMAP)
- **POST** `/api/emails/process` - Analizza email con AI
- **POST** `/api/emails/forward` - Inoltra email a reparto

### Settings
- **GET** `/api/settings` - Ottieni configurazione
- **POST** `/api/settings` - Salva configurazione

### Departments
- **GET** `/api/departments` - Lista reparti
- **POST** `/api/departments` - Aggiungi reparto
- **DELETE** `/api/departments/:nome` - Rimuovi reparto

### Automation
- **POST** `/api/automation/start` - Avvia automazione
- **POST** `/api/automation/stop` - Ferma automazione
- **GET** `/api/automation/status` - Stato automazione

### Health
- **GET** `/api/health` - Verifica stato server

## 🚀 Flusso Operativo

### Modalità Manuale (GUI Review)

1. **Utente clicca "📬 Check Mail"**
   - Frontend → `POST /api/emails/check`
   - Backend → Connessione IMAP
   - Backend → Estrazione email + PDF
   - Backend → Ritorna lista email
   - Frontend → Mostra in EmailList

2. **Utente seleziona email e clicca "🔄 Process"**
   - Frontend → `POST /api/emails/process` con dati email
   - Backend → Inizializza TicketProcessorSimple
   - Backend → Analisi AI (Groq/Ollama)
   - Backend → Ritorna: suggestedDepartment, confidence, summary, reasoning
   - Frontend → Mostra ProcessConfirmDialog

3. **Utente conferma invio**
   - Frontend → `POST /api/emails/forward`
   - Backend → MailSender invia via SMTP
   - Backend → Ritorna success
   - Frontend → Aggiorna stato a "forwarded"

### Modalità Automatica

1. **Utente attiva "⚡ Automatic Routing"**
   - Frontend → `POST /api/automation/start`
   - Backend → Avvia thread di automazione
   - Backend → Loop ogni N minuti:
     - Check emails
     - Process automaticamente
     - Forward automaticamente
     - Log risultati

2. **Utente disattiva automazione**
   - Frontend → `POST /api/automation/stop`
   - Backend → Ferma thread

## ⚠️ Punti di Attenzione

### 1. Gestione Attachments
Attualmente il backend non serializza completamente gli attachment. Per gestirli:
- Salvare temporaneamente gli attachment sul server
- Ritornare URL o Base64
- O implementare un endpoint separato `/api/emails/:id/attachments`

### 2. Email Message Object
`email.message.Message` non è serializzabile in JSON. Soluzioni:
- Salvare in cache server-side (Redis/DB)
- O processare immediatamente e salvare solo metadati

### 3. CORS
Il backend Flask ha CORS abilitato. Se hai problemi:
```python
CORS(app, origins=['http://localhost:5173'])
```

### 4. Sicurezza Password
Le password sono in chiaro nel `.env`. Per produzione:
- Usa variabili d'ambiente o secret manager
- Implementa autenticazione JWT per l'API
- HTTPS obbligatorio

## 📝 File Modificati/Creati

### Backend
- ✅ `backend/api.py` - Server Flask con tutti gli endpoint
- ✅ `backend/requirements.txt` - Dipendenze Flask

### Frontend
- ✅ `figmamake/src/services/api.ts` - Client API TypeScript
- ✅ `figmamake/src/vite-env.d.ts` - Type definitions
- ✅ `figmamake/.env` - Configurazione API URL
- ⚠️ `figmamake/src/App.tsx` - DA MODIFICARE (vedi sopra)
- ⚠️ `figmamake/src/components/SettingsDialog.tsx` - DA MODIFICARE

### Moduli Python (già esistenti)
- ✅ `modules/config_manager.py` - Gestione configurazione
- ✅ `modules/reparti_manager.py` - Gestione reparti
- ✅ `modules/mail_fetcher.py` - IMAP fetch
- ✅ `modules/mail_sender.py` - SMTP send
- ✅ `modules/ticket_processor_simple.py` - AI analysis
- ✅ `modules/process_mail.py` - PDF extraction

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get settings
curl http://localhost:5000/api/settings

# Check emails (richiede credenziali configurate)
curl -X POST http://localhost:5000/api/emails/check
```

### Test Frontend
1. Avvia backend
2. Avvia frontend
3. Apri browser su http://localhost:5173
4. Configura credenziali in Settings
5. Prova "Check Mail"

## 📚 Prossimi Passi

1. **Modifica App.tsx** con le funzioni API reali (vedi sopra)
2. **Test completo** del flusso end-to-end
3. **Gestione errori** più robusta
4. **Loading states** per operazioni asincrone
5. **Websockets** per notifiche real-time (opzionale)
6. **Autenticazione** per API (per produzione)

## 💡 Tips

- Usa **React Query** o **SWR** per caching e gestione stato API
- Implementa **retry logic** per chiamate API fallite
- Aggiungi **toast notifications** per feedback utente
- Usa **error boundaries** per gestire errori React

Hai domande o vuoi procedere con le modifiche? 🚀
