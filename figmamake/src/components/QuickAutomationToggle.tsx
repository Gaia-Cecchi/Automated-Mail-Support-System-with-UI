import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Zap, Power } from 'lucide-react';

interface QuickAutomationToggleProps {
  enabled: boolean;
  onToggle: () => void;
  language: 'en' | 'it';
}

export function QuickAutomationToggle({ enabled, onToggle, language }: QuickAutomationToggleProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const t = {
    en: {
      autoRouting: 'Automatic Routing',
      confirmToggleTitle: enabled ? 'Disable Automatic Routing?' : 'Enable Automatic Routing?',
      confirmToggleDescription: enabled 
        ? 'Are you sure you want to disable automatic routing? The system will stop processing emails automatically and will require manual review.'
        : 'Are you sure you want to enable automatic routing? The system will start processing and forwarding emails automatically based on geographic location.',
      cancel: 'Cancel',
      confirm: enabled ? 'Disable' : 'Enable',
      on: 'ON',
      off: 'OFF'
    },
    it: {
      autoRouting: 'Routing Automatico',
      confirmToggleTitle: enabled ? 'Disabilitare Routing Automatico?' : 'Abilitare Routing Automatico?',
      confirmToggleDescription: enabled 
        ? 'Sei sicuro di voler disabilitare il routing automatico? Il sistema smetterà di processare le email automaticamente e richiederà revisione manuale.'
        : 'Sei sicuro di voler abilitare il routing automatico? Il sistema inizierà a processare e inoltrare le email automaticamente in base alla posizione geografica.',
      cancel: 'Annulla',
      confirm: enabled ? 'Disabilita' : 'Abilita',
      on: 'ON',
      off: 'OFF'
    }
  };

  const translations = t[language];

  const handleClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    onToggle();
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Button
        variant={enabled ? "default" : "outline"}
        onClick={handleClick}
        className={`gap-2 ${enabled ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
      >
        <Zap className="w-4 h-4" />
        {translations.autoRouting}
        <Badge 
          variant={enabled ? "secondary" : "outline"}
          className={`ml-1 text-xs ${enabled ? 'bg-white/20 text-white border-white/30' : ''}`}
        >
          {enabled ? translations.on : translations.off}
        </Badge>
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Power className="w-5 h-5" />
              {translations.confirmToggleTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {translations.confirmToggleDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{translations.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className={enabled ? '' : 'bg-purple-600 hover:bg-purple-700'}
            >
              {translations.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
