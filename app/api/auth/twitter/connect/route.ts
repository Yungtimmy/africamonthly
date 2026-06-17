import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { randomBytes, createHash } from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL!))
  }

  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  const state = randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback`,
    scope: 'tweet.read users.read',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  const res = NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`)

  // Store verifier + state in cookies for callback verification
  res.cookies.set('tw_verifier', codeVerifier, { httpOnly: true, secure: true, maxAge: 600, path: '/' })
  res.cookies.set('tw_state', state, { httpOnly: true, secure: true, maxAge: 600, path: '/' })
  res.cookies.set('tw_user_id', session.user.id, { httpOnly: true, secure: true, maxAge: 600, path: '/' })

  return res
}
