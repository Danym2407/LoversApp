import React from 'react';
import BgDoodles from '@/design-system/BgDoodles';

export default function PageLayout({ children, paddingBottom = 88, doodleHeight, style = {} }) {
  return (
    <div style={{
      background: '#FFF5F7',
      minHeight: '100vh',
      width: '100%',
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom,
      fontFamily: "'Lora',Georgia,serif",
      boxSizing: 'border-box',
      ...style,
    }}>
      <BgDoodles viewHeight={doodleHeight} />
      {children}
    </div>
  );
}
