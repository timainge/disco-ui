import { cn } from '@/lib/utils';

export function ProgressBar({ progress, className }: { progress: number, className?: string }) {
  return (
    <div className={cn("h-2 bg-muted rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-primary transition-all duration-300 ease-in-out" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
