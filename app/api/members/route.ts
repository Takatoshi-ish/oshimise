import { NextResponse } from 'next/server';
import { listActiveMembers } from '@/lib/repositories/members';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const members = await listActiveMembers();
    return NextResponse.json(members);
  } catch (e) {
    console.error('/api/members error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Failed to load members' } },
      { status: 500 },
    );
  }
}
