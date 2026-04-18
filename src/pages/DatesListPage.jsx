import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Heart, GripVertical, CheckCircle, Plus, X, MapPin, DollarSign, RefreshCw, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { upsertCalendarEvent, upsertTimelineEvent } from '@/lib/eventSync';
import { citasDatabase, citasPorCategoria } from '@/data/citas';

const ALL_CITAS_FLAT = (() => {
  const merged = [
    ...Object.values(citasDatabase || {}).flat(),
    ...Object.values(citasPorCategoria || {}).flat()
  ];
  const seen = new Set();
  return merged.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
})();

const BUDGET_STR = { 1: 'Muy bajo', 2: 'Bajo', 3: 'Medio', 4: 'Alto', 5: 'Muy alto' };

// ── BgDoodles ──────────────────────────────────────────────────────────────────
function BgDoodles() {
  return (
    <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', opacity:0.25 }} viewBox="0 0 390 820" fill="none">
      <text x="355" y="90"  fontSize="12" fill="#E8A020" fontFamily="serif">✦</text>
      <text x="20"  y="160" fontSize="9"  fill="#E05060" fontFamily="serif">✦</text>
      <text x="360" y="280" fontSize="8"  fill="#5B8ECC" fontFamily="serif">★</text>
      <text x="18"  y="420" fontSize="10" fill="#5BAA6A" fontFamily="serif">✦</text>
      <text x="352" y="560" fontSize="9"  fill="#E8A020" fontFamily="serif">✦</text>
      <ellipse cx="356" cy="130" rx="18" ry="16" stroke="#5B8ECC" strokeWidth="1.5" strokeDasharray="4 3" fill="none" transform="rotate(-8 356 130)"/>
      <path d="M15 340 Q35 335 43 348" stroke="#E05060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── DoodleTag ──────────────────────────────────────────────────────────────────
const CAT_STYLE = {
  Exterior:   { bg:'#F0FAE8', color:'#3A6A20', dot:'#5BAA6A' },
  Interior:   { bg:'#F5EEFA', color:'#5A2070', dot:'#9B59C0' },
  Cultural:   { bg:'#EBF3FC', color:'#1A3A7A', dot:'#5B8ECC' },
  Gastro:     { bg:'#FFF0E8', color:'#7A3010', dot:'#E0723A' },
  Deportes:   { bg:'#E8FAF2', color:'#1A5A3A', dot:'#3AAA72' },
  Romántica:  { bg:'#FEECF0', color:'#7A1530', dot:'#FF6B8A' },
  Aventura:   { bg:'#F0FAE8', color:'#2A5A10', dot:'#5BAA6A' },
  'Muy bajo': { bg:'#EEF8EE', color:'#2A6A2A', dot:'#5BAA6A' },
  Bajo:       { bg:'#FEFBE8', color:'#6A5A10', dot:'#D4A520' },
  Medio:      { bg:'#FEF5D8', color:'#8A6A10', dot:'#E8A020' },
  Alto:       { bg:'#FEE8E8', color:'#8A2020', dot:'#FF6B8A' },
};
function DoodleTag({ label }) {
  const s = CAT_STYLE[label] || { bg:'#F0E8E0', color:'#7A5A55', dot:'#B09A90' };
  return (
    <span style={{ fontSize:10, fontFamily:"'Caveat',cursive", fontWeight:600, background:s.bg, color:s.color, borderRadius:20, padding:'2px 9px', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, display:'inline-block', flexShrink:0 }}/>
      {label}
    </span>
  );
}

const TAG_IMG_MAP = {
  'Especial':   '/images/Nuevo/favoritos.png',
  'Especiales': '/images/Nuevo/favoritos.png',
  'Recuerdo':   '/images/recuerdos.png',
  'Recuerdos':  '/images/recuerdos.png',
};
const TAG_IMG_STYLE = {
  'Especial':   { bg:'#FFF8E0', color:'#8A6010' },
  'Especiales': { bg:'#FFF8E0', color:'#8A6010' },
  'Recuerdo':   { bg:'#EEF3FF', color:'#3A5AA0' },
  'Recuerdos':  { bg:'#EEF3FF', color:'#3A5AA0' },
};
function SmartTag({ label }) {
  const imgSrc = TAG_IMG_MAP[label];
  const s = TAG_IMG_STYLE[label] || {};
  if (imgSrc) {
    return (
      <span style={{ fontSize:10, fontFamily:"'Caveat',cursive", fontWeight:700, background:s.bg||'#F5EEF8', color:s.color||'#6A40A0', borderRadius:20, padding:'2px 8px', display:'inline-flex', alignItems:'center', gap:3 }}>
        <img src={imgSrc} style={{ width:11, height:11, objectFit:'contain' }}/>
        {label}
      </span>
    );
  }
  return <DoodleTag label={label}/>;
}

const DECO_IMAGES = [
  '/images/planeta-amarillo.png',
  '/images/planeta-anillo.png',
  '/images/musica.png',
  '/images/tierra.png',
  '/images/asteroide.png',
  '/images/fotos.png',
  '/images/cohete.png',
];
function getDecoImage(id) {
  const hash = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DECO_IMAGES[hash % DECO_IMAGES.length];
}

const ALL_FILTERS = ['Todas', 'Exterior', 'Interior', 'Cultural', 'Gastro', 'Deportes', 'Romántica'];

// ── Confetti particle component ──────────────────────────────────────────────
function Confetti({ show }) {
  const PIECES = 60;
  const colors = ['#FF6B8A','#D4A520','#5BAA6A','#5B8ECC','#FFD0DC','#E8A020','#9B59C0'];
  if (!show) return null;
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, overflow:'hidden' }}>
      {Array.from({ length: PIECES }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const size = 6 + Math.random() * 8;
        const color = colors[i % colors.length];
        const rot = Math.random() * 360;
        return (
          <motion.div key={i}
            initial={{ y: -30, x: `${left}vw`, opacity: 1, rotate: rot, scale: 1 }}
            animate={{ y: '110vh', opacity: [1,1,0], rotate: rot + 360 * 3, scale: [1,1,0.5] }}
            transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
            style={{ position:'absolute', top:0, width: size, height: size, borderRadius: Math.random()>0.5 ? '50%' : 3, background: color }}
          />
        );
      })}
    </div>
  );
}

export default function DatesListPage({ navigateTo }) {
  const [dates, setDates] = useState([]);
  const [partnerIds, setPartnerIds] = useState(new Set());
  const [matchIds, setMatchIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [viewFilter, setViewFilter] = useState(null); // null | 'mis_citas' | 'pareja' | 'match' | 'terminadas'
  const [search, setSearch] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDateForm, setNewDateForm] = useState({ name: '', category: '', description: '', budget: '' });
  const [confirmSkipId, setConfirmSkipId] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null); // cita detail modal
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingCompleteId, setPendingCompleteId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ lugar: '', sentimiento: '', romantica: 0, divertida: 0, fecha: '', photos: [] });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const audioRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => { fetchDates(); }, []);

  const fetchDates = async () => {
    const token = localStorage.getItem('loversappToken');
    let swipedItems = [];
    let newMatchIds = new Set();
    let newPartnerIds = new Set();

    if (token) {
      try {
        const [swipes, matchRes] = await Promise.all([
          api.getCitaSwipes(),
          api.getSwipeMatches().catch(() => [])
        ]);
        const liked = swipes.filter(s => s.action === 'like');
        swipedItems = liked
          .map(s => ALL_CITAS_FLAT.find(c => c.id === s.cita_id))
          .filter(Boolean)
          .map((cita, idx) => ({
            id: cita.id,
            name: cita.title,
            description: cita.description || '',
            categories: cita.category ? [cita.category] : [],
            category: cita.category || '',
            budget: BUDGET_STR[cita.budget] || '',
            status: 'pending',
            priority: idx + 1,
            liked: true,
            fromSwipe: true,
          }));
        newMatchIds = new Set(matchRes);
        const partnerRes = await api.getPartnerSwipes().catch(() => []);
        newPartnerIds = new Set(partnerRes);
      } catch {}
    } else {
      const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
      swipedItems = favs.map((cita, idx) => ({
        id: cita.id,
        name: cita.title,
        description: cita.description || '',
        categories: cita.category ? [cita.category] : [],
        category: cita.category || '',
        budget: BUDGET_STR[cita.budget] || '',
        status: 'pending',
        priority: idx + 1,
        liked: true,
        fromSwipe: true,
      }));
    }

    const manualItems = JSON.parse(localStorage.getItem('manualDates') || '[]');
    // merge completed status and pins from localStorage
    const completedIds = JSON.parse(localStorage.getItem('completedCitas') || '[]');
    const pinnedIds = new Set(JSON.parse(localStorage.getItem('pinnedCitas') || '[]'));
    const mergedSwipe = swipedItems.map(d => ({
      ...d,
      status: completedIds.includes(d.id) ? 'completed' : 'pending',
      liked: pinnedIds.has(d.id),
    }));
    const mergedManual = manualItems.map(d => ({ ...d, liked: pinnedIds.has(d.id) || d.liked }));
    setDates([...mergedSwipe, ...mergedManual]);
    setMatchIds(newMatchIds);
    setPartnerIds(newPartnerIds);
  };

  const toggleLike = (id) => {
    const isCurrentlyLiked = dates.find(d => d.id === id)?.liked;
    setDates(prev => prev.map(d => d.id === id ? { ...d, liked: !d.liked } : d));
    const pinned = JSON.parse(localStorage.getItem('pinnedCitas') || '[]');
    if (!isCurrentlyLiked) {
      if (!pinned.includes(id)) localStorage.setItem('pinnedCitas', JSON.stringify([...pinned, id]));
    } else {
      localStorage.setItem('pinnedCitas', JSON.stringify(pinned.filter(p => p !== id)));
    }
    if (String(id).startsWith('m-')) {
      const manual = JSON.parse(localStorage.getItem('manualDates') || '[]');
      localStorage.setItem('manualDates', JSON.stringify(manual.map(d => d.id === id ? { ...d, liked: !isCurrentlyLiked } : d)));
    }
  };

  const openReviewModal = (id) => {
    setPendingCompleteId(id);
    setReviewForm({ lugar: '', sentimiento: '', romantica: 0, divertida: 0, fecha: new Date().toISOString().slice(0, 10), photos: [] });
    setIsEditingReview(false);
    setShowReviewModal(true);
  };

  const openEditReview = (id) => {
    const reviews = JSON.parse(localStorage.getItem('completedCitasReviews') || '{}');
    const existing = reviews[id] || {};
    setPendingCompleteId(id);
    setReviewForm({
      lugar: existing.lugar || '',
      sentimiento: existing.sentimiento || '',
      romantica: existing.romantica || 0,
      divertida: existing.divertida || 0,
      fecha: existing.fecha || new Date().toISOString().slice(0, 10),
      photos: existing.photos || [],
    });
    setIsEditingReview(true);
    setShowReviewModal(true);
  };

  const markComplete = (id, review = null, isEdit = false) => {
    if (!isEdit) {
      setDates(prev => prev.map(d => d.id === id ? { ...d, status: 'completed' } : d));
      // persist
      const prev = JSON.parse(localStorage.getItem('completedCitas') || '[]');
      if (!prev.includes(id)) localStorage.setItem('completedCitas', JSON.stringify([...prev, id]));
      // If it's a manual cita, persist completed status in manualDates
      if (String(id).startsWith('m-')) {
        const manuals = JSON.parse(localStorage.getItem('manualDates') || '[]');
        localStorage.setItem('manualDates', JSON.stringify(
          manuals.map(d => d.id === id ? { ...d, status: 'completed' } : d)
        ));
      }
    }
    // save review if provided
    if (review) {
      const reviews = JSON.parse(localStorage.getItem('completedCitasReviews') || '{}');
      reviews[id] = { ...review, date: new Date().toISOString() };
      localStorage.setItem('completedCitasReviews', JSON.stringify(reviews));
      // Save to calendar and timeline
      const allManuals = JSON.parse(localStorage.getItem('manualDates') || '[]');
      const citaName = dates.find(d => d.id === id)?.name
        || allManuals.find(d => d.id === id)?.name
        || ALL_CITAS_FLAT.find(c => c.id === id)?.title
        || 'Cita';
      const dateStr = review.fecha || new Date().toISOString().slice(0, 10);
      const photo = (review.photos || [])[0] || null;
      upsertCalendarEvent({ title: citaName, description: review.sentimiento || review.lugar || '', dateStr, photo, sourceType: 'cita-review', sourceId: String(id) });
      upsertTimelineEvent({ title: citaName, description: review.sentimiento || '', dateStr, image: photo || '', sourceType: 'cita-review', sourceId: String(id) });
    }
    if (!isEdit) {
      // celebration
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const play = (freq, start, dur) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'sine';
          g.gain.setValueAtTime(0.18, ctx.currentTime + start);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
          o.start(ctx.currentTime + start);
          o.stop(ctx.currentTime + start + dur + 0.05);
        };
        [[523,0],[659,0.15],[784,0.3],[1047,0.45],[784,0.65],[1047,0.82],[1047,1.0]].forEach(([f,t]) => play(f,t,0.25));
      } catch {}
      toast({ title: '🎉 ¡Cita completada!', description: '¡Felicidades! Una más para el contador.' });
    } else {
      toast({ title: '✅ Reseña actualizada', description: 'Los cambios se guardaron correctamente.' });
    }
  };

  const markPending = (id) => {
    setDates(prev => prev.map(d => d.id === id ? { ...d, status: 'pending' } : d));
    const prev2 = JSON.parse(localStorage.getItem('completedCitas') || '[]');
    localStorage.setItem('completedCitas', JSON.stringify(prev2.filter(x => x !== id)));
  };

  const reconsiderPartner = async (citaId) => {
    // Like on behalf of myself → now shows in my list
    const token = localStorage.getItem('loversappToken');
    if (token) {
      await api.swipeCita(citaId, 'like').catch(() => {});
      const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
      const cita = ALL_CITAS_FLAT.find(c => c.id === citaId);
      if (cita && !favs.some(f => f.id === citaId)) {
        localStorage.setItem('favoritesCitas', JSON.stringify([...favs, cita]));
      }
    }
    toast({ title: '✨ ¡Añadida a tu lista!', description: 'Ahora aparece en tus citas.' });
    fetchDates();
  };

  const skipDate = async (id) => {
    const target = dates.find(d => d.id === id);
    if (!target) return;
    setDates(prev => prev.filter(d => d.id !== id));
    if (target.fromSwipe) {
      const token = localStorage.getItem('loversappToken');
      if (token) api.swipeCita(id, 'dislike').catch(() => {});
      const favs = JSON.parse(localStorage.getItem('favoritesCitas') || '[]');
      localStorage.setItem('favoritesCitas', JSON.stringify(favs.filter(f => f.id !== id)));
    } else {
      const manual = JSON.parse(localStorage.getItem('manualDates') || '[]');
      localStorage.setItem('manualDates', JSON.stringify(manual.filter(d => d.id !== id)));
    }
  };

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
    setDraggedItem(null);
  };

  const addDate = () => {
    const name = newDateForm.name.trim();
    if (!name) return;
    const manual = JSON.parse(localStorage.getItem('manualDates') || '[]');
    const nd = {
      id: `m-${Date.now()}`,
      name,
      description: newDateForm.description.trim(),
      categories: newDateForm.category ? [newDateForm.category] : [],
      category: newDateForm.category || '',
      budget: newDateForm.budget || '',
      status: 'pending',
      priority: dates.length + 1,
      liked: false,
      custom: true,
    };
    localStorage.setItem('manualDates', JSON.stringify([...manual, nd]));
    setDates(prev => [...prev, nd]);
    setShowAddModal(false);
    setNewDateForm({ name: '', category: '', description: '', budget: '' });
    toast({ title: '✨ Cita añadida', description: `"${name}" agregada a la lista.` });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setReviewForm(prev => ({ ...prev, photos: [...prev.photos, ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const userRaw = localStorage.getItem('loversappUser');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const partnerName = user?.partner_name || user?.partner || 'Tu pareja';
  const couple = (user?.name && (user?.partner_name || user?.partner))
    ? `${user.name} & ${user.partner_name || user.partner}`.toUpperCase()
    : 'DANIELA & EDUARDO';

  const myDates   = dates.filter(d => d.fromSwipe || d.custom);
  const completed = dates.filter(d => d.status === 'completed').length;
  const total     = dates.length;
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Partner-only citas (partner liked but I haven't)
  const partnerOnlyCitas = [...partnerIds]
    .filter(id => !dates.some(d => d.id === id))
    .map(id => ALL_CITAS_FLAT.find(c => c.id === id))
    .filter(Boolean);

  const citaReviews = JSON.parse(localStorage.getItem('completedCitasReviews') || '{}');

  const getViewDates = () => {
    if (viewFilter === 'mis_citas') return myDates;
    if (viewFilter === 'match')     return dates.filter(d => matchIds.has(d.id));
    if (viewFilter === 'terminadas') return dates.filter(d => d.status === 'completed');
    return null; // use normal filtered list
  };

  const filtered = (() => {
    const base = dates.filter(d => {
      const cats = d.categories || (d.category ? [d.category] : []);
      const matchFilter = activeFilter === 'Todas' || cats.includes(activeFilter);
      const matchSearch = d.name?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
    return base;
  })();

  return (
    <div style={{ background:'#FFF5F7', minHeight:'100vh', display:'flex', flexDirection:'column', maxWidth:430, margin:'0 auto', fontFamily:"'Lora',Georgia,serif", position:'relative', overflow:'hidden' }}>
      <style>{`.caveat{font-family:'Caveat',cursive}.lora{font-family:'Lora',Georgia,serif}input:focus{outline:none}::-webkit-scrollbar{display:none}`}</style>
      <BgDoodles />

      {/* ── HEADER ── */}
      <div style={{ padding:'48px 20px 18px', background:'#FFF5F7', borderBottom:'1.5px solid #FFD0DC' }}>
        {/* Top row: back + breadcrumb + citas count */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => window.history.back()}
              style={{ width:32, height:32, borderRadius:'50%', background:'#fff', border:'1.5px solid #FFD0DC', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <ChevronLeft size={14} color="#FF6B8A" strokeWidth={2.5}/>
            </button>
            <span className="caveat" style={{ fontSize:12, color:'#C4AAB0', fontWeight:600 }}>Inicio &gt; Citas</span>
          </div>
          <span className="caveat" style={{ fontSize:13, color:'#FF6B8A', fontWeight:700 }}>{total} citas en total</span>
        </div>

        {/* Title + Nueva Cita */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 className="lora" style={{ fontSize:30, fontWeight:700, color:'#2D1B2E', margin:0, lineHeight:1.1, display:'flex', alignItems:'center', gap:8 }}>
              Mis Citas
              <span style={{ fontSize:22 }}>💕</span>
            </h1>
            <img src="/images/subrayado1.png" alt="" style={{ display:'block', width:'65%', maxWidth:210, margin:'4px 0 8px' }} />
            <p className="caveat" style={{ fontSize:14, color:'#9B8B95', margin:0 }}>Los planes más bonitos viven aquí ✨</p>
          </div>
          <motion.button whileTap={{ scale:0.95 }} onClick={() => setShowAddModal(true)}
            style={{ flexShrink:0, padding:'12px 18px', background:'#FF6B8A', color:'#fff', border:'2px solid #FF6B8A', borderRadius:16, fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:7, boxShadow:'3px 3px 0 rgba(196,68,100,0.28)', fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>
            <Plus size={16} color="#fff" strokeWidth={2.5}/>
            Nueva Cita
          </motion.button>
        </div>
      </div>

      {/* ── VIEW FILTER CHIPS ── */}
      <div style={{ padding:'12px 20px 0', display:'flex', gap:6, overflowX:'auto', scrollbarWidth:'none', position:'relative', zIndex:1 }}>
        {[
          { key: null,         img:'/images/tareas.png',           label: 'Todas',
            activeBg:'#FF6B8A',  activeColor:'#fff',     activeBorder:'#FF6B8A',
            inactiveBg:'#FFF5F7', inactiveColor:'#FF6B8A', inactiveBorder:'#FFD0DC' },
          { key: 'match',      img:'/images/metas.png',            label: `${matchIds.size} Match${matchIds.size!==1?'es':''}`,
            activeBg:'#FF6B8A',  activeColor:'#fff',     activeBorder:'#FF6B8A',
            inactiveBg:'#FFF0F4', inactiveColor:'#FF6B8A', inactiveBorder:'#F5D0DC' },
          { key: 'terminadas', img:'/images/trofeo.png',           label: `${completed} Hechas`,
            activeBg:'#5BAA6A',  activeColor:'#fff',     activeBorder:'#5BAA6A',
            inactiveBg:'#EEF8EE', inactiveColor:'#2A6A2A', inactiveBorder:'#A8D8A8' },
          { key: 'mis_citas',  img:'/images/calendario-morado.png', label: 'Mis citas',
            activeBg:'#9B7FD4',  activeColor:'#fff',     activeBorder:'#9B7FD4',
            inactiveBg:'#F5F0FF', inactiveColor:'#6B50B0', inactiveBorder:'#C8B0F0' },
          { key: 'pareja',     img:'/images/descubrir.png',        label: partnerName,
            activeBg:'#6B9FD4',  activeColor:'#fff',     activeBorder:'#6B9FD4',
            inactiveBg:'#EBF3FF', inactiveColor:'#1A3A7A', inactiveBorder:'#AACAEE' },
        ].map(chip => {
          const isActive = viewFilter === chip.key;
          return (
            <button key={String(chip.key)} onClick={() => setViewFilter(viewFilter === chip.key ? null : chip.key)}
              className="caveat"
              style={{ background: isActive ? chip.activeBg : chip.inactiveBg,
                color: isActive ? chip.activeColor : chip.inactiveColor,
                border: `2px solid ${isActive ? chip.activeBorder : chip.inactiveBorder}`,
                borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: isActive ? '2px 2px 0 rgba(0,0,0,0.10)' : 'none' }}>
              <img src={chip.img} alt="" style={{ width:18, height:18, objectFit:'contain', flexShrink:0 }} />
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ── PROGRESS BAR ── */}
      <Confetti show={showConfetti} />
      <div style={{ padding:'10px 20px 0', position:'relative', zIndex:1 }}>
        <div style={{ height:7, background:'#FFD0DC', borderRadius:99, overflow:'hidden' }}>
          <motion.div
            initial={{ width:0 }}
            animate={{ width:`${progress}%` }}
            transition={{ duration:0.9, ease:'easeOut' }}
            style={{ height:'100%', background:'linear-gradient(90deg,#FF6B8A,#FFB3C6)', borderRadius:99 }}
          />
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:3 }}>
          <span className="caveat" style={{ fontSize:11, color:'#C4AAB0' }}>{progress}% completado</span>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div style={{ padding:'10px 20px 4px', position:'relative', zIndex:1 }}>
        <div style={{ background:'#fff', border:'1.5px solid #FFD0DC', borderRadius:16, padding:'9px 14px', display:'flex', alignItems:'center', gap:8 }}>
          <Search size={14} color="#F5B8C8"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cita..."
            className="caveat" style={{ border:'none', background:'transparent', outline:'none', fontSize:14, fontWeight:600, color:'#1C0E10', flex:1 }}/>
        </div>
      </div>

      {/* ── FILTER CHIPS ── */}
      <div style={{ padding:'10px 20px 12px', display:'flex', gap:7, overflowX:'auto', scrollbarWidth:'none', position:'relative', zIndex:1 }}>
        {ALL_FILTERS.map(f => {
          const active = activeFilter === f;
          return (
            <button key={f} onClick={() => setActiveFilter(f)} className="caveat"
              style={{ background:active?'#FF6B8A':'#fff', color:active?'#fff':'#9B8B95',
                border:active?'2px solid #FF6B8A':'1.5px solid #FFD0DC',
                borderRadius:20, padding:'5px 16px', fontSize:13, fontWeight:active?700:600,
                cursor:'pointer', whiteSpace:'nowrap',
                boxShadow: active ? '2px 2px 0 rgba(255,107,138,0.25)' : 'none' }}>
              {f}
            </button>
          );
        })}
      </div>

      {/* ── CITA LIST ── */}
      <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:8, flex:1, overflowY:'auto', position:'relative', zIndex:1 }}>

        {/* ── TERMINADAS VIEW ── */}
        {viewFilter === 'terminadas' && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            style={{ background: 'linear-gradient(135deg,#2A7A4A,#5BAA6A)', borderRadius:24, padding:'28px 24px', marginBottom:16, textAlign:'center' }}>
            <div style={{ fontSize:80, fontWeight:900, color:'#fff', lineHeight:1, fontFamily:"'Caveat',cursive"
            }}>{completed}</div>
            <div className="caveat" style={{ fontSize:22, color:'#D4F0DD', fontWeight:700, marginTop:4 }}>citas completadas 🎉</div>
            <div style={{ marginTop:16, background:'rgba(255,255,255,0.15)', borderRadius:12, height:8, overflow:'hidden' }}>
              <motion.div initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:1, ease:'easeOut' }}
                style={{ height:'100%', background:'#fff', borderRadius:99 }}/>
            </div>
            <div className="caveat" style={{ fontSize:14, color:'#D4F0DD', marginTop:6 }}>{progress}% de {total} citas en tu lista</div>
          </motion.div>
        )}

        {/* ── PAREJA VIEW ── */}
        {viewFilter === 'pareja' && (
          <div style={{ marginBottom:8 }}>
            <div className="lora" style={{ fontSize:14, fontWeight:600, color:'#2D1B2E', marginBottom:10, paddingTop:8 }}>
              💕 Citas que le gustaron a {partnerName}
            </div>
            {partnerOnlyCitas.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#9A7A6A' }}>
                <div style={{ fontSize:36, marginBottom:8 }}>💭</div>
                <p className="caveat" style={{ fontSize:15 }}>Tu pareja aún no ha hecho swipes, o todas son match.</p>
              </div>
            ) : partnerOnlyCitas.map(cita => (
              <motion.div key={cita.id} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                style={{ background:'#FEF0F2', border:'1.5px solid #F0C4CC', borderLeft:'4px solid #5B8ECC',
                  borderRadius:18, padding:'12px 14px', marginBottom:8,
                  display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="lora" style={{ fontSize:13, fontWeight:600, color:'#1C0E10', marginBottom:4 }}>{cita.title}</div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {cita.category && <DoodleTag label={cita.category}/>}
                    {cita.budget && <DoodleTag label={BUDGET_STR[cita.budget] || cita.budget}/>}
                  </div>
                </div>
                <button onClick={() => reconsiderPartner(cita.id)}
                  style={{ flexShrink:0, padding:'6px 12px', borderRadius:20, border:'1.5px solid #5BAA6A',
                    background:'#EEF8EE', color:'#2A6A2A', cursor:'pointer',
                    fontFamily:"'Caveat',cursive", fontSize:12, fontWeight:700, whiteSpace:'nowrap',
                    display:'flex', alignItems:'center', gap:4 }}>
                  <RefreshCw size={11}/> Reconsiderar
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {dates.length === 0 && (
          <motion.div
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            style={{ margin:'32px 0', background:'#fff', border:'1.5px dashed #FFD0DC', borderRadius:20, padding:'32px 24px', textAlign:'center' }}
          >
            <div style={{ fontSize:44, marginBottom:12 }}>💌</div>
            <div className="lora" style={{ fontSize:17, fontWeight:600, color:'#2D1B2E', marginBottom:10 }}>
              Tu lista está vacía
            </div>
            <div className="caveat" style={{ fontSize:14, color:'#9A7A6A', lineHeight:1.6 }}>
              Esta lista se llenará una vez que llenes el test, agregues una cita por tu cuenta o tú y tu pareja consigan un match
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:20, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#FFF0F4', borderRadius:30, padding:'6px 14px' }}>
                <img src="/images/metas.png" alt="" style={{ width:18, height:18, objectFit:'contain' }} />
                <span className="caveat" style={{ fontSize:13, color:'#FF6B8A', fontWeight:700 }}>Match</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#F5F0FF', borderRadius:30, padding:'6px 14px' }}>
                <img src="/images/calendario-morado.png" alt="" style={{ width:18, height:18, objectFit:'contain' }} />
                <span className="caveat" style={{ fontSize:13, color:'#6B50B0', fontWeight:700 }}>Me gustaron a mí</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#EBF3FF', borderRadius:30, padding:'6px 14px' }}>
                <img src="/images/descubrir.png" alt="" style={{ width:18, height:18, objectFit:'contain' }} />
                <span className="caveat" style={{ fontSize:13, color:'#5B8ECC', fontWeight:700 }}>Le gustaron a mi pareja</span>
              </div>
            </div>
          </motion.div>
        )}

        {filtered.length === 0 && dates.length > 0 && viewFilter === null && (
          <div style={{ textAlign:'center', padding:'48px 0' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
            <p className="lora" style={{ color:'#9A7A6A' }}>No encontramos citas</p>
          </div>
        )}

        {/* ── NORMAL / FILTERED LIST (hidden in pareja view) ── */}
        {viewFilter !== 'pareja' && (
          [...(getViewDates() || filtered)].sort((a,b) => (b.liked?1:0) - (a.liked?1:0)).map((date, i) => {
            const isFav = !!date.liked;
            const isCompleted = date.status === 'completed';
            const cats = date.categories || (date.category ? [date.category] : []);
            const num = String(date.priority ?? i + 1).padStart(2, '0');
            const globalIndex = dates.indexOf(date);
            const location = citaReviews[date.id]?.lugar || date.location || '';
            const citaData = ALL_CITAS_FLAT.find(c => c.id === date.id)
              || (date.custom ? { id: date.id, title: date.name, description: date.description, category: date.category, budget: date.budget } : null);
            return (
              <motion.div key={date.id}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.03 }}
                draggable
                onDragStart={e => handleDragStart(e, globalIndex)}
                onDragOver={e => handleDragOver(e, globalIndex)}
                onDragEnd={handleDragEnd}
                onClick={() => { if (citaData) setSelectedCita({ ...citaData, status: date.status, fromSwipe: date.fromSwipe }); }}
                style={{ position:'relative', overflow:'hidden',
                  background: isCompleted ? '#F4FBF6' : '#fff',
                  border:'1.5px solid #FFD0DC',
                  borderLeft: isCompleted ? '3.5px solid #5BAA6A' : isFav ? '3.5px solid #FF6B8A' : '3.5px solid #FFD0DC',
                  borderRadius:18, padding:'14px 14px 14px 14px',
                  display:'flex', alignItems:'center', gap:12, cursor:'pointer',
                  opacity: draggedItem === globalIndex ? 0.45 : 1 }}>

                {/* IMAGEN DE FONDO esquina derecha */}
                <img src={getDecoImage(date.id)} alt="" style={{
                  position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)',
                  width:100, height:100, objectFit:'contain', opacity:0.13, pointerEvents:'none',
                  userSelect:'none'
                }}/>

                {/* LEFT: citas icon */}
                <div style={{ flexShrink:0, width:54, height:54, borderRadius:14,
                  background: isCompleted ? '#D4F0DD' : isFav ? '#FEE8EC' : '#FFF0F4',
                  border:'1.5px solid', borderColor: isCompleted ? '#A8D8A8' : '#FFD0DC',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src="/images/citas.png" style={{ width:34, height:34, objectFit:'contain' }}/>
                </div>

                {/* MIDDLE: title + location + tags */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="lora" style={{ fontSize:17, fontWeight:700, color:'#2D1B2E', marginBottom: location ? 5 : 7, lineHeight:1.25 }}>{date.name}</div>
                  {location ? (
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:7 }}>
                      <img src="/images/Nuevo/plan.png" style={{ width:14, height:14, objectFit:'contain', flexShrink:0 }}/>
                      <span className="caveat" style={{ fontSize:15, color:'#9B8B95' }}>{location}</span>
                    </div>
                  ) : null}
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
                    {isCompleted
                      ? <span className="caveat" style={{ fontSize:13, fontWeight:700, background:'#D4F0DD', color:'#2A6A2A', borderRadius:20, padding:'3px 10px', display:'inline-flex', alignItems:'center', gap:4 }}><img src="/images/trofeo.png" style={{ width:13, height:13, objectFit:'contain', flexShrink:0 }}/> Completada</span>
                      : <span className="caveat" style={{ fontSize:13, fontWeight:700, background:'#FFF0F4', color:'#FF6B8A', borderRadius:20, padding:'3px 10px' }}>Pendiente</span>
                    }
                    {!isCompleted && i === 0 && <span className="caveat" style={{ fontSize:13, fontWeight:700, background:'#FFF8E0', color:'#8A6010', borderRadius:20, padding:'3px 10px' }}>#{num} Prioridad</span>}
                    {cats.map(c => <SmartTag key={c} label={c}/>)}
                    {date.budget && <DoodleTag label={date.budget}/>}
                    {isFav && <span className="caveat" style={{ fontSize:13, fontWeight:700, background:'#FFF0F4', color:'#FF6B8A', borderRadius:20, padding:'3px 10px', display:'inline-flex', alignItems:'center', gap:4 }}><img src="/images/corazon.png" style={{ width:13, height:13, objectFit:'contain' }}/> Favorita</span>}
                    {matchIds.has(date.id) && <span className="caveat" style={{ fontSize:13, fontWeight:700, background:'#FFF0F4', color:'#FF6B8A', borderRadius:20, padding:'3px 10px' }}>❤️ Match</span>}
                  </div>
                </div>

                {/* RIGHT: botones de acción en horizontal */}
                <div style={{ flexShrink:0, display:'flex', flexDirection:'row', alignItems:'center', gap:2, zIndex:1 }}
                  onClick={e => e.stopPropagation()}>
                  <button onClick={() => toggleLike(date.id)}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:6 }}>
                    <Heart size={22} color="#FF6B8A" fill={isFav?'#FF6B8A':'none'} strokeWidth={1.5}/>
                  </button>
                  {isCompleted ? (
                    <button onClick={() => markPending(date.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:6 }}>
                      <CheckCircle size={22} color="#5BAA6A" fill="#D4F0DD"/>
                    </button>
                  ) : (
                    <>
                      <button onClick={() => openReviewModal(date.id)}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:6 }}>
                        <CheckCircle size={22} color="#C8B8A8" fill="none"/>
                      </button>
                      <button onClick={() => setConfirmSkipId(date.id)}
                        style={{ background:'none', border:'none', cursor:'pointer', padding:6, opacity:0.5 }}>
                        <span style={{ fontSize:18, color:'#9A7A6A' }}>✕</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {filtered.length < dates.length && (
          <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
            <span className="caveat" style={{ fontSize:13, color:'#FF6B8A' }}>
              · · · {dates.length - filtered.length} citas más · · ·
            </span>
          </div>
        )}
        <div style={{ height:80 }}/>
      </div>

      {/* ── CITA DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedCita && (() => {
          const cita = selectedCita;
          const budgetLabel = BUDGET_STR[cita.budget] || cita.budget || '';
          const budgetColors = { 'Muy bajo':'#3A7A3A', 'Bajo':'#6A6A10', 'Medio':'#8A6A10', 'Alto':'#8A2020', 'Muy alto':'#6A1040' };
          const priceRanges = { 1:'Gratis ~ $100 MXN', 2:'$100 – $400 MXN', 3:'$400 – $1,200 MXN', 4:'$1,200 – $3,000 MXN', 5:'> $3,000 MXN' };
          const isCompleted = cita.status === 'completed';
          return (
            <motion.div key="detail-overlay"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200,
                display:'flex', alignItems:'flex-end', justifyContent:'center' }}
              onClick={() => setSelectedCita(null)}>
              <motion.div
                initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
                transition={{ type:'spring', damping:28, stiffness:300 }}
                onClick={e => e.stopPropagation()}
                style={{ background:'#FFF5F7', borderRadius:'24px 24px 0 0', padding:'28px 24px 48px',
                  width:'100%', maxWidth:430, maxHeight:'85vh', overflowY:'auto' }}>
                {/* Handle */}
                <div style={{ width:40, height:4, background:'#FFD0DC', borderRadius:99, margin:'0 auto 20px' }}/>
                {/* Title */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, gap:12 }}>
                  <div className="lora" style={{ fontSize:20, fontWeight:700, color:'#1C0E10', lineHeight:1.3, flex:1 }}>
                    {cita.title}
                  </div>
                  <button onClick={() => setSelectedCita(null)}
                    style={{ background:'#FFF0F4', border:'1.5px solid #FFD0DC', borderRadius:'50%', width:34, height:34,
                      display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    <X size={16} color="#9A7A6A"/>
                  </button>
                </div>
                {/* Tags */}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
                  {cita.category && <DoodleTag label={cita.category}/>}
                  {budgetLabel && <DoodleTag label={budgetLabel}/>}
                  {matchIds.has(cita.id) && (
                    <span className="caveat" style={{ fontSize:11, fontWeight:700, background:'#FEF0F2', color:'#C44455', borderRadius:20, padding:'3px 10px' }}>❤️ Match</span>
                  )}
                  {isCompleted && (
                    <span className="caveat" style={{ fontSize:11, fontWeight:700, background:'#EEF8EE', color:'#2A7A4A', borderRadius:20, padding:'3px 10px' }}>✅ Completada</span>
                  )}
                </div>
                {/* Description / venue */}
                {cita.description && (
                  <div style={{ background:'#fff', border:'1.5px solid #FFD0DC', borderLeft:'4px solid #FF6B8A',
                    borderRadius:16, padding:'14px 16px', marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                      <MapPin size={14} color="#FF6B8A"/>
                      <span className="caveat" style={{ fontSize:13, fontWeight:700, color:'#FF6B8A' }}>Lugar recomendado</span>
                    </div>
                    <p className="caveat" style={{ fontSize:14, color:'#1C0E10', lineHeight:1.6, margin:0 }}>
                      {cita.description}
                    </p>
                  </div>
                )}
                {/* Cost */}
                {cita.budget && (
                  <div style={{ background:'#fff', border:'1.5px solid #FFD0DC', borderLeft:`4px solid ${budgetColors[budgetLabel] || '#D4A520'}`,
                    borderRadius:16, padding:'14px 16px', marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
                      <DollarSign size={14} color={budgetColors[budgetLabel] || '#D4A520'}/>
                      <span className="caveat" style={{ fontSize:13, fontWeight:700, color: budgetColors[budgetLabel] || '#D4A520' }}>Costo estimado</span>
                    </div>
                    <div className="caveat" style={{ fontSize:16, fontWeight:700, color:'#1C0E10' }}>{budgetLabel}</div>
                    <div className="caveat" style={{ fontSize:13, color:'#9A7A6A', marginTop:2 }}>{priceRanges[cita.budget] || ''}</div>
                  </div>
                )}
                {/* Action buttons */}
                <div style={{ display:'flex', gap:10, marginTop:8, flexWrap:'wrap' }}>
                  {!isCompleted && cita.fromSwipe !== false && (
                    <button onClick={() => { openReviewModal(cita.id); setSelectedCita(null); }}
                      style={{ flex:1, padding:'13px', borderRadius:16, background:'#5BAA6A', border:'none', cursor:'pointer' }}>
                      <span className="caveat" style={{ fontSize:16, fontWeight:700, color:'#fff' }}>✅ Marcar completada</span>
                    </button>
                  )}
                  {isCompleted && (
                    <>
                      <button onClick={() => { openEditReview(cita.id); setSelectedCita(null); }}
                        style={{ flex:1, padding:'13px', borderRadius:16, background:'#5B8ECC', border:'none', cursor:'pointer' }}>
                        <span className="caveat" style={{ fontSize:16, fontWeight:700, color:'#fff' }}>✏️ Editar reseña</span>
                      </button>
                      <button onClick={() => { markPending(cita.id); setSelectedCita(null); }}
                        style={{ flex:1, padding:'13px', borderRadius:16, background:'#EDE0D0', border:'none', cursor:'pointer' }}>
                        <span className="caveat" style={{ fontSize:16, fontWeight:700, color:'#7A5A55' }}>↩ Pendiente</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelectedCita(null)}
                    style={{ padding:'13px 20px', borderRadius:16, background:'#FFF0F4', border:'1.5px solid #FFD0DC', cursor:'pointer' }}>
                    <span className="caveat" style={{ fontSize:16, fontWeight:700, color:'#FF6B8A' }}>Cerrar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── CONFIRM SKIP MODAL ── */}
      {confirmSkipId !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 30px' }}>
          <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} style={{ background:'#FFF5F7', borderRadius:24, padding:'28px 24px', width:'100%', maxWidth:360, textAlign:'center', border:'1.5px solid #FFD0DC' }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🗑️</div>
            <div className="lora" style={{ fontSize:17, fontWeight:600, color:'#2D1B2E', marginBottom:8 }}>¿Quitar esta cita?</div>
            <div className="caveat" style={{ fontSize:14, color:'#9A7A6A', marginBottom:20 }}>Se ocultará de tu lista. No se eliminará permanentemente.</div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmSkipId(null)} style={{ flex:1, padding:'12px', borderRadius:14, background:'#FFD0DC', border:'none', cursor:'pointer' }}>
                <span className="caveat" style={{ fontSize:15, fontWeight:700, color:'#2D1B2E' }}>Cancelar</span>
              </button>
              <button onClick={() => { skipDate(confirmSkipId); setConfirmSkipId(null); }} style={{ flex:1, padding:'12px', borderRadius:14, background:'#C44455', border:'none', cursor:'pointer' }}>
                <span className="caveat" style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Quitar</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div key="review-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:300,
              display:'flex', alignItems:'flex-end', justifyContent:'center' }}
            onClick={() => { setIsEditingReview(false); setShowReviewModal(false); }}>
            <motion.div
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:28, stiffness:300 }}
              onClick={e => e.stopPropagation()}
              style={{ background:'#FFF5F7', borderRadius:'24px 24px 0 0', padding:'24px 24px 48px',
                width:'100%', maxWidth:430, maxHeight:'90vh', overflowY:'auto' }}>
              {/* Handle */}
              <div style={{ width:40, height:4, background:'#FFD0DC', borderRadius:99, margin:'0 auto 18px' }}/>
              {/* Header */}
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ fontSize:36, marginBottom:6 }}>✍️</div>
                <div className="lora" style={{ fontSize:19, fontWeight:700, color:'#1C0E10' }}>{isEditingReview ? 'Editar reseña' : 'Reseña de la cita'}</div>
                <div className="caveat" style={{ fontSize:13, color:'#9A7A6A', marginTop:4 }}>{isEditingReview ? 'Actualiza los detalles de esta cita 💕' : 'Cuéntanos cómo les fue para completar la cita 💕'}</div>
              </div>
              {/* Fecha de la cita */}
              <div style={{ marginBottom:16 }}>
                <div className="caveat" style={{ fontSize:13, fontWeight:700, color:'#7A5A55', marginBottom:6 }}>📅 ¿Cuándo fue la cita?</div>
                <input
                  type="date"
                  value={reviewForm.fecha}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setReviewForm(p => ({ ...p, fecha: e.target.value }))}
                  className="caveat"
                  style={{ width:'100%', padding:'10px 14px', borderRadius:14, border:'1.5px solid #FFD0DC', background:'#fff', fontSize:14, color:'#1C0E10', outline:'none', boxSizing:'border-box' }}/>
              </div>
              {/* Campo lugar */}
              <div style={{ marginBottom:16 }}>
                <div className="caveat" style={{ fontSize:13, fontWeight:700, color:'#7A5A55', marginBottom:6 }}>📍 ¿Cómo estuvo el lugar? <span style={{ fontWeight:400, color:'#B0A090' }}>(opcional)</span></div>
                <textarea
                  value={reviewForm.lugar}
                  onChange={e => setReviewForm(p => ({ ...p, lugar: e.target.value }))}
                  placeholder="El lugar era precioso, la música perfecta..."
                  rows={2}
                  className="caveat"
                  style={{ width:'100%', padding:'10px 14px', borderRadius:14, border:'1.5px solid #FFD0DC',
                    background:'#fff', fontSize:14, color:'#1C0E10', outline:'none',
                    boxSizing:'border-box', resize:'none', fontFamily:"'Caveat',cursive" }}/>
              </div>
              {/* Campo sentimiento */}
              <div style={{ marginBottom:20 }}>
                <div className="caveat" style={{ fontSize:13, fontWeight:700, color:'#7A5A55', marginBottom:6 }}>💭 ¿Cómo te sentiste con tu pareja?</div>
                <textarea
                  value={reviewForm.sentimiento}
                  onChange={e => setReviewForm(p => ({ ...p, sentimiento: e.target.value }))}
                  placeholder="Me sentí muy conectad@ y feliz..."
                  rows={2}
                  className="caveat"
                  style={{ width:'100%', padding:'10px 14px', borderRadius:14, border:'1.5px solid #FFD0DC',
                    background:'#fff', fontSize:14, color:'#1C0E10', outline:'none',
                    boxSizing:'border-box', resize:'none', fontFamily:"'Caveat',cursive" }}/>
              </div>
              {/* Fotos */}
              <div style={{ marginBottom:20 }}>
                <div className="caveat" style={{ fontSize:13, fontWeight:700, color:'#7A5A55', marginBottom:6 }}>📸 Fotos del momento <span style={{ fontWeight:400, color:'#B0A090' }}>(opcional)</span></div>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', background:'#fff', border:'2px dashed #FFD0DC', borderRadius:14, padding:'10px 14px' }}>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display:'none' }}/>
                  <Camera size={16} color="#9A7A6A"/>
                  <span className="caveat" style={{ fontSize:14, color:'#9A7A6A' }}>Subir fotos</span>
                </label>
                {reviewForm.photos.length > 0 && (
                  <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                    {reviewForm.photos.map((p, idx) => (
                      <div key={idx} style={{ position:'relative', width:64, height:64, flexShrink:0 }}>
                        <img src={p} alt="" style={{ width:64, height:64, objectFit:'cover', borderRadius:10, border:'1.5px solid #EDE0D0' }}/>
                        <button onClick={() => setReviewForm(prev => ({ ...prev, photos: prev.photos.filter((_, j) => j !== idx) }))}
                          style={{ position:'absolute', top:-6, right:-6, background:'#C44455', border:'none', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0 }}>
                          <X size={10} color="#fff"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Valoración romántica */}
              <div style={{ marginBottom:20 }}>
                <div className="caveat" style={{ fontSize:13, fontWeight:700, color:'#C44455', marginBottom:10 }}>❤️ Valoración romántica</div>
                <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewForm(p => ({ ...p, romantica: n }))}
                      style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, lineHeight:1,
                        opacity: reviewForm.romantica >= n ? 1 : 0.25,
                        transform: reviewForm.romantica >= n ? 'scale(1.15)' : 'scale(1)',
                        transition:'all 0.15s' }}>
                      ❤️
                    </button>
                  ))}
                </div>
                <div className="caveat" style={{ textAlign:'center', fontSize:12, color:'#9A7A6A', marginTop:6 }}>
                  {reviewForm.romantica === 0 ? 'Toca para valorar' :
                    reviewForm.romantica === 1 ? 'Poca chispa' :
                    reviewForm.romantica === 2 ? 'Estuvo bien' :
                    reviewForm.romantica === 3 ? 'Muy romántica' :
                    reviewForm.romantica === 4 ? '¡Súper romántica!' :
                    '¡Perfecta! 🌹'}
                </div>
              </div>
              {/* Valoración divertida */}
              <div style={{ marginBottom:24 }}>
                <div className="caveat" style={{ fontSize:13, fontWeight:700, color:'#D4A520', marginBottom:10 }}>🎉 Valoración divertida</div>
                <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setReviewForm(p => ({ ...p, divertida: n }))}
                      style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, lineHeight:1,
                        opacity: reviewForm.divertida >= n ? 1 : 0.25,
                        transform: reviewForm.divertida >= n ? 'scale(1.15)' : 'scale(1)',
                        transition:'all 0.15s' }}>
                      🎉
                    </button>
                  ))}
                </div>
                <div className="caveat" style={{ textAlign:'center', fontSize:12, color:'#9A7A6A', marginTop:6 }}>
                  {reviewForm.divertida === 0 ? 'Toca para valorar' :
                    reviewForm.divertida === 1 ? 'Más o menos' :
                    reviewForm.divertida === 2 ? 'Estuvo padre' :
                    reviewForm.divertida === 3 ? '¡Muy divertida!' :
                    reviewForm.divertida === 4 ? '¡Buenísima!' :
                    '¡La mejor cita ever! 🏆'}
                </div>
              </div>
              {/* Botones */}
              {(() => {
                const canSave = !!(reviewForm.sentimiento.trim() || reviewForm.lugar.trim() || reviewForm.romantica > 0 || reviewForm.divertida > 0);
                return (
                  <div>
                    {!canSave && (
                      <div className="caveat" style={{ textAlign:'center', fontSize:13, color:'#C44455', marginBottom:10 }}>
                        Llena al menos un campo para completar la cita
                      </div>
                    )}
                    <div style={{ display:'flex', gap:10 }}>
                      <button onClick={() => { setIsEditingReview(false); setShowReviewModal(false); }}
                        style={{ flex:'0 0 auto', padding:'13px 20px', borderRadius:16, background:'#FFF0F4', border:'1.5px solid #FFD0DC', cursor:'pointer' }}>
                        <span className="caveat" style={{ fontSize:15, fontWeight:700, color:'#FF6B8A' }}>Cancelar</span>
                      </button>
                      <button
                        onClick={() => { if (canSave) { markComplete(pendingCompleteId, reviewForm, isEditingReview); setIsEditingReview(false); setShowReviewModal(false); } }}
                        disabled={!canSave}
                        style={{ flex:1, padding:'13px', borderRadius:16, background: canSave ? '#5BAA6A' : '#C8B8A8', border:'none', cursor: canSave ? 'pointer' : 'default',
                          boxShadow: canSave ? '0 4px 14px rgba(91,170,106,0.35)' : 'none' }}>
                        <span className="caveat" style={{ fontSize:16, fontWeight:700, color:'#fff' }}>💾 Guardar y completar</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADD DATE MODAL ── */}
      {showAddModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 30px' }}>
          <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} style={{ background:'#FFF5F7', borderRadius:24, padding:'28px 24px', width:'100%', maxWidth:380, border:'1.5px solid #FFD0DC' }}>
            <div className="lora" style={{ fontSize:18, fontWeight:600, color:'#2D1B2E', marginBottom:4, textAlign:'center' }}>✨ Nueva Cita</div>
            <div className="caveat" style={{ fontSize:13, color:'#9A7A6A', textAlign:'center', marginBottom:18 }}>Escribe los datos de tu nueva cita</div>
            <div style={{ marginBottom:12 }}>
              <div className="caveat" style={{ fontSize:13, color:'#9A7A6A', marginBottom:6 }}>Nombre de la cita *</div>
              <input
                value={newDateForm.name}
                onChange={e => setNewDateForm(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addDate()}
                placeholder="Ej: Cena romántica..."
                className="caveat"
                style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1.5px solid #FFD0DC', background:'#fff', fontSize:14, color:'#1C0E10', outline:'none', boxSizing:'border-box' }}/>
            </div>
            <div style={{ marginBottom:12 }}>
              <div className="caveat" style={{ fontSize:13, color:'#9A7A6A', marginBottom:6 }}>Descripción (opcional)</div>
              <textarea
                value={newDateForm.description}
                onChange={e => setNewDateForm(p => ({ ...p, description: e.target.value }))}
                placeholder="¿En qué consiste esta cita?..."
                className="caveat"
                rows={2}
                style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1.5px solid #FFD0DC', background:'#fff', fontSize:13, color:'#1C0E10', outline:'none', boxSizing:'border-box', resize:'none', fontFamily:"'Caveat',cursive" }}/>
            </div>
            <div style={{ marginBottom:12 }}>
              <div className="caveat" style={{ fontSize:13, color:'#9A7A6A', marginBottom:6 }}>Categoría</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['Exterior','Interior','Cultural','Gastro','Deportes','Romántica'].map(cat => (
                  <button key={cat} onClick={() => setNewDateForm(p => ({ ...p, category: p.category === cat ? '' : cat }))}
                    className="caveat"
                    style={{ background: newDateForm.category === cat ? '#FF6B8A' : '#fff', color: newDateForm.category === cat ? '#fff' : '#9B8B95', border: newDateForm.category === cat ? '1.5px solid #FF6B8A' : '1.5px solid #FFD0DC', borderRadius:20, padding:'5px 14px', fontSize:13, cursor:'pointer' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div className="caveat" style={{ fontSize:13, color:'#9A7A6A', marginBottom:6 }}>Presupuesto</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['Muy bajo','Bajo','Medio','Alto'].map(b => (
                  <button key={b} onClick={() => setNewDateForm(p => ({ ...p, budget: p.budget === b ? '' : b }))}
                    className="caveat"
                    style={{ background: newDateForm.budget === b ? '#FF6B8A' : '#fff', color: newDateForm.budget === b ? '#fff' : '#9B8B95', border: newDateForm.budget === b ? '1.5px solid #FF6B8A' : '1.5px solid #FFD0DC', borderRadius:20, padding:'5px 14px', fontSize:13, cursor:'pointer' }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => { setShowAddModal(false); setNewDateForm({ name:'', category:'', description:'', budget:'' }); }} style={{ flex:1, padding:'12px', borderRadius:14, background:'#FFF0F4', border:'1.5px solid #FFD0DC', cursor:'pointer' }}>
                <span className="caveat" style={{ fontSize:15, fontWeight:700, color:'#FF6B8A' }}>Cancelar</span>
              </button>
              <button onClick={addDate} style={{ flex:1, padding:'12px', borderRadius:14, background: newDateForm.name.trim() ? '#FF6B8A' : '#FFD0DC', border:'none', cursor: newDateForm.name.trim() ? 'pointer' : 'default' }}>
                <span className="caveat" style={{ fontSize:15, fontWeight:700, color: newDateForm.name.trim() ? '#fff' : '#C4AAB0' }}>Añadir</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}