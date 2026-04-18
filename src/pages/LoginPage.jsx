import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Eye, EyeOff } from "lucide-react";
import PersonalityTestModal from "@/components/PersonalityTestModal";
import { api } from "@/lib/api";

const D = {
  cream: "#FFF5F7", wine: "#2D1B2E", coral: "#FF6B8A", gold: "#D4A520",
  blue: "#5B8ECC", green: "#5BAA6A", blush: "#FFD0DC", white: "#FFFFFF",
  border: "#FFD0DC", muted: "#9B8B95"
};
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

export default function LoginPage({ onLoginSuccess, onClose, defaultTab = "login", onStartTest }) {
  const [isLogin, setIsLogin] = useState(defaultTab === "login");
  const [formData, setFormData] = useState({ name: "", partner: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { token, user } = await api.login(formData.email, formData.password);
        localStorage.setItem('loversappToken', token);
        localStorage.setItem('loversappUser', JSON.stringify(user));
        setLoading(false);
        onLoginSuccess();
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }
        const { token, user } = await api.register(
          formData.name, formData.partner, formData.email, formData.password
        );
        localStorage.setItem('loversappToken', token);
        localStorage.setItem('loversappUser', JSON.stringify(user));
        setLoading(false);
        setIsRegistration(true);
        setShowTestModal(true);
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    setShowTestModal(false);
    onLoginSuccess();
    onStartTest?.();
  };

  const handleSkipTest = () => {
    setShowTestModal(false);
    onLoginSuccess();
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", border: `1.5px solid ${D.border}`,
    borderRadius: 12, background: D.cream, outline: "none",
    fontFamily: "Lora, Georgia, serif", fontSize: 15, color: D.wine,
    boxSizing: "border-box"
  };

  return (
    <>
      <style>{STYLE}</style>
      {showTestModal && (
        <PersonalityTestModal
          onStartTest={handleStartTest}
          onSkip={handleSkipTest}
        />
      )}
      <div style={{
        minHeight: "100vh", background: D.cream, display: "flex",
        alignItems: "center", justifyContent: "center", padding: "20px",
        position: "relative"
      }}>
        {/* Doodle bg circles */}
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          {[{ top: "8%", left: "5%", size: 90, color: D.blush, opacity: 0.5 },
            { top: "70%", right: "4%", size: 120, color: D.coral, opacity: 0.12 },
            { bottom: "10%", left: "8%", size: 70, color: D.blush, opacity: 0.35 }].map((c, i) => (
            <div key={i} style={{
              position: "absolute", top: c.top, left: c.left, right: c.right, bottom: c.bottom,
              width: c.size, height: c.size, borderRadius: "50%",
              background: c.color, opacity: c.opacity
            }} />
          ))}
        </div>

        {onClose && (
          <button onClick={onClose} style={{
            position: "fixed", top: 18, right: 18, zIndex: 20,
            width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${D.border}`,
            background: D.white, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer"
          }}>
            <X size={18} color={D.wine} />
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "relative", zIndex: 1, width: "100%", maxWidth: 420,
            background: D.white, border: `1.5px solid ${D.border}`,
            borderRadius: 24, padding: "32px 28px", boxShadow: "0 4px 32px rgba(45,27,46,0.10)"
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: D.wine,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px"
            }}>
              <Heart size={26} color={D.blush} fill={D.blush} />
            </div>
            <h1 className="lora" style={{ fontSize: 26, fontWeight: 700, color: D.wine, margin: 0 }}>
              100 Citas
            </h1>
            <p className="caveat" style={{ fontSize: 16, color: D.muted, margin: "4px 0 0" }}>
              Tu diario de amor ♡
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 6, marginBottom: 24,
            background: D.cream, borderRadius: 14, padding: 4
          }}>
            {[{ key: true, label: "Iniciar Sesión" }, { key: false, label: "Registrarse" }].map(tab => (
              <button key={String(tab.key)} onClick={() => setIsLogin(tab.key)} style={{
                flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
                background: isLogin === tab.key ? D.coral : "transparent",
                color: isLogin === tab.key ? D.white : D.muted,
                cursor: "pointer", fontFamily: "Caveat, cursive", fontSize: 16,
                fontWeight: isLogin === tab.key ? 700 : 400, transition: "all 0.2s"
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!isLogin && (
              <>
                <div>
                  <label className="caveat" style={{ fontSize: 15, color: D.wine, display: "block", marginBottom: 5 }}>
                    Tu nombre ♡
                  </label>
                  <input name="name" value={formData.name} onChange={handleChange} required
                    placeholder="Ej. Daniela" style={inputStyle} />
                </div>
                <div>
                  <label className="caveat" style={{ fontSize: 15, color: D.wine, display: "block", marginBottom: 5 }}>
                    Nombre de tu pareja
                  </label>
                  <input name="partner" value={formData.partner} onChange={handleChange}
                    placeholder="Ej. Eduardo" style={inputStyle} />
                </div>
              </>
            )}
            <div>
              <label className="caveat" style={{ fontSize: 15, color: D.wine, display: "block", marginBottom: 5 }}>
                Correo electrónico
              </label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required
                placeholder="tu@correo.com" style={inputStyle} />
            </div>
            <div>
              <label className="caveat" style={{ fontSize: 15, color: D.wine, display: "block", marginBottom: 5 }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input name="password" type={showPass ? "text" : "password"} value={formData.password}
                  onChange={handleChange} required placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 0
                }}>
                  {showPass ? <EyeOff size={16} color={D.muted} /> : <Eye size={16} color={D.muted} />}
                </button>
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="caveat" style={{ fontSize: 15, color: D.wine, display: "block", marginBottom: 5 }}>
                  Confirmar contraseña
                </label>
                <input name="confirmPassword" type="password" value={formData.confirmPassword}
                  onChange={handleChange} required placeholder="••••••••" style={inputStyle} />
              </div>
            )}

            {error && (
              <div style={{
                padding: "10px 14px", background: "#FEE8EC",
                borderRadius: 12, border: `1px solid ${D.coral}44`
              }}>
                <p className="caveat" style={{ fontSize: 14, color: D.coral, margin: 0, textAlign: "center" }}>
                  {error}
                </p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                background: loading ? D.muted : D.coral, color: D.white, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Lora, Georgia, serif", fontSize: 16, fontWeight: 700,
                marginTop: 4, transition: "background 0.2s",
                boxShadow: loading ? 'none' : '3px 3px 0 rgba(196,68,100,0.28)'
              }}
            >
              {loading ? "Conectando..." : isLogin ? "Entrar" : "Crear cuenta"}
            </motion.button>

            {isLogin && (
              <button type="button" onClick={() => { setShowForgot(true); setError(''); }}
                style={{
                  background: "none", border: "none", color: D.muted, cursor: "pointer",
                  fontFamily: "Caveat, cursive", fontSize: 14, marginTop: 2, textDecoration: "underline"
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>

          {/* Forgot password inline modal */}
          {showForgot && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(45,27,46,0.45)", display: "flex",
              alignItems: "center", justifyContent: "center", padding: 20
            }}>
              <div style={{
                background: D.white, borderRadius: 20, padding: "28px 24px",
                width: "100%", maxWidth: 370, boxShadow: "0 8px 40px rgba(45,27,46,0.18)"
              }}>
                <h3 className="lora" style={{ color: D.wine, fontSize: 20, margin: "0 0 8px" }}>Recuperar contraseña</h3>
                {!forgotSent ? (
                  <>
                    <p className="caveat" style={{ color: D.muted, fontSize: 15, margin: "0 0 18px" }}>
                      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    <input
                      type="email" value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      style={{ ...inputStyle, marginBottom: 12 }}
                    />
                    {forgotError && (
                      <p className="caveat" style={{ color: D.coral, fontSize: 13, margin: "0 0 10px" }}>{forgotError}</p>
                    )}
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setShowForgot(false)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 12, border: `1.5px solid ${D.border}`,
                        background: "transparent", color: D.muted, cursor: "pointer",
                        fontFamily: "Caveat, cursive", fontSize: 15
                      }}>Cancelar</button>
                      <button disabled={forgotLoading} onClick={async () => {
                        if (!forgotEmail) { setForgotError('Ingresa tu correo.'); return; }
                        setForgotLoading(true); setForgotError('');
                        try {
                          await api.forgotPassword(forgotEmail);
                          setForgotSent(true);
                        } catch (e) {
                          setForgotError(e.message || 'Error al enviar el correo.');
                        } finally { setForgotLoading(false); }
                      }} style={{
                        flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                        background: forgotLoading ? D.muted : D.coral, color: D.white, cursor: forgotLoading ? "not-allowed" : "pointer",
                        fontFamily: "Caveat, cursive", fontSize: 15, fontWeight: 700,
                        boxShadow: forgotLoading ? 'none' : '3px 3px 0 rgba(196,68,100,0.28)'
                      }}>{forgotLoading ? "Enviando..." : "Enviar"}</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 32, textAlign: "center", margin: "8px 0 16px" }}>💌</p>
                    <p className="caveat" style={{ color: D.green, fontSize: 16, textAlign: "center", margin: "0 0 18px" }}>
                      ¡Listo! Si el correo existe, recibirás un enlace en tu bandeja de entrada.
                    </p>
                    <p className="caveat" style={{ color: D.muted, fontSize: 13, textAlign: "center", margin: "0 0 18px" }}>
                      Revisa también la carpeta de spam.
                    </p>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }} style={{
                      width: "100%", padding: "10px 0", borderRadius: 12, border: "none",
                      background: D.coral, color: D.white, cursor: "pointer",
                      fontFamily: "Caveat, cursive", fontSize: 15, fontWeight: 700,
                      boxShadow: '3px 3px 0 rgba(196,68,100,0.28)'
                    }}>Cerrar</button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Backend note */}
          <div style={{
            marginTop: 20, padding: "10px 14px", background: D.cream,
            borderRadius: 12, border: `1px solid ${D.border}`
          }}>
            <p className="caveat" style={{ fontSize: 13, color: D.muted, margin: 0, textAlign: "center" }}>
              🔒 Tus datos se guardan de forma segura en el servidor.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
