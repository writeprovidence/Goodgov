import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Trusted from './components/Trusted';
import Steps from './components/Steps';


import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

import { usePrivy } from '@privy-io/react-auth';
import { useMiniPay } from './hooks/useMiniPay';

function App() {
  useMiniPay();
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [initialTab, setInitialTab] = useState(null);
  const { login, authenticated, logout, user } = usePrivy();

  const handleStart = (mode = null, tab = null) => {
    setSelectedMode(mode);
    setInitialTab(tab);
    setShowDashboard(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (showDashboard) {
    return <Dashboard onBack={() => { setShowDashboard(false); setSelectedMode(null); setInitialTab(null); }} initialMode={selectedMode} initialTab={initialTab} />;
  }

  return (
    <>
      <Navbar onStart={() => handleStart()} authenticated={authenticated} logout={logout} user={user} login={login} />
      <main>
        <Hero onStart={() => handleStart()} />
        <Trusted />
        <Steps />
        {/* FeaturedQuizzes section removed as per user request */}

        <FAQ />
        <CTA onStart={() => handleStart()} />
      </main>
      <Footer />
    </>
  );
}

export default App;
