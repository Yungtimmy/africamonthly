'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00D4FF] focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed',
          {
            // Injective cyan primary
            'bg-[#00D4FF] text-[#0A0F1E] hover:bg-[#33DDFF] active:scale-[0.98] shadow-[0_0_20px_rgba(0,212,255,0.35)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]':
              variant === 'primary',
            // Gold secondary
            'bg-[#D4A017] text-black hover:bg-[#E8B94F] active:scale-[0.98] shadow-[0_0_16px_rgba(212,160,23,0.3)]':
              variant === 'secondary',
            // Glass ghost
            'border border-[#00D4FF]/30 text-[#00D4FF] bg-[#00D4FF]/5 hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]/60 backdrop-blur-sm':
              variant === 'ghost',
            // Outline
            'border border-white/10 text-[#E8F0FE] bg-white/4 hover:border-white/20 hover:bg-white/8 backdrop-blur-sm':
              variant === 'outline',
            // Danger
            'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30':
              variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm min-h-[36px]': size === 'sm',
            'px-5 py-2.5 text-sm min-h-[44px]': size === 'md',
            'px-8 py-3.5 text-base min-h-[52px]': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
