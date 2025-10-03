import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface FacilityForm {
  streetId: string;
  facilityType: string;
  name: string;
  description: string;
  constructionCost: string;
}

const FacilityManager = () => {
  const { wallet, signAndSubmitTransaction } = useWallet();
  const [form, setForm] = useState<FacilityForm>({
    streetId: '',
    facilityType: '1', // Shop
    name: '',
    description: '',
    constructionCost: '1000000000' // 1000 USDT
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    if (!form.streetId || !form.name) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const transaction = {
        function: "0xf3b20ebd0787e1504c41c25e2038729b7d4783a8dbcbca2d3601fef71af5755d::facility::create_facility",
        type_arguments: [
          "0x1::aptos_coin::AptosCoin" // USDT type (should be actual USDT address)
        ],
        arguments: [
          form.streetId,                     // street_address
          parseInt(form.facilityType),      // facility_type
          Array.from(new TextEncoder().encode(form.name)),     // name as bytes
          Array.from(new TextEncoder().encode(form.description || form.name)), // description as bytes
          parseInt(form.constructionCost)   // construction_cost
        ],
        type: "entry_function_payload"
      };

      const result = await signAndSubmitTransaction(transaction);
      console.log('Facility created successfully:', result);
      
      // Reset form
      setForm({
        streetId: '',
        facilityType: '1',
        name: '',
        description: '',
        constructionCost: '1000000000'
      });
      
      alert('Facility created successfully!');
    } catch (error) {
      console.error('Failed to create facility:', error);
      alert('Failed to create facility, please check parameters and try again');
    } finally {
      setLoading(false);
    }
  };

  const formatUSDT = (amount: string) => {
    const num = parseInt(amount) || 0;
    return (num / 1000000).toFixed(2); // Convert to USDT units for display
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Facility</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commercial Street ID *
          </label>
          <input
            type="text"
            name="streetId"
            value={form.streetId}
            onChange={handleInputChange}
            placeholder="Enter street address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the address of the commercial street where you want to create a facility
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facility Type *
          </label>
          <select
            name="facilityType"
            value={form.facilityType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="1">Shop</option>
            <option value="2">Bar</option>
            <option value="3">School</option>
            <option value="4">Store</option>
            <option value="5">Clothing Store</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facility Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="e.g., Tech Store"
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
            value={form.description}
            onChange={handleInputChange}
            placeholder="Describe your facility"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Construction Cost *
          </label>
          <input
            type="text"
            name="constructionCost"
            value={form.constructionCost}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Current setting: {formatUSDT(form.constructionCost)} USDT
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Facility Information</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Shop:</strong> General merchandise store</li>
            <li>• <strong>Bar:</strong> Social and entertainment venue</li>
            <li>• <strong>School:</strong> Education and training center</li>
            <li>• <strong>Store:</strong> Small convenience store</li>
            <li>• <strong>Clothing Store:</strong> Fashion and apparel shop</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">🎯 Benefits</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Generate revenue for your commercial street</li>
            <li>• Increase user engagement and activity</li>
            <li>• Improve your performance ranking</li>
            <li>• Unlock special rewards and privileges</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !wallet.connected}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            loading || !wallet.connected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {loading ? 'Creating Facility...' : 'Create Facility'}
        </button>
      </form>

      {!wallet.connected && (
        <p className="text-center text-red-500 text-sm mt-4">
          Please connect your wallet to create facilities
        </p>
      )}
    </div>
  );
};

export default FacilityManager;