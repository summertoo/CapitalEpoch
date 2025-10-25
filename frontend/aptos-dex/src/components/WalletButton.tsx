import { useWallet } from '../contexts/WalletContext';

const WalletButton = () => {
  const { wallet, connect, disconnect, getBalance } = useWallet();

  const handleClick = () => {
    if (wallet.connected) {
      disconnect();
    } else {
      connect();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0.000';
    
    // 如果余额很小，显示更多小数位
    if (num < 0.001) {
      return num.toFixed(6);
    }
    return num.toFixed(3);
  };

  const handleRefreshBalance = async () => {
    console.log('手动刷新余额');
    await getBalance();
  };

  return (
    <div className="flex items-center gap-4">
      {wallet.connected && (
        <div className="text-sm text-gray-600">
          <div>余额: {formatBalance(wallet.balance)} APT</div>
          <div>地址: {formatAddress(wallet.account!)}</div>
          <button
            onClick={handleRefreshBalance}
            className="mt-1 px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
          >
            刷新余额
          </button>
        </div>
      )}
      
      <button
        onClick={handleClick}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          wallet.connected
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {wallet.connected ? '断开钱包' : '连接钱包'}
      </button>
    </div>
  );
};

export default WalletButton;
