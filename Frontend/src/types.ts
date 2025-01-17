export interface Driver {
  _id: string;
  name: string;
  vehicleNumber: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  image?: string;
  offences?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Offense {
  _id: string;
  driverName: string;
  driverEmail: string;
  vehicleNumber: string;
  offenceType: 'Speeding' | 'Parking' | 'No License' | 'Red Light' | 'Drunk Driving' | 'Other';
  location: string;
  date: string;
  fine: number;
  status: 'Pending' | 'Paid' | 'Unpaid';
  driver: string | Driver;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  offense: string | Offense;
  driverName: string;
  driverEmail: string;
  vehicleNumber: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Card' | 'Mobile Money';
  status: 'Completed' | 'Failed' | 'Pending';
  mobileDetails?: {
    provider: string;
    number: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalDrivers: number;
  totalOffences: number;
  totalPayments: number;
  pendingPayments: number;
  recentOffences: Offense[];
  recentPayments: Payment[];
}
