import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  DEPARTMENT_ICON_CATEGORIES, 
  ICON_COMPONENTS, 
  DEFAULT_DEPARTMENT_ICON,
  getAllAvailableIcons 
} from '../utils/departmentIcons';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  previewColor?: string;
}

export function IconPicker({ value, onChange, previewColor = '#6B7280' }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filtra icone in base alla ricerca
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return DEPARTMENT_ICON_CATEGORIES;
    }

    const query = searchQuery.toLowerCase();
    return DEPARTMENT_ICON_CATEGORIES.map(category => ({
      ...category,
      icons: category.icons.filter(icon => 
        icon.toLowerCase().includes(query) ||
        category.label.toLowerCase().includes(query)
      )
    })).filter(category => category.icons.length > 0);
  }, [searchQuery]);

  const SelectedIcon = ICON_COMPONENTS[value] || ICON_COMPONENTS[DEFAULT_DEPARTMENT_ICON];

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Icon</Label>
      
      {/* Preview e Trigger */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 h-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <SelectedIcon className="w-4 h-4 flex-shrink-0" style={{ color: previewColor }} />
          <span className="text-sm truncate">{value || DEFAULT_DEPARTMENT_ICON}</span>
        </Button>
        
        {isOpen && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Dropdown Picker */}
      {isOpen && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 shadow-lg min-w-[500px]">
          {/* Barra di ricerca */}
          <div className="mb-4 relative flex items-center">
            <Search className="absolute left-4 w-8 h-5 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
              style={{ paddingLeft: '2rem' }}
            />
          </div>

          {/* Tabs per categorie */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {filteredCategories.map(category => (
                <TabsTrigger 
                  key={category.name} 
                  value={category.name}
                  className="text-xs"
                >
                  {category.label.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-4 h-64 overflow-y-auto pr-2">
              {/* Tab All - mostra tutte le categorie */}
              <TabsContent value="all" className="mt-0 space-y-6">
                {filteredCategories.map(category => (
                  <div key={category.name}>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {category.label}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {category.icons.map(iconName => {
                        const IconComponent = ICON_COMPONENTS[iconName];
                        const isSelected = value === iconName;
                        const buttonClass = isSelected 
                          ? 'p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                          : 'p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center';
                        
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => handleIconSelect(iconName)}
                            className={buttonClass}
                            title={iconName}
                          >
                            <IconComponent 
                              className="w-5 h-5" 
                              style={{ color: isSelected ? previewColor : 'currentColor' }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {filteredCategories.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-8">
                    No icons found matching "{searchQuery}"
                  </div>
                )}
              </TabsContent>

              {/* Tab per ogni categoria */}
              {filteredCategories.map(category => (
                <TabsContent key={category.name} value={category.name} className="mt-0">
                  <div className="flex flex-wrap gap-2">
                    {category.icons.map(iconName => {
                      const IconComponent = ICON_COMPONENTS[iconName];
                      const isSelected = value === iconName;
                      const buttonClass = isSelected 
                        ? 'p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                        : 'p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center';
                      
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => handleIconSelect(iconName)}
                          className={buttonClass}
                          title={iconName}
                        >
                          <IconComponent 
                            className="w-5 h-5" 
                            style={{ color: isSelected ? previewColor : 'currentColor' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}
