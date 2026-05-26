'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Factory, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">İmalat Takip</h1>
            <p className="text-sm text-white/50">Tekstil Üretim Yönetim Sistemi</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="admin@imalat.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-white/30 text-center mb-3">Demo Hesaplar</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail('admin@imalat.com'); setPassword('Admin123!'); }}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all border border-white/5 text-left"
              >
                <span className="font-medium text-indigo-400">Admin</span>
                <br />
                <span className="text-white/30">admin@imalat.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('operasyon@imalat.com'); setPassword('Demo123!'); }}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all border border-white/5 text-left"
              >
                <span className="font-medium text-emerald-400">Operasyon</span>
                <br />
                <span className="text-white/30">operasyon@imalat.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('kesim@imalat.com'); setPassword('Demo123!'); }}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all border border-white/5 text-left"
              >
                <span className="font-medium text-amber-400">Kesim</span>
                <br />
                <span className="text-white/30">kesim@imalat.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('muhasebe@imalat.com'); setPassword('Demo123!'); }}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all border border-white/5 text-left"
              >
                <span className="font-medium text-sky-400">Muhasebe</span>
                <br />
                <span className="text-white/30">muhasebe@imalat.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-white/20 mt-6">v1.0.0 — © 2026 İmalat Takip</p>
      </div>
    </div>
  );
}
