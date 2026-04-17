import { Sparkles, User } from 'lucide-react';

interface AiBadgeProps {
  ai: boolean | undefined;
  size?: 'sm' | 'md';
}

export default function AiBadge({ ai, size = 'md' }: AiBadgeProps) {
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${padding} text-[10px] font-medium uppercase tracking-wider ${
        ai
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border bg-muted text-muted-foreground'
      }`}
    >
      {ai ? (
        <>
          <Sparkles className="w-3 h-3" />
          AI
        </>
      ) : (
        <>
          <User className="w-3 h-3" />
          Manual
        </>
      )}
    </span>
  );
}
