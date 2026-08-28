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

    const ext = path.extname(file.name || '').toLowerCase() || '.png';
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use JPG, PNG, WEBP ou SVG.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || (ext === '.svg' ? 'image/svg+xml' : 'image/png');
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const timestamp = Date.now();
    const safeName = `logo_custom_${timestamp}${ext}`;

    // Attempt filesystem write in local environment (safe fail in Vercel serverless read-only FS)
    try {
      const logoDir = path.join(process.cwd(), 'public', 'logo');
      if (!existsSync(logoDir)) {
        await mkdir(logoDir, { recursive: true });
      }

      // Clean up old custom logos locally
      const { readdir, unlink } = await import('fs/promises');
      const existingFiles = await readdir(logoDir);
      for (const fileItem of existingFiles) {
        if (fileItem.startsWith('logo_custom')) {
          await unlink(path.join(logoDir, fileItem)).catch(() => {});
        }
      }

      const filePath = path.join(logoDir, safeName);
      await writeFile(filePath, buffer);
    } catch {
      // Ignored: Vercel / serverless runtime is read-only
    }

    const logoUrl = base64Data;

    // Persist to settings so all components can read it
    await prisma.siteSetting.upsert({
      where: { key: 'logo_url' },
      update: { value: logoUrl },
      create: { key: 'logo_url', value: logoUrl },
    });

    // Also update favicon_url to point to logo if no separate favicon is set
    await prisma.siteSetting.upsert({
      where: { key: 'favicon_url' },
      update: { value: logoUrl },
      create: { key: 'favicon_url', value: logoUrl },
    });

    return NextResponse.json({ url: logoUrl });
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: error?.message ? `Falha ao salvar logo: ${error.message}` : 'Falha ao salvar a logo.' },
      { status: 500 }
    );
  }
}
