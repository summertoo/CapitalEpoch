import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Network, Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

const FaucetButton: React.FC = () => {
  const { wallet, getBalance } = useWallet();
  const [loading, setLoading] = useState(false);

  const requestFaucet = async () => {
    if (!wallet.account || wallet.network === Network.MAINNET) return;
    
    setLoading(true);
    try {
      // 使用SDK的水龙头功能
      const aptosConfig = new AptosConfig({ network: wallet.network });
      const aptos = new Aptos(aptosConfig);
      
      await aptos.fundAccount({
        accountAddress: wallet.account,
        amount: 100000000 // 1 APT
      });
      
      setTimeout(() => getBalance(), 3000); // 延迟获取余额
      alert('测试代币申请成功！请等待几秒钟后查看余额');
      
    } catch (error) {
      console.error('Faucet request failed:', error);
      
      // 如果SDK方法失败，提供手动链接
      const faucetUrl = wallet.network === Network.DEVNET 
        ? 'https://faucet.devnet.aptoslabs.com'
        : 'https://faucet.testnet.aptoslabs.com';
      
      const confirmed = confirm(`自动申请失败。是否打开水龙头网站手动申请？\n\n地址: ${wallet.account}`);
      if (confirmed) {
        window.open(faucetUrl, '_blank');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected || wallet.network === Network.MAINNET) {
    return null;
  }

  return (
    <button
      onClick={requestFaucet}
      disabled={loading}
      className="px-3 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50"
      title={`在${wallet.network}上获取测试APT代币`}
    >
      {loading ? '申请中...' : '获取测试币'}
    </button>
  );
};

export default FaucetButton;