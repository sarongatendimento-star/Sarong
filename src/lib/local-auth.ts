import 'server-only';

// -----------------------------------------------------------------------------
// Login local do painel administrativo — usado SOMENTE no modo PREVIEW (sem
// Supabase configurado). Quando a V2 reconectar o Supabase, src/lib/auth.ts
// volta a usar Supabase Auth automaticamente e este arquivo para de ser
// chamado (não precisa ser apagado).
//
// Credenciais: configuráveis via variáveis de ambiente ADMIN_EMAIL /
// ADMIN_PASSWORD. Sem elas, caem no padrão combinado com o cliente:
//   E-mail: sarong.atendimento@gmail.com
//   Senha:  Sarong@2026
// Troque essas variáveis na Vercel se quiser uma senha diferente — não é
// necessário alterar código.
//
// Sessão: cookie HttpOnly assinado com HMAC-SHA256 (Web Crypto — funciona
// tanto no middleware, que roda em Edge Runtime, quanto nas Route Handlers,
// que rodam em Node — por isso o código abaixo evita o módulo `crypto` do
// Node e a classe `Buffer`, usando só APIs disponíveis nos dois ambientes).
// Não é Supabase Auth, mas cumpre o mesmo papel nesta versão: sem a chave de
// assinatura (ADMIN_SESSION_SECRET), ninguém consegue forjar um cookie
// válido.
// -----------------------------------------------------------------------------

export const ADMIN_SESSION_COOKIE = 'sarong_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || 'sarong.atendimento@gmail.com').trim().toLowerCase();
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'Sarong@2026';
}

function getSessionSecret(): string {
  // Valor padrão só para o modo Preview funcionar "out of the box". Em
  // produção, configure ADMIN_SESSION_SECRET na Vercel com um valor próprio
  // (qualquer string longa e aleatória já resolve).
  return process.env.ADMIN_SESSION_SECRET || 'sarong-preview-default-secret-troque-em-producao-2026';
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return atob(b64);
}

async function sign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return toHex(sig);
}

export function checkLocalCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === getAdminEmail() && password === getAdminPassword();
}

export async function createSessionToken(email: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `${email.trim().toLowerCase()}.${exp}`;
  const signature = await sign(payload);
  return `${base64UrlEncode(payload)}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return false;

  let payload: string;
  try {
    payload = base64UrlDecode(payloadEncoded);
  } catch {
    return false;
  }

  const expectedSignature = await sign(payload);
  if (expectedSignature !== signature) return false;

  // Não usar payload.split('.')[1]: o e-mail em si pode (e neste caso tem)
  // pontos — "sarong.atendimento@gmail.com" — então o timestamp de expiração
  // é sempre o ÚLTIMO segmento, não o segundo.
  const parts = payload.split('.');
  const exp = Number(parts[parts.length - 1]);
  return Number.isFinite(exp) && Date.now() < exp;
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_SECONDS;
