import {
  Building2, Briefcase, TrendingUp, PieChart, BarChart3, Target,
  Wrench, Settings, Cpu, HardDrive, Wifi, Server, Code, Terminal,
  Heart, Activity, Stethoscope, Pill, Syringe, Hospital,
  GraduationCap, BookOpen, School, Award, Library, Pencil,
  Mail, Phone, MessageSquare, Headphones, Send, Radio,
  Truck, Car, Package, Plane, Ship, MapPin,
  DollarSign, CreditCard, Wallet, Calculator, TrendingDown, Receipt,
  Users, User, UserCheck, Contact, UserPlus, Shield,
  Palette, Camera, Film, Music, Image, Sparkles,
  Lock, Key, Eye, ShieldCheck, AlertTriangle, ShieldAlert,
  Home, Store, ShoppingCart, Tag, Gift, Percent,
  Globe, Leaf, Lightbulb, Zap, Flame, Sun,
  FileText, Folder, Archive, Database, HardDriveDownload, Cloud,
  Clock, Calendar, Timer, AlarmClock, Hourglass, Watch,
  Star, Heart as HeartIcon, Flag, Bookmark, Award as Trophy, Medal,
  Hammer, Scissors, Ruler, Paintbrush, Pipette
} from 'lucide-react';

export interface IconCategory {
  name: string;
  label: string;
  icons: string[];
}

// Set curato di icone categorizzate per i dipartimenti
export const DEPARTMENT_ICON_CATEGORIES: IconCategory[] = [
  {
    name: 'business',
    label: 'Business & Management',
    icons: ['Building2', 'Briefcase', 'TrendingUp', 'PieChart', 'BarChart3', 'Target']
  },
  {
    name: 'technical',
    label: 'Technical & IT',
    icons: ['Wrench', 'Settings', 'Cpu', 'HardDrive', 'Wifi', 'Server', 'Code', 'Terminal']
  },
  {
    name: 'healthcare',
    label: 'Healthcare & Medical',
    icons: ['Heart', 'Activity', 'Stethoscope', 'Pill', 'Syringe', 'Hospital']
  },
  {
    name: 'education',
    label: 'Education & Training',
    icons: ['GraduationCap', 'BookOpen', 'School', 'Award', 'Library', 'Pencil']
  },
  {
    name: 'communication',
    label: 'Communication & Support',
    icons: ['Mail', 'Phone', 'MessageSquare', 'Headphones', 'Send', 'Radio']
  },
  {
    name: 'transport',
    label: 'Transport & Logistics',
    icons: ['Truck', 'Car', 'Package', 'Plane', 'Ship', 'MapPin']
  },
  {
    name: 'finance',
    label: 'Finance & Accounting',
    icons: ['DollarSign', 'CreditCard', 'Wallet', 'Calculator', 'TrendingDown', 'Receipt']
  },
  {
    name: 'people',
    label: 'People & HR',
    icons: ['Users', 'User', 'UserCheck', 'Contact', 'UserPlus', 'Shield']
  },
  {
    name: 'creative',
    label: 'Creative & Media',
    icons: ['Palette', 'Camera', 'Film', 'Music', 'Image', 'Sparkles']
  },
  {
    name: 'security',
    label: 'Security & Safety',
    icons: ['Lock', 'Key', 'Eye', 'ShieldCheck', 'AlertTriangle', 'ShieldAlert']
  },
  {
    name: 'retail',
    label: 'Retail & Sales',
    icons: ['Home', 'Store', 'ShoppingCart', 'Tag', 'Gift', 'Percent']
  },
  {
    name: 'general',
    label: 'General Purpose',
    icons: ['Globe', 'Leaf', 'Lightbulb', 'Zap', 'Flame', 'Sun']
  },
  {
    name: 'data',
    label: 'Data & Storage',
    icons: ['FileText', 'Folder', 'Archive', 'Database', 'HardDriveDownload', 'Cloud']
  },
  {
    name: 'time',
    label: 'Time & Scheduling',
    icons: ['Clock', 'Calendar', 'Timer', 'AlarmClock', 'Hourglass', 'Watch']
  },
  {
    name: 'favorites',
    label: 'Favorites & Priority',
    icons: ['Star', 'Heart', 'Flag', 'Bookmark', 'Award', 'Medal']
  },
  {
    name: 'tools',
    label: 'Tools & Maintenance',
    icons: ['Wrench', 'Hammer', 'Scissors', 'Ruler', 'Paintbrush', 'Pipette']
  }
];

// Mappa di tutte le icone disponibili
export const ICON_COMPONENTS: Record<string, any> = {
  Building2, Briefcase, TrendingUp, PieChart, BarChart3, Target,
  Wrench, Settings, Cpu, HardDrive, Wifi, Server, Code, Terminal,
  Heart, Activity, Stethoscope, Pill, Syringe, Hospital,
  GraduationCap, BookOpen, School, Award, Library, Pencil,
  Mail, Phone, MessageSquare, Headphones, Send, Radio,
  Truck, Car, Package, Plane, Ship, MapPin,
  DollarSign, CreditCard, Wallet, Calculator, TrendingDown, Receipt,
  Users, User, UserCheck, Contact, UserPlus, Shield,
  Palette, Camera, Film, Music, Image, Sparkles,
  Lock, Key, Eye, ShieldCheck, AlertTriangle, ShieldAlert,
  Home, Store, ShoppingCart, Tag, Gift, Percent,
  Globe, Leaf, Lightbulb, Zap, Flame, Sun,
  FileText, Folder, Archive, Database, HardDriveDownload, Cloud,
  Clock, Calendar, Timer, AlarmClock, Hourglass, Watch,
  Star, Flag, Bookmark, Medal,
  Hammer, Scissors, Ruler, Paintbrush, Pipette
};

// Icona di default per dipartimenti senza icona specificata
export const DEFAULT_DEPARTMENT_ICON = 'Building2';

// Ottieni lista piatta di tutte le icone disponibili
export const getAllAvailableIcons = (): string[] => {
  return DEPARTMENT_ICON_CATEGORIES.flatMap(category => category.icons);
};

// Trova categoria di un'icona
export const getIconCategory = (iconName: string): string | null => {
  const category = DEPARTMENT_ICON_CATEGORIES.find(cat => 
    cat.icons.includes(iconName)
  );
  return category?.name || null;
};
