import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Celo Mainnet RPC
const RPC_URL = "https://forno.celo.org";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// The private key of your Treasury Hot Wallet that holds G$
// Defaulting to a blank template so it doesn't crash on start if not configured
const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);

// GoodDollar ERC-20 Address on Celo
const GD_TOKEN_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";

// Minimal ERC-20 ABI for transferring tokens
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

const gdTokenContract = new ethers.Contract(GD_TOKEN_ADDRESS, ERC20_ABI, wallet);

// Simple memory queue to prevent double claims in a single session
// In production, use a proper database like PostgreSQL or MongoDB
const claimedQuizzes = new Set(); 

app.post('/api/claim-reward', async (req, res) => {
    try {
        const { userAddress, quizId, amount } = req.body;

        if (!userAddress || !quizId || !amount) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        const claimKey = `${userAddress}-${quizId}`;
        if (claimedQuizzes.has(claimKey)) {
            return res.status(400).json({ error: "Reward already claimed for this specific mission!" });
        }

        // For absolute safety, if private key isn't set, simulate success
        if (TREASURY_PRIVATE_KEY === "0x0000000000000000000000000000000000000000000000000000000000000000") {
             console.log(`[SIMULATION] Would have sent ${amount} G$ to ${userAddress}`);
             claimedQuizzes.add(claimKey);
             return res.json({ success: true, txHash: "0xSimulatedTransactionHash...", message: "Simulation successful (No real private key found)." });
        }

        console.log(`Processing reward of ${amount} G$ to ${userAddress} for ${quizId}...`);
        
        // GoodDollar uses 18 decimal places standard representation
        const amountWei = ethers.utils.parseUnits(amount.toString(), 18);

        // Execute the transfer transaction
        const tx = await gdTokenContract.transfer(userAddress, amountWei);
        console.log(`Transaction submitted! Hash: ${tx.hash}`);

        // Wait for 1 block confirmation to ensure it went through
        await tx.wait(1);
        console.log(`Transaction clearly confirmed on Celo!`);

        // Mark as claimed for this mission
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
});

// NEW: Signature generation for QuizRewards.sol contract
app.post('/api/sign-reward', async (req, res) => {
    try {
        const { userAddress, quizId, amount } = req.body;

        if (!userAddress || !quizId || !amount) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        // Check if already claimed locally (memoery queue)
        const claimKey = `${userAddress}-${quizId}`;
        if (claimedQuizzes.has(claimKey)) {
            return res.status(400).json({ error: "Signature already issued for this mission!" });
        }

        console.log(`Generating signature for ${userAddress} | ${quizId} | ${amount} G$...`);

        // The contract expects: keccak256(abi.encodePacked(sender, quizId, amount))
        // amount should be in Wei (18 decimals) for the signature to match the contract call
        const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
        
        const messageHash = ethers.utils.solidityKeccak256(
            ["address", "string", "uint256"],
            [userAddress, quizId, amountWei]
        );

        // Sign the hash
        const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

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
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------------`);
    console.log(` GoodGov Hot Wallet Relayer Server Active! `);
    console.log(` Port: ${PORT}`);
    console.log(` Treasury Configured: ${TREASURY_PRIVATE_KEY === "0x0000000000000000000000000000000000000000000000000000000000000000" ? 'NO (Simulation Mode)' : 'YES'}`);
    if (TREASURY_PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        console.log(` Treasury Address: ${wallet.address}`);
    }
    console.log(`-----------------------------------------------`);
});
