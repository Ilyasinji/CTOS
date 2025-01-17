import axios from 'axios';
import type { Offense, DashboardStats, Driver, Payment, PaymentStats } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios defaults
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication endpoints
export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  });
  return response.data;
};

// Fetch functions
export const fetchOffenses = async (): Promise<Offense[]> => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Fetching offenses for user:', user);

    let response;
    if (user.role === 'driver') {
      // If user is a driver, fetch only their offenses
      response = await axios.get(`${API_BASE_URL}/offenses/driver/${user.email}`);
    } else {
      // For admin/officer, fetch all offenses
      response = await axios.get(`${API_BASE_URL}/offenses`);
    }

    console.log('Offenses response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching offenses:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchDrivers = async (): Promise<Driver[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/drivers`);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching drivers:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchPayments = async (): Promise<Payment[]> => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Fetching payments for user:', user);

    let response;
    if (user.role === 'driver') {
      // If user is a driver, fetch only their payments
      response = await axios.get(`${API_BASE_URL}/payments/driver/${user.email}`);
    } else {
      // For admin/officer, fetch all payments
      response = await axios.get(`${API_BASE_URL}/payments`);
    }

    console.log('Payments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Create functions
export const createOffence = async (offenceData: Omit<Offense, 'id'>): Promise<Offense> => {
  try {
    console.log('Sending offense data to server:', offenceData);
    const response = await axios.post(`${API_BASE_URL}/offenses`, offenceData);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error creating offence:', error.response?.data || error.message);
    throw error;
  }
};

export const createDriver = async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/drivers`, driver);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error creating driver:', error.response?.data || error.message);
    throw error;
  }
};

export const createPayment = async (payment: Omit<Payment, '_id'>): Promise<Payment> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/payments`, payment, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment:', error.response?.data || error.message);
    throw error;
  }
};

// Update functions
export const updateOffence = async (id: string, updates: Partial<Offense>): Promise<Offense> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/offenses/${id}`, updates);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error updating offence:', error.response?.data || error.message);
    throw error;
  }
};

export const updateDriver = async (id: string, updates: Partial<Driver>): Promise<Driver> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/drivers/${id}`, updates);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error updating driver:', error.response?.data || error.message);
    throw error;
  }
};

// Delete functions
export const deleteOffence = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/offenses/${id}`);
  } catch (error: any) {
    console.error('Error deleting offence:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteDriver = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/drivers/${id}`);
  } catch (error: any) {
    console.error('Error deleting driver:', error.response?.data || error.message);
    throw error;
  }
};

// Deletion requests endpoints
export const createDeletionRequest = async (offenseId: string, reason: string) => {
  const response = await axios.post(`${API_BASE_URL}/offenses/deletion-requests`, {
    offenseId,
    reason
  });
  return response.data;
};

export const fetchDeletionRequests = async () => {
  const response = await axios.get(`${API_BASE_URL}/offenses/deletion-requests`);
  return response.data;
};

export const updateDeletionRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
  const response = await axios.patch(`${API_BASE_URL}/offenses/deletion-requests/${requestId}`, { status });
  return response.data;
};

// Dashboard stats
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('Fetching dashboard stats from API...');
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    console.log('Dashboard stats response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchPaymentStats = async (): Promise<PaymentStats> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/payments/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    throw error;
  }
};

// Get driver with offences
export const getDriverWithOffences = async (driverId: string): Promise<Driver & { offenceHistory: Offense[] }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/drivers/${driverId}/offences`);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching driver with offences:', error.response?.data || error.message);
    throw error;
  }
};

// Get offence with driver details
export const getOffenceWithDriver = async (offenceId: string): Promise<Offense & { driverDetails: Driver | null }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/offenses/${offenceId}/driver`);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching offence with driver:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch driver-specific data
export const fetchDriverSpecificData = async (email: string) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('No authentication token found');
    }

    console.log('Fetching driver-specific data for:', email);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const [paymentsResponse, offensesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/payments/driver/${email}`, { headers }),
      axios.get(`${API_BASE_URL}/offenses/driver/${email}`, { headers })
    ]);

    console.log('Received responses:', {
      payments: paymentsResponse.data,
      offenses: offensesResponse.data
    });

    // Extract payments array from the response
    const payments = paymentsResponse.data.payments || [];
    const paymentStats = paymentsResponse.data.stats || {
      totalCollections: 0,
      todayPayments: 0,
      pendingPayments: 0
    };

    return {
      data: {
        payments,
        paymentStats,
        offenses: offensesResponse.data || []
      }
    };

  } catch (error: any) {
    console.error('Error fetching driver data:', {
      message: error.message,
      response: error.response?.data
    });
    throw error;
  }
};