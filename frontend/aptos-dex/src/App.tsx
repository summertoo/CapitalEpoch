
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import WalletButton from './components/WalletButton';
import TokenCreator from './components/TokenCreator';
import TradingPairCreator from './components/TradingPairCreator';
import Portfolio from './components/Portfolio';
import TradingPairs from './components/TradingPairs';
import TradingInterface from './components/TradingInterface';
import TradeHistory from './components/TradeHistory';
import TokenomicsCalculator from './components/TokenomicsCalculator';
import LiquidityManager from './components/LiquidityManager';
import LPCalculator from './components/LPCalculator';
import PriceSimulator from './components/PriceSimulator';
import MEVDemo from './components/MEVDemo';
import AptosMEVAnalysis from './components/AptosMEVAnalysis';
import CommercialStreet from './components/CommercialStreet';
import PerformanceRanking from './components/PerformanceRanking';
import FacilityManager from './components/FacilityManager';
import MyCreations from './components/MyCreations';
import LanguageSwitcher from './components/LanguageSwitcher';
import ScrollableNav from './components/ScrollableNav';
import GroupedNav from './components/GroupedNav';
import CompactNav from './components/CompactNav';
import NetworkSwitcher from './components/NetworkSwitcher';
import FaucetButton from './components/FaucetButton';
import './App.css';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* 导航栏 */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <Link to="/" className="text-2xl font-bold text-blue-600">
                    CapitalEpoch
                  </Link>
                </div>

                {/* 导航链接 - 可选择不同的导航样式 */}
                <div className="hidden md:block">
                  {/* 选项1: 分组导航 (推荐) */}
                  <GroupedNav />
                  
                  {/* 选项2: 紧凑导航 */}
                  {/* <CompactNav /> */}
                  
                  {/* 选项3: 原始滚动导航 */}
                  {/* <ScrollableNav /> */}
                </div>

                {/* 网络切换、水龙头、钱包按钮和语言切换按钮 */}
                <div className="flex items-center space-x-3">
                  <NetworkSwitcher />
                  <FaucetButton />
                  <WalletButton />
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </nav>

          {/* 主要内容 */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<TradingPairs />} />
              <Route path="/trade" element={<TradingInterface />} />
              <Route path="/create-token" element={<TokenCreator />} />
              <Route path="/my-creations" element={<MyCreations />} />
              <Route path="/create-pair" element={<TradingPairCreator />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/commercial-street" element={<CommercialStreet />} />
              <Route path="/performance" element={<PerformanceRanking />} />
              <Route path="/create-facility" element={<FacilityManager />} />
              <Route path="/history" element={<TradeHistory />} />
              <Route path="/tokenomics" element={<TokenomicsCalculator />} />
              <Route path="/liquidity" element={<LiquidityManager />} />
              {/* <Route path="/lp-calculator" element={<LPCalculator />} /> */}
              {/* <Route path="/price-simulator" element={<PriceSimulator />} /> */}
              {/* <Route path="/mev-demo" element={<MEVDemo />} /> */}
              {/* <Route path="/aptos-mev" element={<AptosMEVAnalysis />} /> */}
            </Routes>
          </main>

          {/* 页脚 */}
          <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="text-center text-gray-500 text-sm">
                <p>{t('footer.copyright')}</p>
                <p className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {t('footer.network')}
                  </span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;