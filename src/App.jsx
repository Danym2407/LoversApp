import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import DatesListPage from '@/pages/DatesListPage';
import DateDetailPage from '@/pages/DateDetailPage';
import StatsPage from '@/pages/StatsPage';
import RoulettePage from '@/pages/RoulettePage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import CalendarPage from '@/pages/CalendarPage';
import RegistryPage from '@/pages/RegistryPage';
import GamesPage from '@/pages/GamesPage';
import ChallengesPage from '@/pages/ChallengesPage';
import LettersPage from '@/pages/LettersPage';
import TimelinePage from '@/pages/TimelinePage';
import MomentsPage from '@/pages/MomentsPage';
import ImportantDatesPage from '@/pages/ImportantDatesPage';
import CountdownPage from '@/pages/CountdownPage';
import PersonalityTestPage from '@/pages/PersonalityTestPage';
import PersonalityProfilePage from '@/pages/PersonalityProfilePage';
import CitasAleatoriasPage from '@/pages/CitasAleatoriasPage';
import AdminPage from '@/pages/AdminPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { Toaster } from '@/components/ui/toaster';
import { initializeDates } from '@/data/dates';
import BottomNav from '@/components/BottomNav';

const NO_NAV_PAGES = new Set(['personality-test', 'personality-profile', 'admin']);

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [backTo, setBackTo] = useState('dates');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState('login');

  useEffect(() => {
    initializeDates();
    const token = localStorage.getItem('loversappToken');
    const user  = localStorage.getItem('loversappUser');
    setIsAuthenticated(!!(token && user));
    // Hash-based shortcut: /#admin abre el panel directamente
    if (window.location.hash === '#admin') {
      setCurrentPage('admin');
    } else if (window.location.hash.startsWith('#reset-password')) {
      setCurrentPage('reset-password');
    }
  }, []);

  const navigateTo = (page, dateId = null, back = null) => {
    setCurrentPage(page);
    if (dateId !== null) setSelectedDateId(dateId);
    if (back !== null) setBackTo(back);
    else if (page === 'detail') setBackTo('dates');
  };

  const handleLogout = () => {
    localStorage.removeItem('loversappUser');
    localStorage.removeItem('loversappToken');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  return (
    <>
      <Helmet>
        <title>LoversApp - Nuestra App de Pareja</title>
        <meta name="description" content="LoversApp: La aplicación para parejas enamoradas. Citas, calendario, retos diarios, cartas digitales, línea del tiempo y más." />
      </Helmet>
      
      <div style={{ background: '#FEF8F0', minHeight: '100vh' }}>
        {currentPage === 'dashboard' && <DashboardPage navigateTo={navigateTo} onLogout={handleLogout} onOpenLogin={(tab = 'login') => { setLoginTab(tab); setShowLoginModal(true); }} isAuthenticated={isAuthenticated} />}
        {currentPage === 'profile' && <ProfilePage navigateTo={navigateTo} />}
        {currentPage === 'home' && <DatesListPage navigateTo={navigateTo} />}
        {currentPage === 'dates' && <DatesListPage navigateTo={navigateTo} />}
        {currentPage === 'detail' && <DateDetailPage dateId={selectedDateId} navigateTo={navigateTo} backTo={backTo} />}
        {currentPage === 'stats' && <StatsPage navigateTo={navigateTo} />}
        {currentPage === 'roulette' && <RoulettePage navigateTo={navigateTo} />}
        {currentPage === 'calendar' && <CalendarPage navigateTo={navigateTo} />}
        {currentPage === 'registry' && <RegistryPage navigateTo={navigateTo} />}
        {currentPage === 'games' && <GamesPage navigateTo={navigateTo} />}
        {currentPage === 'challenges' && <ChallengesPage navigateTo={navigateTo} />}
        {currentPage === 'letters' && <LettersPage navigateTo={navigateTo} />}
        {currentPage === 'timeline' && <TimelinePage navigateTo={navigateTo} />}
        {currentPage === 'moments' && <MomentsPage navigateTo={navigateTo} />}
        {currentPage === 'important-dates' && <ImportantDatesPage navigateTo={navigateTo} />}
        {currentPage === 'countdown' && <CountdownPage navigateTo={navigateTo} />}
        {currentPage === 'personality-test' && <PersonalityTestPage navigateTo={navigateTo} />}
        {currentPage === 'personality-profile' && <PersonalityProfilePage navigateTo={navigateTo} />}
        {currentPage === 'citas-aleatorias' && <CitasAleatoriasPage navigateTo={navigateTo} />}
        {currentPage === 'admin' && <AdminPage navigateTo={navigateTo} />}
        {currentPage === 'reset-password' && <ResetPasswordPage navigateTo={navigateTo} />}
        {!NO_NAV_PAGES.has(currentPage) && (
          <BottomNav currentPage={currentPage} navigateTo={navigateTo} />
        )}
        {showLoginModal && !isAuthenticated && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <LoginPage
              onLoginSuccess={() => { setIsAuthenticated(true); setShowLoginModal(false); }}
              onClose={() => setShowLoginModal(false)}
              defaultTab={loginTab}
              onStartTest={() => { setShowLoginModal(false); navigateTo('personality-test'); }}
            />
          </div>
        )}
        <Toaster />
      </div>
    </>
  );
}

export default App;