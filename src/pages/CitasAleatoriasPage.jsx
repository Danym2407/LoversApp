import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ThumbsDown, RefreshCw, Sparkles, X } from "lucide-react";
import { getAllCitasFlat, citasDatabase, citasPorCategoria } from "@/data/citas";
const ALL_CITAS_FLAT = getAllCitasFlat;
import { api } from "@/lib/api";
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

const PERS_MAP = {
  very_calm: 'tranquilo', calm: 'tranquilo',
  balanced: 'hibrido',
  adventurous: 'hibrido', very_adventurous: 'extremo'
};
const BUDGET_ORDER = ['very_low', 'low', 'medium', 'high', 'very_high'];
const PERS_LABELS = { tranquilo: 'Tranquilo/a', hibrido: 'Híbrido/a', extremo: 'Aventurero/a' };
const BUDGET_LABELS = { very_low: 'Muy bajo', low: 'Bajo', medium: 'Medio', high: 'Alto', very_high: 'Muy alto' };
const ALL_PERSONALITIES = ['tranquilo', 'hibrido', 'extremo'];

// Build a test-based ordered pool (most relevant first)
function buildTestPool(rejectedIds, likedIds) {
  const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
  const test = userData.personalityTest;
  const seen = new Set();
  const pool = [];

  const addKey = (key) => {
    (citasDatabase[key] || []).forEach(c => {
      if (!seen.has(c.id)) { seen.add(c.id); pool.push(c); }
    });
  };

  if (test?.completed) {
    const personality = PERS_MAP[test.personalityType] || 'hibrido';
    const budget = test.budget || 'medium';
    const bIdx = BUDGET_ORDER.indexOf(budget);

    // 1st priority: exact match
    addKey(`${personality}-${budget}`);
    // 2nd: adjacent budget same personality
    if (bIdx > 0) addKey(`${personality}-${BUDGET_ORDER[bIdx - 1]}`);
    if (bIdx < 4) addKey(`${personality}-${BUDGET_ORDER[bIdx + 1]}`);
    // 3rd: remaining budgets same personality
    BUDGET_ORDER.forEach(b => addKey(`${personality}-${b}`));
    // 4th: other personalities, all budgets
    ALL_PERSONALITIES.filter(p => p !== personality).forEach(p =>
      BUDGET_ORDER.forEach(b => addKey(`${p}-${b}`))
    );
  } else {
    // No test: load everything (show test prompt but still allow swiping)
    ALL_PERSONALITIES.forEach(p => BUDGET_ORDER.forEach(b => addKey(`${p}-${b}`)));
  }

  // Append category-based citas (IDs 76-100)
  Object.values(citasPorCategoria || {}).flat().forEach(c => {
    if (!seen.has(c.id)) { seen.add(c.id); pool.push(c); }
  });

  return pool.filter(c => !rejectedIds.has(c.id) && !likedIds.has(c.id));
}

export default function CitasAleatoriasPage({ navigateTo }) {
  const [currentCita, setCurrentCita] = useState(null);
  const [availableCitas, setAvailableCitas] = useState([]);
  const [stats, setStats] = useState({ like: 0, dislike: 0 });
  const [direction, setDirection] = useState(null);
  const [matches, setMatches] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    // Load test info for display
    const userData = JSON.parse(localStorage.getItem('loversappUser') || '{}');
    const test = userData.personalityTest;
    if (test?.completed) {
      setTestInfo({
        personality: PERS_MAP[test.personalityType] || 'hibrido',
        budget: test.budget || 'medium'
      });
    }
    // Load added-to-list IDs
    loadAvailableCitas();
  }, []);

  const refreshFavorites = async () => {
    const token = localStorage.getItem('loversappToken');
    if (token) {
      try {
        const swipes = await api.getCitaSwipes();
        const liked = swipes.filter(s => s.action === 'like')
          .map(s => ALL_CITAS_FLAT.find(c => c.id === s.cita_id)).filter(Boolean);
        setFavorites(liked);
        return;
      } catch {}
    }
    setFavorites(JSON.parse(localStorage.getItem('favoritesCitas') || '[]'));
  };

  const loadAvailableCitas = async () => {
    const token = localStorage.getItem('loversappToken');
    let rejectedIds = new Set();
    let likedIds = new Set();

    if (token) {
      try {
        const swipes = await api.getCitaSwipes();
        swipes.forEach(s => {
          if (s.action === 'dislike') rejectedIds.add(s.cita_id);
          else if (s.action === 'like') likedIds.add(s.cita_id);
        });
        setStats({ like: likedIds.size, dislike: rejectedIds.size });
        api.getSwipeMatches().then(ids => setMatches(ids)).catch(() => {});
      } catch {
        // fall through to localStorage
      }
    }

    if (rejectedIds.size === 0 && likedIds.size === 0) {
      rejectedIds = new Set(
        JSON.parse(localStorage.getItem("citasAleatorias") || "[]")
          .filter(c => c.rejected).map(c => c.id)
      );
      likedIds = new Set(
        JSON.parse(localStorage.getItem("favoritesCitas") || "[]").map(c => c.id)
      );
      setStats({ like: likedIds.size, dislike: rejectedIds.size });
    }

    const pool = buildTestPool(rejectedIds, likedIds);
    setAvailableCitas(pool);
    setCurrentCita(pool[0] || null);
    refreshFavorites();
  };

  const moveToNext = (current, pool) => {
    const remaining = pool.filter(c => c.id !== current.id);
    setAvailableCitas(remaining);
    setCurrentCita(remaining[0] || null);
    return remaining;
  };

  const handleLike = () => {
    if (!currentCita) return;
    setDirection("right");
    const token = localStorage.getItem('loversappToken');
    if (token) {
      // API is the source of truth — no localStorage write needed
      api.swipeCita(currentCita.id, 'like').catch(() => {});
    } else {
      // Unauthenticated fallback
      const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
      if (!favs.find(f => f.id === currentCita.id)) {
        const updated = [currentCita, ...favs];
        localStorage.setItem('favoritesCitas', JSON.stringify(updated));
        setFavorites(updated);
      }
    }
    setStats(s => ({ ...s, like: s.like + 1 }));
    setTimeout(() => { moveToNext(currentCita, availableCitas); setDirection(null); }, 300);
  };

  const handleDislike = () => {
    if (!currentCita) return;
    setDirection("left");
    const token = localStorage.getItem('loversappToken');
    if (token) {
      // API is the source of truth — no localStorage write needed
      api.swipeCita(currentCita.id, 'dislike').catch(() => {});
    } else {
      // Unauthenticated fallback
      const stored = JSON.parse(localStorage.getItem('citasAleatorias') || '[]');
      localStorage.setItem('citasAleatorias', JSON.stringify(
        [...stored.filter(c => c.id !== currentCita.id), { ...currentCita, rejected: true }]
      ));
    }
    setStats(s => ({ ...s, dislike: s.dislike + 1 }));
    setTimeout(() => { moveToNext(currentCita, availableCitas); setDirection(null); }, 300);
  };

  const handleReset = async () => {
    const token = localStorage.getItem('loversappToken');
    if (token) {
      await api.resetSwipes().catch(() => {});
    } else {
      localStorage.removeItem('citasAleatorias');
      localStorage.removeItem('favoritesCitas');
    }
    setStats({ like: 0, dislike: 0 });
    setFavorites([]);
    loadAvailableCitas();
  };

  const statCards = [
    { label: "Me gustaron", value: stats.like, color: D.coral },
    { label: "No me gustaron", value: stats.dislike, color: D.muted },
    { label: "Disponibles", value: availableCitas.length, color: D.blue }
  ];

  // Partner matches (both liked)
  const matchedCitas = matches
    .map(id => ALL_CITAS_FLAT.find(c => c.id === id))
    .filter(Boolean);

  return (
    <PageLayout>
      <PageHeader
        breadcrumb="Citas para ti"
        title="Citas para ti"
        icon="/images/desliza.png"
        subtitle={
          testInfo
            ? `${PERS_LABELS[testInfo.personality]} · Presupuesto ${BUDGET_LABELS[testInfo.budget]} 💕`
            : 'Desliza para descubrir 💕'
        }
        onBack={() => navigateTo('dashboard')}
        action={
          <button onClick={() => setConfirmReset(true)}
            style={{ width: 32, height: 32, borderRadius: '50%', background: D.white, border: `1.5px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <RefreshCw size={14} color={D.coral} strokeWidth={2.5} />
          </button>
        }
      />

      <div style={{ padding: "18px 20px", position: "relative", zIndex: 1 }}>

        {/* No-test banner */}
        {!testInfo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#FFF7E6", border: `1.5px solid ${D.gold}`,
              borderRadius: 16, padding: "16px 18px", marginBottom: 18,
              display: "flex", alignItems: "center", gap: 12
            }}
          >
            <Sparkles size={22} color={D.gold} />
            <div style={{ flex: 1 }}>
              <p className="lora" style={{ fontSize: 14, fontWeight: 700, color: D.wine, margin: "0 0 3px" }}>
                Mejora tus recomendaciones
              </p>
              <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0 }}>
                Completa el test de personalidad para ver citas hechas para ti
              </p>
            </div>
            <button
              onClick={() => navigateTo("personality-test")}
              style={{
                flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none",
                background: D.gold, color: D.white, cursor: "pointer",
                fontFamily: "Caveat, cursive", fontSize: 14, fontWeight: 700
              }}
            >
              Ir al test
            </button>
          </motion.div>
        )}

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{
              flex: 1, background: D.white, border: `1.5px solid ${D.border}`,
              borderLeft: `4px solid ${s.color}`, borderRadius: 14, padding: "10px 10px",
              textAlign: "center"
            }}>
              <div className="caveat" style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div className="caveat" style={{ fontSize: 12, color: D.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Swipe Card */}
        <AnimatePresence mode="wait">
          {currentCita ? (
            <motion.div
              key={currentCita.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction === "right" ? 80 : direction === "left" ? -80 : 0, scale: 0.95 }}
              transition={{ duration: 0.28 }}
              style={{
                background: D.white, border: `1.5px solid ${D.border}`,
                borderLeft: `5px solid ${D.coral}`, borderRadius: 20, padding: "24px 22px",
                marginBottom: 22
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {currentCita.category && (
                    <span className="caveat" style={{
                      fontSize: 13, padding: "3px 10px", borderRadius: 20,
                      background: D.cream, border: `1px solid ${D.border}`, color: D.muted
                    }}>{currentCita.category}</span>
                  )}
                  {currentCita.budget && (
                    <span className="caveat" style={{
                      fontSize: 13, padding: "3px 10px", borderRadius: 20,
                      background: "#FFF7E6", border: `1px solid ${D.gold}`, color: D.gold
                    }}>{currentCita.budget}</span>
                  )}
                  {currentCita.personality && (
                    <span className="caveat" style={{
                      fontSize: 13, padding: "3px 10px", borderRadius: 20,
                      background: "#EBF3FF", border: `1px solid ${D.blue}`, color: D.blue
                    }}>{currentCita.personality}</span>
                  )}
                </div>
                <h2 className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.wine, margin: "0 0 10px" }}>
                  {currentCita.title}
                </h2>
                <p style={{ fontFamily: "Lora, serif", fontSize: 15, color: D.muted, lineHeight: 1.6, margin: 0 }}>
                  {currentCita.description}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: D.white, border: `1.5px solid ${D.border}`,
                borderRadius: 20, padding: "40px 22px", textAlign: "center", marginBottom: 22
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h2 className="lora" style={{ fontSize: 20, fontWeight: 700, color: D.wine, margin: "0 0 8px" }}>
                ¡Las viste todas!
              </h2>
              <p className="caveat" style={{ fontSize: 16, color: D.muted, margin: "0 0 18px" }}>
                No hay más citas disponibles
              </p>
              <button onClick={() => setConfirmReset(true)} style={{
                padding: "10px 24px", borderRadius: 20, border: "none",
                background: D.coral, color: D.white, cursor: "pointer",
                fontFamily: "Caveat, cursive", fontSize: 16, fontWeight: 700
              }}>
                Empezar de nuevo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {currentCita && (
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 28 }}>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleDislike}
              title="No me gusta"
              style={{
                width: 72, height: 72, borderRadius: "50%", border: `1.5px solid ${D.border}`,
                background: D.white, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 2px 12px rgba(28,14,16,0.08)"
              }}
            >
              <ThumbsDown size={28} color={D.muted} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleLike}
              title="Me gusta"
              style={{
                width: 72, height: 72, borderRadius: "50%", border: "none",
                background: D.coral, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "3px 3px 0 rgba(196,68,100,0.28)"
              }}
            >
              <Heart size={28} color={D.white} fill={D.white} />
            </motion.button>
          </div>
        )}

        {/* ── Section 1: Citas que me gustaron a mí ── */}
        {favorites.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <h3 className="caveat" style={{ fontSize: 19, color: D.wine, margin: "0 0 12px", fontWeight: 700 }}>
              Citas que me gustaron a mí ♡
              <span style={{ fontSize: 13, color: D.muted, fontWeight: 400, marginLeft: 6 }}>({favorites.length})</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {favorites.map((cita, i) => (
                <div key={cita.id} style={{
                  background: D.white, border: `1.5px solid ${D.border}`,
                  borderLeft: `4px solid ${[D.coral, D.gold, D.blue, D.green][i % 4]}`,
                  borderRadius: 14, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 10
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="lora" style={{
                      fontSize: 13, fontWeight: 700, color: D.wine, margin: "0 0 4px",
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                    }}>
                      {cita.title}
                    </p>
                    {cita.category && (
                      <span className="caveat" style={{ fontSize: 11, color: D.muted }}>{cita.category}</span>
                    )}
                  </div>
                  <span className="caveat" style={{
                    flexShrink: 0, padding: "5px 12px", borderRadius: 20,
                    background: "#EEF8EE", color: D.green,
                    fontSize: 13, fontWeight: 700, whiteSpace: "nowrap"
                  }}>✓ En lista</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 2: Citas que le gustaron a mi pareja ── */}
        {matchedCitas.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 className="caveat" style={{ fontSize: 19, color: D.wine, margin: "0 0 12px", fontWeight: 700 }}>
              Citas que le gustaron a mi pareja 💕
              <span style={{ fontSize: 13, color: D.muted, fontWeight: 400, marginLeft: 6 }}>({matchedCitas.length})</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {matchedCitas.map((cita) => (
                <div key={cita.id} style={{
                  background: "#FEF0F2", border: `1.5px solid ${D.blush}`,
                  borderLeft: `4px solid ${D.coral}`,
                  borderRadius: 14, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 10
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💕</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="lora" style={{
                      fontSize: 13, fontWeight: 700, color: D.wine, margin: "0 0 2px",
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                    }}>
                      {cita.title}
                    </p>
                    {cita.category && (
                      <span className="caveat" style={{ fontSize: 11, color: D.muted }}>{cita.category}</span>
                    )}
                  </div>
                  <span className="caveat" style={{
                    flexShrink: 0, padding: "5px 12px", borderRadius: 20,
                    background: "#FEF0F2", border: `1.5px solid ${D.blush}`,
                    color: D.coral, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap"
                  }}>❤️ Match</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── CONFIRM RESET MODAL ── */}
      <AnimatePresence>
        {confirmReset && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmReset(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(45,27,46,0.5)', zIndex: 199 }} />
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '0 20px', pointerEvents: 'none' }}>
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.18 }}
                onClick={e => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 400, background: D.cream, borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(45,27,46,0.22)', pointerEvents: 'all' }}>
                <div style={{ padding: '20px 20px 16px', borderBottom: `1.5px solid ${D.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src="/images/desliza.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                      <h2 className="lora" style={{ fontSize: 20, fontWeight: 700, color: D.wine, margin: 0 }}>¿Reiniciar todo?</h2>
                    </div>
                    <button onClick={() => setConfirmReset(false)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF0F4', border: `1.5px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <X size={14} color={D.coral} strokeWidth={2.5} />
                    </button>
                  </div>
                  <img src="/images/subrayado1.png" alt="" style={{ display: 'block', width: '55%', maxWidth: 180, margin: '6px 0 0' }} />
                </div>
                <div style={{ padding: '20px 20px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
                  <p className="lora" style={{ fontSize: 15, color: D.wine, margin: '0 0 6px', fontStyle: 'italic', lineHeight: 1.5 }}>
                    ¿Estás seguro/a?
                  </p>
                  <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: '0 0 20px', lineHeight: 1.6 }}>
                    Se borrarán todos tus swipes y citas guardadas. Volverás a ver todas las citas desde cero.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setConfirmReset(false)}
                      style={{ flex: 1, padding: '13px', borderRadius: 14, background: '#FFF0F4', border: `1.5px solid ${D.border}`, cursor: 'pointer' }}>
                      <span className="caveat" style={{ fontSize: 15, fontWeight: 700, color: D.coral }}>Cancelar</span>
                    </button>
                    <button onClick={() => { handleReset(); setConfirmReset(false); }}
                      style={{ flex: 1, padding: '13px', borderRadius: 14, background: D.coral, border: 'none', cursor: 'pointer', boxShadow: '3px 3px 0 rgba(196,68,100,0.28)' }}>
                      <span className="caveat" style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Sí, reiniciar ✦</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
