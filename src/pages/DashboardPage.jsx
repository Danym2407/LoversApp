import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MoreVertical, ChevronRight, LogOut, Settings, HelpCircle, Heart,
         Zap, Mail, Calendar, Activity, BookOpen, Bell, Timer, BarChart2, Shuffle,
         ThumbsUp, Star } from 'lucide-react';
import { initialDates } from '@/data/dates';
import { getAllCitasFlat } from '@/data/citas';
const ALL_CITAS_FLAT = getAllCitasFlat;
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';


// ── Paleta doodle (estética rosa ilustrada) ──────────────────────────────────────────────────────
const D = {
  bg:     '#FFF5F7',   // fondo página
  card:   '#FFFFFF',   // tarjetas blancas
  pink:   '#FF6B8A',   // coral/rosa primario
  pinkL:  '#FFD6E0',   // rosa claro
  pinkXL: '#FFF0F4',   // rosa muy suave
  dark:   '#2D1B2E',   // texto oscuro (casi negro morado)
  muted:  '#9B8B95',   // texto secundario
  gold:   '#F5A623',   // dorado/naranja
  blue:   '#6B9FD4',   // azul
  green:  '#5BAA6A',   // verde
  purple: '#9B7FD4',   // morado
  border: '#F5D0DC',   // bordes rosa
  white:  '#FFFFFF',
};

const STYLE = `
  .caveat { font-family: 'Patrick Hand', cursive; text-transform: none !important; }
  .lora   { font-family: 'Lora', Georgia, serif; }
  .dash-page { background: #FFF5F7; }
  .ql-card {
    background: #fff;
    border-radius: 20px;
    border: 2px solid #F5D0DC;
    padding: 14px 16px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 2px 8px rgba(255,107,138,0.07);
  }
  .ql-card:active { transform: scale(0.97); }
  .ql-card:hover { box-shadow: 0 4px 16px rgba(255,107,138,0.13); }
  .section-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 20px;
    font-weight: 700;
    color: #2D1B2E;
    position: relative;
    display: inline-block;
  }
  .section-title::after {
    content: '';
    position: absolute;
    bottom: -3px; left: 0;
    width: 100%; height: 3px;
    background: linear-gradient(90deg, #FF6B8A, #FFB3C6);
    border-radius: 2px;
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

// ── Date card (swipeable) ─────────────────────────────────────────────────────
function DateCard({ date, onNext, onDetail }) {
  const handleDrag = (_, info) => { if (Math.abs(info.offset.x) > 55) onNext(); };
  return (
    <motion.div
      key={date.id}
      initial={{ opacity:0, x:32, rotate:-1.5 }} animate={{ opacity:1, x:0, rotate:0 }} exit={{ opacity:0, x:-32 }}
      transition={{ type:'spring', stiffness:320, damping:26 }}
      drag="x" dragConstraints={{ left:0, right:0 }} dragElastic={0.22} onDragEnd={handleDrag}
      className="doodle-card"
      style={{
        background:'#FFFFFF', borderRadius:24, border:'2px solid #F5D0DC',
        boxShadow:'0 4px 20px rgba(255,107,138,0.12)',
        cursor:'grab', userSelect:'none', position:'relative', overflow:'hidden',
        display:'flex', alignItems:'stretch', minHeight:220,
      }}
    >
      <div style={{ flex:1, padding:'22px 18px 22px 22px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div>
          <p className="date-card-label" style={{ fontFamily:"'Patrick Hand',cursive", color:'#F5A623', fontSize:13, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>
            ✦ Cita sugerida para hoy ✦
          </p>
          <h2 className="date-card-title">
            {date.name}
          </h2>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            <span style={{ fontFamily:"'Inter',sans-serif", background:'#FFF0F4', color:'#2D1B2E', borderRadius:100, padding:'5px 14px', fontSize:14, fontWeight:700, border:'1.5px solid #F5D0DC', display:'inline-flex', alignItems:'center', gap:5 }}>
              {date.status === 'completed'
                ? '★ Hecha'
                : <><img src="/images/tachuela-pinear.png" alt="" style={{ width:16, height:16, objectFit:'contain' }} /> Pendiente</>}
            </span>
            <span style={{ fontFamily:"'Inter',sans-serif", background:'#FFF8E6', color:'#2D1B2E', borderRadius:100, padding:'5px 14px', fontSize:14, fontWeight:700, border:'1.5px solid #F5E0A0' }}>
              #{date.priority}
            </span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={onDetail} className="doodle-btn-primary" style={{ fontFamily:"'Inter',sans-serif", background:'#FF6B8A', color:'#FFFFFF', borderRadius:14, padding:'12px 28px', fontWeight:700, fontSize:15, border:'2px solid #e8436a', cursor:'pointer', boxShadow:'3px 3px 0 rgba(196,68,100,0.25)' }}>
            Ver detalles
          </button>
          <span style={{ fontFamily:"'Inter',sans-serif", color:'#CFBFC8', fontSize:12 }}>← desliza →</span>
        </div>
      </div>
      <div className="date-card-img">
        <img src={date.imageUrl || '/images/dibujo-astronauta.png'} alt="" onError={e => { e.target.style.display='none'; }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', objectPosition:'center center' }} />
      </div>
    </motion.div>
  );
}

// ── Surprise card ─────────────────────────────────────────────────────────────
function SurpriseCard({ cita, onAddToList, onDetail, onClose }) {
  const name = cita.title || cita.name;
  return (
    <motion.div
      initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-18 }}
      transition={{ type:'spring', stiffness:300, damping:26 }}
      style={{ background:'#FFFFFF', borderRadius:24, border:'2px solid #F5D0DC', boxShadow:'0 4px 20px rgba(255,107,138,0.12)', position:'relative', overflow:'hidden', display:'flex', alignItems:'stretch', minHeight:170 }}
    >
      <div style={{ flex:1, padding:'22px 18px 22px 22px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
        <div style={{ position:'absolute', right:16, top:8, fontSize:70, opacity:0.06, lineHeight:1, color:'#FF6B8A' }}>♡</div>
        <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'#FFF0F4', border:'none', borderRadius:'50%', width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#FF6B8A', fontSize:18, lineHeight:1 }}>×</button>
        <div>
          <p style={{ fontFamily:"'Patrick Hand',cursive", color:'#F5A623', fontSize:13, fontWeight:600, letterSpacing:'0.08em', marginBottom:10 }}>
            ✨ Cita sorpresa ✨
          </p>
          <h2 style={{ fontFamily:"'Lora',Georgia,serif", color:'#2D1B2E', fontSize:22, fontWeight:700, lineHeight:1.25, marginBottom:8 }}>
            {name}
          </h2>
          {(cita.description || cita.desc) && (
            <p style={{ fontFamily:"'Inter',sans-serif", color:'#9B8B95', fontSize:13, lineHeight:1.55, marginBottom:12 }}>
              {cita.description || cita.desc}
            </p>
          )}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <button onClick={onDetail} style={{ fontFamily:"'Inter',sans-serif", background:'#FF6B8A', color:'#FFFFFF', borderRadius:14, padding:'10px 20px', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', boxShadow:'0 2px 8px rgba(255,107,138,0.30)' }}>
            Ver detalles
          </button>
          {cita.inMyList ? (
            <span style={{ fontFamily:"'Inter',sans-serif", background:'#F0FFF5', color:'#4CAF79', borderRadius:14, padding:'10px 14px', fontSize:13, fontWeight:700, border:'1.5px solid #C0DEC8' }}>
              ✓ En mi lista
            </span>
          ) : (
            <button onClick={onAddToList} style={{ fontFamily:"'Inter',sans-serif", background:'#FFF0F4', color:'#FF6B8A', borderRadius:14, padding:'10px 14px', fontWeight:700, fontSize:13, border:'1.5px solid #FFD0DC', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              ♥ Agregar
            </button>
          )}
        </div>
      </div>
      <div style={{ width:110, flexShrink:0, borderRadius:'0 22px 22px 0', background:'linear-gradient(135deg, #FFE8ED 0%, #FFD0DC 100%)', position:'relative', overflow:'hidden' }}>
        <img src="/images/sorpresa.png" alt="" onError={e => { e.target.style.display='none'; }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', objectPosition:'center center' }} />
      </div>
    </motion.div>
  );
}

const QUICK_CARDS = [
  {
    id:'challenges', img:'/images/Nuevo/reto.png',
    cardBg:'#FFF5F7', cardBorder:'#FFD0DC', badgeColor:'#FF6B8A',
    badge:'Activo', title:'Retos', sub:'Desafíos de pareja',
    deco:'bar', barPct:30, trackBg:'#FFD6E0', barBg:'#FF6B8A',
  },
  {
    id:'letters', img:'/images/sobre-rayado.png',
    cardBg:'#FFF8F0', cardBorder:'#F5D8A8', badgeColor:'#F5A623',
    badge:'Mensajes', title:'Cartas', sub:'Escríbeles con amor',
    deco:'dots', dots:['#FF6B8A','#F5A623','#C8B8A8','#6B9FD4'],
  },
  {
    id:'calendar', img:'/images/calendario-morado.png',
    cardBg:'#F5F0FF', cardBorder:'#C8B0F0', badgeColor:'#9B7FD4',
    badge:'Próximos', title:'Calendario', sub:'Eventos y citas',
    deco:'bar', barPct:55, trackBg:'#DDD0F8', barBg:'#9B7FD4',
  },
  {
    id:'timeline', img:'/images/recuerdos.png',
    cardBg:'#F0FBF5', cardBorder:'#A8DEB8', badgeColor:'#5BAA6A',
    badge:'Recuerdos', title:'Línea del tiempo', sub:'Tu historia juntos',
    deco:'dots', dots:['#5BAA6A','#F5A623','#FF6B8A','#6B9FD4','#5BAA6A'],
  },
  {
    id:'moments', img:'/images/historial.png',
    cardBg:'#FFF5F7', cardBorder:'#FFD0DC', badgeColor:'#FF6B8A',
    badge:'Historial', title:'Historial', sub:'Citas que ya vivimos',
    deco:'bar', barPct:20, trackBg:'#FFD6E0', barBg:'#FF6B8A',
  },
  {
    id:'countdown', img:'/images/countdown.png',
    cardBg:'#FFF8F0', cardBorder:'#F5D8A8', badgeColor:'#F5A623',
    badge:'En curso', title:'Countdown', sub:'Cuenta regresiva',
    deco:'bar', barPct:70, trackBg:'#F5E0B0', barBg:'#F5A623',
  },
  {
    id:'roulette', img:'/images/ruleta.png',
    cardBg:'#FFF5F7', cardBorder:'#FFD0DC', badgeColor:'#FF6B8A',
    badge:'¡Suerte!', title:'Ruleta', sub:'Elige una cita al azar',
    deco:'dots', dots:['#FF6B8A','#F5A623','#6B9FD4','#5BAA6A','#FF6B8A'],
  },
  {
    id:'citas-aleatorias', img:'/images/mensajes.png',
    cardBg:'#FFF5F7', cardBorder:'#FFD0DC', badgeColor:'#FF6B8A',
    badge:'Descubrir', title:'Citas Aleatorias', sub:'Me gusta / No me gusta',
    deco:'dots', dots:['#FF6B8A','#FFB3C6','#FF6B8A','#FFB3C6','#FF6B8A'],
  },
  {
    id:'important-dates', img:'/images/fechas-especiales.png',
    cardBg:'#FFF8F0', cardBorder:'#F5D8A8', badgeColor:'#F5A623',
    badge:'Próximas', title:'Fechas especiales', sub:'Aniversarios y más',
    deco:'dots', dots:['#F5A623','#FF6B8A','#F5A623','#C8B8A8'],
  },
  {
    id:'stats', img:'/images/trofeo.png',
    cardBg:'#F0FBF5', cardBorder:'#A8DEB8', badgeColor:'#5BAA6A',
    badge:'Para ti', title:'Mis Citas', sub:'Personalizadas para ti',
    deco:'dots', dots:['#5BAA6A','#F5A623','#FF6B8A','#6B9FD4'],
  },
];

export default function DashboardPage({ navigateTo, onLogout, onOpenLogin, isAuthenticated, user: propUser, onUserUpdate }) {
  const [user, setUser]                     = useState(propUser ?? null);
  const [days, setDays]                     = useState(null);
  const [dates, setDates]                   = useState([]);
  const [dateIdx, setDateIdx]               = useState(0);
  const [menuOpen, setMenuOpen]             = useState(false);
  const menuRef                             = useRef(null);

  const [partnerGreeting, setPartnerGreeting] = useState(null);
  const [unreadLetters, setUnreadLetters]   = useState([]);
  const [citasHechas, setCitasHechas]       = useState(0);
  const [citasPendientes, setCitasPendientes] = useState(0);
  const [surpriseCita, setSurpriseCita]     = useState(null);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);
  const [myCompletedIds, setMyCompletedIds] = useState(new Set());
  const [myLikedIds, setMyLikedIds]         = useState(new Set());

  // Sync with centralized user from App.jsx when it loads or changes
  useEffect(() => {
    if (!propUser) return;
    setUser(propUser);
    setDays(daysDiff(propUser.relationship_start_date || propUser.relationshipStartDate));
    // Fetch partner greeting once we know the coupled_user_id
    if (propUser.coupled_user_id) {
      console.log('[Dashboard] Pareja vinculada. Cargando greeting de pareja...');
      api.getPartnerGreeting()
        .then(pg => {
          console.log('[Dashboard] Greeting pareja:', pg);
          if (pg?.greeting_message)
            setPartnerGreeting({ message: pg.greeting_message, subtext: pg.greeting_subtext });
        })
        .catch(err => console.warn('[Dashboard] getPartnerGreeting falló:', err.message));
    }
  }, [propUser]);

  // Show partner's greeting if available, else own greeting, else default
  const greeting    = partnerGreeting?.message ?? user?.greetingMessage ?? user?.greeting_message ?? 'Buenos días, mi amor';
  const subGreeting = partnerGreeting?.subtext  ?? user?.greetingSubtext  ?? user?.greeting_subtext  ?? 'Hoy les toca una cita especial ✦';
  const toFirst = str => str ? str.trim().split(/\s+/)[0].charAt(0).toUpperCase() + str.trim().split(/\s+/)[0].slice(1).toLowerCase() : '';
  const couple  = (user?.name && (user?.partner_name ?? user?.partner))
    ? `${toFirst(user.name)} & ${toFirst(user?.partner_name ?? user?.partner)}`
    : 'LoversApp';

  useEffect(() => {
    // Prefer user from App.jsx prop (already loaded via api.getMe())
    // Only read localStorage if prop is not yet available
    if (!propUser) {
      const raw = localStorage.getItem('loversappUser');
      if (raw) {
        const u = JSON.parse(raw);
        setUser(u);
        setDays(daysDiff(u.relationshipStartDate || u.relationship_start_date));
      }
    }
    // Determine auth state first — API is source of truth when authenticated.
    // localStorage counts must NEVER override API data to prevent the reset-to-0 bug.
    const token = localStorage.getItem('loversappToken');
    if (!token) {
      // Unauthenticated fallback only — localStorage is the only available source
      const all = getDates();
      const pending = all.filter(d => d.status === 'pending');
      setDates(pending.length ? pending : all.length ? all : []);
      const completedIds = JSON.parse(localStorage.getItem('completedCitas') || '[]');
      const manualDates  = JSON.parse(localStorage.getItem('manualDates')    || '[]');
      const manualCompletedIds = manualDates.filter(d => d.status === 'completed').map(d => d.id);
      const allCompletedIds = [...new Set([...completedIds, ...manualCompletedIds])];
      setCitasHechas(allCompletedIds.length);
      const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
      const totalCitas = favs.length + manualDates.length;
      setCitasPendientes(Math.max(0, totalCitas - allCompletedIds.length));
    }

    // Load partner's greeting from API (what your partner wrote for you)
    if (token) {
      console.log('[Dashboard] Usuario autenticado. Cargando datos...');
      // Load couple-dates from API for fresh swipeable card data
      api.getCoupleDates()
        .then(rows => {
          const mapped = rows.map(r => {
            const initial = initialDates.find(d => d.id === r.date_item_id) || {};
            return {
              id: r.date_item_id,
              name: initial.name || `Cita ${r.date_item_id}`,
              status: r.status || 'pending',
              priority: r.date_item_id,
              imageUrl: initial.imageUrl || '',
              categories: initial.categories || [],
            };
          });
          const pending = mapped.filter(d => d.status === 'pending');
          setDates(pending.length ? pending : mapped.length ? mapped : getDates());
        })
        .catch(() => {
          // API failed — fall back to localStorage for the swipeable date card
          const all = getDates();
          const pend = all.filter(d => d.status === 'pending');
          setDates(pend.length ? pend : all.length ? all : []);
        });

      // Use consistent API data for both counters
      Promise.all([api.getCompletedCitas(), api.getCitaSwipes()])
        .then(([completedRows, swipes]) => {
          console.log('[Dashboard] Citas completadas:', completedRows.length, '| Swipes:', swipes.length);
          const completedSet = new Set(completedRows.map(r => r.cita_id));
          setMyCompletedIds(completedSet);
          setCitasHechas(completedRows.length);
          const liked = swipes.filter(s => s.action === 'like');
          setMyLikedIds(new Set(liked.map(s => s.cita_id)));
          setCitasPendientes(Math.max(0, liked.length - completedSet.size));
        })
        .catch(err => console.warn('[Dashboard] Error cargando citas:', err.message));

      // api.getMe() is handled by App.jsx (propUser). Here we only need what
      // App doesn't provide: partner greeting (if not yet loaded) + unread letters.
      if (!propUser) {
        // Fallback: App.jsx hasn't loaded user yet — load profile ourselves
        api.getMe()
          .then(me => {
            console.log('[Dashboard] getMe (fallback) OK:', me.name, '| coupled:', me.coupled_user_id);
            if (me.coupled_user_id) {
              api.getPartnerGreeting()
                .then(pg => {
                  console.log('[Dashboard] Greeting pareja:', pg);
                  if (pg?.greeting_message)
                    setPartnerGreeting({ message: pg.greeting_message, subtext: pg.greeting_subtext });
                })
                .catch(err => console.warn('[Dashboard] getPartnerGreeting falló:', err.message));
            }
            const cached = JSON.parse(localStorage.getItem('loversappUser') || '{}');
            const merged = { ...cached, ...me, partner: me.partner_name || cached.partner, partnerCode: me.partner_code || cached.partnerCode };
            localStorage.setItem('loversappUser', JSON.stringify(merged));
            setUser(merged);
            onUserUpdate?.(merged);
            setDays(daysDiff(me.relationship_start_date || cached.relationshipStartDate));
            api.getReceivedLetters()
              .then(msgs => {
                console.log('[Dashboard] Cartas recibidas:', msgs.length, '| no leídas:', msgs.filter(m => !m.read_at).length);
                const unread = msgs.filter(m => !m.read_at);
                if (unread.length) setUnreadLetters(unread);
              })
              .catch(err => console.warn('[Dashboard] getReceivedLetters falló:', err.message));
          })
          .catch(err => console.warn('[Dashboard] getMe falló:', err.message));
      } else {
        // User already provided by App.jsx — only load unread letters
        api.getReceivedLetters()
          .then(msgs => {
            console.log('[Dashboard] Cartas recibidas:', msgs.length, '| no leídas:', msgs.filter(m => !m.read_at).length);
            const unread = msgs.filter(m => !m.read_at);
            if (unread.length) setUnreadLetters(unread);
          })
          .catch(err => console.warn('[Dashboard] getReceivedLetters falló:', err.message));
      }
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
    // Prefer API-loaded IDs; fall back to localStorage for unauthenticated users
    const completedIds = myCompletedIds.size > 0
      ? myCompletedIds
      : new Set(JSON.parse(localStorage.getItem('completedCitas') || '[]'));
    const allMineIds = myLikedIds.size > 0
      ? myLikedIds
      : new Set(JSON.parse(localStorage.getItem('favoritesCitas') || '[]').map(f => f.id));
    const pool = ALL_CITAS_FLAT.filter(c => !completedIds.has(c.id));
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSurpriseCita({ ...pick, inMyList: allMineIds.has(pick.id) });
    setShowSurpriseModal(true);
  };

  const addSurpriseToList = () => {
    if (!surpriseCita) return;
    // API is the source of truth; localStorage only as unauthenticated fallback
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.swipeCita(surpriseCita.id, 'like').catch(() => {});
    } else {
      const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
      if (!favs.find(f => f.id === surpriseCita.id)) {
        localStorage.setItem('favoritesCitas', JSON.stringify([surpriseCita, ...favs]));
      }
    }
    setMyLikedIds(prev => new Set([...prev, surpriseCita.id]));
    setSurpriseCita(prev => prev ? { ...prev, inMyList: true } : null);
    setCitasPendientes(p => p + 1);
  };

  return (
    <div style={{ background:'#FFF5F7', minHeight:'100vh', width:'100%', maxWidth:480, margin:'0 auto', position:'relative', paddingBottom:88, fontFamily:"'Inter',-apple-system,sans-serif", boxSizing:'border-box', overflowX:'hidden' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="lg:hidden mobile-only-header" style={{ padding:'52px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#FFFFFF', position:'sticky', top:0, zIndex:40, borderBottom:'1px solid #EDE0D0', boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => isAuthenticated ? navigateTo('profile') : onOpenLogin?.('login')}
          style={{ width:44, height:44, borderRadius:'50%', background:'transparent', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0 }}>
          <img src="/images/perfil.png" alt="Perfil" style={{ width:40, height:40, objectFit:'contain' }} />
        </button>

        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"'Lora',Georgia,serif", fontSize:22, fontWeight:700, color:'#2D1B2E', letterSpacing:0.5 }}>LoversApp</div>
          <div style={{ fontFamily:"'Patrick Hand',cursive", fontSize:20, color:'#FF6B8A', letterSpacing:1, marginTop:2, textTransform:'none' }}>✦ {couple} ✦</div>
        </div>

        <div style={{ position:'relative' }} ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)}
            style={{ width:44, height:44, borderRadius:'50%', background:menuOpen ? '#F5EEE8' : 'transparent', border:'1.5px solid #EDE0D0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0 }}>
            <img src="/images/tres-puntitos.png" alt="Menú" style={{ width:22, height:22, objectFit:'contain' }} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }} transition={{ duration:0.14 }}
                style={{ position:'absolute', right:0, top:'110%', background:'#FFFFFF', borderRadius:16, border:'1.5px solid #EDE0D0', boxShadow:'0 8px 28px rgba(0,0,0,0.11)', minWidth:190, overflow:'hidden', zIndex:50 }}>
                {isAuthenticated ? (<>
                  <button onClick={() => { setMenuOpen(false); navigateTo(ROUTES.settings); }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:'#2D1B2E', fontFamily:"'Inter',sans-serif" }}>
                    <Settings size={16} /> Ajustes
                  </button>
                  <div style={{ height:1, background:'#F5D0DC' }} />
                  <button onClick={() => { setMenuOpen(false); navigateTo(ROUTES.help); }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:'#2D1B2E', fontFamily:"'Inter',sans-serif" }}>
                    <HelpCircle size={16} /> Ayuda
                  </button>
                  <div style={{ height:1, background:'#F5D0DC' }} />
                  <button onClick={() => { setMenuOpen(false); onLogout?.(); }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:'#C0202A', fontFamily:"'Inter',sans-serif" }}>
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </>) : (<>
                  <button onClick={() => { setMenuOpen(false); onOpenLogin?.('login'); }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:'#2D1B2E', fontFamily:"'Inter',sans-serif" }}>
                    Iniciar sesión
                  </button>
                  <button onClick={() => { setMenuOpen(false); onOpenLogin?.('register'); }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'14px 18px', background:'none', border:'none', cursor:'pointer', fontSize:15, fontWeight:600, color:'#2D1B2E', fontFamily:"'Inter',sans-serif" }}>
                    Registrarse
                  </button>
                </>)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────── */}
      <div style={{ padding:'28px 20px 0' }}>

        {/* Greeting */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.38 }} style={{ marginBottom:28, display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
          {/* Left: text */}
          <div style={{ flex:'1 1 260px', minWidth:0 }}>
            <p style={{ fontFamily:"'Patrick Hand',cursive", fontSize:13, fontWeight:600, color:'#F5A623', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>
              📅 {todayString()}
            </p>
            <h1 className="hand-title" style={{ fontFamily:"'Lora',Georgia,serif", fontSize:30, fontWeight:700, fontStyle:'italic', transform:'rotate(-2deg)', transformOrigin:'left center', display:'inline-flex', alignItems:'center', gap:8, color:'#2D1B2E', lineHeight:1.2, marginBottom:6 }}>
              {greeting}
              <img src="/images/corazon-mensaje.png" alt="" style={{ height:'1em', width:'auto', display:'inline-block', verticalAlign:'middle', pointerEvents:'none' }} />
            </h1>
            <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'80%', maxWidth:320, height:'auto', marginBottom:10, pointerEvents:'none' }} />
            <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:16, fontStyle:'italic', color:'#9B8B95', lineHeight:1.5, margin:'0 0 8px' }}>
              {subGreeting}
            </p>
          </div>

          {/* Right: CTA Buttons */}
          <div style={{ flex:'1 1 auto', display:'flex', flexDirection:'column', gap:12, width:'100%' }}>
            <div style={{ display:'flex', gap:12 }}>
              <motion.button whileTap={{ scale:0.95, rotate:-1 }} onClick={() => navigateTo('dates')}
                className="doodle-btn-primary"
                style={{ flex:1, minWidth:0, padding:'13px 14px', background:'#FF6B8A', color:'#FFFFFF', borderRadius:16, fontWeight:700, fontSize:15, border:'2px solid #FF6B8A', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:"'Inter',sans-serif", boxShadow:'3px 3px 0 rgba(196,68,100,0.30)' }}>
                <img src="/images/citas.png" alt="" style={{ width:30, height:30, objectFit:'contain', flexShrink:0 }} />
                Ver Citas
              </motion.button>
              <motion.button whileTap={{ scale:0.95, rotate:1 }} onClick={surprise}
                className="doodle-btn-primary"
                style={{ flex:1, minWidth:0, padding:'13px 14px', background:'transparent', border:'2px solid #FF6B8A', color:'#FF6B8A', borderRadius:16, fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:"'Inter',sans-serif" }}>
                <img src="/images/sorpresa.png" alt="" className="doodle-icon" style={{ width:30, height:30, objectFit:'contain', flexShrink:0 }} />
                Sorpresa ✦
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats cards */}
        {days !== null && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10, marginBottom:28, width:'100%' }}>
            {/* días juntos */}
            <div style={{ background:'#FFF0F4', borderRadius:16, padding:'12px 10px', border:'2px solid #FF6B8A', display:'flex', alignItems:'center', gap:8, boxShadow:'3px 3px 0 rgba(255,107,138,0.20)', minWidth:0, boxSizing:'border-box' }}>
              <img src="/images/metas.png" alt="" style={{ width:34, height:34, objectFit:'contain', flexShrink:0 }} />
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:"'Lora',Georgia,serif", fontSize:24, fontWeight:700, color:'black', lineHeight:1 }}>{days}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:'#CF8FA0', marginTop:3 }}>días juntos</div>
              </div>
            </div>
            {/* citas hechas */}
            <div onClick={() => { sessionStorage.setItem('datesViewFilter', 'terminadas'); navigateTo('dates'); }} style={{ background:'#F0FFF5', borderRadius:16, padding:'12px 10px', border:'2px solid #4CAF79', display:'flex', alignItems:'center', gap:8, boxShadow:'3px 3px 0 rgba(76,175,121,0.20)', cursor:'pointer', minWidth:0, boxSizing:'border-box' }}>
              <img src="/images/feliz.png" alt="" style={{ width:34, height:34, objectFit:'contain', flexShrink:0 }} />
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:"'Lora',Georgia,serif", fontSize:24, fontWeight:700, color:'black', lineHeight:1 }}>{citasHechas}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:'#5BAA6A', marginTop:3 }}>citas hechas</div>
              </div>
            </div>
            {/* por vivir */}
            <div onClick={() => navigateTo('dates')} style={{ background:'#FFFBF0', borderRadius:16, padding:'12px 10px', border:'2px solid #C4973E', display:'flex', alignItems:'center', gap:8, boxShadow:'3px 3px 0 rgba(196,151,62,0.20)', cursor:'pointer', minWidth:0, boxSizing:'border-box' }}>
              <img src="/images/triste.png" alt="" style={{ width:34, height:34, objectFit:'contain', flexShrink:0 }} />
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:"'Lora',Georgia,serif", fontSize:24, fontWeight:700, color:'black', lineHeight:1 }}>{citasPendientes}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:'#C4973E', marginTop:3 }}>por vivir</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Unread letters card */}
        {unreadLetters.length > 0 && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
            onClick={() => navigateTo('letters')}
            style={{ background:'#FFF0F4', border:'1.5px solid #F5D0DC', borderLeft:'4px solid #FF6B8A', borderRadius:20, padding:'16px 18px', marginBottom:28, cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
            <motion.div animate={{ rotate:[0,-10,10,-10,10,0] }} transition={{ delay:0.6, duration:0.7 }}>
              <span style={{ fontSize:34 }}>💌</span>
            </motion.div>
            <div style={{ flex:1 }}>
              <p style={{ fontFamily:"'Lora',Georgia,serif", fontSize:16, fontWeight:700, color:'#2D1B2E', margin:'0 0 4px' }}>
                {unreadLetters.length === 1 ? '¡Tienes una carta!' : `¡Tienes ${unreadLetters.length} cartas!`}
              </p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:14, color:'#9B8B95', margin:0 }}>
                De: {unreadLetters[0].sender_name || 'Tu pareja'} · toca para abrirla ✦
              </p>
            </div>
            <ChevronRight size={20} color="#FF6B8A" />
          </motion.div>
        )}

        {/* Swipeable date card OR surprise card */}
        <motion.section initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} whileHover={{ rotate: 0.3 }} transition={{ delay:0.14 }} style={{ marginBottom:28 }}>
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
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, padding:'0 4px' }}>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {Array.from({ length:DOTS }, (_,i) => (
                  <button key={i} onClick={() => setDateIdx(i)}
                    style={{ width:i===dateIdx%DOTS ? 22 : 8, height:8, borderRadius:4, background:i===dateIdx%DOTS ? '#FF6B8A' : '#FFD0DC', transition:'width 0.28s ease', border:'none', padding:0, cursor:'pointer' }} />
                ))}
              </div>
              <button onClick={nextDate}
                style={{ display:'flex', alignItems:'center', gap:4, color:'#FF6B8A', fontSize:14, fontWeight:700, background:'none', border:'none', cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                o ver otra <ChevronRight size={15} />
              </button>
            </div>
          )}
        </motion.section>

        {/* Quick links */}
        <motion.section initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.22 }} style={{ width:'100%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
            <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:20, fontWeight:700, color:'#2D1B2E', margin:0 }}>
              Accesos rápidos
            </h2>
            <div style={{ flex:1, height:2, background:'linear-gradient(90deg, #F5D0DC 0%, transparent 100%)', borderRadius:2 }} />
          </div>
          {/* Fila 1: 4 tarjetas grandes */}
          <div className="quick-grid-main">
            {QUICK_CARDS.slice(0, 4).map(({ id, img, cardBorder, cardBg, badgeColor, badge, title, sub, deco, barPct, trackBg, barBg }, index) => (
              <button key={id}
                onClick={() => navigateTo(id)}
                className="quick-card-pop"
                style={{ background:cardBg || '#FFFFFF', borderRadius:22, border:`2px solid ${cardBorder || '#F5D0DC'}`, padding:'18px 14px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:10, outline:'none', position:'relative', animationDelay:`${index * 0.06}s`, boxShadow:'2px 2px 0 rgba(255,107,138,0.10)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02) rotate(-0.5deg)'; e.currentTarget.style.boxShadow = '3px 3px 0 rgba(255,107,138,0.20)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.boxShadow = '2px 2px 0 rgba(255,107,138,0.10)'; }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {badge && (
                  <span style={{ position:'absolute', top:10, right:10, fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, color: badgeColor || '#FF6B8A', background:'transparent', borderRadius:8, padding:'2px 4px', lineHeight:1.4 }}>{badge}</span>
                )}
                <img src={img} alt={title} className="doodle-icon" style={{ width:64, height:64, objectFit:'contain' }} />
                <div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:15, fontWeight:700, color:'#2D1B2E', marginBottom:4, lineHeight:1.2 }}>{title}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:'#9B8B95', lineHeight:1.35 }}>{sub}</div>
                </div>
                {deco === 'bar' ? (
                  <div style={{ width:'100%', height:7, borderRadius:99, background: trackBg || '#FFD6E0', overflow:'hidden' }}>
                    <div style={{ width:`${barPct}%`, height:'100%', borderRadius:99, background: barBg || '#FF6B8A' }} />
                  </div>
                ) : (
                  <img src="/images/puntitos-de-colores.png" alt="" style={{ width:40, height:13, objectFit:'contain', objectPosition:'left center', opacity:0.85 }} />
                )}
              </button>
            ))}
          </div>

          {/* Fila 2: tarjetas más compactas */}
          <div className="quick-grid-secondary">
            {QUICK_CARDS.slice(4).map(({ id, img, cardBorder, cardBg, badgeColor, badge, title, sub, deco, barPct, trackBg, barBg }, index) => (
              <button key={id}
                onClick={() => navigateTo(id)}
                className="quick-card-pop"
                style={{ background:cardBg || '#FFFFFF', borderRadius:18, border:`2px solid ${cardBorder || '#F5D0DC'}`, padding:'14px 10px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:8, outline:'none', position:'relative', animationDelay:`${(index + 4) * 0.06}s`, boxShadow:'2px 2px 0 rgba(255,107,138,0.10)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02) rotate(-0.5deg)'; e.currentTarget.style.boxShadow = '3px 3px 0 rgba(255,107,138,0.20)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.boxShadow = '2px 2px 0 rgba(255,107,138,0.10)'; }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {badge && (
                  <span style={{ position:'absolute', top:8, right:8, fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700, color: badgeColor || '#FF6B8A', background:'transparent', borderRadius:8, padding:'1px 4px', lineHeight:1.4 }}>{badge}</span>
                )}
                <img src={img} alt={title} className="doodle-icon" style={{ width:52, height:52, objectFit:'contain' }} />
                <div>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:13, fontWeight:700, color:'#2D1B2E', marginBottom:2, lineHeight:1.2 }}>{title}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:'#9B8B95', lineHeight:1.3 }}>{sub}</div>
                </div>
                {deco === 'bar' ? (
                  <div style={{ width:'100%', height:6, borderRadius:99, background: trackBg || '#FFD6E0', overflow:'hidden' }}>
                    <div style={{ width:`${barPct}%`, height:'100%', borderRadius:99, background: barBg || '#FF6B8A' }} />
                  </div>
                ) : (
                  <img src="/images/puntitos-de-colores.png" alt="" style={{ width:34, height:11, objectFit:'contain', objectPosition:'left center', opacity:0.85 }} />
                )}
              </button>
            ))}
          </div>
        </motion.section>

      </div>

    </div>
  );
}
