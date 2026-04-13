import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, ThumbsDown, ThumbsUp, RefreshCw } from "lucide-react";
import { citasDatabase, citasPorCategoria } from "@/data/citas";
import { api } from "@/lib/api";

// Flat lookup of all citas by id (computed once at module level)
const ALL_CITAS_FLAT = (() => {
  const merged = [
    ...Object.values(citasDatabase || {}).flat(),
    ...Object.values(citasPorCategoria || {}).flat()
  ];
  const seen = new Set();
  return merged.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
})();

const D = {
  cream: "#FDF6EC", wine: "#1C0E10", coral: "#C44455", gold: "#D4A520",
  blue: "#5B8ECC", green: "#5BAA6A", blush: "#F0C4CC", white: "#FFFFFF",
  border: "#EDE0D0", muted: "#9A7A6A"
};
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function BgDoodles() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ position: "absolute", top: "12%", right: "6%", width: 80, height: 80, borderRadius: "50%", border: `2px dashed ${D.blush}`, opacity: 0.5 }} />
      <div style={{ position: "absolute", bottom: "20%", left: "4%", width: 55, height: 55, borderRadius: "50%", background: D.gold, opacity: 0.12 }} />
    </div>
  );
}

export default function CitasAleatoriasPage({ navigateTo }) {
  const [currentCita, setCurrentCita] = useState(null);
  const [availableCitas, setAvailableCitas] = useState([]);
  const [rejectedCitas, setRejectedCitas] = useState([]);
  const [stats, setStats] = useState({ like: 0, dislike: 0 });
  const [direction, setDirection] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadAvailableCitas();
  }, []);

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
        // Load couple matches
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

    // Build the pool from the citas database, excluding already swiped
    const allFromDb = Object.values(citasDatabase || {}).flat();
    const allFromCat = Object.values(citasPorCategoria || {}).flat();
    const merged = [...allFromDb, ...allFromCat];
    const seen = new Set();
    let pool = merged.filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return !rejectedIds.has(c.id) && !likedIds.has(c.id);
    });
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setAvailableCitas(pool);
    setCurrentCita(pool[0] || null);
  };

  const moveToNextCita = (current, pool) => {
    const remaining = pool.filter(c => c.id !== current.id);
    setAvailableCitas(remaining);
    setCurrentCita(remaining[0] || null);
    return remaining;
  };

  const handleLike = () => {
    if (!currentCita) return;
    setDirection("right");
    // Persist to API (fire and forget)
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.swipeCita(currentCita.id, 'like').catch(() => {});
    }
    // Also keep localStorage updated for offline compat
    const favs = JSON.parse(localStorage.getItem("favoritesCitas") || "[]");
    if (!favs.find(f => f.id === currentCita.id)) {
      localStorage.setItem("favoritesCitas", JSON.stringify([currentCita, ...favs]));
    }
    setStats(s => ({ ...s, like: s.like + 1 }));
    setTimeout(() => { moveToNextCita(currentCita, availableCitas); setDirection(null); }, 300);
  };

  const handleDislike = () => {
    if (!currentCita) return;
    setDirection("left");
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.swipeCita(currentCita.id, 'dislike').catch(() => {});
    }
    const stored = JSON.parse(localStorage.getItem("citasAleatorias") || "[]");
    const updated = [...stored.filter(c => c.id !== currentCita.id), { ...currentCita, rejected: true }];
    localStorage.setItem("citasAleatorias", JSON.stringify(updated));
    setStats(s => ({ ...s, dislike: s.dislike + 1 }));
    setTimeout(() => { moveToNextCita(currentCita, availableCitas); setDirection(null); }, 300);
  };

  const handleReset = async () => {
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.resetSwipes().catch(() => {});
    }
    localStorage.removeItem("citasAleatorias");
    localStorage.removeItem("favoritesCitas");
    setStats({ like: 0, dislike: 0 });
    loadAvailableCitas();
  };

  const favorites = JSON.parse(localStorage.getItem("favoritesCitas") || "[]").slice(0, 4);

  const statCards = [
    { label: "Me gusta", value: stats.like, color: D.coral },
    { label: "No me gusta", value: stats.dislike, color: D.muted },
    { label: "Disponibles", value: availableCitas.length, color: D.blue }
  ];

  return (
    <div style={{ minHeight: "100vh", background: D.cream, paddingBottom: 88, maxWidth: 430, margin: "0 auto" }}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: D.cream,
        borderBottom: `1.5px solid ${D.border}`, padding: "48px 20px 14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigateTo("dashboard")} style={{
            width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${D.border}`,
            background: D.white, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0
          }}>
            <ChevronLeft size={18} color={D.coral} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.wine, margin: 0 }}>
              Citas Aleatorias
            </h1>
            <p className="caveat" style={{ fontSize: 15, color: D.muted, margin: 0 }}>
              Desliza para descubrir ♡
            </p>
          </div>
          <button onClick={handleReset} style={{
            padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${D.border}`,
            background: D.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}>
            <RefreshCw size={13} color={D.muted} />
            <span className="caveat" style={{ fontSize: 14, color: D.muted }}>Reset</span>
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 20px", position: "relative", zIndex: 1 }}>
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

        {/* Card */}
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
                ¡Completaste todas!
              </h2>
              <p className="caveat" style={{ fontSize: 16, color: D.muted, margin: "0 0 18px" }}>
                No hay más citas disponibles
              </p>
              <button onClick={handleReset} style={{
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
              style={{
                width: 72, height: 72, borderRadius: "50%", border: "none",
                background: D.wine, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 4px 16px rgba(28,14,16,0.2)"
              }}
            >
              <Heart size={28} color={D.blush} fill={D.blush} />
            </motion.button>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div>
            <h3 className="caveat" style={{ fontSize: 18, color: D.wine, margin: "0 0 12px", fontWeight: 700 }}>
              Mis favoritas ♡
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {favorites.map((cita, i) => (
                <div key={cita.id} style={{
                  background: D.white, border: `1.5px solid ${D.border}`,
                  borderLeft: `4px solid ${[D.coral, D.gold, D.blue, D.green][i % 4]}`,
                  borderRadius: 14, padding: "12px 14px"
                }}>
                  <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: "0 0 6px",
                    overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {cita.title}
                  </p>
                  {cita.category && (
                    <span className="caveat" style={{ fontSize: 11, color: D.muted }}>{cita.category}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Couple Matches */}
        {matches.length > 0 && (() => {
          const matchedCitas = matches.map(id => ALL_CITAS_FLAT.find(c => c.id === id)).filter(Boolean);
          if (!matchedCitas.length) return null;
          return (
            <div style={{ marginTop: 20 }}>
              <h3 className="caveat" style={{ fontSize: 18, color: D.wine, margin: "0 0 12px", fontWeight: 700 }}>
                💘 Matches con tu pareja
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {matchedCitas.slice(0, 8).map((cita) => (
                  <div key={cita.id} style={{
                    background: "#FEE8EC", border: `1.5px solid ${D.blush}`,
                    borderLeft: `4px solid ${D.coral}`,
                    borderRadius: 14, padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 10
                  }}>
                    <span style={{ fontSize: 18 }}>💕</span>
                    <div style={{ flex: 1 }}>
                      <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: "0 0 2px" }}>
                        {cita.title}
                      </p>
                      {cita.category && (
                        <span className="caveat" style={{ fontSize: 11, color: D.muted }}>{cita.category}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
