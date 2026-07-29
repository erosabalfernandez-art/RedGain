import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Database, Eye, Share2, Lock, UserX, Mail, Shield } from 'lucide-react';

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

export default function Privacidad() {
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
              <Shield className="w-5 h-5" style={{ color: GOLD }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GOLD }}>Documento legal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Política de Privacidad</h1>
            <p className="text-sm text-white/35">Última actualización: julio 2025 · Tu privacidad es importante para nosotros. Aquí explicamos qué datos recopilamos y cómo los usamos.</p>
          </motion.div>

          {/* 1. Datos que recopilamos */}
          <Section icon={Database} title="1. Datos que recopilamos">
            <Item><strong className="text-white/80">Datos de cuenta:</strong> nombre, correo electrónico, número de teléfono (WhatsApp) y dirección de billetera USDT (BEP-20).</Item>
            <Item><strong className="text-white/80">Datos de actividad:</strong> historial de pagos, comisiones recibidas, árbol de referidos y estado de membresía.</Item>
            <Item><strong className="text-white/80">Datos técnicos:</strong> información básica de sesión y navegador, necesaria para el funcionamiento seguro de la plataforma.</Item>
          </Section>

          {/* 2. Para qué usamos tus datos */}
          <Section icon={Eye} title="2. Para qué usamos tus datos">
            <Item>Gestionar tu cuenta, membresía y ciclos de renovación.</Item>
            <Item>Verificar y aprobar pagos realizados en la red BSC.</Item>
            <Item>Calcular y distribuir comisiones automáticamente a las billeteras de los referidores.</Item>
            <Item>Enviarte notificaciones sobre tu cuenta (comisiones recibidas, vencimientos, alertas de renovación).</Item>
            <Item>Resolver disputas, detectar fraudes y mantener la integridad del sistema.</Item>
          </Section>

          {/* 3. Compartir datos */}
          <Section icon={Share2} title="3. Con quién compartimos tus datos">
            <Item>No vendemos ni compartimos tus datos personales con terceros con fines comerciales.</Item>
            <Item>Los datos de transacciones en la blockchain (dirección de billetera y montos) son <strong className="text-white/80">públicos por naturaleza</strong> de la red BSC y están fuera de nuestro control una vez ejecutada la transacción.</Item>
            <Item>Tu nombre y código de referido son visibles para las personas que forman parte de tu árbol dentro de la plataforma.</Item>
            <Item>Podemos compartir información si es requerida por ley o por una autoridad competente.</Item>
          </Section>

          {/* 4. Seguridad */}
          <Section icon={Lock} title="4. Seguridad">
            <Item>Tus datos se almacenan en servidores protegidos con cifrado estándar de la industria.</Item>
            <Item>Las sesiones están protegidas mediante tokens seguros y caducan automáticamente.</Item>
            <Item>Ningún sistema es 100% seguro. Recomendamos no compartir tus credenciales de acceso con nadie.</Item>
            <Item>RedGain nunca te pedirá tu clave privada de billetera por ningún canal.</Item>
          </Section>

          {/* 5. Tus derechos */}
          <Section icon={UserX} title="5. Tus derechos">
            <Item>Puedes solicitar la <strong className="text-white/80">eliminación de tu cuenta y datos personales</strong> en cualquier momento contactándonos directamente.</Item>
            <Item>La eliminación de cuenta implica la pérdida irreversible de tu historial, árbol de referidos y comisiones pendientes.</Item>
            <Item>Puedes actualizar tus datos de contacto y billetera desde tu perfil dentro de la plataforma.</Item>
          </Section>

          {/* 6. Contacto */}
          <Section icon={Mail} title="6. Contacto">
            <Item>Para cualquier consulta sobre privacidad o para ejercer tus derechos, contáctanos a través de los canales oficiales indicados en la plataforma (WhatsApp de soporte).</Item>
            <Item>Responderemos dentro de un plazo razonable, generalmente 48-72 horas hábiles.</Item>
          </Section>

          {/* Footer link */}
          <motion.div variants={fade} className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30 border-t border-white/10">
            <p>© {new Date().getFullYear()} RedGain. Todos los derechos reservados.</p>
            <Link href="/terminos" className="hover:text-[#E8C547] transition-colors underline underline-offset-4">Ver Términos y Condiciones →</Link>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
