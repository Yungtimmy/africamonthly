'use client'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'

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
  const [widgetLoaded, setWidgetLoaded] = useState(false)

  useEffect(() => {
    if (!ref.current || !botName || botName === 'YourBotName') return

    ;(window as unknown as Record<string, unknown>).onTelegramAuth = (user: TelegramUser) => {
      onAuth(user)
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    script.onload = () => setWidgetLoaded(true)
    ref.current.appendChild(script)

    return () => {
      delete (window as unknown as Record<string, unknown>).onTelegramAuth
    }
  }, [botName, onAuth])

  const hasBotName = botName && botName !== 'YourBotName'

  if (connected) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/20">
        <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
        <span className="text-sm text-[#00D4FF] font-medium flex-1">
          {connectedName ?? 'Telegram connected'}
        </span>
        {hasBotName && <div ref={ref} className="scale-75 origin-right" />}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {hasBotName ? (
        <div ref={ref} className="min-h-[44px]" />
      ) : (
        <a
          href={`https://t.me/${botName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/20 hover:bg-[#00D4FF]/10 transition-all group"
        >
          <MessageCircle size={18} className="text-[#00D4FF]" />
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Connect Telegram</p>
            <p className="text-xs text-white/30">Click to open the bot, then send /start</p>
          </div>
          <span className="text-xs text-[#00D4FF] opacity-60 group-hover:opacity-100">Open →</span>
        </a>
      )}
      {hasBotName && !widgetLoaded && (
        <p className="text-xs text-white/20 italic">Loading Telegram button...</p>
      )}
    </div>
  )
}
