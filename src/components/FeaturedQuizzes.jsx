import React, { useState } from 'react';

const ALL_QUIZZES = [
  { title: 'DAO Basics', level: 'Beginner', emoji: '🏛️', desc: 'Learn the fundamentals of Decentralized Autonomous Organizations and how they work.', color: '#4ade80', questions: 12, time: '8 min' },
  { title: 'Governance Voting', level: 'Intermediate', emoji: '🗳️', desc: 'Master the different on-chain and off-chain voting mechanisms used in DAOs today.', color: '#fbbf24', questions: 15, time: '10 min' },
  { title: 'Treasury Management', level: 'Intermediate', emoji: '💰', desc: 'Understand how DAOs manage their communal funds, multisigs, and asset allocation.', color: '#f87171', questions: 14, time: '9 min' },
  { title: 'Strategic Voting', level: 'Expert', emoji: '♟️', desc: 'Develop advanced strategies for effective and impactful participation in governance.', color: '#818cf8', questions: 18, time: '14 min' },
  { title: 'Onchain Proposals', level: 'Expert', emoji: '📝', desc: 'Learn the technical side of submitting, discussing, and executing onchain proposals.', color: '#60a5fa', questions: 16, time: '12 min' },
  { title: 'Web3 Ethics', level: 'Beginner', emoji: '⚖️', desc: 'Explore the ethical considerations, power dynamics, and responsibilities in Web3.', color: '#c084fc', questions: 10, time: '7 min' },
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Expert'];

const levelColors = {
  Beginner:     { bg: 'rgba(74, 222, 128, 0.12)', text: '#4ade80' },
  Intermediate: { bg: 'rgba(251, 191, 36, 0.12)', text: '#fbbf24' },
  Expert:       { bg: 'rgba(248, 113, 113, 0.12)', text: '#f87171' },
};

const FeaturedQuizzes = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const shown = activeFilter === 'All' ? ALL_QUIZZES : ALL_QUIZZES.filter(q => q.level === activeFilter);

  return (
    <section id="quizzes" style={{
      padding: '120px 0',
      background: '#f1f5f9',
      position: 'relative',
    }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
            fontWeight: '800',
            color: 'var(--text-dark)',
            letterSpacing: '-0.02em',
          }}>
            Featured Quizzes
          </h2>
        </div>

        {/* Filter tabs + View All */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {LEVELS.map(level => (
            <button
              key={level}
              id={`filter-${level.toLowerCase()}`}
              onClick={() => setActiveFilter(level)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '100px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: '600',
                background: activeFilter === level ? 'var(--text-dark)' : 'white',
                color: activeFilter === level ? 'white' : 'var(--text-body)',
                boxShadow: activeFilter === level ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
              }}
            >
              {level}
            </button>
          ))}

          <a href="#" id="view-all-quizzes" style={{
            marginLeft: 'auto',
            color: 'var(--accent)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.95rem',
          }}>
            View All <span>→</span>
          </a>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)',
          marginBottom: '2.5rem',
        }} />

        {/* Quiz grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}>
          {shown.map((quiz, i) => (
            <div
              key={i}
              id={`quiz-card-${i}`}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.75rem',
                border: '1px solid #e8edf3',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.09)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
              }}
            >
              {/* Card top */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: `${quiz.color}18`,
                  border: `1px solid ${quiz.color}30`,
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  {quiz.emoji}
                </div>
                <span style={{
                  background: levelColors[quiz.level]?.bg,
                  color: levelColors[quiz.level]?.text,
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {quiz.level}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', fontFamily: 'PP Mori, sans-serif' }}>
                {quiz.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', lineHeight: '1.6', flex: 1 }}>
                {quiz.desc}
              </p>

              {/* Card footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>📋 {quiz.questions} questions</span>
                  <span>⏱ {quiz.time}</span>
                </div>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  Start →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedQuizzes;
