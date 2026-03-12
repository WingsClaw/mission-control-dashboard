interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, icon, trend = 'neutral' }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 ${trendColors[trend]}`}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trend === 'neutral' && '→'}
              {' '}
              {Math.abs(change)}% from last hour
            </p>
          )}
        </div>
        <div className="text-gray-400 text-2xl">{icon}</div>
      </div>
    </div>
  );
}
