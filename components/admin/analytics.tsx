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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
      gradient: 'from-blue-500 via-sky-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-300',
      trend: '+12%',
      trendUp: true
    },
    {
      id: 'tokens',
      icon: FiLayers,
      label: 'Total Tokens',
      value: `${(stats.totalTokens / 1000).toFixed(1)}K`,
      gradient: 'from-purple-500 via-violet-500 to-indigo-500',
      bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-800 dark:text-purple-300',
      trend: '+8%',
      trendUp: true
    },
    {
      id: 'latency',
      icon: FiZap,
      label: 'Avg Latency',
      value: `${stats.avgLatency}ms`,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-800 dark:text-emerald-300',
      trend: '-3%',
      trendUp: false
    },
    {
      id: 'success',
      icon: FiCheckCircle,
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      gradient: 'from-cyan-500 via-sky-500 to-blue-500',
      bgGradient: 'from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      textColor: 'text-cyan-800 dark:text-cyan-300',
      trend: '+2%',
      trendUp: true
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/50 to-transparent dark:from-zinc-800/50 animate-pulse" />
              <div className="relative space-y-3">
                <div className="h-8 sm:h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
                <div className="h-6 sm:h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg w-2/3 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8"
        >
          <div className="h-80 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const isHovered = hoveredCard === card.id;
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              onHoverStart={() => setHoveredCard(card.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.gradient} rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />
              
              <div className={`relative bg-gradient-to-br ${card.bgGradient} backdrop-blur-xl rounded-xl sm:rounded-2xl border ${card.borderColor} p-4 sm:p-5 transition-all duration-300 ${isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 rounded-full blur-2xl -z-10" />
                
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
                    <Icon className="text-white text-base sm:text-lg" />
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                      card.trendUp 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    <FiTrendingUp className={`w-3 h-3 ${!card.trendUp && 'rotate-180'}`} />
                    {card.trend}
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <p className={`text-[10px] sm:text-xs font-semibold ${card.iconColor} uppercase tracking-wide`}>
                    {card.label}
                  </p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`text-2xl sm:text-3xl lg:text-4xl font-black ${card.textColor}`}
                  >
                    {card.value}
                  </motion.p>
                </div>

                <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
                  <Icon className="w-full h-full" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <FiFilter className="text-zinc-500 dark:text-zinc-400 w-4 h-4" />
          <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Time Range:</span>
        </div>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTimeRange('7d')}
            className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
              timeRange === '7d'
                ? 'text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-sky-500 dark:hover:border-sky-500'
            }`}
          >
            {timeRange === '7d' && (
              <motion.div
                layoutId="timeRangeBg"
                className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg sm:rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">Last 7 Days</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTimeRange('30d')}
            className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
              timeRange === '30d'
                ? 'text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-sky-500 dark:hover:border-sky-500'
            }`}
          >
            {timeRange === '30d' && (
              <motion.div
                layoutId="timeRangeBg"
                className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg sm:rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">Last 30 Days</span>
          </motion.button>
        </div>

        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 hidden sm:block" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <FiBarChart2 className="text-zinc-500 dark:text-zinc-400 w-4 h-4" />
          <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Chart Type:</span>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType('requests')}
            className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
              chartType === 'requests'
                ? 'text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500'
            }`}
          >
            {chartType === 'requests' && (
              <motion.div
                layoutId="chartTypeBg"
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg sm:rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <FiActivity className="w-3 h-3" />
              Requests
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType('tokens')}
            className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
              chartType === 'tokens'
                ? 'text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-500'
            }`}
          >
            {chartType === 'tokens' && (
              <motion.div
                layoutId="chartTypeBg"
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg sm:rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <FiLayers className="w-3 h-3" />
              Tokens (K)
            </span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative group"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
        
        <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 lg:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-5 sm:mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiBarChart2 className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-black text-zinc-900 dark:text-white">
                  Usage Trends
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  {chartType === 'requests' ? 'API Requests' : 'Token Consumption'} Over Time
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-all text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </motion.button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-zinc-900/50 pointer-events-none rounded-lg" />
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
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
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ fontWeight: 700, color: '#18181b', marginBottom: '8px' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px', fontWeight: 600, paddingTop: '20px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey={chartType}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6', shadow: '0 0 0 4px rgba(59,130,246,0.2)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
          
          <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiCpu className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">Popular Models</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">Most used AI models</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={modelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" opacity={0.5} />
                <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis 
                  dataKey="model" 
                  type="category" 
                  stroke="#71717a"
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ fontWeight: 700, color: '#18181b', marginBottom: '8px' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {modelData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
          
          <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiUsers className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">Status Distribution</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">Response status breakdown</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
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
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ fontWeight: 700, color: '#18181b', marginBottom: '8px' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {errorData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />
            
            <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiAlertCircle className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">Top Errors</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">Most common error messages</p>
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {errorData.map((error, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="group/item relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl opacity-0 group-hover/item:opacity-100 blur transition-all duration-300" />
                    
                    <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 transition-all duration-300">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate mb-0.5">
                          {error.error}
                        </p>
                        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          Error occurrence
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 dark:bg-red-900/30 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800">
                          <p className="text-sm sm:text-base font-black text-red-700 dark:text-red-400">
                            {error.count}
                          </p>
                        </div>
                        <FiXCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 dark:text-red-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
