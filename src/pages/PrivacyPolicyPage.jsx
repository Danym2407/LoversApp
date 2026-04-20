import React from 'react';
import { motion } from 'framer-motion';
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

// ── Section card ──────────────────────────────────────────────────────────────
function PolicySection({ emoji, title, children, accent = D.coral }) {
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

// ── Data item row ─────────────────────────────────────────────────────────────
function DataItem({ icon, label, detail, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '13px 16px',
      borderBottom: last ? 'none' : `1px solid ${D.cream}`,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>{label}</p>
        <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>{detail}</p>
      </div>
    </div>
  );
}

// ── Use item row ──────────────────────────────────────────────────────────────
function UseItem({ icon, label, detail, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '13px 16px',
      borderBottom: last ? 'none' : `1px solid ${D.cream}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `${D.coral}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
      }}>{icon}</div>
      <div>
        <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>{label}</p>
        <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>{detail}</p>
      </div>
    </div>
  );
}

// ── Right row ─────────────────────────────────────────────────────────────────
function RightRow({ label, sublabel, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '13px 16px',
      borderBottom: last ? 'none' : `1px solid ${D.cream}`,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: D.green, marginTop: 6,
      }} />
      <div>
        <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>{label}</p>
        {sublabel && <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PrivacyPolicyPage({ navigateTo }) {
  return (
    <PageLayout>
      <PageHeader
        breadcrumb="Aviso de privacidad"
        title="Aviso de privacidad"
        icon="/images/privacidad.png"
        onBack={() => navigateTo('settings')}
      />

      <div style={{ padding: '18px 20px' }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: D.wine, borderRadius: 20, padding: '22px 20px',
            marginBottom: 20, position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,208,220,0.08)' }}/>
          <div style={{ position: 'absolute', right: 18, bottom: -28, width: 55, height: 55, borderRadius: '50%', background: 'rgba(212,165,32,0.1)' }}/>
          <div style={{ position: 'relative' }}>
            <p className="caveat" style={{ fontSize: 12, color: `${D.blush}99`, margin: '0 0 6px' }}>
              Actualizado: Abril 2026
            </p>
            <h2 className="lora" style={{ fontSize: 19, fontWeight: 700, color: D.white, margin: '0 0 8px' }}>
              Tu privacidad es sagrada 🔒
            </h2>
            <p className="caveat" style={{ fontSize: 14, color: D.blush, margin: 0, lineHeight: 1.55 }}>
              En LoversApp nos tomamos muy en serio la privacidad de tu relación. Solo recopilamos lo necesario para ofrecerte la mejor experiencia.
            </p>
          </div>
        </motion.div>

        {/* ── Qué datos almacenamos ──────────────────────────────── */}
        <PolicySection emoji="📊" title="Qué datos almacenamos" accent={D.blue}>
          <DataItem icon="👤"
            label="Nombres"
            detail="Tu nombre de usuario y el nombre que le asignas a tu pareja dentro de la app." />
          <DataItem icon="📅"
            label="Fecha de inicio de relación"
            detail="La fecha desde la que llevan juntos, usada para calcular logros y estadísticas." />
          <DataItem icon="🗓️"
            label="Citas completadas"
            detail="Cuáles de las 100 citas han completado, con notas y reseñas que elijan guardar." />
          <DataItem icon="🏆"
            label="Logros"
            detail="Los logros que han desbloqueado y el progreso hacia los siguientes." />
          <DataItem icon="📸"
            label="Momentos"
            detail="Las notas, recuerdos y fotos que decidan guardar voluntariamente en la sección de Momentos." />
          <DataItem icon="💌"
            label="Cartas digitales"
            detail="Las cartas que se escriban entre ustedes. Solo son visibles para los integrantes de la pareja vinculada." last />
        </PolicySection>

        {/* ── Cómo se usan ─────────────────────────────────────────── */}
        <PolicySection emoji="✨" title="Cómo se usan tus datos" accent={D.coral}>
          <UseItem icon="💕"
            label="Personalización de experiencia"
            detail="Tus datos nos permiten mostrarte citas, retos y sugerencias adaptadas a su estilo de vida y preferencias." />
          <UseItem icon="🏆"
            label="Generación de logros"
            detail="Calculamos automáticamente los logros desbloqueados según sus actividades: citas completadas, días juntos y retos." />
          <UseItem icon="🔄"
            label="Sincronización entre pareja"
            detail="Cuando se vinculan, sincronizamos el progreso para que ambos vean los mismos logros, citas y momentos." />
          <UseItem icon="🔒"
            label="Sin fines comerciales"
            detail="Jamás vendemos, compartimos ni comercializamos tus datos con terceros. Tu relación es solo de ustedes." last />
        </PolicySection>

        {/* ── Almacenamiento ───────────────────────────────────────── */}
        <PolicySection emoji="🗄️" title="Cómo se almacenan" accent={D.gold}>
          <div style={{ padding: '16px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                padding: '13px 14px', borderRadius: 14,
                background: `${D.green}12`, border: `1.5px solid ${D.green}33`,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🔐</span>
                <div>
                  <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>Base de datos del servidor</p>
                  <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>
                    Tus datos se almacenan en una base de datos segura en nuestro servidor. Las contraseñas se guardan cifradas con bcrypt — nunca las vemos ni podemos leerlas.
                  </p>
                </div>
              </div>
              <div style={{
                padding: '13px 14px', borderRadius: 14,
                background: `${D.blue}12`, border: `1.5px solid ${D.blue}33`,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📱</span>
                <div>
                  <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>Almacenamiento local (caché)</p>
                  <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>
                    Algunos datos se guardan en tu dispositivo (localStorage) para mejorar el rendimiento de la app. Puedes borrarlo desde Ajustes → Datos → Reiniciar progreso.
                  </p>
                </div>
              </div>
              <div style={{
                padding: '13px 14px', borderRadius: 14,
                background: `${D.coral}10`, border: `1.5px solid ${D.coral}30`,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🚫</span>
                <div>
                  <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>No se venden tus datos</p>
                  <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, lineHeight: 1.5 }}>
                    No compartimos tu información con anunciantes, redes sociales ni ningún tercero. Punto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PolicySection>

        {/* ── Derechos del usuario ─────────────────────────────────── */}
        <PolicySection emoji="⚖️" title="Tus derechos" accent={D.green}>
          <RightRow
            label="Exportar tus datos"
            sublabel="Puedes descargar un archivo JSON con toda tu información desde Ajustes → Datos → Exportar." />
          <RightRow
            label="Modificar tu información"
            sublabel="Cambia tu nombre, el de tu pareja o la fecha de relación en Ajustes → Relación en cualquier momento." />
          <RightRow
            label="Eliminar tu cuenta"
            sublabel="Si deseas eliminar tu cuenta y todos tus datos, contáctanos y lo procesaremos en 48 horas." last />
        </PolicySection>

        {/* ── Contacto ─────────────────────────────────────────────── */}
        <PolicySection emoji="📬" title="Contacto" accent={D.wine}>
          <div style={{ padding: '18px 16px', textAlign: 'center' }}>
            <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: '0 0 14px', lineHeight: 1.6 }}>
              ¿Tienes preguntas sobre tu privacidad o quieres ejercer tus derechos?
            </p>
            <div style={{
              padding: '13px 16px', borderRadius: 14, background: D.cream,
              border: `1.5px solid ${D.border}`, textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>💌</span>
              <div>
                <p className="lora" style={{ fontSize: 13, fontWeight: 700, color: D.wine, margin: '0 0 2px' }}>Correo de privacidad</p>
                <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0 }}>loversapp@donydonitasss.com</p>
              </div>
            </div>
          </div>
        </PolicySection>

        <div style={{ height: 20 }} />
      </div>
    </PageLayout>
  );
}
