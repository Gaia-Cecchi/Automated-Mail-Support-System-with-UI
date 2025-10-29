import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Calendar, TrendingUp, Mail, X, Check, Eye } from "lucide-react";
import { Email, Department } from "../types/email";

interface ProcessedEmail extends Email {
  aiAnalysis: {
    suggestedDepartment: string;
    confidence: number;
    summary: string;
  };
}

interface BatchReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  processedEmails: ProcessedEmail[];
  departments: Department[];
  onApproveAll: (emailsToProcess: Map<string, string>) => void;
  onMarkAsUnprocessed: (emailIds: string[]) => void;
  onOpenEmailDetail: (email: Email) => void;
}

export function BatchReviewModal({
  isOpen,
  onClose,
  processedEmails,
  departments,
  onApproveAll,
  onMarkAsUnprocessed,
  onOpenEmailDetail
}: BatchReviewModalProps) {
  const [emailDepartments, setEmailDepartments] = useState<Map<string, string>>(
    new Map(processedEmails.map(email => [email.id, email.aiAnalysis.suggestedDepartment]))
  );
  const [excludedEmails, setExcludedEmails] = useState<Set<string>>(new Set());

  // Debug: log confidence values
  console.log('Processed emails for review:', processedEmails.map(e => ({
    subject: e.subject,
    confidence: e.aiAnalysis.confidence,
    department: e.aiAnalysis.suggestedDepartment
  })));

  const handleDepartmentChange = (emailId: string, department: string) => {
    setEmailDepartments(prev => new Map(prev).set(emailId, department));
  };

  const handleToggleExclude = (emailId: string) => {
    setExcludedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const handleApproveAll = () => {
    const emailsToProcess = new Map<string, string>();
    processedEmails.forEach(email => {
      if (!excludedEmails.has(email.id)) {
        emailsToProcess.set(email.id, emailDepartments.get(email.id) || email.aiAnalysis.suggestedDepartment);
      }
    });

    const unprocessedIds = Array.from(excludedEmails);
    if (unprocessedIds.length > 0) {
      onMarkAsUnprocessed(unprocessedIds);
    }

    onApproveAll(emailsToProcess);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800";
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const approvedCount = processedEmails.length - excludedEmails.size;

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
            <span>Review Analyzed Emails ({processedEmails.length})</span>
            <Badge variant="outline" className="ml-4">
              {approvedCount} to forward, {excludedEmails.size} to review later
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div 
          className="px-6 py-4 overflow-y-scroll"
          style={{
            flex: '1 1 0',
            minHeight: 0
          }}
        >
          <div className="space-y-3">
            {processedEmails.map((email) => {
              const isExcluded = excludedEmails.has(email.id);
              const selectedDept = emailDepartments.get(email.id) || email.aiAnalysis.suggestedDepartment;

              return (
                <div
                  key={email.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isExcluded ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox per escludere */}
                    <div className="flex items-center pt-1">
                      <Checkbox
                        checked={!isExcluded}
                        onCheckedChange={() => handleToggleExclude(email.id)}
                      />
                    </div>

                    {/* Contenuto email */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <h3 className="font-semibold text-lg">{email.subject}</h3>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{email.sender}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(email.timestamp).toLocaleString('en-GB', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenEmailDetail(email)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>

                      {/* AI Summary */}
                      <div className="bg-blue-50 rounded p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm text-blue-900">AI Analysis</span>
                          <Badge className={getConfidenceBadgeColor(email.aiAnalysis.confidence)}>
                            {email.aiAnalysis.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{email.aiAnalysis.summary}</p>
                      </div>

                      {/* Department Selection */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Send to:</span>
                        <Select
                          value={selectedDept}
                          onValueChange={(value) => handleDepartmentChange(email.id, value)}
                          disabled={isExcluded}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.nome} value={dept.nome}>
                                {dept.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedDept !== email.aiAnalysis.suggestedDepartment && (
                          <Badge variant="outline" className="text-orange-600">
                            Modified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExcluded && (
                    <div className="mt-3 pt-3 border-t">
                      <Badge variant="secondary">
                        <X className="h-3 w-3 mr-1" />
                        Will be marked as unprocessed (not analyzed)
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {approvedCount > 0 && (
                <span className="font-medium text-green-700">
                  {approvedCount} email{approvedCount !== 1 ? 's' : ''} will be forwarded
                </span>
              )}
              {excludedEmails.size > 0 && approvedCount > 0 && <span className="mx-2">•</span>}
              {excludedEmails.size > 0 && (
                <span className="font-medium text-orange-600">
                  {excludedEmails.size} email{excludedEmails.size !== 1 ? 's' : ''} marked as unprocessed
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleApproveAll}
                disabled={approvedCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Forward Selected ({approvedCount})
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
