import { useState, useEffect } from 'react';
import { PlusCircle, Search, Filter, AlertCircle, Clock, Pencil, Trash2, Users, DollarSign } from 'lucide-react';
import { fetchOffenses, updateOffence, fetchPaymentStats, createDeletionRequest } from '../services/api';
import AddOffenceModal from '../components/AddOffenceModal';
import EditOffenceModal from '../components/EditOffenceModal';
import type { Offense } from '../types';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext'; 

export default function TrafficOffences() {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const { user } = useAuth(); 
  const [offences, setOffences] = useState<Offense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffence, setSelectedOffence] = useState<Offense | null>(null);
  const [stats, setStats] = useState({
    totalFines: 0,
    paidFines: 0
  });

  // Function to load offenses
  const loadOffensesData = async () => {
    try {
      setLoading(true);
      const data = await fetchOffenses();
      // Filter offences for driver role
      if (user?.role === 'driver') {
        const myOffences = data.filter((offence: any) => offence.driverName === user.name);
        setOffences(myOffences);
      } else {
        setOffences(data);
      }
    } catch (error) {
      console.error('Failed to load offenses:', error);
      addNotification('Failed to load offenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffensesData();
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const paymentStats = await fetchPaymentStats();
        setStats({
          totalFines: paymentStats.totalCollections,
          paidFines: paymentStats.totalCollections
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  const handleEdit = (offence: Offense) => {
    setSelectedOffence(offence);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (offenceId: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        const reason = window.prompt(t('common.deleteReason'));
        if (!reason) return;

        await createDeletionRequest(offenceId, reason);
        addNotification(t('common.deletionRequestCreated'), 'success');
      } catch (error) {
        console.error('Error requesting deletion:', error);
        addNotification(t('common.errorRequestingDeletion'), 'error');
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Pending' | 'Paid' | 'Unpaid') => {
    try {
      await updateOffence(id, { status: newStatus });
      await loadOffensesData(); // Reload the list after update
    } catch (error) {
      console.error('Failed to update offence status:', error);
    }
  };

  const filteredOffences = offences.filter(offence => {
    // Add null checks for all properties
    const driverName = offence.driverName || '';
    const vehicleNumber = offence.vehicleNumber || '';
    const offenceType = offence.offenceType || '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = 
      driverName.toLowerCase().includes(searchTermLower) ||
      vehicleNumber.toLowerCase().includes(searchTermLower) ||
      offenceType.toLowerCase().includes(searchTermLower);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'paid' && offence.status === 'Paid') ||
                         (filterStatus === 'pending' && offence.status === 'Pending');
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{user?.role === 'driver' ? 'My Offences' : t('navigation.trafficOffences')}</h1>
              <p className="mt-2 text-orange-100">
                {t('dashboard.trackLatestTrafficViolations')}
              </p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              {t('common.newOffence')}
            </button>
          </div>
        </div>

        {/* Stats Cards - Reordered */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Offences - First */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{t('dashboard.totalOffences')}</h3>
                <p className="text-3xl font-bold text-white">{offences.length}</p>
                <p className="text-sm text-white/80">{t('dashboard.allRecordedViolations')}</p>
              </div>
            </div>
          </div>
          
          {/* New Cases - Second */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{t('dashboard.newCases')}</h3>
                <p className="text-3xl font-bold text-white">
                  {offences.filter(o => {
                    const offenceDate = new Date(o.date);
                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - offenceDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                  }).length}
                </p>
                <p className="text-sm text-white/80">{t('dashboard.last7Days')}</p>
              </div>
            </div>
          </div>

          {/* Active Users - Third */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{t('dashboard.activeUsers')}</h3>
                <p className="text-3xl font-bold text-white">
                  {new Set(offences.map(o => o.driverName)).size}
                </p>
                <p className="text-sm text-white/80">{t('dashboard.uniqueDrivers')}</p>
              </div>
            </div>
          </div>
          
          {/* Paid Fines - Last */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{t('dashboard.paidFines')}</h3>
                <p className="text-3xl font-bold text-white">
                  ${stats.paidFines.toLocaleString()}
                </p>
                <p className="text-sm text-white/80">{t('dashboard.collectedFines')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                placeholder={t('dashboard.searchByDriverVehicleOrOffence')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  className="block w-full pl-3 pr-10 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending')}
                >
                  <option value="all">{t('dashboard.allStatus')}</option>
                  <option value="paid">{t('dashboard.paid')}</option>
                  <option value="pending">{t('dashboard.pending')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table with Actions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.driverName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.vehicleNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.offenceType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.location')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.fine')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffences.map((offence) => (
                  <tr key={offence._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {offence.driverName || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {offence.vehicleNumber || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {offence.offenceType || ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {offence.location || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${offence.fine.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={offence.status}
                        onChange={(e) => handleUpdateStatus(offence._id, e.target.value as 'Pending' | 'Paid' | 'Unpaid')}
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          offence.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="Pending">{t('dashboard.pending')}</option>
                        <option value="Paid">{t('dashboard.paid')}</option>
                        <option value="Unpaid">{t('dashboard.unpaid')}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(offence.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(offence)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(offence._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Offence Modal */}
      <AddOffenceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onOffenceAdded={loadOffensesData}
      />

      {/* Edit Offence Modal */}
      {selectedOffence && (
        <EditOffenceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOffence(null);
          }}
          onOffenceUpdated={loadOffensesData}
          offence={selectedOffence}
        />
      )}
    </div>
  );
}
