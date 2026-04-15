import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, HeartHandshake, Camera, Gamepad2, User } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Inicio',   Icon: Home },
  { id: 'dates',     label: 'Citas',    Icon: HeartHandshake },
  { id: 'moments',   label: 'Memoria',  Icon: Camera },
  { id: 'games',     label: 'Juegos',   Icon: Gamepad2 },
  { id: 'profile',   label: 'Perfil',   Icon: User },
];

const ACTIVE_COLOR   = '#C44455';
const INACTIVE_COLOR = '#C8B8A8';

export default function BottomNav({ currentPage, navigateTo }) {
  const [datesPct, setDatesPct] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const active = stored.filter(d => d.status !== 'skipped');
    const done = active.filter(d => d.status === 'completed').length;
    setDatesPct(active.length > 0 ? Math.round((done / active.length) * 100) : 0);
  }, [currentPage]);

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#FDF6EC',
        borderTop: '1.5px solid #EDE0D0',
      }}
    >
      <div style={{ maxWidth: 430, margin: '0 auto', display: 'flex', alignItems: 'stretch' }}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => navigateTo(id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '10px 0 12px', position: 'relative',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    height: 3, width: 28, borderRadius: 99,
                    background: ACTIVE_COLOR,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                size={20}
                style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR, strokeWidth: active ? 2.2 : 1.8 }}
              />
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 12, fontWeight: active ? 700 : 600,
                  color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
              {id === 'dates' && (
                <div style={{ width: 30, height: 3, background: '#EDE0D0', borderRadius: 99, overflow: 'hidden', marginTop: 2 }}>
                  <div style={{ width: `${datesPct}%`, height: '100%', background: '#5BAA6A', borderRadius: 99, transition: 'width 0.6s ease' }}/>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
