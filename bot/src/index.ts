import { createServer } from 'http'

const BOT_ENABLED = process.env.BOT_ENABLED === 'true'
const PORT = Number(process.env.PORT ?? 8080)

function startHealthServer(status: 'disabled' | 'ok' | 'stalled', extra: Record<string, unknown> = {}) {
  createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      const healthy = status !== 'stalled'
      res.writeHead(healthy ? 200 : 503, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status,
        botEnabled: BOT_ENABLED,
        uptimeSeconds: Math.round(process.uptime()),
        ...extra,
      }))
    } else {
      res.writeHead(404)
      res.end()
    }
  }).listen(PORT, () => console.log(`🩺 Health server listening on :${PORT}`))
}

async function main() {
  if (!BOT_ENABLED) {
    console.log('⏸️  Africa Monthly Bot is INACTIVE (BOT_ENABLED != true). Telegram polling disabled.')
    console.log('   Points are granted manually via the admin panel.')
    startHealthServer('disabled')
    return
  }

  const { startBot } = await import('./bot.js')
  await startBot()
}

main().catch((err) => {
  console.error('Fatal bot error:', err)
  process.exit(1)
})