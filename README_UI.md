# 🎨 Automated Mail Support System with Modern UI

> **AI-Powered Email Support System** with React/TypeScript UI and Python Backend

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

Modern web interface built with **React + TypeScript** connected to a powerful **Python backend** for intelligent email routing with AI.

---

## ✨ Features

🎨 **Modern React UI** - Beautiful interface designed with Figma, built with React and TypeScript  
🤖 **AI-Powered Analysis** - Groq/Ollama integration for intelligent department routing  
📧 **Real Email Processing** - IMAP/SMTP integration for Gmail, Outlook, and more  
⚡ **Dual Mode Operation** - Manual review or fully automatic processing  
🔐 **Secure Configuration** - Environment-based settings management  
🌍 **Multi-language Support** - English and Italian translations  
📊 **Real-time Updates** - Live email status and processing feedback  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     React Frontend (Port 5173)     │
│  ┌──────────────────────────────┐  │
│  │  TypeScript Components       │  │
│  │  - Email List & Detail       │  │
│  │  - Settings Management       │  │
│  │  - Department Config         │  │
│  └──────────────────────────────┘  │
│              ↓ REST API             │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│     Flask Backend (Port 5000)      │
│  ┌──────────────────────────────┐  │
│  │  Python Modules              │  │
│  │  - Mail Fetcher (IMAP)       │  │
│  │  - Mail Sender (SMTP)        │  │
│  │  - AI Processor (Groq/Ollama)│  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Git**
- **Email account** (Gmail recommended with App Password)
- **Groq API Key** (free at https://console.groq.com) or Ollama installed locally

### 1. Clone Repository

```bash
git clone https://github.com/Gaia-Cecchi/Automated-Mail-Support-System-with-UI.git
cd Automated-Mail-Support-System-with-UI
```

### 2. Setup Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install backend dependencies
cd backend
pip install flask flask-cors

# Configure environment variables
cp env.example .env
# Edit .env with your credentials (email, Groq API key, etc.)
```

### 3. Setup Frontend

```bash
# Navigate to frontend directory
cd figmamake

# Install Node dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python api.py
```
Backend will start on **http://localhost:5000**

**Terminal 2 - Frontend:**
```bash
cd figmamake
npm run dev
```
Frontend will start on **http://localhost:5173**

### 5. Configure & Use

1. Open browser at **http://localhost:5173**
2. Click ⚙️ **Settings** in top right
3. Configure:
   - **Email tab**: Email credentials (use App Password for Gmail)
   - **AI Provider tab**: Groq API key or Ollama settings
   - **Departments tab**: Add/edit departments for routing
4. Click **📬 Check Mail** to fetch emails
5. Select email → **🔄 Process** → Review AI suggestion → Confirm send

---

## 📋 Configuration

### Email Setup (Gmail Example)

For Gmail, you **must** use an App Password:

1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in settings

Settings example:
```
Email: your-email@gmail.com
Password: xxxx xxxx xxxx xxxx  (App Password)
IMAP: imap.gmail.com
SMTP: smtp.gmail.com
```

### AI Provider Setup

**Option A: Groq (Recommended)**
- Get free API key: https://console.groq.com
- Models: `llama-3.1-8b-instant`, `llama-3.1-70b-versatile`

**Option B: Ollama (Local)**
- Install from: https://ollama.com
- Pull model: `ollama pull llama3.1`
- URL: `http://localhost:11434/v1`

---

## 🔧 Project Structure

```
├── backend/                   # Flask REST API
│   ├── api.py                # Main API server
│   └── requirements.txt      # Backend dependencies
│
├── figmamake/                # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx           # Main app component
│   └── package.json          # Frontend dependencies
│
├── modules/                  # Python core modules
│   ├── mail_fetcher.py       # IMAP email retrieval
│   ├── mail_sender.py        # SMTP email sending
│   ├── ticket_processor_simple.py  # AI analysis
│   └── process_mail.py       # PDF extraction
│
├── SETUP.md                  # Detailed setup guide
├── INTEGRATION_GUIDE.md      # Integration documentation
└── env.example               # Environment template
```

---

## 🎯 Usage Modes

### Manual Mode (Default)
1. User clicks **Check Mail** → Emails fetched from IMAP
2. User selects email → Clicks **Process** → AI analyzes
3. System shows AI suggestion with confidence score
4. User confirms → Email forwarded via SMTP

### Automatic Mode
1. Toggle **⚡ Automatic Routing** in header
2. System checks emails every N minutes (configurable)
3. AI processes and forwards automatically
4. Real-time notifications for each action

---

## 🛠️ API Endpoints

### Email Operations
- `POST /api/emails/check` - Fetch new unread emails
- `POST /api/emails/process` - Analyze email with AI
- `POST /api/emails/forward` - Forward email to department

### Configuration
- `GET /api/settings` - Get system settings
- `POST /api/settings` - Save system settings

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Add new department
- `DELETE /api/departments/:nome` - Remove department

### Automation
- `POST /api/automation/start` - Start automatic processing
- `POST /api/automation/stop` - Stop automatic processing
- `GET /api/automation/status` - Get automation status

---

## 🔐 Security Notes

- ⚠️ Never commit `.env` files or credentials
- ✅ Use App Passwords for Gmail (not regular password)
- ✅ Keep API keys in environment variables
- ✅ For production: implement JWT authentication
- ✅ Use HTTPS in production

Files excluded from git (in `.gitignore`):
- `.env` files
- `node_modules/`
- `venv/`
- Config files with credentials

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Ensure Flask is installed in virtual environment
pip install flask flask-cors
```

### Frontend can't connect to backend
- Check backend is running on port 5000
- Verify `figmamake/.env` has: `VITE_API_URL=http://localhost:5000/api`
- Check browser console (F12) for CORS errors

### Gmail authentication fails
- Use App Password, not regular password
- See `GMAIL_SETUP.md` for detailed instructions

### AI analysis fails
- Verify Groq API key is correct in Settings
- Or install and run Ollama locally
- Check backend console for error messages

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions and commands
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Technical integration details
- **[GMAIL_SETUP.md](GMAIL_SETUP.md)** - Gmail configuration guide

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Share your use case or feedback

---

## 📄 License

**Private Project** - All rights reserved

---

## 🙏 Acknowledgments

- **Original Backend**: Based on [lordpba/Automated-Mail-Support-System](https://github.com/lordpba/Automated-Mail-Support-System)
- **UI Framework**: React + Vite + TypeScript
- **UI Components**: Shadcn/ui + Radix UI
- **AI Provider**: Groq for fast inference
- **Design Tool**: Figma Make

---

## 📞 Support

For issues or questions:
1. Check the [Documentation](#-documentation)
2. Review [Troubleshooting](#-troubleshooting)
3. Open an issue on GitHub

---

<div align="center">

**Built with ❤️ for efficient email support management**

🌟 Star this repo if you find it useful!

</div>
