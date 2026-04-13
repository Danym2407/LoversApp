import { useState, useEffect, useCallback } from 'react';

const BASE = '/api/admin';

const D = {
  bg:     '#0D0709',
  card:   '#1A0F11',
  border: '#3A1A20',
  wine:   '#1C0E10',
  coral:  '#C44455',
  gold:   '#D4A520',
  blue:   '#5B8ECC',
  green:  '#5BAA6A',
  cream:  '#FDF6EC',
  muted:  '#9A7A6A',
  text:   '#EDE0D0',
  danger: '#E05555',
};

function adminFetch(path, secret, options = {}) {
  return fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': secret,
      ...(options.headers || {}),
    },
  }).then(async r => {
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
          <div style={{ fontSize: 40, marginBottom: 8 }}>🛡️</div>
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
    { label: 'Usuarios', value: stats.users,          icon: '👥', color: D.blue  },
    { label: 'Citas realizadas', value: stats.datesDone,     icon: '💑', color: D.coral },
    { label: 'Cartas',   value: stats.letters,        icon: '✉️',  color: D.gold  },
    { label: 'Momentos', value: stats.moments,        icon: '📸', color: D.green },
    { label: 'Retos completados', value: stats.challengesDone, icon: '🏆', color: '#B07BCC' },
    { label: 'Swipes citas', value: stats.swipes,     icon: '💘', color: '#E07BAA' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12, marginBottom: 28,
    }}>
      {cards.map(c => (
        <div key={c.label} style={{
          background: D.card, borderRadius: 14, padding: '18px 16px',
          border: `1px solid ${D.border}`, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28 }}>{c.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1.2, marginTop: 4 }}>{c.value}</div>
          <div style={{ fontSize: 12, color: D.muted, marginTop: 2 }}>{c.label}</div>
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

function UserModal({ user, secret, onClose, onDelete }) {
  const [tab, setTab]     = useState('perfil');
  const [data, setData]   = useState({});
  const [loading, setLoading] = useState({});

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
            <div style={{ color: D.text, fontWeight: 700, fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || user.email}</div>
            <div style={{ color: D.muted, fontSize: 12 }}>{user.email}</div>
            {user.partner_name && <div style={{ color: D.coral, fontSize: 12 }}>💕 {user.partner_name}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { if (window.confirm(`¿Eliminar usuario ${user.name || user.email} y todos sus datos?`)) onDelete(user.id); }}
              style={{ padding: '7px 14px', background: D.danger, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Eliminar
            </button>
            <button
              onClick={onClose}
              style={{ padding: '7px 14px', background: D.border, color: D.text, border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>

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
                  cols={['#', 'Cita ID', 'Estado', 'Fecha', 'Lugar', 'P1 ⭐', 'P1 ❤️', 'Reseña']}
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
                    r.favorite ? '❤️' : '—',
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
                    r.favorite ? '❤️' : '—',
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
                        ? <span style={{ color: D.green }}>❤️ Like</span>
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
  );
}

// ── Main Admin Dashboard ───────────────────────────────────────────────────────
export default function AdminPage({ navigateTo }) {
  const [secret, setSecret]         = useState(() => sessionStorage.getItem('adminSecret') || '');
  const [authed, setAuthed]         = useState(false);
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    setLoadingData(true); setError('');
    try {
      const [s, u] = await Promise.all([
        adminFetch('/stats', secret),
        adminFetch('/users', secret),
      ]);
      setStats(s); setUsers(u);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingData(false);
    }
  }, [secret]);

  const handleLogin = (s) => {
    setSecret(s);
    sessionStorage.setItem('adminSecret', s);
    setAuthed(true);
  };

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminSecret');
    setAuthed(false); setSecret(''); setStats(null); setUsers([]);
  };

  const handleDelete = async (id) => {
    try {
      await adminFetch(`/users/${id}`, secret, { method: 'DELETE' });
      setUsers(u => u.filter(x => x.id !== id));
      setSelected(null);
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  const filtered = users.filter(u =>
    !search.trim() ||
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100dvh', background: D.bg, fontFamily: 'Lora, Georgia, serif', color: D.text }}>

      {/* Top bar */}
      <div style={{
        background: D.card, borderBottom: `1px solid ${D.border}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigateTo('home')} style={{ background: 'none', border: 'none', color: D.muted, cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        <span style={{ fontSize: 20 }}>🛡️</span>
        <span style={{ fontWeight: 700, fontSize: 17, color: D.coral, flex: 1 }}>Panel de Administración</span>
        <button onClick={load} disabled={loadingData} style={{
          padding: '6px 14px', background: D.border, border: 'none',
          color: D.text, borderRadius: 8, fontSize: 13, cursor: 'pointer',
        }}>
          {loadingData ? '…' : '⟳ Actualizar'}
        </button>
        <button onClick={handleLogout} style={{
          padding: '6px 14px', background: '#3A1010', border: 'none',
          color: D.danger, borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600,
        }}>
          Salir
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto' }}>
        {error && (
          <div style={{ background: '#3A1010', border: `1px solid ${D.danger}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: D.danger, fontSize: 14 }}>
            {error}
          </div>
        )}

        {stats && <StatsGrid stats={stats} />}

        {/* Users section */}
        <div style={{ background: D.card, borderRadius: 16, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px', borderBottom: `1px solid ${D.border}`,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: D.text, flex: 1 }}>
              Usuarios ({filtered.length})
            </h2>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email…"
              style={{
                padding: '8px 14px', borderRadius: 8, border: `1px solid ${D.border}`,
                background: D.wine, color: D.text, fontSize: 13, width: 240, outline: 'none',
              }}
            />
          </div>

          {loadingData ? (
            <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>Cargando usuarios…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: D.muted }}>No hay usuarios</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: D.wine }}>
                    {['Usuario', 'Email', 'Pareja', 'Creado', 'Último acceso', 'Datos', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', color: D.muted, fontSize: 12, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: `1px solid ${D.border}22`, background: i % 2 === 0 ? 'transparent' : `${D.wine}44` }}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={u.name} size={30} />
                          <span style={{ color: D.text, fontSize: 14, fontWeight: 600 }}>{u.name || '(sin nombre)'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: D.muted, fontSize: 13 }}>{u.email}</td>
                      <td style={{ padding: '10px 14px', color: D.coral, fontSize: 13 }}>{u.partner_name || '—'}</td>
                      <td style={{ padding: '10px 14px', color: D.muted, fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(u.created_at)}</td>
                      <td style={{ padding: '10px 14px', color: D.muted, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtTime(u.last_login)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {Object.entries(u.counts || {}).map(([k, v]) => (
                            <span key={k} style={{ background: D.border, padding: '2px 8px', borderRadius: 12, fontSize: 11, color: D.gold }}>
                              {k[0].toUpperCase()}: {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => setSelected(u)}
                          style={{
                            padding: '6px 14px', background: D.coral, color: '#fff',
                            border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600,
                          }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <UserModal
          user={selected}
          secret={secret}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
