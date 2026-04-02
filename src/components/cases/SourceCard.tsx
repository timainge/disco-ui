import React from 'react';

interface SourceCardProps {
  icon: React.ReactNode;
  title: string;
  selected: boolean;
  onClick: () => void;
}

export function SourceCard({ icon, title, selected, onClick }: SourceCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary' : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <div className={`mb-3 p-3 rounded-full ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <span className="font-medium">{title}</span>
    </div>
  );
}
