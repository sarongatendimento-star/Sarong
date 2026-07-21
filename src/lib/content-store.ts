import 'server-only';
import fs from 'fs';
import path from 'path';

// -----------------------------------------------------------------------------
// Persistência local em arquivos JSON — usada pelo painel administrativo no
// modo PREVIEW (sem Supabase) para guardar produtos e configurações do site
// (banners, logo, contato, rodapé etc.), sem precisar de nenhum banco de
// dados externo.
//
// AVISO IMPORTANTE SOBRE A VERCEL (leia antes de confiar nisso em produção):
// Funções serverless da Vercel rodam num sistema de arquivos SOMENTE LEITURA,
// com exceção da pasta /tmp, que é gravável mas EFÊMERA — o conteúdo pode
// sumir a qualquer momento (nova instância, cold start, novo deploy) e não é
// compartilhado entre instâncias simultâneas. Por isso:
//   • Em desenvolvimento local (`npm run dev`) ou num servidor com disco
//     persistente (`npm run build && npm start` numa VPS, Railway, Render
//     etc.), os dados gravados aqui persistem normalmente entre reinícios.
//   • Na Vercel, o primeiro diretório (process.cwd()) é somente leitura, então
//     caímos para /tmp — o painel continua funcionando (dá para editar e ver
//     o resultado na hora), mas as alterações podem se perder depois de um
//     tempo sem aviso. Para persistência garantida em produção na Vercel,
//     é necessário reconectar o Supabase (V2) ou outro banco externo.
// As funções abaixo devolvem `ephemeral: true` nesse cenário, para que a UI
// do painel (ver src/components/admin/SettingsForm.tsx) possa avisar quem
// está editando.
// -----------------------------------------------------------------------------

const DATA_DIR_CANDIDATES = [path.join(process.cwd(), '.sarong-data'), path.join('/tmp', 'sarong-data')];

function ensureWritableDir(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const testFile = path.join(dir, '.write-test');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
}

interface DirInfo {
  dir: string;
  ephemeral: boolean;
}

let cachedDir: DirInfo | null | undefined;

function resolveDir(): DirInfo | null {
  if (cachedDir !== undefined) return cachedDir;

  for (let i = 0; i < DATA_DIR_CANDIDATES.length; i++) {
    const dir = DATA_DIR_CANDIDATES[i];
    if (ensureWritableDir(dir)) {
      cachedDir = { dir, ephemeral: i > 0 };
      return cachedDir;
    }
  }

  cachedDir = null;
  return cachedDir;
}

export interface WriteResult {
  ok: boolean;
  ephemeral: boolean;
  error?: string;
}

// Lê um arquivo JSON do content-store. Se não existir (primeira vez) ou o
// filesystem não estiver disponível, devolve `fallback` sem lançar erro.
export function readStore<T extends Record<string, unknown>>(fileName: string, fallback: T): T {
  const dirInfo = resolveDir();
  if (!dirInfo) return fallback;

  try {
    const filePath = path.join(dirInfo.dir, fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

// Grava um arquivo JSON no content-store. `ephemeral: true` no resultado
// significa "gravou, mas em /tmp da Vercel — pode não durar".
export function writeStore<T>(fileName: string, data: T): WriteResult {
  const dirInfo = resolveDir();
  if (!dirInfo) {
    return { ok: false, ephemeral: true, error: 'Sistema de arquivos indisponível neste ambiente.' };
  }

  try {
    const filePath = path.join(dirInfo.dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true, ephemeral: dirInfo.ephemeral };
  } catch (err) {
    return { ok: false, ephemeral: dirInfo.ephemeral, error: (err as Error).message };
  }
}
