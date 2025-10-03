
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
import './App.css';

function App() {
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

                {/* 导航链接 */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link
                      to="/"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Trading Pairs
                    </Link>
                    <Link
                      to="/trade"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Trade
                    </Link>
                    <Link
                      to="/create-token"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Create Token
                    </Link>
                    <Link
                      to="/create-pair"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Create Pair
                    </Link>
                    <Link
                      to="/portfolio"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Portfolio
                    </Link>
                    <Link
                      to="/commercial-street"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Commercial Street
                    </Link>
                    <Link
                      to="/performance"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Performance
                    </Link>
                    <Link
                      to="/create-facility"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Create Facility
                    </Link>
                    <Link
                      to="/history"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Trade History
                    </Link>
                    <Link
                      to="/tokenomics"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Tokenomics
                    </Link>
                    <Link
                      to="/liquidity"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Liquidity
                    </Link>
                    <Link
                      to="/lp-calculator"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      LP Calculator
                    </Link>
                    <Link
                      to="/price-simulator"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Price Simulator
                    </Link>
                    <Link
                      to="/mev-demo"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      MEV Demo
                    </Link>
                    <Link
                      to="/aptos-mev"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Aptos MEV
                    </Link>
                  </div>
                </div>

                {/* 钱包按钮 */}
                <WalletButton />
              </div>
            </div>
          </nav>

          {/* 主要内容 */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<TradingPairs />} />
              <Route path="/trade" element={<TradingInterface />} />
              <Route path="/create-token" element={<TokenCreator />} />
              <Route path="/create-pair" element={<TradingPairCreator />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/commercial-street" element={<CommercialStreet />} />
              <Route path="/performance" element={<PerformanceRanking />} />
              <Route path="/create-facility" element={<FacilityManager />} />
              <Route path="/history" element={<TradeHistory />} />
              <Route path="/tokenomics" element={<TokenomicsCalculator />} />
              <Route path="/liquidity" element={<LiquidityManager />} />
              <Route path="/lp-calculator" element={<LPCalculator />} />
              <Route path="/price-simulator" element={<PriceSimulator />} />
              <Route path="/mev-demo" element={<MEVDemo />} />
              <Route path="/aptos-mev" element={<AptosMEVAnalysis />} />
            </Routes>
          </main>

          {/* 页脚 */}
          <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="text-center text-gray-500 text-sm">
                <p>© 2024 CapitalEpoch. A gamefi DeFi platform on Aptos blockchain</p>
                <p className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Devnet
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