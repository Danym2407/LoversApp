import React, { useState, useEffect } from 'react';
import { Home, HeartHandshake, Camera, Gamepad2, User, Settings, LogOut, HelpCircle, Bell, Search, ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio',  imgKey: 'inicio',  Icon: Home },
  { id: 'dates',     label: 'Citas',   imgKey: 'citas',   Icon: HeartHandshake },
  { id: 'moments',   label: 'Memoria', imgKey: 'memoria', Icon: Camera },
  { id: 'games',     label: 'Juegos',  imgKey: 'juegos',  Icon: Gamepad2 },
  { id: 'profile',   label: 'Perfil',  imgKey: 'perfil',  Icon: User },
];

export default function BottomNav({ currentPage, navigateTo, onLogout, isAuthenticated, onOpenLogin }) {
  const [imgFails, setImgFails] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('loversappUser');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const failImg = (key) => setImgFails(p => ({ ...p, [key]: true }));

  const couple = (user?.name && user?.partner)
    ? `${user.name.trim().split(/\s+/)[0]} & ${user.partner.trim().split(/\s+/)[0]}`
    : 'LoversApp';

  const NavIcon = ({ imgKey, FallbackIcon, active }) => (
    !imgFails[imgKey]
      ? <img src={`/images/nav-${imgKey}.png`} alt="" onError={() => failImg(imgKey)}
          style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0,
            filter: active ? 'brightness(0) invert(1)' : 'none' }} />
      : <FallbackIcon size={20} style={{ color: active ? '#FFFFFF' : '#9A8A8A', strokeWidth: active ? 2.5 : 1.8, flexShrink: 0 }} />
  );

  return (
    <>
      {/* -- MOBILE: frosted glass bottom bar (sin cambios) --------- */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(253,246,236,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: '1px solid rgba(196,151,62,0.12)',
          boxShadow: '0 -2px 16px rgba(28,14,16,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64 }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = currentPage === id;
            return (
              <button key={id} onClick={() => navigateTo(id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3, padding: '6px 12px', border: 'none', background: 'transparent', cursor: 'pointer', flex: 1, minWidth: 0 }}>
                <Icon size={20} style={{ color: active ? '#C44455' : '#B0A0A8', strokeWidth: active ? 2.5 : 1.8 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: active ? 700 : 400, color: active ? '#C44455' : '#9A8A8A', letterSpacing: 0.2 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* -- DESKTOP: left sidebar ----------------------------------- */}
      <nav className="hidden lg:flex fixed top-0 bottom-0 left-0 flex-col z-50 w-56"
        style={{ background: '#FFFFFF', borderRight: '1.5px solid #EDE0D0' }}>

        {/* Logo */}
        <div style={{ padding: '52px 16px 12px', borderBottom: '1.5px solid #EDE0D0' }}>
          <img src="/images/lovers-app.png" alt="LoversApp" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>

        {/* Main nav */}
        <div style={{ flex: 1, padding: '10px 10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, label, imgKey, Icon }) => {
            const active = currentPage === id;
            return (
              <button key={id} onClick={() => navigateTo(id)} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '10px 14px',
                border: 'none', background: active ? '#C44455' : 'transparent',
                cursor: 'pointer', borderRadius: 14, width: '100%', textAlign: 'left',
                transition: 'background 0.15s',
              }}>
                <NavIcon imgKey={imgKey} FallbackIcon={Icon} active={active} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: active ? 700 : 500, color: active ? '#FFFFFF' : '#5A4A50' }}>
                  {label}
                </span>
              </button>
            );
          })}

          {/* -- OTROS --------------------------------------------- */}
          <div style={{ marginTop: 18 }}>
            <div style={{ padding: '0 14px 6px', fontFamily: "'Inter',sans-serif", fontSize: 16,
              fontWeight: 700, color: '#B0A0A8', letterSpacing: '0.13em', textTransform: 'uppercase' }}>OTROS</div>
            <img src="/images/subrayado1.png" alt="" style={{ display: 'block', width: '40%', height: 'auto', margin: '0 0 6px 14px', objectFit: 'contain', pointerEvents: 'none' }} />
            <div style={{ height: 1, background: '#EDE0D0', margin: '0 8px 8px' }} />

            <button onClick={() => navigateTo('profile')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 14, width: '100%', textAlign: 'left' }}>
              <NavIcon imgKey="ajustes" FallbackIcon={Settings} active={false} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500, color: '#5A4A50' }}>Ajustes</span>
            </button>

            <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 14, width: '100%', textAlign: 'left' }}>
              <NavIcon imgKey="ayuda" FallbackIcon={HelpCircle} active={false} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500, color: '#5A4A50' }}>Ayuda</span>
            </button>

            {isAuthenticated ? (
              <button onClick={() => onLogout?.()} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 14, width: '100%', textAlign: 'left' }}>
                <NavIcon imgKey="cerrar-sesion" FallbackIcon={LogOut} active={false} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500, color: '#C44455' }}>Cerrar sesi&oacute;n</span>
              </button>
            ) : (
              <button onClick={() => onOpenLogin?.('login')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 14, width: '100%', textAlign: 'left' }}>
                <LogOut size={20} style={{ color: '#C44455', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500, color: '#C44455' }}>Iniciar sesi&oacute;n</span>
              </button>
            )}
          </div>
        </div>

        {/* Sticky note */}
        <div style={{ padding: '0 14px 22px' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden' }}>
            <img src="/images/el-mejor-lugar-para-nosotros.png" alt="El mejor lugar para nosotros" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>
        </div>
      </nav>

      {/* -- DESKTOP: top bar --------------------------------------- */}
      <div className="hidden lg:flex fixed z-40 items-center"
        style={{ top: 0, left: 224, right: 0, height: 64, background: '#FFFFFF', borderBottom: '1.5px solid #EDE0D0', padding: '0 40px', gap: 14 }}>

          {/* Search */}
          <div style={{ maxWidth: 420, width: '100%', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#B0A0A8', pointerEvents: 'none' }} />
            <input placeholder="Buscar..." readOnly style={{ width: '100%', height: 38, paddingLeft: 38, paddingRight: 14,
              borderRadius: 10, border: '1.5px solid #EDE0D0', background: '#FAFAFA',
              fontFamily: "'Inter',sans-serif", fontSize: 14, color: '#1C0E10', outline: 'none',
              cursor: 'default', boxSizing: 'border-box' }} />
          </div>

          <div style={{ flex: 1 }} />

          {/* Bell */}
          <button style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid #EDE0D0', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={17} style={{ color: '#6B5B65' }} />
          </button>

          {/* User pill */}
          <button onClick={() => isAuthenticated ? navigateTo('profile') : onOpenLogin?.('login')}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 14px 5px 5px',
              borderRadius: 20, border: '1.5px solid #EDE0D0', background: 'transparent', cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C44455 0%, #E88A95 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={15} style={{ color: '#FFFFFF' }} />
            </div>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: '#1C0E10' }}>{couple}</span>
            <ChevronDown size={13} style={{ color: '#9A8A8A' }} />
          </button>

      </div>
    </>
  );
}
