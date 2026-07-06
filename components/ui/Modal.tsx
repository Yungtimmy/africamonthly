'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[40] flex items-center justify-center p-4 bg-[#0A0F1E]/80 backdrop-blur-md"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Glow behind modal */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-96 h-96 rounded-full bg-[#00D4FF]/5 blur-[80px]" />
      </div>
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl z-[50] flex flex-col max-h-[90vh]',
          'bg-[#0D1525]/90 border border-[#00D4FF]/20 shadow-[0_0_40px_rgba(0,212,255,0.1),0_25px_60px_rgba(0,0,0,0.6)]',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Top accent line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#00D4FF]/60 to-transparent shrink-0" />
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h2 id="modal-title" className="font-serif text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {/* Scrollable body — keeps header sticky and lets long content scroll inside the modal
             instead of stretching past the viewport on small/PC screens. */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  )
}
