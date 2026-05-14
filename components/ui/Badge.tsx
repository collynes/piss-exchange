import { cn } from '@/lib/utils'

interface BadgeProps {
  pct: number
  className?: string
}

export function ChangeBadge({ pct, className }: BadgeProps) {
  const sign = pct > 0 ? '▲' : pct < 0 ? '▼' : ''
  return (
    <span className={cn('badge rounded-pill', pct >= 0 ? 'bg-label-success text-success' : 'bg-label-danger text-danger', className)}>
      {sign} {Math.abs(pct).toFixed(2)}%
    </span>
  )
}
