import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface VerificationBadgeProps {
  showText?: boolean;
  size?: 'sm' | 'md';
}

export function VerificationBadge({ showText = false, size = 'md' }: VerificationBadgeProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <Badge
      variant="secondary"
      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    >
      <CheckCircle2 className={`${iconSize} mr-1 flex-shrink-0`} />
      {showText && <span className={`${textSize} font-medium`}>Terverifikasi Admin</span>}
    </Badge>
  );
}
