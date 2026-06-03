import React, { useEffect, useRef } from 'react';

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

const Hero = () => {
  return (
    <section id="hero" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '90px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 70% 40%, rgba(45,212,191,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(168,85,247,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 50% 10%, rgba(59,130,246,0.06) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Subtle dot grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 0)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{
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
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            lineHeight: '1.15',
          }}>
            <span className="gradient-text">Learn Web3,</span> One Quiz at a Time
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '500px',
            marginBottom: '2.5rem',
            lineHeight: '1.7',
          }}>
            Master decentralized governance and Web3 concepts through
            bite-sized quizzes, and earn <strong style={{ color: 'var(--text-main)' }}>token</strong> rewards as you learn.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button id="hero-cta-primary" className="btn-primary" style={{
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              Start Learning
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <a 
              id="hero-cta-secondary" 
              className="btn-outline" 
              href="https://discourse.gooddollar.org" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1rem',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Our Ecosystem ↗
            </a>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem' }}>
            {[['100+', 'Learners'], ['20+', 'Quizzes'], ['10+', 'DAOs Covered']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'PP Mori, sans-serif', color: 'var(--primary)' }}>{num}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: visual ── */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '460px' }}>
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
            <div style={{ fontSize: '2.5rem' }}>🏛️</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>Governance</div>
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '4px' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i <= 3 ? 'var(--primary)' : 'var(--glass-border)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Orbit nodes */}
          <OrbitNode icon="🗳️" angle={-90} label="Voting" color="#3b82f6" />
          <OrbitNode icon="💰" angle={0}   label="Treasury" color="#f59e0b" />
          <OrbitNode icon="⛓️" angle={90}  label="Proposals" color="#a855f7" />
          <OrbitNode icon="🎓" angle={180} label="Learning" color="#2dd4bf" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
