import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function BgDoodles() {
  return (
    <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.2}} viewBox="0 0 390 700" fill="none">
      <text x="355" y="90" fontSize="12" fill="#D4A520" fontFamily="serif">✦</text>
      <text x="20" y="200" fontSize="9" fill="#C44455" fontFamily="serif">✦</text>
      <text x="360" y="320" fontSize="8" fill="#5B8ECC" fontFamily="serif">★</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
    </svg>
  );
}

const DEFAULT_CHALLENGES = [
  { id:1, type:'kiss',       title:'Beso Sorpresa',      description:'Dale un beso sorpresa en un momento inesperado', icon:'💋', accent:D.coral },
  { id:2, type:'compliment', title:'Cumplido del Día',   description:'Dale un cumplido sincero que lo/la haga sonreír',  icon:'😊', accent:D.gold  },
  { id:3, type:'surprise',   title:'Sorpresa Romántica', description:'Planea una cita sorpresa especial',                icon:'🎁', accent:D.blue  },
];

export default function ChallengesPage({ navigateTo }) {
  const [challenges] = useState(DEFAULT_CHALLENGES);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getChallenges()
        .then(rows => {
          // rows = [{ challenge_id, type, completed, completed_at }, ...]
          const map = {};
          rows.forEach(r => { if (r.completed) map[r.challenge_id] = true; });
          setCompleted(map);
        })
        .catch(() => {});
    }
  }, []);

  const toggle = async (id) => {
    const ch = challenges.find(c => c.id === id);
    setCompleted(p => ({ ...p, [id]: !p[id] }));
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.toggleChallenge(id, ch?.type).catch(() => {});
    }
  };

  const counts = { kiss: 0, compliment: 0, surprise: 0 };
  Object.entries(completed).forEach(([id, done]) => {
    if (done) {
      const ch = challenges.find(c => c.id === Number(id));
      if (ch) counts[ch.type]++;
    }
  });

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
          <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine,letterSpacing:1}}>Retos Diarios</div>
          <div className="caveat" style={{fontSize:11,color:D.muted,letterSpacing:1}}>¡Haz uno hoy!</div>
        </div>
        <div style={{width:38}}/>
      </div>

      <div style={{padding:'20px 20px 0',position:'relative',zIndex:1}}>
        {/* Stats strip */}
        <div style={{background:D.wine,borderRadius:18,padding:'16px 20px',display:'flex',justifyContent:'space-around',marginBottom:22}}>
          {[{icon:'💋',label:'Besos',count:counts.kiss},{icon:'😊',label:'Cumplidos',count:counts.compliment},{icon:'🎁',label:'Sorpresas',count:counts.surprise}].map(s=>(
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontSize:22}}>{s.icon}</div>
              <div className="caveat" style={{fontSize:20,fontWeight:700,color:D.white,lineHeight:1}}>{s.count}</div>
              <div className="caveat" style={{fontSize:11,color:'rgba(255,255,255,0.6)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Challenge cards */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {challenges.map((ch,i) => (
            <motion.div key={ch.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
              whileTap={{scale:0.97}} onClick={() => toggle(ch.id)}
              style={{background:D.white,borderRadius:20,border:`1.5px solid ${D.border}`,borderLeft:`4px solid ${ch.accent}`,
                padding:'18px 18px',cursor:'pointer',position:'relative',overflow:'hidden',opacity:completed[ch.id]?0.7:1}}>
              {completed[ch.id] && (
                <div style={{position:'absolute',inset:0,background:'rgba(28,14,16,0.12)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:19,zIndex:2}}>
                  <span style={{fontSize:44}}>✓</span>
                </div>
              )}
              <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                <div style={{width:48,height:48,borderRadius:14,background:`${ch.accent}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>
                  {ch.icon}
                </div>
                <div style={{flex:1}}>
                  <div className="lora" style={{fontSize:16,fontWeight:600,color:D.wine,marginBottom:4}}>{ch.title}</div>
                  <div style={{fontSize:13,color:D.muted,lineHeight:1.5}}>{ch.description}</div>
                  <div className="caveat" style={{fontSize:12,color:ch.accent,marginTop:8,fontWeight:700}}>
                    {completed[ch.id] ? '¡Completado! ✦' : 'Toca para marcar ✓'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add custom challenge CTA */}
        <button style={{marginTop:20,width:'100%',padding:'14px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <Plus size={18} color={D.white}/>
          <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Crear Reto Personalizado</span>
        </button>
      </div>
    </div>
  );
}
