import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, RefreshCw, Calendar, X } from 'lucide-react';
import { getAllCitasFlat } from '@/data/citas';
const ALL_CITAS_FLAT = getAllCitasFlat;
import { api } from '@/lib/api';
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

export default function RoulettePage({ navigateTo }) {
  const [pendingDates, setPendingDates] = useState([]);
  const [sourceMode, setSourceMode] = useState('mi_lista');
  const [gameState, setGameState] = useState('idle'); // idle | spinning | envelope | card
  const [selectedDate, setSelectedDate] = useState(null);
  const [prevDate, setPrevDate] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isInMyList, setIsInMyList] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [envelopePhase, setEnvelopePhase] = useState(0); // 0=closed 1=opening 2=revealing

  // API-loaded sets (source of truth when authenticated)
  const [likedCitaIds, setLikedCitaIds]         = useState(new Set());
  const [completedCitaIds, setCompletedCitaIds] = useState(new Set());

  // Load liked & completed from API on mount
  useEffect(() => {
    Promise.all([
      api.getCitaSwipes().catch(() => []),
      api.getCompletedCitas().catch(() => [])
    ]).then(([swipes, completed]) => {
      setLikedCitaIds(new Set(swipes.filter(s => s.action === 'like').map(s => s.cita_id)));
      setCompletedCitaIds(new Set(completed.map(r => r.cita_id)));
    });
  }, []);

  const checkInList = useCallback((id) => {
    if (likedCitaIds.size > 0) return likedCitaIds.has(id);
    return JSON.parse(localStorage.getItem('favoritesCitas') || '[]').some(f => f.id === id);
  }, [likedCitaIds]);

  const loadPool = useCallback(async (mode) => {
    // Prefer API state; fall back to localStorage
    const allCompleted = completedCitaIds.size > 0
      ? completedCitaIds
      : (() => {
          const ids = new Set(JSON.parse(localStorage.getItem('completedCitas') || '[]'));
          JSON.parse(localStorage.getItem('manualDates') || '[]')
            .filter(d => d.status === 'completed').forEach(d => ids.add(d.id));
          return ids;
        })();

    let pool = [];
    if (mode === 'mi_lista') {
      if (likedCitaIds.size > 0) {
        // API source of truth for liked citas
        pool = [...likedCitaIds]
          .filter(id => !allCompleted.has(id))
          .map(id => ALL_CITAS_FLAT.find(c => c.id === id))
          .filter(Boolean)
          .map(c => ({ ...c, name: c.title }));
        // Also include manual dates from localStorage (custom citas)
        const manual = JSON.parse(localStorage.getItem('manualDates') || '[]');
        const seen = new Set(pool.map(d => d.id));
        manual.filter(m => !allCompleted.has(m.id) && !seen.has(m.id))
          .forEach(m => { seen.add(m.id); pool.push({ ...m, name: m.name || m.title }); });
      } else {
        // localStorage fallback (unauthenticated)
        const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
        const manual = JSON.parse(localStorage.getItem('manualDates') || '[]');
        const seen = new Set();
        pool = [
          ...favs.map(f => ({ ...f, name: f.name || f.title })),
          ...manual.map(m => ({ ...m, name: m.name || m.title }))
        ].filter(d => {
          if (seen.has(d.id) || allCompleted.has(d.id)) return false;
          seen.add(d.id); return true;
        });
      }
    } else if (mode === 'match') {
      try {
        const matchIds = await api.getSwipeMatches();
        pool = matchIds.map(id => ALL_CITAS_FLAT.find(c => c.id === id)).filter(Boolean).filter(c => !allCompleted.has(c.id));
      } catch { pool = []; }
    } else if (mode === 'pareja') {
      try {
        const partnerIds = await api.getPartnerSwipes();
        pool = [...new Set(partnerIds)].map(id => ALL_CITAS_FLAT.find(c => c.id === id)).filter(Boolean).filter(c => !allCompleted.has(c.id));
      } catch { pool = []; }
    } else if (mode === 'nueva') {
      pool = ALL_CITAS_FLAT.filter(c => !allCompleted.has(c.id));
    }
    setPendingDates(pool);
  }, [likedCitaIds, completedCitaIds]);

  useEffect(() => {
    const saved = sessionStorage.getItem('rouletteState');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        sessionStorage.removeItem('rouletteState');
        setGameState(s.gameState || 'idle');
        setSelectedDate(s.selectedDate || null);
        setSourceMode(s.sourceMode || 'mi_lista');
        setRotation(s.rotation || 0);
        setPrevDate(s.prevDate || null);
        if (s.selectedDate) setIsInMyList(checkInList(s.selectedDate.id));
        loadPool(s.sourceMode || 'mi_lista');
        return;
      } catch {}
    }
    loadPool('mi_lista');
  }, [loadPool, checkInList]);

  const spinWheel = () => {
    if (pendingDates.length === 0) {
      setShowEmpty(true);
      return;
    }
    const idx = Math.floor(Math.random() * pendingDates.length);
    const picked = pendingDates[idx];
    setPrevDate(selectedDate);
    setSelectedDate(picked);
    setIsInMyList(checkInList(picked.id));
    setGameState('spinning');
    const newRot = rotation + 360 * (5 + Math.random() * 5) + Math.random() * 360;
    setRotation(newRot);
    setTimeout(() => { setGameState('envelope'); setEnvelopePhase(0); }, 3500);
  };

  const reset = () => { setGameState('idle'); setSelectedDate(null); setIsInMyList(false); setEnvelopePhase(0); };

  const addToMyList = () => {
    if (!selectedDate) return;
    // API is the source of truth — only write to localStorage as unauthenticated fallback
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.swipeCita(selectedDate.id, 'like').catch(() => {});
    } else {
      const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
      if (!favs.find(f => f.id === selectedDate.id)) {
        localStorage.setItem('favoritesCitas', JSON.stringify([{ ...selectedDate, name: selectedDate.name || selectedDate.title }, ...favs]));
      }
    }
    setLikedCitaIds(prev => new Set([...prev, selectedDate.id]));
    setIsInMyList(true);
  };

  const goToDetail = () => {
    // Navigate to DatesListPage (shows the user's liked citas from the 100 citas system)
    // NOTE: DateDetailPage is for the bucket-list system (dates.js) — different IDs
    navigateTo('dates');
  };

  const BUDGET_LABEL = { 1: '💰 Muy económico', 2: '💳 Económico', 3: '🎯 Moderado', 4: '✨ Premium', 5: '💎 Lujo', low: '💳 Económico', medium: '🎯 Moderado', high: '✨ Premium' };

  const goBack = () => {
    if (prevDate) {
      setSelectedDate(prevDate);
      setPrevDate(null);
      setGameState('card');
    }
  };

  const SEGMENTS = 12;

  return (
    <PageLayout paddingBottom={40}>
      <PageHeader
        breadcrumb="Ruleta"
        title="Ruleta"
        icon="/images/ruleta.png"
        subtitle={`${pendingDates.length} citas disponibles 💕`}
      />

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* IDLE / SPINNING */}
          {(gameState === 'idle' || gameState === 'spinning') && (
            <motion.div key="wheel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

              <div className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.wine, marginBottom: 20, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                ¿Qué cita nos toca?
                <img src="/images/ruleta.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              </div>

              {/* Source selector — only visible in idle */}
              {gameState === 'idle' && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { mode: 'mi_lista', label: '🫀 Mi lista' },
                    { mode: 'match',    label: '❤️ Match' },
                    { mode: 'pareja',   label: '💕 Mi pareja' },
                    { mode: 'nueva',    label: '✨ Nueva cita' },
                  ].map(({ mode, label }) => (
                    <button key={mode} onClick={() => { setSourceMode(mode); loadPool(mode); }}
                      className="caveat"
                      style={{
                        padding: '7px 15px', borderRadius: 20, cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.18s',
                        ...(sourceMode === mode
                          ? { background: D.coral, color: D.white, border: `2px solid ${D.coral}` }
                          : { background: D.cream, color: D.wine, border: `2px solid ${D.border}` })
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

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
                style={{ padding: '14px 40px', borderRadius: 30, background: gameState === 'spinning' ? D.muted : D.coral, border: 'none', cursor: gameState === 'spinning' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: gameState === 'spinning' ? 'none' : '3px 3px 0 rgba(196,68,100,0.28)' }}>
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
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {/* Label fades out when opening */}
              <motion.div
                animate={{ opacity: envelopePhase >= 1 ? 0 : 1, y: envelopePhase >= 1 ? -8 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 28, textAlign: 'center' }}>
                <div className="lora" style={{ fontSize: 20, fontWeight: 600, color: D.wine }}>¡Tenemos una cita!</div>
                <div style={{ fontSize: 15, color: D.muted, fontStyle: 'italic' }}>Toca el sobre para abrir 💌</div>
              </motion.div>

              {/* Envelope wrapper */}
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={envelopePhase === 0 ? { scale: 1.04, rotate: 1 } : {}}
                onClick={() => {
                  if (envelopePhase !== 0) return;
                  setEnvelopePhase(1);
                  setTimeout(() => setEnvelopePhase(2), 650);
                  setTimeout(() => setGameState('card'), 2000);
                }}
                style={{ width: 240, height: 160, position: 'relative', cursor: envelopePhase === 0 ? 'pointer' : 'default' }}
              >
                {/* Body */}
                <div style={{ position: 'absolute', inset: 0, background: `${D.blush}66`, border: `2px solid ${D.border}`, borderRadius: 16, boxShadow: '0 8px 32px rgba(45,27,46,0.14)' }}>
                  {/* Bottom V fold lines */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 240 160" fill="none" preserveAspectRatio="none">
                    <line x1="0" y1="160" x2="120" y2="88" stroke={D.border} strokeWidth="1.5"/>
                    <line x1="240" y1="160" x2="120" y2="88" stroke={D.border} strokeWidth="1.5"/>
                  </svg>
                </div>

                {/* Card preview — slides up from inside envelope */}
                <motion.div
                  animate={envelopePhase >= 2
                    ? { y: -82, opacity: 1 }
                    : { y: 4, opacity: envelopePhase >= 1 ? 0.8 : 0 }
                  }
                  transition={{ duration: 0.55, ease: [0.34, 1.4, 0.64, 1] }}
                  style={{ position: 'absolute', top: 20, left: 18, right: 18, background: D.white,
                    borderRadius: 10, border: `1.5px solid ${D.border}`, borderTop: `3px solid ${D.coral}`,
                    padding: '10px 12px', zIndex: 2, boxShadow: '0 4px 16px rgba(45,27,46,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <img src="/images/ruleta.png" alt="" style={{ width: 12, height: 12, objectFit: 'contain' }} />
                    <span className="caveat" style={{ fontSize: 10, color: D.muted, fontWeight: 600 }}>CITA #{selectedDate?.id}</span>
                  </div>
                  <div className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, lineHeight: 1.3 }}>
                    {selectedDate?.name || selectedDate?.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    <Heart size={10} color={D.coral} fill={D.coral} />
                    <span className="caveat" style={{ fontSize: 10, color: D.muted }}>{selectedDate?.category || 'Cita especial'}</span>
                  </div>
                </motion.div>

                {/* Flap — SVG shape rotates open */}
                <motion.div
                  animate={{ rotateX: envelopePhase >= 1 ? -175 : 0 }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%',
                    transformOrigin: 'top center', transformPerspective: 700,
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', zIndex: 3 }}>
                  <svg width="100%" viewBox="0 0 240 95" style={{ display: 'block' }} fill="none">
                    <path d="M0,0 L240,0 L240,58 L120,94 L0,58 Z" fill={D.blush} stroke={D.border} strokeWidth="1.5"/>
                  </svg>
                </motion.div>

                {/* Seal */}
                <div style={{ position: 'absolute', top: '32%', left: '50%', width: 0, height: 0, zIndex: 5 }}>
                  <motion.div
                    animate={{ opacity: envelopePhase >= 1 ? 0 : 1, scale: envelopePhase >= 1 ? 0.2 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'absolute', left: -26, top: -26, width: 52, height: 52,
                      borderRadius: '50%', background: D.coral, border: `3px solid ${D.wine}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={24} color={D.white} fill={D.white} />
                  </motion.div>
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
                    <span className="caveat" style={{ fontSize: 14, fontWeight: 700, color: D.white }}>CITA #{selectedDate.id}</span>
                  </span>
                </div>
                <div className="lora" style={{ fontSize: 26, fontWeight: 600, color: D.wine, marginBottom: 4, lineHeight: 1.3 }}>{selectedDate.name || selectedDate.title}</div>

                {/* Category + budget chips */}
                {(selectedDate.category || selectedDate.budget) && (
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                    {selectedDate.category && (
                      <span style={{ padding: '3px 12px', background: D.blush, borderRadius: 20 }}>
                        <span className="caveat" style={{ fontSize: 12, color: D.wine, fontWeight: 700 }}>{selectedDate.category}</span>
                      </span>
                    )}
                    {selectedDate.budget && (
                      <span style={{ padding: '3px 12px', background: `${D.gold}33`, borderRadius: 20 }}>
                        <span className="caveat" style={{ fontSize: 12, color: D.wine, fontWeight: 700 }}>{BUDGET_LABEL[selectedDate.budget] || selectedDate.budget}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Description — shown for nueva cita */}
                {sourceMode === 'nueva' && (selectedDate.description || selectedDate.desc) && (
                  <div style={{ marginTop: 14, padding: '12px 14px', background: `${D.cream}`, borderRadius: 14, border: `1px solid ${D.border}`, textAlign: 'left' }}>
                    <p className="lora" style={{ fontSize: 13, color: D.muted, fontStyle: 'italic', lineHeight: 1.65, margin: 0 }}>
                      {selectedDate.description || selectedDate.desc}
                    </p>
                  </div>
                )}

                <div style={{ height: 1, background: D.border, margin: '16px 0' }} />

                {/* Add to list button — nueva mode */}
                {sourceMode === 'nueva' && (
                  isInMyList ? (
                    <div style={{ padding: '11px', borderRadius: 14, background: `${D.green}22`, border: `1.5px solid ${D.green}55`, textAlign: 'center', marginBottom: 10 }}>
                      <span className="caveat" style={{ fontSize: 15, color: D.green, fontWeight: 700 }}>✓ Agregada a tu lista</span>
                    </div>
                  ) : (
                    <button onClick={addToMyList}
                      style={{ width: '100%', padding: '14px', borderRadius: 14, background: D.coral, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                      <Heart size={16} color={D.white} fill={D.white} />
                      <span className="caveat" style={{ fontSize: 17, fontWeight: 700, color: D.white }}>Agregar a mi lista</span>
                    </button>
                  )
                )}

                <button onClick={goToDetail}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: D.coral, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, boxShadow: '3px 3px 0 rgba(196,68,100,0.28)' }}>
                  <Calendar size={18} color={D.white} />
                  <span className="caveat" style={{ fontSize: 17, fontWeight: 700, color: D.white }}>Ver detalles de la cita</span>
                </button>

                <button onClick={reset}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: '#FFF0F4', border: `1.5px solid ${D.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: prevDate ? 10 : 0 }}>
                  <RefreshCw size={16} color={D.coral} />
                  <span className="caveat" style={{ fontSize: 17, fontWeight: 700, color: D.coral }}>Girar otra vez</span>
                </button>

                {prevDate && (
                  <button onClick={goBack}
                    style={{ width: '100%', padding: '14px', borderRadius: 14, background: `${D.coral}15`, border: `1.5px solid ${D.coral}55`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ChevronLeft size={16} color={D.coral} />
                    <span className="caveat" style={{ fontSize: 17, fontWeight: 700, color: D.coral }}>Volver a la anterior ({prevDate.name || prevDate.title})</span>
                  </button>
                )}
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <span className="lora" style={{ fontSize: 15, color: D.muted, fontStyle: 'italic' }}>Esta será su próxima historia juntos 💌</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Misión cumplida modal */}
      <AnimatePresence>
        {showEmpty && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEmpty(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(45,27,46,0.5)', zIndex: 199 }} />
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px', pointerEvents: 'none' }}>
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.18 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 400, background: D.cream, borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(45,27,46,0.22)', pointerEvents: 'all' }}>
                <div style={{ padding: '20px 20px 16px', borderBottom: `1.5px solid ${D.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src="/images/trofeo.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                      <h2 className="lora" style={{ fontSize: 20, fontWeight: 700, color: D.wine, margin: 0 }}>¡Misión cumplida!</h2>
                    </div>
                    <button onClick={() => setShowEmpty(false)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF0F4', border: `1.5px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <X size={14} color={D.coral} strokeWidth={2.5} />
                    </button>
                  </div>
                  <img src="/images/subrayado1.png" alt="" style={{ display: 'block', width: '55%', maxWidth: 180, margin: '6px 0 0' }} />
                </div>
                <div style={{ padding: '20px 20px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                  <p className="lora" style={{ fontSize: 15, color: D.wine, margin: '0 0 6px', fontStyle: 'italic', lineHeight: 1.5 }}>
                    Ya no quedan citas pendientes.
                  </p>
                  <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: '0 0 20px' }}>
                    ¡Han completado todas las citas disponibles! 💕
                  </p>
                  <button onClick={() => setShowEmpty(false)}
                    style={{ width: '100%', padding: '13px', borderRadius: 14, background: D.coral, border: 'none', cursor: 'pointer', boxShadow: '3px 3px 0 rgba(196,68,100,0.28)' }}>
                    <span className="caveat" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>¡Entendido! ✦</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
