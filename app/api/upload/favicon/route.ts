import { NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/db';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon'];
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

    const ext = path.extname(file.name || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use PNG, JPG, SVG ou ICO.' },
        { status: 400 }
      );
    }

    const publicDir = path.join(process.cwd(), 'public');
    const logoDir = path.join(publicDir, 'logo');
    if (!existsSync(logoDir)) {
      await mkdir(logoDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = `favicon_custom_${timestamp}${ext}`;
    const filePath = path.join(logoDir, safeName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Also overwrite public/favicon.svg / public/icon.png / app/icon.png if suitable
    const faviconUrl = `/logo/${safeName}?t=${timestamp}`;

    // Persist to site settings
    await prisma.siteSetting.upsert({
      where: { key: 'favicon_url' },
      update: { value: faviconUrl },
      create: { key: 'favicon_url', value: faviconUrl },
    });

    return NextResponse.json({ url: faviconUrl });
  } catch (error: any) {
    console.error('Error uploading favicon:', error);
    return NextResponse.json({ error: 'Falha ao salvar o favicon.' }, { status: 500 });
  }
}
