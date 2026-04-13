import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}textarea,input{font-family:'Caveat',cursive}`;

const DEFAULT_LETTERS = [
  { id:1, from:'Tú',        title:'Te Amo',          date:'2026-01-20', content:'Quería decirte cuánto significas para mí...', favorite:true },
  { id:2, from:'Tu Pareja', title:'Un Día Especial',  date:'2026-01-15', content:'Este fue uno de nuestros mejores días juntos...', favorite:false },
];

export default function LettersPage({ navigateTo }) {
  const [letters, setLetters]         = useState([]);
  const [received, setReceived]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [selectedIsReceived, setSelectedIsReceived] = useState(false);
  const [showAdd, setShowAdd]         = useState(false);
  const [form, setForm]               = useState({ from:'Tú', title:'', content:'' });
  const [activeTab, setActiveTab]     = useState('sent'); // 'sent' | 'received'

  useEffect(() => {
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getLetters()
        .then(data => setLetters(data))
        .catch(() => setLetters(DEFAULT_LETTERS));
      api.getReceivedLetters()
        .then(data => setReceived(data))
        .catch(() => {});
    } else {
      setLetters(DEFAULT_LETTERS);
    }
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
    <div style={{background:D.cream,minHeight:'100vh',maxWidth:430,margin:'0 auto',position:'relative',overflow:'hidden',paddingBottom:88}}>
      <style>{STYLE}</style>

      {/* Header */}
      <div style={{padding:'48px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1.5px solid ${D.border}`,background:D.cream,position:'sticky',top:0,zIndex:40}}>
        <button onClick={() => selected ? setSelected(null) : navigateTo('dashboard')}
          style={{width:38,height:38,borderRadius:'50%',background:D.white,border:`1.5px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{textAlign:'center'}}>
          <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine,letterSpacing:1}}>Cartas Digitales</div>
          <div className="caveat" style={{fontSize:11,color:D.muted}}>Mensajes del corazón ✦</div>
        </div>
        {!selected ? (
          <button onClick={() => setShowAdd(true)}
            style={{width:38,height:38,borderRadius:'50%',background:D.coral,border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <Plus size={17} color={D.white}/>
          </button>
        ) : <div style={{width:38}}/>}
      </div>

      {/* Tabs */}
      {!selected && (
        <div style={{display:'flex',gap:0,padding:'12px 20px 0',background:D.cream}}>
          {[['sent','✉️ Enviadas'],['received','💌 Recibidas']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className="caveat"
              style={{flex:1,padding:'9px 0',fontWeight:700,fontSize:14,cursor:'pointer',border:'none',
                background:'transparent',color: activeTab===tab ? D.coral : D.muted,
                borderBottom: activeTab===tab ? `2.5px solid ${D.coral}` : `2.5px solid ${D.border}`}}>
              {label}
              {tab==='received' && received.filter(r=>!r.read_at).length > 0 && (
                <span style={{marginLeft:6,background:D.coral,color:'#fff',borderRadius:'50%',fontSize:11,padding:'1px 6px'}}>
                  {received.filter(r=>!r.read_at).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div style={{padding:'20px',position:'relative',zIndex:1}}>
        {!selected ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {(activeTab === 'sent' ? letters : received).map((l,i)=>(
              <motion.div key={l.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                onClick={() => openLetter(l, activeTab === 'received')}
                style={{background:D.white,borderRadius:20,border:`1.5px solid ${D.border}`,
                  borderLeft:`4px solid ${activeTab==='received' && !l.read_at ? D.coral : l.favorite?D.coral:D.gold}`,
                  padding:'16px 18px',cursor:'pointer',position:'relative'}}>
                {activeTab === 'received' && !l.read_at && (
                  <div style={{position:'absolute',top:12,right:16,width:9,height:9,borderRadius:'50%',background:D.coral}}/>
                )}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <span style={{padding:'3px 10px',borderRadius:20,background:`${D.gold}22`,border:`1px solid ${D.gold}55`}}>
                        <span className="caveat" style={{fontSize:12,fontWeight:700,color:D.wine}}>
                          {activeTab==='received' ? `De: ${l.sender_name || l.from_name}` : `De: ${l.from_name || l.from}`}
                        </span>
                      </span>
                      {l.favorite && <span style={{fontSize:16}}>❤️</span>}
                    </div>
                    <div className="lora" style={{fontSize:15,fontWeight:600,color:D.wine,marginBottom:4}}>{l.title}</div>
                    <div className="caveat" style={{fontSize:12,color:D.muted}}>{new Date(l.created_at || l.date).toLocaleDateString('es-ES')}</div>
                  </div>
                  {activeTab === 'sent' && (
                    <button onClick={e=>{e.stopPropagation();deleteLetter(l.id);}}
                      style={{width:32,height:32,borderRadius:10,background:'#FEE8EC',border:`1px solid ${D.coral}33`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
                      <Trash2 size={13} color={D.coral}/>
                    </button>
                  )}
                </div>
                <div style={{fontSize:13,color:'#5A4A42',lineHeight:1.5,marginTop:8,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{l.content}</div>
              </motion.div>
            ))}
            {(activeTab === 'sent' ? letters : received).length === 0 && (
              <div style={{textAlign:'center',padding:'48px 0'}}>
                <div style={{fontSize:36,marginBottom:10}}>{activeTab==='received'?'💌':'✉️'}</div>
                <p className="caveat" style={{fontSize:16,color:D.muted}}>
                  {activeTab==='received' ? 'No tienes cartas recibidas aún' : 'Aún no has escrito ninguna carta'}
                </p>
              </div>
            )}
          </div>
        ) : selectedIsReceived && !selected._opened ? (
          /* Envelope closed — tap to open */
          <motion.div key="envelope" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            onClick={() => setSelected(s => ({...s, _opened:true}))}
            style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',cursor:'pointer'}}>
            <motion.div animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2,ease:'easeInOut'}}>
              <svg width="140" height="100" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="28" width="132" height="68" rx="12" fill="#FEE8EC" stroke="#C44455" strokeWidth="2"/>
                <path d="M4 28 L70 64 L136 28" stroke="#C44455" strokeWidth="2" fill="none"/>
                <path d="M4 28 L70 64 L136 28 L136 28 Q136 18 124 18 L16 18 Q4 18 4 28Z" fill="#F0C4CC"/>
                <text x="60" y="62" fontSize="20" fill="#C44455">♡</text>
                <line x1="28" y1="72" x2="112" y2="72" stroke="#F0C4CC" strokeWidth="1.5" strokeDasharray="5 3"/>
                <line x1="28" y1="84" x2="90" y2="84" stroke="#F0C4CC" strokeWidth="1.5" strokeDasharray="5 3"/>
              </svg>
            </motion.div>
            <p className="caveat" style={{fontSize:22,fontWeight:700,color:D.wine,marginTop:16}}>¡Tienes una carta! 💌</p>
            <p className="caveat" style={{fontSize:15,color:D.muted,marginTop:4}}>De: {selected.sender_name || 'Tu pareja'}</p>
            <p className="caveat" style={{fontSize:13,color:D.coral,marginTop:14}}>Toca para abrir ✦</p>
          </motion.div>
        ) : (
          /* Letter content */
          <motion.div key="letter" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            style={{background:D.white,borderRadius:24,border:`1.5px solid ${D.border}`,borderLeft:`4px solid ${selectedIsReceived ? D.coral : (selected.favorite?D.coral:D.gold)}`,overflow:'hidden'}}>
            <div style={{padding:'20px 20px 14px',borderBottom:`1.5px solid ${D.border}`}}>
              <span style={{padding:'4px 12px',borderRadius:20,background:`${D.gold}22`,border:`1px solid ${D.gold}55`}}>
                <span className="caveat" style={{fontSize:12,fontWeight:700,color:D.wine}}>
                  De: {selectedIsReceived ? (selected.sender_name || 'Tu pareja') : (selected.from_name || selected.from || 'Tú')}
                </span>
              </span>
              <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine,marginTop:12}}>{selected.title}</div>
              <div className="caveat" style={{fontSize:12,color:D.muted,marginTop:2}}>
                {new Date(selected.created_at || selected.date).toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </div>
            </div>
            <div style={{padding:'20px',minHeight:160,borderBottom:`1.5px solid ${D.border}`}}>
              <p className="lora" style={{fontSize:14,color:D.wine,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{selected.content}</p>
            </div>
            {!selectedIsReceived && (
              <div style={{padding:'16px 20px',display:'flex',gap:10}}>
                <button onClick={() => deleteLetter(selected.id)}
                  style={{flex:1,padding:'11px',borderRadius:14,background:'#FEE8EC',border:`1px solid ${D.coral}33`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <Trash2 size={14} color={D.coral}/>
                  <span className="caveat" style={{fontSize:14,fontWeight:700,color:D.coral}}>Borrar</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add letter sheet */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,background:'rgba(28,14,16,0.6)',zIndex:100,display:'flex',alignItems:'flex-end'}}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
              onClick={e=>e.stopPropagation()}
              style={{background:D.cream,borderRadius:'24px 24px 0 0',padding:24,width:'100%',maxHeight:'85vh',overflowY:'auto'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine}}>Nueva Carta</div>
                <button onClick={() => setShowAdd(false)} style={{background:'none',border:'none',cursor:'pointer'}}><X size={20} color={D.muted}/></button>
              </div>
              {[{label:'De',field:'from',type:'text',ph:'Tú'},{label:'Título *',field:'title',type:'text',ph:'Ej. Te amo'}].map(({label,field,type,ph})=>(
                <div key={field} style={{marginBottom:14}}>
                  <label className="caveat" style={{fontSize:13,fontWeight:700,color:D.wine,display:'block',marginBottom:5}}>{label}</label>
                  <input type={type} value={form[field]} onChange={e=>setForm(p=>({...p,[field]:e.target.value}))}
                    placeholder={ph} style={{width:'100%',padding:'11px 14px',borderRadius:12,border:`1.5px solid ${D.border}`,background:D.white,fontSize:14,boxSizing:'border-box'}}/>
                </div>
              ))}
              <div style={{marginBottom:16}}>
                <label className="caveat" style={{fontSize:13,fontWeight:700,color:D.wine,display:'block',marginBottom:5}}>Contenido *</label>
                <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))}
                  placeholder="Escribe desde el corazón..." rows={5}
                  style={{width:'100%',padding:'11px 14px',borderRadius:12,border:`1.5px solid ${D.border}`,background:D.white,fontSize:14,resize:'none',boxSizing:'border-box'}}/>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={() => setShowAdd(false)}
                  style={{flex:1,padding:'13px',borderRadius:16,background:D.white,border:`1.5px solid ${D.border}`,cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:15,fontWeight:700,color:D.muted}}>Cancelar</span>
                </button>
                <button onClick={addLetter}
                  style={{flex:2,padding:'13px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Enviar Carta ✦</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
