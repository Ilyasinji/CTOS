import { DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import type { Payment } from '../types';

interface PaymentStatsProps {
  payments: Payment[];
}

export default function PaymentStats({ payments }: PaymentStatsProps) {
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'Completed').length;
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Collections</p>
            <h3 className="text-3xl font-bold text-green-600">${totalAmount}</h3>
          </div>
          <div className="text-green-600">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Completed Payments</p>
            <h3 className="text-3xl font-bold text-blue-600">{completedPayments}</h3>
          </div>
          <div className="text-blue-600">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
            <h3 className="text-3xl font-bold text-orange-600">{pendingPayments}</h3>
          </div>
          <div className="text-orange-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}