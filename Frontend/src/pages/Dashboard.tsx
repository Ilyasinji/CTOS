import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Car, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { fetchOffenses, fetchDrivers, fetchDashboardStats, fetchPaymentStats, fetchDriverSpecificData } from '../services/api';
import type { Offense, Driver, DashboardStats, Payment } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface DriverData {
  offenses: Offense[];
  payments: Payment[];
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [offenses, setOffenses] = useState<Offense[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDrivers: 0,
    totalOffences: 0,
    totalPayments: 0,
    pendingPayments: 0,
    recentOffences: [],
    recentPayments: []
  });
  const [paymentStats, setPaymentStats] = useState({
    totalCollections: 0,
    completedPayments: 0,
    pendingPayments: 0
  });
  const [trendsTimeRange, setTrendsTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [distributionTimeRange, setDistributionTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'driver' && user?.email) {
          // Fetch driver-specific data
          const response = await fetchDriverSpecificData(user.email);
          const driverData = response.data;

          console.log('Driver specific data:', driverData);

          if (driverData && driverData.offenses && driverData.payments) {
            setOffenses(driverData.offenses || []);
            setDrivers([]);  // Driver doesn't need to see other drivers
            setStats({
              totalDrivers: 1,
              totalOffences: driverData.offenses?.length || 0,
              totalPayments: driverData.payments?.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0),
              pendingPayments: driverData.payments?.filter((p: Payment) => p.status === 'Pending').length || 0,
              recentOffences: driverData.offenses?.slice(0, 5) || [],
              recentPayments: driverData.payments?.slice(0, 5) || []
            });
            setPaymentStats({
              totalCollections: driverData.payments?.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0) || 0,
              completedPayments: driverData.payments?.filter((p: Payment) => p.status === 'Completed').length || 0,
              pendingPayments: driverData.payments?.filter((p: Payment) => p.status === 'Pending').length || 0
            });
          } else {
            console.error('Invalid response format:', driverData);
          }
        } else {
          // Fetch all data for admin
          const [offensesData, driversData, dashboardStats, paymentStatsData] = await Promise.all([
            fetchOffenses(),
            fetchDrivers(),
            fetchDashboardStats(),
            fetchPaymentStats()
          ]);
          
          setOffenses(offensesData);
          setDrivers(driversData);
          setStats({
            ...dashboardStats,
            totalDrivers: driversData.length,
            totalOffences: offensesData.length,
            recentOffences: Array.isArray(dashboardStats.recentOffences) ? dashboardStats.recentOffences : [],
            recentPayments: Array.isArray(dashboardStats.recentPayments) ? dashboardStats.recentPayments : []
          });
          setPaymentStats(paymentStatsData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Calculate statistics
  const newCases = offenses.filter(o => {
    const offenceDate = new Date(o.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - offenceDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  // Prepare chart data
  const offencesByType = offenses.reduce((acc, curr) => {
    acc[curr.offenceType] = (acc[curr.offenceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get filtered offenses for pie chart
  const getFilteredOffensesForPieChart = () => {
    const now = new Date();
    return offenses.filter(offense => {
      const offenseDate = new Date(offense.date);
      switch (distributionTimeRange) {
        case 'daily':
          return (
            offenseDate.getDate() === now.getDate() &&
            offenseDate.getMonth() === now.getMonth() &&
            offenseDate.getFullYear() === now.getFullYear()
          );
        case 'weekly':
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return offenseDate >= oneWeekAgo;
        case 'monthly':
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return offenseDate >= oneMonthAgo;
        default:
          return true;
      }
    });
  };

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'ar':
        return 'ar-SA';
      case 'so':
        return 'so-SO';
      default:
        return 'en-US';
    }
  };

  // Prepare trends chart data
  const prepareTrendsData = () => {
    const now = new Date();
    const data: { date: string; count: number }[] = [];
    const locale = getDateLocale();

    if (trendsTimeRange === 'daily') {
      // Last 7 days data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString(locale, { weekday: 'short' });
        const count = offenses.filter(o => {
          const offenceDate = new Date(o.date);
          return offenceDate.getDate() === date.getDate() && 
                 offenceDate.getMonth() === date.getMonth() &&
                 offenceDate.getFullYear() === date.getFullYear();
        }).length;
        data.push({ date: dateStr, count });
      }
    } else if (trendsTimeRange === 'weekly') {
      // Last 4 weeks data
      for (let i = 3; i >= 0; i--) {
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - (i * 7));
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        
        const count = offenses.filter(o => {
          const offenceDate = new Date(o.date);
          return offenceDate >= startDate && offenceDate <= endDate;
        }).length;
        
        const weekStart = startDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
        const weekEnd = endDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
        data.push({ 
          date: `${weekStart}-${weekEnd}`, 
          count 
        });
      }
    } else {
      // Monthly data (last 6 months)
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
        
        const count = offenses.filter(o => {
          const offenceDate = new Date(o.date);
          return offenceDate.getMonth() === date.getMonth() && 
                 offenceDate.getFullYear() === date.getFullYear();
        }).length;
        
        data.push({ date: monthStr, count });
      }
    }

    return data;
  };

  const trendsData = prepareTrendsData();

  // Get pie chart data
  const getPieChartData = () => {
    const filteredOffenses = getFilteredOffensesForPieChart();
    const distribution = filteredOffenses.reduce((acc, curr) => {
      acc[curr.offenceType] = (acc[curr.offenceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      percent: filteredOffenses.length > 0 ? value / filteredOffenses.length : 0
    }));
  };

  const pieChartData = getPieChartData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100';
      case 'Unpaid':
        return 'bg-red-100';
      case 'Pending':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl font-medium">Loading...</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
              <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Offences */}
            <div className="bg-gradient-to-br from-[#F26611] to-[#F26611]/80 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">{t('dashboard.totalOffences')}</h3>
                  <p className="text-3xl font-bold text-white">{stats.totalOffences}</p>
                  <p className="text-sm text-white/80">{t('dashboard.allRecordedViolations')}</p>
                </div>
              </div>
            </div>

            {/* New Cases */}
            <div className="bg-gradient-to-br from-[#3174F1] to-[#3174F1]/80 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Car className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">{t('dashboard.newCases')}</h3>
                  <p className="text-3xl font-bold text-white">{newCases}</p>
                  <p className="text-sm text-white/80">{t('dashboard.last7Days')}</p>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-gradient-to-br from-[#9D44F1] to-[#9D44F1]/80 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">{t('dashboard.activeUsers')}</h3>
                  <p className="text-3xl font-bold text-white">{drivers.length}</p>
                  <p className="text-sm text-white/80">{t('dashboard.totalRegisteredDrivers')}</p>
                </div>
              </div>
            </div>

            {/* Total Fines */}
            <div className="bg-gradient-to-br from-[#3073F1] to-[#3073F1]/80 rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">{t('dashboard.collectedFines')}</h3>
                  <p className="text-3xl font-bold text-white">${paymentStats.totalCollections.toLocaleString()}</p>
                  <p className="text-sm text-white/80">{t('dashboard.totalFines')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{t('trends.title')}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTrendsTimeRange('daily')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      trendsTimeRange === 'daily'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('trends.daily')}
                  </button>
                  <button
                    onClick={() => setTrendsTimeRange('weekly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      trendsTimeRange === 'weekly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('trends.weekly')}
                  </button>
                  <button
                    onClick={() => setTrendsTimeRange('monthly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      trendsTimeRange === 'monthly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('trends.monthly')}
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fill: '#666' }}
                      tickLine={{ stroke: '#666' }}
                    />
                    <YAxis
                      tick={{ fill: '#666' }}
                      tickLine={{ stroke: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #ddd'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Offence Types Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{t('trends.offenceTypesDistribution')}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDistributionTimeRange('daily')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      distributionTimeRange === 'daily'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('trends.daily')}
                  </button>
                  <button
                    onClick={() => setDistributionTimeRange('weekly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      distributionTimeRange === 'weekly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('trends.weekly')}
                  </button>
                  <button
                    onClick={() => setDistributionTimeRange('monthly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      distributionTimeRange === 'monthly'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t('trends.monthly')}
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${t(name)} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Offences Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="bg-gradient-to-r from-[#3174F1] to-[#3174F1]/80 -mx-6 -mt-6 px-6 py-4 rounded-t-xl mb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('dashboard.recentOffences')}</h3>
                    <p className="text-sm text-white/80">{t('dashboard.trackLatestTrafficViolations')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.driverName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.vehicleNumber')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.offenceType')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.location')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.fine')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dashboard.date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((offence) => (
                      <tr key={offence._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {offence.driverName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {offence.vehicleNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {t(offence.offenceType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {offence.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${offence.fine.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            offence.status === 'Paid' 
                              ? 'bg-green-100 text-green-700 ring-green-600/20'
                              : offence.status === 'Unpaid'
                              ? 'bg-red-100 text-red-700 ring-red-600/20'
                              : 'bg-yellow-100 text-yellow-700 ring-yellow-600/20'
                          }`}>
                            {t(`dashboard.${offence.status.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(offence.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
