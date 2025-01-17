import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { fetchPayments, fetchOffenses } from '../services/api';
import type { Payment, Offense } from '../types';
import { useAuth } from '../context/AuthContext';
import AddPaymentModal from '../components/AddPaymentModal'; // Import the AddPaymentModal component

interface PaymentStats {
  totalCollections: number;
  todayPayments: number;
  pendingPayments: number;
}

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [offenses, setOffenses] = useState<Offense[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalCollections: 0,
    todayPayments: 0,
    pendingPayments: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Debug logs for authentication
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        console.log('Auth state:', {
          contextUser: user,
          storedUser: storedUser ? JSON.parse(storedUser) : null,
          hasToken: !!storedToken
        });

        if (!user || !user.email) {
          console.log('No user found in context or missing email');
          setError('Please log in to view payments');
          return;
        }

        console.log('Fetching data for user:', {
          email: user.email,
          role: user.role
        });

        // Fetch both payments and offenses
        const [paymentsData, offensesData] = await Promise.all([
          fetchPayments(),
          fetchOffenses()
        ]);
        console.log('Fetched payments:', paymentsData);
        console.log('Fetched offenses:', offensesData);

        // Filter out offenses that have payments
        const unpaidOffenses = offensesData.filter(offense => {
          // Check if offense status is Unpaid
          if (offense.status !== 'Unpaid') {
            return false;
          }
          
          // Check if there's no payment for this offense
          const hasPayment = paymentsData.some(payment => {
            const offenseId = typeof payment.offense === 'string' 
              ? payment.offense 
              : payment.offense._id;
            return offenseId === offense._id;
          });
          
          return !hasPayment;
        });

        console.log('Unpaid offenses:', unpaidOffenses);

        if (Array.isArray(paymentsData)) {
          setPayments(paymentsData);

          // Calculate stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const calculatedStats = {
            totalCollections: paymentsData.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0),
            todayPayments: paymentsData.filter((p: Payment) => new Date(p.date) >= today).length,
            pendingPayments: unpaidOffenses.length
          };
          
          console.log('Calculated payment stats:', calculatedStats);
          setStats(calculatedStats);
          setOffenses(unpaidOffenses);
        } else {
          console.error('Invalid payments data format:', paymentsData);
          setError('Failed to load payments data');
        }

      } catch (error) {
        console.error('Error loading payments:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleAddPayment = () => {
    setIsAddPaymentModalOpen(true);
  };

  const handlePaymentAdded = async () => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Debug logs for authentication
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        console.log('Auth state:', {
          contextUser: user,
          storedUser: storedUser ? JSON.parse(storedUser) : null,
          hasToken: !!storedToken
        });

        if (!user || !user.email) {
          console.log('No user found in context or missing email');
          setError('Please log in to view payments');
          return;
        }

        console.log('Fetching data for user:', {
          email: user.email,
          role: user.role
        });

        // Fetch both payments and offenses
        const [paymentsData, offensesData] = await Promise.all([
          fetchPayments(),
          fetchOffenses()
        ]);
        console.log('Fetched payments:', paymentsData);
        console.log('Fetched offenses:', offensesData);

        // Filter out offenses that have payments
        const unpaidOffenses = offensesData.filter(offense => {
          // Check if offense status is Unpaid
          if (offense.status !== 'Unpaid') {
            return false;
          }
          
          // Check if there's no payment for this offense
          const hasPayment = paymentsData.some(payment => {
            const offenseId = typeof payment.offense === 'string' 
              ? payment.offense 
              : payment.offense._id;
            return offenseId === offense._id;
          });
          
          return !hasPayment;
        });

        console.log('Unpaid offenses:', unpaidOffenses);

        if (Array.isArray(paymentsData)) {
          setPayments(paymentsData);

          // Calculate stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const calculatedStats = {
            totalCollections: paymentsData.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0),
            todayPayments: paymentsData.filter((p: Payment) => new Date(p.date) >= today).length,
            pendingPayments: unpaidOffenses.length
          };
          
          console.log('Calculated payment stats:', calculatedStats);
          setStats(calculatedStats);
          setOffenses(unpaidOffenses);
        } else {
          console.error('Invalid payments data format:', paymentsData);
          setError('Failed to load payments data');
        }

      } catch (error) {
        console.error('Error loading payments:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setIsAddPaymentModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Print Report
          </button>
          {user?.role !== 'driver' && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              onClick={handleAddPayment}
            >
              <Plus className="h-5 w-5" />
              Add Payment
            </button>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        onPaymentAdded={handlePaymentAdded}
        unpaidOffences={offenses}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Collections Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Collections</h3>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalCollections)}</p>
            </div>

            {/* Today's Payments Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Today's Payments</h3>
              <p className="text-3xl font-bold">{stats.todayPayments}</p>
            </div>

            {/* Pending Payments Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending Payments</h3>
              <p className="text-3xl font-bold">{stats.pendingPayments}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search by driver name, vehicle number or payment ID"
                className="w-full p-2 border rounded"
                // Add search functionality here
              />
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No payments found</p>
                {user?.role !== 'driver' && (
                  <button
                    className="text-purple-500 hover:text-purple-600 mt-2 inline-block"
                    onClick={() => {/* TODO: Implement add payment */}}
                  >
                    Create a new payment
                  </button>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.driverName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.vehicleNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(payment.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'Failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
