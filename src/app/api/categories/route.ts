import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/categories';

// GET /api/categories — leitura pública (mesma policy de RLS da vitrine).
// Consumida pelo dashboard admin para popular o <select> de categoria do
// formulário de produto, em vez do array fixo que existia antes da V1.1.
export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json(categories);
}
