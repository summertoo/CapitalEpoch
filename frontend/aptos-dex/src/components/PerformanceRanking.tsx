import { useState, useEffect } from 'react';

interface PerformanceRecord {
  streetId: number;
  streetName: string;
  creator: string;
  tradingVolume: number;
  liquidity: number;
  facilityCount: number;
  facilityLevel: number;
  userActivity: number;
  totalScore: number;
  rank: number;
  updatedAt: string;
}

interface RewardRecord {
  streetId: number;
  periodType: string;
  periodId: string;
  rewardAmount: number;
  rewardType: string;
  isClaimed: boolean;
  createdAt: string;
}

const PerformanceRanking = () => {
  const [performances, setPerformances] = useState<PerformanceRecord[]>([]);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ranking' | 'rewards'>('ranking');

  // 获取业绩排名
  const fetchPerformanceRanking = async () => {
    setLoading(true);
    try {
      // 这里应该调用合约的view函数获取业绩排名
      // TODO: 实际实现时需要调用链上合约函数
      // const response = await fetch(`/api/performance-ranking`);
      // const data = await response.json();
      
      // 暂时使用模拟数据
      const mockPerformances: PerformanceRecord[] = [
        {
          streetId: 1,
          streetName: "Tech Plaza",
          creator: "0x123456789abcdef",
          tradingVolume: 1000000,
          liquidity: 500000,
          facilityCount: 5,
          facilityLevel: 4,
          userActivity: 150,
          totalScore: 9500,
          rank: 1,
          updatedAt: "2024-01-31"
        },
        {
          streetId: 2,
          streetName: "Fashion Avenue",
          creator: "0x987654321fedcba",
          tradingVolume: 800000,
          liquidity: 400000,
          facilityCount: 4,
          facilityLevel: 3,
          userActivity: 120,
          totalScore: 8200,
          rank: 2,
          updatedAt: "2024-01-31"
        },
        {
          streetId: 3,
          streetName: "Food Court",
          creator: "0xabcdef123456789",
          tradingVolume: 600000,
          liquidity: 300000,
          facilityCount: 3,
          facilityLevel: 2,
          userActivity: 100,
          totalScore: 6800,
          rank: 3,
          updatedAt: "2024-01-31"
        }
      ];

      setPerformances(mockPerformances);
    } catch (error) {
      console.error('Failed to fetch performance ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取奖励记录
  const fetchRewards = async () => {
    setLoading(true);
    try {
      // 这里应该调用合约的view函数获取奖励记录
      // TODO: 实际实现时需要调用链上合约函数
      // const response = await fetch(`/api/rewards`);
      // const data = await response.json();
      
      // 暂时使用模拟数据
      const mockRewards: RewardRecord[] = [
        {
          streetId: 1,
          periodType: "Monthly",
          periodId: "2024-01",
          rewardAmount: 1000,
          rewardType: "Top Performer",
          isClaimed: true,
          createdAt: "2024-02-01"
        },
        {
          streetId: 2,
          periodType: "Monthly",
          periodId: "2024-01",
          rewardAmount: 500,
          rewardType: "Second Place",
          isClaimed: true,
          createdAt: "2024-02-01"
        },
        {
          streetId: 3,
          periodType: "Monthly",
          periodId: "2024-01",
          rewardAmount: 250,
          rewardType: "Third Place",
          isClaimed: false,
          createdAt: "2024-02-01"
        }
      ];

      setRewards(mockRewards);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceRanking();
    fetchRewards();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (rank === 2) {
      return 'bg-gray-100 text-gray-800';
    } else if (rank === 3) {
      return 'bg-amber-100 text-amber-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Performance Ranking</h1>
        <p className="mt-2 text-gray-600">Monthly performance competition and rewards</p>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'ranking'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('ranking')}
          >
            Performance Ranking
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'rewards'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
        </div>

        {activeTab === 'ranking' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Monthly Performance Ranking</h2>
              <button
                onClick={fetchPerformanceRanking}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {performances.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Loading...' : 'No performance data available'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commercial Street
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trading Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liquidity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facilities
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performances.map((performance) => (
                      <tr key={performance.streetId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRankBadge(performance.rank)}`}>
                            #{performance.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{performance.streetName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 font-mono">
                            {formatAddress(performance.creator)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{performance.tradingVolume.toLocaleString()} USDT</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{performance.liquidity.toLocaleString()} USDT</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {performance.facilityCount} (Level {performance.facilityLevel})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{performance.totalScore}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Monthly Rewards</h2>
              <button
                onClick={fetchRewards}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {rewards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Loading...' : 'No reward data available'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commercial Street
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reward Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rewards.map((reward, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Street #{reward.streetId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reward.periodType} {reward.periodId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reward.rewardType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{reward.rewardAmount} USDT</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            reward.isClaimed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reward.isClaimed ? 'Claimed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reward.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 奖励机制说明 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Reward Mechanism</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Metrics</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span><strong>Trading Volume (40% weight):</strong> Total transaction volume</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span><strong>Liquidity (30% weight):</strong> Total liquidity in pools</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span><strong>Facilities (20% weight):</strong> Number and level of facilities</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span><strong>User Activity (10% weight):</strong> User engagement metrics</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reward Distribution</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Top 10%:</strong> High rewards and special privileges</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Top 30%:</strong> Standard rewards</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Bottom 10%:</strong> Warning and possible penalties</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Monthly Reset:</strong> New competition each month</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceRanking;