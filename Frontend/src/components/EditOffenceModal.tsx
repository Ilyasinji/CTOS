import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateOffence } from '../services/api';
import type { Offense } from '../types';
import { format } from 'date-fns';

interface EditOffenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOffenceUpdated: () => void;
  offence: Offense;
}

export default function EditOffenceModal({ isOpen, onClose, onOffenceUpdated, offence }: EditOffenceModalProps) {
  const [formData, setFormData] = useState({
    driverName: '',
    vehicleNumber: '',
    offenceType: '',
    location: '',
    fine: '',
    date: '',
    status: ''
  });

  useEffect(() => {
    if (offence) {
      setFormData({
        driverName: offence.driverName,
        vehicleNumber: offence.vehicleNumber,
        offenceType: offence.offenceType,
        location: offence.location,
        fine: offence.fine.toString(),
        date: new Date(offence.date).toISOString().slice(0, 10) ,
        status: offence.status
      });
    }
  }, [offence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOffence(offence._id, {
        ...formData,
        fine: Number(formData.fine)
      });
      onOffenceUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to update offence:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Offence</h2>
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
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Offence Type
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={formData.offenceType}
              onChange={(e) => setFormData({ ...formData, offenceType: e.target.value })}
            >
              <option value="">Select Offence Type</option>
              <option value="Speeding">Speeding</option>
              <option value="Red Light">Red Light</option>
              <option value="Parking">Parking</option>
              <option value="No License">No License</option>
              <option value="Drunk Driving">Drunk Driving</option>
              <option value="Other">Other</option>
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
              value= {formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
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
              Update Offence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 