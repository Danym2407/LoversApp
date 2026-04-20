import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { api } from '@/lib/api';
import { Toaster } from '@/components/ui/toaster';
import { initializeDates } from '@/data/dates';
import BottomNav from '@/components/BottomNav';

// ── Lazy-loaded pages (code-split per route) ──────────────────────────────
const LoginPage            = lazy(() => import('@/pages/LoginPage'));
const HomePage             = lazy(() => import('@/pages/HomePage'));
const DatesListPage        = lazy(() => import('@/pages/DatesListPage'));
const DateDetailPage       = lazy(() => import('@/pages/DateDetailPage'));
const StatsPage            = lazy(() => import('@/pages/StatsPage'));
const RoulettePage         = lazy(() => import('@/pages/RoulettePage'));
const DashboardPage        = lazy(() => import('@/pages/DashboardPage'));
const ProfilePage          = lazy(() => import('@/pages/ProfilePage'));
const CalendarPage         = lazy(() => import('@/pages/CalendarPage'));
const GamesPage            = lazy(() => import('@/pages/GamesPage'));
const ChallengesPage       = lazy(() => import('@/pages/ChallengesPage'));
const LettersPage          = lazy(() => import('@/pages/LettersPage'));
const TimelinePage         = lazy(() => import('@/pages/TimelinePage'));
const MomentsPage          = lazy(() => import('@/pages/MomentsPage'));
const ImportantDatesPage   = lazy(() => import('@/pages/ImportantDatesPage'));
const CountdownPage        = lazy(() => import('@/pages/CountdownPage'));
const PersonalityTestPage  = lazy(() => import('@/pages/PersonalityTestPage'));
const PersonalityProfilePage = lazy(() => import('@/pages/PersonalityProfilePage'));
const CitasAleatoriasPage  = lazy(() => import('@/pages/CitasAleatoriasPage'));
const CitasPersonalizadasPage = lazy(() => import('@/pages/CitasPersonalizadasPage'));
const SettingsPage         = lazy(() => import('@/pages/SettingsPage'));
const HelpPage             = lazy(() => import('@/pages/HelpPage'));
const PrivacyPolicyPage    = lazy(() => import('@/pages/PrivacyPolicyPage'));
const AdminPage            = lazy(() => import('@/pages/AdminPage'));
const ResetPasswordPage    = lazy(() => import('@/pages/ResetPasswordPage'));

function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FAFAFA', zIndex: 10,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          border: '3px solid #FFD0DC',
          borderTopColor: '#C44455',
          animation: 'spin 0.75s linear infinite',
        }} />
        <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 14, color: '#9A8A8A', letterSpacing: '0.03em' }}>
          Cargando...
        </span>
      </div>
    </div>
  );
}

const NO_NAV_PAGES = new Set(['personality-test', 'personality-profile', 'admin']);

const VALID_PAGES = new Set(['dashboard','profile','home','dates','detail','stats','roulette',
  'calendar','games','challenges','letters','timeline','moments',
  'important-dates','countdown','personality-test','personality-profile',
  'citas-aleatorias','citas-personalizadas','settings','help','privacy']);

// SEO Metadata per page
const PAGE_METADATA = {
  'dashboard': {
    title: 'Dashboard - LoversApp',
    description: 'Tu panel de control personal. Gestiona tus citas, momentos, retos y todo sobre tu relación en un solo lugar.',
  },
  'profile': {
    title: 'Mi Perfil - LoversApp',
    description: 'Tu perfil personal y datos de tu pareja. Gestiona tu información en LoversApp.',
  },
  'home': {
    title: 'Citas Románticas - LoversApp',
    description: 'Descubre 100 citas románticas especialmente diseñadas para parejas enamoradas.',
  },
  'dates': {
    title: 'Citas Románticas - LoversApp',
    description: 'Descubre 100 citas románticas especialmente diseñadas para parejas enamoradas.',
  },
  'calendar': {
    title: 'Calendario Compartido - LoversApp',
    description: 'Sincroniza tu calendario con tu pareja. Planifica fechas especiales juntos.',
  },
  'games': {
    title: 'Juegos para Parejas - LoversApp',
    description: 'Juegos divertidos para fortalecer tu relación y pasar momentos inolvidables.',
  },
  'challenges': {
    title: 'Retos Diarios para Parejas - LoversApp',
    description: 'Retos diarios diseñados para parejas. Fortalece tu relación con actividades divertidas.',
  },
  'letters': {
    title: 'Cartas Digitales - LoversApp',
    description: 'Escribe y comparte cartas digitales con tu pareja. Expresa tus sentimientos de forma romántica.',
  },
  'timeline': {
    title: 'Línea de Tiempo - LoversApp',
    description: 'Tu historia de amor en una línea del tiempo interactiva. Revive cada momento especial.',
  },
  'moments': {
    title: 'Momentos Especiales - LoversApp',
    description: 'Guarda y revive los momentos más especiales de tu relación con fotos y detalles.',
  },
  'important-dates': {
    title: 'Fechas Importantes - LoversApp',
    description: 'No olvides las fechas importantes de tu relación. Recuerda aniversarios y momentos clave.',
  },
  'countdown': {
    title: 'Cuentas Regresivas - LoversApp',
    description: 'Crea cuentas regresivas para eventos especiales y citas futuras con tu pareja.',
  },
  'stats': {
    title: 'Estadísticas de Tu Relación - LoversApp',
    description: 'Visualiza tus estadísticas y datos sobre citas, momentos y actividades compartidas.',
  },
  'roulette': {
    title: 'Ruleta de Citas - LoversApp',
    description: 'Deja que la ruleta elija una cita romántica aleatoria para ustedes.',
  },
  'personality-test': {
    title: 'Test de Personalidad para Parejas - LoversApp',
    description: 'Descubre tu tipo de personalidad en la relación con nuestro test especial.',
  },
  'citas-aleatorias': {
    title: 'Citas Aleatorias - LoversApp',
    description: 'Obtén citas románticas aleatorias y sorprende a tu pareja cada día.',
  },
  'citas-personalizadas': {
    title: 'Citas Personalizadas - LoversApp',
    description: 'Citas adaptadas a tus gustos y preferencias como pareja.',
  },
  'settings': {
    title: 'Configuración - LoversApp',
    description: 'Personaliza tu experiencia en LoversApp. Ajusta preferencias y opciones.',
  },
  'help': {
    title: 'Ayuda - LoversApp',
    description: 'Centro de ayuda y preguntas frecuentes de LoversApp.',
  },
  'privacy': {
    title: 'Política de Privacidad - LoversApp',
    description: 'Lee nuestra política de privacidad y cómo protegemos tus datos.',
  },
};

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '') || '';
    if (path === 'admin') return 'admin';
    if (path.startsWith('reset-password')) return 'reset-password';
    return VALID_PAGES.has(path) ? path : 'dashboard';
  });
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [backTo, setBackTo] = useState('dates');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState('login');
  // Centralized user state — single source of truth for the authenticated user
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('loversappUser');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    initializeDates();
    const token = localStorage.getItem('loversappToken');
    const userRaw  = localStorage.getItem('loversappUser');
    setIsAuthenticated(!!(token && userRaw));

    // Load fresh user profile from API — single source of truth
    if (token) {
      console.log('[App] Token encontrado. Cargando /api/users/me...');
      api.getMe()
        .then(me => {
          console.log('[App] /api/users/me ✓ | usuario:', me.name, '| vinculado con pareja:', me.coupled_user_id ? 'SÍ (id=' + me.coupled_user_id + ')' : 'NO');
          const data = { ...me, partner: me.partner_name };
          localStorage.setItem('loversappUser', JSON.stringify(data));
          setUser(data);
        })
        .catch(err => {
          console.warn('[App] /api/users/me FALLÓ:', err.message, '— usando caché localStorage');
          // Keep the localStorage cached user (already in state from useState initializer)
        });
    }

    // Sync the initial browser history entry with the current page
    window.history.replaceState(
      { page: currentPage, dateId: null, back: 'dates' },
      '',
      '/' + currentPage
    );

    const handlePopState = (e) => {
      if (e.state?.page) {
        setCurrentPage(e.state.page);
        setSelectedDateId(e.state.dateId ?? null);
        setBackTo(e.state.back || 'dates');
      } else {
        // Went past app history — read path and stay in app
        const path = window.location.pathname.replace(/^\//, '') || 'dashboard';
        const page = VALID_PAGES.has(path) ? path : 'dashboard';
        window.history.pushState(
          { page, dateId: null, back: 'dates' },
          '',
          '/' + page
        );
        setCurrentPage(page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);  // eslint-disable-line

  const navigateTo = (page, dateId = null, back = null) => {
    const newBack = back ?? (page === 'detail' ? 'dates' : backTo);
    const newDateId = dateId ?? selectedDateId;
    window.history.pushState(
      { page, dateId: newDateId, back: newBack },
      '',
      '/' + page
    );
    setCurrentPage(page);
    if (dateId !== null) setSelectedDateId(dateId);
    if (back !== null) setBackTo(back);
    else if (page === 'detail') setBackTo('dates');
  };

  const handleLogout = () => {
    ['loversappUser','loversappToken','coupleDates','completedCitas','completedCitasReviews',
     'favoritesCitas','manualDates','pinnedCitas','citasAleatorias','calendarEvents',
     'countdownEvents','momentsEntries','importantDates'].forEach(k => localStorage.removeItem(k));
    setIsAuthenticated(false);
    setUser(null);
    window.history.replaceState({ page: 'dashboard', dateId: null, back: 'dates' }, '', '/dashboard');
    setCurrentPage('dashboard');
  };

  const pageData = PAGE_METADATA[currentPage] || { title: 'LoversApp - App de Parejas', description: 'La aplicación N°1 para parejas enamoradas.' };
  const canonicalUrl = `https://loversapp.donydonitasss.com/${currentPage}`;

  return (
    <>
      <Helmet>
        <title>{pageData.title}</title>
        <meta name="description" content={pageData.description} />
        <meta property="og:title" content={pageData.title} />
        <meta property="og:description" content={pageData.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageData.title} />
        <meta name="twitter:description" content={pageData.description} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <div className={currentPage === 'admin' ? '' : 'lg:pl-56 lg:pt-16 app-content'} style={currentPage === 'admin' ? {} : { background: '#FAFAFA', minHeight: '100vh' }}>
        <Suspense fallback={<PageLoader />}>
          {currentPage === 'dashboard' && <DashboardPage navigateTo={navigateTo} onLogout={handleLogout} onOpenLogin={(tab = 'login') => { setLoginTab(tab); setShowLoginModal(true); }} isAuthenticated={isAuthenticated} user={user} onUserUpdate={setUser} />}
          {currentPage === 'profile' && <ProfilePage navigateTo={navigateTo} user={user} onUserUpdate={setUser} onOpenLogin={(tab='login') => { setLoginTab(tab); setShowLoginModal(true); }} />}
          {currentPage === 'home' && <DatesListPage navigateTo={navigateTo} />}
          {currentPage === 'dates' && <DatesListPage navigateTo={navigateTo} />}
          {currentPage === 'detail' && <DateDetailPage dateId={selectedDateId} navigateTo={navigateTo} backTo={backTo} />}
          {currentPage === 'stats' && <StatsPage navigateTo={navigateTo} />}
          {currentPage === 'roulette' && <RoulettePage navigateTo={navigateTo} />}
          {currentPage === 'calendar' && <CalendarPage navigateTo={navigateTo} />}
          {currentPage === 'games' && <GamesPage navigateTo={navigateTo} />}
          {currentPage === 'challenges' && <ChallengesPage navigateTo={navigateTo} />}
          {currentPage === 'letters' && <LettersPage navigateTo={navigateTo} user={user} />}
          {currentPage === 'timeline' && <TimelinePage navigateTo={navigateTo} />}
          {currentPage === 'moments' && <MomentsPage navigateTo={navigateTo} />}
          {currentPage === 'important-dates' && <ImportantDatesPage navigateTo={navigateTo} />}
          {currentPage === 'countdown' && <CountdownPage navigateTo={navigateTo} />}
          {currentPage === 'personality-test' && <PersonalityTestPage navigateTo={navigateTo} />}
          {currentPage === 'personality-profile' && <PersonalityProfilePage navigateTo={navigateTo} />}
          {currentPage === 'citas-aleatorias' && <CitasAleatoriasPage navigateTo={navigateTo} />}
          {currentPage === 'citas-personalizadas' && <CitasPersonalizadasPage navigateTo={navigateTo} />}
          {currentPage === 'settings' && <SettingsPage navigateTo={navigateTo} />}
          {currentPage === 'help' && <HelpPage navigateTo={navigateTo} />}
          {currentPage === 'privacy' && <PrivacyPolicyPage navigateTo={navigateTo} />}
          {currentPage === 'admin' && <AdminPage navigateTo={navigateTo} />}
          {currentPage === 'reset-password' && <ResetPasswordPage navigateTo={navigateTo} />}
        </Suspense>
        {showLoginModal && !isAuthenticated && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <Suspense fallback={null}>
              <LoginPage
                onLoginSuccess={() => { setIsAuthenticated(true); setShowLoginModal(false); }}
                onClose={() => setShowLoginModal(false)}
                defaultTab={loginTab}
                onStartTest={() => { setShowLoginModal(false); navigateTo('personality-test'); }}
              />
            </Suspense>
          </div>
        )}
        <Toaster />
      </div>
      {!NO_NAV_PAGES.has(currentPage) && (
        <BottomNav currentPage={currentPage} navigateTo={navigateTo} onLogout={handleLogout} isAuthenticated={isAuthenticated} onOpenLogin={(tab = 'login') => { setLoginTab(tab); setShowLoginModal(true); }} />
      )}
    </>
  );
}

export default App;