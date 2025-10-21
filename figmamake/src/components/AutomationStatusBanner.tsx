import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Zap, ZapOff, Clock } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface AutomationStatusBannerProps {
  enabled: boolean;
  checkInterval: number;
  onToggle: () => void;
  onOpenSettings?: () => void;
  language: 'en' | 'it';
}

export function AutomationStatusBanner({ enabled, checkInterval, onToggle, onOpenSettings, language }: AutomationStatusBannerProps) {
  const { t } = useTranslation(language);
  
  if (!enabled) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <span className="font-medium">{t('automationActive')}</span>
        </div>
        
        <div className="h-4 w-px bg-white/30" />
        
        <Badge 
          variant="secondary" 
          className="bg-white/20 text-white border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
          onClick={onOpenSettings}
        >
          <Clock className="w-3 h-3 mr-1" />
          {t('checkEvery')} {checkInterval} {t('min')}
        </Badge>
        
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          🗺️ {t('geoRouting')}
        </Badge>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-white hover:bg-white/20"
      >
        <ZapOff className="w-4 h-4 mr-2" />
        {t('disable')}
      </Button>
    </div>
  );
}
