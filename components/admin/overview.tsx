import { useEffect, useRef, useState } from 'react';
import { FiUsers, FiGift, FiActivity, FiTrendingUp, FiPlus, FiEye, FiBarChart2, FiArrowUpRight, FiShield } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

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

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════════ */

const PLAN: Record<string, { grad: string; soft: string; text: string; border: string; label: string }> = {
  enterprise: { grad: 'linear-gradient(135deg,#a78bfa,#7c3aed)', soft: 'rgba(139,92,246,0.13)', text: '#c4b5fd', border: 'rgba(139,92,246,0.32)', label: 'Enterprise' },
  pro:        { grad: 'linear-gradient(135deg,#60a5fa,#2563eb)', soft: 'rgba(59,130,246,0.13)',  text: '#93c5fd', border: 'rgba(59,130,246,0.32)',  label: 'Pro'        },
  free:       { grad: 'linear-gradient(135deg,#94a3b8,#475569)', soft: 'rgba(100,116,139,0.1)',  text: '#94a3b8', border: 'rgba(100,116,139,0.22)', label: 'Free'       },
};
const P = (plan: string) => PLAN[plan] ?? PLAN.free;

const ACCENTS = {
  sky:     { grad:'linear-gradient(135deg,#38bdf8,#0284c7)', glow:'rgba(56,189,248,0.22)',  text:'#38bdf8' },
  violet:  { grad:'linear-gradient(135deg,#a78bfa,#7c3aed)', glow:'rgba(167,139,250,0.22)', text:'#a78bfa' },
  emerald: { grad:'linear-gradient(135deg,#34d399,#059669)', glow:'rgba(52,211,153,0.22)',  text:'#34d399' },
  amber:   { grad:'linear-gradient(135deg,#fbbf24,#d97706)', glow:'rgba(251,191,36,0.22)',  text:'#fbbf24' },
  cyan:    { grad:'linear-gradient(135deg,#22d3ee,#0891b2)', glow:'rgba(34,211,238,0.22)',  text:'#22d3ee' },
  rose:    { grad:'linear-gradient(135deg,#fb7185,#e11d48)', glow:'rgba(251,113,133,0.22)', text:'#fb7185' },
};

const RANK_GRADS = [
  'linear-gradient(135deg,#fbbf24,#d97706)',
  'linear-gradient(135deg,#94a3b8,#64748b)',
  'linear-gradient(135deg,#cd7f32,#92400e)',
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#06b6d4,#0891b2)',
];

/* ══════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════ */

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
        const ease = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3)/2;
        setVal(Math.round(ease * target));
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

/* ══════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════ */

function timeAgo(date: string) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d/7)}w ago`;
  return `${Math.floor(d/30)}mo ago`;
}

/* ══════════════════════════════════════════════════════════════
   SVG RING CHART
══════════════════════════════════════════════════════════════ */

function Ring({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(pct), 500); return () => clearTimeout(t); }, [pct]);
  const r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (anim / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5.5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5.5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1.3s cubic-bezier(0.34,1.56,0.64,1)', filter:`drop-shadow(0 0 5px ${color})` }} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   SPARKLINE
══════════════════════════════════════════════════════════════ */

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const range = (max - min) || 1;
  const W = 72, H = 26;
  const pts = values.map((v, i) =>
    `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * H * 0.9}`
  ).join(' ');
  const id = `sp-${color.replace(/[^a-z0-9]/gi,'')}`;
  return (
    <svg width={W} height={H} style={{ overflow:'visible', opacity:0.65, flexShrink:0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${id})`}
        points={`0,${H} ${pts} ${W},${H}`} />
      <polyline fill="none" stroke={color} strokeWidth="1.5"
        points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════════ */

type StatCardProps = {
  label: string; value: number; sub: string; icon: React.ReactNode;
  accent: keyof typeof ACCENTS; delay?: number; onClick?: () => void; spark?: number[];
};

function StatCard({ label, value, sub, icon, accent, delay = 0, onClick, spark }: StatCardProps) {
  const a = ACCENTS[accent];
  const num = useCountUp(value, 1200, delay + 180);
  const { ref, visible } = useInView();
  const [hov, setHov] = useState(false);

  return (
    <div ref={ref} onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:'relative', borderRadius:15, padding:'13px 14px', overflow:'hidden',
        background: hov ? 'rgba(255,255,255,0.038)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.055)'}`,
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        cursor: onClick ? 'pointer' : 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.98)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.25s, border-color 0.25s, box-shadow 0.3s`,
        boxShadow: hov ? `0 14px 36px rgba(0,0,0,0.38), 0 0 0 1px ${a.glow}` : '0 2px 10px rgba(0,0,0,0.18)',
      }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:70, height:70, borderRadius:'50%', background: a.glow, filter:'blur(22px)', opacity: hov ? 0.9 : 0.3, transition:'opacity 0.35s', pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:9 }}>
              <div style={{ width:26, height:26, borderRadius:8, background: a.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', flexShrink:0, boxShadow:`0 3px 10px ${a.glow}` }}>
                {icon}
              </div>
              <p style={{ fontSize:9.5, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.09em', textTransform:'uppercase', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {label}
              </p>
            </div>
            <p style={{ fontSize:22, fontWeight:800, color:'#fff', lineHeight:1, marginBottom:3, fontVariantNumeric:'tabular-nums' }}>
              {num.toLocaleString()}
            </p>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.26)', fontWeight:500 }}>{sub}</p>
          </div>
          {spark && <Sparkline values={spark} color={a.text} />}
        </div>
      </div>
      {onClick && (
        <FiArrowUpRight style={{ position:'absolute', top:10, right:10, fontSize:11, color: hov ? a.text : 'rgba(255,255,255,0.16)', transition:'all 0.22s', transform: hov ? 'translate(1px,-1px)' : 'none' }} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PLAN DISTRIBUTION BAR
══════════════════════════════════════════════════════════════ */

function PlanBar({ free, pro, enterprise, total }: { free:number; pro:number; enterprise:number; total:number }) {
  const [anim, setAnim] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnim(true), 700); return () => clearTimeout(t); }, []);
  const { ref, visible } = useInView();
  if (!total) return null;
  const fp = (free/total)*100, pp = (pro/total)*100, ep = (enterprise/total)*100;
  return (
    <div ref={ref} style={{ borderRadius:14, padding:'13px 15px', background:'rgba(255,255,255,0.022)', border:'1px solid rgba(255,255,255,0.048)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition:'opacity 0.5s ease, transform 0.5s ease' }}>
      <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:10 }}>Plan Distribution</p>
      <div style={{ width:'100%', height:5, borderRadius:99, overflow:'hidden', background:'rgba(255,255,255,0.05)', display:'flex', gap:1 }}>
        {[
          { pct: fp, bg:'linear-gradient(90deg,#64748b,#475569)', delay:'0.2s' },
          { pct: pp, bg:'linear-gradient(90deg,#60a5fa,#2563eb)', delay:'0.35s' },
          { pct: ep, bg:'linear-gradient(90deg,#a78bfa,#7c3aed)', delay:'0.5s' },
        ].map(({ pct: p, bg, delay: d }, i) => (
          <div key={i} style={{ height:'100%', width: anim ? `${p}%` : '0%', background: bg, borderRadius:99, transition:`width 1.2s cubic-bezier(0.34,1.56,0.64,1) ${d}` }} />
        ))}
      </div>
      <div style={{ display:'flex', gap:14, marginTop:9, flexWrap:'wrap' }}>
        {[
          { l:'Free', v:free, c:'#64748b' },
          { l:'Pro', v:pro, c:'#60a5fa' },
          { l:'Enterprise', v:enterprise, c:'#a78bfa' },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:5, height:5, borderRadius:99, background:c, boxShadow:`0 0 5px ${c}` }} />
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>{l}</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.65)', fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   METRIC CARD
══════════════════════════════════════════════════════════════ */

function MetricCard({ icon, title, value, sub, pct, barColor, liveMode = false, delay = 0 }: {
  icon: React.ReactNode; title: string; value: number; sub: string;
  pct: number; barColor: string; liveMode?: boolean; delay?: number;
}) {
  const num = useCountUp(liveMode ? value : pct, 1100, delay + 280);
  const { ref, visible } = useInView();
  const [barW, setBarW] = useState(0);
  const [hov, setHov] = useState(false);
  useEffect(() => { if (visible) { const t = setTimeout(() => setBarW(pct), delay + 480); return () => clearTimeout(t); } }, [visible, pct, delay]);

  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius:15, padding:'16px 18px', overflow:'hidden', position:'relative',
        background: hov ? 'rgba(255,255,255,0.034)' : 'rgba(255,255,255,0.024)',
        border:`1px solid ${hov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.052)'}`,
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition:`opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, background 0.25s, border-color 0.25s, box-shadow 0.3s`,
        boxShadow: hov ? '0 14px 36px rgba(0,0,0,0.36)' : '0 2px 10px rgba(0,0,0,0.16)',
      }}>
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 80% -10%, ${barColor}18, transparent 55%)`, pointerEvents:'none' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:9, background: barColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', boxShadow:`0 4px 14px ${barColor}55` }}>
              {icon}
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{title}</span>
          </div>
          {!liveMode && (
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <Ring pct={pct} color={barColor} size={40} />
              <span style={{ fontSize:13, fontWeight:800, color:'#fff', fontVariantNumeric:'tabular-nums' }}>{num}%</span>
            </div>
          )}
        </div>
        {liveMode && <p style={{ fontSize:30, fontWeight:800, color:'#fff', lineHeight:1, marginBottom:4, fontVariantNumeric:'tabular-nums' }}>{value.toLocaleString()}</p>}
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:12 }}>{sub}</p>
        {liveMode ? (
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#34d399', display:'inline-block', animation:'ov-livepulse 1.8s infinite' }} />
            <span style={{ fontSize:11, color:'#34d399', fontWeight:600 }}>Live tracking</span>
          </div>
        ) : (
          <div style={{ width:'100%', height:3, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background: barColor, width:`${barW}%`, boxShadow:`0 0 8px ${barColor}80`, transition:'width 1.3s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACTION BUTTON
══════════════════════════════════════════════════════════════ */

function ActionBtn({ label, sub, icon, bg, glow, onClick, delay = 0 }: {
  label: string; sub: string; icon: React.ReactNode; bg: string; glow: string; onClick: () => void; delay?: number;
}) {
  const [hov, setHov] = useState(false);
  const [down, setDown] = useState(false);
  const { ref, visible } = useInView();

  return (
    <button ref={ref as any} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => { setHov(false); setDown(false); }}
      onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)}
      style={{
        all:'unset', display:'block', cursor:'pointer', position:'relative',
        borderRadius:15, padding:'15px 16px', background: bg, overflow:'hidden', textAlign:'left',
        border:`1px solid ${hov ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? (down ? 'scale(0.96)' : hov ? 'translateY(-5px) scale(1.015)' : 'translateY(0) scale(1)')
          : 'translateY(18px) scale(0.97)',
        transition: `opacity 0.5s ease ${delay}ms, transform ${down ? '0.1s' : visible ? '0.35s' : `0.5s ease ${delay}ms`} cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.25s`,
        boxShadow: hov ? `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px ${glow}` : '0 6px 22px rgba(0,0,0,0.28)',
      }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.05)', opacity: hov ? 1 : 0, transition:'opacity 0.2s', borderRadius:15 }} />
      <div style={{ position:'absolute', top:-16, right:-16, width:65, height:65, borderRadius:'50%', background: glow, filter:'blur(22px)', opacity: hov ? 0.7 : 0.2, transition:'opacity 0.3s' }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.16)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#fff', marginBottom:9, transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.2s', transform: hov ? 'scale(1.16) rotate(-7deg)' : 'scale(1)' }}>
          {icon}
        </div>
        <p style={{ fontSize:13, fontWeight:800, color:'#fff', marginBottom:3, letterSpacing:'0.01em' }}>{label}</p>
        <p style={{ fontSize:10.5, color:'rgba(255,255,255,0.5)' }}>{sub}</p>
      </div>
      <FiArrowUpRight style={{ position:'absolute', bottom:13, right:14, fontSize:13, color: hov ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.18)', transition:'all 0.22s', transform: hov ? 'translate(2px,-2px)' : 'none' }} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   USER ROW
══════════════════════════════════════════════════════════════ */

function UserRow({ user, index }: { user: User; index: number }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const cfg = P(user.plan);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:11,
        background: hov ? 'rgba(255,255,255,0.042)' : 'transparent',
        border:`1px solid ${hov ? 'rgba(255,255,255,0.075)' : 'transparent'}`,
        transition:'all 0.2s ease',
        animation:'ov-rowIn 0.42s both ease-out', animationDelay:`${index * 55}ms`,
      }}>
      {user.avatar_url && !imgErr ? (
        <img src={user.avatar_url} alt="" onError={() => setImgErr(true)}
          style={{ width:34, height:34, borderRadius:10, objectFit:'cover', flexShrink:0, border:'1.5px solid rgba(255,255,255,0.1)' }} />
      ) : (
        <div style={{ width:34, height:34, borderRadius:10, background: cfg.grad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, flexShrink:0, boxShadow:`0 4px 12px ${cfg.soft}` }}>
          {(user.display_name?.[0] || user.email[0]).toUpperCase()}
        </div>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.85)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2 }}>
          {user.display_name || user.email}
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', padding:'2px 7px', borderRadius:99, background: cfg.soft, color: cfg.text, border:`1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.22)', fontFamily:'monospace' }}>{timeAgo(user.created_at)}</span>
        </div>
      </div>
      {user.is_admin && <FiShield style={{ fontSize:12, color:'#fbbf24', flexShrink:0 }} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROMO ROW
══════════════════════════════════════════════════════════════ */

function PromoRow({ promo, index }: { promo: PromoCode; index: number }) {
  const [hov, setHov] = useState(false);
  const [barW, setBarW] = useState(0);
  const pct = promo.max_uses > 0 ? (promo.used_count / promo.max_uses) * 100 : 0;
  const barColor = promo.plan_type === 'enterprise' ? '#a78bfa' : '#60a5fa';
  const cfg = P(promo.plan_type);
  useEffect(() => { const t = setTimeout(() => setBarW(pct), 420 + index * 80); return () => clearTimeout(t); }, [pct, index]);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:11,
        background: hov ? 'rgba(255,255,255,0.042)' : 'transparent',
        border:`1px solid ${hov ? 'rgba(255,255,255,0.075)' : 'transparent'}`,
        transition:'all 0.2s ease',
        animation:'ov-rowIn 0.42s both ease-out', animationDelay:`${index * 55}ms`,
      }}>
      <div style={{ width:30, height:30, borderRadius:9, background: RANK_GRADS[index] ?? RANK_GRADS[4], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
        {index + 1}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <code style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.88)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontFamily:'monospace' }}>{promo.code}</code>
          {!promo.is_active && (
            <span style={{ fontSize:9, fontWeight:700, padding:'1.5px 6px', borderRadius:99, background:'rgba(239,68,68,0.14)', color:'#f87171', border:'1px solid rgba(239,68,68,0.24)', letterSpacing:'0.06em', textTransform:'uppercase', flexShrink:0 }}>off</span>
          )}
          <span style={{ fontSize:9, fontWeight:700, padding:'1.5px 6px', borderRadius:99, background: cfg.soft, color: cfg.text, border:`1px solid ${cfg.border}`, letterSpacing:'0.06em', textTransform:'uppercase', flexShrink:0 }}>{promo.plan_type}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background: barColor, width:`${barW}%`, boxShadow:`0 0 6px ${barColor}80`, transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.24)', fontFamily:'monospace', flexShrink:0 }}>{promo.used_count}/{promo.max_uses}</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PANEL CONTAINER
══════════════════════════════════════════════════════════════ */

function Panel({ title, iconBg, icon, linkLabel, onLink, children, delay = 0 }: {
  title: string; iconBg: string; icon: React.ReactNode; linkLabel: string;
  onLink: () => void; children: React.ReactNode; delay?: number;
}) {
  const { ref, visible } = useInView();
  const [hovLink, setHovLink] = useState(false);
  return (
    <div ref={ref} style={{
      borderRadius:16, padding:'16px', overflow:'hidden',
      background:'rgba(255,255,255,0.024)', border:'1px solid rgba(255,255,255,0.052)',
      backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(18px)',
      transition:`opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background: iconBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff' }}>{icon}</div>
          <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.88)' }}>{title}</span>
        </div>
        <button onClick={onLink} onMouseEnter={() => setHovLink(true)} onMouseLeave={() => setHovLink(false)}
          style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontSize:9.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: hovLink ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)', transition:'color 0.2s' }}>
          {linkLabel} <FiArrowUpRight style={{ transition:'transform 0.2s', transform: hovLink ? 'translate(1px,-1px)' : 'none' }} />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION LABEL
══════════════════════════════════════════════════════════════ */

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', whiteSpace:'nowrap' }}>{children}</span>
      <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,rgba(255,255,255,0.07),transparent)' }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════ */

export default function Overview({ users, promoCodes, redemptions, onNavigate, onCreatePromo }: OverviewProps) {
  const stats = {
    totalUsers:          users.length,
    freeUsers:           users.filter(u => u.plan === 'free').length,
    proUsers:            users.filter(u => u.plan === 'pro').length,
    enterpriseUsers:     users.filter(u => u.plan === 'enterprise').length,
    activePromos:        promoCodes.filter(p => p.is_active).length,
    totalPromos:         promoCodes.length,
    totalRedemptions:    redemptions.length,
    activeRedemptions:   redemptions.filter(r => new Date(r.expires_at) > new Date()).length,
    totalPromoUses:      promoCodes.reduce((s, p) => s + p.used_count, 0),
    newUsersThisMonth:   users.filter(u => {
      const c = new Date(u.created_at), n = new Date();
      return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear();
    }).length,
    redemptionsThisMonth: redemptions.filter(r => {
      const c = new Date(r.redeemed_at), n = new Date();
      return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear();
    }).length,
  };

  const totalMaxUses   = promoCodes.reduce((s, p) => s + p.max_uses, 0);
  const conversionRate = stats.totalUsers > 0 ? Math.round(((stats.proUsers + stats.enterpriseUsers) / stats.totalUsers) * 100) : 0;
  const promoUsageRate = totalMaxUses > 0 ? Math.round((stats.totalPromoUses / totalMaxUses) * 100) : 0;
  const pct = (n: number) => stats.totalUsers > 0 ? Math.round((n / stats.totalUsers) * 100) : 0;

  const recentUsers = [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const topPromos   = [...promoCodes].sort((a, b) => b.used_count - a.used_count).slice(0, 5);

  const mockSpark = (n: number) => Array.from({ length: 8 }, (_, i) => Math.max(0, Math.round(n * 0.5 + i * (n * 0.07) + Math.random() * n * 0.1)));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap');
        .ov * { box-sizing:border-box; font-family:'Plus Jakarta Sans',system-ui,sans-serif; }
        @keyframes ov-rowIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes ov-livepulse {
          0%,100% { box-shadow:0 0 0 0 rgba(52,211,153,0.55); }
          50%      { box-shadow:0 0 0 5px rgba(52,211,153,0); }
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

      <div className="ov" style={{ display:'flex', flexDirection:'column', gap:11 }}>

        <SLabel>Overview</SLabel>

        <div className="ov-g6">
          <StatCard label="Total Users"   value={stats.totalUsers}        sub={`+${stats.newUsersThisMonth} this month`}  icon={<FiUsers />}          accent="sky"     delay={0}   onClick={() => onNavigate('users')} spark={mockSpark(stats.totalUsers)} />
          <StatCard label="Free"          value={stats.freeUsers}         sub={`${pct(stats.freeUsers)}% of total`}        icon={<FiUsers />}          accent="cyan"    delay={50}  />
          <StatCard label="Pro"           value={stats.proUsers}          sub={`${pct(stats.proUsers)}% of total`}          icon={<RiVipDiamondLine />} accent="sky"     delay={100} />
          <StatCard label="Enterprise"    value={stats.enterpriseUsers}   sub={`${pct(stats.enterpriseUsers)}% of total`}  icon={<RiVipCrownLine />}   accent="violet"  delay={150} />
          <StatCard label="Active Promos" value={stats.activePromos}      sub={`${stats.totalPromos} total codes`}          icon={<FiGift />}           accent="emerald" delay={200} onClick={() => onNavigate('promos')} />
          <StatCard label="Redemptions"   value={stats.totalRedemptions}  sub={`+${stats.redemptionsThisMonth} this month`} icon={<FiActivity />}       accent="amber"   delay={250} />
        </div>

        <PlanBar free={stats.freeUsers} pro={stats.proUsers} enterprise={stats.enterpriseUsers} total={stats.totalUsers} />

        <SLabel>Performance</SLabel>

        <div className="ov-g3">
          <MetricCard icon={<FiTrendingUp />} title="Conversion Rate"     value={conversionRate}         sub="Users on paid plans"              pct={conversionRate}  barColor="#38bdf8" delay={0}   />
          <MetricCard icon={<FiGift />}       title="Promo Usage"         value={promoUsageRate}         sub={`${stats.totalPromoUses}/${totalMaxUses} used`} pct={promoUsageRate}  barColor="#a78bfa" delay={80}  />
          <MetricCard icon={<FiActivity />}   title="Active Subscriptions" value={stats.activeRedemptions} sub="Currently active redemptions"   pct={0}               barColor="#34d399" liveMode delay={160} />
        </div>

        <SLabel>Quick Actions</SLabel>

        <div className="ov-g4">
          <ActionBtn label="Monitoring"    sub="Live activity & health"   icon={<FiEye />}      bg="linear-gradient(135deg,#0a1628,#0f2545)" glow="rgba(56,189,248,0.3)"   onClick={() => onNavigate('monitoring')} delay={0}   />
          <ActionBtn label="Analytics"     sub="Charts & usage stats"     icon={<FiBarChart2 />} bg="linear-gradient(135deg,#110a28,#1e1245)" glow="rgba(167,139,250,0.3)"  onClick={() => onNavigate('analytics')} delay={60}  />
          <ActionBtn label="Create Promo"  sub="Generate new codes"       icon={<FiPlus />}     bg="linear-gradient(135deg,#041a0e,#072c17)" glow="rgba(52,211,153,0.32)"  onClick={onCreatePromo}                  delay={120} />
          <ActionBtn label="Manage Users"  sub="View & edit accounts"     icon={<FiUsers />}    bg="linear-gradient(135deg,#1a1002,#2c1f04)" glow="rgba(251,191,36,0.3)"   onClick={() => onNavigate('users')}      delay={180} />
        </div>

        <SLabel>Recent Activity</SLabel>

        <div className="ov-g2">
          <Panel title="Recent Users" iconBg="linear-gradient(135deg,#38bdf8,#0284c7)" icon={<FiUsers />} linkLabel="View all" onLink={() => onNavigate('users')} delay={0}>
            {recentUsers.length === 0
              ? <p style={{ textAlign:'center', padding:'22px 0', fontSize:11, color:'rgba(255,255,255,0.18)' }}>No users yet</p>
              : <div style={{ display:'flex', flexDirection:'column', gap:2 }}>{recentUsers.map((u, i) => <UserRow key={u.user_id} user={u} index={i} />)}</div>
            }
          </Panel>

          <Panel title="Top Promo Codes" iconBg="linear-gradient(135deg,#a78bfa,#7c3aed)" icon={<FiGift />} linkLabel="View all" onLink={() => onNavigate('promos')} delay={80}>
            {topPromos.length === 0
              ? <p style={{ textAlign:'center', padding:'22px 0', fontSize:11, color:'rgba(255,255,255,0.18)' }}>No promo codes yet</p>
              : <div style={{ display:'flex', flexDirection:'column', gap:2 }}>{topPromos.map((p, i) => <PromoRow key={p.id} promo={p} index={i} />)}</div>
            }
          </Panel>
        </div>

      </div>
    </>
  );
}
