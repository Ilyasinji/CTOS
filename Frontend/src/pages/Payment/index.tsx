import { useEffect, useState } from 'react';
import { FaDollarSign, FaCreditCard, FaClock } from 'react-icons/fa';
import axios from 'axios';

const Payment = () => {
  const [stats, setStats] = useState({
    totalCollections: 0,
    todayPayments: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    // Fetch payment stats
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/payments/stats');
        setStats({
          totalCollections: response.data.totalCollections || 0,
          todayPayments: response.data.todayPayments || 0,
          pendingPayments: response.data.pendingPayments || 0
        });
      } catch (error) {
        console.error('Error fetching payment stats:', error);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Total Collections Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
              <FaDollarSign className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Total Collections</h3>
              <p className="text-3xl font-bold text-white">${stats.totalCollections}</p>
            </div>
          </div>
        </div>

        {/* Today's Payments Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
              <FaCreditCard className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Today's Payments</h3>
              <p className="text-3xl font-bold text-white">{stats.todayPayments}</p>
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
              <FaClock className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Pending Payments</h3>
              <p className="text-3xl font-bold text-white">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by driver name, vehicle number or payment ID"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              New Payment
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample payment row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  67640ab554be40d7a2fbd365
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Ahmed AliSOM
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $200
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  19/12/2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payment;
