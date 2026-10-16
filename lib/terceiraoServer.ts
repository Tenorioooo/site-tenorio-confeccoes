import { prisma } from './db';
import { DEFAULT_COMBOS, ComboData } from './terceiraoData';

export async function getTerceiraoCombos(): Promise<ComboData[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'terceirao_combos' },
    });

    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Erro ao buscar combos do Terceirão do banco:', error);
  }

  return DEFAULT_COMBOS;
}
