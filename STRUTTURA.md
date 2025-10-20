# Mail Support System - Project Structure

## 📁 File Structure

```
.
├── .env                          # Environment configuration (gitignored)
├── .env.example                  # Configuration template
├── requirements.txt              # Python dependencies
├── README.md                     # Main documentation
│
├── gui/                          # Graphical interface
│   ├── app_gui_v2.py            # Modular Tkinter GUI
│   ├── config_gui.json          # GUI config
│   └── reparti_config.json      # Departments configuration
│
├── modules/                      # Business logic modules
│   ├── config_manager.py        # Centralized configuration management
│   ├── reparti_manager.py       # Departments CRUD
│   ├── mail_fetcher.py          # IMAP retrieval
│   ├── mail_sender.py           # SMTP sending + attachments
│   ├── ticket_processor_simple.py # AI analysis (Groq/Ollama)
│   ├── process_mail.py          # Email/PDF utilities
│   ├── redirect_engine.py       # Geographic routing (main_loop)
│   ├── azure_maps_full.py       # Geolocation (main_loop)
│   └── sql_engine.py            # SQL generator for management system
│
├── main_loop_v2.py              # Automated loop (3 geographic areas)
├── config.py                     # Legacy config for main_loop
└── metrics.py                    # Metrics tracking for main_loop
```

## 🎯 Two Usage Modes

### 1. **Interactive GUI** (Recommended)
- File: `gui/app_gui_v2.py`
- Routing: Based on **department descriptions**
- User: Manual confirmation for each routing
- Attachments: ✅ Automatically forwarded
- AI Analysis: ✅ Body + PDF included

### 2. **Automated Loop** (Advanced)
- File: `main_loop_v2.py`
- Routing: Based on **geolocation** (3 macro areas: North/Center/South)
- User: No interaction (fully automated)
- Extra modules: `azure_maps_full`, `sql_engine`
- Requires: Langchain, Azure Maps API

## 🔧 Shared Modules

Both modes use:
- `mail_fetcher.py` - IMAP email retrieval
- `mail_sender.py` - SMTP sending
- `process_mail.py` - Email and PDF parsing

## 🚀 Quick Start

**GUI:**
```bash
python gui/app_gui_v2.py
```

**Automated loop:**
```bash
python main_loop_v2.py
```

## 📝 Notes

- **GUI**: Minimal dependencies (requests, pdfplumber, dotenv)
- **Main Loop**: Requires Langchain for advanced routing
- **Independent modules**: Easy to create new interfaces (CLI, Web, etc.)
