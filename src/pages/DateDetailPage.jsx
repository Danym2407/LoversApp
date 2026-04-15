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

export default function DateDetailPage({ dateId, navigateTo, backTo = 'dates' }) {
  const [date, setDate] = useState(null);
  const { toast } = useToast();

  // Detect current user once at top level so all handlers share the same key
  const _userRaw = localStorage.getItem('loversappUser');
  const _currentUser = _userRaw ? JSON.parse(_userRaw) : null;
  const myKey = _currentUser?.name?.toLowerCase().includes('daniel') ? 'daniela' : 'eduardo';
  const partnerKey = myKey === 'daniela' ? 'eduardo' : 'daniela';
  const myLabel = myKey === 'daniela' ? 'Daniela' : 'Eduardo';
  const partnerLabel = myKey === 'daniela' ? 'Eduardo' : 'Daniela';
  const myAccent = myKey === 'daniela' ? D.coral : D.blue;
  const partnerAccent = myKey === 'daniela' ? D.blue : D.coral;

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
    try { syncDateToEvents(updated); } catch(e) { console.warn('syncDateToEvents error:', e); }
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
    const missing = [];
    if (!date?.name?.trim()) missing.push('nombre de la cita');
    if (!date?.date) missing.push('fecha');
    if (!date?.location?.trim()) missing.push('lugar');
    if (!date?.[`${myKey}Review`]?.trim()) missing.push('tu reseña');
    if (missing.length > 0) {
      toast({ title: '⚠️ Faltan datos', description: `Para completar llena: ${missing.join(', ')}.` });
      return;
    }
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

  // myKey, partnerKey, labels and accents are computed at the top of the component

  function RatingRow({ person, type, readOnly }) {
    const rating = date[`${person}Rating`]?.[type] || 0;
    const isHeart = type === 'hearts';
    return (
      <div style={{ marginBottom:10 }}>
        <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>{isHeart ? '❤️ Emocional' : '⭐ Diversión'}</div>
        <div style={{ display:'flex', gap:4 }}>
          {[...Array(5)].map((_,i) => (
            isHeart
              ? <Heart key={i} size={22} color={D.coral} fill={i<rating?D.coral:'none'} strokeWidth={1.5} style={{ cursor: readOnly?'default':'pointer', opacity: readOnly?0.7:1 }} onClick={readOnly?undefined:() => handleRatingChange(person, type, i+1)}/>
              : <Star key={i} size={22} color={D.gold} fill={i<rating?D.gold:'none'} strokeWidth={1.5} style={{ cursor: readOnly?'default':'pointer', opacity: readOnly?0.7:1 }} onClick={readOnly?undefined:() => handleRatingChange(person, type, i+1)}/>
          ))}
        </div>
      </div>
    );
  }

  function PhotoGrid({ person, label, readOnly }) {
    const photos = date[`${person}Photos`]||[];
    const accent = person === 'daniela' ? D.coral : D.blue;
    return (
      <SectionCard title={readOnly ? `📷 ${label}` : `📷 Mi POV`} accent={accent}>
        {!readOnly && (
          <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'8px', border:`1.5px dashed ${D.border}`, borderRadius:12, cursor:'pointer', marginBottom:10, background:D.cream }}>
            <Upload size={14} color={D.muted}/>
            <span className="caveat" style={{ fontSize:13, color:D.muted }}>Subir fotos</span>
            <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => handlePhotoUpload(person, e.target.files)}/>
          </label>
        )}
        {photos.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {photos.map((photo,i) => (
              <div key={i} style={{ position:'relative', borderRadius:12, overflow:'hidden' }}>
                <img src={photo} alt="" style={{ width:'100%', height:80, objectFit:'cover', display:'block' }}/>
                {!readOnly && (
                  <button onClick={() => handleRemovePhoto(person, i)}
                    style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:D.coral, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Trash2 size={10} color={D.white}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding:'16px', textAlign:'center', background:D.cream, borderRadius:12 }}>
            <span className="caveat" style={{ fontSize:13, color:D.muted }}>{readOnly ? 'Sin fotos aún' : 'Las fotos aparecerán aquí'}</span>
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
          <button onClick={() => navigateTo(backTo)}
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
                style={{ height:36, borderRadius:18, background:D.green, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:6, padding:'0 14px', boxShadow:'0 2px 10px rgba(91,170,106,0.35)' }}>
                <CheckCircle size={15} color={D.white}/>
                <span className="caveat" style={{ fontSize:13, fontWeight:700, color:D.white }}>Completar</span>
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
        <PhotoGrid person={myKey} label={myLabel} readOnly={false}/>
        <PhotoGrid person={partnerKey} label={partnerLabel} readOnly={true}/>

        {/* Ratings */}
        <SectionCard title="Mi calificación" accent={myAccent}>
          <RatingRow person={myKey} type="hearts" readOnly={false}/>
          <RatingRow person={myKey} type="stars" readOnly={false}/>
        </SectionCard>
        <SectionCard title={`Calificación de ${partnerLabel}`} accent={partnerAccent}>
          <RatingRow person={partnerKey} type="hearts" readOnly={true}/>
          <RatingRow person={partnerKey} type="stars" readOnly={true}/>
        </SectionCard>

        {/* Reviews */}
        <SectionCard title="Mi reseña" accent={myAccent}>
          <TextArea value={date[`${myKey}Review`]} onChange={v => handleInputChange(`${myKey}Review`, v)} placeholder="¿Qué te pareció esta cita?"/>
        </SectionCard>
        <SectionCard title={`Reseña de ${partnerLabel}`} accent={partnerAccent}>
          {date[`${partnerKey}Review`]
            ? <p className="lora" style={{ fontSize:13, color:D.wine, lineHeight:1.6, margin:0 }}>{date[`${partnerKey}Review`]}</p>
            : <span className="caveat" style={{ fontSize:13, color:D.muted }}>Sin reseña aún</span>}
        </SectionCard>

        {/* One word */}
        <SectionCard title="Mi una palabra" accent={myAccent}>
          <Input value={date[`${myKey}OneWord`]} onChange={v => handleInputChange(`${myKey}OneWord`, v)} placeholder="Una palabra..."/>
        </SectionCard>
        <SectionCard title={`Una palabra de ${partnerLabel}`} accent={partnerAccent}>
          {date[`${partnerKey}OneWord`]
            ? <span className="caveat" style={{ fontSize:16, fontWeight:700, color:D.wine }}>{date[`${partnerKey}OneWord`]}</span>
            : <span className="caveat" style={{ fontSize:13, color:D.muted }}>Sin respuesta aún</span>}
        </SectionCard>

        {/* Best part */}
        <SectionCard title="Lo mejor para mí" accent={myAccent}>
          <TextArea value={date[`${myKey}BestPart`]} onChange={v => handleInputChange(`${myKey}BestPart`, v)} placeholder="¿Cuál fue tu parte favorita?" rows={3}/>
        </SectionCard>
        <SectionCard title={`Lo mejor para ${partnerLabel}`} accent={partnerAccent}>
          {date[`${partnerKey}BestPart`]
            ? <p className="lora" style={{ fontSize:13, color:D.wine, lineHeight:1.6, margin:0 }}>{date[`${partnerKey}BestPart`]}</p>
            : <span className="caveat" style={{ fontSize:13, color:D.muted }}>Sin respuesta aún</span>}
        </SectionCard>

        {!isCompleted && (
          <motion.button
            whileTap={{ scale:0.97 }}
            onClick={handleMarkComplete}
            style={{ width:'100%', padding:'16px', borderRadius:20, background:`linear-gradient(135deg, ${D.green}, #7DC98A)`, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:8, boxShadow:'0 4px 18px rgba(91,170,106,0.3)' }}>
            <CheckCircle size={22} color={D.white}/>
            <span className="lora" style={{ fontSize:16, fontWeight:700, color:D.white, letterSpacing:0.5 }}>¡Marcar como Completada!</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
