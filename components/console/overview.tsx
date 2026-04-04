import { useState, useEffect, useRef } from 'react';
import { FiActivity, FiKey, FiZap, FiTrendingUp, FiPlus, FiArrowRight, FiLayers } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

type OverviewProps = {
  stats: {
    totalRequests: number;
    activeKeys: number;
    rateLimitUsage: number;
  };
  usageData: DailyUsage[];
  onNavigate: (tab: 'keys' | 'activity' | 'models') => void;
};

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(ease * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const animated = useCountUp(value, 1000, delay);
  return <>{animated.toLocaleString()}</>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  badge,
  accentColor,
  glowColor,
  delay,
  footer,
  children,
}: {
  icon: any;
  label: string;
  value: number;
  suffix?: string;
  badge?: React.ReactNode;
  accentColor: string;
  glowColor: string;
  delay: number;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor} blur-xl`} />
      <div className="relative bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5 group-hover:border-zinc-300/80 dark:group-hover:border-zinc-700/80 transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${accentColor} shadow-lg`}>
            <Icon className="text-white text-sm sm:text-base" />
          </div>
          {badge}
        </div>

        <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tabular-nums leading-none mb-1">
          <AnimatedNumber value={value} delay={delay + 100} />{suffix}
        </p>

        {children}

        {footer && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 shadow-2xl">
      <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[11px] text-zinc-600 dark:text-zinc-300 capitalize">{p.name}</span>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-white ml-auto pl-3">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Overview({ stats, usageData, onNavigate }: OverviewProps) {
  const [chartMounted, setChartMounted] = useState(false);
  const [activeChartLine, setActiveChartLine] = useState<'requests' | 'success' | 'errors'>('requests');

  useEffect(() => {
    const t = setTimeout(() => setChartMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const chartData = usageData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    requests: d.requests_count,
    success: d.success_count,
    errors: d.error_count,
  }));

  const totalSuccess = usageData.reduce((a, d) => a + d.success_count, 0);
  const totalErrors = usageData.reduce((a, d) => a + d.error_count, 0);
  const successRate = stats.totalRequests > 0 ? Math.round((totalSuccess / stats.totalRequests) * 100) : 0;

  const chartLines = [
    { key: 'requests' as const, label: 'Total', color: '#38bdf8', gradId: 'grad-req' },
    { key: 'success' as const, label: 'Success', color: '#34d399', gradId: 'grad-suc' },
    { key: 'errors' as const, label: 'Errors', color: '#f87171', gradId: 'grad-err' },
  ];

  const activeLine = chartLines.find(l => l.key === activeChartLine)!;

  const quickActions = [
    {
      label: 'Create API Key',
      desc: 'Generate a new key',
      icon: FiPlus,
      tab: 'keys' as const,
      gradient: 'from-sky-500 to-blue-600',
      glow: 'bg-sky-400/20',
      border: 'hover:border-sky-400/60 dark:hover:border-sky-500/60',
      bg: 'hover:bg-sky-50/80 dark:hover:bg-sky-950/30',
    },
    {
      label: 'View Activity',
      desc: 'Check recent requests',
      icon: FiActivity,
      tab: 'activity' as const,
      gradient: 'from-violet-500 to-purple-600',
      glow: 'bg-violet-400/20',
      border: 'hover:border-violet-400/60 dark:hover:border-violet-500/60',
      bg: 'hover:bg-violet-50/80 dark:hover:bg-violet-950/30',
    },
    {
      label: 'Browse Models',
      desc: 'Explore AI models',
      icon: FiLayers,
      tab: 'models' as const,
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'bg-emerald-400/20',
      border: 'hover:border-emerald-400/60 dark:hover:border-emerald-500/60',
      bg: 'hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30',
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <StatCard
          icon={FiActivity}
          label="Total Requests"
          value={stats.totalRequests}
          accentColor="from-sky-400 to-blue-500"
          glowColor="bg-sky-400/10 dark:bg-sky-400/15"
          delay={0}
          badge={
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/25 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          }
          footer={
            <button onClick={() => onNavigate('activity')} className="group/btn flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors">
              View activity
              <FiArrowRight className="text-xs transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          }
        />

        <StatCard
          icon={FiKey}
          label="Active Keys"
          value={stats.activeKeys}
          accentColor="from-violet-400 to-purple-500"
          glowColor="bg-violet-400/10 dark:bg-violet-400/15"
          delay={80}
          footer={
            <button onClick={() => onNavigate('keys')} className="group/btn flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
              Manage keys
              <FiArrowRight className="text-xs transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          }
        />

        <StatCard
          icon={FiZap}
          label="Rate Limit"
          value={stats.rateLimitUsage}
          suffix="%"
          accentColor={stats.rateLimitUsage > 80 ? 'from-red-400 to-rose-500' : stats.rateLimitUsage > 50 ? 'from-orange-400 to-amber-500' : 'from-emerald-400 to-teal-500'}
          glowColor={stats.rateLimitUsage > 80 ? 'bg-red-400/10' : stats.rateLimitUsage > 50 ? 'bg-orange-400/10' : 'bg-emerald-400/10'}
          delay={160}
        >
          <div className="mt-3 relative h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                stats.rateLimitUsage > 80 ? 'bg-gradient-to-r from-red-500 to-rose-400' :
                stats.rateLimitUsage > 50 ? 'bg-gradient-to-r from-orange-500 to-amber-400' :
                'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${stats.rateLimitUsage}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
          </div>
          <p className={`text-[9px] font-semibold mt-1.5 ${stats.rateLimitUsage > 80 ? 'text-red-500' : stats.rateLimitUsage > 50 ? 'text-orange-500' : 'text-emerald-500'}`}>
            {stats.rateLimitUsage > 80 ? 'Critical — approaching limit' : stats.rateLimitUsage > 50 ? 'Moderate usage' : 'Healthy usage'}
          </p>
        </StatCard>
      </div>

      <div
        className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden"
        style={{
          opacity: chartMounted ? 1 : 0,
          transform: chartMounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
        }}
      >
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FiTrendingUp className="text-sky-500 dark:text-sky-400" />
                Usage Over Time
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Last {usageData.length} days · {stats.totalRequests.toLocaleString()} total requests
              </p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
              {chartLines.map(line => (
                <button
                  key={line.key}
                  onClick={() => setActiveChartLine(line.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                    activeChartLine === line.key
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: line.color }} />
                  {line.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'Total', value: stats.totalRequests, color: 'text-sky-600 dark:text-sky-400' },
              { label: 'Success', value: totalSuccess, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Errors', value: totalErrors, color: 'text-red-500 dark:text-red-400' },
            ].map(item => (
              <div key={item.label} className="bg-zinc-50 dark:bg-zinc-900/60 rounded-xl p-2.5 sm:p-3 border border-zinc-100 dark:border-zinc-800">
                <p className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-base sm:text-lg font-black tabular-nums ${item.color}`}>{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-4">
                <div className="absolute inset-0 bg-sky-400/10 rounded-2xl animate-pulse" />
                <div className="relative w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                  <FiTrendingUp className="text-2xl text-zinc-400" />
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">No usage data yet</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Make your first API request to see activity</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  {chartLines.map(line => (
                    <linearGradient key={line.gradId} id={line.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={line.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#71717a' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#71717a' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={activeChartLine}
                  stroke={activeLine.color}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#${activeLine.gradId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: activeLine.color, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div
        className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 sm:p-5"
        style={{
          opacity: chartMounted ? 1 : 0,
          transform: chartMounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Quick Actions</h3>
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Navigate to key sections</p>
          </div>
          {successRate > 0 && (
            <div className="text-right">
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide font-semibold">Success rate</p>
              <p className="text-base font-black text-emerald-500 tabular-nums">{successRate}%</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => onNavigate(action.tab)}
                className={`group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 ${action.border} ${action.bg} transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] overflow-hidden`}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${action.glow} blur-xl`} />
                <div className={`relative flex-shrink-0 p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200`}>
                  <Icon className="text-white text-sm sm:text-base" />
                </div>
                <div className="relative text-left flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight">{action.label}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{action.desc}</p>
                </div>
                <FiArrowRight className="relative flex-shrink-0 text-zinc-400 dark:text-zinc-600 text-xs transition-all duration-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
