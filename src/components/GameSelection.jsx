import React from 'react';

const GameModeCard = ({ title, description, icon, color, difficulty, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '32px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.boxShadow = `0 20px 40px -20px ${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-20%',
        width: '120px',
        height: '120px',
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div style={{
        fontSize: '2.5rem',
        marginBottom: '8px',
        zIndex: 1,
      }}>
        {icon}
      </div>

      <div style={{ zIndex: 1 }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          color: 'white',
          marginBottom: '8px',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.95rem',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '16px',
        }}>
          {description}
        </p>
      </div>

      <div style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: '900',
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          backgroundColor: `${color}15`,
          padding: '4px 10px',
          borderRadius: '6px',
          border: `1px solid ${color}30`,
        }}>
          {difficulty}
        </div>
        <div style={{
          color: 'white',
          fontSize: '1.2rem',
          opacity: 0.5,
          transition: 'opacity 0.2s',
        }}>
          →
        </div>
      </div>
    </div>
  );
};

const GameSelection = ({ onStart }) => {
  const modes = [
    {
      title: "Tactical Quiz",
      description: "Standard 15-question mission testing your Web3 and Governance knowledge. Precision is key.",
      icon: "🎯",
      color: "#2dd4bf",
      difficulty: "Intermediate",
    },
    {
      title: "Speed Run",
      description: "High-pressure environment. Answer as many questions as possible before the clock hits zero.",
      icon: "⚡",
      color: "#f59e0b",
      difficulty: "Advanced",
    },
    {
      title: "Survivor",
      description: "Elite challenge. One wrong answer terminates the mission immediately. No lifelines permitted.",
      icon: "☣️",
      color: "#ef4444",
      difficulty: "Expert",
    },
    {
      title: "Web3 Duel",
      description: "Compete head-to-head with other agents in real-time. Winner takes the ecosystem rewards.",
      icon: "⚔️",
      color: "#a855f7",
      difficulty: "Dynamic",
    }
  ];

  return (
    <section id="game-selection" style={{
      padding: '120px 0',
      backgroundColor: '#050a15',
      position: 'relative',
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: '900', 
            color: '#2dd4bf', 
            textTransform: 'uppercase', 
            letterSpacing: '0.3em', 
            display: 'block', 
            marginBottom: '16px' 
          }}>
            SYSTEM DEPLOYMENT
          </span>
          <h2 style={{ 
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', 
            fontWeight: '900', 
            color: 'white', 
            letterSpacing: '-0.04em',
            marginBottom: '20px'
          }}>
            Select Your <span style={{ color: '#2dd4bf' }}>Path</span>
          </h2>
          <p style={{ 
            color: '#64748b', 
            fontSize: '1.1rem', 
            maxWidth: '600px', 
            margin: '0 auto' 
          }}>
            Choose the operational mode that fits your expertise. Each mode offers unique rewards and reputation tracking.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {modes.map((mode, index) => (
            <GameModeCard 
              key={index} 
              {...mode} 
              onClick={() => onStart(mode.title)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameSelection;
