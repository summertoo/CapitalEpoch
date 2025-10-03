import { useState, useEffect } from 'react';

interface PoolState {
  tokenReserve: number;
  usdtReserve: number;
  totalLPTokens: number;
  userLPTokens: number;
  tokenSymbol: string;
}

const LPCalculator = () => {
  const [poolState, setPoolState] = useState<PoolState>({
    tokenReserve: 10000000, // 1000万代币
    usdtReserve: 1000, // 1000 USDT
    totalLPTokens: 100000, // 10万LP代币
    userLPTokens: 100000, // 用户持有10万LP代币（100%）
    tokenSymbol: 'MTK'
  });

  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemResult, setRedeemResult] = useState({
    tokenOut: 0,
    usdtOut: 0,
    remainingLP: 0,
    newShare: 0
  });

  // 计算赎回结果
  useEffect(() => {
    if (redeemAmount && parseFloat(redeemAmount) > 0) {
      const redeemLP = parseFloat(redeemAmount);
      const shareRatio = redeemLP / poolState.totalLPTokens;
      
      const tokenOut = poolState.tokenReserve * shareRatio;
      const usdtOut = poolState.usdtReserve * shareRatio;
      const remainingLP = poolState.userLPTokens - redeemLP;
      const newShare = remainingLP / poolState.totalLPTokens * 100;

      setRedeemResult({
        tokenOut,
        usdtOut,
        remainingLP,
        newShare
      });
    } else {
      setRedeemResult({
        tokenOut: 0,
        usdtOut: 0,
        remainingLP: poolState.userLPTokens,
        newShare: (poolState.userLPTokens / poolState.totalLPTokens) * 100
      });
    }
  }, [redeemAmount, poolState]);

  const currentShare = (poolState.userLPTokens / poolState.totalLPTokens) * 100;
  const currentPrice = poolState.usdtReserve / poolState.tokenReserve;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">LP代币赎回计算器</h2>
        <p className="text-gray-600 mb-6">
          了解如何计算LP代币赎回的资产数量
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 池子状态设置 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">流动性池状态</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  池子代币数量
                </label>
                <input
                  type="number"
                  value={poolState.tokenReserve}
                  onChange={(e) => setPoolState(prev => ({
                    ...prev,
                    tokenReserve: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  池子USDT数量
                </label>
                <input
                  type="number"
                  value={poolState.usdtReserve}
                  onChange={(e) => setPoolState(prev => ({
                    ...prev,
                    usdtReserve: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  总LP代币数量
                </label>
                <input
                  type="number"
                  value={poolState.totalLPTokens}
                  onChange={(e) => setPoolState(prev => ({
                    ...prev,
                    totalLPTokens: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  您持有的LP代币
                </label>
                <input
                  type="number"
                  value={poolState.userLPTokens}
                  onChange={(e) => setPoolState(prev => ({
                    ...prev,
                    userLPTokens: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代币符号
                </label>
                <input
                  type="text"
                  value={poolState.tokenSymbol}
                  onChange={(e) => setPoolState(prev => ({
                    ...prev,
                    tokenSymbol: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 当前状态显示 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">📊 当前状态</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>当前代币价格:</span>
                  <span className="font-semibold text-blue-600">
                    {currentPrice.toFixed(6)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>您的池子份额:</span>
                  <span className="font-semibold text-blue-600">
                    {currentShare.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>您可赎回代币:</span>
                  <span className="font-semibold text-blue-600">
                    {((poolState.tokenReserve * poolState.userLPTokens) / poolState.totalLPTokens).toLocaleString()} {poolState.tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>您可赎回USDT:</span>
                  <span className="font-semibold text-blue-600">
                    {((poolState.usdtReserve * poolState.userLPTokens) / poolState.totalLPTokens).toFixed(2)} USDT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 赎回计算 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">赎回计算</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                要赎回的LP代币数量
              </label>
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                max={poolState.userLPTokens}
                placeholder="输入要赎回的LP代币数量"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                最大可赎回: {poolState.userLPTokens.toLocaleString()} LP代币
              </p>
            </div>

            {/* 赎回结果 */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">💰 赎回结果</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>赎回LP代币:</span>
                  <span className="font-semibold text-red-600">
                    -{redeemAmount || 0} LP代币
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>获得{poolState.tokenSymbol}:</span>
                  <span className="font-semibold text-green-600">
                    +{redeemResult.tokenOut.toLocaleString()} {poolState.tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>获得USDT:</span>
                  <span className="font-semibold text-green-600">
                    +{redeemResult.usdtOut.toFixed(2)} USDT
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span>剩余LP代币:</span>
                  <span className="font-semibold">
                    {redeemResult.remainingLP.toLocaleString()} LP代币
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>剩余池子份额:</span>
                  <span className="font-semibold">
                    {redeemResult.newShare.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 计算公式说明 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">🧮 计算公式</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div>
                  <strong>份额比例 =</strong> 赎回LP代币 ÷ 总LP代币
                </div>
                <div>
                  <strong>获得代币 =</strong> 池子代币总量 × 份额比例
                </div>
                <div>
                  <strong>获得USDT =</strong> 池子USDT总量 × 份额比例
                </div>
                {redeemAmount && (
                  <div className="mt-3 p-2 bg-white rounded border">
                    <div className="text-xs">
                      <div>份额比例 = {redeemAmount} ÷ {poolState.totalLPTokens} = {((parseFloat(redeemAmount) / poolState.totalLPTokens) * 100).toFixed(4)}%</div>
                      <div>获得{poolState.tokenSymbol} = {poolState.tokenReserve.toLocaleString()} × {((parseFloat(redeemAmount) / poolState.totalLPTokens) * 100).toFixed(4)}% = {redeemResult.tokenOut.toLocaleString()}</div>
                      <div>获得USDT = {poolState.usdtReserve} × {((parseFloat(redeemAmount) / poolState.totalLPTokens) * 100).toFixed(4)}% = {redeemResult.usdtOut.toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 快捷按钮 */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(percentage => (
                <button
                  key={percentage}
                  onClick={() => setRedeemAmount(((poolState.userLPTokens * percentage) / 100).toString())}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 重要说明 */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ 重要说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">无常损失</h4>
              <p className="text-yellow-600">
                如果代币价格相对于USDT发生变化，您赎回的资产价值可能与初始投入不同。
                这被称为"无常损失"。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">手续费收益</h4>
              <p className="text-yellow-600">
                在持有LP代币期间，您获得的所有交易手续费收益会自动复投到池子中，
                增加您可赎回的资产数量。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LPCalculator;