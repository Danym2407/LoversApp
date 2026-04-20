import { useState, useEffect, useCallback } from 'react';

const BASE = '/api/admin';

const D = {
  bg:     '#0D0709',
  card:   '#1A0F11',
  border: '#3A1A20',
  wine:   '#2D1B2E',
  coral:  '#FF6B8A',
  gold:   '#D4A520',
  blue:   '#5B8ECC',
  green:  '#5BAA6A',
  cream:  '#FFF5F7',
  muted:  '#9B8B95',
  text:   '#EDE0D0',
  danger: '#E05555',
  purple: '#9B7BCC',
};

function adminFetch(path, secret, options = {}) {
  return fetch(BASE + path, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': secret,
      ...(options.headers || {}),
    },
  }).then(async r => {
    if (r.status === 304) return {};
    const json = await r.json();
    if (!r.ok) throw new Error(json.error || 'Error');
    return json;
  });
}

// ── Small helpers ──────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${D.coral}, ${D.gold})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, color: '#fff', flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function RoleBadge({ role }) {
  const cfg = {
    admin:     { bg: '#3A1520', color: D.coral,  label: 'Admin'  },
    moderator: { bg: '#1A2A3A', color: D.blue,   label: 'Mod'    },
    user:      { bg: '#1A2A1A', color: D.green,  label: 'User'   },
  };
  const c = cfg[role] || cfg.user;
  return (
    <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
      {c.label}
    </span>
  );
}

function ActionBadge({ action = '' }) {
  const color = action.includes('hard') || action.includes('delete') ? D.danger
              : action.includes('restore')  ? D.green
              : action.includes('role')     ? D.purple
              : action.includes('db_row')   ? D.blue
              : D.gold;
  return (
    <span style={{ background: `${color}22`, color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>
      {action}
    </span>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, danger = false, requireTyping = null, confirmLabel = 'Confirmar' }) {
  const [text, setText] = useState('');
  const canConfirm = requireTyping ? text === requireTyping : true;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, fontFamily: 'Lora, Georgia, serif' }}>
      <div style={{ background: D.card, borderRadius: 16, padding: '28px 24px', border: `1px solid ${danger ? D.danger : D.border}`, maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
        <h3 style={{ color: danger ? D.danger : D.text, margin: '0 0 10px', fontSize: 17 }}>{title}</h3>
        <p style={{ color: D.muted, margin: '0 0 18px', fontSize: 13, lineHeight: 1.6 }}>{message}</p>
        {requireTyping && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ color: D.muted, fontSize: 12, marginBottom: 6 }}>
              Escribe <code style={{ color: D.danger }}>{requireTyping}</code> para confirmar:
            </p>
            <input value={text} onChange={e => setText(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${D.border}`, background: D.wine, color: D.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: 8, border: `1px solid ${D.border}`, background: 'transparent', color: D.muted, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          <button onClick={onConfirm} disabled={!canConfirm} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: danger ? D.danger : D.coral, color: '#fff', cursor: canConfirm ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, opacity: canConfirm ? 1 : 0.5 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Login Screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [secret, setSecret] = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    if (!secret.trim()) return;
    setLoading(true); setError('');
    try {
      await adminFetch('/stats', secret.trim());
      onLogin(secret.trim());
    } catch {
      setError('Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', background: D.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Lora, Georgia, serif',
    }}>
      <div style={{
        background: D.card, borderRadius: 20, padding: '48px 40px',
        border: `1px solid ${D.border}`, width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <h1 style={{ color: D.coral, fontSize: 24, fontWeight: 700, margin: 0 }}>Panel de Admin</h1>
          <p style={{ color: D.muted, fontSize: 14, margin: '8px 0 0' }}>LoversApp — Acceso restringido</p>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Contraseña de administrador"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 10,
              border: `1px solid ${error ? D.danger : D.border}`,
              background: D.wine, color: D.text, fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {error && <p style={{ color: D.danger, fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 20, width: '100%', padding: '14px',
              background: `linear-gradient(135deg, ${D.coral}, #a33344)`,
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stats Cards ────────────────────────────────────────────────────────────────
function StatsGrid({ stats }) {
  const cards = [
    { label: 'Usuarios activos', value: stats.users,          icon: '👥', color: D.blue   },
    { label: 'Citas realizadas', value: stats.datesDone,      icon: '💑', color: D.coral  },
    { label: 'Cartas',           value: stats.letters,        icon: '💌',  color: D.gold   },
    { label: 'Momentos',         value: stats.moments,        icon: '📸', color: D.green  },
    { label: 'Retos completos',  value: stats.challengesDone, icon: '🎯', color: D.purple },
    { label: 'Swipes',           value: stats.swipes,         icon: '💘', color: '#E07BAA' },
    { label: 'Archivados',       value: stats.deletedUsers,   icon: '📦', color: D.muted  },
    { label: 'Nuevos (7d)',      value: stats.recentSignups,  icon: '🆕', color: D.gold   },
    { label: 'Acciones admin',   value: stats.totalLogs,      icon: '📋', color: D.blue   },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: D.card, borderRadius: 12, padding: '16px 14px', border: `1px solid ${D.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 24 }}>{c.icon}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: c.color, lineHeight: 1.2, marginTop: 4 }}>{c.value ?? '—'}</div>
          <div style={{ fontSize: 11, color: D.muted, marginTop: 2 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── User Detail Modal ──────────────────────────────────────────────────────────
const DATA_TABS = [
  { key: 'perfil',    label: 'Perfil' },
  { key: 'citas',     label: 'Citas' },
  { key: 'cartas',    label: 'Cartas' },
  { key: 'momentos',  label: 'Momentos' },
  { key: 'retos',     label: 'Retos' },
  { key: 'calendar',  label: 'Calendario' },
  { key: 'timeline',  label: 'Timeline' },
  { key: 'swipes',    label: 'Swipes' },
  { key: 'fechas',    label: 'Fechas' },
  { key: 'countdown', label: 'Countdowns' },
];

function UserDetailModal({ user, secret, onClose, onAction }) {
  const [tab, setTab]     = useState('perfil');
  const [data, setData]   = useState({});
  const [loading, setLoading] = useState({});
  const [roleChanging, setRoleChanging] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [actionErr, setActionErr] = useState('');

  const handleRoleChange = async role => {
    setRoleChanging(true); setActionErr('');
    try {
      await adminFetch(`/users/${user.id}/role`, secret, { method: 'PATCH', body: JSON.stringify({ role }) });
      onAction('role_changed', { ...user, role });
    } catch (e) { setActionErr(e.message); }
    finally { setRoleChanging(false); }
  };
  const handleSoftDelete = () => setConfirm({
    title: 'Archivar usuario',
    message: `¿Archivar a ${user.name || user.email}? Podrá restaurarse más tarde.`,
    danger: true, confirmLabel: 'Archivar',
    onConfirm: async () => {
      setConfirm(null);
      try { await adminFetch(`/users/${user.id}`, secret, { method: 'DELETE' }); onAction('soft_deleted', user); onClose(); }
      catch (e) { setActionErr(e.message); }
    },
  });
  const handleRestore = async () => {
    try { await adminFetch(`/users/${user.id}/restore`, secret, { method: 'POST' }); onAction('restored', user); onClose(); }
    catch (e) { setActionErr(e.message); }
  };
  const handleHardDelete = () => setConfirm({
    title: 'Eliminar permanentemente',
    message: `Borrará a ${user.name || user.email} y TODOS sus datos de forma irreversible.`,
    danger: true, confirmLabel: 'Eliminar para siempre', requireTyping: 'DELETE_PERMANENTLY',
    onConfirm: async () => {
      setConfirm(null);
      try { await adminFetch(`/users/${user.id}/hard`, secret, { method: 'DELETE', body: JSON.stringify({ confirm: 'DELETE_PERMANENTLY' }) }); onAction('hard_deleted', user); onClose(); }
      catch (e) { setActionErr(e.message); }
    },
  });

  const load = useCallback(async (key) => {
    if (data[key] !== undefined) return;
    setLoading(l => ({ ...l, [key]: true }));
    const endpoints = {
      citas:    `/users/${user.id}/couple-dates`,
      cartas:   `/users/${user.id}/letters`,
      momentos: `/users/${user.id}/moments`,
      retos:    `/users/${user.id}/challenges`,
      calendar: `/users/${user.id}/calendar`,
      timeline: `/users/${user.id}/timeline`,
      swipes:   `/users/${user.id}/swipes`,
      fechas:   `/users/${user.id}/important-dates`,
      countdown:`/users/${user.id}/countdowns`,
    };
    if (!endpoints[key]) { setLoading(l => ({ ...l, [key]: false })); return; }
    try {
      const result = await adminFetch(endpoints[key], secret);
      setData(d => ({ ...d, [key]: result }));
    } catch {
      setData(d => ({ ...d, [key]: [] }));
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  }, [data, user.id, secret]);

  useEffect(() => { if (tab !== 'perfil') load(tab); }, [tab, load]);

  const statusColor = s => s === 'completed' ? D.green : s === 'pending' ? D.gold : D.muted;
  const statusLabel = s => s === 'completed' ? 'Realizada' : s === 'pending' ? 'Pendiente' : s || '—';

  const Table = ({ cols, rows, renderRow }) => (
    rows.length === 0
      ? <p style={{ color: D.muted, textAlign: 'center', padding: '20px 0' }}>Sin datos</p>
      : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${D.border}` }}>
                {cols.map(c => (
                  <th key={c} style={{ padding: '8px 10px', color: D.muted, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${D.border}22` }}>
                  {renderRow(row).map((cell, j) => (
                    <td key={j} style={{ padding: '8px 10px', color: D.text, verticalAlign: 'top' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  );

  return (
    <>
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 9999, display: 'flex', alignItems: 'flex-end',
          fontFamily: 'Lora, Georgia, serif',
        }}
      >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxHeight: '90dvh', background: D.card,
          borderRadius: '20px 20px 0 0', border: `1px solid ${D.border}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${D.border}`, paddingBottom: 16,
        }}>
          <Avatar name={user.name} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: D.text, fontWeight: 700, fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.email}</span>
              <RoleBadge role={user.role} />
              {user.is_deleted ? <span style={{ background: '#3A1010', color: D.danger, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Archivado</span> : null}
            </div>
            <div style={{ color: D.muted, fontSize: 12 }}>{user.email}</div>
            {user.partner_name && <div style={{ color: D.coral, fontSize: 12 }}>💕 {user.partner_name}</div>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {user.is_deleted
              ? <button onClick={handleRestore} style={{ padding: '7px 12px', background: '#1A3A1A', color: D.green, border: `1px solid ${D.green}40`, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Restaurar</button>
              : <button onClick={handleSoftDelete} style={{ padding: '7px 12px', background: '#2A1515', color: D.danger, border: `1px solid ${D.danger}40`, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Archivar</button>
            }
            <button onClick={handleHardDelete} style={{ padding: '7px 12px', background: D.danger, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Borrar</button>
            <button onClick={onClose} style={{ padding: '7px 12px', background: D.border, color: D.text, border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        {actionErr && <div style={{ background: '#3A1010', color: D.danger, padding: '8px 20px', fontSize: 13 }}>{actionErr}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: `1px solid ${D.border}`, flexShrink: 0 }}>
          {DATA_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '10px 16px', background: 'none', border: 'none',
              color: tab === t.key ? D.coral : D.muted,
              borderBottom: tab === t.key ? `2px solid ${D.coral}` : '2px solid transparent',
              fontWeight: tab === t.key ? 700 : 400, cursor: 'pointer',
              whiteSpace: 'nowrap', fontSize: 13,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>

          {tab === 'perfil' && (
            <div>
              {[
                ['ID', user.id],
                ['Email', user.email],
                ['Verificado', user.email_verified ? '✓ Sí' : '✗ No'],
                ['Nombre', user.name || '—'],
                ['Pareja', user.partner_name || '—'],
                ['Código', user.partner_code || '—'],
                ['Coupled con', user.coupled_user_id || '—'],
                ['Inicio relación', fmt(user.relationship_start_date)],
                ['Fecha novios', fmt(user.boyfriend_date)],
                ['Creado', fmtTime(user.created_at)],
                ['Último acceso', fmtTime(user.last_login)],
                ['Saludo', user.greeting_message || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${D.border}22` }}>
                  <span style={{ color: D.muted, fontSize: 13, width: 140, flexShrink: 0 }}>{k}</span>
                  <span style={{ color: D.text, fontSize: 13, wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${D.border}22`, alignItems: 'center' }}>
                <span style={{ color: D.muted, fontSize: 13, width: 140, flexShrink: 0 }}>Rol</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <RoleBadge role={user.role} />
                  <select defaultValue={user.role || 'user'} onChange={e => handleRoleChange(e.target.value)} disabled={roleChanging}
                    style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${D.border}`, background: D.wine, color: D.text, fontSize: 12, cursor: 'pointer' }}>
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                  {roleChanging && <span style={{ color: D.muted, fontSize: 12 }}>Guardando…</span>}
                </div>
              </div>
              {user.personality_test && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ color: D.muted, fontSize: 12, marginBottom: 6 }}>Test de personalidad (JSON)</div>
                  <pre style={{ color: D.text, fontSize: 11, background: D.wine, padding: 12, borderRadius: 8, overflow: 'auto', maxHeight: 200 }}>
                    {JSON.stringify(JSON.parse(user.personality_test || '{}'), null, 2)}
                  </pre>
                </div>
              )}
              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(user.counts || {}).map(([k, v]) => (
                  <span key={k} style={{ background: D.wine, padding: '4px 12px', borderRadius: 20, fontSize: 12, color: D.gold }}>
                    {k}: {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tab === 'citas' && (
            loading.citas
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['#', 'Cita ID', 'Estado', 'Fecha', 'Lugar', 'P1 �?', 'P1 🎯�?', 'Reseña']}
                  rows={data.citas || []}
                  renderRow={r => [
                    r.id,
                    r.date_item_id,
                    <span style={{ color: statusColor(r.status) }}>{statusLabel(r.status)}</span>,
                    fmt(r.scheduled_date),
                    r.location || '—',
                    r.p1_stars ?? '—',
                    r.p1_hearts ?? '—',
                    r.p1_review ? r.p1_review.slice(0, 50) + (r.p1_review.length > 50 ? '…' : '') : '—',
                  ]}
                />
          )}

          {tab === 'cartas' && (
            loading.cartas
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['ID', 'De', 'Título', 'Favorita', 'Fecha']}
                  rows={data.cartas || []}
                  renderRow={r => [
                    r.id,
                    r.from_name,
                    r.title,
                    r.favorite ? '🎯�?' : '—',
                    fmt(r.created_at),
                  ]}
                />
          )}

          {tab === 'momentos' && (
            loading.momentos
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['ID', 'Título', 'Descripción', 'Fecha', 'Favorito']}
                  rows={data.momentos || []}
                  renderRow={r => [
                    r.id,
                    r.title,
                    r.description ? r.description.slice(0, 60) + (r.description.length > 60 ? '…' : '') : '—',
                    fmt(r.date),
                    r.favorite ? '🎯�?' : '—',
                  ]}
                />
          )}

          {tab === 'retos' && (
            loading.retos
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['ID', 'Reto', 'Tipo', 'Completado', 'Fecha']}
                  rows={data.retos || []}
                  renderRow={r => [
                    r.id,
                    r.challenge_id,
                    r.type || '—',
                    r.completed ? <span style={{ color: D.green }}>✓</span> : <span style={{ color: D.muted }}>✗</span>,
                    fmt(r.completed_at),
                  ]}
                />
          )}

          {tab === 'calendar' && (
            loading.calendar
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['ID', 'Título', 'Fecha', 'Tipo', 'Color']}
                  rows={data.calendar || []}
                  renderRow={r => [
                    r.id,
                    r.title,
                    fmt(r.date),
                    r.type || '—',
                    r.color ? <span style={{ background: r.color, padding: '2px 10px', borderRadius: 4, fontSize: 11 }}>{r.color}</span> : '—',
                  ]}
                />
          )}

          {tab === 'timeline' && (
            loading.timeline
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['ID', 'Título', 'Descripción', 'Fecha', 'Tipo']}
                  rows={data.timeline || []}
                  renderRow={r => [
                    r.id,
                    r.title,
                    r.description ? r.description.slice(0, 60) + (r.description.length > 60 ? '…' : '') : '—',
                    fmt(r.date),
                    r.type || '—',
                  ]}
                />
          )}

          {tab === 'swipes' && (
            loading.swipes
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : data.swipes ? (
                <div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      ['Total swipes', data.swipes.total, D.blue],
                      ['Likes', data.swipes.likes, D.green],
                      ['Dislikes', data.swipes.dislikes, D.danger],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ background: D.wine, padding: '12px 20px', borderRadius: 12, minWidth: 100, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                        <div style={{ fontSize: 12, color: D.muted }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <Table
                    cols={['Cita ID', 'Acción', 'Fecha']}
                    rows={data.swipes.rows || []}
                    renderRow={r => [
                      r.cita_id,
                      r.action === 'like'
                        ? <span style={{ color: D.green }}>🎯�? Like</span>
                        : <span style={{ color: D.danger }}>✗ Dislike</span>,
                      fmtTime(r.swiped_at),
                    ]}
                  />
                </div>
              ) : null
          )}

          {tab === 'fechas' && (
            loading.fechas
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['ID', 'Título', 'Fecha', 'Tipo', 'Icono']}
                  rows={data.fechas || []}
                  renderRow={r => [r.id, r.title || r.name || '—', fmt(r.date), r.type || '—', r.icon || '—']}
                />
          )}

          {tab === 'countdown' && (
            loading.countdown
              ? <p style={{ color: D.muted, textAlign: 'center' }}>Cargando…</p>
              : <Table
                  cols={['ID', 'Título', 'Fecha objetivo', 'Icono']}
                  rows={data.countdown || []}
                  renderRow={r => [r.id, r.title || r.name || '—', fmt(r.target_date), r.icon || '—']}
                />
          )}

        </div>
      </div>
    </div>
    </>
  );
}

// ── Overview Section ──────────────────────────────────────────────────────────
function OverviewSection({ stats, recentLogs }) {
  return (
    <div>
      {stats && <StatsGrid stats={stats} />}
      {recentLogs && recentLogs.length > 0 && (
        <div style={{ background: D.card, borderRadius: 14, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}>
            <span style={{ color: D.muted, fontSize: 12, fontWeight: 600 }}>ACTIVIDAD RECIENTE</span>
          </div>
          {recentLogs.slice(0, 15).map(log => (
            <div key={log.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${D.border}22`, display: 'flex', gap: 12, alignItems: 'center' }}>
              <ActionBadge action={log.action} />
              <span style={{ color: D.muted, fontSize: 12 }}>{log.entity} #{log.entity_id}</span>
              <span style={{ color: D.muted, fontSize: 11, marginLeft: 'auto', flexShrink: 0 }}>{fmtTime(log.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Users Section ─────────────────────────────────────────────────────────────
function UsersSection({ secret }) {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selected, setSelected]       = useState(null);
  const [error, setError]             = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const u = await adminFetch(
        `/users?deleted=${showDeleted ? 1 : 0}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        secret
      );
      setUsers(u);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [secret, showDeleted, search]);

  useEffect(() => { load(); }, [load]);

  const handleAction = (type, user) => {
    if (type === 'role_changed') {
      setUsers(u => u.map(x => x.id === user.id ? { ...x, role: user.role } : x));
    } else {
      setUsers(u => u.filter(x => x.id !== user.id));
    }
  };

  return (
    <div>
      {error && <div style={{ background: '#3A1010', color: D.danger, padding: '10px 16px', borderRadius: 10, marginBottom: 14, fontSize: 13 }}>{error}</div>}
      <div style={{ background: D.card, borderRadius: 14, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: D.text, fontWeight: 700, fontSize: 15, flex: 1 }}>Usuarios {loading ? '' : `(${users.length})`}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nombre o email…"
            style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${D.border}`, background: D.wine, color: D.text, fontSize: 13, width: 220, outline: 'none' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: D.muted, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} /> Archivados
          </label>
          <button onClick={load} style={{ padding: '7px 12px', background: D.border, border: 'none', color: D.text, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>⟳</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>Cargando…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>No hay usuarios</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: D.wine }}>
                  {['Usuario', 'Email', 'Rol', 'Pareja', 'Creado', 'Último acceso', 'Datos', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', color: D.muted, fontSize: 11, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${D.border}22`, background: i % 2 === 0 ? 'transparent' : `${D.wine}44`, opacity: u.is_deleted ? 0.55 : 1 }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={u.name} size={28} />
                        <span style={{ color: D.text, fontSize: 13, fontWeight: 600 }}>{u.name || '(sin nombre)'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: D.muted, fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: '10px 14px' }}><RoleBadge role={u.role} /></td>
                    <td style={{ padding: '10px 14px', color: D.coral, fontSize: 12 }}>{u.partner_name || '—'}</td>
                    <td style={{ padding: '10px 14px', color: D.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{fmt(u.created_at)}</td>
                    <td style={{ padding: '10px 14px', color: D.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{fmtTime(u.last_login)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {Object.entries(u.counts || {}).map(([k, v]) => (
                          <span key={k} style={{ background: D.border, padding: '2px 6px', borderRadius: 10, fontSize: 10, color: D.gold }}>{k[0].toUpperCase()}:{v}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => setSelected(u)} style={{ padding: '5px 12px', background: D.coral, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && <UserDetailModal user={selected} secret={secret} onClose={() => setSelected(null)} onAction={handleAction} />}
    </div>
  );
}

// ── Logs Section ──────────────────────────────────────────────────────────────
function LogsSection({ secret }) {
  const [logs, setLogs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminFetch(
        `/logs?limit=${LIMIT}&offset=${offset}${filterAction ? `&action=${encodeURIComponent(filterAction)}` : ''}`,
        secret
      );
      setLogs(r.logs || []); setTotal(r.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [secret, offset, filterAction]);

  useEffect(() => { load(); }, [load]);

  const ACTION_TYPES = ['', 'role_changed', 'user_soft_deleted', 'user_restored', 'user_hard_deleted', 'db_row_deleted', 'db_row_updated'];

  return (
    <div>
      <div style={{ background: D.card, borderRadius: 14, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: D.text, fontWeight: 700, fontSize: 15, flex: 1 }}>Audit Logs {loading ? '' : `(${total})`}</span>
          <select value={filterAction} onChange={e => { setOffset(0); setFilterAction(e.target.value); }}
            style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${D.border}`, background: D.wine, color: D.text, fontSize: 12 }}>
            {ACTION_TYPES.map(a => <option key={a} value={a}>{a || 'Todas las acciones'}</option>)}
          </select>
          <button onClick={load} style={{ padding: '7px 12px', background: D.border, border: 'none', color: D.text, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>⟳</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>Cargando…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>Sin registros</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: D.wine }}>
                  {['Fecha', 'Acción', 'Entidad', 'ID', 'Metadata'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', color: D.muted, fontSize: 11, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${D.border}22`, background: i % 2 === 0 ? 'transparent' : `${D.wine}44` }}>
                    <td style={{ padding: '10px 14px', color: D.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{fmtTime(log.created_at)}</td>
                    <td style={{ padding: '10px 14px' }}><ActionBadge action={log.action} /></td>
                    <td style={{ padding: '10px 14px', color: D.text, fontSize: 12, fontFamily: 'monospace' }}>{log.entity}</td>
                    <td style={{ padding: '10px 14px', color: D.muted, fontSize: 12 }}>{log.entity_id || '—'}</td>
                    <td style={{ padding: '10px 14px', color: D.muted, fontSize: 11, maxWidth: 280 }}>
                      {log.metadata ? <code style={{ fontSize: 10, wordBreak: 'break-all' }}>{log.metadata.slice(0, 120)}{log.metadata.length > 120 ? '…' : ''}</code> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > LIMIT && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${D.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              style={{ padding: '5px 12px', background: D.border, border: 'none', color: offset === 0 ? D.muted : D.text, borderRadius: 7, fontSize: 11, cursor: offset === 0 ? 'default' : 'pointer' }}>�? Prev</button>
            <span style={{ color: D.muted, fontSize: 12, flex: 1, textAlign: 'center' }}>{offset + 1}–{Math.min(offset + LIMIT, total)} de {total}</span>
            <button disabled={offset + LIMIT >= total} onClick={() => setOffset(offset + LIMIT)}
              style={{ padding: '5px 12px', background: D.border, border: 'none', color: offset + LIMIT >= total ? D.muted : D.text, borderRadius: 7, fontSize: 11, cursor: offset + LIMIT >= total ? 'default' : 'pointer' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Database Section ──────────────────────────────────────────────────────────
function DatabaseSection({ secret }) {
  const [tables, setTables]               = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData]         = useState(null);
  const [offset, setOffset]               = useState(0);
  const [loading, setLoading]             = useState(false);
  const [loadingTables, setLoadingTables] = useState(true);
  const [editingCell, setEditingCell]     = useState(null);
  const [editSaving, setEditSaving]       = useState(false);
  const [confirm, setConfirm]             = useState(null);
  const LIMIT = 30;
  const READONLY = new Set(['id', 'user_id', 'created_at']);

  useEffect(() => {
    adminFetch('/tables', secret).then(setTables).catch(() => {}).finally(() => setLoadingTables(false));
  }, [secret]);

  const loadTable = useCallback(async (name, off = 0) => {
    setLoading(true);
    try {
      const d = await adminFetch(`/tables/${name}?limit=${LIMIT}&offset=${off}`, secret);
      setTableData(d); setOffset(off);
    } catch {}
    finally { setLoading(false); }
  }, [secret]);

  const selectTable = name => { setSelectedTable(name); setTableData(null); setEditingCell(null); loadTable(name, 0); };

  const saveEdit = async () => {
    if (!editingCell || editSaving) return;
    setEditSaving(true);
    try {
      await adminFetch(`/tables/${selectedTable}/${editingCell.rowId}`, secret, {
        method: 'PATCH', body: JSON.stringify({ field: editingCell.field, value: editingCell.value }),
      });
      setTableData(d => ({ ...d, rows: d.rows.map(r => r.id === editingCell.rowId ? { ...r, [editingCell.field]: editingCell.value } : r) }));
    } catch {}
    finally { setEditSaving(false); setEditingCell(null); }
  };

  const deleteRow = id => setConfirm({
    title: 'Eliminar registro',
    message: `¿Eliminar fila ID ${id} de "${selectedTable}"? Esta acción no se puede deshacer.`,
    danger: true,
    onConfirm: async () => {
      setConfirm(null);
      try {
        await adminFetch(`/tables/${selectedTable}/${id}`, secret, { method: 'DELETE' });
        setTableData(d => ({ ...d, rows: d.rows.filter(r => r.id !== id), total: d.total - 1 }));
      } catch {}
    },
  });

  return (
    <>
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Table list */}
        <div style={{ background: D.card, borderRadius: 14, border: `1px solid ${D.border}`, width: 190, flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${D.border}` }}>
            <span style={{ color: D.muted, fontSize: 11, fontWeight: 600 }}>TABLAS</span>
          </div>
          {loadingTables
            ? <div style={{ padding: 20, textAlign: 'center', color: D.muted, fontSize: 12 }}>Cargando…</div>
            : tables.map(t => (
              <button key={t.name} onClick={() => selectTable(t.name)} style={{
                width: '100%', padding: '9px 14px', background: selectedTable === t.name ? `${D.coral}22` : 'none',
                border: 'none', borderBottom: `1px solid ${D.border}22`,
                color: selectedTable === t.name ? D.coral : D.text, cursor: 'pointer',
                textAlign: 'left', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'monospace' }}>{t.name}</span>
                <span style={{ background: D.border, padding: '1px 6px', borderRadius: 10, fontSize: 10, color: D.muted }}>{t.count}</span>
              </button>
            ))
          }
        </div>

        {/* Table rows */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedTable ? (
            <div style={{ background: D.card, borderRadius: 14, border: `1px solid ${D.border}`, padding: 40, textAlign: 'center', color: D.muted }}>
              Selecciona una tabla para ver sus datos
            </div>
          ) : loading ? (
            <div style={{ background: D.card, borderRadius: 14, border: `1px solid ${D.border}`, padding: 40, textAlign: 'center', color: D.muted }}>Cargando…</div>
          ) : tableData ? (
            <div style={{ background: D.card, borderRadius: 14, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${D.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: D.text, fontWeight: 700, fontSize: 13, fontFamily: 'monospace', flex: 1 }}>{selectedTable}</span>
                <span style={{ color: D.muted, fontSize: 12 }}>{tableData.total} filas</span>
                <button onClick={() => loadTable(selectedTable, offset)} style={{ padding: '4px 10px', background: D.border, border: 'none', color: D.text, borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>⟳</button>
              </div>
              {tableData.rows.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>Tabla vacía</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: D.wine }}>
                        {(tableData.columns || []).map(c => (
                          <th key={c.name} style={{ padding: '7px 10px', color: D.muted, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 11 }}>
                            {c.name}{c.pk ? ' 🔑' : ''}
                          </th>
                        ))}
                        <th style={{ padding: '7px 10px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.map((row, i) => (
                        <tr key={row.id} style={{ borderBottom: `1px solid ${D.border}22`, background: i % 2 === 0 ? 'transparent' : `${D.wine}33` }}>
                          {(tableData.columns || []).map(col => {
                            const isEditing  = editingCell?.rowId === row.id && editingCell?.field === col.name;
                            const isReadonly = READONLY.has(col.name);
                            const val        = String(row[col.name] ?? '');
                            return (
                              <td key={col.name} style={{ padding: '5px 10px', color: D.text, maxWidth: 150, verticalAlign: 'middle' }}>
                                {isEditing ? (
                                  <div style={{ display: 'flex', gap: 3 }}>
                                    <input autoFocus value={editingCell.value}
                                      onChange={e => setEditingCell(ec => ({ ...ec, value: e.target.value }))}
                                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingCell(null); }}
                                      style={{ width: 110, padding: '3px 6px', background: D.wine, border: `1px solid ${D.coral}`, borderRadius: 4, color: D.text, fontSize: 11, outline: 'none' }}
                                    />
                                    <button onClick={saveEdit} disabled={editSaving} style={{ padding: '2px 5px', background: D.green, border: 'none', borderRadius: 3, color: '#fff', cursor: 'pointer', fontSize: 10 }}>✓</button>
                                    <button onClick={() => setEditingCell(null)} style={{ padding: '2px 5px', background: D.border, border: 'none', borderRadius: 3, color: D.text, cursor: 'pointer', fontSize: 10 }}>✕</button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }} title={val}>
                                      {val.length > 35 ? val.slice(0, 35) + '…' : val || <span style={{ color: D.muted }}>null</span>}
                                    </span>
                                    {!isReadonly && (
                                      <button onClick={() => setEditingCell({ rowId: row.id, field: col.name, value: String(row[col.name] ?? '') })}
                                        style={{ padding: '1px 3px', background: 'transparent', border: 'none', color: D.muted, cursor: 'pointer', fontSize: 9, opacity: 0.5, flexShrink: 0 }} title="Editar">✎</button>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td style={{ padding: '5px 10px' }}>
                            <button onClick={() => deleteRow(row.id)} style={{ padding: '2px 7px', background: '#3A1010', color: D.danger, border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {tableData.total > LIMIT && (
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${D.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button disabled={offset === 0} onClick={() => loadTable(selectedTable, Math.max(0, offset - LIMIT))}
                    style={{ padding: '4px 10px', background: D.border, border: 'none', color: offset === 0 ? D.muted : D.text, borderRadius: 6, fontSize: 11, cursor: offset === 0 ? 'default' : 'pointer' }}>�? Prev</button>
                  <span style={{ color: D.muted, fontSize: 12, flex: 1, textAlign: 'center' }}>{offset + 1}–{Math.min(offset + LIMIT, tableData.total)} de {tableData.total}</span>
                  <button disabled={offset + LIMIT >= tableData.total} onClick={() => loadTable(selectedTable, offset + LIMIT)}
                    style={{ padding: '4px 10px', background: D.border, border: 'none', color: offset + LIMIT >= tableData.total ? D.muted : D.text, borderRadius: 6, fontSize: 11, cursor: offset + LIMIT >= tableData.total ? 'default' : 'pointer' }}>Next →</button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',  label: '📊 Overview'  },
  { id: 'users',     label: '👥 Usuarios'  },
  { id: 'logs',      label: '📋 Logs'      },
  { id: 'database',  label: '💾 Database'  },
];

export default function AdminPage({ navigateTo }) {
  const [secret, setSecret]         = useState(() => sessionStorage.getItem('adminSecret') || '');
  const [authed, setAuthed]         = useState(false);
  const [section, setSection]       = useState('overview');
  const [stats, setStats]           = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError]           = useState('');

  const loadOverview = useCallback(async (s) => {
    const sec = s || secret;
    if (!sec) return;
    setLoadingStats(true); setError('');
    try {
      const [st, lg] = await Promise.all([
        adminFetch('/stats', sec),
        adminFetch('/logs?limit=15', sec),
      ]);
      setStats(st); setRecentLogs(lg.logs || []);
    } catch (e) { setError(e.message); }
    finally { setLoadingStats(false); }
  }, [secret]);

  useEffect(() => { if (authed) loadOverview(); }, [authed]);

  const handleLogin = s => {
    setSecret(s);
    sessionStorage.setItem('adminSecret', s);
    setAuthed(true);
    loadOverview(s);
  };
  const handleLogout = () => {
    sessionStorage.removeItem('adminSecret');
    setAuthed(false); setSecret(''); setStats(null); setRecentLogs([]);
  };

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: '100dvh', background: D.bg, fontFamily: 'Lora, Georgia, serif', color: D.text }}>
      {/* Top bar */}
      <div style={{ background: D.card, borderBottom: `1px solid ${D.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigateTo('home')} style={{ background: 'none', border: 'none', color: D.muted, cursor: 'pointer', fontSize: 18, padding: 0 }}>&#x2190;</button>
        <span style={{ fontSize: 18 }}>🔒</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: D.coral, flex: 1 }}>Panel de Administración</span>
        <button onClick={() => loadOverview()} disabled={loadingStats} style={{ padding: '5px 12px', background: D.border, border: 'none', color: D.text, borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
          {loadingStats ? '…' : '⟳'}
        </button>
        <button onClick={handleLogout} style={{ padding: '5px 12px', background: '#3A1010', border: 'none', color: D.danger, borderRadius: 7, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Salir</button>
      </div>

      {/* Section tabs */}
      <div style={{ background: D.card, borderBottom: `1px solid ${D.border}`, display: 'flex', overflowX: 'auto' }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            padding: '11px 18px', background: 'none', border: 'none',
            color: section === s.id ? D.coral : D.muted,
            borderBottom: section === s.id ? `2px solid ${D.coral}` : '2px solid transparent',
            fontWeight: section === s.id ? 700 : 400, cursor: 'pointer',
            whiteSpace: 'nowrap', fontSize: 13, fontFamily: 'Lora, Georgia, serif',
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px', maxWidth: 1200, margin: '0 auto' }}>
        {error && (
          <div style={{ background: '#3A1010', border: `1px solid ${D.danger}`, borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: D.danger, fontSize: 13 }}>{error}</div>
        )}
        {section === 'overview' && <OverviewSection stats={stats} recentLogs={recentLogs} />}
        {section === 'users'    && <UsersSection secret={secret} />}
        {section === 'logs'     && <LogsSection secret={secret} />}
        {section === 'database' && <DatabaseSection secret={secret} />}
      </div>
    </div>
  );
}

