import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

// ── Category metadata ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'basico',      label: 'Conexión Básica',  emoji: '💕', color: D.coral,  bg: '#FEE8EC' },
  { key: 'romantico',   label: 'Romance',           emoji: '🌹', color: D.gold,   bg: '#FFF8E0' },
  { key: 'experiencia', label: 'Experiencias',      emoji: '✈️', color: D.blue,   bg: '#EBF3FF' },
];

// ── Single challenge card ─────────────────────────────────────────────────────
function ChallengeCard({ ch, onToggle, justCompleted }) {
  const cat     = CATEGORIES.find(c => c.key === ch.category) || CATEGORIES[0];
  const locked  = ch.locked && !ch.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={locked ? {} : { scale: 0.97 }}
      onClick={() => !locked && onToggle(ch.id)}
      style={{
        background: ch.completed ? '#F4FBF6' : locked ? D.cream : D.white,
        borderRadius: 20,
        border: `1.5px solid ${ch.completed ? D.green : locked ? D.border : D.border}`,
        borderLeft: `4px solid ${ch.completed ? D.green : locked ? D.border : cat.color}`,
        padding: '16px',
        cursor: locked ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        opacity: locked ? 0.45 : 1,
        boxShadow: justCompleted ? `0 0 0 3px ${D.green}44, 0 4px 16px ${D.green}22` : 'none',
        transition: 'box-shadow 0.4s ease, opacity 0.2s ease',
      }}
    >
      {/* Watermark icon */}
      <img src={ch.img} alt="" style={{
        position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
        width: 80, height: 80, objectFit: 'contain',
        opacity: locked ? 0.06 : 0.09, pointerEvents: 'none', userSelect: 'none',
        filter: locked ? 'grayscale(1)' : 'none',
      }}/>

      {/* Lock icon top-right */}
      {locked && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 24, height: 24, borderRadius: '50%',
          background: D.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={12} color={D.muted} />
        </div>
      )}

      {/* Completion overlay */}
      {ch.completed && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(91,170,106,0.06)',
          borderRadius: 19, pointerEvents: 'none',
        }}/>
      )}

      {/* Just-completed glow halo */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0.6, scale: 0.85 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 20,
              background: `radial-gradient(circle, ${D.green}44 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
        {/* Icon box */}
        <div style={{
          flexShrink: 0, width: 50, height: 50, borderRadius: 14,
          background: ch.completed ? '#D4F0DD' : locked ? `${D.border}77` : cat.bg,
          border: `1.5px solid ${ch.completed ? '#A8D8A8' : locked ? D.border : cat.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          filter: locked ? 'grayscale(1)' : 'none',
        }}>
          {ch.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="lora" style={{
            fontSize: 15, fontWeight: 700, color: locked ? D.muted : D.wine,
            margin: '0 0 3px', lineHeight: 1.2,
          }}>{ch.title}</p>
          <p className="caveat" style={{
            fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.4,
          }}>{ch.description}</p>

          {/* Status pill */}
          <div style={{ marginTop: 8 }}>
            {ch.completed ? (
              <span className="caveat" style={{
                fontSize: 12, fontWeight: 700,
                background: '#D4F0DD', color: '#2A6A2A',
                borderRadius: 20, padding: '3px 10px',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <CheckCircle2 size={11} color="#2A6A2A" /> ¡Completado!
              </span>
            ) : locked ? (
              <span className="caveat" style={{
                fontSize: 12, color: D.muted,
                background: D.cream, border: `1px solid ${D.border}`,
                borderRadius: 20, padding: '3px 10px',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Lock size={10} color={D.muted} /> {ch.lockReason}
              </span>
            ) : (
              <span className="caveat" style={{
                fontSize: 12, fontWeight: 700,
                background: cat.bg, color: cat.color,
                borderRadius: 20, padding: '3px 10px',
              }}>
                Toca para completar ✓
              </span>
            )}
          </div>

          {ch.completed && ch.completed_at && (
            <p className="caveat" style={{ fontSize: 11, color: D.muted, margin: '5px 0 0' }}>
              {new Date(ch.completed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChallengesPage({ navigateTo }) {
  const [challenges, setChallenges] = useState([]);
  const [context, setContext]       = useState({ daysTogether: 0, citasCompleted: 0 });
  const [loading, setLoading]       = useState(true);
  const [justDone, setJustDone]     = useState(null); // id of just-completed challenge

  useEffect(() => {
    const token = localStorage.getItem('loversappToken');
    if (!token) { setLoading(false); return; }

    api.getChallenges()
      .then(data => {
        if (data && Array.isArray(data.challenges)) {
          setChallenges(data.challenges);
          setContext(data.context || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    // Optimistic update
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
    setJustDone(id);
    setTimeout(() => setJustDone(null), 1200);

    const ch = challenges.find(c => c.id === id);
    const token = localStorage.getItem('loversappToken');
    if (token) {
      try {
        await api.toggleChallenge(id, ch?.type);
        // Re-fetch to get fresh lock state after a completion may unlock others
        const fresh = await api.getChallenges();
        if (fresh && Array.isArray(fresh.challenges)) {
          setChallenges(fresh.challenges);
          setContext(fresh.context || {});
        }
      } catch {}
    }
  };

  const totalDone  = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;

  const catStats = CATEGORIES.map(cat => {
    const group = challenges.filter(c => c.category === cat.key);
    return { ...cat, done: group.filter(c => c.completed).length, total: group.length };
  });

  return (
    <PageLayout>
      <PageHeader
        breadcrumb="Retos"
        title="Retos de Pareja"
        icon="/images/retos.png"
        subtitle={context.daysTogether > 0 ? `${context.daysTogether} días juntos 💖` : '¡Haz al menos uno hoy! ✨'}
        titleAction={
          <div style={{
            flexShrink: 0, background: '#FFF0F4', border: `1.5px solid ${D.border}`,
            borderRadius: 16, padding: '8px 14px', textAlign: 'center', minWidth: 56,
          }}>
            <div className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.coral, lineHeight: 1 }}>{totalDone}</div>
            <div className="caveat" style={{ fontSize: 11, color: D.muted, fontWeight: 600 }}>hechos</div>
          </div>
        }
      />

      <div style={{ padding: '16px 20px 0', position: 'relative', zIndex: 1 }}>

        {/* ── Progress header ─────────────────────────────────────────── */}
        <div style={{
          background: D.wine, borderRadius: 20, padding: '18px 20px',
          marginBottom: 20, position: 'relative', overflow: 'hidden',
        }}>
          {/* deco circles */}
          <div style={{ position: 'absolute', right: -18, top: -18, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,208,220,0.08)' }}/>
          <div style={{ position: 'absolute', right: 18, bottom: -28, width: 55, height: 55, borderRadius: '50%', background: 'rgba(212,165,32,0.12)' }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12, position: 'relative' }}>
            <div>
              <p className="lora" style={{ fontSize: 15, fontWeight: 700, color: D.white, margin: '0 0 2px' }}>Progreso General</p>
              <p className="caveat" style={{ fontSize: 13, color: D.blush, margin: 0 }}>
                {totalDone} de {totalCount} completados
                {context.citasCompleted > 0 && ` · ${context.citasCompleted} citas`}
              </p>
            </div>
            <span className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.gold }}>
              {totalCount ? Math.round((totalDone / totalCount) * 100) : 0}%
            </span>
          </div>

          {/* Overall bar */}
          <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 14, position: 'relative' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: totalCount ? `${Math.round((totalDone / totalCount) * 100)}%` : '0%' }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
              style={{ height: '100%', borderRadius: 8, background: `linear-gradient(90deg, ${D.gold}, #F5C842)` }}
            />
          </div>

          {/* Category mini-stats */}
          <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
            {catStats.map(cat => (
              <div key={cat.key} style={{
                flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{cat.emoji}</div>
                <div className="lora" style={{ fontSize: 14, fontWeight: 700, color: D.white, lineHeight: 1 }}>{cat.done}/{cat.total}</div>
                <div className="caveat" style={{ fontSize: 10, color: D.blush, marginTop: 2 }}>{cat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Loading state ────────────────────────────────────────────── */}
        {loading && (
          <p className="caveat" style={{ textAlign: 'center', color: D.muted, fontSize: 15, padding: '32px 0' }}>
            Cargando retos...
          </p>
        )}

        {!loading && challenges.length === 0 && (
          <div style={{
            background: D.white, border: `1.5px dashed ${D.border}`,
            borderRadius: 20, padding: '32px 20px', textAlign: 'center',
          }}>
            <span style={{ fontSize: 32 }}>🔐</span>
            <p className="lora" style={{ fontSize: 15, fontWeight: 600, color: D.wine, margin: '10px 0 4px' }}>
              Inicia sesión para ver tus retos
            </p>
          </div>
        )}

        {/* ── Categories ──────────────────────────────────────────────── */}
        {!loading && CATEGORIES.map(cat => {
          const group = challenges.filter(c => c.category === cat.key);
          if (!group.length) return null;
          const groupDone = group.filter(c => c.completed).length;

          return (
            <div key={cat.key} style={{ marginBottom: 24 }}>
              {/* Category header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 12, paddingLeft: 2,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: `${cat.color}22`, border: `1.5px solid ${cat.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {cat.emoji}
                </div>
                <span className="lora" style={{ fontSize: 16, fontWeight: 700, color: D.wine }}>{cat.label}</span>
                <span className="caveat" style={{
                  fontSize: 12, color: groupDone === group.length ? D.green : D.muted,
                  background: D.cream, border: `1px solid ${D.border}`,
                  borderRadius: 20, padding: '1px 8px',
                }}>
                  {groupDone}/{group.length}
                </span>
                {groupDone === group.length && group.length > 0 && (
                  <span className="caveat" style={{ fontSize: 12, color: D.green, fontWeight: 700 }}>¡Todo completado! 🎉</span>
                )}
              </div>

              {/* Challenge cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {group.map((ch, i) => (
                  <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <ChallengeCard ch={ch} onToggle={toggle} justCompleted={justDone === ch.id && ch.completed} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ height: 20 }} />
      </div>
    </PageLayout>
  );
}

