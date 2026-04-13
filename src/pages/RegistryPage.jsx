import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, MapPin, Calendar, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { upsertCalendarEvent, upsertTimelineEvent, removeCalendarEventBySource, removeTimelineEventBySource } from '@/lib/eventSync';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#F0C4CC', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;
const CATS = ['Comida','Películas','Parque','Playa','Viaje','Compras','Otro'];
const CAT_EMOJIS = { Comida:'🍽️', Películas:'🎬', Parque:'🌳', Playa:'🏖️', Viaje:'✈️', Compras:'🛍️', Otro:'📍' };

export default function RegistryPage({ navigateTo }) {
  const defaultLocations = [
    { id:1, name:'Restaurante Downtown', date:'2025-12-20', category:'Comida', rating:5 },
    { id:2, name:'Cine Auditorio', date:'2025-12-15', category:'Películas', rating:4 }
  ];

  const [locations, setLocations] = useState([]);
  const [showSheet, setShowSheet] = useState(false);
  const [formData, setFormData] = useState({ name:'', date:'', category:'Comida', rating:4 });
  const { toast } = useToast();

  const syncAll = (items) => {
    items.forEach(loc => {
      if (!loc?.id) return;
      upsertCalendarEvent({ title:`Salida: ${loc.name}`, description:loc.category?`Categoría: ${loc.category}`:'Salida registrada', dateStr:loc.date, sourceType:'registry', sourceId:loc.id });
      upsertTimelineEvent({ title:loc.name, description:loc.category?`Salida · ${loc.category}`:'Salida registrada', dateStr:loc.date, image:'📍', sourceType:'registry', sourceId:loc.id });
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('registryLocations');
    if (saved) { const p = JSON.parse(saved); setLocations(p); syncAll(p); }
    else { setLocations(defaultLocations); localStorage.setItem('registryLocations', JSON.stringify(defaultLocations)); syncAll(defaultLocations); }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()||!formData.date) { toast({title:'Faltan datos',description:'Agrega nombre y fecha.'}); return; }
    const newLoc = { id:Date.now(), name:formData.name.trim(), date:formData.date, category:formData.category, rating:Number(formData.rating)||0 };
    const updated = [newLoc, ...locations];
    setLocations(updated); localStorage.setItem('registryLocations', JSON.stringify(updated));
    upsertCalendarEvent({ title:`Salida: ${newLoc.name}`, description:newLoc.category?`Categoría: ${newLoc.category}`:'', dateStr:newLoc.date, sourceType:'registry', sourceId:newLoc.id });
    upsertTimelineEvent({ title:newLoc.name, description:newLoc.category?`Salida · ${newLoc.category}`:'', dateStr:newLoc.date, image:'📍', sourceType:'registry', sourceId:newLoc.id });
    setShowSheet(false); setFormData({name:'',date:'',category:'Comida',rating:4});
    toast({title:'Salida registrada',description:'Añadida al calendario y línea del tiempo.'});
  };

  const handleDelete = (id) => {
    const updated = locations.filter(l => l.id!==id);
    setLocations(updated); localStorage.setItem('registryLocations', JSON.stringify(updated));
    removeCalendarEventBySource('registry', id); removeTimelineEventBySource('registry', id);
  };

  const catCounts = CATS.reduce((acc, c) => { acc[c] = locations.filter(l => l.category===c).length; return acc; }, {});

  return (
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', paddingBottom:88 }}>
      <style>{STYLE}</style>

      <div style={{ padding:'48px 20px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', background:D.cream, borderBottom:`1.5px solid ${D.border}`, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={() => navigateTo('dashboard')}
          style={{ width:38, height:38, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{ textAlign:'center' }}>
          <div className="lora" style={{ fontSize:20, fontWeight:600, color:D.wine }}>Registro de Salidas</div>
          <div className="caveat" style={{ fontSize:11, color:D.muted }}>{locations.length} salidas guardadas ✦</div>
        </div>
        <button onClick={() => setShowSheet(true)}
          style={{ width:38, height:38, borderRadius:'50%', background:D.coral, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <Plus size={18} color={D.white} strokeWidth={2.5}/>
        </button>
      </div>

      <div style={{ padding:'18px' }}>
        {/* Category summary */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:14 }}>
          {CATS.filter(c => catCounts[c]>0).map(c => (
            <div key={c} style={{ flexShrink:0, padding:'6px 14px', background:D.white, border:`1.5px solid ${D.border}`, borderRadius:20, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:14 }}>{CAT_EMOJIS[c]}</span>
              <span className="caveat" style={{ fontSize:12, fontWeight:700, color:D.wine }}>{c}</span>
              <span className="caveat" style={{ fontSize:11, color:D.muted }}>x{catCounts[c]}</span>
            </div>
          ))}
        </div>

        {/* Locations */}
        {locations.map((loc, i) => (
          <motion.div key={loc.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            style={{ background:D.white, border:`1.5px solid ${D.border}`, borderLeft:`4px solid ${D.gold}`, borderRadius:18, padding:'14px 16px', marginBottom:12, position:'relative' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div className="lora" style={{ fontSize:15, fontWeight:600, color:D.wine }}>{loc.name}</div>
                <span style={{ padding:'3px 10px', background:`${D.gold}18`, border:`1px solid ${D.gold}44`, borderRadius:20 }}>
                  <span className="caveat" style={{ fontSize:11, fontWeight:700, color:D.gold }}>{CAT_EMOJIS[loc.category]||'📍'} {loc.category}</span>
                </span>
              </div>
              <button onClick={() => handleDelete(loc.id)}
                style={{ width:30, height:30, borderRadius:'50%', background:`${D.coral}15`, border:`1px solid ${D.coral}44`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Trash2 size={13} color={D.coral}/>
              </button>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Calendar size={12} color={D.muted}/>
                <span className="caveat" style={{ fontSize:12, color:D.muted }}>
                  {new Date(loc.date+'T00:00:00').toLocaleDateString('es-ES')}
                </span>
              </div>
              <div style={{ display:'flex', gap:2 }}>
                {[...Array(5)].map((_,j) => (
                  <span key={j} style={{ fontSize:12, color: j<loc.rating ? D.gold : D.border }}>★</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {locations.length === 0 && (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📍</div>
            <div className="lora" style={{ fontSize:18, color:D.wine, marginBottom:6 }}>Sin salidas registradas</div>
            <div className="caveat" style={{ color:D.muted, fontSize:14 }}>Registra tu primera salida juntos 💕</div>
          </div>
        )}
      </div>

      {/* Sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setShowSheet(false)}
              style={{ position:'fixed', inset:0, background:'rgba(28,14,16,0.6)', zIndex:50 }}/>
            <motion.div initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }} transition={{ type:'spring', damping:28, stiffness:340 }}
              style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430, background:D.white, borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', zIndex:51 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                <div className="lora" style={{ fontSize:18, fontWeight:600, color:D.wine }}>Registrar salida</div>
                <button onClick={() => setShowSheet(false)}
                  style={{ width:32, height:32, borderRadius:'50%', background:D.cream, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <X size={14} color={D.wine}/>
                </button>
              </div>
              <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  {label:'Lugar', key:'name', type:'text', placeholder:'Ej: Restaurante favorito'},
                  {label:'Fecha', key:'date', type:'date'},
                ].map(f => (
                  <div key={f.key}>
                    <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>{f.label}</div>
                    <input type={f.type} value={formData[f.key]} placeholder={f.placeholder}
                      onChange={e => setFormData({...formData,[f.key]:e.target.value})}
                      style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, fontSize:14, color:D.wine, boxSizing:'border-box' }}/>
                  </div>
                ))}
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>Categoría</div>
                  <select value={formData.category} onChange={e => setFormData({...formData,category:e.target.value})}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, fontSize:14, color:D.wine }}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="caveat" style={{ fontSize:12, color:D.muted, marginBottom:4 }}>Calificación</div>
                  <select value={formData.rating} onChange={e => setFormData({...formData,rating:e.target.value})}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, fontSize:14, color:D.wine }}>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                  <button type="button" onClick={() => setShowSheet(false)}
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
