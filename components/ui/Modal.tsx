'use client'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1}>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal-dialog modal-dialog-centered">
      <div className={cn('modal-content bg-white text-body', className)}>
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button type="button" onClick={onClose} className="btn-close" aria-label="Close" />
        </div>
        <div className="modal-body">{children}</div>
      </div>
      </div>
    </div>
  )
}
