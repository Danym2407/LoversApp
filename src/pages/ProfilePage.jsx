import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Copy, Check, Users, Mail, Calendar, Zap, Target, Trophy, ThumbsUp, ThumbsDown, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

const D = {
  cream: "#FDF6EC", wine: "#1C0E10", coral: "#C44455", gold: "#D4A520",
  blue: "#5B8ECC", green: "#5BAA6A", blush: "#F0C4CC", white: "#FFFFFF",
  border: "#EDE0D0", muted: "#9A7A6A"
};
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

function SectionCard({ title, icon, accent = D.coral, children }) {
  return (
    <div style={{
      background: D.white, border: `1.5px solid ${D.border}`,
      borderLeft: `4px solid ${accent}`, borderRadius: 18, padding: "18px 18px",
      marginBottom: 14
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {icon}
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

export default function ProfilePage({ navigateTo }) {
  const [user, setUser] = useState(null);
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
  const { toast } = useToast();

  useEffect(() => {
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

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: D.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{STYLE}</style>
        <p className="caveat" style={{ fontSize: 18, color: D.muted }}>Cargando perfil...</p>
      </div>
    );
  }

  const initials = ((user.name?.[0] || "") + (user.partner?.[0] || "")).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: D.cream, paddingBottom: 88, maxWidth: 430, margin: "0 auto" }}>
      <style>{STYLE}</style>

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
          <h1 className="lora" style={{ fontSize: 22, fontWeight: 700, color: D.wine, margin: 0 }}>
            Mi Perfil
          </h1>
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        {/* Profile card */}
        <div style={{
          background: D.wine, borderRadius: 20, padding: "22px 20px",
          display: "flex", alignItems: "center", gap: 16, marginBottom: 14
        }}>
          <div style={{
            width: 58, height: 58, borderRadius: "50%",
            background: "rgba(240,196,204,0.25)", border: "2px solid rgba(240,196,204,0.4)",
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
                <Mail size={12} color={D.blush} />
                <span className="caveat" style={{ fontSize: 13, color: D.blush }}>{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Partner Pairing */}
        <SectionCard title="Vincular Pareja" icon={<Users size={16} color={D.coral} />} accent={D.coral}>
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
        <SectionCard title="Fechas de la Relación" icon={<Calendar size={16} color={D.gold} />} accent={D.gold}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
        <SectionCard title="Mensaje de Bienvenida" icon={<Zap size={16} color={D.blue} />} accent={D.blue}>
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
        <SectionCard title="Test de Personalidad" icon={<Heart size={16} color={D.coral} />} accent={D.coral}>
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
          <SectionCard title="Mis Preferencias" icon={<ThumbsUp size={16} color={D.green} />} accent={D.green}>
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
        <SectionCard title="Nuestras Metas" icon={<Target size={16} color={D.gold} />} accent={D.gold}>
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

        {/* Achievements */}
        <SectionCard title="Logros" icon={<Trophy size={16} color={D.gold} />} accent={D.gold}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "❤️", label: "Primer Mes", desc: "1 mes juntos", color: D.coral },
              { icon: "🎯", label: "100 Citas", desc: "Meta completada", color: D.gold },
              { icon: "✈️", label: "Amante del Viaje", desc: "5 citas de viaje", color: D.blue },
              { icon: "📝", label: "Poeta", desc: "3 cartas escritas", color: D.green }
            ].map((a, i) => (
              <div key={i} style={{
                background: D.cream, border: `1.5px solid ${D.border}`,
                borderLeft: `3px solid ${a.color}`, borderRadius: 14, padding: "12px 12px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{a.icon}</div>
                <div className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: "0 0 2px" }}>
                  {a.label}
                </div>
                <div className="caveat" style={{ fontSize: 12, color: D.muted }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </SectionCard>

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
    </div>
  );
}
