import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Download, RotateCcw, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { D } from '@/design-system/tokens';
import { useToast } from '@/components/ui/use-toast';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

// ── Small toggle component ────────────────────────────────────────────────────
function Toggle({ value, onChange, color = D.coral }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13, flexShrink: 0,
        background: value ? color : D.border,
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s ease',
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: 3,
          width: 20, height: 20, borderRadius: '50%',
          background: D.white,
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }}
      />
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SettingsSection({ title, emoji, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingLeft: 2 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span className="lora" style={{ fontSize: 15, fontWeight: 700, color: D.wine }}>{title}</span>
      </div>
      <div style={{
        background: D.white, borderRadius: 20,
        border: `1.5px solid ${D.border}`,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Row within a section ──────────────────────────────────────────────────────
function SettingsRow({ label, sublabel, right, borderless, danger }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: borderless ? 'none' : `1px solid ${D.cream}`,
    }}>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
        <p className="lora" style={{ fontSize: 14, fontWeight: 600, color: danger ? '#E05555' : D.wine, margin: 0 }}>{label}</p>
        {sublabel && (
          <p className="caveat" style={{ fontSize: 12, color: D.muted, margin: '2px 0 0' }}>{sublabel}</p>
        )}
      </div>
      {right}
    </div>
  );
}

const THEMES = [
  { key: 'romantic', label: 'Romántico 💕', desc: 'Crema y vino' },
  { key: 'light',    label: 'Claro ☀️',     desc: 'Blanco y coral' },
  { key: 'dark',     label: 'Oscuro 🌙',    desc: 'Próximamente' },
];

const SETTINGS_KEY = 'loversapp_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSettings(obj) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj));
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage({ navigateTo }) {
  const { toast } = useToast();

  // Relation (backed by API)
  const [partnerName, setPartnerName]           = useState('');
  const [relationshipDate, setRelationshipDate] = useState('');
  const [savingRelation, setSavingRelation]      = useState(false);

  // UI preferences (localStorage)
  const [theme, setTheme]                   = useState('romantic');
  const [animations, setAnimations]         = useState(true);
  const [notifChallenges, setNotifChallenges] = useState(true);
  const [notifAchievements, setNotifAchievements] = useState(true);
  const [discreteMode, setDiscreteMode]     = useState(false);
  const [hideSensitive, setHideSensitive]   = useState(false);

  // Reset confirm
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting]               = useState(false);

  useEffect(() => {
    // Load from API
    const token = localStorage.getItem('loversappToken');
    if (token) {
      api.getMe()
        .then(me => {
          setPartnerName(me.partner_name || '');
          setRelationshipDate(me.relationship_start_date || '');
        })
        .catch(() => {
          // Fallback to localStorage cache
          try {
            const u = JSON.parse(localStorage.getItem('loversappUser') || '{}');
            setPartnerName(u.partner_name || u.partner || '');
            setRelationshipDate(u.relationship_start_date || u.relationshipStartDate || '');
          } catch {}
        });
    } else {
      try {
        const u = JSON.parse(localStorage.getItem('loversappUser') || '{}');
        setPartnerName(u.partner_name || u.partner || '');
        setRelationshipDate(u.relationship_start_date || u.relationshipStartDate || '');
      } catch {}
    }

    // Load UI prefs
    const s = loadSettings();
    if (s.theme)              setTheme(s.theme);
    if (s.animations !== undefined) setAnimations(s.animations);
    if (s.notifChallenges !== undefined) setNotifChallenges(s.notifChallenges);
    if (s.notifAchievements !== undefined) setNotifAchievements(s.notifAchievements);
    if (s.discreteMode !== undefined)    setDiscreteMode(s.discreteMode);
    if (s.hideSensitive !== undefined)   setHideSensitive(s.hideSensitive);
  }, []);

  // Persist UI prefs whenever they change
  useEffect(() => {
    saveSettings({ theme, animations, notifChallenges, notifAchievements, discreteMode, hideSensitive });
  }, [theme, animations, notifChallenges, notifAchievements, discreteMode, hideSensitive]);

  const handleSaveRelation = async () => {
    setSavingRelation(true);
    try {
      const token = localStorage.getItem('loversappToken');
      if (token) {
        await api.updateMe({
          partner_name: partnerName.trim(),
          relationship_start_date: relationshipDate || null,
        });
        // Update cache
        const u = JSON.parse(localStorage.getItem('loversappUser') || '{}');
        localStorage.setItem('loversappUser', JSON.stringify({
          ...u, partner_name: partnerName.trim(), partner: partnerName.trim(),
          relationship_start_date: relationshipDate,
        }));
      }
      toast({ title: 'Guardado ✓', description: 'Los datos de la relación se actualizaron' });
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'No se pudo guardar' });
    } finally {
      setSavingRelation(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('loversappToken');
      const me = token ? await api.getMe().catch(() => null) : null;
      const cache = JSON.parse(localStorage.getItem('loversappUser') || '{}');
      const payload = {
        exportedAt: new Date().toISOString(),
        user: me || cache,
        settings: loadSettings(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `loversapp-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Exportado ✓', description: 'Tu archivo JSON está listo' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo exportar' });
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      // Clear UI-only keys (no user credentials removed)
      ['coupleDates','completedCitas','completedCitasReviews','favoritesCitas',
       'manualDates','pinnedCitas','citasAleatorias','calendarEvents',
       'countdownEvents','momentsEntries','importantDates', SETTINGS_KEY].forEach(k => localStorage.removeItem(k));
      toast({ title: 'Progreso reiniciado', description: 'Los datos de progreso local han sido borrados' });
      setShowResetConfirm(false);
    } catch {
      toast({ title: 'Error', description: 'No se pudo reiniciar' });
    } finally {
      setResetting(false);
    }
  };

  const inputSt = {
    width: '100%', padding: '10px 13px',
    border: `1.5px solid ${D.border}`, borderRadius: 12,
    background: D.cream, outline: 'none',
    fontFamily: 'Lora, Georgia, serif', fontSize: 14,
    color: D.wine, boxSizing: 'border-box',
  };

  return (
    <PageLayout>
      <PageHeader
        breadcrumb="Ajustes"
        title="Ajustes"
        icon="/images/ajustes.png"
        onBack={() => navigateTo('profile')}
      />

      <div style={{ padding: '18px 20px' }}>

        {/* ── RELACIÓN ──────────────────────────────────────────────── */}
        <SettingsSection title="Relación" emoji="💑">
          <div style={{ padding: '16px 16px 0' }}>
            <label className="caveat" style={{ fontSize: 13, color: D.wine, display: 'block', marginBottom: 5 }}>
              Nombre de tu pareja
            </label>
            <input
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              placeholder="Nombre de tu pareja..."
              style={{ ...inputSt, marginBottom: 12 }}
            />
            <label className="caveat" style={{ fontSize: 13, color: D.wine, display: 'block', marginBottom: 5 }}>
              Fecha de inicio de la relación
            </label>
            <input
              type="date"
              value={relationshipDate}
              onChange={e => setRelationshipDate(e.target.value)}
              style={{ ...inputSt, marginBottom: 14 }}
            />
            <button
              onClick={handleSaveRelation}
              disabled={savingRelation}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 12, border: 'none',
                background: savingRelation ? D.muted : D.coral,
                color: D.white, cursor: savingRelation ? 'not-allowed' : 'pointer',
                fontFamily: 'Caveat, cursive', fontSize: 15, fontWeight: 700,
                marginBottom: 16,
              }}
            >
              {savingRelation ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </SettingsSection>

        {/* ── PERSONALIZACIÓN ───────────────────────────────────────── */}
        <SettingsSection title="Personalización" emoji="🎨">
          {/* Theme selector */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${D.cream}` }}>
            <p className="lora" style={{ fontSize: 14, fontWeight: 600, color: D.wine, margin: '0 0 10px' }}>Tema visual</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {THEMES.map(t => (
                <div
                  key={t.key}
                  onClick={() => t.key !== 'dark' && setTheme(t.key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 14, cursor: t.key === 'dark' ? 'not-allowed' : 'pointer',
                    background: theme === t.key ? `${D.coral}11` : D.cream,
                    border: `1.5px solid ${theme === t.key ? D.coral : D.border}`,
                    opacity: t.key === 'dark' ? 0.45 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <p className="lora" style={{ fontSize: 13, fontWeight: 600, color: D.wine, margin: 0 }}>{t.label}</p>
                    <p className="caveat" style={{ fontSize: 12, color: D.muted, margin: '1px 0 0' }}>{t.desc}</p>
                  </div>
                  {theme === t.key && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: D.coral,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: D.white, fontSize: 11, fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <SettingsRow
            label="Animaciones"
            sublabel="Efectos visuales y transiciones"
            borderless
            right={<Toggle value={animations} onChange={setAnimations} color={D.coral} />}
          />
        </SettingsSection>

        {/* ── NOTIFICACIONES ────────────────────────────────────────── */}
        <SettingsSection title="Notificaciones" emoji="🔔">
          <SettingsRow
            label="Retos diarios"
            sublabel="Recordatorio para completar retos"
            right={<Toggle value={notifChallenges} onChange={setNotifChallenges} color={D.coral} />}
          />
          <SettingsRow
            label="Logros desbloqueados"
            sublabel="Notificación cuando ganas un logro"
            borderless
            right={<Toggle value={notifAchievements} onChange={setNotifAchievements} color={D.gold} />}
          />
        </SettingsSection>

        {/* ── PRIVACIDAD ────────────────────────────────────────────── */}
        <SettingsSection title="Privacidad" emoji="🔒">
          <SettingsRow
            label="Modo discreto"
            sublabel="Oculta contenido sensible en capturas"
            right={<Toggle value={discreteMode} onChange={setDiscreteMode} color={D.wine} />}
          />
          <SettingsRow
            label="Ocultar datos sensibles"
            sublabel="Fechas, nombres y estadísticas privadas"
            borderless
            right={<Toggle value={hideSensitive} onChange={setHideSensitive} color={D.wine} />}
          />
        </SettingsSection>

        {/* ── DATOS ─────────────────────────────────────────────────── */}
        <SettingsSection title="Datos" emoji="💾">
          <SettingsRow
            label="Exportar información"
            sublabel="Descarga un JSON con tus datos"
            right={
              <button
                onClick={handleExport}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 12, border: `1.5px solid ${D.border}`,
                  background: D.cream, cursor: 'pointer',
                  fontFamily: 'Caveat, cursive', fontSize: 13, color: D.wine,
                }}
              >
                <Download size={13} /> Exportar
              </button>
            }
          />
          <SettingsRow
            label="Reiniciar progreso"
            sublabel="Borra el progreso local (no elimina tu cuenta)"
            danger
            right={
              <button
                onClick={() => setShowResetConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 12, border: '1.5px solid #E05555',
                  background: '#FFF0F0', cursor: 'pointer',
                  fontFamily: 'Caveat, cursive', fontSize: 13, color: '#E05555',
                }}
              >
                <RotateCcw size={13} /> Reiniciar
              </button>
            }
          />
          <SettingsRow
            label="Aviso de privacidad"
            sublabel="Cómo protegemos tus datos 🔒"
            borderless
            right={
              <button
                onClick={() => navigateTo('privacy')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '7px 14px', borderRadius: 12, border: `1.5px solid ${D.border}`,
                  background: D.cream, cursor: 'pointer',
                  fontFamily: 'Caveat, cursive', fontSize: 13, color: D.wine,
                }}
              >
                Ver <ChevronRight size={13} />
              </button>
            }
          />
        </SettingsSection>

        {/* ── Reset confirmation modal ──────────────────────────────── */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(45,27,46,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
              }}
              onClick={() => setShowResetConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: D.white, borderRadius: 24,
                  padding: '28px 24px', width: '100%', maxWidth: 360,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: '#FFF0F0', border: '2px solid #E05555',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <AlertTriangle size={22} color="#E05555" />
                  </div>
                  <h3 className="lora" style={{ fontSize: 18, fontWeight: 700, color: D.wine, margin: '0 0 8px' }}>
                    ¿Reiniciar progreso?
                  </h3>
                  <p className="caveat" style={{ fontSize: 14, color: D.muted, margin: 0, lineHeight: 1.5 }}>
                    Se borrarán los datos de progreso guardados localmente. Tu cuenta y datos del servidor se mantienen.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 14,
                      border: `1.5px solid ${D.border}`, background: D.cream,
                      cursor: 'pointer', fontFamily: 'Caveat, cursive', fontSize: 15, color: D.wine,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 14,
                      border: 'none', background: '#E05555',
                      cursor: resetting ? 'not-allowed' : 'pointer',
                      fontFamily: 'Caveat, cursive', fontSize: 15, fontWeight: 700, color: D.white,
                    }}
                  >
                    {resetting ? 'Reiniciando...' : 'Sí, reiniciar'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageLayout>
  );
}
