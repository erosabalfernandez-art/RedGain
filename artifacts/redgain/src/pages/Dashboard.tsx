import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Copy, CheckCircle2, XCircle, Loader2, Clock, AlertTriangle,
  DollarSign, Users, Activity, Wallet, MessageCircle, GitBranch,
  List, Eye, RefreshCw, Phone, X, Download, ChevronLeft, ChevronRight, ExternalLink, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GenealogyTree, ReferralListByLevel } from '@/components/GenealogyTree';
import {
  useGetMyEarnings,
  useGetMyReferralCode,
  useGetMyReferrals,
  useGetMyTree,
  useGetMyMembership,
  useGetMyPayments,
  useGetMyCommissionHistory,
  getGetMyPaymentsQueryKey,
} from '@workspace/api-client-react';

// ── Countdown timer ────────────────────────────────────────────────────────
function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return <span className="text-red-400 font-bold">Vencida</span>;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const isUrgent = days <= 7;
  return (
    <div className={`flex gap-2 ${isUrgent ? 'text-orange-400' : 'text-foreground'}`}>
      {[{ v: days, l: 'd' }, { v: hours, l: 'h' }, { v: mins, l: 'm' }, { v: secs, l: 's' }].map(({ v, l }) => (
        <div key={l} className={`flex flex-col items-center px-3 py-2 rounded-xl border ${isUrgent ? 'border-orange-400/30 bg-orange-400/5' : 'border-border bg-card'}`}>
          <span className="text-2xl font-extrabold tabular-nums">{String(v).padStart(2, '0')}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase">{l}</span>
        </div>
      ))}
    </div>
  );
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function ImageLightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const url = images[index];
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);
  const handleDownload = async () => {
    try { const res = await fetch(url); const blob = await res.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `comprobante-${index + 1}.jpg`; a.click(); } catch { window.open(url, '_blank'); }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10" onClick={e => e.stopPropagation()}>
        <span className="text-muted-foreground text-sm">{images.length > 1 ? `${index + 1} / ${images.length}` : 'Comprobante'}</span>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 hover:bg-muted text-foreground text-sm"><Download className="w-4 h-4" />Descargar</button>
          <button onClick={onClose} className="p-2 rounded-md bg-muted/50 hover:bg-muted text-foreground"><X className="w-5 h-5" /></button>
        </div>
      </div>
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-md bg-muted/50 hover:bg-muted z-10"><ChevronLeft className="w-6 h-6" /></button>}
      <img key={url} src={url} alt={`Comprobante ${index + 1}`} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-border" onClick={e => e.stopPropagation()} />
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md bg-muted/50 hover:bg-muted z-10"><ChevronRight className="w-6 h-6" /></button>}
    </div>
  );
}

// ── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection() {
  const { user } = useAuth();
  const { data: earnings } = useGetMyEarnings();
  const { data: code } = useGetMyReferralCode();
  const { data: membership } = useGetMyMembership();
  const [copied, setCopied] = useState(false);

  const copyCode = () => { navigator.clipboard.writeText(code?.code ?? ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const copyLink = () => { navigator.clipboard.writeText(code?.link ?? ''); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente de pago', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    active: { label: 'Activa', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    paused: { label: 'Pausada', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
    lost: { label: 'Perdida', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  };
  const st = statusConfig[user?.accountStatus ?? 'pending'] ?? statusConfig.pending;

  return (
    <div className="space-y-6">
      {/* ── Stoic section banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <img src="/dash-aurelius.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-top" style={{ opacity: 0.18, filter: 'saturate(0.5) brightness(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,10,5,0.92) 0%, rgba(14,10,5,0.7) 100%)' }} />
        <div className="relative px-6 py-5">
          <h1 className="text-2xl font-extrabold" style={{ background: 'linear-gradient(90deg, #E8C547, #C9A227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Hola, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(201,162,39,0.55)' }}>"Lo que hacemos ahora resuena en la eternidad." — Marco Aurelio</p>
        </div>
      </div>

      {/* Status + warnings */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${st.bg}`}>
        <span className={`text-sm font-bold ${st.color}`}>Estado de cuenta: {st.label}</span>
      </div>

      {/* Critical warnings */}
      {membership?.inGracePeriod && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">⚠️ Período de gracia — ¡Renueva ahora!</p>
            <p className="text-xs text-red-300 mt-1">
              Tu membresía venció. Tienes <strong>{membership.graceEndsInDays} días</strong> para renovar antes de perder tu árbol completo.
              Sin renovación, tu código de referido queda inutilizado y deberás empezar desde cero.
            </p>
          </div>
        </div>
      )}
      {user?.accountStatus === 'paused' && !membership?.inGracePeriod && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-300"><strong>Cuenta pausada:</strong> No estás cobrando comisiones de tus referidos. Renueva tu membresía para reactivar tu cuenta y código de referido.</p>
        </div>
      )}
      {user?.accountStatus === 'lost' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300"><strong>Cuenta perdida:</strong> Perdiste tu árbol de referidos. Paga la membresía para empezar de nuevo con un árbol nuevo.</p>
        </div>
      )}
      {user?.accountStatus === 'pending' && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300"><strong>Cuenta pendiente:</strong> Envía tu comprobante de pago de $10 USDT para activar tu cuenta. Ve a la sección <strong>Pagos</strong>.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Referidos totales', value: earnings?.totalReferrals ?? 0, icon: Users, color: 'text-[#C9A227]', bg: 'bg-[#C9A227]/10' },
          { label: 'Referidos activos', value: earnings?.activeReferrals ?? 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Total histórico', value: `$${earnings?.totalHistorical ?? 0}`, icon: Wallet, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(14,10,5,0.8)', border: '1px solid rgba(201,162,39,0.15)' }}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Membership timer */}
      {user?.accountStatus === 'active' && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(14,10,5,0.8)', border: '1px solid rgba(201,162,39,0.15)' }}>
          <p className="text-sm font-bold text-foreground mb-1">Membresía</p>
          {membership?.timerStarted && membership.membershipExpiresAt ? (
            <div>
              <p className="text-xs text-muted-foreground mb-3">Tiempo restante de membresía:</p>
              <CountdownTimer expiresAt={membership.membershipExpiresAt} />
              <p className="text-xs text-muted-foreground mt-3">
                Vence el {format(new Date(membership.membershipExpiresAt), "d 'de' MMMM yyyy", { locale: es })}
              </p>
              {/* Ventana de renovación — días 29 y 30 */}
              {(membership as any).canRenewEarly && (
                <div className="mt-3 p-4 rounded-xl border border-red-500/40 bg-red-500/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-red-400 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                    <p className="text-sm font-extrabold text-red-400">⚡ Ventana de renovación abierta</p>
                  </div>
                  <p className="text-xs text-red-300 leading-relaxed">
                    Tu membresía vence en <strong>{membership.daysRemaining} día{membership.daysRemaining !== 1 ? 's' : ''}</strong>. Este es el momento exacto para renovar:{' '}
                    si envías el pago ahora, el sistema lo detecta automáticamente en la blockchain y tu nuevo ciclo de 30 días comienza sin ningún segundo de interrupción.
                    Tus referidos no dejan de generarte comisiones ni un instante.
                  </p>
                  <p className="text-xs font-semibold text-red-400">👉 Envía tu pago de renovación ahora para continuar sin pausas.</p>
                </div>
              )}
              {/* Aviso temprano — quedan menos de 10 días */}
              {!((membership as any).canRenewEarly) && (membership.daysRemaining ?? 99) <= 10 && (
                <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                  <p className="text-xs text-orange-400 font-medium">Quedan menos de 10 días. La <strong>ventana de renovación</strong> se abre en los días 29 y 30 — renueva en esos días para evitar cualquier pausa en tu cuenta.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-300">Temporizador en espera</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tu mes de 30 días empieza cuando tu primer referido active su cuenta. Invita a alguien para iniciar el conteo.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Referral code */}
      {code?.active ? (
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(14,10,5,0.95) 100%)', border: '1px solid rgba(201,162,39,0.25)', boxShadow: '0 0 30px -10px rgba(201,162,39,0.2)' }}>
          <p className="text-sm font-bold mb-3" style={{ color: '#E8C547' }}>Tu código de referido</p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex items-center px-4 h-11 rounded-xl font-mono font-bold tracking-widest text-sm" style={{ background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.3)', color: '#E8C547' }}>
              {code.code}
            </div>
            <button onClick={copyCode} className="px-4 h-11 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors" style={{ background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.15)')}>
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copiar
            </button>
          </div>
          <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-border hover:bg-muted text-sm font-medium text-muted-foreground transition-colors">
            <Copy className="w-3.5 h-3.5" />
            Copiar enlace de invitación
          </button>
          <p className="text-xs text-muted-foreground mt-2 text-center">Comparte este código o enlace para ganar comisiones.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-bold text-foreground mb-1">Código de referido</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-400 font-medium">Tu código de referido está inactivo. Nadie puede unirse con él hasta que tu membresía esté activa.</p>
          </div>
        </div>
      )}

      {/* How commissions work */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(14,10,5,0.8)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <p className="text-sm font-bold mb-3" style={{ color: '#E8C547' }}>¿Cuánto ganas por cada persona?</p>
        <div className="space-y-2">
          {[
            { level: 'Nivel 1 — Referido directo tuyo', amount: '$6', color: 'text-[#C9A227]', sub: 'Ganas $6 cuando pagan o renuevan' },
            { level: 'Nivel 2 — Referido de tu referido', amount: '$2', color: 'text-amber-300', sub: 'Ganas $2 cuando pagan o renuevan' },
            { level: 'Nivel 3 — Tercer nivel de profundidad', amount: '$1', color: 'text-amber-200', sub: 'Ganas $1 cuando pagan o renuevan' },
          ].map(({ level, amount, color, sub }) => (
            <div key={level} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className={`text-xs font-bold ${color}`}>{level}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <span className={`text-lg font-extrabold ${color}`}>{amount}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Las comisiones se distribuyen automáticamente en el momento en que cada pago es confirmado en la blockchain.</p>
      </div>
    </div>
  );
}

// ── Referrals Section ────────────────────────────────────────────────────────
function ReferidosSection() {
  const [view, setView] = useState<'list' | 'tree'>('list');
  const { data: referrals, isLoading } = useGetMyReferrals();
  const { data: treeData, isLoading: treeLoading } = useGetMyTree();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const total = (referrals?.totals?.count ?? 0);
  const active = (referrals?.totals?.active ?? 0);

  return (
    <div className="space-y-6">
      {/* ── Stoic section banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <img src="/dash-network.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center" style={{ opacity: 0.18, filter: 'saturate(0.5) brightness(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,10,5,0.92) 0%, rgba(14,10,5,0.65) 100%)' }} />
        <div className="relative px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: '#E8C547' }}>Mis Referidos</h2>
            <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(201,162,39,0.5)' }}>{total} persona{total !== 1 ? 's' : ''} · {active} activa{active !== 1 ? 's' : ''} · "La riqueza consiste en la abundancia de amigos." — Sócrates</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
            <button onClick={() => setView('list')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={view === 'list' ? { background: 'rgba(201,162,39,0.2)', color: '#C9A227' } : { color: 'rgba(201,162,39,0.5)' }}>
              <List className="w-3.5 h-3.5" /> Lista
            </button>
            <button onClick={() => setView('tree')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors" style={view === 'tree' ? { background: 'rgba(201,162,39,0.2)', color: '#C9A227' } : { color: 'rgba(201,162,39,0.5)' }}>
              <GitBranch className="w-3.5 h-3.5" /> Árbol
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Nivel 1', count: referrals?.level1?.length ?? 0, earn: (referrals?.level1?.length ?? 0) * 6, color: 'text-[#C9A227]', bg: 'bg-[#C9A227]/5 border-[#C9A227]/20' },
          { label: 'Nivel 2', count: referrals?.level2?.length ?? 0, earn: (referrals?.level2?.length ?? 0) * 2, color: 'text-amber-300', bg: 'bg-amber-300/5 border-amber-300/20' },
          { label: 'Nivel 3', count: referrals?.level3?.length ?? 0, earn: (referrals?.level3?.length ?? 0) * 1, color: 'text-amber-200', bg: 'bg-amber-200/5 border-amber-200/20' },
        ].map(({ label, count, earn, color, bg }) => (
          <div key={label} className={`border rounded-xl p-3 ${bg}`}>
            <p className={`text-xs font-bold ${color}`}>{label}</p>
            <p className="text-xl font-extrabold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground">~${earn}/mes</p>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl" style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)' }}>
        <p className="text-xs font-medium" style={{ color: 'rgba(201,162,39,0.7)' }}>
          Toca cualquier persona para ver su información completa y acceder a su WhatsApp directo.
        </p>
      </div>

      {view === 'list' ? (
        <ReferralListByLevel
          level1={(referrals?.level1 ?? []) as any}
          level2={(referrals?.level2 ?? []) as any}
          level3={(referrals?.level3 ?? []) as any}
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-4">Árbol genealógico — 3 niveles de profundidad. Toca un nodo para ver detalles.</p>
          {treeLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <GenealogyTree nodes={(treeData?.root?.children ?? []) as any} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Payment Warning Accordion ────────────────────────────────────────────────
const SUPPORT_WA_PAGOS = 'https://wa.me/5588992543996';

const RECOMMENDED_WALLETS = [
  {
    name: 'Trust Wallet',
    tag: 'La más recomendada',
    tagColor: 'text-emerald-400',
    tagBg: 'bg-emerald-400/10 border-emerald-400/20',
    desc: 'Diseñada para BSC. Fácil, rápida y completamente gratuita. Disponible en iOS y Android.',
    url: 'https://trustwallet.com',
    icon: '🔵',
  },
  {
    name: 'MetaMask',
    tag: 'La más conocida',
    tagColor: 'text-orange-400',
    tagBg: 'bg-orange-400/10 border-orange-400/20',
    desc: 'Compatible con BSC. App móvil y extensión de navegador. Millones de usuarios en todo el mundo.',
    url: 'https://metamask.io',
    icon: '🦊',
  },
  {
    name: 'SafePal',
    tag: 'Muy segura',
    tagColor: 'text-blue-400',
    tagBg: 'bg-blue-400/10 border-blue-400/20',
    desc: 'Excelente para BSC. Aplicación gratuita con opciones de billetera de hardware para mayor seguridad.',
    url: 'https://safepal.com',
    icon: '🛡️',
  },
  {
    name: 'TokenPocket',
    tag: 'Popular en Latinoamérica',
    tagColor: 'text-purple-400',
    tagBg: 'bg-purple-400/10 border-purple-400/20',
    desc: 'Multi-cadena, soporta BSC perfectamente. Interfaz en español y muy intuitiva.',
    url: 'https://tokenpocket.pro',
    icon: '💜',
  },
];

function SubAccordion({ title, icon, borderColor, bgColor, children }: {
  title: string; icon: React.ReactNode; borderColor: string; bgColor: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: borderColor, background: bgColor }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 text-xs font-bold text-foreground">{title}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && <div className="px-4 pb-4 space-y-2 border-t border-white/5">{children}</div>}
    </div>
  );
}

function PaymentWarningAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(14,10,5,0.95)' }}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-red-500/5"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-red-400">Advertencias importantes antes de pagar</p>
          <p className="text-xs text-muted-foreground mt-0.5">Montos incorrectos · Cambio de billetera · Exchanges — lee antes de enviar</p>
        </div>
        <ChevronDown
          className="w-4 h-4 text-red-400 shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Body — collapsible */}
      {open && (
        <div className="px-5 pb-6 space-y-5 border-t border-red-500/15">

          <p className="text-xs text-muted-foreground pt-4 leading-relaxed">
            Nuestro sistema detecta pagos en la blockchain de forma <strong className="text-foreground">completamente automática</strong>. Para que funcione sin errores, cada pago debe cumplir tres condiciones sin excepción. Lee cada punto con atención.
          </p>

          {/* ── SECCIÓN 1: Monto exacto ── */}
          <SubAccordion
            title="① Envía siempre exactamente $10.00 USDT — ni más, ni menos"
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            borderColor="1px solid rgba(239,68,68,0.2)"
            bgColor="rgba(239,68,68,0.04)"
          >
            <div className="pt-2 space-y-3">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-wide">Si envías MENOS de $10 USDT</p>
                {[
                  { icon: '❌', text: 'El sistema ignora el pago y tu cuenta NO se activa.' },
                  { icon: '🔄', text: 'El equipo te devuelve el dinero a tu billetera de origen.' },
                  { icon: '⚠️', text: <span>Pierdes la <strong className="text-red-300">comisión de red</strong> que el equipo paga al devolverte el dinero. Ese costo corre por tu cuenta.</span> },
                  { icon: '🔁', text: 'Deberás reenviar los $10 USDT completos desde cero para activar tu cuenta.' },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs shrink-0 mt-0.5">{icon}</span>
                    <p className="text-xs text-red-200 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="h-px bg-red-500/10" />
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-yellow-400 uppercase tracking-wide">Si envías MÁS de $10 USDT</p>
                {[
                  { icon: '✅', text: 'Tu cuenta SÍ se activa normalmente.' },
                  { icon: '💰', text: 'El excedente queda retenido. Contáctanos y te lo devolvemos.' },
                  { icon: '⚠️', text: <span>Igual que el caso anterior, pierdes la <strong className="text-yellow-300">comisión de red</strong> de la devolución.</span> },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs shrink-0 mt-0.5">{icon}</span>
                    <p className="text-xs text-yellow-200 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </SubAccordion>

          {/* ── SECCIÓN 2: Misma billetera ── */}
          <SubAccordion
            title="② Usa siempre la misma billetera que registraste — no la cambies sin seguir los pasos"
            icon={<Wallet className="w-4 h-4 text-orange-400" />}
            borderColor="1px solid rgba(234,88,12,0.25)"
            bgColor="rgba(234,88,12,0.04)"
          >
            <div className="pt-2 space-y-4">
              <p className="text-xs text-orange-200 leading-relaxed">
                El sistema identifica tu pago por la dirección desde la que envías. Si envías desde una billetera diferente a la que tienes registrada, el pago <strong className="text-orange-300">no se asocia a tu cuenta</strong> y se pierde sin activar nada. Mantén siempre la misma billetera registrada para pagar.
              </p>

              <div className="rounded-lg p-3 space-y-2" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <p className="text-[11px] font-bold text-yellow-400 uppercase tracking-wide">¿Quieres cambiar de billetera? Sigue estos pasos para no perder nada:</p>
                {[
                  'Primero asegúrate de que NO tienes ningún pago en tránsito en ese momento.',
                  'Ve a "Tu billetera BSC de origen" (arriba en esta misma página) y actualiza la dirección.',
                  'Espera a que el sistema confirme el cambio antes de enviar cualquier pago.',
                  'Haz tu próximo pago solo desde la nueva billetera registrada — nunca desde la anterior.',
                  'Si tienes dudas sobre si el cambio fue exitoso, escríbenos al soporte antes de pagar.',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}>
                      <span className="text-[9px] font-extrabold text-yellow-400">{i + 1}</span>
                    </div>
                    <p className="text-xs text-yellow-200 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(234,88,12,0.08)', border: '1px solid rgba(234,88,12,0.2)' }}>
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-300 leading-relaxed">
                  <strong>Regla clave:</strong> una billetera, una cuenta. Cada dirección BSC solo puede estar registrada en un usuario del sistema. No intentes usar la misma billetera en dos cuentas distintas.
                </p>
              </div>
            </div>
          </SubAccordion>

          {/* ── SECCIÓN 3: No exchanges ── */}
          <SubAccordion
            title="③ No pagues desde exchanges (Binance, Bybit, OKX…) — solo desde billetera personal"
            icon={<XCircle className="w-4 h-4 text-red-500" />}
            borderColor="1px solid rgba(239,68,68,0.25)"
            bgColor="rgba(239,68,68,0.04)"
          >
            <div className="pt-2 space-y-4">
              <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-xs text-red-200 leading-relaxed">
                  Los exchanges como Binance, Bybit, OKX o Coinbase <strong className="text-red-300">no envían fondos desde tu dirección personal</strong> — los envían desde las billeteras internas del exchange. Esto significa que cuando retiras desde un exchange directo a nuestra billetera, el pago llega al sistema <strong className="text-red-300">sin ningún dato que lo relacione contigo</strong>. Tu cuenta no se activa y el dinero queda en el limbo.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-wide">El flujo correcto si tienes tus USDT en un exchange:</p>
                {[
                  { step: '1', text: 'Retira tus USDT del exchange a tu billetera personal (Trust Wallet, MetaMask, etc.).' },
                  { step: '2', text: 'Desde esa billetera personal — que debe estar registrada en tu cuenta — envía los $10 USDT a la dirección de pago.' },
                  { step: '3', text: 'El sistema detecta el pago y activa tu cuenta automáticamente.' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
                      <span className="text-[9px] font-extrabold" style={{ color: '#C9A227' }}>{step}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              {/* Wallet recommendations */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#E8C547' }}>Billeteras personales que recomendamos — son gratuitas y fáciles de usar:</p>
                <div className="space-y-2">
                  {RECOMMENDED_WALLETS.map((w) => (
                    <a
                      key={w.name}
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-[rgba(201,162,39,0.3)] hover:bg-[rgba(201,162,39,0.03)] transition-all group"
                    >
                      <span className="text-lg shrink-0 mt-0.5">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground group-hover:text-white">{w.name}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${w.tagBg} ${w.tagColor}`}>{w.tag}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{w.desc}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-[#C9A227] shrink-0 mt-1 transition-colors" />
                    </a>
                  ))}
                </div>
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.15)' }}>
                  <MessageCircle className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(201,162,39,0.8)' }}>
                    ¿No puedes instalar ninguna de estas billeteras o tienes dudas sobre cómo configurarla? <strong className="text-[#E8C547]">Escríbenos al soporte antes de pagar.</strong> Estamos para ayudarte — no te quedes con la duda, un mensaje a tiempo evita perder dinero.
                  </p>
                </div>
              </div>
            </div>
          </SubAccordion>

          {/* ── Regla de oro ── */}
          <div className="rounded-xl p-4 space-y-1" style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.08), rgba(14,10,5,0.6))', border: '1px solid rgba(201,162,39,0.25)' }}>
            <p className="text-xs font-extrabold" style={{ color: '#E8C547' }}>✅ Las 3 reglas de oro</p>
            <div className="space-y-1 mt-2">
              {[
                'Envía exactamente $10.00 USDT BEP20 — sin centavos de más ni de menos.',
                'Envía siempre desde tu billetera personal registrada — la misma cada vez.',
                'Nunca pagues directo desde un exchange — primero pasa los fondos a tu billetera personal.',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(201,162,39,0.85)' }}>{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Support CTA */}
          <a
            href={SUPPORT_WA_PAGOS}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff' }}
          >
            <MessageCircle className="w-4 h-4" />
            Tengo dudas o un problema con mi pago — Contactar soporte
          </a>
        </div>
      )}
    </div>
  );
}

// ── Payments Section ─────────────────────────────────────────────────────────
function PagosSection() {
  const { user, refetch } = useAuth();
  const queryClient = useQueryClient();
  const { data: payments, isLoading } = useGetMyPayments();

  const bscWallet = (user as any)?.bscWallet as string | null | undefined;

  const [walletInput, setWalletInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);
  const [copied, setCopied] = useState(false);

  const RECEIVING_WALLET = '0xd9FAFA7af1B691638315931235858745Ce6b2f73';

  // Auto-refresh payments every 15s
  React.useEffect(() => {
    const t = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getGetMyPaymentsQueryKey() });
    }, 15_000);
    return () => clearInterval(t);
  }, [queryClient]);

  const handleSaveWallet = async () => {
    setWalletError('');
    setWalletSuccess('');
    const normalized = walletInput.trim();
    if (!normalized.match(/^0x[0-9a-fA-F]{40}$/)) {
      setWalletError('La dirección debe empezar con 0x y tener 42 caracteres.');
      return;
    }
    setSavingWallet(true);
    try {
      const res = await fetch('/api/users/me/bsc-wallet', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bscWallet: normalized }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar');
      setWalletSuccess('¡Billetera guardada correctamente!');
      setEditing(false);
      setWalletInput('');
      await refetch();
    } catch (err: any) {
      setWalletError(err.message ?? 'Error al guardar la billetera.');
    } finally {
      setSavingWallet(false);
    }
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(RECEIVING_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'En revisión', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    approved: { label: 'Confirmado ✓', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    rejected: { label: 'Rechazado', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  };

  return (
    <div className="space-y-6">
      {/* ── Stoic section banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <img src="/dash-treasury.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center" style={{ opacity: 0.18, filter: 'saturate(0.5) brightness(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,10,5,0.92) 0%, rgba(14,10,5,0.65) 100%)' }} />
        <div className="relative px-6 py-5">
          <h2 className="text-xl font-extrabold" style={{ color: '#E8C547' }}>Pagos</h2>
          <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(201,162,39,0.5)' }}>"El oro que obtienes con virtud vale más que una montaña de riqueza sin ella." — Séneca</p>
        </div>
      </div>

      {/* Block 1 & 2: BSC Wallet */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <p className="text-sm font-bold text-foreground">Tu billetera BSC de origen</p>

        {!bscWallet || editing ? (
          <>
            {!bscWallet && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-300 font-medium">
                  Necesitas registrar tu billetera BSC para que el sistema pueda detectar tu pago automáticamente.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                  <Wallet className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="0x..."
                  value={walletInput}
                  onChange={e => setWalletInput(e.target.value)}
                  className="w-full pl-9 pr-4 h-11 rounded-xl bg-background border border-border text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 font-mono text-sm"
                />
              </div>
              <button
                onClick={handleSaveWallet}
                disabled={savingWallet}
                className="h-11 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                {savingWallet ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Guardar billetera
              </button>
            </div>
            {editing && (
              <button onClick={() => { setEditing(false); setWalletInput(''); setWalletError(''); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
            )}
            {walletError && <p className="text-xs text-red-400 font-medium">{walletError}</p>}
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-1 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-mono text-emerald-300 truncate">{bscWallet.slice(0, 10)}...{bscWallet.slice(-6)}</span>
            </div>
            <button
              onClick={() => { setEditing(true); setWalletInput(bscWallet); }}
              className="h-9 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground transition-colors whitespace-nowrap"
            >
              Cambiar
            </button>
          </div>
        )}

        {walletSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-400 font-medium">{walletSuccess}</p>
          </div>
        )}
      </div>

      {/* Block 3: Payment instructions */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <p className="text-sm font-bold text-foreground">Dirección de destino del pago</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2.5 rounded-xl bg-background border border-border font-mono text-xs text-foreground break-all">
            {RECEIVING_WALLET}
          </div>
          <button onClick={copyWallet} className="h-10 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary flex items-center gap-1.5 text-xs font-bold transition-colors shrink-0">
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 font-semibold">Solo BEP20 (BSC). No uses ERC20, TRC20 ni otras redes o perderás tus fondos.</p>
        </div>
        <p className="text-xs text-muted-foreground">Monto exacto: <span className="font-bold text-foreground">$10 USDT</span></p>
      </div>

      {/* Block 3b: Payment amount warnings accordion */}
      <PaymentWarningAccordion />

      {/* Block 4: How it works */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <p className="text-sm font-bold mb-3" style={{ color: '#E8C547' }}>¿Cómo funciona el pago automático?</p>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Envías $10 USDT BEP20 desde tu wallet registrada a la dirección de arriba.' },
            { step: '2', text: 'Nuestro sistema revisa la blockchain cada 30 segundos buscando tu pago.' },
            { step: '3', text: 'Al detectar la transacción, tu cuenta se activa automáticamente.' },
            { step: '4', text: 'Las comisiones se distribuyen automáticamente a tu cadena de referidos.' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
                <span className="text-xs font-bold" style={{ color: '#C9A227' }}>{step}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Block 5: Payment history */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-foreground">Historial de pagos</p>
          <span className="text-xs text-muted-foreground">Auto-actualiza cada 15s</span>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (payments?.length ?? 0) === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">No hay pagos registrados todavía.</p>
        ) : (
          <div className="space-y-3">
            {(payments ?? []).map((p: any) => {
              const st = statusConfig[p.status] ?? statusConfig.pending;
              return (
                <div key={p.id} className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>{st.label}</span>
                      <span className="text-xs text-muted-foreground">{p.paymentType === 'renewal' ? 'Renovación' : 'Membresía inicial'}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">${p.amount} USDT</span>
                  </div>
                  {p.txHash && (
                    <a
                      href={`https://bscscan.com/tx/${p.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-mono"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p.txHash.slice(0, 16)}...{p.txHash.slice(-8)}</span>
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground">{format(new Date(p.createdAt), "d MMM yyyy HH:mm", { locale: es })}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block 6: Commission history */}
      <CommissionHistoryBlock />
    </div>
  );
}

// ── Commission History Block ──────────────────────────────────────────────────
function CommissionHistoryBlock() {
  const { data, isLoading } = useGetMyCommissionHistory();
  const events = data?.events ?? [];
  const totalReceived = data?.totalReceived ?? 0;

  const statusIcon: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    sent:    { icon: CheckCircle2, color: 'text-emerald-400' },
    failed:  { icon: XCircle,     color: 'text-red-400' },
    skipped: { icon: Clock,       color: 'text-yellow-400' },
  };

  const SUPPORT_WA = 'https://wa.me/5588992543996';

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Comisiones recibidas</p>
        {totalReceived > 0 && (
          <span className="text-sm font-extrabold text-emerald-400">${totalReceived.toFixed(2)} USDT total</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 space-y-1">
          <DollarSign className="w-8 h-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Aún no has recibido comisiones.</p>
          <p className="text-xs text-muted-foreground/60">Cuando uno de tus referidos pague, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e: any) => {
            const cfg = statusIcon[e.status] ?? statusIcon.skipped;
            const Icon = cfg.icon;
            return (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors">
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">
                      Nivel {e.level} · {e.sourceName ?? 'Usuario'}
                    </p>
                    <span className={`text-sm font-extrabold ${e.status === 'sent' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                      {e.status === 'sent' ? `+$${e.amountUsdt}` : `$${e.amountUsdt}`}
                    </span>
                  </div>
                  {e.status === 'sent' && e.txHash && (
                    <a
                      href={`https://bscscan.com/tx/${e.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-mono mt-0.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {e.txHash.slice(0, 12)}…{e.txHash.slice(-6)}
                    </a>
                  )}
                  {e.status === 'failed' && (
                    <a
                      href={SUPPORT_WA}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 mt-0.5 font-medium"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Contactar soporte por WhatsApp
                    </a>
                  )}
                  {e.status === 'skipped' && (
                    <p className="text-[10px] text-yellow-400/80 mt-0.5">Sin billetera BSC registrada</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    {format(new Date(e.createdAt), "d MMM yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Membership Section ───────────────────────────────────────────────────────
function MembresiaSectionContent() {
  const { user } = useAuth();
  const { data: membership, isLoading } = useGetMyMembership();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* ── Stoic section banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <img src="/dash-membership.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center" style={{ opacity: 0.2, filter: 'saturate(0.5) brightness(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(14,10,5,0.92) 0%, rgba(14,10,5,0.65) 100%)' }} />
        <div className="relative px-6 py-5">
          <h2 className="text-xl font-extrabold" style={{ color: '#E8C547' }}>Mi Membresía</h2>
          <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(201,162,39,0.5)' }}>"La disciplina es el puente entre las metas y los logros." — Epicteto</p>
        </div>
      </div>

      {/* Renewal window banner — days 29-30 */}
      {membership?.canRenewEarly && (
        <div className="rounded-2xl p-5 border-2 border-red-500/50" style={{ background: 'rgba(220,38,38,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-red-400 animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-base font-extrabold text-red-400">⚡ Ventana de renovación abierta</p>
          </div>
          <p className="text-sm text-red-300 leading-relaxed mb-3">
            Tu membresía vence en <strong>{membership.daysRemaining} día{membership.daysRemaining !== 1 ? 's' : ''}</strong>.
            Estos son los días 29 y 30 de tu ciclo — el momento exacto para renovar.
          </p>
          <div className="space-y-2 mb-4">
            {[
              { icon: '✅', text: 'Pagas ahora → el equipo aprueba antes de que venza → tu nuevo ciclo de 30 días comienza justo donde termina el actual. Sin interrupciones.' },
              { icon: '🔴', text: 'Si no pagas hoy, tu cuenta pasará a pausada mañana y dejarás de recibir comisiones hasta que el equipo apruebe tu renovación.' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-2">
                <span className="text-base shrink-0 mt-0.5">{icon}</span>
                <p className="text-xs text-red-200 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-red-400">👉 Ve a la sección <strong>Pagos</strong> y envía tu renovación ahora.</p>
        </div>
      )}

      {/* Main timer card */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        {membership?.timerStarted && membership.membershipExpiresAt ? (
          <div>
            <p className="text-sm font-bold text-foreground mb-4">Tiempo restante de membresía</p>
            <CountdownTimer expiresAt={membership.membershipExpiresAt} />
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temporizador inició</span>
                <span className="font-medium text-foreground">{membership.membershipTimerStartedAt ? format(new Date(membership.membershipTimerStartedAt), "d MMM yyyy", { locale: es }) : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vence el</span>
                <span className="font-medium text-foreground">{membership.membershipExpiresAt ? format(new Date(membership.membershipExpiresAt), "d MMM yyyy", { locale: es }) : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gracia hasta</span>
                <span className="font-medium text-foreground">{membership.gracePeriodEndsAt ? format(new Date(membership.gracePeriodEndsAt), "d MMM yyyy", { locale: es }) : '—'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <p className="font-bold text-foreground">Temporizador en espera</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">Tu contador de 30 días empieza cuando tu primer referido active su cuenta. Tienes tiempo sin límite para encontrar a tu primera persona.</p>
          </div>
        )}
      </div>

      {/* How the cycle works — visual timeline */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <p className="text-sm font-bold" style={{ color: '#E8C547' }}>Tu ciclo de 30 días — cómo funciona</p>
        <div className="relative pl-5 border-l border-border space-y-5">
          {[
            { day: 'Días 1-28', color: 'text-emerald-400', dotColor: 'bg-emerald-400', title: 'Cuenta activa — cobra sin límite', desc: 'Tu código funciona, tus referidos generan comisiones y todo sigue en marcha.' },
            { day: 'Días 29-30', color: 'text-red-400', dotColor: 'bg-red-400', title: '🔴 Ventana de renovación — paga AHORA', desc: 'El sistema te habilita para renovar. Si pagas y el equipo aprueba antes del vencimiento, tu nuevo ciclo comienza justo donde termina el actual: cero segundos de pausa, cero comisiones perdidas.' },
            { day: 'Día 31+', color: 'text-orange-400', dotColor: 'bg-orange-400', title: 'Sin renovación → cuenta pausada', desc: 'Tu código queda inutilizado y dejas de cobrar comisiones. Tienes 14 días de gracia para renovar sin perder tu árbol.' },
            { day: 'Día 45+', color: 'text-red-500', dotColor: 'bg-red-500', title: 'Sin gracia → todo perdido', desc: 'Si no renuevas en las 2 semanas de gracia, pierdes todo tu árbol de referidos y debes empezar de cero.' },
          ].map(({ day, color, dotColor, title, desc }) => (
            <div key={day} className="relative">
              <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-background ${dotColor}`} />
              <p className={`text-[10px] font-extrabold uppercase tracking-wider ${color} mb-0.5`}>{day}</p>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <p className="text-sm font-bold" style={{ color: '#E8C547' }}>Reglas de membresía</p>
        <div className="space-y-3">
          {[
            { icon: CheckCircle2, color: 'text-emerald-400', title: 'Membresía activa', desc: 'Puedes referir personas, tu código funciona y recibes comisiones automáticamente en el momento en que cada uno de tus referidos realiza su pago — sin esperas ni fechas de corte.' },
            { icon: RefreshCw, color: 'text-red-400', title: 'Ventana de renovación (días 29-30)', desc: 'En los últimos 2 días de tu ciclo puedes renovar anticipadamente. Si el equipo aprueba antes de que venza, el nuevo ciclo empieza justo donde termina el actual sin ningún segundo de pausa.' },
            { icon: Clock, color: 'text-yellow-400', title: 'Período de gracia (2 semanas)', desc: 'Si vence sin renovar, tienes 14 días para pagar. Tu código queda inutilizado y no cobras comisiones durante este tiempo, pero no pierdes tu árbol.' },
            { icon: XCircle, color: 'text-red-400', title: 'Sin renovación = Todo perdido', desc: 'Si no renuevas en las 2 semanas de gracia, pierdes tu árbol completo y debes empezar de cero.' },
            { icon: Activity, color: 'text-blue-400', title: 'Comisiones automáticas e instantáneas', desc: 'Cada vez que alguien de tu red paga o renueva, el sistema detecta el pago en la blockchain y distribuye las comisiones en ese mismo momento. No hay día de corte ni fecha de espera.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex gap-3">
              <Icon className={`w-5 h-5 ${color} mt-0.5 shrink-0`} />
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Support Section ──────────────────────────────────────────────────────────
const WA_NUMBER = '5588992543996';
const WA_LINK = `https://wa.me/${WA_NUMBER}`;

function SoporteSection() {
  const topics = [
    { emoji: '💳', label: 'Problemas con mi pago' },
    { emoji: '👥', label: 'Mi referido no aparece' },
    { emoji: '💰', label: 'No recibí mi comisión' },
    { emoji: '🔐', label: 'Problema con mi cuenta' },
    { emoji: '❓', label: 'Otra consulta' },
  ];

  const waLink = (msg: string) =>
    `${WA_LINK}?text=${encodeURIComponent(msg)}`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(37,211,102,0.12) 0%, rgba(14,10,5,0.95) 60%)' }} />
        <div className="relative px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)' }}>
            <MessageCircle className="w-6 h-6" style={{ color: '#25D366' }} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: '#E8C547' }}>Atención al Cliente</h2>
            <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(201,162,39,0.5)' }}>"El que pregunta no se pierde." — Proverbio estoico</p>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(37,211,102,0.2)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(37,211,102,0.12)', border: '2px solid rgba(37,211,102,0.3)' }}>
          <MessageCircle className="w-8 h-8" style={{ color: '#25D366' }} />
        </div>
        <div>
          <p className="text-lg font-extrabold text-foreground">¿Necesitas ayuda?</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
            Escríbenos directamente por WhatsApp. Te respondemos lo antes posible.
          </p>
        </div>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', boxShadow: '0 4px 20px -4px rgba(37,211,102,0.4)' }}
        >
          <MessageCircle className="w-5 h-5" />
          Abrir WhatsApp ahora
        </a>
        <p className="text-xs text-muted-foreground">+55 88992-543996</p>
      </div>

      {/* Quick topics */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <p className="text-sm font-bold" style={{ color: '#E8C547' }}>Consultas frecuentes — toca para escribirnos directamente</p>
        <div className="space-y-2">
          {topics.map(({ emoji, label }) => (
            <a
              key={label}
              href={waLink(`Hola, necesito ayuda con: ${label}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-[rgba(37,211,102,0.3)] hover:bg-[rgba(37,211,102,0.04)] transition-all group"
            >
              <span className="text-lg shrink-0">{emoji}</span>
              <span className="flex-1 text-sm font-medium text-foreground group-hover:text-white">{label}</span>
              <MessageCircle className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#25D366' }} />
            </a>
          ))}
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.12)' }}>
        <Clock className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          El soporte se atiende en horario hábil. Si escribes fuera de horario, te responderemos al siguiente día disponible. Incluye tu <strong className="text-foreground">nombre de usuario</strong> para agilizar la atención.
        </p>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [location] = useLocation();

  // Determine section from URL path
  const section = location.includes('/referidos') ? 'referidos'
    : location.includes('/pagos') ? 'pagos'
    : location.includes('/membresia') ? 'membresia'
    : location.includes('/soporte') ? 'soporte'
    : 'inicio';

  const { user } = useAuth();

  const topbar = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.2), rgba(201,162,39,0.1))', border: '1px solid rgba(201,162,39,0.35)', color: '#C9A227' }}>
        {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
      </div>
      <span className="text-sm font-medium hidden sm:block" style={{ color: 'rgba(201,162,39,0.8)' }}>{user?.name}</span>
    </div>
  );

  return (
    <DashboardLayout topbar={topbar}>
      {section === 'inicio' && <OverviewSection />}
      {section === 'referidos' && <ReferidosSection />}
      {section === 'pagos' && <PagosSection />}
      {section === 'membresia' && <MembresiaSectionContent />}
      {section === 'soporte' && <SoporteSection />}
    </DashboardLayout>
  );
}
