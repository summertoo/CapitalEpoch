import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface PairForm {
  tokenAddress: string;
  usdtAddress: string;
  feeRate: string;
  minTradeAmount: string;
  usdtDeposit: string;
}

const TradingPairCreator = () => {
  const { wallet, signAndSubmitTransaction } = useWallet();
  const [form, setForm] = useState<PairForm>({
    tokenAddress: '',
    usdtAddress: '0x1', // Default USDT address, should be the deployed USDT contract address
    feeRate: '30', // 0.3% = 30 basis points
    minTradeAmount: '1000000', // 1 USDT (6 decimals)
    usdtDeposit: '1000000000' // 1000 USDT (6 decimals)
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!form.tokenAddress) {
      alert('Please enter token address');
      return;
    }

    // Verify USDT deposit is at least 1000
    const usdtAmount = parseInt(form.usdtDeposit);
    if (usdtAmount < 1000000000) { // 1000 USDT with 6 decimals
      alert('USDT deposit must be at least 1000 USDT');
      return;
    }

    setLoading(true);
    
    try {
      const transaction = {
        function: "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d::trading_pair::create_pair",
        type_arguments: [
          form.tokenAddress, // TokenA type
          form.usdtAddress   // USDT type
        ],
        arguments: [
          form.tokenAddress,           // token_a_address
          form.usdtAddress,           // usdt_address
          parseInt(form.feeRate),     // fee_rate (basis points)
          parseInt(form.minTradeAmount), // min_trade_amount
          parseInt(form.usdtDeposit)  // usdt_deposit_amount
        ],
        type: "entry_function_payload"
      };

      const result = await signAndSubmitTransaction(transaction);
      console.log('Trading pair created successfully:', result);
      
      // Reset form
      setForm(prev => ({
        ...prev,
        tokenAddress: '',
        feeRate: '30',
        minTradeAmount: '1000000',
        usdtDeposit: '1000000000'
      }));
      
      alert('Trading pair created successfully!');
    } catch (error) {
      console.error('Failed to create trading pair:', error);
      alert('Failed to create trading pair, please check parameters and try again');
    } finally {
      setLoading(false);
    }
  };

  const formatUSDT = (amount: string) => {
    const num = parseInt(amount) || 0;
    return (num / 1000000).toFixed(2); // Convert to USDT units for display
  };

  const formatFeeRate = (rate: string) => {
    const num = parseInt(rate) || 0;
    return (num / 100).toFixed(2); // Convert to percentage for display
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Trading Pair</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Address *
          </label>
          <input
            type="text"
            name="tokenAddress"
            value={form.tokenAddress}
            onChange={handleInputChange}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the token contract address for the trading pair you want to create
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            USDT Address
          </label>
          <input
            type="text"
            name="usdtAddress"
            value={form.usdtAddress}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            System default USDT contract address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee Rate (Basis Points)
          </label>
          <input
            type="number"
            name="feeRate"
            value={form.feeRate}
            onChange={handleInputChange}
            min="1"
            max="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Current setting: {formatFeeRate(form.feeRate)}% (1 basis point = 0.01%)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Trade Amount
          </label>
          <input
            type="text"
            name="minTradeAmount"
            value={form.minTradeAmount}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Current setting: {formatUSDT(form.minTradeAmount)} USDT
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            USDT Deposit *
          </label>
          <input
            type="text"
            name="usdtDeposit"
            value={form.usdtDeposit}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Current setting: {formatUSDT(form.usdtDeposit)} USDT (minimum 1000 USDT)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Create Trading Pair = Become Initial Liquidity Provider</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>You will receive LP tokens</strong> as liquidity proof</li>
            <li>• Enjoy <strong>100% trading fee rewards</strong></li>
            <li>• LP tokens can be redeemed for your assets at any time</li>
            <li>• Other users can also add liquidity to receive LP tokens</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">🎯 Expected Returns</h4>
          <div className="text-xs text-green-700 space-y-1">
            <div className="flex justify-between">
              <span>USDT Invested:</span>
              <span className="font-semibold">{formatUSDT(form.usdtDeposit)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span>Fee Rate:</span>
              <span className="font-semibold">{formatFeeRate(form.feeRate)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Expected LP Tokens:</span>
              <span className="font-semibold text-green-600">√{formatUSDT(form.usdtDeposit)} LP Tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Initial Pool Share:</span>
              <span className="font-semibold text-green-600">100%</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Important Reminder:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Creating a trading pair requires at least 1000 USDT deposit</li>
            <li>• The deposit will be locked in the liquidity pool</li>
            <li>• Fees will be charged at the set rate</li>
            <li>• Ensure you have sufficient USDT balance</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !wallet.connected}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            loading || !wallet.connected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {loading ? 'Creating...' : 'Create Trading Pair'}
        </button>
      </form>

      {!wallet.connected && (
        <p className="text-center text-red-500 text-sm mt-4">
          Please connect your wallet to create trading pairs
        </p>
      )}
    </div>
  );
};

export default TradingPairCreator;