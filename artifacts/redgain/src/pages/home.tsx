import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { UserPlus, ListChecks, Wallet, Users, ShieldCheck, Gift, ChevronDown, Smartphone } from 'lucide-react';

const RED = '#E10613';
const RED_LIGHT = '#FF4D57';

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const steps = [
  { icon: UserPlus, title: 'Crea tu cuenta gratis', desc: 'Regístrate en menos de un minuto. No hay pagos de entrada ni suscripciones.' },
  { icon: ListChecks, title: 'Elige una oferta', desc: 'Verás ofertas patrocinadas disponibles para tu país y dispositivo: apps, juegos, encuestas y registros.' },
  { icon: Wallet, title: 'Recibe tu recompensa', desc: 'Cuando el anunciante valida que completaste la oferta, la recompensa se acredita en tu saldo.' },
];

const pillars = [
  { icon: Gift, title: 'Acceso 100% gratuito', desc: 'Usar RedGain no cuesta nada. El dinero de las recompensas lo ponen los anunciantes.' },
  { icon: ShieldCheck, title: 'Recompensas validadas', desc: 'Solo se acreditan conversiones confirmadas por el anunciante. Las anuladas se descuentan.' },
  { icon: Smartphone, title: 'Desde el móvil o el PC', desc: 'Funciona en cualquier navegador. La disponibilidad de ofertas depende de tu país.' },
];

const faqs = [
  { q: '¿Tiene algún costo?', a: 'No. Registrarte y usar RedGain es gratis, y tampoco cobramos por invitar a otras personas.' },
  { q: '¿Cuánto puedo ganar?', a: 'Depende de las ofertas disponibles en tu país, de que las completes correctamente y de que el anunciante las valide. No garantizamos ningún monto.' },
  { q: '¿De dónde sale el dinero de las recompensas?', a: 'De los anunciantes, que pagan por usuarios reales que prueban sus apps, juegos o servicios. No sale de pagos de otros usuarios.' },
  { q: '¿Cómo funcionan los referidos?', a: 'Invitas con tu código personal y recibes un porcentaje de lo que tus referidos directos obtengan en ofertas, también pagado por los anunciantes. Hay un solo nivel y nadie paga por registrarse.' },
  { q: '¿Cómo retiro mi saldo?', a: 'Los retiros se habilitarán próximamente y podrán tener un monto mínimo, verificación de cuenta y un periodo de espera para cubrir posibles reversiones.' },
];

export default function Home() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="sticky top-0 z-50 border-b border-[#E10613]/15 bg-[#0A0A0A]/90 backdrop-blur-md">
        <div className="container mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9" />
            <span className="font-extrabold text-lg tracking-tight">Red<span style={{ color: RED }}>Gain</span></span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/como-funciona" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors px-3">Cómo funciona</Link>
            <Link href="/login" className="text-sm font-semibold text-white/80 hover:text-white px-3 py-2">Ingresar</Link>
            <Link href="/register" className="text-sm font-bold px-4 py-2 rounded-lg text-white" style={{ background: RED }}>Crear cuenta gratis</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-6 pt-24 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(225,6,19,0.25), transparent 60%)' }} />
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="relative container mx-auto max-w-3xl text-center space-y-7">
            <motion.span variants={fade} className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#E10613]/40 bg-[#E10613]/10" style={{ color: RED_LIGHT }}>
              Plataforma de recompensas · Registro gratuito
            </motion.span>
            <motion.h1 variants={fade} className="text-5xl md:text-6xl font-black leading-[1.05]">
              Completa ofertas.<br /><span style={{ color: RED }}>Recibe recompensas.</span>
            </motion.h1>
            <motion.p variants={fade} className="text-lg text-white/60 leading-relaxed">
              Prueba apps, juegos y encuestas patrocinadas y acumula saldo dentro de RedGain. Las recompensas varían según tu país y no están garantizadas.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="px-7 py-3.5 rounded-xl font-bold text-white shadow-[0_0_30px_-8px_#E10613]" style={{ background: RED }}>Crear cuenta gratis</Link>
              <Link href="/como-funciona" className="px-7 py-3.5 rounded-xl font-bold border border-white/15 hover:border-[#E10613]/50 transition-colors">Ver cómo funciona</Link>
            </motion.div>
            <motion.p variants={fade} className="text-xs text-white/35">Estamos habilitando las primeras ofertas; la disponibilidad depende de cada país.</motion.p>
          </motion.div>
        </section>

        {/* Cómo funciona */}
        <section className="px-6 py-20 border-t border-white/5">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-black text-center mb-12">Así funciona</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {steps.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} className="rounded-2xl p-6 bg-[#141414] border border-[#E10613]/15">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(225,6,19,0.12)', border: '1px solid rgba(225,6,19,0.3)' }}>
                      <Icon className="w-5 h-5" style={{ color: RED_LIGHT }} />
                    </div>
                    <span className="text-xs font-bold text-white/30">PASO {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilares */}
        <section className="px-6 py-20 bg-[#0F0F0F] border-t border-white/5">
          <div className="container mx-auto max-w-5xl grid md:grid-cols-3 gap-5">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 border border-white/10">
                <Icon className="w-6 h-6 mb-4" style={{ color: RED }} />
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Referidos */}
        <section className="px-6 py-20 border-t border-white/5">
          <div className="container mx-auto max-w-3xl rounded-3xl p-8 md:p-12 text-center bg-[#141414] border border-[#E10613]/25 shadow-[0_0_60px_-20px_#E10613]">
            <Users className="w-8 h-8 mx-auto mb-4" style={{ color: RED }} />
            <h2 className="text-3xl font-black mb-4">Invita y recibe un porcentaje</h2>
            <p className="text-white/60 leading-relaxed">
              Comparte tu código personal. Cuando tus referidos directos completan ofertas, recibes un porcentaje de lo que ellos obtienen, pagado por los anunciantes. Ellos no pagan nada por registrarse y el programa tiene un solo nivel.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-20 border-t border-white/5">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-3xl font-black text-center mb-10">Preguntas frecuentes</h2>
            <div className="space-y-3">
              {faqs.map(({ q, a }, i) => (
                <div key={q} className="rounded-xl border border-white/10 bg-[#141414] overflow-hidden">
                  <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold">
                    {q}
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} style={{ color: RED_LIGHT }} />
                  </button>
                  {open === i && <p className="px-5 pb-5 text-sm text-white/55 leading-relaxed">{a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-6 py-20 text-center border-t border-white/5" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(225,6,19,0.2), transparent 60%)' }}>
          <h2 className="text-3xl md:text-4xl font-black mb-6">Empieza gratis hoy</h2>
          <Link href="/register" className="inline-block px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_30px_-8px_#E10613]" style={{ background: RED }}>Crear cuenta gratis</Link>
        </section>
      </main>

      <footer className="px-6 py-8 border-t border-white/10 text-xs text-white/35">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} RedGain. Las recompensas no están garantizadas.</p>
          <div className="flex gap-5">
            <Link href="/terminos" className="hover:text-white/70">Términos</Link>
            <Link href="/privacidad" className="hover:text-white/70">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
