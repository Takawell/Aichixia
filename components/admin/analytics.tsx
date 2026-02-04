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
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 animate-pulse">
              <div className="h-6 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
              <div className="h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 animate-pulse">
          <div className="h-48 sm:h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30 p-3 sm:p-4 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <FiActivity className="text-white text-xs sm:text-sm" />
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-blue-400">Total Requests</p>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-900 dark:text-blue-300">{stats.totalRequests.toLocaleString()}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-purple-50/80 to-violet-50/60 dark:from-purple-950/40 dark:via-purple-900/30 dark:to-violet-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/30 p-3 sm:p-4 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <FiLayers className="text-white text-xs sm:text-sm" />
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-purple-700 dark:text-purple-400">Total Tokens</p>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-900 dark:text-purple-300">{(stats.totalTokens / 1000).toFixed(1)}K</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 via-green-50/80 to-emerald-50/60 dark:from-green-950/40 dark:via-green-900/30 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/30 p-3 sm:p-4 hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-green-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <FiZap className="text-white text-xs sm:text-sm" />
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-green-700 dark:text-green-400">Avg Latency</p>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-green-900 dark:text-green-300">{stats.avgLatency}ms</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 via-cyan-50/80 to-sky-50/60 dark:from-cyan-950/40 dark:via-cyan-900/30 dark:to-sky-950/20 rounded-xl border border-cyan-200/50 dark:border-cyan-800/30 p-3 sm:p-4 hover:shadow-lg hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <FiTrendingUp className="text-white text-xs sm:text-sm" />
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-cyan-700 dark:text-cyan-400">Success Rate</p>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-900 dark:text-cyan-300">{stats.successRate}%</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
              timeRange === '7d'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-105'
                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400'
            }`}
          >
            {timeRange === '7d' && (
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            )}
            <span className="relative">Last 7 Days</span>
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
              timeRange === '30d'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-105'
                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400'
            }`}
          >
            {timeRange === '30d' && (
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            )}
            <span className="relative">Last 30 Days</span>
          </button>
        </div>

        <div className="w-px bg-slate-200 dark:bg-slate-700 my-1" />

        <div className="flex gap-2">
          <button
            onClick={() => setChartType('requests')}
            className={`group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
              chartType === 'requests'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            {chartType === 'requests' && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            )}
            <span className="relative">Requests</span>
          </button>
          <button
            onClick={() => setChartType('tokens')}
            className={`group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 ${
              chartType === 'tokens'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            {chartType === 'tokens' && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            )}
            <span className="relative">Tokens (K)</span>
          </button>
        </div>
      </div>

      <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/5 to-transparent rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiBarChart2 className="text-white text-sm sm:text-base" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              Usage Trends ({chartType === 'requests' ? 'Requests' : 'Tokens'})
            </h3>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Line 
                type="monotone" 
                dataKey={chartType} 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                fill="url(#colorGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/5 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiCpu className="text-white text-sm sm:text-base" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Popular Models</h3>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.5} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis 
                  dataKey="model" 
                  type="category" 
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  width={100}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {modelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/5 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiUsers className="text-white text-sm sm:text-base" />
              </div>
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
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {errorData.length > 0 && (
        <div className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/5 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiAlertCircle className="text-white text-sm sm:text-base" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Top Errors</h3>
            </div>

            <div className="space-y-2">
              {errorData.map((error, index) => (
                <div
                  key={index}
                  className="group/item relative overflow-hidden flex items-center gap-3 p-3 bg-gradient-to-br from-red-50 via-red-50/80 to-rose-50/60 dark:from-red-950/30 dark:via-red-900/20 dark:to-rose-950/10 rounded-xl border border-red-200/50 dark:border-red-800/30 hover:shadow-md hover:shadow-red-500/10 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-400/10 to-transparent rounded-full blur-xl" />
                  <div className="relative flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md group-hover/item:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {error.error}
                    </p>
                  </div>
                  <div className="relative flex-shrink-0 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800/50">
                    <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">
                      {error.count}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
