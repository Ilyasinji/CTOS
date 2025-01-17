import axios from 'axios';
import type { TrafficOffence, DashboardStats, Driver, Payment } from '../types';

// Local storage keys
const OFFENCES_STORAGE_KEY = 'traffic_offences';
const DRIVERS_STORAGE_KEY = 'traffic_drivers';
const PAYMENTS_STORAGE_KEY = 'traffic_payments';

// Initialize local storage with empty arrays if not exists
if (!localStorage.getItem(OFFENCES_STORAGE_KEY)) {
  localStorage.setItem(OFFENCES_STORAGE_KEY, JSON.stringify([]));
}
if (!localStorage.getItem(DRIVERS_STORAGE_KEY)) {
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify([]));
}
if (!localStorage.getItem(PAYMENTS_STORAGE_KEY)) {
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify([]));
}

// Fetch functions
export const fetchOffences = async (): Promise<TrafficOffence[]> => {
  const offences = localStorage.getItem(OFFENCES_STORAGE_KEY);
  return JSON.parse(offences || '[]');
};

export const fetchDrivers = async (): Promise<Driver[]> => {
  const drivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
  return JSON.parse(drivers || '[]');
};

export const fetchPayments = async (): Promise<Payment[]> => {
  const payments = localStorage.getItem(PAYMENTS_STORAGE_KEY);
  return JSON.parse(payments || '[]');
};

// Helper function to update offence counts for drivers
const updateDriverOffenceCounts = async () => {
  const drivers = await fetchDrivers();
  const offences = await fetchOffences();
  
  const driverOffenceCounts = offences.reduce((acc, offence) => {
    const driver = drivers.find(d => d.name === offence.driverName);
    if (driver) {
      acc[driver.name] = (acc[driver.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const updatedDrivers = drivers.map(driver => ({
    ...driver,
    offenceCount: driverOffenceCounts[driver.name] || 0
  }));

  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(updatedDrivers));
};

// Create functions
export const createOffence = async (offence: Omit<TrafficOffence, 'id'>): Promise<TrafficOffence> => {
  const drivers = await fetchDrivers();
  const driverExists = drivers.some(d => d.name === offence.driverName);
  
  if (!driverExists) {
    throw new Error(`Driver "${offence.driverName}" not found. Please add the driver first.`);
  }

  const offences = await fetchOffences();
  const newOffence = {
    ...offence,
    id: Date.now().toString()
  };
  
  offences.push(newOffence);
  localStorage.setItem(OFFENCES_STORAGE_KEY, JSON.stringify(offences));
  
  // Update driver offence counts
  await updateDriverOffenceCounts();
  
  return newOffence;
};

export const createDriver = async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
  const drivers = await fetchDrivers();
  const newDriver = {
    ...driver,
    id: Date.now().toString()
  };
  
  drivers.push(newDriver);
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
  return newDriver;
};

export const createPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
  const payments = await fetchPayments();
  const newPayment = {
    ...payment,
    id: Date.now().toString()
  };
  
  payments.push(newPayment);
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  
  // Update offence status when payment is made
  const offences = await fetchOffences();
  const updatedOffences = offences.map(offence => 
    offence.id === payment.offenceId 
      ? { ...offence, status: 'Paid' }
      : offence
  );
  localStorage.setItem(OFFENCES_STORAGE_KEY, JSON.stringify(updatedOffences));
  
  return newPayment;
};

// Update functions
export const updateOffence = async (id: string, updates: Partial<TrafficOffence>): Promise<TrafficOffence> => {
  const offences = await fetchOffences();
  const updatedOffences = offences.map(offence => 
    offence.id === id ? { ...offence, ...updates } : offence
  );
  
  localStorage.setItem(OFFENCES_STORAGE_KEY, JSON.stringify(updatedOffences));
  return updatedOffences.find(o => o.id === id)!;
};

export const updateDriver = async (id: string, updates: Partial<Driver>): Promise<Driver> => {
  const drivers = await fetchDrivers();
  const updatedDrivers = drivers.map(driver => 
    driver.id === id ? { ...driver, ...updates } : driver
  );
  
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(updatedDrivers));
  return updatedDrivers.find(d => d.id === id)!;
};

// Delete functions
export const deleteOffence = async (id: string): Promise<void> => {
  const offences = await fetchOffences();
  const filteredOffences = offences.filter(offence => offence.id !== id);
  localStorage.setItem(OFFENCES_STORAGE_KEY, JSON.stringify(filteredOffences));
  
  // Update driver offence counts
  await updateDriverOffenceCounts();
};

export const deleteDriver = async (id: string): Promise<void> => {
  const drivers = await fetchDrivers();
  const filteredDrivers = drivers.filter(driver => driver.id !== id);
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(filteredDrivers));
};

// Update dashboard stats to include driver info
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const [offences, drivers, payments] = await Promise.all([
    fetchOffences(),
    fetchDrivers(),
    fetchPayments()
  ]);

  // Calculate total collections from payments (source of truth)
  const totalCollections = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Get recent offences (last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
  const recentOffences = offences.filter(o => new Date(o.date) >= sevenDaysAgo);

  return {
    totalOffences: offences.length,
    paidFines: totalCollections,  // Use payments as source of truth
    unpaidFines: offences.filter(o => o.status === 'Unpaid').length,
    totalFines: totalCollections, // Show same amount as paid fines
    activeDrivers: drivers.length,
    recentOffences: recentOffences.length,
    driversWithOffences: drivers.filter(d => d.offenceCount > 0).length
  };
};

// Add function to get driver details with offences
export const getDriverWithOffences = async (driverId: string): Promise<Driver & { offenceHistory: TrafficOffence[] }> => {
  const [driver, offences] = await Promise.all([
    fetchDrivers().then(drivers => drivers.find(d => d.id === driverId)),
    fetchOffences()
  ]);

  if (!driver) {
    throw new Error('Driver not found');
  }

  const driverOffences = offences.filter(o => o.driverName === driver.name);

  return {
    ...driver,
    offenceHistory: driverOffences
  };
};

// Add function to get offence with driver details
export const getOffenceWithDriver = async (offenceId: string): Promise<TrafficOffence & { driverDetails: Driver | null }> => {
  const [offence, drivers] = await Promise.all([
    fetchOffences().then(offences => offences.find(o => o.id === offenceId)),
    fetchDrivers()
  ]);

  if (!offence) {
    throw new Error('Offence not found');
  }

  const driver = drivers.find(d => d.name === offence.driverName);

  return {
    ...offence,
    driverDetails: driver || null
  };
};