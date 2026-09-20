import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/pjpeg',
  'image/jfif',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
  '.gif',
  '.avif',
  '.heic',
  '.heif',
  '.jfif',
  '.pdf',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. O limite máximo é de 25MB.' },
        { status: 400 }
      );
    }

    const originalName = file.name || 'foto_produto';
    let ext = path.extname(originalName).toLowerCase();

    // Auto-detect extension from mime type if extension is missing
    if (!ext) {
      if (file.type?.includes('png')) ext = '.png';
      else if (file.type?.includes('webp')) ext = '.webp';
      else if (file.type?.includes('svg')) ext = '.svg';
      else if (file.type?.includes('gif')) ext = '.gif';
      else if (file.type?.includes('pdf')) ext = '.pdf';
      else if (file.type?.includes('avif')) ext = '.avif';
      else if (file.type?.includes('heic') || file.type?.includes('heif')) ext = '.heic';
      else ext = '.jpg';
    }

    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type?.toLowerCase()) || !file.type;

    if (!isAllowedExt && !isAllowedMime) {
      return NextResponse.json(
        { error: 'Formato de imagem não suportado. Utilize JPG, PNG, WEBP, HEIC, SVG ou PDF.' },
        { status: 400 }
      );
    }

    const rawFolder = (formData.get('folder') as string) || 'products';
    // Sanitize folder to prevent path traversal
    const cleanFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compute Base64 data URL as universal fallback (safe for Vercel/serverless and mobile)
    const mimeType = file.type || (ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.pdf' ? 'application/pdf' : 'image/jpeg');
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    let fileUrl = base64Data;

    // Attempt filesystem write in local/persistent environments (with safe fallback for serverless)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', cleanFolder);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, safeName);
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/${cleanFolder}/${safeName}`;
    } catch {
      // In serverless / read-only runtime (e.g. Vercel), fallback directly to base64 data URL
      fileUrl = base64Data;
    }

    return NextResponse.json({
      url: fileUrl,
      originalName,
      mimeType,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: error?.message ? `Falha no envio: ${error.message}` : 'Falha no envio do arquivo.' },
      { status: 500 }
    );
  }
}
