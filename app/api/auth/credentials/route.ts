import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    // Get current logged-in user from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('tenorio_admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: token } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const body = await request.json();
    const { currentPassword, newName, newEmail, newPassword } = body;

    // Always require current password to make changes
    if (!currentPassword) {
      return NextResponse.json({ error: 'A senha atual é obrigatória para realizar alterações.' }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 });
    }

    // Build update payload
    const updateData: Record<string, string> = {};

    if (newName && newName.trim() && newName.trim() !== user.name) {
      updateData.name = newName.trim();
    }

    if (newEmail && newEmail.trim() && newEmail.trim() !== user.email) {
      // Check if new email is already taken by another user
      const existing = await prisma.user.findUnique({ where: { email: newEmail.trim() } });
      if (existing) {
        return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
      }
      updateData.email = newEmail.trim();
    }

    if (newPassword && newPassword.trim().length >= 6) {
      const hashed = await bcrypt.hash(newPassword.trim(), 12);
      updateData.password = hashed;
    } else if (newPassword && newPassword.trim().length > 0 && newPassword.trim().length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhuma alteração detectada.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating credentials:', error);
    return NextResponse.json({ error: 'Falha ao atualizar credenciais: ' + (error?.message || 'Erro interno') }, { status: 500 });
  }
}
