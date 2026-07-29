import { useState, useEffect } from 'react';
import type { Variants } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Logo } from '@/components/ui/logo';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ArrowRight, Menu, X,
  ShieldCheck, TrendingUp, Users, Zap,
  Star, Clock, Target, Briefcase, Quote
} from 'lucide-react';

// ── Stoic gold palette ────────────────────────────────────────────────────────
const GOLD       = '#C9A227';
const GOLD_LIGHT = '#E8C547';
const GOLD_DARK  = '#8B6914';
const GOLD_DIM   = '#C9A22740';

const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  const [isScrolled,      setIsScrolled]     = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen] = useState(false);
  const [referrals,       setReferrals]      = useState([5]);

  const l1Earnings    = referrals[0] * 6;
  const l2Estimate    = Math.floor(referrals[0] * 0.3) * 2;
  const monthlyEarnings = l1Earnings + l2Estimate;
  const yearlyEarnings  = monthlyEarnings * 12;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'La Solución',  href: '#solucion' },
    { name: 'Potencial',    href: '#potencial' },
    { name: 'Comunidad',    href: '#comunidad' },
    { name: 'FAQ',          href: '#faq' },
    { name: 'Cómo Funciona', href: '/como-funciona', isPage: true },
  ];

  const testimonials = [
    { name: 'Carlos M.',  country: 'Colombia', earnings: '$180/mes extra', initials: 'CM', text: 'Me sentía atrapado en mi trabajo de 8 a 6. Con 30 referidos directos activos gano $180 al mes de nivel 1, más lo que me llega de niveles 2 y 3. Ese dinero extra me devolvió la tranquilidad y pago mis deudas a tiempo.' },
    { name: 'Laura V.',   country: 'México',   earnings: '$420/mes extra', initials: 'LV', text: 'La libertad financiera es una decisión. Tomé la decisión de invitar a mi círculo de emprendedores y construí un árbol de 3 niveles. Hoy esos $420 mensuales me permiten dedicarle más tiempo a mi verdadera pasión.' },
    { name: 'Andrés R.',  country: 'Argentina', earnings: '$720/mes extra', initials: 'AR', text: '120 referidos directos activos × $6 = $720 al mes. Más lo que me llega de sus redes en niveles 2 y 3. Sin humo, sin inversiones absurdas. Matemática pura y dinero real para gente real.' },
    { name: 'Sofia P.',   country: 'Chile',    earnings: '$144/mes extra', initials: 'SP', text: 'Al principio tenía dudas. Cuando entendí que la distribución es transparente — $6 al nivel 1, $2 al nivel 2, $1 al nivel 3 — empecé a compartirla. Hoy 24 referidos activos generan $144 que cambian mi mes.' },
  ];

  const faqs = [
    { q: '¿Cómo se distribuyen los $10 de membresía?', a: 'Es matemática pura y 100% transparente. Cada suscripción de $10 se distribuye en 4 partes: $6 van al referidor directo (Nivel 1), $2 al referidor de ese referidor (Nivel 2), $1 al nivel superior (Nivel 3), y $1 financia la operación y mejora continua de la plataforma. No existe dinero fantasma: cada $10 pagado tiene un destino claro y verificable.' },
    { q: '¿Es esto una pirámide o un esquema ilegal?', a: 'No. Las pirámides colapsan porque dependen exclusivamente del reclutamiento infinito para funcionar. RedGain es un programa de referidos multinivel con distribución transparente. Si mañana no refieres a nadie más, sigues ganando de quienes ya tienes activos en los 3 niveles.' },
    { q: '¿Necesito experiencia en ventas o marketing para tener éxito?', a: 'Para nada. La propuesta de valor se explica sola: pagas $10 y puedes ganar $6 por cada persona que invites directamente, más $2 y $1 de sus redes. La mayoría de nuestros miembros exitosos simplemente comparten su experiencia real con personas de confianza.' },
    { q: '¿Cuándo y cómo puedo retirar mis ganancias?', a: 'No necesitas solicitar nada. Las comisiones se envían automáticamente a tu billetera BSC en el mismo momento en que alguien de tu red realiza su pago: $6 si es tu referido directo (Nivel 1), $2 si es un referido de tu Nivel 1, o $1 si es de Nivel 3. El único requisito es tener tu billetera USDT BEP-20 registrada en tu perfil. Una vez configurada, cada pago de tu red llega directamente a tu billetera — sin intermediarios, sin esperas, sin solicitudes.' },
    { q: '¿Qué pasa si uno de mis referidos cancela su membresía?', a: 'Solo dejas de recibir la comisión de esa persona específica desde ese mes en adelante. El resto de tu red en los 3 niveles sigue generando ingresos sin interrupción.' },
    { q: '¿Hay un límite de cuánto puedo ganar?', a: 'No existe ningún tope. Con 5 referidos directos activos ganas $30 al mes solo de Nivel 1. Con 50 referidos directos son $300/mes, más lo que suman sus propias redes en Nivel 2 y Nivel 3. La plataforma no limita tu crecimiento.' },
    { q: '¿Es seguro ingresar mis datos en la plataforma?', a: 'Sí. Toda la comunicación está cifrada con TLS. Las contraseñas se almacenan con hashing seguro. Los pagos se realizan en USDT BSC BEP-20 a una billetera verificable en blockchain — transparencia total.' },
    { q: '¿Puedo cancelar mi membresía en cualquier momento?', a: 'Sí, sin contratos ni penalidades. Si en algún momento decides que RedGain no es para ti, simplemente dejas de pagar. No hay cargos ocultos ni tarifas de cancelación.' },
    { q: '¿En qué países está disponible RedGain?', a: 'Operamos en toda Latinoamérica y el mundo. Al usar USDT BSC BEP-20 como método de pago y cobro, no hay restricciones geográficas: cualquier persona con acceso a una billetera de criptomonedas puede unirse.' },
  ];

  return (
    <div className="min-h-screen bg-[#0E0C09] text-white overflow-hidden selection:bg-[#C9A227]/30">

      {/* Ambient warm glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B6914]/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A227]/8 blur-[140px] pointer-events-none" />

      {/* ── Navbar ── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md bg-[#0E0C09]/85 border-b border-[#C9A227]/15 py-4 shadow-2xl shadow-black/60' : 'py-6'}`}>
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-xl tracking-tight text-white">RedGain</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isPage ? (
                <Link key={link.name} href={link.href} className="text-sm font-medium text-white/60 hover:text-[#E8C547] transition-colors">
                  {link.name}
                </Link>
              ) : (
                <a key={link.name} href={link.href} className="text-sm font-medium text-white/60 hover:text-[#E8C547] transition-colors">
                  {link.name}
                </a>
              )
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-[#E8C547] transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-medium bg-gradient-to-r from-[#8B6914] to-[#C9A227] text-black px-5 py-2.5 rounded-full hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(201,162,39,0.6)] font-semibold">
              Comenzar Ahora
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0E0C09]/97 backdrop-blur-xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) =>
                link.isPage ? (
                  <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-semibold text-white/80 hover:text-[#E8C547]">
                    {link.name}
                  </Link>
                ) : (
                  <a key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-semibold text-white/80 hover:text-[#E8C547]">
                    {link.name}
                  </a>
                )
              )}
              <hr className="border-[#C9A227]/20 my-4" />
              <Link href="/login" className="text-xl font-medium text-white" onClick={() => setMobileMenuOpen(false)}>Iniciar Sesión</Link>
              <Link href="/register" className="text-xl font-medium bg-gradient-to-r from-[#8B6914] to-[#C9A227] text-black text-center py-4 rounded-xl mt-4 shadow-lg font-semibold" onClick={() => setMobileMenuOpen(false)}>Comenzar Ahora</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* ── HERO ── */}
        <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden min-h-screen flex items-center">
          {/* Stoic hero background — seated Zeus statue */}
          <div className="absolute inset-0 z-0">
            <img
              src="/stoic-hero.jpg"
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.38) saturate(0.85)' }}
            />
            {/* Left-to-right fade — text on left stays readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E0C09] via-[#0E0C09]/80 to-[#0E0C09]/10" />
            {/* Top/bottom fades */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C09] via-transparent to-[#0E0C09]/50" />
            {/* Warm amber tint to unify with gold palette */}
            <div className="absolute inset-0 bg-[#2A1A00]/25 mix-blend-multiply" />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-start text-left">

                {/* Stoic badge */}
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#E8C547] text-sm font-medium mb-8">
                  <Zap className="w-4 h-4" />
                  <span>"La virtud es el único bien verdadero" — Marco Aurelio</span>
                </motion.div>

                <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
                  Tu tiempo vale más <br />
                  <span className="bg-gradient-to-r from-[#8B6914] via-[#C9A227] to-[#E8C547] bg-clip-text text-transparent">
                    de lo que te pagan.
                  </span>
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-white/65 mb-10 max-w-lg leading-relaxed">
                  Construye ingresos recurrentes que trabajan por ti mientras duermes. Únete a la comunidad que pone el control en tus manos.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B6914] to-[#C9A227] text-black px-8 py-4 rounded-full font-bold shadow-[0_0_30px_-5px_#C9A227] hover:shadow-[0_0_45px_-5px_#C9A227] transition-all hover:scale-105 active:scale-95">
                    Reclama tu libertad <ArrowRight className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/50 px-4 py-2">
                    <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                    Sin inversiones ocultas
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="mt-12 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {['CM','LV','AR','SP'].map((init, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0E0C09] flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-[#8B6914]' : i === 1 ? 'bg-[#6B4F10]' : i === 2 ? 'bg-[#5A3E0A]' : 'bg-[#3D2B07]'}`}>
                        {init}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-[#0E0C09] bg-[#2A1D08] flex items-center justify-center text-xs font-bold text-[#E8C547]">+1k</div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex text-[#C9A227]">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                    <span className="text-sm font-medium text-white/50 mt-1">Basado en 500+ reseñas</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Stoic CTA Card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative lg:ml-auto w-full max-w-lg hidden lg:block"
              >
                <div className="relative rounded-[2rem] border border-[#C9A227]/25 bg-[#1A1208]/80 backdrop-blur-xl p-10 shadow-2xl overflow-hidden flex flex-col gap-8">
                  {/* top/bottom gold lines */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/20 to-transparent" />
                  {/* ambient inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/6 via-transparent to-[#8B6914]/4 pointer-events-none" />

                  {/* Opening ornament */}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C9A227]/40" />
                    <Quote className="w-5 h-5 text-[#C9A227]/60" />
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C9A227]/40" />
                  </div>

                  {/* Main stoic quote */}
                  <div className="relative z-10 space-y-5">
                    <p className="text-2xl font-bold text-white leading-snug tracking-tight">
                      No esperes a que el mundo te entregue lo que solo tú puedes construir.{' '}
                      <span className="bg-gradient-to-r from-[#8B6914] via-[#C9A227] to-[#E8C547] bg-clip-text text-transparent">
                        El tiempo pasa igual para el cobarde y para el valiente —
                      </span>{' '}
                      la diferencia es lo que dejan atrás.
                    </p>
                    <p className="text-base text-white/50 leading-relaxed">
                      Los estoicos no esperaban condiciones perfectas. Actuaban con lo que tenían, donde estaban. Hoy tienes $10 y una decisión. Eso es suficiente para empezar a construir tu libertad financiera.
                    </p>
                  </div>

                  {/* Attribution */}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#C9A227]/30 to-transparent" />
                    <span className="text-xs font-semibold text-[#C9A227]/50 uppercase tracking-[0.2em] italic">Filosofía Estoica Aplicada</span>
                  </div>

                </div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* ── PAIN POINTS — Stoic columns background ── */}
        <section className="py-24 px-6 relative z-10 overflow-hidden">
          {/* Columns background */}
          <div className="absolute inset-0 z-0">
            <img src="/stoic-columns.jpg" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.18) saturate(0.7)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09] via-[#0E0C09]/60 to-[#0E0C09]" />
          </div>
          <div className="container mx-auto max-w-7xl relative z-10">
            {/* Stoic quote */}
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-[#C9A227]/70 text-sm font-medium italic tracking-widest mb-16 uppercase">
              "Sufres más en tu imaginación que en la realidad." — Séneca
            </motion.p>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: Clock,     title: '¿Cansado de la rutina?',  desc: 'Cambias tu tiempo por un salario fijo que apenas sube cada año. Sientes que construyes el sueño de alguien más.' },
                { icon: Target,    title: '¿Sueldo que se esfuma?',   desc: 'Llega la quincena y el dinero ya está comprometido en deudas y gastos. La inflación sube, pero tus ingresos no.' },
                { icon: Briefcase, title: '¿Miedo al riesgo?',        desc: 'Quieres más ingresos pero desconfías de inversiones milagrosas, trading complejo o esquemas piramidales falsos.' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeInUp} className="group p-8 rounded-3xl backdrop-blur-sm bg-[#1A1208]/60 border border-[#C9A227]/15 border-l-4 border-l-[#C9A227] hover:bg-[#1A1208]/90 hover:border-[#C9A227]/40 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-[#E8C547]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-white/55 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── SOLUTION ── */}
        <section id="solucion" className="py-24 lg:py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A1A00]/60 via-[#1A1208]/80 to-[#0E0C09]" />
          {/* Gold vein accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="max-w-3xl">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[#C9A227]/70 text-xs font-bold uppercase tracking-[0.3em] mb-6">
                Sabiduría Aplicada
              </motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight tracking-tight">
                La solución ya existe. <br />
                <span className="bg-gradient-to-r from-[#8B6914] via-[#C9A227] to-[#E8C547] bg-clip-text text-transparent">Y es ridículamente simple.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="text-2xl md:text-3xl font-medium text-white/60 leading-snug">
                Únete a la comunidad. Invita personas. <br className="hidden md:block" /> Gana ingresos recurrentes cada mes.
              </motion.p>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-24 lg:py-32 px-6 relative overflow-hidden">
          {/* Stoic temple background */}
          <div className="absolute inset-0 z-0">
            <img src="/stoic-login.jpg" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.17) saturate(0.65)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09] via-[#0E0C09]/45 to-[#0E0C09]" />
            <div className="absolute inset-0 bg-[#1A0E00]/25 mix-blend-multiply" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/25 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/15 to-transparent z-10" />
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/8 text-[#E8C547] text-sm font-semibold mb-6">
                Por qué somos diferentes
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                Transparencia total, <span className="text-[#C9A227]">resultados reales</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg text-white/55">
                El mercado está lleno de ilusiones. Nosotros construimos un sistema basado en transparencia absoluta y control del usuario.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: ShieldCheck, title: 'Cero Riesgo',           desc: 'Pagas $10/mes y ganas $6 por cada referido directo (N1), $2 por los referidos de ellos (N2) y $1 por el nivel siguiente (N3). Matemática clara.' },
                { icon: TrendingUp,  title: 'Ingresos Recurrentes',  desc: 'No es una venta de una sola vez. Mientras tu red esté activa en los 3 niveles, cobras tu comisión cada mes de forma automática.' },
                { icon: Users,       title: 'Comunidad Real',        desc: 'No estás solo. Construyes un árbol de 3 niveles que trabaja por ti: cada persona que invitas puede traer más personas, y tú ganas de todos.' },
              ].map((feat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-8 rounded-3xl backdrop-blur-sm bg-[#1A1208]/50 border border-[#C9A227]/12 hover:bg-[#1A1208]/80 hover:border-[#C9A227]/35 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-[#C9A227]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#C9A227] group-hover:border-[#C9A227] transition-all duration-300">
                      <feat.icon className="w-7 h-7 text-[#E8C547] group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feat.title}</h3>
                    <p className="text-white/55 leading-relaxed text-sm">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS — Stoic philosopher background ── */}
        <section className="py-24 lg:py-32 px-6 relative overflow-hidden">
          {/* Stoic ruins background */}
          <div className="absolute inset-0 z-0">
            <img src="/stoic-steps.jpg" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.20) saturate(0.6)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09] via-[#0E0C09]/50 to-[#0E0C09]" />
          </div>

          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[#C9A227]/60 text-xs font-bold uppercase tracking-[0.3em] mb-4">
                "El camino más largo empieza con un solo paso." — Epicteto
              </motion.p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">Tres pasos para empezar a ganar</h2>
              <p className="text-lg text-white/55">Así de simple es construir ingresos recurrentes con RedGain.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent" />
              {[
                { step: '01', title: 'Únete por $10/mes',         desc: 'Activa tu membresía con una suscripción mensual de solo $10. Desde el primer día tienes acceso a tu panel y enlace único.' },
                { step: '02', title: 'Invita a tu red',           desc: 'Comparte tu enlace de referido con amigos, familia y contactos. Cada persona que se una activa comisiones para ti en hasta 3 niveles.' },
                { step: '03', title: 'Cobra hasta $9 por árbol',  desc: 'Ganas $6 por cada referido directo (N1), $2 por los que ellos traigan (N2) y $1 por el nivel 3. Sin límite de referidos. Sin techo de ingresos.' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="relative flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-[#0E0C09] border border-[#C9A227]/30 flex items-center justify-center text-3xl font-extrabold text-[#C9A227] z-10 mb-8 relative shadow-[0_0_30px_-10px_#C9A227]">
                    <div className="absolute inset-0 rounded-full border-[3px] border-[#C9A227] border-t-transparent opacity-60 rotate-45" />
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-white/55 leading-relaxed max-w-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INCOME CALCULATOR ── */}
        <section id="potencial" className="py-24 lg:py-32 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/8 text-[#E8C547] text-sm font-semibold mb-6">
                  Calcula tu potencial
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Visualiza tu crecimiento.</h2>
                <p className="text-xl text-white/55 mb-8 leading-relaxed">
                  Con solo 2 referidos directos activos ya cubres tu suscripción de $10. A partir del tercero todo es ganancia pura.
                </p>
                <div className="rounded-3xl p-8 mb-8 bg-[#1A1208]/60 border border-[#C9A227]/15 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/60 font-bold text-lg">Tu comunidad:</span>
                    <span className="text-2xl font-extrabold text-[#C9A227]">{referrals[0]} personas</span>
                  </div>
                  <Slider defaultValue={[5]} max={100} min={1} step={1} onValueChange={setReferrals} className="py-4 cursor-pointer" />
                  <div className="mt-4 text-sm text-white/35 flex justify-between">
                    <span>1 persona</span><span>100 personas</span>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/20 to-[#8B6914]/10 rounded-3xl blur-2xl -z-10" />
                <div className="relative rounded-[2.5rem] p-10 md:p-14 text-center overflow-hidden border border-[#C9A227]/20 bg-[#1A1208]/70 backdrop-blur-xl shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
                  <h3 className="text-sm font-bold text-white/40 tracking-widest uppercase mb-4">Ingreso Recurrente Mensual</h3>
                  <div className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#8B6914] via-[#C9A227] to-[#E8C547] mb-8">
                    ${monthlyEarnings}
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-4 mb-6 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#8B6914] to-[#E8C547] rounded-full"
                      initial={{ width: '5%' }}
                      animate={{ width: `${Math.max(5, referrals[0])}%` }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    />
                  </div>
                  <div className="text-white/55 font-bold text-lg">
                    Ganancia anual: <strong className="text-[#E8C547]">${yearlyEarnings.toLocaleString()} USD</strong>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/20 px-2 py-2">
                      <div className="text-xs text-[#E8C547] font-bold">Nivel 1</div>
                      <div className="text-sm font-extrabold text-white">${referrals[0] * 6}</div>
                      <div className="text-[10px] text-white/35">{referrals[0]} × $6</div>
                    </div>
                    <div className="rounded-xl bg-[#8B6914]/10 border border-[#8B6914]/20 px-2 py-2">
                      <div className="text-xs text-[#C9A227] font-bold">Nivel 2</div>
                      <div className="text-sm font-extrabold text-white">+${l2Estimate}</div>
                      <div className="text-[10px] text-white/35">estimado</div>
                    </div>
                    <div className="rounded-xl bg-[#C9A227]/8 border border-[#C9A227]/15 px-2 py-2">
                      <div className="text-xs text-[#E8C547] font-bold">Total</div>
                      <div className="text-sm font-extrabold text-white">${monthlyEarnings}</div>
                      <div className="text-[10px] text-white/35">al mes</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-white/25">N1: $6 · N2: $2 · N3: $1 por referido activo</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="comunidad" className="py-24 lg:py-32 px-6 relative overflow-hidden">
          {/* Stoic banquet background */}
          <div className="absolute inset-0 z-0">
            <img src="/stoic-banquet.jpg" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.18) saturate(0.65)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09] via-[#0E0C09]/40 to-[#0E0C09]" />
            <div className="absolute inset-0 bg-[#1A0E00]/30 mix-blend-multiply" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/25 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/15 to-transparent z-10" />
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/8 text-[#E8C547] text-sm font-semibold mb-6">
                Historias Reales
              </motion.div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">Personas comunes tomando el control.</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-3xl bg-[#1A1208]/50 border border-[#C9A227]/12 hover:border-[#C9A227]/30 transition-colors flex flex-col justify-between relative">
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-[#C9A227]/15" />
                  <div className="inline-flex px-3 py-1 rounded-full bg-[#C9A227]/10 text-[#E8C547] text-xs font-bold mb-6 w-fit border border-[#C9A227]/20">
                    {t.earnings}
                  </div>
                  <p className="text-white/60 flex-1 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#C9A227]/12">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black ${i === 0 ? 'bg-[#C9A227]' : i === 1 ? 'bg-[#A8871F]' : i === 2 ? 'bg-[#8B6914]' : 'bg-[#6B5010]'}`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-white/40">{t.country}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 lg:py-32 px-6 relative overflow-hidden">
          {/* Marcus Aurelius background */}
          <div className="absolute inset-0 z-0">
            <img src="/dash-aurelius.jpg" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.16) saturate(0.60)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09] via-[#0E0C09]/45 to-[#0E0C09]" />
            <div className="absolute inset-0 bg-[#1A0E00]/30 mix-blend-multiply" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/25 to-transparent" />
          <div className="container mx-auto max-w-3xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">Preguntas frecuentes</h2>
              <p className="text-lg text-white/50">Transparencia es nuestro valor central. Aquí están las respuestas honestas.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-[#1A1208]/60 border border-[#C9A227]/12 rounded-2xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left text-white font-semibold py-6 hover:no-underline hover:text-[#E8C547] transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/55 pb-6 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── CTA — Stoic warrior bust background ── */}
        <section className="py-24 lg:py-32 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative rounded-[3rem] overflow-hidden p-12 lg:p-20">
              {/* Stoic bust background */}
              <div className="absolute inset-0 z-0">
                <img src="/stoic-cta.jpg" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.22) saturate(0.6)' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2A1A00]/90 via-[#1A1208]/80 to-[#0E0C09]/90" />
              </div>
              {/* Gold border */}
              <div className="absolute inset-0 rounded-[3rem] border border-[#C9A227]/30" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A227]/70 to-transparent rounded-t-[3rem]" />
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent rounded-b-[3rem]" />

              <div className="relative z-10">
                <p className="text-[#C9A227]/70 text-xs font-bold uppercase tracking-[0.3em] mb-6">
                  "Actúa como si lo que haces hiciera diferencia. Lo hace." — William James
                </p>
                <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                  La decisión más fácil<br />de tu vida financiera.
                </h2>
                <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto font-medium">
                  $10 al mes. Sin contratos. Sin riesgo. Cancela cuando quieras. Empieza a ganar desde tu primer referido.
                </p>
                <Link href="/register" className="inline-flex items-center gap-3 bg-gradient-to-r from-[#8B6914] to-[#C9A227] text-black px-10 py-5 rounded-full font-bold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_#C9A227]">
                  Comenzar Ahora <ArrowRight className="w-6 h-6" />
                </Link>
                <div className="mt-8 flex items-center justify-center gap-2 text-[#C9A227]/60 text-sm font-semibold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Sin riesgo · Sin contratos · Cancela cuando quieras</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#C9A227]/15 py-12 px-6 bg-[#0A0805]">
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/25 to-transparent -mt-px" />
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo className="w-7 h-7" />
            <span className="font-bold text-white/75">RedGain</span>
          </div>
          <p className="text-sm text-white/35 text-center italic">
            © {new Date().getFullYear()} RedGain. "Controla lo que puedes controlar."
          </p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/terminos"   className="hover:text-[#E8C547] transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-[#E8C547] transition-colors">Privacidad</Link>
            <Link href="/login"      className="hover:text-[#E8C547] transition-colors">Iniciar Sesión</Link>
            <Link href="/register"   className="hover:text-[#E8C547] transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
