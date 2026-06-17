import { ethers } from 'ethers';

const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const RPC_URL = "https://forno.celo.org";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

// In-memory claimed quizzes (for this serverless function instance)
const claimedQuizzes = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userAddress, quizId, amount } = req.body;
    if (!userAddress || !quizId || !amount) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const claimKey = `${userAddress}-${quizId}`;
    if (claimedQuizzes.has(claimKey)) {
      return res.status(400).json({ error: "Signature already issued for this mission!" });
    }

    console.log(`Generating signature for ${userAddress} | ${quizId} | ${amount} G$...`);
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    const messageHash = ethers.utils.solidityKeccak256(["address", "string", "uint256"], [userAddress, quizId, amountWei]);
    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

    claimedQuizzes.add(claimKey);

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
