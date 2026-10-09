import React from 'react';

interface State { error: Error | null }

// Si algo falla al dibujar la web, en vez de pantalla negra se muestra un aviso con botón para recargar.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Error de la web:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <img src="/logo.png" alt="RedGain" width={64} height={64} style={{ margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>Algo salió mal</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>
            No pudimos mostrar esta pantalla. Recarga la página; si el problema sigue, avísanos.
          </p>
          <button onClick={() => window.location.reload()} style={{ background: '#E10613', color: '#fff', border: 0, borderRadius: 10, padding: '12px 22px', fontWeight: 700, cursor: 'pointer' }}>
            Recargar
          </button>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 18, wordBreak: 'break-word' }}>{String(this.state.error.message).slice(0, 160)}</p>
        </div>
      </div>
    );
  }
}
