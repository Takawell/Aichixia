import { FiActivity, FiKey, FiZap, FiTrendingUp, FiPlus, FiArrowRight } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

type DailyUsage = {
  id: string;
  api_key_id: string;
  user_id: string;
  date: string;
  requests_count: number;
  tokens_used: number;
  success_count: number;
  error_count: number;
  created_at: string;
};

type OverviewProps = {
  stats: {
    totalRequests: number;
    activeKeys: number;
    rateLimitUsage: number;
    successCount: number;
    errorCount: number;
  };
  usageData: DailyUsage[];
  onNavigate: (tab: 'keys' | 'activity' | 'models') => void;
};

type TooltipPayloadItem = {
  value: number;
  name: string;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function Overview({ stats, usageData, onNavigate }: OverviewProps) {
  const [activeChartLine, setActiveChartLine] = useState<'requests' | 'success' | 'errors'>('requests');
  const chartData = usageData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    requests: d.requests_count,
    success: d.success_count,
    errors: d.error_count,
  }));

  const chartLines = [
    { key: 'requests' as const, label: 'Total', color: '#0ea5e9', gradId: 'ov-grad-req' },
    { key: 'success' as const, label: 'Success', color: '#34d399', gradId: 'ov-grad-suc' },
    { key: 'errors' as const, label: 'Errors', color: '#f87171', gradId: 'ov-grad-err' },
  ];
  const activeLine = chartLines.find(l => l.key === activeChartLine)!;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 hover:shadow-xl hover:shadow-sky-400/10 dark:hover:shadow-sky-400/20 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
              <FiActivity className="text-base sm:text-lg text-sky-600 dark:text-sky-400" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Live
            </span>
          </div>
          <h3 className="text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Total Requests</h3>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
            {stats.totalRequests.toLocaleString()}
          </p>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => onNavigate('activity')}
              className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors group"
            >
              <span>View activity</span>
              <FiArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 hover:shadow-xl hover:shadow-purple-400/10 dark:hover:shadow-purple-400/20 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FiKey className="text-base sm:text-lg text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Active Keys</h3>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
            {stats.activeKeys}
          </p>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => onNavigate('keys')}
              className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors group"
            >
              <span>Manage keys</span>
              <FiArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 hover:shadow-xl hover:shadow-orange-400/10 dark:hover:shadow-orange-400/20 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <FiZap className="text-base sm:text-lg text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Rate Limit</h3>
          <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
            {stats.rateLimitUsage}%
          </p>
          <div className="mt-2 sm:mt-3">
            <div className="relative h-1.5 sm:h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.rateLimitUsage > 80
                    ? 'bg-gradient-to-r from-red-500 to-rose-500'
                    : stats.rateLimitUsage > 50
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500'
                }`}
                style={{ width: `${stats.rateLimitUsage}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="text-sky-500 dark:text-sky-400" />
              Usage Over Time
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Last {usageData.length} days activity
            </p>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 self-start sm:self-auto">
            {chartLines.map(line => (
              <button
                key={line.key}
                onClick={() => setActiveChartLine(line.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                  activeChartLine === line.key
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: line.color }} />
                {line.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Total', value: stats.totalRequests, color: 'text-sky-600 dark:text-sky-400' },
            { label: 'Success', value: stats.successCount, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Errors', value: stats.errorCount, color: 'text-red-500 dark:text-red-400' },
          ].map(item => (
            <div key={item.label} className="bg-zinc-50 dark:bg-zinc-900/60 rounded-xl p-2 sm:p-2.5 border border-zinc-100 dark:border-zinc-800">
              <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">{item.label}</p>
              <p className={`text-sm sm:text-base font-black tabular-nums ${item.color}`}>{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiTrendingUp className="text-xl sm:text-3xl text-zinc-400" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">No usage data available yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                {chartLines.map(line => (
                  <linearGradient key={line.gradId} id={line.gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-zinc-500 dark:text-zinc-400" />
              <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-zinc-500 dark:text-zinc-400" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: activeLine.color, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey={activeChartLine}
                stroke={activeLine.color}
                fillOpacity={1}
                fill={`url(#${activeLine.gradId})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: activeLine.color, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('keys')}
            className="group flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-all"
          >
            <div className="p-1.5 sm:p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <FiPlus className="text-sm sm:text-base text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Create API Key</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Generate a new key</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('activity')}
            className="group flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
          >
            <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <FiActivity className="text-sm sm:text-base text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">View Activity</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Check recent requests</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('models')}
            className="group flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all sm:col-span-2 lg:col-span-1"
          >
            <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <FiTrendingUp className="text-sm sm:text-base text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-left flex-1">
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Browse Models</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Explore AI models</p>
            </div>
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
