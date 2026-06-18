import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { PrivyProvider } from '@privy-io/react-auth';
import { celo } from 'viem/chains';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#2dd4bf',
        },
        defaultChain: celo,
        supportedChains: [celo],
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
