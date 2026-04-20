import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Mail } from 'lucide-react';
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

// ── Accordion item ────────────────────────────────────────────────────────────
function AccordionItem({ question, answer, accent = D.coral }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: `1px solid ${D.cream}`,
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
          padding: '14px 16px', border: 'none', background: 'transparent',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span className="lora" style={{ fontSize: 14, fontWeight: 600, color: D.wine, flex: 1, lineHeight: 1.3 }}>
          {question}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} color={accent} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p className="caveat" style={{
              fontSize: 14, color: D.muted, lineHeight: 1.6,
              margin: 0, padding: '0 16px 16px',
            }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function HelpSection({ emoji, title, accent = D.coral, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 18 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 2 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: `${accent}22`, border: `1.5px solid ${accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>
          {emoji}
        </div>
        <span className="lora" style={{ fontSize: 15, fontWeight: 700, color: D.wine }}>{title}</span>
      </div>
      <div style={{
        background: D.white, borderRadius: 20,
        border: `1.5px solid ${D.border}`,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </motion.div>
  );
}

// ── Feature card (Cómo funciona) ──────────────────────────────────────────────
function FeatureCard({ icon, title, description, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px', borderBottom: `1px solid ${D.cream}`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: `${accent}18`, border: `1.5px solid ${accent}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {icon}
      </div>
      <div>
        <p className="lora" style={{ fontSize: 14, fontWeight: 700, color: D.wine, margin: '0 0 3px' }}>{title}</p>
        <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>{description}</p>
      </div>
    </div>
  );
}

// ── Step item (Primeros pasos) ────────────────────────────────────────────────
function StepItem({ number, title, description, last }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${D.cream}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: D.coral, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="caveat" style={{ fontSize: 14, fontWeight: 700, color: D.white }}>{number}</span>
      </div>
      <div>
        <p className="lora" style={{ fontSize: 14, fontWeight: 700, color: D.wine, margin: '0 0 3px' }}>{title}</p>
        <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>{description}</p>
      </div>
    </div>
  );
}

// ── Date idea pill ────────────────────────────────────────────────────────────
function DateIdea({ emoji, label, category, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderBottom: `1px solid ${D.cream}`,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
      <div>
        <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 1px' }}>{label}</p>
        <span className="caveat" style={{
          fontSize: 11, color, background: `${color}18`,
          borderRadius: 20, padding: '1px 8px', display: 'inline-block',
        }}>{category}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const SUPPORT_EMAIL = 'loversapp@donydonitasss.com';

function buildMailtoHref(userInfo) {
  const date = new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
  const userLine = userInfo ? `${userInfo.email || userInfo.name || 'Usuario autenticado'} (ID: ${userInfo.id || '—'})` : 'No autenticado';
  const subject = encodeURIComponent('Support - LoversApp');
  const body = encodeURIComponent(
`Hola equipo de soporte,

Estoy teniendo un problema en la app LoversApp.

Descripción del problema:
[Escribe aquí tu problema...]

Información adicional:
- Página actual: Ayuda (Help Page)
- Fecha: ${date}
- Usuario: ${userLine}

Gracias por su apoyo.`
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export default function HelpPage({ navigateTo }) {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('loversappUser');
      if (raw) setUserInfo(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <PageLayout>
      <PageHeader
        breadcrumb="Ayuda"
        title="Ayuda"
        icon="/images/ayuda.png"
        subtitle="Todo lo que necesitas saber 💕"
        onBack={() => navigateTo('dashboard')}
      />

      <div style={{ padding: '18px 20px' }}>

        {/* ── Hero banner ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: D.wine, borderRadius: 20, padding: '22px 20px',
            marginBottom: 20, position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,208,220,0.08)' }}/>
          <div style={{ position: 'absolute', right: 20, bottom: -30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(212,165,32,0.12)' }}/>
          <h2 className="lora" style={{ fontSize: 20, fontWeight: 700, color: D.white, margin: '0 0 6px', position: 'relative' }}>
            Hola, estamos aquí 💕
          </h2>
          <p className="caveat" style={{ fontSize: 15, color: D.blush, margin: 0, lineHeight: 1.5, position: 'relative' }}>
            LoversApp está hecha para hacer su relación más especial cada día. Aquí encontrarás todo lo que necesitas para aprovecharlo al máximo.
          </p>
        </motion.div>

        {/* ── Cómo funciona ───────────────────────────────────────── */}
        <HelpSection emoji="✨" title="Cómo funciona" accent={D.coral}>
          <FeatureCard icon="🗓️" title="100 Citas" accent={D.coral}
            description="Una lista de 100 citas para vivir juntos. Márcalas como completadas, agrégales recuerdos y fotos." />
          <FeatureCard icon="🏆" title="Logros" accent={D.gold}
            description="Ganan logros automáticamente al completar citas, escribir cartas o llevar tiempo juntos." />
          <FeatureCard icon="💪" title="Retos diarios" accent={D.coral}
            description="Pequeñas acciones para fortalecer su conexión cada día. Se desbloquean según su progreso." />
          <FeatureCard icon="💌" title="Cartas digitales" accent={D.blue}
            description="Escríbanse cartas que quedan guardadas para siempre en la app." />
          <FeatureCard icon="📸" title="Momentos" accent={D.green}
            description="Guarden recuerdos especiales: fotos, notas y fechas que quieren recordar." />
          <FeatureCard icon="⏱️" title="Cuenta regresiva" accent={D.wine}
            description="Creen cuentas regresivas para sus próximas aventuras y fechas importantes." />
          <div style={{ padding: '14px 16px' }}>
            <FeatureCard icon="🎭" title="Juegos" accent={D.gold}
              description="Juegos de preguntas y retos para conocerse mejor y divertirse juntos." />
          </div>
        </HelpSection>

        {/* ── Primeros pasos ──────────────────────────────────────── */}
        <HelpSection emoji="🚀" title="Primeros pasos" accent={D.blue}>
          <StepItem number="1" title="Crea tu cuenta"
            description="Regístrate con tu email y elige un nombre para ti y tu pareja." />
          <StepItem number="2" title="Vincula a tu pareja"
            description="Ve a Perfil → Vincular Pareja y comparte tu código de 6 letras con tu pareja. Ella/él lo ingresa en su cuenta." />
          <StepItem number="3" title="Haz el test de personalidad"
            description="El test personaliza las citas según sus gustos, presupuesto y estilo de vida." />
          <StepItem number="4" title="Explora las 100 citas"
            description="Ve a la sección de Citas y empieza a marcar las que quieren hacer." />
          <StepItem number="5" title="Completa retos y gana logros"
            description="¡Cada acción cuenta! Completen retos diarios para desbloquear logros especiales." last />
        </HelpSection>

        {/* ── Preguntas frecuentes ─────────────────────────────────── */}
        <HelpSection emoji="❓" title="Preguntas frecuentes" accent={D.gold}>
          <AccordionItem accent={D.gold}
            question="¿Puedo usar la app sin vincularme a mi pareja?"
            answer="Sí, puedes usar la mayoría de funciones en solitario. Sin embargo, algunas experiencias como compartir logros y sincronizar progreso requieren vincularse." />
          <AccordionItem accent={D.gold}
            question="¿Qué pasa si mi pareja y yo tenemos dispositivos diferentes?"
            answer="No hay problema. LoversApp funciona en cualquier dispositivo con navegador. Ambos inician sesión con sus propias cuentas y se vinculan por código." />
          <AccordionItem accent={D.gold}
            question="¿Mis datos están seguros?"
            answer="Tu información se almacena de forma segura en nuestros servidores. Las contraseñas están cifradas y nunca son visibles." />
          <AccordionItem accent={D.gold}
            question="¿Puedo cambiar mi nombre o el de mi pareja?"
            answer="Sí. Ve a Ajustes → Relación y actualiza los nombres. Los cambios se sincronizan automáticamente." />
          <AccordionItem accent={D.gold}
            question="¿Los logros se pierden si reinicio la app?"
            answer="Los logros están guardados en el servidor. Solo se pierden si eliminas tu cuenta." />
          <AccordionItem accent={D.gold}
            question="¿Cómo se desbloquean los retos?"
            answer="Los retos básicos están siempre disponibles. Los románticos y experiencias se desbloquean según el tiempo que llevan juntos, las citas completadas y los retos anteriores." />
        </HelpSection>

        {/* ── Ideas de citas ──────────────────────────────────────── */}
        <HelpSection emoji="🌹" title="Ideas de citas" accent={D.coral}>
          <DateIdea emoji="🌅" label="Desayuno en la cama" category="Romántico" color={D.coral} />
          <DateIdea emoji="🎬" label="Maratón de películas" category="En casa" color={D.blue} />
          <DateIdea emoji="🍕" label="Cocinar una nueva receta" category="En casa" color={D.green} />
          <DateIdea emoji="🚶" label="Caminata al atardecer" category="Al aire libre" color={D.gold} />
          <DateIdea emoji="🎨" label="Clase de arte juntos" category="Experiencia" color={D.coral} />
          <DateIdea emoji="🏕️" label="Picnic en el parque" category="Al aire libre" color={D.green} />
          <DateIdea emoji="🎭" label="Noche de teatro o concierto" category="Cultural" color={D.blue} />
          <div style={{ padding: '12px 16px', textAlign: 'center' }}>
            <button
              onClick={() => navigateTo('dates')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 20px', borderRadius: 20, border: 'none',
                background: D.coral, color: D.white, cursor: 'pointer',
                fontFamily: 'Caveat, cursive', fontSize: 14, fontWeight: 700,
              }}
            >
              Ver las 100 citas <ChevronRight size={14} />
            </button>
          </div>
        </HelpSection>

        {/* ── Soporte ─────────────────────────────────────────────── */}
        <HelpSection emoji="💬" title="Soporte" accent={D.wine}>
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16 }}>
              <div style={{
                padding: '14px 16px', borderRadius: 14, background: D.cream,
                border: `1.5px solid ${D.border}`, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 22 }}>💌</span>
                <div>
                  <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>Escríbenos</p>
                  <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0 }}>{SUPPORT_EMAIL}</p>
                </div>
              </div>
              <div style={{
                padding: '14px 16px', borderRadius: 14, background: D.cream,
                border: `1.5px solid ${D.border}`, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{ fontSize: 22 }}>🔄</span>
                <div>
                  <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>Versión actual</p>
                  <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0 }}>LoversApp v1.0 · Abril 2026</p>
                </div>
              </div>
            </div>
          </div>
        </HelpSection>

        {/* ── Reportar un problema ─────────────────────────────────── */}
        <HelpSection emoji="🛠️" title="Reportar un problema" accent={D.coral}>
          <div style={{ padding: '20px 16px' }}>
            <p className="caveat" style={{ fontSize: 15, color: D.muted, margin: '0 0 16px', lineHeight: 1.6, textAlign: 'center' }}>
              ¿Algo no funciona bien? Cuéntanos y lo resolvemos lo antes posible.
            </p>
            <a
              href={buildMailtoHref(userInfo)}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px 20px', borderRadius: 16,
                  background: D.coral, border: 'none', cursor: 'pointer',
                  boxShadow: `0 4px 16px ${D.coral}44`,
                }}
              >
                <Mail size={18} color={D.white} />
                <span className="lora" style={{ fontSize: 15, fontWeight: 700, color: D.white }}>
                  Contactar soporte
                </span>
              </motion.div>
            </a>
            <p className="caveat" style={{ fontSize: 12, color: D.muted, margin: '12px 0 0', textAlign: 'center', lineHeight: 1.4 }}>
              Se abrirá tu cliente de correo con el mensaje prellenado.
            </p>
          </div>
        </HelpSection>

        <div style={{ height: 20 }} />
      </div>
    </PageLayout>
  );
}
