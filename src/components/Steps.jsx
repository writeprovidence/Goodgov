import React from 'react';

const Steps = () => {
  return (
    <section id="steps" style={{
      padding: '120px 0',
      backgroundColor: '#050a15',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <span style={{
            display: 'inline-flex',
            background: 'rgba(45, 212, 191, 0.08)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: '100px',
            padding: '4px 16px',
            fontSize: '0.75rem',
            fontWeight: '800',
            color: '#2dd4bf',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            Strategic Protocol
          </span>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
            fontWeight: '900',
            color: 'white',
            letterSpacing: '-0.03em',
            lineHeight: '1.1',
          }}>
            Interactive <span style={{ color: '#2dd4bf' }}>Learning Journey</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div className="responsive-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2.5rem',
        }}>
          {[
            { num: '01', icon: '🎯', title: 'Operational Entry', desc: 'Engage with bite-sized missions covering Web3 fundamentals and DAO mechanics.', color: '#2dd4bf' },
            { num: '02', icon: '🛡️', title: 'Rank Progression', desc: 'Unlock specialized sectors and elevate your status from Field Agent to Senior Operator.', color: '#a855f7' },
            { num: '03', icon: '🪙', title: 'Asset Claim', desc: 'Secure on-chain proof of your ecosystem expertise and unlock unique token rewards.', color: '#fbbf24' }
          ].map((step, i) => (
            <div
              key={i}
              style={{
                padding: '3.5rem 2.5rem',
                borderRadius: '32px',
                background: '#0a0f1e',
                border: '1px solid #1e293b',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = step.color + '40';
                e.currentTarget.style.boxShadow = `0 20px 50px ${step.color}15`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#1e293b';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '1.5rem',
                fontSize: '8rem',
                fontWeight: '950',
                color: 'rgba(255,255,255,0.03)',
                userSelect: 'none',
              }}>
                {step.num}
              </div>

              <div style={{
                width: '72px',
                height: '72px',
                background: step.color + '10',
                border: `1px solid ${step.color}30`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '2rem',
                position: 'relative',
                zIndex: 1
              }}>
                {step.icon}
              </div>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'white',
                marginBottom: '1rem',
                position: 'relative',
                zIndex: 1
              }}>
                {step.title}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '1rem', position: 'relative', zIndex: 1 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;
