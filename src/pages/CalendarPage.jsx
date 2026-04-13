import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { upsertCountdownEvent } from '@/lib/eventSync';
import { api } from '@/lib/api';

// ── palette ───────────────────────────────────────────────────────────────────
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
  select, input, textarea { font-family: 'Caveat', cursive; }
  select:focus, input:focus, textarea:focus { outline: none; }
  ::-webkit-scrollbar { display: none; }
`;

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_LABELS  = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

// ── BgDoodles ─────────────────────────────────────────────────────────────────
function BgDoodles() {
  return (
    <svg style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.22 }} viewBox="0 0 390 820" fill="none">
      <text x="355" y="90"  fontSize="12" fill="#D4A520" fontFamily="serif">✦</text>
      <text x="20"  y="160" fontSize="9"  fill="#C44455" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18"  y="500" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <circle cx="30" cy="260" r="8" fill="none" stroke="#D4A520" strokeWidth="1.5"/>
      <ellipse cx="30" cy="260" rx="13" ry="4" fill="none" stroke="#D4A520" strokeWidth="1.5" transform="rotate(-25 30 260)"/>
    </svg>
  );
}

function getEventPhotos(event) {
  if (!event) return [];
  if (event.sourceType === 'date' && event.sourceId) {
    try {
      const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
      const match = dates.find(d => Number(d.id) === Number(event.sourceId));
      if (match) return [...(match.danielaPhotos || []), ...(match.eduardoPhotos || [])];
    } catch {}
  }
  if (event.photo) return [event.photo];
  return [];
}

export default function CalendarPage({ navigateTo }) {
  const [currentDate,         setCurrentDate]         = useState(new Date());
  const [events,              setEvents]              = useState([]);
  const [showAddModal,        setShowAddModal]        = useState(false);
  const [selectedDay,         setSelectedDay]         = useState(null);
  const [showDaySheet,        setShowDaySheet]        = useState(false);
  const [showGallery,         setShowGallery]         = useState(null); // event obj
  const [photoIndex,          setPhotoIndex]          = useState(0);
  const [sortBy,              setSortBy]              = useState('newest');
  const [filterMonth,         setFilterMonth]         = useState('all');
  const [form,                setForm]                = useState({ title:'', description:'', photo:null, preview:null, sharedWith:'mine' });
  const [showCountdownPrompt, setShowCountdownPrompt] = useState(false);
  const [pendingEvent,        setPendingEvent]        = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('calendarEvents');
    const local = saved ? JSON.parse(saved) : [];
    setEvents(local);
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getCalendar().then(rows => {
        const apiEvs = rows.map(r => {
          const [y, m, d] = (r.date || '').split('-').map(Number);
          return {
            id: `api-${r.id}`,
            apiId: r.id,
            dateKey: y ? `${y}-${m - 1}-${d}` : '',
            date: d || 0,
            title: r.title,
            description: r.description || '',
            photo: null,
            createdAt: r.created_at || '',
            sharedFromPartner: r.source_type === 'shared-from-partner',
          };
        });
        setEvents(prev => {
          const localApiIds = new Set(prev.filter(e => e.apiId).map(e => String(e.apiId)));
          const newApiEvs = apiEvs.filter(e => !localApiIds.has(String(e.apiId)));
          return newApiEvs.length ? [...prev, ...newApiEvs] : prev;
        });
      }).catch(() => {});
    }
  }, []);

  const saveEvents = (list) => {
    setEvents(list);
    localStorage.setItem('calendarEvents', JSON.stringify(list));
  };

  // ── calendar helpers ───────────────────────────────────────────────────────
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const days = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const eventsForDay = (day) => {
    const key = `${year}-${month}-${day}`;
    return events.filter(e => e.dateKey === key);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  // ── add event ─────────────────────────────────────────────────────────────
  const openAdd = (day) => {
    setSelectedDay(day);
    setForm({ title:'', description:'', photo:null, preview:null, sharedWith:'mine' });
    setShowDaySheet(false);
    setShowAddModal(true);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(p => ({ ...p, photo:reader.result, preview:reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title:'Falta el título', description:'Escribe un nombre para el evento.' }); return;
    }
    const ev = {
      id: Date.now(),
      dateKey: `${year}-${month}-${selectedDay}`,
      date: selectedDay,
      title: form.title.trim(),
      description: form.description.trim(),
      photo: form.photo,
      createdAt: new Date().toISOString(),
      shared: form.sharedWith === 'both',
    };
    saveEvents([...events, ev]);
    const token = localStorage.getItem('loversappToken');
    if (token && form.sharedWith === 'both') {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
      api.createCalendarEvent({ title: ev.title, date: dateStr, type: 'custom', source_type: 'calendar-app', shared: true })
        .then(res => {
          if (res?.id) {
            setEvents(prev => {
              const upd = prev.map(e => e.id === ev.id ? { ...e, apiId: res.id } : e);
              localStorage.setItem('calendarEvents', JSON.stringify(upd));
              return upd;
            });
          }
        }).catch(() => {});
    }
    setShowAddModal(false);
    setPendingEvent(ev);
    setShowCountdownPrompt(true);
  };

  const addCountdownFromEvent = (ev) => {
    const t = ev.title.toLowerCase();
    const emoji = t.includes('cumpleaños') ? '🎂'
      : t.includes('aniversario') ? '💞'
      : t.includes('cita') ? '💖'
      : t.includes('viaje') ? '✈️'
      : '📅';
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(ev.date).padStart(2,'0')}`;
    upsertCountdownEvent({ title: ev.title, dateStr, emoji, sourceType:'calendar', sourceId: ev.id });
    toast({ title:'Countdown creado ✦', description:`"${ev.title}" ya aparece en Countdowns.` });
    setShowCountdownPrompt(false);
    setPendingEvent(null);
  };

  const dismissCountdownPrompt = () => {
    if (pendingEvent) toast({ title:'Evento guardado ✦', description:`${pendingEvent.title} · ${pendingEvent.date} de ${MONTH_NAMES[month]}` });
    setShowCountdownPrompt(false);
    setPendingEvent(null);
  };

  const deleteEvent = (id) => {
    const ev = events.find(e => e.id === id);
    saveEvents(events.filter(e => e.id !== id));
    toast({ title:'Evento eliminado' });
    if (ev?.apiId) {
      const token = localStorage.getItem('loversappToken');
      if (token) api.deleteCalendarEvent(ev.apiId).catch(() => {});
    }
  };

  // ── filtered list ─────────────────────────────────────────────────────────
  const listEvents = events
    .filter(e => filterMonth === 'all' || parseInt(e.dateKey.split('-')[1]) === parseInt(filterMonth))
    .sort((a,b) => sortBy === 'newest'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt));

  const uniqueMonths = [...new Set(events.map(e => parseInt(e.dateKey.split('-')[1])))].sort((a,b)=>a-b);

  return (
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden', paddingBottom:88, fontFamily:"'Lora',Georgia,serif" }}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div style={{ padding:'48px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1.5px solid ${D.border}`, background:D.cream, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={() => navigateTo('dashboard')}
          style={{ width:38, height:38, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{ textAlign:'center' }}>
          <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine, letterSpacing:1 }}>Calendario</div>
          <div className="caveat" style={{ fontSize:11, color:D.muted, letterSpacing:1 }}>Eventos & momentos</div>
        </div>
        <button onClick={() => selectedDay && openAdd(selectedDay)}
          style={{ width:38, height:38, borderRadius:'50%', background:D.coral, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity: selectedDay?1:0.4 }}>
          <Plus size={17} color={D.white}/>
        </button>
      </div>

      <div style={{ padding:'20px 20px 0', position:'relative', zIndex:1 }}>

        {/* ── MONTH NAV ─────────────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <button onClick={prevMonth}
            style={{ width:36, height:36, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <ChevronLeft size={16} color={D.wine}/>
          </button>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <select value={month} onChange={e => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
              className="caveat" style={{ padding:'6px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, fontWeight:700, color:D.wine, cursor:'pointer' }}>
              {MONTH_NAMES.map((m,i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
              className="caveat" style={{ padding:'6px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, fontWeight:700, color:D.wine, cursor:'pointer' }}>
              {Array.from({length:10},(_,i) => year - 4 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={nextMonth}
            style={{ width:36, height:36, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <ChevronRight size={16} color={D.wine}/>
          </button>
        </div>

        {/* ── CALENDAR GRID ─────────────────────────────────────────── */}
        <div style={{ background:D.white, borderRadius:20, border:`1.5px solid ${D.border}`, padding:'16px 12px', marginBottom:22 }}>
          {/* Day labels */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8 }}>
            {DAY_LABELS.map(d => (
              <div key={d} className="caveat" style={{ textAlign:'center', fontSize:12, fontWeight:700, color:D.muted, padding:'4px 0' }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
            {days.map((day, idx) => {
              if (!day) return <div key={idx}/>;
              const dayEvs = eventsForDay(day);
              const hasEvs = dayEvs.length > 0;
              const isSelected = selectedDay === day;
              const hasBday = dayEvs.some(e => e.title?.toLowerCase().includes('cumpleaños'));
              return (
                <motion.button key={idx} whileTap={{ scale:0.9 }}
                  onClick={() => {
                    setSelectedDay(day);
                    if (hasEvs) setShowDaySheet(true);
                    else openAdd(day);
                  }}
                  style={{ aspectRatio:'1', borderRadius:12, border:`1.5px solid ${isSelected ? D.coral : hasEvs ? D.coral+'88' : D.border}`,
                    background: isSelected ? D.coral : hasEvs ? '#FEE8EC' : D.cream,
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', position:'relative', padding:0 }}>
                  {hasBday && <span style={{ position:'absolute', top:1, right:2, fontSize:9 }}>🥳</span>}
                  <span className="caveat" style={{ fontSize:14, fontWeight:700, color: isSelected?D.white : hasEvs?D.coral : D.wine, lineHeight:1 }}>{day}</span>
                  {hasEvs && !isSelected && (
                    <div style={{ width:5, height:5, borderRadius:'50%', background:D.coral, marginTop:2 }}/>
                  )}
                  {hasEvs && isSelected && (
                    <span className="caveat" style={{ fontSize:9, color:'rgba(255,255,255,0.8)', lineHeight:1 }}>{dayEvs.length}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── EVENTS LIST ───────────────────────────────────────────── */}
        <div>
          {/* List header + filters */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span className="caveat" style={{ fontSize:15, fontWeight:700, color:D.wine, position:'relative', display:'inline-block' }}>
              Todos los eventos
              <span style={{ position:'absolute', bottom:-2, left:-2, width:'calc(100% + 4px)', height:3, background:D.gold, borderRadius:2, transform:'rotate(-0.7deg)' }}/>
            </span>
            <div style={{ flex:1, height:1.5, background:`repeating-linear-gradient(90deg,${D.border} 0,${D.border} 6px,transparent 6px,transparent 12px)` }}/>
            <span className="caveat" style={{ fontSize:12, color:D.coral, fontWeight:700 }}>{listEvents.length} ✦</span>
          </div>

          {/* Filters row */}
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="caveat" style={{ flex:1, padding:'7px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:13, fontWeight:700, color:D.wine, cursor:'pointer' }}>
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className="caveat" style={{ flex:1, padding:'7px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:13, fontWeight:700, color:D.wine, cursor:'pointer' }}>
              <option value="all">Todos los meses</option>
              {uniqueMonths.map(m => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
            </select>
          </div>

          {listEvents.length === 0 && (
            <div style={{ textAlign:'center', padding:'36px 0' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📅</div>
              <p className="lora" style={{ color:D.muted }}>No hay eventos aún</p>
              <p className="caveat" style={{ color:D.muted, fontSize:13, marginTop:4 }}>Toca un día del calendario para agregar uno</p>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {listEvents.map(ev => {
              const [y,m] = ev.dateKey.split('-');
              const photos = getEventPhotos(ev);
              return (
                <motion.div key={ev.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  style={{ background:D.white, borderRadius:18, border:`1.5px solid ${D.border}`, borderLeft:`4px solid ${D.coral}`, overflow:'hidden', cursor:'pointer' }}
                  onClick={() => ev.photo || photos.length ? (setShowGallery(ev), setPhotoIndex(0)) : null}>
                  {ev.photo && (
                    <div style={{ height:90, overflow:'hidden' }}>
                      <img src={ev.photo} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    </div>
                  )}
                  <div style={{ padding:'12px 14px' }}>
                    <div className="caveat" style={{ fontSize:11, color:D.muted, marginBottom:3 }}>
                      {ev.date} de {MONTH_NAMES[parseInt(m)]} {y}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginTop:2 }}>
                      <div className="lora" style={{ fontSize:14, fontWeight:600, color:D.wine, lineHeight:1.3 }}>{ev.title}</div>
                      {ev.sharedFromPartner && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${D.blue}18`, border:`1px solid ${D.blue}44`, color:D.blue, fontFamily:'Caveat,cursive', fontWeight:700 }}>👫 Pareja</span>}
                      {ev.shared && !ev.sharedFromPartner && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${D.green}18`, border:`1px solid ${D.green}44`, color:D.green, fontFamily:'Caveat,cursive', fontWeight:700 }}>👫 Compartido</span>}
                    </div>
                    {ev.description && (
                      <div style={{ fontSize:12, color:'#5A4A42', marginTop:4, lineHeight:1.5,
                        overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                        {ev.description}
                      </div>
                    )}
                    {photos.length > 0 && (
                      <span className="caveat" style={{ fontSize:11, color:D.blue, marginTop:6, display:'block' }}>
                        📷 {photos.length} foto{photos.length>1?'s':''} · toca para ver
                      </span>
                    )}
                    <button onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                      style={{ marginTop:10, display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:10, background:'#FEE8EC', border:`1px solid ${D.coral}33`, cursor:'pointer' }}>
                      <Trash2 size={12} color={D.coral}/>
                      <span className="caveat" style={{ fontSize:12, color:D.coral, fontWeight:700 }}>Eliminar</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DAY DETAIL SHEET ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDaySheet && selectedDay && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(28,14,16,0.6)', zIndex:100, display:'flex', alignItems:'flex-end' }}
            onClick={() => setShowDaySheet(false)}>
            <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
              onClick={e => e.stopPropagation()}
              style={{ background:D.cream, borderRadius:'24px 24px 0 0', padding:24, width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div>
                  <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine }}>
                    {selectedDay} de {MONTH_NAMES[month]}
                  </div>
                  <div className="caveat" style={{ fontSize:13, color:D.muted }}>{eventsForDay(selectedDay).length} evento{eventsForDay(selectedDay).length!==1?'s':''}</div>
                </div>
                <button onClick={() => setShowDaySheet(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color={D.muted}/></button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
                {eventsForDay(selectedDay).map(ev => {
                  const photos = getEventPhotos(ev);
                  return (
                    <div key={ev.id} style={{ background:D.white, borderRadius:16, border:`1.5px solid ${D.border}`, borderLeft:`4px solid ${D.coral}`, overflow:'hidden' }}>
                      {ev.photo && (
                        <img src={ev.photo} alt={ev.title} style={{ width:'100%', height:120, objectFit:'cover' }}/>
                      )}
                      <div style={{ padding:'12px 14px' }}>
                        <div className="lora" style={{ fontSize:15, fontWeight:600, color:D.wine, marginBottom:4 }}>{ev.title}</div>
                        {ev.description && <p style={{ fontSize:13, color:'#5A4A42', lineHeight:1.5, marginBottom:8 }}>{ev.description}</p>}
                        {photos.length > 0 && (
                          <button onClick={() => { setShowGallery(ev); setPhotoIndex(0); setShowDaySheet(false); }}
                            className="caveat" style={{ padding:'6px 14px', borderRadius:10, background:D.wine, color:D.white, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, marginBottom:8 }}>
                            Ver galería ({photos.length})
                          </button>
                        )}
                        <button onClick={() => deleteEvent(ev.id)}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:10, background:'#FEE8EC', border:`1px solid ${D.coral}33`, cursor:'pointer' }}>
                          <Trash2 size={12} color={D.coral}/>
                          <span className="caveat" style={{ fontSize:12, color:D.coral, fontWeight:700 }}>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => openAdd(selectedDay)}
                style={{ width:'100%', padding:'13px', borderRadius:16, background:D.wine, color:D.white, border:'none', cursor:'pointer' }}>
                <span className="caveat" style={{ fontSize:16, fontWeight:700 }}>+ Agregar otro evento</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADD EVENT SHEET ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(28,14,16,0.6)', zIndex:100, display:'flex', alignItems:'flex-end' }}
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:80, opacity:0 }}
              onClick={e => e.stopPropagation()}
              style={{ background:D.cream, borderRadius:'24px 24px 0 0', padding:24, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine }}>Nuevo Evento</div>
                  <div className="caveat" style={{ fontSize:13, color:D.muted }}>{selectedDay} de {MONTH_NAMES[month]}</div>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20} color={D.muted}/></button>
              </div>

              <form onSubmit={handleSave}>
                {[
                  { label:'Título *', field:'title',       type:'text',     ph:'Ej. Cita especial' },
                  { label:'Descripción', field:'description', type:'textarea', ph:'Detalles del evento...' },
                ].map(({ label, field, type, ph }) => (
                  <div key={field} style={{ marginBottom:16 }}>
                    <label className="caveat" style={{ fontSize:13, fontWeight:700, color:D.wine, display:'block', marginBottom:6 }}>{label}</label>
                    {type === 'textarea' ? (
                      <textarea value={form[field]} onChange={e => setForm(p=>({...p,[field]:e.target.value}))}
                        placeholder={ph} rows={3}
                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, resize:'none', boxSizing:'border-box' }}/>
                    ) : (
                      <input type="text" value={form[field]} onChange={e => setForm(p=>({...p,[field]:e.target.value}))}
                        placeholder={ph}
                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, boxSizing:'border-box' }}/>
                    )}
                  </div>
                ))}

                {/* Visibility */}
                <div style={{ marginBottom:16 }}>
                  <label className="caveat" style={{ fontSize:13, fontWeight:700, color:D.wine, display:'block', marginBottom:8 }}>¿Para quién?</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[{val:'mine',label:'👤 Solo para mí'},{val:'both',label:'👫 Para los dos'}].map(({val,label}) => (
                      <button key={val} type="button" onClick={() => setForm(p => ({...p, sharedWith:val}))}
                        style={{ flex:1, padding:'10px', borderRadius:12, cursor:'pointer',
                          border:`1.5px solid ${form.sharedWith===val ? D.coral : D.border}`,
                          background: form.sharedWith===val ? '#FEE8EC' : D.white }}>
                        <span className="caveat" style={{ fontSize:13, fontWeight:700, color: form.sharedWith===val ? D.coral : D.muted }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo */}
                <div style={{ marginBottom:16 }}>
                  <label className="caveat" style={{ fontSize:13, fontWeight:700, color:D.wine, display:'block', marginBottom:6 }}>Foto (opcional)</label>
                  <input type="file" accept="image/*" onChange={handlePhoto} id="cal-photo" style={{ display:'none' }}/>
                  <label htmlFor="cal-photo"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:12, border:`1.5px dashed ${D.border}`, cursor:'pointer', background:D.white }}>
                    <ImageIcon size={16} color={D.muted}/>
                    <span className="caveat" style={{ fontSize:13, color:D.muted, fontWeight:600 }}>
                      {form.preview ? 'Cambiar foto' : 'Seleccionar foto'}
                    </span>
                  </label>
                </div>

                {form.preview && (
                  <div style={{ position:'relative', borderRadius:14, overflow:'hidden', marginBottom:16, border:`1.5px solid ${D.border}` }}>
                    <img src={form.preview} alt="preview" style={{ width:'100%', height:120, objectFit:'cover' }}/>
                    <button type="button" onClick={() => setForm(p=>({...p,photo:null,preview:null}))}
                      style={{ position:'absolute', top:8, right:8, width:28, height:28, borderRadius:'50%', background:D.coral, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <X size={13} color={D.white}/>
                    </button>
                  </div>
                )}

                <div style={{ display:'flex', gap:10, paddingTop:4 }}>
                  <button type="button" onClick={() => setShowAddModal(false)}
                    style={{ flex:1, padding:'13px', borderRadius:16, background:D.white, border:`1.5px solid ${D.border}`, cursor:'pointer' }}>
                    <span className="caveat" style={{ fontSize:15, fontWeight:700, color:D.muted }}>Cancelar</span>
                  </button>
                  <button type="submit"
                    style={{ flex:2, padding:'13px', borderRadius:16, background:D.wine, border:'none', cursor:'pointer' }}>
                    <span className="caveat" style={{ fontSize:16, fontWeight:700, color:D.white }}>Guardar Evento ✦</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COUNTDOWN PROMPT ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCountdownPrompt && pendingEvent && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(28,14,16,0.6)',zIndex:110,display:'flex',alignItems:'flex-end'}}
            onClick={dismissCountdownPrompt}>
            <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{background:D.cream,borderRadius:'24px 24px 0 0',padding:'28px 24px',width:'100%'}}>
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{fontSize:42,marginBottom:10}}>⏰</div>
                <div className="lora" style={{fontSize:18,fontWeight:600,color:D.wine,marginBottom:8}}>¿Agregar Countdown?</div>
                <p className="caveat" style={{fontSize:15,color:D.muted,lineHeight:1.5}}>
                  ¿Quieres que te avisemos cuántos días faltan para <strong style={{color:D.wine}}>"{pendingEvent.title}"</strong>?
                </p>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={dismissCountdownPrompt}
                  style={{flex:1,padding:'13px',borderRadius:16,background:D.white,border:`1.5px solid ${D.border}`,cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:15,fontWeight:700,color:D.muted}}>No, gracias</span>
                </button>
                <button onClick={() => addCountdownFromEvent(pendingEvent)}
                  style={{flex:2,padding:'13px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Sí, agregar ✦</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GALLERY SHEET ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGallery && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(28,14,16,0.92)', zIndex:110, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}
            onClick={() => setShowGallery(null)}>
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:430 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div className="lora" style={{ color:D.white, fontSize:18, fontWeight:600 }}>{showGallery.title}</div>
                <button onClick={() => setShowGallery(null)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={22} color={D.white}/></button>
              </div>
              {getEventPhotos(showGallery).length > 0 ? (
                <>
                  <img src={getEventPhotos(showGallery)[photoIndex]} alt=""
                    style={{ width:'100%', maxHeight:'60vh', objectFit:'contain', borderRadius:18, border:`1.5px solid ${D.gold}` }}/>
                  {getEventPhotos(showGallery).length > 1 && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:14 }}>
                      <button onClick={() => setPhotoIndex(p => (p - 1 + getEventPhotos(showGallery).length) % getEventPhotos(showGallery).length)}
                        style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <ChevronLeft size={18} color={D.white}/>
                      </button>
                      <span className="caveat" style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>
                        {photoIndex+1} / {getEventPhotos(showGallery).length}
                      </span>
                      <button onClick={() => setPhotoIndex(p => (p + 1) % getEventPhotos(showGallery).length)}
                        style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <ChevronRight size={18} color={D.white}/>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="caveat" style={{ color:'rgba(255,255,255,0.5)', textAlign:'center', padding:'40px 0' }}>No hay fotos</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
