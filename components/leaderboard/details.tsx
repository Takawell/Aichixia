import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiTrendingUp, FiZap, FiCheckCircle, FiClock, FiUsers } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiDigikeyelectronics, SiAirbrake, SiMaze, SiXiaomi, SiFlux, SiImagedotsc, SiSecurityscorecard, SiLapce } from 'react-icons/si';
import { GiSpermWhale, GiPowerLightning, GiClover, GiFire } from 'react-icons/gi';
import { TbSquareLetterZ, TbLetterM } from 'react-icons/tb';
import { FaXTwitter } from 'react-icons/fa6';
import { HiSpeakerWave } from 'react-icons/hi2';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';

type ModelDetailStats = {
  model: {
    model_id: string;
    model_name: string;
    total_requests: number;
    total_tokens: number;
    success_rate: number;
    avg_latency: number;
  };
  dailyTrends: Array<{ date: string; requests: number; tokens: number }>;
  topUsers: Array<{
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    plan: string;
    requests: number;
    tokens: number;
  }>;
  peakHours: Array<{ hour: number; requests: number }>;
};

type ModelDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  modelStats: ModelDetailStats | null;
  loading?: boolean;
  timeRange: string;
  onTimeRangeChange: (range: 'daily' | 'weekly' | 'monthly') => void;
};

const MODEL_CONFIGS: Record<string, { icon: any; color: string }> = {
  'aichixia-thinking': { icon: SiAirbrake, color: 'from-blue-600 via-blue-800 to-slate-900' },
  'deepseek-v3.2': { icon: GiSpermWhale, color: 'from-cyan-600 to-blue-600' },
  'deepseek-v3.1': { icon: GiSpermWhale, color: 'from-cyan-600 to-teal-600' },
  'gpt-5-mini': { icon: SiOpenai, color: 'from-emerald-600 to-green-600' },
  'claude-opus-4.5': { icon: SiAnthropic, color: 'from-orange-600 to-amber-700' },
  'gemini-3-flash': { icon: SiGooglegemini, color: 'from-indigo-600 to-purple-600' },
  'kimi-k2': { icon: SiDigikeyelectronics, color: 'from-blue-600 to-cyan-600' },
  'glm-4.7': { icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-900' },
  'mistral-3.1': { icon: TbLetterM, color: 'from-orange-600 to-amber-600' },
  'qwen3-235b': { icon: SiAlibabacloud, color: 'from-purple-500 to-pink-500' },
  'qwen3-coder-480b': { icon: SiAlibabacloud, color: 'from-purple-600 to-fuchsia-600' },
  'minimax-m2.1': { icon: SiMaze, color: 'from-cyan-600 to-blue-600' },
  'llama-3.3-70b': { icon: SiMeta, color: 'from-blue-600 to-indigo-700' },
  'gpt-oss-120b': { icon: SiOpenai, color: 'from-pink-600 to-rose-600' },
  'mimo-v2-flash': { icon: SiXiaomi, color: 'from-blue-600 to-purple-600' },
  'groq-compound': { icon: GiPowerLightning, color: 'from-orange-600 to-red-600' },
  'cohere-command-a': { icon: GiClover, color: 'from-emerald-600 to-teal-600' },
  'grok-3': { icon: FaXTwitter, color: 'from-slate-600 to-zinc-800' },
  'flux-2': { icon: SiFlux, color: 'from-purple-500 to-pink-500' },
  'lucid-origin': { icon: SiImagedotsc, color: 'from-red-500 to-orange-500' },
  'phoenix-1.0': { icon: GiFire, color: 'from-red-500 to-orange-500' },
  'nano-banana-pro': { icon: SiGooglegemini, color: 'from-yellow-400 to-orange-400' },
  'starling-tts': { icon: SiSecurityscorecard, color: 'from-violet-500 to-purple-500' },
  'lindsay-tts': { icon: SiLapce, color: 'from-rose-500 to-pink-500' },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

export default function ModelDetailModal({
  isOpen,
  onClose,
  modelStats,
  loading,
  timeRange,
  onTimeRangeChange
}: ModelDetailModalProps) {
  if (!isOpen) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
    if (plan === 'pro') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
  };

  const getPlanIcon = (plan: string) => {
    if (plan === 'enterprise') return RiVipCrownLine;
    if (plan === 'pro') return RiVipDiamondLine;
    return null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  const config = modelStats ? MODEL_CONFIGS[modelStats.model.model_id] || { icon: FiActivity, color: 'from-slate-500 to-slate-600' } : null;
  const Icon = config?.icon || FiActivity;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-4xl shadow-2xl my-8"
        >
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {config && (
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${config.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white text-lg sm:text-xl" />
                  </div>
                )}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                    {modelStats?.model.model_name || 'Loading...'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Detailed Statistics</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              </div>
            ) : modelStats ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <FiActivity className="text-blue-600 dark:text-blue-400 text-sm" />
                      <p className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">Total Requests</p>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-300">
                      {formatNumber(modelStats.model.total_requests)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <FiTrendingUp className="text-purple-600 dark:text-purple-400 text-sm" />
                      <p className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">Total Tokens</p>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-purple-800 dark:text-purple-300">
                      {formatNumber(modelStats.model.total_tokens)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <FiCheckCircle className="text-green-600 dark:text-green-400 text-sm" />
                      <p className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">Success Rate</p>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-300">
                      {modelStats.model.success_rate.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800 p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <FiZap className="text-amber-600 dark:text-amber-400 text-sm" />
                      <p className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">Avg Latency</p>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-amber-800 dark:text-amber-300">
                      {modelStats.model.avg_latency}ms
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <FiTrendingUp className="text-sky-500" />
                      Usage Trends
                    </h3>
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'monthly'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => onTimeRangeChange(range)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            timeRange === range
                              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {modelStats.dailyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={modelStats.dailyTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          stroke="#94a3b8"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          labelFormatter={formatDate}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="requests" 
                          stroke="#0ea5e9" 
                          strokeWidth={2}
                          dot={{ fill: '#0ea5e9', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                      No trend data available
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <FiUsers className="text-purple-500" />
                      Top Users
                    </h3>
                    
                    {modelStats.topUsers.length > 0 ? (
                      <div className="space-y-2 sm:space-y-2.5">
                        {modelStats.topUsers.map((user, index) => {
                          const PlanIcon = getPlanIcon(user.plan);
                          
                          return (
                            <div
                              key={user.user_id}
                              className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                            >
                              <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs">
                                {index + 1}
                              </div>

                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.display_name || 'User'}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border-2 border-slate-200 dark:border-slate-600"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                                style={{ display: user.avatar_url ? 'none' : 'flex' }}
                              >
                                {user.display_name?.[0]?.toUpperCase() || 'U'}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate">
                                    {user.display_name || 'Anonymous'}
                                  </p>
                                  <span className={`px-1.5 py-0.5 rounded border text-[8px] sm:text-[9px] font-bold flex-shrink-0 ${getPlanColor(user.plan)} flex items-center gap-0.5`}>
                                    {PlanIcon && <PlanIcon className="text-[10px]" />}
                                    {user.plan.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                  {user.requests.toLocaleString()} requests
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No users yet</p>
                    )}
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <FiClock className="text-amber-500" />
                      Peak Hours
                    </h3>
                    
                    {modelStats.peakHours.length > 0 ? (
                      <div className="space-y-2 sm:space-y-2.5">
                        {modelStats.peakHours.map((peak, index) => (
                          <div
                            key={peak.hour}
                            className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
                                {formatHour(peak.hour)}
                              </p>
                              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                {peak.requests.toLocaleString()} requests
                              </p>
                            </div>
                            <div className="flex-shrink-0 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400">
                              Peak
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No peak hour data</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
