'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { closeMonthChoices } from '@/lib/months'

export function ResetMonthButton() {
  const router = useRouter()
  const choices = closeMonthChoices()
  const recommended = choices.find((choice) => choice.recommended) ?? choices[0]
  const [open, setOpen] = useState(false)
  const [monthKey, setMonthKey] = useState(recommended.key)
  const [resetting, setResetting] = useState(false)
  const [doneLabel, setDoneLabel] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function close() {
    if (resetting) return
    setOpen(false)
    setError(null)
    setDoneLabel(null)
  }

  async function handleReset() {
    setResetting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/reset-month', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthKey }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const count = typeof data.finishers === 'number' ? data.finishers : 0
        const label = typeof data.label === 'string' ? data.label : 'That month'
        setDoneLabel(`${label} archived (${count} finisher${count === 1 ? '' : 's'}). Monthly points are now 0.`)
        router.refresh()
        setTimeout(() => {
          setOpen(false)
          setDoneLabel(null)
        }, 2400)
      } else {
        setError(typeof data.error === 'string' ? data.error : 'Failed to reset the month. Please try again.')
      }
    } catch {
      setError('Failed to reset the month. Please try again.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMonthKey(recommended.key)
          setError(null)
          setDoneLabel(null)
          setOpen(true)
        }}
        className="flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/20 transition-all"
      >
        <RotateCcw size={14} />
        Reset Month
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={close} />
          <div className="relative w-full max-w-md rounded-2xl glass-modal p-7" role="dialog" aria-modal="true" aria-labelledby="reset-month-title">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {doneLabel ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw size={20} className="text-emerald-400" />
                </div>
                <p className="text-emerald-300 font-medium">{doneLabel}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5 pr-10">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-red-300" />
                  </div>
                  <div>
                    <h3 id="reset-month-title" className="font-serif text-lg font-semibold text-white">Reset monthly points</h3>
                    <p className="text-xs text-white/65">Saves the full standings, then zeroes the month</p>
                  </div>
                </div>

                <p className="text-sm text-white/75 mb-4 leading-relaxed">
                  Everyone with monthly points is saved for the month you pick. The archive highlights the top 3 and keeps the full ranking. All-time points stay. In the first week, the board is usually still last month&apos;s.
                </p>

                <fieldset className="mb-4">
                  <legend className="text-sm font-medium text-white mb-2">Archive these standings as</legend>
                  <div className="space-y-2">
                    {choices.map((choice) => (
                      <label
                        key={choice.key}
                        className="flex items-center gap-3 min-h-[44px] px-3 rounded-xl glass-panel cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="archive-month"
                          value={choice.key}
                          checked={monthKey === choice.key}
                          onChange={() => setMonthKey(choice.key)}
                          className="accent-[#00D4FF]"
                        />
                        <span className="text-sm text-white">{choice.label}</span>
                        {choice.recommended && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4A017]">
                            Recommended
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>

                {error && <p className="text-sm text-red-300 mb-4">{error}</p>}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={close}>
                    Cancel
                  </Button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex-1 min-h-[44px] py-2 px-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    {resetting ? 'Resetting...' : 'Archive and reset'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
