import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { PrivyProvider } from '@privy-io/react-auth';
import { celo } from 'viem/chains';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure Wagmi as per Celo MiniPay docs
const config = createConfig({
  chains: [celo],
  connectors: [injected()],
  transports: {
    [celo.id]: http(),
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID}
          config={{
            loginMethods: ['wallet'],
            appearance: {
              theme: 'dark',
              accentColor: '#2dd4bf',
              walletList: ['metamask', 'rainbow', 'trust', 'wallet_connect', 'wallet_connect_qr'],
            },
            defaultChain: celo,
            supportedChains: [celo],
            ...(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID && {
              walletConnectCloudProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
            }),
          }}
        >
          <App />
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
