import { useState } from 'react';
import { useLocation } from 'wouter';
import { Copy, CheckCircle2, Loader2, Users, Wallet, MessageCircle, Gift, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetMyReferralCode, useGetMyReferrals } from '@workspace/api-client-react';

const WA_NUMBER = '5588992543996';
const WA_LINK = `https://wa.me/${WA_NUMBER}`;
const RED = '#E10613';
const RED_LIGHT = '#FF4D57';
const card = { background: '#141414', border: '1px solid rgba(225, 6, 19, 0.18)' };

function Banner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl px-6 py-5" style={{ ...card, background: 'linear-gradient(135deg, rgba(225,6,19,0.18), #141414 70%)' }}>
      <h2 className="text-xl font-extrabold" style={{ color: RED_LIGHT }}>{title}</h2>
      <p className="text-sm mt-1 text-white/55">{subtitle}</p>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"
      style={{ background: RED }}
    >
      {done ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {done ? 'Copiado' : label}
    </button>
  );
}

function OverviewSection() {
  const { data: code } = useGetMyReferralCode();
  const { data: referrals } = useGetMyReferrals();
  const direct = referrals?.level1?.length ?? 0;
  return (
    <div className="space-y-6">
      <Banner title="Mi panel" subtitle="Tu saldo de recompensas y tu código para invitar." />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-6" style={card}>
          <div className="flex items-center gap-2 text-white/55 text-sm mb-2"><Gift className="w-4 h-4" style={{ color: RED_LIGHT }} /> Mi saldo de recompensas</div>
          <p className="text-4xl font-black">0.00 <span className="text-lg text-white/40">RGC</span></p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">Estamos habilitando las primeras ofertas. Cuando estén disponibles para tu país, verás aquí tu saldo y tu historial. Las recompensas no están garantizadas.</p>
        </div>
        <div className="rounded-2xl p-6" style={card}>
          <div className="flex items-center gap-2 text-white/55 text-sm mb-2"><Users className="w-4 h-4" style={{ color: RED_LIGHT }} /> Referidos directos</div>
          <p className="text-4xl font-black">{direct}</p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">Personas que se registraron con tu código. Recibirás un porcentaje de lo que ellas obtengan en ofertas.</p>
        </div>
      </div>
      <div className="rounded-2xl p-6 space-y-4" style={card}>
        <div className="flex items-center gap-2 text-white/55 text-sm"><Link2 className="w-4 h-4" style={{ color: RED_LIGHT }} /> Tu código de referido</div>
        {code ? (
          <>
            <p className="text-3xl font-black tracking-widest" style={{ color: RED_LIGHT }}>{code.code}</p>
            <p className="text-xs text-white/40 break-all">{code.link}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={code.code} label="Copiar código" />
              <CopyButton text={code.link} label="Copiar enlace" />
            </div>
          </>
        ) : <Loader2 className="w-5 h-5 animate-spin text-white/40" />}
      </div>
    </div>
  );
}

function ReferidosSection() {
  const { data, isLoading } = useGetMyReferrals();
  const list = data?.level1 ?? [];
  return (
    <div className="space-y-6">
      <Banner title="Mis referidos" subtitle="Personas que se registraron con tu código (un solo nivel)." />
      <div className="rounded-2xl p-6" style={card}>
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : list.length === 0 ? (
          <p className="text-sm text-white/55">Todavía no tienes referidos. Comparte tu código desde el inicio del panel.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {list.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                <span className="font-semibold">{r.name}</span>
                <span className="text-xs text-white/40">Se unió el {format(new Date(r.joinedAt), "d 'de' MMMM yyyy", { locale: es })}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BilleteraSection() {
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(user?.bscWallet ?? '');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setMsg(null);
    const wallet = value.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) { setMsg({ ok: false, text: 'La dirección debe empezar con 0x y tener 42 caracteres.' }); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/bsc-wallet', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bscWallet: wallet }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar');
      setSaved(wallet.toLowerCase()); setValue(''); setMsg({ ok: true, text: 'Billetera guardada correctamente.' });
    } catch (e: any) { setMsg({ ok: false, text: e.message ?? 'Error al guardar la billetera.' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <Banner title="Billetera USDT" subtitle="Aquí recibirás tus retiros, en USDT por la red BSC (BEP-20)." />
      <div className="rounded-2xl p-6 space-y-4" style={card}>
        <div className="flex items-center gap-2 text-white/55 text-sm"><Wallet className="w-4 h-4" style={{ color: RED_LIGHT }} /> Billetera registrada</div>
        <p className="font-mono text-sm break-all">{saved || 'Aún no has registrado una billetera.'}</p>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0x..." className="w-full h-12 px-4 rounded-xl bg-[#0A0A0A] border border-[#E10613]/25 text-white placeholder:text-white/25 focus:outline-none focus:border-[#E10613]/60" />
        {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-lg font-bold text-white disabled:opacity-60" style={{ background: RED }}>{saving ? 'Guardando…' : saved ? 'Cambiar billetera' : 'Guardar billetera'}</button>
        <p className="text-xs text-white/40 leading-relaxed">Usa una billetera propia (MetaMask, Trust Wallet, SafePal u otra) en la red BSC. Verifica bien la dirección: los envíos a una dirección incorrecta no se pueden recuperar. RedGain nunca te pedirá tu clave privada.</p>
      </div>
    </div>
  );
}

function SoporteSection() {
  const topics = ['Mi referido no aparece', 'Problema con mi cuenta', 'Consulta sobre ofertas o recompensas', 'Consulta sobre retiros', 'Otra consulta'];
  const waLink = (msg: string) => `${WA_LINK}?text=${encodeURIComponent(msg)}`;
  return (
    <div className="space-y-6">
      <Banner title="Atención al cliente" subtitle="Escríbenos por WhatsApp y te respondemos lo antes posible." />
      <div className="rounded-2xl p-6 text-center space-y-4" style={card}>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
          <MessageCircle className="w-5 h-5" /> Abrir WhatsApp
        </a>
      </div>
      <div className="rounded-2xl p-5 space-y-2" style={card}>
        <p className="text-sm font-bold" style={{ color: RED_LIGHT }}>Consultas frecuentes</p>
        {topics.map((t) => (
          <a key={t} href={waLink(`Hola, necesito ayuda con: ${t}`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-[#E10613]/40 transition-colors text-sm font-medium">
            <MessageCircle className="w-4 h-4 shrink-0" style={{ color: '#25D366' }} /> {t}
          </a>
        ))}
      </div>
      <p className="text-xs text-white/40">El soporte se atiende en horario hábil. Incluye tu correo de registro en el mensaje para ayudarte más rápido.</p>
    </div>
  );
}

export default function Dashboard() {
  const [location] = useLocation();
  const { user } = useAuth();
  const section = location.includes('/referidos') ? 'referidos'
    : location.includes('/billetera') ? 'billetera'
    : location.includes('/soporte') ? 'soporte'
    : 'inicio';

  const topbar = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: RED }}>
        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
      </div>
      <span className="text-sm font-medium hidden sm:block text-white/80">{user?.name}</span>
    </div>
  );

  return (
    <DashboardLayout topbar={topbar}>
      {section === 'inicio' && <OverviewSection />}
      {section === 'referidos' && <ReferidosSection />}
      {section === 'billetera' && <BilleteraSection />}
      {section === 'soporte' && <SoporteSection />}
    </DashboardLayout>
  );
}
