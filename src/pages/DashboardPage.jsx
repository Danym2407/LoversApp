import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MoreVertical, ChevronRight, LogOut, Settings, Heart,
         Zap, Mail, Calendar, Activity, BookOpen, Bell, Timer, BarChart2, Shuffle,
         ThumbsUp, Star } from 'lucide-react';
import { initialDates } from '@/data/dates';
import { citasDatabase, citasPorCategoria } from '@/data/citas';
import { api } from '@/lib/api';

const ALL_CITAS_FLAT = (() => {
  const merged = [...Object.values(citasDatabase).flat(), ...Object.values(citasPorCategoria).flat()];
  const seen = new Set();
  return merged.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
})();

// ── Paleta doodle ─────────────────────────────────────────────────────────────
const D = {
  cream:  '#FDF6EC', //white
  wine:   '#1C0E10',
  coral:  '#C44455',
  gold:   '#D4A520',
  blue:   '#5B8ECC',
  green:  '#5BAA6A',
  blush:  '#F0C4CC',
  white:  '#FFFFFF',
  border: '#EDE0D0',
  muted:  '#9A7A6A',
};

const STYLE = `
  .caveat { font-family: 'Caveat', cursive; }
  .lora   { font-family: 'Lora', Georgia, serif; }
  .ql-card {
    background: #fff;
    border-radius: 20px;
    border: 1.5px solid #EDE0D0;
    padding: 14px 16px;
    cursor: pointer;
    transition: transform 0.15s;
  }
  .ql-card:active { transform: scale(0.97); }
  .doodle-underline { position: relative; display: inline-block; }
  .doodle-underline::after {
    content: ''; position: absolute;
    bottom: -3px; left: -2px;
    width: calc(100% + 4px); height: 3px;
    background: #D4A520; border-radius: 2px; transform: rotate(-0.7deg);
  }
`;

const DAYS   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre'];

function todayString() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}
function daysDiff(iso) {
  if (!iso) return null;
  const n = Math.floor((Date.now() - new Date(iso)) / 86400000);
  return n > 0 ? n : null;
}
function getDates() {
  try { return JSON.parse(localStorage.getItem('coupleDates') || '[]'); } catch { return []; }
}

// ── BG Doodle SVG ─────────────────────────────────────────────────────────────
function BgDoodles() {
  return (
    <svg style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.28 }} viewBox="0 0 390 820" fill="none">
      <text x="340" y="78"  fontSize="14" fill="#D4A520" fontFamily="serif">✦</text>
      <text x="26"  y="118" fontSize="10" fill="#C44455" fontFamily="serif">✦</text>
      <text x="358" y="198" fontSize="9"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="16"  y="318" fontSize="11" fill="#D4A520" fontFamily="serif">✦</text>
      <text x="352" y="418" fontSize="8"  fill="#C44455" fontFamily="serif">✦</text>
      <text x="20"  y="498" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <ellipse cx="354" cy="113" rx="22" ry="20" stroke="#5B8ECC" strokeWidth="2" strokeDasharray="4 3" fill="none" transform="rotate(-10 354 113)"/>
      <circle cx="34" cy="198" r="10" fill="none" stroke="#D4A520" strokeWidth="1.5"/>
      <ellipse cx="34" cy="198" rx="16" ry="5" fill="none" stroke="#D4A520" strokeWidth="1.5" transform="rotate(-25 34 198)"/>
      <path d="M338 288 Q358 283 366 296" stroke="#C44455" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M363 293 L366 296 L360 298" stroke="#C44455" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 438 L24 426 L30 438 L24 436 Z" fill="none" stroke="#5B8ECC" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M20 438 L18 444 M28 438 L30 444" stroke="#5B8ECC" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Date card (swipeable) ─────────────────────────────────────────────────────
function DateCard({ date, onNext, onDetail }) {
  const handleDrag = (_, info) => { if (Math.abs(info.offset.x) > 55) onNext(); };
  return (
    <motion.div
      key={date.id}
      initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-32 }}
      transition={{ type:'spring', stiffness:320, damping:26 }}
      drag="x" dragConstraints={{ left:0, right:0 }} dragElastic={0.22} onDragEnd={handleDrag}
      style={{ background:D.wine, borderRadius:22, padding:'22px 22px 18px', cursor:'grab', userSelect:'none', position:'relative', overflow:'hidden' }}
    >
      {/* faint heart watermark */}
      <svg style={{ position:'absolute', right:10, top:4, opacity:0.07 }} width="80" height="70" viewBox="0 0 80 70">
        <text x="0" y="64" fontSize="70" fill="#F0C4CC">♡</text>
      </svg>

      <p className="caveat" style={{ color:D.gold, fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>
        ✦ Cita sugerida para hoy ✦
      </p>
      <h2 className="lora" style={{ color:D.white, fontSize:22, fontWeight:600, lineHeight:1.25, marginBottom:10 }}>
        {date.name}
      </h2>
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {[date.status === 'completed' ? '✅ Hecha' : '📌 Pendiente', `#${date.priority}`].map((t,i) => (
          <span key={i} className="caveat" style={{ background:'rgba(255,255,255,0.12)', color:D.blush, borderRadius:100, padding:'3px 12px', fontSize:12, fontWeight:600 }}>{t}</span>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onDetail} className="caveat" style={{ background:D.coral, color:D.white, borderRadius:12, padding:'9px 20px', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>
          Ver detalles
        </button>
        <p className="caveat" style={{ color:'rgba(255,255,255,0.28)', fontSize:11 }}>← desliza →</p>
      </div>
    </motion.div>
  );
}

// ── Surprise card (inline, same dark style) ──────────────────────────────────
function SurpriseCard({ cita, onAddToList, onDetail, onClose }) {
  const name = cita.title || cita.name;
  return (
    <motion.div
      initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-18 }}
      transition={{ type:'spring', stiffness:300, damping:26 }}
      style={{ background:D.wine, borderRadius:22, padding:'22px 22px 18px', position:'relative', overflow:'hidden' }}
    >
      <svg style={{ position:'absolute', right:10, top:4, opacity:0.07 }} width="80" height="70" viewBox="0 0 80 70">
        <text x="0" y="64" fontSize="70" fill="#F0C4CC">♡</text>
      </svg>
      <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,0.12)', border:'none', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:D.blush, fontSize:17, lineHeight:1 }}>×</button>

      <p className="caveat" style={{ color:D.gold, fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>
        ✨ Cita sorpresa ✨
      </p>
      <h2 className="lora" style={{ color:D.white, fontSize:22, fontWeight:600, lineHeight:1.25, marginBottom:10 }}>
        {name}
      </h2>
      {(cita.description || cita.desc) && (
        <p className="caveat" style={{ color:'rgba(240,196,204,0.82)', fontSize:13, lineHeight:1.6, marginBottom:14 }}>
          {cita.description || cita.desc}
        </p>
      )}
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={onDetail} className="caveat" style={{ background:D.coral, color:D.white, borderRadius:12, padding:'9px 18px', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>
          Ver detalles
        </button>
        {cita.inMyList ? (
          <span className="caveat" style={{ background:'rgba(91,170,106,0.22)', color:'#7DC98A', borderRadius:12, padding:'9px 14px', fontSize:13, fontWeight:700, border:'1.5px solid rgba(91,170,106,0.35)' }}>
            ✓ En mi lista
          </span>
        ) : (
          <button onClick={onAddToList} className="caveat" style={{ background:'rgba(255,255,255,0.13)', color:D.blush, borderRadius:12, padding:'9px 14px', fontWeight:700, fontSize:13, border:'1.5px solid rgba(240,196,204,0.28)', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ fontSize:14 }}>♥</span> Agregar a mi lista
          </button>
        )}
      </div>
    </motion.div>
  );
}

const QUICK_CARDS = [
  {
    id:'challenges', Icon:Zap,
    iconBg:'#C44455', cardBorder:'#F5C4CC', cardBg:'#FFF5F6',
    badge:'Activos', title:'Retos', sub:'Desafíos de pareja',
    deco:'bar', barPct:30, trackBg:'#F0D0D5', barBg:'#C44455',
  },
  {
    id:'letters', Icon:Mail,
    iconBg:'#D4A520', cardBorder:'#D4C090', cardBg:'#FDFAF0',
    badge:'Mensajes', title:'Cartas', sub:'Escribirse con amor',
    deco:'dots', dots:['#C44455','#D4A520','#C8B8A8','#5B8ECC'],
  },
  {
    id:'calendar', Icon:Calendar,
    iconBg:'#5B8ECC', cardBorder:'#C0D5E8', cardBg:'#F5FAFF',
    badge:'Próximos', title:'Calendario', sub:'Eventos y citas',
    deco:'bar', barPct:55, trackBg:'#D0E5F5', barBg:'#5B8ECC',
  },
  {
    id:'timeline', Icon:Activity,
    iconBg:'#5BAA6A', cardBorder:'#C0DEC8', cardBg:'#F5FBF6',
    badge:'Recuerdos', title:'Línea del tiempo', sub:'Tu historia juntos',
    deco:'dots', dots:['#5BAA6A','#D4A520','#C44455','#5B8ECC','#5BAA6A'],
  },
  {
    id:'registry', Icon:BookOpen,
    iconBg:'#C44455', cardBorder:'#F5C4CC', cardBg:'#FFF5F6',
    badge:'Historial', title:'Registro', sub:'Citas anotadas',
    deco:'bar', barPct:20, trackBg:'#F0D0D5', barBg:'#C44455',
  },
  {
    id:'important-dates', Icon:Bell,
    iconBg:'#D4A520', cardBorder:'#D4C090', cardBg:'#FDFAF0',
    badge:'Próximas', title:'Fechas especiales', sub:'Aniversarios y más',
    deco:'dots', dots:['#D4A520','#C44455','#D4A520','#C8B8A8'],
  },
  {
    id:'countdown', Icon:Timer,
    iconBg:'#5B8ECC', cardBorder:'#C0D5E8', cardBg:'#F5FAFF',
    badge:'En curso', title:'Countdown', sub:'Cuenta regresiva',
    deco:'bar', barPct:70, trackBg:'#D0E5F5', barBg:'#5B8ECC',
  },
  {
    id:'stats', Icon:BarChart2,
    iconBg:'#5BAA6A', cardBorder:'#C0DEC8', cardBg:'#F5FBF6',
    badge:'Análisis', title:'Estadísticas', sub:'Tu viaje en números',
    deco:'bar', barPct:45, trackBg:'#C8E8D0', barBg:'#5BAA6A',
  },
  {
    id:'roulette', Icon:Shuffle,
    iconBg:'#C44455', cardBorder:'#F5C4CC', cardBg:'#FFF5F6',
    badge:'¡Suerte!', title:'Ruleta', sub:'Elige una cita al azar',
    deco:'dots', dots:['#C44455','#D4A520','#5B8ECC','#5BAA6A','#C44455'],
  },
  {
    id:'citas-aleatorias', Icon:ThumbsUp,
    iconBg:'#C44455', cardBorder:'#F5C4CC', cardBg:'#FFF5F6',
    badge:'Para ti', title:'Citas para ti', sub:'Basadas en tu personalidad ♡',
    deco:'dots', dots:['#C44455','#F0C4CC','#C44455','#F0C4CC','#C44455'],
  },
];

export default function DashboardPage({ navigateTo, onLogout, onOpenLogin, isAuthenticated }) {
  const [user, setUser]                     = useState(null);
  const [days, setDays]                     = useState(null);
  const [dates, setDates]                   = useState([]);
  const [dateIdx, setDateIdx]               = useState(0);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [partnerGreeting, setPartnerGreeting] = useState(null);
  const [unreadLetters, setUnreadLetters]   = useState([]);
  const [citasHechas, setCitasHechas]       = useState(0);
  const [citasPendientes, setCitasPendientes] = useState(0);
  const [surpriseCita, setSurpriseCita]     = useState(null);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const menuRef                             = useRef(null);

  // Show partner's greeting if available, else own greeting, else default
  const greeting    = partnerGreeting?.message ?? user?.greetingMessage ?? user?.greeting_message ?? 'Buenos días, mi amor';
  const subGreeting = partnerGreeting?.subtext  ?? user?.greetingSubtext  ?? user?.greeting_subtext  ?? 'Hoy les toca una cita especial ✦';
  const couple      = (user?.name && user?.partner)
    ? `${user.name} & ${user.partner}`.toUpperCase()
    : 'LOVERS APP';

  useEffect(() => {
    const raw = localStorage.getItem('loversappUser');
    if (raw) {
      const u = JSON.parse(raw);
      setUser(u);
      setDays(daysDiff(u.relationshipStartDate || u.relationship_start_date));
    }
    const all = getDates();
    const pending = all.filter(d => d.status === 'pending');
    setDates(pending.length ? pending : all.length ? all : []);
    // Citas 100 — completed count from completedCitas key
    const completedIds = JSON.parse(localStorage.getItem('completedCitas') || '[]');
    const manualDates  = JSON.parse(localStorage.getItem('manualDates')    || '[]');
    const manualCompletedIds = manualDates.filter(d => d.status === 'completed').map(d => d.id);
    const allCompletedIds = [...new Set([...completedIds, ...manualCompletedIds])];
    setCitasHechas(allCompletedIds.length);
    const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
    const totalCitas = favs.length + manualDates.length;
    setCitasPendientes(Math.max(0, totalCitas - allCompletedIds.length));

    // Load partner's greeting from API (what your partner wrote for you)
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getMe().then(me => {
        if (me.coupled_user_id) {
          // partner_greeting is a separate endpoint we check
          api.getPartnerGreeting().then(pg => {
            if (pg?.greeting_message) {
              setPartnerGreeting({ message: pg.greeting_message, subtext: pg.greeting_subtext });
            }
          }).catch(() => {});
        }
        // Also refresh local user with latest server data
        const cached = JSON.parse(localStorage.getItem('loversappUser') || '{}');
        const merged = { ...cached, ...me, partner: me.partner_name || cached.partner, partnerCode: me.partner_code || cached.partnerCode };
        localStorage.setItem('loversappUser', JSON.stringify(merged));
        setUser(merged);
        setDays(daysDiff(me.relationship_start_date || cached.relationshipStartDate));
        // Load unread received letters
        api.getReceivedLetters().then(msgs => {
          const unread = msgs.filter(m => !m.read_at);
          if (unread.length) setUnreadLetters(unread);
        }).catch(() => {});
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const cur       = dates[dateIdx] ?? null;
  const DOTS      = Math.min(5, dates.length);
  const nextDate  = () => setDateIdx(p => (p + 1) % Math.max(dates.length, 1));
  const surprise  = () => {
    const completedIds = new Set(JSON.parse(localStorage.getItem('completedCitas') || '[]'));
    const favs   = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
    const manual = JSON.parse(localStorage.getItem('manualDates') || '[]');
    const allMineIds = new Set([...favs.map(f => f.id), ...manual.map(m => m.id)]);
    const pool = ALL_CITAS_FLAT.filter(c => !completedIds.has(c.id));
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseCita({ ...pick, inMyList: allMineIds.has(pick.id) });
    setShowSurpriseModal(true);
  };

  const addSurpriseToList = () => {
    if (!surpriseCita) return;
    const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
    if (!favs.find(f => f.id === surpriseCita.id)) {
      localStorage.setItem('favoritesCitas', JSON.stringify([surpriseCita, ...favs]));
    }
    const token = localStorage.getItem('loversappToken');
    if (token) api.swipeCita(surpriseCita.id, 'like').catch(() => {});
    setSurpriseCita(prev => prev ? { ...prev, inMyList: true } : null);
    setCitasPendientes(p => p + 1);
  };

  return (
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden', paddingBottom:80, fontFamily:"'Lora', Georgia, serif" }}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ padding:'48px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${D.border}`, background:D.cream, position:'sticky', top:0, zIndex:40 }}>
        {/* Avatar / profile */}
        <button onClick={() => isAuthenticated ? navigateTo('profile') : onOpenLogin?.('login')}
          style={{ width:38, height:38, borderRadius:'50%', background:D.wine, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
          <User size={15} color={D.white} />
        </button>

        {/* Couple name */}
        <div style={{ textAlign:'center' }}>
          <div className="lora" style={{ fontSize:20, color:D.wine, fontWeight:600, letterSpacing:1 }}>LoversApp</div>
          <div className="caveat" style={{ fontSize:11, color:D.coral, letterSpacing:2, marginTop:1 }}>✦ {couple} ✦</div>
        </div>

        {/* 3-dot menu */}
        <div style={{ position:'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)}
            style={{ width:38, height:38, borderRadius:'50%', background: menuOpen ? '#F5EEE8' : 'transparent', border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <MoreVertical size={16} color={D.wine} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }} transition={{ duration:0.14 }}
                style={{ position:'absolute', right:0, top:'108%', background:D.white, borderRadius:16, border:`1.5px solid ${D.border}`, boxShadow:'0 8px 28px rgba(0,0,0,0.11)', minWidth:178, overflow:'hidden', zIndex:50 }}>
                {isAuthenticated ? (<>
                  <button onClick={() => { setMenuOpen(false); navigateTo('profile'); }}
                    className="caveat" style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:D.wine }}>
                    <Settings size={14} /> Ajustes
                  </button>
                  <div style={{ height:1, background:D.border }} />
                  <button onClick={() => { setMenuOpen(false); onLogout?.(); }}
                    className="caveat" style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:'#B02020' }}>
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </>) : (<>
                  <button onClick={() => { setMenuOpen(false); onOpenLogin?.('login'); }}
                    className="caveat" style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:D.wine }}>
                    Iniciar sesión
                  </button>
                  <button onClick={() => { setMenuOpen(false); onOpenLogin?.('register'); }}
                    className="caveat" style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:D.wine }}>
                    Registrarse
                  </button>
                </>)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      <div style={{ padding:'24px 20px 12px', position:'relative', zIndex:1 }}>

        {/* Greeting */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.38 }} style={{ marginBottom:26 }}>
          <p className="caveat" style={{ color:D.gold, fontSize:12, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', marginBottom:4 }}>
            {todayString()}
          </p>
          <h1 className="lora" style={{ fontSize:26, fontWeight:600, color:D.wine, lineHeight:1.25, marginBottom:6 }}>
            {greeting}
          </h1>
          {days !== null && (
            <p className="caveat" style={{ color:D.muted, fontSize:15, fontWeight:600 }}>
              Llevan{' '}
              <span style={{ fontWeight:700, color:D.coral }}>
                <span style={{ position:'relative', display:'inline-block' }}>
                  {days} días
                  <span style={{ position:'absolute', bottom:-2, left:-2, width:'calc(100% + 4px)', height:3, background:D.coral, borderRadius:2, transform:'rotate(-0.7deg)' }} />
                </span>
              </span>
              {' '}juntos. {subGreeting}
            </p>
          )}

          {/* CTA buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:18 }}>
            <div style={{ display:'flex', gap:10 }}>
              <motion.button whileTap={{ scale:0.96 }} onClick={() => navigateTo('dates')}
                className="caveat" style={{ flex:1, padding:'13px 0', background:D.wine, color:D.white, borderRadius:16, fontWeight:700, fontSize:16, border:'none', cursor:'pointer' }}>
                Ver Citas
              </motion.button>
              <motion.button whileTap={{ scale:0.96 }} onClick={surprise}
                className="caveat" style={{ flex:1, padding:'13px 0', background:'transparent', border:`2px solid ${D.wine}`, color:D.wine, borderRadius:16, fontWeight:700, fontSize:16, cursor:'pointer' }}>
                Sorpresa ✦
              </motion.button>
            </div>
            {!isAuthenticated && (
              <motion.button whileTap={{ scale:0.96 }} onClick={() => onOpenLogin?.('login')}
                className="caveat" style={{ width:'100%', padding:'13px 0', background:D.coral, color:D.white, borderRadius:16, fontWeight:700, fontSize:16, border:'none', cursor:'pointer' }}>
                Iniciar Sesión / Registrarse ♡
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Stats strip */}
        {days !== null && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            style={{ background:D.wine, borderRadius:20, padding:'16px 20px', display:'flex', justifyContent:'space-around', alignItems:'center', marginBottom:22, overflow:'hidden', position:'relative' }}>
            <svg style={{ position:'absolute', right:8, top:4, opacity:0.07 }} width="70" height="60" viewBox="0 0 70 60">
              <text x="0" y="50" fontSize="60" fill="#F0C4CC">♡</text>
            </svg>
            {[
              { val: days,              sub: 'días juntos',  color: D.blush },
              { val: citasHechas,       sub: 'citas hechas', color: D.green },
              { val: `✦ ${citasPendientes}`, sub: 'por vivir', color: D.gold },
            ].reduce((acc, item, i) => {
              if (i > 0) acc.push(<div key={`div-${i}`} style={{ width:0.5, height:38, background:'rgba(240,196,204,0.18)' }} />);
              acc.push(
                <div key={i} style={{ textAlign:'center', flex:1 }}>
                  <div className="caveat" style={{ fontSize:26, fontWeight:700, color:item.color, lineHeight:1 }}>{item.val}</div>
                  <div className="caveat" style={{ fontSize:11, color:'rgba(240,196,204,0.55)', marginTop:3, letterSpacing:0.5 }}>{item.sub}</div>
                </div>
              );
              return acc;
            }, [])}
          </motion.div>
        )}

        {/* Unread letters card */}
        {unreadLetters.length > 0 && (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.08}}
            onClick={() => navigateTo('letters')}
            style={{background:'#FEE8EC',border:`1.5px solid #F0C4CC`,borderLeft:`4px solid ${D.coral}`,
              borderRadius:20,padding:'16px 18px',marginBottom:22,cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
            <motion.div animate={{rotate:[0,-10,10,-10,10,0]}} transition={{delay:0.6,duration:0.7}}>
              <span style={{fontSize:32}}>💌</span>
            </motion.div>
            <div style={{flex:1}}>
              <p className="lora" style={{fontSize:15,fontWeight:700,color:D.wine,margin:'0 0 3px'}}>
                {unreadLetters.length === 1 ? '¡Tienes una carta!' : `¡Tienes ${unreadLetters.length} cartas!`}
              </p>
              <p className="caveat" style={{fontSize:13,color:'#9A7A6A',margin:0}}>
                De: {unreadLetters[0].sender_name || 'Tu pareja'} · toca para abrirla ✦
              </p>
            </div>
            <ChevronRight size={18} color={D.coral}/>
          </motion.div>
        )}

        {/* Swipeable date card OR surprise card */}
        <motion.section initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }} style={{ marginBottom:22 }}>
          <AnimatePresence mode="wait">
            {showSurpriseModal && surpriseCita ? (
              <SurpriseCard
                key="surprise"
                cita={surpriseCita}
                onAddToList={addSurpriseToList}
                onDetail={() => navigateTo('detail', surpriseCita.id, 'dashboard')}
                onClose={() => setShowSurpriseModal(false)}
              />
            ) : cur ? (
              <DateCard key={cur.id} date={cur} onNext={nextDate} onDetail={() => navigateTo('detail', cur.id)} />
            ) : null}
          </AnimatePresence>
          {!showSurpriseModal && cur && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12, padding:'0 4px' }}>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {Array.from({ length:DOTS }, (_,i) => (
                  <button key={i} onClick={() => setDateIdx(i)}
                    style={{ width: i===dateIdx%DOTS ? 20 : 8, height:8, borderRadius:4, background: i===dateIdx%DOTS ? D.coral : D.blush, transition:'width 0.28s ease', border:'none', padding:0, cursor:'pointer' }} />
                ))}
              </div>
              <button onClick={nextDate} className="caveat"
                style={{ display:'flex', alignItems:'center', gap:3, color:D.coral, fontSize:14, fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>
                o ver otra <ChevronRight size={15} />
              </button>
            </div>
          )}
        </motion.section>

        {/* Quick links */}
        <motion.section initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span className="caveat doodle-underline" style={{ fontSize:15, fontWeight:700, color:D.wine }}>Accesos rápidos</span>
            <div style={{ flex:1, height:1.5, background:`repeating-linear-gradient(90deg,${D.border} 0,${D.border} 6px,transparent 6px,transparent 12px)` }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {QUICK_CARDS.map(({ id, Icon, iconBg, cardBorder, cardBg, badge, title, sub, deco, barPct, trackBg, barBg, dots }) => (
              <div key={id} className="ql-card"
                style={{ borderColor:cardBorder, background:cardBg }}
                onClick={() => navigateTo(id)}>
                {/* Icon + badge row */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ width:36, height:36, background:iconBg, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={18} color="#fff" strokeWidth={2} />
                  </div>
                  <span className="caveat" style={{ fontSize:11, background:`${iconBg}22`, color:iconBg, borderRadius:20, padding:'3px 10px', fontWeight:700 }}>
                    {badge}
                  </span>
                </div>
                {/* Title + subtitle */}
                <div className="lora" style={{ fontSize:13, fontWeight:600, color:D.wine, marginBottom:2, lineHeight:1.25 }}>{title}</div>
                <div className="caveat" style={{ fontSize:12, color:D.muted }}>{sub}</div>
                {/* Bottom decoration */}
                <div style={{ marginTop:10 }}>
                  {deco === 'bar' ? (
                    <div style={{ height:5, background:trackBg, borderRadius:10, overflow:'hidden' }}>
                      <div style={{ width:`${barPct}%`, height:'100%', background:barBg, borderRadius:10 }}/>
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:4 }}>
                      {dots.map((c,i) => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:c }}/>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>


    </div>
  );
}
