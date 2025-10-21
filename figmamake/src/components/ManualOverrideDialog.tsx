import { useState } from 'react';
import { Department } from '../types/email';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Edit3 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ManualOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDepartment: string;
  departments: Department[];
  onConfirm: (newDepartment: string) => void;
  language: 'en' | 'it';
}

export function ManualOverrideDialog({
  open,
  onOpenChange,
  currentDepartment,
  departments,
  onConfirm,
  language
}: ManualOverrideDialogProps) {
  const { t } = useTranslation(language);
  const [selectedDepartment, setSelectedDepartment] = useState(currentDepartment);

  const handleConfirm = () => {
    if (selectedDepartment && selectedDepartment !== currentDepartment) {
      onConfirm(selectedDepartment);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedDepartment(currentDepartment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-orange-600" />
            {t('manualOverrideTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('manualOverrideDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <p className="mb-2">{t('manualOverrideWarning')}</p>
              <p className="text-xs opacity-80">{t('manualOverrideWarning2')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('currentAISuggestion')}</Label>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="font-medium">{currentDepartment}</p>
              {departments.find(d => d.nome === currentDepartment) && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {departments.find(d => d.nome === currentDepartment)?.descrizione}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-select">{t('selectNewDepartment')}</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger id="department-select">
                <SelectValue placeholder={t('selectDepartment')} />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.nome} value={dept.nome}>
                    <div className="flex flex-col">
                      <span className="font-medium">{dept.nome}</span>
                      <span className="text-xs text-gray-500">{dept.descrizione}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDepartment || selectedDepartment === currentDepartment}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {t('confirmOverride')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
