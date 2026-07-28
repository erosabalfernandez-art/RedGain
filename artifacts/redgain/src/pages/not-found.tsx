import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-white/10 mb-4">404</h1>
        <p className="text-xl font-bold text-white mb-6">Página no encontrada</p>
        <Link href="/" className="text-[#60A5FA] hover:text-[#3B82F6] transition-colors font-semibold">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
