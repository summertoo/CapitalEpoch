import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface TradeRecord {
  id: string;
  timestamp: number;
  pairId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  feeAmount: string;
  txHash: string;
  status: 'success' | 'pending' | 'failed';
}

const TradeHistory = () => {
  const { wallet } = useWallet();
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    if (wallet) {
      loadTradeHistory();
    }
  }, [wallet]);

  const loadTradeHistory = async () => {
    if (!wallet) return;
    
    setIsLoading(true);
    try {
      // 这里应该调用API获取用户交易历史
      // 模拟数据
      const mockTrades: TradeRecord[] = [
        {
          id: '1',
          timestamp: Date.now() - 3600000,
          pairId: 'USDT-TOKEN1',
          tokenIn: 'USDT',
          tokenOut: 'TOKEN1',
          amountIn: '100.00',
          amountOut: '200.00',
          feeAmount: '6.00',
          txHash: '0xabc123...',
          status: 'success'
        },
        {
          id: '2',
          timestamp: Date.now() - 7200000,
          pairId: 'USDT-TOKEN2',
          tokenIn: 'TOKEN2',
          tokenOut: 'USDT',
          amountIn: '50.00',
          amountOut: '25.00',
          feeAmount: '0.75',
          txHash: '0xdef456...',
          status: 'success'
        },
        {
          id: '3',
          timestamp: Date.now() - 10800000,
          pairId: 'USDT-TOKEN1',
          tokenIn: 'USDT',
          tokenOut: 'TOKEN1',
          amountIn: '200.00',
          amountOut: '400.00',
          feeAmount: '12.00',
          txHash: '0xghi789...',
          status: 'pending'
        }
      ];
      setTrades(mockTrades);
    } catch (error) {
      console.error('加载交易历史失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'buy') return trade.tokenIn === 'USDT';
    if (filter === 'sell') return trade.tokenOut === 'USDT';
    return true;
  });

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功';
      case 'pending': return '待确认';
      case 'failed': return '失败';
      default: return '未知';
    }
  };

  if (!wallet) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">交易历史</h2>
          <p className="text-gray-600">请先连接钱包查看交易历史</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">交易历史</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('buy')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'buy' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              买入
            </button>
            <button
              onClick={() => setFilter('sell')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'sell' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              卖出
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600">暂无交易记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易对
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支付
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    接收
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    手续费
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易哈希
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(trade.timestamp)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trade.pairId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.tokenIn === 'USDT' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.tokenIn === 'USDT' ? '买入' : '卖出'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.amountIn} {trade.tokenIn}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.amountOut} {trade.tokenOut}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trade.feeAmount} {trade.tokenOut}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trade.status)}`}>
                        {getStatusText(trade.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`https://explorer.aptoslabs.com/txn/${trade.txHash}?network=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-mono"
                      >
                        {trade.txHash.slice(0, 10)}...
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 统计信息 */}
        {filteredTrades.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">总交易次数</div>
              <div className="text-2xl font-bold text-blue-900">{filteredTrades.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">成功交易</div>
              <div className="text-2xl font-bold text-green-900">
                {filteredTrades.filter(t => t.status === 'success').length}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">总手续费</div>
              <div className="text-2xl font-bold text-yellow-900">
                {filteredTrades
                  .filter(t => t.status === 'success')
                  .reduce((sum, t) => sum + parseFloat(t.feeAmount), 0)
                  .toFixed(2)} USDT
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;