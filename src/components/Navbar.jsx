import { useState, useEffect } from 'react';
import WalletDropdown from './WalletDropdown';

const Navbar = ({ onStart, authenticated, user, logout, login }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      padding: '1.2rem 5%',
      background: scrolled ? 'rgba(10, 15, 30, 0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo/goodgov _logo2.png"
          alt="GoodGov"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {!authenticated ? (
          <button 
            id="nav-cta" 
            className="btn-primary" 
            onClick={() => onStart()}
            style={{ cursor: 'pointer' }}
          >
            Play Now
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn-primary" 
              onClick={() => onStart()}
              style={{ cursor: 'pointer' }}
            >
              Enter Hub
            </button>
            <WalletDropdown 
              address={user?.wallet?.address} 
              authenticated={authenticated} 
              onLogout={logout}
              onProfile={() => onStart(null, 'Profile')}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
