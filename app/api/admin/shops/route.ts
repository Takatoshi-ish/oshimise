import { NextResponse, type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { listAllShopsForAdmin } from '@/lib/repositories/shops';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'unauthorized' } },
      { status: 401 },
    );
  }
  const shops = await listAllShopsForAdmin();
  return NextResponse.json(shops);
}
