import Link from 'next/link'
import { ChangeBadge } from '@/components/ui/Badge'

interface MoverCard {
  slug: string
  generic_name: string
  dosage_form: string
  strength: string
  last_price: number
  change_pct: number
  deals_today: number
}

export function MoverCards({ drugs }: { drugs: MoverCard[] }) {
  return (
    <div className="grid grid-cols-4 gap-px bg-border rounded overflow-hidden border border-border">
      {drugs.map(drug => (
        <Link key={drug.slug} href={`/drug/${drug.slug}`}
          className="bg-surface hover:bg-surface2 transition-colors p-5 group">
          <div className="text-sm font-semibold text-text leading-tight">{drug.generic_name}</div>
          <div className="text-xs text-muted mt-0.5">{drug.strength} · {drug.dosage_form}</div>
          <div className="mt-4 text-2xl font-bold text-text tracking-tight">
            {Number(drug.last_price).toFixed(2)}
            <span className="text-xs text-muted font-normal ml-1">KES</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <ChangeBadge pct={Number(drug.change_pct)} />
            <span className="text-xs text-muted">{drug.deals_today} deals</span>
          </div>
          <div className={`h-0.5 mt-3 rounded ${Number(drug.change_pct) >= 0 ? 'bg-green/30' : 'bg-red/30'}`} />
        </Link>
      ))}
    </div>
  )
}
