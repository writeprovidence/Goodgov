import React from 'react';
import { BookOpen } from 'lucide-react';

export const Badge = ({ variant, children }) => {
  const styles = {
    Beginner: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '#10b98130' },
    Intermediate: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: '#f59e0b30' },
    Expert: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '#ef444430' },
    Advanced: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '#ef444430' }
  };
  const style = styles[variant] || { bg: 'rgba(100, 116, 139, 0.1)', text: '#94a3b8', border: '#94a3b830' };
  
  return (
    <span style={{
      display: 'inline-flex',
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '0.65rem',
      fontWeight: '800',
      backgroundColor: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {children}
    </span>
  );
};

export const QuizCard = ({ title, description, difficulty, lessons, icon, onClick, isComingSoon, status }) => (
  <div 
    onClick={onClick}
    style={{
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '24px',
      padding: '28px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#2dd4bf50';
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.7)';
      e.currentTarget.style.backgroundColor = '#1e293b';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#1e293b';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.backgroundColor = '#0f172a';
    }}
  >
    {status === 'perfect' && (
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '-30px',
        backgroundColor: '#2dd4bf',
        color: 'black',
        padding: '4px 32px',
        fontSize: '0.6rem',
        fontWeight: '900',
        transform: 'rotate(45deg)',
        boxShadow: '0 2px 10px rgba(45, 212, 191, 0.3)',
        letterSpacing: '0.1em'
      }}>
        PERFECT
      </div>
    )}

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '14px', 
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem',
        border: '1px solid #334155'
      }}>
        {icon || '📚'}
      </div>
      {isComingSoon && <Badge variant="Coming Soon">COMING SOON</Badge>}
      {status === 'completed' && !isComingSoon && <div style={{ color: '#2dd4bf' }}>✅</div>}
    </div>
    
    <div style={{ marginTop: '8px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description}
      </p>
    </div>

    <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {difficulty && <Badge variant={difficulty}>{difficulty}</Badge>}
      {lessons && (
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={14} />
          {lessons}
        </span>
      )}
    </div>
  </div>
);
