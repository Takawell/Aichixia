import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiActivity, FiZap, FiAlertCircle, FiCpu, FiCheckCircle } from 'react-icons/fi';

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

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    ref.current = 0;
    setValue(0);
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
};

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  lightIcon: string;
  darkIcon: string;
  glowClass: string;
  delay: number;
  format?: (v: number) => string;
};

function StatCard({ icon: Icon, label, value, color, lightBg, darkBg, lightBorder, darkBorder, lightIcon, darkIcon, glowClass, delay, format }: StatCardProps) {
  const animated = useCountUp(value);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${lightBorder} ${darkBorder} ${lightBg} ${darkBg} p-3 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} hover:-translate-y-0.5 hover:shadow-lg group cursor-default`}
    >
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-10 dark:opacity-20 group-hover:opacity-25 dark:group-hover:opacity-35 transition-opacity duration-500 ${glowClass}`} />
      <div className="relative z-10 flex items-center gap-3">
        <div className={`p-1.5 rounded-lg border ${lightBorder} ${darkBorder} ${lightBg} ${darkBg} flex-shrink-0`}>
          <Icon className={`text-xs ${lightIcon} ${darkIcon}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{label}</p>
          <p className={`text-base sm:text-lg font-black tabular-nums leading-tight ${color}`}>
            {format ? format(animated) : animated.toLocaleString()}
          </p>
        </div>
        <div className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${glowClass} animate-pulse`} />
      </div>
    </div>
  );
}

export default function Analytics({ dailyUsage, requestLogs, loading }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'requests' | 'tokens'>('requests');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const days = timeRange === '7d' ? 7 : 30;
  const chartData = dailyUsage
    .slice(-days)
    .map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: day.requests_count,
      tokens: Math.round(day.tokens_used / 1000),
      success: day.success_count,
      errors: day.error_count,
    }));

  const modelUsage = requestLogs.reduce((acc, log) => {
    if (!acc[log.model]) acc[log.model] = { model: log.model, count: 0, tokens: 0 };
    acc[log.model].count += 1;
    acc[log.model].tokens += log.tokens_used || 0;
    return acc;
  }, {} as Record<string, { model: string; count: number; tokens: number }>);

  const modelData = Object.values(modelUsage).sort((a, b) => b.count - a.count).slice(0, 6);

  const errorAnalysis = requestLogs
    .filter(log => log.status >= 400)
    .reduce((acc, log) => {
      const e = log.error_message || 'Unknown Error';
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const errorData = Object.entries(errorAnalysis)
    .map(([error, count]) => ({ error: error.substring(0, 40), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const statusDistribution = [
    { name: 'Success', value: requestLogs.filter(l => l.status >= 200 && l.status < 300).length, color: '#10b981' },
    { name: 'Client Err', value: requestLogs.filter(l => l.status >= 400 && l.status < 500).length, color: '#f59e0b' },
    { name: 'Server Err', value: requestLogs.filter(l => l.status >= 500).length, color: '#ef4444' },
  ].filter(i => i.value > 0);

  const stats = {
    totalRequests: requestLogs.length,
    totalTokens: requestLogs.reduce((sum, l) => sum + (l.tokens_used || 0), 0),
    avgLatency: requestLogs.filter(l => l.latency_ms).length > 0
      ? Math.round(requestLogs.filter(l => l.latency_ms).reduce((s, l) => s + (l.latency_ms || 0), 0) / requestLogs.filter(l => l.latency_ms).length)
      : 0,
    successRate: requestLogs.length > 0
      ? Math.round((requestLogs.filter(l => l.status >= 200 && l.status < 300).length / requestLogs.length) * 100)
      : 0,
  };

  const MODEL_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 animate-pulse h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard
          icon={FiActivity}
          label="Total Requests"
          color="text-sky-600 dark:text-sky-400"
          lightIcon="text-sky-600"
          darkIcon="dark:text-sky-400"
          lightBg="bg-sky-50"
          darkBg="dark:bg-sky-900/20"
          lightBorder="border-sky-200"
          darkBorder="dark:border-sky-800"
          glowClass="bg-sky-500"
          value={stats.totalRequests}
          delay={0}
        />
        <StatCard
          icon={FiCpu}
          label="Total Tokens"
          color="text-violet-600 dark:text-violet-400"
          lightIcon="text-violet-600"
          darkIcon="dark:text-violet-400"
          lightBg="bg-violet-50"
          darkBg="dark:bg-violet-900/20"
          lightBorder="border-violet-200"
          darkBorder="dark:border-violet-800"
          glowClass="bg-violet-500"
          value={Math.round(stats.totalTokens / 1000)}
          delay={80}
          format={(v) => `${v.toLocaleString()}K`}
        />
        <StatCard
          icon={FiZap}
          label="Avg Latency"
          color="text-amber-600 dark:text-amber-400"
          lightIcon="text-amber-600"
          darkIcon="dark:text-amber-400"
          lightBg="bg-amber-50"
          darkBg="dark:bg-amber-900/20"
          lightBorder="border-amber-200"
          darkBorder="dark:border-amber-800"
          glowClass="bg-amber-500"
          value={stats.avgLatency}
          delay={160}
          format={(v) => `${v}ms`}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Success Rate"
          color="text-emerald-600 dark:text-emerald-400"
          lightIcon="text-emerald-600"
          darkIcon="dark:text-emerald-400"
          lightBg="bg-emerald-50"
          darkBg="dark:bg-emerald-900/20"
          lightBorder="border-emerald-200"
          darkBorder="dark:border-emerald-800"
          glowClass="bg-emerald-500"
          value={stats.successRate}
          delay={240}
          format={(v) => `${v}%`}
        />
      </div>

      <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                <FiTrendingUp className="text-sky-600 dark:text-sky-400 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Usage Trends</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{chartType === 'requests' ? 'Requests over time' : 'Tokens (K) over time'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-1 gap-1">
                {(['7d', '30d'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                      timeRange === r
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {r === '7d' ? '7D' : '30D'}
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-1 gap-1">
                {(['requests', 'tokens'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                      chartType === t
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {t === 'tokens' ? 'Tokens' : 'Reqs'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="ag-main" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag-suc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-slate-500 dark:text-slate-400" />
              <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-slate-500 dark:text-slate-400" />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey={chartType} stroke="#0ea5e9" fill="url(#ag-main)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} />
              {chartType === 'requests' && (
                <Area type="monotone" dataKey="success" stroke="#10b981" fill="url(#ag-suc)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 3, fill: '#10b981' }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <FiCpu className="text-violet-600 dark:text-violet-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Popular Models</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">By request count</p>
            </div>
          </div>

          {modelData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500 text-sm">No data</div>
          ) : (
            <div className="space-y-2.5">
              {modelData.map((m, i) => {
                const max = modelData[0].count;
                const pct = max > 0 ? (m.count / max) * 100 : 0;
                return (
                  <div key={m.model}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 w-3 tabular-nums">{i + 1}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[180px]">{m.model}</span>
                      </div>
                      <span className="text-xs font-black tabular-nums" style={{ color: MODEL_COLORS[i % MODEL_COLORS.length] }}>
                        {m.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: MODEL_COLORS[i % MODEL_COLORS.length],
                          transitionDelay: `${i * 80 + 600}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <FiActivity className="text-emerald-600 dark:text-emerald-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Status Distribution</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Request outcomes</p>
            </div>
          </div>

          {statusDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500 text-sm">No data</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5 w-full">
                {statusDistribution.map((item) => {
                  const total = statusDistribution.reduce((s, i) => s + i.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums">{item.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {errorData.length > 0 && (
        <div className={`transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <FiAlertCircle className="text-red-600 dark:text-red-400 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Top Errors</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{errorData.length} error type{errorData.length > 1 ? 's' : ''} detected</p>
              </div>
            </div>

            <div className="space-y-2">
              {errorData.map((error, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:border-red-400 dark:hover:border-red-600 transition-colors duration-200 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
                    <span className="text-[9px] font-black text-white">{i + 1}</span>
                  </div>
                  <p className="flex-1 text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors truncate">
                    {error.error}
                  </p>
                  <div className="flex-shrink-0 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <span className="text-xs font-black text-red-600 dark:text-red-400 tabular-nums">{error.count}</span>
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
