import React, { useState } from 'react';

const testimonials = [
  {
    quote: "GoodGov helped me understand how DAO governance works — from voting mechanics to contributing meaningfully. Now I feel confident participating in real DAOs.",
    name: 'Amara Okafor',
    title: 'DAO Contributor & Web3 Enthusiast',
    avatar: '/amara.png',
    rating: 5,
  },
  {
    quote: "I went from knowing nothing about decentralized governance to passing three governance proposals in a month. The quizzes are addictive and actually informative.",
    name: 'Liam Chen',
    title: 'DeFi Protocol Member',
    avatar: '/liam.png',
    rating: 5,
  },
  {
    quote: "GoodGov leveled up my entire Web3 knowledge — from DeFi mechanics to DAO governance. The quizzes make complex concepts click, and I've applied every bit of it in real communities.",
    name: 'Sofia Martinez',
    title: 'Web3 Developer & Community Lead',
    avatar: '/sofia.png',
    rating: 5,
  },
];

const Testimonial = () => {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section id="testimonials" style={{
      padding: '120px 0',
      background: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div className="container">
        {/* Section label */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '100px',
            padding: '0.3rem 1rem',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--secondary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            What Learners Say
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: '800',
            color: 'var(--text-dark)',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
          }}>
            A quiz-powered path to <br />
            <span style={{ color: 'var(--secondary)' }}>Web3 & DAO mastery.</span>
          </h2>
        </div>

        {/* Main testimonial layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
        }}>
          {/* Left: quote */}
          <div>
            {/* Stars */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <span key={i} style={{ color: '#fbbf24', fontSize: '1.25rem' }}>★</span>
              ))}
            </div>

            {/* Quote mark */}
            <div style={{ fontSize: '5rem', lineHeight: 0.6, color: 'var(--primary)', opacity: 0.15, fontFamily: 'Georgia, serif', marginBottom: '1.5rem', userSelect: 'none' }}>
              ❝
            </div>

            <p style={{
              fontSize: '1.3rem',
              color: 'var(--text-dark)',
              lineHeight: '1.65',
              fontWeight: '500',
              marginBottom: '2rem',
              fontStyle: 'italic',
            }}>
              "{t.quote}"
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '50%',
                border: '2px solid var(--primary-dim)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(45, 212, 191, 0.15)',
              }}>
                <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '1rem' }}>{t.name}</div>
                <div style={{ color: 'var(--text-body)', fontSize: '0.85rem' }}>{t.title}</div>
              </div>
            </div>

            {/* Navigation dots & arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  id={`testimonial-dot-${i}`}
                  onClick={() => setActive(i)}
                  style={{
                    width: i === active ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === active ? 'var(--primary)' : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  id="testimonial-prev"
                  onClick={() => setActive(p => (p - 1 + testimonials.length) % testimonials.length)}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  ←
                </button>
                <button
                  id="testimonial-next"
                  onClick={() => setActive(p => (p + 1) % testimonials.length)}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                    color: 'var(--text-dark)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Right: visual card */}
          <div style={{ position: 'relative' }}>
            {/* Accent block behind */}
            <div style={{
              position: 'absolute',
              top: '24px',
              right: '-20px',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '28px',
              opacity: 0.15,
              zIndex: 0,
            }} />

            {/* Main visual card */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '28px',
              padding: '2.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-30%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(45,212,191,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Big avatar image */}
              <div style={{
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                border: '4px solid var(--primary)',
                padding: '8px',
                background: 'rgba(255,255,255,0.05)',
                boxShadow: '0 0 50px rgba(45, 212, 191, 0.3)',
                position: 'relative',
                zIndex: 2,
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                  <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
