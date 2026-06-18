# GoodGov: Learn Web3 & Earn Rewards

GoodGov is an interactive, gamified Web3 education platform where users learn about DAOs, blockchain governance, and ecosystem projects while earning GoodDollar (G$) tokens!

## 🎯 Project Overview

GoodGov makes learning about decentralized governance fun and rewarding. Users can:
- Take quizzes on DAO knowledge, Web3 basics, and ecosystem-specific topics
- Complete "Mastery Challenges" for higher rewards
- Track their progress and claimed rewards across devices
- Connect their crypto wallet via Privy
- Learn from a comprehensive glossary and governance forum resources

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern, fast UI library
- **Vite**: Lightning-fast dev server and build tool
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful, consistent icons
- **Privy**: Seamless wallet connection and authentication

### Backend (Vercel Serverless Functions)
- **Express**: Lightweight server framework (for local dev)
- **Vercel Functions**: Auto-scaling, serverless endpoints

### Blockchain & Web3
- **Celo Network**: EVM-compatible chain for fast, low-cost transactions
- **GoodDollar (G$)**: Social impact token earned as rewards
- **ethers.js**: Web3 library for interacting with the blockchain

### Database
- **Supabase**: Open-source Firebase alternative for persistent, cross-device user data storage

## 📁 Key Features

### 1. Quiz System
- Multiple quiz categories: DAO Knowledge, Web3 Basics, Ecosystem-Specific
- Mastery Challenges (20 questions for perfect score rewards)
- Lifelines and timed questions
- Smooth loading and completion screens

### 2. Rewards System
- 10 G$ reward for perfect Mastery Challenge scores
- 90-day cooldown per quiz to prevent abuse
- On-chain reward claiming via smart contract or direct transfer
- Claim history tracking with transaction hashes

### 3. Persistent User Data
- Wallet-specific progress tracking
- Cross-device sync via Supabase
- Completed stages, perfect quizzes, and claim history saved

### 4. Learning Resources
- Comprehensive Web3 glossary with categorized terms
- Curated governance forum links
- Trusted ecosystem partners

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Celo wallet (for testing rewards)
- Supabase account (for persistent data)
- Privy account (for wallet auth)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/writeprovidence/GoodGov.git
   cd GoodGov
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and copy the template from `.env.example`:
   ```env
   # Frontend Variables
   VITE_PRIVY_APP_ID=your-privy-app-id
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Backend Variables
   TREASURY_PRIVATE_KEY=your-celo-treasury-wallet-private-key
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. **Set up Supabase**
   - Follow the instructions in `SUPABASE_SETUP.md` to create your Supabase project and database tables

5. **Start the dev server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 🌐 Deployment

GoodGov is fully optimized for deployment on Vercel!

### Deploy to Vercel
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repo
3. Add all your environment variables in Vercel Project Settings
4. Click "Deploy"! 🚀

## 📊 Project Structure

```
goodgov/
├── api/                      # Vercel serverless functions
│   ├── claim-reward.js       # Endpoint for claiming rewards
│   └── sign-reward.js        # Endpoint for signing reward messages
├── contracts/                # Smart contract files
│   ├── contracts/
│   │   └── QuizRewards.sol   # Quiz rewards smart contract
│   └── scripts/
│       └── deploy.js         # Contract deployment script
├── public/                   # Static assets
│   ├── assets/
│   ├── fonts/
│   ├── images/
│   └── logo/
├── src/                      # Source code
│   ├── assets/
│   ├── components/           # React components
│   │   ├── Dashboard.jsx     # Main app component
│   │   ├── LoadingScreen.jsx # Loading screen
│   │   ├── QuizElements.jsx  # Quiz UI components
│   │   └── ...
│   ├── data/                 # Static data
│   │   ├── glossary.js       # Glossary terms
│   │   └── quizzes.js        # Quiz questions
│   ├── App.jsx
│   └── main.jsx
├── .env.example              # Example env vars
├── SUPABASE_SETUP.md         # Supabase setup guide
├── package.json
├── vercel.json               # Vercel configuration
└── vite.config.js
```

## 🎨 Design Highlights

- Modern, clean dark theme
- Professional UI/UX with smooth animations
- Responsive design for all screen sizes
- Accessible and user-friendly interface

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- GoodDollar for the social impact token
- Privy for wallet authentication
- Vercel for seamless deployment
- Supabase for easy database management
