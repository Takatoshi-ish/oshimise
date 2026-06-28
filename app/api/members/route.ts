import { NextResponse, type NextRequest } from 'next/server';
import { listActiveMembers } from '@/lib/repositories/members';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const teamId = req.nextUrl.searchParams.get('teamId') || undefined;
    const members = await listActiveMembers(teamId);
    return NextResponse.json(members);
  } catch (e) {
    console.error('/api/members error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Failed to load members' } },
      { status: 500 },
    );
  }
}
