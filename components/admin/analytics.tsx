import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 shadow-2xl shadow-black/50">
      <p className="text-[10px] font-semibold text-zinc-500 mb-1">{label}</p>
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
  suffix?: string;
  color: string;
  glow: string;
  bg: string;
  border: string;
  delay: number;
  format?: (v: number) => string;
};

function StatCard({ icon: Icon, label, value, color, glow, bg, border, delay, format }: StatCardProps) {
  const animated = useCountUp(value);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${border} ${bg} p-4 sm:p-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:-translate-y-1 hover:shadow-xl group`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${glow}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl ${bg} border ${border}`}>
            <Icon className={`text-sm ${color}`} />
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${glow} animate-pulse`} />
        </div>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl sm:text-3xl font-black tabular-nums ${color}`}>
          {format ? format(animated) : animated.toLocaleString()}
        </p>
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
    { name: 'Success', value: requestLogs.filter(l => l.status >= 200 && l.status < 300).length, color: '#34d399' },
    { name: 'Client Err', value: requestLogs.filter(l => l.status >= 400 && l.status < 500).length, color: '#fbbf24' },
    { name: 'Server Err', value: requestLogs.filter(l => l.status >= 500).length, color: '#f87171' },
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

  const MODEL_COLORS = ['#38bdf8', '#818cf8', '#f472b6', '#fb923c', '#34d399', '#a78bfa'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 mb-4" />
              <div className="h-2 w-16 bg-zinc-800 rounded mb-3" />
              <div className="h-8 w-24 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 animate-pulse h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={FiActivity}
          label="Total Requests"
          value={stats.totalRequests}
          color="text-sky-400"
          glow="bg-sky-400"
          bg="bg-sky-950/30"
          border="border-sky-900/50"
          delay={0}
        />
        <StatCard
          icon={FiCpu}
          label="Total Tokens"
          value={Math.round(stats.totalTokens / 1000)}
          color="text-violet-400"
          glow="bg-violet-400"
          bg="bg-violet-950/30"
          border="border-violet-900/50"
          delay={80}
          format={(v) => `${v.toLocaleString()}K`}
        />
        <StatCard
          icon={FiZap}
          label="Avg Latency"
          value={stats.avgLatency}
          color="text-amber-400"
          glow="bg-amber-400"
          bg="bg-amber-950/30"
          border="border-amber-900/50"
          delay={160}
          format={(v) => `${v}ms`}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Success Rate"
          value={stats.successRate}
          color="text-emerald-400"
          glow="bg-emerald-400"
          bg="bg-emerald-950/30"
          border="border-emerald-900/50"
          delay={240}
          format={(v) => `${v}%`}
        />
      </div>

      <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-sky-950/50 border border-sky-900/50 rounded-lg">
                <FiTrendingUp className="text-sky-400 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Usage Trends</h3>
                <p className="text-[10px] text-zinc-500">{chartType === 'requests' ? 'Requests over time' : 'Tokens (K) over time'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
                {(['7d', '30d'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
                      timeRange === r
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {r === '7d' ? '7D' : '30D'}
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
                {(['requests', 'tokens'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 capitalize ${
                      chartType === t
                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t === 'tokens' ? 'Tokens' : 'Reqs'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="ag-main" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag-suc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey={chartType} stroke="#38bdf8" fill="url(#ag-main)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#000' }} />
              {chartType === 'requests' && (
                <Area type="monotone" dataKey="success" stroke="#34d399" fill="url(#ag-suc)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 3, fill: '#34d399' }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 bg-violet-950/50 border border-violet-900/50 rounded-lg">
              <FiCpu className="text-violet-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Popular Models</h3>
              <p className="text-[10px] text-zinc-500">By request count</p>
            </div>
          </div>

          {modelData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">No data</div>
          ) : (
            <div className="space-y-3">
              {modelData.map((m, i) => {
                const max = modelData[0].count;
                const pct = max > 0 ? (m.count / max) * 100 : 0;
                return (
                  <div key={m.model} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-zinc-600 w-4 tabular-nums">{i + 1}</span>
                        <span className="text-xs font-semibold text-zinc-300 truncate max-w-[160px]">{m.model}</span>
                      </div>
                      <span className="text-xs font-black tabular-nums" style={{ color: MODEL_COLORS[i % MODEL_COLORS.length] }}>
                        {m.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: MODEL_COLORS[i % MODEL_COLORS.length],
                          boxShadow: `0 0 8px ${MODEL_COLORS[i % MODEL_COLORS.length]}60`,
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

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 bg-emerald-950/50 border border-emerald-900/50 rounded-lg">
              <FiActivity className="text-emerald-400 text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Status Distribution</h3>
              <p className="text-[10px] text-zinc-500">Request outcomes</p>
            </div>
          </div>

          {statusDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">No data</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
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
              <div className="flex-1 space-y-3 w-full">
                {statusDistribution.map((item) => {
                  const total = statusDistribution.reduce((s, i) => s + i.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                          <span className="text-xs font-semibold text-zinc-400">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-zinc-300 tabular-nums">{item.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
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
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 bg-red-950/50 border border-red-900/50 rounded-lg">
                <FiAlertCircle className="text-red-400 text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top Errors</h3>
                <p className="text-[10px] text-zinc-500">{errorData.length} error type{errorData.length > 1 ? 's' : ''} detected</p>
              </div>
            </div>

            <div className="space-y-2">
              {errorData.map((error, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded-xl hover:border-red-700/50 transition-colors duration-200 group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                    <span className="text-[10px] font-black text-white">{i + 1}</span>
                  </div>
                  <p className="flex-1 text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                    {error.error}
                  </p>
                  <div className="flex-shrink-0 px-2.5 py-1 bg-red-950/50 border border-red-900/50 rounded-lg">
                    <span className="text-xs font-black text-red-400 tabular-nums">{error.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
