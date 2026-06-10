import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { processAndSave } from '@/lib/images';
import { insertPhoto } from '@/lib/repositories/photos';
import { PHOTO_MAX_BYTES } from '@/config/data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SourceSchema = z.enum(['places', 'user']);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const memberIdRaw = form.get('memberId');
    const source = form.get('source');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'file is required' } },
        { status: 400 },
      );
    }
    if (file.size === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'empty file' } },
        { status: 400 },
      );
    }
    if (file.size > PHOTO_MAX_BYTES) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'file too large' } },
        { status: 400 },
      );
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'file must be image/*' } },
        { status: 400 },
      );
    }
    const sourceParsed = SourceSchema.safeParse(source);
    if (!sourceParsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION', message: 'source invalid' } },
        { status: 400 },
      );
    }
    const memberId =
      typeof memberIdRaw === 'string' && memberIdRaw.length > 0
        ? memberIdRaw
        : null;

    const buf = Buffer.from(await file.arrayBuffer());
    const { filename } = await processAndSave(buf);
    const url = `/api/img/${filename}`;
    const photo = await insertPhoto({
      url,
      memberId,
      source: sourceParsed.data,
    });
    return NextResponse.json({ id: photo.id, url: photo.url });
  } catch (e) {
    console.error('/api/photos error', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Failed to upload' } },
      { status: 500 },
    );
  }
}
