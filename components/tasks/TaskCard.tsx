import { CheckCircle2, Clock, XCircle, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: {
    _id: { toString(): string }
    title: string
    description: string
    points: number
  }
  submissionStatus: string | null
  isLoggedIn: boolean
  onSubmit: () => void
}

const statusConfig = {
  pending: {
    icon: <Clock size={13} className="text-amber-400" />,
    label: 'Pending review',
    badgeVariant: 'pending' as const,
  },
  approved: {
    icon: <CheckCircle2 size={13} className="text-emerald-400" />,
    label: 'Approved',
    badgeVariant: 'approved' as const,
  },
  rejected: {
    icon: <XCircle size={13} className="text-red-400" />,
    label: 'Rejected',
    badgeVariant: 'rejected' as const,
  },
}

export function TaskCard({ task, submissionStatus, isLoggedIn, onSubmit }: TaskCardProps) {
  const status = submissionStatus as keyof typeof statusConfig | null
  const isDone = status === 'approved'

  return (
    <article
      className={cn(
        'relative rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 overflow-hidden backdrop-blur-sm group cursor-default',
        isDone
          ? 'bg-emerald-900/5 border border-emerald-800/20 opacity-60'
          : 'bg-white/3 border border-white/8 hover:border-[#00D4FF]/30 hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(0,212,255,0.06)]'
      )}
    >
      {/* Top line glow */}
      {!isDone && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-white leading-snug flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/25 shrink-0">
          <Zap size={11} className="text-[#D4A017]" />
          <span className="text-xs font-bold text-[#D4A017]">+{task.points}</span>
        </div>
      </div>

      <p className="text-sm text-white/40 leading-relaxed flex-1">{task.description}</p>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        {status ? (
          <div className="flex items-center gap-2">
            {statusConfig[status]?.icon}
            <Badge variant={statusConfig[status]?.badgeVariant ?? 'default'}>
              {statusConfig[status]?.label}
            </Badge>
          </div>
        ) : isLoggedIn ? (
          <Button onClick={onSubmit} size="sm" disabled={isDone}>
            Submit Proof
          </Button>
        ) : (
          <p className="text-xs text-white/20">Sign in to submit</p>
        )}
      </div>
    </article>
  )
}
