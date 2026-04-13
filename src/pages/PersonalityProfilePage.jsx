import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Zap, Target, Users, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const D = { cream:'#FDF6EC', wine:'#1C0E10', coral:'#C44455', gold:'#D4A520', blue:'#5B8ECC', green:'#5BAA6A', blush:'#F0C4CC', white:'#FFFFFF', border:'#EDE0D0', muted:'#9A7A6A' };
const STYLE = `.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}::-webkit-scrollbar{display:none}`;

const PERSONALITY_MAP = {
  tranquilo: { title:'Personalidad Tranquila', icon:'😌', desc:'Prefieren experiencias relajadas e íntimas sin prisa. Disfrutan momentos de calidad.', accent:D.blue },
  extremo:   { title:'Personalidad Aventurera', icon:'🔥', desc:'Buscan emociones fuertes y nuevas experiencias. Les encanta explorar y vivir momentos intensos.', accent:D.coral },
  hibrido:   { title:'Personalidad Equilibrada', icon:'⚖️', desc:'Disfrutan de una mezcla de aventura y tranquilidad. Varían entre actividades relajadas e intensas.', accent:D.gold },
};
const ACTIVITY_MAP   = { sedentary:'🛋️ Sedentario', light:'🚶 Ligero', moderate:'🚴 Moderado', intense:'💪 Intenso' };
const FREQUENCY_MAP  = { weekly:'📅 Semanal', biweekly:'📆 Quincenal', monthly:'🗓️ Mensual', spontaneous:'⚡ Espontáneo' };
const SURPRISE_MAP   = { no_surprises:'📋 Todo planeado', some_surprises:'🎁 Algunas sorpresas', often_surprises:'🎉 Sorpresas frecuentes', spontaneous:'🌀 Totalmente espontáneo' };
const SOCIAL_MAP     = { intimate:'👫 Solo ustedes dos', with_friends:'👥 Con amigos', mixed:'🔄 Ambas opciones' };
const TIMELINE_MAP   = { one_month:'⚡ 1 Mes', three_months:'🎯 3 Meses', six_months:'📅 6 Meses', one_year:'⏰ 1 Año', two_years:'🐢 2+ Años', no_deadline:'∞ Sin Deadline' };

function Section({ title, icon, accent, children }) {
  return (
    <div style={{background:D.white,borderRadius:20,border:`1.5px solid ${D.border}`,borderLeft:`4px solid ${accent}`,padding:'16px 18px',marginBottom:14}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <span style={{fontSize:20}}>{icon}</span>
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
    <div style={{background:D.cream,minHeight:'100vh',maxWidth:430,margin:'0 auto',paddingBottom:88}}>
      <style>{STYLE}</style>

      {/* Header */}
      <div style={{padding:'48px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1.5px solid ${D.border}`,background:D.cream,position:'sticky',top:0,zIndex:40}}>
        <button onClick={() => navigateTo('profile')}
          style={{width:38,height:38,borderRadius:'50%',background:D.white,border:`1.5px solid ${D.border}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <ChevronLeft size={16} color={D.coral} strokeWidth={2.5}/>
        </button>
        <div style={{textAlign:'center'}}>
          <div className="lora" style={{fontSize:20,fontWeight:600,color:D.wine}}>Perfil de Personalidad</div>
          <div className="caveat" style={{fontSize:11,color:D.muted}}>Tu estilo de pareja ✦</div>
        </div>
        <div style={{width:38}}/>
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
        <Section title="Edades" icon="❤️" accent={D.coral}>
          <div style={{display:'flex',gap:24}}>
            <div><div className="caveat" style={{fontSize:12,color:D.muted}}>Tú</div><div className="caveat" style={{fontSize:20,fontWeight:700,color:D.wine}}>{profile.age} años</div></div>
            <div><div className="caveat" style={{fontSize:12,color:D.muted}}>Tu pareja</div><div className="caveat" style={{fontSize:20,fontWeight:700,color:D.wine}}>{profile.partnerAge} años</div></div>
          </div>
        </Section>

        {/* Budget */}
        <Section title="Presupuesto" icon="💰" accent={D.gold}>
          <div className="caveat" style={{fontSize:15,color:D.wine,marginBottom:8}}>Nivel {profile.budgetLevel}/5</div>
          <div style={{display:'flex',gap:4}}>
            {[...Array(5)].map((_,i)=>(
              <div key={i} style={{flex:1,height:6,borderRadius:3,background:i<profile.budgetLevel?D.gold:'#EDE0D0'}}/>
            ))}
          </div>
        </Section>

        {/* Activity */}
        <Section title="Nivel de Actividad" icon="🌿" accent={D.green}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{ACTIVITY_MAP[profile.profile?.activityLevel||'moderate']}</div>
        </Section>

        {/* Frequency */}
        <Section title="Frecuencia de Citas" icon="🎯" accent={D.blue}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{FREQUENCY_MAP[profile.profile?.frequency||'monthly']}</div>
        </Section>

        {/* Surprise */}
        <Section title="Factor Sorpresa" icon="🎁" accent={D.coral}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{SURPRISE_MAP[profile.profile?.surpriseLevel||'some_surprises']}</div>
        </Section>

        {/* Social */}
        <Section title="Entorno Social" icon="👥" accent={D.gold}>
          <div className="caveat" style={{fontSize:15,color:D.wine}}>{SOCIAL_MAP[profile.profile?.socialSetting||'intimate']}</div>
        </Section>

        {/* Hobbies */}
        {profile.profile?.hobbies?.length > 0 && (
          <Section title="Intereses & Hobbies" icon="🎯" accent={D.blue}>
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
          <Section title="Meta de Citas" icon="⏰" accent={D.green}>
            <div className="caveat" style={{fontSize:22,fontWeight:700,color:D.wine}}>{TIMELINE_MAP[profile.profile.timeline]||'∞'}</div>
          </Section>
        )}

        {/* CTA */}
        <button onClick={() => navigateTo('citas-personalizadas')}
          style={{width:'100%',padding:'14px',borderRadius:16,background:D.coral,border:'none',cursor:'pointer',marginTop:4}}>
          <span className="caveat" style={{fontSize:16,fontWeight:700,color:D.white}}>Ver mis 100 Citas Personalizadas 💕</span>
        </button>
      </div>
    </div>
  );
}
