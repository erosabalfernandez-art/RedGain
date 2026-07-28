import React, { useState } from 'react';
import { Menu, LayoutDashboard, LogOut, Users, CreditCard, Clock, BookOpen, Flame } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/lib/auth';
import { Link, useLocation } from 'wouter';

const STOIC_SIDEBAR_QUOTE = '"Concentra tus pensamientos en lo que haces ahora."';
const STOIC_SIDEBAR_AUTHOR = '— Marco Aurelio';

export function DashboardLayout({ children, topbar }: { children: React.ReactNode; topbar?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: 'Inicio', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Mis Referidos', icon: Users, href: '/dashboard/referidos' },
    { label: 'Pagos', icon: CreditCard, href: '/dashboard/pagos' },
    { label: 'Membresía', icon: Clock, href: '/dashboard/membresia' },
    { label: 'Cómo Funciona', icon: BookOpen, href: '/como-funciona' },
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
                  boxShadow: '0 0 12px -4px rgba(201,162,39,0.2)',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                }}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C9A227]' : 'text-muted-foreground'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="relative p-3" style={{ borderTop: '1px solid rgba(201,162,39,0.1)' }}>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            style={{ border: '1px solid transparent' }}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* ── Full-page stoic background ── */}
        <div className="pointer-events-none select-none" aria-hidden="true">
          {/* Marcus Aurelius — top-right */}
          <div className="fixed top-0 right-0 w-[60vw] h-[75vh] z-0 overflow-hidden">
            <img
              src="/dash-aurelius.jpg"
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ opacity: 0.1, filter: 'saturate(0.5) brightness(1.1)' }}
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

          {/* Stoic flame icon for header center on mobile */}
          <div className="hidden md:flex flex-1" />
          <div className="flex items-center gap-4 ml-auto">{topbar}</div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
