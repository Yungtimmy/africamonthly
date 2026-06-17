'use client'
import { useState } from 'react'
import { Wallet } from 'lucide-react'

interface KeplrConnectProps {
  currentAddress?: string
  onConnect: (address: string) => void
}

export function KeplrConnect({ currentAddress, onConnect }: KeplrConnectProps) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function connect() {
    setError(null)
    setConnecting(true)
    try {
      const keplr = (window as unknown as { keplr?: { enable: (chain: string) => Promise<void>; getOfflineSigner: (chain: string) => { getAccounts: () => Promise<Array<{ address: string }>> } } }).keplr
      if (!keplr) {
        setError('Keplr extension not found. Install it from keplr.app')
        return
      }
      await keplr.enable('injective-1')
      const signer = keplr.getOfflineSigner('injective-1')
      const accounts = await signer.getAccounts()
      const address = accounts[0]?.address
      if (address) onConnect(address)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  const inputClass = 'w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:border-[#00D4FF]/40 focus:outline-none focus:bg-white/6 transition-all duration-200'

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={currentAddress ?? ''}
          readOnly
          placeholder="Not connected"
          className={`${inputClass} font-mono flex-1`}
        />
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] text-sm font-medium hover:bg-[#D4A017]/20 transition-all disabled:opacity-50 shrink-0"
        >
          <Wallet size={14} />
          {connecting ? 'Connecting...' : currentAddress ? 'Reconnect' : 'Connect Keplr'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
