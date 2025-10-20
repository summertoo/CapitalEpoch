import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../contexts/WalletContext';
import { Network } from '@aptos-labs/ts-sdk';



interface NetworkConfig {
  name: string;
  label: string;
  color: string;
  rpcUrl: string;
}

const NetworkSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { wallet, switchNetwork } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 使用钱包上下文中的当前网络
  const currentNetwork = wallet.network;

  const networks: Record<Network, NetworkConfig> = {
    [Network.DEVNET]: {
      name: 'devnet',
      label: 'Devnet',
      color: 'bg-green-100 text-green-800',
      rpcUrl: 'https://fullnode.devnet.aptoslabs.com/v1'
    },
    [Network.TESTNET]: {
      name: 'testnet',
      label: 'Testnet',
      color: 'bg-yellow-100 text-yellow-800',
      rpcUrl: 'https://fullnode.testnet.aptoslabs.com/v1'
    },
    [Network.MAINNET]: {
      name: 'mainnet',
      label: 'Mainnet',
      color: 'bg-blue-100 text-blue-800',
      rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1'
    }
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNetworkSwitch = (network: Network) => {
    setIsOpen(false);
    switchNetwork(network);
    console.log(`Switched to ${network}:`, networks[network].rpcUrl);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 当前网络显示按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${networks[currentNetwork].color} hover:opacity-80`}
      >
        <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
        {networks[currentNetwork].label}
        <svg
          className={`ml-1 h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border z-50">
          <div className="py-1">
            {Object.entries(networks).map(([key, network]) => (
              <button
                key={key}
                onClick={() => handleNetworkSwitch(key as Network)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                  currentNetwork === key ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    key === Network.DEVNET ? 'bg-green-500' :
                    key === Network.TESTNET ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <span className={currentNetwork === key ? 'font-medium' : ''}>
                    {network.label}
                  </span>
                  {currentNetwork === key && (
                    <svg className="ml-auto h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher;