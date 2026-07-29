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
  Star, Clock, Target, Briefcase, Quote,
  Lock, Globe, RefreshCw, CheckCircle2, Cpu, ExternalLink, MessageCircle
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
    { name: 'Sobre RedGain', href: '#sobre' },
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
    {
      q: '¿Puedo perder mi dinero?',
      a: 'El riesgo máximo es exactamente $10 — una sola vez. Así funciona: pagas $10 para activar tu cuenta, pero el reloj de 30 días NO arranca en ese momento. El temporizador solo empieza cuando tu primer referido realiza su pago. Si no consigues ningún referido, tu tiempo queda congelado indefinidamente: no hay renovación automática, no hay cobro adicional, no hay deuda. Solo perdiste los $10 iniciales de activación. En el momento en que alguien de tu red paga, ahí sí empieza tu cuenta regresiva de 30 días y empiezas a recibir comisiones. El sistema está diseñado así a propósito: no tienes que apresurarte ni sentir presión de tiempo desde el primer día.',
    },
    {
      q: '¿Qué pasa si no consigo ningún referido?',
      a: 'Tu cuenta permanece activa mientras pagues, pero no recibirás comisiones. No hay un mínimo de referidos obligatorio ni una penalización — simplemente, sin red no hay ingresos de comisiones. Muchos miembros empiezan con 1 o 2 personas de confianza en su círculo cercano. Si después de intentarlo sientes que no es para ti, dejas de pagar y listo, sin contratos ni deudas.',
    },
    {
      q: '¿Es esto una estafa?',
      a: 'Entendemos la pregunta y es completamente válida. La respuesta corta: no, pero tienes todo el derecho de investigarlo antes de entrar. Los pagos se hacen directamente en blockchain USDT BEP-20 — cualquier transacción es pública y verificable en bscscan.com. No hay un fondo central que "administre" tu dinero: el sistema distribuye automáticamente cada $10 entre los referidores en el mismo instante del pago. No existe promesa de rendimiento garantizado ni retorno fijo. Si alguien te prometió eso, no fue de nuestra parte.',
    },
    {
      q: '¿Es esto una pirámide ilegal?',
      a: 'Las pirámides ilegales colapsan porque el dinero de los nuevos paga a los anteriores sin ningún servicio real de por medio. En RedGain, cada $10 va directamente a los referidores que realmente construyeron esa conexión (Nivel 1, 2 y 3) y $1 a la operación de la plataforma. No hay un "pozo" central. Si mañana nadie nuevo se une, los miembros con redes activas siguen recibiendo las comisiones de sus referidos cuando estos renuevan. La distribución es automática, transparente y verificable en blockchain.',
    },
    {
      q: '¿Cuánto tiempo tarda en verse el primer resultado?',
      a: 'Depende completamente de ti y de tu red. Hay personas que refieren a su primer contacto en el primer día y reciben su primera comisión de $6 en minutos. Otras tardan semanas. No existe una garantía de tiempo. Lo que sí es inmediato: en el momento en que tu primer referido paga, la comisión llega automáticamente a tu billetera BSC — sin esperas, sin solicitudes.',
    },
    {
      q: '¿Cómo sé que las comisiones realmente llegan?',
      a: 'Cada comisión que el sistema envía genera una transacción real en la blockchain de BSC. Desde tu panel puedes ver el hash de cada transacción y verificarla tú mismo en bscscan.com en segundos. No hay intermediarios que "aprueben" el pago: el sistema lo ejecuta automáticamente y la blockchain lo registra de forma permanente e inmutable.',
    },
    {
      q: '¿Cómo se distribuyen los $10 de membresía?',
      a: '$6 van al referidor directo (Nivel 1), $2 al referidor de ese referidor (Nivel 2), $1 al siguiente nivel (Nivel 3), y $1 cubre la operación de la plataforma. No existe dinero fantasma: cada $10 tiene un destino claro, inmediato y verificable en blockchain.',
    },
    {
      q: '¿Cuándo y cómo recibo mis comisiones?',
      a: 'Automáticamente, en el instante en que alguien de tu red realiza su pago. No necesitas solicitar nada. El único requisito es tener tu billetera USDT BEP-20 registrada en tu perfil. Sin billetera registrada, el sistema no puede enviarte nada.',
    },
    {
      q: '¿Puedo cancelar en cualquier momento?',
      a: 'Sí. No hay contratos, ni permanencias mínimas, ni penalidades. Simplemente dejas de pagar. Tu cuenta pasa a pausada y tu red permanece intacta durante el período de gracia de 14 días.',
    },
    {
      q: '¿En qué países está disponible?',
      a: 'En todo el mundo. Al operar con USDT BEP-20 en blockchain, no hay restricciones geográficas ni bancarias. Cualquier persona con una billetera de criptomonedas puede unirse.',
    },
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

        {/* ── SOBRE REDGAIN ── */}
        <section id="sobre" className="py-24 lg:py-32 px-6 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <img src="/stoic-steps.jpg" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.13) saturate(0.55)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09] via-[#0E0C09]/50 to-[#0E0C09]" />
            <div className="absolute inset-0 bg-[#1A0900]/40 mix-blend-multiply" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/15 to-transparent z-10" />

          <div className="container mx-auto max-w-7xl relative z-10">

            {/* Header */}
            <div className="text-center max-w-4xl mx-auto mb-20">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-[#C9A227]/20 bg-[#C9A227]/8 text-[#E8C547] text-sm font-semibold mb-6">
                Sobre RedGain
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white mb-8 leading-tight">
                Un sistema construido para que{' '}
                <span className="bg-gradient-to-r from-[#8B6914] via-[#C9A227] to-[#E8C547] bg-clip-text text-transparent">nadie pueda robarte.</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xl text-white/60 leading-relaxed max-w-3xl mx-auto">
                RedGain nació de una sola pregunta: ¿por qué los programas de referidos dependen siempre de que alguien, en algún lugar, decida pagar? La respuesta fue eliminar al intermediario por completo. El dinero va directo a las billeteras. Sin aprobaciones. Sin esperas. Sin excusas.
              </motion.p>
            </div>

            {/* The core problem + solution */}
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Problem */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="rounded-3xl border border-white/8 bg-[#1A1208]/40 backdrop-blur-sm p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                <h3 className="text-2xl font-bold text-white mb-6">El problema con los programas tradicionales</h3>
                <ul className="space-y-5">
                  {[
                    'Prometen pagos que dependen de que "alguien" los autorice.',
                    'Acumulan el dinero en un fondo centralizado que puede desaparecer.',
                    'Los retiros tardan días, semanas, o simplemente no llegan.',
                    'No puedes verificar si las comisiones que dicen pagarte son reales.',
                    'Cuando cierran, el dinero desaparece con ellos.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/55 text-sm leading-relaxed">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center text-red-400 text-xs font-bold">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Solution */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="rounded-3xl border border-[#C9A227]/20 bg-[#1A1208]/60 backdrop-blur-sm p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 to-transparent pointer-events-none" />
                <h3 className="text-2xl font-bold text-white mb-6">Cómo RedGain lo resuelve</h3>
                <ul className="space-y-5">
                  {[
                    'Los pagos ocurren automáticamente en la blockchain. Sin ningún humano en el medio.',
                    'No existe un "fondo" central. Cada $10 se distribuye en el instante del pago.',
                    'Las comisiones llegan a tu billetera personal en segundos, no en días.',
                    'Cada pago genera un hash en BSC que cualquiera puede verificar en bscscan.com.',
                    'Aunque RedGain desapareciera mañana, tus pagos pasados están en la blockchain para siempre.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                      <CheckCircle2 className="mt-0.5 flex-shrink-0 w-5 h-5 text-[#C9A227]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Por qué blockchain */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">¿Por qué usamos blockchain?</h3>
                <p className="text-white/50 max-w-2xl mx-auto">No es tecnología por moda. Es la única forma que existe hoy de hacer que un sistema de pagos sea completamente imposible de manipular.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Lock,
                    title: 'Inmutabilidad',
                    desc: 'Una vez que una transacción se registra en la blockchain de BSC, no existe forma humana, técnica ni legal de borrarla o modificarla. Ni nosotros podemos hacerlo. Es matemáticamente permanente.',
                  },
                  {
                    icon: Globe,
                    title: 'Transparencia total',
                    desc: 'BSCScan es un explorador público. Cualquier persona, en cualquier parte del mundo, puede buscar cualquier transacción de RedGain en tiempo real sin necesidad de registrarse en ningún lado.',
                  },
                  {
                    icon: Cpu,
                    title: 'Sin intermediarios',
                    desc: 'El contrato distribuye automáticamente. No hay un empleado que "procese" el pago, no hay un banco que lo "retenga", no hay un admin que lo "apruebe". El código se ejecuta solo.',
                  },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-8 rounded-3xl bg-[#1A1208]/50 border border-[#C9A227]/12 hover:border-[#C9A227]/35 hover:bg-[#1A1208]/80 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#C9A227] group-hover:border-[#C9A227] transition-all duration-300">
                        <item.icon className="w-7 h-7 text-[#E8C547] group-hover:text-black transition-colors" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                      <p className="text-white/55 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Distribución de los $10 */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16">
              <div className="rounded-[2rem] border border-[#C9A227]/20 bg-[#1A1208]/70 backdrop-blur-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/4 to-transparent pointer-events-none" />
                <div className="p-10 lg:p-14 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <p className="text-[#C9A227]/70 text-xs font-bold uppercase tracking-[0.3em] mb-4">Transparencia total</p>
                      <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight">¿A dónde va cada dólar de tu membresía?</h3>
                      <p className="text-white/55 leading-relaxed mb-6">
                        Cuando alguien paga $10 para unirse a RedGain, ese dinero no entra en ninguna caja. Se distribuye automáticamente en el mismo instante a las billeteras reales de las personas que construyeron la red. Aquí está el desglose exacto:
                      </p>
                      <p className="text-white/40 text-sm leading-relaxed">
                        Cada distribución es verificable. Cada $10 tiene un hash de blockchain asociado. Nada es opaco. Si tienes dudas de algún pago, puedes rastrearlo en BSCScan con el hash que aparece en tu panel.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Nivel 1 — Tu referidor directo',           amount: '$6.00', pct: '60%', color: '#C9A227', barColor: 'from-[#8B6914] to-[#C9A227]' },
                        { label: 'Nivel 2 — El referidor de tu referidor',   amount: '$2.00', pct: '20%', color: '#A8871F', barColor: 'from-[#6B5010] to-[#A8871F]' },
                        { label: 'Nivel 3 — Un nivel más arriba',            amount: '$1.00', pct: '10%', color: '#7A6018', barColor: 'from-[#4A3A0A] to-[#7A6018]' },
                        { label: 'Operación de la plataforma',                amount: '$1.00', pct: '10%', color: '#4A4030', barColor: 'from-[#2A2018] to-[#4A4030]' },
                      ].map((row, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-white/65 font-medium">{row.label}</span>
                            <span className="text-sm font-extrabold" style={{ color: row.color }}>{row.amount}</span>
                          </div>
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: row.pct }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
                              className={`h-full bg-gradient-to-r ${row.barColor} rounded-full`}
                            />
                          </div>
                          <div className="text-xs text-white/30 mt-1">{row.pct} del total</div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-[#C9A227]/15 flex justify-between items-center">
                        <span className="text-white/50 text-sm font-semibold">Total distribuido</span>
                        <span className="text-[#E8C547] font-extrabold text-lg">$10.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Principios del sistema */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16">
              <div className="text-center mb-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Los principios que gobiernan el sistema</h3>
                <p className="text-white/50 max-w-2xl mx-auto">No son promesas de marketing. Son las reglas que están escritas en el código y que ningún humano puede cambiar.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: RefreshCw,
                    title: 'Pago automático',
                    desc: 'El sistema detecta cada transacción en la blockchain cada 30 segundos y distribuye las comisiones sin intervención humana.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Sin retención',
                    desc: 'RedGain nunca toca tu dinero. Las comisiones van directo de la billetera del nuevo miembro a la tuya. No pasan por nosotros.',
                  },
                  {
                    icon: ExternalLink,
                    title: 'Verificable en vivo',
                    desc: 'Cada transacción tiene un hash público en BSCScan. Puedes comprobarlo tú mismo en segundos, sin necesidad de creer en nuestra palabra.',
                  },
                  {
                    icon: Globe,
                    title: 'Sin fronteras',
                    desc: 'USDT BEP-20 funciona igual en México, Colombia, Argentina, Brasil, España o Filipinas. No hay bancos, no hay restricciones geográficas.',
                  },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-7 rounded-2xl bg-[#1A1208]/40 border border-[#C9A227]/10 hover:border-[#C9A227]/30 hover:bg-[#1A1208]/70 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center mb-5">
                      <item.icon className="w-6 h-6 text-[#E8C547]" />
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Verificar en BSCScan CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-16">
              <div className="rounded-2xl border border-[#C9A227]/15 bg-[#1A1208]/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">¿Quieres ver las transacciones reales de RedGain?</h4>
                  <p className="text-white/50 text-sm">Cualquier pago en la plataforma genera un registro público permanente en la blockchain de BNB Smart Chain.</p>
                </div>
                <a
                  href="https://bscscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#C9A227]/40 text-[#E8C547] text-sm font-bold hover:bg-[#C9A227]/10 transition-all duration-200 whitespace-nowrap"
                >
                  Verificar en BSCScan <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Honestidad sobre lo que no somos */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-16">
              <div className="rounded-[2rem] border border-white/8 bg-[#120D05]/60 backdrop-blur-sm p-10 lg:p-14 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                <div className="grid lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-6 leading-tight">Lo que RedGain <span className="text-[#C9A227]">no</span> es</h3>
                    <p className="text-white/55 leading-relaxed mb-6">
                      Preferimos que lo sepas desde el principio para que tomes una decisión informada, no una impulsiva.
                    </p>
                    <ul className="space-y-4">
                      {[
                        { label: 'No es una inversión pasiva', desc: 'No hay rendimiento garantizado. Sin referidos activos, no hay comisiones.' },
                        { label: 'No es trading ni DeFi', desc: 'No manejamos fondos de inversión, pools de liquidez ni ningún activo financiero.' },
                        { label: 'No hay retorno fijo mensual', desc: 'Los ingresos dependen 100% de la actividad de tu red, no de algún algoritmo.' },
                        { label: 'No somos anónimos por descuido', desc: 'El sistema opera con contratos y wallets verificables. La transparencia está en el código, no en las personas.' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-[#C9A227]/60" />
                          <div>
                            <span className="text-white font-semibold text-sm">{item.label}: </span>
                            <span className="text-white/50 text-sm">{item.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-white mb-6 leading-tight">Lo que RedGain <span className="text-[#C9A227]">sí</span> es</h3>
                    <p className="text-white/55 leading-relaxed mb-6">
                      Exactamente esto. Sin adornos.
                    </p>
                    <ul className="space-y-4">
                      {[
                        { label: 'Un programa de referidos', desc: 'Ganas comisiones cuando personas de tu red pagan su membresía mensual.' },
                        { label: 'Pagos en blockchain', desc: 'Cada comisión es una transacción real en BSC verificable por cualquier persona.' },
                        { label: 'Distribución a 3 niveles', desc: '$6 al nivel 1, $2 al nivel 2, $1 al nivel 3. Estructura fija. Matemática simple.' },
                        { label: 'Una herramienta, no una solución mágica', desc: 'El resultado depende de cuánto construyas tu red. La plataforma solo automatiza el pago.' },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 flex-shrink-0 w-5 h-5 text-[#C9A227]" />
                          <div>
                            <span className="text-white font-semibold text-sm">{item.label}: </span>
                            <span className="text-white/50 text-sm">{item.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contacto */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="rounded-2xl border border-[#C9A227]/20 bg-[#1A1208]/60 p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-[#E8C547]" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">¿Tienes dudas? Hay una persona real que responde.</h3>
                  <p className="text-white/55 leading-relaxed max-w-2xl mx-auto mb-8">
                    Antes de unirte, después de unirte, o simplemente si tienes alguna pregunta que no encuentras respondida aquí. Escríbenos directo por WhatsApp. Sin bots. Sin respuestas automáticas. Sin tiempos de espera.
                  </p>
                  <a
                    href="https://wa.me/5588992543996"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#8B6914] to-[#C9A227] text-black px-8 py-4 rounded-full font-bold text-base hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(201,162,39,0.5)]"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Hablar por WhatsApp
                  </a>
                  <p className="text-white/30 text-xs mt-4">Respondemos en menos de 24 horas</p>
                </div>
              </div>
            </motion.div>

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
