import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiActivity, FiZap, FiAlertCircle, FiLayers, FiCpu, FiUsers, FiBarChart2 } from 'react-icons/fi';

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

type RequestLog = {
  id: string;
  api_key_id: string;
  user_id: string;
  model: string;
  endpoint: string;
  status: number;
  latency_ms: number | null;
  tokens_used: number;
  error_message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type AnalyticsProps = {
  dailyUsage: DailyUsage[];
  requestLogs: RequestLog[];
  loading?: boolean;
};

export default function Analytics({ dailyUsage, requestLogs, loading }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'requests' | 'tokens'>('requests');

  const chartData = dailyUsage
    .slice(-parseInt(timeRange))
    .map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: day.requests_count,
      tokens: Math.round(day.tokens_used / 1000),
      success: day.success_count,
      errors: day.error_count,
    }));

  const modelUsage = requestLogs
    .reduce((acc, log) => {
      const model = log.model;
      if (!acc[model]) {
        acc[model] = { model, count: 0, tokens: 0 };
      }
      acc[model].count += 1;
      acc[model].tokens += log.tokens_used || 0;
      return acc;
    }, {} as Record<string, { model: string; count: number; tokens: number }>);

  const modelData = Object.values(modelUsage)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const errorAnalysis = requestLogs
    .filter(log => log.status >= 400)
    .reduce((acc, log) => {
      const error = log.error_message || 'Unknown Error';
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const errorData = Object.entries(errorAnalysis)
    .map(([error, count]) => ({ error: error.substring(0, 30), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const statusDistribution = [
    { name: 'Success', value: requestLogs.filter(l => l.status >= 200 && l.status < 300).length, color: '#10b981' },
    { name: 'Client Error', value: requestLogs.filter(l => l.status >= 400 && l.status < 500).length, color: '#f59e0b' },
    { name: 'Server Error', value: requestLogs.filter(l => l.status >= 500).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const stats = {
    totalRequests: requestLogs.length,
    totalTokens: requestLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0),
    avgLatency: requestLogs.filter(l => l.latency_ms).length > 0
      ? Math.round(requestLogs.filter(l => l.latency_ms).reduce((sum, l) => sum + (l.latency_ms || 0), 0) / requestLogs.filter(l => l.latency_ms).length)
      : 0,
    successRate: requestLogs.length > 0
      ? Math.round((requestLogs.filter(l => l.status >= 200 && l.status < 300).length / requestLogs.length) * 100)
      : 0,
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#a855f7'];
  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiActivity className="text-blue-600 dark:text-blue-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">Total Requests</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{stats.totalRequests.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiLayers className="text-purple-600 dark:text-purple-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">Total Tokens</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-300">{(stats.totalTokens / 1000).toFixed(1)}K</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiZap className="text-green-600 dark:text-green-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">Avg Latency</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">{stats.avgLatency}ms</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 rounded-lg sm:rounded-xl border border-cyan-200 dark:border-cyan-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiTrendingUp className="text-cyan-600 dark:text-cyan-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-cyan-600 dark:text-cyan-400">Success Rate</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-800 dark:text-cyan-300">{stats.successRate}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
            timeRange === '7d'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
            timeRange === '30d'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500'
          }`}
        >
          Last 30 Days
        </button>

        <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        <button
          onClick={() => setChartType('requests')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
            chartType === 'requests'
              ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-500'
          }`}
        >
          Requests
        </button>
        <button
          onClick={() => setChartType('tokens')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
            chartType === 'tokens'
              ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-500'
          }`}
        >
          Tokens (K)
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <FiBarChart2 className="text-sky-600 dark:text-sky-400 text-lg sm:text-xl" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
            Usage Trends ({chartType === 'requests' ? 'Requests' : 'Tokens'})
          </h3>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey={chartType} 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <FiCpu className="text-violet-600 dark:text-violet-400 text-lg sm:text-xl" />
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Popular Models</h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="model" 
                type="category" 
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {modelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <FiUsers className="text-green-600 dark:text-green-400 text-lg sm:text-xl" />
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Status Distribution</h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {errorData.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertCircle className="text-red-600 dark:text-red-400 text-lg sm:text-xl" />
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Top Errors</h3>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {errorData.map((error, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                    {error.error}
                  </p>
                </div>
                <div className="flex-shrink-0 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">
                    {error.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
