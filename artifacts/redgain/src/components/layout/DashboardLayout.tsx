import React, { useState, useRef, useEffect } from 'react';
import { Menu, LayoutDashboard, LogOut, Users, CreditCard, Clock, BookOpen, Bell } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/lib/auth';
import { Link, useLocation } from 'wouter';
import { useGetMyNotifications, useMarkNotificationsRead, getGetMyNotificationsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STOIC_SIDEBAR_QUOTE = '"Concentra tus pensamientos en lo que haces ahora."';
const STOIC_SIDEBAR_AUTHOR = '— Marco Aurelio';

// ── Notification bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useGetMyNotifications({
    query: { refetchInterval: 10_000, queryKey: getGetMyNotificationsQueryKey() },
  });
  const markRead = useMarkNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      markRead.mutate(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyNotificationsQueryKey() });
        },
      });
    }
  };

  const iconColor: Record<string, string> = {
    commission_sent:    'text-emerald-400',
    commission_failed:  'text-red-400',
    new_referral:       'text-[#C9A227]',
    payment_confirmed:  'text-emerald-400',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold text-black"
            style={{ background: 'linear-gradient(135deg, #E8C547, #C9A227)' }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 max-h-[420px] overflow-y-auto rounded-2xl shadow-2xl z-[200] flex flex-col"
          style={{ background: 'rgba(13,9,3,0.98)', border: '1px solid rgba(201,162,39,0.2)', backdropFilter: 'blur(16px)' }}
        >
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'rgba(201,162,39,0.15)', background: 'rgba(13,9,3,0.98)' }}>
            <p className="text-sm font-bold" style={{ color: '#E8C547' }}>Notificaciones</p>
            {unread > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(201,162,39,0.12)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.25)' }}>
                {unread} sin leer
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Bell className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">Sin notificaciones aún</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Te avisaremos cuando lleguen tus comisiones.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(201,162,39,0.08)' }}>
              {notifications.map((n: any) => (
                <div key={n.id} className={`px-4 py-3 transition-colors ${n.read ? 'opacity-60' : ''}`}
                  style={!n.read ? { background: 'rgba(201,162,39,0.04)' } : {}}>
                  <div className="flex items-start gap-3">
                    <span className={`text-base mt-0.5 shrink-0 ${iconColor[n.type] ?? 'text-muted-foreground'}`}>
                      {n.title.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#C9A227' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardLayout({ children, topbar }: { children: React.ReactNode; topbar?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Mis Referidos', icon: Users, href: '/dashboard/referidos' },
    { label: 'Pagos', icon: CreditCard, href: '/dashboard/pagos' },
    { label: 'Membresía', icon: Clock, href: '/dashboard/membresia' },
    { label: 'Cómo Funciona', icon: BookOpen, href: '/como-funciona?from=dashboard' },
  ];

  const isActive = (href: string) => location === href || (href !== '/dashboard' && location.startsWith(href));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        flex flex-col border-r
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0
      `} style={{ background: 'linear-gradient(180deg, #100C05 0%, #0E0A04 60%, #0C0802 100%)', borderColor: 'rgba(201,162,39,0.12)' }}>

        {/* Sidebar background image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-none">
          <img
            src="/stoic-columns.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.06, filter: 'saturate(0.4) brightness(1.2)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, #0E0A04 80%)' }} />
        </div>

        {/* Logo */}
        <div className="relative h-16 flex items-center px-6 gap-3" style={{ borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B6914, #C9A227)', boxShadow: '0 0 16px -4px rgba(201,162,39,0.6)' }}>
            <Logo className="w-4 h-4 text-[#0E0A04]" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: '#E8C547' }}>RedGain</span>
        </div>

        {/* Stoic quote */}
        <div className="relative px-5 pt-4 pb-2">
          <p className="text-[10px] leading-relaxed italic" style={{ color: 'rgba(201,162,39,0.5)' }}>{STOIC_SIDEBAR_QUOTE}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(201,162,39,0.35)' }}>{STOIC_SIDEBAR_AUTHOR}</p>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? 'text-[#E8C547]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={active ? {
                  background: 'linear-gradient(90deg, rgba(201,162,39,0.15), rgba(201,162,39,0.05))',
                  border: '1px solid rgba(201,162,39,0.2)',
                } : {}}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C9A227]' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative p-4 border-t" style={{ borderColor: 'rgba(201,162,39,0.12)' }}>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">

        {/* Atmospheric backgrounds */}
        <div className="pointer-events-none">
          {/* Aurelius bust — top-right */}
          <div className="fixed top-0 right-0 w-[45vw] h-[55vh] z-0 overflow-hidden">
            <img
              src="/dash-aurelius.jpg"
              alt=""
              className="w-full h-full object-cover object-top"
              style={{ opacity: 0.07, filter: 'saturate(0.3) brightness(1.3)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, transparent 0%, rgba(14,10,5,0.5) 50%, rgba(14,10,5,1) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,10,5,1) 0%, transparent 60%)' }} />
          </div>

          {/* Roman forum — bottom-left */}
          <div className="fixed bottom-0 left-0 w-[55vw] h-[60vh] z-0 overflow-hidden">
            <img
              src="/dash-forum.jpg"
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ opacity: 0.08, filter: 'saturate(0.45) brightness(1.2)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(14,10,5,0.6) 50%, rgba(14,10,5,1) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(14,10,5,1) 0%, transparent 40%)' }} />
          </div>

          {/* Gold ambient glow — top right */}
          <div className="fixed top-[-15%] right-[-8%] w-[40vw] h-[40vw] rounded-full z-0" style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          {/* Warm glow — bottom left */}
          <div className="fixed bottom-[-10%] left-[5%] w-[30vw] h-[30vw] rounded-full z-0" style={{ background: 'radial-gradient(circle, rgba(180,120,20,0.05) 0%, transparent 70%)', filter: 'blur(100px)' }} />
          {/* Center ambient */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full z-0" style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.025) 0%, transparent 70%)', filter: 'blur(120px)' }} />
        </div>

        {/* ── Header ── */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 backdrop-blur-md"
          style={{ borderBottom: '1px solid rgba(201,162,39,0.1)', background: 'rgba(14,10,5,0.75)' }}>
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-6 h-6 rounded-md flex items-center justify-center mr-1.5" style={{ background: 'linear-gradient(135deg, #8B6914, #C9A227)' }}>
              <Logo className="w-3.5 h-3.5 text-[#0E0A04]" />
            </div>
          </div>

          <div className="hidden md:flex flex-1" />
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            {topbar}
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
