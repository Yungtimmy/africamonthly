import { cn } from '@/lib/utils'

type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'points' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
        {
          'bg-[#111111] border border-[#2A2A2A] text-[#A09070]': variant === 'default',
          'bg-yellow-900/40 border border-yellow-700/50 text-yellow-300': variant === 'pending',
          'bg-emerald-900/40 border border-emerald-700/50 text-emerald-300': variant === 'approved',
          'bg-red-900/40 border border-red-700/50 text-red-300': variant === 'rejected',
          'bg-[#D4A017]/20 border border-[#D4A017]/40 text-[#D4A017]': variant === 'points',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
