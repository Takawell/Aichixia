import { useEffect, useRef, useState } from 'react';
import { FiUsers, FiGift, FiActivity, FiTrendingUp, FiPlus, FiEye, FiBarChart2, FiArrowUpRight, FiShield } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';

type PromoCode = {
  id: string; code: string; plan_type: string; duration_days: number;
  max_uses: number; used_count: number; is_active: boolean; created_at: string;
};
type Redemption = {
  id: string; promo_codes: { code: string; plan_type: string };
  user_email: string; redeemed_at: string; expires_at: string;
};
type User = {
  user_id: string; email: string; display_name: string | null;
  avatar_url: string | null; plan: string; plan_expires_at: string | null;
  is_admin: boolean; active_keys: number; created_at: string;
};
type OverviewProps = {
  users: User[]; promoCodes: PromoCode[]; redemptions: Redemption[];
  onNavigate: (tab: 'monitoring' | 'analytics' | 'promos' | 'users') => void;
  onCreatePromo: () => void;
};

const PLAN_CFG: Record<string, {
  gradDark: string; gradLight: string;
  softDark: string; softLight: string;
  textDark: string; textLight: string;
  borderDark: string; borderLight: string;
  label: string;
}> = {
  enterprise: {
    gradDark:   'linear-gradient(135deg,#a78bfa,#7c3aed)',
    gradLight:  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    softDark:   'rgba(139,92,246,0.13)',  softLight:  'rgba(139,92,246,0.1)',
    textDark:   '#c4b5fd',               textLight:  '#7c3aed',
    borderDark: 'rgba(139,92,246,0.32)', borderLight: 'rgba(139,92,246,0.3)',
    label: 'Enterprise',
  },
  pro: {
    gradDark:   'linear-gradient(135deg,#60a5fa,#2563eb)',
    gradLight:  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    softDark:   'rgba(59,130,246,0.13)',  softLight:  'rgba(59,130,246,0.1)',
    textDark:   '#93c5fd',               textLight:  '#2563eb',
    borderDark: 'rgba(59,130,246,0.32)', borderLight: 'rgba(59,130,246,0.3)',
    label: 'Pro',
  },
  free: {
    gradDark:   'linear-gradient(135deg,#94a3b8,#475569)',
    gradLight:  'linear-gradient(135deg,#64748b,#334155)',
    softDark:   'rgba(100,116,139,0.12)', softLight:  'rgba(100,116,139,0.08)',
    textDark:   '#94a3b8',               textLight:  '#475569',
    borderDark: 'rgba(100,116,139,0.25)',borderLight: 'rgba(100,116,139,0.22)',
    label: 'Free',
  },
};

const ACCENTS = {
  sky:     { gradDark:'linear-gradient(135deg,#38bdf8,#0284c7)', gradLight:'linear-gradient(135deg,#0ea5e9,#0369a1)', glowDark:'rgba(56,189,248,0.22)',   glowLight:'rgba(14,165,233,0.18)',  textDark:'#38bdf8', textLight:'#0284c7' },
  violet:  { gradDark:'linear-gradient(135deg,#a78bfa,#7c3aed)', gradLight:'linear-gradient(135deg,#8b5cf6,#6d28d9)', glowDark:'rgba(167,139,250,0.22)',  glowLight:'rgba(139,92,246,0.18)', textDark:'#a78bfa', textLight:'#7c3aed' },
  emerald: { gradDark:'linear-gradient(135deg,#34d399,#059669)', gradLight:'linear-gradient(135deg,#10b981,#047857)', glowDark:'rgba(52,211,153,0.22)',   glowLight:'rgba(16,185,129,0.18)', textDark:'#34d399', textLight:'#059669' },
  amber:   { gradDark:'linear-gradient(135deg,#fbbf24,#d97706)', gradLight:'linear-gradient(135deg,#f59e0b,#b45309)', glowDark:'rgba(251,191,36,0.22)',   glowLight:'rgba(245,158,11,0.18)', textDark:'#fbbf24', textLight:'#d97706' },
  cyan:    { gradDark:'linear-gradient(135deg,#22d3ee,#0891b2)', gradLight:'linear-gradient(135deg,#06b6d4,#0e7490)', glowDark:'rgba(34,211,238,0.22)',   glowLight:'rgba(6,182,212,0.18)',  textDark:'#22d3ee', textLight:'#0891b2' },
};

const RANK_GRADS = [
  'linear-gradient(135deg,#fbbf24,#d97706)',
  'linear-gradient(135deg,#94a3b8,#64748b)',
  'linear-gradient(135deg,#cd7f32,#92400e)',
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#06b6d4,#0891b2)',
];

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

function useCountUp(target: number, duration = 1300, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    let raf: number;
    const timer = setTimeout(() => {
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
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d/7)}w ago`;
  return `${Math.floor(d/30)}mo ago`;
}

function Ring({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(pct), 500); return () => clearTimeout(t); }, [pct]);
  const r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (anim / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={5.5} className="text-zinc-200 dark:text-zinc-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5.5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1.3s cubic-bezier(0.34,1.56,0.64,1)', filter:`drop-shadow(0 0 5px ${color})` }} />
    </svg>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const range = (max - min) || 1;
  const W = 70, H = 24;
  const pts = values.map((v, i) => `${(i/(values.length-1))*W},${H-((v-min)/range)*H*0.9}`).join(' ');
  const id = `sp${color.replace(/[^a-z0-9]/gi,'')}${Math.random().toString(36).slice(2,6)}`;
  return (
    <svg width={W} height={H} style={{ overflow:'visible', opacity:0.6, flexShrink:0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${id})`} points={`0,${H} ${pts} ${W},${H}`} />
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type StatCardProps = {
  label: string; value: number; sub: string; icon: React.ReactNode;
  accent: keyof typeof ACCENTS; delay?: number; onClick?: () => void; spark?: number[];
};

function StatCard({ label, value, sub, icon, accent, delay = 0, onClick, spark }: StatCardProps) {
  const dark = useIsDark();
  const a = ACCENTS[accent];
  const grad = dark ? a.gradDark : a.gradLight;
  const glow = dark ? a.glowDark : a.glowLight;
  const text = dark ? a.textDark : a.textLight;
  const num = useCountUp(value, 1200, delay + 180);
  const { ref, visible } = useInView();
  const [hov, setHov] = useState(false);

  return (
    <div ref={ref} onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`relative rounded-2xl overflow-hidden cursor-${onClick ? 'pointer' : 'default'} transition-all duration-300 border`}
      style={{
        padding: '13px 14px',
        background: dark
          ? (hov ? 'rgba(255,255,255,0.038)' : 'rgba(255,255,255,0.025)')
          : (hov ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.9)'),
        borderColor: dark
          ? (hov ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.055)')
          : (hov ? 'rgba(0,0,0,0.14)' : 'rgba(0,0,0,0.07)'),
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
        transitionDelay: `${delay}ms`,
        boxShadow: hov
          ? (dark ? `0 14px 36px rgba(0,0,0,0.38), 0 0 0 1px ${glow}` : `0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px ${glow}`)
          : (dark ? '0 2px 10px rgba(0,0,0,0.18)' : '0 1px 6px rgba(0,0,0,0.06)'),
      }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:70, height:70, borderRadius:'50%', background: glow, filter:'blur(22px)', opacity: hov ? 0.9 : 0.35, transition:'opacity 0.35s', pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:9 }}>
              <div style={{ width:26, height:26, borderRadius:8, background: grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', flexShrink:0, boxShadow:`0 3px 10px ${glow}` }}>
                {icon}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400" style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {label}
              </p>
            </div>
            <p className="text-zinc-900 dark:text-white" style={{ fontSize:22, fontWeight:800, lineHeight:1, marginBottom:3, fontVariantNumeric:'tabular-nums' }}>
              {num.toLocaleString()}
            </p>
            <p className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:10, fontWeight:500 }}>{sub}</p>
          </div>
          {spark && <Sparkline values={spark} color={text} />}
        </div>
      </div>
      {onClick && (
        <FiArrowUpRight style={{ position:'absolute', top:10, right:10, fontSize:11, color: hov ? text : (dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.2)'), transition:'all 0.22s', transform: hov ? 'translate(1px,-1px)' : 'none' }} />
      )}
    </div>
  );
}

function PlanBar({ free, pro, enterprise, total }: { free:number; pro:number; enterprise:number; total:number }) {
  const [anim, setAnim] = useState(false);
  const { ref, visible } = useInView();
  useEffect(() => { if (visible) { const t = setTimeout(() => setAnim(true), 300); return () => clearTimeout(t); } }, [visible]);
  if (!total) return null;
  const fp = (free/total)*100, pp = (pro/total)*100, ep = (enterprise/total)*100;
  return (
    <div ref={ref}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-white/[0.025]"
      style={{ padding:'13px 15px', backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition:'opacity 0.5s ease, transform 0.5s ease' }}>
      <p className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', marginBottom:10 }}>Plan Distribution</p>
      <div className="bg-zinc-100 dark:bg-zinc-800/70" style={{ width:'100%', height:5, borderRadius:99, overflow:'hidden', display:'flex', gap:1 }}>
        {[
          { pct:fp, bg:'linear-gradient(90deg,#64748b,#475569)', delay:'0.2s' },
          { pct:pp, bg:'linear-gradient(90deg,#3b82f6,#1d4ed8)',  delay:'0.35s' },
          { pct:ep, bg:'linear-gradient(90deg,#8b5cf6,#6d28d9)',  delay:'0.5s' },
        ].map(({ pct:p, bg, delay:d },i) => (
          <div key={i} style={{ height:'100%', width: anim ? `${p}%` : '0%', background:bg, borderRadius:99, transition:`width 1.2s cubic-bezier(0.34,1.56,0.64,1) ${d}` }} />
        ))}
      </div>
      <div style={{ display:'flex', gap:14, marginTop:9, flexWrap:'wrap' }}>
        {[{l:'Free',v:free,c:'#64748b'},{l:'Pro',v:pro,c:'#3b82f6'},{l:'Enterprise',v:enterprise,c:'#8b5cf6'}].map(({ l,v,c }) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:5, height:5, borderRadius:99, background:c, boxShadow:`0 0 5px ${c}` }} />
            <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:10, fontWeight:600 }}>{l}</span>
            <span className="text-zinc-700 dark:text-zinc-300" style={{ fontSize:10, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, sub, pct, barColor, barColorLight, liveMode = false, delay = 0 }: {
  icon: React.ReactNode; title: string; value: number; sub: string;
  pct: number; barColor: string; barColorLight: string; liveMode?: boolean; delay?: number;
}) {
  const dark = useIsDark();
  const color = dark ? barColor : barColorLight;
  const pctNum = useCountUp(pct, 1100, delay + 280);
  const { ref, visible } = useInView();
  const [barW, setBarW] = useState(0);
  const [hov, setHov] = useState(false);
  useEffect(() => { if (visible) { const t = setTimeout(() => setBarW(pct), delay + 480); return () => clearTimeout(t); } }, [visible, pct, delay]);

  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-white/[0.024]"
      style={{
        padding:'16px 18px', overflow:'hidden', position:'relative',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition:`opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.3s`,
        boxShadow: hov ? (dark ? '0 14px 36px rgba(0,0,0,0.35)' : '0 10px 28px rgba(0,0,0,0.1)') : (dark ? '0 2px 10px rgba(0,0,0,0.16)' : '0 1px 6px rgba(0,0,0,0.05)'),
      }}>
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 80% -10%, ${color}15, transparent 55%)`, pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:9, background: color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', boxShadow:`0 4px 14px ${color}50` }}>
              {icon}
            </div>
            <span className="text-zinc-500 dark:text-zinc-400" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>{title}</span>
          </div>
          {!liveMode && (
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <Ring pct={pct} color={color} size={40} />
              <span className="text-zinc-800 dark:text-white" style={{ fontSize:13, fontWeight:800, fontVariantNumeric:'tabular-nums' }}>{pctNum}%</span>
            </div>
          )}
        </div>
        {liveMode && <p className="text-zinc-900 dark:text-white" style={{ fontSize:30, fontWeight:800, lineHeight:1, marginBottom:4, fontVariantNumeric:'tabular-nums' }}>{value.toLocaleString()}</p>}
        <p className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:11, marginBottom:12 }}>{sub}</p>
        {liveMode ? (
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'ov-livepulse 1.8s infinite' }} />
            <span style={{ fontSize:11, color:'#10b981', fontWeight:600 }}>Live tracking</span>
          </div>
        ) : (
          <div className="bg-zinc-100 dark:bg-zinc-800/70" style={{ width:'100%', height:3, borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background: color, width:`${barW}%`, boxShadow:`0 0 8px ${color}70`, transition:'width 1.3s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, sub, icon, bgDark, bgLight, glow, onClick, delay = 0 }: {
  label: string; sub: string; icon: React.ReactNode; bgDark: string; bgLight: string; glow: string; onClick: () => void; delay?: number;
}) {
  const dark = useIsDark();
  const bg = dark ? bgDark : bgLight;
  const [hov, setHov] = useState(false);
  const [down, setDown] = useState(false);
  const { ref, visible } = useInView();

  return (
    <button ref={ref as any} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setDown(false); }}
      onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)}
      className="text-left border"
      style={{
        all:'unset', display:'block', cursor:'pointer', position:'relative',
        borderRadius:15, padding:'15px 16px', background: bg, overflow:'hidden',
        borderColor: dark
          ? (hov ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)')
          : (hov ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.09)'),
        borderWidth:1, borderStyle:'solid',
        opacity: visible ? 1 : 0,
        transform: visible
          ? (down ? 'scale(0.96)' : hov ? 'translateY(-5px) scale(1.015)' : 'translateY(0) scale(1)')
          : 'translateY(18px) scale(0.97)',
        transition: `opacity 0.5s ease ${delay}ms, transform ${down ? '0.1s' : visible ? '0.35s' : `0.5s ease ${delay}ms`} cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.25s`,
        boxShadow: hov
          ? (dark ? `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px ${glow}` : `0 14px 36px rgba(0,0,0,0.14), 0 0 0 1px ${glow}`)
          : (dark ? '0 6px 22px rgba(0,0,0,0.28)' : '0 3px 12px rgba(0,0,0,0.08)'),
      }}>
      <div style={{ position:'absolute', inset:0, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)', opacity: hov ? 1 : 0, transition:'opacity 0.2s', borderRadius:15 }} />
      <div style={{ position:'absolute', top:-16, right:-16, width:65, height:65, borderRadius:'50%', background: glow, filter:'blur(22px)', opacity: hov ? 0.7 : 0.25, transition:'opacity 0.3s' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ width:34, height:34, borderRadius:10, background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color: dark ? '#fff' : '#1e293b', marginBottom:9, transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s', transform: hov ? 'scale(1.16) rotate(-7deg)' : 'scale(1)' }}>
          {icon}
        </div>
        <p className={dark ? 'text-white' : 'text-zinc-800'} style={{ fontSize:13, fontWeight:800, marginBottom:3, letterSpacing:'0.01em' }}>{label}</p>
        <p className={dark ? 'text-white/50' : 'text-zinc-500'} style={{ fontSize:10.5 }}>{sub}</p>
      </div>
      <FiArrowUpRight style={{ position:'absolute', bottom:13, right:14, fontSize:13, color: hov ? (dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.55)') : (dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)'), transition:'all 0.22s', transform: hov ? 'translate(2px,-2px)' : 'none' }} />
    </button>
  );
}

function UserRow({ user, index }: { user: User; index: number }) {
  const dark = useIsDark();
  const cfg = PLAN_CFG[user.plan] ?? PLAN_CFG.free;
  const grad = dark ? cfg.gradDark : cfg.gradLight;
  const soft = dark ? cfg.softDark : cfg.softLight;
  const text = dark ? cfg.textDark : cfg.textLight;
  const border = dark ? cfg.borderDark : cfg.borderLight;
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:11,
        background: hov ? (dark ? 'rgba(255,255,255,0.042)' : 'rgba(0,0,0,0.025)') : 'transparent',
        border:`1px solid ${hov ? (dark ? 'rgba(255,255,255,0.075)' : 'rgba(0,0,0,0.07)') : 'transparent'}`,
        transition:'all 0.2s ease',
        animation:'ov-rowIn 0.42s both ease-out', animationDelay:`${index*55}ms`,
      }}>
      {user.avatar_url && !imgErr ? (
        <img src={user.avatar_url} alt="" onError={() => setImgErr(true)}
          className="border border-zinc-200 dark:border-zinc-700"
          style={{ width:34, height:34, borderRadius:10, objectFit:'cover', flexShrink:0 }} />
      ) : (
        <div style={{ width:34, height:34, borderRadius:10, background: grad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, flexShrink:0, boxShadow:`0 4px 12px ${soft}` }}>
          {(user.display_name?.[0] || user.email[0]).toUpperCase()}
        </div>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        <p className="text-zinc-800 dark:text-white" style={{ fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2 }}>
          {user.display_name || user.email}
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', padding:'2px 7px', borderRadius:99, background: soft, color: text, border:`1px solid ${border}` }}>
            {cfg.label}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:10, fontFamily:'monospace' }}>{timeAgo(user.created_at)}</span>
        </div>
      </div>
      {user.is_admin && <FiShield style={{ fontSize:12, color:'#d97706', flexShrink:0 }} />}
    </div>
  );
}

function PromoRow({ promo, index }: { promo: PromoCode; index: number }) {
  const dark = useIsDark();
  const cfg = PLAN_CFG[promo.plan_type] ?? PLAN_CFG.free;
  const soft = dark ? cfg.softDark : cfg.softLight;
  const text = dark ? cfg.textDark : cfg.textLight;
  const border = dark ? cfg.borderDark : cfg.borderLight;
  const barColor = dark
    ? (promo.plan_type === 'enterprise' ? '#a78bfa' : '#60a5fa')
    : (promo.plan_type === 'enterprise' ? '#7c3aed' : '#2563eb');
  const [hov, setHov] = useState(false);
  const [barW, setBarW] = useState(0);
  const pct = promo.max_uses > 0 ? (promo.used_count / promo.max_uses) * 100 : 0;
  useEffect(() => { const t = setTimeout(() => setBarW(pct), 420 + index*80); return () => clearTimeout(t); }, [pct, index]);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:11,
        background: hov ? (dark ? 'rgba(255,255,255,0.042)' : 'rgba(0,0,0,0.025)') : 'transparent',
        border:`1px solid ${hov ? (dark ? 'rgba(255,255,255,0.075)' : 'rgba(0,0,0,0.07)') : 'transparent'}`,
        transition:'all 0.2s ease',
        animation:'ov-rowIn 0.42s both ease-out', animationDelay:`${index*55}ms`,
      }}>
      <div style={{ width:30, height:30, borderRadius:9, background: RANK_GRADS[index] ?? RANK_GRADS[4], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
        {index + 1}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <code className="text-zinc-800 dark:text-white" style={{ fontSize:12, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontFamily:'monospace' }}>{promo.code}</code>
          {!promo.is_active && (
            <span style={{ fontSize:9, fontWeight:700, padding:'1.5px 6px', borderRadius:99, background: dark ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.1)', color: dark ? '#f87171' : '#dc2626', border:`1px solid ${dark ? 'rgba(239,68,68,0.24)' : 'rgba(239,68,68,0.2)'}`, letterSpacing:'0.06em', textTransform:'uppercase', flexShrink:0 }}>off</span>
          )}
          <span style={{ fontSize:9, fontWeight:700, padding:'1.5px 6px', borderRadius:99, background: soft, color: text, border:`1px solid ${border}`, letterSpacing:'0.06em', textTransform:'uppercase', flexShrink:0 }}>{promo.plan_type}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="bg-zinc-100 dark:bg-zinc-700/60" style={{ flex:1, height:3, borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background: barColor, width:`${barW}%`, boxShadow:`0 0 6px ${barColor}70`, transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
          <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:10, fontFamily:'monospace', flexShrink:0 }}>{promo.used_count}/{promo.max_uses}</span>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, iconBg, icon, linkLabel, onLink, children, delay = 0 }: {
  title: string; iconBg: string; icon: React.ReactNode; linkLabel: string;
  onLink: () => void; children: React.ReactNode; delay?: number;
}) {
  const { ref, visible } = useInView();
  const [hovLink, setHovLink] = useState(false);
  return (
    <div ref={ref}
      className="rounded-2xl border border-zinc-100 dark:border-zinc-800/60 bg-white/80 dark:bg-white/[0.024]"
      style={{
        padding:'16px', overflow:'hidden',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition:`opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background: iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff' }}>{icon}</div>
          <span className="text-zinc-800 dark:text-white" style={{ fontSize:13, fontWeight:700 }}>{title}</span>
        </div>
        <button onClick={onLink} onMouseEnter={() => setHovLink(true)} onMouseLeave={() => setHovLink(false)}
          style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontSize:9.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', transition:'color 0.2s' }}
          className={hovLink ? 'text-zinc-600 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}>
          {linkLabel} <FiArrowUpRight style={{ transition:'transform 0.2s', transform: hovLink ? 'translate(1px,-1px)' : 'none' }} />
        </button>
      </div>
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span className="text-zinc-400 dark:text-zinc-500" style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{children}</span>
      <div className="bg-zinc-200 dark:bg-zinc-800" style={{ flex:1, height:'1px' }} />
    </div>
  );
}

export default function Overview({ users, promoCodes, redemptions, onNavigate, onCreatePromo }: OverviewProps) {
  const stats = {
    totalUsers:           users.length,
    freeUsers:            users.filter(u => u.plan === 'free').length,
    proUsers:             users.filter(u => u.plan === 'pro').length,
    enterpriseUsers:      users.filter(u => u.plan === 'enterprise').length,
    activePromos:         promoCodes.filter(p => p.is_active).length,
    totalPromos:          promoCodes.length,
    totalRedemptions:     redemptions.length,
    activeRedemptions:    redemptions.filter(r => new Date(r.expires_at) > new Date()).length,
    totalPromoUses:       promoCodes.reduce((s,p) => s + p.used_count, 0),
    newUsersThisMonth:    users.filter(u => {
      const c = new Date(u.created_at), n = new Date();
      return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear();
    }).length,
    redemptionsThisMonth: redemptions.filter(r => {
      const c = new Date(r.redeemed_at), n = new Date();
      return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear();
    }).length,
  };

  const totalMaxUses   = promoCodes.reduce((s,p) => s + p.max_uses, 0);
  const conversionRate = stats.totalUsers > 0 ? Math.round(((stats.proUsers + stats.enterpriseUsers) / stats.totalUsers) * 100) : 0;
  const promoUsageRate = totalMaxUses > 0 ? Math.round((stats.totalPromoUses / totalMaxUses) * 100) : 0;
  const safePct = (n: number) => stats.totalUsers > 0 ? Math.round((n/stats.totalUsers)*100) : 0;

  const recentUsers = [...users].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,5);
  const topPromos   = [...promoCodes].sort((a,b) => b.used_count - a.used_count).slice(0,5);

  const mockSpark = (n: number) => Array.from({ length:8 }, (_,i) => Math.max(0, Math.round(n*0.5 + i*(n*0.07) + Math.random()*n*0.08)));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .ov-wrap, .ov-wrap * { box-sizing:border-box; font-family:'Plus Jakarta Sans',system-ui,sans-serif; }
        @keyframes ov-rowIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes ov-livepulse {
          0%,100% { box-shadow:0 0 0 0 rgba(16,185,129,0.55); }
          50%      { box-shadow:0 0 0 5px rgba(16,185,129,0); }
        }
        .ov-g6 { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
        .ov-g3 { display:grid; grid-template-columns:1fr; gap:9px; }
        .ov-g4 { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
        .ov-g2 { display:grid; grid-template-columns:1fr; gap:9px; }
        @media(min-width:540px){
          .ov-g6 { grid-template-columns:repeat(3,1fr); }
          .ov-g3 { grid-template-columns:repeat(2,1fr); }
        }
        @media(min-width:900px){
          .ov-g6 { grid-template-columns:repeat(6,1fr); }
          .ov-g3 { grid-template-columns:repeat(3,1fr); }
          .ov-g4 { grid-template-columns:repeat(4,1fr); }
          .ov-g2 { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="ov-wrap" style={{ display:'flex', flexDirection:'column', gap:11 }}>

        <SLabel>Overview</SLabel>

        <div className="ov-g6">
          <StatCard label="Total Users"   value={stats.totalUsers}       sub={`+${stats.newUsersThisMonth} this month`}  icon={<FiUsers />}          accent="sky"     delay={0}   onClick={() => onNavigate('users')} spark={mockSpark(stats.totalUsers)} />
          <StatCard label="Free"          value={stats.freeUsers}        sub={`${safePct(stats.freeUsers)}% of total`}    icon={<FiUsers />}          accent="cyan"    delay={50}  />
          <StatCard label="Pro"           value={stats.proUsers}         sub={`${safePct(stats.proUsers)}% of total`}     icon={<RiVipDiamondLine />} accent="sky"     delay={100} />
          <StatCard label="Enterprise"    value={stats.enterpriseUsers}  sub={`${safePct(stats.enterpriseUsers)}% of total`} icon={<RiVipCrownLine />} accent="violet" delay={150} />
          <StatCard label="Active Promos" value={stats.activePromos}     sub={`${stats.totalPromos} total codes`}          icon={<FiGift />}           accent="emerald" delay={200} onClick={() => onNavigate('promos')} />
          <StatCard label="Redemptions"   value={stats.totalRedemptions} sub={`+${stats.redemptionsThisMonth} this month`} icon={<FiActivity />}       accent="amber"   delay={250} />
        </div>

        <PlanBar free={stats.freeUsers} pro={stats.proUsers} enterprise={stats.enterpriseUsers} total={stats.totalUsers} />

        <SLabel>Performance</SLabel>

        <div className="ov-g3">
          <MetricCard icon={<FiTrendingUp />} title="Conversion Rate"      value={conversionRate}          sub="Users on paid plans"              pct={conversionRate}  barColor="#38bdf8" barColorLight="#0284c7" delay={0}   />
          <MetricCard icon={<FiGift />}       title="Promo Usage"          value={promoUsageRate}          sub={`${stats.totalPromoUses}/${totalMaxUses} used`} pct={promoUsageRate}  barColor="#a78bfa" barColorLight="#7c3aed" delay={80}  />
          <MetricCard icon={<FiActivity />}   title="Active Subscriptions" value={stats.activeRedemptions} sub="Currently active redemptions"    pct={0}               barColor="#34d399" barColorLight="#059669" liveMode delay={160} />
        </div>

        <SLabel>Quick Actions</SLabel>

        <div className="ov-g4">
          <ActionBtn label="Monitoring"   sub="Live activity & health" icon={<FiEye />}       bgDark="linear-gradient(135deg,#0a1628,#0f2545)" bgLight="linear-gradient(135deg,#e0f2fe,#bae6fd)" glow="rgba(14,165,233,0.28)"   onClick={() => onNavigate('monitoring')} delay={0}   />
          <ActionBtn label="Analytics"    sub="Charts & usage stats"   icon={<FiBarChart2 />} bgDark="linear-gradient(135deg,#110a28,#1e1245)" bgLight="linear-gradient(135deg,#ede9fe,#ddd6fe)" glow="rgba(139,92,246,0.28)"  onClick={() => onNavigate('analytics')} delay={60}  />
          <ActionBtn label="Create Promo" sub="Generate new codes"     icon={<FiPlus />}      bgDark="linear-gradient(135deg,#041a0e,#072c17)" bgLight="linear-gradient(135deg,#d1fae5,#a7f3d0)" glow="rgba(16,185,129,0.28)"  onClick={onCreatePromo}                  delay={120} />
          <ActionBtn label="Manage Users" sub="View & edit accounts"   icon={<FiUsers />}     bgDark="linear-gradient(135deg,#1a1002,#2c1f04)" bgLight="linear-gradient(135deg,#fef3c7,#fde68a)" glow="rgba(245,158,11,0.28)"  onClick={() => onNavigate('users')}      delay={180} />
        </div>

        <SLabel>Recent Activity</SLabel>

        <div className="ov-g2">
          <Panel title="Recent Users"    iconBg="linear-gradient(135deg,#0ea5e9,#0369a1)" icon={<FiUsers />} linkLabel="View all" onLink={() => onNavigate('users')}  delay={0}>
            {recentUsers.length === 0
              ? <p className="text-zinc-400 dark:text-zinc-500" style={{ textAlign:'center', padding:'22px 0', fontSize:11 }}>No users yet</p>
              : <div style={{ display:'flex', flexDirection:'column', gap:2 }}>{recentUsers.map((u,i) => <UserRow key={u.user_id} user={u} index={i} />)}</div>
            }
          </Panel>

          <Panel title="Top Promo Codes" iconBg="linear-gradient(135deg,#8b5cf6,#6d28d9)" icon={<FiGift />} linkLabel="View all" onLink={() => onNavigate('promos')} delay={80}>
            {topPromos.length === 0
              ? <p className="text-zinc-400 dark:text-zinc-500" style={{ textAlign:'center', padding:'22px 0', fontSize:11 }}>No promo codes yet</p>
              : <div style={{ display:'flex', flexDirection:'column', gap:2 }}>{topPromos.map((p,i) => <PromoRow key={p.id} promo={p} index={i} />)}</div>
            }
          </Panel>
        </div>

      </div>
    </>
  );
}
