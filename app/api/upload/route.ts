import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf'];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo excede o limite de 15MB.' },
        { status: 400 }
      );
    }

    const originalName = file.name || 'arquivo';
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext) || (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== '')) {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Permitidos: JPG, PNG, WEBP, SVG e PDF.' },
        { status: 400 }
      );
    }

    const rawFolder = (formData.get('folder') as string) || 'general';
    const folder = ['products', 'prints', 'artworks', 'general'].includes(rawFolder)
      ? rawFolder
      : 'general';

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, safeName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${folder}/${safeName}`;

    return NextResponse.json({
      url: fileUrl,
      originalName,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ error: 'Falha no envio do arquivo.' }, { status: 500 });
  }
}
