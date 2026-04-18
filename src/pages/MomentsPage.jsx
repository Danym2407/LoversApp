import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Heart, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  upsertCalendarEvent,
  upsertTimelineEvent,
  removeCalendarEventBySource,
  removeTimelineEventBySource
} from '@/lib/eventSync';
import { api } from '@/lib/api';

const D = {
  cream: '#FFF5F7', wine: '#2D1B2E', coral: '#FF6B8A',
  gold:  '#D4A520', blue: '#5B8ECC', green: '#5BAA6A',
  blush: '#FFD0DC', white: '#FFFFFF', border: '#FFD0DC',
  muted: '#9B8B95',
};
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;
const CATS = ['Comida','Películas','Parque','Playa','Viaje','Compras','Otro'];
const CAT_IMGS = {
  Comida:    '/images/feliz.png',
  Películas: '/images/ideas.png',
  Parque:    '/images/corazon.png',
  Playa:     '/images/estrella-corazon.png',
  Viaje:     '/images/cohete.png',
  Compras:   '/images/sorpresa.png',
  Otro:      '/images/recuerdos.png',
  Cita:      '/images/historial.png',
};

function BgDoodles() {
  return (
    <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.25}} viewBox="0 0 390 820" fill="none">
      <text x="355" y="90"  fontSize="12" fill="#E8A020" fontFamily="serif">✦</text>
      <text x="20"  y="160" fontSize="9"  fill="#E05060" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18"  y="420" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <path d="M15 340 Q35 335 43 348" stroke="#E05060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function daysDiff(iso) {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso)) / 86400000));
}
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
}
function groupByMonth(list) {
  const map = {};
  list.forEach(m => {
    const d = new Date(m.date + 'T00:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleDateString('es-ES', { month:'long', year:'numeric' });
    if (!map[key]) map[key] = { label, items:[] };
    map[key].items.push(m);
  });
  return Object.entries(map).sort((a,b) => b[0].localeCompare(a[0])).map(([,v]) => v);
}

const DEFAULT_MOMENTS = [
  { id:1, date:'2026-01-15', title:'Atardecer Mágico',   note:'El mejor atardecer que hemos visto juntos', favorite:true,  image:'🌅', location:'', category:'', rating:0 },
  { id:2, date:'2026-01-10', title:'Cena Especial',      note:'Una noche increíble',                       favorite:false, image:'✨',  location:'Restaurante El Cielo', category:'Comida', rating:5 },
];
const EMPTY_FORM = { title:'', date:'', note:'', image:'✨', location:'', category:'', rating:0 };

export default function MomentsPage({ navigateTo }) {
  const [moments,    setMoments]    = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [userData,   setUserData]   = useState(null);
  const [filterCat,  setFilterCat]  = useState('');
  const { toast } = useToast();

  const syncAll = (items) => {
    items.forEach(m => {
      if (!m?.id) return;
      const desc = [m.note, m.location ? `📍 ${m.location}` : ''].filter(Boolean).join(' • ');
      upsertCalendarEvent({ title:`Momento: ${m.title}`, description: desc, dateStr:m.date, sourceType:'moment', sourceId:m.id });
      upsertTimelineEvent({ title:m.title, description: desc, dateStr:m.date, image:m.image||'✨', sourceType:'moment', sourceId:m.id });
    });
  };

  useEffect(() => {
    const raw = localStorage.getItem('loversappUser');
    if (raw) setUserData(JSON.parse(raw));
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getMoments()
        .then(rows => {
          const items = rows.map(r => ({
            id: r.id,
            date: r.date || new Date().toISOString().slice(0,10),
            title: r.title,
            note: r.description || r.note || '',
            favorite: !!r.favorite,
            image: r.emoji || r.image || '✨',
            location: r.location || '',
            category: r.category || '',
            rating: r.rating || 0,
          }));
          setMoments(items);
          localStorage.setItem('momentsEntries', JSON.stringify(items));
          syncAll(items);
        })
        .catch(() => {
          const saved = localStorage.getItem('momentsEntries');
          if (saved) { const p = JSON.parse(saved); setMoments(p); syncAll(p); }
          else { setMoments(DEFAULT_MOMENTS); localStorage.setItem('momentsEntries', JSON.stringify(DEFAULT_MOMENTS)); syncAll(DEFAULT_MOMENTS); }
        });
    } else {
      const saved = localStorage.getItem('momentsEntries');
      if (saved) { const p = JSON.parse(saved); setMoments(p); syncAll(p); }
      else { setMoments(DEFAULT_MOMENTS); localStorage.setItem('momentsEntries', JSON.stringify(DEFAULT_MOMENTS)); syncAll(DEFAULT_MOMENTS); }
    }
  }, []);

  const persist = (list) => {
    setMoments(list);
    localStorage.setItem('momentsEntries', JSON.stringify(list));
  };

  const toggleFav = (id) => {
    const m = moments.find(x => x.id === id);
    if (!m) return;
    const newFav = !m.favorite;
    const next = moments.map(x => x.id===id ? {...x, favorite:newFav} : x);
    persist(next);
    if (showDetail?.id === id) setShowDetail(next.find(x => x.id===id));
    const token = localStorage.getItem('loversappToken');
    if (token) api.updateMoment(id, { favorite: newFav }).catch(() => {});
  };

  const deleteMoment = (id) => {
    persist(moments.filter(m => m.id!==id));
    removeCalendarEventBySource('moment', id);
    removeTimelineEventBySource('moment', id);
    if (showDetail?.id === id) setShowDetail(null);
    const token = localStorage.getItem('loversappToken');
    if (token) api.deleteMoment(id).catch(() => {});
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      toast({ title:'Faltan datos', description:'Agrega título y fecha.' }); return;
    }
    const token = localStorage.getItem('loversappToken');
    let m;
    if (token) {
      try {
        const created = await api.createMoment({
          title:       form.title.trim(),
          description: form.note.trim(),
          date:        form.date,
          image:       form.image.trim() || '✨',
          location:    form.location.trim(),
          category:    form.category,
          rating:      form.rating,
        });
        m = { id: created.id, date: form.date, title: form.title.trim(), note: form.note.trim(), favorite: false, image: form.image.trim()||'✨', location: form.location.trim(), category: form.category, rating: Number(form.rating)||0 };
      } catch {
        m = { id: Date.now(), date: form.date, title: form.title.trim(), note: form.note.trim(), favorite: false, image: form.image.trim()||'✨', location: form.location.trim(), category: form.category, rating: Number(form.rating)||0 };
      }
    } else {
      m = { id: Date.now(), date: form.date, title: form.title.trim(), note: form.note.trim(), favorite: false, image: form.image.trim()||'✨', location: form.location.trim(), category: form.category, rating: Number(form.rating)||0 };
    }
    const next = [m, ...moments];
    persist(next);
    const desc = [m.note, m.location ? `📍 ${m.location}` : ''].filter(Boolean).join(' • ');
    upsertCalendarEvent({ title:`Momento: ${m.title}`, description: desc, dateStr:m.date, sourceType:'moment', sourceId:m.id });
    upsertTimelineEvent({ title:m.title, description: desc, dateStr:m.date, image:m.image, sourceType:'moment', sourceId:m.id });
    setShowModal(false);
    setForm(EMPTY_FORM);
    toast({ title:'Momento guardado ✦', description:'Añadido al calendario y línea del tiempo.' });
  };

  const totalDays = daysDiff(userData?.relationshipStartDate);

  const completedDatesItems = (JSON.parse(localStorage.getItem('coupleDates') || '[]'))
    .filter(d => d.status === 'completed' && d.date)
    .map(d => ({
      id: 'date_' + d.id,
      date: d.date,
      title: d.name || `Cita #${d.id}`,
      note: [d.danielaReview, d.eduardoReview].filter(Boolean).join(' • '),
      favorite: false,
      image: '💞',
      location: d.location || '',
      category: 'Cita',
      rating: 0,
      _isDate: true,
    }));

  const allItems  = [...moments, ...completedDatesItems];
  const favCount  = allItems.filter(m => m.favorite).length;
  const usedCats  = [...new Set(allItems.filter(m => m.category).map(m => m.category))];
  const displayed = filterCat ? allItems.filter(m => m.category === filterCat) : allItems;
  const groups    = groupByMonth(displayed);

  const catImg = (cat) => (cat && CAT_IMGS[cat]) ? CAT_IMGS[cat] : '/images/recuerdos.png';

  return (
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden', paddingBottom:88, fontFamily:"'Lora',Georgia,serif" }}>
      <style>{STYLE}</style>
      <BgDoodles/>

      {/* ── HEADER ── */}
      <div style={{ padding:'48px 20px 18px', background:D.cream, borderBottom:`1.5px solid ${D.border}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => window.history.back()}
              style={{ width:32, height:32, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <ChevronLeft size={14} color={D.coral} strokeWidth={2.5}/>
            </button>
            <span className="caveat" style={{ fontSize:12, color:'#C4AAB0', fontWeight:600 }}>Inicio &gt; Memorias</span>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ width:32, height:32, borderRadius:'50%', background:D.coral, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'2px 2px 0 rgba(196,68,100,0.28)', flexShrink:0 }}>
            <Plus size={16} color="#fff" strokeWidth={2.5}/>
          </button>
        </div>
        <div>
          <h1 className="lora" style={{ fontSize:30, fontWeight:700, color:D.wine, margin:0, lineHeight:1.1, display:'flex', alignItems:'center', gap:8 }}>
            Memorias
            <img src="/images/recuerdos.png" alt="" style={{ width:28, height:28, objectFit:'contain' }}/>
          </h1>
          <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'65%', maxWidth:220, margin:'4px 0 8px' }}/>
          <p className="caveat" style={{ fontSize:14, color:D.muted, margin:0 }}>Recuerdos & salidas juntos 💕</p>
        </div>
      </div>

      <div style={{ padding:'16px 20px 0', position:'relative', zIndex:1 }}>

        {/* ── STATS STRIP ── */}
        <div style={{ background:D.coral, borderRadius:18, padding:'14px 20px', display:'flex', justifyContent:'space-around', marginBottom:20, boxShadow:'0 4px 16px rgba(255,107,138,0.28)' }}>
          {[
            { label:'Días juntos', value: totalDays ?? '—', img:'/images/corazon.png' },
            { label:'Recuerdos',   value: allItems.length,  img:'/images/recuerdos.png' },
            { label:'Favoritas',   value: favCount,          img:'/images/estrella-corazon.png' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <img src={s.img} alt="" style={{ width:22, height:22, objectFit:'contain', filter:'brightness(0) invert(1)' }}/>
              <div className="caveat" style={{ fontSize:22, fontWeight:700, color:'#fff', lineHeight:1 }}>{s.value}</div>
              <div className="caveat" style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── CATEGORY FILTER CHIPS ── */}
        {usedCats.length > 0 && (
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:16 }}>
            <button onClick={() => setFilterCat('')}
              style={{ flexShrink:0, padding:'5px 12px', background: filterCat==='' ? D.coral : D.white, border:`1.5px solid ${filterCat==='' ? D.coral : D.border}`, borderRadius:20, cursor:'pointer' }}>
              <span className="caveat" style={{ fontSize:12, fontWeight:700, color: filterCat==='' ? '#fff' : D.wine }}>Todos</span>
            </button>
            {usedCats.map(c => (
              <button key={c} onClick={() => setFilterCat(filterCat===c ? '' : c)}
                style={{ flexShrink:0, padding:'5px 12px', background: filterCat===c ? D.coral : D.white, border:`1.5px solid ${filterCat===c ? D.coral : D.border}`, borderRadius:20, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                <img src={catImg(c)} alt="" style={{ width:13, height:13, objectFit:'contain' }}/>
                <span className="caveat" style={{ fontSize:12, fontWeight:700, color: filterCat===c ? '#fff' : D.wine }}>{c}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {allItems.length === 0 && (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <img src="/images/recuerdos.png" alt="" style={{ width:72, height:72, objectFit:'contain', opacity:0.45, marginBottom:14 }}/>
            <p className="lora" style={{ color:D.muted, fontSize:16 }}>Guarda tus primeros recuerdos</p>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {groups.map((g, gi) => (
          <motion.div key={gi} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:gi*0.06 }} style={{ marginBottom:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <span className="caveat" style={{ fontSize:13, fontWeight:700, color:D.muted, textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0 }}>{g.label}</span>
              <div style={{ flex:1, height:1.5, background:`repeating-linear-gradient(90deg,${D.border} 0,${D.border} 6px,transparent 6px,transparent 12px)` }}/>
            </div>
            {g.items.map((m, mi) => (
              <div key={m.id} style={{ display:'flex', gap:12, marginBottom:14, position:'relative' }}>
                {mi < g.items.length-1 && (
                  <div style={{ position:'absolute', left:12, top:28, bottom:-6, width:1.5,
                    background:`repeating-linear-gradient(to bottom,${D.border} 0,${D.border} 5px,transparent 5px,transparent 10px)` }}/>
                )}
                {/* timeline dot */}
                <div style={{ width:26, height:26, borderRadius:'50%', background: m.favorite ? D.coral : '#FFF0F4', border:`1.5px solid ${m.favorite ? D.coral : D.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:2 }}>
                  <img src={catImg(m.category)} alt="" style={{ width:14, height:14, objectFit:'contain', filter: m.favorite ? 'brightness(0) invert(1)' : 'none' }}/>
                </div>
                {/* card */}
                <motion.div whileTap={{ scale:0.98 }} onClick={() => setShowDetail(m)}
                  style={{ flex:1, background:D.white, borderRadius:16, border:`1.5px solid ${D.border}`, borderLeft:`3.5px solid ${m.favorite ? D.coral : D.blush}`, padding:'12px 14px', cursor:'pointer', position:'relative', overflow:'hidden' }}>
                  {/* bg watermark */}
                  <img src={catImg(m.category)} alt=""
                    style={{ position:'absolute', right:-6, top:'50%', transform:'translateY(-50%)', width:70, height:70, objectFit:'contain', opacity:0.07, pointerEvents:'none', userSelect:'none' }}/>

                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, position:'relative', zIndex:1 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="lora" style={{ fontSize:15, fontWeight:700, color:D.wine, marginBottom:2, lineHeight:1.3 }}>{m.title}</div>
                      <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>{formatDate(m.date)}</div>
                      {m.location && (
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 10px', background:'#FFF0F4', border:`1px solid ${D.border}`, borderRadius:20, marginBottom:5 }}>
                          <img src={catImg(m.category)} alt="" style={{ width:11, height:11, objectFit:'contain' }}/>
                          <span className="caveat" style={{ fontSize:12, fontWeight:700, color:D.coral }}>{m.location}</span>
                          {m.category && <span className="caveat" style={{ fontSize:11, color:D.muted }}>· {m.category}</span>}
                        </div>
                      )}
                      {m.note && <div className="caveat" style={{ fontSize:13, color:D.muted, lineHeight:1.5 }}>{m.note}</div>}
                      {m.rating > 0 && (
                        <div style={{ display:'flex', gap:1, marginTop:5 }}>
                          {[...Array(5)].map((_,j) => <span key={j} style={{ fontSize:12, color: j<m.rating ? D.gold : D.border }}>★</span>)}
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                      {m._isDate && (
                        <div style={{ padding:'2px 7px', background:'#FFF0F4', border:`1px solid ${D.border}`, borderRadius:20 }}>
                          <span className="caveat" style={{ fontSize:10, fontWeight:700, color:D.coral }}>Cita ✦</span>
                        </div>
                      )}
                      {m.image && !/^\//.test(m.image) && (
                        <div style={{ width:38, height:38, borderRadius:10, background:'#FFF0F4', border:`1px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{m.image}</div>
                      )}
                      {!m._isDate && (
                        <button onClick={e => { e.stopPropagation(); toggleFav(m.id); }}
                          style={{ width:28, height:28, borderRadius:'50%', background: m.favorite?'#FFF0F4':'transparent', border:`1px solid ${m.favorite?D.coral:D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          <Heart size={12} fill={m.favorite?D.coral:'none'} color={m.favorite?D.coral:D.muted}/>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* ── DETAIL SHEET ── */}
      <AnimatePresence>
        {showDetail && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowDetail(null)}
              style={{ position:'fixed', inset:0, background:'rgba(45,27,46,0.5)', zIndex:100 }}/>
            <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:101, padding:'0 20px', pointerEvents:'none' }}>
            <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.96 }} transition={{ duration:0.18 }}
              onClick={e => e.stopPropagation()}
              style={{ width:'100%', maxWidth:400, background:D.cream, borderRadius:24, padding:'20px 20px 24px', maxHeight:'88vh', overflowY:'auto', boxShadow:'0 8px 40px rgba(45,27,46,0.22)', pointerEvents:'all' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <img src={catImg(showDetail.category)} alt="" style={{ width:22, height:22, objectFit:'contain' }}/>
                  <span className="lora" style={{ fontSize:18, fontWeight:700, color:D.wine }}>{showDetail.title}</span>
                </div>
                <button onClick={() => setShowDetail(null)}
                  style={{ width:32, height:32, borderRadius:'50%', background:'#FFF0F4', border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <X size={14} color={D.coral}/>
                </button>
              </div>
              <div className="caveat" style={{ color:D.muted, fontSize:13, marginBottom:12 }}>{formatDate(showDetail.date)}</div>
              {showDetail.image && !/^\//.test(showDetail.image) && (
                <div style={{ fontSize:44, marginBottom:12 }}>{showDetail.image}</div>
              )}
              {showDetail.location && (
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:D.white, border:`1.5px solid ${D.border}`, borderRadius:14, marginBottom:12 }}>
                  <img src={catImg(showDetail.category)} alt="" style={{ width:22, height:22, objectFit:'contain' }}/>
                  <div style={{ flex:1 }}>
                    <div className="caveat" style={{ fontSize:14, fontWeight:700, color:D.wine }}>{showDetail.location}</div>
                    {showDetail.category && <div className="caveat" style={{ fontSize:12, color:D.muted }}>{showDetail.category}</div>}
                  </div>
                  {showDetail.rating > 0 && (
                    <div style={{ display:'flex', gap:2 }}>
                      {[...Array(5)].map((_,j) => <span key={j} style={{ fontSize:14, color: j<showDetail.rating ? D.gold : D.border }}>★</span>)}
                    </div>
                  )}
                </div>
              )}
              {showDetail.note && <p style={{ color:D.wine, lineHeight:1.65, marginBottom:16 }}>{showDetail.note}</p>}
              {!showDetail._isDate && (
                <div style={{ display:'flex', gap:10, marginTop:16 }}>
                  <button onClick={() => toggleFav(showDetail.id)}
                    style={{ flex:1, padding:'11px', borderRadius:14, background: showDetail.favorite ? D.coral : '#FFF0F4', border:`1.5px solid ${showDetail.favorite ? D.coral : D.border}`, cursor:'pointer' }}>
                    <span className="caveat" style={{ fontWeight:700, fontSize:15, color: showDetail.favorite ? '#fff' : D.coral }}>
                      {showDetail.favorite ? '♥ Favorita' : '♡ Añadir favorita'}
                    </span>
                  </button>
                  <button onClick={() => deleteMoment(showDetail.id)}
                    style={{ padding:'11px 16px', borderRadius:14, background:'#FFF0F4', border:`1.5px solid ${D.border}`, cursor:'pointer' }}>
                    <Trash2 size={17} color={D.coral}/>
                  </button>
                </div>
              )}
              {showDetail._isDate && (
                <div style={{ marginTop:16, padding:'10px 14px', background:'#FFF0F4', border:`1.5px solid ${D.border}`, borderRadius:14 }}>
                  <span className="caveat" style={{ fontSize:13, color:D.muted }}>Esta cita se gestiona desde la sección de Citas 💞</span>
                </div>
              )}
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── ADD MODAL (full-screen page) ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowModal(false)}
              style={{ position:'fixed', inset:0, background:'rgba(45,27,46,0.5)', zIndex:199 }}/>
            <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'0 20px' }}>
            <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.96 }} transition={{ duration:0.18 }}
              onClick={e => e.stopPropagation()}
              style={{ width:'100%', maxWidth:400, background:D.cream, borderRadius:24, overflowY:'auto', maxHeight:'88vh', paddingBottom:24, boxShadow:'0 8px 40px rgba(45,27,46,0.22)' }}>

              {/* header */}
              <div style={{ padding:'20px 20px 16px', borderBottom:`1.5px solid ${D.border}`, marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <img src="/images/recuerdos.png" alt="" style={{ width:22, height:22, objectFit:'contain' }}/>
                    <h1 className="lora" style={{ fontSize:20, fontWeight:700, color:D.wine, margin:0 }}>Nuevo Recuerdo</h1>
                  </div>
                  <button onClick={() => setShowModal(false)}
                    style={{ width:32, height:32, borderRadius:'50%', background:'#FFF0F4', border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    <X size={14} color={D.coral} strokeWidth={2.5}/>
                  </button>
                </div>
                <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'55%', maxWidth:180, margin:'6px 0 0' }}/>
              </div>

              <div style={{ padding:'0 20px' }}>
              <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:12, paddingTop:0 }}>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4, fontWeight:600 }}>Título *</div>
                  <input type="text" value={form.title} placeholder="Ej. Nuestro primer viaje"
                    onChange={e => setForm(p=>({...p,title:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine, boxSizing:'border-box' }}/>
                </div>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4, fontWeight:600 }}>Fecha *</div>
                  <input type="date" value={form.date} onChange={e => setForm(p=>({...p,date:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine, boxSizing:'border-box' }}/>
                </div>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4, fontWeight:600 }}>Nota</div>
                  <textarea value={form.note} placeholder="¿Qué pasó ese día?" rows={3}
                    onChange={e => setForm(p=>({...p,note:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine, resize:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
                </div>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4, fontWeight:600 }}>Emoji</div>
                  <input type="text" value={form.image} placeholder="✨"
                    onChange={e => setForm(p=>({...p,image:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine, boxSizing:'border-box' }}/>
                </div>

                {/* ── SALIDA section ── */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                  <img src="/images/historial.png" alt="" style={{ width:16, height:16, objectFit:'contain' }}/>
                  <span className="caveat" style={{ fontSize:13, fontWeight:700, color:D.muted }}>¿Fue una salida? (opcional)</span>
                  <div style={{ flex:1, height:1.5, background:D.border }}/>
                </div>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4, fontWeight:600 }}>Lugar</div>
                  <input type="text" value={form.location} placeholder="Ej: Restaurante favorito"
                    onChange={e => setForm(p=>({...p,location:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine, boxSizing:'border-box' }}/>
                </div>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4, fontWeight:600 }}>Categoría</div>
                  <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine }}>
                    <option value="">— Sin categoría —</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:6, fontWeight:600 }}>Calificación</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[1,2,3,4,5].map(r => (
                      <button key={r} type="button" onClick={() => setForm(p=>({...p,rating:p.rating===r?0:r}))}
                        style={{ fontSize:26, background:'none', border:'none', cursor:'pointer', color: r<=form.rating ? D.gold : D.border, padding:0, lineHeight:1 }}>★</button>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ flex:1, padding:'12px', borderRadius:14, background:'#FFF0F4', border:`1.5px solid ${D.border}`, cursor:'pointer' }}>
                    <span className="caveat" style={{ fontSize:14, fontWeight:700, color:D.coral }}>Cancelar</span>
                  </button>
                  <button type="submit"
                    style={{ flex:1, padding:'12px', borderRadius:14, background:D.coral, border:'none', cursor:'pointer', boxShadow:'3px 3px 0 rgba(196,68,100,0.28)' }}>
                    <span className="caveat" style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Guardar ✦</span>
                  </button>
                </div>
              </form>
              </div>{/* end padding wrapper */}
            </motion.div>
            </div>{/* end flex centering wrapper */}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
