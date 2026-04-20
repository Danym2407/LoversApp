import React from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * Standard page header used across all main pages.
 *
 * Props:
 *   breadcrumb  – string shown after "Inicio >"
 *   title       – h1 text
 *   icon        – img src for the icon next to title (optional)
 *   subtitle    – React node below the subrayado line (optional)
 *   onBack      – click handler for the back button (default: window.history.back())
 *   action      – React node placed on the right side of the back-button row (optional)
 *   titleAction – React node placed to the right of the title block (optional, e.g. a badge)
 */
export default function PageHeader({ breadcrumb, title, icon, subtitle, onBack, action, titleAction }) {
  const handleBack = onBack || (() => window.history.back());

  return (
    <div style={{
      padding: '48px 20px 18px',
      background: '#FFF5F7',
      borderBottom: '1.5px solid #FFD0DC',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Back button row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleBack}
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1.5px solid #FFD0DC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <ChevronLeft size={14} color="#FF6B8A" strokeWidth={2.5} />
          </button>
          <span className="caveat" style={{ fontSize: 12, color: '#C4AAB0', fontWeight: 600 }}>
            Inicio &gt; {breadcrumb}
          </span>
        </div>
        {action}
      </div>

      {/* Title row — optionally with a right-side titleAction */}
      <div style={titleAction ? { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 } : undefined}>
        <div style={titleAction ? { flex: 1, minWidth: 0 } : undefined}>
          <h1 className="lora" style={{ fontSize: 30, fontWeight: 700, color: '#2D1B2E', margin: 0, lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: 8 }}>
            {title}
            {icon && <img src={icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />}
          </h1>
          <img src="/images/subrayado1.png" alt="" style={{ display: 'block', width: '65%', maxWidth: 220, margin: '4px 0 8px' }} />
          {subtitle != null && (
            <p className="caveat" style={{ fontSize: 14, color: '#9B8B95', margin: 0 }}>{subtitle}</p>
          )}
        </div>
        {titleAction}
      </div>
    </div>
  );
}
