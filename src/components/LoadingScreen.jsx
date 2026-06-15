import { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

const LoadingScreen = ({ quiz }) => {
  const [progress, setProgress] = useState(0);

  const messages = [
    'ENCRYPTING SESSION...',
    'BUFFERING INTEL DATA...',
    'OPTIMIZING NEURAL LINKS...',
    'DECRYPTING PROTOCOL...',
    'SYNCING WITH BLOCKCHAIN...',
    'CALIBRATING INTERFACE...',
    'ISOLATING SECTOR...',
    'VERIFYING AGENT SIGNATURE...',
    'DECODING GOVERNANCE LAYERS...',
    'READY FOR DEPLOYMENT'
  ];

  const [logs, setLogs] = useState(['> INITIALIZING KERNEL...']);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 75);

    const messageInterval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(messageInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#050a15',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: "'Courier New', Courier, monospace",
      overflow: 'hidden'
    }}>
      {/* Background Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(45, 212, 191, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        zIndex: 0,
        opacity: 0.3
      }} />

      {/* Glow Effects */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      <div style={{ zIndex: 1, textAlign: 'center', width: '100%', maxWidth: '440px', padding: '20px' }}>
        {/* Mission Icon Animation */}
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '24px',
            backgroundColor: 'rgba(45, 212, 191, 0.05)',
            border: '1.5px solid rgba(45, 212, 191, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            position: 'relative',
            boxShadow: '0 0 30px rgba(45, 212, 191, 0.1)'
          }}>
            <Cpu size={44} className="pulse-anim" style={{ color: '#2dd4bf' }} />
          </div>
          
          {/* Orbital Rings */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '140px',
            height: '140px',
            border: '1px solid rgba(45, 212, 191, 0.1)',
            borderRadius: '50%',
            animation: 'spin 5s linear infinite'
          }} />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: '900', 
            color: '#2dd4bf', 
            letterSpacing: '0.4em', 
            textTransform: 'uppercase',
            marginBottom: '10px',
            opacity: 0.8
          }}>
            Establishing Secure Link
          </div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '900', 
            margin: '0 0 6px 0',
            color: 'white',
            letterSpacing: '-0.02em'
          }}>
            {quiz?.title || 'System Protocol'}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700', letterSpacing: '0.05em' }}>
            SECTOR: {quiz?.stage?.toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        {/* Console Logs */}
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(45, 212, 191, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '24px',
          height: '100px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: '6px'
        }}>
          {logs.map((log, i) => (
            <div key={i} style={{ 
              fontSize: '0.65rem', 
              color: '#2dd4bf', 
              opacity: (i + 1) / logs.length,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {log}
            </div>
          ))}
          <div style={{ width: '6px', height: '10px', backgroundColor: '#2dd4bf', display: 'inline-block', animation: 'blink 0.8s step-end infinite' }} />
        </div>

        {/* Progress Bar Container */}
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '10px',
            fontSize: '0.7rem',
            fontWeight: '900',
            fontFamily: 'monospace'
          }}>
            <span style={{ color: '#2dd4bf' }}>DEPLO_LOADING...</span>
            <span style={{ color: '#2dd4bf' }}>{progress}%</span>
          </div>
          <div style={{
            height: '2px',
            width: '100%',
            backgroundColor: 'rgba(45, 212, 191, 0.05)',
            borderRadius: '1px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: '#2dd4bf',
              boxShadow: '0 0 20px rgba(45, 212, 191, 1)',
              transition: 'width 0.1s linear'
            }} />
          </div>
        </div>

        <div style={{ 
          fontSize: '0.6rem', 
          color: '#475569', 
          fontWeight: '700', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          letterSpacing: '0.1em'
        }}>
          DO NOT REFRESH TAB DURING DEPLOYMENT
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); filter: drop-shadow(0 0 5px rgba(45, 212, 191, 0.1)); }
          50% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(45, 212, 191, 0.3)); }
        }
        .pulse-anim {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
