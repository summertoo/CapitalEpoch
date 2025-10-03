import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

interface TokenBalance {
  type: string;
  balance: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

interface UserPair {
  address: string;
  tokenA: string;
  tokenB: string;
  feeRate: number;
  minTradeAmount: string;
  usdtDeposit: string;
  createdAt: string;
  isActive: boolean;
}

const Portfolio = () => {
  const { wallet } = useWallet();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [userPairs, setUserPairs] = useState<UserPair[]>([]);
  const [loading, setLoading] = useState(false);

  const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

  // 获取用户资产 | Get user assets
  const fetchUserAssets = async () => {
    if (!wallet.account) return;

    setLoading(true);
    try {
      // 获取账户资源 | Get account resources
      const resources = await aptos.getAccountResources({
        accountAddress: wallet.account
      });

      // 解析代币余额 | Parse token balances
      const balances: TokenBalance[] = [];
      
      resources.forEach((resource) => {
        if (resource.type.includes('::coin::CoinStore<')) {
          const coinType = resource.type.match(/CoinStore<(.+)>/)?.[1];
          if (coinType) {
            const data = resource.data as any;
            balances.push({
              type: coinType,
              balance: data.coin.value,
              // 这里可以添加更多代币信息的解析 | More token info parsing can be added here
            });
          }
        }
      });

      setTokenBalances(balances);

      // 获取用户创建的交易对（这里需要调用合约的view函数）
      // 暂时使用模拟数据
      // Get user created trading pairs (need to call contract's view function)
      // Temporarily using mock data
      const mockPairs: UserPair[] = [
        {
          address: '0x123...',
          tokenA: '0xabc...',
          tokenB: '0x1::aptos_coin::AptosCoin',
          feeRate: 30,
          minTradeAmount: '1000000',
          usdtDeposit: '1000000000',
          createdAt: '2024-01-01',
          isActive: true
        }
      ];
      setUserPairs(mockPairs);

    } catch (error) {
      console.error('Failed to fetch user assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchUserAssets();
    }
  }, [wallet.connected, wallet.account]);

  const formatBalance = (balance: string, decimals: number = 8) => {
    const num = parseInt(balance) || 0;
    return (num / Math.pow(10, decimals)).toFixed(4);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTokenName = (type: string) => {
    if (type.includes('AptosCoin')) return 'APT';
    if (type.includes('usdt')) return 'USDT';
    return formatAddress(type);
  };

  if (!wallet.connected) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Please Connect Wallet
            </h3>
            <p className="text-yellow-700">
              Connect your wallet to view your assets and trading pairs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 | Page title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
        <p className="mt-2 text-gray-600">View your token balances and created trading pairs</p>
      </div>

      {/* 代币余额 | Token balances */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Token Balances</h2>
          <button
            onClick={fetchUserAssets}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {tokenBalances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading...' : 'No token balances'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tokenBalances.map((token, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getTokenName(token.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatBalance(token.balance, token.decimals)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {formatAddress(token.type)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 我的交易对 | My trading pairs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Created Trading Pairs</h2>

        {userPairs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No created trading pairs
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
                    Fee Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deposit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPairs.map((pair, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAddress(pair.tokenA)} / USDT
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(pair.feeRate / 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatBalance(pair.usdtDeposit, 6)} USDT
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pair.createdAt}
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
              {tokenBalances.length}
            </div>
            <div className="text-sm text-gray-500">Token Types Held</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {userPairs.length}
            </div>
            <div className="text-sm text-gray-500">Created Trading Pairs</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {wallet.balance}
            </div>
            <div className="text-sm text-gray-500">APT Balance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;