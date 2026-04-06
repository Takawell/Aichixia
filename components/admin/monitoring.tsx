import { useState, useEffect, useRef } from 'react';
import { FiActivity, FiZap, FiCheckCircle, FiAlertCircle, FiClock, FiTrendingUp, FiUsers, FiCpu, FiServer, FiRefreshCw, FiFilter, FiWifi } from 'react-icons/fi';

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

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 4)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function useStaggerMount(count: number, delayPerItem = 50, baseDelay = 200) {
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    setVisibleCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => setVisibleCount(i + 1), baseDelay + i * delayPerItem));
    }
    return () => timers.forEach(clearTimeout);
  }, [count, delayPerItem, baseDelay]);
  return visibleCount;
}

export default function Monitoring({ recentLogs, users, onRefresh, loading, refreshing }: MonitoringProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const getTimeRangeMs = () => {
    if (timeRange === '1h') return 60 * 60 * 1000;
    if (timeRange === '6h') return 6 * 60 * 60 * 1000;
    return 24 * 60 * 60 * 1000;
  };

  const filteredLogs = recentLogs.filter(log => {
    const logTime = new Date(log.created_at).getTime();
    const cutoff = Date.now() - getTimeRangeMs();
    return logTime >= cutoff && (selectedModel === 'all' || log.model === selectedModel);
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

  const animTotalReq = useCountUp(filteredLogs.length);
  const animSuccessRate = useCountUp(successRate);
  const animLatency = useCountUp(avgLatency);
  const animErrors = useCountUp(errorCount);
  const visibleUsers = useStaggerMount(activeUsers.length, 45, 350);
  const visibleLogs = useStaggerMount(Math.min(filteredLogs.length, 10), 30, 550);

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getPlanGradient = (plan: string) => {
    if (plan === 'enterprise') return 'from-violet-500 to-purple-600';
    if (plan === 'pro') return 'from-blue-500 to-indigo-600';
    return 'from-slate-400 to-slate-500';
  };

  const getPlanBadge = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800';
    if (plan === 'pro') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600';
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700" />
                <div className="h-2 w-16 bg-slate-100 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-700 rounded mb-2" />
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 gap-0.5 shadow-sm">
            {(['1h', '6h', '24h'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`relative px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                  timeRange === r
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {r === '1h' ? '1H' : r === '6h' ? '6H' : '24H'}
                {timeRange === r && (
                  <span className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" style={{ animationDuration: '2s' }} />
                )}
              </button>
            ))}
          </div>

          <div className="relative flex items-center group">
            <FiFilter className="absolute left-2.5 text-[10px] text-slate-400 dark:text-slate-500 pointer-events-none transition-colors group-focus-within:text-sky-500" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] sm:text-xs text-slate-700 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer font-semibold shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            >
              <option value="all">All Models</option>
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="group flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-300 text-xs disabled:opacity-50 active:scale-95 hover:-translate-y-0.5"
        >
          <FiRefreshCw className={`text-xs transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          {
            icon: FiActivity,
            label: 'Total Requests',
            value: animTotalReq,
            display: animTotalReq.toLocaleString(),
            lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
            darkBg: 'dark:from-blue-900/20 dark:to-indigo-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            color: 'text-blue-600 dark:text-blue-400',
            glow: 'bg-blue-400',
            delay: 0,
            sub: (
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${filteredLogs.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                  {filteredLogs.length > 0 ? 'Active' : 'Idle'}
                </span>
              </div>
            ),
          },
          {
            icon: FiCheckCircle,
            label: 'Success Rate',
            value: animSuccessRate,
            display: `${animSuccessRate}%`,
            lightBg: 'bg-gradient-to-br from-emerald-50 to-green-50',
            darkBg: 'dark:from-emerald-900/20 dark:to-green-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            color: 'text-emerald-600 dark:text-emerald-400',
            glow: 'bg-emerald-400',
            delay: 80,
            sub: (
              <div className="mt-1.5 h-1 bg-emerald-200 dark:bg-emerald-900/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${animSuccessRate}%` }}
                />
              </div>
            ),
          },
          {
            icon: FiZap,
            label: 'Avg Latency',
            value: animLatency,
            display: `${animLatency}ms`,
            lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
            darkBg: 'dark:from-amber-900/20 dark:to-orange-900/20',
            border: 'border-amber-200 dark:border-amber-800',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            color: 'text-amber-600 dark:text-amber-400',
            glow: 'bg-amber-400',
            delay: 160,
            sub: (
              <div className="mt-1 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${avgLatency < 500 ? 'bg-emerald-500' : avgLatency < 1000 ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                  {avgLatency < 500 ? 'Excellent' : avgLatency < 1000 ? 'Good' : 'Fair'}
                </span>
              </div>
            ),
          },
          {
            icon: FiAlertCircle,
            label: 'Errors',
            value: animErrors,
            display: animErrors.toLocaleString(),
            lightBg: 'bg-gradient-to-br from-red-50 to-rose-50',
            darkBg: 'dark:from-red-900/20 dark:to-rose-900/20',
            border: 'border-red-200 dark:border-red-800',
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            color: 'text-red-600 dark:text-red-400',
            glow: 'bg-red-400',
            delay: 240,
            sub: (
              <span className="text-[9px] font-semibold text-red-600 dark:text-red-400 mt-1 block">
                {errorCount === 0 ? 'All good!' : `${Math.round((errorCount / filteredLogs.length) * 100)}% of total`}
              </span>
            ),
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl border ${card.border} ${card.lightBg} ${card.darkBg} p-3 sm:p-4 transition-all duration-700 hover:-translate-y-1 hover:shadow-xl group cursor-default`}
              style={{
                transitionDelay: `${card.delay}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 dark:opacity-30 group-hover:opacity-40 transition-all duration-500 ${card.glow}`} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className={`p-1.5 rounded-xl ${card.iconBg}`}>
                    <Icon className={`text-xs sm:text-sm ${card.color}`} />
                  </div>
                  <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${card.color}`}>{card.label}</p>
                </div>
                <p className={`text-xl sm:text-2xl font-black tabular-nums leading-none ${card.color}`}>{card.display}</p>
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '320ms' }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
              <FiUsers className="text-sky-600 dark:text-sky-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Users</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Top by request volume</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl">
            <div className={`w-1.5 h-1.5 rounded-full ${activeUsers.length > 0 ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">{activeUsers.length} online</span>
          </div>
        </div>

        {activeUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center">
              <FiUsers className="text-2xl text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No active users in this time range</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeUsers.map((user, index) => (
              <div
                key={user.user_id}
                className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/50 rounded-xl hover:bg-white dark:hover:bg-slate-700/70 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md transition-all duration-300 group"
                style={{
                  opacity: visibleUsers > index ? 1 : 0,
                  transform: visibleUsers > index ? 'translateX(0)' : 'translateX(-12px)',
                  transition: 'opacity 400ms ease, transform 400ms cubic-bezier(0.22,1,0.36,1), background 200ms, border-color 200ms, box-shadow 200ms',
                }}
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 w-3.5 tabular-nums text-right">{index + 1}</span>
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || user.email}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-600 flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-8 h-8 bg-gradient-to-br ${getPlanGradient(user.plan)} rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
                    style={{ display: user.avatar_url ? 'none' : 'flex' }}
                  >
                    {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {user.display_name || user.email}
                    </p>
                    <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold ${getPlanBadge(user.plan)}`}>
                      {user.plan.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <FiActivity className="text-[9px] text-sky-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{user.requestCount}</span>
                      <span>req</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiTrendingUp className="text-[9px] text-violet-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{user.totalTokens.toLocaleString()}</span>
                      <span>tok</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <FiCpu className="text-[9px] text-amber-500" />
                      <span className="truncate max-w-[120px]">{user.mostUsedModel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <FiClock className="text-emerald-500 dark:text-emerald-400 text-[9px]" />
                    <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {getTimeSince(user.lastActive)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all duration-700"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '480ms' }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
              <FiServer className="text-violet-600 dark:text-violet-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Activity</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Latest {Math.min(filteredLogs.length, 10)} requests</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
            <FiWifi className={`text-[10px] text-violet-500 dark:text-violet-400 ${filteredLogs.length > 0 ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">{filteredLogs.length} logs</span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center">
              <FiActivity className="text-2xl text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No activity in this time range</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredLogs.slice(0, 10).map((log, i) => {
              const isSuccess = log.status >= 200 && log.status < 300;
              const isError = log.status >= 400;
              return (
                <div
                  key={log.id}
                  className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 hover:shadow-sm group ${
                    isSuccess
                      ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200/70 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700/60'
                      : isError
                      ? 'bg-red-50/60 dark:bg-red-900/10 border-red-200/70 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700/60'
                      : 'bg-slate-50/60 dark:bg-slate-700/20 border-slate-200/70 dark:border-slate-600/40 hover:bg-slate-50 dark:hover:bg-slate-700/40 hover:border-slate-300 dark:hover:border-slate-500/60'
                  }`}
                  style={{
                    opacity: visibleLogs > i ? 1 : 0,
                    transform: visibleLogs > i ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 350ms ease, transform 350ms cubic-bezier(0.22,1,0.36,1), background 200ms, border-color 200ms, box-shadow 200ms',
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-slate-400'}`} />
                    {(isSuccess || isError) && (
                      <div className={`absolute inset-0 rounded-full animate-ping opacity-50 ${isSuccess ? 'bg-emerald-400' : 'bg-red-400'}`}
                        style={{ animationDuration: '2s', animationDelay: `${i * 0.3}s` }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs">
                      <span className="font-mono font-bold text-slate-800 dark:text-white truncate max-w-[110px] sm:max-w-[180px] group-hover:max-w-none transition-all">
                        {log.model}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
                      <span className={`font-black tabular-nums px-1.5 py-0.5 rounded-md text-[9px] ${
                        isSuccess
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : isError
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {log.status}
                      </span>
                      {log.latency_ms && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
                          <span className="text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-0.5">
                            <FiZap className="text-[8px] text-amber-500" />
                            {log.latency_ms}ms
                          </span>
                        </>
                      )}
                      {log.tokens_used > 0 && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600 select-none hidden sm:inline">•</span>
                          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline tabular-nums">{log.tokens_used} tok</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 tabular-nums font-medium">
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
