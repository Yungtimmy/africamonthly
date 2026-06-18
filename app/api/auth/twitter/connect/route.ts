import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { randomBytes, createHash } from 'crypto'

// Derive the real origin from the incoming request — avoids redirect_uri
// mismatches caused by a misconfigured NEXTAUTH_URL (trailing slash, wrong host, etc.)
function getBaseUrl(req: Request): string {
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  return (process.env.NEXTAUTH_URL ?? '').replace(/\/+$/, '')
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req)

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(`${baseUrl}/`)
  }

  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  const state = randomBytes(16).toString('hex')
  const redirectUri = `${baseUrl}/api/auth/twitter/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: 'tweet.read users.read',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  // Use x.com (current OAuth host) — twitter.com also works but x.com is canonical
  const res = NextResponse.redirect(`https://x.com/i/oauth2/authorize?${params.toString()}`)

  // Store verifier + state + the exact redirect_uri used, so the callback can reuse it
  const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax' as const, maxAge: 600, path: '/' }
  res.cookies.set('tw_verifier', codeVerifier, cookieOpts)
  res.cookies.set('tw_state', state, cookieOpts)
  res.cookies.set('tw_user_id', session.user.id, cookieOpts)
  res.cookies.set('tw_redirect', redirectUri, cookieOpts)

  return res
}
