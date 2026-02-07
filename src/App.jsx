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
import CitasPersonalizadasPage from '@/pages/CitasPersonalizadasPage';
import CitasAleatoriasPage from '@/pages/CitasAleatoriasPage';
import { Toaster } from '@/components/ui/toaster';
import { initializeDates } from '@/data/dates';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDateId, setSelectedDateId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginTab, setLoginTab] = useState('login');

  useEffect(() => {
    initializeDates();
    // Verificar si el usuario ya está autenticado
    const user = localStorage.getItem('loversappUser');
    setIsAuthenticated(!!user);
  }, []);

  const navigateTo = (page, dateId = null) => {
    setCurrentPage(page);
    if (dateId !== null) {
      setSelectedDateId(dateId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loversappUser');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  return (
    <>
      <Helmet>
        <title>LoversApp - Nuestra App de Pareja</title>
        <meta name="description" content="LoversApp: La aplicación para parejas enamoradas. Citas, calendario, retos diarios, cartas digitales, línea del tiempo y más." />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        {showLoginModal && !isAuthenticated ? (
          <LoginPage 
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              setShowLoginModal(false);
            }}
            onClose={() => setShowLoginModal(false)}
            defaultTab={loginTab}
            onStartTest={() => navigateTo('personality-test')}
          />
        ) : (
          <>
            {currentPage === 'dashboard' && <DashboardPage navigateTo={navigateTo} onLogout={handleLogout} onOpenLogin={(tab = 'login') => {
              setLoginTab(tab);
              setShowLoginModal(true);
            }} isAuthenticated={isAuthenticated} />}
        {currentPage === 'profile' && <ProfilePage navigateTo={navigateTo} />}
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
        {currentPage === 'dates' && <DatesListPage navigateTo={navigateTo} />}
        {currentPage === 'detail' && <DateDetailPage dateId={selectedDateId} navigateTo={navigateTo} />}
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
        {currentPage === 'citas-personalizadas' && <CitasPersonalizadasPage navigateTo={navigateTo} />}
        {currentPage === 'citas-aleatorias' && <CitasAleatoriasPage navigateTo={navigateTo} />}
            <Toaster />
          </>
        )}
      </div>
    </>
  );
}

export default App;