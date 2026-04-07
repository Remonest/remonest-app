import { Badge } from '@/components/ui/badge';
import type { JobStatus } from '@/lib/jobs/actions';
import { getStatusLabel } from '@/lib/jobs/actions';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors: Record<JobStatus, { bg: string; text: string; icon?: string }> = {
    draft: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-600 dark:text-gray-400',
      icon: 'file',
    },
    pending: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'clock',
    },
    approved: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'check',
    },
    rejected: {
      bg: 'bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
      icon: 'x',
    },
    published: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'check-circle',
    },
    expired: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      icon: 'alert-circle',
    },
  };

  const color = colors[status];
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <Badge variant="secondary" className={`${color.bg} ${color.text} ${textSize} font-medium`}>
      {getStatusLabel(status)}
    </Badge>
  );
}
