import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimelineEvents } from '@/lib/eventSync';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

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
    <PageLayout>
      <PageHeader
        breadcrumb="Línea del Tiempo"
        title="Línea del Tiempo"
        icon="/images/linea-tiempo.png"
        subtitle="Nuestra historia juntos ✨"
        titleAction={
          <motion.button whileTap={{scale:0.95}} onClick={() => navigateTo('moments')}
            style={{flexShrink:0,width:40,height:40,borderRadius:'50%',background:'#FF6B8A',border:'2px solid #FF6B8A',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'3px 3px 0 rgba(196,68,100,0.28)'}}>
            <Plus size={18} color="#fff" strokeWidth={2.5}/>
          </motion.button>
        }
      />

      <div style={{padding:'20px',position:'relative',zIndex:1}}>
        {sorted.length === 0 ? (
          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            style={{margin:'32px 0',background:'#fff',border:'1.5px dashed #FFD0DC',borderRadius:20,padding:'32px 24px',textAlign:'center'}}>
            <img src="/images/linea-tiempo.png" alt="" style={{width:48,height:48,objectFit:'contain',marginBottom:12,opacity:0.6}}/>
            <div className="lora" style={{fontSize:17,fontWeight:600,color:'#2D1B2E',marginBottom:8}}>Aún no hay momentos</div>
            <p className="caveat" style={{fontSize:14,color:'#9B8B95',margin:0}}>Guarda una cita completada para verla aquí</p>
          </motion.div>
        ) : (
          <div style={{position:'relative',paddingLeft:36}}>
            {/* Vertical line */}
            <div style={{position:'absolute',left:10,top:4,bottom:4,width:2,background:'repeating-linear-gradient(180deg,#FF6B8A 0,#FF6B8A 8px,transparent 8px,transparent 16px)'}}/>

            {sorted.map((ev, i) => {
              const cover = getCover(ev);
              const isEmoji = ev.image && !ev.image.startsWith('data:image');
              return (
                <motion.div key={ev.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                  onClick={() => { setSelected(ev); setPhotoIndex(0); }}
                  style={{marginBottom:20,cursor:'pointer',position:'relative'}}>
                  {/* Dot */}
                  <div style={{position:'absolute',left:-31,top:14,width:16,height:16,borderRadius:'50%',background:'#FF6B8A',border:'2.5px solid #FFF5F7',zIndex:2,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <img src="/images/corazon.png" alt="" style={{width:8,height:8,objectFit:'contain',filter:'brightness(0) invert(1)'}}/>
                  </div>
                  <div style={{background:'#fff',borderRadius:18,border:'1.5px solid #FFD0DC',overflow:'hidden',boxShadow:'0 2px 8px rgba(255,107,138,0.08)'}}>
                    {cover && <img src={cover} alt={ev.title} style={{width:'100%',height:110,objectFit:'cover'}}/>}
                    <div style={{padding:'12px 14px'}}>
                      {!cover && isEmoji && <div style={{fontSize:28,marginBottom:6}}>{ev.image}</div>}
                      {!cover && !isEmoji && (
                        <div style={{width:'100%',height:64,background:'#FFF0F4',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
                          <img src="/images/fotos.png" alt="" style={{width:32,height:32,objectFit:'contain',opacity:0.5}}/>
                        </div>
                      )}
                      <span style={{padding:'2px 10px',borderRadius:20,background:'#FFF0F4',border:'1px solid #FFD0DC',display:'inline-flex',alignItems:'center',gap:5,marginBottom:6}}>
                        <img src="/images/calendario.png" alt="" style={{width:11,height:11,objectFit:'contain'}}/>
                        <span className="caveat" style={{fontSize:11,color:'#FF6B8A',fontWeight:700}}>
                          {new Date(ev.date).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'})}
                        </span>
                      </span>
                      <div className="lora" style={{fontSize:15,fontWeight:700,color:'#2D1B2E',lineHeight:1.3}}>{ev.title}</div>
                      {ev.description && <div className="caveat" style={{fontSize:13,color:'#9B8B95',marginTop:4,lineHeight:1.5}}>{ev.description}</div>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DETAIL OVERLAY ── */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}}
            onClick={() => setSelected(null)}>
            <motion.div
              initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
              transition={{type:'spring',damping:28,stiffness:300}}
              onClick={e => e.stopPropagation()}
              style={{background:'#FFF5F7',borderRadius:'24px 24px 0 0',padding:'24px 24px 48px',width:'100%',maxWidth:430,maxHeight:'85vh',overflowY:'auto'}}>
              {/* Handle */}
              <div style={{width:40,height:4,background:'#FFD0DC',borderRadius:99,margin:'0 auto 18px'}}/>
              {/* Title row */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,gap:12}}>
                <div className="lora" style={{fontSize:18,fontWeight:700,color:'#2D1B2E',lineHeight:1.3,flex:1}}>{selectedEvent.title}</div>
                <button onClick={() => setSelected(null)}
                  style={{background:'#FFF0F4',border:'1.5px solid #FFD0DC',borderRadius:'50%',width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                  <X size={16} color="#FF6B8A"/>
                </button>
              </div>
              {/* Date chip */}
              <span style={{padding:'3px 12px',borderRadius:20,background:'#FFF0F4',border:'1px solid #FFD0DC',display:'inline-flex',alignItems:'center',gap:5,marginBottom:16}}>
                <img src="/images/calendario.png" alt="" style={{width:12,height:12,objectFit:'contain'}}/>
                <span className="caveat" style={{fontSize:12,color:'#FF6B8A',fontWeight:700}}>
                  {new Date(selectedEvent.date).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'})}
                </span>
              </span>
              {/* Photos */}
              {photos.length > 0 ? (
                <>
                  <img src={photos[photoIndex]} alt="" style={{width:'100%',maxHeight:'50vh',objectFit:'contain',borderRadius:16,border:'1.5px solid #FFD0DC',background:'#2D1B2E'}}/>
                  {photos.length > 1 && (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:12}}>
                      <button onClick={() => setPhotoIndex(p=>(p-1+photos.length)%photos.length)}
                        style={{width:34,height:34,borderRadius:'50%',background:'#fff',border:'1.5px solid #FFD0DC',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                        <ChevronLeft size={16} color="#FF6B8A"/>
                      </button>
                      <span className="caveat" style={{fontSize:13,color:'#9B8B95'}}>{photoIndex+1} / {photos.length}</span>
                      <button onClick={() => setPhotoIndex(p=>(p+1)%photos.length)}
                        style={{width:34,height:34,borderRadius:'50%',background:'#fff',border:'1.5px solid #FFD0DC',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                        <ChevronRight size={16} color="#FF6B8A"/>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{textAlign:'center',padding:'24px',background:'#fff',borderRadius:16,border:'1.5px dashed #FFD0DC'}}>
                  <img src="/images/fotos.png" alt="" style={{width:44,height:44,objectFit:'contain',opacity:0.4,marginBottom:8}}/>
                  <p className="caveat" style={{color:'#9B8B95',fontSize:13,margin:0}}>Sin fotos para este momento</p>
                </div>
              )}
              {selectedEvent.description && (
                <p className="caveat" style={{fontSize:14,color:'#2D1B2E',lineHeight:1.7,marginTop:14}}>{selectedEvent.description}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
