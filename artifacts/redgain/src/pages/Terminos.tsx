import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, ShieldCheck, Coins, Users, RefreshCw, Ban, AlertTriangle, FileText } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const GOLD = '#C9A227';
const GOLD_LIGHT = '#E8C547';

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<any>; title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fade} className="rounded-2xl p-6 space-y-3" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)' }}>
          <Icon className="w-4.5 h-4.5" style={{ color: GOLD_LIGHT }} />
        </div>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2 text-sm text-white/55 leading-relaxed pl-1">{children}</div>
    </motion.div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GOLD }} />
      <p>{children}</p>
    </div>
  );
}

export default function Terminos() {
  return (
    <div className="min-h-screen bg-[#0A0805] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#C9A227]/15 bg-[#0A0805]/90 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo className="w-6 h-6" />
            <span className="font-bold text-sm" style={{ color: GOLD_LIGHT }}>RedGain</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 py-16">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">

          {/* Header */}
          <motion.div variants={fade} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" style={{ color: GOLD }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Documento legal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Términos y Condiciones</h1>
            <p className="text-sm text-white/35">Última actualización: julio 2025 · Al registrarte o usar RedGain aceptas estos términos en su totalidad.</p>
          </motion.div>

          {/* 1. El servicio */}
          <Section icon={ShieldCheck} title="1. El servicio">
            <Item>RedGain es una plataforma de membresía por referidos. Al registrarte aceptas que tu participación es voluntaria y que comprendes el modelo de funcionamiento.</Item>
            <Item>RedGain no es un esquema de inversión, no garantiza ingresos fijos ni rendimientos. Las ganancias dependen exclusivamente de la actividad de tu red de referidos.</Item>
            <Item>El equipo de RedGain se reserva el derecho de modificar, suspender o discontinuar cualquier parte del servicio con notificación previa dentro de la plataforma.</Item>
          </Section>

          {/* 2. Membresía */}
          <Section icon={RefreshCw} title="2. Membresía">
            <Item>El costo de membresía es de <strong className="text-white/80">$10 USDT</strong> por ciclo de 30 días.</Item>
            <Item>Tu membresía vence automáticamente al finalizar el ciclo. Si no renuevas, entras en un período de gracia de <strong className="text-white/80">14 días</strong> durante los cuales tu código queda inutilizado y no generas comisiones, pero conservas tu árbol.</Item>
            <Item>Si no renuevas dentro del período de gracia, pierdes tu árbol de referidos completo y debes empezar de cero.</Item>
            <Item>Puedes renovar en los <strong className="text-white/80">días 29 y 30</strong> de tu ciclo activo. Si el equipo aprueba el pago antes del vencimiento, tu nuevo ciclo de 30 días comienza exactamente donde termina el actual, sin ninguna interrupción.</Item>
          </Section>

          {/* 3. Pagos */}
          <Section icon={Coins} title="3. Pagos">
            <Item>Todos los pagos se realizan en <strong className="text-white/80">USDT (BEP-20, red BSC)</strong> a la dirección indicada en la plataforma.</Item>
            <Item>Los pagos son verificados automáticamente en la blockchain y revisados por el equipo. RedGain no se hace responsable por pagos enviados a direcciones incorrectas, desde redes equivocadas (no BSC) o desde billeteras no registradas en tu perfil.</Item>
            <Item><strong className="text-white/80">No hay reembolsos</strong> una vez que un pago ha sido aprobado y la membresía activada.</Item>
            <Item>RedGain se queda con <strong className="text-white/80">$1 por pago</strong> como comisión de plataforma. Los $9 restantes se distribuyen entre los referidores de los 3 niveles ($6, $2, $1).</Item>
          </Section>

          {/* 4. Comisiones */}
          <Section icon={Users} title="4. Comisiones">
            <Item>Las comisiones se distribuyen <strong className="text-white/80">automáticamente en USDT</strong> a tu billetera registrada en el momento en que el pago de tu referido es verificado en la red BSC.</Item>
            <Item>Para recibir una comisión debes tener <strong className="text-white/80">membresía activa</strong> y una <strong className="text-white/80">billetera BSC (USDT BEP-20)</strong> registrada en tu perfil en el momento del pago. Si no cumples alguna de estas condiciones, esa comisión no se recupera.</Item>
            <Item>La estructura es: Nivel 1 (referido directo) → <strong className="text-white/80">$6</strong>, Nivel 2 → <strong className="text-white/80">$2</strong>, Nivel 3 → <strong className="text-white/80">$1</strong>.</Item>
            <Item>RedGain no garantiza ingresos. Las comisiones dependen exclusivamente de la actividad de tus referidos.</Item>
          </Section>

          {/* 5. Código de referido */}
          <Section icon={AlertTriangle} title="5. Código de referido y árbol">
            <Item>Tu código de referido es personal e intransferible. No puedes ceder tu árbol de referidos a otra persona.</Item>
            <Item>Si pierdes tu membresía por no renovar en el período de gracia, pierdes tu árbol de referidos y debes iniciar desde cero.</Item>
            <Item>No se permite crear cuentas con datos falsos o duplicadas para manipular el árbol de referidos.</Item>
          </Section>

          {/* 6. Conducta */}
          <Section icon={Ban} title="6. Conducta prohibida">
            <Item>Queda prohibido crear cuentas falsas, manipular el sistema de referidos o usar métodos fraudulentos para generar comisiones artificiales.</Item>
            <Item>Queda prohibido el uso de bots, scripts automatizados o cualquier mecanismo no autorizado para interactuar con la plataforma.</Item>
            <Item>El equipo se reserva el derecho de suspender o eliminar cuentas que violen estas reglas <strong className="text-white/80">sin previo aviso ni reembolso</strong>.</Item>
          </Section>

          {/* 7. Modificaciones */}
          <Section icon={FileText} title="7. Modificaciones">
            <Item>RedGain puede modificar estos términos en cualquier momento. Los cambios se notificarán dentro de la plataforma.</Item>
            <Item>El uso continuado de la plataforma tras la publicación de cambios implica aceptación de los nuevos términos.</Item>
          </Section>

          {/* Footer link */}
          <motion.div variants={fade} className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30 border-t border-white/10">
            <p>© {new Date().getFullYear()} RedGain. Todos los derechos reservados.</p>
            <Link href="/privacidad" className="hover:text-[#E8C547] transition-colors underline underline-offset-4">Ver Política de Privacidad →</Link>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
