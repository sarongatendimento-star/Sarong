import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey, IS_SUPABASE_CONFIGURED } from '@/lib/supabase/config';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/local-auth';

// -----------------------------------------------------------------------------
// Protege toda a arvore /admin/dashboard.
//
// V2 (Supabase configurado): verifica uma sessão real do Supabase Auth e
// aproveita para renovar (refresh) o token a cada navegação.
//
// MODO PREVIEW (sem Supabase): valida o cookie de sessão local assinado (ver
// src/lib/local-auth.ts) — mesma lógica de verificação usada por
// src/lib/auth.ts, só que aqui rodando em Edge Runtime.
// -----------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isDashboard = request.nextUrl.pathname.startsWith('/admin/dashboard');
  if (!isDashboard) return response;

  if (!IS_SUPABASE_CONFIGURED) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const valid = await verifySessionToken(token);
    if (!valid) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
