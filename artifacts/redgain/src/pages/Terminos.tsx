import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, ShieldCheck, Coins, Users, RefreshCw, Ban, AlertTriangle, FileText } from 'lucide-react';

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const GOLD = '#E10613';
const GOLD_LIGHT = '#FF4D57';

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<any>; title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fade} className="rounded-2xl p-6 space-y-3" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(225, 6, 19,0.15)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(225, 6, 19,0.1)', border: '1px solid rgba(225, 6, 19,0.25)' }}>
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
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#E10613]/15 bg-[#0A0A0A]/90 backdrop-blur-md">
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
            <p className="text-sm text-white/35">Última actualización: octubre 2026 · Al registrarte o usar RedGain aceptas estos términos.</p>
          </motion.div>

          {/* 1. El servicio */}
          <Section icon={ShieldCheck} title="1. El servicio">
            <Item>RedGain es una plataforma de recompensas: puedes completar ofertas patrocinadas (aplicaciones, juegos, encuestas, registros) y recibir recompensas dentro de la plataforma.</Item>
            <Item>El acceso a RedGain es <strong className="text-white/80">gratuito</strong>. No cobramos por registrarte ni por usar la plataforma.</Item>
            <Item>RedGain <strong className="text-white/80">no garantiza ingresos</strong>. Las recompensas dependen de las ofertas disponibles en tu país y dispositivo, de que las completes correctamente y de que el anunciante las valide.</Item>
            <Item>El equipo de RedGain puede modificar, suspender o discontinuar cualquier parte del servicio con notificación previa dentro de la plataforma.</Item>
          </Section>

          {/* 2. Cuenta */}
          <Section icon={RefreshCw} title="2. Tu cuenta">
            <Item>Debes proporcionar datos reales y mantener una sola cuenta por persona.</Item>
            <Item>Tu cuenta no vence ni requiere renovación. Eres responsable de mantener la confidencialidad de tu contraseña.</Item>
            <Item>Debes ser <strong className="text-white/80">mayor de 18 años</strong> para usar RedGain.</Item>
            <Item>Puedes dejar de usar RedGain cuando quieras.</Item>
          </Section>

          {/* 3. Recompensas */}
          <Section icon={Coins} title="3. Recompensas por ofertas">
            <Item>Las recompensas se acreditan en tu saldo interno únicamente cuando el anunciante confirma que la oferta fue completada de forma válida.</Item>
            <Item>Si el anunciante anula o revierte una conversión (por ejemplo, por fraude o incumplimiento de requisitos), la recompensa correspondiente se descuenta de tu saldo.</Item>
            <Item>Las ofertas son de terceros: algunas pueden requerir instalar aplicaciones, registrarte o hacer compras o depósitos con dinero real (por ejemplo, en juegos). Lee los requisitos de cada oferta antes de empezar; RedGain no te obliga a completar ninguna.</Item>
            <Item>La cantidad de recompensa por oferta puede variar y se muestra antes de que decidas realizarla.</Item>
            <Item>Los retiros se pagan en <strong className="text-white/80">USDT (red BSC, BEP-20)</strong> a la billetera que registres en tu perfil. RedGain no se hace responsable por fondos enviados a una dirección incorrecta que hayas registrado.</Item>
            <Item>Los retiros, cuando estén habilitados, pueden estar sujetos a un monto mínimo, a verificación de cuenta y a un periodo de espera para cubrir posibles reversiones.</Item>
          </Section>

          {/* 4. Referidos */}
          <Section icon={Users} title="4. Programa de referidos">
            <Item>Puedes invitar a otras personas con tu código personal. Registrarse con un código no tiene ningún costo.</Item>
            <Item>Como agradecimiento, puedes recibir un <strong className="text-white/80">porcentaje de las recompensas que tus referidos directos obtengan en ofertas</strong>. Ese porcentaje lo financian los anunciantes y no sale de ningún pago de los usuarios.</Item>
            <Item>El programa tiene un solo nivel: solo se tienen en cuenta tus referidos directos.</Item>
            <Item>Las ganancias por referidos dependen de la actividad real de tus referidos y no están garantizadas.</Item>
          </Section>

          {/* 5. Código de referido */}
          <Section icon={AlertTriangle} title="5. Código de referido">
            <Item>Tu código de referido es personal e intransferible.</Item>
            <Item>No se permite crear cuentas con datos falsos, duplicadas o referirte a ti mismo para obtener beneficios.</Item>
          </Section>

          {/* 6. Conducta */}
          <Section icon={Ban} title="6. Conducta prohibida">
            <Item>Queda prohibido crear cuentas falsas, manipular el sistema de referidos o usar métodos fraudulentos para generar comisiones artificiales.</Item>
            <Item>Queda prohibido el uso de bots, scripts automatizados o cualquier mecanismo no autorizado para interactuar con la plataforma.</Item>
            <Item>El equipo se reserva el derecho de suspender o eliminar cuentas que violen estas reglas <strong className="text-white/80">sin previo aviso</strong>.</Item>
          </Section>

          {/* 7. Modificaciones */}
          <Section icon={FileText} title="7. Modificaciones">
            <Item>RedGain puede modificar estos términos en cualquier momento. Los cambios se notificarán dentro de la plataforma.</Item>
            <Item>El uso continuado de la plataforma tras la publicación de cambios implica aceptación de los nuevos términos.</Item>
          </Section>

          {/* Footer link */}
          <motion.div variants={fade} className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30 border-t border-white/10">
            <p>© {new Date().getFullYear()} RedGain. Todos los derechos reservados.</p>
            <Link href="/privacidad" className="hover:text-[#FF4D57] transition-colors underline underline-offset-4">Ver Política de Privacidad →</Link>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
