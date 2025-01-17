import { useState, useEffect } from 'react';
import { fetchDashboardStats } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOffences: 0,
    paidFines: 0,
    unpaidFines: 0,
    totalFines: 0,
    activeDrivers: 0,
    recentOffences: 0,
    driversWithOffences: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats from frontend...');
        const data = await fetchDashboardStats();
        console.log('Received stats:', data);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Offence Card */}
        <div className="bg-card-orange p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Total Offences</h2>
              <div className="mt-2 text-3xl font-bold">{stats.totalOffences}</div>
              <p className="text-sm mt-1">All recorded violations</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* New Cases Card */}
        <div className="bg-card-blue p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent Offences</h2>
              <div className="mt-2 text-3xl font-bold">{stats.recentOffences}</div>
              <p className="text-sm mt-1">Last 7 days</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-card-purple p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Active Drivers</h2>
              <div className="mt-2 text-3xl font-bold">{stats.activeDrivers}</div>
              <p className="text-sm mt-1">Total registered drivers</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Fines Card */}
        <div className="bg-card-blue p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Total Fines</h2>
              <div className="mt-2 text-3xl font-bold">${stats.totalFines}</div>
              <p className="text-sm mt-1">Accumulated fines</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;