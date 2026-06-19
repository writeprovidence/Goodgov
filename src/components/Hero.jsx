import React from 'react';
import { playSound } from '../utils/sounds';

/* Small floating orbit node */
const OrbitNode = ({ icon, angle, label, color }) => {
  const rad = (angle * Math.PI) / 180;
  const r = 180;
  const x = Math.cos(rad) * r;
  const y = Math.sin(rad) * r;
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      zIndex: 2,
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        background: 'var(--bg-card)',
        border: `1.5px solid ${color}40`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 24px ${color}20`,
        fontSize: '1.5rem',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
};

const Hero = ({ onStart }) => {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: isMobile ? '110px' : '90px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glowing effects */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundColor: '#050a15',
        background: `
          radial-gradient(ellipse 60% 60% at 70% 30%, rgba(45,212,191,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 20% 70%, rgba(168,85,247,0.06) 0%, transparent 60%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(45,212,191,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div className="container responsive-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '3.5rem 5%',

      }}>

        {/* ── Left: copy ── */}
        <div>


          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '900',
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem',
            lineHeight: '1.05',
            color: 'white'
          }}>
            Master the Frontiers of <span style={{ color: '#2dd4bf' }}>Web3</span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '520px',
            marginBottom: '3rem',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            Learn Web3 and DAO governance in a fun and interactive way while earning rewards for your progress.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'inherit' }}>
            <button 
              id="hero-cta-primary" 
              className="btn-primary" 
              onClick={() => {
                playSound('click');
                onStart();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Play Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>

          {/* Stats row */}
          <div className="mobile-hide" style={{ display: 'flex', gap: '3.5rem', marginTop: '4rem' }}>
            {[['1,240+', 'Active Agents'], ['34+', 'Deployed Missions'], ['10+', 'Secured Protocols']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>{num}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: visual ── */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          position: 'relative', 
          height: isMobile ? '360px' : '460px',
          marginTop: isMobile ? '2rem' : '0'
        }}>

          {/* Spinning dashed ring */}
          <div style={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(45,212,191,0.2)',
            animation: 'spin-ring 30s linear infinite',
          }} />
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: '1.5px dashed rgba(168,85,247,0.15)',
            animation: 'spin-ring 20s linear infinite reverse',
          }} />

          {/* Center card */}
          <div style={{
            width: '160px',
            height: '160px',
            background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
            borderRadius: '28px',
            border: '1.5px solid rgba(45,212,191,0.3)',
            boxShadow: 'var(--shadow-glow)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            zIndex: 3,
            animation: 'float 4s ease-in-out infinite',
          }}>
            <div style={{ fontSize: '2.5rem' }}>🌐</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>Web3 Mastery</div>
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '4px' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i <= 3 ? 'var(--primary)' : 'var(--glass-border)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Orbit nodes */}
          <OrbitNode icon="💰" angle={-90} label="DeFi" color="#3b82f6" />
          <OrbitNode icon="🛡️" angle={0}   label="Security" color="#f59e0b" />
          <OrbitNode icon="🏛️" angle={90}  label="Governance" color="#a855f7" />
          <OrbitNode icon="🖼️" angle={180} label="NFTS" color="#2dd4bf" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
