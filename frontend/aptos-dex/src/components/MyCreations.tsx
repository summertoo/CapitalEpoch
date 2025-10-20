import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useTranslation } from 'react-i18next';

interface CreatedToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  creator: string;
  network: string;
  txHash: string;
  createdAt: string;
}

const MyCreations: React.FC = () => {
  const { t } = useTranslation();
  const { wallet } = useWallet();
  const [tokens, setTokens] = useState<CreatedToken[]>([]);

  useEffect(() => {
    loadMyTokens();
  }, [wallet.account]);

  const loadMyTokens = () => {
    if (!wallet.account) return;
    
    const allTokens = JSON.parse(localStorage.getItem('myCreatedTokens') || '[]');
    const myTokens = allTokens.filter((token: CreatedToken) => 
      token.creator === wallet.account
    );
    setTokens(myTokens);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'devnet': return 'bg-green-100 text-green-800';
      case 'testnet': return 'bg-yellow-100 text-yellow-800';
      case 'mainnet': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const deleteToken = (tokenId: string) => {
    if (confirm('Are you sure you want to delete this token record?')) {
      const allTokens = JSON.parse(localStorage.getItem('myCreatedTokens') || '[]');
      const updatedTokens = allTokens.filter((token: CreatedToken) => token.id !== tokenId);
      localStorage.setItem('myCreatedTokens', JSON.stringify(updatedTokens));
      loadMyTokens();
    }
  };

  if (!wallet.connected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Creations</h2>
          <p className="text-gray-600">Please connect your wallet to view your created tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Created Tokens</h2>
        <div className="text-sm text-gray-600">
          Total: {tokens.length} tokens
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🪙</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens created yet</h3>
          <p className="text-gray-600 mb-4">Create your first token to get started!</p>
          <a 
            href="/create-token" 
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Token
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <div key={token.id} className="bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{token.name}</h3>
                  <p className="text-sm text-gray-600">{token.symbol}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(token.network)}`}>
                  {token.network}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Decimals:</span>
                  <span className="font-medium">{token.decimals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initial Supply:</span>
                  <span className="font-medium">{token.initialSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(token.createdAt)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Transaction Hash:</span>
                  <button
                    onClick={() => copyToClipboard(token.txHash)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-mono"
                    title="Click to copy"
                  >
                    {token.txHash.slice(0, 8)}...{token.txHash.slice(-8)}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${token.txHash}?network=${token.network}`, '_blank')}
                  className="flex-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  View on Explorer
                </button>
                <button
                  onClick={() => deleteToken(token.id)}
                  className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCreations;