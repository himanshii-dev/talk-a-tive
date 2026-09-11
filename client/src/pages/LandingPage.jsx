import React, { useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { SecuritySection, Footer } from '../components/landing/SecuritySection';
import { AuthModal } from '../components/auth/AuthModal';

export const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <LandingNavbar onOpenAuth={handleOpenAuth} />
      <main className="flex-1">
        <HeroSection
          onOpenAuth={handleOpenAuth}
          onQuickDemo={() => handleOpenAuth('login')}
        />
        <FeaturesSection />
        <SecuritySection />
      </main>
      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
