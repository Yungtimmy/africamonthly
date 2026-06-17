'use client'
import { useEffect, useRef } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramLoginProps {
  botName: string
  onAuth: (user: TelegramUser) => void
  connected?: boolean
  connectedName?: string
}

export function TelegramLogin({ botName, onAuth, connected, connectedName }: TelegramLoginProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    // Expose callback globally
    ;(window as unknown as Record<string, unknown>).onTelegramAuth = (user: TelegramUser) => {
      onAuth(user)
    }
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'medium')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    ref.current.appendChild(script)
    return () => {
      delete (window as unknown as Record<string, unknown>).onTelegramAuth
    }
  }, [botName, onAuth])

  if (connected) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/20">
        <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
        <span className="text-sm text-[#00D4FF] font-medium">{connectedName ?? 'Connected'}</span>
        <div ref={ref} className="ml-auto scale-90 origin-right" />
      </div>
    )
  }

  return <div ref={ref} />
}
