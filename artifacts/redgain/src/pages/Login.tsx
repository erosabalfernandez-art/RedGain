import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, Loader2, Quote } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useLogin();
  const { refetch } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: async (data) => {
        await refetch();
        window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
      },
      onError: () => {
        setErrorMsg('Correo o contraseña incorrectos');
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0E0C09] relative overflow-hidden selection:bg-[#C9A227]/30">
      {/* Ambient warm glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B6914]/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A227]/8 blur-[140px] pointer-events-none" />

      {/* ── Form Side ── */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 mx-auto w-full max-w-lg lg:max-w-none lg:w-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm lg:w-full"
        >
          {/* Back button */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-[#E8C547] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-3 text-2xl font-black tracking-tight text-white mb-8 hover:opacity-80 transition-opacity">
              <Logo className="w-10 h-10" />
              <span>RedGain</span>
            </Link>

            {/* Stoic quote badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/8 text-[#E8C547] text-xs font-medium mb-4">
              <Quote className="w-3 h-3" />
              "La disciplina es la madre de la libertad." — Epicteto
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white">Tu futuro comienza aquí</h2>
            <p className="mt-2 text-white/50 font-medium">Ingresa para ver el crecimiento de tu red y tus ganancias.</p>
          </div>

          <div className="mt-8 bg-[#1A1208]/70 border border-[#C9A227]/15 backdrop-blur-xl p-8 rounded-3xl relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent rounded-t-3xl" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/20 to-transparent rounded-b-3xl" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-white/70 font-bold text-sm block">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 h-12 rounded-xl bg-white/4 border border-[#C9A227]/15 text-white placeholder:text-white/25 focus:outline-none focus:border-[#C9A227]/50 focus:bg-[#C9A227]/5 transition-all font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-white/70 font-bold text-sm block">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 h-12 rounded-xl bg-white/4 border border-[#C9A227]/15 text-white placeholder:text-white/25 focus:outline-none focus:border-[#C9A227]/50 focus:bg-[#C9A227]/5 transition-all font-medium text-sm"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-400 text-sm font-bold text-center bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-14 text-base font-bold text-black bg-gradient-to-r from-[#8B6914] to-[#C9A227] hover:opacity-90 shadow-[0_0_30px_-5px_#C9A227] mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
              >
                {loginMutation.isPending
                  ? <Loader2 className="w-5 h-5 animate-spin text-black" />
                  : <>Ingresar a mi panel <ArrowRight className="h-5 w-5" /></>
                }
              </button>
            </form>

            <div className="mt-8 flex justify-center text-sm font-medium text-white/40">
              ¿Aún no eres parte de la comunidad?{' '}
              <Link href="/register" className="ml-1 font-bold text-[#E8C547] hover:text-[#C9A227] transition-colors">Únete ahora</Link>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white/30">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Conexión segura y cifrada. Tu información está protegida.</span>
            </div>
            <Link href="/como-funciona" className="text-xs text-white/25 hover:text-[#E8C547]/60 transition-colors underline">
              ¿Cómo funciona el sistema?
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Brand / Image Side ── */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden z-10">
        {/* Stoic background image */}
        <img
          src="/stoic-login.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.35) saturate(0.80)' }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0C09] via-[#0E0C09]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09]/60 via-transparent to-[#0E0C09]/70" />
        <div className="absolute inset-0 bg-[#2A1A00]/20 mix-blend-multiply" />
        {/* Gold vein left border */}
        <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#C9A227]/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center items-start p-16">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#E8C547] text-sm font-medium">
              <Quote className="w-4 h-4" />
              Comunidad RedGain
            </div>

            <h3 className="text-4xl font-black text-white leading-tight">
              El dinero que mereces,{' '}
              <span className="bg-gradient-to-r from-[#8B6914] via-[#C9A227] to-[#E8C547] bg-clip-text text-transparent">
                trabajando para ti.
              </span>
            </h3>

            <p className="text-lg font-medium text-white/55 leading-relaxed">
              Miles de personas en Latinoamérica ya están construyendo ingresos reales, recurrentes y predecibles. Bienvenido a la nueva economía.
            </p>

            {/* Stoic quote */}
            <div className="border-l-2 border-[#C9A227]/50 pl-5">
              <p className="text-white/60 italic text-sm leading-relaxed">
                "Ocupa tu mente con buenos pensamientos, o el enemigo llenará ese espacio."
              </p>
              <p className="text-[#C9A227]/60 text-xs font-bold mt-2 uppercase tracking-wider">— Marco Aurelio</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#C9A227]/15">
              {[
                { value: '10k+', label: 'Miembros' },
                { value: '$500k+', label: 'Pagados' },
                { value: '15+', label: 'Países' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-extrabold text-[#E8C547]">{value}</div>
                  <div className="text-xs text-white/40 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
