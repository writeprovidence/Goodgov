import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';
import { useMiniPay } from '../hooks/useMiniPay';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { playSound } from '../utils/sounds';

// Initialize Supabase client (if environment variables are available)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
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
  CheckCircle,
  Trophy,
  Award,
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
  const [userAnswers, setUserAnswers] = useState([]);
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
  const { isMiniPay } = useMiniPay();
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  const walletAddress = user?.wallet?.address || wagmiAddress;
  const isLoggedIn = authenticated || isWagmiConnected;
  const isConnecting = false; // Privy handles connection state internally
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null);
  const [showClaimSuccessModal, setShowClaimSuccessModal] = useState(false);
  const [showAlreadyClaimedModal, setShowAlreadyClaimedModal] = useState(false);
  const [contractBalance, setContractBalance] = useState(null);

  const [quizRewardsAddress, setQuizRewardsAddress] = useState(() => {
    return localStorage.getItem('quiz_rewards_contract') || QUIZ_REWARDS_CONTRACT;
  });
  const [pendingClaims, setPendingClaims] = useState(() => {
    try { 
      const saved = JSON.parse(localStorage.getItem('goodgov_pending_claims') || '[]');
      // Migration: convert old string array to object array if needed
      return saved.map(item => typeof item === 'string' ? { quizId: item, answers: [] } : item);
    } catch { return []; }
  });
  const savePendingClaim = (quizId, answers = []) => {
    setPendingClaims(prev => {
      if (prev.find(p => p.quizId === quizId)) return prev;
      const next = [...prev, { quizId, answers }];
      localStorage.setItem('goodgov_pending_claims', JSON.stringify(next));
      return next;
    });
  };
  const removePendingClaim = (quizId) => {
    setPendingClaims(prev => {
      const next = prev.filter(p => p.quizId !== quizId);
      localStorage.setItem('goodgov_pending_claims', JSON.stringify(next));
      return next;
    });
  };
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(true);
  const loadingAudioRef = useRef(null);
  const backgroundAudioRef = useRef(null);
  
  const playGameSound = (type) => {
    if (soundEnabled) {
      // On mobile, AudioContext needs to be resumed within a user gesture
      const ctx = window._audioCtx || (window.AudioContext && new (window.AudioContext || window.webkitAudioContext)());
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(e => console.log('AudioContext resume failed:', e));
      }
      playSound(type);
    }
  };

  // Helper functions for wallet-specific localStorage
  const getWalletStorageKey = (key) => `goodgov_${walletAddress || 'anonymous'}_${key}`;
  
  const getWalletStorageItem = (key, defaultValue) => {
    const storageKey = getWalletStorageKey(key);
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : defaultValue;
  };
  
  const setWalletStorageItem = (key, value) => {
    const storageKey = getWalletStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(value));
  };

  // Helper functions to save data to Supabase
  const savePerfectQuizToSupabase = async (stageName, quizTitle) => {
    if (!supabase || !walletAddress) return;
    try {
      await supabase.from('perfect_quizzes').insert([
        { wallet_address: walletAddress, stage_name: stageName, quiz_title: quizTitle }
      ]);
    } catch (err) {
      console.error('Error saving perfect quiz to Supabase:', err);
    }
  };

  const saveCompletedStageToSupabase = async (stageName) => {
    if (!supabase || !walletAddress) return;
    try {
      await supabase.from('completed_stages').insert([
        { wallet_address: walletAddress, stage_name: stageName }
      ]);
    } catch (err) {
      console.error('Error saving completed stage to Supabase:', err);
    }
  };

  const [claimedRewardsHistory, setClaimedRewardsHistory] = useState(() => {
    return getWalletStorageItem('claim_history', {}); // { quizId: { amount: 10, timestamp: ms } }
  });

  const handleClaimReward = async (quizId) => {
    const existingClaim = claimedRewardsHistory[quizId];
    const alreadyClaimed = !!existingClaim;

    if (alreadyClaimed) {
      setShowAlreadyClaimedModal(true);
      // Ensure it's in history so UI stays consistent
      if (!claimedRewardsHistory[quizId]) {
        const newHistory = { ...claimedRewardsHistory, [quizId]: { amount: 10, timestamp: Date.now(), txHash: 'Previously Claimed' } };
        setClaimedRewardsHistory(newHistory);
        setWalletStorageItem('claim_history', newHistory);
      }
      return;
    }

    setIsClaiming(true);
    setClaimStatus(null);

    const QUIZ_REWARDS_ADDRESS = QUIZ_REWARDS_CONTRACT;

    try {
      if (QUIZ_REWARDS_ADDRESS) {
        // If answers are not in state (e.g. claiming from profile), check pendingClaims
        let answersToVerify = userAnswers;
        if (answersToVerify.length === 0) {
          const pending = pendingClaims.find(p => p.quizId === quizId);
          if (pending && pending.answers) {
            answersToVerify = pending.answers;
          }
        }

        const sigRes = await fetch('/api/sign-reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userAddress: walletAddress, 
            quizId, 
            amount: 10,
            answers: answersToVerify
          })
        });
        const sigData = await sigRes.json();
        if (!sigRes.ok) throw new Error(sigData.error || 'Failed to get signature');

        // ── Gas balance check ──
        // Check user has enough CELO for gas before attempting the transaction
        try {
          const celoProvider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");
          const celoBalance = await celoProvider.getBalance(walletAddress);
          const celoBalanceEth = parseFloat(ethers.utils.formatEther(celoBalance));
          const MIN_CELO_FOR_GAS = 0.001; // ~$0.001, safely above actual cost
          if (celoBalanceEth < MIN_CELO_FOR_GAS) {
            throw new Error(
              `⛽ Insufficient CELO for gas fees. You need at least 0.001 CELO (~$0.001) to cover the transaction fee. ` +
              `Your current balance: ${celoBalanceEth.toFixed(6)} CELO. ` +
              `Get CELO at app.uniswap.org or any exchange that supports the Celo network.`
            );
          }
        } catch (balErr) {
          if (balErr.message.includes('⛽')) throw balErr; // re-throw our custom error
          console.warn('Could not check CELO balance, proceeding anyway:', balErr.message);
        }

        const eip1193provider = wallets[0] 
          ? await wallets[0].getEthereumProvider() 
          : (window.ethereum?.isMiniPay ? window.ethereum : null);
        
        if (!eip1193provider) throw new Error("No wallet provider found. Please connect your wallet.");
        
        // Switch to Celo network
        try {
          await eip1193provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa4ec' }], // Celo Mainnet chainId (42220 in hex)
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            await eip1193provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xa4ec',
                  chainName: 'Celo Mainnet',
                  nativeCurrency: {
                    name: 'CELO',
                    symbol: 'CELO',
                    decimals: 18,
                  },
                  rpcUrls: ['https://forno.celo.org'],
                  blockExplorerUrls: ['https://explorer.celo.org/mainnet'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }

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
        const res = await fetch('/api/claim-reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: walletAddress, quizId, amount: 10 })
        });
        if (!res.ok) throw new Error('Server unavailable. Please try again later.');
        await res.json();
      }

      // Record the claim on-chain first, then sync with Supabase
      setClaimedRewardsHistory(prev => {
        const next = { ...prev, [quizId]: { amount: 10, timestamp: Date.now() } };
        setWalletStorageItem('claim_history', next);
        return next;
      });
      
      // Also remove from pending if it exists
      removePendingClaim(quizId);
      
      // Update Supabase for persistence
      if (supabase && walletAddress) {
        try {
          await supabase.from('claimed_quizzes').upsert([
            { wallet_address: walletAddress, quiz_id: quizId, amount: 10 }
          ], { onConflict: 'wallet_address,quiz_id' });
          console.log('✅ Supabase updated after successful claim');
        } catch (supaErr) {
          console.error('Error updating Supabase after claim:', supaErr);
          // Don't fail the whole operation if Supabase update fails, 
          // as on-chain transaction succeeded and local storage is updated.
        }
      }

      setClaimStatus({ success: true, message: "Claim successful!" });
      setShowClaimSuccessModal(true);
      

    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes("Signature already issued") || err.message.includes("already claimed"))) {
        setShowAlreadyClaimedModal(true);
        // Sync local state if contract says it's claimed
        setClaimedRewardsHistory(prev => {
          if (prev[quizId]) return prev;
          const next = { ...prev, [quizId]: { amount: 10, timestamp: Date.now(), txHash: 'Already Claimed' } };
          setWalletStorageItem('claim_history', next);
          return next;
        });
        removePendingClaim(quizId);
      } else {
        setClaimStatus({ 
          success: false, 
          message: err.message || "Failed to claim reward. Please try again later."
        });
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    if (!wallets || wallets.length === 0) {
      alert("Please connect your wallet first.");
      login();
      return;
    }
    try {
      const eip1193provider = wallets[0] 
        ? await wallets[0].getEthereumProvider() 
        : (window.ethereum?.isMiniPay ? window.ethereum : null);
      
      if (!eip1193provider) throw new Error("No wallet provider found. Please connect your wallet.");
      
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
  const [knowledgeSubTab, setKnowledgeSubTab] = useState('Basics');
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
    playGameSound('click');

    // Mobile Audio Unlock: Initialize and play/pause music objects during this user gesture
    if (backgroundMusicEnabled) {
      if (!loadingAudioRef.current) {
        loadingAudioRef.current = new Audio('/audio/loading.mp3');
        loadingAudioRef.current.volume = 0.5;
      }
      if (!backgroundAudioRef.current) {
        backgroundAudioRef.current = new Audio('/audio/millionaire.mp3');
        backgroundAudioRef.current.loop = true;
        backgroundAudioRef.current.volume = 0.3;
      }
      
      // Attempt to play immediately (this unlocks it for the subsequent useEffect calls)
      loadingAudioRef.current.play().catch(() => {});
      backgroundAudioRef.current.play().then(() => {
        // Immediately pause background music because we are in the 'loading' state first
        backgroundAudioRef.current.pause();
      }).catch(() => {});
    }

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
    setUserAnswers([]);
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
    return getWalletStorageItem('completed_stages', {
      'Mastery Challenges': false,
      'DAO knowledge': false,
      'Community': false,
      'Basics': false,
    });
  });
  const [perfectQuizzes, setPerfectQuizzes] = useState(() => {
    return getWalletStorageItem('perfect_quizzes', {
      'Mastery Challenges': [],
      'DAO knowledge': [],
      'Community': [],
      'Basics': [],
    });
  });

  const [claimedRewards] = useState(() => {
    return getWalletStorageItem('claimed_rewards', {
      'Mastery Challenges': false,
      'DAO knowledge': false,
      'Community': false,
      'Basics': false,
    });
  });

  // Sync state to wallet-specific localStorage when wallet changes or state updates
  useEffect(() => {
    if (walletAddress) {
      setWalletStorageItem('claimed_rewards', claimedRewards);
      setWalletStorageItem('completed_stages', completedStages);
      setWalletStorageItem('perfect_quizzes', perfectQuizzes);
      setWalletStorageItem('claim_history', claimedRewardsHistory);
    }
  }, [walletAddress, claimedRewards, completedStages, perfectQuizzes, claimedRewardsHistory]);

  // Fetch data from Supabase (or localStorage as fallback)
  const fetchUserData = useCallback(async () => {
    if (!walletAddress) return;

    if (supabase) {
      try {
        console.log('🔄 Syncing user data with Supabase...');
        
        // Fetch claimed rewards history
        const { data: claimedData, error: claimedError } = await supabase
          .from('claimed_quizzes')
          .select('*')
          .eq('wallet_address', walletAddress);

        if (!claimedError && claimedData) {
          const localHistory = getWalletStorageItem('claim_history', {});
          const remoteHistory = {};
          claimedData.forEach(item => {
            remoteHistory[item.quiz_id] = {
              amount: item.amount,
              timestamp: new Date(item.claimed_at).getTime(),
              txHash: item.tx_hash
            };
          });
          
          // Merge: Remote takes precedence for timestamp/amount, but keep unique local entries
          const mergedHistory = { ...localHistory, ...remoteHistory };
          setClaimedRewardsHistory(mergedHistory);
          setWalletStorageItem('claim_history', mergedHistory);
        }

        // Fetch completed stages
        const { data: stagesData, error: stagesError } = await supabase
          .from('completed_stages')
          .select('*')
          .eq('wallet_address', walletAddress);

        if (!stagesError && stagesData) {
          const localCompleted = getWalletStorageItem('completed_stages', {
            'Mastery Challenges': false,
            'DAO knowledge': false,
            'Community': false,
            'Basics': false,
          });
          
          const remoteCompleted = { ...localCompleted };
          stagesData.forEach(item => {
            if (remoteCompleted.hasOwnProperty(item.stage_name)) {
              remoteCompleted[item.stage_name] = true;
            }
          });
          
          setCompletedStages(remoteCompleted);
          setWalletStorageItem('completed_stages', remoteCompleted);
        }

        // Fetch perfect quizzes
        const { data: perfectData, error: perfectError } = await supabase
          .from('perfect_quizzes')
          .select('*')
          .eq('wallet_address', walletAddress);

        if (!perfectError && perfectData) {
          const localPerfect = getWalletStorageItem('perfect_quizzes', {
            'Mastery Challenges': [],
            'DAO knowledge': [],
            'Community': [],
            'Basics': [],
          });
          
          const mergedPerfect = { ...localPerfect };
          perfectData.forEach(item => {
            if (mergedPerfect.hasOwnProperty(item.stage_name)) {
              if (!mergedPerfect[item.stage_name].includes(item.quiz_title)) {
                mergedPerfect[item.stage_name].push(item.quiz_title);
              }
            }
          });
          
          setPerfectQuizzes(mergedPerfect);
          setWalletStorageItem('perfect_quizzes', mergedPerfect);
        }
        
        console.log('✅ Sync complete');

      } catch (err) {
        console.error('❌ Error fetching from Supabase:', err);
        // Fail gracefully and use local data
        setClaimedRewardsHistory(getWalletStorageItem('claim_history', {}));
        setCompletedStages(getWalletStorageItem('completed_stages', {
          'Mastery Challenges': false,
          'DAO knowledge': false,
          'Community': false,
          'Basics': false,
        }));
        setPerfectQuizzes(getWalletStorageItem('perfect_quizzes', {
          'Mastery Challenges': [],
          'DAO knowledge': [],
          'Community': [],
          'Basics': [],
        }));
      }
    } else {
      // No Supabase configured, strictly use localStorage
      setClaimedRewardsHistory(getWalletStorageItem('claim_history', {}));
      setCompletedStages(getWalletStorageItem('completed_stages', {
        'Mastery Challenges': false,
        'DAO knowledge': false,
        'Community': false,
        'Basics': false,
      }));
      setPerfectQuizzes(getWalletStorageItem('perfect_quizzes', {
        'Mastery Challenges': [],
        'DAO knowledge': [],
        'Community': [],
        'Basics': [],
      }));
    }
  }, [walletAddress, supabase]);

  // Refresh state when wallet changes
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Fetch contract balance for rewards
  useEffect(() => {
    const checkBalance = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://forno.celo.org");
        const gdContract = new ethers.Contract(GD_TOKEN_ADDRESS, ["function balanceOf(address) view returns (uint256)"], provider);
        const balance = await gdContract.balanceOf(QUIZ_REWARDS_CONTRACT);
        setContractBalance(ethers.utils.formatUnits(balance, 18));
      } catch (err) {
        console.error('Error checking contract balance:', err);
      }
    };
    checkBalance();
  }, []);

  // Clear claim status when switching tabs or views
  useEffect(() => {
    setClaimStatus(null);
  }, [activeTab, currentView]);

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

  // Loading sound effect when quiz is launching
  useEffect(() => {
    if (isLaunching && soundEnabled) {
      playGameSound('loading');
      // Try to play loading music file
      if (backgroundMusicEnabled) {
        if (!loadingAudioRef.current) {
          loadingAudioRef.current = new Audio('/audio/loading.mp3');
          loadingAudioRef.current.volume = 0.5;
        }
        loadingAudioRef.current.play().catch((e) => console.log('No loading music file found:', e));
      }
    } else {
      if (loadingAudioRef.current) {
        loadingAudioRef.current.pause();
        loadingAudioRef.current.currentTime = 0;
      }
    }
  }, [isLaunching, soundEnabled, backgroundMusicEnabled]);

  // Background music during quiz
  useEffect(() => {
    if (currentView === 'quiz' && !quizCompleted && !isLaunching && backgroundMusicEnabled) {
      if (!backgroundAudioRef.current) {
        backgroundAudioRef.current = new Audio('/audio/millionaire.mp3');
        backgroundAudioRef.current.loop = true;
        backgroundAudioRef.current.volume = 0.3;
      }
      backgroundAudioRef.current.play().catch((e) => console.log('No background music file found:', e));
    } else {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
      }
    }
  }, [currentView, quizCompleted, isLaunching, backgroundMusicEnabled]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (loadingAudioRef.current) {
        loadingAudioRef.current.pause();
      }
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
      }
    };
  }, []);

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

  const categories = ['All', 'DAO knowledge', 'Community', 'Basics'];

  // Redundant tab reset effect removed to fix sidebar navigation functionality
  
  const stageQuizCounts = { 
    'Mastery Challenges': [
      ...daoQuizzes,
      ...web3Quizzes,
    ].filter(q => q.questions && q.questions.length >= 20).length,
    'DAO knowledge': daoQuizzes.length, 
    'Community': Object.values(ECOSYSTEM_QUIZZES).flat().length, 
    'Basics': web3Quizzes.length 
  };

  const masteryStats = React.useMemo(() => {
    const perfectQuizTitles = Object.values(perfectQuizzes).flat();
    const claimedQuizTitles = Object.keys(claimedRewardsHistory);
    const uniquePerfectTitles = new Set([...perfectQuizTitles, ...claimedQuizTitles]);
    
    const count = uniquePerfectTitles.size;
    const score = count * 100;
    
    // Rank calculation logic
    let rank = 'Recruit';
    if (score >= 2000) rank = 'Grandmaster';
    else if (score >= 1000) rank = 'Elite Agent';
    else if (score >= 100) rank = 'Field Agent';

    // Per-category counts for Sector Breakthroughs
    const sectorStats = {
      'DAO knowledge': new Set(perfectQuizzes['DAO knowledge'] || []),
      'Community': new Set(perfectQuizzes['Community'] || []),
      'Basics': new Set(perfectQuizzes['Basics'] || []),
    };

    // Enrich with claimed quizzes
    const allQuizzes = [
      ...daoQuizzes, 
      ...web3Quizzes, 
      ...Object.values(ECOSYSTEM_QUIZZES).flat()
    ];
    
    claimedQuizTitles.forEach(title => {
      const quiz = allQuizzes.find(q => q.title === title);
      const stage = quiz?.stage;
      if (stage && sectorStats[stage]) {
        sectorStats[stage].add(title);
      }
    });

    return {
      totalScore: score,
      completedCount: count,
      rank,
      sectorCounts: {
        'DAO knowledge': sectorStats['DAO knowledge'].size,
        'Community': sectorStats['Community'].size,
        'Basics': sectorStats['Basics'].size,
      }
    };
  }, [perfectQuizzes, claimedRewardsHistory]);

  const allStagesComplete = completedStages['DAO knowledge'] && completedStages['Community'] && completedStages['Basics'];



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
    disconnect();
    setCurrentView('explore');
  };

  const handleDirectClaim = async () => {
    if (!walletAddress) {
      login();
      return;
    }

    const quizId = activeQuiz?.title || 'Grand Master Quiz';

    // Check if already claimed
    const existingClaim = claimedRewardsHistory[quizId];
    if (existingClaim) {
      setShowAlreadyClaimedModal(true);
      return;
    }
    
    setIsClaiming(true);
    setClaimStatus(null);
    
    const QUIZ_REWARDS_ADDRESS = QUIZ_REWARDS_CONTRACT;

    try {
      if (QUIZ_REWARDS_ADDRESS) {
        let answersToVerify = userAnswers;
        if (answersToVerify.length === 0) {
          const pending = pendingClaims.find(p => p.quizId === quizId);
          if (pending && pending.answers) {
            answersToVerify = pending.answers;
          }
        }

        const sigRes = await fetch('/api/sign-reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userAddress: walletAddress, 
            quizId, 
            amount: 10,
            answers: answersToVerify
          })
        });
        const sigData = await sigRes.json();
        if (!sigRes.ok) throw new Error(sigData.error || 'Failed to get signature');

        const eip1193provider = wallets[0] 
          ? await wallets[0].getEthereumProvider() 
          : (window.ethereum?.isMiniPay ? window.ethereum : null);
        
        if (!eip1193provider) throw new Error("No wallet provider found. Please connect your wallet.");
        
        // Switch to Celo network
        try {
          await eip1193provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xa4ec' }], // Celo Mainnet chainId (42220 in hex)
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            await eip1193provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xa4ec',
                  chainName: 'Celo Mainnet',
                  nativeCurrency: {
                    name: 'CELO',
                    symbol: 'CELO',
                    decimals: 18,
                  },
                  rpcUrls: ['https://forno.celo.org'],
                  blockExplorerUrls: ['https://explorer.celo.org/mainnet'],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }

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
        const res = await fetch('/api/claim-reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: walletAddress, quizId, amount: 10 })
        });
        if (!res.ok) throw new Error('Server unavailable. Please try again later.');
        await res.json();
      }

      // Record the claim
      const newHistory = { ...claimedRewardsHistory, [quizId]: { amount: 10, timestamp: Date.now() } };
      setClaimedRewardsHistory(newHistory);
      setWalletStorageItem('claim_history', newHistory);
      setClaimStatus({ success: true });
      setShowClaimSuccessModal(true);
      
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes("Signature already issued")) {
        setShowAlreadyClaimedModal(true);
      } else {
        setClaimStatus({ 
          success: false, 
          message: err.message || "Failed to claim reward. Please try again later."
        });
      }
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
    playGameSound('select');
    setSelectedOption(index);
    setIsAnswered(true);
    
    // Record answer for backend verification
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    setUserAnswers(prev => [...prev, {
      question: currentQuestion.question,
      selectedAnswer: currentQuestion.options[index]
    }]);

    if (index === currentQuestion.correct) {
      setScore(s => s + 1);
      playGameSound('success');
    } else {
      playGameSound('error');
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
            
            // Save to localStorage
            setWalletStorageItem('perfect_quizzes', updated);
            
            // Save to Supabase
            savePerfectQuizToSupabase(activeQuizStage, activeQuiz.title);
            
            // Check if stage is now complete
            const requiredCount = stageQuizCounts[activeQuizStage] || 1;
            if (updatedQuizzes.length >= requiredCount) {
              setCompletedStages(cs => {
                const updatedStages = { ...cs, [activeQuizStage]: true };
                // Save completed stage to localStorage and Supabase
                setWalletStorageItem('completed_stages', updatedStages);
                saveCompletedStageToSupabase(activeQuizStage);
                return updatedStages;
              });
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
    else if (activeQuizStage === 'Basics') source = web3Quizzes;
    else if (activeQuizStage === 'Community') source = Object.values(ECOSYSTEM_QUIZZES).flat();
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

      // Particle burst component for perfect score
      const particles = isPerfectRun
        ? Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 8 + 4,
            color: ['#2dd4bf', '#f59e0b', '#a78bfa', '#34d399', '#60a5fa'][Math.floor(Math.random() * 5)],
            delay: Math.random() * 0.8,
            duration: Math.random() * 1.5 + 1.2,
          }))
        : [];

      const accuracyPct = Math.round((score / shuffledQuestions.length) * 100);
      const rank = accuracyPct === 100 ? 'GRANDMASTER' : accuracyPct >= 80 ? 'ELITE AGENT' : accuracyPct >= 60 ? 'FIELD AGENT' : 'RECRUIT';
      const rankColor = accuracyPct === 100 ? '#f59e0b' : accuracyPct >= 80 ? '#2dd4bf' : accuracyPct >= 60 ? '#818cf8' : '#94a3b8';
      const quizId = activeQuiz?.title || 'Mission';
      const isClaimed = !!claimedRewardsHistory[quizId];
      const isPending = !!pendingClaims.find(p => p.quizId === quizId);
      const isEligible = score === 20 && shuffledQuestions.length === 20;

      // SVG ring dimensions
      const ringRadius = 70;
      const ringCirc = 2 * Math.PI * ringRadius;
      const ringFill = ringCirc * (1 - accuracyPct / 100);

      return (
        <>
          {/* ── Fixed background layer (scanlines, particles, glow, corners) ── */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 1100, pointerEvents: 'none', animation: 'fadeIn 0.5s ease-out', backgroundColor: '#050a15' }}>
            {/* Scanline grid */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `linear-gradient(rgba(45,212,191,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.03) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />
            {/* Radial glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at 50% 50%, ${isPerfectRun ? 'rgba(45,212,191,0.1)' : 'rgba(99,102,241,0.08)'} 0%, transparent 65%)`
            }} />
            {/* Corner brackets */}
            {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i) => (
              <div key={i} style={{
                position: 'absolute', ...pos, width: '80px', height: '80px',
                borderTop: i < 2 ? '2px solid rgba(45,212,191,0.25)' : 'none',
                borderBottom: i >= 2 ? '2px solid rgba(45,212,191,0.25)' : 'none',
                borderLeft: i % 2 === 0 ? '2px solid rgba(45,212,191,0.25)' : 'none',
                borderRight: i % 2 === 1 ? '2px solid rgba(45,212,191,0.25)' : 'none',
              }} />
            ))}
            {/* Particles */}
            {particles.map(p => (
              <div key={p.id} style={{
                position: 'absolute',
                left: `${p.x}%`, top: `${p.y}%`,
                width: `${p.size}px`, height: `${p.size}px`,
                borderRadius: '50%',
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                animation: `particlePop ${p.duration}s ${p.delay}s ease-out both`,
              }} />
            ))}
          </div>

          {/* ── Main card (perfectly centered) ── */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1101,
            width: isMobile ? 'calc(100% - 32px)' : '600px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'linear-gradient(160deg, rgba(15,23,42,0.97) 0%, rgba(5,10,21,0.99) 100%)',
            border: `1.5px solid ${isPerfectRun ? 'rgba(45,212,191,0.4)' : 'rgba(99,102,241,0.3)'}`,
            borderRadius: '24px',
            padding: isMobile ? '40px 20px 28px' : '60px 52px 48px',
            boxShadow: `0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
            animation: 'popUpCenter 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
            boxSizing: 'border-box',
            backdropFilter: 'blur(20px)',
          }}>

            {/* ── Status ribbon ── */}
            <div style={{
              position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
              padding: '6px 20px',
              background: isPerfectRun
                ? 'linear-gradient(90deg, #0d9488, #2dd4bf)'
                : 'linear-gradient(90deg, #4f46e5, #818cf8)',
              borderRadius: '0 0 14px 14px',
              fontSize: '0.65rem', fontWeight: '900',
              color: 'white', letterSpacing: '0.18em', textTransform: 'uppercase',
              boxShadow: isPerfectRun ? '0 4px 20px rgba(45,212,191,0.4)' : '0 4px 20px rgba(99,102,241,0.4)',
              whiteSpace: 'nowrap'
            }}>
              {isPerfectRun ? '⚡ MISSION COMPLETE — PERFECT RUN' : '▸ MISSION COMPLETE'}
            </div>

            {/* ── Score ring + center ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', marginTop: '12px' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                {/* Glow behind ring */}
                <div style={{
                  position: 'absolute', inset: '8px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${isPerfectRun ? 'rgba(45,212,191,0.12)' : 'rgba(99,102,241,0.1)'} 0%, transparent 70%)`
                }} />
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                  <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="65" cy="65" r="52"
                    fill="none"
                    stroke={isPerfectRun ? 'url(#ringGrad)' : '#818cf8'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - accuracyPct / 100)}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${isPerfectRun ? '#2dd4bf' : '#818cf8'})` }}
                  />
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center content */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '2.1rem', fontWeight: '900', lineHeight: 1, color: 'white', letterSpacing: '-0.04em' }}>{score}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>/ {shuffledQuestions.length}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: '800', color: isPerfectRun ? '#2dd4bf' : '#818cf8', letterSpacing: '0.1em', marginTop: '2px', textTransform: 'uppercase' }}>{accuracyPct}%</div>
                </div>
              </div>
            </div>

            {/* ── Rank badge ── */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px',
                borderRadius: '100px',
                background: `${rankColor}15`,
                border: `1.5px solid ${rankColor}40`,
                boxShadow: `0 0 16px ${rankColor}20`
              }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: rankColor, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {isPerfectRun ? '🏆' : '🎯'} RANK — {rank}
                </span>
              </div>
            </div>

            {/* ── Stat tiles ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Correct', value: score, color: '#2dd4bf' },
                { label: 'Accuracy', value: `${accuracyPct}%`, color: isPerfectRun ? '#f59e0b' : '#818cf8' },
                { label: 'Wrong', value: shuffledQuestions.length - score, color: shuffledQuestions.length - score === 0 ? '#34d399' : '#f87171' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${stat.color}20`,
                  borderRadius: '12px',
                  padding: '10px 8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.58rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '3px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* ── XP bar ── */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>XP Earned</span>
                <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#f59e0b' }}>+{score * 5} XP</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(score / shuffledQuestions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
                  borderRadius: '100px',
                  boxShadow: '0 0 10px rgba(245,158,11,0.5)',
                  transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)'
                }} />
              </div>
            </div>

            {/* ── Low score nudge ── */}
            {score < shuffledQuestions.length && !isGlossaryQuiz && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                marginBottom: '12px'
              }}>
                <Zap size={13} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#f59e0b' }}>Score 20/20 to unlock the 10 G$ reward</span>
              </div>
            )}

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

              {/* CLAIM button */}
              {isEligible && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => {
                      if (isClaimed) return;
                      if (!authenticated) { login(); }
                      else { removePendingClaim(quizId); handleClaimReward(quizId); }
                    }}
                    disabled={isClaiming || isClaimed}
                    style={{
                      width: '100%', padding: '13px 20px',
                      borderRadius: '6px',
                      background: isClaimed
                        ? 'rgba(45,212,191,0.05)'
                        : 'linear-gradient(135deg, rgba(13,148,136,0.25), rgba(45,212,191,0.15))',
                      color: isClaimed ? '#475569' : '#2dd4bf',
                      fontWeight: '900', fontSize: '0.9rem',
                      border: isClaimed
                        ? '1.5px solid rgba(71,85,105,0.2)'
                        : '1.5px solid rgba(45,212,191,0.4)',
                      cursor: (isClaiming || isClaimed) ? 'default' : 'pointer',
                      boxShadow: isClaimed ? 'none' : '0 0 24px rgba(45,212,191,0.15)',
                      transition: 'all 0.25s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => { if (!isClaiming && !isClaimed) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(13,148,136,0.4), rgba(45,212,191,0.25))'; e.currentTarget.style.boxShadow = '0 0 36px rgba(45,212,191,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                    onMouseLeave={(e) => { if (!isClaiming && !isClaimed) { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(13,148,136,0.25), rgba(45,212,191,0.15))'; e.currentTarget.style.boxShadow = '0 0 24px rgba(45,212,191,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
                  >
                    {isClaiming ? (
                      <><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #2dd4bf', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> PROCESSING...</>
                    ) : isClaimed ? (
                      '✓ REWARD CLAIMED'
                    ) : (
                      <><CheckCircle size={16} /> CLAIM 10 G$ REWARD</>
                    )}
                  </button>
                  {claimStatus && !claimStatus.success && (
                    <div style={{ padding: '10px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.82rem', fontWeight: '600' }}>
                      ⚠️ {claimStatus.message}
                    </div>
                  )}
                </div>
              )}

              {/* REPEAT MISSION button — shown only when score < 20 */}
              {!isEligible && (
                <button
                  onClick={() => startQuiz(activeQuiz, activeQuizStage)}
                  style={{
                    width: '100%', padding: '13px 20px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(252,211,77,0.08))',
                    color: '#f59e0b',
                    fontWeight: '900', fontSize: '0.88rem',
                    border: '1.5px solid rgba(245,158,11,0.35)',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(245,158,11,0.1)',
                    transition: 'all 0.22s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.28), rgba(252,211,77,0.15))'; e.currentTarget.style.boxShadow = '0 0 32px rgba(245,158,11,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(252,211,77,0.08))'; e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  🔄 REPEAT MISSION
                </button>
              )}

              {/* NEXT MISSION button */}
              {getNextQuiz() ? (
                <button
                  onClick={() => startQuiz(getNextQuiz(), activeQuizStage)}
                  style={{
                    width: '100%', padding: '12px 20px',
                    borderRadius: '6px',
                    background: 'rgba(99,102,241,0.1)',
                    color: '#a5b4fc',
                    fontWeight: '800', fontSize: '0.82rem',
                    border: '1.5px solid rgba(99,102,241,0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <ChevronRight size={15} /> START NEXT MISSION
                </button>
              ) : (
                <button
                  onClick={() => { setCurrentView('selection'); setActiveQuiz(null); setQuizCompleted(false); }}
                  style={{
                    width: '100%', padding: '12px 20px',
                    borderRadius: '6px',
                    background: 'rgba(99,102,241,0.1)',
                    color: '#a5b4fc',
                    fontWeight: '800', fontSize: '0.82rem',
                    border: '1.5px solid rgba(99,102,241,0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    textTransform: 'uppercase', letterSpacing: '0.08em'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {isGlossaryQuiz ? 'RETURN TO GLOSSARY' : 'RETURN TO SELECTION'}
                </button>
              )}

              {/* SKIP button */}
              {isEligible && !isClaimed && !isPending && (
                <button
                  onClick={() => savePendingClaim(quizId, userAnswers)}
                  style={{
                    width: '100%', padding: '12px 20px',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: '#475569',
                    fontWeight: '700', fontSize: '0.82rem',
                    border: '1.5px solid rgba(51,65,85,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(71,85,105,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(51,65,85,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Skip
                </button>
              )}

              {/* Pending confirmation */}
              {isEligible && !isClaimed && isPending && isLoggedIn && (
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#2dd4bf', fontWeight: '700', opacity: 0.8, paddingTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CheckCircle size={13} /> Saved to Profile · Claim anytime
                </div>
              )}
            </div>{/* end action buttons */}
          </div>{/* end card */}

          {/* inject particlePop keyframe */}
          <style>{`
            @keyframes particlePop {
              0% { transform: scale(0) translate(0,0); opacity: 1; }
              60% { opacity: 0.8; }
              100% { transform: scale(1.5) translate(${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random()*60+20)}px, -${Math.floor(Math.random()*80+40)}px); opacity: 0; }
            }
          `}</style>
        </>
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
                        <div style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%', 
                          backgroundColor: status === 'correct' ? '#10b981' : status === 'incorrect' ? '#ef4444' : isSelected ? '#2dd4bf' : '#334155', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '0.95rem', 
                          fontWeight: '900', 
                          color: 'black',
                          flexShrink: 0,
                          boxShadow: isSelected ? '0 0 15px rgba(45, 212, 191, 0.4)' : 'none',
                          transition: 'all 0.2s'
                        }}>
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
                      {currentQuestionIndex + 1 === shuffledQuestions.length ? 'Finish Mission' : 'Next Question'}
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
          padding: isMobile ? '24px 20px' : '28px 40px', marginBottom: '48px',
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
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.7', maxWidth: '680px', marginBottom: '0' }}>
              Master Web3 and DAO mechanics through interactive missions. Earn on-chain rank and claim unique rewards.
            </p>
          </div>
          {!isMobile && (
            <div style={{ width: '220px', flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative', minHeight: '220px', alignItems: 'center' }}>
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #1e293b' }}>
          {['Basics', 'DAO knowledge', 'Community'].map((tab) => (
            <button
              key={tab}
              onClick={() => setKnowledgeSubTab(tab)}
              style={{
                padding: '7px 16px', borderRadius: '100px',
                backgroundColor: knowledgeSubTab === tab ? '#2dd4bf' : 'rgba(255,255,255,0.04)',
                color: knowledgeSubTab === tab ? 'black' : '#94a3b8',
                border: '1px solid ' + (knowledgeSubTab === tab ? '#2dd4bf' : 'rgba(255,255,255,0.08)'),
                fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on sub-tab */}
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>

          {knowledgeSubTab === 'Basics' && (
            <div id="web3-basics-sector">
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {web3Quizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase())).map((quiz, i) => {

                  const isClaimed = !!claimedRewardsHistory[quiz.title];
                  const isPerfect = perfectQuizzes['Basics']?.includes(quiz.title);
                  return (
                    <div key={i} onClick={() => startQuiz(quiz, 'Basics')} style={{
                      backgroundColor: isClaimed ? 'rgba(245, 158, 11, 0.03)' : '#0a0f1e', 
                      border: isClaimed ? '1.5px solid rgba(245, 158, 11, 0.3)' : '1.5px solid #1e293b', 
                      borderRadius: '22px',
                      padding: '26px', cursor: 'pointer', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                      display: 'flex', flexDirection: 'column', gap: '14px',
                      position: 'relative', overflow: 'hidden'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor=isClaimed ? 'rgba(245,158,11,0.5)' : 'rgba(45,212,191,0.35)'; e.currentTarget.style.boxShadow='0 18px 40px rgba(0,0,0,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=isClaimed ? 'rgba(245,158,11,0.3)' : '#1e293b'; e.currentTarget.style.boxShadow='none'; }}
                    >
                      {isClaimed && (
                        <div style={{
                          position: 'absolute', top: '10px', right: '-28px',
                          backgroundColor: '#f59e0b', color: 'black',
                          padding: '4px 32px', fontSize: '0.6rem', fontWeight: '900',
                          transform: 'rotate(45deg)', letterSpacing: '0.1em'
                        }}>CLAIMED</div>
                      )}
                      {isPerfect && !isClaimed && (
                        <div style={{
                          position: 'absolute', top: '10px', right: '-28px',
                          backgroundColor: '#2dd4bf', color: 'black',
                          padding: '4px 32px', fontSize: '0.6rem', fontWeight: '900',
                          transform: 'rotate(45deg)', letterSpacing: '0.1em'
                        }}>PERFECT</div>
                      )}
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
                  );
                })}
              </div>
            </div>
          )}

          {knowledgeSubTab === 'DAO knowledge' && (
            <div id="dao-knowledge-sector">
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {daoQuizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase())).map((quiz, i) => {

                  const isClaimed = !!claimedRewardsHistory[quiz.title];
                  const isPerfect = perfectQuizzes['DAO knowledge']?.includes(quiz.title);
                  return (
                    <div key={i} onClick={() => startQuiz(quiz, quiz.stage)} style={{
                      backgroundColor: isClaimed ? 'rgba(245, 158, 11, 0.03)' : '#0a0f1e', 
                      border: isClaimed ? '1.5px solid rgba(245, 158, 11, 0.3)' : '1.5px solid #1e293b', 
                      borderRadius: '22px',
                      padding: '26px', cursor: 'pointer', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                      display: 'flex', flexDirection: 'column', gap: '14px',
                      position: 'relative', overflow: 'hidden'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor=isClaimed ? 'rgba(245,158,11,0.5)' : 'rgba(45,212,191,0.35)'; e.currentTarget.style.boxShadow='0 18px 40px rgba(0,0,0,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=isClaimed ? 'rgba(245,158,11,0.3)' : '#1e293b'; e.currentTarget.style.boxShadow='none'; }}
                    >
                      {isClaimed && (
                        <div style={{
                          position: 'absolute', top: '10px', right: '-28px',
                          backgroundColor: '#f59e0b', color: 'black',
                          padding: '4px 32px', fontSize: '0.6rem', fontWeight: '900',
                          transform: 'rotate(45deg)', letterSpacing: '0.1em'
                        }}>CLAIMED</div>
                      )}
                      {isPerfect && !isClaimed && (
                        <div style={{
                          position: 'absolute', top: '10px', right: '-28px',
                          backgroundColor: '#2dd4bf', color: 'black',
                          padding: '4px 32px', fontSize: '0.6rem', fontWeight: '900',
                          transform: 'rotate(45deg)', letterSpacing: '0.1em'
                        }}>PERFECT</div>
                      )}
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
                  );
                })}

              </div>
            </div>
          )}

          {knowledgeSubTab === 'Community' && (
            <div id="ecosystem-sector">
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                {Object.entries(ECOSYSTEM_QUIZZES).flatMap(([slug, quizzes]) => 
                  quizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase())).map((quiz, i) => {
                    const eco = ecosystems.find(e => e.slug === slug);
                    const isClaimed = !!claimedRewardsHistory[quiz.title];
                    const isPerfect = perfectQuizzes[quiz.stage]?.includes(quiz.title);
                    return (
                      <div key={`${slug}-${i}`} onClick={() => startQuiz(quiz, quiz.stage)} style={{
                        backgroundColor: isClaimed ? 'rgba(245, 158, 11, 0.03)' : '#0a0f1e', 
                        border: isClaimed ? '1.5px solid rgba(245, 158, 11, 0.3)' : '1.5px solid #1e293b', 
                        borderRadius: '22px',
                        padding: '26px', cursor: 'pointer', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                        display: 'flex', flexDirection: 'column', gap: '14px',
                        position: 'relative', overflow: 'hidden'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor=isClaimed ? 'rgba(245,158,11,0.5)' : 'rgba(45,212,191,0.35)'; e.currentTarget.style.boxShadow='0 18px 40px rgba(0,0,0,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=isClaimed ? 'rgba(245,158,11,0.3)' : '#1e293b'; e.currentTarget.style.boxShadow='none'; }}
                      >
                        {isClaimed && (
                          <div style={{
                            position: 'absolute', top: '10px', right: '-28px',
                            backgroundColor: '#f59e0b', color: 'black',
                            padding: '4px 32px', fontSize: '0.6rem', fontWeight: '900',
                            transform: 'rotate(45deg)', letterSpacing: '0.1em'
                          }}>CLAIMED</div>
                        )}
                        {isPerfect && !isClaimed && (
                          <div style={{
                            position: 'absolute', top: '10px', right: '-28px',
                            backgroundColor: '#2dd4bf', color: 'black',
                            padding: '4px 32px', fontSize: '0.6rem', fontWeight: '900',
                            transform: 'rotate(45deg)', letterSpacing: '0.1em'
                          }}>PERFECT</div>
                        )}
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
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 70%)', zIndex: 0 }} />
          
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, #2dd4bf, transparent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Intelligence Archives</span>
            </div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', color: 'white', marginBottom: '16px', fontFamily: "'PP Mori', sans-serif", letterSpacing: '-0.03em' }}>Intel <span style={{ color: '#2dd4bf' }}>Glossary</span></h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.7', maxWidth: '680px', marginBottom: '16px' }}>
              Explore Web3 terminology made simple. Discover clear definitions that make the decentralized ecosystem easier to understand.
            </p>
          </div>
          {!isMobile && (
            <div style={{ width: '220px', flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative', minHeight: '220px', alignItems: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <img 
                src="/glossary.png" 
                alt="Intel Glossary" 
                className="float-anim"
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  objectFit: 'contain', 
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))', 
                  zIndex: 1,
                  backgroundColor: 'white',
                  borderRadius: '0',
                  padding: '0'
                }}
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
          padding: isMobile ? '24px 20px' : '28px 40px', marginBottom: '48px',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '40px', boxShadow: '0 20px 80px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {/* Decorative Background Elements */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(45, 212, 191, 0.1) 0%, transparent 70%)', zIndex: 0 }} />
          
          <div style={{ flex: 1, zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, #2dd4bf, transparent)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Governance Hub</span>
            </div>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', color: 'white', marginBottom: '16px', fontFamily: "'PP Mori', sans-serif", letterSpacing: '-0.03em' }}>Governance <span style={{ color: '#2dd4bf' }}>Forums</span></h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.7', maxWidth: '680px', marginBottom: '16px' }}>
              Explore active governance spaces across the Web3 ecosystem. Read proposals, cast votes, and shape protocol decisions.
            </p>
          </div>
          {!isMobile && (
            <div style={{ width: '220px', flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative', minHeight: '220px', alignItems: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />
              <img 
                src="/governace.png" 
                alt="Governance Forums" 
                className="float-anim"
                style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))', zIndex: 1 }}
              />
            </div>
          )}
        </div>

        <div style={{ borderBottom: '1px solid #1e293b', marginBottom: '32px' }}></div>

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

  // Helper to get all quiz objects
  const getAllQuizzes = () => {
    return [
      ...daoQuizzes,
      ...web3Quizzes,
      ...Object.values(ECOSYSTEM_QUIZZES).flat(),
    ];
  };

  const renderProfile = () => {
    const { totalScore, completedCount } = masteryStats;
    const totalClaimed = Object.values(claimedRewardsHistory).reduce((sum, c) => sum + (c.amount || 0), 0);
    const claimCount = Object.keys(claimedRewardsHistory).length;

    // Get unclaimed rewards: perfect quizzes not in claimedRewardsHistory
    const allQuizzes = getAllQuizzes();
    const allPerfectQuizTitles = Object.values(perfectQuizzes).flat();
    const unclaimedRewards = [];
    allPerfectQuizTitles.forEach(quizTitle => {
      if (!claimedRewardsHistory[quizTitle]) {
        const quiz = allQuizzes.find(q => q.title === quizTitle);
        if (quiz) {
          unclaimedRewards.push({
            quizTitle,
            stage: quiz.stage,
            amount: 10
          });
        }
      }
    });

    // Also include pending (skipped) claims not already in perfectQuizzes, but only if they have answers
    pendingClaims.forEach(claim => {
      const { quizId, answers } = claim;
      if (answers && answers.length > 0 && !claimedRewardsHistory[quizId] && !unclaimedRewards.find(r => r.quizTitle === quizId)) {
        unclaimedRewards.push({ quizTitle: quizId, stage: 'Pending', amount: 10 });
      }
    });

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

        {/* Unclaimed Rewards */}
        {unclaimedRewards.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0.03) 100%)', border: '1.5px solid rgba(45, 212, 191, 0.3)', borderRadius: '24px', padding: isMobile ? '24px' : '36px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(45, 212, 191, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏅</div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>Unclaimed Rewards</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>You have {unclaimedRewards.length} reward{unclaimedRewards.length > 1 ? 's' : ''} waiting to be claimed!</p>
              </div>
            </div>

            {contractBalance !== null && parseFloat(contractBalance) < 10 && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '14px 18px', 
                borderRadius: '16px', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div>
                  <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.85rem', marginBottom: '4px' }}>REWARD POOL LOW</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: '1.4' }}>
                    The reward contract is currently low on G$ tokens. You can still claim, but the transaction may fail until the pool is refilled by the treasury.
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unclaimedRewards.map((reward, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(45,212,191,0.15)', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2dd4bf', boxShadow: '0 0 8px rgba(45,212,191,0.5)', flexShrink: 0 }} />
                    <div>
                      <div style={{ color: 'white', fontWeight: '700', fontSize: '0.88rem' }}>{reward.quizTitle}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{reward.stage}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '900', color: '#2dd4bf', fontSize: '0.95rem' }}>+{reward.amount} G$</span>
                    {claimedRewardsHistory[reward.quizTitle] ? (
                      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '800' }}>✓ CLAIMED</span>
                    ) : (
                      <button 
                        onClick={() => handleClaimReward(reward.quizTitle)} 
                        disabled={isClaiming}
                        style={{
                          padding: '8px 20px',
                          borderRadius: '12px',
                          backgroundColor: '#2dd4bf',
                          color: '#0a0f1e',
                          border: 'none',
                          fontWeight: '800',
                          cursor: isClaiming ? 'not-allowed' : 'pointer',
                          opacity: isClaiming ? 0.7 : 1,
                          fontSize: '0.85rem'
                        }}
                      >
                        {isClaiming ? 'Claiming...' : 'Claim Now'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {claimStatus && (
              <div style={{ 
                marginTop: '20px', 
                padding: '12px 16px', 
                borderRadius: '12px', 
                backgroundColor: claimStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${claimStatus.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                color: claimStatus.success ? '#10b981' : '#ef4444',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <div style={{ 
                  width: '6px', height: '6px', borderRadius: '50%', 
                  backgroundColor: claimStatus.success ? '#10b981' : '#ef4444',
                  boxShadow: `0 0 8px ${claimStatus.success ? '#10b981' : '#ef4444'}`
                }} />
                {claimStatus.message}
              </div>
            )}
          </div>
        )}


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
              const count = masteryStats.sectorCounts[cat] || 0;
              const total = stageQuizCounts[cat];
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: count > 0 ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: count > 0 ? '#2dd4bf' : '#475569', flexShrink: 0 }}>
                    {cat === 'DAO knowledge' ? <Shield size={18} /> : cat === 'Basics' ? <Zap size={18} /> : <Globe size={18} />}
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
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>10 G$ per quiz · One claim per quiz</p>
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
                const claimDate = new Date(claim.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderRadius: '14px', background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.1)', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#f59e0b' }}>
                        10
                      </div>
                      <div>
                        <div style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{qId}</div>
                        <div style={{ color: '#475569', fontSize: '0.75rem' }}>{claimDate}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '900', color: '#f59e0b', fontSize: '1.1rem' }}>+10 G$</span>
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
          <p style={{ color: '#94a3b8' }}>Customize your experience.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Sound Effects', desc: 'Enable auditory feedback during missions', active: soundEnabled, key: 'sound' },
            { label: 'Background Music', desc: 'Play looping music during quiz sessions', active: backgroundMusicEnabled, key: 'bgMusic' },
            { label: 'Tactical Notifications', desc: 'Receive alerts for new governance missions', active: true }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderRadius: '20px', backgroundColor: '#0a0f1e', border: '1px solid #1e293b' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'white', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.desc}</div>
              </div>
              <div onClick={() => {
                if (item.key === 'sound') setSoundEnabled(!item.active);
                if (item.key === 'bgMusic') setBackgroundMusicEnabled(!item.active);
              }} style={{ 
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
            <LogOut size={18} /> Disconnect Session
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
        padding: isMobile ? '0 16px' : '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(5, 10, 21, 0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        gap: isMobile ? '12px' : '40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '32px', flexShrink: 0 }}>
          {isMobile && !activeQuiz && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleBack}>
            <img
              src="/logo/goodgov_logo.png"
              alt="GoodGov"
              style={{ height: isMobile ? '32px' : '54px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Global Search Bar - Hidden on mobile to save space */}
        {!activeQuiz && !isMobile && (
          <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input 
              type="text" 
              placeholder="Search missions, glossary, or forums..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {!isLoggedIn ? (
            !isMiniPay && (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                style={{
                  padding: isMobile ? '0.6rem 1.2rem' : '0.85rem 1.2rem',
                  borderRadius: '0px',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
                  color: 'black',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: isMobile ? '0.8rem' : '1rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(45, 212, 191, 0.2)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)';
                }}
              >
                {isConnecting ? '...' : 'Connect Wallet'}
              </button>
            )
          ) : (
            <WalletDropdown 
              address={walletAddress} 
              isLoggedIn={isLoggedIn} 
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
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginLeft: '12px', marginBottom: '16px', display: 'block' }}>Operational Hub</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <SidebarItem icon={BookOpen} label="Knowledge Base" active={activeTab === 'Knowledge Base'} onClick={() => { playGameSound('click'); setActiveTab('Knowledge Base'); if(isMobile) setIsSidebarOpen(false); }} />
                  <SidebarItem icon={Book} label="Intel Glossary" active={activeTab === 'Glossary'} onClick={() => { playGameSound('click'); setActiveTab('Glossary'); if(isMobile) setIsSidebarOpen(false); }} />
                  <SidebarItem icon={MessageSquare} label="Governance Forums" active={activeTab === 'Forums'} onClick={() => { playGameSound('click'); setActiveTab('Forums'); if(isMobile) setIsSidebarOpen(false); }} />
                </div>
              </div>

              {isLoggedIn && (
                <div style={{ marginTop: '32px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginLeft: '12px', marginBottom: '16px', display: 'block' }}>Stats</span>
                  <div style={{ backgroundColor: '#0a0f1e', borderRadius: '20px', padding: '20px', border: '1px solid #1e293b' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>CURRENT RANK</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{masteryStats.rank}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', marginBottom: '4px' }}>MASTERY SCORE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#2dd4bf' }}>{masteryStats.totalScore} PTS</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => { playGameSound('click'); setActiveTab('Settings'); if(isMobile) setIsSidebarOpen(false); }} />
              </div>
            </div>
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
            maxWidth: '400px', width: '100%',
            background: '#0f172a',
            border: '1px solid rgba(45,212,191,0.2)',
            borderRadius: '28px',
            padding: isMobile ? '48px 28px' : '56px 36px',
            textAlign: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            animation: 'popUpCenter 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
            position: 'relative'
          }}>
            {/* Success Icon */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
              boxShadow: '0 0 40px rgba(45,212,191,0.4)',
              position: 'relative'
            }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" style={{ color: '#000' }}>
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 style={{ 
              fontSize: isMobile ? '1.5rem' : '1.7rem', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '12px', 
              letterSpacing: '-0.01em' 
            }}>
              Claim successful!
            </h2>

            <p style={{ 
              color: '#64748b', 
              fontSize: '0.9rem', 
              lineHeight: '1.5', 
              marginBottom: '32px' 
            }}>
              Token may take a minute to appear, check your connected wallet
            </p>

            <button
              onClick={() => setShowClaimSuccessModal(false)}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
                color: '#000',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 6px 20px rgba(45,212,191,0.3)'
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform = 'translateY(-2px)'; 
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(45,212,191,0.4)'; 
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform = 'translateY(0)'; 
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(45,212,191,0.3)'; 
              }}
            >
              CONFIRM
            </button>
          </div>
        </div>
      )}

      {/* Already Claimed Modal */}
      {showAlreadyClaimedModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          backgroundColor: 'rgba(5,10,21,0.96)',
          backdropFilter: 'blur(24px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            maxWidth: '400px', 
            width: 'calc(100% - 48px)',
            background: 'linear-gradient(180deg, #111827 0%, #030712 100%)',
            border: '1px solid rgba(45, 212, 191, 0.25)',
            borderRadius: '40px',
            padding: isMobile ? '48px 24px' : '56px 40px',
            textAlign: 'center',
            boxShadow: '0 40px 120px rgba(0,0,0,0.8), inset 0 0 80px rgba(45, 212, 191, 0.05)',
            animation: 'popUpCenter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Ambient Teal Glow */}
            <div style={{
              position: 'absolute', top: '0', left: '50%',
              transform: 'translateX(-50%)',
              width: '100%', height: '100px',
              background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
              zIndex: 0, pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              {/* Icon - Using App Colors (Teal) */}
              <div style={{
                width: '70px', height: '70px', borderRadius: '50%',
                background: 'rgba(45, 212, 191, 0.05)',
                border: '1.5px solid rgba(45, 212, 191, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px',
                boxShadow: '0 10px 30px rgba(45, 212, 191, 0.1)'
              }}>
                <CheckCircle size={32} color="#2dd4bf" style={{ filter: 'drop-shadow(0 0 8px rgba(45,212,191,0.5))' }} />
              </div>

              <h2 style={{ 
                fontSize: isMobile ? '1.4rem' : '1.7rem', 
                fontWeight: '900', 
                color: 'white', 
                marginBottom: '16px',
                fontFamily: "'PP Mori', sans-serif",
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                Mission <span style={{ color: '#2dd4bf' }}>Secured!</span>
              </h2>

              <p style={{ 
                color: '#94a3b8', 
                fontSize: '0.9rem', 
                lineHeight: '1.6', 
                marginBottom: '32px',
                fontWeight: '500',
                opacity: 0.9
              }}>
                You've already claimed this reward. Great work! Check out other missions to continue earning more G$ tokens.
              </p>

              <div style={{ width: '100%' }}>
                <button
                  onClick={() => setShowAlreadyClaimedModal(false)}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    borderRadius: '100px',
                    background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
                    color: '#000',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 24px rgba(45, 212, 191, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(45, 212, 191, 0.45)'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(45, 212, 191, 0.3)'; 
                  }}
                >
                  DISMISS
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
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88) translateY(20px); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1) translateY(0); }
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
