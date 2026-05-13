'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Lock, LogIn, LogOut, ShieldCheck } from 'lucide-react';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setErrorMsg('Supabase no está configurado en Vercel.');
      return;
    }

    setSending(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    }

    setSending(false);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut({ scope: 'local' });
    }

    setSession(null);

    if (typeof window !== 'undefined') {
      // Limpieza fuerte de tokens Supabase en navegador
      Object.keys(window.localStorage).forEach((key) => {
        if (
          key.startsWith('sb-') ||
          key.includes('supabase') ||
          key.includes('auth-token')
        ) {
          window.localStorage.removeItem(key);
        }
      });

      Object.keys(window.sessionStorage).forEach((key) => {
        if (
          key.startsWith('sb-') ||
          key.includes('supabase') ||
          key.includes('auth-token')
        ) {
          window.sessionStorage.removeItem(key);
        }
      });

      window.location.replace('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-micelio-50">
        <div className="text-tierra-700">Verificando acceso...</div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-micelio-50 p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-red-700" />
          </div>
          <h1 className="font-serif text-2xl text-tierra-900 mb-2">Sistema no configurado</h1>
          <p className="text-sm text-tierra-600">
            Faltan las variables de Supabase en Vercel. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tierra-950 via-tierra-900 to-micelio-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl border border-micelio-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-micelio-500 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-tierra-950" />
              </div>
              <div>
                <h1 className="font-serif text-2xl text-tierra-900">Micelio Betania</h1>
                <p className="text-xs uppercase tracking-widest text-micelio-700">
                  Acceso privado
                </p>
              </div>
            </div>

            <p className="text-sm text-tierra-600 mb-6">
              Ingresa con tu usuario autorizado para acceder al sistema operativo del piloto.
            </p>

            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-tierra-600">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-micelio-200 focus:outline-none focus:ring-2 focus:ring-micelio-500"
                  placeholder="usuario@correo.com"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-tierra-600">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-micelio-200 focus:outline-none focus:ring-2 focus:ring-micelio-500"
                  placeholder="••••••••"
                />
              </div>

              {errorMsg && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-micelio-600 hover:bg-micelio-700 text-white rounded-xl px-4 py-3 font-medium disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                {sending ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-micelio-200 mt-4">
            Sistema privado · Centro de Bienestar Integral Betania
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={logout}
        className="fixed z-50 top-4 right-4 flex items-center gap-2 bg-white/90 hover:bg-white border border-micelio-200 text-tierra-700 rounded-full px-4 py-2 text-xs shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        Salir
      </button>
      {children}
    </div>
  );
}
