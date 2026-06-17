import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const base = process.env.NEXTAUTH_URL!

  if (error || !code) {
    return NextResponse.redirect(`${base}/profile?error=twitter_denied`)
  }

  // Read cookies
  const cookieHeader = req.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
    const [k, ...v] = c.trim().split('=')
    return [k, v.join('=')]
  }))

  const storedState = cookies['tw_state']
  const codeVerifier = cookies['tw_verifier']
  const userId = cookies['tw_user_id']

  if (!storedState || storedState !== state || !codeVerifier || !userId) {
    return NextResponse.redirect(`${base}/profile?error=twitter_invalid`)
  }

  // Exchange code for token
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${base}/api/auth/twitter/callback`,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${base}/profile?error=twitter_token`)
  }

  const { access_token } = await tokenRes.json() as { access_token: string }

  // Fetch Twitter user
  const userRes = await fetch('https://api.twitter.com/2/users/me?user.fields=username', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(`${base}/profile?error=twitter_user`)
  }

  const { data: twitterUser } = await userRes.json() as { data: { username: string } }

  // Save to DB
  await supabase.from('users').update({
    twitter: `@${twitterUser.username}`,
  }).eq('id', userId)

  const res = NextResponse.redirect(`${base}/profile?twitter=connected`)
  res.cookies.delete('tw_verifier')
  res.cookies.delete('tw_state')
  res.cookies.delete('tw_user_id')
  return res
}
