import { useEffect, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { injected } from 'wagmi/connectors';

/**
 * Hook to handle MiniPay compatibility.
 * It detects if the app is running within MiniPay and automatically connects the wallet.
 */
export const useMiniPay = () => {
  const { connect } = useConnect();
  const { isConnected } = useAccount();
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    // Check if the provider is MiniPay
    const checkMiniPay = () => {
      if (typeof window !== 'undefined' && window.ethereum?.isMiniPay) {
        console.log('Detecting MiniPay environment...');
        setIsMiniPay(true);
        
        if (!isConnected) {
          console.log('MiniPay detected, auto-connecting...');
          connect({ connector: injected() });
        }
      } else {
        setIsMiniPay(false);
      }
    };

    checkMiniPay();
    
    // Some providers inject window.ethereum slightly later
    const timeout = setTimeout(checkMiniPay, 1000);
    return () => clearTimeout(timeout);
  }, [connect, isConnected]);

  return { isMiniPay };
};
