import { useState, useEffect } from 'react';

interface PoolState {
  tokenReserve: number;
  usdtReserve: number;
  k: number; // 恒定乘积
  price: number;
}

interface TradeResult {
  newTokenReserve: number;
  newUsdtReserve: number;
  newPrice: number;
  priceImpact: number;
  slippage: number;
}

const PriceSimulator = () => {
  const [initialPool, setInitialPool] = useState<PoolState>({
    tokenReserve: 10000000, // 1000万代币
    usdtReserve: 1000, // 1000 USDT
    k: 10000000 * 1000, // 恒定乘积
    price: 0.0001 // 初始价格
  });

  const [currentPool, setCurrentPool] = useState<PoolState>(initialPool);
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);
  const [feeRate, setFeeRate] = useState(0.3); // 0.3% 手续费

  // 重置池子状态
  const resetPool = () => {
    const newPool = {
      ...initialPool,
      k: initialPool.tokenReserve * initialPool.usdtReserve,
      price: initialPool.usdtReserve / initialPool.tokenReserve
    };
    setCurrentPool(newPool);
    setTradeResult(null);
  };

  // 更新初始池子状态
  useEffect(() => {
    const newPool = {
      ...initialPool,
      k: initialPool.tokenReserve * initialPool.usdtReserve,
      price: initialPool.usdtReserve / initialPool.tokenReserve
    };
    setCurrentPool(newPool);
  }, [initialPool]);

  // 计算交易结果
  const calculateTrade = (amount: number, type: 'buy' | 'sell') => {
    const fee = 1 - feeRate / 100; // 扣除手续费后的比例
    
    let newTokenReserve: number;
    let newUsdtReserve: number;
    
    if (type === 'buy') {
      // 买入代币：用USDT换代币
      const usdtIn = amount;
      const usdtAfterFee = usdtIn * fee;
      
      // 根据恒定乘积公式计算
      newUsdtReserve = currentPool.usdtReserve + usdtAfterFee;
      newTokenReserve = currentPool.k / newUsdtReserve;
    } else {
      // 卖出代币：用代币换USDT
      const tokenIn = amount;
      const tokenAfterFee = tokenIn * fee;
      
      newTokenReserve = currentPool.tokenReserve + tokenAfterFee;
      newUsdtReserve = currentPool.k / newTokenReserve;
    }
    
    const newPrice = newUsdtReserve / newTokenReserve;
    const priceImpact = ((newPrice - currentPool.price) / currentPool.price) * 100;
    const slippage = Math.abs(priceImpact);
    
    return {
      newTokenReserve,
      newUsdtReserve,
      newPrice,
      priceImpact,
      slippage
    };
  };

  // 执行交易
  const executeTrade = () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) return;
    
    const amount = parseFloat(tradeAmount);
    const result = calculateTrade(amount, tradeType);
    
    setCurrentPool({
      tokenReserve: result.newTokenReserve,
      usdtReserve: result.newUsdtReserve,
      k: result.newTokenReserve * result.newUsdtReserve,
      price: result.newPrice
    });
    
    setTradeResult(result);
    setTradeAmount('');
  };

  // 预览交易
  useEffect(() => {
    if (tradeAmount && parseFloat(tradeAmount) > 0) {
      const amount = parseFloat(tradeAmount);
      const result = calculateTrade(amount, tradeType);
      setTradeResult(result);
    } else {
      setTradeResult(null);
    }
  }, [tradeAmount, tradeType, currentPool, feeRate]);

  const priceChange = ((currentPool.price - initialPool.price) / initialPool.price) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">AMM价格变化模拟器</h2>
        <p className="text-gray-600 mb-6">
          理解恒定乘积公式 (x × y = k) 如何影响代币价格
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 池子设置 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">初始池子设置</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代币数量
                </label>
                <input
                  type="number"
                  value={initialPool.tokenReserve}
                  onChange={(e) => setInitialPool(prev => ({
                    ...prev,
                    tokenReserve: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  USDT数量
                </label>
                <input
                  type="number"
                  value={initialPool.usdtReserve}
                  onChange={(e) => setInitialPool(prev => ({
                    ...prev,
                    usdtReserve: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手续费率 (%)
                </label>
                <input
                  type="number"
                  value={feeRate}
                  onChange={(e) => setFeeRate(Number(e.target.value))}
                  step="0.1"
                  min="0"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={resetPool}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                重置池子
              </button>
            </div>

            {/* 当前池子状态 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">📊 当前池子状态</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>代币数量:</span>
                  <span className="font-semibold">{currentPool.tokenReserve.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>USDT数量:</span>
                  <span className="font-semibold">{currentPool.usdtReserve.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>恒定乘积 K:</span>
                  <span className="font-semibold">{currentPool.k.toExponential(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>当前价格:</span>
                  <span className="font-semibold text-blue-600">
                    {currentPool.price.toFixed(8)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>价格变化:</span>
                  <span className={`font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 交易模拟 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">交易模拟</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交易类型
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      tradeType === 'buy'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    买入代币
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      tradeType === 'sell'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    卖出代币
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tradeType === 'buy' ? 'USDT数量' : '代币数量'}
                </label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder={tradeType === 'buy' ? '输入USDT数量' : '输入代币数量'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* 交易预览 */}
              {tradeResult && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">🔍 交易预览</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>新价格:</span>
                      <span className="font-semibold">
                        {tradeResult.newPrice.toFixed(8)} USDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>价格影响:</span>
                      <span className={`font-semibold ${tradeResult.priceImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tradeResult.priceImpact >= 0 ? '+' : ''}{tradeResult.priceImpact.toFixed(4)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>滑点:</span>
                      <span className="font-semibold text-orange-600">
                        {tradeResult.slippage.toFixed(4)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>新代币数量:</span>
                      <span className="font-semibold">
                        {tradeResult.newTokenReserve.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>新USDT数量:</span>
                      <span className="font-semibold">
                        {tradeResult.newUsdtReserve.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={executeTrade}
                disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                执行交易
              </button>

              {/* 快捷交易按钮 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeAmount('10')}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                >
                  {tradeType === 'buy' ? '10 USDT' : '10 代币'}
                </button>
                <button
                  onClick={() => setTradeAmount('100')}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                >
                  {tradeType === 'buy' ? '100 USDT' : '100 代币'}
                </button>
                <button
                  onClick={() => setTradeAmount('500')}
                  className="px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-sm"
                >
                  {tradeType === 'buy' ? '500 USDT' : '500 代币'}
                </button>
                <button
                  onClick={() => setTradeAmount('1000')}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  {tradeType === 'buy' ? '1000 USDT' : '1000 代币'}
                </button>
              </div>
            </div>
          </div>

          {/* 价格变化说明 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">价格变化原理</h3>
            
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">🧮 恒定乘积公式</h4>
                <div className="text-sm text-purple-700">
                  <div className="font-mono bg-white p-2 rounded border mb-2">
                    x × y = k
                  </div>
                  <ul className="space-y-1">
                    <li>• x = 代币数量</li>
                    <li>• y = USDT数量</li>
                    <li>• k = 恒定值</li>
                    <li>• 价格 = y ÷ x</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📈 买入代币</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 投入USDT到池子</li>
                  <li>• USDT数量增加 ↑</li>
                  <li>• 代币数量减少 ↓</li>
                  <li>• 价格上涨 ↑</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">📉 卖出代币</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• 投入代币到池子</li>
                  <li>• 代币数量增加 ↑</li>
                  <li>• USDT数量减少 ↓</li>
                  <li>• 价格下跌 ↓</li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">⚠️ 滑点说明</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• 交易量越大，滑点越高</li>
                  <li>• 流动性越少，滑点越高</li>
                  <li>• 滑点 = 价格影响的绝对值</li>
                  <li>• 建议滑点控制在5%以内</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 价格变化因素总结 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 影响价格变化的因素</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">交易行为</h4>
              <p className="text-gray-600">
                用户的买入和卖出行为直接改变池子中两种资产的比例，
                从而影响价格。大额交易会产生显著的价格影响。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">套利行为</h4>
              <p className="text-gray-600">
                当池子价格与外部市场价格出现差异时，
                套利者会进行交易来获利，最终使价格趋于一致。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">流动性变化</h4>
              <p className="text-gray-600">
                添加或移除流动性会改变池子的总量，
                影响交易的滑点和价格稳定性。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSimulator;