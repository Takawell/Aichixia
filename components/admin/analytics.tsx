import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FiTrendingUp, FiActivity, FiZap, FiAlertCircle, FiLayers, FiCpu, FiUsers, FiBarChart2, FiClock, FiCheckCircle, FiXCircle, FiFilter, FiDownload, FiMaximize2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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

  const statCards = [
    {
      id: 'requests',
      icon: FiActivity,
      label: 'Total Requests',
      value: stats.totalRequests.toLocaleString(),
      color: 'sky',
      iconBg: 'bg-sky-500',
      textColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/50',
      borderColor: 'border-sky-200/50 dark:border-sky-800/50',
    },
    {
      id: 'tokens',
      icon: FiLayers,
      label: 'Total Tokens',
      value: `${(stats.totalTokens / 1000).toFixed(1)}K`,
      color: 'violet',
      iconBg: 'bg-violet-500',
      textColor: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/50',
      borderColor: 'border-violet-200/50 dark:border-violet-800/50',
    },
    {
      id: 'latency',
      icon: FiZap,
      label: 'Avg Latency',
      value: `${stats.avgLatency}ms`,
      color: 'emerald',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
    },
    {
      id: 'success',
      icon: FiCheckCircle,
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      color: 'cyan',
      iconBg: 'bg-cyan-500',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/50',
      borderColor: 'border-cyan-200/50 dark:border-cyan-800/50',
    }
  ];

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 animate-pulse">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -2 }}
              className={`${card.bgColor} rounded-lg border ${card.borderColor} p-3 sm:p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 ${card.iconBg} rounded-lg`}>
                  <Icon className="text-white text-sm sm:text-base" />
                </div>
              </div>

              <div>
                <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  {card.label}
                </p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 p-2 sm:p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-1.5 sm:gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTimeRange('7d')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              timeRange === '7d'
                ? 'bg-sky-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            7 Days
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTimeRange('30d')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              timeRange === '30d'
                ? 'bg-sky-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            30 Days
          </motion.button>
        </div>

        <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex gap-1.5 sm:gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setChartType('requests')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              chartType === 'requests'
                ? 'bg-violet-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Requests
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setChartType('tokens')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
              chartType === 'tokens'
                ? 'bg-violet-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            Tokens
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-sky-500 rounded-lg flex items-center justify-center">
              <FiBarChart2 className="text-white text-sm sm:text-base" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                Usage Trends
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                {chartType === 'requests' ? 'Requests' : 'Tokens'} over time
              </p>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              stroke="#71717a"
              tick={{ fontSize: 11, fill: '#71717a' }}
              tickLine={{ stroke: '#e4e4e7' }}
            />
            <YAxis 
              stroke="#71717a"
              tick={{ fontSize: 11, fill: '#71717a' }}
              tickLine={{ stroke: '#e4e4e7' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid #e4e4e7',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey={chartType}
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorGradient)"
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-violet-500 rounded-lg flex items-center justify-center">
              <FiCpu className="text-white text-sm sm:text-base" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Popular Models</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Top AI models</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" opacity={0.5} />
              <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11, fill: '#71717a' }} />
              <YAxis 
                dataKey="model" 
                type="category" 
                stroke="#71717a"
                tick={{ fontSize: 10, fill: '#71717a' }}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {modelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <FiUsers className="text-white text-sm sm:text-base" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Status Distribution</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Response breakdown</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <AnimatePresence>
        {errorData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-500 rounded-lg flex items-center justify-center">
                <FiAlertCircle className="text-white text-sm sm:text-base" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Top Errors</h3>
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Common issues</p>
              </div>
            </div>

            <div className="space-y-2">
              {errorData.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200/50 dark:border-red-800/50 transition-all"
                >
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 rounded-md flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {error.error}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-md">
                    <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">
                      {error.count}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
