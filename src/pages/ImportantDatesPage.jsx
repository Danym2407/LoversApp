import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Bell, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { upsertCalendarEvent, removeCalendarEventBySource } from '@/lib/eventSync';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#F0C4CC', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

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
  const { toast } = useToast();

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
    toast({title: editingId?'Fecha actualizada':'Fecha guardada', description:'Añadida al calendario.'});
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
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:88 }}>
      <style>{STYLE}</style>

      <div style={{ padding:'48px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', background:D.cream, borderBottom:`1.5px solid ${D.border}`, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={() => navigateTo('dashboard')}
          style={{ width:38, height:38, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{ textAlign:'center' }}>
          <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine }}>Fechas Importantes</div>
          <div className="caveat" style={{ fontSize:11, color:D.muted }}>{dates.length} fechas guardadas ✦</div>
        </div>
        <button onClick={() => setShowSheet(true)}
          style={{ width:38, height:38, borderRadius:'50%', background:D.coral, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <Plus size={18} color={D.white} strokeWidth={2.5}/>
        </button>
      </div>

      <div style={{ padding:'18px' }}>
        {/* Upcoming strip */}
        {upcoming.length > 0 && (
          <div style={{ background:D.wine, borderRadius:18, padding:'14px 16px', marginBottom:16 }}>
            <div className="caveat" style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>🔔 Próximamente (30 días)</div>
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
              style={{ position:'fixed', inset:0, background:'rgba(28,14,16,0.6)', zIndex:50 }}/>
            <motion.div initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }} transition={{ type:'spring', damping:28, stiffness:340 }}
              style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, background:D.white, borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', zIndex:51 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <div className="lora" style={{ fontSize:18, fontWeight:600, color:D.wine }}>{editingId?'Editar fecha':'Nueva fecha importante'}</div>
                <button onClick={() => { setShowSheet(false); setEditingId(null); }}
                  style={{ width:32, height:32, borderRadius:'50%', background:D.cream, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <X size={14} color={D.wine}/>
                </button>
              </div>
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
                        style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, fontSize:14, color:D.wine }}>
                        {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} value={formData[field.key]} placeholder={field.placeholder}
                        onChange={e => setFormData({...formData,[field.key]:e.target.value})}
                        style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, fontSize:14, color:D.wine, boxSizing:'border-box' }}/>
                    )}
                  </div>
                ))}
                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                  <button type="button" onClick={() => { setShowSheet(false); setEditingId(null); }}
                    style={{ flex:1, padding:'12px', borderRadius:14, background:D.cream, border:`1.5px solid ${D.border}`, cursor:'pointer' }}>
                    <span className="caveat" style={{ fontSize:14, fontWeight:700, color:D.wine }}>Cancelar</span>
                  </button>
                  <button type="submit"
                    style={{ flex:1, padding:'12px', borderRadius:14, background:D.coral, border:'none', cursor:'pointer' }}>
                    <span className="caveat" style={{ fontSize:14, fontWeight:700, color:D.white }}>Guardar</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
