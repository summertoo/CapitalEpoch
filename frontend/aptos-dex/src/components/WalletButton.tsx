import { useWallet } from '../contexts/WalletContext';

const WalletButton = () => {
  const { wallet, connect, disconnect } = useWallet();

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
    return parseFloat(balance).toFixed(3);
  };

  return (
    <div className="flex items-center gap-4">
      {wallet.connected && (
        <div className="text-sm text-gray-600">
          <div>余额: {formatBalance(wallet.balance)} APT</div>
          <div>地址: {formatAddress(wallet.account!)}</div>
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