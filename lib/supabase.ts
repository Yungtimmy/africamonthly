import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side admin client (bypasses RLS) — only used in API routes / server components.
// Lazy singleton so the module can be imported at build time without crashing when
// env vars are not present during static page data collection.

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase env vars')
    _supabase = createClient(url, key, { auth: { persistSession: false } })
  }
  return _supabase
}

// Convenience proxy — behaves like the old `supabase` export but initialises on first use.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
