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
    <div className="min-h-screen w-full flex bg-[#0A0A0A] relative overflow-hidden selection:bg-[#E10613]/30">
      {/* Ambient warm glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7A0A12]/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#E10613]/8 blur-[140px] pointer-events-none" />

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
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-[#FF4D57] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-3 text-2xl font-black tracking-tight text-white mb-8 hover:opacity-80 transition-opacity">
              <Logo className="w-10 h-10" />
              <span>RedGain</span>
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E10613]/30 bg-[#E10613]/8 text-[#FF4D57] text-xs font-medium mb-4">
              <Quote className="w-3 h-3" />
              Acceso 100% gratuito
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white">Tu futuro comienza aquí</h2>
            <p className="mt-2 text-white/50 font-medium">Ingresa para ver tus ofertas, tu saldo y tus referidos.</p>
          </div>

          <div className="mt-8 bg-[#141414]/70 border border-[#E10613]/15 backdrop-blur-xl p-8 rounded-3xl relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E10613]/50 to-transparent rounded-t-3xl" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E10613]/20 to-transparent rounded-b-3xl" />

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
                    className="w-full pl-10 pr-4 h-12 rounded-xl bg-white/4 border border-[#E10613]/15 text-white placeholder:text-white/25 focus:outline-none focus:border-[#E10613]/50 focus:bg-[#E10613]/5 transition-all font-medium text-sm"
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
                    className="w-full pl-10 pr-4 h-12 rounded-xl bg-white/4 border border-[#E10613]/15 text-white placeholder:text-white/25 focus:outline-none focus:border-[#E10613]/50 focus:bg-[#E10613]/5 transition-all font-medium text-sm"
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
                className="w-full h-14 text-base font-bold text-black bg-gradient-to-r from-[#7A0A12] to-[#E10613] hover:opacity-90 shadow-[0_0_30px_-5px_#E10613] mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
              >
                {loginMutation.isPending
                  ? <Loader2 className="w-5 h-5 animate-spin text-black" />
                  : <>Ingresar a mi panel <ArrowRight className="h-5 w-5" /></>
                }
              </button>
            </form>

            <div className="mt-8 flex justify-center text-sm font-medium text-white/40">
              ¿Aún no eres parte de la comunidad?{' '}
              <Link href="/register" className="ml-1 font-bold text-[#FF4D57] hover:text-[#E10613] transition-colors">Únete ahora</Link>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white/30">
              <ShieldCheck className="w-4 h-4 text-[#E10613]" />
              <span>Conexión segura y cifrada. Tu información está protegida.</span>
            </div>
            <Link href="/como-funciona" className="text-xs text-white/25 hover:text-[#FF4D57]/60 transition-colors underline">
              ¿Cómo funciona el sistema?
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Brand / Image Side ── */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden z-10">
        {/* Fondo de marca */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(225,6,19,0.30), #0A0A0A 70%)' }} />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]/70" />
        <div className="absolute inset-0 bg-[#2A0A0D]/20 mix-blend-multiply" />
        {/* Gold vein left border */}
        <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#E10613]/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center items-start p-16">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-md space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E10613]/40 bg-[#E10613]/10 text-[#FF4D57] text-sm font-medium">
              <Quote className="w-4 h-4" />
              Comunidad RedGain
            </div>

            <h3 className="text-4xl font-black text-white leading-tight">
              Completa ofertas,{' '}
              <span className="bg-gradient-to-r from-[#7A0A12] via-[#E10613] to-[#FF4D57] bg-clip-text text-transparent">
                recibe recompensas.
              </span>
            </h3>

            <p className="text-lg font-medium text-white/55 leading-relaxed">
              Una plataforma de recompensas: completa ofertas patrocinadas y acumula saldo dentro de RedGain. Las recompensas varían según tu país y no están garantizadas.
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
