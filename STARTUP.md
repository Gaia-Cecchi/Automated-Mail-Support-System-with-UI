# 🚀 Guida Avvio Rapido

## Prerequisiti
- Python 3.12.4 installato
- Node.js installato
- Ollama installato e in esecuzione

## Comandi di Avvio

### 1. Backend Flask (Terminal 1)
```powershell
cd "C:\Users\gaia1\Desktop\UDOO Lab\Progetti\SAAM\Automated Mail Support System\code"
.\venv\Scripts\Activate.ps1
python backend\api.py
```
**Output atteso:** `Running on http://localhost:5000`

### 2. Frontend React (Terminal 2)
```powershell
cd "C:\Users\gaia1\Desktop\UDOO Lab\Progetti\SAAM\Automated Mail Support System\code\figmamake"
npm run dev
```
**Output atteso:** `Local: http://localhost:3000`

### 3. Verifica Ollama
```powershell
ollama list
```
**Verifica che** `gemma3:4b` sia presente nella lista.

Se Ollama non è in esecuzione:
```powershell
ollama serve
```

## Accesso all'Applicazione

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Ollama API:** http://localhost:11434

## Configurazione

### Email
Le credenziali email sono salvate in `config_api.json`.

### Departments
I reparti sono salvati in `reparti_api.json`.

## Troubleshooting

### Backend non si avvia
- Verifica che il venv sia attivato (vedi `(venv)` nel prompt)
- Controlla che la porta 5000 sia libera

### Frontend non si avvia
- Esegui `npm install` nella cartella `figmamake`
- Controlla che la porta 3000 sia libera

### Ollama non risponde
- Verifica che Ollama sia in esecuzione: `ollama list`
- Riavvia Ollama: `ollama serve`

### Errori di classificazione email
- Controlla i log del backend (terminal Flask)
- Verifica che gemma3:4b sia caricato: `ollama list`

## Note
- **Non committare** i file `config_api.json` e `reparti_api.json` (contengono dati sensibili)
- Il backend si ricarica automaticamente quando modifichi i file Python
- Il frontend si ricarica automaticamente quando modifichi i file React
