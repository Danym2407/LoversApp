import React, { useState } from 'react';
import { ChevronLeft, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const D = { cream:'#FFF5F7', wine:'#2D1B2E', coral:'#FF6B8A', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#FFD0DC', white:'#FFFFFF', border:'#FFD0DC', muted:'#9B8B95' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function BgDoodles() {
  return (
    <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', opacity:0.25 }} viewBox="0 0 390 820" fill="none" aria-hidden>
      <text x="355" y="90" fontSize="12" fill="#E8A020" fontFamily="serif">✦</text>
      <text x="20" y="160" fontSize="9" fill="#E05060" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8" fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18" y="420" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <path d="M30 320 Q50 300 70 320 Q90 340 110 320" stroke="#E05060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

const QUESTIONS = [
  "¿Cuál es tu recuerdo favorito juntos?","¿Qué es lo que más admiras de mí?","Si pudieras ir a cualquier lugar del mundo, ¿a dónde irías?",
  "¿Cuál ha sido nuestra mejor cita hasta ahora?","¿Qué canción te recuerda a nosotros?","¿Qué sueño compartes y aún no has cumplido?",
  "¿Qué es lo que más te gusta de nuestra relación?","¿Cuál fue el momento en que te diste cuenta que me amabas?",
];
const TRUTHS = [
  "¿Cuál es tu mayor inseguridad?","¿Qué te da más miedo del futuro?","¿Alguna vez has mentido sobre algo importante?",
  "¿Qué es lo que más te cuesta perdonar?",
];
const DARES = [
  "Canta una canción romántica","Escribe un mensaje de amor y léelo en voz alta","Haz un baile improvisado de 30 segundos",
  "Di 3 cosas que te gustan de tu pareja",
];

const GAMES = [
  { id:'question', title:'Preguntas',      desc:'Preguntas profundas para conocerse mejor', icon:'/images/descubrir.png',   accent: '#FF6B8A' },
  { id:'truth',    title:'Verdad o Reto',  desc:'Elige verdad o atrévete con un reto',       icon:'/images/retos.png',       accent: '#D4A520' },
  { id:'dice',     title:'Dado del Amor',  desc:'Lanza el dado y haz lo que diga',            icon:'/images/videojuegos.png', accent: '#5B8ECC' },
  { id:'memory',   title:'Recuerdos',      desc:'Revive nuestros momentos favoritos',         icon:'/images/recuerdos.png',   accent: '#5BAA6A' },
];

export default function GamesPage({ navigateTo }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [card, setCard]   = useState(null);
  const [mode, setMode]   = useState(null); // 'truth' | 'dare'
  const [dice, setDice]   = useState(null);
  const [rolling, setRolling] = useState(false);

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const rollDice = () => {
    setRolling(true);
    setTimeout(() => { setDice(Math.floor(Math.random()*6)+1); setRolling(false); }, 600);
  };

  const dice_faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];

  return (
    <div style={{background:D.cream,minHeight:'100vh',maxWidth:430,margin:'0 auto',position:'relative',overflow:'hidden',paddingBottom:88}}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* Header */}
      <div style={{ padding:'48px 20px 18px', background:D.cream, borderBottom:`1.5px solid ${D.border}`, position:'relative', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => selectedGame ? setSelectedGame(null) : window.history.back()}
              style={{ width:32, height:32, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <ChevronLeft size={14} color={D.coral} strokeWidth={2.5}/>
            </button>
            <span className="caveat" style={{ fontSize:12, color:'#C4AAB0', fontWeight:600 }}>
              {selectedGame ? `Inicio > Juegos > ${GAMES.find(g=>g.id===selectedGame)?.title}` : 'Inicio > Juegos'}
            </span>
          </div>
        </div>
        <h1 className="lora" style={{ fontSize:30, fontWeight:700, color:D.wine, margin:0, display:'flex', alignItems:'center', gap:8 }}>
          {selectedGame ? GAMES.find(g=>g.id===selectedGame)?.title : 'Juegos'}
          <img src="/images/videojuegos.png" alt="" style={{ width:28, height:28, objectFit:'contain' }}/>
        </h1>
        <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'65%', maxWidth:220, margin:'4px 0 8px' }}/>
        <p className="caveat" style={{ fontSize:14, color:D.muted, margin:0 }}>Diviértanse juntos ✦</p>
      </div>

      <div style={{padding:'20px',position:'relative',zIndex:1}}>
        {!selectedGame ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {GAMES.map((g,i)=>(
              <motion.div key={g.id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                whileTap={{scale:0.97}} onClick={() => { setSelectedGame(g.id); setCard(null); setMode(null); setDice(null); }}
                style={{background:D.white,borderRadius:20,border:`1.5px solid ${D.border}`,borderLeft:`4px solid ${g.accent}`,padding:'18px',cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:52,height:52,borderRadius:14,background:`${g.accent}18`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <img src={g.icon} alt="" style={{width:32,height:32,objectFit:'contain'}}/>
                </div>
                <div>
                  <div className="lora" style={{fontSize:16,fontWeight:600,color:D.wine}}>{g.title}</div>
                  <div className="caveat" style={{fontSize:13,color:D.muted}}>{g.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : selectedGame === 'question' ? (
          <div style={{textAlign:'center'}}>
            <AnimatePresence mode="wait">
              {card && (
                <motion.div key={card} initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
                  style={{background:D.white,borderRadius:24,border:`1.5px solid ${D.border}`,padding:'32px 24px',marginBottom:24,borderLeft:`4px solid ${D.coral}`}}>
                  <img src="/images/descubrir.png" alt="" style={{width:40,height:40,objectFit:'contain',marginBottom:16}}/>
                  <p className="lora" style={{fontSize:17,color:D.wine,lineHeight:1.6}}>{card}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setCard(getRandom(QUESTIONS))}
              style={{width:'100%',padding:'14px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer'}}>
              <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>{card ? 'Otra Pregunta ✦' : 'Obtener Pregunta ✦'}</span>
            </button>
          </div>
        ) : selectedGame === 'truth' ? (
          <div style={{textAlign:'center'}}>
            <div style={{display:'flex',gap:10,marginBottom:20}}>
              {['truth','dare'].map(m=>(
                <button key={m} onClick={() => { setMode(m); setCard(m==='truth'?getRandom(TRUTHS):getRandom(DARES)); }}
                  style={{flex:1,padding:'12px',borderRadius:14,background:mode===m?D.wine:D.white,border:`1.5px solid ${mode===m?D.wine:D.border}`,cursor:'pointer'}}>
                  <span className="caveat" style={{fontSize:16,fontWeight:700,color:mode===m?D.white:D.muted}}>{m==='truth'?'Verdad':'Reto'}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {card && (
                <motion.div key={card} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
                  style={{background:D.white,borderRadius:24,border:`1.5px solid ${D.border}`,padding:'32px 24px',marginBottom:16,borderLeft:`4px solid ${mode==='truth'?D.coral:D.gold}`}}>
                  <img src={mode==='truth'?'/images/retos.png':'/images/logros.png'} alt="" style={{width:40,height:40,objectFit:'contain',marginBottom:16}}/>
                  <p className="lora" style={{fontSize:17,color:D.wine,lineHeight:1.6}}>{card}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {mode && <button onClick={() => setCard(mode==='truth'?getRandom(TRUTHS):getRandom(DARES))}
              style={{width:'100%',padding:'14px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer'}}>
              <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Otro ✦</span>
            </button>}
          </div>
        ) : selectedGame === 'dice' ? (
          <div style={{textAlign:'center'}}>
            <motion.div animate={{rotate:rolling?[0,360]:0}} transition={{duration:0.6}}
              style={{fontSize:100,lineHeight:1,marginBottom:24,display:'block'}}>
              {dice ? dice_faces[dice-1] : '🎲'}
            </motion.div>
            <p className="caveat" style={{fontSize:15,color:D.muted,marginBottom:24}}>
              {dice ? `Sacaste un ${dice} — ¡a cumplir!` : 'Lanza el dado'}
            </p>
            <button onClick={rollDice} disabled={rolling}
              style={{width:'100%',padding:'14px',borderRadius:16,background:D.wine,border:'none',cursor:'pointer'}}>
              <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>{rolling?'Lanzando...':'Lanzar Dado ✦'}</span>
            </button>
          </div>
        ) : (
          <div style={{textAlign:'center',padding:'32px 0'}}>
            <img src="/images/recuerdos.png" alt="" style={{width:48,height:48,objectFit:'contain',marginBottom:16}}/>
            <p className="lora" style={{color:D.muted}}>Próximamente</p>
            <p className="caveat" style={{fontSize:13,color:D.muted,marginTop:6}}>Los recuerdos llegarán pronto ✦</p>
          </div>
        )}
      </div>
    </div>
  );
}
