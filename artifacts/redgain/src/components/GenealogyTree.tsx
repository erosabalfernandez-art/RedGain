import React, { useState, useRef, useEffect } from 'react';
import { Phone, X, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface TreeNode {
  id: number;
  name: string;
  phone?: string | null;
  whatsappUrl?: string | null;
  accountStatus: 'pending' | 'active' | 'paused' | 'lost';
  level: number;
  membershipExpiresAt?: string | null;
  membershipTimerStartedAt?: string | null;
  daysRemaining?: number | null;
  children?: TreeNode[];
}

const statusConfig = {
  active: { label: 'Activa', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
  paused: { label: 'Pausada', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' },
  lost: { label: 'Perdida', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
};

const levelColors: Record<number, string> = {
  1: 'border-blue-500/40 bg-blue-500/5',
  2: 'border-purple-500/40 bg-purple-500/5',
  3: 'border-cyan-500/40 bg-cyan-500/5',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function findNodeById(nodes: TreeNode[], id: number): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNodeById(n.children ?? [], id);
    if (found) return found;
  }
  return null;
}

function subtreeContains(node: TreeNode, id: number): boolean {
  if (node.id === id) return true;
  return (node.children ?? []).some(c => subtreeContains(c, id));
}

const levelLabels: Record<number, { label: string; commission: string; color: string }> = {
  1: { label: 'Nivel 1', commission: '$6', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  2: { label: 'Nivel 2', commission: '$2', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  3: { label: 'Nivel 3', commission: '$1', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
};

function NodeCard({ node, onSelect, highlightUserId }: { node: TreeNode; onSelect: (n: TreeNode) => void; highlightUserId?: number }) {
  const st = statusConfig[node.accountStatus as keyof typeof statusConfig] ?? statusConfig.pending;
  const lv = levelLabels[node.level];
  const isHighlighted = highlightUserId !== undefined && node.id === highlightUserId;
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isHighlighted && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }, 150);
    }
  }, [isHighlighted]);

  return (
    <button
      ref={ref}
      onClick={() => onSelect(node)}
      className={`text-left p-3 rounded-xl border transition-all hover:scale-105 hover:shadow-lg cursor-pointer min-w-[160px] max-w-[200px] ${
        isHighlighted
          ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400 ring-offset-2 ring-offset-background shadow-lg shadow-yellow-400/30 animate-pulse'
          : levelColors[node.level] ?? 'border-border bg-card'
      }`}
    >
      {isHighlighted && (
        <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
          Persona buscada
        </p>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isHighlighted ? 'bg-yellow-400/20 text-yellow-400' : 'bg-primary/20 text-primary'}`}>
          {node.name.charAt(0).toUpperCase()}
        </div>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${st.bg} ${st.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {st.label}
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground truncate">{node.name}</p>
      {lv && (
        <span className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${lv.color}`}>
          {lv.label} · {lv.commission}
        </span>
      )}
      {node.phone && (
        <p className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1">
          <Phone className="w-2.5 h-2.5" />
          {node.phone}
        </p>
      )}
    </button>
  );
}

function TreeBranch({ node, onSelect, highlightUserId }: { node: TreeNode; onSelect: (n: TreeNode) => void; highlightUserId?: number }) {
  const hasHighlightInSubtree = highlightUserId !== undefined && subtreeContains(node, highlightUserId);
  const [collapsed, setCollapsed] = useState(() => !hasHighlightInSubtree);
  const hasChildren = node.children && node.children.length > 0;

  // If highlight changes (e.g. navigating to the arbol with a new id), auto-expand
  useEffect(() => {
    if (hasHighlightInSubtree) setCollapsed(false);
  }, [highlightUserId]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <NodeCard node={node} onSelect={onSelect} highlightUserId={highlightUserId} />
        {hasChildren && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted z-10 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {hasChildren && !collapsed && (
        <div className="mt-4 pt-4 relative">
          {/* Vertical line down from parent */}
          <div className="absolute top-0 left-1/2 w-px h-4 bg-border -translate-x-1/2" />
          <div className="flex gap-4 items-start relative">
            {/* Horizontal line connecting children */}
            {node.children!.length > 1 && (
              <div
                className="absolute top-0 bg-border h-px"
                style={{
                  left: `calc(50% / ${node.children!.length})`,
                  right: `calc(50% / ${node.children!.length})`,
                }}
              />
            )}
            {node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line up to horizontal */}
                <div className="w-px h-4 bg-border" />
                <TreeBranch node={child} onSelect={onSelect} highlightUserId={highlightUserId} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NodeDetailModal({ node, onClose }: { node: TreeNode; onClose: () => void }) {
  const st = statusConfig[node.accountStatus as keyof typeof statusConfig] ?? statusConfig.pending;
  const lv = levelLabels[node.level];

  const daysRemaining = node.membershipExpiresAt
    ? Math.ceil((new Date(node.membershipExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
              {node.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">{node.name}</h3>
              {lv && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${lv.color}`}>
                  {lv.label} · ganas {lv.commission}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Estado de cuenta</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${st.bg} ${st.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>

          {/* Phone / WhatsApp */}
          {node.phone ? (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <a
                href={node.whatsappUrl ?? `https://wa.me/${node.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {node.phone}
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <span className="text-xs text-muted-foreground italic">No registrado</span>
            </div>
          )}

          {/* Membership */}
          {node.membershipTimerStartedAt ? (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Membresía vence</span>
              <span className={`text-sm font-semibold ${daysRemaining !== null && daysRemaining <= 7 ? 'text-orange-400' : 'text-foreground'}`}>
                {node.membershipExpiresAt ? format(new Date(node.membershipExpiresAt), "d MMM yyyy", { locale: es }) : '—'}
                {daysRemaining !== null && ` (${daysRemaining}d)`}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Temporizador</span>
              <span className="text-xs text-yellow-400">Esperando 1er referido</span>
            </div>
          )}
        </div>

        {/* Warning if inactive */}
        {(node.accountStatus === 'paused' || node.accountStatus === 'lost') && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-400 font-medium">
              {node.accountStatus === 'paused'
                ? 'Cuenta pausada — sin comisiones ni nuevos referidos hasta renovar.'
                : 'Cuenta perdida — perdió su árbol y debe empezar de cero.'}
            </p>
          </div>
        )}

        {/* WhatsApp button */}
        {node.phone && (
          <a
            href={node.whatsappUrl ?? `https://wa.me/${node.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Escribir por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

interface GenealogyTreeProps {
  nodes: TreeNode[];
  showRoot?: boolean;
  rootLabel?: string;
  highlightUserId?: number;
}

export function GenealogyTree({ nodes, showRoot = false, rootLabel, highlightUserId }: GenealogyTreeProps) {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Auto-open detail modal for highlighted user
  useEffect(() => {
    if (highlightUserId) {
      const found = findNodeById(nodes, highlightUserId);
      if (found) setSelectedNode(found);
    }
  }, [highlightUserId, nodes]);

  if (nodes.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No hay referidos en el árbol todavía.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {highlightUserId && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
          <p className="text-xs text-yellow-400 font-medium">Mostrando ubicación del usuario en el árbol. El nodo amarillo pulsante es la persona buscada.</p>
        </div>
      )}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 justify-center min-w-max p-4">
          {nodes.map((node) => (
            <TreeBranch key={node.id} node={node} onSelect={setSelectedNode} highlightUserId={highlightUserId} />
          ))}
        </div>
      </div>
      {selectedNode && <NodeDetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  );
}

// Flat list view per level
export function ReferralListByLevel({
  level1, level2, level3,
}: {
  level1: TreeNode[];
  level2: TreeNode[];
  level3: TreeNode[];
}) {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1);

  const sections = [
    { level: 1, nodes: level1, label: 'Nivel 1 — Referidos Directos', commission: '$6 c/u', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
    { level: 2, nodes: level2, label: 'Nivel 2 — Segunda generación', commission: '$2 c/u', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
    { level: 3, nodes: level3, label: 'Nivel 3 — Tercera generación', commission: '$1 c/u', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5' },
  ];

  return (
    <div className="space-y-4">
      {sections.map(({ level, nodes, label, commission, color, border, bg }) => (
        <div key={level} className={`border ${border} ${bg} rounded-2xl overflow-hidden`}>
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${color}`}>{label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${border} ${color} font-medium`}>{commission}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">{nodes.length} persona{nodes.length !== 1 ? 's' : ''}</span>
              {expandedLevel === level ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>

          {expandedLevel === level && (
            <div className="border-t border-border divide-y divide-border">
              {nodes.length === 0 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">Sin referidos en este nivel todavía.</p>
              ) : (
                nodes.map((node) => {
                  const st = statusConfig[node.accountStatus as keyof typeof statusConfig] ?? statusConfig.pending;
                  const daysLeft = node.membershipExpiresAt
                    ? Math.ceil((new Date(node.membershipExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {node.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{node.name}</p>
                          {node.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {node.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {node.membershipTimerStartedAt && daysLeft !== null && (
                          <span className={`text-xs font-medium flex items-center gap-1 ${daysLeft <= 7 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                            <Clock className="w-3 h-3" />
                            {daysLeft}d
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${st.bg} ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      ))}
      {selectedNode && <NodeDetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  );
}
