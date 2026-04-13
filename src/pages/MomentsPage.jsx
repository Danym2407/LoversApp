import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Heart, X, Camera, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import {
  upsertCalendarEvent,
  upsertTimelineEvent,
  removeCalendarEventBySource,
  removeTimelineEventBySource
} from '@/lib/eventSync';
import { api } from '@/lib/api';

// ── palette ──────────────────────────────────────────────────────────────────
const D = {
  cream:  '#FDF6EC',
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
`;

// ── BgDoodles ─────────────────────────────────────────────────────────────────
function BgDoodles() {
  return (
    <svg style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.22 }} viewBox="0 0 390 820" fill="none">
      <text x="340" y="78"  fontSize="14" fill="#D4A520" fontFamily="serif">✦</text>
      <text x="26"  y="130" fontSize="10" fill="#C44455" fontFamily="serif">✦</text>
      <text x="358" y="210" fontSize="9"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="16"  y="360" fontSize="11" fill="#D4A520" fontFamily="serif">✦</text>
      <ellipse cx="354" cy="113" rx="20" ry="18" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-10 354 113)"/>
      <circle cx="34" cy="200" r="9" fill="none" stroke="#D4A520" strokeWidth="1.5"/>
      <ellipse cx="34" cy="200" rx="14" ry="4.5" fill="none" stroke="#D4A520" strokeWidth="1.5" transform="rotate(-25 34 200)"/>
    </svg>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function daysDiff(iso) {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso)) / 86400000));
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
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
  return Object.entries(map)
    .sort((a,b) => b[0].localeCompare(a[0]))
    .map(([,v]) => v);
}

// ── NodeIcon ──────────────────────────────────────────────────────────────────
function NodeIcon({ moment }) {
  const isFav = moment.favorite === true;
  const isSpecial = typeof moment.image === 'string' && moment.image.length > 0 && /\p{Emoji}/u.test(moment.image);
  const bg = isFav ? D.coral : isSpecial ? D.gold : '#E8DDD5';
  const glyph = isFav ? '♥' : isSpecial ? '★' : '○';
  const color = isFav || isSpecial ? D.white : D.muted;
  return (
    <div style={{ width:26, height:26, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 6px rgba(0,0,0,0.12)', zIndex:2 }}>
      <span style={{ fontSize:12, color, lineHeight:1 }}>{glyph}</span>
    </div>
  );
}

const DEFAULT_MOMENTS = [
  { id:1, date:'2026-01-15', title:'Atardecer Mágico',       note:'El mejor atardecer que hemos visto juntos', favorite:true,  image:'🌅' },
  { id:2, date:'2026-01-10', title:'Café y Conversación',    note:'Horas hablando de nuestros sueños',         favorite:false, image:'☕' },
];

export default function MomentsPage({ navigateTo }) {
  const [moments,    setMoments]    = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form,       setForm]       = useState({ title:'', date:'', note:'', image:'✨' });
  const [userData,   setUserData]   = useState(null);
  const { toast } = useToast();

  // ── sync all moments to calendar + timeline ───────────────────────────────
  const syncAll = (items) => {
    items.forEach(m => {
      if (!m?.id) return;
      upsertCalendarEvent({ title:`Momento: ${m.title}`, description:m.note||'', dateStr:m.date, sourceType:'moment', sourceId:m.id });
      upsertTimelineEvent({ title:m.title, description:m.note||'', dateStr:m.date, image:m.image||'✨', sourceType:'moment', sourceId:m.id });
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
            image: r.emoji || r.image || '\u2728',
          }));
          setMoments(items);
          localStorage.setItem('momentsEntries', JSON.stringify(items));
          syncAll(items);
        })
        .catch(() => {
          // fall back to localStorage
          const saved = localStorage.getItem('momentsEntries');
          if (saved) {
            const parsed = JSON.parse(saved);
            setMoments(parsed);
            syncAll(parsed);
          } else {
            setMoments(DEFAULT_MOMENTS);
            localStorage.setItem('momentsEntries', JSON.stringify(DEFAULT_MOMENTS));
            syncAll(DEFAULT_MOMENTS);
          }
        });
    } else {
      const saved = localStorage.getItem('momentsEntries');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMoments(parsed);
        syncAll(parsed);
      } else {
        setMoments(DEFAULT_MOMENTS);
        localStorage.setItem('momentsEntries', JSON.stringify(DEFAULT_MOMENTS));
        syncAll(DEFAULT_MOMENTS);
      }
    }
  }, []);

  const save = (list) => {
    setMoments(list);
    localStorage.setItem('momentsEntries', JSON.stringify(list));
  };

  const toggleFav = (id) => {
    const m = moments.find(x => x.id === id);
    if (!m) return;
    const newFav = !m.favorite;
    const next = moments.map(x => x.id===id ? {...x, favorite:newFav} : x);
    save(next);
    if (showDetail?.id === id) setShowDetail(next.find(x => x.id===id));
    const token = localStorage.getItem('loversappToken');
    if (token) api.updateMoment(id, { favorite: newFav }).catch(() => {});
  };

  const deleteMoment = (id) => {
    save(moments.filter(m => m.id!==id));
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
          title: form.title.trim(),
          description: form.note.trim(),
          date: form.date,
          image: form.image.trim() || '✨',
        });
        // POST returns { id, ok } — build the local object from form data
        m = {
          id: created.id,
          date: form.date,
          title: form.title.trim(),
          note: form.note.trim(),
          favorite: false,
          image: form.image.trim() || '✨',
        };
      } catch {
        m = { id:Date.now(), date:form.date, title:form.title.trim(), note:form.note.trim(), favorite:false, image:form.image.trim()||'✨' };
      }
    } else {
      m = { id:Date.now(), date:form.date, title:form.title.trim(), note:form.note.trim(), favorite:false, image:form.image.trim()||'✨' };
    }
    const next = [m, ...moments];
    save(next);
    upsertCalendarEvent({ title:`Momento: ${m.title}`, description:m.note, dateStr:m.date, sourceType:'moment', sourceId:m.id });
    upsertTimelineEvent({ title:m.title, description:m.note, dateStr:m.date, image:m.image, sourceType:'moment', sourceId:m.id });
    setShowModal(false);
    setForm({ title:'', date:'', note:'', image:'✨' });
    toast({ title:'Momento guardado ✦', description:'Añadido al calendario y línea del tiempo.' });
  };

  const totalDays  = daysDiff(userData?.relationshipStartDate);
  const favCount   = moments.filter(m=>m.favorite).length;
  const groups     = groupByMonth(moments);

  return (
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden', paddingBottom:88, fontFamily:"'Lora',Georgia,serif" }}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div style={{ padding:'48px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${D.border}`, background:D.cream, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={() => navigateTo('dashboard')}
          style={{ width:36, height:36, borderRadius:'50%', background:'transparent', border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={18} color={D.wine} />
        </button>
        <div style={{ textAlign:'center' }}>
          <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine }}>Memoria</div>
          <div className="caveat" style={{ fontSize:11, color:D.muted, letterSpacing:1 }}>Momentos especiales</div>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ width:36, height:36, borderRadius:'50%', background:D.coral, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <Plus size={17} color={D.white} />
        </button>
      </div>

      <div style={{ padding:'20px 20px 0', position:'relative', zIndex:1 }}>

        {/* ── STATS STRIP ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          style={{ background:D.wine, borderRadius:20, padding:'18px 20px', display:'flex', justifyContent:'space-around', alignItems:'center', marginBottom:24, position:'relative', overflow:'hidden' }}>
          <svg style={{ position:'absolute', right:6, top:2, opacity:0.07 }} width="70" height="60" viewBox="0 0 70 60">
            <text x="0" y="50" fontSize="60" fill="#F0C4CC">♡</text>
          </svg>
          {[
            { val: totalDays ?? '—', sub: 'días juntos' },
            { val: moments.length,   sub: 'recuerdos' },
            { val: favCount,         sub: 'especiales', star:true },
          ].reduce((acc, item, i) => {
            if (i>0) acc.push(<div key={`d${i}`} style={{ width:0.5, height:36, background:'rgba(240,196,204,0.18)' }}/>);
            acc.push(
              <div key={i} style={{ textAlign:'center', flex:1 }}>
                <div className="caveat" style={{ fontSize:26, fontWeight:700, color:item.star?D.gold:D.blush, lineHeight:1 }}>{item.val}</div>
                <div className="caveat" style={{ fontSize:11, color:'rgba(240,196,204,0.5)', marginTop:3 }}>{item.sub}</div>
              </div>
            );
            return acc;
          }, [])}
        </motion.div>

        {/* ── EMPTY STATE ───────────────────────────────────────────── */}
        {moments.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📷</div>
            <p className="lora" style={{ color:D.muted, fontSize:16 }}>Guarda tus primeros recuerdos</p>
          </div>
        )}

        {/* ── TIMELINE ──────────────────────────────────────────────── */}
        {groups.map((g, gi) => (
          <motion.div key={gi} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:gi*0.06 }} style={{ marginBottom:28 }}>
            {/* Month header */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <span className="caveat" style={{ fontSize:13, fontWeight:700, color:D.muted, textTransform:'uppercase', letterSpacing:'0.10em', flexShrink:0 }}>{g.label}</span>
              <div style={{ flex:1, height:1, background:`repeating-linear-gradient(90deg,${D.border} 0,${D.border} 5px,transparent 5px,transparent 10px)` }}/>
            </div>
            {/* Timeline entries */}
            {g.items.map((m, mi) => (
              <div key={m.id} style={{ display:'flex', gap:12, marginBottom:16, position:'relative' }}>
                {/* Vertical dotted line */}
                {mi < g.items.length-1 && (
                  <div style={{ position:'absolute', left:12, top:28, bottom:-8, width:1.5,
                    background:`repeating-linear-gradient(to bottom,${D.border} 0,${D.border} 5px,transparent 5px,transparent 10px)` }}/>
                )}
                <NodeIcon moment={m} />
                {/* Card */}
                <motion.div whileTap={{ scale:0.98 }} onClick={() => setShowDetail(m)} style={{ flex:1, background:D.white, borderRadius:16, border:`1.5px solid ${D.border}`, borderLeft:`3.5px solid ${m.favorite?D.coral:D.gold}`, padding:'12px 14px', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div className="lora" style={{ fontSize:15, fontWeight:600, color:D.wine, marginBottom:2, lineHeight:1.3 }}>{m.title}</div>
                      <div className="caveat" style={{ fontSize:12, color:D.muted }}>{formatDate(m.date)}</div>
                      {m.note && <div style={{ fontSize:13, color:'#5A4A42', marginTop:6, lineHeight:1.5 }}>{m.note}</div>}
                    </div>
                    {m.image && (
                      <div style={{ width:44, height:44, borderRadius:10, background:'#F5EDE4', border:`1px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{m.image}</div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <button onClick={e => { e.stopPropagation(); toggleFav(m.id); }}
                      style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:100, background: m.favorite ? '#FEE8ED' : '#F5EEE8', border: m.favorite ? `1px solid ${D.coral}` : `1px solid ${D.border}`, cursor:'pointer' }}>
                      <Heart size={12} fill={m.favorite ? D.coral : 'none'} color={m.favorite ? D.coral : D.muted} />
                      <span className="caveat" style={{ fontSize:11, color:m.favorite?D.coral:D.muted, fontWeight:700 }}>{m.favorite?'Favorita':'Me gusta'}</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* ── DETAIL MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDetail && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(28,14,16,0.6)', zIndex:100, display:'flex', alignItems:'flex-end' }}
            onClick={() => setShowDetail(null)}>
            <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
              onClick={e => e.stopPropagation()}
              style={{ background:D.cream, borderRadius:'24px 24px 0 0', padding:24, width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine }}>{showDetail.title}</div>
                <button onClick={() => setShowDetail(null)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color={D.muted}/></button>
              </div>
              <div className="caveat" style={{ color:D.muted, fontSize:13, marginBottom:10 }}>{formatDate(showDetail.date)}</div>
              {showDetail.image && <div style={{ fontSize:48, marginBottom:12 }}>{showDetail.image}</div>}
              {showDetail.note && <p style={{ color:'#5A4A42', lineHeight:1.65 }}>{showDetail.note}</p>}
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button onClick={() => toggleFav(showDetail.id)}
                  style={{ flex:1, padding:'11px', borderRadius:14, background: showDetail.favorite?D.coral:'transparent', border:`1.5px solid ${showDetail.favorite?D.coral:D.border}`, cursor:'pointer' }}>
                  <span className="caveat" style={{ fontWeight:700, fontSize:15, color:showDetail.favorite?D.white:D.muted }}>
                    {showDetail.favorite ? '♥ Favorita' : '♡ Añadir favorita'}
                  </span>
                </button>
                <button onClick={() => deleteMoment(showDetail.id)}
                  style={{ padding:'11px 16px', borderRadius:14, background:'transparent', border:`1.5px solid #E05060`, cursor:'pointer' }}>
                  <Trash2 size={17} color="#E05060"/>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADD MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(28,14,16,0.6)', zIndex:100, display:'flex', alignItems:'flex-end' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
              onClick={e => e.stopPropagation()}
              style={{ background:D.cream, borderRadius:'24px 24px 0 0', padding:24, width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine }}>Nuevo Recuerdo</div>
                <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color={D.muted}/></button>
              </div>
              <form onSubmit={handleAdd}>
                {[
                  { label:'Título *',     field:'title', type:'text',     ph:'Ej. Nuestro primer viaje' },
                  { label:'Fecha *',      field:'date',  type:'date',     ph:'' },
                  { label:'Nota',        field:'note',  type:'textarea', ph:'¿Qué pasó ese día?' },
                  { label:'Emoji / imagen', field:'image', type:'text',   ph:'✨' },
                ].map(({ label, field, type, ph }) => (
                  <div key={field} style={{ marginBottom:16 }}>
                    <label className="caveat" style={{ fontSize:13, fontWeight:700, color:D.wine, display:'block', marginBottom:6 }}>{label}</label>
                    {type === 'textarea' ? (
                      <textarea value={form[field]} onChange={e => setForm(p=>({...p,[field]:e.target.value}))}
                        placeholder={ph} rows={3}
                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, fontFamily:'inherit', resize:'none', outline:'none', boxSizing:'border-box' }}/>
                    ) : (
                      <input type={type} value={form[field]} onChange={e => setForm(p=>({...p,[field]:e.target.value}))}
                        placeholder={ph}
                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
                    )}
                  </div>
                ))}
                <button type="submit"
                  style={{ width:'100%', padding:'14px', borderRadius:16, background:D.wine, color:D.white, border:'none', cursor:'pointer' }}>
                  <span className="caveat" style={{ fontSize:17, fontWeight:700 }}>Guardar Recuerdo ✦</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
