import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { Printer } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

// Define interfaces for our data types
interface MonthlyData {
  _id: {
    year: number;
    month: number;
  };
  count: number;
  total?: number;
}

interface ViolationType {
  _id: string;
  count: number;
}

interface Incident {
  date: string;
  offenceType: string;
  location: string;
  status: string;
}

interface Stats {
  totalViolations: number;
  totalRevenue: number;
  totalIncidents: number;
  monthlyViolations: number[];
  monthlyRevenue: number[];
  violationTypes: Array<{ label: string; value: number }>;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalViolations: 0,
    totalRevenue: 0,
    totalIncidents: 0,
    monthlyViolations: [],
    monthlyRevenue: [],
    violationTypes: [],
  });

  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);

  // Chart data states with proper typing
  const [violationsTrendData, setViolationsTrendData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Violations',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  });

  const [revenueAnalysisData, setRevenueAnalysisData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });

  const [violationTypesData, setViolationTypesData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Get user info from localStorage
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        const isDriver = user?.role === 'driver';

        // Get violations stats with driver filter if needed
        const violationsRes = await axios.get('/api/offenses/stats', {
          params: {
            driverEmail: isDriver ? user.email : undefined
          }
        });
        console.log('Violations response:', violationsRes.data);

        // Get payments stats with driver filter if needed
        const paymentsRes = await axios.get('/api/payments/stats', {
          params: {
            driverEmail: isDriver ? user.email : undefined
          }
        });
        console.log('Payments response:', paymentsRes.data);

        // Get recent incidents with driver filter if needed
        const recentIncidentsRes = await axios.get('/api/offenses/recent', {
          params: {
            driverEmail: isDriver ? user.email : undefined
          }
        });
        console.log('Recent incidents:', recentIncidentsRes.data);
        setRecentIncidents(recentIncidentsRes.data);

        // Process monthly violations data
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthlyViolationsData = new Array(6).fill(0);
        (violationsRes.data.monthlyViolations as MonthlyData[]).forEach(item => {
          const monthIndex = item._id.month - 1;
          if (monthIndex < 6) {
            monthlyViolationsData[monthIndex] = item.count;
          }
        });

        // Process monthly revenue data
        const monthlyRevenueData = new Array(6).fill(0);
        (paymentsRes.data.monthlyRevenue as MonthlyData[]).forEach(item => {
          const monthIndex = item._id.month - 1;
          if (monthIndex < 6) {
            monthlyRevenueData[monthIndex] = item.total || 0;
          }
        });

        // Process violation types data
        const violationTypes = (violationsRes.data.violationTypes as ViolationType[]).map(type => ({
          label: type._id,
          value: type.count
        }));

        setStats({
          totalViolations: violationsRes.data.totalOffenses || 0,
          totalRevenue: paymentsRes.data.totalCollections || 0,
          totalIncidents: violationsRes.data.totalOffenses || 0,
          monthlyViolations: monthlyViolationsData,
          monthlyRevenue: monthlyRevenueData,
          violationTypes: violationTypes,
        });

        // Update chart data
        setViolationsTrendData({
          labels: monthLabels,
          datasets: [{
            label: 'Violations',
            data: monthlyViolationsData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }]
        });

        setRevenueAnalysisData({
          labels: monthLabels,
          datasets: [{
            label: 'Revenue',
            data: monthlyRevenueData,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          }]
        });

        setViolationTypesData({
          labels: violationTypes.map(t => t.label),
          datasets: [{
            data: violationTypes.map(t => t.value),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
          }]
        });

      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Add print function
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the charts' canvas elements and convert to images
    const violationsTrendChart = document.querySelector('#violations-trend-chart canvas') as HTMLCanvasElement;
    const revenueAnalysisChart = document.querySelector('#revenue-analysis-chart canvas') as HTMLCanvasElement;
    const violationTypesChart = document.querySelector('#violation-types-chart canvas') as HTMLCanvasElement;

    // Convert charts to data URLs
    const violationsTrendImage = violationsTrendChart?.toDataURL() || '';
    const revenueAnalysisImage = revenueAnalysisChart?.toDataURL() || '';
    const violationTypesImage = violationTypesChart?.toDataURL() || '';

    // Create the print content
    const printContent = `
      <html>
        <head>
          <title>Traffic System Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .report-header { text-align: center; margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
            .stat-card h3 { margin: 0 0 10px 0; color: #374151; }
            .stat-card p { margin: 0; font-size: 24px; font-weight: bold; color: #111827; }
            .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
            .chart-container { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .chart-container h3 { margin: 0 0 15px 0; color: #374151; text-align: center; }
            .pie-chart { grid-column: 1 / -1; max-width: 600px; margin: 0 auto; }
            .chart-image { width: 100%; height: auto; }
            .incidents-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .incidents-table th, .incidents-table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .incidents-table th { background-color: #f8f9fa; }
            @media print {
              .no-print { display: none; }
              .chart-image { max-width: 100%; }
              @page { size: landscape; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>Traffic System Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Violations</h3>
              <p>${stats.totalViolations}</p>
            </div>
            <div class="stat-card">
              <h3>Total Revenue</h3>
              <p>$${stats.totalRevenue}</p>
            </div>
            <div class="stat-card">
              <h3>Total Incidents</h3>
              <p>${stats.totalIncidents}</p>
            </div>
          </div>

          <div class="charts-grid">
            <div class="chart-container">
              <h3>Violations Trend</h3>
              <img src="${violationsTrendImage}" class="chart-image" alt="Violations Trend" />
            </div>
            <div class="chart-container">
              <h3>Revenue Analysis</h3>
              <img src="${revenueAnalysisImage}" class="chart-image" alt="Revenue Analysis" />
            </div>
            <div class="chart-container pie-chart">
              <h3>Violation Types</h3>
              <img src="${violationTypesImage}" class="chart-image" alt="Violation Types" />
            </div>
          </div>

          <h2>Recent Incidents</h2>
          <table class="incidents-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${recentIncidents.map(incident => `
                <tr>
                  <td>${new Date(incident.date).toLocaleDateString()}</td>
                  <td>${incident.offenceType}</td>
                  <td>${incident.location}</td>
                  <td>${incident.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for images to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div id="reports-container" className="min-h-screen bg-gray-50 p-6">
      {/* Header with Print Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
        <div className="relative">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{t('reports.totalViolations')}</h3>
              <p className="text-3xl font-bold">{stats.totalViolations}</p>
            </div>
            <div className="bg-orange-300 bg-opacity-30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{t('reports.totalRevenue')}</h3>
              <p className="text-3xl font-bold">{stats.totalRevenue}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{t('reports.totalIncidents')}</h3>
              <p className="text-3xl font-bold">{stats.totalIncidents}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violations Trend */}
        <div className="bg-white p-6 rounded-lg shadow" id="violations-trend-chart">
          <h2 className="text-lg font-semibold mb-4">{t('reports.violationsTrend')}</h2>
          <div className="h-64">
            <Line 
              data={violationsTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Revenue Analysis */}
        <div className="bg-white p-6 rounded-lg shadow" id="revenue-analysis-chart">
          <h2 className="text-lg font-semibold mb-4">{t('reports.revenueAnalysis')}</h2>
          <div className="h-64">
            <Bar 
              data={revenueAnalysisData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Violation Types Distribution */}
        <div className="bg-white p-6 rounded-lg shadow" id="violation-types-chart">
          <h2 className="text-lg font-semibold mb-4">{t('reports.violationTypes')}</h2>
          <div className="h-64">
            <Pie 
              data={violationTypesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recent Incidents Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{t('reports.recentIncidents')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.type')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.location')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.status')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentIncidents.map((incident, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(incident.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incident.offenceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incident.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        incident.status === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t(`reports.${incident.status.toLowerCase()}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
