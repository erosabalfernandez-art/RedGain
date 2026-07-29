import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  Users, DollarSign, Check, X, Pause, Play, Ban, AlertCircle, Loader2,
  ImageIcon, Download, Activity, Receipt, Search, MessageCircle, Clock,
  GitBranch, Calculator, ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle2, XCircle, Phone, TrendingUp, Calendar, Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { GenealogyTree } from '@/components/GenealogyTree';
import {
  useAdminGetStats,
  useAdminListUsers,
  useAdminUpdateUser,
  useAdminDeleteUser,
  useAdminGetTree,
  getAdminListUsersQueryKey,
  getAdminGetStatsQueryKey,
} from '@workspace/api-client-react';

// ── Countdown timer ────────────────────────────────────────────────────────
function SmallCountdown({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return <span className="text-red-400 font-bold text-xs">Vencida</span>;
  const days = Math.floor(diff / 86400000);
  const isUrgent = days <= 7;
  return (
    <span className={`text-xs font-bold flex items-center gap-1 ${isUrgent ? 'text-orange-400' : 'text-muted-foreground'}`}>
      <Clock className="w-3 h-3" />
      {days}d restantes
    </span>
  );
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function ImageLightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setIndex(i => (i + 1) % images.length);
  const url = images[index];
  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute top-4 right-4 flex gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="p-2 rounded-md bg-muted/80 hover:bg-muted border border-border text-foreground"><X className="w-5 h-5" /></button>
      </div>
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-md bg-muted/80 border border-border z-10"><ChevronDown className="w-6 h-6 -rotate-90" /></button>}
      <img key={url} src={url} alt="" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-border" onClick={e => e.stopPropagation()} />
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md bg-muted/80 border border-border z-10"><ChevronDown className="w-6 h-6 rotate-90" /></button>}
    </div>
  );
}

// ── User detail modal ────────────────────────────────────────────────────────
function UserDetailModal({ user: u, onClose, onUpdate, onDelete }: { user: any; onClose: () => void; onUpdate: (id: number, status: string) => void; onDelete: (id: number) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Activar', icon: Play, color: 'text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10' },
    { value: 'paused', label: 'Pausar', icon: Pause, color: 'text-orange-400 border-orange-400/30 hover:bg-orange-400/10' },
    { value: 'lost', label: 'Marcar como Perdida', icon: Ban, color: 'text-red-400 border-red-400/30 hover:bg-red-400/10' },
    { value: 'pending', label: 'Poner como Pendiente', icon: Clock, color: 'text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10' },
  ];
  const stConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    active: { label: 'Activa', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
    paused: { label: 'Pausada', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' },
    lost: { label: 'Perdida', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
  };
  const st = stConfig[u.accountStatus] ?? stConfig.pending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(13,9,3,0.97)', border: '1px solid rgba(201,162,39,0.2)', boxShadow: '0 0 60px -10px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227' }}>
              {u.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">{u.name}</h3>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-2 mb-5">
          {[
            { label: 'Estado', value: <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${st.bg} ${st.color}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}</span> },
            { label: 'Teléfono', value: u.phone ? <a href={u.whatsappUrl ?? `https://wa.me/${u.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold text-sm flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{u.phone}</a> : <span className="text-xs text-muted-foreground italic">No registrado</span> },
            { label: 'Referido por', value: <span className="text-sm text-foreground">{u.referrerName ?? 'Sin referidor'}</span> },
            { label: 'Referidos', value: <span className="text-sm text-foreground">{u.totalReferrals} total · {u.activeReferrals} activos</span> },
            { label: 'Código', value: <span className="text-sm font-mono text-primary">{u.referralCode}</span> },
            { label: 'Se unió', value: <span className="text-sm text-foreground">{format(new Date(u.joinedAt), "d MMM yyyy", { locale: es })}</span> },
            { label: 'Membresía vence', value: u.membershipExpiresAt ? <SmallCountdown expiresAt={u.membershipExpiresAt} /> : <span className="text-xs text-muted-foreground">—</span> },
            { label: 'Temporizador', value: <span className="text-xs">{u.timerStarted ? '✅ Iniciado' : '⏳ En espera del primer referido'}</span> },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between py-2 border-b border-border gap-3">
              <span className="text-sm text-muted-foreground shrink-0">{label}</span>
              <div className="text-right">{value}</div>
            </div>
          ))}
        </div>

        <p className="text-xs font-bold text-foreground mb-2">Cambiar estado</p>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.filter(o => o.value !== u.accountStatus).map(({ value, label, icon: Icon, color }) => (
            <button key={value} onClick={() => { onUpdate(u.id, value); onClose(); }} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${color}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {u.phone && (
          <a href={u.whatsappUrl ?? `https://wa.me/${u.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/20 transition-colors">
            <MessageCircle className="w-4 h-4" />Escribir por WhatsApp
          </a>
        )}

        <div className="mt-4 pt-4 border-t border-border">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />Eliminar usuario
            </button>
          ) : (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
              <p className="text-sm font-semibold text-red-400 text-center">⚠️ ¿Eliminar a <span className="font-bold">{u.name}</span>?</p>
              <p className="text-xs text-muted-foreground text-center">Se borrarán todos sus pagos. Sus referidos quedarán sin referidor. Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={() => { onDelete(u.id); onClose(); }}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Overview ────────────────────────────────────────────────────────────────
function OverviewSection() {
  const { data: raw, isLoading } = useAdminGetStats();
  const stats = raw as any; // extended with profit fields
  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const totalNetProfit       = (stats?.totalNetProfit   ?? 0) as number;
  const monthlyNetProfit     = (stats?.monthlyNetProfit ?? 0) as number;
  const totalRevenue         = (stats?.totalRevenue     ?? 0) as number;
  const monthlyRevenue       = (stats?.monthlyRevenue   ?? 0) as number;
  const totalCommissionsSent = (stats?.totalCommissionsSent   ?? 0) as number;
  const monthlyCommsSent     = (stats?.monthlyCommissionsSent ?? 0) as number;
  const commissionsFailed    = (stats?.commissionsFailed  ?? 0) as number;
  const commissionsSkipped   = (stats?.commissionsSkipped ?? 0) as number;
  const totalInitial         = (stats?.totalInitialPayments  ?? 0) as number;
  const totalRenewals        = (stats?.totalRenewalPayments  ?? 0) as number;

  const cards = [
    { label: 'Usuarios totales',    value: stats?.totalUsers    ?? 0,    icon: Users,     color: 'text-[#C9A227]',  bg: 'bg-[#C9A227]/10' },
    { label: 'Cuentas activas',     value: stats?.activeUsers   ?? 0,    icon: Activity,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Pagos pendientes',    value: stats?.pendingPayments ?? 0,  icon: Receipt,   color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
    { label: 'Vencen esta semana',  value: stats?.expiringThisWeek ?? 0, icon: Clock,     color: 'text-orange-400',  bg: 'bg-orange-400/10' },
    { label: 'Membresías iniciales',value: totalInitial,                 icon: DollarSign,color: 'text-purple-400',  bg: 'bg-purple-400/10' },
    { label: 'Renovaciones',        value: totalRenewals,                icon: TrendingUp, color: 'text-pink-400',   bg: 'bg-pink-400/10' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Stoic admin banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <img src="/dash-admin.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-top" style={{ opacity: 0.18, filter: 'saturate(0.45) brightness(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,9,3,0.92) 0%, rgba(13,9,3,0.65) 100%)' }} />
        <div className="relative px-6 py-5">
          <h1 className="text-2xl font-extrabold" style={{ background: 'linear-gradient(90deg, #E8C547, #C9A227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Panel de Administración</h1>
          <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(201,162,39,0.5)' }}>"El que gobierna a otros debe primero gobernarse a sí mismo." — Séneca</p>
        </div>
      </div>

      {/* ── NET PROFIT HERO BLOCK ─────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16,32,16,0.95) 0%, rgba(14,10,5,0.98) 100%)', border: '1px solid rgba(52,211,153,0.3)', boxShadow: '0 0 40px -15px rgba(52,211,153,0.2)' }}>
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-emerald-400">Ganancia Neta — Dinero Limpio</p>
              <p className="text-xs text-muted-foreground">Lo que realmente es tuyo después de todas las comisiones</p>
            </div>
          </div>
        </div>

        {/* Two big numbers */}
        <div className="grid grid-cols-2 gap-px mx-6 mb-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(52,211,153,0.15)' }}>
          <div className="px-5 py-4" style={{ background: 'rgba(52,211,153,0.05)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-1">Total acumulado</p>
            <p className="text-3xl font-extrabold text-emerald-400">${totalNetProfit.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">USDT ganancia limpia</p>
          </div>
          <div className="px-5 py-4" style={{ background: 'rgba(52,211,153,0.03)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-1">Este mes</p>
            <p className="text-3xl font-extrabold" style={{ color: monthlyNetProfit >= 0 ? '#34d399' : '#f87171' }}>
              ${monthlyNetProfit.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">USDT ganancia limpia</p>
          </div>
        </div>

        {/* Calculation breakdown */}
        <div className="mx-6 mb-5 rounded-xl p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Cómo se calcula</p>

          {/* All time */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Histórico total</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs text-muted-foreground">Bruto recibido ({totalInitial + totalRenewals} pagos)</span>
              </div>
              <span className="text-xs font-bold text-blue-400">+${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-muted-foreground">Comisiones enviadas a referidos</span>
              </div>
              <span className="text-xs font-bold text-red-400">−${totalCommissionsSent.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-foreground">= Ganancia neta</span>
              </div>
              <span className="text-sm font-extrabold text-emerald-400">${totalNetProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* This month */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Este mes</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-xs text-muted-foreground">Bruto recibido</span>
              </div>
              <span className="text-xs font-bold text-blue-400">+${monthlyRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-muted-foreground">Comisiones enviadas</span>
              </div>
              <span className="text-xs font-bold text-red-400">−${monthlyCommsSent.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-foreground">= Ganancia neta mes</span>
              </div>
              <span className="text-sm font-extrabold text-emerald-400">${monthlyNetProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Extra info row */}
        <div className="grid grid-cols-2 gap-3 mx-6 mb-5">
          <div className="rounded-xl p-3 space-y-0.5" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-yellow-400/70">Comisiones no cobradas</p>
            <p className="text-lg font-extrabold text-yellow-400">${commissionsSkipped.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Referidor inactivo o sin billetera — legítimamente tuyo</p>
          </div>
          <div className="rounded-xl p-3 space-y-0.5" style={{ background: commissionsFailed > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(14,10,5,0.5)', border: commissionsFailed > 0 ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(255,255,255,0.05)' }}>
            <p className={`text-[10px] font-bold uppercase tracking-wide ${commissionsFailed > 0 ? 'text-red-400/70' : 'text-muted-foreground/50'}`}>Comisiones fallidas</p>
            <p className={`text-lg font-extrabold ${commissionsFailed > 0 ? 'text-red-400' : 'text-muted-foreground/40'}`}>${commissionsFailed.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{commissionsFailed > 0 ? '⚠️ Revisar — fondos en billetera pero no enviados' : 'Sin comisiones fallidas ✓'}</p>
          </div>
        </div>

        {/* Payment type mini stats */}
        <div className="mx-6 mb-6 flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(201,162,39,0.04)', border: '1px solid rgba(201,162,39,0.12)' }}>
          <div className="flex-1 text-center">
            <p className="text-lg font-extrabold" style={{ color: '#C9A227' }}>{totalInitial}</p>
            <p className="text-[10px] text-muted-foreground">Membresías iniciales</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 text-center">
            <p className="text-lg font-extrabold text-purple-400">{totalRenewals}</p>
            <p className="text-[10px] text-muted-foreground">Renovaciones</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex-1 text-center">
            <p className="text-lg font-extrabold text-blue-400">{totalInitial + totalRenewals}</p>
            <p className="text-[10px] text-muted-foreground">Pagos totales</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Status pills ─────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-4 gap-3">
        {[
          { label: 'Pendientes', value: stats?.pendingUsers ?? 0, color: 'text-yellow-400', bg: 'bg-yellow-400/5 border-yellow-400/20' },
          { label: 'Activas',    value: stats?.activeUsers  ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-400/5 border-emerald-400/20' },
          { label: 'Pausadas',   value: stats?.pausedUsers  ?? 0, color: 'text-orange-400', bg: 'bg-orange-400/5 border-orange-400/20' },
          { label: 'Perdidas',   value: stats?.lostUsers    ?? 0, color: 'text-red-400',    bg: 'bg-red-400/5 border-red-400/20' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`border rounded-xl p-4 text-center ${bg}`}>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Users ────────────────────────────────────────────────────────────────────
function UsuariosSection() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useAdminListUsers();
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [, navigate] = useLocation();

  const filtered = useMemo(() => {
    return (users ?? []).filter((u: any) => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q) || u.referralCode?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || u.accountStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const handleUpdate = (id: number, accountStatus: string) => {
    updateUser.mutate({ id, data: { accountStatus: accountStatus as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
      }
    });
  };

  const stConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    active: { label: 'Activa', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
    paused: { label: 'Pausada', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' },
    lost: { label: 'Perdida', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
  };

  return (
    <div className="space-y-6">
      {/* ── Stoic section banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <img src="/dash-network.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center" style={{ opacity: 0.16, filter: 'saturate(0.45) brightness(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,9,3,0.93) 0%, rgba(13,9,3,0.65) 100%)' }} />
        <div className="relative px-6 py-5">
          <h2 className="text-xl font-extrabold" style={{ color: '#E8C547' }}>Usuarios</h2>
          <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(201,162,39,0.5)' }}>{filtered.length} usuario{filtered.length !== 1 ? 's' : ''} · "Conoce a todos, confía en pocos, no le hagas daño a nadie." — Marco Aurelio</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, email, teléfono o código..." className="w-full pl-9 pr-4 h-10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" style={{ background: 'rgba(14,10,5,0.8)', border: '1px solid rgba(201,162,39,0.15)' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl text-sm text-foreground focus:outline-none" style={{ background: 'rgba(14,10,5,0.8)', border: '1px solid rgba(201,162,39,0.15)' }}>
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="active">Activos</option>
          <option value="paused">Pausados</option>
          <option value="lost">Perdidos</option>
        </select>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
        <div className="space-y-2">
          {filtered.length === 0 ? <p className="text-center py-12 text-sm text-muted-foreground">No se encontraron usuarios.</p> : filtered.map((u: any) => {
            const st = stConfig[u.accountStatus] ?? stConfig.pending;
            return (
              <button key={u.id} onClick={() => setSelectedUser(u)} className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left" style={{ background: 'rgba(14,10,5,0.75)', border: '1px solid rgba(201,162,39,0.12)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,162,39,0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(201,162,39,0.12)'; }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.25)', color: '#C9A227' }}>
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-foreground">{u.name}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${st.bg} ${st.color}`}>
                      <span className={`w-1 h-1 rounded-full ${st.dot}`} />{st.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  {u.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />{u.phone}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <p className="text-xs text-muted-foreground">{u.totalReferrals} ref.</p>
                  {u.membershipExpiresAt && u.timerStarted && <SmallCountdown expiresAt={u.membershipExpiresAt} />}
                  {!u.timerStarted && u.accountStatus === 'active' && <span className="text-[10px] text-yellow-400">⏳ Sin timer</span>}
                  <span
                    role="button"
                    onClick={e => { e.stopPropagation(); navigate(`/admin/arbol?highlight=${u.id}`); }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer select-none"
                    style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)', color: '#C9A227' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,162,39,0.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,162,39,0.1)'; }}
                  >
                    <GitBranch className="w-3 h-3" />
                    Ver en árbol
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onUpdate={handleUpdate} onDelete={handleDelete} />}
    </div>
  );
}

// ── Global Tree ─────────────────────────────────────────────────────────────
function ArbolSection() {
  const { data: tree, isLoading } = useAdminGetTree();
  const [, navigate] = useLocation();

  // Read ?highlight=USER_ID from the URL
  const highlightParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('highlight') : null;
  const highlightUserId = highlightParam ? parseInt(highlightParam, 10) : undefined;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  return (
    <div className="space-y-6">
      {/* ── Stoic section banner ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,162,39,0.2)' }}>
        <img src="/dash-network.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center" style={{ opacity: 0.16, filter: 'saturate(0.45) brightness(1.1)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,9,3,0.93) 0%, rgba(13,9,3,0.65) 100%)' }} />
        <div className="relative px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold" style={{ color: '#E8C547' }}>Árbol Genealógico Global</h2>
            <p className="text-xs mt-0.5 italic" style={{ color: 'rgba(201,162,39,0.5)' }}>Toda la red de RedGain — "Somos la suma de todo lo que hemos hecho."</p>
          </div>
        {highlightUserId && (
          <button
            onClick={() => navigate('/admin/arbol')}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold hover:bg-yellow-400/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Limpiar búsqueda
          </button>
        )}
        </div>
      </div>
      <div className="p-3 rounded-xl" style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)' }}>
        <p className="text-xs font-medium" style={{ color: 'rgba(201,162,39,0.7)' }}>Los nodos raíz son usuarios sin referidor. Cada rama muestra el árbol completo hacia abajo.</p>
      </div>
      <div className="rounded-2xl p-4 overflow-hidden" style={{ background: 'rgba(14,10,5,0.85)', border: '1px solid rgba(201,162,39,0.15)' }}>
        <GenealogyTree nodes={(tree ?? []) as any} highlightUserId={highlightUserId} />
      </div>
    </div>
  );
}

/* ── Payments (comentado — sistema ahora es automático) ─────────────────────
function PagosSection() {
  const queryClient = useQueryClient();
  const { data: payments, isLoading } = useAdminListPayments();
  const reviewPayment = useAdminReviewPayment();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [filter, setFilter] = useState('pending');
  const [, navigate] = useLocation();

  const filtered = useMemo(() => {
    return (payments ?? []).filter((p: any) => filter === 'all' || p.status === filter);
  }, [payments, filter]);

  const handleReview = (id: number, status: 'approved' | 'rejected') => {
    reviewPayment.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListPaymentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
      }
    });
  };

  const stConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    approved: { label: 'Aprobado', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    rejected: { label: 'Rechazado', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Pagos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Aprueba o rechaza comprobantes de pago.</p>
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobados' : f === 'rejected' ? 'Rechazados' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div> : (
        <div className="space-y-3">
          {filtered.length === 0 ? <p className="text-center py-12 text-sm text-muted-foreground">No hay pagos en esta categoría.</p> : filtered.map((p: any) => {
            const st = stConfig[p.status] ?? stConfig.pending;
            const imgs = p.proofImageUrls?.length ? p.proofImageUrls : p.proofImageUrl ? [p.proofImageUrl] : [];
            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {p.userName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{p.userName}</p>
                      <p className="text-xs text-muted-foreground">{p.userEmail}</p>
                      {p.userPhone && (
                        <a href={`https://wa.me/${p.userPhone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5"><MessageCircle className="w-3 h-3" />{p.userPhone}</a>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-foreground">${p.amount}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${st.bg} ${st.color}`}>{st.label}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.paymentType === 'renewal' ? 'Renovación' : 'Inicial'}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{p.proofText}</p>
                {imgs.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {imgs.map((url: string, i: number) => (
                      <img key={i} src={url} alt="comprobante" className="w-14 h-14 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80" onClick={() => setLightbox({ images: imgs, index: i })} />
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">{format(new Date(p.createdAt), "d MMM yyyy HH:mm", { locale: es })}</span>
                    <button
                      onClick={() => navigate(`/admin/arbol?highlight=${p.userId}`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 text-xs font-semibold transition-colors"
                      title="Ver esta persona en el árbol global"
                    >
                      <GitBranch className="w-3.5 h-3.5" />Ver en árbol
                    </button>
                  </div>
                  {p.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleReview(p.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-colors"><X className="w-3.5 h-3.5" />Rechazar</button>
                      <button onClick={() => handleReview(p.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors"><Check className="w-3.5 h-3.5" />Aprobar</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {lightbox && <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}
─────────────────────────────────────────────────────────────────────────── */

/* ── Commissions (comentado — sistema ahora es automático) ──────────────────
function ComisionesSection() {
  const { data: report, isLoading } = useAdminGetCommissions();
  const queryClient = useQueryClient();

  // Distribution status — fetched without a generated hook (direct fetch)
  const [distStatus, setDistStatus] = React.useState<any>(null);
  const [distHistory, setDistHistory] = React.useState<any[]>([]);
  const [marking, setMarking] = React.useState(false);
  const [markMsg, setMarkMsg] = React.useState('');

  const fetchDistStatus = React.useCallback(async () => {
    try {
      const [statusRes, histRes] = await Promise.all([
        fetch('/api/admin/commissions/distribution-status', { credentials: 'include' }),
        fetch('/api/admin/commissions/history', { credentials: 'include' }),
      ]);
      if (statusRes.ok) setDistStatus(await statusRes.json());
      if (histRes.ok) setDistHistory(await histRes.json());
    } catch { /* ignore * / }
  }, []);

  React.useEffect(() => { fetchDistStatus(); }, [fetchDistStatus]);

  const handleMarkDistributed = async () => {
    if (!report) return;
    setMarking(true);
    setMarkMsg('');
    try {
      const res = await fetch('/api/admin/commissions/mark-distributed', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: report.totalToDistribute,
          recipientCount: report.recipients?.length ?? 0,
        }),
      });
      if (res.ok) {
        setMarkMsg('✅ Ciclo marcado como distribuido correctamente.');
        await fetchDistStatus();
      } else {
        setMarkMsg('❌ Error al marcar. Intenta de nuevo.');
      }
    } catch {
      setMarkMsg('❌ Error de conexión.');
    }
    setMarking(false);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const alreadyDistributed = distStatus?.distributed === true;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Calculadora de Comisiones</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Cuánto debes enviar a cada persona el día 15.</p>
      </div>

      {/* Distribution status banner * /}
      {alreadyDistributed ? (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-400">Este ciclo ya fue distribuido</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Marcado el {distStatus.distribution?.distributedAt ? format(new Date(distStatus.distribution.distributedAt), "d MMM yyyy 'a las' HH:mm", { locale: es }) : '—'}
              {distStatus.distribution?.distributedBy ? ` por ${distStatus.distribution.distributedBy}` : ''}
              {\` · $${(distStatus.distribution?.totalAmount ?? 0).toFixed(2)} a ${distStatus.distribution?.recipientCount ?? 0} personas\`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-400">Pendiente de distribución</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Este ciclo aún no se ha marcado como distribuido. Cuando envíes el dinero a todos, haz clic en el botón de abajo.
            </p>
          </div>
        </div>
      )}

      {/* Cycle info * /}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Ciclo', value: report?.cycleMonth ?? '—', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Renovaciones contadas', value: report?.totalRenewals ?? 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Total a distribuir', value: `$${(report?.totalToDistribute ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <p className="text-2xl font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Dates * /}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-foreground mb-4">Fechas del ciclo</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { label: 'Corte (día 10)', date: report?.cutoffDate ? format(new Date(report.cutoffDate), "d MMM yyyy") : '—', color: 'border-orange-400/30 bg-orange-400/5 text-orange-400' },
            { label: 'Distribución (día 15)', date: report?.distributionDate ? format(new Date(report.distributionDate), "d MMM yyyy") : '—', color: 'border-emerald-400/30 bg-emerald-400/5 text-emerald-400' },
          ].map(({ label, date, color }) => (
            <div key={label} className={`shrink-0 border rounded-xl px-4 py-3 text-center ${color}`}>
              <p className="text-xs font-bold">{date}</p>
              <p className="text-[10px] mt-0.5 opacity-80">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-primary font-medium">
            El día 15 debes enviar ${(report?.totalToDistribute ?? 0).toFixed(2)} en total a {report?.recipients?.length ?? 0} personas.
            La plataforma retiene ${(report?.platformFee ?? 0).toFixed(2)} (${1} por renovación).
          </p>
        </div>
      </div>

      {/* Recipients * /}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-foreground mb-4">A quién enviar y cuánto</p>
        {(report?.recipients?.length ?? 0) === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay renovaciones registradas antes del día 10 de este mes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(report?.recipients ?? []).map((r: any) => (
              <div key={r.userId} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {r.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    {r.phone && (
                      <a href={r.whatsappUrl ?? `https://wa.me/${r.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5"><MessageCircle className="w-3 h-3" />{r.phone}</a>
                    )}
                    <div className="flex gap-2 mt-1">
                      {r.breakdown?.level1Renewals > 0 && <span className="text-[10px] text-blue-400">L1: {r.breakdown.level1Renewals}×$6</span>}
                      {r.breakdown?.level2Renewals > 0 && <span className="text-[10px] text-purple-400">L2: {r.breakdown.level2Renewals}×$2</span>}
                      {r.breakdown?.level3Renewals > 0 && <span className="text-[10px] text-cyan-400">L3: {r.breakdown.level3Renewals}×$1</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-extrabold text-emerald-400">${r.totalAmount.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">USDT BSC BEP20</p>
                  {r.phone && (
                    <a href={r.whatsappUrl ?? `https://wa.me/${r.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-semibold hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle className="w-2.5 h-2.5" />WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mark as distributed button * /}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-sm font-bold text-foreground mb-2">
          {alreadyDistributed ? 'Marcar de nuevo (corregir)' : 'Confirmar distribución'}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          {alreadyDistributed
            ? 'Ya está marcado. Solo haz clic de nuevo si necesitas corregirlo (ej. cambiaron los montos).'
            : 'Cuando hayas enviado el dinero a todas las personas de la lista, haz clic aquí para registrarlo. Esto evita que confundas este ciclo con uno pendiente.'}
        </p>
        <button
          onClick={handleMarkDistributed}
          disabled={marking}
          className={`w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 ${
            alreadyDistributed
              ? 'border border-border bg-muted text-muted-foreground hover:bg-muted/80'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {marking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {alreadyDistributed ? 'Actualizar registro' : 'Marcar como distribuido'}
        </button>
        {markMsg && (
          <p className={`text-xs mt-3 font-medium ${markMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{markMsg}</p>
        )}
      </div>

      {/* Distribution history * /}
      {distHistory.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm font-bold text-foreground mb-4">Historial de distribuciones</p>
          <div className="space-y-2">
            {distHistory.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">{d.cycleMonth}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(d.distributedAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                    {d.distributedBy ? ` · ${d.distributedBy}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-emerald-400">${(d.totalAmount ?? 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{d.recipientCount} personas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important notes * /}
      <div className="space-y-2">
        {[
          '⚠️ Solo se cuentan las renovaciones aprobadas entre el día 1 y el día 10 del mes.',
          '📅 Los usuarios que renuevan después del día 10 se contarán en el ciclo del mes siguiente.',
          '💰 Billetera de envío: 0x2E5321848a874f5d43C9B0f59caE3e07DFC8D449 (USDT BSC BEP20)',
        ].map((note, i) => (
          <p key={i} className="text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/50 border border-border">{note}</p>
        ))}
      </div>
    </div>
  );
}
─────────────────────────────────────────────────────────────────────────── */

// ── Main Admin ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [location] = useLocation();
  const { user } = useAuth();

  const section = location.includes('/usuarios') ? 'usuarios'
    : location.includes('/arbol') ? 'arbol'
    : 'resumen';

  const topbar = (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227' }}>Admin</span>
      <span className="text-sm font-medium hidden sm:block" style={{ color: 'rgba(201,162,39,0.8)' }}>{user?.name}</span>
    </div>
  );

  return (
    <AdminLayout topbar={topbar}>
      {section === 'resumen' && <OverviewSection />}
      {section === 'usuarios' && <UsuariosSection />}
      {section === 'arbol' && <ArbolSection />}
    </AdminLayout>
  );
}
