import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface CommercialStreet {
  id: number;
  name: string;
  description: string;
  creator: string;
  pairAddress: string;
  createdAt: string;
  isActive: boolean;
}

interface Facility {
  id: number;
  streetId: number;
  facilityType: string;
  name: string;
  description: string;
  owner: string;
  constructionCost: number;
  maintenanceCost: number;
  revenue: number;
  level: number;
  createdAt: string;
}

interface StreetForm {
  name: string;
  description: string;
  pairAddress: string;
}

const CommercialStreet = () => {
  const { wallet, signAndSubmitTransaction } = useWallet();
  const [streets, setStreets] = useState<CommercialStreet[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'streets' | 'facilities' | 'create'>('streets');
  const [streetForm, setStreetForm] = useState<StreetForm>({
    name: '',
    description: '',
    pairAddress: ''
  });

  // 获取所有商业街
  const fetchCommercialStreets = async () => {
    setLoading(true);
    try {
      // 这里应该调用合约的view函数获取所有商业街
      // TODO: 实际实现时需要调用链上合约函数
      // const response = await fetch(`/api/commercial-streets`);
      // const data = await response.json();
      
      // 暂时使用模拟数据
      const mockStreets: CommercialStreet[] = [
        {
          id: 1,
          name: "Tech Plaza",
          description: "A modern technology commercial street",
          creator: "0x123456789abcdef",
          pairAddress: "0xabcdef123456789",
          createdAt: "2024-01-15",
          isActive: true
        },
        {
          id: 2,
          name: "Fashion Avenue",
          description: "A trendy fashion commercial street",
          creator: "0x987654321fedcba",
          pairAddress: "0x987654321fedcba",
          createdAt: "2024-01-20",
          isActive: true
        }
      ];

      setStreets(mockStreets);
    } catch (error) {
      console.error('Failed to fetch commercial streets:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有设施
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      // 这里应该调用合约的view函数获取所有设施
      // TODO: 实际实现时需要调用链上合约函数
      // const response = await fetch(`/api/facilities`);
      // const data = await response.json();
      
      // 暂时使用模拟数据
      const mockFacilities: Facility[] = [
        {
          id: 1,
          streetId: 1,
          facilityType: "Shop",
          name: "Tech Store",
          description: "Latest tech gadgets",
          owner: "0x123456789abcdef",
          constructionCost: 1000,
          maintenanceCost: 100,
          revenue: 500,
          level: 1,
          createdAt: "2024-01-16"
        },
        {
          id: 2,
          streetId: 1,
          facilityType: "Bar",
          name: "Developer's Bar",
          description: "Relax and network",
          owner: "0xabcdef123456789",
          constructionCost: 500,
          maintenanceCost: 50,
          revenue: 200,
          level: 1,
          createdAt: "2024-01-17"
        },
        {
          id: 3,
          streetId: 2,
          facilityType: "Clothing Store",
          name: "Fashion Hub",
          description: "Trendy clothing store",
          owner: "0x987654321fedcba",
          constructionCost: 800,
          maintenanceCost: 80,
          revenue: 400,
          level: 1,
          createdAt: "2024-01-21"
        }
      ];

      setFacilities(mockFacilities);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStreetFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStreetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateStreet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!streetForm.name || !streetForm.pairAddress) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // 调用合约的create_street函数
      const transaction = {
        function: "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d::commercial_street::create_street",
        type_arguments: [],
        arguments: [
          Array.from(new TextEncoder().encode(streetForm.name)),     // name as bytes
          Array.from(new TextEncoder().encode(streetForm.description || streetForm.name)), // description as bytes
          streetForm.pairAddress  // pair_address
        ],
        type: "entry_function_payload"
      };

      const result = await signAndSubmitTransaction(transaction);
      console.log('Commercial street created successfully:', result);
      
      // 重置表单
      setStreetForm({
        name: '',
        description: '',
        pairAddress: ''
      });
      
      // 刷新商业街列表
      await fetchCommercialStreets();
      
      alert('Commercial street created successfully!');
      setActiveTab('streets');
    } catch (error) {
      console.error('Failed to create commercial street:', error);
      alert('Failed to create commercial street, please try again');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommercialStreets();
    fetchFacilities();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Commercial Streets</h1>
        <p className="mt-2 text-gray-600">Create and manage your digital commercial streets</p>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'streets'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('streets')}
          >
            Commercial Streets
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'facilities'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('facilities')}
          >
            Facilities
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Street
          </button>
        </div>

        {activeTab === 'streets' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Commercial Streets</h2>
              <button
                onClick={fetchCommercialStreets}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {streets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Loading...' : 'No commercial streets available'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streets.map((street) => (
                  <div key={street.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{street.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        street.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {street.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{street.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Creator:</span>
                        <span className="font-mono">{formatAddress(street.creator)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Trading Pair:</span>
                        <span className="font-mono">{formatAddress(street.pairAddress)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span>{street.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'facilities' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Facilities</h2>
              <button
                onClick={fetchFacilities}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {facilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {loading ? 'Loading...' : 'No facilities available'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Street
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {facilities.map((facility) => (
                      <tr key={facility.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                          <div className="text-xs text-gray-500">{facility.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{facility.facilityType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Street #{facility.streetId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 font-mono">
                            {formatAddress(facility.owner)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Level {facility.level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{facility.revenue} USDT</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Create New Commercial Street</h2>
            <form onSubmit={handleCreateStreet} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={streetForm.name}
                  onChange={handleStreetFormChange}
                  placeholder="e.g., Tech Plaza"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={streetForm.description}
                  onChange={handleStreetFormChange}
                  placeholder="Describe your commercial street"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trading Pair Address *
                </label>
                <input
                  type="text"
                  name="pairAddress"
                  value={streetForm.pairAddress}
                  onChange={handleStreetFormChange}
                  placeholder="Enter the address of your trading pair"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You must create a trading pair first before creating a commercial street
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Requirements</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• You must be the creator of the trading pair</li>
                  <li>• The trading pair must have sufficient liquidity</li>
                  <li>• Each trading pair can only be associated with one commercial street</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={!wallet.connected}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  !wallet.connected
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Create Commercial Street
              </button>
            </form>

            {!wallet.connected && (
              <p className="text-center text-red-500 text-sm mt-4">
                Please connect your wallet to create commercial streets
              </p>
            )}
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {streets.length}
            </div>
            <div className="text-sm text-gray-500">Total Streets</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {facilities.length}
            </div>
            <div className="text-sm text-gray-500">Total Facilities</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {facilities.reduce((sum, facility) => sum + facility.revenue, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Revenue (USDT)</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {facilities.reduce((sum, facility) => sum + facility.level, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Facility Levels</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialStreet;