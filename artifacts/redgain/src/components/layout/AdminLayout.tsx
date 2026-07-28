import React, { useState } from 'react';
import { Menu, Users, LogOut, Activity, GitBranch, LayoutDashboard, Shield } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/lib/auth';
import { Link, useLocation } from 'wouter';

export function AdminLayout({ children, topbar }: { children: React.ReactNode; topbar?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: 'Resumen', icon: LayoutDashboard, href: '/admin' },
    { label: 'Usuarios', icon: Users, href: '/admin/usuarios' },
    { label: 'Árbol Global', icon: GitBranch, href: '/admin/arbol' },
  ];

  const isActive = (href: string) => location === href || (href !== '/admin' && location.startsWith(href));

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
      `} style={{ background: 'linear-gradient(180deg, #0F0B04 0%, #0D0903 100%)', borderColor: 'rgba(201,162,39,0.12)' }}>

        {/* Sidebar bg image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/dash-admin.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            style={{ opacity: 0.07, filter: 'saturate(0.3) brightness(1.1)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, #0D0903 70%)' }} />
        </div>

        {/* Logo */}
        <div className="relative h-16 flex items-center px-6 gap-3" style={{ borderBottom: '1px solid rgba(201,162,39,0.15)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B6914, #C9A227)', boxShadow: '0 0 16px -4px rgba(201,162,39,0.6)' }}>
            <Logo className="w-4 h-4 text-[#0E0A04]" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block" style={{ color: '#E8C547' }}>RedGain</span>
            <span className="text-[10px] font-medium uppercase tracking-widest flex items-center gap-1" style={{ color: 'rgba(201,162,39,0.5)' }}>
              <Shield className="w-2.5 h-2.5" />Panel Admin
            </span>
          </div>
        </div>

        {/* Stoic quote */}
        <div className="relative px-5 pt-4 pb-2">
          <p className="text-[10px] leading-relaxed italic" style={{ color: 'rgba(201,162,39,0.45)' }}>"El que gobierna a otros debe primero gobernarse a sí mismo."</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(201,162,39,0.3)' }}>— Séneca</p>
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
                  active ? 'text-[#E8C547]' : 'text-muted-foreground hover:text-foreground'
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
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col min-w-0 relative">

        {/* ── Stoic background layer ── */}
        <div className="pointer-events-none select-none" aria-hidden="true">
          {/* Admin hero image — top right */}
          <div className="fixed top-0 right-0 w-[55vw] h-[70vh] z-0 overflow-hidden">
            <img
              src="/dash-admin.jpg"
              alt=""
              className="w-full h-full object-cover object-top"
              style={{ opacity: 0.09, filter: 'saturate(0.45) brightness(1.1)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, transparent 0%, rgba(13,9,3,0.5) 50%, rgba(13,9,3,1) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,9,3,1) 0%, transparent 55%)' }} />
          </div>

          {/* Network image — bottom left */}
          <div className="fixed bottom-0 left-0 w-[50vw] h-[55vh] z-0 overflow-hidden">
            <img
              src="/dash-network.jpg"
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ opacity: 0.07, filter: 'saturate(0.4) brightness(1.2)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 0%, rgba(13,9,3,0.6) 50%, rgba(13,9,3,1) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,9,3,1) 0%, transparent 40%)' }} />
          </div>

          {/* Ambient gold glows */}
          <div className="fixed top-[-10%] right-[-5%] w-[35vw] h-[35vw] rounded-full z-0" style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="fixed bottom-[-10%] left-[10%] w-[25vw] h-[25vw] rounded-full z-0" style={{ background: 'radial-gradient(circle, rgba(180,120,20,0.04) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        </div>

        {/* ── Header ── */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 backdrop-blur-md"
          style={{ borderBottom: '1px solid rgba(201,162,39,0.1)', background: 'rgba(13,9,3,0.78)' }}>
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-6 h-6 rounded-md flex items-center justify-center mr-1.5" style={{ background: 'linear-gradient(135deg, #8B6914, #C9A227)' }}>
              <Logo className="w-3.5 h-3.5 text-[#0E0A04]" />
            </div>
          </div>
          <div className="hidden md:flex flex-1" />
          <div className="flex items-center gap-4 ml-auto">{topbar}</div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
