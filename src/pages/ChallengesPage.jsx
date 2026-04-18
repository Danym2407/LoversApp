import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function BgDoodles() {
  return (
    <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.25}} viewBox="0 0 390 820" fill="none">
      <text x="355" y="90"  fontSize="12" fill="#E8A020" fontFamily="serif">✦</text>
      <text x="20"  y="160" fontSize="9"  fill="#E05060" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18"  y="420" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <path d="M15 340 Q35 335 43 348" stroke="#E05060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

const DEFAULT_CHALLENGES = [
  { id:1, type:'kiss',       title:'Beso Sorpresa',      description:'Dale un beso sorpresa en un momento inesperado', img:'/images/corazon.png',  accentBg:'#FEE8EC', accentBorder:'#FF6B8A', accentText:'#FF6B8A' },
  { id:2, type:'compliment', title:'Cumplido del Día',   description:'Dale un cumplido sincero que lo/la haga sonreír',  img:'/images/feliz.png',    accentBg:'#FFF8E0', accentBorder:'#D4A520', accentText:'#8A6010' },
  { id:3, type:'surprise',   title:'Sorpresa Romántica', description:'Planea una pequeña sorpresa especial para hoy',   img:'/images/sorpresa.png', accentBg:'#EBF3FF', accentBorder:'#5B8ECC', accentText:'#1A3A7A' },
];

const STAT_IMGS = {
  kiss:       '/images/corazon.png',
  compliment: '/images/feliz.png',
  surprise:   '/images/sorpresa.png',
};

export default function ChallengesPage({ navigateTo }) {
  const [challenges] = useState(DEFAULT_CHALLENGES);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getChallenges()
        .then(rows => {
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

  const totalDone = Object.values(completed).filter(Boolean).length;

  return (
    <div style={{background:'#FFF5F7',minHeight:'100vh',maxWidth:430,margin:'0 auto',position:'relative',overflow:'hidden',paddingBottom:88,fontFamily:"'Lora',Georgia,serif"}}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* ── HEADER ── */}
      <div style={{padding:'48px 20px 18px',background:'#FFF5F7',borderBottom:'1.5px solid #FFD0DC'}}>
        {/* Top row: back + breadcrumb */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
          <button onClick={() => window.history.back()}
            style={{width:32,height:32,borderRadius:'50%',background:'#fff',border:'1.5px solid #FFD0DC',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            <ChevronLeft size={14} color="#FF6B8A" strokeWidth={2.5}/>
          </button>
          <span className="caveat" style={{fontSize:12,color:'#C4AAB0',fontWeight:600}}>Inicio &gt; Retos</span>
        </div>

        {/* Title + icon */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
          <div style={{flex:1,minWidth:0}}>
            <h1 className="lora" style={{fontSize:30,fontWeight:700,color:'#2D1B2E',margin:0,lineHeight:1.1,display:'flex',alignItems:'center',gap:8}}>
              Retos Diarios
              <img src="/images/retos.png" alt="" style={{width:28,height:28,objectFit:'contain'}}/>
            </h1>
            <img src="/images/subrayado1.png" alt="" style={{display:'block',width:'65%',maxWidth:230,margin:'4px 0 8px'}}/>
            <p className="caveat" style={{fontSize:14,color:'#9B8B95',margin:0}}>¡Haz al menos uno hoy! ✨</p>
          </div>
          {/* completed badge */}
          <div style={{flexShrink:0,background:'#FFF0F4',border:'1.5px solid #FFD0DC',borderRadius:16,padding:'8px 14px',textAlign:'center',minWidth:56}}>
            <div className="lora" style={{fontSize:22,fontWeight:700,color:'#FF6B8A',lineHeight:1}}>{totalDone}</div>
            <div className="caveat" style={{fontSize:11,color:'#C4AAB0',fontWeight:600}}>hechos</div>
          </div>
        </div>
      </div>

      <div style={{padding:'16px 20px 0',position:'relative',zIndex:1}}>

        {/* ── STATS STRIP ── */}
        <div style={{background:'#FF6B8A',borderRadius:18,padding:'14px 20px',display:'flex',justifyContent:'space-around',marginBottom:20,boxShadow:'0 4px 16px rgba(255,107,138,0.28)'}}>
          {[
            {type:'kiss',       label:'Besos'},
            {type:'compliment', label:'Cumplidos'},
            {type:'surprise',   label:'Sorpresas'},
          ].map(s => (
            <div key={s.type} style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
              <img src={STAT_IMGS[s.type]} alt="" style={{width:26,height:26,objectFit:'contain',filter:'brightness(0) invert(1)'}}/>
              <div className="caveat" style={{fontSize:22,fontWeight:700,color:'#fff',lineHeight:1}}>{counts[s.type]}</div>
              <div className="caveat" style={{fontSize:11,color:'rgba(255,255,255,0.75)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── CHALLENGE CARDS ── */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {challenges.map((ch, i) => {
            const isDone = !!completed[ch.id];
            return (
              <motion.div key={ch.id}
                initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                whileTap={{scale:0.97}} onClick={() => toggle(ch.id)}
                style={{background: isDone ? '#F4FBF6' : '#fff',
                  borderRadius:18,
                  border:'1.5px solid #FFD0DC',
                  borderLeft: isDone ? '3.5px solid #5BAA6A' : `3.5px solid ${ch.accentBorder}`,
                  padding:'16px',cursor:'pointer',position:'relative',overflow:'hidden'}}>

                {/* watermark deco */}
                <img src={ch.img} alt="" style={{position:'absolute',right:-6,top:'50%',transform:'translateY(-50%)',width:90,height:90,objectFit:'contain',opacity:0.10,pointerEvents:'none',userSelect:'none'}}/>

                {isDone && (
                  <div style={{position:'absolute',inset:0,background:'rgba(91,170,106,0.08)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:17,zIndex:2,pointerEvents:'none'}}>
                    <img src="/images/trofeo.png" alt="" style={{width:44,height:44,objectFit:'contain',opacity:0.35}}/>
                  </div>
                )}

                <div style={{display:'flex',alignItems:'center',gap:14,position:'relative',zIndex:1}}>
                  {/* icon box */}
                  <div style={{flexShrink:0,width:52,height:52,borderRadius:14,background: isDone ? '#D4F0DD' : ch.accentBg,border:'1.5px solid',borderColor: isDone ? '#A8D8A8' : '#FFD0DC',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <img src={ch.img} alt="" style={{width:32,height:32,objectFit:'contain'}}/>
                  </div>

                  {/* content */}
                  <div style={{flex:1,minWidth:0}}>
                    <div className="lora" style={{fontSize:16,fontWeight:700,color:'#2D1B2E',marginBottom:4,lineHeight:1.2}}>{ch.title}</div>
                    <div className="caveat" style={{fontSize:13,color:'#9B8B95',lineHeight:1.5}}>{ch.description}</div>
                    <div style={{marginTop:7,display:'flex',alignItems:'center',gap:5}}>
                      {isDone
                        ? <span className="caveat" style={{fontSize:12,fontWeight:700,background:'#D4F0DD',color:'#2A6A2A',borderRadius:20,padding:'2px 10px',display:'inline-flex',alignItems:'center',gap:4}}>
                            <img src="/images/trofeo.png" style={{width:11,height:11,objectFit:'contain'}}/> ¡Completado!
                          </span>
                        : <span className="caveat" style={{fontSize:12,fontWeight:700,background: ch.accentBg,color: ch.accentText,borderRadius:20,padding:'2px 10px'}}>
                            Toca para completar ✓
                          </span>
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── ADD CUSTOM CHALLENGE ── */}
        <motion.button whileTap={{scale:0.97}}
          style={{marginTop:18,width:'100%',padding:'14px',borderRadius:16,background:'#FF6B8A',border:'2px solid #FF6B8A',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'3px 3px 0 rgba(196,68,100,0.28)'}}>
          <Plus size={18} color="#fff"/>
          <span className="caveat" style={{fontSize:16,fontWeight:700,color:'#fff'}}>Crear Reto Personalizado</span>
        </motion.button>

      </div>
    </div>
  );
}
