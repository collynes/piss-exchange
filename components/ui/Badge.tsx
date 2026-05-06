import { cn, changeBadgeClass } from '@/lib/utils'

interface BadgeProps {
  pct: number
  className?: string
}

export function ChangeBadge({ pct, className }: BadgeProps) {
  const sign = pct > 0 ? '▲' : pct < 0 ? '▼' : ''
  return (
    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', changeBadgeClass(pct), className)}>
      {sign} {Math.abs(pct).toFixed(2)}%
    </span>
  )
}
