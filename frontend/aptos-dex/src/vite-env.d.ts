/// <reference types="vite/client" />

// 扩展Window接口以包含aptos钱包
declare global {
  interface Window {
    aptos?: {
      connect: () => Promise<{ address: string; publicKey: string }>;
      disconnect: () => Promise<void>;
      account: () => Promise<{ address: string; publicKey: string }>;
      signAndSubmitTransaction: (transaction: any) => Promise<any>;
      onAccountChange: (callback: (account: any) => void) => void;
      onNetworkChange: (callback: (network: any) => void) => void;
    };
  }
}

export {};