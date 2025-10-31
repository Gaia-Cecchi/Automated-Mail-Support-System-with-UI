import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Settings, Server, Key, MapPin, Bell, Trash2, Zap, Languages, Edit2, Check, X } from 'lucide-react';
import { AppSettings, Department } from '../types/email';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useTranslation } from '../hooks/useTranslation';
import { getDepartmentColor, getDepartmentIcon, getDepartmentColorSafe } from '../utils/colors';
import { DEFAULT_DEPARTMENT_ICON } from '../utils/departmentIcons';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';

interface SettingsDialogProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  language: 'en' | 'it';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: string;
}

export function SettingsDialog({ settings, onSave, language, open: controlledOpen, onOpenChange, defaultTab }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [internalOpen, setInternalOpen] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const { t } = useTranslation(language);
  
  // Use controlled or uncontrolled mode
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  // Sync localSettings when settings prop changes (e.g., loaded from backend)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // Load Ollama models when dialog opens
  useEffect(() => {
    if (open && ollamaModels.length === 0) {
      loadOllamaModels();
    }
  }, [open]);
  
  const loadOllamaModels = async () => {
    setLoadingModels(true);
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const models = data.models.map((m: any) => m.name);
        setOllamaModels(models);
      }
    } catch (error) {
      console.error('Failed to load Ollama models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    setOpen(false);
  };

  const updateEmailCredentials = (field: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      emailCredentials: {
        ...localSettings.emailCredentials,
        [field]: value
      }
    });
  };

  const updateGroq = (field: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      groq: {
        ...localSettings.groq,
        [field]: value
      }
    });
  };

  const updateOllama = (field: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      ollama: {
        ...localSettings.ollama,
        [field]: value
      }
    });
  };

  const [newDept, setNewDept] = useState<Department>({ 
    nome: '', 
    descrizione: '', 
    email: '',
    icon: DEFAULT_DEPARTMENT_ICON,
    color: '#6B7280'
  });
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editDeptData, setEditDeptData] = useState<Department>({ 
    nome: '', 
    descrizione: '', 
    email: '',
    icon: DEFAULT_DEPARTMENT_ICON,
    color: '#6B7280'
  });

  const addDepartment = () => {
    if (newDept.nome && newDept.email && !localSettings.departments.find(d => d.nome === newDept.nome)) {
      setLocalSettings({
        ...localSettings,
        departments: [...localSettings.departments, newDept]
      });
      setNewDept({ 
        nome: '', 
        descrizione: '', 
        email: '',
        icon: DEFAULT_DEPARTMENT_ICON,
        color: '#6B7280'
      });
    }
  };

  const removeDepartment = (nome: string) => {
    setLocalSettings({
      ...localSettings,
      departments: localSettings.departments.filter(d => d.nome !== nome)
    });
  };

  const startEditDepartment = (dept: Department) => {
    setEditingDept(dept.nome);
    setEditDeptData({ ...dept });
  };

  const cancelEditDepartment = () => {
    setEditingDept(null);
    setEditDeptData({ 
      nome: '', 
      descrizione: '', 
      email: '',
      icon: DEFAULT_DEPARTMENT_ICON,
      color: '#6B7280'
    });
  };

  const saveEditDepartment = () => {
    if (editDeptData.nome && editDeptData.email) {
      setLocalSettings({
        ...localSettings,
        departments: localSettings.departments.map(d => 
          d.nome === editingDept ? editDeptData : d
        )
      });
      setEditingDept(null);
      setEditDeptData({ 
        nome: '', 
        descrizione: '', 
        email: '',
        icon: DEFAULT_DEPARTMENT_ICON,
        color: '#6B7280'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl sm:max-w-5xl max-h-[85vh]">
        <DialogHeader className="pb-4">
          <DialogTitle>{t('systemConfig')}</DialogTitle>
          <DialogDescription>
            {t('systemConfigDescription')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab || "email"} className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-x-2 mb-6">
            <TabsTrigger value="email" className="gap-1.5">
              <Server className="w-4 h-4" />
              {t('email')}
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-1.5">
              <Key className="w-4 h-4" />
              {t('api')}
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-1.5">
              <Zap className="w-4 h-4" />
              {t('automation')}
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-1.5">
              <MapPin className="w-4 h-4" />
              {t('departments')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <Bell className="w-4 h-4" />
              {t('settings')}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(85vh-200px)]">
            <div className="pr-4">
              {/* Email Settings */}
              <TabsContent value="email" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="email">{t('emailAddress')}</Label>
                    <Input
                      id="email"
                      placeholder="support@example.com"
                      value={localSettings.emailCredentials.username}
                      onChange={(e) => updateEmailCredentials('username', e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={localSettings.emailCredentials.password}
                      onChange={(e) => updateEmailCredentials('password', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="imap">{t('imapServer')}</Label>
                      <Input
                        id="imap"
                        placeholder="imap.example.com"
                        value={localSettings.emailCredentials.imap}
                        onChange={(e) => updateEmailCredentials('imap', e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="smtp">{t('smtpServer')}</Label>
                      <Input
                        id="smtp"
                        placeholder="smtp.example.com"
                        value={localSettings.emailCredentials.smtp}
                        onChange={(e) => updateEmailCredentials('smtp', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* API Settings */}
              <TabsContent value="api" className="space-y-8 mt-0">
                <div className="space-y-4">
                  <h3 className="text-base font-medium">{t('groqConfig')}</h3>
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <Label htmlFor="groqKey">{t('groqApiKey')}</Label>
                      <Input
                        id="groqKey"
                        type="password"
                        placeholder="gsk_..."
                        value={localSettings.groq.apiKey}
                        onChange={(e) => updateGroq('apiKey', e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="groqModel">{t('model')}</Label>
                      <Select
                        value={['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'].includes(localSettings.groq.model) ? localSettings.groq.model : 'custom'}
                        onValueChange={(value) => {
                          if (value === 'custom') {
                            updateGroq('model', '');
                          } else {
                            updateGroq('model', value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llama-3.1-8b-instant">llama-3.1-8b-instant</SelectItem>
                          <SelectItem value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</SelectItem>
                          <SelectItem value="mixtral-8x7b-32768">mixtral-8x7b-32768</SelectItem>
                          <SelectItem value="gemma2-9b-it">gemma2-9b-it</SelectItem>
                          <SelectItem value="custom">{t('customModel') || 'Custom Model'}</SelectItem>
                        </SelectContent>
                      </Select>
                      {!['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'].includes(localSettings.groq.model) && (
                        <Input
                          id="groqModel"
                          placeholder="llama-3.1-8b-instant"
                          value={localSettings.groq.model}
                          onChange={(e) => updateGroq('model', e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-medium">{t('ollamaConfig')}</h3>
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <Label htmlFor="ollamaUrl">{t('ollamaUrl')}</Label>
                      <Input
                        id="ollamaUrl"
                        placeholder="http://localhost:11434/v1"
                        value={localSettings.ollama.url}
                        onChange={(e) => updateOllama('url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="ollamaModel">{t('model')}</Label>
                      {loadingModels ? (
                        <div className="text-sm text-gray-500">Loading models...</div>
                      ) : (
                        <Select
                          value={ollamaModels.includes(localSettings.ollama.model) ? localSettings.ollama.model : 'custom'}
                          onValueChange={(value) => {
                            if (value === 'custom') {
                              updateOllama('model', '');
                            } else {
                              updateOllama('model', value);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {ollamaModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">{t('customModel') || 'Custom Model'}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {!ollamaModels.includes(localSettings.ollama.model) && (
                        <Input
                          id="ollamaModel"
                          placeholder="gemma3:4b"
                          value={localSettings.ollama.model}
                          onChange={(e) => updateOllama('model', e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Automation Settings */}
              <TabsContent value="automation" className="space-y-6 mt-0">
                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm">
                    {t('autoRoutingInfo')}
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base">{t('enableAutoRouting')}</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('autoRoutingDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.automaticRouting.enabled}
                        onCheckedChange={(checked) =>
                          setLocalSettings({
                            ...localSettings,
                            automaticRouting: { ...localSettings.automaticRouting, enabled: checked }
                          })
                        }
                      />
                    </div>
                  </Card>

                  {localSettings.automaticRouting.enabled && (
                    <>
                      <div className="space-y-3">
                        <Label htmlFor="checkInterval">{t('checkInterval')}</Label>
                        <Input
                          id="checkInterval"
                          type="number"
                          min="1"
                          max="60"
                          value={localSettings.automaticRouting.checkInterval}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              automaticRouting: {
                                ...localSettings.automaticRouting,
                                checkInterval: parseInt(e.target.value) || 5
                              }
                            })
                          }
                        />
                        <p className="text-xs text-gray-500">
                          {t('checkIntervalHelp')} {localSettings.automaticRouting.checkInterval} {t('minutes')}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-base font-medium">{t('azureMapsConfig')}</h4>
                        <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <Label htmlFor="azureKey">{t('azureApiKey')}</Label>
                          <Input
                            id="azureKey"
                            type="password"
                            placeholder="Azure Maps API Key..."
                            value={localSettings.azure.apiKey}
                            onChange={(e) =>
                              setLocalSettings({
                                ...localSettings,
                                azure: { ...localSettings.azure, apiKey: e.target.value }
                              })
                            }
                          />
                          <p className="text-xs text-gray-500">
                            {t('getApiKey')}{' '}
                            <a
                              href="https://azure.microsoft.com/en-us/products/azure-maps"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Azure Maps
                            </a>
                          </p>
                        </div>
                      </div>

                      <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
                        <AlertDescription className="text-sm">
                          ⚠️ {t('autoRoutingWarning')}
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Department Settings */}
              <TabsContent value="departments" className="space-y-6 mt-0">
                <Card className="p-4">
                  <Label className="text-base mb-4 block">{t('addNewDepartment')}</Label>
                  
                  {/* Form inputs */}
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder={t('name')}
                        value={newDept.nome}
                        onChange={(e) => setNewDept({ ...newDept, nome: e.target.value })}
                      />
                      <Input
                        placeholder={t('email')}
                        value={newDept.email}
                        onChange={(e) => setNewDept({ ...newDept, email: e.target.value })}
                      />
                    </div>
                    <Input
                      placeholder={t('description')}
                      value={newDept.descrizione}
                      onChange={(e) => setNewDept({ ...newDept, descrizione: e.target.value })}
                    />
                    
                    {/* Icon and Color Pickers */}
                    <div className="grid grid-cols-2 gap-3">
                      <IconPicker
                        value={newDept.icon || DEFAULT_DEPARTMENT_ICON}
                        onChange={(icon) => setNewDept({ ...newDept, icon })}
                        previewColor={newDept.color}
                      />
                      <ColorPicker
                        value={newDept.color || '#6B7280'}
                        onChange={(color) => setNewDept({ ...newDept, color })}
                      />
                    </div>
                    
                    {/* Preview */}
                    <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getDepartmentIcon(newDept);
                          return <Icon className="w-5 h-5" style={{ color: newDept.color || '#6B7280' }} />;
                        })()}
                        <span className="font-medium">{newDept.nome || 'Department Name'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" onClick={addDepartment} className="w-full">
                    {t('addDepartment')}
                  </Button>
                </Card>

                <div className="space-y-3">
                  <Label className="text-base">{t('configuredDepartments')}</Label>
                  <div className="space-y-3">
                    {localSettings.departments.map((dept) => (
                      <Card key={dept.nome} className="p-4">
                        {editingDept === dept.nome ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-xs">{t('name')}</Label>
                                <Input
                                  value={editDeptData.nome}
                                  onChange={(e) => setEditDeptData({ ...editDeptData, nome: e.target.value })}
                                  placeholder={t('name')}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">{t('email')}</Label>
                                <Input
                                  value={editDeptData.email}
                                  onChange={(e) => setEditDeptData({ ...editDeptData, email: e.target.value })}
                                  placeholder={t('email')}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs">{t('description')}</Label>
                              <Input
                                value={editDeptData.descrizione}
                                onChange={(e) => setEditDeptData({ ...editDeptData, descrizione: e.target.value })}
                                placeholder={t('description')}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <IconPicker
                                value={editDeptData.icon || DEFAULT_DEPARTMENT_ICON}
                                onChange={(icon) => setEditDeptData({ ...editDeptData, icon })}
                                previewColor={editDeptData.color}
                              />
                              <ColorPicker
                                value={editDeptData.color || '#6B7280'}
                                onChange={(color) => setEditDeptData({ ...editDeptData, color })}
                              />
                            </div>
                            
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditDepartment}
                                className="gap-2"
                              >
                                <X className="w-4 h-4" />
                                {t('cancel')}
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={saveEditDepartment}
                                className="gap-2"
                              >
                                <Check className="w-4 h-4" />
                                {t('save')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {(() => {
                                  const Icon = getDepartmentIcon(dept);
                                  const color = getDepartmentColorSafe(dept);
                                  return <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />;
                                })()}
                                <p className="font-medium">{dept.nome}</p>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {dept.descrizione}
                              </p>
                              <p className="text-xs text-gray-500">📧 {dept.email}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditDepartment(dept)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDepartment(dept.nome)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* General Settings */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        {t('language')}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('languageDescription')}
                      </p>
                    </div>
                    <Select
                      value={localSettings.language}
                      onValueChange={(value: 'en' | 'it') =>
                        setLocalSettings({ ...localSettings, language: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">{t('desktopNotifications')}</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('desktopNotificationsDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.notificationsEnabled}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, notificationsEnabled: checked })
                      }
                    />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base">{t('darkMode')}</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('darkModeDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.darkMode}
                      onCheckedChange={(checked) =>
                        setLocalSettings({ ...localSettings, darkMode: checked })
                      }
                    />
                  </div>
                </Card>
              </TabsContent>

              {/* Action Buttons - Inside ScrollArea */}
              <div className="flex justify-end gap-3 pt-6 border-t mt-6 pb-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave}>
                  {t('saveChanges')}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
