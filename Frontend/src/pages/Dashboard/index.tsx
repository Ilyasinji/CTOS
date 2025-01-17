import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaCarAlt, FaExclamationTriangle, FaDollarSign } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();

  // Stats data (you can replace with real data)
  const stats = {
    drivers: 150,
    vehicles: 120,
    offenses: 45,
    payments: 693
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500">Here's what's happening in your traffic system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaUsers className="text-orange-500" />}
          title="Total Drivers"
          value={stats.drivers.toString()}
          description="Registered drivers"
          color="bg-orange-100"
        />
        <StatCard
          icon={<FaCarAlt className="text-blue-500" />}
          title="Vehicles"
          value={stats.vehicles.toString()}
          description="Registered vehicles"
          color="bg-blue-100"
        />
        <StatCard
          icon={<FaExclamationTriangle className="text-purple-500" />}
          title="Traffic Offenses"
          value={stats.offenses.toString()}
          description="Total violations"
          color="bg-purple-100"
        />
        <StatCard
          icon={<FaDollarSign className="text-green-500" />}
          title="Total Collections"
          value={`$${stats.payments}`}
          description="All time collections"
          color="bg-green-100"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <ActivityItem
              title="New Driver Registration"
              description="Ahmed Ali registered as a new driver"
              time="2 hours ago"
            />
            <ActivityItem
              title="Traffic Offense Recorded"
              description="Speed limit violation recorded for vehicle SOM-1234"
              time="5 hours ago"
            />
            <ActivityItem
              title="Payment Received"
              description="$200 payment received for ticket #12345"
              time="1 day ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for stat cards
const StatCard = ({ icon, title, value, description, color }: { icon: React.ReactNode; title: string; value: string; description: string; color: string }) => (
  <div className={`rounded-lg shadow-sm p-4 ${color}`}>
    <div className="text-2xl text-gray-900 mb-2">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-gray-500 text-sm">{description}</p>
  </div>
);

// Helper component for activity items
const ActivityItem = ({ title, description, time }: { title: string; description: string; time: string }) => (
  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150">
    <div className="flex-1">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  </div>
);

export default Dashboard;
