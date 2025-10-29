import { Email, Department } from '../types/email';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Mail, Clock, TrendingUp, Play, Trash2 } from "lucide-react";
import { useState } from 'react';

interface CompactEmailListProps {
  emails: Email[];
  title: string;
  onEmailClick: (email: Email) => void;
  onProcess?: (email: Email) => void;
  onDelete?: (emailId: string) => void;
  showProcessButton?: boolean;
  departments: Department[];
  showDepartmentFilter?: boolean; // new prop to control filter type
}

export function CompactEmailList({ 
  emails, 
  title, 
  onEmailClick, 
  onProcess, 
  onDelete,
  showProcessButton = false,
  departments,
  showDepartmentFilter = true // default to department filter
}: CompactEmailListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [senderFilter, setSenderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');

  // Get unique departments from emails
  const emailDepartments = Array.from(new Set(
    emails
      .map(e => e.forwardedToDepartment || e.suggestedDepartment)
      .filter(Boolean)
  ));

  // Get unique senders from emails
  const emailSenders = Array.from(new Set(
    emails.map(e => e.sender.split('<')[0].trim()) // Extract name before email
  )).sort();

  // Filter and sort emails
  const filteredEmails = emails
    .filter(email => {
      const matchesSearch = 
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.body.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by department or sender based on showDepartmentFilter prop
      let matchesFilter = true;
      if (showDepartmentFilter) {
        matchesFilter = 
          departmentFilter === 'all' || 
          email.forwardedToDepartment === departmentFilter ||
          email.suggestedDepartment === departmentFilter;
      } else {
        matchesFilter = 
          senderFilter === 'all' ||
          email.sender.includes(senderFilter);
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return (b.confidence || 0) - (a.confidence || 0);
      }
    });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5" />
          {title}
          <Badge variant="outline" className="ml-auto">{filteredEmails.length}</Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="space-y-2 pt-2">
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8"
          />
          <div className="flex gap-2">
            {showDepartmentFilter ? (
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {emailDepartments.map(dept => (
                    <SelectItem key={dept} value={dept || ''}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={senderFilter} onValueChange={setSenderFilter}>
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="All Senders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Senders</SelectItem>
                  {emailSenders.map(sender => (
                    <SelectItem key={sender} value={sender}>{sender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'confidence')}>
              <SelectTrigger className="flex-1 h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="confidence">By Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 pt-0">
        <div className="space-y-1">{filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Mail className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No emails found</p>
            </div>
          ) : (
            filteredEmails.map(email => (
              <div
                key={email.id}
                className="border rounded-lg p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onEmailClick(email)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{email.subject}</div>
                    <div className="text-xs text-gray-600 truncate">{email.sender}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(email.timestamp).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {(email.suggestedDepartment || email.forwardedToDepartment) && (
                      <Badge variant="secondary" className="text-xs">
                        {email.forwardedToDepartment || email.suggestedDepartment}
                      </Badge>
                    )}
                    {email.confidence !== undefined && email.confidence > 0 && (
                      <div className={`flex items-center gap-1 text-xs font-semibold ${getConfidenceColor(email.confidence)}`}>
                        <TrendingUp className="w-3 h-3" />
                        {email.confidence}%
                      </div>
                    )}
                    <div className="flex gap-1">
                      {showProcessButton && email.status === 'not_processed' && onProcess && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1 h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onProcess(email);
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Process
                        </Button>
                      )}
                      {email.status === 'not_processed' && onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-1 h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(email.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
