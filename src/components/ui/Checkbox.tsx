import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CheckboxProps {
  label: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}

export function Checkbox({ label, icon, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
        checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background group-hover:border-primary/50'
      }`}>
        {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
      </div>
      {/* Hidden input for accessibility */}
      <input 
        type="checkbox" 
        className="sr-only" 
        checked={checked} 
        onChange={onChange} 
      />
      <span className="flex items-center font-medium text-sm">
        {icon}
        {label}
      </span>
    </label>
  );
}
