import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pipette, Check } from 'lucide-react';
import { PREDEFINED_COLORS } from '../utils/colors';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label = 'Color' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  const handleColorChange = (newColor: string) => {
    onChange(newColor);
    setHexInput(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHexInput(newValue);
    
    // Valida formato hex e aggiorna se valido
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handlePredefinedColorClick = (color: string) => {
    handleColorChange(color);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Preview e Trigger */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 justify-start gap-2 h-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div 
            className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-mono">{value.toUpperCase()}</span>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Pipette className="w-4 h-4" />
        </Button>
      </div>

      {/* Dropdown Picker */}
      {isOpen && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 shadow-lg space-y-4">
          
          {/* Palette Predefinita */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Suggested Colors
            </h4>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePredefinedColorClick(color)}
                  className={`
                    w-8 h-8 rounded-md border-2 transition-transform hover:scale-110 flex items-center justify-center
                    ${value.toUpperCase() === color.toUpperCase() 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {value.toUpperCase() === color.toUpperCase() && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hex Input */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Custom Color
            </h4>
            <Input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              placeholder="#3B82F6"
              className="font-mono"
              maxLength={7}
            />
          </div>

          {/* Color Picker Completo */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Color Picker
            </h4>
            <HexColorPicker 
              color={value} 
              onChange={handleColorChange}
              style={{ width: '100%' }}
            />
          </div>

          {/* Preview con contrasto */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Preview
            </h4>
            <div 
              className="p-4 rounded-lg text-center font-medium"
              style={{ 
                backgroundColor: value,
                color: getContrastColor(value)
              }}
            >
              Department Name
            </div>
          </div>

          {/* Pulsante Done */}
          <Button
            type="button"
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper per calcolare colore testo con contrasto
function getContrastColor(hexColor: string): string {
  // Rimuovi # se presente
  const hex = hexColor.replace('#', '');
  
  // Converti in RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcola luminosità
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Ritorna nero o bianco in base alla luminosità
  return brightness > 128 ? '#000000' : '#FFFFFF';
}
