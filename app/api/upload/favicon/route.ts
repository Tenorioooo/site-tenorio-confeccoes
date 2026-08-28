import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/db';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/ico',
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'O favicon deve ter no máximo 5MB.' }, { status: 400 });
    }

    let ext = path.extname(file.name || '').toLowerCase();
    if (!ext) {
      if (file.type === 'image/svg+xml') ext = '.svg';
      else if (file.type === 'image/x-icon' || file.type === 'image/vnd.microsoft.icon' || file.type === 'image/ico') ext = '.ico';
      else if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/jpeg') ext = '.jpg';
      else ext = '.png';
    }

    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use PNG, JPG, SVG ou ICO.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const finalMime = file.type || (ext === '.svg' ? 'image/svg+xml' : ext === '.ico' ? 'image/x-icon' : 'image/png');
    const base64Data = `data:${finalMime};base64,${buffer.toString('base64')}`;

    const timestamp = Date.now();
    const safeName = `favicon_custom_${timestamp}${ext}`;

    // Attempt filesystem write in local environment (safe fail in Vercel serverless read-only FS)
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const logoDir = path.join(publicDir, 'logo');
      if (!existsSync(logoDir)) {
        await mkdir(logoDir, { recursive: true });
      }
      const filePath = path.join(logoDir, safeName);
      await writeFile(filePath, buffer);

      if (ext === '.ico') {
        await writeFile(path.join(publicDir, 'favicon.ico'), buffer).catch(() => {});
      } else if (ext === '.svg') {
        await writeFile(path.join(publicDir, 'favicon.svg'), buffer).catch(() => {});
      } else {
        await writeFile(path.join(publicDir, 'icon.png'), buffer).catch(() => {});
      }
    } catch {
      // Ignored: Vercel / serverless runtime is read-only
    }

    const faviconUrl = base64Data;

    // Persist to site settings
    await prisma.siteSetting.upsert({
      where: { key: 'favicon_url' },
      update: { value: faviconUrl },
      create: { key: 'favicon_url', value: faviconUrl },
    });

    return NextResponse.json({ url: faviconUrl });
  } catch (error: any) {
    console.error('Error uploading favicon:', error);
    return NextResponse.json(
      { error: error?.message ? `Falha ao salvar favicon: ${error.message}` : 'Falha ao salvar o favicon.' },
      { status: 500 }
    );
  }
}
