import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      else setUser(null);
    } catch {}
  }, [isAuthenticated]);

  const failImg = (key) => setImgFails(p => ({ ...p, [key]: true }));

  // Map nav keys to existing images in public/images/
  const NAV_IMG_MAP = {
    inicio:  '/images/corazon.png',
    citas:   '/images/citas.png',
    memoria: '/images/recuerdos.png',
    juegos:  '/images/videojuegos.png',
    perfil:  '/images/perfil.png',
  };

  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : null;
  const partnerFirst = (user?.partner_name || user?.partner)
    ? (user.partner_name || user.partner).trim().split(/\s+/)[0]
    : null;
  const couple = firstName
    ? (partnerFirst ? `${firstName} & ${partnerFirst}` : firstName)
    : 'LoversApp';

  const NavIcon = ({ imgKey, FallbackIcon, active }) => {
    const src = NAV_IMG_MAP[imgKey];
    return src && !imgFails[imgKey]
      ? <img src={src} alt="" onError={() => failImg(imgKey)}
          style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0,
            filter: active
              ? 'invert(41%) sepia(85%) saturate(500%) hue-rotate(306deg) brightness(105%)'
              : 'invert(80%) sepia(15%) saturate(300%) hue-rotate(306deg) brightness(105%)' }} />
      : <FallbackIcon size={20} style={{ color: active ? '#FF6B8A' : '#FFD0DC', strokeWidth: active ? 2.5 : 1.8, flexShrink: 0 }} />;
  };

  // Portal the mobile nav directly to document.body so it can never be
  // trapped inside an ancestor with transform / filter / overflow.
  const mobileNav = createPortal(
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderTop: '1.5px solid rgba(255,182,199,0.55)',
        boxShadow: '0 -4px 28px rgba(255,107,138,0.14)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      // Hide on desktop via inline media workaround — lg:hidden class won't apply
      // because this node is outside the React subtree. Use a CSS class instead.
      className="bottom-nav-mobile"
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64 }}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = currentPage === id;
          return (
            <button key={id} onClick={() => navigateTo(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '6px 12px', border: 'none', background: 'transparent',
                cursor: 'pointer', flex: 1, minWidth: 0, position: 'relative',
              }}>
              {active && (
                <span style={{
                  position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: '#FF6B8A',
                }} />
              )}
              <Icon
                size={20}
                style={{
                  color: active ? '#FF6B8A' : '#FFD0DC',
                  strokeWidth: active ? 2.5 : 1.8,
                  transition: 'color 0.2s ease',
                }}
              />
              <span style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                color: active ? '#FF6B8A' : '#C4A8B0',
                letterSpacing: 0.2,
                transition: 'color 0.2s ease',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>,
    document.body
  );

  return (
    <>
      {mobileNav}

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

            <button onClick={() => navigateTo('settings')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 14px', border: 'none', background: currentPage === 'settings' ? '#C44455' : 'transparent', cursor: 'pointer', borderRadius: 14, width: '100%', textAlign: 'left' }}>
              <NavIcon imgKey="ajustes" FallbackIcon={Settings} active={currentPage === 'settings'} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: currentPage === 'settings' ? 700 : 500, color: currentPage === 'settings' ? '#FFFFFF' : '#5A4A50' }}>Ajustes</span>
            </button>

            <button onClick={() => navigateTo('help')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 14px', border: 'none', background: currentPage === 'help' ? '#C44455' : 'transparent', cursor: 'pointer', borderRadius: 14, width: '100%', textAlign: 'left' }}>
              <NavIcon imgKey="ayuda" FallbackIcon={HelpCircle} active={currentPage === 'help'} />
              <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: currentPage === 'help' ? 700 : 500, color: currentPage === 'help' ? '#FFFFFF' : '#5A4A50' }}>Ayuda</span>
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
            <img src="/images/el-mejor-lugar-para-nosotros.png" alt="El mejor lugar para nosotros" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
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
