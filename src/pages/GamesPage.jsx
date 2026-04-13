import React, { useState } from 'react';
import { ChevronLeft, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function BgDoodles() {
  return (
    <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',opacity:0.18}} viewBox="0 0 390 700" fill="none">
      <text x="355" y="90" fontSize="12" fill="#D4A520" fontFamily="serif">✦</text>
      <text x="18" y="200" fontSize="9" fill="#C44455" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
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
  { id:'question', title:'Preguntas',      desc:'Preguntas profundas para conocerse mejor', icon:'🎲', accent: '#C44455' },
  { id:'truth',    title:'Verdad o Reto',  desc:'Elige verdad o atrévete con un reto',       icon:'🤔', accent: '#D4A520' },
  { id:'dice',     title:'Dado del Amor',  desc:'Lanza el dado y haz lo que diga',            icon:'🎯', accent: '#5B8ECC' },
  { id:'memory',   title:'Recuerdos',      desc:'Revive nuestros momentos favoritos',         icon:'📸', accent: '#5BAA6A' },
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
      <div style={{padding:'48px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1.5px solid ${D.border}`,background:D.cream,position:'sticky',top:0,zIndex:40}}>
        <button onClick={() => selectedGame ? setSelectedGame(null) : navigateTo('dashboard')}
          style={{width:38,height:38,borderRadius:'50%',background:D.white,border:`1.5px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{textAlign:'center'}}>
          <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine,letterSpacing:1}}>{selectedGame ? GAMES.find(g=>g.id===selectedGame)?.title : 'Juegos'}</div>
          <div className="caveat" style={{fontSize:11,color:D.muted}}>Diviértanse juntos ✦</div>
        </div>
        <div style={{width:38}}/>
      </div>

      <div style={{padding:'20px',position:'relative',zIndex:1}}>
        {!selectedGame ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {GAMES.map((g,i)=>(
              <motion.div key={g.id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                whileTap={{scale:0.97}} onClick={() => { setSelectedGame(g.id); setCard(null); setMode(null); setDice(null); }}
                style={{background:D.white,borderRadius:20,border:`1.5px solid ${D.border}`,borderLeft:`4px solid ${g.accent}`,padding:'18px',cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:52,height:52,borderRadius:14,background:`${g.accent}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{g.icon}</div>
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
                  <div style={{fontSize:40,marginBottom:16}}>🎲</div>
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
                  <div style={{fontSize:40,marginBottom:16}}>{mode==='truth'?'🤔':'🎯'}</div>
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
            <div style={{fontSize:48,marginBottom:16}}>📸</div>
            <p className="lora" style={{color:D.muted}}>Próximamente</p>
            <p className="caveat" style={{fontSize:13,color:D.muted,marginTop:6}}>Los recuerdos llegarán pronto ✦</p>
          </div>
        )}
      </div>
    </div>
  );
}
