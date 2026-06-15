import React from 'react';
import { 
  Terminal, 
  Target, 
  Zap, 
  ShieldCheck, 
  Wallet, 
  Activity,
  ChevronRight
} from 'lucide-react';

const faqData = [
  {
    icon: <Terminal size={24} />,
    title: "The Platform",
    question: "What is GoodGov?",
    answer: "A next-gen gamified environment translating complex Web3 governance into tactical simulation missions.",
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.05)"
  },
  {
    icon: <Target size={24} />,
    title: "Rewards",
    question: "How do I earn tokens?",
    answer: "Achieve 100% accuracy in missions to trigger the milestone reward system and claim on-chain tokens.",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.05)"
  },
  {
    icon: <Zap size={24} />,
    title: "Tactical",
    question: "What are 'Lifelines'?",
    answer: "Emergency countermeasures including 50/50 purges and shield protection to prevent mission failure.",
    color: "#eab308",
    bg: "rgba(234, 179, 8, 0.05)"
  },
  {
    icon: <Activity size={24} />,
    title: "Access",
    question: "Is it free to play?",
    answer: "Affirmative. Access to all training sectors is zero-cost to ensure inclusive governance education.",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.05)"
  },
  {
    icon: <Wallet size={24} />,
    title: "Security",
    question: "Do I need a wallet?",
    answer: "Required only for claiming on-chain rewards and rank verification. Supports MetaMask and Valora.",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.05)"
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Network",
    question: "Network Support?",
    answer: "Exclusively supports the Celo ecosystem and social impact protocols like GoodDollar.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.05)"
  }
];

const FAQ = () => {
  return (
    <section id="faq" style={{
      padding: '120px 0',
      backgroundColor: '#050a15',
      position: 'relative',
    }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '900',
            color: '#a855f7',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            display: 'block',
            marginBottom: '16px'
          }}>
            Support Knowledge Base
          </span>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: '900',
            color: 'white',
            letterSpacing: '-0.04em',
            lineHeight: '1.1'
          }}>
            Explore the <span style={{ color: '#a855f7' }}>Master Files</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {faqData.map((faq, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#0a0f1e',
                border: '1px solid #1e293b',
                borderRadius: '24px',
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = faq.color;
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${faq.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e293b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Corner Glow */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${faq.color}15 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: faq.bg,
                  color: faq.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${faq.color}10`
                }}>
                  {faq.icon}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '900',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {faq.title}
                </span>
              </div>

              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#94a3b8',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {faq.answer}
                </p>
              </div>

              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: faq.color,
                fontSize: '0.75rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: 0.8
              }}>
                Intelligence Verified <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decorative section */}
        <div style={{
          marginTop: '80px',
          padding: '40px',
          borderRadius: '32px',
          background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1px solid #1e293b',
          textAlign: 'center'
        }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>
            Still have questions? Join our <span style={{ color: 'white' }}>Mission Discord</span> or contact the support staff directly.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;




