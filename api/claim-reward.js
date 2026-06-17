import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const RPC_URL = "https://forno.celo.org";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
const GD_TOKEN_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

const gdTokenContract = new ethers.Contract(GD_TOKEN_ADDRESS, ERC20_ABI, wallet);

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

    // Check if already claimed (using Supabase if available)
    if (supabase) {
      const { data, error } = await supabase
        .from('claimed_quizzes')
        .select('id, tx_hash')
        .eq('wallet_address', userAddress)
        .eq('quiz_id', quizId)
        .single();

      if (data) {
        return res.status(400).json({ error: "Reward already claimed for this specific mission!" });
      }
    }

    let txHash = "0xSimulatedTransactionHash...";
    let message = "Simulation successful (No real private key found).";

    if (TREASURY_PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log(`Processing reward of ${amount} G$ to ${userAddress} for ${quizId}...`);
      const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
      const tx = await gdTokenContract.transfer(userAddress, amountWei);
      console.log(`Transaction submitted! Hash: ${tx.hash}`);
      txHash = tx.hash;
      await tx.wait(1);
      console.log(`Transaction confirmed on Celo!`);
      message = `Successfully transferred ${amount} G$!`;
    } else {
      console.log(`[SIMULATION] Would have sent ${amount} G$ to ${userAddress}`);
    }

    // Record in Supabase if available (with tx hash)
    if (supabase) {
      // First check again to make sure it's not already there (race condition)
      const { data: existing } = await supabase
        .from('claimed_quizzes')
        .select('id')
        .eq('wallet_address', userAddress)
        .eq('quiz_id', quizId)
        .single();

      if (!existing) {
        await supabase.from('claimed_quizzes').insert([
          { wallet_address: userAddress, quiz_id: quizId, amount: amount, tx_hash: txHash }
        ]);
      }
    }

    res.json({
      success: true,
      txHash: txHash,
      message: message
    });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ error: error.message || "Internal server error during transfer." });
  }
}
