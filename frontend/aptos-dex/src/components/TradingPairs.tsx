import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
// import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

interface TradingPair {
  address: string;
  tokenA: string;
  tokenB: string;
  feeRate: number;
  minTradeAmount: string;
  creator: string;
  usdtDeposit: string;
  createdAt: string;
  isActive: boolean;
  reserveA?: string;
  reserveB?: string;
}

interface SwapForm {
  pairAddress: string;
  tokenIn: string;
  amountIn: string;
  minAmountOut: string;
}

const TradingPairs = () => {
  const { wallet, signAndSubmitTransaction } = useWallet();
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [swapForm, setSwapForm] = useState<SwapForm>({
    pairAddress: '',
    tokenIn: '',
    amountIn: '',
    minAmountOut: ''
  });
  const [swapLoading, setSwapLoading] = useState(false);

  // const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

  // 获取所有交易对 | Get all trading pairs
  const fetchTradingPairs = async () => {
    setLoading(true);
    try {
      // 这里应该调用合约的view函数获取所有交易对 | Here should call the contract's view function to get all trading pairs
      // 暂时使用模拟数据 | Temporarily using mock data
      const mockPairs: TradingPair[] = [
        {
          address: '0x123456789abcdef',
          tokenA: '0xabc123',
          tokenB: '0x1::aptos_coin::AptosCoin',
          feeRate: 30, // 0.3%
          minTradeAmount: '1000000', // 1 USDT
          creator: '0xdef456',
          usdtDeposit: '1000000000', // 1000 USDT
          createdAt: '2024-01-01',
          isActive: true,
          reserveA: '5000000000', // 5000 tokens
          reserveB: '1000000000'  // 1000 USDT
        },
        {
          address: '0x987654321fedcba',
          tokenA: '0xdef789',
          tokenB: '0x1::aptos_coin::AptosCoin',
          feeRate: 50, // 0.5%
          minTradeAmount: '500000', // 0.5 USDT
          creator: '0xabc123',
          usdtDeposit: '2000000000', // 2000 USDT
          createdAt: '2024-01-02',
          isActive: true,
          reserveA: '10000000000', // 10000 tokens
          reserveB: '2000000000'   // 2000 USDT
        }
      ];

      setPairs(mockPairs);
    } catch (error) {
      console.error('Failed to fetch trading pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  // 执行交易 | Execute trade
  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!swapForm.pairAddress || !swapForm.tokenIn || !swapForm.amountIn) {
      alert('Please fill in all required fields');
      return;
    }

    setSwapLoading(true);
    
    try {
      const transaction = {
        function: "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d::trading_pair::swap",
        type_arguments: [
          swapForm.tokenIn, // TokenA type
          "0x1::aptos_coin::AptosCoin" // USDT type (should be the actual USDT address)
        ],
        arguments: [
          swapForm.pairAddress,           // pair_address
          swapForm.tokenIn,              // token_in_address
          parseInt(swapForm.amountIn),   // amount_in
          parseInt(swapForm.minAmountOut || '0') // min_amount_out
        ],
        type: "entry_function_payload"
      };

      const result = await signAndSubmitTransaction(transaction);
      console.log('Trade successful:', result);
      
      // 重置表单 | Reset form
      setSwapForm({
        pairAddress: '',
        tokenIn: '',
        amountIn: '',
        minAmountOut: ''
      });
      
      alert('Trade successful!');
      
      // 刷新交易对数据 | Refresh trading pair data
      fetchTradingPairs();
    } catch (error) {
      console.error('Trade failed:', error);
      alert('Trade failed, please check parameters and try again');
    } finally {
      setSwapLoading(false);
    }
  };

  // 计算价格 | Calculate price
  const calculatePrice = (reserveA: string, reserveB: string) => {
    const a = parseInt(reserveA) || 0;
    const b = parseInt(reserveB) || 0;
    if (a === 0) return '0';
    return (b / a).toFixed(6);
  };

  // 格式化地址 | Format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化余额 | Format balance
  const formatBalance = (balance: string, decimals: number = 6) => {
    const num = parseInt(balance) || 0;
    return (num / Math.pow(10, decimals)).toFixed(2);
  };

  useEffect(() => {
    fetchTradingPairs();
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 | Page title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Trading Pairs</h1>
        <p className="mt-2 text-gray-600">View all available trading pairs and trade</p>
      </div>

      {/* 交易表单 | Trading form */}
      {wallet.connected && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Trade</h2>
          
          <form onSubmit={handleSwap} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trading Pair
              </label>
              <select
                value={swapForm.pairAddress}
                onChange={(e) => setSwapForm(prev => ({ ...prev, pairAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Trading Pair</option>
                {pairs.map((pair) => (
                  <option key={pair.address} value={pair.address}>
                    {formatAddress(pair.tokenA)} / USDT
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Token
              </label>
              <input
                type="text"
                value={swapForm.tokenIn}
                onChange={(e) => setSwapForm(prev => ({ ...prev, tokenIn: e.target.value }))}
                placeholder="Token Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Amount
              </label>
              <input
                type="text"
                value={swapForm.amountIn}
                onChange={(e) => setSwapForm(prev => ({ ...prev, amountIn: e.target.value }))}
                placeholder="Amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Output
              </label>
              <input
                type="text"
                value={swapForm.minAmountOut}
                onChange={(e) => setSwapForm(prev => ({ ...prev, minAmountOut: e.target.value }))}
                placeholder="Minimum Output"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={swapLoading}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  swapLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {swapLoading ? 'Trading...' : 'Trade'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 交易对列表 | Trading pairs list */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Trading Pairs</h2>
          <button
            onClick={fetchTradingPairs}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {pairs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading...' : 'No trading pairs available'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trading Pair
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (USDT)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liquidity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Trade Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pairs.map((pair, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAddress(pair.tokenA)} / USDT
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatAddress(pair.address)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pair.reserveA && pair.reserveB 
                          ? calculatePrice(pair.reserveA, pair.reserveB)
                          : '0.000000'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pair.reserveB ? formatBalance(pair.reserveB) : '0'} USDT
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(pair.feeRate / 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatBalance(pair.minTradeAmount)} USDT
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {formatAddress(pair.creator)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pair.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pair.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计信息 | Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pairs.length}
            </div>
            <div className="text-sm text-gray-500">Total Trading Pairs</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {pairs.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active Trading Pairs</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {pairs.reduce((sum, pair) => sum + parseInt(pair.reserveB || '0'), 0) / 1000000}
            </div>
            <div className="text-sm text-gray-500">Total Liquidity (USDT)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPairs;