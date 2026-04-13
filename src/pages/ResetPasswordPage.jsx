import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

const D = {
  cream: "#FDF6EC", wine: "#1C0E10", coral: "#C44455", gold: "#D4A520",
  blue: "#5B8ECC", green: "#5BAA6A", blush: "#F0C4CC", white: "#FFFFFF",
  border: "#EDE0D0", muted: "#9A7A6A"
};

export default function ResetPasswordPage({ navigateTo }) {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Parse token from hash: #reset-password?token=xxxx
    const hash = window.location.hash; // e.g. "#reset-password?token=abc123"
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const params = new URLSearchParams(hash.slice(qIndex + 1));
      const t = params.get('token');
      if (t) setToken(t);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      // Clear token from URL
      window.history.replaceState(null, '', window.location.pathname);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", border: `1.5px solid ${D.border}`,
    borderRadius: 12, background: D.cream, outline: "none",
    fontFamily: "Lora, Georgia, serif", fontSize: 15, color: D.wine,
    boxSizing: "border-box"
  };

  return (
    <div style={{
      minHeight: "100vh", background: D.cream, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <style>{`.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}`}</style>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%", maxWidth: 400, background: D.white,
          border: `1.5px solid ${D.border}`, borderRadius: 24,
          padding: "32px 28px", boxShadow: "0 4px 32px rgba(28,14,16,0.08)"
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
          <h1 className="lora" style={{ fontSize: 24, fontWeight: 700, color: D.wine, margin: 0 }}>
            Nueva contraseña
          </h1>
          <p className="caveat" style={{ fontSize: 15, color: D.muted, margin: "4px 0 0" }}>
            Elige una contraseña segura 💕
          </p>
        </div>

        {!token && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p className="caveat" style={{ color: D.coral, fontSize: 15 }}>
              Enlace inválido o expirado. Solicita uno nuevo desde la pantalla de inicio.
            </p>
            <button onClick={() => navigateTo('dashboard')} style={{
              marginTop: 16, padding: "10px 24px", borderRadius: 12, border: "none",
              background: D.wine, color: D.white, cursor: "pointer",
              fontFamily: "Caveat, cursive", fontSize: 15
            }}>Ir al inicio</button>
          </div>
        )}

        {token && !success && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="caveat" style={{ fontSize: 15, color: D.wine, display: "block", marginBottom: 5 }}>
                Nueva contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 0
                }}>
                  {showPass ? <EyeOff size={16} color={D.muted} /> : <Eye size={16} color={D.muted} />}
                </button>
              </div>
            </div>

            <div>
              <label className="caveat" style={{ fontSize: 15, color: D.wine, display: "block", marginBottom: 5 }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#FEE8EC", borderRadius: 12, border: `1px solid ${D.coral}44` }}>
                <p className="caveat" style={{ fontSize: 14, color: D.coral, margin: 0, textAlign: "center" }}>{error}</p>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
                background: loading ? D.muted : D.coral, color: D.white,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Lora, Georgia, serif", fontSize: 16, fontWeight: 700,
                marginTop: 4
              }}
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </motion.button>
          </form>
        )}

        {success && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <p style={{ fontSize: 42, margin: "0 0 12px" }}>🎉</p>
            <p className="lora" style={{ color: D.green, fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
              ¡Contraseña actualizada!
            </p>
            <p className="caveat" style={{ color: D.muted, fontSize: 15, margin: "0 0 20px" }}>
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button onClick={() => navigateTo('dashboard')} style={{
              width: "100%", padding: "12px 0", borderRadius: 14, border: "none",
              background: D.wine, color: D.white, cursor: "pointer",
              fontFamily: "Lora, Georgia, serif", fontSize: 16, fontWeight: 700
            }}>
              Ir al inicio
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
