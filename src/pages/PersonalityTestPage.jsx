import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { upsertCalendarEvent } from "@/lib/eventSync";
import { api } from "@/lib/api";

const D = {
  cream: "#FDF6EC", wine: "#1C0E10", coral: "#C44455", gold: "#D4A520",
  blue: "#5B8ECC", green: "#5BAA6A", blush: "#F0C4CC", white: "#FFFFFF",
  border: "#EDE0D0", muted: "#9A7A6A"
};
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

export default function PersonalityTestPage({ navigateTo }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const questions = [
    { id: "birthDate", type: "date", question: "¿Cuál es tu fecha de nacimiento?", subtitle: "Esto nos ayuda a entender mejor tu etapa de vida", options: null },
    { id: "lifeStage", type: "single", question: "¿En qué etapa de vida estás?", subtitle: "Selecciona la que mejor aplique", options: [
      { id: "secondary", label: "🏫 Secundaria" }, { id: "high_school", label: "📚 Preparatoria" },
      { id: "university", label: "🎓 Universidad" }, { id: "professional", label: "💼 Profesionales" },
      { id: "established", label: "🏡 Establecidos" }
    ]},
    { id: "personalityType", type: "single", question: "¿Cómo describirías tu personalidad general?", subtitle: "Tu naturaleza predominante", options: [
      { id: "very_calm", label: "😌 Muy tranquilo/a" }, { id: "calm", label: "😊 Tranquilo/a" },
      { id: "balanced", label: "⚖️ Balanceado/a" }, { id: "adventurous", label: "🎢 Aventurero/a" },
      { id: "very_adventurous", label: "🔥 Muy aventurero/a" }
    ]},
    { id: "budget", type: "single", question: "¿Cuál es tu presupuesto típico para una cita?", subtitle: "Esto nos ayuda a sugerir opciones acordes", options: [
      { id: "very_low", label: "💰 Muy bajo (< $100 MXN)" }, { id: "low", label: "💵 Bajo ($100-300 MXN)" },
      { id: "medium", label: "💴 Medio ($300-800 MXN)" }, { id: "high", label: "💶 Alto ($800-2,500 MXN)" },
      { id: "very_high", label: "💎 Muy alto (> $2,500 MXN)" }
    ]},
    { id: "hobbies", type: "multiple", question: "¿Cuáles son tus hobbies e intereses? (Selecciona varios)", subtitle: "Te ayuda a personalizar tus citas", options: [
      { id: "sports", label: "⚽ Deportes" }, { id: "arts", label: "🎨 Artes" }, { id: "music", label: "🎵 Música" },
      { id: "movies", label: "🎬 Películas/Series" }, { id: "outdoor", label: "🏕️ Actividades al aire libre" },
      { id: "food", label: "🍽️ Gastronomía" }, { id: "travel", label: "✈️ Viajes" },
      { id: "gaming", label: "🎮 Videojuegos" }, { id: "tech", label: "💻 Tecnología" }, { id: "books", label: "📖 Literatura" },
      { id: "cooking", label: "🍳 Cocinar" }, { id: "photography", label: "📷 Fotografía" },
      { id: "dancing", label: "💃 Bailar" }, { id: "pets", label: "🐾 Mascotas" }
    ]},
    { id: "preferredEnvironment", type: "single", question: "¿Prefieres citas más en...", subtitle: "Tu zona de confort", options: [
      { id: "indoor", label: "🏠 Interior (cafés, cines, restaurantes)" },
      { id: "outdoor", label: "🌳 Exterior (parques, plazas, naturaleza)" },
      { id: "mixed", label: "🔄 Ambas por igual" }
    ]},
    { id: "dateFrequency", type: "single", question: "¿Con qué frecuencia prefieres salir?", subtitle: "Para ajustar el ritmo de citas", options: [
      { id: "weekly", label: "📅 Una o más veces por semana" }, { id: "biweekly", label: "📆 Cada dos semanas" },
      { id: "monthly", label: "🗓️ Más o menos mensual" }, { id: "spontaneous", label: "⚡ Espontáneamente" }
    ]},
    { id: "surpriseFactor", type: "single", question: "¿Qué tan importantes son las sorpresas para ti?", subtitle: "Nivel de espontaneidad que disfrutas", options: [
      { id: "no_surprises", label: "📋 Prefiero planeado" }, { id: "some_surprises", label: "🎁 Algunas sorpresas" },
      { id: "often_surprises", label: "🎉 Sorpresas frecuentes" }, { id: "spontaneous", label: "🌀 Totalmente espontáneo" }
    ]},
    { id: "physicalActivity", type: "single", question: "¿Qué nivel de actividad física prefieres?", subtitle: "Para equilibrar citas activas vs relajadas", options: [
      { id: "sedentary", label: "🛋️ Sedentario" }, { id: "light", label: "🚶 Ligero" },
      { id: "moderate", label: "🚴 Moderado" }, { id: "intense", label: "💪 Intenso" }
    ]},
    { id: "socialSettings", type: "single", question: "¿Prefieres citas sociales o íntimas?", subtitle: "Con amigos o solo para dos", options: [
      { id: "intimate", label: "👫 Solo para dos" }, { id: "with_friends", label: "👥 Con amigos" }, { id: "mixed", label: "🔄 Ambas" }
    ]},
    { id: "culturalInterests", type: "multiple", question: "¿Qué tipo de actividades culturales te llaman?", subtitle: "Selecciona varias opciones", options: [
      { id: "museums", label: "🖼️ Museos" }, { id: "theater", label: "🎭 Teatro" },
      { id: "concerts", label: "🎤 Conciertos" }, { id: "exhibitions", label: "🎨 Exposiciones" },
      { id: "none", label: "❌ Ninguna en particular" }
    ]},
    { id: "nightLife", type: "single", question: "¿Te interesa la vida nocturna?", subtitle: "Bares, discotecas, salidas nocturnas, etc.", options: [
      { id: "not_interested", label: "😴 No me interesa" }, { id: "occasional", label: "🌙 Ocasionalmente" },
      { id: "sometimes", label: "⭐ A veces" }, { id: "often", label: "🌃 Muy a menudo" }
    ]},
    { id: "smokes", type: "single", question: "¿Fumas?", subtitle: "Nos ayuda a recomendar lugares con o sin zonas para fumadores", options: [
      { id: "none", label: "🚭 No fumo" },
      { id: "one",  label: "🚬 Sí fumo" },
      { id: "both", label: "💨 Solo ocasionalmente" }
    ]},
    { id: "drinks", type: "single", question: "¿Cómo te relacionas con el alcohol?", subtitle: "Ajustamos sugerencias a tu estilo de vida", options: [
      { id: "never",    label: "🧃 No tomo alcohol" },
      { id: "social",   label: "🥂 Solo en celebraciones" },
      { id: "moderate", label: "🍷 Moderado (fines de semana)" },
      { id: "frequent", label: "🍻 Con frecuencia" }
    ]},
    { id: "seasonPreference", type: "single", question: "¿En qué estación te sientes mejor para tener citas?", subtitle: "Para ajustar sugerencias", options: [
      { id: "spring", label: "🌸 Primavera" }, { id: "summer", label: "☀️ Verano" },
      { id: "fall", label: "🍂 Otoño" }, { id: "winter", label: "❄️ Invierno" }, { id: "any", label: "🔄 Cualquier época" }
    ]},
    { id: "citasTimeline", type: "single", question: "¿En cuánto tiempo planeas terminar las 100 citas?", subtitle: "Meta realista para disfrutar la experiencia", options: [
      { id: "one_month", label: "⚡ 1 mes (intenso!)" }, { id: "three_months", label: "🎯 3 meses (rápido)" },
      { id: "six_months", label: "📅 6 meses (moderado)" }, { id: "one_year", label: "⏰ 1 año (tranquilo)" },
      { id: "two_years", label: "🐢 2+ años (sin prisa)" }, { id: "no_deadline", label: "∞ Sin fecha límite" }
    ]},
    { id: "additionalComments", type: "text", question: "¿Algo más que debamos saber?", subtitle: "Preferencias especiales, restricciones, etc. (opcional)", placeholder: "Cuéntanos más sobre ti..." }
  ];

  const calculatePersonality = (a) => {
    const ps = { very_calm:1, calm:2, balanced:3, adventurous:4, very_adventurous:5 };
    const as = { sedentary:1, light:2, moderate:3, intense:4 };
    const ss = { no_surprises:1, some_surprises:2, often_surprises:4, spontaneous:5 };
    const ns = { not_interested:1, occasional:2, sometimes:3, often:5 };
    const score = ((ps[a.personalityType]||3)+(as[a.physicalActivity]||2)+(ss[a.surpriseFactor]||2)+(ns[a.nightLife]||1))/4;
    if (score <= 2) return "tranquilo";
    if (score >= 3.8) return "extremo";
    return "hibrido";
  };

  const calculateBudgetLevel = (budget) => ({ very_low:1, low:2, medium:3, high:4, very_high:5 }[budget] || 3);

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date(), birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const completeTest = () => {
    const personality = calculatePersonality(answers);
    const budgetLevel = calculateBudgetLevel(answers.budget);
    const testResult = {
      completed: true, personality, budgetLevel,
      age: calculateAge(answers.birthDate),
      ...answers,
      completedAt: new Date().toISOString()
    };
    const userData = JSON.parse(localStorage.getItem("loversappUser") || "{}");
    userData.personalityTest = testResult;
    localStorage.setItem("loversappUser", JSON.stringify(userData));

    // Persist to server if authenticated
    if (localStorage.getItem('loversappToken')) {
      api.updateMe({ personality_test: testResult }).catch(() => {});
    }

    const normalizeDate = (dateStr) => {
      if (!dateStr) return null;
      const [y, m, d] = dateStr.split("-").map(Number);
      if (!y || !m || !d) return null;
      const now = new Date();
      const norm = new Date(now.getFullYear(), m-1, d);
      return `${norm.getFullYear()}-${String(norm.getMonth()+1).padStart(2,"0")}-${String(norm.getDate()).padStart(2,"0")}`;
    };

    const upsertImportantDate = ({ sourceType, title, dateStr, description, type, icon, color }) => {
      if (!dateStr) return;
      const normalizedDate = normalizeDate(dateStr);
      if (!normalizedDate) return;
      const stored = JSON.parse(localStorage.getItem("importantDates") || "[]");
      const existing = stored.find(item => item.sourceType === sourceType);
      const baseItem = { title, date: normalizedDate, description, type, icon, color, sourceType };
      const updated = existing
        ? stored.map(item => item.id === existing.id ? { ...item, ...baseItem } : item)
        : [{ id: Date.now(), ...baseItem }, ...stored];
      const savedItem = existing ? updated.find(item => item.id === existing.id) : updated[0];
      localStorage.setItem("importantDates", JSON.stringify(updated));
      upsertCalendarEvent({
        title: `${type==="birthday"?"Cumpleaños":"Fecha"}: ${title}`,
        description: description || "Fecha importante",
        dateStr: normalizedDate,
        sourceType: "important-date",
        sourceId: savedItem.id
      });
    };

    const userName = userData.name?.trim() || "";
    upsertImportantDate({ sourceType:"user-birthday", title: userName?`Cumpleaños de ${userName}`:"Tu cumpleaños", dateStr:answers.birthDate, description:"Cumpleaños", type:"birthday", icon:"🎂", color:"from-blue-500 to-cyan-500" });
    setCompleted(true);
    toast({ title: "¡Test completado!", description: "Hemos personalizado tus 100 citas especiales" });
  };

  const handleAnswer = (questionId, value) => {
    const question = questions[currentQuestion];
    if (question.type === "multiple") {
      const current = answers[questionId] || [];
      setAnswers({ ...answers, [questionId]: current.includes(value) ? current.filter(v=>v!==value) : [...current, value] });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const handleNext = () => {
    const question = questions[currentQuestion];
    if (question.type !== "text" && !answers[question.id]) {
      toast({ title: "Por favor responde", description: "Completa esta pregunta antes de continuar" });
      return;
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeTest();
    }
  };

  const handlePrevious = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };

  if (completed) {
    return (
      <div style={{ minHeight: "100vh", background: D.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <style>{STYLE}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: 400, textAlign: "center" }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            style={{ marginBottom: 20 }}
          >
            <div style={{
              width: 96, height: 96, borderRadius: "50%", background: D.wine,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
            }}>
              <Heart size={44} color={D.blush} fill={D.blush} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h1 className="lora" style={{ fontSize: 30, fontWeight: 700, color: D.wine, margin: "0 0 12px" }}>
              ¡Perfecto! 💕
            </h1>
            <p style={{ fontFamily: "Lora, serif", fontSize: 16, color: D.muted, lineHeight: 1.7, margin: "0 0 20px" }}>
              Hemos personalizado tus <strong style={{ color: D.coral }}>100 citas especiales</strong> según tu personalidad, edad, presupuesto y preferencias.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              background: D.white, border: `1.5px solid ${D.border}`,
              borderLeft: `4px solid ${D.coral}`, borderRadius: 16,
              padding: "16px 18px", marginBottom: 20, textAlign: "left"
            }}
          >
            {[
              { label: "Personalidad", value: answers.personalityType?.replace(/_/g," ") || "Equilibrada" },
              answers.citasTimeline && { label: "Meta", value: answers.citasTimeline.replace(/_/g," ") },
              answers.hobbies?.length > 0 && { label: "Intereses", value: answers.hobbies.slice(0,3).join(", ") }
            ].filter(Boolean).map((item, i) => (
              <p key={i} className="caveat" style={{ fontSize: 15, color: D.muted, margin: i === 0 ? 0 : "6px 0 0" }}>
                <strong style={{ color: D.wine }}>{item.label}:</strong> {item.value}
              </p>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigateTo("citas-aleatorias")}
            style={{
              width: "100%", padding: "14px 0", borderRadius: 16, border: "none",
              background: D.coral, color: D.white, cursor: "pointer",
              fontFamily: "Lora, Georgia, serif", fontSize: 17, fontWeight: 700, marginBottom: 10
            }}
          >
            Ver mis 100 Citas Personalizadas ❤️
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            onClick={() => navigateTo("dashboard")}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 14,
              border: `1.5px solid ${D.border}`, background: D.white,
              color: D.muted, cursor: "pointer",
              fontFamily: "Caveat, cursive", fontSize: 16
            }}
          >
            Ir al inicio
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = question.type === "text" || !!answers[question.id];

  return (
    <div style={{ minHeight: "100vh", background: D.cream, paddingBottom: 80 }}>
      <style>{STYLE}</style>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: D.cream,
        borderBottom: `1.5px solid ${D.border}`, padding: "48px 20px 14px"
      }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <button onClick={() => navigateTo("dashboard")} style={{
              width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${D.border}`,
              background: D.white, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0
            }}>
              <ChevronLeft size={18} color={D.coral} />
            </button>
            <div style={{ flex: 1 }}>
              <h1 className="lora" style={{ fontSize: 20, fontWeight: 700, color: D.wine, margin: 0 }}>
                Conocerte Mejor ❤️
              </h1>
              <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: 0 }}>
                Pregunta {currentQuestion + 1} de {questions.length}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: D.border, borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              style={{ height: "100%", background: D.coral, borderRadius: 4 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "22px 20px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="lora" style={{ fontSize: 21, fontWeight: 700, color: D.wine, margin: "0 0 8px" }}>
              {question.question}
            </h2>
            <p className="caveat" style={{ fontSize: 15, color: D.muted, margin: "0 0 20px" }}>
              {question.subtitle}
            </p>

            {question.type === "date" && (
              <input type="date" value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", border: `1.5px solid ${D.border}`,
                  borderRadius: 14, background: D.white, outline: "none",
                  fontFamily: "Lora, Georgia, serif", fontSize: 16, color: D.wine,
                  boxSizing: "border-box"
                }} />
            )}

            {question.type === "text" && (
              <textarea value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder={question.placeholder}
                style={{
                  width: "100%", padding: "12px 14px", border: `1.5px solid ${D.border}`,
                  borderRadius: 14, background: D.white, outline: "none",
                  fontFamily: "Lora, Georgia, serif", fontSize: 15, color: D.wine,
                  resize: "none", height: 120, boxSizing: "border-box"
                }} />
            )}

            {(question.type === "single" || question.type === "multiple") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {question.options.map(opt => {
                  const sel = question.type === "multiple"
                    ? (answers[question.id] || []).includes(opt.id)
                    : answers[question.id] === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(question.id, opt.id)}
                      style={{
                        padding: "13px 16px", border: `1.5px solid ${sel ? D.coral : D.border}`,
                        borderRadius: 14, background: sel ? "#FEF1F3" : D.white,
                        cursor: "pointer", textAlign: "left",
                        fontFamily: "Lora, Georgia, serif", fontSize: 15,
                        color: sel ? D.coral : D.wine, fontWeight: sel ? 700 : 400,
                        transition: "all 0.15s"
                      }}
                    >
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: D.cream, borderTop: `1.5px solid ${D.border}`,
        padding: "14px 20px"
      }}>
        <div style={{ maxWidth: 500, margin: "0 auto", display: "flex", gap: 10 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 14,
              border: `1.5px solid ${D.border}`, background: D.white,
              color: currentQuestion === 0 ? D.border : D.wine,
              cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "Caveat, cursive", fontSize: 16
            }}
          >
            <ChevronLeft size={16} />
            Anterior
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            style={{
              flex: 2, padding: "12px 0", borderRadius: 14, border: "none",
              background: D.coral, color: D.white, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "Lora, Georgia, serif", fontSize: 16, fontWeight: 700
            }}
          >
            {currentQuestion === questions.length - 1 ? "Completar" : "Siguiente"}
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
