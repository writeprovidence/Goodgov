import React from 'react';

const CTA = ({ onStart }) => {
  return (
    <section id="cta" style={{ padding: '80px 0 120px', backgroundColor: '#050a15' }}>
      <div className="container">
        <div style={{
          position: 'relative',
          borderRadius: '40px',
          overflow: 'hidden',
          padding: '8rem 4rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #050a15 100%)',
          border: '1px solid #1e293b',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Background decorations */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 60% 50% at 50% -20%, rgba(45,212,191,0.2) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 90% 50%, rgba(168,85,247,0.15) 0%, transparent 70%)
            `,
            pointerEvents: 'none',
          }} />

          {/* Terminal overlay lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '100% 4px',
            pointerEvents: 'none',
            opacity: 0.3
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '100px',
              padding: '6px 20px',
              marginBottom: '2.5rem',
            }}>
              <span style={{ width: '8px', height: '8px', background: '#2dd4bf', borderRadius: '50%', boxShadow: '0 0 10px #2dd4bf' }} />
              <span style={{ fontSize: '0.85rem', color: '#2dd4bf', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                READY FOR DEPLOYMENT
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '900',
              color: 'white',
              letterSpacing: '-0.04em',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
            }}>
              Master Web3. <br />
              <span style={{ color: '#2dd4bf' }}>Lead Governance</span>.
            </h2>

            <p style={{
              color: '#94a3b8',
              fontSize: '1.2rem',
              maxWidth: '540px',
              margin: '0 auto 3rem',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Master Web3 and DAO mechanics through interactive missions. Earn rank and claim unique rewards.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn-primary" 
                onClick={onStart}
                style={{ cursor: 'pointer' }}
              >
                Initialize Mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
