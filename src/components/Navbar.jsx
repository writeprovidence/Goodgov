import { useState, useEffect } from 'react';
import WalletDropdown from './WalletDropdown';
import { useMiniPay } from '../hooks/useMiniPay';

const Navbar = ({ onStart, isLoggedIn, walletAddress, login, logout, isMiniPay }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallMobile = windowWidth < 480;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isSmallMobile ? '0.8rem 4%' : '1.2rem 5%',
      background: scrolled ? 'rgba(10, 15, 30, 0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo/goodgov_logo.png"
          alt="GoodGov"
          style={{ height: isSmallMobile ? '40px' : '60px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          id="nav-cta" 
          className="btn-primary" 
          onClick={() => onStart()}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: isSmallMobile ? '0.6rem 1.2rem' : '0.85rem 2.5rem',
            fontSize: isSmallMobile ? '0.8rem' : '1rem'
          }}
        >
          Play Now
          <svg width={isSmallMobile ? "16" : "20"} height={isSmallMobile ? "16" : "20"} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>

        {!isLoggedIn ? null : (
          <WalletDropdown 
            address={walletAddress} 
            isLoggedIn={isLoggedIn} 
            onLogout={logout}
            onProfile={() => onStart(null, 'Profile')}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
