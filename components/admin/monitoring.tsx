import { useState, useEffect, useRef } from 'react';
import { FiActivity, FiZap, FiCheckCircle, FiAlertCircle, FiClock, FiTrendingUp, FiUsers, FiCpu, FiServer, FiRefreshCw, FiFilter } from 'react-icons/fi';

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

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  format?: (v: number) => string;
  sub?: React.ReactNode;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  lightColor: string;
  darkColor: string;
  glowClass: string;
  delay: number;
};

function StatCard({ icon: Icon, label, value, format, sub, lightBg, darkBg, lightBorder, darkBorder, lightColor, darkColor, glowClass, delay }: StatCardProps) {
  const animated = useCountUp(value);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`relative overflow-hidden rounded-xl border ${lightBorder} ${darkBorder} ${lightBg} ${darkBg} p-3 sm:p-4 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} hover:-translate-y-0.5 hover:shadow-lg group cursor-default`}>
      <div className={`absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-15 dark:opacity-25 group-hover:opacity-30 transition-opacity duration-500 ${glowClass}`} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`text-sm ${lightColor} ${darkColor}`} />
          <p className={`text-[10px] font-semibold uppercase tracking-widest ${lightColor} ${darkColor}`}>{label}</p>
        </div>
        <p className={`text-xl sm:text-2xl font-black tabular-nums ${lightColor} ${darkColor}`}>
          {format ? format(animated) : animated.toLocaleString()}
        </p>
        {sub && <div className="mt-1.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function Monitoring({ recentLogs, users, onRefresh, loading, refreshing }: MonitoringProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
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
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getPlanColor = (plan: string) => {
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
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 gap-1">
            {(['1h', '6h', '24h'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-200 ${
                  timeRange === r
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {r === '1h' ? '1H' : r === '6h' ? '6H' : '24H'}
              </button>
            ))}
          </div>

          <div className="relative flex items-center">
            <FiFilter className="absolute left-2.5 text-slate-400 dark:text-slate-500 text-xs pointer-events-none" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] sm:text-xs text-slate-700 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer font-semibold"
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
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 transition-all text-xs disabled:opacity-50 active:scale-95"
        >
          <FiRefreshCw className={`text-xs ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          icon={FiActivity}
          label="Total Requests"
          value={filteredLogs.length}
          lightBg="bg-blue-50" darkBg="dark:bg-blue-900/20"
          lightBorder="border-blue-200" darkBorder="dark:border-blue-800"
          lightColor="text-blue-600" darkColor="dark:text-blue-400"
          glowClass="bg-blue-500"
          delay={0}
          sub={
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${filteredLogs.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                {filteredLogs.length > 0 ? 'Active' : 'Idle'}
              </span>
            </div>
          }
        />
        <StatCard
          icon={FiCheckCircle}
          label="Success Rate"
          value={successRate}
          format={(v) => `${v}%`}
          lightBg="bg-emerald-50" darkBg="dark:bg-emerald-900/20"
          lightBorder="border-emerald-200" darkBorder="dark:border-emerald-800"
          lightColor="text-emerald-600" darkColor="dark:text-emerald-400"
          glowClass="bg-emerald-500"
          delay={80}
          sub={
            <div className="h-1 bg-emerald-200 dark:bg-emerald-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-700" style={{ width: `${successRate}%` }} />
            </div>
          }
        />
        <StatCard
          icon={FiZap}
          label="Avg Latency"
          value={avgLatency}
          format={(v) => `${v}ms`}
          lightBg="bg-amber-50" darkBg="dark:bg-amber-900/20"
          lightBorder="border-amber-200" darkBorder="dark:border-amber-800"
          lightColor="text-amber-600" darkColor="dark:text-amber-400"
          glowClass="bg-amber-500"
          delay={160}
          sub={
            <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
              {avgLatency < 500 ? 'Excellent' : avgLatency < 1000 ? 'Good' : 'Fair'}
            </span>
          }
        />
        <StatCard
          icon={FiAlertCircle}
          label="Errors"
          value={errorCount}
          lightBg="bg-red-50" darkBg="dark:bg-red-900/20"
          lightBorder="border-red-200" darkBorder="dark:border-red-800"
          lightColor="text-red-600" darkColor="dark:text-red-400"
          glowClass="bg-red-500"
          delay={240}
          sub={
            <span className="text-[9px] font-semibold text-red-600 dark:text-red-400">
              {errorCount === 0 ? 'All good!' : `${Math.round((errorCount / filteredLogs.length) * 100)}% of total`}
            </span>
          }
        />
      </div>

      <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                <FiUsers className="text-sky-600 dark:text-sky-400 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Active Users</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Top by request count</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
              <div className={`w-1.5 h-1.5 rounded-full ${activeUsers.length > 0 ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">{activeUsers.length} online</span>
            </div>
          </div>

          {activeUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center">
                <FiUsers className="text-xl text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">No active users in this time range</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeUsers.map((user, index) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/50 rounded-xl hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm transition-all duration-200 group"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 w-3 tabular-nums">{index + 1}</span>
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.email}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-600 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-8 h-8 bg-gradient-to-br ${getPlanColor(user.plan)} rounded-lg flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0`}
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
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getPlanBadge(user.plan)}`}>
                        {user.plan.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FiActivity className="text-[9px]" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{user.requestCount}</span>
                        <span>req</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiTrendingUp className="text-[9px]" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{user.totalTokens.toLocaleString()}</span>
                        <span>tok</span>
                      </div>
                      <div className="flex items-center gap-1 hidden sm:flex">
                        <FiCpu className="text-[9px]" />
                        <span className="truncate max-w-[100px]">{user.mostUsedModel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <FiClock className="text-emerald-600 dark:text-emerald-400 text-[9px]" />
                      <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {getTimeSince(user.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <FiServer className="text-violet-600 dark:text-violet-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Activity</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Latest {Math.min(filteredLogs.length, 10)} requests</p>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center">
                <FiActivity className="text-xl text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">No activity in this time range</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredLogs.slice(0, 10).map((log, i) => {
                const isSuccess = log.status >= 200 && log.status < 300;
                const isError = log.status >= 400;
                return (
                  <div
                    key={log.id}
                    className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-xl border transition-all duration-200 hover:shadow-sm group ${
                      isSuccess
                        ? 'bg-emerald-50/70 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                        : isError
                        ? 'bg-red-50/70 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700'
                        : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600/50 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSuccess ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-slate-400'}`} />

                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs">
                      <span className="font-mono font-bold text-slate-800 dark:text-white truncate max-w-[100px] sm:max-w-[160px]">
                        {log.model}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className={`font-bold tabular-nums ${isSuccess ? 'text-emerald-600 dark:text-emerald-400' : isError ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {log.status}
                      </span>
                      {log.latency_ms && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-slate-500 dark:text-slate-400 tabular-nums">{log.latency_ms}ms</span>
                        </>
                      )}
                      {log.tokens_used > 0 && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline tabular-nums">{log.tokens_used} tok</span>
                        </>
                      )}
                    </div>

                    <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 tabular-nums">
                      {getTimeSince(new Date(log.created_at))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
