import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const D = { cream:'#FFF5F7', wine:'#2D1B2E', coral:'#FF6B8A', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#FFD0DC', white:'#FFFFFF', border:'#FFD0DC', muted:'#9B8B95' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

const PERSONALITY_MAP = {
  tranquilo: { title:'Personalidad Tranquila', icon:'😌', desc:'Prefieres experiencias relajadas e íntimas sin prisa. Disfrutas momentos de calidad y conexión real.', accent:D.blue },
  extremo:   { title:'Personalidad Aventurera', icon:'🔥', desc:'Buscas emociones fuertes y nuevas experiencias. Te encanta explorar y vivir momentos intensos.', accent:D.coral },
  hibrido:   { title:'Personalidad Equilibrada', icon:'⚖️', desc:'Disfrutas de una mezcla de aventura y tranquilidad. Alternas entre actividades relajadas e intensas.', accent:D.gold },
};
const ACTIVITY_MAP   = { sedentary:'🛋️ Sedentario', light:'🚶 Ligero', moderate:'🚴 Moderado', intense:'💪 Intenso' };
const FREQUENCY_MAP  = { weekly:'📅 Semanal', biweekly:'📆 Quincenal', monthly:'🗓️ Mensual', spontaneous:'⚡ Espontáneo' };
const SURPRISE_MAP   = { no_surprises:'📋 Todo planeado', some_surprises:'🎁 Algunas sorpresas', often_surprises:'🎉 Sorpresas frecuentes', spontaneous:'🌀 Totalmente espontáneo' };
const SOCIAL_MAP     = { intimate:'👫 Solo para dos', with_friends:'👥 Con amigos', mixed:'🔄 Ambas opciones' };
const TIMELINE_MAP   = { one_month:'⚡ 1 Mes', three_months:'🎯 3 Meses', six_months:'📅 6 Meses', one_year:'⏰ 1 Año', two_years:'🐢 2+ Años', no_deadline:'∞ Sin Deadline' };

function BgDoodles() {
  return (
    <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', opacity:0.25 }} viewBox="0 0 390 820" fill="none" aria-hidden>
      <text x="355" y="90" fontSize="12" fill="#E8A020" fontFamily="serif">✦</text>
      <text x="20" y="160" fontSize="9" fill="#E05060" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8" fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18" y="420" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <path d="M30 320 Q50 300 70 320 Q90 340 110 320" stroke="#E05060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Section({ title, icon, accent, children }) {
  return (
    <div style={{background:D.white,borderRadius:20,border:`1.5px solid ${D.border}`,borderLeft:`4px solid ${accent}`,padding:'16px 18px',marginBottom:14}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <img src={icon} alt="" style={{width:20,height:20,objectFit:'contain'}}/>
        <div className="lora" style={{fontSize:15,fontWeight:600,color:D.wine}}>{title}</div>
      </div>
      {children}
    </div>
  );
}

export default function PersonalityProfilePage({ navigateTo }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const ud = JSON.parse(localStorage.getItem('loversappUser')||'{}');
    if (ud.personalityTest?.profile) setProfile(ud.personalityTest);
  }, []);

  if (!profile) return (
    <div style={{background:D.cream,minHeight:'100vh',maxWidth:430,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p className="caveat" style={{color:D.muted,fontSize:16}}>Cargando perfil...</p>
    </div>
  );

  const p = PERSONALITY_MAP[profile.personality] || PERSONALITY_MAP.hibrido;

  return (
    <div style={{background:D.cream,minHeight:'100vh',maxWidth:430,margin:'0 auto',paddingBottom:88,position:'relative',overflow:'hidden'}}>
      <style>{STYLE}</style>
      <BgDoodles />

      {/* Header */}
      <div style={{ padding:'48px 20px 18px', background:D.cream, borderBottom:`1.5px solid ${D.border}`, position:'relative', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => navigateTo('profile')}
              style={{ width:32, height:32, borderRadius:'50%', background:D.white, border:`1.5px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <ChevronLeft size={14} color={D.coral} strokeWidth={2.5}/>
            </button>
            <span className="caveat" style={{ fontSize:12, color:'#C4AAB0', fontWeight:600 }}>Inicio &gt; Perfil de Personalidad</span>
          </div>
        </div>
        <h1 className="lora" style={{ fontSize:30, fontWeight:700, color:D.wine, margin:0, display:'flex', alignItems:'center', gap:8 }}>
          Perfil de Personalidad
          <img src="/images/perfil.png" alt="" style={{ width:28, height:28, objectFit:'contain' }}/>
        </h1>
        <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'65%', maxWidth:220, margin:'4px 0 8px' }}/>
        <p className="caveat" style={{ fontSize:14, color:D.muted, margin:0 }}>Tu estilo de pareja ✦</p>
      </div>

      <div style={{padding:'20px'}}>
        {/* Hero personality card */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          style={{background:D.wine,borderRadius:24,padding:'24px',marginBottom:20,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:8}}>{p.icon}</div>
          <div className="lora" style={{fontSize:20,fontWeight:600,color:D.white,marginBottom:8}}>{p.title}</div>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.6}}>{p.desc}</p>
        </motion.div>

        {/* Ages */}
        <Section title="Edades" icon="/images/corazon.png" accent={D.coral}>
          <div style={{display:'flex',gap:24}}>
            <div><div className="caveat" style={{fontSize:12,color:D.muted}}>Tu edad</div><div className="caveat" style={{fontSize:20,fontWeight:700,color:D.wine}}>{profile.age ? `${profile.age} años` : '–'}</div></div>
          </div>
        </Section>

        {/* Budget */}
        <Section title="Presupuesto" icon="/images/metas.png" accent={D.gold}>
          <div className="caveat" style={{fontSize:15,color:D.wine,marginBottom:8}}>Nivel {profile.budgetLevel}/5</div>
          <div style={{display:'flex',gap:4}}>
            {[...Array(5)].map((_,i)=>(
              <div key={i} style={{flex:1,height:6,borderRadius:3,background:i<profile.budgetLevel?D.gold:D.border}}/>
            ))}
          </div>
        </Section>

        {/* Activity */}
        <Section title="Nivel de Actividad" icon="/images/retos.png" accent={D.green}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{ACTIVITY_MAP[profile.profile?.activityLevel||'moderate']}</div>
        </Section>

        {/* Frequency */}
        <Section title="Frecuencia de Citas" icon="/images/calendario.png" accent={D.blue}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{FREQUENCY_MAP[profile.profile?.frequency||'monthly']}</div>
        </Section>

        {/* Surprise */}
        <Section title="Factor Sorpresa" icon="/images/sorpresa.png" accent={D.coral}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{SURPRISE_MAP[profile.profile?.surpriseLevel||'some_surprises']}</div>
        </Section>

        {/* Social */}
        <Section title="Entorno Social" icon="/images/perfil.png" accent={D.gold}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{SOCIAL_MAP[profile.profile?.socialSetting||'intimate']}</div>
        </Section>

        {/* Hobbies */}
        {profile.profile?.hobbies?.length > 0 && (
          <Section title="Intereses & Hobbies" icon="/images/ideas.png" accent={D.blue}>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {profile.profile.hobbies.map((h,i)=>(
                <span key={i} style={{padding:'4px 12px',borderRadius:20,background:`${D.blue}18`,border:`1px solid ${D.blue}44`}}>
                  <span className="caveat" style={{fontSize:12,fontWeight:700,color:D.wine}}>{h}</span>
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Timeline */}
        {profile.profile?.timeline && (
          <Section title="Meta de Citas" icon="/images/countdown.png" accent={D.green}>
            <div className="caveat" style={{fontSize:22,fontWeight:700,color:D.wine}}>{TIMELINE_MAP[profile.profile.timeline]||'∞'}</div>
          </Section>
        )}

        {/* CTA */}
        <button onClick={() => navigateTo('citas-aleatorias')}
          style={{width:'100%',padding:'14px',borderRadius:16,background:D.coral,border:'none',cursor:'pointer',marginTop:4,boxShadow:'3px 3px 0 rgba(196,68,100,0.28)'}}>
          <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Ver mis 100 Citas Personalizadas 💕</span>
        </button>
      </div>
    </div>
  );
}
