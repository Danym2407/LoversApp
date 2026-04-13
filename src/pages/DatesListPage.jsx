import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, GripVertical, Heart, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#F0C4CC', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

export default function DatesListPage({ navigateTo }) {
  const [dates, setDates] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    setDates(stored.filter(d => d.status !== 'skipped').sort((a, b) => a.priority - b.priority));
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    const nd = [...dates];
    const dragged = nd[draggedItem];
    nd.splice(draggedItem, 1);
    nd.splice(index, 0, dragged);
    nd.forEach((d, i) => { d.priority = i + 1; });
    setDates(nd);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    if (draggedItem !== null) {
      localStorage.setItem('coupleDates', JSON.stringify(dates));
      toast({ title: 'Orden actualizado', description: 'Prioridades guardadas.' });
    }
    setDraggedItem(null);
  };

  const completed = dates.filter(d => d.status === 'completed').length;

  const getAccent = (d) =>
    d.status === 'completed' ? D.green :
    d.plannedDate ? D.gold : D.blue;

  return (
    <div style={{ background: D.cream, minHeight: '100vh', maxWidth: 430, margin: '0 auto', paddingBottom: 88 }}>
      <style>{STYLE}</style>

      <div style={{ padding: '48px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: D.cream, borderBottom: `1.5px solid ${D.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <button onClick={() => navigateTo('home')}
          style={{ width: 38, height: 38, borderRadius: '50%', background: D.white, border: `1.5px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="lora" style={{ fontSize: 20, fontWeight: 600, color: D.wine }}>Nuestras 100 Citas</div>
          <div className="caveat" style={{ fontSize: 11, color: D.muted }}>{completed} completadas · {100 - completed} pendientes ✦</div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ background: `${D.gold}22`, border: `1.5px solid ${D.gold}55`, borderRadius: 14, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GripVertical size={14} color={D.gold} />
          <span className="caveat" style={{ fontSize: 13, color: D.wine }}>Arrastra para cambiar prioridad</span>
        </div>

        {dates.map((date, index) => {
          const accent = getAccent(date);
          const avgHearts = date.status === 'completed'
            ? Math.round((date.danielaRating?.hearts + date.eduardoRating?.hearts) / 2) : 0;
          const avgStars = date.status === 'completed'
            ? Math.round((date.danielaRating?.stars + date.eduardoRating?.stars) / 2) : 0;

          return (
            <motion.div
              key={date.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.015 }}
              onClick={() => navigateTo('detail', date.id)}
              style={{
                background: D.white,
                border: `1.5px solid ${D.border}`,
                borderLeft: `4px solid ${accent}`,
                borderRadius: 16,
                padding: '12px 14px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'grab',
                opacity: draggedItem === index ? 0.5 : 1
              }}
            >
              <GripVertical size={16} color={D.muted} style={{ flexShrink: 0 }} />

              <div style={{ minWidth: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="caveat" style={{ fontSize: 14, fontWeight: 700, color: accent }}>
                  {String(date.id).padStart(2, '0')}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lora" style={{ fontSize: 14, fontWeight: 600, color: D.wine, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{date.name}</div>
                {date.status === 'completed' && date.date && (
                  <div className="caveat" style={{ fontSize: 11, color: D.muted }}>{date.date}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                {date.status === 'completed' ? (
                  <>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Heart key={i} size={10} color={D.coral} fill={i < avgHearts ? D.coral : 'none'} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} color={D.gold} fill={i < avgStars ? D.gold : 'none'} />
                      ))}
                    </div>
                  </>
                ) : (
                  <span style={{ padding: '2px 10px', background: `${accent}15`, border: `1px solid ${accent}44`, borderRadius: 20 }}>
                    <span className="caveat" style={{ fontSize: 10, fontWeight: 700, color: accent }}>
                      {date.plannedDate ? 'Planeada' : 'Pendiente'}
                    </span>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
