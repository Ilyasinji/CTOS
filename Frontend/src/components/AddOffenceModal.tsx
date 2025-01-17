import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createOffence, fetchDrivers } from '../services/api';
import type { Offense, Driver } from '../types';
import { useNotification } from '../context/NotificationContext';

interface AddOffenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOffenceAdded: () => void;
}

export default function AddOffenceModal({ isOpen, onClose, onOffenceAdded }: AddOffenceModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    driverName: '',
    vehicleNumber: '',
    offenceType: '',
    location: '',
    fine: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Load available drivers
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const data = await fetchDrivers();
        setDrivers(data);
      } catch (error) {
        console.error('Failed to load drivers:', error);
      }
    };

    if (isOpen) {
      loadDrivers();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOffence({
        ...formData,
        fine: Number(formData.fine),
        status: 'Unpaid'
      });

      // Add notification to context
      addNotification(`New offense registered for ${formData.driverName}`, 'success');

      // Add notification to localStorage
      const notification = {
        id: Math.random().toString(36).substring(7),
        message: `New offense registered for ${formData.driverName}`,
        type: 'success',
        timestamp: new Date().toISOString(),
        userId: drivers.find(d => d.name === formData.driverName)?._id
      };

      const savedNotifications = localStorage.getItem('notifications');
      const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      notifications.push(notification);
      localStorage.setItem('notifications', JSON.stringify(notifications));

      onOffenceAdded();
      onClose();
      setFormData({
        driverName: '',
        vehicleNumber: '',
        offenceType: '',
        location: '',
        fine: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to add offence:', error);
    }
  };

  const offenseTypes = [
    'Speeding',
    'Parking',
    'No License',
    'Red Light',
    'Drunk Driving',
    'Other'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Offence</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name
            </label>
            <select
              required
              value={formData.driverName}
              onChange={(e) => {
                const selectedDriver = drivers.find(d => d.name === e.target.value);
                setFormData({
                  ...formData,
                  driverName: e.target.value,
                  vehicleNumber: selectedDriver ? selectedDriver.vehicleNumber : ''
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.name}>
                  {driver.name} ({driver.vehicleNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offense Type
            </label>
            <select
              required
              value={formData.offenceType}
              onChange={(e) => setFormData({ ...formData, offenceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select Offense Type</option>
              {offenseTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fine Amount ($)
            </label>
            <input
              type="number"
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={formData.fine}
              onChange={(e) => setFormData({ ...formData, fine: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
            >
              Add Offence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}