import React, { useState } from 'react';
import { Menu, Users, LogOut, Activity, LayoutDashboard, Shield } from 'lucide-react';
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
      `} style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #0A0A0A 100%)', borderColor: 'rgba(225, 6, 19,0.12)' }}>

        {/* Logo */}
        <div className="relative h-16 flex items-center px-6 gap-3" style={{ borderBottom: '1px solid rgba(225, 6, 19,0.15)' }}>
          <Logo className="w-9 h-9" />
          <div>
            <span className="font-bold text-sm tracking-tight block" style={{ color: '#FF4D57' }}>RedGain</span>
            <span className="text-[10px] font-medium uppercase tracking-widest flex items-center gap-1" style={{ color: 'rgba(225, 6, 19,0.5)' }}>
              <Shield className="w-2.5 h-2.5" />Panel Admin
            </span>
          </div>
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
                  active ? 'text-[#FF4D57]' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={active ? {
                  background: 'linear-gradient(90deg, rgba(225, 6, 19,0.15), rgba(225, 6, 19,0.05))',
                  border: '1px solid rgba(225, 6, 19,0.2)',
                  boxShadow: '0 0 12px -4px rgba(225, 6, 19,0.2)',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                }}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#E10613]' : 'text-muted-foreground'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="relative p-3" style={{ borderTop: '1px solid rgba(225, 6, 19,0.1)' }}>
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


        {/* ── Header ── */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 backdrop-blur-md"
          style={{ borderBottom: '1px solid rgba(225, 6, 19,0.1)', background: 'rgba(13,9,3,0.78)' }}>
          <div className="flex items-center md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
            <Logo className="w-7 h-7 mr-1.5" />
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
