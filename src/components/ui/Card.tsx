import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-card text-card-foreground border border-border rounded-lg shadow-sm", className)} {...props} />
  );
}
