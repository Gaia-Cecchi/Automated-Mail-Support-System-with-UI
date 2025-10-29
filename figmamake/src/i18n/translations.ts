export const translations = {
  en: {
    // Header
    appTitle: "Email Support System",
    appSubtitle: "Review and Automated Forwarding",
    appSubtitleAuto: "Automated Geographic Routing",
    checkMail: "Check Mail",
    
    // Automation Banner
    automationActive: "Automatic Routing Active",
    checkEvery: "Check every",
    min: "min",
    geoRouting: "Azure Maps Geographic Routing",
    disable: "Disable",
    
    // Email List
    emailsInReview: "Emails Under Review",
    toProcess: "To Process",
    processed: "Processed",
    notProcessed: "Not processed",
    analyzing: "Analyzing...",
    forwarded: "Forwarded",
    cancelled: "Cancelled",
    error: "Error",
    selected: "selected",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    clearSelection: "Clear",
    processSelected: "Process Selected",
    noUnprocessedEmails: "No unprocessed emails",
    noProcessedEmails: "No processed emails yet",
    
    // Email Detail
    operationsControl: "Operations Control",
    from: "From",
    subject: "Subject",
    date: "Date",
    emailBody: "Email Body",
    aiSummary: "AI Summary",
    geoRouting: "Geographic Routing",
    reasoning: "Reasoning",
    geolocation: "Geolocation",
    suggestedDepartment: "Suggested Department",
    suggestedDepartments: "Suggested Departments",
    forwardedToDepartment: "Forwarded to Department",
    highConfidence: "High Confidence",
    mediumConfidence: "Medium Confidence",
    lowConfidence: "Low Confidence",
    attachments: "attachment",
    attachmentsPlural: "attachments",
    processEmail: "Process Email",
    remove: "Remove",
    analysisInProgress: "Analysis in progress...",
    readyForProcessing: "Ready for processing",
    errorEncountered: "Error encountered",
    forwardedSuccessfully: "Forwarded successfully",
    cancelledByUser: "Cancelled by user",
    
    // Process Confirm Dialog
    confirmRouting: "Confirm AI Routing",
    confirmDescription: "Review AI analysis and confirm forwarding to suggested department",
    aiAnalysis: "AI Analysis",
    confidence: "Confidence",
    summary: "Summary",
    warning: "Warning",
    lowConfidenceWarning: "Low Confidence",
    lowConfidenceMessage: "The system is not sure about the suggested routing. Please verify manually before sending.",
    no: "No - Cancel",
    yes: "Yes - Forward Email",
    
    // Settings Dialog
    systemConfig: "System Configuration",
    systemConfigDescription: "Configure email credentials, AI APIs, automatic routing and departments",
    saveConfig: "Save Configuration",
    configSaved: "Configuration saved successfully!",
    
    // Settings Tabs
    email: "Email",
    api: "API",
    automation: "Automatic",
    departments: "Departments",
    settings: "Settings",
    
    // Email Settings
    emailAddress: "Email Address",
    password: "Password",
    imapServer: "IMAP Server",
    smtpServer: "SMTP Server",
    
    // API Settings
    groqConfig: "Groq Configuration",
    groqApiKey: "Groq API Key",
    model: "Model",
    customModel: "Custom Model",
    ollamaConfig: "Ollama Configuration (Optional)",
    ollamaUrl: "Ollama URL",
    
    // Automation Settings
    autoRoutingInfo: "Automatic routing uses Azure Maps to geolocate addresses and automatically route emails to North/Center/South departments based on geographic location.",
    enableAutoRouting: "Enable Automatic Routing",
    autoRoutingDescription: "Automatically process and forward incoming emails",
    checkInterval: "Email Check Interval (minutes)",
    checkIntervalHelp: "The system will check for new emails every",
    minutes: "minutes",
    azureMapsConfig: "Azure Maps Configuration",
    azureApiKey: "Azure Maps API Key",
    getApiKey: "Get your API key from",
    autoRoutingWarning: "With automatic routing enabled, emails will be processed and forwarded automatically without manual confirmation. Make sure you have correctly configured the North/Center/South departments.",
    
    // Department Settings
    addNewDepartment: "Add New Department",
    name: "Name",
    description: "Description",
    addDepartment: "Add Department",
    configuredDepartments: "Configured Departments",
    save: "Save",
    
    // General Settings
    desktopNotifications: "Desktop Notifications",
    desktopNotificationsDescription: "Receive notifications when new emails arrive",
    darkMode: "Dark Mode",
    darkModeDescription: "Enable dark theme for the interface",
    language: "Language",
    languageDescription: "Select interface language",
    
    cancel: "Cancel",
    saveChanges: "Save Changes",
    
    // Toasts
    emailChecked: "Email checked",
    foundNewEmails: "Found new unread emails",
    emailForwarded: "Email forwarded successfully",
    emailsForwarded: "emails forwarded successfully",
    emailsProcessedSuccessfully: "All emails processed successfully",
    emailsCancelled: "emails cancelled",
    sentToDepartment: "Sent to department",
    processingCancelled: "Processing cancelled",
    emailNotForwarded: "Email will not be forwarded",
    emailRemoved: "Email removed",
    emailRemovedFromView: "Email has been removed from view",
    settingsSaved: "Settings saved",
    changesApplied: "Changes have been applied",
    autoRoutingEnabled: "Automatic routing enabled",
    autoRoutingEnabledDescription: "Emails will be processed automatically",
    autoRoutingDisabled: "Automatic routing disabled",
    backToManual: "Back to manual mode",
    emailProcessedAuto: "Email processed automatically",
    
    // Empty state
    selectEmail: "Select an email to view details",
    
    // Manual Override Dialog
    manualOverrideTitle: "Manual Department Override",
    manualOverrideDescription: "Manually change the AI suggested department for this email",
    manualOverrideWarning: "You are about to override the AI's decision. This action should only be performed if you are sure the AI has made an incorrect routing decision.",
    manualOverrideWarning2: "The system's accuracy may decrease if manual overrides are frequent.",
    currentAISuggestion: "Current AI Suggestion",
    selectNewDepartment: "Select New Department",
    selectDepartment: "Select a department",
    confirmOverride: "Confirm Override",
    editDepartment: "Edit Department",
    overrideSuccess: "Department changed successfully",
    overrideDescription: "Routing manually changed from",
    to: "to",
  },
  
  it: {
    // Header
    appTitle: "Sistema Supporto Email",
    appSubtitle: "Revisione e Inoltro Automatizzato",
    appSubtitleAuto: "Routing Geografico Automatico",
    checkMail: "Controlla Email",
    
    // Automation Banner
    automationActive: "Routing Automatico Attivo",
    checkEvery: "Controllo ogni",
    min: "min",
    geoRouting: "Routing Geografico Azure Maps",
    disable: "Disattiva",
    
    // Email List
    emailsInReview: "Email in Revisione",
    toProcess: "Da Processare",
    processed: "Processate",
    notProcessed: "Non processata",
    analyzing: "Analisi...",
    forwarded: "Inoltrata",
    cancelled: "Annullata",
    error: "Errore",
    selected: "selezionate",
    selectAll: "Seleziona Tutte",
    deselectAll: "Deseleziona Tutte",
    clearSelection: "Cancella",
    processSelected: "Processa Selezionate",
    noUnprocessedEmails: "Nessuna email da processare",
    noProcessedEmails: "Nessuna email processata ancora",
    
    // Email Detail
    operationsControl: "Controllo Operazioni",
    from: "Da",
    subject: "Oggetto",
    date: "Data",
    emailBody: "Corpo Email",
    aiSummary: "Riassunto AI",
    geoRouting: "Routing Geografico",
    reasoning: "Motivazione",
    geolocation: "Geolocalizzazione",
    suggestedDepartment: "Reparto Suggerito",
    suggestedDepartments: "Reparti Suggeriti",
    forwardedToDepartment: "Inoltrata al Reparto",
    highConfidence: "Alta Confidenza",
    mediumConfidence: "Media Confidenza",
    lowConfidence: "Bassa Confidenza",
    attachments: "allegato",
    attachmentsPlural: "allegati",
    processEmail: "Processa Email",
    remove: "Rimuovi",
    analysisInProgress: "Analisi in corso...",
    readyForProcessing: "Pronto per elaborazione",
    errorEncountered: "Errore riscontrato",
    forwardedSuccessfully: "Inoltrata con successo",
    cancelledByUser: "Annullata dall'utente",
    
    // Process Confirm Dialog
    confirmRouting: "Conferma Routing AI",
    confirmDescription: "Verifica l'analisi AI e conferma l'inoltro al reparto suggerito",
    batchProcessDescription: "Rivedi e conferma l'elaborazione batch di",
    emails: "email",
    emailsSelected: "email selezionate",
    batchProcessingNote: "Tutte le email selezionate verranno inoltrate ai rispettivi reparti suggeriti.",
    aiAnalysis: "Analisi AI",
    confidence: "Confidenza",
    summary: "Riassunto",
    reasoning: "Motivazione",
    warning: "Attenzione",
    lowConfidenceWarning: "Bassa Confidenza",
    lowConfidenceMessage: "Il sistema non è sicuro del routing suggerito. Verifica manualmente prima di inviare.",
    no: "No - Annulla",
    yes: "Sì - Inoltra Email",
    
    // Settings Dialog
    systemConfig: "Configurazioni Sistema",
    systemConfigDescription: "Configura le credenziali email, API AI, routing automatico e reparti",
    saveConfig: "Salva Configurazione",
    configSaved: "Configurazione salvata con successo!",
    
    // Settings Tabs
    email: "Email",
    api: "API",
    automation: "Automatico",
    departments: "Reparti",
    settings: "Impostazioni",
    
    // Email Settings
    emailAddress: "Indirizzo Email",
    password: "Password",
    imapServer: "Server IMAP",
    smtpServer: "Server SMTP",
    
    // API Settings
    groqConfig: "Configurazione Groq",
    groqApiKey: "Groq API Key",
    model: "Modello",
    customModel: "Modello Personalizzato",
    ollamaConfig: "Configurazione Ollama (Opzionale)",
    ollamaUrl: "URL Ollama",
    
    // Automation Settings
    autoRoutingInfo: "Il routing automatico usa Azure Maps per geolocalizzare gli indirizzi e instradare automaticamente le email ai reparti Nord/Centro/Sud in base alla posizione geografica.",
    enableAutoRouting: "Abilita Routing Automatico",
    autoRoutingDescription: "Processa e inoltra automaticamente le email in arrivo",
    checkInterval: "Intervallo Controllo Email (minuti)",
    checkIntervalHelp: "Il sistema controllerà nuove email ogni",
    minutes: "minuti",
    azureMapsConfig: "Configurazione Azure Maps",
    azureApiKey: "Azure Maps API Key",
    getApiKey: "Ottieni la tua API key da",
    autoRoutingWarning: "Con il routing automatico attivo, le email verranno processate e inoltrate automaticamente senza conferma manuale. Assicurati di aver configurato correttamente i reparti Nord/Centro/Sud.",
    
    // Department Settings
    addNewDepartment: "Aggiungi Nuovo Reparto",
    name: "Nome",
    description: "Descrizione",
    addDepartment: "Aggiungi Reparto",
    configuredDepartments: "Reparti Configurati",
    save: "Salva",
    
    // General Settings
    desktopNotifications: "Notifiche Desktop",
    desktopNotificationsDescription: "Ricevi notifiche quando arrivano nuove email",
    darkMode: "Modalità Scura",
    darkModeDescription: "Attiva il tema scuro dell'interfaccia",
    language: "Lingua",
    languageDescription: "Seleziona la lingua dell'interfaccia",
    
    cancel: "Annulla",
    saveChanges: "Salva Modifiche",
    
    // Toasts
    emailChecked: "Email controllata",
    foundNewEmails: "Trovate nuove email non lette",
    emailForwarded: "Email inoltrata con successo",
    emailsForwarded: "email inoltrate con successo",
    emailsProcessedSuccessfully: "Tutte le email processate con successo",
    emailsCancelled: "email annullate",
    sentToDepartment: "Inviata al reparto",
    processingCancelled: "Processamento annullato",
    emailNotForwarded: "L'email non verrà inoltrata",
    emailRemoved: "Email rimossa",
    emailRemovedFromView: "L'email è stata rimossa dalla vista",
    settingsSaved: "Impostazioni salvate",
    changesApplied: "Le modifiche sono state applicate",
    autoRoutingEnabled: "Routing automatico attivato",
    autoRoutingEnabledDescription: "Le email verranno processate automaticamente",
    autoRoutingDisabled: "Routing automatico disattivato",
    backToManual: "Torna alla modalità manuale",
    emailProcessedAuto: "Email processata automaticamente",
    
    // Empty state
    selectEmail: "Seleziona un'email per visualizzare i dettagli",
    
    // Manual Override Dialog
    manualOverrideTitle: "Modifica Manuale Reparto",
    manualOverrideDescription: "Modifica manualmente il reparto suggerito dall'IA per questa email",
    manualOverrideWarning: "Stai per sovrascrivere la decisione dell'IA. Questa azione dovrebbe essere eseguita solo se sei sicuro che l'IA abbia preso una decisione di routing errata.",
    manualOverrideWarning2: "L'accuratezza del sistema potrebbe diminuire se le modifiche manuali sono frequenti.",
    currentAISuggestion: "Suggerimento IA Attuale",
    selectNewDepartment: "Seleziona Nuovo Reparto",
    selectDepartment: "Seleziona un reparto",
    confirmOverride: "Conferma Modifica",
    editDepartment: "Modifica Reparto",
    overrideSuccess: "Reparto modificato con successo",
    overrideDescription: "Routing modificato manualmente da",
    to: "a",
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
