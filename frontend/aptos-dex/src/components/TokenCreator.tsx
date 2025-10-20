import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Network } from '@aptos-labs/ts-sdk';

interface TokenForm {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
}

const TokenCreator = () => {
  const { wallet, signAndSubmitTransaction } = useWallet();
  const [form, setForm] = useState<TokenForm>({
    name: '',
    symbol: '',
    decimals: 8,
    initialSupply: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'decimals' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (wallet.network === Network.MAINNET) {
      alert('Token creation is only available on Devnet and Testnet');
      return;
    }

    if (!form.name || !form.symbol || !form.initialSupply) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // 使用简化的token合约
      const transaction = {
        function: "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d::simple_token::create_token",
        type_arguments: [`0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d::simple_token::${form.symbol}`],
        arguments: [
          Array.from(new TextEncoder().encode(form.name)), // name as bytes
          Array.from(new TextEncoder().encode(form.symbol)), // symbol as bytes
          form.decimals, // decimals
          parseInt(form.initialSupply), // initial_supply
          true // monitor_supply
        ],
        type: "entry_function_payload"
      };

      const result = await signAndSubmitTransaction(transaction);
      console.log('Token created successfully:', result);
      
      // 保存到本地存储
      const createdToken = {
        id: Date.now().toString(),
        name: form.name,
        symbol: form.symbol,
        decimals: form.decimals,
        initialSupply: form.initialSupply,
        creator: wallet.account,
        network: wallet.network,
        txHash: result.hash,
        createdAt: new Date().toISOString()
      };
      
      const existingTokens = JSON.parse(localStorage.getItem('myCreatedTokens') || '[]');
      existingTokens.push(createdToken);
      localStorage.setItem('myCreatedTokens', JSON.stringify(existingTokens));
      
      // 重置表单
      setForm({
        name: '',
        symbol: '',
        decimals: 8,
        initialSupply: ''
      });
      
      alert('Token created successfully! Check "My Creations" to view your tokens.');
    } catch (error) {
      console.error('Failed to create token:', error);
      alert('Failed to create token, please check parameters and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Token</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="e.g., My Token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Symbol *
          </label>
          <input
            type="text"
            name="symbol"
            value={form.symbol}
            onChange={handleInputChange}
            placeholder="e.g., MTK"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decimals
          </label>
          <input
            type="number"
            name="decimals"
            value={form.decimals}
            onChange={handleInputChange}
            min="0"
            max="18"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Supply *
          </label>
          <input
            type="text"
            name="initialSupply"
            value={form.initialSupply}
            onChange={handleInputChange}
            placeholder="e.g., 1000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !wallet.connected}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            loading || !wallet.connected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Creating...' : 'Create Token'}
        </button>
      </form>

      {!wallet.connected && (
        <p className="text-center text-red-500 text-sm mt-4">
          Please connect your wallet to create tokens
        </p>
      )}
    </div>
  );
};

export default TokenCreator;