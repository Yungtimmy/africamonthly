import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getBaseUrl(req: Request): string {
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  return (process.env.NEXTAUTH_URL ?? '').replace(/\/+$/, '')
}

export async function GET(req: Request) {
  const base = getBaseUrl(req)
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError || !code) {
    console.error('Twitter OAuth denied:', oauthError, searchParams.get('error_description'))
    return NextResponse.redirect(`${base}/profile?error=twitter_denied`)
  }

  // Read cookies
  const cookieHeader = req.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
    const [k, ...v] = c.trim().split('=')
    return [k, decodeURIComponent(v.join('='))]
  }))

  const storedState = cookies['tw_state']
  const codeVerifier = cookies['tw_verifier']
  const userId = cookies['tw_user_id']
  // Reuse the exact redirect_uri sent during authorize (must match for token exchange)
  const redirectUri = cookies['tw_redirect'] || `${base}/api/auth/twitter/callback`

  if (!storedState || storedState !== state || !codeVerifier || !userId) {
    console.error('Twitter OAuth state/cookie mismatch', { hasState: !!storedState, match: storedState === state, hasVerifier: !!codeVerifier, hasUser: !!userId })
    return NextResponse.redirect(`${base}/profile?error=twitter_invalid`)
  }

  // Exchange code for token — Native App (public client): client_id in body, no Basic Auth
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error('Twitter token exchange failed:', tokenRes.status, errBody)
    return NextResponse.redirect(`${base}/profile?error=twitter_token`)
  }

  const { access_token } = await tokenRes.json() as { access_token: string }

  // Fetch Twitter user
  const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=username', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    const errBody = await userRes.text()
    console.error('Twitter user fetch failed:', userRes.status, errBody)
    return NextResponse.redirect(`${base}/profile?error=twitter_user`)
  }

  const { data: twitterUser } = await userRes.json() as { data: { username: string } }

  await supabase.from('users').update({
    twitter: `@${twitterUser.username}`,
  }).eq('id', userId)

  const res = NextResponse.redirect(`${base}/profile?twitter=connected`)
  res.cookies.delete('tw_verifier')
  res.cookies.delete('tw_state')
  res.cookies.delete('tw_user_id')
  res.cookies.delete('tw_redirect')
  return res
}
