import { Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { urgencyClasses, type Urgency } from '@/lib/expiry'

interface CountdownChipProps {
  urgency: Urgency
  remaining: string
  expiresAt: string
}

/**
 * Live countdown chip used in task card headers.
 *
 * The parent is responsible for calling `useCountdown(expiresAt)` and passing
 * the resulting `urgency` and `remaining`; this component is pure
 * presentation so the same styling is used wherever the chip is rendered
 * (currently TaskCard X-post and non-X branches). The parent must also gate
 * rendering on a non-null `expiresAt` (TaskCard uses `!isDone && task.expires_at`)
 * so an already-approved or never-expiring task does not show a countdown.
 */
export function CountdownChip({ urgency, remaining, expiresAt }: CountdownChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shrink-0',
        urgencyClasses(urgency)
      )}
      title={`Expires ${new Date(expiresAt).toLocaleString()}`}
    >
      <Hourglass size={10} />
      {remaining === 'Expired' ? 'Expired' : `Expires in ${remaining}`}
    </div>
  )
}
