import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-semibold rounded transition-colors disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        variant === 'primary' && 'bg-blue text-white hover:bg-blue/90',
        variant === 'ghost' && 'bg-transparent text-muted border border-border2 hover:text-white',
        variant === 'danger' && 'bg-red/10 text-red border border-red/30 hover:bg-red/20',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
