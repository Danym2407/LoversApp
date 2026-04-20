import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import PageLayout from '@/components/PageLayout';

const STYLE = `textarea,input{font-family:'Caveat',cursive}`;

const DEFAULT_LETTERS = [
  { id:1, from:'Tú',        title:'Te Amo',          date:'2026-01-20', content:'Quería decirte cuánto significas para mí...', favorite:true },
  { id:2, from:'Tu Pareja', title:'Un Día Especial',  date:'2026-01-15', content:'Este fue uno de nuestros mejores días juntos...', favorite:false },
];

export default function LettersPage({ navigateTo, user }) {
  const [letters, setLetters]         = useState([]);
  const [received, setReceived]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [selectedIsReceived, setSelectedIsReceived] = useState(false);
  const [showAdd, setShowAdd]         = useState(false);
  const [form, setForm]               = useState({ from: user?.name || 'Tú', title:'', content:'' });
  const [activeTab, setActiveTab]     = useState('sent'); // 'sent' | 'received'
  const [loadError, setLoadError]     = useState(null);  // null | string

  useEffect(() => {
    const token = localStorage.getItem('loversappToken');
    if (!token) {
      // Not authenticated — nothing to show; no fake DEFAULT_LETTERS
      console.log('[Letters] Sin token — usuario no autenticado');
      return;
    }
    console.log('[Letters] Cargando cartas...');
    api.getLetters()
      .then(data => {
        console.log('[Letters] Enviadas cargadas:', data.length);
        setLetters(data);
        setLoadError(null);
      })
      .catch(err => {
        console.warn('[Letters] getLetters falló:', err.message);
        setLoadError(err.message);
      });
    api.getReceivedLetters()
      .then(data => {
        console.log('[Letters] Recibidas cargadas:', data.length);
        setReceived(data);
      })
      .catch(err => console.warn('[Letters] getReceivedLetters falló:', err.message));
  }, []);

  const deleteLetter = async (id) => {
    setLetters(p => p.filter(l => l.id !== id));
    if (selected?.id === id) setSelected(null);
    const token = localStorage.getItem('loversappToken');
    if (token) api.deleteLetter(id).catch(() => {});
  };

  const openLetter = (l, isReceived = false) => {
    setSelected(l);
    setSelectedIsReceived(isReceived);
    // Mark as read if received and unread
    if (isReceived && !l.read_at) {
      const token = localStorage.getItem('loversappToken');
      if (token) {
        api.markLetterRead(l.id).catch(() => {});
        setReceived(prev => prev.map(r => r.id === l.id ? { ...r, read_at: new Date().toISOString() } : r));
      }
    }
  };

  const addLetter = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const token = localStorage.getItem('loversappToken');
    if (token) {
      try {
        const res = await api.createLetter({
          from_name: form.from || 'Tú',
          title: form.title.trim(),
          content: form.content.trim(),
        });
        // POST returns { id, ok } — build the display object from form data
        const nl = {
          id: res.id,
          from_name: form.from || 'Tú',
          title: form.title.trim(),
          content: form.content.trim(),
          created_at: new Date().toISOString(),
          favorite: false,
        };
        setLetters(p => [nl, ...p]);
      } catch {
        const nl = { id:Date.now(), from_name:form.from||'Tú', title:form.title.trim(),
          content:form.content.trim(), created_at:new Date().toISOString(), favorite:false };
        setLetters(p => [nl, ...p]);
      }
    } else {
      const nl = { id:Date.now(), from:form.from||'Tú', title:form.title.trim(),
        content:form.content.trim(), date:new Date().toISOString().slice(0,10), favorite:false };
      setLetters(p => [nl, ...p]);
    }
    setForm({ from:'Tú', title:'', content:'' });
    setShowAdd(false);
  };

  return (
    <PageLayout>
      <style>{STYLE}</style>

      {/* ── HEADER ── */}
      <div style={{padding:'48px 20px 18px',background:'#FFF5F7',borderBottom:'1.5px solid #FFD0DC'}}>
        {/* Top row: back + add button */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={() => selected ? setSelected(null) : window.history.back()}
              style={{width:32,height:32,borderRadius:'50%',background:'#fff',border:'1.5px solid #FFD0DC',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
              <ChevronLeft size={14} color="#FF6B8A" strokeWidth={2.5}/>
            </button>
            <span className="caveat" style={{fontSize:12,color:'#C4AAB0',fontWeight:600}}>Inicio &gt; Cartas</span>
          </div>
          {!selected && (
            <button onClick={() => setShowAdd(true)}
              style={{width:32,height:32,borderRadius:'50%',background:'#FF6B8A',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'2px 2px 0 rgba(196,68,100,0.28)',flexShrink:0}}>
              <Plus size={16} color="#fff" strokeWidth={2.5}/>
            </button>
          )}
        </div>

        {/* Title */}
        <div style={{flex:1,minWidth:0}}>
          <h1 className="lora" style={{fontSize:30,fontWeight:700,color:'#2D1B2E',margin:0,lineHeight:1.1,display:'flex',alignItems:'center',gap:8}}>
            Cartas
            <img src="/images/mensajes.png" alt="" style={{width:28,height:28,objectFit:'contain'}}/>
          </h1>
          <img src="/images/subrayado1.png" alt="" style={{display:'block',width:'65%',maxWidth:200,margin:'4px 0 8px'}}/>
          <p className="caveat" style={{fontSize:14,color:'#9B8B95',margin:0}}>Mensajes del corazón 💌</p>
        </div>
      </div>

      {/* ── TABS ── */}
      {!selected && (
        <div style={{display:'flex',gap:0,padding:'14px 20px 0',background:'#FFF5F7'}}>
          {[['sent','✉️ Enviadas'],['received','💌 Recibidas']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="caveat"
              style={{flex:1,padding:'10px 0',fontWeight:700,fontSize:15,cursor:'pointer',border:'none',
                background:'transparent',color: activeTab===tab ? '#FF6B8A' : '#C4AAB0',
                borderBottom: activeTab===tab ? '2.5px solid #FF6B8A' : '2.5px solid #FFD0DC'}}>
              {label}
              {tab==='received' && received.filter(r=>!r.read_at).length > 0 && (
                <span style={{marginLeft:6,background:'#FF6B8A',color:'#fff',borderRadius:'50%',fontSize:11,padding:'1px 6px'}}>
                  {received.filter(r=>!r.read_at).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div style={{padding:'16px 20px',position:'relative',zIndex:1}}>
        {/* Error banner — visible in devtools AND on screen so the user knows what failed */}
        {loadError && (
          <div style={{background:'#FFF0F0',border:'1.5px solid #F5A0A0',borderRadius:14,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div>
              <p style={{fontWeight:700,color:'#C0202A',fontSize:14,margin:0}}>Error al cargar las cartas</p>
              <p style={{color:'#9B4A4A',fontSize:13,margin:'4px 0 0'}}>{loadError}</p>
              <p style={{color:'#9B4A4A',fontSize:12,margin:'4px 0 0'}}>Revisa la consola del navegador (F12) para más detalles.</p>
            </div>
          </div>
        )}
        {!selected ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {(activeTab === 'sent' ? letters : received).map((l,i)=>(
              <motion.div key={l.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                onClick={() => openLetter(l, activeTab === 'received')}
                style={{background:'#fff',borderRadius:20,border:'1.5px solid #FFD0DC',
                  borderLeft:`4px solid ${activeTab==='received' && !l.read_at ? '#FF6B8A' : l.favorite ? '#FF6B8A' : '#D4A520'}`,
                  padding:'16px 18px',cursor:'pointer',position:'relative',overflow:'hidden'}}>

                {/* watermark */}
                <img src="/images/mensajes.png" alt="" style={{position:'absolute',right:-4,bottom:-4,width:80,height:80,objectFit:'contain',opacity:0.09,pointerEvents:'none',userSelect:'none'}}/>

                {activeTab === 'received' && !l.read_at && (
                  <div style={{position:'absolute',top:12,right:14,width:9,height:9,borderRadius:'50%',background:'#FF6B8A'}}/>
                )}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative',zIndex:1}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <span style={{padding:'3px 12px',borderRadius:20,background:'#FFF0F4',border:'1px solid #FFD0DC',display:'inline-flex',alignItems:'center',gap:5}}>
                        <img src="/images/mensajes.png" alt="" style={{width:12,height:12,objectFit:'contain'}}/>
                        <span className="caveat" style={{fontSize:13,fontWeight:700,color:'#FF6B8A'}}>
                          {activeTab==='received' ? `De: ${l.sender_name || l.from_name}` : `De: ${l.from_name || l.from}`}
                        </span>
                      </span>
                      {l.favorite && <img src="/images/corazon.png" alt="" style={{width:16,height:16,objectFit:'contain'}}/>}
                    </div>
                    <div className="lora" style={{fontSize:17,fontWeight:700,color:'#2D1B2E',marginBottom:4,lineHeight:1.2}}>{l.title}</div>
                    <div className="caveat" style={{fontSize:13,color:'#9B8B95'}}>{new Date(l.created_at || l.date).toLocaleDateString('es-ES')}</div>
                  </div>
                  {activeTab === 'sent' && (
                    <button onClick={e=>{e.stopPropagation();deleteLetter(l.id);}}
                      style={{width:34,height:34,borderRadius:10,background:'#FFF0F4',border:'1px solid #FFD0DC',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                      <Trash2 size={14} color="#FF6B8A"/>
                    </button>
                  )}
                </div>
                <div className="caveat" style={{fontSize:14,color:'#9B8B95',lineHeight:1.5,marginTop:8,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{l.content}</div>
              </motion.div>
            ))}
            {(activeTab === 'sent' ? letters : received).length === 0 && (
              <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
                style={{textAlign:'center',padding:'48px 24px',background:'#fff',border:'1.5px dashed #FFD0DC',borderRadius:20,marginTop:8}}>
                <img src="/images/mensajes.png" alt="" style={{width:48,height:48,objectFit:'contain',marginBottom:12,opacity:0.5}}/>
                <p className="lora" style={{fontSize:17,fontWeight:600,color:'#2D1B2E',marginBottom:6}}>
                  {activeTab==='received' ? 'No tienes cartas recibidas' : 'Aún no has escrito ninguna carta'}
                </p>
                <p className="caveat" style={{fontSize:15,color:'#9B8B95'}}>
                  {activeTab==='sent' ? '¡Escríbele algo especial! 💌' : 'Tu pareja aún no te ha escrito'}
                </p>
              </motion.div>
            )}
          </div>
        ) : selectedIsReceived && !selected._opened ? (
          /* Envelope closed — tap to open */
          <motion.div key="envelope" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            onClick={() => setSelected(s => ({...s, _opened:true}))}
            style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',cursor:'pointer'}}>
            <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2,ease:'easeInOut'}}>
              <svg width="140" height="100" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="28" width="132" height="68" rx="12" fill="#FFF0F4" stroke="#FF6B8A" strokeWidth="2"/>
                <path d="M4 28 L70 64 L136 28" stroke="#FF6B8A" strokeWidth="2" fill="none"/>
                <path d="M4 28 L70 64 L136 28 L136 28 Q136 18 124 18 L16 18 Q4 18 4 28Z" fill="#FFD0DC"/>
                <text x="60" y="62" fontSize="20" fill="#FF6B8A">♡</text>
                <line x1="28" y1="72" x2="112" y2="72" stroke="#FFD0DC" strokeWidth="1.5" strokeDasharray="5 3"/>
                <line x1="28" y1="84" x2="90" y2="84" stroke="#FFD0DC" strokeWidth="1.5" strokeDasharray="5 3"/>
              </svg>
            </motion.div>
            <p className="lora" style={{fontSize:22,fontWeight:700,color:'#2D1B2E',marginTop:16}}>¡Tienes una carta! 💌</p>
            <p className="caveat" style={{fontSize:16,color:'#9B8B95',marginTop:4}}>De: {selected.sender_name || 'Tu pareja'}</p>
            <p className="caveat" style={{fontSize:14,color:'#FF6B8A',marginTop:14}}>Toca para abrir ✦</p>
          </motion.div>
        ) : (
          /* Letter content */
          <motion.div key="letter" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            style={{background:'#fff',borderRadius:24,border:'1.5px solid #FFD0DC',
              borderLeft:`4px solid ${selectedIsReceived ? '#FF6B8A' : (selected.favorite ? '#FF6B8A' : '#D4A520')}`,
              overflow:'hidden'}}>
            <div style={{padding:'20px 20px 14px',borderBottom:'1.5px solid #FFD0DC'}}>
              <span style={{padding:'4px 14px',borderRadius:20,background:'#FFF0F4',border:'1px solid #FFD0DC',display:'inline-flex',alignItems:'center',gap:6}}>
                <img src="/images/mensajes.png" alt="" style={{width:13,height:13,objectFit:'contain'}}/>
                <span className="caveat" style={{fontSize:13,fontWeight:700,color:'#FF6B8A'}}>
                  De: {selectedIsReceived ? (selected.sender_name || 'Tu pareja') : (selected.from_name || selected.from || 'Tú')}
                </span>
              </span>
              <div className="lora" style={{fontSize:22,fontWeight:700,color:'#2D1B2E',marginTop:12}}>{selected.title}</div>
              <div className="caveat" style={{fontSize:13,color:'#9B8B95',marginTop:2}}>
                {new Date(selected.created_at || selected.date).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </div>
            </div>
            <div style={{padding:'20px',minHeight:160,borderBottom:'1.5px solid #FFD0DC',position:'relative'}}>
              <img src="/images/mensajes.png" alt="" style={{position:'absolute',right:12,bottom:12,width:70,height:70,objectFit:'contain',opacity:0.07,pointerEvents:'none'}}/>
              <p className="lora" style={{fontSize:16,color:'#2D1B2E',lineHeight:1.9,whiteSpace:'pre-wrap',position:'relative',zIndex:1}}>{selected.content}</p>
            </div>
            {!selectedIsReceived && (
              <div style={{padding:'14px 20px',display:'flex',gap:10}}>
                <button onClick={() => deleteLetter(selected.id)}
                  style={{flex:1,padding:'12px',borderRadius:14,background:'#FFF0F4',border:'1.5px solid #FFD0DC',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <Trash2 size={14} color="#FF6B8A"/>
                  <span className="caveat" style={{fontSize:15,fontWeight:700,color:'#FF6B8A'}}>Borrar</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── ADD LETTER SHEET ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(45,27,46,0.55)',zIndex:100,display:'flex',alignItems:'flex-end'}}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{background:'#FFF5F7',borderRadius:'24px 24px 0 0',padding:24,width:'100%',maxHeight:'85vh',overflowY:'auto'}}>
              {/* handle */}
              <div style={{width:40,height:4,borderRadius:4,background:'#FFD0DC',margin:'0 auto 18px'}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <img src="/images/mensajes.png" alt="" style={{width:22,height:22,objectFit:'contain'}}/>
                  <div className="lora" style={{fontSize:20,fontWeight:700,color:'#2D1B2E'}}>Nueva Carta</div>
                </div>
                <button onClick={() => setShowAdd(false)} style={{width:30,height:30,borderRadius:'50%',background:'#FFF0F4',border:'1.5px solid #FFD0DC',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                  <X size={14} color="#FF6B8A"/>
                </button>
              </div>
              {[{label:'De',field:'from',type:'text',ph:'Tú'},{label:'Título *',field:'title',type:'text',ph:'Ej. Te amo'}].map(({label,field,type,ph})=>(
                <div key={field} style={{marginBottom:14}}>
                  <label className="caveat" style={{fontSize:14,fontWeight:700,color:'#2D1B2E',display:'block',marginBottom:5}}>{label}</label>
                  <input type={type} value={form[field]} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                    placeholder={ph} style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1.5px solid #FFD0DC',background:'#fff',fontSize:15,boxSizing:'border-box',outline:'none',color:'#2D1B2E'}}/>
                </div>
              ))}
              <div style={{marginBottom:18}}>
                <label className="caveat" style={{fontSize:14,fontWeight:700,color:'#2D1B2E',display:'block',marginBottom:5}}>Contenido *</label>
                <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}
                  placeholder="Escribe desde el corazón..." rows={5}
                  style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1.5px solid #FFD0DC',background:'#fff',fontSize:15,resize:'none',boxSizing:'border-box',outline:'none',color:'#2D1B2E'}}/>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={() => setShowAdd(false)}
                  style={{flex:1,padding:'13px',borderRadius:16,background:'#FFF0F4',border:'1.5px solid #FFD0DC',cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:15,fontWeight:700,color:'#FF6B8A'}}>Cancelar</span>
                </button>
                <button onClick={addLetter}
                  style={{flex:2,padding:'13px',borderRadius:16,background:'#FF6B8A',border:'none',cursor:'pointer',boxShadow:'3px 3px 0 rgba(196,68,100,0.28)'}}>
                  <span className="caveat" style={{fontSize:16,fontWeight:700,color:'#fff'}}>Enviar Carta 💌</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
