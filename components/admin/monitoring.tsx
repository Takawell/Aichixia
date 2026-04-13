import { useEffect, useRef, useState } from 'react';
import { FiActivity, FiZap, FiCheckCircle, FiAlertCircle, FiClock, FiTrendingUp, FiUsers, FiCpu, FiServer, FiRefreshCw } from 'react-icons/fi';

type RequestLog = {
  id: string; api_key_id: string; user_id: string; model: string;
  endpoint: string; status: number; latency_ms: number | null;
  tokens_used: number; error_message: string | null;
  ip_address: string | null; user_agent: string | null; created_at: string;
};

type User = {
  user_id: string; email: string; display_name: string | null;
  avatar_url: string | null; plan: string; plan_expires_at: string | null;
  is_admin: boolean; active_keys: number; created_at: string;
};

type MonitoringProps = {
  recentLogs: RequestLog[]; users: User[];
  onRefresh: () => void; loading?: boolean; refreshing?: boolean;
};

const PLAN_CFG: Record<string, { gradDark:string; gradLight:string; softDark:string; softLight:string; textDark:string; textLight:string; borderDark:string; borderLight:string; label:string }> = {
  enterprise: { gradDark:'linear-gradient(135deg,#a78bfa,#7c3aed)', gradLight:'linear-gradient(135deg,#8b5cf6,#6d28d9)', softDark:'rgba(139,92,246,0.13)', softLight:'rgba(139,92,246,0.1)', textDark:'#c4b5fd', textLight:'#7c3aed', borderDark:'rgba(139,92,246,0.32)', borderLight:'rgba(139,92,246,0.3)', label:'Ent' },
  pro:        { gradDark:'linear-gradient(135deg,#60a5fa,#2563eb)', gradLight:'linear-gradient(135deg,#3b82f6,#1d4ed8)', softDark:'rgba(59,130,246,0.13)',  softLight:'rgba(59,130,246,0.1)',  textDark:'#93c5fd',  textLight:'#2563eb', borderDark:'rgba(59,130,246,0.32)',  borderLight:'rgba(59,130,246,0.3)',  label:'Pro' },
  free:       { gradDark:'linear-gradient(135deg,#94a3b8,#475569)', gradLight:'linear-gradient(135deg,#64748b,#334155)', softDark:'rgba(100,116,139,0.12)', softLight:'rgba(100,116,139,0.08)', textDark:'#94a3b8', textLight:'#475569', borderDark:'rgba(100,116,139,0.25)',borderLight:'rgba(100,116,139,0.22)', label:'Free' },
};
const PC = (p: string) => PLAN_CFG[p] ?? PLAN_CFG.free;

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    let raf: number;
    const t = setTimeout(() => {
      let start: number | null = null;
      const tick = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const e = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
        setVal(Math.round(e * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function getTimeSince(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{children}</span>
      <div className="bg-zinc-200 dark:bg-zinc-800" style={{ flex:1, height:'1px' }} />
    </div>
  );
}

function StatCard({ label, value, unit='', sub, icon, gradDark, gradLight, glowDark, glowLight, textDark, textLight, barPct, delay=0, liveMode=false }: {
  label:string; value:number; unit?:string; sub:string; icon:React.ReactNode;
  gradDark:string; gradLight:string; glowDark:string; glowLight:string; textDark:string; textLight:string;
  barPct?:number; delay?:number; liveMode?:boolean;
}) {
  const dark = useIsDark();
  const grad = dark ? gradDark : gradLight;
  const glow = dark ? glowDark : glowLight;
  const text = dark ? textDark : textLight;
  const num = useCountUp(value, 1100, delay + 150);
  const { ref, visible } = useInView();
  const [barW, setBarW] = useState(0);
  const [hov, setHov] = useState(false);
  useEffect(() => { if (visible && barPct !== undefined) { const t = setTimeout(() => setBarW(barPct), delay + 400); return () => clearTimeout(t); } }, [visible, barPct, delay]);

  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-white/[0.025]"
      style={{
        position:'relative', padding:'12px 13px', overflow:'hidden',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
        transition:`opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.3s, border-color 0.3s`,
        boxShadow: hov ? (dark ? `0 14px 36px rgba(0,0,0,0.38), 0 0 0 1px ${glow}` : `0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px ${glow}`) : (dark ? '0 2px 10px rgba(0,0,0,0.18)' : '0 1px 6px rgba(0,0,0,0.05)'),
      }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:70, height:70, borderRadius:'50%', background: glow, filter:'blur(22px)', opacity: hov ? 0.9 : 0.3, transition:'opacity 0.35s', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 85% -5%, ${glow.replace('0.22','0.12').replace('0.18','0.08')}, transparent 55%)`, pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <div style={{ width:24, height:24, borderRadius:7, background: grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0, boxShadow:`0 3px 10px ${glow}` }}>{icon}</div>
          <p className="text-zinc-500 dark:text-zinc-400" style={{ fontSize:9, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase' }}>{label}</p>
        </div>
        <p className="text-zinc-900 dark:text-white" style={{ fontSize:20, fontWeight:800, lineHeight:1, marginBottom:3, fontVariantNumeric:'tabular-nums' }}>
          {num.toLocaleString()}{unit}
        </p>
        {barPct !== undefined && !liveMode && (
          <div className="bg-zinc-100 dark:bg-zinc-800/70" style={{ width:'100%', height:3, borderRadius:99, overflow:'hidden', marginBottom:5 }}>
            <div style={{ height:'100%', borderRadius:99, background: grad, width:`${barW}%`, boxShadow:`0 0 8px ${glow}`, transition:'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        )}
        {liveMode ? (
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background: value > 0 ? '#10b981' : '#6b7280', display:'inline-block', animation: value > 0 ? 'mn-pulse 1.8s infinite' : 'none' }} />
            <span style={{ fontSize:10, color: value > 0 ? '#10b981' : (dark ? '#6b7280' : '#9ca3af'), fontWeight:600 }}>{value > 0 ? 'Active' : 'Idle'}</span>
          </div>
        ) : (
          <p style={{ fontSize:10, color: text, fontWeight:500 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

function FilterBar({ timeRange, setTimeRange, selectedModel, setSelectedModel, models, onRefresh, refreshing, dark }: {
  timeRange: '1h'|'6h'|'24h'; setTimeRange: (v:'1h'|'6h'|'24h') => void;
  selectedModel: string; setSelectedModel: (v:string) => void;
  models: string[]; onRefresh: () => void; refreshing?: boolean; dark: boolean;
}) {
  const ranges: { v:'1h'|'6h'|'24h'; l:string }[] = [{ v:'1h', l:'1h' }, { v:'6h', l:'6h' }, { v:'24h', l:'24h' }];
  return (
    <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:8 }}>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
        <div className="border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-white/[0.025]" style={{ display:'flex', borderRadius:10, padding:3, gap:2, backdropFilter:'blur(18px)' }}>
          {ranges.map(({ v, l }) => {
            const active = timeRange === v;
            return (
              <button key={v} onClick={() => setTimeRange(v)}
                style={{
                  all:'unset', cursor:'pointer', padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:700,
                  background: active ? 'linear-gradient(135deg,#0ea5e9,#2563eb)' : 'transparent',
                  color: active ? '#fff' : (dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'),
                  boxShadow: active ? '0 4px 14px rgba(14,165,233,0.35)' : 'none',
                  transition:'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: active ? 'scale(1.03)' : 'scale(1)',
                }}>
                {l}
              </button>
            );
          })}
        </div>

        {models.length > 0 && (
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
            className="text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80"
            style={{ padding:'5px 8px', borderRadius:9, fontSize:11, fontWeight:600, outline:'none', cursor:'pointer', backdropFilter:'blur(18px)', appearance:'none', maxWidth:120 }}>
            <option value="all">All Models</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
      </div>

      <button onClick={onRefresh} disabled={refreshing}
        style={{
          all:'unset', cursor: refreshing ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:5,
          padding:'5px 12px', borderRadius:9, fontSize:11, fontWeight:700,
          background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color:'#fff',
          boxShadow:'0 4px 14px rgba(14,165,233,0.3)', opacity: refreshing ? 0.6 : 1,
          transition:'all 0.25s ease', transform: refreshing ? 'scale(0.98)' : 'scale(1)',
        }}>
        <FiRefreshCw style={{ fontSize:11, animation: refreshing ? 'mn-spin 0.8s linear infinite' : 'none' }} />
        Refresh
      </button>
    </div>
  );
}

function UserRow({ user, index }: {
  user: User & { requestCount:number; totalTokens:number; lastActive:Date; mostUsedModel:string };
  index: number;
}) {
  const dark = useIsDark();
  const cfg = PC(user.plan);
  const grad = dark ? cfg.gradDark : cfg.gradLight;
  const soft = dark ? cfg.softDark : cfg.softLight;
  const text = dark ? cfg.textDark : cfg.textLight;
  const border = dark ? cfg.borderDark : cfg.borderLight;
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const rankGrads = [
    'linear-gradient(135deg,#fbbf24,#d97706)',
    'linear-gradient(135deg,#94a3b8,#64748b)',
    'linear-gradient(135deg,#cd7f32,#92400e)',
    'linear-gradient(135deg,#6366f1,#4f46e5)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
  ];

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="border border-zinc-100 dark:border-zinc-800/60"
      style={{
        display:'flex', alignItems:'center', gap:7, padding:'8px 9px', borderRadius:11,
        background: hov ? (dark ? 'rgba(255,255,255,0.042)' : 'rgba(0,0,0,0.025)') : (dark ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.7)'),
        backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
        transition:'all 0.22s ease', cursor:'default',
        boxShadow: hov ? (dark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 6px 18px rgba(0,0,0,0.07)') : 'none',
        animation:'mn-rowIn 0.4s both ease-out', animationDelay:`${index*50}ms`,
        minWidth:0, overflow:'hidden',
      }}>
      <div style={{ width:22, height:22, borderRadius:6, background: rankGrads[index] ?? rankGrads[4], display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0 }}>
        {index + 1}
      </div>
      {user.avatar_url && !imgErr
        ? <img src={user.avatar_url} alt="" onError={() => setImgErr(true)} className="border border-zinc-200 dark:border-zinc-700" style={{ width:26, height:26, borderRadius:7, objectFit:'cover', flexShrink:0 }} />
        : <div style={{ width:26, height:26, borderRadius:7, background: grad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:11, flexShrink:0, boxShadow:`0 3px 10px ${soft}` }}>
            {(user.display_name?.[0] || user.email[0]).toUpperCase()}
          </div>
      }
      <div style={{ flex:1, minWidth:0, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2, minWidth:0 }}>
          <p className="text-zinc-800 dark:text-white" style={{ fontSize:11, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1, minWidth:0 }}>
            {user.display_name || user.email}
          </p>
          <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', padding:'1px 5px', borderRadius:99, background: soft, color: text, border:`1px solid ${border}`, flexShrink:0 }}>
            {cfg.label}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', gap:2, flexShrink:0 }}>
            <FiActivity style={{ fontSize:8, color: dark ? '#60a5fa' : '#2563eb' }} />
            <span className="text-zinc-700 dark:text-zinc-300" style={{ fontSize:9.5, fontWeight:700 }}>{user.requestCount}</span>
            <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:9.5 }}>req</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:2, flexShrink:0 }}>
            <FiTrendingUp style={{ fontSize:8, color: dark ? '#34d399' : '#059669' }} />
            <span className="text-zinc-700 dark:text-zinc-300" style={{ fontSize:9.5, fontWeight:700 }}>{user.totalTokens.toLocaleString()}</span>
            <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:9.5 }}>tok</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:2, minWidth:0, overflow:'hidden' }}>
            <FiCpu style={{ fontSize:8, color: dark ? '#a78bfa' : '#7c3aed', flexShrink:0 }} />
            <span className="text-zinc-500 dark:text-zinc-400" style={{ fontSize:9.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.mostUsedModel}</span>
          </div>
        </div>
      </div>
      <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:3, padding:'2px 6px', borderRadius:6, background: dark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)', border:`1px solid ${dark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)'}` }}>
        <FiClock style={{ fontSize:8, color: dark ? '#34d399' : '#059669' }} />
        <span style={{ fontSize:9.5, fontWeight:600, color: dark ? '#34d399' : '#059669', fontFamily:'monospace', whiteSpace:'nowrap' }}>{getTimeSince(user.lastActive)}</span>
      </div>
    </div>
  );
}

function LogRow({ log, index }: { log: RequestLog; index: number }) {
  const dark = useIsDark();
  const isSuccess = log.status >= 200 && log.status < 300;
  const isError   = log.status >= 400;

  const dotColor  = isSuccess ? '#10b981' : isError ? '#ef4444' : '#6b7280';
  const bgDark    = isSuccess ? 'rgba(16,185,129,0.06)'  : isError ? 'rgba(239,68,68,0.06)'   : 'rgba(255,255,255,0.018)';
  const bgLight   = isSuccess ? 'rgba(16,185,129,0.05)'  : isError ? 'rgba(239,68,68,0.05)'   : 'rgba(255,255,255,0.7)';
  const bdDark    = isSuccess ? 'rgba(16,185,129,0.2)'   : isError ? 'rgba(239,68,68,0.2)'    : 'rgba(255,255,255,0.06)';
  const bdLight   = isSuccess ? 'rgba(16,185,129,0.18)'  : isError ? 'rgba(239,68,68,0.18)'   : 'rgba(0,0,0,0.06)';
  const statusCol = isSuccess ? (dark ? '#34d399' : '#059669') : isError ? (dark ? '#f87171' : '#dc2626') : (dark ? '#94a3b8' : '#64748b');

  const [hov, setHov] = useState(false);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:7, padding:'6px 9px', borderRadius:10,
        background: dark ? bgDark : bgLight, border:`1px solid ${dark ? bdDark : bdLight}`,
        transition:'all 0.2s ease',
        boxShadow: hov ? (dark ? '0 6px 18px rgba(0,0,0,0.28)' : '0 4px 12px rgba(0,0,0,0.07)') : 'none',
        animation:'mn-rowIn 0.4s both ease-out', animationDelay:`${index*35}ms`,
        minWidth:0, overflow:'hidden',
      }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background: dotColor, flexShrink:0, boxShadow:`0 0 5px ${dotColor}80` }} />
      <div style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', gap:4, overflow:'hidden' }}>
        <code className="text-zinc-800 dark:text-white" style={{ fontSize:10.5, fontWeight:600, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0, flex:1 }}>
          {log.model}
        </code>
        <span style={{ fontSize:10.5, fontWeight:700, color: statusCol, flexShrink:0 }}>{log.status}</span>
        {log.latency_ms && (
          <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:10, fontFamily:'monospace', flexShrink:0 }}>{log.latency_ms}ms</span>
        )}
        {log.tokens_used > 0 && (
          <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline" style={{ fontSize:10, flexShrink:0 }}>{log.tokens_used.toLocaleString()}t</span>
        )}
      </div>
      <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:9.5, fontFamily:'monospace', flexShrink:0, whiteSpace:'nowrap' }}>
        {getTimeSince(new Date(log.created_at))}
      </span>
    </div>
  );
}

function Panel({ title, icon, iconBg, badge, children, delay=0 }: {
  title:string; icon:React.ReactNode; iconBg:string; badge?:React.ReactNode; children:React.ReactNode; delay?:number;
}) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-white/[0.024]"
      style={{ padding:'14px', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(18px)', transition:`opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`, minWidth:0, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:26, height:26, borderRadius:7, background: iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', flexShrink:0 }}>{icon}</div>
          <span className="text-zinc-800 dark:text-white" style={{ fontSize:12, fontWeight:700 }}>{title}</span>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div style={{ textAlign:'center', padding:'24px 0' }}>
      <div className="bg-zinc-100 dark:bg-zinc-800/60" style={{ width:44, height:44, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', fontSize:18 }}>
        <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
      </div>
      <p className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:12 }}>{message}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-white/[0.025]" style={{ padding:'12px 13px', backdropFilter:'blur(18px)' }}>
      <div className="bg-zinc-100 dark:bg-zinc-800" style={{ width:24, height:24, borderRadius:7, marginBottom:8, animation:'mn-shimmer 1.5s infinite' }} />
      <div className="bg-zinc-100 dark:bg-zinc-800" style={{ width:'40%', height:9, borderRadius:4, marginBottom:8, animation:'mn-shimmer 1.5s infinite 0.1s' }} />
      <div className="bg-zinc-100 dark:bg-zinc-800" style={{ width:'60%', height:18, borderRadius:6, animation:'mn-shimmer 1.5s infinite 0.2s' }} />
    </div>
  );
}

export default function Monitoring({ recentLogs, users, onRefresh, loading, refreshing }: MonitoringProps) {
  const dark = useIsDark();
  const [timeRange, setTimeRange] = useState<'1h'|'6h'|'24h'>('24h');
  const [selectedModel, setSelectedModel] = useState<string>('all');

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
        const mostUsedModel = Object.entries(
          userLogs.reduce((m, l) => { m[l.model] = (m[l.model] || 0) + 1; return m; }, {} as Record<string,number>)
        ).sort((a,b) => b[1]-a[1])[0]?.[0] || 'unknown';
        acc.push({ ...user, requestCount: userLogs.length, totalTokens: userLogs.reduce((s,l) => s+(l.tokens_used||0),0), lastActive: new Date(lastActive), mostUsedModel });
      }
    }
    return acc;
  }, [] as Array<User & { requestCount:number; totalTokens:number; lastActive:Date; mostUsedModel:string }>)
  .sort((a,b) => b.requestCount - a.requestCount).slice(0,10);

  const models = [...new Set(recentLogs.map(l => l.model))];
  const successCount = filteredLogs.filter(l => l.status >= 200 && l.status < 300).length;
  const errorCount   = filteredLogs.filter(l => l.status >= 400).length;
  const successRate  = filteredLogs.length > 0 ? Math.round((successCount / filteredLogs.length) * 100) : 0;
  const avgLatency   = (() => {
    const withLatency = filteredLogs.filter(l => l.latency_ms);
    return withLatency.length > 0 ? Math.round(withLatency.reduce((s,l) => s+(l.latency_ms||0),0) / withLatency.length) : 0;
  })();
  const latencyLabel = avgLatency === 0 ? '—' : avgLatency < 500 ? 'Excellent' : avgLatency < 1000 ? 'Good' : 'Fair';

  if (loading) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); .mn-wrap,.mn-wrap *{box-sizing:border-box;font-family:'Plus Jakarta Sans',system-ui,sans-serif;} @keyframes mn-shimmer{0%,100%{opacity:1;}50%{opacity:0.4;}}`}</style>
        <div className="mn-wrap" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
            {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .mn-wrap, .mn-wrap * { box-sizing:border-box; font-family:'Plus Jakarta Sans',system-ui,sans-serif; }
        @keyframes mn-rowIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes mn-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.5);}50%{box-shadow:0 0 0 5px rgba(16,185,129,0);} }
        @keyframes mn-spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        @keyframes mn-shimmer { 0%,100%{opacity:1;}50%{opacity:0.45;} }
        .mn-g4 { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
        .mn-g2 { display:grid; grid-template-columns:1fr; gap:8px; }
        @media(min-width:900px){
          .mn-g4 { grid-template-columns:repeat(4,1fr); }
          .mn-g2 { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="mn-wrap" style={{ display:'flex', flexDirection:'column', gap:10 }}>

        <FilterBar
          timeRange={timeRange} setTimeRange={setTimeRange}
          selectedModel={selectedModel} setSelectedModel={setSelectedModel}
          models={models} onRefresh={onRefresh} refreshing={refreshing} dark={dark}
        />

        <SLabel>Live Metrics</SLabel>

        <div className="mn-g4">
          <StatCard
            label="Total Requests" value={filteredLogs.length} sub="" icon={<FiActivity />}
            gradDark="linear-gradient(135deg,#38bdf8,#0284c7)" gradLight="linear-gradient(135deg,#0ea5e9,#0369a1)"
            glowDark="rgba(56,189,248,0.22)" glowLight="rgba(14,165,233,0.18)"
            textDark="#38bdf8" textLight="#0284c7"
            delay={0} liveMode
          />
          <StatCard
            label="Success Rate" value={successRate} unit="%" sub={`${successCount} successful`} icon={<FiCheckCircle />}
            gradDark="linear-gradient(135deg,#34d399,#059669)" gradLight="linear-gradient(135deg,#10b981,#047857)"
            glowDark="rgba(52,211,153,0.22)" glowLight="rgba(16,185,129,0.18)"
            textDark="#34d399" textLight="#059669"
            barPct={successRate} delay={60}
          />
          <StatCard
            label="Avg Latency" value={avgLatency} unit="ms" sub={latencyLabel} icon={<FiZap />}
            gradDark="linear-gradient(135deg,#fbbf24,#d97706)" gradLight="linear-gradient(135deg,#f59e0b,#b45309)"
            glowDark="rgba(251,191,36,0.22)" glowLight="rgba(245,158,11,0.18)"
            textDark="#fbbf24" textLight="#d97706"
            delay={120}
          />
          <StatCard
            label="Errors" value={errorCount} sub={errorCount === 0 ? 'All clear!' : `${filteredLogs.length > 0 ? Math.round((errorCount/filteredLogs.length)*100) : 0}% of total`} icon={<FiAlertCircle />}
            gradDark="linear-gradient(135deg,#f87171,#dc2626)" gradLight="linear-gradient(135deg,#ef4444,#b91c1c)"
            glowDark="rgba(248,113,113,0.22)" glowLight="rgba(239,68,68,0.18)"
            textDark="#f87171" textLight="#dc2626"
            delay={180}
          />
        </div>

        <SLabel>Activity</SLabel>

        <div className="mn-g2">
          <Panel
            title="Active Users"
            iconBg="linear-gradient(135deg,#0ea5e9,#0369a1)"
            icon={<FiUsers />}
            delay={0}
            badge={
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:7, background: dark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.08)', border:`1px solid ${dark ? 'rgba(14,165,233,0.22)' : 'rgba(14,165,233,0.18)'}`, flexShrink:0 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#0ea5e9', display:'inline-block', animation:'mn-pulse 1.8s infinite', flexShrink:0 }} />
                <span style={{ fontSize:10, fontWeight:700, color: dark ? '#38bdf8' : '#0284c7', whiteSpace:'nowrap' }}>{activeUsers.length} online</span>
              </div>
            }>
            {activeUsers.length === 0
              ? <EmptyState icon={<FiUsers />} message="No active users in this time range" />
              : <div style={{ display:'flex', flexDirection:'column', gap:5 }}>{activeUsers.map((u,i) => <UserRow key={u.user_id} user={u} index={i} />)}</div>
            }
          </Panel>

          <Panel
            title="Recent Activity"
            iconBg="linear-gradient(135deg,#8b5cf6,#6d28d9)"
            icon={<FiServer />}
            delay={80}
            badge={
              filteredLogs.length > 0 ? (
                <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px', borderRadius:7, background: dark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)', border:`1px solid ${dark ? 'rgba(139,92,246,0.22)' : 'rgba(139,92,246,0.18)'}`, flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:700, color: dark ? '#a78bfa' : '#7c3aed', whiteSpace:'nowrap' }}>{filteredLogs.length} logs</span>
                </div>
              ) : undefined
            }>
            {filteredLogs.length === 0
              ? <EmptyState icon={<FiActivity />} message="No activity in this time range" />
              : <div style={{ display:'flex', flexDirection:'column', gap:3 }}>{filteredLogs.slice(0,10).map((log,i) => <LogRow key={log.id} log={log} index={i} />)}</div>
            }
          </Panel>
        </div>
      </div>
    </>
  );
}
