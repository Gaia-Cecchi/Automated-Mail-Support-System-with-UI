import { useState } from 'react';
import { Email, Department } from '../types/email';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Mail, Paperclip, AlertCircle, CheckCircle, FileText, MapPin, Edit3 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { ManualOverrideDialog } from './ManualOverrideDialog';

interface EmailDetailProps {
  email: Email;
  departments: Department[];
  automaticMode: boolean;
  onProcess: (emailId: string) => void;
  onRemove: (emailId: string) => void;
  onDepartmentOverride: (emailId: string, newDepartment: string) => void;
  language: 'en' | 'it';
}

export function EmailDetail({ email, departments, automaticMode, onProcess, onRemove, onDepartmentOverride, language }: EmailDetailProps) {
  const { t } = useTranslation(language);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) {
      return (
        <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t('highConfidence')}: {confidence}%
        </Badge>
      );
    } else if (confidence >= 70) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t('mediumConfidence')}: {confidence}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t('lowConfidence')}: {confidence}%
        </Badge>
      );
    }
  };

  const getStatusProgress = () => {
    switch (email.status) {
      case 'analyzing':
        return { value: 50, label: t('analysisInProgress'), color: 'bg-blue-500' };
      case 'not_processed':
        return { value: 75, label: t('readyForProcessing'), color: 'bg-yellow-500' };
      case 'error':
        return { value: 100, label: t('errorEncountered'), color: 'bg-red-500' };
      case 'forwarded':
        return { value: 100, label: t('forwardedSuccessfully'), color: 'bg-green-500' };
      case 'cancelled':
        return { value: 100, label: t('cancelledByUser'), color: 'bg-gray-500' };
    }
  };

  const status = getStatusProgress();

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Email Header */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 truncate">{email.subject}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('from')}: {email.sender}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDateTime(email.timestamp)}
                  </span>
                </div>

                {email.attachments.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Paperclip className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-700 dark:text-amber-400">
                        {email.attachments.length} {email.attachments.length > 1 ? t('attachmentsPlural') : t('attachments')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {email.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm p-2 bg-white dark:bg-gray-900 rounded border border-amber-200 dark:border-amber-800"
                        >
                          <FileText className="w-4 h-4 text-red-500" />
                          {attachment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Email Body */}
          <Card className="p-4">
            <Label className="mb-2 block">{t('emailBody')}</Label>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg whitespace-pre-wrap text-sm">
              {email.body}
            </div>
          </Card>

          {/* AI Summary or Geographic Info */}
          <Card className={`p-4 border-2 ${
            automaticMode 
              ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20'
              : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                {automaticMode ? (
                  <>
                    <MapPin className="w-4 h-4" />
                    {t('geoRouting')}
                  </>
                ) : (
                  t('aiSummary')
                )}
              </Label>
              {getConfidenceBadge(email.confidence)}
            </div>
            <p className="text-sm mb-3">{email.aiSummary}</p>
            
            {email.aiReasoning && (
              <>
                <Label className="mb-2 block text-xs">
                  {automaticMode ? t('geolocation') : t('reasoning')}
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                  {email.aiReasoning}
                </p>
              </>
            )}
          </Card>

          {/* Suggested Department */}
          {email.status === 'not_processed' && (
            <Card className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <Label>{t('suggestedDepartment')}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverrideDialogOpen(true)}
                  className="h-8 gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {t('editDepartment')}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1">{email.suggestedDepartment}</p>
                  {departments.find(d => d.nome === email.suggestedDepartment) && (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {departments.find(d => d.nome === email.suggestedDepartment)?.descrizione}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        📧 {departments.find(d => d.nome === email.suggestedDepartment)?.email}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Forwarded Department Info */}
          {email.status === 'forwarded' && email.forwardedToDepartment && (
            <Card className="p-4 bg-green-50/50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800">
              <Label className="mb-3 block">{t('forwardedToDepartment')}</Label>
              <div>
                <p className="mb-1">✅ {email.forwardedToDepartment}</p>
                {departments.find(d => d.nome === email.forwardedToDepartment) && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {departments.find(d => d.nome === email.forwardedToDepartment)?.descrizione}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📧 {departments.find(d => d.nome === email.forwardedToDepartment)?.email}
                    </p>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Error Message */}
          {email.error && (
            <Card className="p-4 border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <Label className="text-red-700 dark:text-red-400 mb-1 block">Errore</Label>
                  <p className="text-sm text-red-600 dark:text-red-300">{email.error}</p>
                </div>
              </div>
            </Card>
          )}


        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-3">
          {email.status === 'not_processed' && (
            <Button
              size="lg"
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white gap-2"
              onClick={() => onProcess(email.id)}
            >
              🔄 {t('processEmail')}
            </Button>
          )}
          <Button
            size="lg"
            variant="destructive"
            className="h-14"
            onClick={() => onRemove(email.id)}
          >
            🗑️ {t('remove')}
          </Button>
        </div>
      </div>

      {/* Manual Override Dialog */}
      <ManualOverrideDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        currentDepartment={email.suggestedDepartment}
        departments={departments}
        onConfirm={(newDepartment) => onDepartmentOverride(email.id, newDepartment)}
        language={language}
      />
    </div>
  );
}
