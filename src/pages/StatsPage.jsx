import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { D } from '@/design-system/tokens';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';

function RatingRow({ label, value, color, Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span className="caveat" style={{ fontSize: 13, color: D.muted }}>{label}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {[...Array(5)].map((_, i) => <Icon key={i} size={13} color={color} fill={i < Math.round(value) ? color : 'none'} strokeWidth={1.5} />)}
      </div>
    </div>
  );
}

export default function StatsPage({ navigateTo }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const dates = JSON.parse(localStorage.getItem('coupleDates') || '[]');
    const completed = dates.filter(d => d.status === 'completed');
    if (completed.length === 0) { setStats({ completedCount: 0, total: dates.length }); return; }

    const avgDH = completed.reduce((s, d) => s + (d.danielaRating?.hearts || 0), 0) / completed.length;
    const avgDS = completed.reduce((s, d) => s + (d.danielaRating?.stars || 0), 0) / completed.length;
    const avgEH = completed.reduce((s, d) => s + (d.eduardoRating?.hearts || 0), 0) / completed.length;
    const avgES = completed.reduce((s, d) => s + (d.eduardoRating?.stars || 0), 0) / completed.length;

    const topDate = completed.reduce((top, cur) => {
      const ca = ((cur.danielaRating?.hearts || 0) + (cur.danielaRating?.stars || 0) + (cur.eduardoRating?.hearts || 0) + (cur.eduardoRating?.stars || 0)) / 4;
      const ta = ((top.danielaRating?.hearts || 0) + (top.danielaRating?.stars || 0) + (top.eduardoRating?.hearts || 0) + (top.eduardoRating?.stars || 0)) / 4;
      return ca > ta ? cur : top;
    });

    const locs = {};
    completed.forEach(d => { if (d.location) locs[d.location] = (locs[d.location] || 0) + 1; });
    const topLoc = Object.entries(locs).sort((a, b) => b[1] - a[1])[0];

    const words = [...completed.map(d => d.danielaOneWord).filter(Boolean), ...completed.map(d => d.eduardoOneWord).filter(Boolean)];

    setStats({ completed, completedCount: completed.length, total: dates.length, avgDH, avgDS, avgEH, avgES, topDate, topLoc, words });
  }, []);

  if (!stats) return null;

  return (
    <PageLayout style={{ paddingBottom: 88 }}>
      <PageHeader
        breadcrumb="Nuestro Año en Citas"
        title="Nuestro año en citas"
        icon="/images/estadisticas.png"
        subtitle={`${stats.completedCount} citas completadas 💕`}
      />

      <div style={{ padding: '20px 18px' }}>
        {stats.completedCount === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <img src="/images/estadisticas.png" alt="" style={{ width:64, height:64, objectFit:'contain', marginBottom:16 }}/>
            <div className="lora" style={{ fontSize: 18, color: D.wine, marginBottom: 8 }}>Aún sin citas completadas</div>
            <div className="caveat" style={{ color: D.muted, fontSize: 15 }}>¡Completen su primera cita para ver estadísticas! 💕</div>
          </div>
        ) : (
          <>
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: D.wine, borderRadius: 24, padding: '28px', textAlign: 'center', marginBottom: 16 }}>
              <div className="caveat" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Han completado</div>
              <div className="lora" style={{ fontSize: 64, fontWeight: 700, color: D.white, lineHeight: 1 }}>{stats.completedCount}</div>
              <div className="lora" style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>citas increíbles juntos</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                {[...Array(3)].map((_, i) => <Heart key={i} size={20} color={D.coral} fill={D.coral} />)}
              </div>
            </motion.div>

            {/* Daniela & Eduardo ratings */}
            {[{ name: 'Daniela', h: stats.avgDH, s: stats.avgDS }, { name: 'Eduardo', h: stats.avgEH, s: stats.avgES }].map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, x: i === 0 ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
                style={{ background: D.white, borderRadius: 18, border: `1.5px solid ${D.border}`, borderLeft: `4px solid ${i === 0 ? D.coral : D.blue}`, padding: '14px 16px', marginBottom: 12 }}>
                <div className="lora" style={{ fontSize: 15, fontWeight: 600, color: D.wine, marginBottom: 10 }}>{p.name}</div>
                <RatingRow label="Promedio emocional" value={p.h} color={D.coral} Icon={Heart} />
                <RatingRow label="Promedio diversión" value={p.s} color={D.gold} Icon={Star} />
              </motion.div>
            ))}

            {/* Top date */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: D.white, borderRadius: 18, border: `1.5px solid ${D.border}`, borderLeft: `4px solid ${D.gold}`, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <img src="/images/trofeo.png" alt="" style={{ width:18, height:18, objectFit:'contain' }}/>
                <div className="lora" style={{ fontSize: 15, fontWeight: 600, color: D.wine }}>Mejor cita calificada</div>
              </div>
              <div className="caveat" style={{ fontSize: 26, fontWeight: 700, color: D.wine }}>Cita #{stats.topDate.id}</div>
              <div className="lora" style={{ fontSize: 14, color: D.muted, marginBottom: 6 }}>{stats.topDate.name}</div>
              {stats.topDate.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <img src="/images/plan.png" alt="" style={{ width:12, height:12, objectFit:'contain', opacity:0.6 }}/>
                  <span className="caveat" style={{ fontSize: 12, color: D.muted }}>{stats.topDate.location}</span>
                </div>
              )}
            </motion.div>

            {/* Top location */}
            {stats.topLoc && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                style={{ background: D.white, borderRadius: 18, border: `1.5px solid ${D.border}`, borderLeft: `4px solid ${D.green}`, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <img src="/images/plan.png" alt="" style={{ width:18, height:18, objectFit:'contain' }}/>
                  <div className="lora" style={{ fontSize: 15, fontWeight: 600, color: D.wine }}>Lugar favorito</div>
                </div>
                <div className="caveat" style={{ fontSize: 22, fontWeight: 700, color: D.wine }}>{stats.topLoc[0]}</div>
                <div className="caveat" style={{ fontSize: 13, color: D.muted }}>{stats.topLoc[1]} {stats.topLoc[1] === 1 ? 'cita' : 'citas'} aquí</div>
              </motion.div>
            )}

            {/* Words cloud */}
            {stats.words.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                style={{ background: D.white, borderRadius: 18, border: `1.5px solid ${D.border}`, borderLeft: `4px solid ${D.blue}`, padding: '14px 16px' }}>
                <div className="lora" style={{ fontSize: 15, fontWeight: 600, color: D.wine, marginBottom: 10 }}>Sus citas en palabras</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {stats.words.map((w, i) => (
                    <span key={i} style={{ padding: '4px 12px', background: D.wine, borderRadius: 20 }}>
                      <span className="caveat" style={{ fontSize: 12, fontWeight: 700, color: D.white }}>{w}</span>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
