"""
Tkinter GUI for Mail Support System - Modular Version
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import tkinter as tk
from tkinter import ttk, messagebox
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Import moduli
from modules.config_manager import ConfigManager
from modules.reparti_manager import RepartiManager
from modules.mail_fetcher import MailFetcher
from modules.mail_sender import MailSender
from modules.ticket_processor_simple import TicketProcessorSimple
from modules.process_mail import read_pdf_attachment


class ConfigFrame(ttk.LabelFrame):
    """Frame for system configuration"""
    
    def __init__(self, master, config_manager, *args, **kwargs):
        super().__init__(master, text="System Configuration", *args, **kwargs)
        self.config_manager = config_manager
        self.entries = {}
        
        fields = [
            ("Email Address", "EMAIL", None),
            ("Password", "EMAIL_PASSWORD", None),
            ("IMAP Server", "IMAP", None),
            ("SMTP Server", "SMTP", None),
        ]
        
        for i, (label, key, _) in enumerate(fields):
            ttk.Label(self, text=label).grid(row=i, column=0, sticky="w", padx=5, pady=2)
            entry = ttk.Entry(self, width=50, show="*" if "PASSWORD" in key else "")
            entry.grid(row=i, column=1, columnspan=2, padx=5, pady=2, sticky="ew")
            entry.insert(0, self.config_manager.get(key, ""))
            self.entries[key] = entry
        
        # Sezione Groq
        row = len(fields)
        ttk.Label(self, text="─── Groq Configuration ───", font=("", 9, "bold")).grid(
            row=row, column=0, columnspan=3, pady=(10, 5)
        )
        
        row += 1
        ttk.Label(self, text="Groq API Key").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        entry_groq_key = ttk.Entry(self, width=35, show="*")
        entry_groq_key.grid(row=row, column=1, padx=5, pady=2, sticky="ew")
        entry_groq_key.insert(0, self.config_manager.get("GROQ_API_KEY", ""))
        self.entries["GROQ_API_KEY"] = entry_groq_key
        
        ttk.Label(self, text="Model").grid(row=row, column=2, sticky="w", padx=(10, 5), pady=2)
        entry_groq_model = ttk.Entry(self, width=25)
        entry_groq_model.grid(row=row, column=3, padx=5, pady=2, sticky="ew")
        entry_groq_model.insert(0, self.config_manager.get("GROQ_MODEL", "llama-3.1-8b-instant"))
        self.entries["GROQ_MODEL"] = entry_groq_model
        
        # Sezione Ollama
        row += 1
        ttk.Label(self, text="─── Ollama Configuration (Optional) ───", font=("", 9, "bold")).grid(
            row=row, column=0, columnspan=3, pady=(10, 5)
        )
        
        row += 1
        ttk.Label(self, text="Ollama URL").grid(row=row, column=0, sticky="w", padx=5, pady=2)
        entry_ollama_url = ttk.Entry(self, width=35)
        entry_ollama_url.grid(row=row, column=1, padx=5, pady=2, sticky="ew")
        entry_ollama_url.insert(0, self.config_manager.get("OLLAMA_URL", "http://localhost:11434/v1"))
        self.entries["OLLAMA_URL"] = entry_ollama_url
        
        ttk.Label(self, text="Model").grid(row=row, column=2, sticky="w", padx=(10, 5), pady=2)
        entry_ollama_model = ttk.Entry(self, width=25)
        entry_ollama_model.grid(row=row, column=3, padx=5, pady=2, sticky="ew")
        entry_ollama_model.insert(0, self.config_manager.get("OLLAMA_MODEL", "llama3.1"))
        self.entries["OLLAMA_MODEL"] = entry_ollama_model
        
        # Configura colonne per resize
        self.columnconfigure(1, weight=2)
        self.columnconfigure(3, weight=1)
        
        ttk.Button(self, text="Save Configuration", command=self.save).grid(
            row=row+1, column=0, columnspan=4, pady=10
        )
    
    def save(self):
        """Save configuration"""
        for key, entry in self.entries.items():
            self.config_manager.set(key, entry.get())
        self.config_manager.save()
        messagebox.showinfo("Configuration", "Configuration saved successfully!")


class DepartmentsFrame(ttk.LabelFrame):
    """Frame for departments management"""
    
    def __init__(self, master, reparti_manager, *args, **kwargs):
        super().__init__(master, text="Departments Configuration", *args, **kwargs)
        self.reparti_manager = reparti_manager
        
        # Departments table
        self.tree = ttk.Treeview(
            self, 
            columns=("Name", "Description", "Email"), 
            show="headings", 
            height=5
        )
        for col in ("Name", "Description", "Email"):
            self.tree.heading(col, text=col)
            self.tree.column(col, width=200)
        self.tree.pack(fill="x", padx=5, pady=5)
        
        # Add department form
        form = ttk.Frame(self)
        form.pack(fill="x", padx=5, pady=5)
        
        ttk.Label(form, text="Name:").grid(row=0, column=0, padx=2)
        self.nome = ttk.Entry(form, width=20)
        self.nome.grid(row=0, column=1, padx=2)
        
        ttk.Label(form, text="Description:").grid(row=0, column=2, padx=2)
        self.desc = ttk.Entry(form, width=30)
        self.desc.grid(row=0, column=3, padx=2)
        
        ttk.Label(form, text="Email:").grid(row=0, column=4, padx=2)
        self.email = ttk.Entry(form, width=30)
        self.email.grid(row=0, column=5, padx=2)
        
        # Buttons
        btn_frame = ttk.Frame(form)
        btn_frame.grid(row=1, column=0, columnspan=6, pady=5)
        
        ttk.Button(btn_frame, text="Add", command=self.add_reparto).pack(side="left", padx=2)
        ttk.Button(btn_frame, text="Delete Selected", command=self.delete_reparto).pack(side="left", padx=2)
        ttk.Button(btn_frame, text="Save Departments", command=self.save_reparti).pack(side="left", padx=2)
        
        self.refresh_tree()
    
    def refresh_tree(self):
        """Refresh departments display"""
        self.tree.delete(*self.tree.get_children())
        for r in self.reparti_manager.get_all():
            self.tree.insert('', 'end', values=(r['nome'], r['descrizione'], r['email']))
    
    def add_reparto(self):
        """Add department"""
        nome = self.nome.get().strip()
        descrizione = self.desc.get().strip()
        email = self.email.get().strip()
        
        if self.reparti_manager.add_reparto(nome, descrizione, email):
            self.refresh_tree()
            self.nome.delete(0, 'end')
            self.desc.delete(0, 'end')
            self.email.delete(0, 'end')
        else:
            messagebox.showerror("Error", "Name and email are required or department already exists.")
    
    def delete_reparto(self):
        """Delete selected department"""
        selected = self.tree.selection()
        if not selected:
            messagebox.showinfo("Delete Department", "Select a department from the table.")
            return
        
        for item in selected:
            values = self.tree.item(item, 'values')
            self.reparti_manager.remove_reparto(values[0])
        
        self.refresh_tree()
    
    def save_reparti(self):
        """Save departments"""
        self.reparti_manager.save()
        messagebox.showinfo("Departments", "Departments saved successfully!")


class MailTableFrame(ttk.LabelFrame):
    """Frame for email display and management"""
    
    def __init__(self, master, config_manager, reparti_manager, *args, **kwargs):
        super().__init__(master, text="Operations Control", *args, **kwargs)
        self.config_manager = config_manager
        self.reparti_manager = reparti_manager
        self.ticket_processor = None  # Lazy initialization
        
        # Action buttons
        btn_frame = ttk.Frame(self)
        btn_frame.pack(fill="x", padx=5, pady=5)
        
        ttk.Button(btn_frame, text="📬 Check Mail", command=self.check_mail).pack(side="left", padx=5)
        ttk.Button(btn_frame, text="🔄 Process Selected", command=self.process_mail).pack(side="left", padx=5)
        ttk.Button(btn_frame, text="📋 Details", command=self.show_details).pack(side="left", padx=5)
        ttk.Button(btn_frame, text="🗑️ Remove", command=self.remove_selected).pack(side="left", padx=5)
        
        # Mail table
        columns = ("Sender", "Subject", "Date", "Department", "Status")
        self.tree = ttk.Treeview(self, columns=columns, show="headings", height=12)
        
        for col in columns:
            self.tree.heading(col, text=col)
            width = 150 if col in ("Sender", "Subject") else 120
            self.tree.column(col, width=width)
        
        self.tree.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Store complete mail data
        self.mail_data = {}
    
    def check_mail(self):
        """Check for new emails"""
        try:
            # Verify configuration
            required = ['EMAIL', 'EMAIL_PASSWORD', 'IMAP']
            self.config_manager.validate(required)
            
            # Create fetcher
            fetcher = MailFetcher(
                self.config_manager.get('IMAP'),
                self.config_manager.get('EMAIL'),
                self.config_manager.get('EMAIL_PASSWORD')
            )
            
            # Fetch emails
            emails = fetcher.fetch_unread_emails()
            
            if not emails:
                messagebox.showinfo("Check Mail", "No new unread emails found.")
                return
            
            # Add to table
            for msg, metadata in emails:
                mail_id = f"{metadata['from']}-{metadata['subject']}-{metadata['date']}"
                
                # Avoid duplicates
                if mail_id in self.mail_data:
                    continue
                
                date_str = datetime.now().strftime('%Y-%m-%d %H:%M')
                item_id = self.tree.insert('', 0, values=(
                    metadata['from'][:40],
                    metadata['subject'][:50],
                    date_str,
                    "",
                    "Not processed"
                ))
                
                self.mail_data[item_id] = {
                    'message': msg,
                    'metadata': metadata
                }
            
            messagebox.showinfo("Check Mail", f"Found {len(emails)} new unread emails.")
        
        except Exception as e:
            messagebox.showerror("Error", f"Error checking mail:\n{str(e)}")
    
    def _get_ticket_processor(self):
        """Initialize TicketProcessor with direct API (lazy init)"""
        if not self.ticket_processor:
            groq_key = self.config_manager.get('GROQ_API_KEY', '')
            groq_model = self.config_manager.get('GROQ_MODEL', 'llama-3.1-8b-instant')
            ollama_url = self.config_manager.get('OLLAMA_URL', '')
            ollama_model = self.config_manager.get('OLLAMA_MODEL', 'llama3.1')
            
            if groq_key:
                # Use Groq (recommended - fast and free)
                self.ticket_processor = TicketProcessorSimple(
                    api_key=groq_key,
                    provider="groq",
                    model=groq_model
                )
                logger.info(f"✅ Using Groq API with model: {groq_model}")
            elif ollama_url:
                # Use local Ollama
                self.ticket_processor = TicketProcessorSimple(
                    api_key="ollama",
                    provider="ollama",
                    model=ollama_model,
                    api_base=ollama_url
                )
                logger.info(f"✅ Using local Ollama with model: {ollama_model}")
            else:
                raise Exception("Configure GROQ_API_KEY (free at console.groq.com) or OLLAMA_URL")
        
        return self.ticket_processor
    
    def process_mail(self):
        """Process selected emails with complete LLM analysis"""
        selected = self.tree.selection()
        if not selected:
            messagebox.showinfo("Process", "Select at least one email from the table.")
            return
        
        reparti = self.reparti_manager.get_all()
        if not reparti:
            messagebox.showerror("Error", "No departments configured. Add departments before processing.")
            return
        
        # Initialize processor and sender
        try:
            processor = self._get_ticket_processor()
        except Exception as e:
            messagebox.showerror("Error", f"Cannot initialize LLM:\n{str(e)}")
            return
        
        sender = MailSender(
            self.config_manager.get('SMTP'),
            self.config_manager.get('EMAIL'),
            self.config_manager.get('EMAIL_PASSWORD')
        )
        
        for item in selected:
            values = list(self.tree.item(item, 'values'))
            
            if values[4] != "Not processed":
                continue
            
            mail_info = self.mail_data.get(item)
            if not mail_info:
                continue
            
            metadata = mail_info['metadata']
            email_msg = mail_info['message']
            
            try:
                # Extract PDF attachment
                pdf_content = read_pdf_attachment(email_msg)
                
                # Analyze with LLM (includes body + PDF)
                analysis, reparto = processor.process_ticket(
                    email_msg,
                    metadata['subject'],
                    metadata['body'],
                    pdf_content,
                    reparti
                )
                
                if not analysis or not reparto:
                    values[4] = "❌ LLM analysis error"
                    self.tree.item(item, values=values)
                    continue
                
                # Show confirmation with analysis details
                conferma_msg = (
                    f"Email: {metadata['subject'][:60]}...\n"
                    f"From: {metadata['from']}\n\n"
                    f"=== AI ANALYSIS ===\n"
                    f"Suggested department: {reparto['nome']}\n"
                    f"Email: {reparto['email']}\n"
                    f"Confidence: {analysis.get('confidence', 0)}%\n\n"
                    f"Summary: {analysis.get('summary', 'N/A')[:100]}...\n\n"
                    f"Reasoning: {analysis.get('reasoning', 'N/A')[:150]}...\n\n"
                    f"Send email to this department?"
                )
                
                conferma = messagebox.askyesno("Confirm AI Routing", conferma_msg)
                
                if not conferma:
                    values[4] = "⏸️ Cancelled by user"
                else:
                    # Send email with complete analysis and attachments
                    success = sender.send_forwarded_mail(
                        to_email=reparto['email'],
                        original_from=metadata['from'],
                        original_subject=metadata['subject'],
                        original_body=metadata['body'],
                        original_date=metadata['date'],
                        reparto_nome=reparto['nome'],
                        analysis_summary=analysis.get('summary'),
                        confidence=analysis.get('confidence'),
                        email_message=email_msg  # For PDF attachments
                    )
                    
                    if success:
                        values[3] = reparto['nome']
                        confidence_icon = "✅" if analysis.get('confidence', 0) >= 70 else "⚠️"
                        values[4] = f"{confidence_icon} Sent ({analysis.get('confidence')}%)"
                    else:
                        values[4] = "❌ Send error"
                
            except Exception as e:
                values[4] = f"❌ Error: {str(e)[:30]}"
                messagebox.showerror("Processing Error", f"Error during processing:\n{str(e)}")
            
            self.tree.item(item, values=values)
    
    def show_details(self):
        """Show selected email details"""
        item = self.tree.focus()
        if not item:
            messagebox.showinfo("Details", "Select an email from the table.")
            return
        
        mail_info = self.mail_data.get(item)
        if not mail_info:
            messagebox.showinfo("Details", "Email data not available.")
            return
        
        metadata = mail_info['metadata']
        values = self.tree.item(item, 'values')
        
        details = (
            f"From: {metadata['from']}\n"
            f"Subject: {metadata['subject']}\n"
            f"Date: {metadata['date']}\n"
            f"Department: {values[3]}\n"
            f"Status: {values[4]}\n\n"
            f"Body:\n{metadata['body'][:500]}..."
        )
        
        messagebox.showinfo("Email Details", details)
    
    def remove_selected(self):
        """Remove selected emails from view"""
        selected = self.tree.selection()
        for item in selected:
            if item in self.mail_data:
                del self.mail_data[item]
            self.tree.delete(item)


class MailSupportGUI:
    """Main GUI application"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Mail Support System - Ticket Management")
        self.root.geometry("1000x700")
        
        # Initialize managers
        config_dir = os.path.dirname(__file__)
        self.config_manager = ConfigManager(os.path.join(config_dir, 'config_gui.json'))
        self.reparti_manager = RepartiManager(os.path.join(config_dir, 'reparti_config.json'))
        
        # Create interface
        self.create_widgets()
    
    def create_widgets(self):
        """Create graphical interface"""
        # Configuration frame
        config_frame = ConfigFrame(self.root, self.config_manager)
        config_frame.pack(fill="x", padx=10, pady=5)
        
        # Departments frame
        reparti_frame = DepartmentsFrame(self.root, self.reparti_manager)
        reparti_frame.pack(fill="x", padx=10, pady=5)
        
        # Mail table frame
        mail_frame = MailTableFrame(self.root, self.config_manager, self.reparti_manager)
        mail_frame.pack(fill="both", expand=True, padx=10, pady=5)


def main():
    root = tk.Tk()
    app = MailSupportGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
