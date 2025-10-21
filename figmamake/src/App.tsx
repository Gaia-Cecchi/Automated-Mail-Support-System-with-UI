import { useState, useEffect } from 'react';
import { EmailList } from './components/EmailList';
import { EmailDetail } from './components/EmailDetail';
import { SettingsDialog } from './components/SettingsDialog';
import { ProcessConfirmDialog } from './components/ProcessConfirmDialog';
import { ManualOverrideDialog } from './components/ManualOverrideDialog';
import { AutomationStatusBanner } from './components/AutomationStatusBanner';
import { QuickAutomationToggle } from './components/QuickAutomationToggle';
import { QuickDepartmentsButton } from './components/QuickDepartmentsButton';
import { mockEmails } from './data/mockEmails';
import { Email, AppSettings, Department } from './types/email';
import { apiService } from './services/api';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Mail, Moon, Sun, RefreshCw, Zap } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';
import { useTranslation } from './hooks/useTranslation';

export default function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [emailToProcess, setEmailToProcess] = useState<Email | null>(null);
  const [emailsToProcess, setEmailsToProcess] = useState<Email[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string | undefined>(undefined);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('emailSystemSettings');
    return saved ? JSON.parse(saved) : {
      emailCredentials: {
        server: '',
        username: 'support@example.com',
        password: '',
        imap: 'imap.example.com',
        smtp: 'smtp.example.com'
      },
      groq: {
        apiKey: '',
        model: 'llama-3.1-8b-instant'
      },
      ollama: {
        url: 'http://localhost:11434/v1',
        model: 'llama3.1'
      },
      azure: {
        apiKey: '',
        enabled: false
      },
      automaticRouting: {
        enabled: false,
        checkInterval: 5
      },
      departments: [
        { nome: 'North', descrizione: 'North Italy customer management', email: 'north@example.com' },
        { nome: 'Center', descrizione: 'Central Italy customer management', email: 'center@example.com' },
        { nome: 'South', descrizione: 'South Italy customer management', email: 'south@example.com' },
        { nome: 'Technical Support', descrizione: 'Technical assistance and malfunctions', email: 'support@example.com' },
        { nome: 'Administration', descrizione: 'Accounting and administration', email: 'admin@example.com' }
      ],
      notificationsEnabled: true,
      darkMode: false,
      language: 'en'
    };
  });
  
  const { t } = useTranslation(settings.language);
  const selectedEmail = emails.find(e => e.id === selectedEmailId);
  
  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const backendSettings = await apiService.getSettings();
        setSettings(backendSettings);
      } catch (error) {
        console.error('Failed to load settings from backend:', error);
        // Fall back to localStorage or defaults
      }
    };
    
    loadSettings();
  }, []);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('emailSystemSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Automatic routing loop
  useEffect(() => {
    if (!settings.automaticRouting.enabled) return;

    const interval = setInterval(() => {
      // Simulate automatic email checking and processing
      const unprocessedEmails = emails.filter(e => e.status === 'not_processed');
      
      if (unprocessedEmails.length > 0) {
        const email = unprocessedEmails[0];
        
        // Simulate geographic routing (would use Azure Maps in production)
        const geographicDepts = ['Nord', 'Centro', 'Sud'];
        const randomDept = geographicDepts[Math.floor(Math.random() * geographicDepts.length)];
        
        setEmails(prev =>
          prev.map(e =>
            e.id === email.id
              ? { 
                  ...e, 
                  status: 'forwarded' as const,
                  suggestedDepartment: randomDept,
                  forwardedToDepartment: randomDept,
                  aiReasoning: `Geolocalizzato automaticamente tramite Azure Maps nella regione ${randomDept}.`
                }
              : e
          )
        );

        if (settings.notificationsEnabled) {
          toast.success(`🗺️ ${t('emailProcessedAuto')}`, {
            description: `${t('sentToDepartment')}: ${randomDept}`,
            duration: 4000
          });
        }
      }
    }, settings.automaticRouting.checkInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.automaticRouting, emails, settings.notificationsEnabled, t]);

  const handleCheckMail = async () => {
    try {
      const loadingToast = toast.loading('📬 ' + t('checkingMail'));
      
      const result = await apiService.checkEmails();
      
      toast.dismiss(loadingToast);
      
      if (result.success && result.emails.length > 0) {
        // Transform emails from backend to frontend format
        const newEmails: Email[] = result.emails.map(email => ({
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          body: email.body,
          timestamp: new Date(email.timestamp),
          attachments: email.attachments || [],
          status: 'not_processed' as const,
          aiSummary: '',
          aiReasoning: '',
          suggestedDepartment: '',
          confidence: 0,
          pdfContent: email.pdfContent
        }));
        
        setEmails(prev => [...newEmails, ...prev]);
        
        toast.success(t('emailChecked'), {
          description: `${t('foundNewEmails')}: ${result.count}`,
          duration: 3000
        });
        
        // Auto-select first new email
        if (newEmails.length > 0) {
          setSelectedEmailId(newEmails[0].id);
        }
      } else {
        toast.info(t('noNewEmails') || 'No new emails', {
          description: t('noNewEmailsDescription') || 'All emails have been checked',
          duration: 3000
        });
      }
    } catch (error) {
      toast.error(t('error') || 'Error', {
        description: error instanceof Error ? error.message : t('unknownError') || 'Unknown error',
        duration: 5000
      });
      console.error('Error checking emails:', error);
    }
  };

  const handleProcess = async (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (!email || email.status !== 'not_processed') return;

    try {
      const loadingToast = toast.loading('🤖 ' + (t('analyzingWithAI') || 'AI analysis in progress...'));
      
      // Call API for AI analysis
      const result = await apiService.processEmail(email);
      
      toast.dismiss(loadingToast);
      
      if (result.success) {
        // Update email with analysis results
        const updatedEmail: Email = {
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
        
        toast.success('✅ ' + (t('analysisComplete') || 'Analysis complete'), {
          description: `${t('suggestedDepartment') || 'Suggested'}: ${result.suggestedDepartment} (${result.analysis.confidence}%)`,
          duration: 3000
        });
      }
    } catch (error) {
      toast.error(t('analysisError') || 'Analysis error', {
        description: error instanceof Error ? error.message : t('unknownError') || 'Unknown error',
        duration: 5000
      });
      console.error('Error processing email:', error);
    }
  };

  const handleProcessSelected = () => {
    if (selectedEmailIds.length === 0) return;
    
    // Only process emails that are in 'not_processed' status
    const emailsToProc = emails.filter(e => selectedEmailIds.includes(e.id) && e.status === 'not_processed');
    if (emailsToProc.length === 0) return;

    // For batch processing, use the first email for the dialog
    setEmailToProcess(emailsToProc[0]);
    setEmailsToProcess(emailsToProc);
    setProcessDialogOpen(true);
  };

  const handleToggleEmailSelection = (emailId: string) => {
    setSelectedEmailIds(prev => 
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = (emailIds: string[]) => {
    setSelectedEmailIds(emailIds);
  };

  const handleClearSelection = () => {
    setSelectedEmailIds([]);
  };

  const handleConfirmProcess = async () => {
    if (emailsToProcess.length === 0) return;

    try {
      const loadingToast = toast.loading('📤 ' + (t('sendingEmails') || 'Sending emails...'));
      
      // Send emails via API
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
      
      toast.dismiss(loadingToast);
      
      // Update email status
      const processedIds = emailsToProcess.map(e => e.id);
      const departmentMap = new Map(emailsToProcess.map(e => [e.id, e.suggestedDepartment]));
      
      setEmails(prev =>
        prev.map(email =>
          processedIds.includes(email.id)
            ? { 
                ...email, 
                status: 'forwarded' as const,
                forwardedToDepartment: departmentMap.get(email.id)
              }
            : email
        )
      );

      setProcessDialogOpen(false);
      
      if (emailsToProcess.length === 1) {
        const email = emailsToProcess[0];
        const department = settings.departments.find(d => d.nome === email.suggestedDepartment);
        const confidenceIcon = (email.confidence || 0) >= 70 ? '✅' : '⚠️';
        toast.success(`${confidenceIcon} ${t('emailForwarded')}`, {
          description: `${t('sentToDepartment')}: ${department?.nome} (${email.confidence}%)`,
          duration: 3000
        });
      } else {
        toast.success(`✅ ${emailsToProcess.length} ${t('emailsForwarded')}`, {
          description: `${t('emailsProcessedSuccessfully')}`,
          duration: 3000
        });
      }

      // Clear selection and auto-select next unprocessed email
      setSelectedEmailIds([]);
      const nextEmail = emails.find(e => e.status === 'not_processed' && !processedIds.includes(e.id));
      if (nextEmail) {
        setSelectedEmailId(nextEmail.id);
      }
      
      setEmailToProcess(null);
      setEmailsToProcess([]);
    } catch (error) {
      toast.error(t('error') || 'Error', {
        description: error instanceof Error ? error.message : 'Failed to forward emails',
        duration: 5000
      });
      console.error('Error forwarding emails:', error);
    }
  };

  const handleCancelProcess = () => {
    if (emailsToProcess.length === 0) return;

    const processedIds = emailsToProcess.map(e => e.id);

    setEmails(prev =>
      prev.map(email =>
        processedIds.includes(email.id)
          ? { ...email, status: 'cancelled' as const }
          : email
      )
    );

    setProcessDialogOpen(false);
    
    if (emailsToProcess.length === 1) {
      toast.info(`⏸️ ${t('processingCancelled')}`, {
        description: t('emailNotForwarded'),
        duration: 3000
      });
    } else {
      toast.info(`⏸️ ${t('processingCancelled')}`, {
        description: `${emailsToProcess.length} ${t('emailsCancelled')}`,
        duration: 3000
      });
    }

    setSelectedEmailIds([]);
    setEmailToProcess(null);
    setEmailsToProcess([]);
  };

  const handleRemove = (emailId: string) => {
    setEmails(prev => prev.filter(e => e.id !== emailId));
    
    toast.info(t('emailRemoved'), {
      description: t('emailRemovedFromView'),
      duration: 2000
    });

    // Select another email if current was removed
    if (selectedEmailId === emailId) {
      const remaining = emails.filter(e => e.id !== emailId);
      setSelectedEmailId(remaining[0]?.id || null);
    }
  };

  const handleDepartmentOverride = (emailId: string, newDepartment: string) => {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;

    const oldDepartment = email.suggestedDepartment;
    
    setEmails(prev =>
      prev.map(e =>
        e.id === emailId
          ? { ...e, suggestedDepartment: newDepartment }
          : e
      )
    );

    toast.success(`✏️ ${t('overrideSuccess')}`, {
      description: `${t('overrideDescription')} "${oldDepartment}" ${t('to')} "${newDepartment}"`,
      duration: 4000
    });
  };

  const handleEditDepartmentFromConfirm = () => {
    // Close the process confirm dialog and open the override dialog
    setProcessDialogOpen(false);
    setOverrideDialogOpen(true);
  };

  const handleOverrideConfirm = (newDepartment: string) => {
    if (emailToProcess) {
      handleDepartmentOverride(emailToProcess.id, newDepartment);
      
      // Update emailsToProcess with the new department
      setEmailsToProcess(prev => 
        prev.map(e => 
          e.id === emailToProcess.id 
            ? { ...e, suggestedDepartment: newDepartment }
            : e
        )
      );
      
      // Update emailToProcess with the new department
      setEmailToProcess(prev => 
        prev ? { ...prev, suggestedDepartment: newDepartment } : null
      );
      
      setOverrideDialogOpen(false);
      // Reopen the process dialog with updated department
      setTimeout(() => {
        setProcessDialogOpen(true);
      }, 100);
    }
  };

  const handleSettingsSave = async (newSettings: AppSettings) => {
    try {
      const loadingToast = toast.loading('💾 Saving settings...');
      
      // Save to backend
      await apiService.saveSettings(newSettings);
      
      toast.dismiss(loadingToast);
      
      // Update local state
      setSettings(newSettings);
      
      const { t: tNew } = useTranslation(newSettings.language);
      toast.success(tNew('settingsSaved'), {
        description: tNew('changesApplied'),
        duration: 3000
      });
    } catch (error) {
      toast.error('Error saving settings', {
        description: error instanceof Error ? error.message : 'Failed to save settings',
        duration: 5000
      });
      console.error('Error saving settings:', error);
    }
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const toggleAutomaticRouting = () => {
    setSettings(prev => ({
      ...prev,
      automaticRouting: {
        ...prev.automaticRouting,
        enabled: !prev.automaticRouting.enabled
      }
    }));

    if (!settings.automaticRouting.enabled) {
      toast.success(`⚡ ${t('autoRoutingEnabled')}`, {
        description: t('autoRoutingEnabledDescription'),
        duration: 3000
      });
    } else {
      toast.info(t('autoRoutingDisabled'), {
        description: t('backToManual'),
        duration: 3000
      });
    }
  };

  const openAutomationSettings = () => {
    setSettingsTab('automation');
    setSettingsOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Automation Status Banner */}
      <AutomationStatusBanner
        enabled={settings.automaticRouting.enabled}
        checkInterval={settings.automaticRouting.checkInterval}
        onToggle={toggleAutomaticRouting}
        onOpenSettings={openAutomationSettings}
        language={settings.language}
      />

      {/* Header */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            settings.automaticRouting.enabled 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
              : 'bg-blue-600'
          }`}>
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1>{t('appTitle')}</h1>
              {settings.automaticRouting.enabled && (
                <Badge className="bg-purple-600 text-white text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Auto
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {settings.automaticRouting.enabled 
                ? t('appSubtitleAuto')
                : t('appSubtitle')
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!settings.automaticRouting.enabled && (
            <Button
              variant="outline"
              onClick={handleCheckMail}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              📬 {t('checkMail')}
            </Button>
          )}
          <QuickDepartmentsButton 
            departments={settings.departments} 
            language={settings.language}
          />
          <QuickAutomationToggle
            enabled={settings.automaticRouting.enabled}
            onToggle={toggleAutomaticRouting}
            language={settings.language}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            title="Cambia tema"
          >
            {settings.darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
          <SettingsDialog 
            settings={settings} 
            onSave={handleSettingsSave} 
            language={settings.language}
            open={settingsOpen}
            onOpenChange={(open) => {
              setSettingsOpen(open);
              if (!open) setSettingsTab(undefined);
            }}
            defaultTab={settingsTab}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
          <EmailList
            emails={emails}
            selectedEmailId={selectedEmailId}
            selectedEmailIds={selectedEmailIds}
            onSelectEmail={setSelectedEmailId}
            onToggleEmailSelection={handleToggleEmailSelection}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onProcessSelected={handleProcessSelected}
            language={settings.language}
          />
        </div>

        {/* Detail Panel */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
          {selectedEmail ? (
            <EmailDetail
              email={selectedEmail}
              departments={settings.departments}
              automaticMode={settings.automaticRouting.enabled}
              onProcess={handleProcess}
              onRemove={handleRemove}
              onDepartmentOverride={handleDepartmentOverride}
              language={settings.language}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>{t('selectEmail')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Confirmation Dialog */}
      <ProcessConfirmDialog
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        email={emailToProcess}
        emailsToProcess={emailsToProcess}
        department={emailToProcess ? settings.departments.find(d => d.nome === emailToProcess.suggestedDepartment) || null : null}
        onConfirm={handleConfirmProcess}
        onCancel={handleCancelProcess}
        onEditDepartment={handleEditDepartmentFromConfirm}
        language={settings.language}
      />

      {/* Manual Override Dialog */}
      <ManualOverrideDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        currentDepartment={emailToProcess?.suggestedDepartment || ''}
        departments={settings.departments}
        onConfirm={handleOverrideConfirm}
        language={settings.language}
      />

      <Toaster position="top-right" />
    </div>
  );
}
