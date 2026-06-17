import { CheckCircle2, Clock, XCircle } from 'lucide-react'
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
    icon: <Clock size={14} className="text-yellow-400" />,
    label: 'Pending review',
    badgeVariant: 'pending' as const,
  },
  approved: {
    icon: <CheckCircle2 size={14} className="text-emerald-400" />,
    label: 'Approved',
    badgeVariant: 'approved' as const,
  },
  rejected: {
    icon: <XCircle size={14} className="text-red-400" />,
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
        'bg-[#111111] border rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200',
        isDone
          ? 'border-emerald-800/30 opacity-70'
          : 'border-[#2A2A2A] hover:border-[#D4A017]/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-semibold text-[#F5F0E8] leading-snug flex-1">
          {task.title}
        </h3>
        <Badge variant="points">+{task.points} pts</Badge>
      </div>

      <p className="text-sm text-[#A09070] leading-relaxed flex-1">{task.description}</p>

      <div className="flex items-center justify-between mt-auto pt-2">
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
          <p className="text-xs text-[#5A5040]">Sign in to submit</p>
        )}
      </div>
    </article>
  )
}
