import React from 'react';
import { Department } from '../types/email';
import { getDepartmentIcon, getDepartmentColorSafe, getDepartmentColor } from './colors';

interface DepartmentIconProps {
  department: Department | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente helper per renderizzare icone di dipartimento in modo consistente
 */
export function DepartmentIcon({ department, className, size = 'md' }: DepartmentIconProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  const Icon = getDepartmentIcon(department);
  const color = typeof department === 'string' 
    ? getDepartmentColor(department)
    : getDepartmentColorSafe(department);

  return (
    <Icon 
      className={className || sizeClass} 
      style={{ color }}
    />
  );
}

/**
 * Badge con icona e nome dipartimento
 */
interface DepartmentBadgeProps {
  department: Department | string;
  showName?: boolean;
  size?: 'sm' | 'md';
}

export function DepartmentBadge({ department, showName = true, size = 'md' }: DepartmentBadgeProps) {
  const Icon = getDepartmentIcon(department);
  const color = typeof department === 'string' 
    ? getDepartmentColor(department)
    : getDepartmentColorSafe(department);
  const name = typeof department === 'string' ? department : department.nome;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5'
  }[size];

  const iconSizeClass = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  }[size];

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{ 
        backgroundColor: `${color}20`,
        border: `1px solid ${color}`,
        color: color
      }}
    >
      <Icon className={iconSizeClass} style={{ color }} />
      {showName && <span>{name}</span>}
    </span>
  );
}
