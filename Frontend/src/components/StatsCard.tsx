import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  percentage: number;
  icon?: ReactNode;
}

export default function StatsCard({ title, value, percentage, icon }: StatsCardProps) {
  const getColorClasses = (title: string) => {
    switch (title) {
      case "Total Offences":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
        };
      case "Paid Fines":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
        };
      case "New Cases":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
        };
    }
  };

  const colors = getColorClasses(title);

  return (
    <div className={`p-4 rounded-lg shadow-md ${colors.bg} ${colors.border} border`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-sm font-medium ${colors.text}`}>{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.bg}`}
        >
          {icon ? (
            icon
          ) : (
            <span className={`text-xl font-semibold ${colors.text}`}>
              {percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
