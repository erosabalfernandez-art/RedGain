import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import HowItWorks from '@/pages/HowItWorks';
import VerifyEmail from '@/pages/VerifyEmail';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';

const queryClient = new QueryClient();

function EmailUnverifiedScreen({ email }: { email: string }) {
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const handleResend = async () => {
    setSending(true);
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include',
    }).catch(() => {});
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0C09] p-6">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B6914]/15 blur-[140px] pointer-events-none" />
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="font-black text-2xl text-white">RedGain</span>
        </div>
        <div className="bg-[#1A1208]/70 border border-[#C9A227]/15 p-10 rounded-3xl relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent rounded-t-3xl" />
          <div className="w-16 h-16 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Verifica tu correo</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Te enviamos un enlace de verificación a<br />
            <span className="text-[#E8C547] font-semibold">{email}</span>.<br />
            Haz clic en ese enlace para acceder a tu cuenta.
          </p>
          {sent ? (
            <p className="text-emerald-400 text-sm font-semibold">✅ Email reenviado. Revisa tu bandeja.</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-sm font-medium text-white/40 hover:text-[#E8C547] transition-colors disabled:opacity-50"
            >
              {sending ? 'Enviando…' : '¿No llegó el email? Reenviar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (!user.emailVerified) {
    return <EmailUnverifiedScreen email={user.email} />;
  }

  if (adminOnly && user.role !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/como-funciona" component={HowItWorks} />
      <Route path="/verify-email" component={VerifyEmail} />
      {/* Dashboard sections — all handled by Dashboard with internal tab routing */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/dashboard/:section">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      {/* Admin sections — all handled by Admin with internal tab routing */}
      <Route path="/admin">
        {() => <ProtectedRoute component={Admin} adminOnly />}
      </Route>
      <Route path="/admin/:section">
        {() => <ProtectedRoute component={Admin} adminOnly />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
