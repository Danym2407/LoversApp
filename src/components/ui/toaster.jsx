import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';
import { useToast } from '@/components/ui/use-toast';

// Detect theme from title content
function getTheme(title = '', variant = '') {
  if (variant === 'destructive') return 'error';
  const t = title.toLowerCase();
  if (/error|\u26a0|faltan|falta/.test(t)) return 'error';
  if (/complet|lograron|terminaron/.test(t)) return 'success';
  if (/guardad|a\u00f1adid|sincron|plan|vinculad|saludo/.test(t)) return 'saved';
  if (/test|personalidad/.test(t)) return 'personality';
  return 'info';
}

const THEMES = {
  error:       { bg: 'linear-gradient(135deg,#C44455,#A03040)', icon: '⚠️', shadow: 'rgba(196,68,85,0.35)' },
  success:     { bg: 'linear-gradient(135deg,#3A8A52,#5BAA6A)', icon: '🎉', shadow: 'rgba(91,170,106,0.35)' },
  saved:       { bg: 'linear-gradient(135deg,#B08A10,#D4A520)',  icon: '✦',  shadow: 'rgba(212,165,32,0.35)'  },
  personality: { bg: 'linear-gradient(135deg,#6A3090,#9B59C0)', icon: '✨', shadow: 'rgba(155,89,192,0.35)' },
  info:        { bg: 'linear-gradient(135deg,#2A5A9A,#5B8ECC)', icon: '💕', shadow: 'rgba(91,142,204,0.35)' },
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: '100%',
      maxWidth: 430,
      padding: '0 16px',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxSizing: 'border-box',
    }}>
      <AnimatePresence>
        {toasts.map(({ id, title, description, variant, dismiss }) => {
          const theme = THEMES[getTheme(title, variant)];
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: -60, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.94 }}
              transition={{ type: 'spring', damping: 22, stiffness: 340 }}
              style={{
                pointerEvents: 'auto',
                marginTop: 52,
                background: theme.bg,
                borderRadius: 20,
                padding: '14px 44px 14px 18px',
                boxShadow: `0 8px 32px ${theme.shadow}, 0 2px 8px rgba(0,0,0,0.12)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Icon badge */}
              <div style={{
                flexShrink: 0,
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                backdropFilter: 'blur(4px)',
              }}>
                {theme.icon}
              </div>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {title && (
                  <div style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: description ? 2 : 0,
                    lineHeight: 1.3,
                    textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}>{title}</div>
                )}
                {description && (
                  <div style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.3,
                  }}>{description}</div>
                )}
              </div>
              {/* Close */}
              <button
                onClick={dismiss}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
              >
                <X size={11} color="#fff" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}