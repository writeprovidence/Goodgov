import express from 'express';
import { createServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Import API routes
import signReward from './api/sign-reward.js';
import claimReward from './api/claim-reward.js';

app.use('/api/sign-reward', signReward);
app.use('/api/claim-reward', claimReward);

async function startDevServer() {
  // Create Vite dev server
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  // Use Vite's middleware
  app.use(vite.middlewares);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startDevServer();
