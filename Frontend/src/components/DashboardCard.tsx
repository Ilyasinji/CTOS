import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'blue' | 'green' | 'purple' | 'orange';
}

const DashboardCard = ({ title, value, icon, variant = 'blue' }: DashboardCardProps) => {
  return (
    <div className={`card card-stats card-${variant}`}>
      <div className="card-icon">
        {icon}
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard; 