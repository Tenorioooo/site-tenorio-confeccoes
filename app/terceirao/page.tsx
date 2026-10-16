import React from 'react';
import type { Metadata } from 'next';
import TerceiraoClient from './TerceiraoClient';
import { getTerceiraoCombos } from '@/lib/terceiraoServer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kits para Terceirão & Formaturas | Tenório Confecções',
  description:
    'Moletons flanelados 320g, camisetas premium 100% algodão, canecas de alumínio com tirante e bandeirões para Terceirão e formaturas. Nomes e números individuais para cada aluno. Faça a cotação da sua sala!',
  keywords: [
    'terceirao',
    'moletom terceirao',
    'camiseta terceirao',
    'caneca terceirao',
    'uniforme formandos',
    'kit formatura terceirao',
    'jaqueta college formandos',
    'andradina',
    'tres lagoas',
    'castilho',
  ],
};

export default async function TerceiraoPage() {
  const combos = await getTerceiraoCombos();
  return <TerceiraoClient initialCombos={combos} />;
}
