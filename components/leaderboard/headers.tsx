import { motion } from 'framer-motion';
import { FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { GiPodium } from 'react-icons/gi';
import ThemeToggle from '@/components/ThemeToggle';

type LeaderboardHeaderProps = {
  onRefresh: () => void;
  refreshing: boolean;
  timeRange: 'daily' | 'weekly' | 'monthly' | 'all';
  onTimeRangeChange: (range: 'daily' | 'weekly' | 'monthly' | 'all') => void;
  lastUpdated?: string;
};

export default function LeaderboardHeader({
  onRefresh,
  refreshing,
  timeRange,
  onTimeRangeChange,
  lastUpdated
}: LeaderboardHeaderProps) {
  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <GiPodium className="text-white text-xl sm:text-2xl" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Leaderboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Top performers and model statistics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial justify-center"
            >
              <FiRefreshCw className={`text-sm sm:text-base ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTimeRangeChange('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                timeRange === 'daily'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <FiTrendingUp className="text-xs sm:text-sm" />
              <span>Daily</span>
            </button>

            <button
              onClick={() => onTimeRangeChange('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                timeRange === 'weekly'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <FiTrendingUp className="text-xs sm:text-sm" />
              <span>Weekly</span>
            </button>

            <button
              onClick={() => onTimeRangeChange('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                timeRange === 'monthly'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <FiTrendingUp className="text-xs sm:text-sm" />
              <span>Monthly</span>
            </button>

            <button
              onClick={() => onTimeRangeChange('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                timeRange === 'all'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <FiTrendingUp className="text-xs sm:text-sm" />
              <span>All Time</span>
            </button>
          </div>

          {lastUpdated && (
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                Updated {formatLastUpdated(lastUpdated)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
