import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface TradingPair {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  feeRate: number;
  minTradeAmount: string;
  creator: string;
  totalVolume: string;
}

interface SwapPreview {
  outputAmount: string;
  feeAmount: string;
  priceImpact: number;
}

const TradingInterface = () => {
  const { wallet } = useWallet();
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [isUsdtToToken, setIsUsdtToToken] = useState(true);
  const [inputAmount, setInputAmount] = useState('');
  const [swapPreview, setSwapPreview] = useState<SwapPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);

  // 加载交易对列表
  useEffect(() => {
    loadTradingPairs();
  }, []);

  // 计算交换预览
  useEffect(() => {
    if (selectedPair && inputAmount && parseFloat(inputAmount) > 0) {
      calculateSwapPreview();
    } else {
      setSwapPreview(null);
    }
  }, [selectedPair, inputAmount, isUsdtToToken]);

  const loadTradingPairs = async () => {
    try {
      // 这里应该调用智能合约获取交易对列表
      // 模拟数据
      const mockPairs: TradingPair[] = [
        {
          id: 'USDT-TOKEN1',
          tokenA: 'TOKEN1',
          tokenB: 'USDT',
          reserveA: '100000',
          reserveB: '50000',
          feeRate: 300, // 3%
          minTradeAmount: '10',
          creator: '0x123...',
          totalVolume: '1000000'
        },
        {
          id: 'USDT-TOKEN2',
          tokenA: 'TOKEN2',
          tokenB: 'USDT',
          reserveA: '200000',
          reserveB: '80000',
          feeRate: 250, // 2.5%
          minTradeAmount: '5',
          creator: '0x456...',
          totalVolume: '2000000'
        }
      ];
      setPairs(mockPairs);
      if (mockPairs.length > 0) {
        setSelectedPair(mockPairs[0]);
      }
    } catch (error) {
      console.error('加载交易对失败:', error);
    }
  };

  const calculateSwapPreview = async () => {
    if (!selectedPair || !inputAmount) return;

    try {
      const amount = parseFloat(inputAmount);
      const reserveIn = isUsdtToToken ? 
        parseFloat(selectedPair.reserveB) : 
        parseFloat(selectedPair.reserveA);
      const reserveOut = isUsdtToToken ? 
        parseFloat(selectedPair.reserveA) : 
        parseFloat(selectedPair.reserveB);

      // AMM公式计算
      const outputAmount = (amount * reserveOut) / (reserveIn + amount);
      const feeAmount = (outputAmount * selectedPair.feeRate) / 10000;
      const finalOutput = outputAmount - feeAmount;
      const priceImpact = (amount / (reserveIn + amount)) * 100;

      setSwapPreview({
        outputAmount: finalOutput.toFixed(6),
        feeAmount: feeAmount.toFixed(6),
        priceImpact: priceImpact
      });
    } catch (error) {
      console.error('计算预览失败:', error);
    }
  };

  const handleSwap = async () => {
    if (!wallet || !selectedPair || !inputAmount || !swapPreview) {
      alert('请检查输入信息');
      return;
    }

    setIsLoading(true);
    try {
      const minOutputAmount = parseFloat(swapPreview.outputAmount) * (1 - slippageTolerance / 100);
      
      // 这里应该调用智能合约执行交换
      if (isUsdtToToken) {
        // 调用 swap_usdt_for_token
        console.log('USDT换代币:', {
          usdtAmount: inputAmount,
          minTokenOut: minOutputAmount.toString(),
          pairId: selectedPair.id
        });
      } else {
        // 调用 swap_token_for_usdt
        console.log('代币换USDT:', {
          tokenAmount: inputAmount,
          minUsdtOut: minOutputAmount.toString(),
          pairId: selectedPair.id
        });
      }

      alert('交易提交成功！');
      setInputAmount('');
      setSwapPreview(null);
      
      // 刷新交易对数据
      loadTradingPairs();
    } catch (error) {
      console.error('交易失败:', error);
      alert('交易失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const switchDirection = () => {
    setIsUsdtToToken(!isUsdtToToken);
    setInputAmount('');
    setSwapPreview(null);
  };

  const getPrice = () => {
    if (!selectedPair) return '0';
    const reserveA = parseFloat(selectedPair.reserveA);
    const reserveB = parseFloat(selectedPair.reserveB);
    return isUsdtToToken ? 
      (reserveB / reserveA).toFixed(6) : 
      (reserveA / reserveB).toFixed(6);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">代币交易</h2>
        
        {/* 交易对选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择交易对
          </label>
          <select
            value={selectedPair?.id || ''}
            onChange={(e) => {
              const pair = pairs.find(p => p.id === e.target.value);
              setSelectedPair(pair || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">请选择交易对</option>
            {pairs.map(pair => (
              <option key={pair.id} value={pair.id}>
                {pair.tokenA}/{pair.tokenB} (手续费: {pair.feeRate/100}%)
              </option>
            ))}
          </select>
        </div>

        {selectedPair && (
          <>
            {/* 交易对信息 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">当前价格:</span>
                  <div className="font-semibold">{getPrice()} USDT</div>
                </div>
                <div>
                  <span className="text-gray-600">流动性:</span>
                  <div className="font-semibold">
                    {parseFloat(selectedPair.reserveB).toLocaleString()} USDT
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">24h成交量:</span>
                  <div className="font-semibold">
                    {parseFloat(selectedPair.totalVolume).toLocaleString()} USDT
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">手续费:</span>
                  <div className="font-semibold">{selectedPair.feeRate/100}%</div>
                </div>
              </div>
            </div>

            {/* 交易界面 */}
            <div className="space-y-4">
              {/* 输入部分 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">支付</span>
                  <span className="text-sm text-gray-600">
                    余额: 1000.00 {isUsdtToToken ? 'USDT' : selectedPair.tokenA}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 text-2xl font-semibold bg-transparent outline-none"
                    min="0"
                    step="0.000001"
                  />
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                    <span className="font-semibold">
                      {isUsdtToToken ? 'USDT' : selectedPair.tokenA}
                    </span>
                  </div>
                </div>
              </div>

              {/* 交换方向按钮 */}
              <div className="flex justify-center">
                <button
                  onClick={switchDirection}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              {/* 输出部分 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">接收</span>
                  <span className="text-sm text-gray-600">
                    余额: 500.00 {isUsdtToToken ? selectedPair.tokenA : 'USDT'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 text-2xl font-semibold text-gray-800">
                    {swapPreview?.outputAmount || '0.0'}
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                    <span className="font-semibold">
                      {isUsdtToToken ? selectedPair.tokenA : 'USDT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 交易详情 */}
              {swapPreview && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">手续费:</span>
                    <span>{swapPreview.feeAmount} {isUsdtToToken ? selectedPair.tokenA : 'USDT'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">价格影响:</span>
                    <span className={swapPreview.priceImpact > 5 ? 'text-red-600' : 'text-green-600'}>
                      {swapPreview.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">滑点容忍度:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={slippageTolerance}
                        onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border rounded"
                        min="0.1"
                        max="50"
                        step="0.1"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最小接收:</span>
                    <span>
                      {(parseFloat(swapPreview.outputAmount) * (1 - slippageTolerance / 100)).toFixed(6)}
                      {' '}{isUsdtToToken ? selectedPair.tokenA : 'USDT'}
                    </span>
                  </div>
                </div>
              )}

              {/* 滑点警告 */}
              {swapPreview && swapPreview.priceImpact > 5 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-800 text-sm">
                      价格影响较高 ({swapPreview.priceImpact.toFixed(2)}%)，请谨慎交易
                    </span>
                  </div>
                </div>
              )}

              {/* 交易按钮 */}
              <button
                onClick={handleSwap}
                disabled={!wallet || !inputAmount || !swapPreview || isLoading}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                  !wallet || !inputAmount || !swapPreview || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {!wallet ? '请连接钱包' : 
                 isLoading ? '交易中...' : 
                 `交换 ${isUsdtToToken ? 'USDT' : selectedPair.tokenA}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradingInterface;