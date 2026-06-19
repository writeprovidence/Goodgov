# GoodGov: Learn Web3 & Earn Social Impact Rewards

GoodGov is a premium, gamified Web3 education platform built on the **Celo Network**. It empowers users to master DAO governance, blockchain security, and ecosystem fundamentals while earning **GoodDollar (G$)** tokens for achieving mastery.

## 🚀 Vision
The mission of GoodGov is to transform "dry" technical documentation into an engaging, high-stakes learning adventure. By combining game design principles with social impact finance, we create a fun entry point for the next generation of decentralized citizens.

---

## ✨ Key Features

### 🕹️ Gamified Learning Experience
- **Interactive Missions**: Take quizzes across multiple categories (DAO Architecture, Web3 Basics, Ecosystems).
- **Mastery Challenges**: 20-question gauntlets requiring a perfect score to earn rewards.
- **Pro UI/UX**: High-impact visuals, animated score rings, XP progress bars, and particle chimes for success.
- **Dynamic Feedback**: Real-time correct/incorrect indicators with deep-dive technical explanations.

### 🛡️ Secure Reward Ecosystem
- **Proof-of-Solve Verification**: Unlike simple frontend apps, GoodGov uses server-side verification. Your answers are cross-checked against the master data on the backend before any reward signature is issued.
- **Cryptographic Signatures**: The server issues a secure ECDSA signature for eligible claims, which is then used to interact with the on-chain smart contract.
- **Zero Abuse Policy**: Each user can claim a specific mission's reward exactly once. One-time claiming is strictly enforced both on-chain and via database checks.

### 📱 Mobile-First Design
- **Fully Responsive**: Optimized for everything from high-res desktops to mobile devices.
- **Tactical Sound Design**: High-fidelity sound effects and background music that work reliably on mobile browsers through specialized AudioContext handling.

### 🔄 Progressive Synchronization
- **Wallet-Native Progress**: Your achievements stay with your wallet. Use **Supabase** for secure, cross-device sync of your perfect runs and claim history.
- **Deferred Claims**: Finish a quiz now, claim later. Your answers are securely persisted so you can retrieve your reward when gas is low or when you've connected your primary wallet.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Framer Motion, Lucide icons |
| **Authentication** | Privy SDK (Social & Web3 Wallets) |
| **Blockchain** | Celo Network (Mainnet) |
| **Backend** | Vercel Serverless Functions, Node.js (ESM), Express |
| **Database** | Supabase (PostgreSQL) |
| **Smart Contracts** | Solidity (QuizRewards.sol), ethers.js v5 |

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: v20 or higher (Optimized for v24)
- **Supabase Account**: For persistent data and verification logs.
- **Celo Wallet**: Private key for a treasury wallet (to sign rewards).

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/writeprovidence/GoodGov.git
   cd goodgov
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file with the following:
   ```env
   # Frontend
   VITE_PRIVY_APP_ID=your_id
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key

   # Backend (Server-side)
   TREASURY_PRIVATE_KEY=your_signing_key
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

3. **Running Locally**
   Start the hybrid Vite + Express server:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5173`.*

---

## 🏗️ Architecture

- **`api/sign-reward.js`**: The brains of the verification system. It imports raw quiz data, verifies user-submitted answers, checks for duplicate claims in Supabase, and signs the reward message if eligible.
- **`src/components/Dashboard.jsx`**: The command center. Manages game state, answer tracking, and the "deferred claim" logic.
- **`src/utils/sounds.js`**: Handles synthesized sound effects and ensures AudioContext is properly resumed on mobile devices.
- **`contracts/QuizRewards.sol`**: A transparent reward contract on Celo that verifies server signatures and dispenses G$.

---

## 🌍 Social Impact
GoodGov leverages the **GoodDollar (G$)** protocol. Every reward earned is a piece of a universal basic income ecosystem, providing real-world value while you build Digital Capital.

---

## 📄 License
MIT © 2024 GoodGov Team
