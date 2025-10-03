import { useState, useEffect } from 'react';

interface LiquidityPool {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenReserve: number;
  usdtReserve: number;
  totalLiquidity: number;
  userLPTokens: number;
  currentPrice: number;
  apr: number; // 年化收益率
}

const LiquidityManager = () => {
  const [pools, setPools] = useState<LiquidityPool[]>([
    {
      id: '1',
      tokenName: 'MyToken',
      tokenSymbol: 'MTK',
      tokenReserve: 10000000,
      usdtReserve: 1000,
      totalLiquidity: 100000,
      userLPTokens: 5000,
      currentPrice: 0.0001,
      apr: 45.2
    },
    {
      id: '2',
      tokenName: 'GameToken',
      tokenSymbol: 'GAME',
      tokenReserve: 5000000,
      usdtReserve: 2000,
      totalLiquidity: 150000,
      userLPTokens: 0,
      currentPrice: 0.0004,
      apr: 67.8
    }
  ]);

  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [tokenAmount, setTokenAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [lpTokenAmount, setLpTokenAmount] = useState('');

  // 计算需要的USDT数量（基于输入的代币数量）
  useEffect(() => {
    if (selectedPool && tokenAmount && action === 'add') {
      const requiredUsdt = (parseFloat(tokenAmount) * selectedPool.currentPrice).toFixed(2);
      setUsdtAmount(requiredUsdt);
    }
  }, [tokenAmount, selectedPool, action]);

  // 计算可以移除的代币数量（基于LP代币数量）
  useEffect(() => {
    if (selectedPool && lpTokenAmount && action === 'remove') {
      const lpRatio = parseFloat(lpTokenAmount) / selectedPool.totalLiquidity;
      const tokenOut = (selectedPool.tokenReserve * lpRatio).toFixed(0);
      const usdtOut = (selectedPool.usdtReserve * lpRatio).toFixed(2);
      setTokenAmount(tokenOut);
      setUsdtAmount(usdtOut);
    }
  }, [lpTokenAmount, selectedPool, action]);

  const handleAddLiquidity = async () => {
    if (!selectedPool || !tokenAmount || !usdtAmount) return;

    try {
      // 这里调用智能合约添加流动性
      console.log('添加流动性:', {
        poolId: selectedPool.id,
        tokenAmount: parseFloat(tokenAmount),
        usdtAmount: parseFloat(usdtAmount)
      });

      // 模拟成功
      alert(`成功添加流动性！\n代币: ${tokenAmount} ${selectedPool.tokenSymbol}\nUSDT: ${usdtAmount}`);
      
      // 重置表单
      setTokenAmount('');
      setUsdtAmount('');
    } catch (error) {
      console.error('添加流动性失败:', error);
      alert('添加流动性失败，请重试');
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedPool || !lpTokenAmount) return;

    try {
      // 这里调用智能合约移除流动性
      console.log('移除流动性:', {
        poolId: selectedPool.id,
        lpTokenAmount: parseFloat(lpTokenAmount)
      });

      // 模拟成功
      alert(`成功移除流动性！\n获得代币: ${tokenAmount} ${selectedPool.tokenSymbol}\n获得USDT: ${usdtAmount}`);
      
      // 重置表单
      setLpTokenAmount('');
      setTokenAmount('');
      setUsdtAmount('');
    } catch (error) {
      console.error('移除流动性失败:', error);
      alert('移除流动性失败，请重试');
    }
  };

  const calculateLPTokens = (tokenAmt: number, usdtAmt: number, pool: LiquidityPool) => {
    // 计算将获得的LP代币数量
    const tokenRatio = tokenAmt / pool.tokenReserve;
    const usdtRatio = usdtAmt / pool.usdtReserve;
    const minRatio = Math.min(tokenRatio, usdtRatio);
    return (pool.totalLiquidity * minRatio).toFixed(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">流动性管理</h2>
        <p className="text-gray-600 mb-6">
          添加流动性获得手续费分成，移除流动性赎回资产
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 流动性池列表 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">可用流动性池</h3>
            <div className="space-y-4">
              {pools.map((pool) => (
                <div
                  key={pool.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPool?.id === pool.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPool(pool)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {pool.tokenName} ({pool.tokenSymbol})
                      </h4>
                      <p className="text-sm text-gray-600">
                        价格: {pool.currentPrice.toFixed(6)} USDT
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        APR: {pool.apr}%
                      </div>
                      <div className="text-xs text-gray-500">
                        年化收益率
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">流动性池</div>
                      <div className="font-medium">
                        {pool.tokenReserve.toLocaleString()} {pool.tokenSymbol}
                      </div>
                      <div className="font-medium">
                        {pool.usdtReserve.toLocaleString()} USDT
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">我的LP代币</div>
                      <div className="font-medium text-blue-600">
                        {pool.userLPTokens.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        占比: {((pool.userLPTokens / pool.totalLiquidity) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作面板 */}
          <div>
            {selectedPool ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  管理 {selectedPool.tokenName} 流动性
                </h3>

                {/* 操作选择 */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAction('add')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      action === 'add'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    添加流动性
                  </button>
                  <button
                    onClick={() => setAction('remove')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      action === 'remove'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    移除流动性
                  </button>
                </div>

                {action === 'add' ? (
                  /* 添加流动性 */
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 添加流动性说明</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 需要同时提供代币和USDT</li>
                        <li>• 比例必须与当前池子比例一致</li>
                        <li>• 获得LP代币作为凭证</li>
                        <li>• 享受交易手续费分成</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedPool.tokenSymbol} 数量
                      </label>
                      <input
                        type="number"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        placeholder="输入代币数量"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        USDT 数量 (自动计算)
                      </label>
                      <input
                        type="number"
                        value={usdtAmount}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        按当前价格 {selectedPool.currentPrice.toFixed(6)} USDT 自动计算
                      </p>
                    </div>

                    {tokenAmount && usdtAmount && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">预期收益</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>将获得LP代币:</span>
                            <span className="font-semibold">
                              {calculateLPTokens(
                                parseFloat(tokenAmount),
                                parseFloat(usdtAmount),
                                selectedPool
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>预期年收益:</span>
                            <span className="font-semibold text-green-600">
                              {(parseFloat(usdtAmount) * selectedPool.apr / 100).toFixed(2)} USDT
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleAddLiquidity}
                      disabled={!tokenAmount || !usdtAmount}
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      添加流动性
                    </button>
                  </div>
                ) : (
                  /* 移除流动性 */
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">⚠️ 移除流动性说明</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• 销毁LP代币换回原始资产</li>
                        <li>• 按当前池子比例返还</li>
                        <li>• 可能存在无常损失</li>
                        <li>• 失去未来手续费收益</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LP代币数量
                      </label>
                      <input
                        type="number"
                        value={lpTokenAmount}
                        onChange={(e) => setLpTokenAmount(e.target.value)}
                        placeholder="输入要移除的LP代币数量"
                        max={selectedPool.userLPTokens}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        最大可移除: {selectedPool.userLPTokens.toLocaleString()} LP代币
                      </p>
                    </div>

                    {lpTokenAmount && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">将获得资产</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>{selectedPool.tokenSymbol}:</span>
                            <span className="font-semibold">{tokenAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>USDT:</span>
                            <span className="font-semibold">{usdtAmount}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleRemoveLiquidity}
                      disabled={!lpTokenAmount}
                      className="w-full bg-red-500 text-white py-3 px-4 rounded-md font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      移除流动性
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">💧</div>
                <p>请选择一个流动性池进行操作</p>
              </div>
            )}
          </div>
        </div>

        {/* 流动性挖矿说明 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 流动性挖矿收益</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">手续费分成</h4>
              <p className="text-gray-600">
                每笔交易的手续费按LP代币比例分配给流动性提供者
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">复利增长</h4>
              <p className="text-gray-600">
                手续费收益自动复投，LP代币价值持续增长
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">额外奖励</h4>
              <p className="text-gray-600">
                部分池子可能有额外的代币奖励和挖矿收益
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityManager;