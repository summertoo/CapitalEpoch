import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// 钱包状态接口
interface WalletState {
  connected: boolean;
  account: string | null;
  network: Network;
  balance: string;
}

// 钱包上下文接口
interface WalletContextType {
  wallet: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: Network) => void;
  getBalance: () => Promise<void>;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
}

// 创建上下文
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Aptos配置 - 动态创建
let aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

// 钱包提供者组件
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    account: null,
    network: Network.DEVNET,
    balance: '0'
  });

  // 连接钱包
  const connect = async () => {
    try {
      // 检查是否安装了Petra钱包
      if (!window.aptos) {
        alert('请安装Petra钱包');
        return;
      }

      // 连接钱包
      const response = await window.aptos.connect();
      
      setWallet(prev => ({
        ...prev,
        connected: true,
        account: response.address
      }));

      // 获取余额
      setTimeout(() => getBalance(), 1000); // 延迟获取余额
      
      console.log('钱包连接成功:', response.address);
    } catch (error) {
      console.error('钱包连接失败:', error);
    }
  };

  // 断开钱包连接
  const disconnect = () => {
    if (window.aptos) {
      window.aptos.disconnect();
    }
    
    setWallet({
      connected: false,
      account: null,
      network: Network.DEVNET,
      balance: '0'
    });
    
    console.log('钱包已断开连接');
  };

  // 切换网络
  const switchNetwork = (network: Network) => {
    // 更新Aptos实例
    aptos = new Aptos(new AptosConfig({ network }));
    
    setWallet(prev => ({
      ...prev,
      network
    }));
    
    // 重新获取余额
    if (wallet.account) {
      getBalance();
    }
  };

  // 获取账户余额
  const getBalance = async () => {
    if (!wallet.account) return;
    
    try {
      // 方法1: 使用SDK的getAccountAPTAmount方法
      try {
        const balance = await aptos.getAccountAPTAmount({
          accountAddress: wallet.account
        });
        setWallet(prev => ({
          ...prev,
          balance: (balance / 100000000).toString() // 转换为APT单位
        }));
        return;
      } catch (sdkError) {
        console.log('SDK方法失败，尝试资源查询:', sdkError);
      }

      // 方法2: 查询资源 - 支持新旧两种标准
      const resources = await aptos.getAccountResources({
        accountAddress: wallet.account
      });
      
      // 尝试新的FA标准
      const faResource = resources.find(
        (r) => r.type === '0x1::primary_fungible_store::PrimaryFungibleStore'
      );
      
      if (faResource) {
        const balance = (faResource.data as any).balance;
        setWallet(prev => ({
          ...prev,
          balance: (parseInt(balance) / 100000000).toString()
        }));
        return;
      }
      
      // 尝试旧的Coin标准
      const coinResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (coinResource) {
        const balance = (coinResource.data as any).coin.value;
        setWallet(prev => ({
          ...prev,
          balance: (parseInt(balance) / 100000000).toString()
        }));
        return;
      }
      
      // 如果都没找到，设置为0
      setWallet(prev => ({
        ...prev,
        balance: '0'
      }));
      
    } catch (error) {
      console.error('获取余额失败:', error);
      console.error('当前网络:', wallet.network);
      console.error('账户地址:', wallet.account);
      
      // 设置默认余额
      setWallet(prev => ({
        ...prev,
        balance: '0'
      }));
    }
  };

  // 签名并提交交易
  const signAndSubmitTransaction = async (transaction: any) => {
    if (!window.aptos || !wallet.connected) {
      throw new Error('钱包未连接');
    }

    try {
      const response = await window.aptos.signAndSubmitTransaction(transaction);
      console.log('交易提交成功:', response);
      
      // 更新余额
      await getBalance();
      
      return response;
    } catch (error) {
      console.error('交易失败:', error);
      throw error;
    }
  };

  // 监听钱包状态变化
  useEffect(() => {
    if (window.aptos) {
      // 监听账户变化
      window.aptos.onAccountChange((account: any) => {
        if (account) {
          setWallet(prev => ({
            ...prev,
            account: account.address
          }));
          getBalance();
        } else {
          disconnect();
        }
      });

      // 监听网络变化
      window.aptos.onNetworkChange((network: any) => {
        console.log('网络已切换:', network);
      });
    }
  }, []);

  // 自动重连
  useEffect(() => {
    const autoConnect = async () => {
      if (window.aptos) {
        try {
          const account = await window.aptos.account();
          if (account) {
            setWallet(prev => ({
              ...prev,
              connected: true,
              account: account.address
            }));
            await getBalance();
          }
        } catch (error) {
          // 用户未连接钱包，忽略错误
        }
      }
    };

    autoConnect();
  }, []);

  const contextValue: WalletContextType = {
    wallet,
    connect,
    disconnect,
    switchNetwork,
    getBalance,
    signAndSubmitTransaction
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// 使用钱包上下文的Hook
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet必须在WalletProvider内使用');
  }
  return context;
};

// 扩展Window接口以包含aptos
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