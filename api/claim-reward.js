import { ethers } from 'ethers';

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
      return res.status(400).json({ error: "Reward already claimed for this specific mission!" });
    }

    if (TREASURY_PRIVATE_KEY === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log(`[SIMULATION] Would have sent ${amount} G$ to ${userAddress}`);
      claimedQuizzes.add(claimKey);
      return res.json({ success: true, txHash: "0xSimulatedTransactionHash...", message: "Simulation successful (No real private key found)." });
    }

    console.log(`Processing reward of ${amount} G$ to ${userAddress} for ${quizId}...`);
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
    const tx = await gdTokenContract.transfer(userAddress, amountWei);
    console.log(`Transaction submitted! Hash: ${tx.hash}`);
    await tx.wait(1);
    console.log(`Transaction confirmed on Celo!`);

    claimedQuizzes.add(claimKey);

    res.json({
      success: true,
      txHash: tx.hash,
      message: `Successfully transferred ${amount} G$!`
    });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ error: error.message || "Internal server error during transfer." });
  }
}
