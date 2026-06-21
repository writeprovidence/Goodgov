import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { DAO_QUIZZES, WEB3_ESSENTIALS_QUIZZES, ECOSYSTEM_QUIZZES } from '../src/data/quizzes.js';

// Provider and Supabase initialized inside handler to ensure .env is loaded

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userAddress, quizId, answers } = req.body;
    if (!userAddress || !quizId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const allQuizzes = [
      ...DAO_QUIZZES,
      ...WEB3_ESSENTIALS_QUIZZES,
      ...Object.values(ECOSYSTEM_QUIZZES).flat()
    ];
    
    const quiz = allQuizzes.find(q => q.title === quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz definition not found on server." });
    }

    // Verify each answer against the server-side quiz data
    let correctCount = 0;
    if (answers && Array.isArray(answers)) {
      for (const ans of answers) {
        const qData = quiz.questions.find(q => q.question.trim() === ans.question.trim());
        if (qData) {
          const correctText = qData.options[qData.correct];
          if (ans.selectedAnswer.trim().toLowerCase() === correctText.trim().toLowerCase()) {
            correctCount++;
          }
        }
      }
    }

    // REQUIREMENT: Must be a perfect run of 20 questions to get the reward
    // FALLBACK: If answers are missing or score is low, check Supabase perfect_quizzes table
    let isVerified = correctCount >= 20;

    if (!isVerified) {
      console.log(`Verification failed (${correctCount}/20). Checking Supabase fallback for ${userAddress}...`);
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        const { data: perfectRecord, error: supabaseError } = await supabaseAdmin
          .from('perfect_quizzes')
          .select('*')
          .eq('wallet_address', userAddress)
          .eq('quiz_title', quizId)
          .single();

        if (perfectRecord && !supabaseError) {
          console.log(`✅ Supabase fallback verified: User has a perfect score record.`);
          isVerified = true;
        }
      }
    }

    if (!isVerified) {
      return res.status(400).json({ 
        error: `Verification failed. A perfect score is required for reward signature. If you previously achieved this, ensure you are using the same wallet.` 
      });
    }

    // SECURITY FIX: Hardcode the reward amount on the server
    // This prevents bad actors from requesting signatures for arbitrary amounts.
    const FIXED_REWARD = 10;

    // Initialize provider and wallet inside handler to ensure process.env is ready
    const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
    
    const RPC_URL = "https://forno.celo.org";
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    let wallet;
    if (TREASURY_PRIVATE_KEY && !/^0x0+$/.test(TREASURY_PRIVATE_KEY)) {
      wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    }

    if (!wallet) {
      return res.status(500).json({ error: "Treasury wallet not configured." });
    }

    // Initialize Supabase (if keys are available)
    let supabaseClient;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }

    // NEW: Check blockchain state first.
    // If the token hasn't actually been claimed on-chain, we always allow re-issuing the signature.
    const QUIZ_REWARDS_ADDRESS = process.env.QUIZ_REWARDS_CONTRACT || "0x66A159A0F8E204383D3c32Acf5DaF97f23541989";
    const contract = new ethers.Contract(
      QUIZ_REWARDS_ADDRESS,
      ["function hasClaimed(address, string) view returns (bool)"],
      provider
    );
    
    const onChainClaimed = await contract.hasClaimed(userAddress, quizId);
    if (onChainClaimed) {
      return res.status(400).json({ error: "Reward already successfully claimed on the blockchain!" });
    }

    console.log(`Generating signature for ${userAddress} | ${quizId} | ${FIXED_REWARD} G$...`);
    const amountWei = ethers.utils.parseUnits(FIXED_REWARD.toString(), 18);
    
    const messageHash = ethers.utils.solidityKeccak256(["address", "string", "uint256"], [userAddress, quizId, amountWei]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    // Record in Supabase (upsert to handle retries without erroring)
    // NOTE: This is now handled by the client after successful on-chain transaction
    // to avoid discrepancies between Supabase state and blockchain state.


    res.json({
      success: true,
      signature,
      amount: amountWei.toString(),
      userAddress,
      quizId
    });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).json({ error: "Internal server error during signature generation." });
  }
}
