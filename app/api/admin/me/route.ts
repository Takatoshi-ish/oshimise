import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const sheetsId = process.env.GOOGLE_SHEETS_ID ?? '';
  const sheetsUrl = sheetsId
    ? `https://docs.google.com/spreadsheets/d/${sheetsId}/edit`
    : null;
  return NextResponse.json({ ok: true, sheetsUrl });
}
