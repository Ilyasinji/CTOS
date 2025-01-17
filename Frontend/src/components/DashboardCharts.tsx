import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import type { TrafficOffence } from '../types';

interface DashboardChartsProps {
  offences: TrafficOffence[];
}

const COLORS = ['#4b6cb7', '#56ab2f', '#834d9b', '#f12711'];

const DashboardCharts = ({ offences }: DashboardChartsProps) => {
  // Data processing for charts
  const monthlyData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 78 },
    { name: 'Apr', value: 51 },
    { name: 'May', value: 85 },
    { name: 'Jun', value: 39 },
  ];

  const offenceTypeData = [
    { name: 'Speeding', value: 35 },
    { name: 'Parking', value: 25 },
    { name: 'Red Light', value: 20 },
    { name: 'Other', value: 20 },
  ];

  const revenueData = [
    { name: 'Mon', amount: 2400 },
    { name: 'Tue', amount: 1398 },
    { name: 'Wed', amount: 9800 },
    { name: 'Thu', amount: 3908 },
    { name: 'Fri', amount: 4800 },
    { name: 'Sat', amount: 3800 },
    { name: 'Sun', amount: 4300 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Monthly Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#4b6cb7" 
              fill="url(#colorGradient)" 
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4b6cb7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4b6cb7" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Offence Types Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Offence Types Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={offenceTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {offenceTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Weekly Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#4b6cb7">
              {revenueData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;