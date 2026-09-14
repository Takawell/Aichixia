import { useState, useEffect, useRef } from 'react';
import { FiKey, FiCopy, FiCheck, FiTrash2, FiEdit2, FiSave, FiX, FiPlus, FiAlertCircle, FiActivity, FiClock, FiShield, FiZap, FiGlobe, FiTag, FiLock, FiChevronDown } from 'react-icons/fi';

type ApiKey = {
  id: string;
  user_id: string;
  key: string;
  name: string;
  prefix: string;
  is_active: boolean;
  rate_limit: number;
  requests_used: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
};

type PlanType = 'free' | 'pro' | 'enterprise';

type CreateKeyPayload = {
  name: string;
  rateLimit: number;
  ipWhitelist: string[];
  expiresIn: string;
};

type ApiKeysProps = {
  keys: ApiKey[];
  onCopy: (text: string, id: string) => void;
  copiedKey: string | null;
  onCreateKey: (payload: CreateKeyPayload) => Promise<string | null> | void;
  onRevokeKey: (key: ApiKey) => void;
  onUpdateKeyName: (keyId: string, name: string) => void;
  actionLoading: boolean;
  plan?: PlanType;
};

const PLAN_MAX_KEYS: Record<PlanType, number> = {
  free: 1,
  pro: 1,
  enterprise: 3,
};

function normalizePlan(plan: unknown): PlanType {
  const value = String(plan || '').trim().toLowerCase();
  if (value === 'enterprise') return 'enterprise';
  if (value === 'pro') return 'pro';
  return 'free';
}

const PLAN_LIMITS: Record<PlanType, { label: string; rateOptions: number[]; color: string }> = {
  free: { label: 'Free', rateOptions: [250, 500, 1000], color: '#38bdf8' },
  pro: { label: 'Pro', rateOptions: [1000, 2000, 4000], color: '#a855f7' },
  enterprise: { label: 'Enterprise', rateOptions: [2000, 4000, 8000], color: '#fb7185' },
};

const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
];

const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

function isValidIp(ip: string) {
  if (!ipRegex.test(ip)) return false;
  const [addr] = ip.split('/');
  return addr.split('.').every((seg) => Number(seg) >= 0 && Number(seg) <= 255);
}

function UsageRing({ percentage }: { percentage: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(percentage, 100) / 100) * circumference;
  const color = percentage >= 80 ? '#ef4444' : percentage >= 50 ? '#f97316' : '#10b981';

  return (
    <svg width="52" height="52" className="flex-shrink-0 -rotate-90">
      <circle cx="26" cy="26" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-zinc-800" />
      <circle
        cx="26" cy="26" r={radius} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x="26" y="26" textAnchor="middle" dominantBaseline="central" className="rotate-90" fill="currentColor"
        style={{ fontSize: '9px', fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: '26px 26px', fill: color }}>
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

function KeyCard({
  apiKey,
  onCopy,
  copiedKey,
  onRevokeKey,
  onUpdateKeyName,
  actionLoading,
  index,
}: {
  apiKey: ApiKey;
  onCopy: (text: string, id: string) => void;
  copiedKey: string | null;
  onRevokeKey: (key: ApiKey) => void;
  onUpdateKeyName: (keyId: string, name: string) => void;
  actionLoading: boolean;
  index: number;
}) {
  const [editingName, setEditingName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const usagePercentage = (apiKey.requests_used / apiKey.rate_limit) * 100;
  const isHighUsage = usagePercentage >= 80;
  const isMediumUsage = usagePercentage >= 50 && usagePercentage < 80;

  const barColor = isHighUsage
    ? 'from-red-500 to-rose-400'
    : isMediumUsage
    ? 'from-orange-500 to-amber-400'
    : 'from-emerald-500 to-teal-400';

  const handleSave = () => {
    if (!editingName.trim()) return;
    onUpdateKeyName(apiKey.id, editingName);
    setIsEditing(false);
    setEditingName('');
  };

  return (
    <div
      className="group relative"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)`,
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/5 to-blue-500/5 dark:from-sky-400/8 dark:to-blue-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className={`relative bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-hidden
        ${apiKey.is_active
          ? 'border-zinc-200/80 dark:border-zinc-800/80 group-hover:border-sky-300/60 dark:group-hover:border-sky-700/60 group-hover:shadow-xl group-hover:shadow-sky-500/10 dark:group-hover:shadow-sky-500/15'
          : 'border-zinc-200/50 dark:border-zinc-800/50 opacity-70'
        }`}>

        <div className={`absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 ${
          apiKey.is_active
            ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 opacity-0 group-hover:opacity-100'
            : 'bg-zinc-300 dark:bg-zinc-700 opacity-30'
        }`} />

        <div className="p-4 sm:p-5">
          <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setIsEditing(false); setEditingName(''); } }}
                    className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-sky-400 dark:border-sky-600 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none ring-2 ring-sky-400/30 transition-all"
                    autoFocus
                  />
                  <button onClick={handleSave} disabled={actionLoading}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/30">
                    <FiSave className="text-xs sm:text-sm" />
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditingName(''); }}
                    className="p-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg transition-all hover:scale-110 active:scale-95">
                    <FiX className="text-xs sm:text-sm" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate leading-tight">
                    {apiKey.name}
                  </h3>
                  <button
                    onClick={() => { setIsEditing(true); setEditingName(apiKey.name); }}
                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                  >
                    <FiEdit2 className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                  </button>
                  <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border transition-all ${
                    apiKey.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${apiKey.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                    {apiKey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-3.5 group/code">
                <code className="flex-1 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-900/80 rounded-lg font-mono text-[10px] sm:text-xs text-zinc-700 dark:text-zinc-300 truncate border border-zinc-200 dark:border-zinc-800 transition-colors group-hover/code:border-zinc-300 dark:group-hover/code:border-zinc-700">
                  {apiKey.prefix}
                </code>
                <button
                  onClick={() => onCopy(apiKey.key, apiKey.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0 border ${
                    copiedKey === apiKey.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 scale-95'
                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-200 dark:hover:border-sky-800 hover:scale-105 active:scale-95'
                  }`}
                >
                  {copiedKey === apiKey.id ? (
                    <><FiCheck className="text-xs" /><span>Copied</span></>
                  ) : (
                    <><FiCopy className="text-xs" /><span>Copy</span></>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <UsageRing percentage={usagePercentage} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <FiActivity className="text-[9px]" />
                      Usage this cycle
                    </span>
                    <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                      {apiKey.requests_used.toLocaleString()}<span className="text-zinc-400 dark:text-zinc-600 font-medium"> / {apiKey.rate_limit.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                  {isHighUsage && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <FiAlertCircle className="text-[9px] text-orange-500 flex-shrink-0" />
                      <p className="text-[9px] text-orange-600 dark:text-orange-400 font-semibold">
                        {usagePercentage >= 100 ? 'Rate limit reached' : 'Approaching rate limit'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <FiClock className="text-[9px]" />
                Created {new Date(apiKey.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <FiZap className="text-[9px]" />
                Reset {new Date(apiKey.last_reset_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <button
              onClick={() => onRevokeKey(apiKey)}
              disabled={!apiKey.is_active || actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all border disabled:opacity-40 disabled:cursor-not-allowed
                bg-red-50 dark:bg-red-900/15 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800/60
                hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-500/25 active:scale-95"
            >
              <FiTrash2 className="text-[10px] sm:text-xs" />
              Revoke
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer { animation: shimmer 2.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function CreateKeyModal({
  open,
  onClose,
  onCreate,
  actionLoading,
  plan,
  maxKeys,
  onCopy,
  copiedKey,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: CreateKeyPayload) => Promise<string | null> | void;
  actionLoading: boolean;
  plan: PlanType;
  maxKeys: number;
  onCopy: (text: string, id: string) => void;
  copiedKey: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');
  const [rateLimit, setRateLimit] = useState<number>(PLAN_LIMITS[plan].rateOptions[0]);
  const [expiresIn, setExpiresIn] = useState('never');
  const [ipInput, setIpInput] = useState('');
  const [ipList, setIpList] = useState<string[]>([]);
  const [ipError, setIpError] = useState('');
  const [restrictIp, setRestrictIp] = useState(false);
  const [expiryOpen, setExpiryOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);

  const limits = PLAN_LIMITS[plan];

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setName('');
      setRateLimit(PLAN_LIMITS[plan].rateOptions[0]);
      setExpiresIn('never');
      setIpInput('');
      setIpList([]);
      setIpError('');
      setRestrictIp(false);
      setExpiryOpen(false);
      setCreatedKey(null);
    }
  }, [open, plan]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (expiryRef.current && !expiryRef.current.contains(e.target as Node)) {
        setExpiryOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 260);
  };

  const addIp = () => {
    const trimmed = ipInput.trim();
    if (!trimmed) return;
    if (!isValidIp(trimmed)) {
      setIpError('Invalid IP format');
      return;
    }
    if (ipList.includes(trimmed)) {
      setIpError('This IP is already in the list');
      return;
    }
    if (ipList.length >= 10) {
      setIpError('Maximum 10 IP addresses');
      return;
    }
    setIpList((prev) => [...prev, trimmed]);
    setIpInput('');
    setIpError('');
  };

  const removeIp = (ip: string) => {
    setIpList((prev) => prev.filter((v) => v !== ip));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const result = await onCreate({
      name: name.trim(),
      rateLimit,
      ipWhitelist: restrictIp ? ipList : [],
      expiresIn,
    });
    if (result) {
      setCreatedKey(result);
    }
  };

  if (!open) return null;

  const expiryLabel = EXPIRY_OPTIONS.find((o) => o.value === expiresIn)?.label ?? 'Never';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.28s ease' }}
    >
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60"
        style={{ backdropFilter: visible ? 'blur(20px) saturate(140%)' : 'blur(0px)', WebkitBackdropFilter: visible ? 'blur(20px) saturate(140%)' : 'blur(0px)', transition: 'backdrop-filter 0.35s ease' }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[420px] h-[420px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${limits.color}33 0%, transparent 70%)`,
            top: '10%',
            left: '15%',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.7)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        />
        <div
          className="absolute w-[380px] h-[380px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${limits.color}22 0%, transparent 70%)`,
            bottom: '8%',
            right: '12%',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.7)',
            transition: 'opacity 0.7s ease 0.05s, transform 0.7s ease 0.05s',
          }}
        />
      </div>

      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[28px] modal-scroll"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
          transition: 'opacity 0.34s cubic-bezier(0.16,1,0.3,1), transform 0.34s cubic-bezier(0.16,1,0.3,1)',
          background: 'linear-gradient(150deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: `0 24px 70px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.3) inset`,
        }}
      >
        <div className="absolute inset-0 rounded-[28px] pointer-events-none dark:bg-zinc-950/70 bg-white/55" style={{ zIndex: -1 }} />
        <div
          className="absolute top-0 left-0 right-0 h-[1px] rounded-t-[28px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
        />

        {createdKey ? (
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
                style={{ background: `linear-gradient(135deg, ${limits.color}30, ${limits.color}10)`, border: `1px solid ${limits.color}40` }}
              >
                <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: `${limits.color}20` }} />
                <FiCheck className="relative text-2xl" style={{ color: limits.color }} />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-1.5">Key Created Successfully</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                Save this key somewhere safe. It won't be shown again once this window is closed.
              </p>
            </div>

            <div
              className="p-4 rounded-2xl mb-3"
              style={{ background: 'rgba(120,120,140,0.08)', border: '1px solid rgba(120,120,140,0.15)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">API Key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-xs sm:text-sm text-zinc-900 dark:text-white break-all">{createdKey}</code>
                <button
                  onClick={() => onCopy(createdKey, 'created')}
                  className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                  style={{ background: copiedKey === 'created' ? 'rgba(16,185,129,0.15)' : 'rgba(120,120,140,0.12)' }}
                >
                  {copiedKey === 'created' ? <FiCheck className="text-emerald-500" /> : <FiCopy className="text-zinc-500 dark:text-zinc-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl mb-6" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <FiAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" style={{ fontSize: 13 }} />
              <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                For security reasons, the full key is only shown once. Save it now before closing this window.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: `linear-gradient(135deg, ${limits.color}, ${limits.color}cc)`, boxShadow: `0 8px 24px -6px ${limits.color}70` }}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${limits.color}35, ${limits.color}10)`, border: `1px solid ${limits.color}40` }}
                >
                  <FiKey style={{ color: limits.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">Create API Key</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{limits.label} Plan</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                style={{ background: 'rgba(120,120,140,0.12)' }}
              >
                <FiX className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 14 }} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  <FiTag style={{ fontSize: 11 }} />
                  Key Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Production Server"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl text-sm text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  style={{ background: 'rgba(120,120,140,0.08)', border: '1px solid rgba(120,120,140,0.18)' }}
                  onFocus={(e) => { e.target.style.border = `1px solid ${limits.color}80`; e.target.style.background = 'rgba(120,120,140,0.12)'; }}
                  onBlur={(e) => { e.target.style.border = '1px solid rgba(120,120,140,0.18)'; e.target.style.background = 'rgba(120,120,140,0.08)'; }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  <FiZap style={{ fontSize: 11 }} />
                  Daily Rate Limit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {limits.rateOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setRateLimit(opt)}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={
                        rateLimit === opt
                          ? { background: `linear-gradient(135deg, ${limits.color}, ${limits.color}cc)`, color: '#fff', boxShadow: `0 6px 16px -4px ${limits.color}70` }
                          : { background: 'rgba(120,120,140,0.08)', border: '1px solid rgba(120,120,140,0.18)', color: 'inherit' }
                      }
                    >
                      {opt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={expiryRef} className="relative">
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  <FiLock style={{ fontSize: 11 }} />
                  Expiration
                </label>
                <button
                  onClick={() => setExpiryOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm text-zinc-900 dark:text-white transition-all"
                  style={{ background: 'rgba(120,120,140,0.08)', border: '1px solid rgba(120,120,140,0.18)' }}
                >
                  <span className="font-semibold">{expiryLabel}</span>
                  <FiChevronDown className="text-zinc-400 transition-transform" style={{ transform: expiryOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 13 }} />
                </button>
                {expiryOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-10 p-1.5"
                    style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 16px 40px -12px rgba(0,0,0,0.3)' }}
                  >
                    <div className="absolute inset-0 dark:bg-zinc-900/80 pointer-events-none" style={{ zIndex: -1 }} />
                    {EXPIRY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setExpiresIn(opt.value); setExpiryOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-100 transition-colors hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between"
                      >
                        {opt.label}
                        {expiresIn === opt.value && <FiCheck style={{ color: limits.color, fontSize: 12 }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(120,120,140,0.08)', border: '1px solid rgba(120,120,140,0.18)' }}>
                <button
                  onClick={() => setRestrictIp((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: restrictIp ? `${limits.color}25` : 'rgba(120,120,140,0.1)' }}
                    >
                      <FiGlobe style={{ color: restrictIp ? limits.color : undefined, fontSize: 13 }} className={restrictIp ? '' : 'text-zinc-400'} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Restrict IP Access</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Only listed IPs can use this key</p>
                    </div>
                  </div>
                  <div
                    className="w-10 h-6 rounded-full relative flex-shrink-0 transition-colors duration-200"
                    style={{ background: restrictIp ? limits.color : 'rgba(120,120,140,0.3)' }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
                      style={{ transform: restrictIp ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </div>
                </button>

                {restrictIp && (
                  <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid rgba(120,120,140,0.15)' }}>
                    <div className="flex gap-2 pt-3">
                      <input
                        type="text"
                        value={ipInput}
                        onChange={(e) => { setIpInput(e.target.value); setIpError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIp(); } }}
                        placeholder="192.168.1.1 atau 10.0.0.0/24"
                        className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono text-zinc-900 dark:text-white outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        style={{ background: 'rgba(120,120,140,0.1)', border: ipError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(120,120,140,0.18)' }}
                      />
                      <button
                        onClick={addIp}
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95"
                        style={{ background: `linear-gradient(135deg, ${limits.color}, ${limits.color}cc)` }}
                      >
                        <FiPlus className="text-white" style={{ fontSize: 15 }} />
                      </button>
                    </div>

                    {ipError && (
                      <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                        <FiAlertCircle style={{ fontSize: 10 }} />
                        {ipError}
                      </p>
                    )}

                    {ipList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ipList.map((ip) => (
                          <div
                            key={ip}
                            className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-200"
                            style={{ background: 'rgba(120,120,140,0.12)', border: '1px solid rgba(120,120,140,0.2)' }}
                          >
                            {ip}
                            <button
                              onClick={() => removeIp(ip)}
                              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-colors"
                            >
                              <FiTrash2 className="text-red-500" style={{ fontSize: 9 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {ipList.length === 0 && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">No IPs added yet. Without any IPs, access stays open.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl" style={{ background: `${limits.color}12`, border: `1px solid ${limits.color}25` }}>
                <FiShield className="flex-shrink-0 mt-0.5" style={{ color: limits.color, fontSize: 13 }} />
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  The {limits.label} plan limits you to <span className="font-bold">{maxKeys} active API key{maxKeys > 1 ? 's' : ''}</span>. Creating a new key will automatically deactivate the oldest one once the limit is reached.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-7">
              <button
                onClick={handleClose}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl font-bold text-sm text-zinc-700 dark:text-zinc-200 transition-all disabled:opacity-50"
                style={{ background: 'rgba(120,120,140,0.1)', border: '1px solid rgba(120,120,140,0.18)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading || !name.trim()}
                className="flex-1 py-3 rounded-2xl font-bold text-sm text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: `linear-gradient(135deg, ${limits.color}, ${limits.color}cc)`, boxShadow: `0 8px 24px -6px ${limits.color}70` }}
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus style={{ fontSize: 14 }} />
                    Create Key
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-scroll::-webkit-scrollbar { width: 6px; }
        .modal-scroll::-webkit-scrollbar-thumb { background: rgba(120,120,140,0.3); border-radius: 999px; }
      `}</style>
    </div>
  );
}

export default function ApiKeys({
  keys,
  onCopy,
  copiedKey,
  onCreateKey,
  onRevokeKey,
  onUpdateKeyName,
  actionLoading,
  plan,
}: ApiKeysProps) {
  const [headerMounted, setHeaderMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const normalizedPlan = normalizePlan(plan);

  useEffect(() => {
    const t = setTimeout(() => setHeaderMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const activeKeys = keys.filter(k => k.is_active);
  const maxKeys = PLAN_MAX_KEYS[normalizedPlan];
  const canCreateMoreKeys = activeKeys.length < maxKeys;

  let cooldownInfo: { hoursRemaining: number; canCreate: boolean } | null = null;
  if (keys.length > 0) {
    const sortedKeys = [...keys].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const lastCreated = new Date(sortedKeys[0].created_at);
    const hoursSinceLastCreate = (Date.now() - lastCreated.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastCreate < 24) {
      cooldownInfo = { hoursRemaining: Math.ceil(24 - hoursSinceLastCreate), canCreate: false };
    }
  }

  const canCreateKey = canCreateMoreKeys && (!cooldownInfo || cooldownInfo.canCreate);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div
        className="flex flex-col gap-3"
        style={{
          opacity: headerMounted ? 1 : 0,
          transform: headerMounted ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}
      >
        {cooldownInfo && !cooldownInfo.canCreate && (
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/15 rounded-xl border border-amber-200/70 dark:border-amber-800/50 backdrop-blur-sm">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
              <FiClock className="text-amber-600 dark:text-amber-400 text-sm" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">Cooldown Active</p>
              <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-500">
                Wait {cooldownInfo.hoursRemaining} hour{cooldownInfo.hoursRemaining > 1 ? 's' : ''} before creating another key. You can create 1 key every 24 hours.
              </p>
            </div>
          </div>
        )}

        {activeKeys.length >= maxKeys && (
          <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-900/15 rounded-xl border border-red-200/70 dark:border-red-800/50 backdrop-blur-sm">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
              <FiAlertCircle className="text-red-600 dark:text-red-400 text-sm" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-0.5">Maximum Keys Reached</p>
              <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-500">
                {maxKeys === 1
                  ? 'Your plan only allows 1 active API key. Revoke this key to create a new one.'
                  : `You have ${maxKeys} active keys (maximum allowed). Revoke one to create a new key.`}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: maxKeys }).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < activeKeys.length ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-zinc-300 dark:bg-zinc-700'
                }`} />
              ))}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-bold text-zinc-900 dark:text-white">{activeKeys.length}</span> / {maxKeys} active keys
            </span>
          </div>

          <button
            onClick={canCreateKey ? () => setShowCreateModal(true) : undefined}
            disabled={!canCreateKey || actionLoading}
            className={`group/btn relative flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 overflow-hidden
              ${canCreateKey && !actionLoading
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
              }`}
            title={!canCreateKey ? (activeKeys.length >= maxKeys ? 'Maximum keys reached.' : `Wait ${cooldownInfo?.hoursRemaining || 0}h`) : 'Create new API key'}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
            <FiPlus className={`text-sm sm:text-base transition-transform duration-200 ${canCreateKey && !actionLoading ? 'group-hover/btn:rotate-90' : ''}`} />
            Create New Key
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {keys.length === 0 ? (
          <div
            className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 sm:p-14 text-center"
            style={{ opacity: headerMounted ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-blue-600/20 rounded-2xl animate-pulse" />
              <div className="relative w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                <FiKey className="text-2xl sm:text-3xl text-zinc-400 dark:text-zinc-600" />
              </div>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1.5">No API Keys Yet</h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-5">Create your first API key to start building</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-semibold transition-all text-xs sm:text-sm shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
              <FiPlus className="text-sm group-hover/btn:rotate-90 transition-transform duration-200" />
              Create API Key
            </button>
          </div>
        ) : (
          keys.map((key, index) => (
            <KeyCard
              key={key.id}
              apiKey={key}
              onCopy={onCopy}
              copiedKey={copiedKey}
              onRevokeKey={onRevokeKey}
              onUpdateKeyName={onUpdateKeyName}
              actionLoading={actionLoading}
              index={index}
            />
          ))
        )}
      </div>

      {keys.length > 0 && (
        <div
          className="grid grid-cols-3 gap-2 sm:gap-3"
          style={{
            opacity: headerMounted ? 1 : 0,
            transform: headerMounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s',
          }}
        >
          {[
            { label: 'Total Keys', value: keys.length, icon: FiKey, color: 'sky', bg: 'bg-sky-50 dark:bg-sky-900/20', iconColor: 'text-sky-600 dark:text-sky-400' },
            { label: 'Active Keys', value: keys.filter(k => k.is_active).length, icon: FiShield, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Total Requests', value: keys.reduce((acc, k) => acc + k.requests_used, 0).toLocaleString(), icon: FiActivity, color: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-3 sm:p-4 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 ${stat.bg} rounded-lg transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`text-sm sm:text-base ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-tight">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white tabular-nums leading-tight">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateKeyModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreateKey}
        actionLoading={actionLoading}
        plan={normalizedPlan}
        maxKeys={maxKeys}
        onCopy={onCopy}
        copiedKey={copiedKey}
      />
    </div>
  );
}
