import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Users, UserPlus, Link2, Search, MessageCircle, Trash2, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/lib/auth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminListUsers, useAdminDeleteUser, getAdminListUsersQueryKey } from '@workspace/api-client-react';

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

function OverviewSection() {
  const { data: users, isLoading } = useAdminListUsers();
  const stats = useMemo(() => {
    const list = (users ?? []).filter((u: any) => u.role !== 'admin');
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: list.length,
      week: list.filter((u: any) => new Date(u.joinedAt).getTime() >= weekAgo).length,
      referred: list.filter((u: any) => u.referrerId).length,
    };
  }, [users]);
  const items = [
    { icon: Users, label: 'Usuarios registrados', value: stats.total },
    { icon: UserPlus, label: 'Nuevos en 7 días', value: stats.week },
    { icon: Link2, label: 'Llegaron por referido', value: stats.referred },
  ];
  return (
    <div className="space-y-6">
      <Banner title="Resumen" subtitle="Vista general de RedGain." />
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/40" /> : (
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl p-6" style={card}>
              <div className="flex items-center gap-2 text-white/55 text-sm mb-2"><Icon className="w-4 h-4" style={{ color: RED_LIGHT }} /> {label}</div>
              <p className="text-4xl font-black">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsuariosSection() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useAdminListUsers();
  const deleteUser = useAdminDeleteUser();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (users ?? []).filter((u: any) => !t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t) || u.referralCode.toLowerCase().includes(t));
  }, [users, q]);

  const remove = (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      },
    });
  };

  return (
    <div className="space-y-6">
      <Banner title="Usuarios" subtitle={`${filtered.length} usuario${filtered.length === 1 ? '' : 's'}`} />
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo o código" className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#141414] border border-[#E10613]/20 text-white placeholder:text-white/30 focus:outline-none focus:border-[#E10613]/60" />
      </div>
      <div className="rounded-2xl overflow-hidden" style={card}>
        {isLoading ? <div className="p-6"><Loader2 className="w-5 h-5 animate-spin text-white/40" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-white/40 border-b border-white/10">
                <tr><th className="p-4">Usuario</th><th className="p-4">Código</th><th className="p-4">Referido por</th><th className="p-4">Registro</th><th className="p-4" /></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u: any) => (
                  <tr key={u.id}>
                    <td className="p-4"><p className="font-semibold">{u.name}</p><p className="text-xs text-white/40">{u.email}</p></td>
                    <td className="p-4 font-mono text-xs" style={{ color: RED_LIGHT }}>{u.referralCode}</td>
                    <td className="p-4 text-white/60">{u.referrerName ?? '—'}</td>
                    <td className="p-4 text-white/50 whitespace-nowrap">{format(new Date(u.joinedAt), 'd MMM yyyy', { locale: es })}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        {u.whatsappUrl && <a href={u.whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5" title="WhatsApp"><MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} /></a>}
                        {u.role !== 'admin' && <button onClick={() => remove(u.id, u.name)} className="p-2 rounded-lg hover:bg-white/5" title="Eliminar"><Trash2 className="w-4 h-4" style={{ color: RED }} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [location] = useLocation();
  const { user } = useAuth();
  const section = location.includes('/usuarios') ? 'usuarios' : 'resumen';

  const topbar = (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ background: RED }}>ADMIN</span>
      <span className="text-sm font-medium hidden sm:block text-white/80">{user?.name}</span>
    </div>
  );

  return (
    <AdminLayout topbar={topbar}>
      {section === 'resumen' && <OverviewSection />}
      {section === 'usuarios' && <UsuariosSection />}
    </AdminLayout>
  );
}
