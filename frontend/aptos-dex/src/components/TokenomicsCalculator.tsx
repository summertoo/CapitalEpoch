import { useState, useEffect } from 'react';

interface TokenomicsData {
  totalSupply: number;
  creatorHolding: number;
  liquidityAmount: number;
  usdtDeposit: number;
  feeRate: number;
  dailyVolume: number;
  currentPrice: number;
}

const TokenomicsCalculator = () => {
  const [tokenomics, setTokenomics] = useState<TokenomicsData>({
    totalSupply: 100000000, // 1亿代币
    creatorHolding: 90000000, // 创建者持有9000万
    liquidityAmount: 10000000, // 流动性池1000万
    usdtDeposit: 1000, // 1000 USDT保证金
    feeRate: 3, // 3%手续费
    dailyVolume: 50000, // 日交易量5万USDT
    currentPrice: 0.0001 // 当前价格0.0001 USDT
  });

  const [projections, setProjections] = useState({
    dailyFeeIncome: 0,
    monthlyFeeIncome: 0,
    yearlyFeeIncome: 0,
    tokenValueGain: 0,
    totalROI: 0,
    breakEvenDays: 0
  });

  useEffect(() => {
    calculateProjections();
  }, [tokenomics]);

  const calculateProjections = () => {
    const { feeRate, dailyVolume, creatorHolding, currentPrice, usdtDeposit } = tokenomics;
    
    // 手续费收入计算
    const dailyFeeIncome = (dailyVolume * feeRate) / 100;
    const monthlyFeeIncome = dailyFeeIncome * 30;
    const yearlyFeeIncome = dailyFeeIncome * 365;
    
    // 代币价值增长（假设价格随交易量增长）
    const tokenValueGain = creatorHolding * currentPrice - (creatorHolding * 0.0001);
    
    // 总ROI计算
    const totalInvestment = usdtDeposit; // 初始投资
    const totalReturn = yearlyFeeIncome + tokenValueGain;
    const totalROI = ((totalReturn - totalInvestment) / totalInvestment) * 100;
    
    // 回本天数
    const breakEvenDays = dailyFeeIncome > 0 ? Math.ceil(totalInvestment / dailyFeeIncome) : 0;
    
    setProjections({
      dailyFeeIncome,
      monthlyFeeIncome,
      yearlyFeeIncome,
      tokenValueGain,
      totalROI,
      breakEvenDays
    });
  };

  const handleInputChange = (field: keyof TokenomicsData, value: number) => {
    setTokenomics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">代币经济学计算器</h2>
        <p className="text-gray-600 mb-6">
          了解创建代币和交易对的盈利模式，计算预期收益和投资回报率
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入参数 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">项目参数</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代币总供应量
                </label>
                <input
                  type="number"
                  value={tokenomics.totalSupply}
                  onChange={(e) => handleInputChange('totalSupply', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">建议：1000万 - 10亿</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  创建者持有数量
                </label>
                <input
                  type="number"
                  value={tokenomics.creatorHolding}
                  onChange={(e) => handleInputChange('creatorHolding', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  持有比例: {((tokenomics.creatorHolding / tokenomics.totalSupply) * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  流动性池代币数量
                </label>
                <input
                  type="number"
                  value={tokenomics.liquidityAmount}
                  onChange={(e) => handleInputChange('liquidityAmount', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  USDT保证金
                </label>
                <input
                  type="number"
                  value={tokenomics.usdtDeposit}
                  onChange={(e) => handleInputChange('usdtDeposit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">最低1000 USDT</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交易手续费率 (%)
                </label>
                <input
                  type="number"
                  value={tokenomics.feeRate}
                  onChange={(e) => handleInputChange('feeRate', Number(e.target.value))}
                  min="1"
                  max="10"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">范围：1% - 10%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预期日交易量 (USDT)
                </label>
                <input
                  type="number"
                  value={tokenomics.dailyVolume}
                  onChange={(e) => handleInputChange('dailyVolume', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前代币价格 (USDT)
                </label>
                <input
                  type="number"
                  value={tokenomics.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', Number(e.target.value))}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  初始价格: {(tokenomics.usdtDeposit / tokenomics.liquidityAmount).toFixed(6)} USDT
                </p>
              </div>
            </div>
          </div>

          {/* 收益预测 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">收益预测</h3>
            
            {/* 手续费收入 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">💰 手续费收入</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>日收入:</span>
                  <span className="font-semibold text-blue-600">
                    {projections.dailyFeeIncome.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>月收入:</span>
                  <span className="font-semibold text-blue-600">
                    {projections.monthlyFeeIncome.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>年收入:</span>
                  <span className="font-semibold text-blue-600">
                    {projections.yearlyFeeIncome.toFixed(2)} USDT
                  </span>
                </div>
              </div>
            </div>

            {/* 代币价值 */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">📈 代币价值</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>持有数量:</span>
                  <span className="font-semibold">
                    {tokenomics.creatorHolding.toLocaleString()} 代币
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>当前价值:</span>
                  <span className="font-semibold text-green-600">
                    {(tokenomics.creatorHolding * tokenomics.currentPrice).toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>价值增长:</span>
                  <span className={`font-semibold ${projections.tokenValueGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {projections.tokenValueGain >= 0 ? '+' : ''}{projections.tokenValueGain.toFixed(2)} USDT
                  </span>
                </div>
              </div>
            </div>

            {/* 投资回报 */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3">🎯 投资回报</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>初始投资:</span>
                  <span className="font-semibold">
                    {tokenomics.usdtDeposit.toFixed(2)} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>年化ROI:</span>
                  <span className={`font-semibold text-lg ${projections.totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {projections.totalROI >= 0 ? '+' : ''}{projections.totalROI.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>回本天数:</span>
                  <span className="font-semibold text-purple-600">
                    {projections.breakEvenDays} 天
                  </span>
                </div>
              </div>
            </div>

            {/* 盈利建议 */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3">💡 盈利策略建议</h4>
              <ul className="text-sm space-y-1 text-yellow-700">
                <li>• 设置合理手续费率(2-5%)平衡收益与竞争力</li>
                <li>• 保留70-90%代币等待价格上涨</li>
                <li>• 通过营销推广增加交易量</li>
                <li>• 定期添加流动性维持价格稳定</li>
                <li>• 考虑代币销毁机制增加稀缺性</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 详细说明 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 盈利模式详解</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">1. 手续费收入</h4>
              <p className="text-gray-600">
                每笔交易收取设定的手续费率，这是最稳定的收入来源。
                交易量越大，收入越高。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">2. 代币升值</h4>
              <p className="text-gray-600">
                随着项目发展和交易量增加，代币价格可能上涨，
                创建者持有的大量代币将获得巨大收益。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">3. 流动性收益</h4>
              <p className="text-gray-600">
                作为流动性提供者，可以获得交易手续费的分成，
                形成复利效应。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenomicsCalculator;