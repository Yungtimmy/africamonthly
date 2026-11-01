import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'
import { isCloseableMonth, labelForMonthKey } from '@/lib/months'

type SnapshotResult = {
  archived?: boolean
  reason?: string
  month_key?: string
  finishers?: number
}

function asSnapshotResult(data: unknown): SnapshotResult {
  if (typeof data === 'string') {
    try {
      return asSnapshotResult(JSON.parse(data))
    } catch {
      return {}
    }
  }
  if (data && typeof data === 'object') return data as SnapshotResult
  return {}
}

function isMissingSnapshotFunction(error: { code?: string; message?: string }): boolean {
  const message = (error.message ?? '').toLowerCase()
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  )
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let monthKey = ''
  try {
    const body = await req.json()
    monthKey = typeof body?.monthKey === 'string' ? body.monthKey : ''
  } catch {
    return NextResponse.json({ error: 'Choose a month to archive.' }, { status: 400 })
  }

  if (!isCloseableMonth(monthKey)) {
    return NextResponse.json(
      { error: 'Choose the current or previous month. Points were not changed.' },
      { status: 400 },
    )
  }

  const label = labelForMonthKey(monthKey)
  const { data, error } = await supabase.rpc('snapshot_monthly_leaderboard', {
    p_month_key: monthKey,
    p_label: label,
  })

  if (error) {
    if (isMissingSnapshotFunction(error)) {
      return NextResponse.json(
        {
          error:
            'Monthly archives are not set up yet. Run supabase/migration_monthly_leaderboards.sql in the Supabase SQL editor, then reset again. Points were not changed.',
        },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = asSnapshotResult(data)
  if (result.archived === false) {
    return NextResponse.json(
      { error: `${label} is already archived. Monthly points were not reset.` },
      { status: 409 },
    )
  }

  revalidatePath('/')
  revalidatePath('/leaderboard')
  revalidatePath('/leaderboard/history')
  revalidatePath('/admin')

  return NextResponse.json({
    ok: true,
    monthKey,
    label,
    finishers: result.finishers ?? 0,
  })
}
