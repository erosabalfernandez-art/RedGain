import { Link, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, ListChecks, ShieldCheck, Users, Wallet, AlertTriangle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const RED = '#E10613';
const RED_LIGHT = '#FF4D57';
const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const sections = [
  { icon: UserPlus, title: '1. Crea tu cuenta gratis', body: ['Regístrate con tu correo y tu teléfono. No hay pagos de entrada, suscripciones ni renovaciones.', 'Tu cuenta queda activa de inmediato y no vence.'] },
  { icon: ListChecks, title: '2. Elige y completa ofertas', body: ['Dentro de RedGain verás ofertas patrocinadas disponibles según tu país y tu dispositivo: instalar apps, jugar, responder encuestas o registrarte en servicios.', 'Antes de empezar, cada oferta muestra la recompensa y los requisitos que debes cumplir.'] },
  { icon: ShieldCheck, title: '3. Validación del anunciante', body: ['La recompensa se acredita en tu saldo solo cuando el anunciante confirma que completaste la oferta de forma válida.', 'Si el anunciante anula una conversión, la recompensa se descuenta. Todo movimiento queda registrado en tu historial.'] },
  { icon: Users, title: '4. Programa de referidos', body: ['Puedes invitar a otras personas con tu código personal. Registrarse con un código no cuesta nada.', 'Recibes un porcentaje de lo que tus referidos directos obtienen en ofertas. Lo pagan los anunciantes, no los usuarios, y hay un solo nivel.'] },
  { icon: Wallet, title: '5. Retiros', body: ['Los retiros se habilitarán próximamente. Podrán tener un monto mínimo, verificación de cuenta y un periodo de espera para cubrir posibles reversiones.'] },
];

export default function HowItWorks() {
  const fromDashboard = new URLSearchParams(useSearch()).get('from') === 'dashboard';
  const backHref = fromDashboard ? '/dashboard' : '/';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="sticky top-0 z-50 border-b border-[#E10613]/15 bg-[#0A0A0A]/90 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link href={backHref} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo className="w-7 h-7" />
            <span className="font-bold text-sm" style={{ color: RED_LIGHT }}>RedGain</span>
          </Link>
          <Link href={backHref} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            {fromDashboard ? 'Volver al panel' : 'Volver al inicio'}
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-16 space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fade} className="mb-10 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: RED }}>Cómo funciona</span>
          <h1 className="text-3xl md:text-5xl font-black">Completa ofertas y recibe recompensas</h1>
          <p className="text-white/55 leading-relaxed">RedGain es una plataforma de recompensas gratuita. Así es el proceso, paso a paso.</p>
        </motion.div>

        {sections.map(({ icon: Icon, title, body }) => (
          <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} className="rounded-2xl p-6 bg-[#141414] border border-[#E10613]/15">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(225,6,19,0.12)', border: '1px solid rgba(225,6,19,0.3)' }}>
                <Icon className="w-5 h-5" style={{ color: RED_LIGHT }} />
              </div>
              <h2 className="font-bold text-lg">{title}</h2>
            </div>
            <div className="space-y-2 text-sm text-white/55 leading-relaxed">{body.map((t) => <p key={t}>{t}</p>)}</div>
          </motion.div>
        ))}

        <div className="rounded-2xl p-6 border border-white/10 flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: RED_LIGHT }} />
          <p className="text-sm text-white/55 leading-relaxed"><strong className="text-white/80">Importante:</strong> las recompensas varían según tu país, tu dispositivo y las ofertas disponibles, y no están garantizadas. RedGain no promete ingresos.</p>
        </div>

        {!fromDashboard && (
          <div className="text-center pt-6">
            <Link href="/register" className="inline-block px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_30px_-8px_#E10613]" style={{ background: RED }}>Crear cuenta gratis</Link>
          </div>
        )}
      </main>
    </div>
  );
}
