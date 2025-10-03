// 常量定义

// 网络配置
export const NETWORK_CONFIG = {
  DEVNET: 'devnet',
  TESTNET: 'testnet',
  MAINNET: 'mainnet'
} as const;

// 当前使用的网络
export const CURRENT_NETWORK = NETWORK_CONFIG.DEVNET;

// 合约地址
export const CONTRACT_ADDRESSES = {
  DEX_MODULE: '0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d',
  TOKEN_FACTORY: '0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d',
  USDT_MOCK: '0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d'
} as const;

// 代币类型
export const TOKEN_TYPES = {
  USDT: `${CONTRACT_ADDRESSES.USDT_MOCK}::usdt_mock::USDT`,
  APT: '0x1::aptos_coin::AptosCoin'
} as const;

// 交易配置
export const TRADING_CONFIG = {
  DEFAULT_SLIPPAGE: 0.5, // 0.5%
  MAX_SLIPPAGE: 50, // 50%
  MIN_SLIPPAGE: 0.1, // 0.1%
  DEFAULT_DEADLINE: 20, // 20分钟
  DECIMALS: 6, // 代币精度
  MIN_TRADE_AMOUNT: 0.000001 // 最小交易金额
} as const;

// 手续费配置
export const FEE_CONFIG = {
  PLATFORM_FEE_RATE: 30, // 0.3% 平台手续费
  DEFAULT_PAIR_FEE_RATE: 300, // 3% 默认交易对手续费
  MIN_FEE_RATE: 100, // 1% 最小手续费
  MAX_FEE_RATE: 1000 // 10% 最大手续费
} as const;

// 流动性配置
export const LIQUIDITY_CONFIG = {
  MIN_USDT_DEPOSIT: 1000, // 最小USDT保证金
  MIN_LIQUIDITY: 1000 // 最小流动性
} as const;

// API配置
export const API_CONFIG = {
  BASE_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://your-api-domain.com',
  TIMEOUT: 30000, // 30秒超时
  RETRY_ATTEMPTS: 3
} as const;

// 区块链浏览器链接
export const EXPLORER_URLS = {
  [NETWORK_CONFIG.DEVNET]: 'https://explorer.aptoslabs.com',
  [NETWORK_CONFIG.TESTNET]: 'https://explorer.aptoslabs.com',
  [NETWORK_CONFIG.MAINNET]: 'https://explorer.aptoslabs.com'
} as const;

// 钱包配置
export const WALLET_CONFIG = {
  PETRA: 'petra',
  MARTIAN: 'martian',
  PONTEM: 'pontem'
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: '请先连接钱包',
  INSUFFICIENT_BALANCE: '余额不足',
  SLIPPAGE_TOO_HIGH: '滑点过高，请调整滑点容忍度',
  TRANSACTION_FAILED: '交易失败，请重试',
  NETWORK_ERROR: '网络错误，请检查网络连接',
  INVALID_AMOUNT: '输入金额无效',
  PAIR_NOT_EXISTS: '交易对不存在',
  BELOW_MIN_TRADE: '低于最小交易金额'
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  TRANSACTION_SUBMITTED: '交易已提交',
  TRANSACTION_CONFIRMED: '交易已确认',
  TOKEN_CREATED: '代币创建成功',
  PAIR_CREATED: '交易对创建成功',
  LIQUIDITY_ADDED: '流动性添加成功'
} as const;

// 本地存储键
export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  SLIPPAGE_TOLERANCE: 'slippage_tolerance',
  TRANSACTION_DEADLINE: 'transaction_deadline',
  THEME: 'theme'
} as const;

// 刷新间隔（毫秒）
export const REFRESH_INTERVALS = {
  BALANCE: 10000, // 10秒
  PAIRS: 30000, // 30秒
  TRADES: 15000, // 15秒
  PRICE: 5000 // 5秒
} as const;