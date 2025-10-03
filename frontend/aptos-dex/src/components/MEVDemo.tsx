import { useState } from 'react';

interface Transaction {
  id: string;
  type: 'user' | 'mev';
  action: string;
  amount: number;
  gasPrice: number;
  expectedPrice: number;
  actualPrice?: number;
  profit?: number;
  status: 'pending' | 'executed' | 'failed';
}

interface PoolState {
  tokenReserve: number;
  usdtReserve: number;
  price: number;
}

const MEVDemo = () => {
  const [pool, setPool] = useState<PoolState>({
    tokenReserve: 1000000, // 100万代币
    usdtReserve: 1000, // 1000 USDT
    price: 0.001 // 0.001 USDT per token
  });

  const [userTrade, setUserTrade] = useState({
    amount: '',
    type: 'buy' as 'buy' | 'sell',
    gasPrice: 20
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mevEnabled, setMevEnabled] = useState(true);
  const [attackType, setAttackType] = useState<'sandwich' | 'frontrun' | 'arbitrage'>('sandwich');

  // 计算交易后的价格
  const calculateNewPrice = (currentPool: PoolState, tradeAmount: number, tradeType: 'buy' | 'sell') => {
    const k = currentPool.tokenReserve * currentPool.usdtReserve;
    
    if (tradeType === 'buy') {
      const newUsdtReserve = currentPool.usdtReserve + tradeAmount;
      const newTokenReserve = k / newUsdtReserve;
      return {
        tokenReserve: newTokenReserve,
        usdtReserve: newUsdtReserve,
        price: newUsdtReserve / newTokenReserve
      };
    } else {
      const newTokenReserve = currentPool.tokenReserve + tradeAmount;
      const newUsdtReserve = k / newTokenReserve;
      return {
        tokenReserve: newTokenReserve,
        usdtReserve: newUsdtReserve,
        price: newUsdtReserve / newTokenReserve
      };
    }
  };

  // 三明治攻击模拟
  const simulateSandwichAttack = (userAmount: number, userType: 'buy' | 'sell') => {
    const newTxs: Transaction[] = [];
    let currentPool = { ...pool };

    // 1. MEV机器人抢跑交易（Front-run）
    const frontRunAmount = userAmount * 0.8; // 80%的用户交易量
    const frontRunTx: Transaction = {
      id: `mev-front-${Date.now()}`,
      type: 'mev',
      action: `MEV抢跑: ${userType === 'buy' ? '买入' : '卖出'} ${frontRunAmount}`,
      amount: frontRunAmount,
      gasPrice: userTrade.gasPrice + 5, // 更高的gas费
      expectedPrice: currentPool.price,
      status: 'executed'
    };

    // 执行抢跑交易
    currentPool = calculateNewPrice(currentPool, frontRunAmount, userType);
    frontRunTx.actualPrice = currentPool.price;
    newTxs.push(frontRunTx);

    // 2. 用户交易（被夹在中间）
    const userTx: Transaction = {
      id: `user-${Date.now()}`,
      type: 'user',
      action: `用户交易: ${userType === 'buy' ? '买入' : '卖出'} ${userAmount}`,
      amount: userAmount,
      gasPrice: userTrade.gasPrice,
      expectedPrice: pool.price, // 用户期望的原始价格
      status: 'executed'
    };

    // 执行用户交易（价格已被抢跑推高/推低）
    currentPool = calculateNewPrice(currentPool, userAmount, userType);
    userTx.actualPrice = currentPool.price;
    newTxs.push(userTx);

    // 3. MEV机器人后跑交易（Back-run）
    const backRunAmount = frontRunAmount;
    const backRunType = userType === 'buy' ? 'sell' : 'buy'; // 反向操作
    const backRunTx: Transaction = {
      id: `mev-back-${Date.now()}`,
      type: 'mev',
      action: `MEV后跑: ${backRunType === 'buy' ? '买入' : '卖出'} ${backRunAmount}`,
      amount: backRunAmount,
      gasPrice: userTrade.gasPrice + 3,
      expectedPrice: currentPool.price,
      status: 'executed'
    };

    // 执行后跑交易
    const finalPool = calculateNewPrice(currentPool, backRunAmount, backRunType);
    backRunTx.actualPrice = finalPool.price;

    // 计算MEV利润
    const priceChange = userType === 'buy' 
      ? (currentPool.price - pool.price) / pool.price
      : (pool.price - currentPool.price) / pool.price;
    
    backRunTx.profit = frontRunAmount * priceChange * (userType === 'buy' ? 1 : -1);
    newTxs.push(backRunTx);

    // 更新池子状态
    setPool(finalPool);
    setTransactions(prev => [...prev, ...newTxs]);
  };

  // 抢跑攻击模拟
  const simulateFrontRunAttack = (userAmount: number, userType: 'buy' | 'sell') => {
    const newTxs: Transaction[] = [];
    let currentPool = { ...pool };

    // MEV机器人看到用户交易，立即抢跑
    const mevAmount = userAmount * 1.2; // 120%的用户交易量
    const mevTx: Transaction = {
      id: `mev-frontrun-${Date.now()}`,
      type: 'mev',
      action: `MEV抢跑: ${userType === 'buy' ? '买入' : '卖出'} ${mevAmount}`,
      amount: mevAmount,
      gasPrice: userTrade.gasPrice + 10,
      expectedPrice: currentPool.price,
      status: 'executed'
    };

    currentPool = calculateNewPrice(currentPool, mevAmount, userType);
    mevTx.actualPrice = currentPool.price;
    mevTx.profit = mevAmount * ((currentPool.price - pool.price) / pool.price);
    newTxs.push(mevTx);

    // 用户交易以更差的价格执行
    const userTx: Transaction = {
      id: `user-frontrun-${Date.now()}`,
      type: 'user',
      action: `用户交易: ${userType === 'buy' ? '买入' : '卖出'} ${userAmount}`,
      amount: userAmount,
      gasPrice: userTrade.gasPrice,
      expectedPrice: pool.price,
      status: 'executed'
    };

    currentPool = calculateNewPrice(currentPool, userAmount, userType);
    userTx.actualPrice = currentPool.price;
    newTxs.push(userTx);

    setPool(currentPool);
    setTransactions(prev => [...prev, ...newTxs]);
  };

  // 套利攻击模拟
  const simulateArbitrageAttack = () => {
    // 模拟外部DEX价格差异
    const externalPrice = pool.price * 1.05; // 外部价格高5%
    const arbitrageAmount = 100; // 套利金额

    const arbTx: Transaction = {
      id: `arb-${Date.now()}`,
      type: 'mev',
      action: `套利: 本池买入 → 外部卖出`,
      amount: arbitrageAmount,
      gasPrice: 25,
      expectedPrice: pool.price,
      status: 'executed'
    };

    const newPool = calculateNewPrice(pool, arbitrageAmount, 'buy');
    arbTx.actualPrice = newPool.price;
    arbTx.profit = arbitrageAmount * ((externalPrice - pool.price) / pool.price);

    setPool(newPool);
    setTransactions(prev => [...prev, arbTx]);
  };

  // 执行用户交易
  const executeUserTrade = () => {
    if (!userTrade.amount || parseFloat(userTrade.amount) <= 0) return;

    const amount = parseFloat(userTrade.amount);

    if (mevEnabled) {
      switch (attackType) {
        case 'sandwich':
          simulateSandwichAttack(amount, userTrade.type);
          break;
        case 'frontrun':
          simulateFrontRunAttack(amount, userTrade.type);
          break;
        case 'arbitrage':
          simulateArbitrageAttack();
          break;
      }
    } else {
      // 正常交易，无MEV攻击
      const userTx: Transaction = {
        id: `user-normal-${Date.now()}`,
        type: 'user',
        action: `正常交易: ${userTrade.type === 'buy' ? '买入' : '卖出'} ${amount}`,
        amount: amount,
        gasPrice: userTrade.gasPrice,
        expectedPrice: pool.price,
        status: 'executed'
      };

      const newPool = calculateNewPrice(pool, amount, userTrade.type);
      userTx.actualPrice = newPool.price;

      setPool(newPool);
      setTransactions(prev => [...prev, userTx]);
    }

    setUserTrade(prev => ({ ...prev, amount: '' }));
  };

  // 重置演示
  const resetDemo = () => {
    setPool({
      tokenReserve: 1000000,
      usdtReserve: 1000,
      price: 0.001
    });
    setTransactions([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">MEV攻击演示器</h2>
        <p className="text-gray-600 mb-6">
          了解MEV（最大可提取价值）攻击如何影响您的交易
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 控制面板 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">交易设置</h3>
            
            {/* 当前池子状态 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">📊 当前池子状态</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>代币数量:</span>
                  <span className="font-semibold">{pool.tokenReserve.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>USDT数量:</span>
                  <span className="font-semibold">{pool.usdtReserve.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>当前价格:</span>
                  <span className="font-semibold text-blue-600">
                    {pool.price.toFixed(6)} USDT
                  </span>
                </div>
              </div>
            </div>

            {/* MEV设置 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mevEnabled"
                  checked={mevEnabled}
                  onChange={(e) => setMevEnabled(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="mevEnabled" className="text-sm font-medium text-gray-700">
                  启用MEV攻击模拟
                </label>
              </div>

              {mevEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    攻击类型
                  </label>
                  <select
                    value={attackType}
                    onChange={(e) => setAttackType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="sandwich">🥪 三明治攻击</option>
                    <option value="frontrun">🎯 抢跑攻击</option>
                    <option value="arbitrage">🔄 套利攻击</option>
                  </select>
                </div>
              )}
            </div>

            {/* 用户交易 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交易类型
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setUserTrade(prev => ({ ...prev, type: 'buy' }))}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      userTrade.type === 'buy'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    买入
                  </button>
                  <button
                    onClick={() => setUserTrade(prev => ({ ...prev, type: 'sell' }))}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      userTrade.type === 'sell'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    卖出
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userTrade.type === 'buy' ? 'USDT数量' : '代币数量'}
                </label>
                <input
                  type="number"
                  value={userTrade.amount}
                  onChange={(e) => setUserTrade(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="输入交易数量"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gas价格 (Gwei)
                </label>
                <input
                  type="number"
                  value={userTrade.gasPrice}
                  onChange={(e) => setUserTrade(prev => ({ ...prev, gasPrice: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={executeUserTrade}
                disabled={!userTrade.amount}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                执行交易
              </button>

              <button
                onClick={resetDemo}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-600 transition-colors"
              >
                重置演示
              </button>
            </div>
          </div>

          {/* 交易历史 */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">交易执行顺序</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">⚡</div>
                  <p>执行交易查看MEV攻击演示</p>
                </div>
              ) : (
                transactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    className={`border rounded-lg p-4 ${
                      tx.type === 'mev' 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">
                          #{index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === 'mev' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tx.type === 'mev' ? 'MEV机器人' : '用户交易'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Gas: {tx.gasPrice} Gwei
                        </div>
                        {tx.profit && (
                          <div className={`text-sm font-semibold ${
                            tx.profit > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            利润: {tx.profit > 0 ? '+' : ''}{tx.profit.toFixed(4)} USDT
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2">
                      {tx.action}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">期望价格:</span>
                        <span className="font-medium ml-1">
                          {tx.expectedPrice.toFixed(6)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">实际价格:</span>
                        <span className="font-medium ml-1">
                          {tx.actualPrice?.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MEV攻击类型说明 */}
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ MEV攻击类型详解</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">🥪 三明治攻击</h4>
              <p className="text-gray-600 mb-2">
                最常见且危险的MEV攻击。机器人在用户交易前后各执行一笔交易，
                "夹击"用户获利。
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 抢跑：推高价格</li>
                <li>• 用户交易：高价成交</li>
                <li>• 后跑：获利退出</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">🎯 抢跑攻击</h4>
              <p className="text-gray-600 mb-2">
                机器人监控内存池，看到有利可图的交易后，
                用更高gas费抢先执行类似交易。
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 监控用户交易</li>
                <li>• 提高gas费抢跑</li>
                <li>• 获得更好价格</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">🔄 套利攻击</h4>
              <p className="text-gray-600 mb-2">
                利用不同DEX间的价格差异，
                在价格低的地方买入，价格高的地方卖出。
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• 发现价格差异</li>
                <li>• 快速套利交易</li>
                <li>• 无风险获利</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 防护措施 */}
        <div className="mt-6 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">🛡️ MEV防护措施</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">用户防护</h4>
              <ul className="text-green-600 space-y-1">
                <li>• 使用私有内存池（如Flashbots）</li>
                <li>• 设置合理的滑点保护</li>
                <li>• 分批执行大额交易</li>
                <li>• 选择流动性充足的池子</li>
                <li>• 避免在高峰时段交易</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-2">协议防护</h4>
              <ul className="text-green-600 space-y-1">
                <li>• 实现MEV保护机制</li>
                <li>• 使用时间加权平均价格</li>
                <li>• 引入随机延迟</li>
                <li>• 批量处理交易</li>
                <li>• MEV收益分享给用户</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MEVDemo;