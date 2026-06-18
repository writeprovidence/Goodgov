import React, { useState } from 'react';
import { 
  Terminal, 
  Target, 
  Zap, 
  ShieldCheck, 
  Wallet, 
  Activity,
  Info
} from 'lucide-react';

const faqData = [
  {
    icon: <Terminal size={24} />,
    category: "The Platform",
    question: "What is GoodGov?",
    answer: "A next-gen gamified Web3 educational environment, where you can learn and earn rewards.",
    color: "#2dd4bf",
    detail: "SYSTEM_VERSION: 1.0.4 // STATUS: OPERATIONAL"
  },
  {
    icon: <Target size={24} />,
    category: "Rewards",
    question: "How do I earn tokens?",
    answer: "Achieve 100% accuracy in missions to trigger the milestone reward system and claim on-chain tokens.",
    color: "#a855f7",
    detail: "PROTOCOL: DISTRIBUTED // ASSET_TYPE: ERC20"
  },
  {
    icon: <Target size={24} />,
    category: "Tactical",
    question: "What is Lifelines and 50/50?",
    answer: "Need help with a question? Use the 50/50 or Lifeline feature to remove two wrong answers, leaving you with just one correct answer and one incorrect answer to choose from.",
    color: "#f59e0b",
    detail: "COUNTERMEASURES: AVAILABLE // USAGE: 2_PER_RUN"
  },
  {
    icon: <Activity size={24} />,
    category: "Access",
    question: "Is it free to play?",
    answer: "Affirmative. Access to all training sectors is zero-cost to ensure inclusive governance education.",
    color: "#ef4444",
    detail: "TIER: PUBLIC // ACCESS: UNLIMITED"
  },
  {
    icon: <Wallet size={24} />,
    category: "Security",
    question: "Do I need a wallet?",
    answer: "Required only for claiming on-chain rewards and rank verification. Supports MetaMask and Valora.",
    color: "#3b82f6",
    detail: "AUTH: BIP-44 // COMPATIBILITY: HIGH"
  },
  {
    icon: <ShieldCheck size={24} />,
    category: "Network",
    question: "Network Support?",
    answer: "Exclusively supports the Celo ecosystem and social impact protocols like GoodDollar.",
    color: "#10b981",
    detail: "CHAIN_ID: 42220 // REGION: GLOBAL"
  }
];

const FAQ = () => {
  const [activeId, setActiveId] = useState(0);

  return (
    <section id="faq" style={{
      padding: '140px 0',
      backgroundColor: '#050a15',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Abstract Background Elements */}
      <div style={{
        position: 'absolute', top: '20%', right: '-10%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.03) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          
          {/* Header with tactical slant */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '32px' }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#2dd4bf', borderRadius: '2px', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Intelligence Matrix</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: '950', color: 'white', letterSpacing: '-0.05em', lineHeight: '1', margin: 0 }}>
                Query the <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>Foundation</span>
              </h2>
            </div>
            <div className="mobile-hide" style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569', fontWeight: '800', fontFamily: 'monospace' }}>
              SEC_LEVEL: ALPHA<br />
              LAST_SYNC: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="responsive-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr',
            gap: '40px',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Vertical Menu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  onClick={() => setActiveId(index)}
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    backgroundColor: activeId === index ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: `1px solid ${activeId === index ? faq.color + '40' : 'rgba(255,255,255,0.05)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (activeId !== index) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    if (activeId !== index) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }}
                >
                  {activeId === index && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                      backgroundColor: faq.color, boxShadow: `0 0 15px ${faq.color}`
                    }} />
                  )}
                  
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    backgroundColor: activeId === index ? faq.color + '15' : 'rgba(255,255,255,0.03)',
                    color: activeId === index ? faq.color : '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s'
                  }}>
                    {faq.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: activeId === index ? faq.color : '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                      {faq.category}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: activeId === index ? 'white' : '#94a3b8', transition: 'color 0.3s' }}>
                      {faq.question}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Dynamic Detail View */}
            <div style={{
              backgroundColor: '#0a0f1e',
              border: '1px solid #1e293b',
              borderRadius: '40px',
              padding: '60px',
              minHeight: '400px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
            }}>
              {/* Background scanline effect */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)',
                backgroundSize: '100% 40px',
                pointerEvents: 'none'
              }} />

              {/* Animated corner accents */}
              <div style={{ position: 'absolute', top: '40px', left: '40px', width: '20px', height: '20px', borderTop: '2px solid' + faqData[activeId].color, borderLeft: '2px solid' + faqData[activeId].color }} />
              <div style={{ position: 'absolute', bottom: '40px', right: '40px', width: '20px', height: '20px', borderBottom: '2px solid' + faqData[activeId].color, borderRight: '2px solid' + faqData[activeId].color }} />

              <div key={activeId} style={{ position: 'relative', zIndex: 1, animation: 'fadeInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '32px', color: faqData[activeId].color, opacity: 0.8 }}>
                  {faqData[activeId].icon}
                </div>
                
                <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '24px', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
                  {faqData[activeId].question}
                </h3>
                
                <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: '1.7', marginBottom: '48px', maxWidth: '500px' }}>
                  {faqData[activeId].answer}
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  color: faqData[activeId].color,
                  fontWeight: '700'
                }}>
                  <Info size={14} />
                  {faqData[activeId].detail}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}} />
    </section>
  );
};

export default FAQ;
