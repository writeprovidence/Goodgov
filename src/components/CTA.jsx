import React from 'react';

const CTA = () => {
  return (
    <section id="cta" style={{ padding: '80px 0 100px' }}>
      <div className="container">
        <div style={{
          position: 'relative',
          borderRadius: '32px',
          overflow: 'hidden',
          padding: '7rem 3rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 60%, #0f172a 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {/* Background decorations */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 60% 50% at 50% -20%, rgba(45,212,191,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 90% 50%, rgba(168,85,247,0.10) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 10% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)
            `,
            pointerEvents: 'none',
          }} />

          {/* Dot grid overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Floating decorative elements */}
          <div style={{ position: 'absolute', top: '20%', left: '8%', fontSize: '2.5rem', opacity: 0.15, animation: 'float 5s ease-in-out infinite' }}>🗳️</div>
          <div style={{ position: 'absolute', top: '30%', right: '8%', fontSize: '2rem', opacity: 0.12, animation: 'float 3.5s ease-in-out infinite reverse' }}>🏛️</div>
          <div style={{ position: 'absolute', bottom: '20%', left: '15%', fontSize: '1.75rem', opacity: 0.1, animation: 'float 4s ease-in-out infinite 1s' }}>🏅</div>
          <div style={{ position: 'absolute', bottom: '25%', right: '12%', fontSize: '2rem', opacity: 0.12, animation: 'float 4.5s ease-in-out infinite 0.5s' }}>⛓️</div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              borderRadius: '100px',
              padding: '0.35rem 1.2rem',
              marginBottom: '2rem',
            }}>
              <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', letterSpacing: '0.05em' }}>
                Join 10,000+ Learners
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              fontWeight: '800',
              color: 'white',
              letterSpacing: '-0.03em',
              lineHeight: '1.15',
              marginBottom: '1.25rem',
            }}>
              Ready To Become A Better <br />
              <span className="gradient-text">Web3 Citizen?</span>
            </h2>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              maxWidth: '480px',
              margin: '0 auto 2.5rem',
              lineHeight: '1.65',
            }}>
              Start your governance journey today. Free quizzes, real rewards, and a community of 10K+ Web3 learners.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button id="cta-join-now" className="btn-primary" style={{
                padding: '1.1rem 3rem',
                fontSize: '1.05rem',
                borderRadius: '14px',
              }}>
                🚀 Join Now — It's Free
              </button>
              <button id="cta-explore" className="btn-outline" style={{
                padding: '1.1rem 2rem',
                fontSize: '1.05rem',
                borderRadius: '14px',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.15)',
              }}>
                Explore Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
