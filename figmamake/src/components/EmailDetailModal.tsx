import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Email } from '../types/email';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, User, TrendingUp } from "lucide-react";
import { getDepartmentColor, getContrastTextColor } from '../utils/colors';

interface EmailDetailModalProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess?: (email: Email) => void;
}

export function EmailDetailModal({ email, isOpen, onClose, onProcess }: EmailDetailModalProps) {
  if (!email) return null;

  const getStatusBadge = (status: Email['status']) => {
    const variants: Record<Email['status'], { color: string; label: string }> = {
      not_processed: { color: 'bg-gray-500', label: 'Not Processed' },
      analyzing: { color: 'bg-blue-500', label: 'Analyzing...' },
      forwarded: { color: 'bg-green-500', label: 'Forwarded' },
      cancelled: { color: 'bg-red-500', label: 'Cancelled' },
      error: { color: 'bg-red-600', label: 'Error' },
    };
    
    const variant = variants[status];
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="flex flex-col p-0 gap-0"
        style={{
          width: '95vw',
          maxWidth: '95vw',
          height: '90vh',
          maxHeight: '90vh'
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{email.subject}</span>
            {getStatusBadge(email.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div 
          className="px-6 py-4 overflow-y-scroll"
          style={{
            flex: '1 1 0',
            minHeight: 0
          }}
        >
          <div className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">From:</span>
              <span>{email.sender}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Date:</span>
              <span>{new Date(email.timestamp).toLocaleString()}</span>
            </div>
          </div>

          {/* AI Analysis */}
          {email.status !== 'not_processed' && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">AI Analysis</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Suggested Department:</span>
                  <Badge
                    className="ml-2"
                    style={{
                      backgroundColor: getDepartmentColor(email.suggestedDepartment || ''),
                      color: getContrastTextColor(getDepartmentColor(email.suggestedDepartment || ''))
                    }}
                  >
                    {email.suggestedDepartment}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <span className="ml-2 font-bold text-blue-600">{email.confidence}%</span>
                </div>
                {email.aiSummary && (
                  <div>
                    <span className="font-medium">Summary:</span>
                    <p className="mt-1 text-sm text-gray-700">{email.aiSummary}</p>
                  </div>
                )}
                {email.aiReasoning && (
                  <div>
                    <span className="font-medium">Reasoning:</span>
                    <p className="mt-1 text-sm text-gray-600 italic">{email.aiReasoning}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Body */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Email Content</h3>
            <div className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {email.body}
            </div>
          </div>

          {/* Forwarded Info */}
          {email.forwardedToDepartment && (
            <div className="border rounded-lg p-4 bg-green-50">
              <span className="font-medium">Forwarded to:</span>
              <Badge
                className="ml-2"
                style={{
                  backgroundColor: getDepartmentColor(email.forwardedToDepartment),
                  color: getContrastTextColor(getDepartmentColor(email.forwardedToDepartment))
                }}
              >
                {email.forwardedToDepartment}
              </Badge>
            </div>
          )}

          {/* Error */}
          {email.error && (
            <div className="border rounded-lg p-4 bg-red-50">
              <span className="font-medium text-red-600">Error:</span>
              <p className="mt-1 text-sm text-red-700">{email.error}</p>
            </div>
          )}
          </div>
        </div>

        {/* Actions */}
        {email.status === 'not_processed' && onProcess && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 shrink-0">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={() => onProcess(email)}>
              Process Email
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
