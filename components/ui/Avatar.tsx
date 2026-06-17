import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name: string) {
  return name
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

const sizes = { sm: 32, md: 40, lg: 56 }

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const px = sizes[size]
  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#8A6810] text-[#F5F0E8] font-semibold',
        {
          'w-8 h-8 text-xs': size === 'sm',
          'w-10 h-10 text-sm': size === 'md',
          'w-14 h-14 text-base': size === 'lg',
        },
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name} width={px} height={px} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
