'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ResetMonthButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleReset() {
    setResetting(true)
    try {
      const res = await fetch('/api/admin/reset-month', { method: 'POST' })
      if (res.ok) {
        setDone(true)
        // Refresh the server-rendered dashboard so the stat cards update
        router.refresh()
        setTimeout(() => {
          setOpen(false)
          setDone(false)
        }, 2000)
      } else {
        alert('Failed to reset month. Please try again.')
      }
    } finally {
      setResetting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
      >
        <RotateCcw size={14} />
        Reset Month
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0D1525] border border-white/10 p-7 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
              <X size={18} />
            </button>

            {done ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw size={20} className="text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium">Monthly points reset successfully.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-white">Reset Monthly Points</h3>
                    <p className="text-xs text-white/30">This cannot be undone</p>
                  </div>
                </div>

                <p className="text-sm text-white/60 mb-6">
                  This will set <span className="text-white font-medium">all users&apos; monthly points to 0</span>. Total (all-time) points are not affected. Use this at the start of each new month.
                </p>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex-1 py-2 px-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    {resetting ? 'Resetting...' : 'Yes, Reset Month'}
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
