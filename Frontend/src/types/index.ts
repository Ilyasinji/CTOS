export interface Offense {
  _id: string;
  driver: string;
  driverEmail: string;
  driverName: string;
  vehicleNumber: string;
  offenceType: string;
  location: string;
  fine: number;
  date: string;
  status: 'Paid' | 'Unpaid';
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  vehicleNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  offenceCount: number;
}

export interface Payment {
  _id?: string;
  offense: string;
  driver: string;
  driverEmail: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Card' | 'Mobile Money';
  status: 'Completed' | 'Pending' | 'Failed';
  driverName: string;
  vehicleNumber: string;
  mobileDetails?: {
    provider: string;
    number: string;
  };
}

export interface DashboardStats {
  totalOffences: number;
  paidFines: number;
  unpaidFines: number;
  totalFines: number;
  activeDrivers: number;
  recentOffences: number;
  driversWithOffences: number;
}

export interface PaymentStats {
  totalCollections: number;
  paidCount: number;
  pendingCount: number;
}

export interface ApiError {
  message: string;
  status?: number;
}