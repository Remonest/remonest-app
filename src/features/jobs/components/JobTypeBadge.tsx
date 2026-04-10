import { Badge } from '@/components/ui/badge';
import type { JobType } from '@/features/jobs/types/job';
import { getJobTypeLabel } from '@/features/jobs/utils/formatters';

interface JobTypeBadgeProps {
  type: JobType | null | undefined;
}

export function JobTypeBadge({ type }: JobTypeBadgeProps) {
  if (!type) return null;

  const colors: Record<JobType, { bg: string; text: string; hover: string }> = {
    'full-time': {
      bg: 'bg-[#0891b2]/10',
      text: 'text-[#0891b2]',
      hover: 'hover:bg-[#0891b2]/20',
    },
    'part-time': {
      bg: 'bg-[#0d9488]/10',
      text: 'text-[#0d9488]',
      hover: 'hover:bg-[#0d9488]/20',
    },
    'project': {
      bg: 'bg-[#f97316]/10',
      text: 'text-[#f97316]',
      hover: 'hover:bg-[#f97316]/20',
    },
    'freelance': {
      bg: 'bg-[#8b5cf6]/10',
      text: 'text-[#8b5cf6]',
      hover: 'hover:bg-[#8b5cf6]/20',
    },
  };

  const color = colors[type];

  return (
    <Badge
      variant="secondary"
      className={`${color.bg} ${color.text} ${color.hover} font-medium transition-colors`}
    >
      {getJobTypeLabel(type)}
    </Badge>
  );
}
