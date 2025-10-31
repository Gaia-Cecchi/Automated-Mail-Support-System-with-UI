import { Email, Department } from '../types/email';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Clock, AlertCircle, CheckCircle, Loader2, XCircle, Inbox, Archive, CheckSquare, Trash2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { getDepartmentColor, getContrastTextColor, getDepartmentIcon } from '../utils/colors';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  selectedEmailIds: string[];
  onSelectEmail: (emailId: string) => void;
  onToggleEmailSelection: (emailId: string) => void;
  onSelectAll: (emailIds: string[]) => void;
  onClearSelection: () => void;
  onProcessSelected: () => void;
  onDeleteEmail: (emailId: string) => void;
  language: 'en' | 'it';
}

export function EmailList({ 
  emails, 
  selectedEmailId, 
  selectedEmailIds,
  onSelectEmail,
  onToggleEmailSelection,
  onSelectAll,
  onClearSelection,
  onProcessSelected,
  onDeleteEmail,
  language 
}: EmailListProps) {
  const { t } = useTranslation(language);
  
  // To Process: all emails except those that are forwarded or cancelled
  const unprocessedEmails = emails.filter(e => e.status !== 'forwarded' && e.status !== 'cancelled');
  // Processed: only forwarded and cancelled emails
  const processedEmails = emails.filter(e => e.status === 'forwarded' || e.status === 'cancelled');
  const getStatusIcon = (status: Email['status']) => {
    switch (status) {
      case 'not_processed':
        return <Clock className="w-4 h-4" />;
      case 'analyzing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'forwarded':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Email['status']) => {
    switch (status) {
      case 'not_processed':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'analyzing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'forwarded':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      case 'error':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
    }
  };

  const getStatusLabel = (status: Email['status']) => {
    switch (status) {
      case 'not_processed':
        return t('notProcessed');
      case 'analyzing':
        return t('analyzing');
      case 'forwarded':
        return t('forwarded');
      case 'cancelled':
        return t('cancelled');
      case 'error':
        return t('error');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  const renderEmailCard = (email: Email, showCheckbox: boolean = false) => {
    const isSelected = selectedEmailIds.includes(email.id);
    const isActive = selectedEmailId === email.id;
    
    return (
      <div
        key={email.id}
        className={`mb-2 rounded-lg border transition-colors ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-start gap-2 p-3">
          {showCheckbox && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleEmailSelection(email.id)}
              disabled={email.status !== 'not_processed'}
              className="mt-1"
            />
          )}
          
          <button
            onClick={() => onSelectEmail(email.id)}
            className="flex-1 text-left min-w-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${getStatusColor(email.status)}`}>
                  {getStatusIcon(email.status)}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(email.timestamp)}
                </span>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {getStatusLabel(email.status)}
              </Badge>
            </div>
            
            <div className="mb-1 truncate">{email.sender}</div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
              {email.subject}
            </div>
            
            {email.status === 'not_processed' && email.suggestedDepartment && (
              <Badge className={`text-xs flex items-center gap-1 ${
                email.confidence >= 80 
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                  : email.confidence >= 70 
                  ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' 
                  : 'bg-red-500/20 text-red-700 dark:text-red-400'
              }`}>
                {(() => {
                  const Icon = getDepartmentIcon(email.suggestedDepartment);
                  return <Icon className="w-3 h-3" style={{ color: getDepartmentColor(email.suggestedDepartment) }} />;
                })()}
                {email.suggestedDepartment} • {email.confidence}%
              </Badge>
            )}
            {email.status === 'forwarded' && (
              <Badge className="text-xs flex items-center gap-1" style={{
                backgroundColor: email.forwardedToDepartment ? getDepartmentColor(email.forwardedToDepartment) : '#6B7280',
                color: email.forwardedToDepartment ? getContrastTextColor(getDepartmentColor(email.forwardedToDepartment)) : '#FFFFFF'
              }}>
                {email.forwardedToDepartment && (() => {
                  const Icon = getDepartmentIcon(email.forwardedToDepartment);
                  const color = getContrastTextColor(getDepartmentColor(email.forwardedToDepartment));
                  return <Icon className="w-3 h-3" style={{ color }} />;
                })()}
                ✅ {t('forwarded')}
                {email.forwardedToDepartment && (
                  <>
                    {' → '}
                    {email.forwardedToDepartment}
                  </>
                )}
              </Badge>
            )}
            {email.status === 'cancelled' && (
              <Badge className="text-xs flex items-center gap-1" style={{
                backgroundColor: email.suggestedDepartment ? getDepartmentColor(email.suggestedDepartment) : '#6B7280',
                color: email.suggestedDepartment ? getContrastTextColor(getDepartmentColor(email.suggestedDepartment)) : '#FFFFFF'
              }}>
                {email.suggestedDepartment && (() => {
                  const Icon = getDepartmentIcon(email.suggestedDepartment);
                  const color = getContrastTextColor(getDepartmentColor(email.suggestedDepartment));
                  return <Icon className="w-3 h-3" style={{ color }} />;
                })()}
                {t('cancelled')}
              </Badge>
            )}
          </button>
          
          {email.status === 'not_processed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteEmail(email.id);
              }}
              className="shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="unprocessed" className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="mb-3">{t('emailsInReview')}</h2>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unprocessed" className="gap-2">
              <Inbox className="w-4 h-4" />
              {t('toProcess')} ({unprocessedEmails.length})
            </TabsTrigger>
            <TabsTrigger value="processed" className="gap-2">
              <Archive className="w-4 h-4" />
              {t('processed')} ({processedEmails.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="unprocessed" className="flex-1 flex flex-col mt-0">
          {selectedEmailIds.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  {selectedEmailIds.length} {t('selected')}
                </span>
                <Button variant="ghost" size="sm" onClick={onClearSelection}>
                  {t('clearSelection')}
                </Button>
              </div>
              <Button 
                size="sm" 
                className="w-full"
                onClick={onProcessSelected}
              >
                {t('processSelected')} ({selectedEmailIds.length})
              </Button>
            </div>
          )}
          
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const selectableEmails = unprocessedEmails.filter(e => e.status === 'not_processed');
                if (selectedEmailIds.length === selectableEmails.length) {
                  onClearSelection();
                } else {
                  onSelectAll(selectableEmails.map(e => e.id));
                }
              }}
              className="text-xs h-7"
            >
              {selectedEmailIds.length === unprocessedEmails.filter(e => e.status === 'not_processed').length ? t('deselectAll') : t('selectAll')}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {unprocessedEmails.length > 0 ? (
                unprocessedEmails.map((email) => renderEmailCard(email, true))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Inbox className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t('noUnprocessedEmails')}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="processed" className="flex-1 flex flex-col mt-0">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {processedEmails.length > 0 ? (
                processedEmails.map((email) => renderEmailCard(email, false))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Archive className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t('noProcessedEmails')}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
