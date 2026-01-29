import { useState } from 'react';
import { FiActivity, FiZap, FiCheckCircle, FiAlertCircle, FiClock, FiTrendingUp, FiUsers, FiCpu, FiServer, FiRefreshCw } from 'react-icons/fi';

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

type User = {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
  plan_expires_at: string | null;
  is_admin: boolean;
  active_keys: number;
  created_at: string;
};

type MonitoringProps = {
  recentLogs: RequestLog[];
  users: User[];
  onRefresh: () => void;
  loading?: boolean;
  refreshing?: boolean;
};

export default function Monitoring({ recentLogs, users, onRefresh, loading, refreshing }: MonitoringProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');
  const [selectedModel, setSelectedModel] = useState<string>('all');

  const getTimeRangeMs = () => {
    if (timeRange === '1h') return 60 * 60 * 1000;
    if (timeRange === '6h') return 6 * 60 * 60 * 1000;
    return 24 * 60 * 60 * 1000;
  };

  const filteredLogs = recentLogs.filter(log => {
    const logTime = new Date(log.created_at).getTime();
    const cutoff = Date.now() - getTimeRangeMs();
    const matchesTime = logTime >= cutoff;
    const matchesModel = selectedModel === 'all' || log.model === selectedModel;
    return matchesTime && matchesModel;
  });

  const activeUsers = filteredLogs.reduce((acc, log) => {
    if (!acc.find(u => u.user_id === log.user_id)) {
      const user = users.find(u => u.user_id === log.user_id);
      if (user) {
        const userLogs = filteredLogs.filter(l => l.user_id === log.user_id);
        const lastActive = Math.max(...userLogs.map(l => new Date(l.created_at).getTime()));
        const mostUsedModel = userLogs.reduce((models, l) => {
          models[l.model] = (models[l.model] || 0) + 1;
          return models;
        }, {} as Record<string, number>);
        const topModel = Object.entries(mostUsedModel).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
        
        acc.push({
          ...user,
          requestCount: userLogs.length,
          totalTokens: userLogs.reduce((sum, l) => sum + (l.tokens_used || 0), 0),
          lastActive: new Date(lastActive),
          mostUsedModel: topModel,
        });
      }
    }
    return acc;
  }, [] as Array<User & { requestCount: number; totalTokens: number; lastActive: Date; mostUsedModel: string }>)
  .sort((a, b) => b.requestCount - a.requestCount)
  .slice(0, 10);

  const models = [...new Set(recentLogs.map(log => log.model))];
  const successCount = filteredLogs.filter(l => l.status >= 200 && l.status < 300).length;
  const errorCount = filteredLogs.filter(l => l.status >= 400).length;
  const successRate = filteredLogs.length > 0 ? Math.round((successCount / filteredLogs.length) * 100) : 0;
  const avgLatency = filteredLogs.filter(l => l.latency_ms).length > 0
    ? Math.round(filteredLogs.filter(l => l.latency_ms).reduce((sum, l) => sum + (l.latency_ms || 0), 0) / filteredLogs.filter(l => l.latency_ms).length)
    : 0;

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'enterprise') return 'from-violet-500 to-purple-600';
    if (plan === 'pro') return 'from-blue-500 to-indigo-600';
    return 'from-slate-400 to-slate-500';
  };

  const getPlanBadgeColor = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400';
    if (plan === 'pro') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTimeRange('1h')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              timeRange === '1h'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500'
            }`}
          >
            Last Hour
          </button>
          <button
            onClick={() => setTimeRange('6h')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              timeRange === '6h'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500'
            }`}
          >
            Last 6 Hours
          </button>
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              timeRange === '24h'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500'
            }`}
          >
            Last 24 Hours
          </button>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Models</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FiRefreshCw className={`text-sm sm:text-base ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiActivity className="text-blue-600 dark:text-blue-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">Total Requests</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{filteredLogs.length}</p>
          <div className="mt-1 flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${filteredLogs.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
            <p className="text-[9px] sm:text-[10px] text-blue-600 dark:text-blue-400">
              {filteredLogs.length > 0 ? 'Active' : 'Idle'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiCheckCircle className="text-green-600 dark:text-green-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">Success Rate</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">{successRate}%</p>
          <div className="mt-1 w-full h-1.5 bg-green-200 dark:bg-green-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiZap className="text-amber-600 dark:text-amber-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">Avg Latency</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-300">{avgLatency}ms</p>
          <p className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 mt-1">
            {avgLatency < 500 ? 'Excellent' : avgLatency < 1000 ? 'Good' : 'Fair'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiAlertCircle className="text-red-600 dark:text-red-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-red-600 dark:text-red-400">Errors</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-300">{errorCount}</p>
          <p className="text-[9px] sm:text-[10px] text-red-600 dark:text-red-400 mt-1">
            {errorCount === 0 ? 'All good!' : `${Math.round((errorCount / filteredLogs.length) * 100)}% of total`}
          </p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiUsers className="text-sky-600 dark:text-sky-400 text-lg sm:text-xl" />
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Active Users</h3>
          </div>
          <div className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
            <p className="text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-400">{activeUsers.length} online</p>
          </div>
        </div>

        {activeUsers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiUsers className="text-2xl sm:text-3xl text-slate-400" />
            </div>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">No active users in this time range</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {activeUsers.map((user, index) => (
              <div
                key={user.user_id}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-600 p-3 sm:p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg flex items-center justify-center text-slate-700 font-bold text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.email}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border-2 border-slate-200 dark:border-slate-600 shadow-lg flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${getPlanColor(user.plan)} rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg flex-shrink-0`}
                      style={{ display: user.avatar_url ? 'none' : 'flex' }}
                    >
                      {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <p className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm truncate">
                        {user.display_name || user.email}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${getPlanBadgeColor(user.plan)}`}>
                        {user.plan.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FiActivity className="text-[10px] sm:text-xs" />
                        <span className="font-medium text-slate-800 dark:text-white">{user.requestCount}</span>
                        <span>requests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiTrendingUp className="text-[10px] sm:text-xs" />
                        <span className="font-medium text-slate-800 dark:text-white">{user.totalTokens.toLocaleString()}</span>
                        <span>tokens</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiCpu className="text-[10px] sm:text-xs" />
                        <span className="truncate max-w-[100px] sm:max-w-none">{user.mostUsedModel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FiClock className="text-green-600 dark:text-green-400 text-[10px] sm:text-xs" />
                      <span className="text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-400">
                        {getTimeSince(user.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiServer className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h3>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiActivity className="text-2xl sm:text-3xl text-slate-400" />
            </div>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">No activity in this time range</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.slice(0, 10).map((log) => {
              const isSuccess = log.status >= 200 && log.status < 300;
              const isError = log.status >= 400;

              return (
                <div
                  key={log.id}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all ${
                    isSuccess
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : isError
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSuccess ? 'bg-green-500' : isError ? 'bg-red-500' : 'bg-slate-400'}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs">
                      <span className="font-mono font-semibold text-slate-800 dark:text-white truncate max-w-[120px] sm:max-w-none">
                        {log.model}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className={`font-medium ${isSuccess ? 'text-green-700 dark:text-green-400' : isError ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {log.status}
                      </span>
                      {log.latency_ms && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 dark:text-slate-400">{log.latency_ms}ms</span>
                        </>
                      )}
                      {log.tokens_used > 0 && (
                        <>
                          <span className="text-slate-400 hidden sm:inline">•</span>
                          <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">{log.tokens_used} tokens</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
                    {getTimeSince(new Date(log.created_at))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
