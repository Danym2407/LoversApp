import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Star, Upload, Trash2, Calendar, MapPin, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  upsertCalendarEvent, upsertTimelineEvent, upsertCountdownEvent,
  removeCalendarEventBySource, removeTimelineEventBySource, removeCountdownEventBySource
} from '@/lib/eventSync';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#F0C4CC', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function Input({ value, onChange, placeholder, type='text', style={} }) {
  return (
    <input type={type} value={value||''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, fontSize:14, color:D.wine, outline:'none', boxSizing:'border-box', ...style }}/>
  );
}
function TextArea({ value, onChange, placeholder, rows=4 }) {
  return (
    <textarea value={value||''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, fontSize:14, color:D.wine, outline:'none', resize:'none', boxSizing:'border-box' }}/>
  );
}
function SectionCard({ title, accent=D.coral, children }) {
  return (
    <div style={{ background:D.white, border:`1.5px solid ${D.border}`, borderLeft:`4px solid ${accent}`, borderRadius:18, padding:'16px 18px', marginBottom:14 }}>
      <div className="lora" style={{ fontSize:15, fontWeight:600, color:D.wine, marginBottom:12 }}>{title}</div>
      {children}
    </div>
  );
}

export default function DateDetailPage({ dateId, navigateTo }) {
  const [date, setDate] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadDate(); }, [dateId]);

  const loadDate = () => {
    const dates = JSON.parse(localStorage.getItem('coupleDates')||'[]');
    const found = dates.find(d => Number(d.id) === Number(dateId));
    setDate(found);
  };

  const saveDate = (updated) => {
    const dates = JSON.parse(localStorage.getItem('coupleDates')||'[]');
    const idx = dates.findIndex(d => Number(d.id) === Number(dateId));
    if (idx >= 0) dates[idx] = updated; else dates.push(updated);
    localStorage.setItem('coupleDates', JSON.stringify(dates));
    setDate(updated);
    syncDateToEvents(updated);
  };

  const syncDateToEvents = (u) => {
    if (!u?.id) return;
    if (u.status === 'completed') {
      const dateStr = u.date || new Date().toISOString().slice(0,10);
      const title = u.name ? `Cita #${u.id}: ${u.name}` : `Cita #${u.id}`;
      const descParts = [];
      if (u.location) descParts.push(`Lugar: ${u.location}`);
      if (u.danielaOneWord) descParts.push(`Daniela: ${u.danielaOneWord}`);
      if (u.eduardoOneWord) descParts.push(`Eduardo: ${u.eduardoOneWord}`);
      const description = descParts.length ? descParts.join(' • ') : 'Cita completada';
      const coverPhoto = [...(u.danielaPhotos||[]),...(u.eduardoPhotos||[])][0]||null;
      upsertCalendarEvent({ title, description, dateStr, photo:coverPhoto, sourceType:'date', sourceId:u.id });
      upsertTimelineEvent({ title, description, dateStr, image:'💞', sourceType:'date', sourceId:u.id });
    } else {
      removeCalendarEventBySource('date', u.id);
      removeTimelineEventBySource('date', u.id);
    }
    if (u.plannedDate) {
      const title = u.name ? `Cita planeada: ${u.name}` : `Cita planeada #${u.id}`;
      upsertCountdownEvent({ title, dateStr:u.plannedDate, emoji:'💖', sourceType:'date-plan', sourceId:u.id });
    } else {
      removeCountdownEventBySource('date-plan', u.id);
    }
  };

  const handleMarkComplete = () => {
    saveDate({ ...date, status:'completed' });
    toast({ title:'¡Cita completada! 🎉', description:'Marcada como completada.' });
  };
  const handleMarkPending = () => {
    saveDate({ ...date, status:'pending' });
    toast({ title:'Cita pendiente', description:'Marcada como pendiente.' });
  };
  const handleResyncCompleted = () => {
    removeCalendarEventBySource('date', date.id);
    removeTimelineEventBySource('date', date.id);
    saveDate({ ...date, status:'completed', resyncedAt:new Date().toISOString() });
    toast({ title:'Cita sincronizada', description:'Actualizada en calendario y línea del tiempo.' });
  };
  const handleSavePlan = () => {
    if (!date?.plannedDate) { toast({ title:'Falta la fecha', description:'Selecciona una fecha planeada.' }); return; }
    saveDate({ ...date });
    toast({ title:'Plan guardado', description:'Cita planeada en Countdown.' });
  };
  const handleInputChange = (field, value) => saveDate({ ...date, [field]:value });
  const handleRatingChange = (person, type, value) => saveDate({ ...date, [`${person}Rating`]:{...date[`${person}Rating`],[type]:value} });
  const handlePhotoUpload = (person, files) => {
    Array.from(files||[]).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDate(prev => {
          const current = prev[`${person}Photos`]||[];
          const updated = { ...prev, [`${person}Photos`]:[...current, reader.result] };
          saveDate(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };
  const handleRemovePhoto = (person, index) => {
    const photos = (date[`${person}Photos`]||[]).filter((_,i) => i!==index);
    saveDate({ ...date, [`${person}Photos`]:photos });
  };

  if (!date) return null;

  function RatingRow({ person, type }) {
    const rating = date[`${person}Rating`]?.[type] || 0;
    const isHeart = type === 'hearts';
    return (
      <div style={{ marginBottom:10 }}>
        <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>{isHeart ? '❤️ Emocional' : '⭐ Diversión'}</div>
        <div style={{ display:'flex', gap:4 }}>
          {[...Array(5)].map((_,i) => (
            isHeart
              ? <Heart key={i} size={22} color={D.coral} fill={i<rating?D.coral:'none'} strokeWidth={1.5} style={{ cursor:'pointer' }} onClick={() => handleRatingChange(person, type, i+1)}/>
              : <Star key={i} size={22} color={D.gold} fill={i<rating?D.gold:'none'} strokeWidth={1.5} style={{ cursor:'pointer' }} onClick={() => handleRatingChange(person, type, i+1)}/>
          ))}
        </div>
      </div>
    );
  }

  function PhotoGrid({ person, label }) {
    const photos = date[`${person}Photos`]||[];
    return (
      <SectionCard title={`POV: ${label}`} accent={person==='daniela'?D.coral:D.blue}>
        <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'8px', border:`1.5px dashed ${D.border}`, borderRadius:12, cursor:'pointer', marginBottom:10, background:D.cream }}>
          <Upload size={14} color={D.muted}/>
          <span className="caveat" style={{ fontSize:13, color:D.muted }}>Subir fotos</span>
          <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => handlePhotoUpload(person, e.target.files)}/>
        </label>
        {photos.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {photos.map((photo,i) => (
              <div key={i} style={{ position:'relative', borderRadius:12, overflow:'hidden' }}>
                <img src={photo} alt="" style={{ width:'100%', height:80, objectFit:'cover', display:'block' }}/>
                <button onClick={() => handleRemovePhoto(person, i)}
                  style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:D.coral, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Trash2 size={10} color={D.white}/>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding:'16px', textAlign:'center', background:D.cream, borderRadius:12 }}>
            <span className="caveat" style={{ fontSize:13, color:D.muted }}>Las fotos aparecerán aquí</span>
          </div>
        )}
      </SectionCard>
    );
  }

  const isCompleted = date.status === 'completed';

  return (
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:88 }}>
      <style>{STYLE}</style>

      {/* Header */}
      <div style={{ padding:'48px 20px 14px', background:D.cream, borderBottom:`1.5px solid ${D.border}`, position:'sticky', top:0, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <button onClick={() => navigateTo('dates')}
            style={{ width:38, height:38, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
          </button>
          <div style={{ textAlign:'center' }}>
            <div className="caveat" style={{ fontSize:13, fontWeight:700, color:D.muted }}>Cita {String(date.id).padStart(2,'0')}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: isCompleted ? D.green : date.plannedDate ? D.gold : D.muted }}/>
              <span className="caveat" style={{ fontSize:11, color:D.muted }}>{isCompleted?'Completada':date.plannedDate?'Planeada':'Pendiente'}</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {isCompleted ? (
              <>
                <button onClick={handleResyncCompleted} title="Sincronizar"
                  style={{ width:38, height:38, borderRadius:'50%', background:`${D.green}18`, border:`1.5px solid ${D.green}44`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <RefreshCw size={14} color={D.green}/>
                </button>
                <button onClick={handleMarkPending} title="Marcar pendiente"
                  style={{ width:38, height:38, borderRadius:'50%', background:`${D.muted}18`, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <Clock size={14} color={D.muted}/>
                </button>
              </>
            ) : (
              <button onClick={handleMarkComplete}
                style={{ width:38, height:38, borderRadius:'50%', background:D.green, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <CheckCircle size={16} color={D.white}/>
              </button>
            )}
          </div>
        </div>
        <input value={date.name||''} onChange={e => handleInputChange('name', e.target.value)} placeholder="Nombre de la cita"
          className="lora" style={{ width:'100%', fontSize:18, fontWeight:600, color:D.wine, border:'none', borderBottom:`1.5px solid ${D.border}`, background:'transparent', outline:'none', paddingBottom:4, boxSizing:'border-box' }}/>
      </div>

      <div style={{ padding:'18px' }}>
        {/* Date, Location, PlannedDate */}
        <SectionCard title="📋 Detalles" accent={D.blue}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div>
              <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>📅 Fecha real</div>
              <Input type="date" value={date.date} onChange={v => handleInputChange('date', v)}/>
            </div>
            <div>
              <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>📍 Lugar</div>
              <Input value={date.location} onChange={v => handleInputChange('location', v)} placeholder="¿Dónde fue?"/>
            </div>
          </div>
          <div>
            <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>🗓️ Fecha planeada</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <Input type="date" value={date.plannedDate} onChange={v => handleInputChange('plannedDate', v)} style={{ flex:1 }}/>
              <button onClick={handleSavePlan}
                style={{ padding:'8px 14px', borderRadius:20, background:`${D.gold}18`, border:`1px solid ${D.gold}55`, cursor:'pointer', whiteSpace:'nowrap' }}>
                <span className="caveat" style={{ fontSize:12, fontWeight:700, color:D.gold }}>Guardar Plan</span>
              </button>
            </div>
            <div className="caveat" style={{ fontSize:11, color:D.muted, marginTop:4 }}>Se mostrará en Countdown.</div>
          </div>
        </SectionCard>

        {/* Photo grids */}
        <PhotoGrid person="daniela" label="Daniela"/>
        <PhotoGrid person="eduardo" label="Eduardo"/>

        {/* Ratings */}
        {[{person:'daniela',label:'Calificación de Daniela',accent:D.coral},{person:'eduardo',label:'Calificación de Eduardo',accent:D.blue}].map(({person,label,accent}) => (
          <SectionCard key={person} title={label} accent={accent}>
            <RatingRow person={person} type="hearts"/>
            <RatingRow person={person} type="stars"/>
          </SectionCard>
        ))}

        {/* Reviews */}
        {[{person:'daniela',label:'Reseña de Daniela',field:'danielaReview',accent:D.coral},{person:'eduardo',label:'Reseña de Eduardo',field:'eduardoReview',accent:D.blue}].map(({person,label,field,accent}) => (
          <SectionCard key={field} title={label} accent={accent}>
            <TextArea value={date[field]} onChange={v => handleInputChange(field, v)} placeholder="¿Qué te pareció esta cita?"/>
          </SectionCard>
        ))}

        {/* One word */}
        {[{field:'danielaOneWord',label:'Una palabra (Daniela)',accent:D.coral},{field:'eduardoOneWord',label:'Una palabra (Eduardo)',accent:D.blue}].map(({field,label,accent}) => (
          <SectionCard key={field} title={label} accent={accent}>
            <Input value={date[field]} onChange={v => handleInputChange(field, v)} placeholder="Una palabra..."/>
          </SectionCard>
        ))}

        {/* Best part */}
        {[{field:'danielaBestPart',label:'Lo mejor (Daniela)',accent:D.coral},{field:'eduardoBestPart',label:'Lo mejor (Eduardo)',accent:D.blue}].map(({field,label,accent}) => (
          <SectionCard key={field} title={label} accent={accent}>
            <TextArea value={date[field]} onChange={v => handleInputChange(field, v)} placeholder="¿Cuál fue tu parte favorita?" rows={3}/>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
