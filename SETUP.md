# 🚀 Setup e Avvio del Sistema

## ✅ Modifiche Completate

### Backend
- ✅ API Flask completamente funzionante (`backend/api.py`)
- ✅ Integrazione con tutti i moduli Python esistenti
- ✅ Endpoint per email, settings, departments, automation

### Frontend
- ✅ API Service TypeScript (`figmamake/src/services/api.ts`)
- ✅ `App.tsx` modificato con chiamate API reali
- ✅ Sostituzione mock data con backend
- ✅ Gestione async/await e error handling

## 📋 Comandi per Avviare il Sistema

### 1. Backend (Terminale Python)
```bash
cd backend
python api.py
```
Il server sarà disponibile su: **http://localhost:5000**

### 2. Frontend (Terminale Node)
```bash
cd figmamake
npm install
npm run dev
```
Il frontend sarà disponibile su: **http://localhost:5173**

## ⚠️ Errori TypeScript Attesi

Gli errori di compilazione TypeScript che vedi sono dovuti a dipendenze mancanti. Per risolverli:

```bash
cd figmamake
npm install --save-dev @types/react @types/react-dom
```

Questo è normale per progetti TypeScript e non impedisce il funzionamento dell'app.

## 🔧 Configurazione Iniziale

### Prima di usare l'applicazione:

1. **Avvia Backend e Frontend** (vedi comandi sopra)

2. **Apri l'app nel browser**: http://localhost:5173

3. **Configura le credenziali**:
   - Clicca sull'icona ⚙️ Settings in alto a destra
   - Tab "Email": Inserisci email, password (App Password per Gmail), IMAP, SMTP
   - Tab "AI Provider": Inserisci Groq API Key (o configura Ollama)
   - Tab "Departments": Verifica/modifica i reparti
   - Clicca "Save Configuration"

4. **Prova il sistema**:
   - Clicca "📬 Check Mail" per controllare nuove email
   - Seleziona un'email
   - Clicca "🔄 Process" per analisi AI
   - Conferma o modifica il reparto suggerito
   - L'email verrà inoltrata automaticamente

## 🎯 Flusso Completo

### Modalità Manuale (con review umana)
1. **Check Mail** → Scarica email da IMAP
2. **Select Email** → Visualizza dettagli
3. **Process** → AI analizza e suggerisce reparto
4. **Confirm** → Email inoltrata via SMTP

### Modalità Automatica
1. Attiva **⚡ Automatic Routing** in alto
2. Il sistema controlla email automaticamente ogni N minuti
3. Processa e inoltra senza intervento umano
4. Ricevi notifiche per ogni email processata

## 🔍 Test del Backend API

Puoi testare il backend indipendentemente con:

```bash
# Health check
curl http://localhost:5000/api/health

# Get settings (dovrebbe funzionare anche senza frontend)
curl http://localhost:5000/api/settings
```

## 🐛 Troubleshooting

### Backend non si avvia
- Verifica che Flask sia installato: `pip install flask flask-cors`
- Controlla che la porta 5000 non sia occupata

### Frontend non si connette al backend
- Verifica che backend sia in esecuzione su porta 5000
- Controlla il file `figmamake/.env` che contenga: `VITE_API_URL=http://localhost:5000/api`
- Apri la console browser (F12) per vedere eventuali errori CORS

### Email non vengono scaricate
- Verifica credenziali email in Settings
- Per Gmail: usa **App Password**, non password normale
- Vedi `GMAIL_SETUP.md` per istruzioni complete

### AI non funziona
- Verifica Groq API Key in Settings
- Oppure installa e avvia Ollama localmente
- Controlla console backend per messaggi di errore

## 📚 File Principali

### Backend
- `backend/api.py` - Server Flask principale
- `modules/mail_fetcher.py` - IMAP email retrieval
- `modules/mail_sender.py` - SMTP email forwarding
- `modules/ticket_processor_simple.py` - AI analysis

### Frontend
- `figmamake/src/App.tsx` - Main app component (modificato)
- `figmamake/src/services/api.ts` - API client service
- `figmamake/src/components/SettingsDialog.tsx` - Settings UI

## 🎨 Prossimi Miglioramenti (Opzionali)

- [ ] Websockets per notifiche real-time
- [ ] Caching con React Query
- [ ] Autenticazione JWT per API
- [ ] Database per storico email
- [ ] Dashboard con statistiche
- [ ] Export CSV/PDF report

## ✨ Note Finali

Il sistema è ora **completamente funzionale** e pronto per l'uso! 

- L'interfaccia Figma è collegata al backend Python
- Le email vengono processate realmente via IMAP/SMTP
- L'AI analizza usando Groq o Ollama
- Tutto è configurabile tramite la GUI

Per qualsiasi problema, controlla i log:
- **Backend**: Output del terminale `python api.py`
- **Frontend**: Console browser (F12 → Console tab)

Buon lavoro! 🚀
