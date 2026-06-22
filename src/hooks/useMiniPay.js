import { useEffect, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { injected } from 'wagmi/connectors';

/**
 * Hook to handle MiniPay compatibility.
 * It detects if the app is running within MiniPay and automatically connects the wallet.
 * Based on Celo MiniPay documentation: https://docs.celo.org/build-on-celo/build-on-minipay/quickstart
 */
export const useMiniPay = () => {
  const { connect } = useConnect();
  const { isConnected } = useAccount();
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    // Check if the provider is MiniPay
    if (typeof window !== 'undefined' && window.ethereum?.isMiniPay) {
      setIsMiniPay(true);
      
      // Auto-connect if not connected via Wagmi
      if (!isConnected) {
        console.log('MiniPay detected, auto-connecting via Wagmi...');
        connect({ 
          connector: injected() 
        });
      }
    }
  }, [connect, isConnected]);

  return { isMiniPay };
};
