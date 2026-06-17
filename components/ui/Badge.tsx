import { cn } from '@/lib/utils'

type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'points' | 'inj' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm',
        {
          'bg-white/5 border border-white/10 text-white/50': variant === 'default',
          'bg-amber-500/10 border border-amber-400/30 text-amber-300': variant === 'pending',
          'bg-emerald-500/10 border border-emerald-400/30 text-emerald-300': variant === 'approved',
          'bg-red-500/10 border border-red-400/30 text-red-300': variant === 'rejected',
          'bg-[#D4A017]/10 border border-[#D4A017]/40 text-[#D4A017]': variant === 'points',
          'bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF]': variant === 'inj',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
