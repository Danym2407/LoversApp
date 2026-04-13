import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, Trash2, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { getCountdownEvents, removeCountdownEventBySource, upsertCalendarEvent } from '@/lib/eventSync';
import { api } from '@/lib/api';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}select,input{font-family:'Caveat',cursive}`;

const ACCENTS = [D.coral,D.gold,D.blue,D.green];

function BgDoodles() {
  return (
    <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.2}} viewBox="0 0 390 700" fill="none">
      <text x="355" y="90" fontSize="12" fill="#D4A520" fontFamily="serif">✦</text>
      <text x="20" y="220" fontSize="9" fill="#C44455" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
    </svg>
  );
}

const defaultCountdowns = [
  { id:1, title:'Viaje a la Playa',  date:'2026-08-14', emoji:'🏖️' },
  { id:2, title:'Cita Sorpresa',     date:'2026-06-25', emoji:'🎁' },
];

export default function CountdownPage({ navigateTo }) {
  const [countdowns, setCountdowns]    = useState([]);
  const [nowTick, setNowTick]          = useState(Date.now());
  const [showAdd, setShowAdd]          = useState(false);
  const [form, setForm]                = useState({ title:'', date:'', emoji:'⏰', sharedWith:'mine' });
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false);
  const [pendingCountdown, setPendingCountdown]     = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = getCountdownEvents();
    const local = stored.length > 0 ? stored : defaultCountdowns;
    setCountdowns(local);
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getCountdowns().then(rows => {
        const apiItems = rows.map(r => ({
          id: `api-${r.id}`,
          apiId: r.id,
          title: r.title,
          date: r.target_date,
          emoji: r.icon || '⏰',
          sharedFromPartner: r.source_type === 'shared-from-partner',
        }));
        setCountdowns(prev => {
          const localApiIds = new Set(prev.filter(c => c.apiId).map(c => String(c.apiId)));
          const newApiItems = apiItems.filter(c => !localApiIds.has(String(c.apiId)));
          return newApiItems.length ? [...prev, ...newApiItems] : prev;
        });
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const calcTime = (dateStr) => {
    void nowTick;
    if (!dateStr) return { days:0, hours:0, minutes:0, seconds:0 };
    const [y,m,d] = dateStr.split('-').map(Number);
    const target = new Date(y, m-1, d, 23, 59, 59);
    const diff = target - new Date();
    if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };

  const fmtDate = (dateStr) => {
    if (!dateStr) return '';
    const [y,m,d] = dateStr.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('es-ES', { weekday:'long', month:'long', day:'numeric' });
  };

  const deleteItem = (item) => {
    if (item.sourceType && item.sourceId) removeCountdownEventBySource(item.sourceType, item.sourceId);
    const updated = countdowns.filter(c => c.id !== item.id);
    setCountdowns(updated);
    localStorage.setItem('countdownEvents', JSON.stringify(updated));
    if (item.apiId) {
      const token = localStorage.getItem('loversappToken');
      if (token) api.deleteCountdown(item.apiId).catch(() => {});
    }
  };

  const addItem = () => {
    if (!form.title.trim() || !form.date) return;
    const newItem = { id: Date.now(), title: form.title.trim(), date: form.date, emoji: form.emoji || '⏰', shared: form.sharedWith === 'both' };
    const updated = [...countdowns, newItem];
    setCountdowns(updated);
    localStorage.setItem('countdownEvents', JSON.stringify(updated));
    const token = localStorage.getItem('loversappToken');
    if (token && form.sharedWith === 'both') {
      api.createCountdown({ title: newItem.title, target_date: newItem.date, icon: newItem.emoji, shared: true })
        .then(res => {
          if (res?.id) {
            setCountdowns(prev => {
              const upd = prev.map(c => c.id === newItem.id ? { ...c, apiId: res.id } : c);
              localStorage.setItem('countdownEvents', JSON.stringify(upd));
              return upd;
            });
          }
        }).catch(() => {});
    }
    setForm({ title:'', date:'', emoji:'⏰', sharedWith:'mine' });
    setShowAdd(false);
    setPendingCountdown(newItem);
    setShowCalendarPrompt(true);
  };

  const addToCalendarFromCountdown = (item) => {
    upsertCalendarEvent({
      title: item.title,
      description: `Countdown: ${item.title}`,
      dateStr: item.date,
      photo: null,
      sourceType: 'countdown',
      sourceId: item.id,
    });
    toast({ title:'Guardado en Calendario ✦', description:`"${item.title}" aparece ahora en el calendario.` });
    setShowCalendarPrompt(false);
    setPendingCountdown(null);
  };

  const dismissCalendarPrompt = () => {
    if (pendingCountdown) toast({ title:'Countdown creado ✦', description:`"${pendingCountdown.title}" guardado.` });
    setShowCalendarPrompt(false);
    setPendingCountdown(null);
  };

  return (
    <div style={{background:D.cream,minHeight:'100vh',maxWidth:430,margin:'0 auto',position:'relative',overflow:'hidden',paddingBottom:88}}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* Header */}
      <div style={{padding:'48px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1.5px solid ${D.border}`,background:D.cream,position:'sticky',top:0,zIndex:40}}>
        <button onClick={() => navigateTo('dashboard')}
          style={{width:38,height:38,borderRadius:'50%',background:D.white,border:`1.5px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{textAlign:'center'}}>
          <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine,letterSpacing:1}}>Countdown</div>
          <div className="caveat" style={{fontSize:11,color:D.muted}}>Cuenta regresiva ✦</div>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{width:38,height:38,borderRadius:'50%',background:D.coral,border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <Plus size={17} color={D.white}/>
        </button>
      </div>

      <div style={{padding:'20px 20px 0',position:'relative',zIndex:1}}>
        {countdowns.length === 0 && (
          <div style={{textAlign:'center',padding:'48px 0'}}>
            <div style={{fontSize:40,marginBottom:12}}>⏰</div>
            <p className="lora" style={{color:D.muted,fontSize:16}}>No hay countdowns aún</p>
            <p className="caveat" style={{color:D.muted,fontSize:13,marginTop:4}}>Toca + para crear uno</p>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {countdowns.map((cd, idx) => {
            const t = calcTime(cd.date);
            const accent = ACCENTS[idx % ACCENTS.length];
            const expired = t.days===0 && t.hours===0 && t.minutes===0 && t.seconds===0;
            return (
              <motion.div key={cd.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:idx*0.08}}
                style={{background:D.white,borderRadius:20,border:`1.5px solid ${D.border}`,borderLeft:`4px solid ${accent}`,padding:'18px 18px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:8,right:12,fontSize:40,opacity:0.12}}>{cd.emoji}</div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                  <span style={{fontSize:22}}>{cd.emoji}</span>
                  <div className="lora" style={{fontSize:16,fontWeight:600,color:D.wine}}>{cd.title}</div>
                  {cd.sharedFromPartner && <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:`${D.blue}18`,border:`1px solid ${D.blue}44`,color:D.blue,fontFamily:'Caveat,cursive',fontWeight:700}}>👫 Pareja</span>}
                  {cd.shared && !cd.sharedFromPartner && <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:`${D.green}18`,border:`1px solid ${D.green}44`,color:D.green,fontFamily:'Caveat,cursive',fontWeight:700}}>👫 Compartido</span>}
                </div>
                <div className="caveat" style={{fontSize:12,color:D.muted,marginBottom:12}}>{fmtDate(cd.date)}</div>

                {expired ? (
                  <div className="caveat" style={{fontSize:18,fontWeight:700,color:D.coral,textAlign:'center',padding:'8px 0'}}>¡Ya llegó el día! 🎉</div>
                ) : (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:10}}>
                    {[{v:t.days,l:'Días'},{v:t.hours,l:'Horas'},{v:t.minutes,l:'Min'},{v:t.seconds,l:'Seg'}].map(item=>(
                      <div key={item.l} style={{background:`${accent}12`,borderRadius:12,border:`1px solid ${accent}44`,padding:'8px 4px',textAlign:'center'}}>
                        <div className="caveat" style={{fontSize:24,fontWeight:700,color:D.wine,lineHeight:1}}>{String(item.v).padStart(2,'0')}</div>
                        <div className="caveat" style={{fontSize:11,color:D.muted}}>{item.l}</div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => deleteItem(cd)}
                  style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:10,background:'#FEE8EC',border:`1px solid ${D.coral}33`,cursor:'pointer'}}>
                  <Trash2 size={12} color={D.coral}/>
                  <span className="caveat" style={{fontSize:12,color:D.coral,fontWeight:700}}>Eliminar</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(28,14,16,0.6)',zIndex:100,display:'flex',alignItems:'flex-end'}}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{background:D.cream,borderRadius:'24px 24px 0 0',padding:24,width:'100%'}}>
              <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine,marginBottom:18}}>Nuevo Countdown</div>
              {[{label:'Título *',field:'title',type:'text',ph:'Ej. Viaje soñado'},{label:'Fecha *',field:'date',type:'date',ph:''},{label:'Emoji',field:'emoji',type:'text',ph:'⏰'}].map(({label,field,type,ph})=>(
                <div key={field} style={{marginBottom:14}}>
                  <label className="caveat" style={{fontSize:13,fontWeight:700,color:D.wine,display:'block',marginBottom:5}}>{label}</label>
                  <input type={type} value={form[field]} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                    placeholder={ph} style={{width:'100%',padding:'11px 14px',borderRadius:12,border:`1.5px solid ${D.border}`,background:D.white,fontSize:14,boxSizing:'border-box'}}/>
                </div>
              ))}
              {/* Visibility */}
              <div style={{marginBottom:14}}>
                <label className="caveat" style={{fontSize:13,fontWeight:700,color:D.wine,display:'block',marginBottom:8}}>¿Para quién?</label>
                <div style={{display:'flex',gap:8}}>
                  {[{val:'mine',label:'👤 Solo para mí'},{val:'both',label:'👫 Para los dos'}].map(({val,label}) => (
                    <button key={val} type="button" onClick={() => setForm(p => ({...p, sharedWith:val}))}
                      style={{flex:1,padding:'10px',borderRadius:12,cursor:'pointer',
                        border:`1.5px solid ${form.sharedWith===val ? D.coral : D.border}`,
                        background: form.sharedWith===val ? '#FEE8EC' : D.white}}>
                      <span className="caveat" style={{fontSize:13,fontWeight:700,color:form.sharedWith===val ? D.coral : D.muted}}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:10,paddingTop:4}}>
                <button onClick={() => setShowAdd(false)}
                  style={{flex:1,padding:'13px',borderRadius:16,background:D.white,border:`1.5px solid ${D.border}`,cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:15,fontWeight:700,color:D.muted}}>Cancelar</span>
                </button>
                <button onClick={addItem}
                  style={{flex:2,padding:'13px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Guardar ✦</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Prompt */}
      <AnimatePresence>
        {showCalendarPrompt && pendingCountdown && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(28,14,16,0.6)',zIndex:110,display:'flex',alignItems:'flex-end'}}
            onClick={dismissCalendarPrompt}>
            <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{background:D.cream,borderRadius:'24px 24px 0 0',padding:'28px 24px',width:'100%'}}>
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{fontSize:42,marginBottom:10}}>📅</div>
                <div className="lora" style={{fontSize:18,fontWeight:600,color:D.wine,marginBottom:8}}>¿Agregar al Calendario?</div>
                <p className="caveat" style={{fontSize:15,color:D.muted,lineHeight:1.5}}>
                  ¿Quieres registrar <strong style={{color:D.wine}}>"{pendingCountdown.title}"</strong> en tu calendario también?
                </p>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={dismissCalendarPrompt}
                  style={{flex:1,padding:'13px',borderRadius:16,background:D.white,border:`1.5px solid ${D.border}`,cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:15,fontWeight:700,color:D.muted}}>No, gracias</span>
                </button>
                <button onClick={() => addToCalendarFromCountdown(pendingCountdown)}
                  style={{flex:2,padding:'13px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Sí, agregar ✦</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
