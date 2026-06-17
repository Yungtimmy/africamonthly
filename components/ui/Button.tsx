'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#D4A017] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          {
            'bg-[#D4A017] text-black hover:bg-[#E8B94F] active:scale-[0.98]':
              variant === 'primary',
            'border border-[#D4A017]/30 text-[#D4A017] hover:bg-[#D4A017]/10':
              variant === 'ghost',
            'border border-[#2A2A2A] text-[#F5F0E8] hover:border-[#D4A017]/50':
              variant === 'outline',
            'bg-red-600 text-white hover:bg-red-500': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm min-h-[36px]': size === 'sm',
            'px-5 py-2.5 text-sm min-h-[44px]': size === 'md',
            'px-7 py-3 text-base min-h-[52px]': size === 'lg',
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
