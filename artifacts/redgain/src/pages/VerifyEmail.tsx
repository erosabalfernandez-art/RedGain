import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/lib/auth';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const { refetch } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('El enlace no es válido. Asegúrate de copiar el enlace completo del email.');
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.user) {
          await refetch();
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2500);
        } else {
          setStatus('error');
          setErrorMsg(data.error ?? 'No se pudo verificar el correo.');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Error de red. Intenta de nuevo.');
      });
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0E0C09] relative overflow-hidden p-6">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B6914]/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A227]/8 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Logo className="w-9 h-9 text-[#C9A227]" />
          <span className="font-black text-2xl text-white">RedGain</span>
        </div>

        <div className="bg-[#1A1208]/70 border border-[#C9A227]/15 backdrop-blur-xl p-10 rounded-3xl relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent rounded-t-3xl" />

          {status === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
              </div>
              <h1 className="text-2xl font-black text-white">Verificando tu correo…</h1>
              <p className="text-white/45 font-medium">Un momento, estamos confirmando tu cuenta.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-white">¡Correo verificado!</h1>
              <p className="text-white/50 font-medium">Tu cuenta está lista. Entrando al dashboard…</p>
              <div className="flex items-center justify-center gap-2 text-[#C9A227] text-sm font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirigiendo…
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-black text-white">Enlace inválido</h1>
              <p className="text-white/50 font-medium text-sm leading-relaxed">{errorMsg}</p>

              <div className="pt-2 space-y-3">
                <a
                  href="/login"
                  className="w-full h-12 text-sm font-bold text-black bg-gradient-to-r from-[#8B6914] to-[#C9A227] hover:opacity-90 transition-opacity rounded-xl flex items-center justify-center gap-2"
                >
                  Iniciar sesión <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="/register"
                  className="block text-sm font-medium text-white/35 hover:text-[#E8C547] transition-colors"
                >
                  Crear una cuenta nueva
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
