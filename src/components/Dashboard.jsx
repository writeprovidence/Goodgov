import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { 
  Book,
  BookOpen, 
  MessageSquare, 
  Bell, 
  User, 
  ArrowLeft, 
  ChevronRight,
  LogOut,
  Settings,
  Shield,
  Zap,
  Globe,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { 
  DAO_QUIZZES as daoQuizzes, 
  WEB3_ESSENTIALS_QUIZZES as web3Quizzes, 
  ECOSYSTEM_QUIZZES 
} from '../data/quizzes';
import { GLOSSARY_TERMS, GLOSSARY_CATEGORIES, CATEGORY_COLORS, GOVERNANCE_FORUMS } from '../data/glossary';
import LoadingScreen from './LoadingScreen';
import WalletDropdown from './WalletDropdown';

const GD_TOKEN_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
const GOODDAPP_URL = "https://gooddapp.org";
const GOODWALLET_URL = "https://wallet.gooddollar.org";

// Deployed QuizRewards contract on Celo Mainnet (nonce 25)
const QUIZ_REWARDS_CONTRACT = "0x66A159A0F8E204383D3c32Acf5DaF97f23541989";



const SidebarItem = ({ icon: Icon, label, active, onClick, style = {} }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      backgroundColor: active ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
      color: active ? '#2dd4bf' : '#94a3b8',
      transition: 'all 0.2s ease',
      marginBottom: '4px',
      fontWeight: active ? '700' : '500',
      border: active ? '1px solid rgba(45, 212, 191, 0.2)' : '1px solid transparent',
      ...style
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.backgroundColor = 'transparent';
    }}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span style={{ fontSize: '0.9rem' }}>{label}</span>
  </div>
);

import { QuizCard } from './QuizElements';

const Dashboard = ({ onBack, initialMode, initialTab }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const [activeTab, setActiveTab] = useState(initialTab || 'Knowledge Base');
  const [currentView, setCurrentView] = useState('selection');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeQuizStage, setActiveQuizStage] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [lifelines, setLifelines] = useState({ fiftyFifty: true, lifeline: true });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionReady, setQuestionReady] = useState(false);
  const [readyCountdown, setReadyCountdown] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const walletAddress = user?.wallet?.address;
  const isLoggedIn = authenticated;
  const isConnecting = false; // Privy handles connection state internally
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null);
  const [showClaimSuccessModal, setShowClaimSuccessModal] = useState(false);
  const [claimedRewardsHistory, setClaimedRewardsHistory] = useState(() => {
    const saved = localStorage.getItem('goodgov_claim_history');
    return saved ? JSON.parse(saved) : {}; // { quizId: { amount: 10, timestamp: ms } }
  });

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    if (!wallets || wallets.length === 0) {
      alert("Please connect your wallet first.");
      login();
      return;
    }
    try {
      const eip1193provider = await wallets[0].getEthereumProvider();
      const provider = new ethers.providers.Web3Provider(eip1193provider);
      const { ClaimSDK } = await import("@gooddollar/web3sdk-v2");
      const sdk = new ClaimSDK(provider, "production-celo");
      
      const callbackUrl = window.location.href;
      const popupMode = true;
      
      const link = await sdk.generateFVLink("Agent", callbackUrl, popupMode, 42220);
      if (popupMode) {
        window.open(link, 'GoodDollar Verification', 'width=400,height=600');
      } else {
        window.location.href = link;
      }
    } catch (err) {
      console.error("Verification error:", err);
      alert("Failed to initiate verification. " + err.message);
    }
  };
  const [selectedEcosystem, setSelectedEcosystem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('All');
  const [activeLetter, setActiveLetter] = useState('All');
  const [knowledgeSubTab, setKnowledgeSubTab] = useState('Web3 Basics');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchingQuiz, setLaunchingQuiz] = useState(null);
  // Contract address is now hardcoded — no need to read from localStorage
  const mainContentRef = useRef(null);
  const popupTimeoutRef = useRef(null);

  // Scroll main content to top whenever the active tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  const startQuiz = useCallback((quiz, stage) => {
    if (!quiz.questions || quiz.questions.length === 0) return;
    
    setLaunchingQuiz({ quiz, stage });
    setIsLaunching(true);

    // Do all quiz setup immediately
    // Shuffle and pick up to 20 questions from the pool
    const pool = [...quiz.questions].sort(() => 0.5 - Math.random());
    const selected = pool.slice(0, 20).map(q => {
      // Create a copy of options with their original index
      const optionsWithMeta = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correct
      }));
      
      // Shuffle the options
      const shuffledOptionsWithMeta = optionsWithMeta.sort(() => 0.5 - Math.random());
      
      return {
        ...q,
        options: shuffledOptionsWithMeta.map(o => o.text),
        correct: shuffledOptionsWithMeta.findIndex(o => o.isCorrect)
      };
    });
    
    setActiveQuiz(quiz);
    setShuffledQuestions(selected);
    setActiveQuizStage(stage);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowPopup(false);
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
    setScore(0);
    setQuizCompleted(false);
    setCurrentView('quiz');
    setLifelines({ fiftyFifty: true, lifeline: true });
    setHiddenOptions([]);
    setTimeLeft(30);
    setQuestionReady(false);
    setReadyCountdown(3);
    setClaimStatus(null);
  }, []);

  const handleLoadingComplete = () => {
    setIsLaunching(false);
    setLaunchingQuiz(null);
  };



  const [completedStages, setCompletedStages] = useState(() => {
    const saved = localStorage.getItem('goodgov_completed_stages');
    return saved ? JSON.parse(saved) : {
      'Mastery Challenges': false,
      'DAO knowledge': false,
      'Ecosystem specific': false,
      'Web3 Basics': false,
    };
  });
  const [perfectQuizzes, setPerfectQuizzes] = useState(() => {
    const saved = localStorage.getItem('goodgov_perfect_quizzes');
    return saved ? JSON.parse(saved) : {
      'Mastery Challenges': [],
      'DAO knowledge': [],
      'Ecosystem specific': [],
      'Web3 Basics': [],
    };
  });

  const [claimedRewards] = useState(() => {
    const saved = localStorage.getItem('goodgov_claimed_rewards');
    return saved ? JSON.parse(saved) : {
      'Mastery Challenges': false,
      'DAO knowledge': false,
      'Ecosystem specific': false,
      'Web3 Basics': false,
    };
  });

  useEffect(() => {
    localStorage.setItem('goodgov_claimed_rewards', JSON.stringify(claimedRewards));
  }, [claimedRewards]);



  useEffect(() => {
    localStorage.setItem('goodgov_completed_stages', JSON.stringify(completedStages));
  }, [completedStages]);

  useEffect(() => {
    localStorage.setItem('goodgov_perfect_quizzes', JSON.stringify(perfectQuizzes));
  }, [perfectQuizzes]);

  // Auto-launch quiz if initialMode is provided (from landing page game cards)
  useEffect(() => {
    if (!initialMode) return;
    const allQuizPool = [
      ...daoQuizzes,
      ...web3Quizzes,
      ...Object.values(ECOSYSTEM_QUIZZES).flat()
    ].filter(q => q.questions && q.questions.length > 0);
    if (allQuizPool.length === 0) return;
    const quiz = allQuizPool[Math.floor(Math.random() * allQuizPool.length)];
    // Small delay to allow state to settle
    setTimeout(() => startQuiz(quiz, quiz.stage || 'DAO knowledge'), 100);
  }, [initialMode, startQuiz]);

  // "Get Ready" countdown before each question
  useEffect(() => {
    if (currentView !== 'quiz' || quizCompleted || !activeQuiz || isLaunching) return;
    if (questionReady) return; // already ready
    if (readyCountdown <= 0) {
      setQuestionReady(true);
      return;
    }
    const interval = setInterval(() => {
      setReadyCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          setQuestionReady(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentView, quizCompleted, activeQuiz, isLaunching, questionReady, readyCountdown]);

  // Countdown timer (only starts when question is ready)
  useEffect(() => {
    if (currentView !== 'quiz' || isAnswered || quizCompleted || !activeQuiz || !questionReady) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentView, isAnswered, quizCompleted, activeQuiz, questionReady]);

  // Auto-mark answered when timer expires
  useEffect(() => {
    if (timeLeft === 0 && currentView === 'quiz' && !isAnswered && !quizCompleted) {
      const timer = setTimeout(() => {
        setIsAnswered(true);
        popupTimeoutRef.current = setTimeout(() => setShowPopup(true), 1500);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentView, isAnswered, quizCompleted]);

  const categories = ['All', 'DAO knowledge', 'Ecosystem specific', 'Web3 Basics'];

  // Redundant tab reset effect removed to fix sidebar navigation functionality

  const stageQuizCounts = { 
    'Mastery Challenges': [
      ...daoQuizzes,
      ...web3Quizzes,
    ].filter(q => q.questions && q.questions.length >= 20).length,
    'DAO knowledge': daoQuizzes.length, 
    'Ecosystem specific': Object.values(ECOSYSTEM_QUIZZES).flat().length, 
    'Web3 Basics': web3Quizzes.length 
  };

  const allStagesComplete = completedStages['DAO knowledge'] && completedStages['Ecosystem specific'] && completedStages['Web3 Basics'];



  const ecosystems = [
    { name: 'GoodDollar', icon: 'G', logo: '/gooddollar-logo.svg', color: '#00c3ae', desc: 'A multi-chain system that sustainably funds UBI at scale.', slug: 'gooddollar' },
    { name: 'Zksync', icon: 'ZK', logo: 'https://www.zksync.io/brand/zksync-logo/zksync-logomark-light-transparent.svg', color: '#4c57d8', desc: 'Zero-Knowledge rollups for Ethereum scaling.', slug: 'zksync' },
    { name: 'Celo', icon: 'C', logo: 'https://celo-org.github.io/celo-token-list/assets/celo_logo.svg', color: '#fbcc5c', desc: 'Mobile-first blockchain for financial inclusion.', slug: 'celo' },
    { name: 'Optimism', icon: 'OP', logo: 'https://raw.githubusercontent.com/ethereum-optimism/brand-assets/main/logos/op-logo.svg', color: '#ff0420', desc: 'Layer 2 blockchain that scales Ethereum.', slug: 'optimism' },
    { name: 'Arbitrum', icon: 'A', logo: 'https://raw.githubusercontent.com/OffchainLabs/brand-assets/main/arbitrum-logo.svg', color: '#28a0f0', desc: 'Leading optimistic rollup for Ethereum.', slug: 'arbitrum' },
    { name: 'ENS', icon: '◇', logo: 'https://raw.githubusercontent.com/ensdomains/media-kit/main/Logos/ENS_Logo_Symbol_Color.svg', color: '#5298ff', desc: 'Turns wallet addresses into human-readable names.', slug: 'ens' },
  ];



  // Simulation historical data removed as it is handled via perfectQuizzes state

  const connectWallet = () => {
    login();
  };

  const disconnectWallet = () => {
    logout();
    setCurrentView('explore');
  };

  const handleDirectClaim = async () => {
    if (!walletAddress) {
      login();
      return;
    }

    const quizId = activeQuiz?.title || 'Grand Master Quiz';
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

    // 90-day cooldown check
    const existingClaim = claimedRewardsHistory[quizId];
    if (existingClaim) {
      const elapsed = Date.now() - existingClaim.timestamp;
      if (elapsed < NINETY_DAYS_MS) {
        const daysLeft = Math.ceil((NINETY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000));
        setClaimStatus({ success: false, message: `You can claim this reward again in ${daysLeft} day(s). Each quiz allows 1 claim per 90 days.` });
        return;
      }
    }
    
    setIsClaiming(true);
    setClaimStatus(null);
    
    const QUIZ_REWARDS_ADDRESS = QUIZ_REWARDS_CONTRACT;

    try {
      if (QUIZ_REWARDS_ADDRESS) {
        const sigRes = await fetch('/api/sign-reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: walletAddress, quizId, amount: 10 })
        });
        const sigData = await sigRes.json();
        if (!sigRes.ok) throw new Error(sigData.error || 'Failed to get signature');

        const eip1193provider = await wallets[0].getEthereumProvider();
        const provider = new ethers.providers.Web3Provider(eip1193provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          QUIZ_REWARDS_ADDRESS,
          [
            "function claimReward(string memory quizId, uint256 amount, bytes memory signature) external",
            "function hasClaimed(address user, string memory quizId) view returns (bool)"
          ],
          signer
        );
        const tx = await contract.claimReward(sigData.quizId, sigData.amount, sigData.signature);
        setClaimStatus({ success: true, message: "Transaction submitted! Waiting for confirmation..." });
        await tx.wait();
      } else {
        const res = await fetch(`${SERVER_URL}/api/claim-reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: walletAddress, quizId, amount: 10 })
        });
        if (!res.ok) throw new Error('Server unavailable. Make sure the backend is running on port 3001.');
        await res.json();
      }

      // Record the claim
      const newHistory = { ...claimedRewardsHistory, [quizId]: { amount: 10, timestamp: Date.now() } };
      setClaimedRewardsHistory(newHistory);
      localStorage.setItem('goodgov_claim_history', JSON.stringify(newHistory));
      setClaimStatus({ success: true });
      setShowClaimSuccessModal(true);
      
    } catch (err) {
      console.error(err);
      setClaimStatus({ 
        success: false, 
        message: err.message || "Failed to claim reward. Please try again later."
      });
    } finally {
      setIsClaiming(false);
    }
  };






  const startGlossaryQuiz = (targetTerm) => {
    // Pick 4 other terms from the same category for distractors
    const sameCatTerms = GLOSSARY_TERMS.filter(t => t.category === targetTerm.category && t.term !== targetTerm.term);
    const getRandomDistractors = (pool, count) => {
      return [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
    };

    // Question 1: True Definition of the target term
    const distractors1 = getRandomDistractors(sameCatTerms.length > 3 ? sameCatTerms : GLOSSARY_TERMS, 3);
    const q1 = {
      question: `What is the true and complete definition of "${targetTerm.term}"?`,
      options: [targetTerm.definition, ...distractors1.map(d => d.definition)],
      correct: 0,
      explanation: `The full definition of ${targetTerm.term} is: ${targetTerm.definition}`
    };

    // Question 2: Category association
    const allCats = GLOSSARY_CATEGORIES.filter(c => c !== 'All' && c !== targetTerm.category);
    const distractors2 = getRandomDistractors(allCats, 3);
    const q2 = {
      question: `Based on its definitive purpose, in which sector does "${targetTerm.term}" operate?`,
      options: [targetTerm.category, ...distractors2],
      correct: 0,
      explanation: `${targetTerm.term} is a core component of the ${targetTerm.category} sector in the Web3 ecosystem.`
    };

    // Question 3: Random terms from the same category to round out the quiz
    const roundOut = getRandomDistractors(sameCatTerms, 2);
    const additionalQuestions = roundOut.map(t => {
      const dist = getRandomDistractors(GLOSSARY_TERMS.filter(item => item.term !== t.term), 3);
      return {
        question: `Identify the true definition for the related term: "${t.term}"`,
        options: [t.definition, ...dist.map(d => d.definition)],
        correct: 0,
        explanation: `${t.term} correctly means: ${t.definition}`
      };
    });

    const quiz = {
      title: `${targetTerm.term} Intelligence Check`,
      description: `Test your mastery of ${targetTerm.term} and related ${targetTerm.category} concepts.`,
      questions: [q1, q2, ...additionalQuestions],
      stage: 'Knowledge Base'
    };

    startQuiz(quiz, 'Knowledge Base');
  };

  const handleUseLifeline = (type) => {
    if (!lifelines[type] || isAnswered) return;
    
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correctIndex = currentQuestion.correct;
    
    // Get indices of incorrect answers that are NOT already hidden
    const incorrectIndices = currentQuestion.options
      .map((_, i) => i)
      .filter(i => i !== correctIndex && !hiddenOptions.includes(i));
      
    // Shuffle and pick 2 to hide (or all remaining if fewer than 2)
    const toHide = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    // Merge with already-hidden options so using both lifelines leaves only the correct answer
    setHiddenOptions(prev => [...prev, ...toHide]);
    setLifelines(prev => ({ ...prev, [type]: false }));
  };

  const handleOptionSelect = (index) => {
    if (isAnswered || hiddenOptions.includes(index) || !questionReady) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === shuffledQuestions[currentQuestionIndex].correct) {
      setScore(s => s + 1);
    }
    popupTimeoutRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 1500);
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < shuffledQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowPopup(false);
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }
      setHiddenOptions([]);
      setTimeLeft(30);
      setQuestionReady(false);
      setReadyCountdown(3);
    } else {
      setQuizCompleted(true);
      const isPerfect = score === shuffledQuestions.length;
      if (isLoggedIn && isPerfect && activeQuizStage && activeQuizStage !== 'Knowledge Base') {
        setPerfectQuizzes(prev => {
          const currentStageQuizzes = prev[activeQuizStage] || [];
          // Only add if not already present to ensure unique quiz completion
          if (!currentStageQuizzes.includes(activeQuiz.title)) {
            const updatedQuizzes = [...currentStageQuizzes, activeQuiz.title];
            const updated = { ...prev, [activeQuizStage]: updatedQuizzes };
            
            // Check if stage is now complete
            const requiredCount = stageQuizCounts[activeQuizStage] || 1;
            if (updatedQuizzes.length >= requiredCount) {
              setCompletedStages(cs => ({ ...cs, [activeQuizStage]: true }));
            }
            return updated;
          }
          return prev;
        });
      }
    }
  };

  const getNextQuiz = () => {
    let source;
    if (activeQuizStage === 'DAO knowledge') source = daoQuizzes;
    else if (activeQuizStage === 'Web3 Basics') source = web3Quizzes;
    else return null;

    const currentIndex = source.findIndex(q => q.title === activeQuiz.title);
    if (currentIndex !== -1 && currentIndex < source.length - 1) {
      return source[currentIndex + 1];
    }
    return null;
  };

  const renderQuizView = () => {
    if (!activeQuiz || !activeQuiz.questions) {
      return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0a0f1e', color: 'white', zIndex: 100, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>No questions available for this quiz yet.</h2>
          <button onClick={() => setCurrentView('explore')} className="btn-primary" style={{ marginTop: '20px' }}>Go Back</button>
        </div>
      );
    }

    if (quizCompleted) {
      const isPerfectRun = score === shuffledQuestions.length;
      const isGlossaryQuiz = activeQuizStage === 'Knowledge Base';

      if (isGlossaryQuiz) {
        return (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: '#050a15', color: 'white', zIndex: 1100, padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ fontSize: '5rem', marginBottom: '24px' }}>📊</div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>Intelligence Check Complete</h2>
              <div style={{ backgroundColor: '#0f172a', border: '1.5px solid #1e293b', borderRadius: '24px', padding: '40px', marginBottom: '32px' }}>
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Final Score</div>
                <div style={{ fontSize: '4rem', fontWeight: '900', color: '#2dd4bf' }}>{score}/{shuffledQuestions.length}</div>
                <div style={{ marginTop: '16px', color: '#94a3b8', fontSize: '0.95rem' }}>{activeQuiz.title}</div>
              </div>
              <button 
                onClick={() => { setCurrentView('selection'); setActiveQuiz(null); setQuizCompleted(false); }}
                style={{ width: '100%', padding: '20px', borderRadius: '16px', fontWeight: '800', fontSize: '1.1rem', background: '#2dd4bf', color: 'black', border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(45, 212, 191, 0.2)' }}
              >
                RETURN TO GLOSSARY
              </button>
            </div>
          </div>
        );
      }

      return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#050a15', color: 'white', zIndex: 1100, padding: isMobile ? '24px 16px' : '40px', paddingTop: isMobile ? '60px' : '40px', overflowY: 'auto', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '700px', width: '100%' }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ 
                width: '96px', 
                height: '96px', 
                borderRadius: '24px', 
                background: isPerfectRun ? 'linear-gradient(135deg, rgba(45,212,191,0.2) 0%, rgba(45,212,191,0.05) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)', 
                border: `1.5px solid ${isPerfectRun ? 'rgba(45,212,191,0.3)' : 'rgba(239,68,68,0.3)'}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '3rem',
                margin: '0 auto 24px',
                boxShadow: isPerfectRun ? '0 20px 60px rgba(45,212,191,0.15)' : '0 20px 60px rgba(239,68,68,0.1)'
              }}>
                {isPerfectRun ? '🏆' : '📊'}
              </div>
              <h2 style={{ 
                fontSize: '2.25rem', 
                fontWeight: '800', 
                marginBottom: '8px', 
                letterSpacing: '-0.02em',
                background: isPerfectRun ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)' : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {isPerfectRun ? 'Perfect Mastery!' : 'Quiz Complete'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
                {activeQuiz.title}
              </p>
            </div>

            {/* Score Card */}
            <div style={{ 
              background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)', 
              border: '1.5px solid #1e293b', 
              borderRadius: '24px', 
              padding: '32px', 
              marginBottom: '24px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Final Score</div>
                  <div style={{ fontSize: '4rem', fontWeight: '900', lineHeight: 1, color: isPerfectRun ? '#2dd4bf' : '#94a3b8' }}>
                    {score}/{shuffledQuestions.length}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Accuracy</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', lineHeight: 1, color: isPerfectRun ? '#2dd4bf' : '#94a3b8' }}>
                    {Math.round((score / shuffledQuestions.length) * 100)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(score / shuffledQuestions.length) * 100}%`, 
                    height: '100%', 
                    background: isPerfectRun ? 'linear-gradient(90deg, #2dd4bf 0%, #14b8a6 100%)' : 'linear-gradient(90deg, #64748b 0%, #475569 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
                  }} />
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ 
                padding: '14px 20px', 
                borderRadius: '14px', 
                backgroundColor: isPerfectRun ? 'rgba(45, 212, 191, 0.08)' : 'rgba(100, 116, 139, 0.1)', 
                border: `1.5px solid ${isPerfectRun ? 'rgba(45, 212, 191, 0.25)' : 'rgba(100, 116, 139, 0.25)'}`, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px'
              }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: isPerfectRun ? '#2dd4bf' : '#64748b', 
                  boxShadow: `0 0 12px ${isPerfectRun ? 'rgba(45,212,191,0.4)' : 'rgba(100,116,139,0.4)'}` 
                }} />
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isPerfectRun ? '#2dd4bf' : '#94a3b8' }}>
                  {isPerfectRun ? '✓ Stage cleared with 100% accuracy!' : 'Mission completed — great effort!'}
                </span>
              </div>
            </div>

            {/* Reward Section (if applicable) */}
            {isPerfectRun && shuffledQuestions.length === 20 && (() => {
              const quizId = activeQuiz?.title || 'Grand Master Quiz';
              const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
              const existingClaim = claimedRewardsHistory[quizId];
              const alreadyClaimed = existingClaim && (Date.now() - existingClaim.timestamp) < NINETY_DAYS_MS;
              const daysUntilNext = alreadyClaimed ? Math.ceil((NINETY_DAYS_MS - (Date.now() - existingClaim.timestamp)) / (24*60*60*1000)) : 0;
              return (
                <div style={{ 
                  background: alreadyClaimed
                    ? 'linear-gradient(180deg, rgba(100,116,139,0.08) 0%, rgba(100,116,139,0.03) 100%)'
                    : 'linear-gradient(180deg, rgba(45,212,191,0.1) 0%, rgba(45,212,191,0.03) 100%)', 
                  border: `1.5px solid ${alreadyClaimed ? 'rgba(100,116,139,0.3)' : 'rgba(45,212,191,0.3)'}`, 
                  borderRadius: '24px', 
                  padding: '28px', 
                  marginBottom: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Shimmer effect for unclaimed */}
                  {!alreadyClaimed && (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(45,212,191,0.05) 50%, transparent 60%)', animation: 'shimmer 3s infinite', pointerEvents: 'none' }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ 
                      width: '52px', height: '52px', borderRadius: '16px',
                      background: alreadyClaimed ? 'rgba(100,116,139,0.15)' : 'rgba(45,212,191,0.15)',
                      border: `1px solid ${alreadyClaimed ? 'rgba(100,116,139,0.3)' : 'rgba(45,212,191,0.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0
                    }}>
                      {alreadyClaimed ? '✅' : '🏅'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '900', color: alreadyClaimed ? '#94a3b8' : '#2dd4bf', fontSize: '1.05rem', marginBottom: '3px' }}>
                        {alreadyClaimed ? 'Reward Already Claimed' : '🎉 Reward Unlocked — 10 G$'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {alreadyClaimed 
                          ? `Next claim available in ${daysUntilNext} day${daysUntilNext !== 1 ? 's' : ''}` 
                          : 'You earned 10 GoodDollar for perfect mastery'}
                      </div>
                    </div>
                  </div>

                  {alreadyClaimed ? (
                    <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Cooldown active · 1 claim per 90 days per quiz</span>
                    </div>
                  ) : claimStatus && !claimStatus.success ? (
                    <div style={{ padding: '14px 18px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.88rem', fontWeight: '600' }}>
                      ⚠️ {claimStatus.message}
                    </div>
                  ) : (
                    <button 
                      onClick={handleDirectClaim}
                      disabled={isClaiming}
                      style={{ 
                        width: '100%', 
                        padding: '18px 24px', 
                        borderRadius: '16px', 
                        background: isClaiming ? '#1e293b' : 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', 
                        color: isClaiming ? '#64748b' : '#000', 
                        fontWeight: '900', 
                        border: 'none',
                        cursor: isClaiming ? 'wait' : 'pointer', 
                        fontSize: '1rem',
                        letterSpacing: '0.02em',
                        boxShadow: isClaiming ? 'none' : '0 8px 32px rgba(45,212,191,0.3)',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                      }}
                      onMouseEnter={(e) => { if (!isClaiming) { e.currentTarget.style.boxShadow = '0 12px 40px rgba(45,212,191,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
                      onMouseLeave={(e) => { if (!isClaiming) { e.currentTarget.style.boxShadow = '0 8px 32px rgba(45,212,191,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
                    >
                      {isClaiming ? (
                        <><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #475569', borderTopColor: '#2dd4bf', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                      ) : (
                        <>🏆 Claim 10 G$ Reward</>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getNextQuiz() && (
                <button 
                  onClick={() => startQuiz(getNextQuiz(), activeQuizStage)}
                  style={{ 
                    width: '100%', 
                    padding: '18px 24px', 
                    borderRadius: '14px', 
                    fontWeight: '800', 
                    fontSize: '1rem', 
                    background: '#0f172a', 
                    color: 'white', 
                    border: '1.5px solid #1e293b', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2dd4bf';
                    e.currentTarget.style.backgroundColor = 'rgba(45,212,191,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e293b';
                    e.currentTarget.style.backgroundColor = '#0f172a';
                  }}
                >
                  Continue to Next Mission →
                </button>
              )}

              <button 
                onClick={() => { setCurrentView('selection'); setActiveQuiz(null); setQuizCompleted(false); }} 
                style={{ 
                  background: 'transparent', 
                  border: '1.5px solid #1e293b', 
                  color: '#64748b', 
                  width: '100%', 
                  padding: '16px 24px', 
                  borderRadius: '14px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.color = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e293b';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                Choose New Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    const isPerfectSoFar = score === currentQuestionIndex || (isAnswered && score === currentQuestionIndex + 1);
    const timerRadius = 20;
    const timerCircumference = 2 * Math.PI * timerRadius;
    const timerColor = timeLeft > 15 ? '#2dd4bf' : timeLeft > 5 ? '#fbbf24' : '#ef4444';
    const timerDashOffset = timerCircumference * (1 - timeLeft / 30);
    const timedOut = timeLeft === 0 && isAnswered && selectedOption === null;

    const handleExitConfirm = () => {
      setShowExitModal(false);
      setActiveQuiz(null);
      setQuizCompleted(false);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowPopup(false);
      setCurrentView('selection');
    };

    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#050a15', color: 'white', zIndex: 1001, display: 'flex' }}>
        {/* Exit Confirmation Modal */}
        {showExitModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}>
            <div style={{
              backgroundColor: '#0f172a',
              border: '1.5px solid #1e293b',
              borderRadius: '28px',
              padding: '40px 36px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
                Abort Mission?
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
                Your current progress will be <strong style={{ color: '#ef4444' }}>lost</strong> and any token rewards for this run will not be counted.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowExitModal(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px',
                    background: 'none', border: '1.5px solid #1e293b',
                    color: '#94a3b8', fontWeight: '700', fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  Stay in Mission
                </button>
                <button
                  onClick={handleExitConfirm}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none', color: 'white',
                    fontWeight: '800', fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(239,68,68,0.3)'
                  }}
                >
                  Exit Quiz
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Get Ready Countdown Overlay */}
        {!questionReady && !quizCompleted && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1999,
            backgroundColor: 'rgba(5, 10, 21, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              width: '120px', height: '120px',
              borderRadius: '50%',
              border: '3px solid rgba(45, 212, 191, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              marginBottom: '28px'
            }}>
              {/* Animated ring */}
              <svg width="120" height="120" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="57" fill="none" stroke="#2dd4bf" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 57}`}
                  strokeDashoffset={`${2 * Math.PI * 57 * (1 - readyCountdown / 3)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.9s ease-in-out', filter: 'drop-shadow(0 0 8px rgba(45,212,191,0.5))' }}
                />
              </svg>
              <span style={{
                fontSize: '3rem', fontWeight: '900', color: '#2dd4bf',
                fontFamily: "'PP Mori', sans-serif",
                textShadow: '0 0 20px rgba(45,212,191,0.4)'
              }}>
                {readyCountdown}
              </span>
            </div>
            <div style={{
              fontSize: '0.7rem', fontWeight: '800', color: '#2dd4bf',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              marginBottom: '8px', opacity: 0.9
            }}>
              Get Ready
            </div>
            <div style={{
              fontSize: '0.75rem', color: '#475569', fontWeight: '600',
              letterSpacing: '0.05em'
            }}>
              Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
            </div>
          </div>
        )}
        {!isMobile && (
          <div style={{ width: '280px', minWidth: '280px', backgroundColor: '#0a0f1e', borderRight: '1px solid #1e293b', padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', boxSizing: 'border-box', gap: '24px' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ padding: '14px 16px', backgroundColor: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Mission</div>
                <h2 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', margin: 0, lineHeight: '1.3' }}>{activeQuiz.title}</h2>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '16px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Live Score</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'white', fontFamily: "'PP Mori', sans-serif", letterSpacing: '0.05em' }}>{score * 100}</div>
              </div>
              <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '16px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#2dd4bf' }}>{currentQuestionIndex + 1}/{shuffledQuestions.length}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#2dd4bf', boxShadow: '0 0 10px rgba(45,212,191,0.4)', transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
              <div style={{ backgroundColor: isPerfectSoFar ? 'rgba(45,212,191,0.05)' : 'rgba(239,68,68,0.07)', borderRadius: '16px', padding: '16px', border: `1px solid ${isPerfectSoFar ? '#2dd4bf40' : '#ef444440'}`, position: 'relative', overflow: 'hidden' }}>
                {!isPerfectSoFar && (<div style={{ position: 'absolute', top: 0, right: 0, padding: '3px 8px', backgroundColor: '#ef4444', color: 'white', fontSize: '0.55rem', fontWeight: '900', letterSpacing: '0.1em', borderBottomLeftRadius: '8px' }}>ALARM</div>)}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isPerfectSoFar ? 0 : '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isPerfectSoFar ? '#2dd4bf' : '#ef4444', boxShadow: `0 0 8px ${isPerfectSoFar ? '#2dd4bf' : '#ef4444'}`, animation: isPerfectSoFar ? 'none' : 'pulse 1s infinite', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: isPerfectSoFar ? '#2dd4bf' : '#ef4444', letterSpacing: '0.04em' }}>
                    {isPerfectSoFar ? 'PERFECT RUN ACTIVE' : 'CRITICAL FAILURE'}
                  </div>
                </div>
                {!isPerfectSoFar && (<div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '600', lineHeight: '1.4' }}>TOKEN REWARD LOCKED. YOU MAY CONTINUE THE MISSION FOR RANK, BUT CANNOT CLAIM TOKENS.</div>)}
              </div>
              <div style={{ backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: '#3b82f6', color: 'white', display: 'flex' }}><Bell size={12} /></div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase' }}>Tactical Briefing</span>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
                  Stuck? Use <strong>50/50</strong> or <strong>Lifeline</strong> to remove two decoys. 
                  Mistakes lock rewards, but the mission continues. Master the data to earn your rank.
                </p>
              </div>
              {isPerfectSoFar && score > 0 && (
                <div style={{ textAlign: 'center', padding: '14px 16px', backgroundColor: '#111827', borderRadius: '16px', border: '1px solid #1e293b', animation: 'fadeIn 0.4s ease-out' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Accuracy Streak</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    {[...Array(score)].map((_, i) => (<div key={i} style={{ width: '10px', height: '10px', backgroundColor: '#fbbf24', borderRadius: '2px', boxShadow: '0 0 6px #fbbf24' }} />))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Universal Quiz HUD */}
          <div style={{ 
            backgroundColor: '#0a0f1e', 
            borderBottom: '1px solid #1e293b', 
            padding: isMobile ? '12px 20px' : '16px 40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '20px',
            flexShrink: 0,
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Exit Quiz Button — always visible */}
              <button
                onClick={() => setShowExitModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: isMobile ? '7px 12px' : '8px 16px',
                  borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1.5px solid rgba(239,68,68,0.35)',
                  color: '#ef4444',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.22)';
                  e.currentTarget.style.borderColor = '#ef4444';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                }}
              >
                <X size={13} />
                {!isMobile && 'EXIT QUIZ'}
              </button>
              {!isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MISSION ACTIVE</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '400px' }}>
              {!isMobile && <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', whiteSpace: 'nowrap' }}>Q{currentQuestionIndex + 1}/{shuffledQuestions.length}</span>}
              <div style={{ flex: 1, height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#2dd4bf', boxShadow: '0 0 10px rgba(45,212,191,0.4)', transition: 'width 0.4s' }} />
              </div>
              {isMobile && <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2dd4bf' }}>{currentQuestionIndex + 1}/{shuffledQuestions.length}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleUseLifeline('fiftyFifty')}
                  disabled={!lifelines.fiftyFifty || isAnswered}
                  style={{ 
                    padding: isMobile ? '6px 12px' : '8px 16px', 
                    borderRadius: '10px', 
                    backgroundColor: lifelines.fiftyFifty ? 'rgba(45,212,191,0.1)' : 'rgba(30,41,59,0.5)', 
                    border: `1px solid ${lifelines.fiftyFifty ? '#2dd4bf30' : '#1e293b'}`, 
                    color: lifelines.fiftyFifty ? '#2dd4bf' : '#475569', 
                    fontSize: '0.7rem', 
                    fontWeight: '800', 
                    cursor: lifelines.fiftyFifty ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Zap size={12} /> 50/50
                </button>
                <button 
                  onClick={() => handleUseLifeline('lifeline')}
                  disabled={!lifelines.lifeline || isAnswered}
                  style={{ 
                    padding: isMobile ? '6px 12px' : '8px 16px', 
                    borderRadius: '10px', 
                    backgroundColor: lifelines.lifeline ? 'rgba(168,85,247,0.1)' : 'rgba(30,41,59,0.5)', 
                    border: `1px solid ${lifelines.lifeline ? '#a855f730' : '#1e293b'}`, 
                    color: lifelines.lifeline ? '#a855f7' : '#475569', 
                    fontSize: '0.7rem', 
                    fontWeight: '800', 
                    cursor: lifelines.lifeline ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Shield size={12} /> LIFELINE
                </button>
              </div>
              
              {/* Circular Timer */}
              <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="24" cy="24" r={timerRadius} fill="none" stroke="#1e293b" strokeWidth="3" />
                  <circle cx="24" cy="24" r={timerRadius} fill="none" stroke={timerColor} strokeWidth="3"
                    strokeDasharray={timerCircumference} strokeDashoffset={timerDashOffset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease', filter: `drop-shadow(0 0 5px ${timerColor})` }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '900', color: timerColor, fontFamily: "'PP Mori', sans-serif",
                  animation: timeLeft <= 5 && !isAnswered ? 'pulse 0.8s infinite' : 'none'
                }}>{timeLeft}</div>
              </div>
              {!isMobile && (
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>SCORE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white', fontFamily: "'PP Mori', sans-serif" }}>{score * 100}</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 1, padding: isMobile ? '24px 16px' : '60px 80px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '720px' }}>
              <div style={{ backgroundColor: '#111827', border: '1.5px solid #1e293b', borderRadius: '32px', padding: isMobile ? '24px' : '48px', marginBottom: '32px', position: 'relative' }}>
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' }}>QUESTION {currentQuestionIndex + 1}</span>
                    {timedOut && (
                      <span style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '6px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid rgba(239,68,68,0.3)' }}>⏰ TIME'S UP!</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.6rem', fontWeight: '800', color: 'white', marginTop: '20px', lineHeight: '1.3' }}>{currentQuestion.question}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {currentQuestion.options.map((opt, idx) => {
                    const isCorrect = idx === currentQuestion.correct;
                    const isSelected = selectedOption === idx;
                    const isHidden = hiddenOptions.includes(idx);
                    let status = 'default';
                    if (isAnswered) {
                      if (isCorrect) status = 'correct';
                      else if (isSelected) status = 'incorrect';
                    }
                    return (
                      <div
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '16px', 
                          padding: '20px 24px', 
                          borderRadius: '20px', 
                          border: `2px solid ${status === 'correct' ? '#10b981' : status === 'incorrect' ? '#ef4444' : isSelected ? '#2dd4bf' : '#1e293b'}`, 
                          backgroundColor: status === 'correct' ? 'rgba(16,185,129,0.1)' : status === 'incorrect' ? 'rgba(239,68,68,0.1)' : isSelected ? 'rgba(45,212,191,0.05)' : '#0f172a', 
                          cursor: isAnswered || isHidden ? 'default' : 'pointer',
                          opacity: isHidden ? 0.2 : 1,
                          transition: 'all 0.2s',
                          animation: (isAnswered && isCorrect && !showPopup) ? 'blink-correct 0.25s ease-in-out infinite alternate' : 'none'
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: status === 'correct' ? '#10b981' : status === 'incorrect' ? '#ef4444' : isSelected ? '#2dd4bf' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '900', color: 'black' }}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span style={{ fontWeight: '600', color: 'white' }}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {showPopup && (
                <>
                  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 10, 21, 0.4)', zIndex: 1999, animation: 'fadeIn 0.3s ease-out', backdropFilter: 'blur(3px)' }} />
                  <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: isMobile ? 'calc(100% - 32px)' : '600px',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: '32px',
                    padding: isMobile ? '28px' : '40px',
                    zIndex: 2000,
                    boxShadow: '0 20px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
                    animation: 'popUpCenter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '64px', height: '64px', borderRadius: '20px', 
                        backgroundColor: 'rgba(45, 212, 191, 0.1)', 
                        border: '1px solid rgba(45, 212, 191, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 0 30px rgba(45, 212, 191, 0.15)'
                      }}>
                        <Zap size={32} color="#2dd4bf" />
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                          width: '100%',
                          padding: '24px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px' 
                        }}>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#2dd4bf', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Mission Intel</span>
                          <p style={{ fontSize: '1.1rem', color: '#e2e8f0', lineHeight: '1.6', margin: 0, fontWeight: '400' }}>
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => nextQuestion()}
                      style={{ 
                        width: '100%', 
                        background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
                        color: 'black', 
                        padding: '18px', 
                        borderRadius: '20px', 
                        fontWeight: '800', 
                        fontSize: '0.95rem', 
                        cursor: 'pointer', 
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(45, 212, 191, 0.25)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(45, 212, 191, 0.35)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 212, 191, 0.25)'; }}
                    >
                      {currentQuestionIndex + 1 === shuffledQuestions.length ? 'Finish mission' : 'Continue to next question'} →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // All available quizzes flattened into one pool
  // All available quizzes flattened into one pool removed as it is redundant

  // ── Mission filtering - (Handled specifically in sectors now) ──


  // ── Glossary filtering ──
  const allLetters = ['All', ...new Set(GLOSSARY_TERMS.map(t => t.letter)).values()].sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return a.localeCompare(b);
  });
  let filteredTerms = GLOSSARY_TERMS.filter(t =>
    t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (glossaryCategory !== 'All') filteredTerms = filteredTerms.filter(t => t.category === glossaryCategory);
  if (activeLetter !== 'All') filteredTerms = filteredTerms.filter(t => t.letter === activeLetter);

  // Forum filtering moved to renderForums for scoped use



  const renderKnowledgeBase = () => {

    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {/* ── Page Header ── */}
        <div style={{ 
          backgroundColor: '#0f172a', borderRadius: '32px', 
          padding: isMobile ? '24px 20px' : '28px 40px', marginBottom: '32px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '40px', boxShadow: '0 20px 80px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 70%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, #2dd4bf, transparent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Intelligence Matrix</span>
            </div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', color: 'white', marginBottom: '16px', fontFamily: "'PP Mori', sans-serif", letterSpacing: '-0.03em' }}>Knowledge <span style={{ color: '#2dd4bf' }}>Base</span></h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.7', maxWidth: '680px', marginBottom: '16px' }}>
              Master Web3 and DAO mechanics through interactive missions. Earn on-chain rank and claim unique rewards.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '12px', background: 'rgba(45, 212, 191, 0.08)', border: '1px solid rgba(45, 212, 191, 0.2)', marginBottom: '0' }}>
              <span style={{ fontSize: '1.2rem' }}>🎁</span>
              <span style={{ fontSize: '0.88rem', color: '#2dd4bf', fontWeight: '700' }}>Complete missions and <strong>claim on-chain token rewards</strong> for every sector you master!</span>
            </div>
          </div>
          {!isMobile && (
            <div style={{ width: '220px', flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <img 
                src="/learning.png" 
                alt="Knowledge Base" 
                className="float-anim"
                style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))', zIndex: 1 }}
              />
            </div>
          )}
        </div>

        {/* Sub-Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
          {['Web3 Basics', 'DAO Knowledge', 'Ecosystem Specific'].map((tab) => (
            <button
              key={tab}
              onClick={() => setKnowledgeSubTab(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: knowledgeSubTab === tab ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
                color: knowledgeSubTab === tab ? '#2dd4bf' : '#64748b',
                border: '1.5px solid ' + (knowledgeSubTab === tab ? '#2dd4bf' : '#1e293b'),
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on sub-tab */}
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>

          {knowledgeSubTab === 'Web3 Basics' && (
            <div id="web3-basics-sector">
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {web3Quizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase())).map((quiz, i) => (
                  <div key={i} onClick={() => startQuiz(quiz, 'Web3 Basics')} style={{
                    backgroundColor: '#0a0f1e', border: '1.5px solid #1e293b', borderRadius: '22px',
                    padding: '26px', cursor: 'pointer', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                    display: 'flex', flexDirection: 'column', gap: '14px'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor='rgba(45,212,191,0.35)'; e.currentTarget.style.boxShadow='0 18px 40px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='#1e293b'; e.currentTarget.style.boxShadow='none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width:'52px', height:'52px', background:'rgba(255,255,255,0.04)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>{quiz.emoji || '🌐'}</div>
                      <div style={{ padding:'3px 9px', borderRadius:'6px', background:'rgba(255,255,255,0.05)', fontSize:'0.62rem', fontWeight:'600', color:'#64748b' }}>{quiz.level || 'Beginner'}</div>
                    </div>
                    <div>
                      <h3 style={{ fontSize:'1rem', fontWeight:'700', color:'white', marginBottom:'6px' }}>{quiz.title}</h3>
                      <p style={{ fontSize:'0.8rem', color:'#94a3b8', lineHeight:'1.5', margin:0 }}>{quiz.description}</p>
                    </div>
                    <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#2dd4bf', fontSize:'0.72rem', fontWeight:'700' }}>Start mission <ChevronRight size={13} /></div>
                      <span style={{ fontSize:'0.72rem', color:'#475569', fontWeight:'600' }}>{quiz.time || '10 min'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {knowledgeSubTab === 'DAO Knowledge' && (
            <div id="dao-knowledge-sector">
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {daoQuizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase())).map((quiz, i) => (
                  <div key={i} onClick={() => startQuiz(quiz, quiz.stage)} style={{
                    backgroundColor: '#0a0f1e', border: '1.5px solid #1e293b', borderRadius: '22px',
                    padding: '26px', cursor: 'pointer', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                    display: 'flex', flexDirection: 'column', gap: '14px'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor='rgba(45,212,191,0.35)'; e.currentTarget.style.boxShadow='0 18px 40px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='#1e293b'; e.currentTarget.style.boxShadow='none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width:'52px', height:'52px', background:'rgba(255,255,255,0.04)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>{quiz.emoji || '🏛️'}</div>
                      <div style={{ padding:'3px 9px', borderRadius:'6px', background:'rgba(255,255,255,0.05)', fontSize:'0.62rem', fontWeight:'600', color:'#64748b' }}>{quiz.level || 'Beginner'}</div>
                    </div>
                    <div>
                      <h3 style={{ fontSize:'1rem', fontWeight:'700', color:'white', marginBottom:'6px' }}>{quiz.title}</h3>
                      <p style={{ fontSize:'0.8rem', color:'#94a3b8', lineHeight:'1.5', margin:0 }}>{quiz.description}</p>
                    </div>
                    <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#2dd4bf', fontSize:'0.72rem', fontWeight:'700' }}>Start mission <ChevronRight size={13} /></div>
                      <span style={{ fontSize:'0.72rem', color:'#475569', fontWeight:'600' }}>{quiz.time || '10 min'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {knowledgeSubTab === 'Ecosystem Specific' && (
            <div id="ecosystem-sector">
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {Object.entries(ECOSYSTEM_QUIZZES).flatMap(([slug, quizzes]) => 
                  quizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase())).map((quiz, i) => {
                    const eco = ecosystems.find(e => e.slug === slug);
                    return (
                      <div key={`${slug}-${i}`} onClick={() => startQuiz(quiz, quiz.stage)} style={{
                        backgroundColor: '#0a0f1e', border: '1.5px solid #1e293b', borderRadius: '22px',
                        padding: '26px', cursor: 'pointer', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                        display: 'flex', flexDirection: 'column', gap: '14px'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor='rgba(45,212,191,0.35)'; e.currentTarget.style.boxShadow='0 18px 40px rgba(0,0,0,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='#1e293b'; e.currentTarget.style.boxShadow='none'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ 
                            width:'52px', height:'52px', background:'rgba(255,255,255,0.04)', 
                            borderRadius:'14px', display:'flex', alignItems:'center', 
                            justifyContent:'center', fontSize:'1.8rem', overflow: 'hidden'
                          }}>
                            {eco?.logo ? (
                              <img 
                                src={eco.logo} 
                                alt={eco.name} 
                                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                                onError={e => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerText = quiz.emoji || '🌐';
                                }}
                              />
                            ) : (
                              quiz.emoji || '🌐'
                            )}
                          </div>
                          <div style={{ padding:'3px 9px', borderRadius:'6px', background:'rgba(255,255,255,0.05)', fontSize:'0.62rem', fontWeight:'600', color:'#64748b' }}>{quiz.level || 'Intermediate'}</div>
                        </div>
                        <div>
                          <h3 style={{ fontSize:'1rem', fontWeight:'700', color:'white', marginBottom:'6px' }}>{quiz.title}</h3>
                          <p style={{ fontSize:'0.8rem', color:'#94a3b8', lineHeight:'1.5', margin:0 }}>{quiz.description}</p>
                        </div>
                        <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#2dd4bf', fontSize:'0.72rem', fontWeight:'700' }}>Start mission <ChevronRight size={13} /></div>
                          <span style={{ fontSize:'0.72rem', color:'#475569', fontWeight:'600' }}>{quiz.time || '10 min'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderGlossary = () => {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {/* ── Page Header Standardized ── */}
        <div style={{ 
          backgroundColor: '#0f172a', borderRadius: '32px', 
          padding: isMobile ? '24px 20px' : '28px 40px', marginBottom: '32px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '40px', boxShadow: '0 20px 80px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', zIndex: 0 }} />
          
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, #3b82f6, transparent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Intelligence Archives</span>
            </div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', color: 'white', marginBottom: '16px', fontFamily: "'PP Mori', sans-serif", letterSpacing: '-0.03em' }}>Intel <span style={{ color: '#3b82f6' }}>Glossary</span></h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.7', maxWidth: '680px', marginBottom: '16px' }}>
              Explore Web3 terminology made simple. Discover clear definitions that make the decentralized ecosystem easier to understand.
            </p>
          </div>
          {!isMobile && (
            <div style={{ width: '220px', flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <img 
                src="/glossary.png" 
                alt="Intel Glossary" 
                className="float-anim"
                style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))', zIndex: 1 }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {GLOSSARY_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setGlossaryCategory(cat); setActiveLetter('All'); }} style={{
              padding: '7px 16px', borderRadius: '100px',
              backgroundColor: glossaryCategory === cat ? (CATEGORY_COLORS[cat] || '#2dd4bf') : 'rgba(255,255,255,0.04)',
              color: glossaryCategory === cat ? 'black' : '#94a3b8',
              border: '1px solid ' + (glossaryCategory === cat ? (CATEGORY_COLORS[cat] || '#2dd4bf') : 'rgba(255,255,255,0.08)'),
              fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
            }}>{cat}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
          {allLetters.filter(l => l !== 'All').map(l => (
            <button key={l} onClick={() => setActiveLetter(l)} style={{
              width: '36px', height: '36px', padding: '0',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: activeLetter === l ? '#2dd4bf' : 'rgba(255,255,255,0.03)',
              color: activeLetter === l ? 'black' : '#64748b',
              border: '1px solid ' + (activeLetter === l ? '#2dd4bf' : 'rgba(255,255,255,0.06)'),
              fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.18s'
            }}>{l}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredTerms.map((term, i) => (
            <div key={i} onClick={() => startGlossaryQuiz(term)} style={{
              backgroundColor: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', borderLeft: `4px solid ${CATEGORY_COLORS[term.category] || '#2dd4bf'}`,
              cursor: 'pointer', position: 'relative', overflow: 'hidden'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)'; e.currentTarget.style.borderColor = '#2dd4bf50'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#1e293b'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', margin: 0 }}>{term.term}</h3>
                <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '900', backgroundColor: (CATEGORY_COLORS[term.category] || '#2dd4bf') + '20', color: CATEGORY_COLORS[term.category] || '#2dd4bf' }}>{term.category}</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{term.definition}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderForums = () => {
    // ── Forum filtering ──
    const filteredForums = GOVERNANCE_FORUMS.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {/* ── Page Header Standardized ── */}
        <div style={{ 
          backgroundColor: '#0f172a', borderRadius: '32px', 
          padding: isMobile ? '24px 20px' : '28px 40px', marginBottom: '32px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '40px', boxShadow: '0 20px 80px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', zIndex: 0 }} />
          
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, #a855f7, transparent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Governance Hub</span>
            </div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', color: 'white', marginBottom: '16px', fontFamily: "'PP Mori', sans-serif", letterSpacing: '-0.03em' }}>Governance <span style={{ color: '#a855f7' }}>Forums</span></h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.7', maxWidth: '680px', marginBottom: '16px' }}>
              Explore active governance spaces across the Web3 ecosystem. Read proposals, cast votes, and shape protocol decisions.
            </p>
          </div>
          {!isMobile && (
            <div style={{ width: '220px', flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <img 
                src="/governace.png" 
                alt="Governance Forums" 
                className="float-anim"
                style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))', zIndex: 1 }}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredForums.map((forum, i) => (
            <a key={i} href={forum.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#0a0f1e', border: '1.5px solid #1e293b',
                borderRadius: '24px', padding: '28px',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                borderTop: `4px solid ${forum.color}`,
                height: '100%', boxSizing: 'border-box'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 16px 40px ${forum.color}30`; e.currentTarget.style.borderColor=forum.color + '40'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#1e293b'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <img src={forum.logo} alt={forum.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = `<span style="font-weight:900;font-size:1.2rem;color:${forum.color}">${forum.fallback}</span>`; }}
                    />
                  </div>
                  <div>
                    <h3 style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>{forum.name}</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: forum.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{forum.category}</span>
                  </div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 20px 0' }}>{forum.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: forum.color, fontSize: '0.85rem', fontWeight: '900' }}>
                  Open Forum <ChevronRight size={14} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const totalScore = Object.values(perfectQuizzes).flat().length * 100;
    const completedCount = Object.values(perfectQuizzes).flat().length;
    const totalClaimed = Object.values(claimedRewardsHistory).reduce((sum, c) => sum + (c.amount || 0), 0);
    const claimCount = Object.keys(claimedRewardsHistory).length;
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

    return (
      <div style={{ 
        animation: 'fadeIn 0.3s ease-out',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: isMobile ? '0' : '0 40px'
      }}>

        {/* Profile Banner */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0f1a2e 0%, #0a1628 100%)',
          borderRadius: '32px', 
          padding: isMobile ? '32px 24px' : '48px 60px', marginBottom: '32px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '40px', boxShadow: '0 20px 80px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(45,212,191,0.15)'
        }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', zIndex: 0 }} />
          
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, #2dd4bf, transparent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Agent Profile</span>
            </div>
            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', color: 'white', marginBottom: '12px', letterSpacing: '-0.03em' }}>Mission <span style={{ color: '#2dd4bf' }}>Achievements</span></h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '560px', marginBottom: '24px' }}>
              Track your progress, earned rewards, and sector mastery across the decentralized frontier.
            </p>
            {walletAddress && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>{walletAddress.slice(0,6)}...{walletAddress.slice(-4)}</span>
              </div>
            )}
          </div>
          {!isMobile && (
            <div style={{ width: '150px', height: '150px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(45,212,191,0.2) 0%, transparent 70%)', filter: 'blur(20px)' }} />
              <div style={{ zIndex: 1, fontSize: '5rem', animation: 'float 4s ease-in-out infinite' }}>👤</div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Mastery', value: totalScore, suffix: 'PTS', color: '#2dd4bf', icon: '⚡' },
            { label: 'Missions Cleared', value: completedCount, suffix: 'SECURED', color: '#a855f7', icon: '🏛️' },
            { label: 'G$ Claimed', value: totalClaimed, suffix: 'G$', color: '#f59e0b', icon: '🏅' },
            { label: 'Claim Events', value: claimCount, suffix: 'TOTAL', color: '#3b82f6', icon: '📋' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '3rem', opacity: 0.06 }}>{stat.icon}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'white', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: stat.color, fontWeight: '800', marginTop: '4px' }}>{stat.suffix}</div>
            </div>
          ))}
        </div>

        {/* Sector Breakthroughs */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: isMobile ? '24px' : '36px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>Sector Breakthroughs</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.filter(c => c !== 'All').map(cat => {
              const count = perfectQuizzes[cat]?.length || 0;
              const total = stageQuizCounts[cat];
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: count > 0 ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: count > 0 ? '#2dd4bf' : '#475569', flexShrink: 0 }}>
                    {cat === 'DAO knowledge' ? <Shield size={18} /> : cat === 'Web3 Basics' ? <Zap size={18} /> : <Globe size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', color: 'white', fontSize: '0.9rem' }}>{cat.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</span>
                      <span style={{ fontSize: '0.8rem', color: count > 0 ? '#2dd4bf' : '#475569', fontWeight: '700' }}>{count}/{total}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg, #2dd4bf, #14b8a6)' : '#2dd4bf', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claim History */}
        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '24px', padding: isMobile ? '24px' : '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏅</div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>G$ Reward History</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>10 G$ per quiz · 90-day cooldown applies</p>
            </div>
          </div>
          {claimCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.4 }}>🪙</div>
              <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>No claims yet</div>
              <div style={{ color: '#334155', fontSize: '0.8rem', marginTop: '4px' }}>Complete a quiz with a perfect score to earn 10 G$</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(claimedRewardsHistory).map(([qId, claim], i) => {
                const elapsed = Date.now() - claim.timestamp;
                const cooldownActive = elapsed < NINETY_DAYS_MS;
                const daysLeft = Math.ceil((NINETY_DAYS_MS - elapsed) / (24*60*60*1000));
                const claimDate = new Date(claim.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.5)', flexShrink: 0 }} />
                      <div>
                        <div style={{ color: 'white', fontWeight: '700', fontSize: '0.88rem' }}>{qId}</div>
                        <div style={{ color: '#475569', fontSize: '0.75rem' }}>{claimDate}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '900', color: '#f59e0b', fontSize: '0.95rem' }}>+{claim.amount} G$</span>
                      {cooldownActive && (
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.2)', padding: '4px 10px', borderRadius: '100px' }}>
                          Next in {daysLeft}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: '8px', padding: '14px 18px', borderRadius: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>Total Earned</span>
                <span style={{ fontWeight: '900', color: '#f59e0b', fontSize: '1.1rem' }}>{totalClaimed} G$</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', background: '#2dd4bf', borderRadius: '50%', boxShadow: '0 0 10px #2dd4bf' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Control Center</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Terminal <span style={{ color: '#2dd4bf' }}>Config</span></h2>
          <p style={{ color: '#94a3b8' }}>Customize your simulation experience and security parameters.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Simulator Sound Effects', desc: 'Enable auditory feedback during missions', active: true },
            { label: 'Tactical Notifications', desc: 'Receive alerts for new governance missions', active: true },
            { label: 'On-Chain Reward Auto-Claim', desc: 'Automatically prompt wallet for available rewards', active: false },
            { label: 'Experimental UI Features', desc: 'Enable next-gen holographic interface elements', active: true }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderRadius: '20px', backgroundColor: '#0a0f1e', border: '1px solid #1e293b' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'white', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.desc}</div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '24px', 
                backgroundColor: item.active ? '#2dd4bf' : '#1e293b', 
                borderRadius: '100px', 
                position: 'relative', 
                cursor: 'pointer' 
              }}>
                <div style={{ 
                  position: 'absolute', 
                  right: item.active ? '4px' : 'auto', 
                  left: item.active ? 'auto' : '4px', 
                  top: '4px', 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: item.active ? 'black' : '#475569', 
                  borderRadius: '50%' 
                }} />
              </div>
            </div>
          ))}
          
          {/* Smart Contract Config */}
          <div style={{ marginTop: '20px', padding: '32px', borderRadius: '24px', backgroundColor: 'rgba(45, 212, 191, 0.05)', border: '1.5px solid rgba(45, 212, 191, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Shield size={20} style={{ color: '#2dd4bf' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>Smart Claim Protocol</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px' }}>
              Configure the <strong>QuizRewards</strong> contract address to enable on-chain decentralized reward distribution. 
              Leave blank to use direct Hot Wallet transfers.
            </p>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="0x..."
                value={quizRewardsAddress}
                onChange={(e) => {
                  setQuizRewardsAddress(e.target.value);
                  localStorage.setItem('quiz_rewards_contract', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  backgroundColor: '#0a0f1e',
                  border: '1px solid #1e293b',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', fontWeight: '900', color: quizRewardsAddress ? '#2dd4bf' : '#475569' }}>
                {quizRewardsAddress ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
          </div>
          
          <button 
            onClick={disconnectWallet}
            style={{ 
              marginTop: '20px',
              padding: '16px', 
              borderRadius: '16px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              fontWeight: '800', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <LogOut size={18} /> Disconnect Simulation Session
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'Knowledge Base' || currentView === 'explore') {
       return renderKnowledgeBase();
    }
    if (activeTab === 'Glossary') {
       return renderGlossary();
    }
    if (activeTab === 'Forums') {
       return renderForums();
    }
    if (activeTab === 'Profile') {
       return renderProfile();
    }
    if (activeTab === 'Settings') {
       return renderSettings();
    }
    if (selectedEcosystem && ECOSYSTEM_QUIZZES[selectedEcosystem.slug]) {
      const topics = ECOSYSTEM_QUIZZES[selectedEcosystem.slug];

      return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <button 
            onClick={() => setSelectedEcosystem(null)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#64748b', 
              fontSize: '0.9rem', 
              fontWeight: '600',
              marginBottom: '32px',
              background: 'none',
              padding: 0
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: selectedEcosystem.color, 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '800',
              margin: '0 auto 16px'
            }}>{selectedEcosystem.icon}</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>{selectedEcosystem.desc}</h2>
            <div style={{ 
              display: 'inline-flex', 
              padding: '4px 12px', 
              borderRadius: '100px', 
              border: '1px solid #e2e8f0', 
              fontSize: '0.8rem', 
              color: '#64748b',
              fontWeight: '600'
            }}>
              {topics.length} Learning Topics
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
            gap: '24px',
            marginBottom: '40px'
          }}>
            {topics.map((topic, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <QuizCard 
                  {...topic} 
                  icon={<div style={{ color: selectedEcosystem.color, fontWeight: '800' }}>{selectedEcosystem.icon}</div>}
                  onClick={() => startQuiz(topic, topic.stage)}
                />
                <ChevronRight 
                  size={18} 
                  style={{ position: 'absolute', right: '24px', bottom: '24px', color: '#cbd5e1' }} 
                />
              </div>
            ))}
          </div>

          <div style={{ 
            backgroundColor: '#0f172a', 
            border: '1px solid #1e293b', 
            borderRadius: '20px', 
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.5rem' }}>🎓</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>Mission Objective</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '600px' }}>
              Master all {topics.length} sectors to secure your {selectedEcosystem.name} verification. Successful completion required for on-chain rewards.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {topics.map((t, i) => (
                <div key={i} style={{ 
                   padding: '6px 16px', 
                   borderRadius: '8px', 
                   backgroundColor: '#1e293b',
                   border: `1px solid #334155`,
                   fontSize: '0.8rem',
                   fontWeight: '700',
                   color: '#94a3b8'
                }}>
                  {t.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };


  const handleBack = () => {
    if (activeQuiz) {
      setActiveQuiz(null);
      setQuizCompleted(false);
      setCurrentView('selection');
    } else if (selectedEcosystem) {
      setSelectedEcosystem(null);
    } else {
      onBack();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#050a15',
      color: 'white',
      fontFamily: "'PP Mori', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {isLaunching && <LoadingScreen quiz={launchingQuiz?.quiz} onContinue={handleLoadingComplete} />}
      {/* Top Navigation Bar */}
      <header style={{
        height: '80px',
        padding: isMobile ? '0 20px' : '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(5, 10, 21, 0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        gap: '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '32px', flexShrink: 0 }}>
          {isMobile && !activeQuiz && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleBack}>
            <img
              src="/logo/goodgov _logo2.png"
              alt="GoodGov"
              style={{ height: isMobile ? '28px' : '36px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Global Search Bar */}
        {!activeQuiz && (
          <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input 
              type="text" 
              placeholder="Search concepts, protocols, or missions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 18px 12px 48px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2dd4bf'}
              onBlur={(e) => e.target.style.borderColor = '#1e293b'}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          {!isLoggedIn ? (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-primary"
              style={{
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isConnecting ? '...' : 'Connect Wallet'}
            </button>
          ) : (
            <WalletDropdown 
              address={walletAddress} 
              authenticated={authenticated} 
              onLogout={disconnectWallet}
              onProfile={() => setActiveTab('Profile')}
            />
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Navigation Sidebar */}
        {!activeQuiz && (isMobile ? isSidebarOpen : true) && (
          <aside style={{
            width: isMobile ? '100%' : '250px',
            position: 'fixed',
            top: '80px',
            left: 0,
            bottom: 0,
            zIndex: 150,
            backgroundColor: isMobile ? '#0a0f1e' : '#050a15',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            padding: '32px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            overflowY: 'auto',
            boxShadow: isMobile ? '20px 0 50px rgba(0,0,0,0.5)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginLeft: '12px', marginBottom: '16px', display: 'block' }}>Operational Hub</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <SidebarItem icon={BookOpen} label="Knowledge Base" active={activeTab === 'Knowledge Base'} onClick={() => { setActiveTab('Knowledge Base'); if(isMobile) setIsSidebarOpen(false); }} />
                <SidebarItem icon={Book} label="Intel Glossary" active={activeTab === 'Glossary'} onClick={() => { setActiveTab('Glossary'); if(isMobile) setIsSidebarOpen(false); }} />
                <SidebarItem icon={MessageSquare} label="Governance Forums" active={activeTab === 'Forums'} onClick={() => { setActiveTab('Forums'); if(isMobile) setIsSidebarOpen(false); }} />
                <SidebarItem icon={Settings} label="Simulator Config" active={activeTab === 'Settings'} onClick={() => { setActiveTab('Settings'); if(isMobile) setIsSidebarOpen(false); }} />
              </div>
            </div>

            {isLoggedIn && (
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginLeft: '12px', marginBottom: '16px', display: 'block' }}>Simulation Stats</span>
                <div style={{ backgroundColor: '#0a0f1e', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>CURRENT RANK</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white' }}>Field Agent</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>MASTERY SCORE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#2dd4bf' }}>{Object.values(perfectQuizzes).flat().length * 100} PTS</div>
                  </div>
                </div>
              </div>
            )}
            {isLoggedIn && (
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <SidebarItem 
                  icon={LogOut} 
                  label="Log Out" 
                  onClick={disconnectWallet} 
                  style={{ color: '#ef4444' }}
                />
              </div>
            )}
          </aside>
        )}

        {/* Main Content Area */}
        <main ref={mainContentRef} style={{ 
          flex: 1,
          marginLeft: isMobile ? 0 : (!activeQuiz ? '250px' : 0),
          overflowY: 'auto',
          padding: isMobile ? '32px 20px' : '40px 30px',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          {currentView === 'quiz' && activeQuiz ? (
            renderQuizView()
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Claim Success Modal */}
      {showClaimSuccessModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(5,10,21,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            maxWidth: '480px', width: '100%',
            background: 'linear-gradient(160deg, #0d1f35 0%, #050a15 100%)',
            border: '1.5px solid rgba(45,212,191,0.35)',
            borderRadius: '32px',
            padding: isMobile ? '40px 28px' : '56px 48px',
            textAlign: 'center',
            boxShadow: '0 40px 120px rgba(45,212,191,0.15), 0 0 0 1px rgba(45,212,191,0.1)',
            animation: 'popUpCenter 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated background glow */}
            <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(45,212,191,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Trophy Icon */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(45,212,191,0.2) 0%, rgba(45,212,191,0.08) 100%)',
              border: '2px solid rgba(45,212,191,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3.2rem', margin: '0 auto 28px',
              boxShadow: '0 20px 60px rgba(45,212,191,0.2)',
              position: 'relative', zIndex: 1
            }}>
              🏆
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Success Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '100px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '20px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Claim Successful</span>
              </div>

              <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: '900', color: 'white', marginBottom: '10px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Reward Claimed
                <span style={{ display: 'block', background: 'linear-gradient(135deg, #2dd4bf, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Successfully! 🎉
                </span>
              </h2>

              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
                Your <strong style={{ color: '#f59e0b' }}>10 GoodDollar (G$)</strong> reward has been sent to your wallet.
              </p>

              {/* Amount card */}
              <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.04) 100%)', border: '1.5px solid rgba(245,158,11,0.25)', borderRadius: '20px', padding: '24px', marginBottom: '28px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Amount Received</div>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#f59e0b', lineHeight: 1 }}>10 G$</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>GoodDollar Token · Celo Network</div>
              </div>

              {/* Check wallet CTA */}
              <div style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '16px', padding: '18px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>👛</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '800', color: '#2dd4bf', fontSize: '0.9rem' }}>Please check your wallet</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Tokens may take a minute to appear. Check your GoodDollar wallet or connected address.</div>
                </div>
              </div>

              {/* Cooldown notice */}
              <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '28px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                🔒 Next claim for this quiz available in <strong style={{ color: '#64748b' }}>90 days</strong>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href="https://wallet.gooddollar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #2dd4bf, #0d9488)', color: 'black', fontWeight: '900', fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center', boxShadow: '0 8px 24px rgba(45,212,191,0.25)' }}
                >
                  Open GoodDollar Wallet
                </a>
                <button
                  onClick={() => setShowClaimSuccessModal(false)}
                  style={{ padding: '14px', borderRadius: '16px', background: 'transparent', border: '1.5px solid #1e293b', color: '#64748b', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b'; }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popUpCenter {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; borderRadius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />
    </div>
  );
};

export default Dashboard;
