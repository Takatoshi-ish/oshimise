import { NextResponse, type NextRequest } from 'next/server';
import { createReadStream, statSync } from 'node:fs';
import { basename } from 'node:path';
import { getStoredImagePath } from '@/lib/images';

export const runtime = 'nodejs';

function contentTypeFor(name: string): string {
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const safe = basename(name);
  // Reject anything that isn't a plain basename
  if (safe !== name || name.includes('..') || name.includes('/') || name.includes('\\')) {
    return NextResponse.json(
      { error: { code: 'VALIDATION', message: 'invalid name' } },
      { status: 400 },
    );
  }
  const filePath = getStoredImagePath(safe);
  let size: number;
  try {
    size = statSync(filePath).size;
  } catch {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'not found' } },
      { status: 404 },
    );
  }
  const stream = createReadStream(filePath);
  const body = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
  });
  return new NextResponse(body, {
    headers: {
      'Content-Type': contentTypeFor(safe),
      'Content-Length': String(size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
