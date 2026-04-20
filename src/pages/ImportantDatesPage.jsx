import React, { useEffect, useState } from 'react';
import { Plus, Bell, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { upsertCalendarEvent, removeCalendarEventBySource } from '@/lib/eventSync';
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

const TYPE_ICONS = { birthday:'🎂', anniversary:'💕', other:'📌' };
const TYPE_ACCENTS = { birthday:D.blue, anniversary:D.coral, other:D.gold };

export default function ImportantDatesPage({ navigateTo }) {
  const defaultDates = [
    { id:1, title:'Aniversario', date:'2026-02-14', description:'2 años juntos', icon:'💕', type:'anniversary', sourceType:undefined },
    { id:2, title:'Cumpleaños de Eduardo', date:'2026-03-25', description:'¡Sorpresa especial!', icon:'🎂', type:'birthday', sourceType:undefined }
  ];

  const [dates, setDates] = useState([]);
  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingSourceType, setEditingSourceType] = useState(null);
  const [formData, setFormData] = useState({ title:'', date:'', description:'', type:'birthday' });

  const parseDateParts = (s) => {
    if (!s) return null;
    const [y,m,d] = s.split('-').map(Number);
    return (!y||!m||!d) ? null : { year:y, month:m, day:d };
  };

  const formatLocalDate = (s) => {
    const p = parseDateParts(s);
    if (!p) return '';
    return new Date(p.year, p.month-1, p.day).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  };

  const ensureBirthdays = (items) => {
    const ud = JSON.parse(localStorage.getItem('loversappUser')||'{}');
    const now = new Date();
    const normalize = (s) => {
      const p = parseDateParts(s); if (!p) return null;
      const n = new Date(now.getFullYear(), p.month-1, p.day);
      return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
    };
    let out = [...items];
    const addOrUpdate = (srcType, title, dateStr) => {
      const nd = normalize(dateStr); if (!nd) return;
      const ex = out.find(i => i.sourceType === srcType);
      const base = { title, date:nd, description:'Cumpleaños', type:'birthday', icon:'🎂', sourceType:srcType };
      if (ex) out = out.map(i => i.sourceType===srcType ? {...i,...base} : i);
      else out = [{ id:Date.now(), ...base }, ...out];
    };
    const ub = ud.personalityTest?.birthDate||ud.birthDate;
    const pb = ud.personalityTest?.partnerBirthDate||ud.partnerBirthDate;
    if (ub) addOrUpdate('user-birthday', ud.name?`Cumpleaños de ${ud.name.trim()}`:'Tu cumpleaños', ub);
    if (pb) addOrUpdate('partner-birthday', ud.partner?`Cumpleaños de ${ud.partner.trim()}`:'Cumpleaños de tu pareja', pb);
    return out;
  };

  const syncAll = (items) => {
    items.forEach(item => {
      if (!item?.id) return;
      upsertCalendarEvent({ title:`${item.type==='birthday'?'Cumpleaños':item.type==='anniversary'?'Aniversario':'Fecha'}: ${item.title}`, description:item.description||'Fecha importante', dateStr:item.date, sourceType:'important-date', sourceId:item.id });
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('importantDates');
    const base = saved ? JSON.parse(saved) : defaultDates;
    const synced = ensureBirthdays(base);
    setDates(synced);
    localStorage.setItem('importantDates', JSON.stringify(synced));
    syncAll(synced);
  }, []);

  const getNextOccurrence = (dateStr, type) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const p = parseDateParts(dateStr); if (!p) return null;
    if (type==='birthday'||type==='anniversary') {
      const n = new Date(today.getFullYear(), p.month-1, p.day);
      if (n < today) n.setFullYear(n.getFullYear()+1);
      return n;
    }
    return new Date(p.year, p.month-1, p.day);
  };

  const getDaysUntil = (dateStr, type) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const n = getNextOccurrence(dateStr, type); if (!n) return null;
    return Math.ceil((n-today)/(1000*60*60*24));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()||!formData.date) { toast({title:'Faltan datos',description:'Agrega título y fecha.'}); return; }
    const base = { title:formData.title.trim(), date:formData.date, description:formData.description.trim(), type:formData.type, icon:TYPE_ICONS[formData.type]||'📌', sourceType:editingSourceType||undefined };
    const updated = editingId ? dates.map(i => i.id===editingId ? {...i,...base} : i) : [{ id:Date.now(), ...base }, ...dates];
    const saved = editingId ? updated.find(i => i.id===editingId) : updated[0];
    setDates(updated);
    localStorage.setItem('importantDates', JSON.stringify(updated));
    upsertCalendarEvent({ title:`${saved.type==='birthday'?'Cumpleaños':saved.type==='anniversary'?'Aniversario':'Fecha'}: ${saved.title}`, description:saved.description||'Fecha importante', dateStr:saved.date, sourceType:'important-date', sourceId:saved.id });
    setShowSheet(false); setEditingId(null); setEditingSourceType(null);
    setFormData({title:'',date:'',description:'',type:'birthday'});
  };

  const handleEdit = (item) => {
    setEditingId(item.id); setEditingSourceType(item.sourceType||null);
    setFormData({title:item.title, date:item.date, description:item.description||'', type:item.type||'birthday'});
    setShowSheet(true);
  };

  const handleDelete = (id) => {
    const updated = dates.filter(i => i.id!==id);
    setDates(updated); localStorage.setItem('importantDates', JSON.stringify(updated));
    removeCalendarEventBySource('important-date', id);
  };

  const upcoming = dates.filter(d => { const dl=getDaysUntil(d.date,d.type); return dl!=null&&dl<=30&&dl>=0; });

  return (
    <PageLayout>
      <PageHeader
        breadcrumb="Fechas Importantes"
        title="Fechas Importantes"
        icon="/images/fechas-especiales.png"
        subtitle={`${dates.length} fechas guardadas 💕`}
        action={
          <button onClick={() => setShowSheet(true)}
            style={{ width:32, height:32, borderRadius:'50%', background:D.coral, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'3px 3px 0 rgba(196,68,100,0.28)', flexShrink:0 }}>
            <Plus size={16} color={D.white} strokeWidth={2.5}/>
          </button>
        }
      />

      <div style={{ padding:'18px' }}>
        {/* Upcoming strip */}
        {upcoming.length > 0 && (
          <div style={{ background:D.wine, borderRadius:18, padding:'14px 16px', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <img src="/images/recordatorios.png" alt="" style={{ width:16, height:16, objectFit:'contain' }}/>
              <span className="caveat" style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:700 }}>Próximamente (30 días)</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {upcoming.map(d => (
                <div key={d.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span className="lora" style={{ fontSize:13, color:D.white }}>{d.icon} {d.title}</span>
                  <span style={{ padding:'2px 10px', background:`${D.gold}33`, borderRadius:20 }}>
                    <span className="caveat" style={{ fontSize:11, fontWeight:700, color:D.gold }}>{getDaysUntil(d.date,d.type)} días</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dates list */}
        {dates.map((item, i) => {
          const daysLeft = getDaysUntil(item.date, item.type);
          const accent = TYPE_ACCENTS[item.type] || D.gold;
          const nextOcc = getNextOccurrence(item.date, item.type);
          const displayDate = nextOcc ? formatLocalDate(`${nextOcc.getFullYear()}-${String(nextOcc.getMonth()+1).padStart(2,'0')}-${String(nextOcc.getDate()).padStart(2,'0')}`) : formatLocalDate(item.date);
          return (
            <motion.div key={item.id} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
              style={{ background:D.white, border:`1.5px solid ${D.border}`, borderLeft:`4px solid ${accent}`, borderRadius:18, padding:'14px 16px', marginBottom:12, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:12, right:14, fontSize:36, opacity:0.15 }}>{item.icon}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <div className="lora" style={{ fontSize:15, fontWeight:600, color:D.wine }}>{item.title}</div>
                  {item.description && <div className="caveat" style={{ fontSize:12, color:D.muted }}>{item.description}</div>}
                </div>
                <div style={{ display:'flex', gap:6, zIndex:1 }}>
                  <button onClick={() => handleEdit(item)}
                    style={{ padding:'4px 10px', background:D.cream, border:`1px solid ${D.border}`, borderRadius:12, cursor:'pointer' }}>
                    <span className="caveat" style={{ fontSize:11, color:D.wine }}>Editar</span>
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    style={{ width:28, height:28, borderRadius:'50%', background:`${D.coral}15`, border:`1px solid ${D.coral}44`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <Trash2 size={12} color={D.coral}/>
                  </button>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:8, borderTop:`1px solid ${D.border}` }}>
                <span className="caveat" style={{ fontSize:12, color:D.muted }}>{displayDate}</span>
                {daysLeft != null && (
                  <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', background:`${accent}18`, borderRadius:20 }}>
                    <Bell size={10} color={accent}/>
                    <span className="caveat" style={{ fontSize:11, fontWeight:700, color:accent }}>{daysLeft} días</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => { setShowSheet(false); setEditingId(null); setFormData({title:'',date:'',description:'',type:'birthday'}); }}
              style={{ position:'fixed', inset:0, background:'rgba(45,27,46,0.5)', zIndex:199 }}/>
            <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'0 20px', pointerEvents:'none' }}>
              <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.96 }} transition={{ duration:0.18 }}
                onClick={e => e.stopPropagation()}
                style={{ width:'100%', maxWidth:400, background:D.cream, borderRadius:24, overflow:'hidden', boxShadow:'0 8px 40px rgba(45,27,46,0.22)', pointerEvents:'all' }}>
                <div style={{ padding:'20px 20px 16px', borderBottom:`1.5px solid ${D.border}` }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <img src="/images/fechas-especiales.png" alt="" style={{ width:22, height:22, objectFit:'contain' }}/>
                      <h2 className="lora" style={{ fontSize:20, fontWeight:700, color:D.wine, margin:0 }}>{editingId?'Editar fecha':'Nueva fecha'}</h2>
                    </div>
                    <button onClick={() => { setShowSheet(false); setEditingId(null); }}
                      style={{ width:32, height:32, borderRadius:'50%', background:'#FFF0F4', border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <X size={14} color={D.coral} strokeWidth={2.5}/>
                    </button>
                  </div>
                  <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'55%', maxWidth:180, margin:'6px 0 0' }}/>
                </div>
                <div style={{ padding:'16px 20px 20px' }}>
                  <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[
                      { label:'Tipo', key:'type', type:'select', options:[{v:'birthday',l:'Cumpleaños'},{v:'anniversary',l:'Aniversario'},{v:'other',l:'Otra fecha'}] },
                      { label:'Título', key:'title', type:'text', placeholder:'Ej: Cumpleaños de Ana' },
                      { label:'Fecha', key:'date', type:'date' },
                      { label:'Descripción', key:'description', type:'text', placeholder:'Detalles opcionales' },
                    ].map(field => (
                      <div key={field.key}>
                        <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>{field.label}</div>
                        {field.type==='select' ? (
                          <select value={formData[field.key]} onChange={e => setFormData({...formData,[field.key]:e.target.value})}
                            style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine }}>
                            {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                          </select>
                        ) : (
                          <input type={field.type} value={formData[field.key]} placeholder={field.placeholder}
                            onChange={e => setFormData({...formData,[field.key]:e.target.value})}
                            style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.white, fontSize:14, color:D.wine, boxSizing:'border-box' }}/>
                        )}
                      </div>
                    ))}
                    <div style={{ display:'flex', gap:10, marginTop:4 }}>
                      <button type="button" onClick={() => { setShowSheet(false); setEditingId(null); }}
                        style={{ flex:1, padding:'12px', borderRadius:14, background:'#FFF0F4', border:`1.5px solid ${D.border}`, cursor:'pointer' }}>
                        <span className="caveat" style={{ fontSize:14, fontWeight:700, color:D.coral }}>Cancelar</span>
                      </button>
                      <button type="submit"
                        style={{ flex:1, padding:'12px', borderRadius:14, background:D.coral, border:'none', cursor:'pointer', boxShadow:'3px 3px 0 rgba(196,68,100,0.28)' }}>
                        <span className="caveat" style={{ fontSize:14, fontWeight:700, color:D.white }}>Guardar ✦</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
