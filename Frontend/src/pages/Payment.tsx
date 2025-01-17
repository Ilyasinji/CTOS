import { useState, useEffect } from 'react';
import { PlusCircle, Search, DollarSign, CreditCard, Clock, Printer } from 'lucide-react';
import { fetchPayments, fetchOffenses } from '../services/api';
import AddPaymentModal from '../components/AddPaymentModal';
import type { Payment, Offense } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [offences, setOffences] = useState<Offense[]>([]);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCollections: 0,
    todayPayments: 0,
    pendingPayments: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await fetchPayments();
        // Filter payments for driver role
        if (user?.role === 'driver') {
          const myPayments = data.filter((payment: any) => payment.driverName === user.name);
          setPayments(myPayments);
        } else {
          setPayments(data);
        }
      } catch (error) {
        console.error('Failed to load payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPayments();
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching data for user:', user?.email);
        
        // Fetch both payments and offenses
        const [paymentsData, offensesData] = await Promise.all([
          fetchPayments(),
          fetchOffenses()
        ]);

        // Filter data based on user role
        const filteredPayments = user?.role === 'driver' && user?.email
          ? paymentsData.filter(payment => payment.driverEmail === user.email)
          : paymentsData;

        const filteredOffenses = user?.role === 'driver' && user?.email
          ? offensesData.filter(offense => offense.driverEmail === user.email)
          : offensesData;

        setPayments(filteredPayments);

        // Filter out offenses that have payments
        const unpaidOffenses = filteredOffenses.filter(offense => {
          // Skip if offense is already paid
          if (offense.status === 'Paid') {
            return false;
          }
          
          // Check if there's no payment for this offense
          const hasPayment = filteredPayments.some(payment => {
            if (!payment.offense) return false;
            const offenseId = typeof payment.offense === 'string' 
              ? payment.offense 
              : payment.offense._id;
            return offenseId === offense._id;
          });
          
          // Only include offenses that don't have payments
          return !hasPayment;
        });

        // Calculate stats
        const totalCollections = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const todayPayments = filteredPayments.filter(payment => {
          const paymentDate = new Date(payment.date).toDateString();
          const today = new Date().toDateString();
          return paymentDate === today;
        }).length;

        const pendingPayments = unpaidOffenses.length;

        setStats({
          totalCollections,
          todayPayments,
          pendingPayments
        });

        setOffences(unpaidOffenses);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => {
    const searchString = searchTerm.toLowerCase();
    return (
      payment.driverName?.toLowerCase().includes(searchString) ||
      payment.vehicleNumber?.toLowerCase().includes(searchString) ||
      payment._id?.toLowerCase().includes(searchString)
    );
  });

  const handlePaymentAdded = async () => {
    console.log('Payment added, reloading data...');
    setIsLoading(true);
    try {
      const [paymentsData, offensesData] = await Promise.all([
        fetchPayments(),
        fetchOffenses()
      ]);

      // Filter data based on user role
      const filteredPayments = user?.role === 'driver'
        ? paymentsData.filter(payment => payment.driverEmail === user.email)
        : paymentsData;

      const filteredOffenses = user?.role === 'driver'
        ? offensesData.filter(offense => offense.driverEmail === user.email)
        : offensesData;

      // Filter out offenses that have payments
      const unpaidOffenses = filteredOffenses.filter(offense => {
        // Ensure offense exists and has required properties
        if (!offense || !offense._id) {
          console.log('Invalid offense object:', offense);
          return false;
        }

        // Check if offense status is not already paid
        if (offense.status === 'Paid') {
          return false;
        }
        
        // Check if there's no payment for this offense
        const hasPayment = filteredPayments.some(payment => {
          if (!payment || !payment.offense) {
            return false;
          }
          
          const offenseId = typeof payment.offense === 'string' 
            ? payment.offense 
            : payment.offense._id;
            
          return offenseId === offense._id;
        });
        
        return !hasPayment;
      });

      console.log('Filtered unpaid offenses:', unpaidOffenses);

      // Calculate stats
      const totalCollections = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const todayPayments = filteredPayments.filter(payment => {
        const paymentDate = new Date(payment.date).toDateString();
        const today = new Date().toDateString();
        return paymentDate === today;
      }).length;

      const pendingPayments = unpaidOffenses.length;

      setStats({
        totalCollections,
        todayPayments,
        pendingPayments
      });

      setOffences(unpaidOffenses);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
    setIsAddPaymentModalOpen(false);
  };

  const handlePrint = () => {
    // Add print styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* Hide non-printable elements */
        button, input, .bg-gradient-to-r {
          display: none !important;
        }

        /* Reset background colors and shadows */
        body, div {
          background: white !important;
          box-shadow: none !important;
        }

        /* Add page title */
        .print-header {
          display: block !important;
          text-align: center;
          margin-bottom: 20px;
        }

        /* Table styles */
        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        /* Status colors */
        .status-completed {
          color: green !important;
        }
        .status-pending {
          color: orange !important;
        }
        .status-failed {
          color: red !important;
        }

        /* Add page breaks */
        .page-break {
          page-break-after: always;
        }
      }
    `;
    document.head.appendChild(style);

    // Add print header
    const header = document.createElement('div');
    header.className = 'print-header';
    header.style.display = 'none';
    header.innerHTML = `
      <h1 style="font-size: 24px; margin-bottom: 10px;">Payment Report</h1>
      <p style="margin-bottom: 5px;">Traffic Management System</p>
      <p style="margin-bottom: 20px;">Date: ${new Date().toLocaleDateString()}</p>
      <div style="margin-bottom: 20px;">
        <p>Total Collections: $${stats.totalCollections}</p>
        <p>Today's Payments: ${stats.todayPayments}</p>
      </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    // Print
    window.print();

    // Cleanup
    setTimeout(() => {
      document.head.removeChild(style);
      document.body.removeChild(header);
    }, 1000);
  };

  const handlePrintReceipt = (payment: Payment) => {
    // Add print styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* Hide everything except receipt */
        body > * {
          display: none !important;
        }
        
        /* Show and style receipt */
        .receipt {
          display: block !important;
          width: 80mm;  /* Standard receipt width */
          margin: 0 auto;
          padding: 10mm;
          font-family: 'Courier New', monospace;
        }

        .receipt * {
          margin: 0;
          padding: 0;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 5mm;
        }

        .receipt-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 2mm;
        }

        .receipt-body {
          margin: 5mm 0;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          margin: 2mm 0;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 5mm;
          font-size: 8pt;
        }

        .receipt-divider {
          border-top: 1px dashed #000;
          margin: 3mm 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Create receipt
    const receipt = document.createElement('div');
    receipt.className = 'receipt';
    receipt.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-title">Traffic Management System</div>
        <div>Payment Receipt</div>
        <div>${new Date().toLocaleDateString()}</div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-body">
        <div class="receipt-row">
          <span>Receipt No:</span>
          <span>${payment._id}</span>
        </div>
        <div class="receipt-row">
          <span>Driver Name:</span>
          <span>${payment.driverName}</span>
        </div>
        <div class="receipt-row">
          <span>Vehicle No:</span>
          <span>${payment.vehicleNumber}</span>
        </div>
        <div class="receipt-row">
          <span>Amount Paid:</span>
          <span>$${payment.amount}</span>
        </div>
        <div class="receipt-row">
          <span>Payment Method:</span>
          <span>${payment.paymentMethod}</span>
        </div>
        <div class="receipt-row">
          <span>Status:</span>
          <span>${payment.status}</span>
        </div>
        <div class="receipt-row">
          <span>Date:</span>
          <span>${new Date(payment.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-footer">
        <div>Thank you for your payment</div>
        <div>Keep this receipt for your records</div>
      </div>
    `;
    document.body.appendChild(receipt);

    // Print
    window.print();

    // Cleanup
    setTimeout(() => {
      document.head.removeChild(style);
      document.body.removeChild(receipt);
    }, 1000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Report
          </button>
          <button
            onClick={() => setIsAddPaymentModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Collections</h3>
              <p className="text-3xl font-bold text-purple-600">
                ${stats.totalCollections.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Today's Payments</h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.todayPayments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-7 w-7 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending Payments</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pendingPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by driver name, vehicle number or payment ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            </div>
          ) : (
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
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.driverName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.vehicleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                      <button
                        onClick={() => handlePrintReceipt(payment)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Print Receipt"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAddPaymentModalOpen && (
        <AddPaymentModal
          isOpen={isAddPaymentModalOpen}
          onClose={() => setIsAddPaymentModalOpen(false)}
          onPaymentAdded={handlePaymentAdded}
          unpaidOffences={offences}
        />
      )}
    </div>
  );
}