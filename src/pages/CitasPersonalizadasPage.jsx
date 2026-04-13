import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { citasDatabase, citasPorCategoria } from "@/data/citas";
import { api } from "@/lib/api";

const D = {
  cream: "#FDF6EC", wine: "#1C0E10", coral: "#C44455", gold: "#D4A520",
  blue: "#5B8ECC", green: "#5BAA6A", blush: "#F0C4CC", white: "#FFFFFF",
  border: "#EDE0D0", muted: "#9A7A6A"
};
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

const FILTERS = ["Todas", "Exterior", "Interior", "Cultural", "Gastronómica", "Deportes"];
const ACCENT_COLORS = [D.coral, D.gold, D.blue, D.green];

export default function CitasPersonalizadasPage({ navigateTo }) {
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("Todas");
  const [personalityData, setPersonalityData] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [stats, setStats] = useState({ likes: 0, dislikes: 0 });
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("loversappUser") || "{}");
    if (userData.personalityTest?.completed) {
      setTestCompleted(true);
      setPersonalityData(userData.personalityTest);
      const generatedCitas = generatePersonalizedCitas(userData.personalityTest);
      setCitas(generatedCitas);
      setFilteredCitas(generatedCitas);
    }
    // Load preferences: API first, localStorage fallback
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getPreferences()
        .then(prefs => {
          setPreferences(prefs);
          const likes = Object.values(prefs).filter(p => p === 'like').length;
          const dislikes = Object.values(prefs).filter(p => p === 'dislike').length;
          setStats({ likes, dislikes });
        })
        .catch(() => {
          if (userData.citaPreferences) {
            setPreferences(userData.citaPreferences);
            const likes = Object.values(userData.citaPreferences).filter(p => p === 'like').length;
            const dislikes = Object.values(userData.citaPreferences).filter(p => p === 'dislike').length;
            setStats({ likes, dislikes });
          }
        });
    } else if (userData.citaPreferences) {
      setPreferences(userData.citaPreferences);
      const likes = Object.values(userData.citaPreferences).filter(p => p === 'like').length;
      const dislikes = Object.values(userData.citaPreferences).filter(p => p === 'dislike').length;
      setStats({ likes, dislikes });
    }
  }, []);

  const generatePersonalizedCitas = (testData) => {
    const personalityMap = {
      very_calm: "tranquilo", calm: "tranquilo", balanced: "hibrido",
      adventurous: "hibrido", very_adventurous: "extremo"
    };
    const budgetMap = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    const personality = personalityMap[testData.personalityType] || "hibrido";
    const budgetKey = budgetMap[testData.budget] || 3;
    const key = `${personality}-${budgetKey}`;

    let pool = [];
    if (citasDatabase?.[key]) pool = [...citasDatabase[key]];
    const catPool = Object.values(citasPorCategoria || {}).flat();
    const seen = new Set(pool.map(c => c.id));
    for (const c of catPool) {
      if (!seen.has(c.id)) { pool.push(c); seen.add(c.id); }
    }
    while (pool.length < 100) pool.push(...pool.slice(0, 100 - pool.length));
    pool = pool.slice(0, 100);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.map((c, i) => ({ ...c, displayId: i + 1 }));
  };

  useEffect(() => {
    if (selectedFilter === "Todas") {
      setFilteredCitas(citas);
    } else {
      setFilteredCitas(citas.filter(c =>
        c.category?.toLowerCase().includes(selectedFilter.toLowerCase())
      ));
    }
  }, [selectedFilter, citas]);

  const handleLikeCita = (citaId) => {
    const userData = JSON.parse(localStorage.getItem("loversappUser") || "{}");
    const prefs = { ...preferences };
    const newVal = prefs[citaId] === "like" ? null : "like";
    if (newVal) prefs[citaId] = newVal; else delete prefs[citaId];
    userData.citaPreferences = prefs;
    localStorage.setItem("loversappUser", JSON.stringify(userData));
    setPreferences(prefs);
    const likes = Object.values(prefs).filter(p => p === "like").length;
    const dislikes = Object.values(prefs).filter(p => p === "dislike").length;
    setStats({ likes, dislikes });
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.setPreference(citaId, newVal || 'none').catch(() => {});
    }
  };

  const handleDislikeCita = (citaId) => {
    const userData = JSON.parse(localStorage.getItem("loversappUser") || "{}");
    const prefs = { ...preferences };
    const newVal = prefs[citaId] === "dislike" ? null : "dislike";
    if (newVal) prefs[citaId] = newVal; else delete prefs[citaId];
    userData.citaPreferences = prefs;
    localStorage.setItem("loversappUser", JSON.stringify(userData));
    setPreferences(prefs);
    const likes = Object.values(prefs).filter(p => p === "like").length;
    const dislikes = Object.values(prefs).filter(p => p === "dislike").length;
    setStats({ likes, dislikes });
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.setPreference(citaId, newVal || 'none').catch(() => {});
    }
  };

  if (!testCompleted) {
    return (
      <div style={{ minHeight: "100vh", background: D.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <style>{STYLE}</style>
        <div style={{
          background: D.white, border: `1.5px solid ${D.border}`,
          borderLeft: `5px solid ${D.coral}`, borderRadius: 24, padding: "40px 28px", textAlign: "center", maxWidth: 360
        }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>💕</div>
          <h2 className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.wine, margin: "0 0 10px" }}>
            Completa el Test Primero
          </h2>
          <p className="caveat" style={{ fontSize: 16, color: D.muted, margin: "0 0 22px", lineHeight: 1.5 }}>
            Necesitamos conocerte mejor para personalizar tus 100 citas especiales
          </p>
          <button onClick={() => navigateTo("personality-test")} style={{
            padding: "12px 28px", borderRadius: 20, border: "none",
            background: D.coral, color: D.white, cursor: "pointer",
            fontFamily: "Caveat, cursive", fontSize: 17, fontWeight: 700
          }}>
            Hacer el Test ♡
          </button>
          <div style={{ marginTop: 14 }}>
            <button onClick={() => navigateTo("dashboard")} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "Caveat, cursive", fontSize: 15, color: D.muted
            }}>← Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: D.cream, paddingBottom: 88, maxWidth: 430, margin: "0 auto" }}>
      <style>{STYLE}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: D.cream,
        borderBottom: `1.5px solid ${D.border}`, padding: "48px 20px 14px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <button onClick={() => navigateTo("dashboard")} style={{
            width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${D.border}`,
            background: D.white, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0
          }}>
            <ChevronLeft size={18} color={D.coral} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.wine, margin: 0 }}>
              Mis Citas
            </h1>
            <p className="caveat" style={{ fontSize: 15, color: D.muted, margin: 0 }}>
              {filteredCitas.length} citas personalizadas ♡
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setSelectedFilter(f)} style={{
              padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedFilter === f ? D.coral : D.border}`,
              background: selectedFilter === f ? D.coral : D.white,
              color: selectedFilter === f ? D.white : D.muted,
              cursor: "pointer", fontFamily: "Caveat, cursive", fontSize: 14,
              fontWeight: selectedFilter === f ? 700 : 400, whiteSpace: "nowrap", flexShrink: 0
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px", position: "relative", zIndex: 1 }}>
        {/* Citas list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {filteredCitas.map((cita, i) => {
            const pref = preferences[cita.id];
            return (
              <motion.div
                key={cita.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                style={{
                  background: D.white, border: `1.5px solid ${D.border}`,
                  borderLeft: `4px solid ${ACCENT_COLORS[i % 4]}`,
                  borderRadius: 16, padding: "14px 16px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1, marginRight: 10 }}>
                    <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: "0 0 3px" }}>
                      #{String(cita.displayId || i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="lora" style={{ fontSize: 16, fontWeight: 700, color: D.wine, margin: "0 0 6px" }}>
                      {cita.title}
                    </h3>
                    <p style={{ fontFamily: "Lora, serif", fontSize: 13, color: D.muted, lineHeight: 1.5, margin: "0 0 8px",
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                      {cita.description}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {cita.category && (
                        <span className="caveat" style={{
                          fontSize: 12, padding: "2px 9px", borderRadius: 20,
                          background: D.cream, border: `1px solid ${D.border}`, color: D.muted
                        }}>{cita.category}</span>
                      )}
                      {cita.budget && (
                        <span className="caveat" style={{
                          fontSize: 12, padding: "2px 9px", borderRadius: 20,
                          background: "#FFF7E6", border: `1px solid ${D.gold}`, color: D.gold
                        }}>{cita.budget}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleLikeCita(cita.id)} style={{
                      width: 34, height: 34, borderRadius: "50%", cursor: "pointer",
                      border: `1.5px solid ${pref === "like" ? D.coral : D.border}`,
                      background: pref === "like" ? D.coral : D.white,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <ThumbsUp size={14} color={pref === "like" ? D.white : D.muted} />
                    </button>
                    <button onClick={() => handleDislikeCita(cita.id)} style={{
                      width: 34, height: 34, borderRadius: "50%", cursor: "pointer",
                      border: `1.5px solid ${pref === "dislike" ? D.muted : D.border}`,
                      background: pref === "dislike" ? D.muted : D.white,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <ThumbsDown size={14} color={pref === "dislike" ? D.white : D.muted} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{
          background: D.wine, borderRadius: 20, padding: "20px 18px",
          display: "flex", justifyContent: "space-around", textAlign: "center"
        }}>
          {[
            { label: "Total", value: citas.length, color: D.blush },
            { label: "Me gustan", value: stats.likes, color: D.gold },
            { label: "No me gustan", value: stats.dislikes, color: D.muted }
          ].map((s, i) => (
            <div key={i}>
              <div className="caveat" style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div className="caveat" style={{ fontSize: 13, color: "rgba(253,246,236,0.6)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
