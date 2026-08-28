import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/db';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'A logo deve ter no máximo 5MB.' }, { status: 400 });
    }

    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use JPG, PNG, WEBP ou SVG.' },
        { status: 400 }
      );
    }

    const logoDir = path.join(process.cwd(), 'public', 'logo');
    if (!existsSync(logoDir)) {
      await mkdir(logoDir, { recursive: true });
    }

    // Clean up old custom logos
    const { readdir, unlink } = await import('fs/promises');
    try {
      const existingFiles = await readdir(logoDir);
      for (const fileItem of existingFiles) {
        if (fileItem.startsWith('logo_custom')) {
          await unlink(path.join(logoDir, fileItem)).catch(() => {});
        }
      }
    } catch {}

    // Save with timestamped filename so neither browser nor Next.js caches stale version
    const safeName = `logo_custom_${Date.now()}${ext}`;
    const filePath = path.join(logoDir, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const logoUrl = `/logo/${safeName}`;

    // Persist to settings so all components can read it
    await prisma.siteSetting.upsert({
      where: { key: 'logo_url' },
      update: { value: logoUrl },
      create: { key: 'logo_url', value: logoUrl },
    });

    // Also update favicon_url to point to logo with cache busting
    await prisma.siteSetting.upsert({
      where: { key: 'favicon_url' },
      update: { value: logoUrl },
      create: { key: 'favicon_url', value: logoUrl },
    });

    return NextResponse.json({ url: logoUrl });
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json({ error: 'Falha ao salvar a logo.' }, { status: 500 });
  }
}
