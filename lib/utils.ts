import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-KE').format(n)
}

export function formatChange(pct: number): string {
  const sign = pct > 0 ? '▲' : pct < 0 ? '▼' : ''
  return `${sign} ${Math.abs(pct).toFixed(2)}%`
}

export function changeClass(pct: number): string {
  if (pct > 0) return 'text-green'
  if (pct < 0) return 'text-red'
  return 'text-muted'
}

export function changeBadgeClass(pct: number): string {
  if (pct > 0) return 'bg-green/10 text-green'
  if (pct < 0) return 'bg-red/10 text-red'
  return 'bg-muted/10 text-muted'
}
