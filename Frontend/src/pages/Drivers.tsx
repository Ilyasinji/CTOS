import { useState, useEffect } from 'react';
import { PlusCircle, Search, Users, Car, AlertTriangle } from 'lucide-react';
import { fetchDrivers, deleteDriver } from '../services/api';
import AddDriverModal from '../components/AddDriverModal';
import EditDriverModal from '../components/EditDriverModal';
import type { Driver } from '../types';
import { useTranslation } from 'react-i18next';

export default function Drivers() {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleDelete = async (_id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteDriver(_id);
        await loadDrivers();
      } catch (error) {
        console.error('Failed to delete driver:', error);
      }
    }
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsEditModalOpen(true);
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{t('drivers.title')}</h1>
              <p className="mt-2 text-blue-100">
                {t('drivers.subtitle')}
              </p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              {t('common.newDriver')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Drivers */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{t('drivers.totalDrivers')}</h3>
                <p className="text-3xl font-bold text-white">{drivers.length}</p>
              </div>
            </div>
          </div>

          {/* Active Vehicles */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <Car className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{t('drivers.activeVehicles')}</h3>
                <p className="text-3xl font-bold text-white">
                  {new Set(drivers.map(d => d.vehicleNumber)).size}
                </p>
              </div>
            </div>
          </div>

          {/* Drivers with Offences */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-white">{t('drivers.withOffences')}</h3>
                <p className="text-3xl font-bold text-white">
                  {drivers.filter(d => (d.offences || 0) > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('drivers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.driverName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('drivers.licenseNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('dashboard.vehicleNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('drivers.contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('drivers.address')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('drivers.offences')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {driver.image ? (
                            <img 
                              src={driver.image} 
                              alt={driver.name} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=0D8ABC&color=fff`;
                              }}
                            />
                          ) : (
                            <img 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=0D8ABC&color=fff`}
                              alt={driver.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {driver.licenseNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {driver.vehicleNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{driver.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (driver.offences || 0) > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {driver.offences || 0} {t('drivers.offencesCount')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(driver._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('common.delete')}
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

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onDriverAdded={loadDrivers}
      />

      {/* Edit Driver Modal */}
      {selectedDriver && (
        <EditDriverModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDriver(null);
          }}
          onDriverUpdated={loadDrivers}
          driver={selectedDriver}
        />
      )}
    </div>
  );
}