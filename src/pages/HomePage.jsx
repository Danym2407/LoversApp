import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Heart } from 'lucide-react';
import { api, mapCoupleDate } from '@/lib/api';

// ── BgDoodles ──────────────────────────────────────────────────────────────────
function BgDoodles() {
  return (
    <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', opacity:0.25 }} viewBox="0 0 390 820" fill="none">
      <text x="355" y="90"  fontSize="12" fill="#E8A020" fontFamily="serif">✦</text>
      <text x="20"  y="160" fontSize="9"  fill="#E05060" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18"  y="420" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <text x="352" y="560" fontSize="9"  fill="#E8A020" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <path d="M15 340 Q35 335 43 348" stroke="#E05060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── DoodleTag ──────────────────────────────────────────────────────────────────
const CAT_STYLE = {
  Exterior:   { bg:'#F0FAE8', color:'#3A6A20', dot:'#5BAA6A' },
  Interior:   { bg:'#F5EEFA', color:'#5A2070', dot:'#9B59C0' },
  Cultural:   { bg:'#EBF3FC', color:'#1A3A7A', dot:'#5B8ECC' },
  Gastro:     { bg:'#FFF0E8', color:'#7A3010', dot:'#E0723A' },
  Deportes:   { bg:'#E8FAF2', color:'#1A5A3A', dot:'#3AAA72' },
  Romántica:  { bg:'#FEECF0', color:'#7A1530', dot:'#C44455' },
  Aventura:   { bg:'#F0FAE8', color:'#2A5A10', dot:'#5BAA6A' },
  'Muy bajo': { bg:'#EEF8EE', color:'#2A6A2A', dot:'#5BAA6A' },
  Bajo:       { bg:'#FEFBE8', color:'#6A5A10', dot:'#D4A520' },
  Medio:      { bg:'#FEF5D8', color:'#8A6A10', dot:'#E8A020' },
  Alto:       { bg:'#FEE8E8', color:'#8A2020', dot:'#C44455' },
};
function DoodleTag({ label }) {
  const s = CAT_STYLE[label] || { bg:'#F0E8E0', color:'#7A5A55', dot:'#B09A90' };
  return (
    <span style={{ fontSize:10, fontFamily:"'Caveat',cursive", fontWeight:600, background:s.bg, color:s.color, borderRadius:20, padding:'2px 9px', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, display:'inline-block', flexShrink:0 }}/>
      {label}
    </span>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────────
function loadDatesFromStorage() {
  try { return JSON.parse(localStorage.getItem('coupleDates') || '[]'); } catch { return []; }
}
function saveDates(list) { localStorage.setItem('coupleDates', JSON.stringify(list)); }

const ALL_FILTERS = ['Todas', 'Exterior', 'Interior', 'Cultural', 'Gastro', 'Deportes'];

export default function HomePage({ navigateTo }) {
  const [dates,        setDates]        = useState([]);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [search,       setSearch]       = useState('');

  useEffect(() => { fetchDates(); }, []);

  const fetchDates = async () => {
    const token = localStorage.getItem('loversappToken');
    if (token) {
      try {
        const rows = await api.getCoupleDates();
        const mapped = rows.map(mapCoupleDate);
        setDates(mapped);
        saveDates(mapped); // keep localStorage in sync for DateDetailPage
        return;
      } catch (e) {
        // fall through to cached data
      }
    }
    setDates(loadDatesFromStorage());
  };

  const toggleLike = async (id) => {
    const target = dates.find(d => d.id === id);
    if (!target) return;
    const newLiked = !target.liked;
    const next = dates.map(d => d.id === id ? { ...d, liked: newLiked } : d);
    setDates(next);
    saveDates(next);
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.updateCoupleDate(id, { liked: newLiked }).catch(() => {});
    }
  };

  const skipDate = async (id) => {
    const next = dates.map(d => d.id === id ? { ...d, status: 'skipped' } : d);
    setDates(next);
    saveDates(next);
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.updateCoupleDate(id, { status: 'skipped' }).catch(() => {});
    }
  };

  const userRaw = localStorage.getItem('loversappUser');
  const user    = userRaw ? JSON.parse(userRaw) : null;
  const couple  = (user?.name && user?.partner)
    ? `${user.name} & ${user.partner}`.toUpperCase()
    : 'ANDREA & MARCO';

  const filtered = dates.filter(d => {
    if (d.status === 'skipped') return false;
    const cats = d.categories || (d.category ? [d.category] : []);
    const matchFilter = activeFilter === 'Todas' || cats.includes(activeFilter);
    const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ background:'#FDF6EC', minHeight:'100vh', display:'flex', flexDirection:'column', maxWidth:430, margin:'0 auto', fontFamily:"'Lora',Georgia,serif", position:'relative', overflow:'hidden' }}>
      <style>{`
        .caveat { font-family: 'Caveat', cursive; }
        .lora   { font-family: 'Lora', Georgia, serif; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <BgDoodles />

      {/* ── HEADER ── */}
      <div style={{ padding:'48px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1.5px solid #EDE0D0', background:'#FDF6EC', position:'sticky', top:0, zIndex:40 }}>
        <button onClick={() => navigateTo('dashboard')}
          style={{ width:38, height:38, borderRadius:'50%', background:'#fff', border:'1.5px solid #EDE0D0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={16} color="#C44455" strokeWidth={2.5}/>
        </button>
        <div style={{ textAlign:'center' }}>
          <div className="lora" style={{ fontSize:20, color:'#1C0E10', fontWeight:600, letterSpacing:1 }}>100 Citas</div>
          <div className="caveat" style={{ fontSize:11, color:'#C44455', letterSpacing:2, marginTop:2 }}>✦ {couple} ✦</div>
        </div>
        <button style={{ width:38, height:38, borderRadius:'50%', background:'#fff', border:'1.5px solid #EDE0D0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <Search size={15} color="#C44455"/>
        </button>
      </div>

      {/* ── PERFIL CHIPS ── */}
      <div style={{ padding:'12px 20px 0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', gap:6 }}>
          <span className="caveat" style={{ fontSize:12, fontWeight:700, background:'#1C0E10', color:'#F0C4CC', borderRadius:20, padding:'4px 12px' }}>Híbrido ⚖️</span>
          <span className="caveat" style={{ fontSize:12, fontWeight:700, background:'#FEF9E8', color:'#7A6A20', borderRadius:20, padding:'4px 12px', border:'1.5px solid #E8D890' }}>Presup. Medio</span>
        </div>
        <span className="caveat" style={{ fontSize:12, color:'#9A7A6A' }}>{filtered.length} citas</span>
      </div>

      {/* ── SEARCH BAR ── */}
      <div style={{ padding:'10px 20px 4px', position:'relative', zIndex:1 }}>
        <div style={{ background:'#fff', border:'1.5px solid #EDE0D0', borderRadius:16, padding:'9px 14px', display:'flex', alignItems:'center', gap:8 }}>
          <Search size={14} color="#C8B8A8"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cita..."
            className="caveat"
            style={{ border:'none', background:'transparent', outline:'none', fontSize:14, fontWeight:600, color:'#1C0E10', flex:1 }}
          />
        </div>
      </div>

      {/* ── FILTER CHIPS ── */}
      <div style={{ padding:'10px 20px 12px', display:'flex', gap:7, overflowX:'auto', scrollbarWidth:'none', position:'relative', zIndex:1 }}>
        {ALL_FILTERS.map(f => {
          const active = activeFilter === f;
          return (
            <button key={f} onClick={() => setActiveFilter(f)} className="caveat"
              style={{ background: active?'#1C0E10':'#fff', color: active?'#F0C4CC':'#7A5A55',
                border: active?'1.5px solid #1C0E10':'1.5px solid #EDE0D0',
                borderRadius:20, padding:'5px 16px', fontSize:13, fontWeight: active?700:600,
                cursor:'pointer', whiteSpace:'nowrap' }}>
              {f}
            </button>
          );
        })}
      </div>

      {/* ── CITA LIST ── */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:8, flex:1, overflowY:'auto', position:'relative', zIndex:1 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
            <p className="lora" style={{ color:'#9A7A6A' }}>No encontramos citas</p>
          </div>
        )}

        {filtered.map((date, i) => {
          const isFav = !!date.liked;
          const cats  = date.categories || (date.category ? [date.category] : []);
          const num   = String(date.priority ?? i + 1).padStart(2, '0');
          return (
            <div key={date.id}
              onClick={() => navigateTo('detail', date.id)}
              style={{ background:'#fff', border:'1.5px solid #EDE0D0',
                borderLeft: isFav ? '3.5px solid #C44455' : '3.5px solid #EDE0D0',
                borderRadius:18, padding:'12px 14px',
                display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'transform 0.12s' }}>

              {/* Number badge */}
              <div style={{ minWidth:30, height:30, borderRadius:10,
                background: isFav?'#FEE8EC':'#F5EEE8',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span className="caveat" style={{ fontSize:13, fontWeight:700, color: isFav?'#C44455':'#9A7A6A' }}>{num}</span>
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div className="lora" style={{ fontSize:13, fontWeight:600, color:'#1C0E10', marginBottom:6, lineHeight:1.3 }}>
                  {date.name}
                </div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {cats.map(c => <DoodleTag key={c} label={c}/>)}
                  {date.budget && <DoodleTag label={date.budget}/>}
                  {date.time && (
                    <span className="caveat" style={{ fontSize:10, fontWeight:600, background:'#F5EEE8', color:'#8A7060', borderRadius:20, padding:'2px 9px' }}>{date.time}</span>
                  )}
                </div>
              </div>

              {/* Heart + Skip */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); toggleLike(date.id); }}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
                  <Heart size={17} color="#C44455" fill={isFav?'#C44455':'none'} strokeWidth={1.5}/>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); if (window.confirm('¿Ocultar esta cita de la lista?')) skipDate(date.id); }}
                  title="Ocultar cita"
                  style={{ background:'none', border:'none', cursor:'pointer', padding:4, opacity: 0.4 }}>
                  <span style={{ fontSize: 14, color: '#9A7A6A' }}>✕</span>
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length < dates.length && (
          <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
            <span className="caveat" style={{ fontSize:13, color:'#C44455' }}>
              · · · {dates.length - filtered.length} citas más · · ·
            </span>
          </div>
        )}
        <div style={{ height:80 }}/>
      </div>
    </div>
  );
}
