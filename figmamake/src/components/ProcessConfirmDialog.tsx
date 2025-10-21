import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Email, Department } from '../types/email';
import { CheckCircle, AlertCircle, Mail, Building2, Target, Brain, List, Edit3 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ProcessConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: Email | null;
  emailsToProcess: Email[];
  department: Department | null;
  onConfirm: () => void;
  onCancel: () => void;
  onEditDepartment?: () => void;
  language: 'en' | 'it';
}

export function ProcessConfirmDialog({
  open,
  onOpenChange,
  email,
  emailsToProcess,
  department,
  onConfirm,
  onCancel,
  onEditDepartment,
  language
}: ProcessConfirmDialogProps) {
  const { t } = useTranslation(language);
  
  if (!email || !department) return null;
  
  const isBatch = emailsToProcess.length > 1;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 70) return <CheckCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] !max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBatch ? <List className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            {t('confirmRouting')}
            {isBatch && ` (${emailsToProcess.length})`}
          </DialogTitle>
          <DialogDescription>
            {isBatch 
              ? `${t('batchProcessDescription')} ${emailsToProcess.length} ${t('emails')}`
              : t('confirmDescription')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Info */}
          {isBatch ? (
            <Card className="p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <List className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="mb-2 font-medium">{emailsToProcess.length} {t('emailsSelected')}</p>
                  <div className="max-h-32 overflow-y-scroll pr-2 space-y-1">
                    {emailsToProcess.map(e => (
                      <div key={e.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        • {e.sender} - {e.subject}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="mb-1 truncate">
                    <span className="text-sm text-gray-500">{t('subject')}:</span>{' '}
                    {email.subject}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {t('from')}: {email.sender}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* AI Analysis Header */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('aiAnalysis')}
            </h3>
            <Badge
              className={`${getConfidenceColor(email.confidence)} border-current`}
              variant="outline"
            >
              {getConfidenceIcon(email.confidence)}
              <span className="ml-1">{t('confidence')}: {email.confidence}%</span>
            </Badge>
          </div>

          {/* Suggested Department */}
          {!isBatch && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">{t('suggestedDepartment')}</h4>
                  <p className="mb-2">{department.nome}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {department.descrizione}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    📧 {department.email}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {!isBatch && (
            <>
              {/* Summary */}
              <Card className="p-4 border-2 border-blue-200 dark:border-blue-800">
                <h4 className="mb-2">{t('summary')}</h4>
                <p className="text-sm">{email.aiSummary}</p>
              </Card>

              {/* Reasoning */}
              {email.aiReasoning && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-900">
                  <h4 className="mb-2">{t('reasoning')}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {email.aiReasoning}
                  </p>
                </Card>
              )}
            </>
          )}

          {/* Warning for low confidence */}
          {email.confidence < 70 && (
            <Card className="p-4 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-yellow-700 dark:text-yellow-400 mb-1">
                    {t('warning')}: {t('lowConfidenceWarning')}
                  </h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    {t('lowConfidenceMessage')}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {isBatch && (
            <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <h4 className="mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {t('suggestedDepartments')}
              </h4>
              <div className="max-h-64 overflow-y-scroll pr-2 space-y-3">
                {emailsToProcess.map((emailItem) => {
                  const dept = emailsToProcess[0]; // Get department info from settings in real implementation
                  const deptName = emailItem.suggestedDepartment;
                  return (
                    <div key={emailItem.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate mb-1">
                          <span className="font-medium">{emailItem.sender}</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                          {emailItem.subject}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            🎯 {deptName}
                          </Badge>
                          <Badge
                            className={`${getConfidenceColor(emailItem.confidence)} border-current text-xs`}
                            variant="outline"
                          >
                            {getConfidenceIcon(emailItem.confidence)}
                            <span className="ml-1">{emailItem.confidence}%</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              ❌ {t('no')}
            </Button>
            {onEditDepartment && !isBatch && (
              <Button 
                variant="outline" 
                onClick={onEditDepartment} 
                className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {t('editDepartment')}
              </Button>
            )}
            <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
              ✅ {t('yes')} {isBatch && `(${emailsToProcess.length})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
