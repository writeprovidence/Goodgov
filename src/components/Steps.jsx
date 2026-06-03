import React from 'react';

const steps = [
  {
    number: '01',
    emoji: '🧩',
    title: 'Take Fun Quizzes',
    desc: 'Bite-sized interactive quizzes covering DAO basics, voting mechanisms, treasury management, and more.',
    color: 'var(--primary)',
    colorDim: 'rgba(45, 212, 191, 0.1)',
    colorBorder: 'rgba(45, 212, 191, 0.2)',
  },
  {
    number: '02',
    emoji: '📈',
    title: 'Level Up',
    desc: 'Track your progress across topics. Move from newbie to expert at your own pace with structured paths.',
    color: 'var(--accent)',
    colorDim: 'rgba(59, 130, 246, 0.1)',
    colorBorder: 'rgba(59, 130, 246, 0.2)',
  },
  {
    number: '03',
    emoji: '🏅',
    title: 'Earn Rewards',
    desc: 'Earn tokens and on-chain credentials that prove your governance knowledge to the Web3 community.',
    color: 'var(--secondary)',
    colorDim: 'rgba(168, 85, 247, 0.1)',
    colorBorder: 'rgba(168, 85, 247, 0.2)',
  },
];

const Steps = () => {
  return (
    <section id="steps" style={{
      padding: '120px 0',
      background: '#fafbff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top wave divider */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '80px',
        background: 'var(--bg-dark)',
        clipPath: 'ellipse(55% 100% at 50% 0%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(45, 212, 191, 0.08)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: '100px',
            padding: '0.3rem 1rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--primary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            How It Works
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            color: 'var(--text-dark)',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
          }}>
            Start Learning in <span style={{ color: 'var(--primary)' }}>3 Simple Steps</span>
          </h2>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
        }}>
          {steps.map((step, i) => (
            <div
              key={i}
              id={`step-card-${i + 1}`}
              style={{
                padding: '2.5rem 2rem',
                borderRadius: '24px',
                background: 'white',
                border: `1px solid ${step.colorBorder}`,
                boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.05)';
              }}
            >
              {/* Background number watermark */}
              <span style={{
                position: 'absolute',
                top: '-10px',
                right: '1.5rem',
                fontSize: '7rem',
                fontWeight: '900',
                fontFamily: 'PP Mori, sans-serif',
                color: step.colorDim,
                userSelect: 'none',
                lineHeight: 1,
              }}>
                {step.number}
              </span>

              {/* Emoji icon */}
              <div style={{
                width: '64px',
                height: '64px',
                background: step.colorDim,
                border: `1px solid ${step.colorBorder}`,
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '1.5rem',
              }}>
                {step.emoji}
              </div>

              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: 'var(--text-dark)',
                marginBottom: '0.75rem',
                fontFamily: 'PP Mori, sans-serif',
              }}>
                {step.title}
              </h3>
              <p style={{ color: 'var(--text-body)', lineHeight: '1.65', fontSize: '0.95rem' }}>
                {step.desc}
              </p>

              {/* Bottom indicator */}
              <div style={{
                marginTop: '2rem',
                height: '3px',
                width: '40px',
                background: step.color,
                borderRadius: '2px',
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;
