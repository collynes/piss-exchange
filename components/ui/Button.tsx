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
        'btn disabled:opacity-50',
        size === 'sm' ? 'btn-sm' : '',
        variant === 'primary' && 'btn-primary',
        variant === 'ghost' && 'btn-outline-secondary',
        variant === 'danger' && 'btn-danger',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
