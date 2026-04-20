import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Heart, Copy, Check, LogOut, Lock, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

function SectionCard({ title, icon, accent = D.coral, children }) {
  return (
    <div style={{
      background: D.white, border: `1.5px solid ${D.border}`,
      borderLeft: `4px solid ${accent}`, borderRadius: 18, padding: "18px 18px",
      marginBottom: 14
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <img src={icon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
        <h3 className="lora" style={{ fontSize: 17, fontWeight: 700, color: D.wine, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

const inputSt = {
  width: "100%", padding: "10px 13px", border: `1.5px solid ${D.border}`,
  borderRadius: 12, background: D.cream, outline: "none",
  fontFamily: "Lora, Georgia, serif", fontSize: 14, color: D.wine, boxSizing: "border-box"
};

// ── Achievement categories ────────────────────────────────────────────────────
const ACH_CATEGORIES = [
  { key: 'days_together', label: 'Tiempo juntos',  emoji: '💖' },
  { key: 'citas',         label: 'Citas',          emoji: '🎡' },
  { key: 'experiencia',   label: 'Experiencias',   emoji: '✈️'  },
];

// ── Single achievement card ───────────────────────────────────────────────────
function AchievementCard({ ach, isNew }) {
  const controls = useAnimation();
  const isUnlocked  = ach.unlocked;
  const isInProgress = !isUnlocked && ach.progress > 0;
  const pct = Math.min(100, Math.round((ach.progress / ach.target) * 100));

  // Unlock animation: scale-bounce + glow pulse
  useEffect(() => {
    if (isNew) {
      controls.start({
        scale: [1, 1.12, 0.96, 1.05, 1],
        transition: { duration: 0.55, ease: 'easeOut' },
      });
    }
  }, [isNew, controls]);

  const bg         = isUnlocked  ? '#FFFBEE'  : isInProgress ? '#FFF9F0' : D.cream;
  const borderCol  = isUnlocked  ? D.gold     : isInProgress ? '#F5C842' : D.border;
  const iconOpacity = isUnlocked ? 1 : isInProgress ? 0.75 : 0.35;

  return (
    <motion.div
      animate={controls}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      style={{
        background: bg,
        border: `1.5px solid ${borderCol}`,
        borderRadius: 20,
        padding: '16px 16px 14px',
        position: 'relative',
        overflow: 'hidden',
        opacity: isUnlocked || isInProgress ? 1 : 0.5,
        boxShadow: isNew
          ? `0 0 0 3px ${D.gold}55, 0 4px 16px ${D.gold}33`
          : isUnlocked
            ? `0 2px 10px ${D.gold}22`
            : 'none',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Glow halo for newly unlocked */}
      <AnimatePresence>
        {isNew && (
          <motion.div
            initial={{ opacity: 0.7, scale: 0.8 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 20,
              background: `radial-gradient(circle, ${D.gold}44 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Lock overlay for fully blocked */}
      {!isUnlocked && !isInProgress && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 22, height: 22, borderRadius: '50%',
          background: D.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={11} color={D.muted} />
        </div>
      )}

      {/* NEW badge */}
      <AnimatePresence>
        {isNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: D.gold, color: D.white,
              borderRadius: 8, padding: '2px 8px',
              fontFamily: 'Caveat, cursive', fontSize: 11, fontWeight: 700,
              boxShadow: `0 2px 8px ${D.gold}55`,
            }}
          >✨ NUEVO
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: isUnlocked ? `${D.gold}22` : isInProgress ? `${D.coral}11` : `${D.border}55`,
          border: `1.5px solid ${isUnlocked ? D.gold : isInProgress ? D.coral : D.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, opacity: iconOpacity,
        }}>
          {ach.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="lora" style={{
            fontSize: 14, fontWeight: 700, color: D.wine,
            margin: 0, lineHeight: 1.2,
          }}>
            {ach.title}
          </p>
          <p className="caveat" style={{
            fontSize: 12, color: D.muted, margin: '3px 0 0', lineHeight: 1.3,
          }}>
            {ach.description}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, borderRadius: 6,
        background: isUnlocked ? `${D.gold}33` : D.border,
        overflow: 'hidden', marginBottom: 4,
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          style={{
            height: '100%', borderRadius: 6,
            background: isUnlocked
              ? `linear-gradient(90deg, ${D.gold}, #F5C842)`
              : isInProgress
                ? `linear-gradient(90deg, ${D.coral}, #FF9AAB)`
                : D.border,
          }}
        />
      </div>

      {/* Progress label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="caveat" style={{
          fontSize: 11,
          color: isUnlocked ? D.gold : isInProgress ? D.coral : D.muted,
          fontWeight: isUnlocked ? 700 : 400,
        }}>
          {isUnlocked
            ? `✓ Completado · ${pct}%`
            : `${ach.progress} / ${ach.target}`}
        </span>
        {ach.unlocked && ach.unlocked_at && (
          <span className="caveat" style={{ fontSize: 10, color: D.muted }}>
            {new Date(ach.unlocked_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Full achievements section with preview + grouped view ─────────────────────
function AchievementsSection({ achievements, newUnlocks, showAll, onToggleAll }) {
  const unlockedCount  = achievements.filter(a => a.unlocked).length;
  const total          = achievements.length;

  // Find the "days together" progress for the summary line
  const daysAch = achievements.find(a => a.type === 'days_together' && a.progress > 0);
  const daysVal = daysAch?.progress ?? 0;

  // Preview: 2 unlocked + 1 nearest in-progress
  const preview = [
    ...achievements.filter(a => a.unlocked).slice(0, 2),
    ...achievements.filter(a => !a.unlocked && a.progress > 0).slice(0, 1),
    ...achievements.filter(a => !a.unlocked && a.progress === 0).slice(0, 1),
  ].slice(0, 4);

  return (
    <div style={{ marginBottom: 14 }}>
      {/* ── Header card ────────────────────────────────────────────── */}
      <div style={{
        background: D.wine, borderRadius: 20, padding: '18px 20px',
        marginBottom: 12, position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{
          position: 'absolute', right: -20, top: -20,
          width: 90, height: 90, borderRadius: '50%',
          background: 'rgba(255,208,220,0.08)',
        }}/>
        <div style={{
          position: 'absolute', right: 20, bottom: -30,
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(212,165,32,0.12)',
        }}/>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `${D.gold}33`, border: `1.5px solid ${D.gold}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🏆</div>
          <div>
            <p className="lora" style={{ fontSize: 16, fontWeight: 700, color: D.white, margin: 0 }}>
              Mis Logros
            </p>
            <p className="caveat" style={{ fontSize: 13, color: D.blush, margin: '1px 0 0' }}>
              {unlockedCount} de {total} desbloqueados
            </p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ height: 7, borderRadius: 8, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: total ? `${Math.round((unlockedCount / total) * 100)}%` : '0%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            style={{
              height: '100%', borderRadius: 8,
              background: `linear-gradient(90deg, ${D.gold}, #F5C842)`,
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <span className="caveat" style={{ fontSize: 13, color: D.blush }}>
            {daysVal > 0 ? `Llevan ${daysVal} días juntos 💖` : 'Completa citas para ganar logros'}
          </span>
          <span className="caveat" style={{ fontSize: 13, color: D.gold, fontWeight: 700 }}>
            {total ? Math.round((unlockedCount / total) * 100) : 0}%
          </span>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div style={{
          background: D.white, border: `1.5px dashed ${D.border}`,
          borderRadius: 20, padding: '32px 20px', textAlign: 'center',
        }}>
          <span style={{ fontSize: 32 }}>🏆</span>
          <p className="lora" style={{ fontSize: 15, fontWeight: 600, color: D.wine, margin: '10px 0 4px' }}>
            Inicia sesión para ver tus logros
          </p>
        </div>
      ) : (
        <>
          {/* ── Preview strip (collapsed) ─────────────────────────── */}
          {!showAll && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {preview.map(ach => (
                <AchievementCard key={ach.id} ach={ach} isNew={newUnlocks.includes(ach.id)} />
              ))}
            </div>
          )}

          {/* ── Full grouped view (expanded) ─────────────────────── */}
          <AnimatePresence>
            {showAll && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                {ACH_CATEGORIES.map(cat => {
                  const group = achievements.filter(a => a.type === cat.key);
                  if (!group.length) return null;
                  return (
                    <div key={cat.key} style={{ marginBottom: 20 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 10, paddingLeft: 4,
                      }}>
                        <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                        <span className="lora" style={{ fontSize: 15, fontWeight: 700, color: D.wine }}>
                          {cat.label}
                        </span>
                        <span className="caveat" style={{
                          fontSize: 12, color: D.muted,
                          background: D.cream, border: `1px solid ${D.border}`,
                          borderRadius: 20, padding: '1px 8px',
                        }}>
                          {group.filter(a => a.unlocked).length}/{group.length}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {group.map(ach => (
                          <AchievementCard key={ach.id} ach={ach} isNew={newUnlocks.includes(ach.id)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Toggle button ──────────────────────────────────────── */}
          <button
            onClick={onToggleAll}
            style={{
              width: '100%', marginTop: 10, padding: '11px 0',
              borderRadius: 14, border: `1.5px solid ${D.border}`,
              background: D.white, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: 'Caveat, cursive', fontSize: 15, color: D.wine,
            }}
          >
            {showAll ? <><ChevronDown size={16} /> Ocultar logros</> : <><ChevronRight size={16} /> Ver todos los logros ({total})</>}
          </button>
        </>
      )}
    </div>
  );
}

export default function ProfilePage({ navigateTo, onOpenLogin }) {
  const [user, setUser] = useState(null);
  const [redirecting, setRedirecting] = useState(!localStorage.getItem('loversappToken'));
  const [partnerCode, setPartnerCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [coupled, setCoupled] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [relationshipStartDate, setRelationshipStartDate] = useState("");
  const [boyfriendDate, setBoyfriendDate] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("Buenos días, mi amor");
  const [greetingSubtext, setGreetingSubtext] = useState("Hoy les toca una cita especial ✦");
  const [personalityTest, setPersonalityTest] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [prefStats, setPrefStats] = useState({ likes: 0, dislikes: 0 });
  const [achievements, setAchievements]       = useState([]);
  const [newUnlocks, setNewUnlocks]           = useState([]);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const seenAchievements = useRef(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (redirecting) {
      if (onOpenLogin) onOpenLogin('login');
      else navigateTo('home');
      return;
    }
    const userData = localStorage.getItem("loversappUser");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      // Use server partner_code if available, otherwise use locally cached one
      setPartnerCode(parsed.partner_code || parsed.partnerCode || "");
      if (parsed.coupled || parsed.coupled_user_id) setCoupled(true);
      if (parsed.relationshipStartDate || parsed.relationship_start_date) setRelationshipStartDate(parsed.relationshipStartDate || parsed.relationship_start_date || "");
      if (parsed.boyfriendDate || parsed.boyfriend_date) setBoyfriendDate(parsed.boyfriendDate || parsed.boyfriend_date || "");
      if (parsed.greetingMessage || parsed.greeting_message) setGreetingMessage(parsed.greetingMessage || parsed.greeting_message || "Buenos días, mi amor");
      if (parsed.greetingSubtext || parsed.greeting_subtext) setGreetingSubtext(parsed.greetingSubtext || parsed.greeting_subtext || "Hoy les toca una cita especial ❆");
      if (parsed.personalityTest || parsed.personality_test) {
        const pt = parsed.personalityTest || parsed.personality_test;
        setPersonalityTest(typeof pt === 'string' ? JSON.parse(pt) : pt);
      }
      if (parsed.citaPreferences) {
        setPreferences(parsed.citaPreferences);
        const likes = Object.values(parsed.citaPreferences).filter(p => p === "like").length;
        const dislikes = Object.values(parsed.citaPreferences).filter(p => p === "dislike").length;
        setPrefStats({ likes, dislikes });
      }
    }

    // Load fresh data from server
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getMe().then(serverUser => {
        if (serverUser.partner_code) setPartnerCode(serverUser.partner_code);
        if (serverUser.coupled_user_id) setCoupled(true);
        if (serverUser.relationship_start_date) setRelationshipStartDate(serverUser.relationship_start_date);
        if (serverUser.boyfriend_date) setBoyfriendDate(serverUser.boyfriend_date);
        if (serverUser.greeting_message) setGreetingMessage(serverUser.greeting_message);
        if (serverUser.greeting_subtext) setGreetingSubtext(serverUser.greeting_subtext);
        const pt = serverUser.personality_test;
        if (pt) setPersonalityTest(typeof pt === 'string' ? JSON.parse(pt) : pt);
        // Merge into localStorage
        const cached = JSON.parse(localStorage.getItem('loversappUser') || '{}');
        const merged = { ...cached, ...serverUser, partner: serverUser.partner_name || cached.partner, partnerCode: serverUser.partner_code || cached.partnerCode };
        localStorage.setItem('loversappUser', JSON.stringify(merged));
        setUser(merged);
      }).catch(() => {});

      // Load achievements (live from API)
      api.getAchievements()
        .then(list => {
          // detect newly unlocked since last render
          const justUnlocked = list
            .filter(a => a.unlocked && !seenAchievements.current.has(a.id))
            .map(a => a.id);
          list.forEach(a => seenAchievements.current.add(a.id));
          setAchievements(list);
          if (justUnlocked.length) {
            setNewUnlocks(justUnlocked);
            setTimeout(() => setNewUnlocks([]), 3000);
          }
        })
        .catch(err => console.warn('[Profile] getAchievements failó:', err.message));
    }
  }, []);

  const generatePartnerCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(partnerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Código copiado", description: "Tu código de pareja ha sido copiado al portapapeles" });
  };

  const formatLocalDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return "";
    return new Date(year, month - 1, day).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const handleJoinPartner = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) { toast({ title: "Error", description: "Por favor ingresa un código de pareja" }); return; }
    if (inputCode.toUpperCase() === partnerCode) { toast({ title: "Error", description: "No puedes usar tu propio código. Pídele el código a tu pareja" }); return; }

    const token = localStorage.getItem('loversappToken');
    if (token) {
      try {
        const result = await api.coupleWith(inputCode.toUpperCase().trim());
        const updatedUser = { ...user, coupled: true, coupled_user_id: result.partner?.id, partnerLinked: result.partner?.name };
        localStorage.setItem("loversappUser", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setCoupled(true); setInputCode(""); setShowJoinForm(false);
        toast({ title: "¡Vinculado!", description: `Conectado con ${result.partner?.name || 'tu pareja'} 💕` });
      } catch (err) {
        toast({ title: "Error al vincular", description: err.message || "Código no válido o no encontrado" });
      }
      return;
    }

    // Offline fallback
    const updatedUser = { ...user, coupled: true, partnerCodeUsed: inputCode.toUpperCase() };
    localStorage.setItem("loversappUser", JSON.stringify(updatedUser));
    setCoupled(true); setInputCode(""); setShowJoinForm(false);
    toast({ title: "¡Vinculado!", description: "Ahora estás ligado como pareja en LoversApp 💕" });
  };

  const handleUncouple = async () => {
    if (!window.confirm('¿Deseas desvincular tu cuenta de tu pareja?')) return;
    const token = localStorage.getItem('loversappToken');
    if (token) {
      try {
        await api.uncouple();
      } catch {}
    }
    const updatedUser = { ...user, coupled: false, coupled_user_id: null, partnerLinked: null };
    localStorage.setItem("loversappUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setCoupled(false);
    toast({ title: "Desvinculado", description: "Ya no están vinculados como pareja" });
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) { toast({ title: "Error", description: "Por favor ingresa una meta" }); return; }
    const goals = user?.goals || [];
    const updatedGoals = [...goals, { id: Date.now(), text: newGoal, completed: false }];
    const updatedUser = { ...user, goals: updatedGoals };
    setUser(updatedUser);
    localStorage.setItem("loversappUser", JSON.stringify(updatedUser));
    setNewGoal("");
    toast({ title: "Meta agregada", description: "Tu nueva meta ha sido agregada" });
  };

  const toggleGoal = (goalId) => {
    const updatedGoals = user?.goals?.map(goal => goal.id === goalId ? { ...goal, completed: !goal.completed } : goal) || [];
    const updatedUser = { ...user, goals: updatedGoals };
    setUser(updatedUser);
    localStorage.setItem("loversappUser", JSON.stringify(updatedUser));
  };

  const handleSaveRelationshipDate = () => {
    if (!relationshipStartDate) { toast({ title: "Error", description: "Por favor selecciona una fecha" }); return; }
    const updatedUser = { ...user, relationshipStartDate };
    setUser(updatedUser);
    localStorage.setItem("loversappUser", JSON.stringify(updatedUser));
    if (localStorage.getItem('loversappToken')) {
      api.updateMe({ relationship_start_date: relationshipStartDate }).catch(() => {});
    }
    toast({ title: "Fecha guardada", description: "Se guardó la fecha de inicio de la relación" });
  };

  const handleSaveGreeting = () => {
    const updatedUser = { ...user, greetingMessage, greetingSubtext };
    setUser(updatedUser);
    localStorage.setItem("loversappUser", JSON.stringify(updatedUser));    if (localStorage.getItem('loversappToken')) {
      api.updateMe({ greeting_message: greetingMessage, greeting_subtext: greetingSubtext }).catch(() => {});
    }    toast({ title: "Saludo guardado", description: "El mensaje de inicio se actualizó ✦" });
  };

  const handleSaveBoyfriendDate = () => {
    if (!boyfriendDate) { toast({ title: "Error", description: "Por favor selecciona una fecha" }); return; }
    const updatedUser = { ...user, boyfriendDate };
    setUser(updatedUser);
    localStorage.setItem("loversappUser", JSON.stringify(updatedUser));
    if (localStorage.getItem('loversappToken')) {
      api.updateMe({ boyfriend_date: boyfriendDate }).catch(() => {});
    }
    toast({ title: "Fecha guardada", description: "Se guardó la fecha de cuando se volvieron novios" });
  };

  if (redirecting || !user) {
    if (redirecting) return null;
    return (
      <div style={{ minHeight: "100vh", background: D.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="caveat" style={{ fontSize: 18, color: D.muted }}>Cargando perfil...</p>
      </div>
    );
  }

  const initials = ((user.name?.[0] || "") + (user.partner?.[0] || "")).toUpperCase();

  return (
    <PageLayout>
      <PageHeader
        breadcrumb="Mi Perfil"
        title="Mi Perfil"
        icon="/images/perfil.png"
        onBack={() => navigateTo("dashboard")}
      />

      <div style={{ padding: "18px 20px" }}>
        {/* Profile card */}
        <div style={{
          background: D.wine, borderRadius: 20, padding: "22px 20px",
          display: "flex", alignItems: "center", gap: 16, marginBottom: 14
        }}>
          <div style={{
            width: 58, height: 58, borderRadius: "50%",
            background: "rgba(255,208,220,0.3)", border: "2px solid rgba(255,208,220,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <span className="caveat" style={{ fontSize: 22, fontWeight: 700, color: D.blush }}>{initials || "❤"}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="lora" style={{ fontSize: 18, fontWeight: 700, color: D.white, margin: "0 0 4px" }}>
              {user.name || "Usuario"}{user.partner ? ` & ${user.partner}` : ""}
            </h2>
            {user.email && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <img src="/images/mensajes.png" alt="" style={{ width:12, height:12, objectFit:'contain', opacity:0.7 }}/>
                <span className="caveat" style={{ fontSize: 13, color: D.blush }}>{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Partner Pairing */}
        <SectionCard title="Vincular Pareja" icon="/images/2-corazoncitos.png" accent={D.coral}>
          {!coupled ? (
            <div>
              <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: "0 0 8px" }}>
                Tu código de pareja — compártelo con tu pareja:
              </p>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{
                  flex: 1, background: D.cream, border: `1.5px solid ${D.border}`,
                  borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center"
                }}>
                  <span className="caveat" style={{ fontSize: 22, fontWeight: 700, color: D.coral, letterSpacing: 4 }}>
                    {partnerCode}
                  </span>
                </div>
                <button onClick={copyCodeToClipboard} style={{
                  padding: "10px 16px", borderRadius: 12, border: "none",
                  background: D.wine, color: D.white, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "Caveat, cursive", fontSize: 14
                }}>
                  {copied ? <><Check size={14} />Copiado</> : <><Copy size={14} />Copiar</>}
                </button>
              </div>
              <button onClick={() => setShowJoinForm(!showJoinForm)} style={{
                width: "100%", padding: "10px 0", borderRadius: 12, border: "none",
                background: D.coral, color: D.white, cursor: "pointer",
                fontFamily: "Caveat, cursive", fontSize: 15, fontWeight: 700
              }}>
                {showJoinForm ? "Cancelar" : "Ingresar Código de Pareja"}
              </button>
              {showJoinForm && (
                <motion.form initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleJoinPartner} style={{ marginTop: 12 }}>
                  <input type="text" value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Código (6-8 caracteres)" maxLength="8"
                    style={{ ...inputSt, textAlign: "center", fontSize: 20, letterSpacing: 4, marginBottom: 8 }} />
                  <button type="submit" style={{
                    width: "100%", padding: "10px 0", borderRadius: 12, border: "none",
                    background: D.wine, color: D.white, cursor: "pointer",
                    fontFamily: "Caveat, cursive", fontSize: 15
                  }}>Vincular Pareja</button>
                </motion.form>
              )}
            </div>
          ) : (
            <div style={{
              background: D.cream, borderRadius: 14, padding: "14px 16px",
              textAlign: "center", border: `1.5px solid ${D.border}`
            }}>
              <Heart size={20} color={D.coral} fill={D.coral} style={{ margin: "0 auto 6px" }} />
              <p className="lora" style={{ fontSize: 15, fontWeight: 700, color: D.wine, margin: "0 0 4px" }}>
                ¡Ya están vinculados como pareja! 💕
              </p>
              <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: "0 0 12px" }}>
                {user?.partnerLinked ? `Conectado con ${user.partnerLinked}` : "Comparten todas las experiencias juntos"}
              </p>
              <button onClick={handleUncouple} style={{
                padding: "7px 20px", borderRadius: 10, border: `1.5px solid #E05555`,
                background: "transparent", color: "#E05555", cursor: "pointer",
                fontFamily: "Caveat, cursive", fontSize: 13
              }}>Desvincular pareja</button>
            </div>
          )}
        </SectionCard>

        {/* Relationship Dates */}
        <SectionCard title="Fechas de la Relación" icon="/images/calendario.png" accent={D.gold}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <div>
              <label className="caveat" style={{ fontSize: 14, color: D.wine, display: "block", marginBottom: 5 }}>
                Saliendo desde 💕
              </label>
              <input type="date" value={relationshipStartDate}
                onChange={(e) => setRelationshipStartDate(e.target.value)} style={inputSt} />
              <button onClick={handleSaveRelationshipDate} style={{
                marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 10, border: "none",
                background: D.gold, color: D.white, cursor: "pointer",
                fontFamily: "Caveat, cursive", fontSize: 14
              }}>Guardar</button>
            </div>
            <div>
              <label className="caveat" style={{ fontSize: 14, color: D.wine, display: "block", marginBottom: 5 }}>
                Novios desde 💑
              </label>
              <input type="date" value={boyfriendDate}
                onChange={(e) => setBoyfriendDate(e.target.value)} style={inputSt} />
              <button onClick={handleSaveBoyfriendDate} style={{
                marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 10, border: "none",
                background: D.gold, color: D.white, cursor: "pointer",
                fontFamily: "Caveat, cursive", fontSize: 14
              }}>Guardar</button>
            </div>
          </div>
          {(relationshipStartDate || boyfriendDate) && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${D.border}` }}>
              {relationshipStartDate && (
                <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: "0 0 4px" }}>
                  💕 Desde: {formatLocalDate(relationshipStartDate)}
                </p>
              )}
              {boyfriendDate && (
                <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: 0 }}>
                  💑 Novios: {formatLocalDate(boyfriendDate)}
                </p>
              )}
            </div>
          )}
        </SectionCard>

        {/* Greeting Message */}
        <SectionCard title="Mensaje de Bienvenida" icon="/images/mensajes.png" accent={D.blue}>
          <div style={{ marginBottom: 10 }}>
            <label className="caveat" style={{ fontSize: 14, color: D.wine, display: "block", marginBottom: 5 }}>
              Mensaje principal
            </label>
            <input value={greetingMessage} onChange={(e) => setGreetingMessage(e.target.value)} style={inputSt} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="caveat" style={{ fontSize: 14, color: D.wine, display: "block", marginBottom: 5 }}>
              Subtítulo
            </label>
            <input value={greetingSubtext} onChange={(e) => setGreetingSubtext(e.target.value)} style={inputSt} />
          </div>
          <button onClick={handleSaveGreeting} style={{
            width: "100%", padding: "9px 0", borderRadius: 12, border: "none",
            background: D.blue, color: D.white, cursor: "pointer",
            fontFamily: "Caveat, cursive", fontSize: 15
          }}>Guardar mensaje</button>
        </SectionCard>

        {/* Personality Test */}
        <SectionCard title="Test de Personalidad" icon="/images/descubrir.png" accent={D.coral}>
          {personalityTest ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Personalidad", value: personalityTest.personality || "—" },
                  { label: "Mi edad", value: personalityTest.age ? `${personalityTest.age} años` : "—" },
                  { label: "Presupuesto", value: personalityTest.budget?.replace(/_/g, " ") || "—" }
                ].map((item, i) => (
                  <div key={i} style={{
                    background: D.cream, borderRadius: 12, padding: "10px 8px", textAlign: "center"
                  }}>
                    <div className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: "0 0 3px" }}>
                      {item.value}
                    </div>
                    <div className="caveat" style={{ fontSize: 12, color: D.muted }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => navigateTo("personality-profile")} style={{
                  padding: "9px 0", borderRadius: 12, border: "none",
                  background: D.coral, color: D.white, cursor: "pointer",
                  fontFamily: "Caveat, cursive", fontSize: 14
                }}>Ver perfil completo</button>
                <button onClick={() => navigateTo("citas-aleatorias")} style={{
                  padding: "9px 0", borderRadius: 12, border: `1.5px solid ${D.border}`,
                  background: D.white, color: D.wine, cursor: "pointer",
                  fontFamily: "Caveat, cursive", fontSize: 14
                }}>Ver mis citas</button>
                <button onClick={() => {
                  const u = JSON.parse(localStorage.getItem("loversappUser") || "{}");
                  delete u.personalityTest;
                  localStorage.setItem("loversappUser", JSON.stringify(u));
                  setPersonalityTest(null);
                  navigateTo("personality-test");
                }} style={{
                  padding: "9px 0", borderRadius: 12, border: `1.5px solid ${D.border}`,
                  background: D.cream, color: D.muted, cursor: "pointer",
                  fontFamily: "Caveat, cursive", fontSize: 14
                }}>Actualizar test</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <p className="caveat" style={{ fontSize: 15, color: D.muted, margin: "0 0 12px" }}>
                Completa el test para personalizar tus citas
              </p>
              <button onClick={() => navigateTo("personality-test")} style={{
                padding: "10px 24px", borderRadius: 20, border: "none",
                background: D.coral, color: D.white, cursor: "pointer",
                fontFamily: "Caveat, cursive", fontSize: 15, fontWeight: 700
              }}>Hacer el Test ♡</button>
            </div>
          )}
        </SectionCard>

        {/* Preferences Analytics */}
        {Object.keys(preferences).length > 0 && (
          <SectionCard title="Mis Preferencias" icon="/images/favoritos.png" accent={D.green}>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{
                flex: 1, background: "#EFF8F1", border: `1.5px solid ${D.green}`,
                borderRadius: 12, padding: "12px 10px", textAlign: "center"
              }}>
                <div className="caveat" style={{ fontSize: 28, fontWeight: 700, color: D.green }}>{prefStats.likes}</div>
                <div className="caveat" style={{ fontSize: 13, color: D.green }}>Me gustan</div>
              </div>
              <div style={{
                flex: 1, background: D.cream, border: `1.5px solid ${D.border}`,
                borderRadius: 12, padding: "12px 10px", textAlign: "center"
              }}>
                <div className="caveat" style={{ fontSize: 28, fontWeight: 700, color: D.muted }}>{prefStats.dislikes}</div>
                <div className="caveat" style={{ fontSize: 13, color: D.muted }}>No me gustan</div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Goals */}
        <SectionCard title="Nuestras Metas" icon="/images/metas.png" accent={D.gold}>
          <form onSubmit={handleAddGoal} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Nueva meta..." style={{ ...inputSt, flex: 1 }} />
            <button type="submit" style={{
              padding: "10px 16px", borderRadius: 12, border: "none",
              background: D.wine, color: D.white, cursor: "pointer",
              fontFamily: "Caveat, cursive", fontSize: 14, flexShrink: 0
            }}>+ Agregar</button>
          </form>
          {(user?.goals || []).length === 0 ? (
            <p className="caveat" style={{ fontSize: 14, color: D.muted, textAlign: "center", margin: 0 }}>
              No hay metas todavía. ¡Agrega la primera!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(user?.goals || []).map(goal => (
                <div key={goal.id} onClick={() => toggleGoal(goal.id)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  background: goal.completed ? "#EFF8F1" : D.cream,
                  border: `1.5px solid ${goal.completed ? D.green : D.border}`
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${goal.completed ? D.green : D.border}`,
                    background: goal.completed ? D.green : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {goal.completed && <span style={{ color: D.white, fontSize: 11 }}>✓</span>}
                  </div>
                  <span className="lora" style={{
                    fontSize: 14, color: goal.completed ? D.green : D.wine,
                    textDecoration: goal.completed ? "line-through" : "none"
                  }}>{goal.text}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Achievements ─────────────────────────────────────────── */}
        <AchievementsSection
          achievements={achievements}
          newUnlocks={newUnlocks}
          showAll={showAllAchievements}
          onToggleAll={() => setShowAllAchievements(v => !v)}
        />

        {/* Logout */}
        <button onClick={() => {
          localStorage.removeItem("loversappUser");
          localStorage.removeItem("loversappToken");
          window.location.reload();
        }} style={{
          width: "100%", padding: "13px 0", borderRadius: 14,
          border: `1.5px solid ${D.border}`, background: D.white,
          color: D.muted, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontFamily: "Caveat, cursive", fontSize: 16
        }}>
          <LogOut size={16} color={D.muted} />
          Cerrar sesión
        </button>
      </div>
    </PageLayout>
  );
}
