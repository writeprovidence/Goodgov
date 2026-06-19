import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { DAO_QUIZZES, WEB3_ESSENTIALS_QUIZZES, ECOSYSTEM_QUIZZES } from '../src/data/quizzes';

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

    // VERIFICATION: Check if answers are provided and correct
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers required for proof-of-work verification." });
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
    for (const ans of answers) {
      const qData = quiz.questions.find(q => q.question === ans.question);
      if (qData) {
        const correctText = qData.options[qData.correct];
        if (ans.selectedAnswer === correctText) {
          correctCount++;
        }
      }
    }

    // REQUIREMENT: Must be a perfect run of 20 questions to get the reward
    if (correctCount < 20) {
      return res.status(400).json({ 
        error: `Verification failed. Only ${correctCount}/20 correct. A perfect score of 20/20 is required for reward signature.` 
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

    // Check if already claimed
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from('claimed_quizzes')
        .select('id')
        .eq('wallet_address', userAddress)
        .eq('quiz_id', quizId)
        .single();

      if (data) {
        return res.status(400).json({ error: "Signature already issued for this mission!" });
      }
    }

    console.log(`Generating signature for ${userAddress} | ${quizId} | ${FIXED_REWARD} G$...`);
    const amountWei = ethers.utils.parseUnits(FIXED_REWARD.toString(), 18);
    
    const messageHash = ethers.utils.solidityKeccak256(["address", "string", "uint256"], [userAddress, quizId, amountWei]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    // Record in Supabase if available
    if (supabaseClient) {
      await supabaseClient.from('claimed_quizzes').insert([
        { wallet_address: userAddress, quiz_id: quizId, amount: FIXED_REWARD }
      ]);
    }

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
