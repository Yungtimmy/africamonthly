import { CheckCircle2, Clock, XCircle, Zap, Hourglass } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { OEmbedPreview } from '@/components/ui/OEmbedPreview'
import { formatXActionsLabel } from '@/lib/points'
import { useCountdown, urgencyClasses } from '@/lib/expiry'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    points: number
    task_type?: string
    x_post_url?: string | null
    x_actions?: string[] | null
    expires_at?: string | null
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
  const isXPost = task.task_type === 'x_post'
  const { remaining, urgency } = useCountdown(task.expires_at)

  return (
    <article
      className={cn(
        'relative rounded-2xl p-5 sm:p-6 flex flex-col gap-4 transition-all duration-200 overflow-hidden backdrop-blur-sm group',
        isDone
          ? 'bg-emerald-900/5 border border-emerald-800/20 opacity-60'
          : 'bg-white/3 border border-white/8 hover:border-[#00D4FF]/30 hover:bg-white/5'
      )}
    >
      {/* Live countdown chip — top-right, only for unfinished/not-yet-approved tasks. */}
      {!isDone && task.expires_at && (
        <div
          className={cn(
            'absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-sm',
            urgencyClasses(urgency)
          )}
          title={`Expires ${new Date(task.expires_at).toLocaleString()}`}
        >
          <Hourglass size={10} />
          {remaining === 'Expired' ? 'Expired' : `Expires in ${remaining}`}
        </div>
      )}

      {isXPost ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-lg leading-none">𝕏</span>
                <span className="text-white/60 text-sm font-medium">X / Twitter Task</span>
              </div>
              {task.x_actions && task.x_actions.length > 0 && (
                <p className="text-sm text-[#00D4FF] font-medium">{formatXActionsLabel(task.x_actions)}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4A017]/10 border border-[#D4A017]/25 shrink-0">
              <Zap size={11} className="text-[#D4A017]" />
              <span className="text-xs font-bold text-[#D4A017]">+{task.points}</span>
            </div>
          </div>

          {task.x_post_url && (
            <div className="space-y-2">
              <OEmbedPreview url={task.x_post_url} />
              <a
                href={task.x_post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-[#00D4FF] transition-colors"
              >
                Open on X →
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}

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