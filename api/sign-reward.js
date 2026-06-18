import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
const RPC_URL = "https://forno.celo.org";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Only create wallet if we have a valid private key
let wallet;
if (TREASURY_PRIVATE_KEY && !/^0x0+$/.test(TREASURY_PRIVATE_KEY)) {
  wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
}

// Initialize Supabase (if keys are available)
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userAddress, quizId, amount } = req.body;
    if (!userAddress || !quizId || !amount) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Check if already claimed (using Supabase if available, else skip for demo)
    if (supabase) {
      const { data, error } = await supabase
        .from('claimed_quizzes')
        .select('id')
        .eq('wallet_address', userAddress)
        .eq('quiz_id', quizId)
        .single();

      if (data) {
        return res.status(400).json({ error: "Signature already issued for this mission!" });
      }
    }

    console.log(`Generating signature for ${userAddress} | ${quizId} | ${amount} G$...`);
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    
    if (!wallet) {
      return res.status(500).json({ error: "Treasury wallet not configured. Please set TREASURY_PRIVATE_KEY in .env" });
    }
    
    const messageHash = ethers.utils.solidityKeccak256(["address", "string", "uint256"], [userAddress, quizId, amountWei]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    // Record in Supabase if available
    if (supabase) {
      await supabase.from('claimed_quizzes').insert([
        { wallet_address: userAddress, quiz_id: quizId, amount: amount }
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
    res.status(500).json({ error: error.message || "Internal server error during signature generation." });
  }
}
