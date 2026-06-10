import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PHOTO_JPEG_QUALITY, PHOTO_RESIZE_LONG_EDGE } from '@/config/data';

function getUploadDir(): string {
  return process.env.UPLOAD_DIR || './uploads';
}

export async function processAndSave(
  buffer: Buffer,
): Promise<{ filename: string; bytes: number }> {
  const out = await sharp(buffer)
    .rotate()
    .resize({
      width: PHOTO_RESIZE_LONG_EDGE,
      height: PHOTO_RESIZE_LONG_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: PHOTO_JPEG_QUALITY })
    .toBuffer();
  const filename = `${randomUUID()}.jpg`;
  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), out);
  return { filename, bytes: out.length };
}

export function getStoredImagePath(name: string): string {
  return join(getUploadDir(), name);
}
