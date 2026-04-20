import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Heart, SkipForward, Trophy, Star, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { D } from '@/design-system/tokens';
import BgDoodles from '@/design-system/BgDoodles';
import { api, isAuthenticated } from '@/lib/api';

// ─── Content catalog ──────────────────────────────────────────────────────────
const QUESTIONS = [
  { id:'q1',  text:'¿Cuál es tu recuerdo favorito juntos?' },
  { id:'q2',  text:'¿Qué es lo que más admiras de mí?' },
  { id:'q3',  text:'Si pudieras ir a cualquier lugar del mundo, ¿a dónde irías?' },
  { id:'q4',  text:'¿Cuál ha sido nuestra mejor cita hasta ahora?' },
  { id:'q5',  text:'¿Qué canción te recuerda a nosotros?' },
  { id:'q6',  text:'¿Qué sueño compartes y aún no has cumplido?' },
  { id:'q7',  text:'¿Qué es lo que más te gusta de nuestra relación?' },
  { id:'q8',  text:'¿Cuál fue el momento en que te diste cuenta que me amabas?' },
  { id:'q9',  text:'Si pudieras cambiar una cosa de nuestras primeras semanas, ¿qué sería?' },
  { id:'q10', text:'¿Cuál es el pequeño detalle que más te hace sonreír de mí?' },
  { id:'q11', text:'¿Cómo nos imaginas en 5 años?' },
  { id:'q12', text:'¿Qué cosa nueva te gustaría aprender conmigo?' },
];

const TRUTHS = [
  { id:'t1', text:'¿Cuál es tu mayor inseguridad?' },
  { id:'t2', text:'¿Qué te da más miedo del futuro?' },
  { id:'t3', text:'¿Alguna vez has mentido sobre algo importante?' },
  { id:'t4', text:'¿Qué es lo que más te cuesta perdonar?' },
  { id:'t5', text:'¿Cuál es la cosa más atrevida que has pensado hacer juntos?' },
  { id:'t6', text:'¿Hay algo que nunca me has dicho y crees que debería saber?' },
  { id:'t7', text:'¿Qué es lo que más extrañarías de mí si tuviéramos que estar separados?' },
  { id:'t8', text:'¿Cuál fue el momento en que más te sentiste solo/a a pesar de estar conmigo?' },
];

const DARES = [
  { id:'d1', text:'Canta una canción romántica' },
  { id:'d2', text:'Escribe un mensaje de amor y léelo en voz alta' },
  { id:'d3', text:'Haz un baile improvisado de 30 segundos' },
  { id:'d4', text:'Di 3 cosas que te gustan de tu pareja' },
  { id:'d5', text:'Imita a tu pareja en su momento más gracioso' },
  { id:'d6', text:'Envíale un voice note diciéndole cuánto la/lo amas ahora mismo' },
  { id:'d7', text:'Prepara algo dulce juntos en los próximos 10 minutos' },
  { id:'d8', text:'Cuéntale un secreto que nunca le hayas contado' },
];

const DICE_RESULTS = [
  { face:'⚀', value:1, category:'Pregunta profunda',    icon:'💭', color:D.coral,   desc:'¿Listos para conocerse más?',                            action:'question'  },
  { face:'⚁', value:2, category:'Reto',                 icon:'🎯', color:D.gold,    desc:'¡Hora de atreverse!',                                    action:'dare'      },
  { face:'⚂', value:3, category:'Verdad',               icon:'🔍', color:D.blue,    desc:'Sin mentiras esta vez...',                               action:'truth'     },
  { face:'⚃', value:4, category:'Actividad en pareja',  icon:'💑', color:D.green,   desc:'Elijan una actividad de su lista de citas',              action:'activity'  },
  { face:'⚄', value:5, category:'Recuerdo de cita',     icon:'📸', color:'#9B6B9E', desc:'Hablen de su cita favorita juntos',                      action:'memory'    },
  { face:'⚅', value:6, category:'Sorpresa',             icon:'🎁', color:'#E07B39', desc:'El que lanzó el dado debe hacer una sorpresa hoy',        action:'surprise'  },
];

const GAMES = [
  { id:'question', title:'Preguntas',      desc:'Preguntas profundas para conocerse mejor', icon:'/images/descubrir.png',   accent: D.coral },
  { id:'truth',    title:'Verdad o Reto',  desc:'Elige verdad o atrévete con un reto',       icon:'/images/retos.png',       accent: D.gold  },
  { id:'dice',     title:'Dado del Amor',  desc:'Motor de decisiones para su relación',       icon:'/images/videojuegos.png', accent: D.blue  },
  { id:'memory',   title:'Memorias',       desc:'Sus citas completadas, momentos y logros',   icon:'/images/recuerdos.png',   accent: D.green },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusBadge(contentId, interactions) {
  const found = interactions.find(i => i.content_id === contentId);
  if (!found) return null;
  if (found.status === 'liked')    return { label:'❤️ Favorita', color: D.coral };
  if (found.status === 'answered') return { label:'✓ Ya hecho',  color: D.green };
  if (found.status === 'skipped')  return { label:'↷ Saltada',   color: D.muted };
  return null;
}

// ─── Shared card component ────────────────────────────────────────────────────
function ContentCard({ item, accent, icon, interactions, onAction, onLike, onSkip, allSeen }) {
  const badge = item ? getStatusBadge(item.id, interactions) : null;
  return (
    <AnimatePresence mode="wait">
      {item && (
        <motion.div key={item.id}
          initial={{ opacity:0, y:-18, scale:0.97 }}
          animate={{ opacity:1, y:0,   scale:1    }}
          exit    ={{ opacity:0, y:18,  scale:0.97 }}
          transition={{ type:'spring', stiffness:340, damping:28 }}
          style={{
            background: D.white, borderRadius: 24,
            border: `1.5px solid ${D.border}`,
            borderLeft: `4px solid ${accent}`,
            padding: '28px 22px', marginBottom: 18,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background:`${accent}14`, pointerEvents:'none' }}/>

          {badge && (
            <div style={{ position:'absolute', top:14, right:14, background:`${badge.color}18`, border:`1px solid ${badge.color}44`, borderRadius:20, padding:'3px 10px' }}>
              <span className="caveat" style={{ fontSize:12, color:badge.color, fontWeight:700 }}>{badge.label}</span>
            </div>
          )}
          {allSeen && !badge && (
            <div style={{ position:'absolute', top:14, right:14, background:`${D.gold}18`, border:`1px solid ${D.gold}44`, borderRadius:20, padding:'3px 10px' }}>
              <span className="caveat" style={{ fontSize:11, color:D.gold }}>↺ repetida</span>
            </div>
          )}

          <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{ width:44, height:44, borderRadius:14, flexShrink:0, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src={icon} alt="" style={{ width:28, height:28, objectFit:'contain' }}/>
            </div>
            <p className="lora" style={{ fontSize:16, color:D.wine, lineHeight:1.65, margin:0, flex:1, paddingTop:4 }}>
              {item.text}
            </p>
          </div>

          <div style={{ display:'flex', gap:8, marginTop:20, justifyContent:'flex-end' }}>
            <button onClick={() => onSkip(item)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:12, border:`1.5px solid ${D.border}`, background:D.cream, cursor:'pointer', fontFamily:"'Caveat',cursive", fontSize:13, color:D.muted }}>
              <SkipForward size={13}/> Saltar
            </button>
            <button onClick={() => onAction(item)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:12, border:`1.5px solid ${D.green}44`, background:`${D.green}14`, cursor:'pointer', fontFamily:"'Caveat',cursive", fontSize:13, color:D.green, fontWeight:700 }}>
              ✓ Hecho
            </button>
            <button onClick={() => onLike(item)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:12, border:`1.5px solid ${D.coral}44`, background:badge?.color===D.coral?`${D.coral}20`:`${D.coral}10`, cursor:'pointer', fontFamily:"'Caveat',cursive", fontSize:13, color:D.coral }}>
              <Heart size={13} fill={badge?.color===D.coral ? D.coral : 'none'}/>
              {badge?.color===D.coral ? 'Guardada' : 'Guardar'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Dice roller ──────────────────────────────────────────────────────────────
function DiceRoller({ onResult }) {
  const [rolling, setRolling]     = useState(false);
  const [result, setResult]       = useState(null);
  const [showing, setShowing]     = useState(false);
  const [faceIndex, setFaceIndex] = useState(0);
  const intervalRef = useRef(null);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setShowing(false);
    setResult(null);
    let ticks = 0;
    const maxTicks = 18;
    intervalRef.current = setInterval(() => {
      ticks++;
      setFaceIndex(Math.floor(Math.random() * 6));
      if (ticks >= maxTicks) {
        clearInterval(intervalRef.current);
        const final = Math.floor(Math.random() * 6);
        setFaceIndex(final);
        const r = DICE_RESULTS[final];
        setResult(r);
        setRolling(false);
        setShowing(true);
        onResult && onResult(r);
      }
    }, 60 + ticks * 8);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div style={{ textAlign:'center' }}>
      <motion.div
        animate={rolling ? { rotate:[0,15,-15,10,-10,0], scale:[1,1.08,0.96,1.04,1] } : { rotate:0, scale:1 }}
        transition={{ duration:0.3, repeat: rolling ? Infinity : 0 }}
        style={{ fontSize:96, lineHeight:1, marginBottom:16, display:'block', userSelect:'none' }}
      >
        {DICE_RESULTS[faceIndex].face}
      </motion.div>

      <AnimatePresence>
        {showing && result && (
          <motion.div
            initial={{ opacity:0, y:14, scale:0.95 }}
            animate={{ opacity:1, y:0,  scale:1    }}
            exit   ={{ opacity:0, y:-8              }}
            style={{ background:D.white, borderRadius:20, border:`2px solid ${result.color}55`, padding:'20px 18px', marginBottom:20, boxShadow:`0 4px 20px ${result.color}22` }}
          >
            <div style={{ fontSize:28, marginBottom:6 }}>{result.icon}</div>
            <p className="lora" style={{ fontSize:18, fontWeight:700, color:result.color, margin:'0 0 6px' }}>{result.category}</p>
            <p className="caveat" style={{ fontSize:14, color:D.muted, margin:0, lineHeight:1.5 }}>{result.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showing && !rolling && (
        <p className="caveat" style={{ fontSize:15, color:D.muted, marginBottom:20 }}>Lanza el dado para decidir qué hacer 🎲</p>
      )}

      <button onClick={roll} disabled={rolling}
        style={{ width:'100%', padding:'14px', borderRadius:16, background:rolling?D.muted:D.wine, border:'none', cursor:rolling?'not-allowed':'pointer', transition:'background 0.2s' }}>
        <span className="caveat" style={{ fontSize:16, fontWeight:700, color:D.white }}>
          {rolling ? 'Girando...' : result ? 'Volver a lanzar ✦' : 'Lanzar Dado ✦'}
        </span>
      </button>
    </div>
  );
}

// ─── Memories tab ─────────────────────────────────────────────────────────────
function MemoriesTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { setLoading(false); return; }
    api.getGameMemories()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign:'center', padding:'40px 0' }}>
      <p className="caveat" style={{ color:D.muted, fontSize:15 }}>Cargando memorias...</p>
    </div>
  );

  if (!isAuthenticated()) return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <span style={{ fontSize:40 }}>🔐</span>
      <p className="lora" style={{ color:D.muted, marginTop:12 }}>Inicia sesión para ver tus memorias</p>
    </div>
  );

  const empty = !data?.completedDates?.length && !data?.moments?.length && !data?.achievements?.length;
  if (empty) return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <span style={{ fontSize:40 }}>📖</span>
      <p className="lora" style={{ color:D.wine, marginTop:12, fontWeight:600 }}>Aquí aparecerán sus memorias</p>
      <p className="caveat" style={{ fontSize:13, color:D.muted, marginTop:4 }}>Completen citas, guarden momentos y desbloqueen logros ✦</p>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {data.completedDates?.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <BookOpen size={15} color={D.coral}/>
            <span className="lora" style={{ fontSize:14, fontWeight:700, color:D.wine }}>Citas completadas</span>
            <span className="caveat" style={{ fontSize:12, background:`${D.coral}18`, color:D.coral, borderRadius:20, padding:'1px 8px' }}>{data.completedDates.length}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {data.completedDates.map((d, i) => (
              <motion.div key={d.date_item_id}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                style={{ background:D.white, borderRadius:14, padding:'12px 14px', border:`1.5px solid ${D.border}`, borderLeft:`3px solid ${D.coral}`, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>🗓️</span>
                <div>
                  <p className="lora" style={{ fontSize:13, fontWeight:600, color:D.wine, margin:0 }}>Cita #{d.date_item_id}</p>
                  {d.scheduled_date && (
                    <p className="caveat" style={{ fontSize:12, color:D.muted, margin:'1px 0 0' }}>
                      {new Date(d.scheduled_date).toLocaleDateString('es-MX', { month:'short', day:'numeric', year:'numeric' })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {data.moments?.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <Star size={15} color={D.gold}/>
            <span className="lora" style={{ fontSize:14, fontWeight:700, color:D.wine }}>Momentos guardados</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {data.moments.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                style={{ background:D.white, borderRadius:14, padding:'12px 14px', border:`1.5px solid ${D.border}`, borderLeft:`3px solid ${D.gold}`, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>{m.image || '📸'}</span>
                <div>
                  <p className="lora" style={{ fontSize:13, fontWeight:600, color:D.wine, margin:0 }}>{m.title}</p>
                  <p className="caveat" style={{ fontSize:12, color:D.muted, margin:'1px 0 0' }}>{m.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {data.achievements?.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <Trophy size={15} color={D.gold}/>
            <span className="lora" style={{ fontSize:14, fontWeight:700, color:D.wine }}>Logros desbloqueados</span>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {data.achievements.map((a, i) => (
              <motion.div key={a.achievement_id}
                initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.04 }}
                style={{ background:`${D.gold}14`, border:`1.5px solid ${D.gold}44`, borderRadius:14, padding:'9px 13px', display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ fontSize:18 }}>{a.icon}</span>
                <span className="caveat" style={{ fontSize:13, color:D.wine, fontWeight:600 }}>{a.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GamesPage({ navigateTo }) {
  const [selectedGame, setSelectedGame]   = useState(null);
  const [interactions, setInteractions]   = useState({ question:[], truth:[], dare:[], dice:[] });
  const [currentItem, setCurrentItem]     = useState(null);
  const [allSeenFlag, setAllSeenFlag]     = useState(false);
  const [mode, setMode]                   = useState(null);
  const authenticated = isAuthenticated();

  const loadInteractions = useCallback(async (gameType) => {
    if (!authenticated) return;
    try {
      const rows = await api.getGameInteractions(gameType);
      setInteractions(prev => ({ ...prev, [gameType]: rows }));
    } catch {}
  }, [authenticated]);

  const recordInteraction = useCallback(async (gameType, contentId, status) => {
    setInteractions(prev => {
      const list = prev[gameType] || [];
      const idx  = list.findIndex(i => i.content_id === contentId);
      const entry = { game_type:gameType, content_id:contentId, status };
      if (idx >= 0) { const c=[...list]; c[idx]={...c[idx],...entry}; return {...prev,[gameType]:c}; }
      return { ...prev, [gameType]:[...list, entry] };
    });
    if (!authenticated) return;
    try { await api.upsertGameInteraction(gameType, contentId, status); } catch {}
  }, [authenticated]);

  const selectGame = (gameId) => {
    setSelectedGame(gameId);
    setCurrentItem(null);
    setMode(null);
    setAllSeenFlag(false);
    if (gameId !== 'dice' && gameId !== 'memory') loadInteractions(gameId);
  };

  const drawCard = (catalog, gameType) => {
    const list = interactions[gameType] || [];
    const seenIds = new Set(list.map(i => i.content_id));
    const unseen = catalog.filter(c => !seenIds.has(c.id));
    const isAllSeen = unseen.length === 0;
    setAllSeenFlag(isAllSeen);
    const pool = isAllSeen ? catalog : unseen;
    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentItem(item);
    if (item) recordInteraction(gameType, item.id, 'seen');
  };

  const getGt = () => selectedGame === 'truth' ? mode : selectedGame;

  const handleDone = (item) => recordInteraction(getGt(), item.id, 'answered');
  const handleLike = (item) => {
    const gt = getGt();
    const cur = (interactions[gt]||[]).find(i=>i.content_id===item.id);
    recordInteraction(gt, item.id, cur?.status==='liked' ? 'answered' : 'liked');
  };
  const handleSkip = (item) => {
    const gt = getGt();
    recordInteraction(gt, item.id, 'skipped');
    drawCard(selectedGame==='question' ? QUESTIONS : (mode==='truth' ? TRUTHS : DARES), gt);
  };

  const handleReset = async (gameType) => {
    if (authenticated) { try { await api.resetGameInteractions(gameType); } catch {} }
    setInteractions(prev => ({ ...prev, [gameType]:[] }));
    setAllSeenFlag(false);
    setCurrentItem(null);
  };

  const currentGame = GAMES.find(g => g.id === selectedGame);

  return (
    <div style={{ background:D.cream, minHeight:'100vh', maxWidth:430, margin:'0 auto', position:'relative', overflow:'hidden', paddingBottom:88 }}>
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
              {selectedGame ? `Inicio > Juegos > ${currentGame?.title}` : 'Inicio > Juegos'}
            </span>
          </div>
        </div>
        <h1 className="lora" style={{ fontSize:30, fontWeight:700, color:D.wine, margin:0, display:'flex', alignItems:'center', gap:8 }}>
          {selectedGame ? currentGame?.title : 'Juegos'}
          <img src="/images/videojuegos.png" alt="" style={{ width:28, height:28, objectFit:'contain' }}/>
        </h1>
        <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'65%', maxWidth:220, margin:'4px 0 8px' }}/>
        <p className="caveat" style={{ fontSize:14, color:D.muted, margin:0 }}>Diviértanse juntos ✦</p>
      </div>

      <div style={{ padding:'20px', position:'relative', zIndex:1 }}>

        {/* ── Game list ─────────────────────────────────────────── */}
        {!selectedGame && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {GAMES.map((g, i) => {
              const liked = (interactions[g.id]||[]).filter(x=>x.status==='liked').length;
              return (
                <motion.div key={g.id}
                  initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                  whileTap={{ scale:0.97 }}
                  onClick={() => selectGame(g.id)}
                  style={{ background:D.white, borderRadius:20, border:`1.5px solid ${D.border}`, borderLeft:`4px solid ${g.accent}`, padding:'18px', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:`${g.accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <img src={g.icon} alt="" style={{ width:32, height:32, objectFit:'contain' }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="lora" style={{ fontSize:16, fontWeight:600, color:D.wine }}>{g.title}</div>
                    <div className="caveat" style={{ fontSize:13, color:D.muted }}>{g.desc}</div>
                  </div>
                  {liked > 0 && (
                    <div style={{ background:`${D.coral}18`, border:`1px solid ${D.coral}44`, borderRadius:20, padding:'3px 9px', display:'flex', alignItems:'center', gap:4 }}>
                      <Heart size={11} color={D.coral} fill={D.coral}/>
                      <span className="caveat" style={{ fontSize:12, color:D.coral, fontWeight:700 }}>{liked}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Questions ─────────────────────────────────────────── */}
        {selectedGame === 'question' && (
          <div>
            <ContentCard item={currentItem} accent={D.coral} icon="/images/descubrir.png"
              interactions={interactions.question} onAction={handleDone} onLike={handleLike} onSkip={handleSkip} allSeen={allSeenFlag} />
            {allSeenFlag && (
              <div style={{ background:`${D.gold}12`, border:`1px solid ${D.gold}33`, borderRadius:14, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>✨</span>
                <p className="caveat" style={{ fontSize:13, color:D.wine, margin:0 }}>
                  Ya vieron todas las preguntas.{' '}
                  <button onClick={() => handleReset('question')} style={{ background:'none', border:'none', color:D.coral, cursor:'pointer', fontFamily:"'Caveat',cursive", fontSize:13, fontWeight:700, padding:0 }}>
                    Reiniciar historial
                  </button>
                </p>
              </div>
            )}
            <button onClick={() => drawCard(QUESTIONS, 'question')}
              style={{ width:'100%', padding:'14px', borderRadius:16, background:D.wine, border:'none', cursor:'pointer' }}>
              <span className="caveat" style={{ fontSize:16, fontWeight:700, color:D.white }}>
                {currentItem ? 'Otra Pregunta ✦' : 'Obtener Pregunta ✦'}
              </span>
            </button>
            {(interactions.question||[]).filter(i=>i.status==='liked').length > 0 && (
              <p className="caveat" style={{ textAlign:'center', marginTop:10, fontSize:13, color:D.muted }}>
                ❤️ {(interactions.question||[]).filter(i=>i.status==='liked').length} guardadas como favoritas
              </p>
            )}
          </div>
        )}

        {/* ── Truth or Dare ─────────────────────────────────────── */}
        {selectedGame === 'truth' && (
          <div>
            <div style={{ display:'flex', gap:10, marginBottom:18 }}>
              {['truth','dare'].map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setCurrentItem(null); setAllSeenFlag(false); loadInteractions(m); }}
                  style={{ flex:1, padding:'12px', borderRadius:14, background:mode===m?D.wine:D.white, border:`1.5px solid ${mode===m?D.wine:D.border}`, cursor:'pointer' }}>
                  <span className="caveat" style={{ fontSize:16, fontWeight:700, color:mode===m?D.white:D.muted }}>
                    {m==='truth' ? 'Verdad' : 'Reto'}
                  </span>
                </button>
              ))}
            </div>
            {mode && (
              <>
                <ContentCard item={currentItem} accent={mode==='truth'?D.blue:D.gold}
                  icon={mode==='truth'?'/images/retos.png':'/images/logros.png'}
                  interactions={interactions[mode]||[]}
                  onAction={handleDone} onLike={handleLike} onSkip={handleSkip} allSeen={allSeenFlag} />
                {allSeenFlag && (
                  <div style={{ background:`${D.gold}12`, border:`1px solid ${D.gold}33`, borderRadius:14, padding:'10px 14px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:16 }}>✨</span>
                    <p className="caveat" style={{ fontSize:13, color:D.wine, margin:0 }}>
                      Ya vieron todo.{' '}
                      <button onClick={() => handleReset(mode)} style={{ background:'none', border:'none', color:D.coral, cursor:'pointer', fontFamily:"'Caveat',cursive", fontSize:13, fontWeight:700, padding:0 }}>Reiniciar</button>
                    </p>
                  </div>
                )}
                <button onClick={() => drawCard(mode==='truth'?TRUTHS:DARES, mode)}
                  style={{ width:'100%', padding:'14px', borderRadius:16, background:D.wine, border:'none', cursor:'pointer' }}>
                  <span className="caveat" style={{ fontSize:16, fontWeight:700, color:D.white }}>
                    {currentItem ? 'Otro ✦' : (mode==='truth'?'Obtener Verdad ✦':'Obtener Reto ✦')}
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Dice ──────────────────────────────────────────────── */}
        {selectedGame === 'dice' && (
          <DiceRoller onResult={r => {
            if (authenticated) api.upsertGameInteraction('dice', `dice_${r.value}_${Date.now()}`, 'seen').catch(()=>{});
          }} />
        )}

        {/* ── Memories ──────────────────────────────────────────── */}
        {selectedGame === 'memory' && <MemoriesTab />}

      </div>
    </div>
  );
}
