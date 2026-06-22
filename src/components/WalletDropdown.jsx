import React, { useState, useRef, useEffect } from 'react';
import { User, Copy, LogOut, ChevronDown, Check } from 'lucide-react';

const WalletDropdown = ({ address, isLoggedIn, onLogout, onProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoggedIn && !address) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '100px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#2dd4bf20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2dd4bf',
        }}>
          <User size={14} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'monospace' }}>
          {shortAddress}
        </span>
        <ChevronDown size={14} style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s ease',
          opacity: 0.6
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 12px)',
          right: 0,
          width: '220px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '8px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          animation: 'fadeInScale 0.2s ease-out'
        }}>
          <div 
            onClick={() => { onProfile(); setIsOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <User size={18} />
            Profile
          </div>

          <div 
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            {copied ? <Check size={18} style={{ color: '#2dd4bf' }} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy address'}
          </div>

          <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.05)', margin: '4px 8px' }} />

          <div 
            onClick={() => { onLogout(); setIsOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#ef4444',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={18} />
            Disconnect
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default WalletDropdown;
