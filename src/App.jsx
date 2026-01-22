import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import HomePage from '@/pages/HomePage';
import DatesListPage from '@/pages/DatesListPage';
import DateDetailPage from '@/pages/DateDetailPage';
import StatsPage from '@/pages/StatsPage';
import RoulettePage from '@/pages/RoulettePage';
import { Toaster } from '@/components/ui/toaster';
import { initializeDates } from '@/data/dates';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedDateId, setSelectedDateId] = useState(null);

  useEffect(() => {
    initializeDates();
  }, []);

  const navigateTo = (page, dateId = null) => {
    setCurrentPage(page);
    if (dateId !== null) {
      setSelectedDateId(dateId);
    }
  };

  return (
    <>
      <Helmet>
        <title>100 citas de Daniela & Eduardo - Our Date Diary</title>
        <meta name="description" content="A private romantic diary tracking 100 memorable dates between Daniela and Eduardo with photos, reviews, and beautiful memories." />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}
        {currentPage === 'list' && <DatesListPage navigateTo={navigateTo} />}
        {currentPage === 'detail' && <DateDetailPage dateId={selectedDateId} navigateTo={navigateTo} />}
        {currentPage === 'stats' && <StatsPage navigateTo={navigateTo} />}
        {currentPage === 'roulette' && <RoulettePage navigateTo={navigateTo} />}
        <Toaster />
      </div>
    </>
  );
}

export default App;