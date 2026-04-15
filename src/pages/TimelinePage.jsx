import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimelineEvents } from '@/lib/eventSync';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

export default function TimelinePage({ navigateTo }) {
  const [events, setEvents]           = useState([]);
  const [selectedEvent, setSelected]  = useState(null);
  const [photoIndex, setPhotoIndex]   = useState(0);

  useEffect(() => { setEvents(getTimelineEvents()); }, []);

  const sorted = useMemo(() => [...events].sort((a,b) => new Date(a.date)-new Date(b.date)), [events]);

  const resolvePhotos = (ev) => {
    if (!ev) return [];
    if (ev.sourceType === 'date' && ev.sourceId) {
      const dates = JSON.parse(localStorage.getItem('coupleDates')||'[]');
      const m = dates.find(d => Number(d.id)===Number(ev.sourceId));
      if (m) return [...(m.danielaPhotos||[]),...(m.eduardoPhotos||[])];
    }
    if (ev.sourceType === 'cita-review' && ev.sourceId) {
      try {
        const reviews = JSON.parse(localStorage.getItem('completedCitasReviews')||'{}');
        const review = reviews[ev.sourceId];
        if (review?.photos?.length) return review.photos;
      } catch {}
    }
    if (ev.image && ev.image.startsWith('data:image')) return [ev.image];
    return [];
  };

  const getCover = (ev) => {
    if (!ev) return null;
    if (ev.sourceType === 'date' && ev.sourceId) {
      const dates = JSON.parse(localStorage.getItem('coupleDates')||'[]');
      const m = dates.find(d => Number(d.id)===Number(ev.sourceId));
      if (m) return (m.danielaPhotos||[])[0]||(m.eduardoPhotos||[])[0]||null;
    }
    if (ev.sourceType === 'cita-review' && ev.sourceId) {
      try {
        const reviews = JSON.parse(localStorage.getItem('completedCitasReviews')||'{}');
        const review = reviews[ev.sourceId];
        if (review?.photos?.[0]) return review.photos[0];
      } catch {}
    }
    if (ev.image && ev.image.startsWith('data:image')) return ev.image;
    return null;
  };

  const photos = selectedEvent ? resolvePhotos(selectedEvent) : [];

  return (
    <div style={{background:D.cream,minHeight:'100vh',maxWidth:430,margin:'0 auto',position:'relative',overflow:'hidden',paddingBottom:88}}>
      <style>{STYLE}</style>

      {/* Header */}
      <div style={{padding:'48px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1.5px solid ${D.border}`,background:D.cream,position:'sticky',top:0,zIndex:40}}>
        <button onClick={() => navigateTo('dashboard')}
          style={{width:38,height:38,borderRadius:'50%',background:D.white,border:`1.5px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{textAlign:'center'}}>
          <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine,letterSpacing:1}}>Línea del Tiempo</div>
          <div className="caveat" style={{fontSize:11,color:D.muted}}>Nuestra historia ✦</div>
        </div>
        <button onClick={() => navigateTo('moments')}
          style={{width:38,height:38,borderRadius:'50%',background:D.coral,border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <Plus size={17} color={D.white}/>
        </button>
      </div>

      <div style={{padding:'20px',position:'relative',zIndex:1}}>
        {sorted.length === 0 ? (
          <div style={{textAlign:'center',padding:'48px 0'}}>
            <div style={{fontSize:40,marginBottom:12}}>📖</div>
            <p className="lora" style={{color:D.muted}}>Aún no hay momentos</p>
            <p className="caveat" style={{fontSize:13,color:D.muted,marginTop:4}}>Guarda una cita para verla aquí</p>
          </div>
        ) : (
          <div style={{position:'relative',paddingLeft:36}}>
            {/* Vertical line */}
            <div style={{position:'absolute',left:10,top:4,bottom:4,width:2,background:`repeating-linear-gradient(180deg,${D.coral} 0,${D.coral} 8px,transparent 8px,transparent 16px)`}}/>

            {sorted.map((ev,i)=>{
              const cover = getCover(ev);
              const isEmoji = ev.image && !ev.image.startsWith('data:image');
              return (
                <motion.div key={ev.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                  onClick={() => { setSelected(ev); setPhotoIndex(0); }}
                  style={{marginBottom:20,cursor:'pointer',position:'relative'}}>
                  {/* Dot */}
                  <div style={{position:'absolute',left:-31,top:16,width:14,height:14,borderRadius:'50%',background:D.coral,border:`2px solid ${D.cream}`,zIndex:2}}/>
                  <div style={{background:D.white,borderRadius:18,border:`1.5px solid ${D.border}`,overflow:'hidden'}}>
                    {cover && <img src={cover} alt={ev.title} style={{width:'100%',height:100,objectFit:'cover'}}/>}
                    <div style={{padding:'12px 14px'}}>
                      {!cover && isEmoji && <div style={{fontSize:28,marginBottom:6}}>{ev.image}</div>}
                      <span style={{padding:'2px 10px',borderRadius:20,background:`${D.gold}22`,border:`1px solid ${D.gold}44`,display:'inline-block',marginBottom:6}}>
                        <span className="caveat" style={{fontSize:11,color:D.wine,fontWeight:700}}>
                          {new Date(ev.date).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'})}
                        </span>
                      </span>
                      <div className="lora" style={{fontSize:15,fontWeight:600,color:D.wine,lineHeight:1.3}}>{ev.title}</div>
                      {ev.description && <div style={{fontSize:12,color:D.muted,marginTop:4,lineHeight:1.5}}>{ev.description}</div>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(28,14,16,0.7)',zIndex:100,display:'flex',alignItems:'flex-end'}}
            onClick={() => setSelected(null)}>
            <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{background:D.cream,borderRadius:'24px 24px 0 0',padding:24,width:'100%',maxHeight:'85vh',overflowY:'auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div className="lora" style={{fontSize:18,fontWeight:600,color:D.wine}}>{selectedEvent.title}</div>
                <button onClick={() => setSelected(null)} style={{background:'none',border:'none',cursor:'pointer'}}><X size={20} color={D.muted}/></button>
              </div>
              <span style={{padding:'3px 12px',borderRadius:20,background:`${D.gold}22`,border:`1px solid ${D.gold}44`,display:'inline-block',marginBottom:14}}>
                <span className="caveat" style={{fontSize:12,color:D.wine,fontWeight:700}}>
                  {new Date(selectedEvent.date).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'})}
                </span>
              </span>
              {photos.length > 0 ? (
                <>
                  <img src={photos[photoIndex]} alt="" style={{width:'100%',maxHeight:'50vh',objectFit:'contain',borderRadius:16,border:`1.5px solid ${D.gold}`,background:D.wine}}/>
                  {photos.length > 1 && (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:12}}>
                      <button onClick={() => setPhotoIndex(p=>(p-1+photos.length)%photos.length)}
                        style={{width:34,height:34,borderRadius:'50%',background:D.white,border:`1.5px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                        <ChevronLeft size={16} color={D.wine}/>
                      </button>
                      <span className="caveat" style={{fontSize:13,color:D.muted}}>{photoIndex+1} / {photos.length}</span>
                      <button onClick={() => setPhotoIndex(p=>(p+1)%photos.length)}
                        style={{width:34,height:34,borderRadius:'50%',background:D.white,border:`1.5px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                        <ChevronRight size={16} color={D.wine}/>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{textAlign:'center',padding:'24px',background:D.white,borderRadius:16,border:`1.5px dashed ${D.border}`}}>
                  <div style={{fontSize:36,marginBottom:8}}>{selectedEvent.image||'📖'}</div>
                  <p className="caveat" style={{color:D.muted,fontSize:13}}>Sin fotos para este momento</p>
                </div>
              )}
              {selectedEvent.description && (
                <p style={{fontSize:14,color:D.wine,lineHeight:1.7,marginTop:14}}>{selectedEvent.description}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
