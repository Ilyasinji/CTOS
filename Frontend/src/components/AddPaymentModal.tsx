import { useState } from 'react';
import { X, CreditCard, Phone, DollarSign } from 'lucide-react';
import { createPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import type { Offense } from '../types';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: () => void;
  unpaidOffences: Offense[];
}

type PaymentMethodType = 'Cash' | 'Card' | 'Mobile Money';

export default function AddPaymentModal({ isOpen, onClose, onPaymentAdded, unpaidOffences }: AddPaymentModalProps) {
  const { user } = useAuth();
  const [selectedOffence, setSelectedOffence] = useState<Offense | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash');
  const [mobileNumber, setMobileNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const { addNotification } = useNotification();

  // Define available payment methods based on user role
  const getAvailablePaymentMethods = (): PaymentMethodType[] => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return ['Cash'];
    } else if (user?.role === 'driver') {
      return ['Mobile Money', 'Card'];
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffence) return;

    try {
      // Create payment data
      const paymentData = {
        offense: selectedOffence._id,
        driver: selectedOffence.driver,
        driverEmail: selectedOffence.driverEmail,
        amount: selectedOffence.fine,
        date: new Date().toISOString(),
        paymentMethod: paymentMethod as 'Cash' | 'Card' | 'Mobile Money',
        status: 'Completed' as 'Completed' | 'Pending' | 'Failed',
        driverName: selectedOffence.driverName,
        vehicleNumber: selectedOffence.vehicleNumber,
        ...(paymentMethod === 'Mobile Money' && {
          mobileDetails: {
            provider,
            number: mobileNumber
          }
        }),
        ...(paymentMethod === 'Card' && {
          cardDetails: {
            number: cardNumber,
            expiry: cardExpiry,
            cvc: cardCVC
          }
        })
      };

      console.log('Sending payment data:', JSON.stringify(paymentData, null, 2));
      
      const response = await createPayment(paymentData);
      console.log('Payment response:', response);
      
      // Add notification to context
      addNotification('Payment processed successfully', 'success');

      // Add notification to localStorage
      const notification = {
        id: Math.random().toString(36).substring(7),
        message: 'Payment processed successfully',
        type: 'success',
        timestamp: new Date().toISOString(),
        userId: user?._id
      };

      const savedNotifications = localStorage.getItem('notifications');
      const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      notifications.push(notification);
      localStorage.setItem('notifications', JSON.stringify(notifications));

      onPaymentAdded();
      onClose();
      
      // Reset form
      setSelectedOffence(null);
      setPaymentMethod('Cash');
      setMobileNumber('');
      setProvider('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVC('');
    } catch (error: any) {
      console.error('Payment error details:', {
        error: JSON.stringify(error, null, 2),
        response: error.response && JSON.stringify(error.response, null, 2),
        data: error.response?.data && JSON.stringify(error.response.data, null, 2)
      });
      addNotification(error.response?.data?.message || 'Failed to process payment', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Payment</h2>
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
              Select Offence
            </label>
            <select
              required
              value={selectedOffence?._id || ''}
              onChange={(e) => {
                const selected = unpaidOffences.find(o => o._id === e.target.value);
                setSelectedOffence(selected || null);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select an unpaid offence</option>
              {unpaidOffences.map((offence) => (
                <option key={offence._id} value={offence._id}>
                  {offence.driverName} - ${offence.fine} ({offence.offenceType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {getAvailablePaymentMethods().map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                    paymentMethod === method
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-500'
                  }`}
                  onClick={() => setPaymentMethod(method as PaymentMethodType)}
                >
                  {method === 'Cash' && <DollarSign className="h-6 w-6 mb-1" />}
                  {method === 'Card' && <CreditCard className="h-6 w-6 mb-1" />}
                  {method === 'Mobile Money' && <Phone className="h-6 w-6 mb-1" />}
                  <span className="text-sm">{method}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'Mobile Money' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Provider
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="">Select Provider</option>
                  <option value="Hormuud">Hormuud</option>
                  <option value="Somtel">Somtel</option>
                  <option value="Telesom">Telesom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., 61-2345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'Card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  maxLength={16}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    value={cardExpiry}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (value.length > 2) {
                        setCardExpiry(value.slice(0, 2) + '/' + value.slice(2));
                      } else {
                        setCardExpiry(value);
                      }
                    }}
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    value={cardCVC}
                    onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedOffence && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Summary</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Driver:</span>
                  <span className="font-medium">{selectedOffence.driverName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="font-medium">{selectedOffence.vehicleNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Offence:</span>
                  <span className="font-medium">{selectedOffence.offenceType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">${selectedOffence.fine.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

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
              disabled={!selectedOffence}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}