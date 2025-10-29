import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { CompactEmailList } from './components/CompactEmailList';
import { EmailDetailModal } from './components/EmailDetailModal';
import { BatchReviewModal } from './components/BatchReviewModal';
import { SettingsDialog } from './components/SettingsDialog';
import { ProcessConfirmDialog } from './components/ProcessConfirmDialog';
import { ManualOverrideDialog } from './components/ManualOverrideDialog';
import { AutomationStatusBanner } from './components/AutomationStatusBanner';
import { QuickAutomationToggle } from './components/QuickAutomationToggle';
import { QuickDepartmentsButton } from './components/QuickDepartmentsButton';
import { Email, AppSettings, Department } from './types/email';
import { apiService } from './services/api';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Mail, Moon, Sun, RefreshCw, Zap, PlayCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useTranslation } from './hooks/useTranslation';

export default function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(emails[0]?.id || null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [emailDetailModalOpen, setEmailDetailModalOpen] = useState(false);
  const [emailToView, setEmailToView] = useState<Email | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [emailToProcess, setEmailToProcess] = useState<Email | null>(null);
  const [emailsToProcess, setEmailsToProcess] = useState<Email[]>([]);
  const [batchReviewModalOpen, setBatchReviewModalOpen] = useState(false);
  const [processedEmailsForReview, setProcessedEmailsForReview] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string | undefined>(undefined);
  
  // Historical stats (all time)
  const [historicalStats, setHistoricalStats] = useState<{
    totalProcessed: number;
    totalReceived: number;
    byDepartment: Record<string, number>;
    lastUpdated: string;
  }>({
    totalProcessed: 0,
    totalReceived: 0,
    byDepartment: {},
    lastUpdated: new Date().toISOString()
  });
  
  // Initialize with default settings (will be loaded from backend)
  const [settings, setSettings] = useState<AppSettings>({
    emailCredentials: {
      server: '',
      username: '',
      password: '',
      imap: '',
      smtp: ''
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
    departments: [],
    notificationsEnabled: true,
    darkMode: false,
    language: 'en'
  });

  const [settingsLoaded, setSettingsLoaded] = useState(false);
  
  const { t } = useTranslation(settings.language);
  
  // Load historical stats from backend on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await apiService.getStats();
        setHistoricalStats(stats);
        console.log('Historical stats loaded from backend:', stats);
      } catch (error) {
        console.error('Failed to load stats from backend:', error);
      }
    };
    
    if (settingsLoaded) {
      loadStats();
    }
  }, [settingsLoaded]);
  
  // Update historical stats when email is forwarded
  const updateHistoricalStats = async (email: Email, department: string) => {
    try {
      const updatedStats = await apiService.updateProcessedEmail(department);
      setHistoricalStats(updatedStats);
      console.log('Historical stats updated:', updatedStats);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };
  
  // Update total received count when new emails arrive
  const updateReceivedCount = async (count: number) => {
    try {
      const updatedStats = await apiService.updateReceivedCount(count);
      setHistoricalStats(updatedStats);
      console.log('Received count updated:', updatedStats);
    } catch (error) {
      console.error('Failed to update received count:', error);
    }
  };
  
  // Load settings from backend on mount (single source of truth)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Loading settings from backend...');
        const backendSettings = await apiService.getSettings();
        console.log('Settings loaded from backend:', backendSettings);
        console.log('Departments from backend:', backendSettings.departments);
        setSettings(backendSettings);
        setSettingsLoaded(true);
      } catch (error) {
        console.error('Failed to load settings from backend:', error);
        toast.error('Settings Error', {
          description: 'Could not load settings from server. Using defaults.',
          duration: 5000
        });
        setSettingsLoaded(true);
      }
    };
    
    loadSettings();
  }, []);

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
          timestamp: email.timestamp, // Keep as string from backend
          attachments: email.attachments || [],
          status: 'not_processed' as const,
          aiSummary: '',
          aiReasoning: '',
          suggestedDepartment: '',
          confidence: 0,
          pdfContent: email.pdfContent
        }));
        
        setEmails(prev => [...newEmails, ...prev]);
        
        // Update historical stats with new received emails
        updateReceivedCount(newEmails.length);
        
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

  const handleProcessAll = async () => {
    const unprocessedEmails = emails.filter(e => e.status === 'not_processed');
    if (unprocessedEmails.length === 0) {
      toast.info('No emails to process', {
        description: 'All emails have already been processed',
        duration: 3000
      });
      return;
    }

    const loadingToast = toast.loading(`🤖 Processing ${unprocessedEmails.length} emails...`);
    const processedResults: any[] = [];
    
    try {
      for (const email of unprocessedEmails) {
        try {
          const result = await apiService.processEmail(email);
          
          console.log('🔍 API RESULT FOR EMAIL:', {
            emailId: email.id,
            subject: email.subject,
            fullResult: result,
            analysis: result.analysis,
            confidence: result.analysis.confidence,
            confidenceType: typeof result.analysis.confidence
          });
          
          // Store processed email with AI analysis
          processedResults.push({
            ...email,
            aiAnalysis: {
              suggestedDepartment: result.analysis.reparto_suggerito,
              confidence: result.analysis.confidence,
              summary: result.analysis.summary || result.analysis.reasoning
            }
          });
          
          // Update email with AI analysis results and mark as processed
          const updatedEmail = {
            ...email,
            suggestedDepartment: result.analysis.reparto_suggerito,
            confidence: result.analysis.confidence,
            status: 'processed' as const,
            processedAt: new Date().toISOString() // Add timestamp when AI processes it
          };
          
          setEmails(prev =>
            prev.map(e => (e.id === email.id ? updatedEmail : e))
          );
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error);
          // Continue processing other emails even if one fails
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.dismiss(loadingToast);
      
      if (processedResults.length > 0) {
        // Open batch review modal
        setProcessedEmailsForReview(processedResults);
        setBatchReviewModalOpen(true);
        
        toast.success(`✅ Processed ${processedResults.length} emails`, {
          description: 'Review and approve to send',
          duration: 3000
        });
      } else {
        toast.error('No emails were successfully processed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error processing emails', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    }
  };

  const handleEmailClick = (email: Email) => {
    setEmailToView(email);
    setEmailDetailModalOpen(true);
  };

  const handleBatchApproveAll = async (emailsToSend: Map<string, string>) => {
    const loadingToast = toast.loading(`📤 Sending ${emailsToSend.size} emails...`);
    
    try {
      let successCount = 0;
      for (const [emailId, department] of emailsToSend.entries()) {
        const email = emails.find(e => e.id === emailId);
        if (!email) continue;
        
        const analysis = processedEmailsForReview.find((e: any) => e.id === emailId)?.aiAnalysis;
        
        await apiService.forwardEmail(
          email,
          department,
          analysis ? {
            reparto_suggerito: analysis.suggestedDepartment,
            confidence: analysis.confidence,
            summary: analysis.summary,
            reasoning: analysis.summary
          } : undefined
        );
        
        // Update email status and add processedAt timestamp
        setEmails(prev =>
          prev.map(e =>
            e.id === emailId
              ? { 
                  ...e, 
                  status: 'forwarded' as const, 
                  forwardedToDepartment: department,
                  processedAt: new Date().toISOString()
                }
              : e
          )
        );
        
        // Update historical stats
        updateHistoricalStats(email, department);
        
        successCount++;
      }
      
      toast.dismiss(loadingToast);
      toast.success(`✅ Sent ${successCount} emails`, {
        duration: 3000
      });
      
      setBatchReviewModalOpen(false);
      setProcessedEmailsForReview([]);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error sending emails', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000
      });
    }
  };

  const handleBatchMarkAsUnprocessed = (emailIds: string[]) => {
    setEmails(prev =>
      prev.map(email =>
        emailIds.includes(email.id)
          ? { ...email, status: 'not_processed' as const, suggestedDepartment: undefined, confidence: 0 }
          : email
      )
    );
  };

  const handleProcessEmail = (email: Email) => {
    handleProcess(email.id);
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
      
      // Update email status and add processedAt timestamp
      const processedIds = emailsToProcess.map(e => e.id);
      const departmentMap = new Map(emailsToProcess.map(e => [e.id, e.suggestedDepartment]));
      const processedAt = new Date().toISOString();
      
      setEmails(prev =>
        prev.map(email =>
          processedIds.includes(email.id)
            ? { 
                ...email, 
                status: 'forwarded' as const,
                forwardedToDepartment: departmentMap.get(email.id),
                processedAt: processedAt
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

    // Mark as cancelled but keep processedAt to track it was analyzed
    // This allows "Processed" count to include cancelled emails
    setEmails(prev =>
      prev.map(email =>
        processedIds.includes(email.id)
          ? { 
              ...email, 
              status: 'cancelled' as const,
              processedAt: new Date().toISOString() 
            }
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
      
      console.log('Saving settings to backend:', newSettings);
      console.log('Departments to save:', newSettings.departments);
      
      // Save to backend
      await apiService.saveSettings(newSettings);
      
      toast.dismiss(loadingToast);
      
      // Update local state
      setSettings(newSettings);
      
      console.log('Settings saved successfully');
      
      const { t: tNew } = useTranslation(newSettings.language);
      toast.success(tNew('settingsSaved'), {
        description: tNew('changesApplied'),
        duration: 3000
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings', {
        description: error instanceof Error ? error.message : 'Failed to save settings',
        duration: 5000
      });
    }
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const handleUpdateDepartments = async (updatedDepartments: Department[]) => {
    try {
      const loadingToast = toast.loading('💾 Updating departments...');
      
      const newSettings = {
        ...settings,
        departments: updatedDepartments
      };
      
      // Save to backend
      await apiService.saveSettings(newSettings);
      
      toast.dismiss(loadingToast);
      
      // Update local state
      setSettings(newSettings);
      
      toast.success('Departments updated successfully', {
        description: 'Changes have been saved',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating departments:', error);
      toast.error('Error updating departments', {
        description: error instanceof Error ? error.message : 'Failed to update departments',
        duration: 5000
      });
    }
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
          <Button
            variant="outline"
            onClick={handleCheckMail}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            📬 {t('checkMail')}
          </Button>
          <Button
            variant="default"
            onClick={handleProcessAll}
            className="gap-2"
            disabled={emails.filter(e => e.status === 'not_processed').length === 0}
          >
            <PlayCircle className="w-4 h-4" />
            Process All
          </Button>
          <QuickDepartmentsButton 
            departments={settings.departments} 
            language={settings.language}
            onUpdateDepartments={handleUpdateDepartments}
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
      <div className="flex-1 flex flex-col p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {/* Dashboard */}
        <Dashboard 
          toProcessEmails={emails.filter(e => e.status === 'not_processed' || e.status === 'analyzing' || e.status === 'error')}
          processedEmails={emails.filter(e => e.status === 'forwarded' || e.status === 'cancelled')}
          historicalStats={historicalStats}
        />
        
        {/* Two Columns: To Process | Processed */}
        <div className="grid grid-cols-2 gap-4">
          {/* To Process Column */}
          <CompactEmailList
            emails={emails.filter(e => e.status === 'not_processed' || e.status === 'analyzing' || e.status === 'error')}
            title="To Process"
            onEmailClick={handleEmailClick}
            onProcess={handleProcessEmail}
            showProcessButton={true}
            departments={settings.departments}
            showDepartmentFilter={false}
          />
          
          {/* Processed Column */}
          <CompactEmailList
            emails={emails.filter(e => e.status === 'forwarded' || e.status === 'cancelled')}
            title="Processed"
            onEmailClick={handleEmailClick}
            departments={settings.departments}
            showDepartmentFilter={true}
          />
        </div>
      </div>

      {/* Email Detail Modal */}
      <EmailDetailModal
        email={emailToView}
        isOpen={emailDetailModalOpen}
        onClose={() => {
          setEmailDetailModalOpen(false);
          setEmailToView(null);
        }}
        onProcess={emailToView?.status === 'not_processed' ? handleProcessEmail : undefined}
      />

      {/* Batch Review Modal */}
      <BatchReviewModal
        isOpen={batchReviewModalOpen}
        onClose={() => {
          setBatchReviewModalOpen(false);
          setProcessedEmailsForReview([]);
        }}
        processedEmails={processedEmailsForReview}
        departments={settings.departments}
        onApproveAll={handleBatchApproveAll}
        onMarkAsUnprocessed={handleBatchMarkAsUnprocessed}
        onOpenEmailDetail={handleEmailClick}
      />

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
