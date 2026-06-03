import React from 'react';

const daos = [
  { name: 'Uniswap', emoji: '🦄' },
  { name: 'Compound', emoji: '🏦' },
  { name: 'Aave', emoji: '👻' },
  { name: 'MakerDAO', emoji: '🏭' },
  { name: 'ENS DAO', emoji: '🌐' },
  { name: 'Gitcoin', emoji: '🔮' },
  { name: 'Nouns DAO', emoji: '👓' },
  { name: 'Optimism', emoji: '🔴' },
  { name: 'Arbitrum', emoji: '🔵' },
  { name: 'Snapshot', emoji: '📸' },
];

/* Duplicate for seamless infinite scroll */
const ITEMS = [...daos, ...daos];

const Trusted = () => {
  return (
    <section style={{
      padding: '3.5rem 0',
      background: 'var(--bg-dark)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden',
    }}>
      {/* Marquee track */}
      <div style={{ position: 'relative' }}>
        {/* Fade edges */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '120px',
          background: 'linear-gradient(to right, var(--bg-dark), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: '120px',
          background: 'linear-gradient(to left, var(--bg-dark), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          animation: 'marquee 30s linear infinite',
          width: 'max-content',
        }}>
          {ITEMS.map((dao, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 1.4rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '100px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{dao.emoji}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                {dao.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframes injected as a style tag */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default Trusted;
