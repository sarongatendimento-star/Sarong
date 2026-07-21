import 'server-only';
import { readStore, writeStore, type WriteResult } from '@/lib/content-store';
import { LOCAL_PRODUCTS } from '@/data/products';
import type { Product } from '@/types/product';

// -----------------------------------------------------------------------------
// Catálogo de produtos EDITÁVEL do modo Preview.
//
// src/data/products.ts continua sendo a "semente" (o catálogo de exemplo que
// vem pronto no projeto) — nunca é alterado pelo painel. Este arquivo lê/
// grava uma CÓPIA desses produtos no content-store (ver aviso de persistência
// em src/lib/content-store.ts); na primeira leitura, sem nada gravado ainda,
// devolve a semente. A partir da primeira criação/edição/exclusão pelo
// painel, passa a devolver sempre a versão gravada.
// -----------------------------------------------------------------------------

const FILE_NAME = 'products.json';

export function getLocalProducts(): Product[] {
  const stored = readStore<{ products?: Product[] }>(FILE_NAME, {});
  if (Array.isArray(stored.products)) return stored.products;
  return LOCAL_PRODUCTS;
}

export function saveLocalProducts(products: Product[]): WriteResult {
  return writeStore(FILE_NAME, { products });
}
