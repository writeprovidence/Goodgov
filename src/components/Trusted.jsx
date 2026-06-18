import React from 'react';

const daos = [
  { name: 'GoodDollar', logo: '/gooddollar-logo.svg', color: '#00d3ff' },
  { name: 'Uniswap', logo: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=025', color: '#ff007a' },
  { name: 'Aave', logo: 'https://cryptologos.cc/logos/aave-aave-logo.svg?v=025', color: '#2ebac6' },
  { name: 'Celo', logo: 'https://cryptologos.cc/logos/celo-celo-logo.svg?v=025', color: '#35d07f' },
  { name: 'zkSync', logo: 'https://www.zksync.io/brand/zksync-logo/zksync-logomark-light-transparent.svg', color: '#ffffff' },
  { name: 'Arbitrum', logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=025', color: '#28a0f0' },
  { name: 'Optimism', logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=025', color: '#ff0420' },
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
                gap: '0.8rem',
                padding: '0.6rem 1.4rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.3s ease',
                cursor: 'default',
                userSelect: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(45, 212, 191, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img 
                src={dao.logo} 
                alt={dao.name} 
                className="dao-logo"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px',
                  objectFit: 'contain',
                  opacity: 0.9,
                  transition: 'all 0.3s ease'
                }} 
                onError={e => {
                  e.currentTarget.style.display = 'none';
                  const span = document.createElement('div');
                  span.style.width = '32px';
                  span.style.height = '32px';
                  span.style.borderRadius = '8px';
                  span.style.backgroundColor = dao.color + '20';
                  span.style.color = dao.color;
                  span.style.display = 'flex';
                  span.style.alignItems = 'center';
                  span.style.justifyContent = 'center';
                  span.style.fontWeight = '900';
                  span.style.fontSize = '0.9rem';
                  span.innerText = dao.name[0];
                  e.currentTarget.parentElement.prepend(span);
                }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white', letterSpacing: '0.01em' }}>
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
