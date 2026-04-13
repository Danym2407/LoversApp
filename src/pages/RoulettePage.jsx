import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, Star, RefreshCw, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#F0C4CC', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function BgDoodles() {
  return (
    <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.18 }} aria-hidden>
      <text x="12%" y="18%" fontSize="22" fill={D.coral}>✦</text>
      <text x="78%" y="12%" fontSize="16" fill={D.gold}>★</text>
      <text x="88%" y="55%" fontSize="20" fill={D.blue}>✦</text>
      <text x="6%"  y="72%" fontSize="14" fill={D.green}>★</text>
      <ellipse cx="50%" cy="50%" rx="44%" ry="34%" fill="none" stroke={D.blush} strokeWidth="1.2" strokeDasharray="6 8"/>
    </svg>
  );
}

export default function RoulettePage({ navigateTo }) {
  const [pendingDates, setPendingDates] = useState([]);
  const [gameState, setGameState] = useState('idle'); // idle | spinning | envelope | card
  const [selectedDate, setSelectedDate] = useState(null);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    setPendingDates(stored.filter(d => d.status !== 'completed'));
  }, []);

  const spinWheel = () => {
    if (pendingDates.length === 0) {
      toast({ title: '¡Misión cumplida! 🎉', description: 'Ya no quedan citas pendientes.' });
      return;
    }
    const idx = Math.floor(Math.random() * pendingDates.length);
    setSelectedDate(pendingDates[idx]);
    setGameState('spinning');
    const newRot = rotation + 360 * (5 + Math.random() * 5) + Math.random() * 360;
    setRotation(newRot);
    setTimeout(() => setGameState('envelope'), 3500);
  };

  const reset = () => { setGameState('idle'); setSelectedDate(null); };

  const SEGMENTS = 12;

  return (
    <div style={{ background: D.cream, minHeight: '100vh', maxWidth: 430, margin: '0 auto', paddingBottom: 40, position: 'relative', overflow: 'hidden' }}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* Header */}
      <div style={{ padding: '48px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: D.cream, borderBottom: `1.5px solid ${D.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <button onClick={() => navigateTo('home')}
          style={{ width: 38, height: 38, borderRadius: '50%', background: D.white, border: `1.5px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="lora" style={{ fontSize: 20, fontWeight: 600, color: D.wine }}>Ruleta de Citas</div>
          <div className="caveat" style={{ fontSize: 11, color: D.muted }}>{pendingDates.length} citas pendientes ✦</div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* IDLE / SPINNING */}
          {(gameState === 'idle' || gameState === 'spinning') && (
            <motion.div key="wheel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

              <div className="lora" style={{ fontSize: 22, fontWeight: 600, color: D.wine, marginBottom: 28, textAlign: 'center' }}>¿Qué cita nos toca?</div>

              {/* Pointer */}
              <div style={{ marginBottom: -6, zIndex: 2 }}>
                <motion.div animate={gameState === 'spinning' ? { rotate: [-8, 8, -8] } : {}} transition={{ repeat: Infinity, duration: 0.2 }}>
                  <Heart size={32} color={D.coral} fill={D.coral} />
                </motion.div>
              </div>

              {/* Wheel */}
              <div style={{ width: 280, height: 280, position: 'relative', marginBottom: 32 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `6px solid ${D.wine}`, background: D.white, overflow: 'hidden', boxShadow: '0 8px 32px rgba(28,14,16,0.18)' }}>
                  <motion.div
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 3.5, ease: [0.15, 0, 0.15, 1] }}
                  >
                    {Array.from({ length: SEGMENTS }).map((_, i) => (
                      <div key={i} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, transform: `rotate(${i * 30}deg)` }}>
                        <div style={{ width: 2, height: '50%', background: i % 2 === 0 ? `${D.blush}88` : `${D.border}`, margin: '0 auto' }} />
                      </div>
                    ))}
                    {/* Center hub */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 100, height: 100, borderRadius: '50%', border: `4px solid ${D.wine}`, background: D.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <span className="lora" style={{ fontSize: 10, color: D.wine, fontStyle: 'italic', textAlign: 'center', lineHeight: 1.3 }}>Daniela{'\n'}&{'\n'}Eduardo</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <button onClick={spinWheel} disabled={gameState === 'spinning'}
                style={{ padding: '14px 40px', borderRadius: 30, background: gameState === 'spinning' ? D.muted : D.wine, border: 'none', cursor: gameState === 'spinning' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                {gameState === 'spinning'
                  ? <><RefreshCw size={18} color={D.white} style={{ animation: 'spin 1s linear infinite' }} /><span className="caveat" style={{ fontSize: 16, fontWeight: 700, color: D.white }}>Girando...</span></>
                  : <><span className="caveat" style={{ fontSize: 18, fontWeight: 700, color: D.white }}>Girar la ruleta</span><Star size={18} color={D.gold} fill={D.gold} /></>
                }
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}

          {/* ENVELOPE */}
          {gameState === 'envelope' && (
            <motion.div key="envelope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setGameState('card')}>
              <div className="lora" style={{ fontSize: 20, fontWeight: 600, color: D.wine, marginBottom: 28, textAlign: 'center' }}>
                ¡Tenemos una cita!<br/>
                <span style={{ fontSize: 15, color: D.muted, fontStyle: 'italic' }}>Toca para abrir 💌</span>
              </div>
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.06, rotate: 2 }}
                style={{ width: 240, height: 160, position: 'relative' }}
              >
                <div style={{ position: 'absolute', inset: 0, background: `${D.blush}66`, border: `2px solid ${D.border}`, borderRadius: 16, boxShadow: '0 8px 32px rgba(28,14,16,0.14)' }} />
                {/* Flap */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0,
                  borderLeft: '120px solid transparent', borderRight: '120px solid transparent', borderTop: `72px solid ${D.border}` }} />
                {/* Seal */}
                <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', width: 52, height: 52, borderRadius: '50%', background: D.coral, border: `3px solid ${D.wine}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={24} color={D.white} fill={D.white} />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* CARD REVEAL */}
          {gameState === 'card' && selectedDate && (
            <motion.div key="card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

              {/* Confetti */}
              <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div key={i}
                    initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 1 }}
                    animate={{ y: '100vh', opacity: 0 }}
                    transition={{ duration: 2 + Math.random() * 2, ease: 'linear', delay: Math.random() * 0.5 }}
                    style={{ position: 'absolute', top: 0 }}>
                    {i % 2 === 0 ? <Heart size={16} color={D.coral} fill={D.coral} /> : <Star size={16} color={D.gold} fill={D.gold} />}
                  </motion.div>
                ))}
              </div>

              <div style={{ background: D.white, border: `2px solid ${D.border}`, borderTop: `4px solid ${D.coral}`, borderRadius: 24, padding: '32px 24px', textAlign: 'center', width: '100%', boxShadow: '0 12px 40px rgba(28,14,16,0.12)', position: 'relative', marginBottom: 16 }}>
                <div style={{ position: 'absolute', top: 16, left: 16 }}><Heart size={16} color={D.coral} /></div>
                <div style={{ position: 'absolute', top: 16, right: 16 }}><Star size={16} color={D.gold} /></div>

                <div style={{ marginBottom: 8 }}>
                  <span style={{ padding: '3px 14px', background: D.wine, borderRadius: 20 }}>
                    <span className="caveat" style={{ fontSize: 12, fontWeight: 700, color: D.white }}>CITA #{selectedDate.id}</span>
                  </span>
                </div>
                <div className="lora" style={{ fontSize: 26, fontWeight: 600, color: D.wine, marginBottom: 4, lineHeight: 1.3 }}>{selectedDate.name}</div>

                <div style={{ height: 1, background: D.border, margin: '16px 0' }} />

                <button onClick={() => navigateTo('detail', selectedDate.id)}
                  style={{ width: '100%', padding: '13px', borderRadius: 14, background: D.wine, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                  <Calendar size={16} color={D.white} />
                  <span className="caveat" style={{ fontSize: 15, fontWeight: 700, color: D.white }}>Ver detalles de la cita</span>
                </button>

                <button onClick={reset}
                  style={{ width: '100%', padding: '13px', borderRadius: 14, background: D.cream, border: `1.5px solid ${D.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RefreshCw size={16} color={D.wine} />
                  <span className="caveat" style={{ fontSize: 15, fontWeight: 700, color: D.wine }}>Girar otra vez</span>
                </button>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <span className="lora" style={{ fontSize: 14, color: D.muted, fontStyle: 'italic' }}>Esta será su próxima historia juntos 💌</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
