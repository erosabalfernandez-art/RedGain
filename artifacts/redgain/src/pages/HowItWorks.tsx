import React from 'react';
import { Link, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Users, Clock, AlertTriangle,
  XCircle, Wallet, Phone, Shield, Zap, Quote, RefreshCw, CheckCircle
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const fade = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

// Reusable step badge
function StepBadge({ n, warm = true }: { n: number; warm?: boolean }) {
  return warm ? (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B6914] to-[#C9A227] flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_20px_-5px_#C9A227] shrink-0">
      {n}
    </div>
  ) : (
    <div className="w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-sm shrink-0">
      {n}
    </div>
  );
}

// Full-width section bg helper
function SectionBg({ src, brightness = 0.22, children }: { src: string; brightness?: number; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={src} alt="" className="w-full h-full object-cover object-center" style={{ filter: `brightness(${brightness}) saturate(0.75)` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09]/70 via-[#0E0C09]/30 to-[#0E0C09]/70" />
        <div className="absolute inset-0 bg-[#1A0E00]/30 mix-blend-multiply" />
      </div>
      {/* gold line top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/35 to-transparent z-10" />
      {/* gold line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/20 to-transparent z-10" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

// Plain dark section (used between images so the sequence breathes)
function PlainSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative bg-[#0E0C09] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1208]/60 via-[#0E0C09] to-[#0E0C09]" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/20 to-transparent" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export default function HowItWorks() {
  const search = useSearch();
  const fromDashboard = search.includes('from=dashboard');
  const backHref = fromDashboard ? '/dashboard' : '/';
  const backLabel = fromDashboard ? 'Volver al panel' : 'Volver al inicio';

  return (
    <div className="min-h-screen bg-[#0E0C09] text-white selection:bg-[#C9A227]/30">

      {/* Ambient warm glows (fixed, behind everything) */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B6914]/10 blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A227]/6 blur-[160px] pointer-events-none z-0" />

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-[#C9A227]/15 bg-[#0E0C09]/88 backdrop-blur-md px-6 h-16 flex items-center justify-between">
        <Link href={fromDashboard ? '/dashboard' : '/'} className="flex items-center gap-2.5 font-bold text-white hover:opacity-80 transition-opacity">
          <Logo className="w-6 h-6 text-[#C9A227]" />
          <span>RedGain</span>
        </Link>
        {fromDashboard ? (
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-[#E8C547] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al panel
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login"    className="text-sm font-medium text-white/60 hover:text-[#E8C547] transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-[#8B6914] to-[#C9A227] text-black rounded-lg hover:opacity-90 transition-all hover:scale-105">
              Comenzar
            </Link>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════
          01 · HERO — stoic philosopher in marble hall
      ══════════════════════════════════════════════ */}
      <SectionBg src="/stoic-howitworks.jpg" brightness={0.30}>
        <div className="max-w-4xl mx-auto px-6 py-28 text-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-start mb-8">
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-[#E8C547] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {backLabel}
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fade}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#E8C547] text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              "El conocimiento es el principio de la acción." — Epicteto
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Cómo funciona{' '}
              <span className="bg-gradient-to-r from-[#8B6914] via-[#C9A227] to-[#E8C547] bg-clip-text text-transparent">
                RedGain
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Todo lo que necesitas saber antes de unirte. Sin letra pequeña, sin sorpresas.
            </p>
          </motion.div>
        </div>
      </SectionBg>

      {/* ══════════════════════════════════════════════
          02 · EL PRECIO — stoic columns
      ══════════════════════════════════════════════ */}
      <SectionBg src="/stoic-columns.jpg" brightness={0.18}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-3 mb-10">
              <StepBadge n={1} />
              <h2 className="text-2xl font-bold text-white">El precio de acceso</h2>
            </motion.div>
            <motion.div variants={fade} className="rounded-3xl bg-[#1A1208]/80 border border-[#C9A227]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <p className="text-white/65 leading-relaxed">
                    Unirte a RedGain cuesta <strong className="text-white">$10 USD</strong>. Este es el precio fijo de la membresía mensual.
                    Una vez dentro, puedes invitar a otras personas y ganar comisiones por cada una que se una y pague.
                  </p>
                  <div className="mt-4 p-4 rounded-2xl bg-[#C9A227]/8 border border-[#C9A227]/20">
                    <p className="text-sm text-[#E8C547] font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      ¿Quieres ofrecer un precio menor a $10?
                    </p>
                    <p className="text-sm text-white/55 mt-1">
                      Debes contactar a nuestro equipo por WhatsApp{' '}
                      <a href="https://wa.me/5588992543996" target="_blank" rel="noopener noreferrer" className="text-[#E8C547] font-semibold hover:text-[#C9A227] transition-colors">
                        +55 8899 2543 996
                      </a>
                      . La diferencia se descuenta de tu propia comisión — los $9 del árbol y el $1 de la plataforma nunca cambian.
                    </p>
                  </div>
                </div>
                <div className="bg-[#0E0C09]/90 border border-[#C9A227]/25 rounded-2xl p-5 min-w-[220px]">
                  <p className="text-xs text-[#C9A227]/70 font-bold uppercase tracking-wider mb-4">Distribución de cada $10</p>
                  {[
                    { label: 'Tu referidor directo (Nivel 1)', amount: '$6', color: 'text-[#E8C547]' },
                    { label: 'Referidor de nivel 2',           amount: '$2', color: 'text-[#C9A227]' },
                    { label: 'Referidor de nivel 3',           amount: '$1', color: 'text-[#8B6914]' },
                    { label: 'Plataforma (equipo)',             amount: '$1', color: 'text-white/40' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-[#C9A227]/10 last:border-0">
                      <span className="text-xs text-white/45">{row.label}</span>
                      <span className={`text-sm font-bold ${row.color}`}>{row.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 mt-1">
                    <span className="text-xs font-bold text-white">Total</span>
                    <span className="text-sm font-extrabold text-[#E8C547]">$10</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </SectionBg>

      {/* ══════════════════════════════════════════════
          03 · 3 NIVELES — stoic hero statue
      ══════════════════════════════════════════════ */}
      <SectionBg src="/stoic-hero.jpg" brightness={0.20}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-3 mb-10">
              <StepBadge n={2} />
              <h2 className="text-2xl font-bold text-white">Sistema de 3 niveles de referidos</h2>
            </motion.div>
            <motion.div variants={fade} className="space-y-4">
              <p className="text-white/60 leading-relaxed">
                Cuando invitas a alguien (nivel 1), ganas $6 por ellos. Pero también ganas cuando las personas que ellos invitan pagan — y hasta un nivel más abajo:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { level: 1, title: 'Nivel 1', sub: 'Tus referidos directos',  amount: '$6', border: 'border-[#C9A227]/35 bg-[#C9A227]/8',  badge: 'text-[#E8C547] bg-[#C9A227]/12 border-[#C9A227]/35', desc: 'Cada persona que tú invitas directamente y activa su cuenta.' },
                  { level: 2, title: 'Nivel 2', sub: 'Sus referidos',            amount: '$2', border: 'border-[#8B6914]/30 bg-[#8B6914]/6',  badge: 'text-[#C9A227] bg-[#8B6914]/12 border-[#8B6914]/35', desc: 'Cada persona que es invitada por alguien de tu nivel 1.' },
                  { level: 3, title: 'Nivel 3', sub: 'Sus referidos',            amount: '$1', border: 'border-[#C9A227]/15 bg-[#C9A227]/4',  badge: 'text-[#C9A227]/70 bg-[#C9A227]/8 border-[#C9A227]/20', desc: 'Cada persona que es invitada por alguien de tu nivel 2.' },
                ].map(({ level, title, sub, amount, border, badge, desc }) => (
                  <div key={level} className={`border ${border} rounded-2xl p-5 backdrop-blur-sm`}>
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-xs font-bold ${badge}`}>{title}</span>
                    <p className="mt-3 text-3xl font-extrabold text-white">{amount}</p>
                    <p className="text-sm font-semibold text-white/80 mt-1">{sub}</p>
                    <p className="text-xs text-white/45 mt-2 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-[#1A1208]/80 border border-[#C9A227]/20 p-5 backdrop-blur-md">
                <p className="text-sm font-semibold text-[#E8C547] mb-2">Ejemplo real:</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Invitas a <strong className="text-white">Ana (N1)</strong> → ganas $6. Ana invita a <strong className="text-white">Pedro (N2)</strong> → ganas $2. Pedro invita a <strong className="text-white">Luis (N3)</strong> → ganas $1.
                  Con solo 3 personas activas en tu árbol, ganas <strong className="text-[#E8C547]">$9 por mes</strong>.
                </p>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </SectionBg>

      {/* ══════════════════════════════════════════════
          04 · TEMPORIZADOR — stoic steps / ruins
      ══════════════════════════════════════════════ */}
      <SectionBg src="/stoic-steps.jpg" brightness={0.20}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-3 mb-10">
              <StepBadge n={3} />
              <h2 className="text-2xl font-bold text-white">Temporizador de membresía</h2>
            </motion.div>
            <motion.div variants={fade}>
              <div className="rounded-3xl bg-[#1A1208]/80 border border-[#C9A227]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />
                <div className="space-y-6">
                  {[
                    { icon: Wallet, title: 'Pagas los $10',             desc: 'El equipo confirma tu pago. Tu cuenta queda activa, pero el temporizador de 30 días aún NO empieza. Tienes tiempo para buscar a tu primera persona sin presión.',          color: 'text-[#E8C547] bg-[#C9A227]/12 border-[#C9A227]/20' },
                    { icon: Users,  title: 'Unes a tu primera persona', desc: 'En cuanto tu primer referido activa su cuenta, TU temporizador empieza a correr. A partir de ese momento tienes exactamente 30 días de membresía activa.',              color: 'text-[#C9A227] bg-[#8B6914]/12 border-[#8B6914]/20' },
                    { icon: Clock,  title: 'Temporizador visible',      desc: 'En tu dashboard verás una cuenta regresiva en tiempo real mostrando cuántos días te quedan antes de que venza tu membresía.',                                              color: 'text-white/60 bg-white/5 border-white/10' },
                  ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="flex gap-5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{title}</p>
                        <p className="text-sm text-white/50 mt-1 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </SectionBg>

      {/* ══════════════════════════════════════════════
          05 · VENCIMIENTO — stoic register (emperor)
      ══════════════════════════════════════════════ */}
      <SectionBg src="/stoic-expiry.jpg" brightness={0.22}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-3 mb-10">
              <StepBadge n={4} warm={false} />
              <h2 className="text-2xl font-bold text-white">Qué pasa cuando vence tu membresía</h2>
            </motion.div>
            <motion.div variants={fade} className="space-y-4">
              <div className="border border-orange-500/20 bg-orange-500/5 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-3 mb-5">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-orange-300/90 font-medium">
                    Si tu membresía vence y NO renuevas a tiempo, tu cuenta se pausa, pierdes acceso a tus comisiones y tu código de referido se desactiva.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { phase: 'Mes vencido',          icon: XCircle,       color: 'text-orange-400', desc: 'Tu cuenta queda "Pausada". Tu código de referido queda inutilizado — nadie puede unirse con él.' },
                    { phase: '2 semanas de gracia',  icon: Clock,         color: 'text-yellow-400', desc: 'Tienes 14 días para pagar la renovación y reactivar tu cuenta. Durante este tiempo NO cobras comisiones.' },
                    { phase: 'Sin renovación',       icon: XCircle,       color: 'text-red-400',    desc: 'Tu cuenta queda "Perdida". Pierdes TODO tu árbol de referidos y debes empezar desde cero.' },
                  ].map(({ phase, icon: Icon, color, desc }) => (
                    <div key={phase} className="bg-[#0E0C09]/80 border border-[#C9A227]/10 rounded-2xl p-4">
                      <Icon className={`w-5 h-5 ${color} mb-2`} />
                      <p className={`text-sm font-bold ${color}`}>{phase}</p>
                      <p className="text-xs text-white/40 mt-1.5 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-400/90 font-medium">
                  <strong>IMPORTANTE:</strong> Si tu cuenta está pausada o perdida, tu código de referido queda completamente inutilizado. Nadie podrá unirse usando tu código mientras no tengas una membresía activa.
                </p>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </SectionBg>

      {/* ══════════════════════════════════════════════
          05 · VENTANA DE RENOVACIÓN
      ══════════════════════════════════════════════ */}
      <PlainSection>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-3 mb-10">
              <StepBadge n={5} />
              <h2 className="text-2xl font-bold text-white">Cómo renovar sin perder ni un segundo</h2>
            </motion.div>
            <motion.div variants={fade} className="space-y-6">
              <div className="rounded-3xl border border-[#C9A227]/25 p-6 md:p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(14,10,5,0.95) 100%)' }}>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-6 h-6 text-[#E8C547]" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white mb-2">La ventana de renovación: días 29 y 30</p>
                    <p className="text-white/60 leading-relaxed">
                      En los últimos 2 días de tu ciclo (días 29 y 30 de los 30), el sistema te habilita para renovar.
                      Si pagas en esos días y el equipo aprueba tu pago antes de que venza tu membresía,
                      el nuevo ciclo de 30 días comienza exactamente donde termina el actual.{' '}
                      <strong className="text-[#E8C547]">Cero segundos de pausa. Cero comisiones perdidas.</strong>
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-[#1A1208]/80 border border-[#C9A227]/15 p-6 md:p-8 backdrop-blur-md">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-6">Tu ciclo de 30 días</p>
                <div className="h-3 rounded-full overflow-hidden flex mb-2">
                  <div className="flex-[28] bg-emerald-500/40 border-r border-[#0E0C09]" />
                  <div className="flex-[2] bg-red-500/70" />
                </div>
                <div className="flex justify-between text-xs text-white/40 mb-6">
                  <span>Día 1</span>
                  <span className="text-red-400 font-bold">Días 29-30</span>
                  <span>Día 30</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: 'Días 1–28', icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/5', title: 'Zona segura', desc: 'Tu cuenta está activa. Ganas comisiones, tu código funciona.' },
                    { label: 'Días 29–30', icon: RefreshCw, color: 'text-red-400', border: 'border-red-500/40 bg-red-500/8', title: '🔴 Renueva AHORA', desc: 'Ventana de renovación abierta. Paga aquí. El equipo aprueba antes del vencimiento y tu nuevo ciclo empieza sin interrupciones.' },
                    { label: 'Día 31+', icon: XCircle, color: 'text-orange-400', border: 'border-orange-500/20 bg-orange-500/5', title: 'Cuenta pausada', desc: 'La cuenta se pausa. 14 días de gracia para recuperarla, pero sin comisiones durante ese tiempo.' },
                  ].map(({ label, icon: Icon, color, border, title, desc }) => (
                    <div key={label} className={`rounded-2xl border p-4 ${border}`}>
                      <p className={`text-[10px] font-extrabold uppercase tracking-wider ${color} mb-2`}>{label}</p>
                      <Icon className={`w-5 h-5 ${color} mb-2`} />
                      <p className={`text-sm font-bold ${color}`}>{title}</p>
                      <p className="text-xs text-white/40 mt-1.5 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-[#1A1208]/80 border border-[#C9A227]/15 p-6 md:p-8 backdrop-blur-md">
                <p className="text-sm font-bold text-white mb-5">Paso a paso en los días 29-30:</p>
                <ol className="space-y-4">
                  {[
                    'Tu dashboard muestra el aviso de "Ventana de renovación abierta" con el contador en rojo.',
                    'Vas a la sección Pagos y envías $10 USDT desde tu billetera registrada.',
                    'El sistema detecta el pago automáticamente (o el equipo lo verifica).',
                    'El equipo aprueba mientras tu cuenta sigue activa. Tu nuevo ciclo empieza donde termina el actual.',
                    'Tu cuenta jamás pasa a "Pausada". Tu código sigue activo, tus comisiones siguen fluyendo.',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#E8C547] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-sm text-white/55 leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="p-4 rounded-2xl bg-[#C9A227]/5 border border-[#C9A227]/25 flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#E8C547] shrink-0 mt-0.5" />
                <p className="text-sm text-[#E8C547]/80 leading-relaxed">
                  <strong className="text-[#E8C547]">La clave:</strong> no esperes hasta después del vencimiento.
                  Los días 29 y 30 son tu ventana segura. Actúa en esos días y tu árbol de referidos jamás se interrumpe.
                </p>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </PlainSection>

      {/* ══════════════════════════════════════════════
          06 · CICLO DE PAGOS — forum / dash-forum
      ══════════════════════════════════════════════ */}
      <SectionBg src="/dash-forum.jpg" brightness={0.18}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-3 mb-10">
              <StepBadge n={6} />
              <h2 className="text-2xl font-bold text-white">Ciclo de pagos y comisiones</h2>
            </motion.div>
            <motion.div variants={fade} className="space-y-4">
              <div className="rounded-3xl bg-[#1A1208]/80 border border-[#C9A227]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Comisiones inmediatas</p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Cuando alguien nuevo se une, las comisiones de los referidores de nivel 1, 2 y 3 se calculan <strong className="text-white">al instante</strong>. El equipo procesa el pago tan pronto confirma el ingreso.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Comisiones de renovación</p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Las renovaciones mensuales se procesan en ciclo fijo: <strong className="text-white">día 10</strong> es el corte y el <strong className="text-white">día 15</strong> el equipo distribuye las comisiones.
                    </p>
                  </div>
                </div>
                <div className="mt-6 border-t border-[#C9A227]/12 pt-6">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">Ciclo mensual de renovaciones</p>
                  <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {[
                      { day: 'Día 1',  label: 'Inicio del ciclo',                 color: 'bg-[#C9A227]/10 border-[#C9A227]/30 text-[#E8C547]' },
                      { day: 'Día 10', label: 'Corte: último día para renovar',   color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
                      { day: 'Día 15', label: 'Distribución de comisiones',       color: 'bg-[#8B6914]/15 border-[#8B6914]/30 text-[#C9A227]' },
                    ].map((step, i) => (
                      <React.Fragment key={step.day}>
                        <div className={`shrink-0 border rounded-xl px-4 py-3 text-center ${step.color}`}>
                          <p className="text-sm font-extrabold">{step.day}</p>
                          <p className="text-xs mt-0.5 max-w-[120px]">{step.label}</p>
                        </div>
                        {i < 2 && <div className="shrink-0 w-8 h-px bg-[#C9A227]/20 mx-1" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#C9A227]/5 border border-[#C9A227]/20">
                <p className="text-xs text-[#E8C547]/80 font-medium flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>¿Renuevas después del día 10? Tu cuenta se mantiene activa y no pierdes tu árbol, pero tus referidores cobrarán su comisión el día 15 del mes siguiente.</span>
                </p>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </SectionBg>

      {/* ══════════════════════════════════════════════
          07 · CÓMO PAGAR — Marcus Aurelius
      ══════════════════════════════════════════════ */}
      <SectionBg src="/dash-aurelius.jpg" brightness={0.22}>
        <div className="max-w-4xl mx-auto px-6 py-24">
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-3 mb-10">
              <StepBadge n={7} />
              <h2 className="text-2xl font-bold text-white">Cómo funciona el pago</h2>
            </motion.div>
            <motion.div variants={fade}>
              <div className="rounded-3xl bg-[#1A1208]/80 border border-[#C9A227]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Solo USDT en la red BSC (BEP20)</p>
                    <p className="text-sm text-white/50 leading-relaxed">
                      Todos los pagos se realizan en USDT (Tether) en la red Binance Smart Chain (BEP20). Si deseas pagar de otra forma, contáctanos por WhatsApp.
                    </p>
                    <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-[#0E0C09]/80 border border-[#C9A227]/15">
                      <Wallet className="w-5 h-5 text-[#E8C547] shrink-0" />
                      <div>
                        <p className="text-xs text-white/40">Billetera USDT BSC BEP20</p>
                        <p className="text-xs font-mono text-white/80 break-all">0x2E5321848a874f5d43C9B0f59caE3e07DFC8D449</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#C9A227]/12 pt-5">
                    <p className="text-sm font-bold text-white mb-3">Flujo del pago</p>
                    <ol className="space-y-3">
                      {[
                        'Envías $10 USDT a la billetera del equipo.',
                        'Subes tu comprobante de pago en tu dashboard.',
                        'El equipo verifica el pago y activa tu cuenta manualmente.',
                        'Una vez activo, el equipo envía las comisiones a cada referidor en el árbol.',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/55">
                          <span className="w-5 h-5 rounded-full bg-[#C9A227]/15 text-[#E8C547] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#C9A227]/25">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="border-t border-[#C9A227]/12 pt-5 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-[#E8C547]" />
                        Atención al cliente
                      </p>
                      <a href="https://wa.me/5588992543996" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#E8C547] hover:text-[#C9A227] transition-colors">
                        WhatsApp: +55 8899 2543 996 →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </SectionBg>

      {/* ══════════════════════════════════════════════
          08 · CTA FINAL — stoic cta
      ══════════════════════════════════════════════ */}
      <SectionBg src="/stoic-cta.jpg" brightness={0.20}>
        <div className="max-w-4xl mx-auto px-6 py-28 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A227]/35 bg-[#C9A227]/10 text-[#E8C547] text-xs font-medium mb-6">
              <Quote className="w-3 h-3" />
              "Actúa como si lo que haces hiciera diferencia. Lo hace." — William James
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">¿Listo para empezar?</h3>
            <p className="text-white/55 mb-10 max-w-md mx-auto text-lg">
              Únete hoy por $10 y empieza a construir tu árbol de ingresos recurrentes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8B6914] to-[#C9A227] text-black rounded-full font-bold hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_30px_-5px_#C9A227]">
                Comenzar ahora <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-[#E8C547] transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {backLabel}
              </Link>
            </div>
          </motion.div>
        </div>
      </SectionBg>

    </div>
  );
}
