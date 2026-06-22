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
          // wallet_connect_qr shows a QR trigger for standard browsers (mobile & desktop)
          // wallet_connect opens the mobile deep-link flow in mobile browsers
          walletList: ['metamask', 'rainbow', 'trust', 'wallet_connect', 'wallet_connect_qr'],
        },
        defaultChain: celo,
        supportedChains: [celo],
        // Optional: add your WalletConnect Cloud Project ID from cloud.walletconnect.com
        // for better reliability. If omitted, Privy uses its own project ID.
        ...(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID && {
          walletConnectCloudProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
        }),
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
)
