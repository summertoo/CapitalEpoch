import { useState } from 'react';

interface ComparisonItem {
  aspect: string;
  ethereum: string;
  aptos: string;
  mevRisk: 'high' | 'medium' | 'low';
}

const AptosMEVAnalysis = () => {
  const [selectedTab, setSelectedTab] = useState<'comparison' | 'mechanisms' | 'protection'>('comparison');

  const comparisons: ComparisonItem[] = [
    {
      aspect: '内存池机制',
      ethereum: '公开内存池，所有交易可见',
      aptos: '验证者直接处理，减少公开暴露',
      mevRisk: 'low'
    },
    {
      aspect: '交易排序',
      ethereum: '矿工可自由重排序交易',
      aptos: '更确定性的排序算法',
      mevRisk: 'low'
    },
    {
      aspect: '执行模式',
      ethereum: '顺序执行，易被夹击',
      aptos: '并行执行，减少夹击机会',
      mevRisk: 'low'
    },
    {
      aspect: '抢跑攻击',
      ethereum: 'Gas费竞价，易被抢跑',
      aptos: '并行执行减少抢跑效果',
      mevRisk: 'medium'
    },
    {
      aspect: '套利机会',
      ethereum: '跨DEX套利常见',
      aptos: '仍存在但执行难度更高',
      mevRisk: 'medium'
    },
    {
      aspect: '网络拥堵',
      ethereum: '高拥堵时MEV攻击频繁',
      aptos: '高吞吐量减少拥堵',
      mevRisk: 'low'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'high': return '高风险';
      case 'medium': return '中等风险';
      case 'low': return '低风险';
      default: return '未知';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Aptos MEV分析</h2>
        <p className="text-gray-600 mb-6">
          了解Aptos区块链如何通过技术创新减少MEV攻击
        </p>

        {/* 标签页 */}
        <div className="flex space-x-4 mb-8">
          {[
            { key: 'comparison', label: '📊 对比分析' },
            { key: 'mechanisms', label: '⚙️ 技术机制' },
            { key: 'protection', label: '🛡️ 防护措施' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 对比分析 */}
        {selectedTab === 'comparison' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Ethereum vs Aptos MEV对比</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">对比维度</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Ethereum</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Aptos</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">MEV风险</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-medium">
                        {item.aspect}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">
                        {item.ethereum}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">
                        {item.aptos}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(item.mevRisk)}`}>
                          {getRiskText(item.mevRisk)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-3">🎯 关键优势总结</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-blue-700 mb-2">技术优势</h5>
                  <ul className="text-blue-600 space-y-1">
                    <li>• 并行执行减少交易依赖</li>
                    <li>• 确定性排序降低操纵风险</li>
                    <li>• 高吞吐量减少网络拥堵</li>
                    <li>• Move语言提供更好安全性</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-blue-700 mb-2">用户体验</h5>
                  <ul className="text-blue-600 space-y-1">
                    <li>• 更低的MEV攻击风险</li>
                    <li>• 更稳定的交易价格</li>
                    <li>• 更快的交易确认</li>
                    <li>• 更低的交易成本</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 技术机制 */}
        {selectedTab === 'mechanisms' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Aptos反MEV技术机制</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Block-STM并行执行 */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-purple-800 mb-4">⚡ Block-STM并行执行</h4>
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded p-3 border">
                    <h5 className="font-semibold mb-2">传统顺序执行（以太坊）</h5>
                    <div className="font-mono text-xs">
                      <div>交易1 → 交易2 → 交易3 → 交易4</div>
                      <div className="text-red-600 mt-1">
                        ↑ MEV机器人可以插入交易进行夹击
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <h5 className="font-semibold mb-2">并行执行（Aptos）</h5>
                    <div className="font-mono text-xs">
                      <div>交易1 ┐</div>
                      <div>交易2 ├─ 同时执行</div>
                      <div>交易3 ├─ 冲突检测</div>
                      <div>交易4 ┘</div>
                      <div className="text-green-600 mt-1">
                        ↑ 减少了夹击攻击的机会
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 确定性排序 */}
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 mb-4">🎯 确定性交易排序</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold text-green-700 mb-2">排序算法</h5>
                    <ul className="text-green-600 space-y-1">
                      <li>• 基于交易哈希的确定性排序</li>
                      <li>• 减少验证者操纵交易顺序的能力</li>
                      <li>• 提高交易执行的可预测性</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <h5 className="font-semibold mb-2">对比示例</h5>
                    <div className="text-xs">
                      <div className="text-red-600 mb-2">
                        <strong>以太坊：</strong>矿工可以重排序获利
                      </div>
                      <div className="text-green-600">
                        <strong>Aptos：</strong>算法确定排序，难以操纵
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Move语言安全性 */}
              <div className="bg-orange-50 rounded-lg p-6">
                <h4 className="font-semibold text-orange-800 mb-4">🔒 Move语言安全特性</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold text-orange-700 mb-2">资源安全</h5>
                    <ul className="text-orange-600 space-y-1">
                      <li>• 资源不能被复制或丢弃</li>
                      <li>• 防止重入攻击</li>
                      <li>• 编译时验证资源安全</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <div className="font-mono text-xs">
                      <div className="text-gray-600">// Move代码示例</div>
                      <div>public fun swap(</div>
                      <div>&nbsp;&nbsp;account: &signer,</div>
                      <div>&nbsp;&nbsp;amount: u64</div>
                      <div>) acquires Pool &#123;</div>
                      <div>&nbsp;&nbsp;// 资源安全保证</div>
                      <div>&#125;</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 高吞吐量 */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 mb-4">🚀 高吞吐量优势</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold text-blue-700 mb-2">性能对比</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>以太坊 TPS:</span>
                        <span className="font-semibold">~15</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aptos TPS:</span>
                        <span className="font-semibold text-blue-600">100,000+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-3 border">
                    <h5 className="font-semibold mb-2">MEV影响</h5>
                    <div className="text-xs text-gray-600">
                      高吞吐量意味着更少的网络拥堵，
                      减少了MEV机器人的获利机会和动机。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 防护措施 */}
        {selectedTab === 'protection' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Aptos生态MEV防护策略</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 协议层防护 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">🏗️ 协议层防护</h4>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-800 mb-2">批量交易处理</h5>
                  <p className="text-sm text-purple-700 mb-2">
                    将多个交易打包成批次处理，减少单个交易被夹击的风险。
                  </p>
                  <div className="bg-white rounded p-2 text-xs font-mono">
                    batch_swap([tx1, tx2, tx3]) → 统一执行
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-2">时间加权平均价格</h5>
                  <p className="text-sm text-green-700 mb-2">
                    使用TWAP减少瞬时价格操纵的影响。
                  </p>
                  <div className="bg-white rounded p-2 text-xs">
                    价格 = Σ(价格 × 时间权重) / 总时间
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">MEV收益分享</h5>
                  <p className="text-sm text-blue-700 mb-2">
                    将MEV收益返还给流动性提供者和用户。
                  </p>
                  <div className="bg-white rounded p-2 text-xs">
                    MEV收益 → LP奖励 + 用户返还
                  </div>
                </div>
              </div>

              {/* 应用层防护 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">📱 应用层防护</h4>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 mb-2">智能滑点保护</h5>
                  <p className="text-sm text-orange-700 mb-2">
                    动态调整滑点保护，防止价格操纵。
                  </p>
                  <div className="bg-white rounded p-2 text-xs font-mono">
                    max_slippage = min(5%, volatility * 2)
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h5 className="font-semibold text-red-800 mb-2">交易延迟随机化</h5>
                  <p className="text-sm text-red-700 mb-2">
                    随机延迟交易执行，增加MEV攻击难度。
                  </p>
                  <div className="bg-white rounded p-2 text-xs font-mono">
                    delay = random(1-10 blocks)
                  </div>
                </div>

                <div className="bg-teal-50 rounded-lg p-4">
                  <h5 className="font-semibold text-teal-800 mb-2">私有交易池</h5>
                  <p className="text-sm text-teal-700 mb-2">
                    提供私有交易通道，避免公开暴露。
                  </p>
                  <div className="bg-white rounded p-2 text-xs">
                    用户 → 私有池 → 验证者 → 执行
                  </div>
                </div>
              </div>
            </div>

            {/* 用户最佳实践 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4">👤 用户最佳实践</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-blue-600 mb-2">交易策略</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 选择高流动性池子</li>
                    <li>• 避免大额单笔交易</li>
                    <li>• 使用限价单而非市价单</li>
                    <li>• 在网络空闲时交易</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-600 mb-2">技术工具</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 使用MEV保护钱包</li>
                    <li>• 启用滑点保护</li>
                    <li>• 监控交易状态</li>
                    <li>• 使用批量交易工具</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-green-600 mb-2">风险管理</h5>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 设置合理预期</li>
                    <li>• 分散交易时间</li>
                    <li>• 了解池子深度</li>
                    <li>• 关注市场动态</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 总结 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 总结</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Aptos通过技术创新显著降低了MEV攻击风险：</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>并行执行减少了传统的夹击攻击机会</li>
              <li>确定性排序降低了交易操纵风险</li>
              <li>高吞吐量减少了网络拥堵和竞争</li>
              <li>Move语言提供了更好的安全保障</li>
            </ul>
            <p className="mt-3">
              <strong>但仍需注意：</strong>MEV攻击在Aptos上仍然可能存在，特别是套利机会。
              用户应该采用适当的防护措施，选择有MEV保护的DApp和钱包。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptosMEVAnalysis;