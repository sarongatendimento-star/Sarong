'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Tela de login do painel administrativo — visual preservado integralmente
// (Regra 5). Único ajuste da V1.1: o campo passou de "usuário" para "e-mail",
// já que a autenticação agora é feita pelo Supabase Auth (ver src/lib/auth.ts).
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Não foi possível entrar.');
      return;
    }

    router.push('/admin/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sarong-black px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="mb-8 text-center text-xl tracking-widest2 text-sarong-off">SARONG</p>
        <p className="mb-6 text-center text-xs uppercase tracking-widest2 text-sarong-off/50">
          Painel administrativo
        </p>

        <label className="mb-1 block text-xs uppercase tracking-widest2 text-sarong-off/70">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full border border-sarong-off/20 bg-transparent px-4 py-3 text-sm text-sarong-off outline-none focus:border-sarong-off/60"
          autoComplete="email"
        />

        <label className="mb-1 block text-xs uppercase tracking-widest2 text-sarong-off/70">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full border border-sarong-off/20 bg-transparent px-4 py-3 text-sm text-sarong-off outline-none focus:border-sarong-off/60"
          autoComplete="current-password"
        />

        {error && <p className="mb-4 text-xs text-sarong-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sarong-off px-6 py-3.5 text-xs uppercase tracking-widest2 text-sarong-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
