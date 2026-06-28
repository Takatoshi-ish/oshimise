import { NextResponse } from 'next/server';
import { listActiveTeams } from '@/lib/repositories/teams';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public: used by ComposeModal team picker / ViewerTeamPicker / join form
export async function GET() {
  try {
    const teams = await listActiveTeams();
    return NextResponse.json(teams);
  } catch (e) {
    console.error('/api/teams error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'failed' } },
      { status: 500 },
    );
  }
}
