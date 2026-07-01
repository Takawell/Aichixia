import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { FiActivity, FiGift, FiCalendar, FiUsers, FiRefreshCw, FiX, FiCheckCircle, FiAlertCircle, FiLock, FiBarChart2, FiEye, FiShield, FiDatabase, FiKey, FiCheck, FiTrendingUp, FiEdit2, FiSave, FiCpu, FiZap, FiCopy, FiChevronRight } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';
import { DiSwift } from 'react-icons/di';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ThemeToggle from '@/components/ThemeToggle';
import Overview from '@/components/admin/overview';
import Monitoring from '@/components/admin/monitoring';
import Analytics from '@/components/admin/analytics';
import Promos from '@/components/admin/promos';
import Redemptions from '@/components/admin/redemptions';
import Users from '@/components/admin/users';
import Image from 'next/image';

type PromoCode = {
  id: string;
  code: string;
  plan_type: string;
  duration_days: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

type Redemption = {
  id: string;
  promo_codes: { code: string; plan_type: string };
  user_email: string;
  redeemed_at: string;
  expires_at: string;
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

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  rate_limit: number;
  requests_today: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
};

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

type TabType = 'overview' | 'monitoring' | 'analytics' | 'promos' | 'redemptions' | 'users';
type ChartLine = 'requests' | 'success' | 'errors';

type TooltipPayloadItem = {
  value: number;
  name: string;
  color: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

function UserDetailTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800/50 rounded-xl px-3 py-2 shadow-lg shadow-sky-500/10">
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">{label}</p>
      {payload.map(entry => (
        <p key={entry.name} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'overview',     label: 'Overview',     icon: FiActivity   },
  { id: 'monitoring',   label: 'Monitoring',   icon: FiEye        },
  { id: 'analytics',   label: 'Analytics',    icon: FiBarChart2  },
  { id: 'promos',      label: 'Promos',       icon: FiGift       },
  { id: 'redemptions', label: 'Redemptions',  icon: FiCalendar   },
  { id: 'users',       label: 'Users',        icon: FiUsers      },
];

const chartLines: { key: ChartLine; label: string; color: string; gradId: string }[] = [
  { key: 'requests', label: 'Total',   color: '#0ea5e9', gradId: 'ud-grad-req' },
  { key: 'success',  label: 'Success', color: '#34d399', gradId: 'ud-grad-suc' },
  { key: 'errors',   label: 'Errors',  color: '#f87171', gradId: 'ud-grad-err' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [userDetailVisible, setUserDetailVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [pinShake, setPinShake] = useState(false);
  const [pinVerifying, setPinVerifying] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', plan_type: 'pro', duration_days: 30, max_uses: 100 });
  const [editUser, setEditUser] = useState({ plan: 'free', plan_expires_at: '' });
  const [activeChartLine, setActiveChartLine] = useState<ChartLine>('requests');
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [keysModalVisible, setKeysModalVisible] = useState(false);
  const [userKeys, setUserKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const userDetailRef = useRef<HTMLDivElement>(null);
  const keysModalRef = useRef<HTMLDivElement>(null);

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setEditUser({ plan: user.plan, plan_expires_at: user.plan_expires_at ? new Date(user.plan_expires_at).toISOString().slice(0, 16) : '' });
    setActiveChartLine('requests');
    setShowUserDetailModal(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setUserDetailVisible(true)));
  };

  const closeUserDetail = () => {
    setUserDetailVisible(false);
    setTimeout(() => { setShowUserDetailModal(false); setSelectedUser(null); }, 300);
  };

  const openKeysModal = async (user: User) => {
    setUserKeys([]);
    setShowKeysModal(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setKeysModalVisible(true)));
    setKeysLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/console/admin?type=user-keys&user_id=${user.user_id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setUserKeys(data.keys || []);
    } catch {
      showToast('Failed to load API keys', 'error');
    } finally {
      setKeysLoading(false);
    }
  };

  const closeKeysModal = () => {
    setKeysModalVisible(false);
    setTimeout(() => { setShowKeysModal(false); setUserKeys([]); }, 300);
  };

  useEffect(() => {
    if (!showUserDetailModal) return;
    const handler = (e: MouseEvent) => {
      if (userDetailRef.current && !userDetailRef.current.contains(e.target as Node)) closeUserDetail();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserDetailModal]);

  useEffect(() => {
    if (!showKeysModal) return;
    const handler = (e: MouseEvent) => {
      if (keysModalRef.current && !keysModalRef.current.contains(e.target as Node)) closeKeysModal();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showKeysModal]);

  useEffect(() => {
    const tab = router.query.tab as TabType;
    if (tab && TABS.map(t => t.id).includes(tab)) setActiveTab(tab);
  }, [router.query.tab]);

  useEffect(() => { checkAdmin(); }, []);

  useEffect(() => {
    if (!initialLoading) return;
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) { clearInterval(interval); return prev; }
        return Math.min(prev + Math.random() * 12 + 6, 95);
      });
    }, 250);
    return () => clearInterval(interval);
  }, [initialLoading]);

  useEffect(() => {
    if (loadingProgress < 18) setLoadingStep(0);
    else if (loadingProgress < 36) setLoadingStep(1);
    else if (loadingProgress < 54) setLoadingStep(2);
    else if (loadingProgress < 72) setLoadingStep(3);
    else if (loadingProgress < 90) setLoadingStep(4);
    else setLoadingStep(5);
  }, [loadingProgress]);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/auth/login'; return; }
    const res = await fetch('/api/console/profile', { headers: { Authorization: `Bearer ${session.access_token}` } });
    const data = await res.json();
    if (!data.settings?.is_admin) {
      setAccessDenied(true);
      setLoadingProgress(100);
      setTimeout(() => { setInitialLoading(false); setLoading(false); }, 600);
      return;
    }
    fetchAllData();
    setLoadingProgress(100);
    setTimeout(() => { setInitialLoading(false); setLoading(false); setShowPinModal(true); }, 700);
  };

  const fetchAllData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const token = session.access_token;
    try {
      const [promosRes, redemptionsRes, usersRes, usageRes, logsRes] = await Promise.all([
        fetch('/api/console/admin?type=promo-codes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/admin?type=redemptions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/admin?type=users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/stats?type=usage&days=30&admin=true', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/stats?type=logs&limit=6000&admin=true', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [promosData, redemptionsData, usersData, usageData, logsData] = await Promise.all([
        promosRes.json(), redemptionsRes.json(), usersRes.json(), usageRes.json(), logsRes.json(),
      ]);
      setPromoCodes(promosData.promoCodes || []);
      setRedemptions(redemptionsData.redemptions || []);
      setUsers(usersData.users || []);
      setDailyUsage(usageData.usage || []);
      setRequestLogs(logsData.logs || []);
    } catch { showToast('Failed to fetch data', 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push({ pathname: '/console/admin', query: { tab } }, undefined, { shallow: true });
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code.trim()) { showToast('Please enter a promo code', 'error'); return; }
    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/console/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(newPromo),
    });
    setActionLoading(false);
    if (res.ok) {
      setShowCreateModal(false);
      setNewPromo({ code: '', plan_type: 'pro', duration_days: 30, max_uses: 100 });
      fetchAllData(true);
      showToast('Promo code created successfully', 'success');
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to create promo code', 'error');
    }
  };

  const handleTogglePromo = async (promoId: string, isActive: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/console/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'update-promo', promo_id: promoId, is_active: !isActive }),
    });
    if (res.ok) { fetchAllData(true); showToast(`Promo code ${!isActive ? 'activated' : 'deactivated'}`, 'success'); }
    else showToast('Failed to update promo code', 'error');
  };

  const handleUpdateUserPlan = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/console/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ action: 'update-user-plan', user_id: selectedUser.user_id, plan: editUser.plan, plan_expires_at: editUser.plan_expires_at || null }),
    });
    setActionLoading(false);
    if (res.ok) { closeUserDetail(); fetchAllData(true); showToast('User plan updated successfully', 'success'); }
    else showToast('Failed to update user plan', 'error');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getPlanGradient = (plan: string) => {
    if (plan === 'enterprise') return 'from-violet-500 to-purple-600';
    if (plan === 'pro') return 'from-sky-500 to-blue-600';
    return 'from-sky-400 to-cyan-500';
  };

  const getPlanBadge = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/60';
    if (plan === 'pro') return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60';
    return 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-500 border-sky-100 dark:border-sky-800/40';
  };

  const getPlanIcon = (plan: string) => {
    if (plan === 'enterprise') return RiVipCrownLine;
    if (plan === 'pro') return RiVipDiamondLine;
    return FiUsers;
  };

  const getUserChartData = (userId: string) =>
    dailyUsage
      .filter(d => d.user_id === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests: d.requests_count,
        success: d.success_count,
        errors: d.error_count,
      }));

  const getUserTotalStats = (userId: string) => {
    const userUsage = dailyUsage.filter(d => d.user_id === userId);
    return {
      totalRequests: userUsage.reduce((s, d) => s + d.requests_count, 0),
      successCount:  userUsage.reduce((s, d) => s + d.success_count, 0),
      errorCount:    userUsage.reduce((s, d) => s + d.error_count, 0),
    };
  };

  const loadingSteps = [
    { icon: FiShield,    text: 'Initializing admin security', color: 'from-sky-400 to-blue-500'      },
    { icon: FiLock,      text: 'Verifying admin credentials', color: 'from-blue-400 to-indigo-500'   },
    { icon: FiDatabase,  text: 'Loading system data',         color: 'from-indigo-400 to-purple-500' },
    { icon: FiUsers,     text: 'Fetching user database',      color: 'from-purple-400 to-pink-500'   },
    { icon: FiBarChart2, text: 'Preparing analytics',         color: 'from-pink-400 to-rose-500'     },
    { icon: FiCheck,     text: 'Admin panel ready',           color: 'from-emerald-400 to-green-500' },
  ];

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.2),transparent_60%)]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-sky-300/15 dark:bg-sky-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-300/15 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="absolute inset-0 opacity-40 dark:opacity-60">
          <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-sky-400 rounded-full animate-twinkle" />
          <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-twinkle-delayed" />
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-twinkle-delayed" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-4 w-full max-w-md">
          <div className="relative group">
            <div className="absolute -inset-6 bg-gradient-to-r from-sky-400/20 via-blue-500/20 to-cyan-400/20 dark:from-sky-400/30 dark:via-blue-500/30 dark:to-cyan-400/30 rounded-full blur-2xl animate-pulse-slow" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <div className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="absolute inset-0 rounded-full border border-sky-400/20 dark:border-sky-400/30" style={{ animation: `ping ${2 + i * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`, animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
              <div className="absolute inset-2 rounded-full border border-dashed border-sky-400/30 dark:border-sky-400/40 animate-spin-slow" />
              <div className="relative z-10 transform hover:scale-110 transition-transform duration-500">
                <Image src="/logo.png" alt="Aichixia" width={40} height={40} className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 drop-shadow-2xl" priority />
              </div>
            </div>
          </div>

          <div className="text-center space-y-2 sm:space-y-3">
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent animate-gradient">
                {loadingStep === 5 ? 'Admin Ready' : 'Admin Dashboard'}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                <div className="w-1 h-1 rounded-full bg-sky-500 animate-pulse" />
                <div className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
              {loadingStep === 5 ? 'System initialized successfully' : 'Establishing secure admin connection'}
            </p>
          </div>

          <div className="w-full space-y-5 sm:space-y-6">
            <div className="relative">
              <div className="h-2 sm:h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full bg-gradient-to-r ${loadingSteps[loadingStep].color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`} style={{ width: `${loadingProgress}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="absolute -top-7 sm:-top-8 left-0 right-0 flex items-center justify-between px-1">
                <div className="text-xs sm:text-sm font-bold text-transparent bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text">{Math.round(loadingProgress)}%</div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full bg-gradient-to-r ${loadingSteps[loadingStep].color}`} style={{ animation: `bounce 1s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {loadingSteps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx === loadingStep;
                const isComplete = idx < loadingStep;
                return (
                  <div key={idx} className="relative flex flex-col items-center gap-1.5">
                    <div className={`relative transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${isActive ? `bg-gradient-to-br ${step.color} shadow-lg shadow-sky-500/30` : isComplete ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
                        <StepIcon className={`w-4 h-4 transition-colors duration-500 ${isActive ? 'text-white' : isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`} />
                      </div>
                      {isActive && (
                        <>
                          <div className="absolute -inset-1 bg-sky-500/20 rounded-lg animate-ping" />
                          <div className={`absolute -inset-1.5 bg-gradient-to-br ${step.color} opacity-20 rounded-lg blur animate-pulse`} />
                        </>
                      )}
                      {isComplete && (
                        <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <FiCheck className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className={`w-full h-0.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500/30' : isActive ? `bg-gradient-to-r ${step.color} opacity-50` : 'bg-slate-200 dark:bg-slate-800'}`} />
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-2.5 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-100/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
              <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br ${loadingSteps[loadingStep].color} shadow-lg`}>
                {loadingStep === 5 ? <FiCheck className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold mb-0.5 ${loadingStep === 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{loadingSteps[loadingStep].text}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                  {loadingStep !== 5 && (
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-0.5 h-0.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  )}
                  <span className="font-medium">{loadingStep === 5 ? 'Ready to use' : 'Processing...'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-600 font-medium">Aichixia Admin Portal</div>
        </div>

        <style jsx>{`
          @keyframes shimmer { 0%{transform:translateX(-100%);} 100%{transform:translateX(100%);} }
          @keyframes float { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-15px) scale(1.05);} }
          @keyframes float-delayed { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-20px) scale(1.08);} }
          @keyframes twinkle { 0%,100%{opacity:.3;transform:scale(1);} 50%{opacity:1;transform:scale(1.5);} }
          @keyframes twinkle-delayed { 0%,100%{opacity:.2;transform:scale(1);} 50%{opacity:.8;transform:scale(1.3);} }
          @keyframes gradient { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
          @keyframes pulse-slow { 0%,100%{opacity:.6;} 50%{opacity:1;} }
          @keyframes spin-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
          .animate-shimmer { animation:shimmer 2s ease-in-out infinite; }
          .animate-float { animation:float 8s ease-in-out infinite; }
          .animate-float-delayed { animation:float-delayed 10s ease-in-out infinite; }
          .animate-twinkle { animation:twinkle 3s ease-in-out infinite; }
          .animate-twinkle-delayed { animation:twinkle-delayed 3s ease-in-out infinite; }
          .animate-gradient { background-size:200% 200%; animation:gradient 3s ease infinite; }
          .animate-pulse-slow { animation:pulse-slow 3s ease-in-out infinite; }
          .animate-spin-slow { animation:spin-slow 8s linear infinite; }
        `}</style>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{ position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#04060d',overflow:'hidden' }}>
        <style>{`
          @keyframes adFadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
          @keyframes adFadeIn{from{opacity:0;}to{opacity:1;}}
          @keyframes adSpinCW{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
          @keyframes adSpinCCW{from{transform:rotate(360deg);}to{transform:rotate(0deg);}}
          @keyframes adPulseGlow{0%,100%{opacity:0.35;transform:translate(-50%,-50%) scale(1);}50%{opacity:0.7;transform:translate(-50%,-50%) scale(1.18);}}
          @keyframes adRipple{0%{transform:scale(0.85);opacity:0.7;}100%{transform:scale(2.2);opacity:0;}}
          @keyframes adIconFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
          @keyframes adScanH{0%{top:-2px;opacity:0;}6%{opacity:1;}94%{opacity:0.8;}100%{top:100%;opacity:0;}}
          @keyframes adNoiseFade{0%,100%{opacity:0.025;}50%{opacity:0.045;}}
          @keyframes adShimmer{0%{left:-120%;}100%{left:120%;}}
          @keyframes adChevron{0%,100%{transform:translateX(0);}50%{transform:translateX(3px);}}
          .ad-layer0{animation:adFadeIn 0.6s ease both;}
          .ad-layer1{animation:adFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both;}
          .ad-layer2{animation:adFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.13s both;}
          .ad-layer3{animation:adFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.21s both;}
          .ad-layer4{animation:adFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.29s both;}
          .ad-layer5{animation:adFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.37s both;}
          .ad-ripple{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(248,113,113,0.35);}
          .ad-ripple1{animation:adRipple 2.4s ease-out infinite;}
          .ad-ripple2{animation:adRipple 2.4s ease-out infinite;animation-delay:0.8s;}
          .ad-ripple3{animation:adRipple 2.4s ease-out infinite;animation-delay:1.6s;}
          .ad-icon-float{animation:adIconFloat 4s ease-in-out infinite;}
          .ad-scan{animation:adScanH 2.8s ease-in-out infinite;}
          .ad-divider-line{height:1px;background:linear-gradient(90deg,transparent,rgba(248,113,113,0.25),transparent);}
          .ad-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;border:1px solid rgba(248,113,113,0.2);background:rgba(248,113,113,0.06);font-size:10px;font-weight:700;color:rgba(248,113,113,0.8);letter-spacing:0.08em;text-transform:uppercase;}
          .ad-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:99px;border:1px solid rgba(248,113,113,0.3);background:transparent;color:rgba(248,113,113,0.85);font-size:12.5px;font-weight:600;cursor:pointer;letter-spacing:0.01em;position:relative;overflow:hidden;transition:color 200ms,border-color 200ms,box-shadow 250ms,transform 180ms;backdrop-filter:blur(8px);}
          .ad-btn::before{content:'';position:absolute;inset:0;background:rgba(248,113,113,0.08);opacity:0;transition:opacity 200ms;}
          .ad-btn::after{content:'';position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);}
          .ad-btn:hover::before{opacity:1;}
          .ad-btn:hover::after{animation:adShimmer 0.65s ease forwards;}
          .ad-btn:hover{color:#f87171;border-color:rgba(248,113,113,0.5);box-shadow:0 0 20px rgba(248,113,113,0.15),0 4px 16px rgba(0,0,0,0.3);transform:translateY(-1px);}
          .ad-btn:active{transform:scale(0.97);}
          .ad-chevron{animation:adChevron 1.4s ease-in-out infinite;}
          .ad-noise{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px;animation:adNoiseFade 4s ease-in-out infinite;pointer-events:none;mix-blend-mode:overlay;}
        `}</style>

        <div style={{ position:'absolute',inset:0,pointerEvents:'none' }}>
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 60% at 50% 45%,rgba(239,68,68,0.12) 0%,rgba(239,68,68,0.04) 40%,transparent 70%)' }} />
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 40% 30% at 20% 80%,rgba(251,113,133,0.05) 0%,transparent 60%)' }} />
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 35% 25% at 85% 15%,rgba(239,68,68,0.04) 0%,transparent 55%)' }} />
          <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(248,113,113,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(248,113,113,0.03) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(ellipse 80% 70% at 50% 50%,black 20%,transparent 80%)' }} />
          <div className="ad-noise" style={{ opacity:0.03 }} />
          <div className="ad-scan" style={{ position:'absolute',left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent 0%,rgba(248,113,113,0.0) 20%,rgba(248,113,113,0.15) 50%,rgba(248,113,113,0.0) 80%,transparent 100%)',pointerEvents:'none' }} />
        </div>

        <div style={{ position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:0,padding:'0 24px',maxWidth:420,width:'100%',textAlign:'center' }}>

          <div className="ad-layer1" style={{ position:'relative',width:80,height:80,marginBottom:32 }}>
            <div style={{ position:'absolute',top:'50%',left:'50%',width:200,height:200,transform:'translate(-50%,-50%)',borderRadius:'50%',background:'radial-gradient(circle,rgba(248,113,113,0.14) 0%,transparent 65%)',animation:'adPulseGlow 3.5s ease-in-out infinite' }} />
            <div className="ad-ripple ad-ripple1" />
            <div className="ad-ripple ad-ripple2" />
            <div className="ad-ripple ad-ripple3" />
            <svg style={{ position:'absolute',inset:-12,width:'calc(100% + 24px)',height:'calc(100% + 24px)' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(248,113,113,0.18)" strokeWidth="0.7" strokeDasharray="5 4" style={{ transformOrigin:'50% 50%',animation:'adSpinCW 20s linear infinite' }} />
            </svg>
            <svg style={{ position:'absolute',inset:-6,width:'calc(100% + 12px)',height:'calc(100% + 12px)' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(239,68,68,0.1)" strokeWidth="1" strokeDasharray="2 7" style={{ transformOrigin:'50% 50%',animation:'adSpinCCW 14s linear infinite' }} />
            </svg>
            <div className="ad-icon-float" style={{ position:'absolute',inset:0,borderRadius:'50%',background:'rgba(248,113,113,0.07)',border:'1px solid rgba(248,113,113,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <FiLock style={{ fontSize:28,color:'#f87171',filter:'drop-shadow(0 0 12px rgba(248,113,113,0.8)) drop-shadow(0 0 4px rgba(248,113,113,0.5))' }} />
            </div>
          </div>

          <div className="ad-layer2 ad-tag" style={{ marginBottom:16 }}>
            <FiShield style={{ fontSize:9 }} />
            Restricted Area
          </div>

          <h1 className="ad-layer3" style={{ fontSize:'clamp(28px,6vw,42px)',fontWeight:900,letterSpacing:'-0.05em',color:'#fff',lineHeight:1.05,marginBottom:12,textShadow:'0 0 60px rgba(248,113,113,0.2)' }}>
            Access<br />
            <span style={{ background:'linear-gradient(135deg,#f87171,#fca5a5)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>Denied</span>
          </h1>

          <p className="ad-layer4" style={{ fontSize:13,color:'rgba(255,255,255,0.32)',lineHeight:1.75,marginBottom:8,maxWidth:280,fontWeight:400 }}>
            This area is restricted to administrators only.
          </p>

          <p className="ad-layer4" style={{ fontSize:11.5,color:'rgba(248,113,113,0.45)',lineHeight:1.65,marginBottom:32,maxWidth:260,fontWeight:400 }}>
            If you believe this is an error, contact your system administrator.
          </p>

          <div className="ad-layer5 ad-divider-line" style={{ width:48,marginBottom:32 }} />

          <button className="ad-layer5 ad-btn" onClick={() => window.location.href='/console'}>
            <span>Back to Console</span>
            <span className="ad-chevron" style={{ fontSize:13,color:'inherit' }}>›</span>
          </button>
        </div>
      </div>
    );
  }

  if (showPinModal && !pinVerified) {
    const handlePinInput = (idx: number, val: string) => {
      if (!/^[0-9]?$/.test(val)) return;
      const next = [...pinDigits];
      next[idx] = val;
      setPinDigits(next);
      setPinError(false);
      if (val && idx < 5) { const el = document.getElementById(`pin-${idx+1}`); if (el) (el as HTMLInputElement).focus(); }
      if (idx === 5 && val) { const full = [...next].join(''); if (full.length === 6) verifyPin(full); }
    };

    const handlePinKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !pinDigits[idx] && idx > 0) {
        const next = [...pinDigits]; next[idx-1] = ''; setPinDigits(next);
        const el = document.getElementById(`pin-${idx-1}`); if (el) (el as HTMLInputElement).focus();
      }
      if (e.key === 'Enter') { const full = pinDigits.join(''); if (full.length === 6) verifyPin(full); }
    };

    const verifyPin = async (pin: string) => {
      setPinVerifying(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPinVerifying(false); return; }
      const res = await fetch('/api/console/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ pin }),
      });
      setPinVerifying(false);
      if (res.ok) {
        setPinSuccess(true);
        setTimeout(() => { setPinVerified(true); setShowPinModal(false); }, 600);
      } else {
        setPinError(true); setPinShake(true); setPinDigits(['','','','','','']);
        setTimeout(() => setPinShake(false), 600);
        setTimeout(() => { const el = document.getElementById('pin-0'); if (el) (el as HTMLInputElement).focus(); }, 50);
      }
    };

    const filledCount = pinDigits.filter(Boolean).length;

    return (
      <div style={{ position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',background:'#060810',overflow:'hidden' }}>
        <style>{`
          @keyframes pinCardIn{from{opacity:0;transform:translateY(32px) scale(0.94);}to{opacity:1;transform:translateY(0) scale(1);}}
          @keyframes pinShakeAnim{0%,100%{transform:translateX(0);}10%{transform:translateX(-12px);}25%{transform:translateX(11px);}40%{transform:translateX(-8px);}55%{transform:translateX(7px);}70%{transform:translateX(-4px);}85%{transform:translateX(3px);}}
          @keyframes pinSpinCW{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
          @keyframes pinSpinCCW{from{transform:rotate(360deg);}to{transform:rotate(0deg);}}
          @keyframes pinSuccessPop{0%{transform:scale(0.3) rotate(-20deg);opacity:0;}55%{transform:scale(1.25) rotate(5deg);}80%{transform:scale(0.92) rotate(-2deg);}100%{transform:scale(1) rotate(0deg);opacity:1;}}
          @keyframes pinErrIn{from{opacity:0;transform:translateY(-6px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);}}
          @keyframes pinGridIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
          @keyframes pinAura{0%,100%{opacity:0.5;transform:translate(-50%,-50%) scale(1);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.18);}}
          @keyframes pinScanLine{0%{top:0%;opacity:0;}10%{opacity:1;}90%{opacity:1;}100%{top:100%;opacity:0;}}
          @keyframes pinBtnShimmer{0%{left:-100%;}100%{left:200%;}}
          @keyframes pinDotPulse{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}
          @keyframes pinCellIn{from{opacity:0;transform:scale(0.7) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
          @keyframes pinRingPulse{0%{transform:scale(1);opacity:0.6;}100%{transform:scale(1.7);opacity:0;}}
          .pin-card{animation:pinCardIn 0.55s cubic-bezier(0.16,1,0.3,1) both;}
          .pin-shake{animation:pinShakeAnim 0.55s cubic-bezier(0.36,0.07,0.19,0.97) both;}
          .pin-orbit-cw{animation:pinSpinCW 12s linear infinite;}
          .pin-orbit-ccw{animation:pinSpinCCW 20s linear infinite;}
          .pin-aura{position:absolute;top:50%;left:50%;animation:pinAura 3.5s ease-in-out infinite;}
          .pin-scan{animation:pinScanLine 2.5s ease-in-out infinite;}
          .pin-success-icon{animation:pinSuccessPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;}
          .pin-err-msg{animation:pinErrIn 0.22s cubic-bezier(0.22,1,0.36,1) both;}
          .pin-ring-pulse{animation:pinRingPulse 1.6s ease-out infinite;}
          .pin-cell{
            width:46px;height:58px;border-radius:14px;
            background:rgba(255,255,255,0.04);
            border:1.5px solid rgba(255,255,255,0.08);
            font-size:22px;font-weight:800;color:#38bdf8;
            text-align:center;outline:none;caret-color:transparent;
            transition:border-color 200ms,box-shadow 200ms,background 200ms,transform 150ms;
            animation:pinCellIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
          }
          .pin-cell:focus{
            border-color:rgba(56,189,248,0.7);
            box-shadow:0 0 0 3px rgba(56,189,248,0.15),0 0 20px rgba(56,189,248,0.2);
            background:rgba(56,189,248,0.06);
            transform:scale(1.08) translateY(-2px);
          }
          .pin-cell.filled{
            border-color:rgba(56,189,248,0.5);
            background:rgba(56,189,248,0.08);
            color:#38bdf8;
            text-shadow:0 0 10px rgba(56,189,248,0.6);
          }
          .pin-cell.err{
            border-color:rgba(248,113,113,0.65)!important;
            box-shadow:0 0 0 3px rgba(248,113,113,0.12)!important;
            background:rgba(248,113,113,0.06)!important;
            color:#f87171!important;
            text-shadow:0 0 10px rgba(248,113,113,0.5)!important;
            transform:scale(1)!important;
          }
          .pin-cell.success-cell{
            border-color:rgba(52,211,153,0.6)!important;
            box-shadow:0 0 0 3px rgba(52,211,153,0.12)!important;
            background:rgba(52,211,153,0.07)!important;
            color:#34d399!important;
            text-shadow:0 0 10px rgba(52,211,153,0.5)!important;
          }
          .pin-progress-bar{height:2px;background:linear-gradient(90deg,#38bdf8,#818cf8);border-radius:99px;transition:width 200ms cubic-bezier(0.22,1,0.36,1);}
          .pin-btn{
            width:100%;padding:14px;border-radius:14px;border:none;
            font-size:13.5px;font-weight:700;letter-spacing:0.01em;
            cursor:pointer;position:relative;overflow:hidden;
            transition:opacity 180ms,transform 180ms,box-shadow 250ms,background 400ms;
            color:#fff;
          }
          .pin-btn::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transition:none;}
          .pin-btn:not(:disabled):hover::before{animation:pinBtnShimmer 0.7s ease forwards;}
          .pin-btn:not(:disabled):hover{transform:translateY(-1.5px);opacity:0.93;}
          .pin-btn:not(:disabled):active{transform:scale(0.975);}
          .pin-btn:disabled{opacity:0.28;cursor:not-allowed;}
          .pin-back-btn{background:none;border:none;cursor:pointer;font-size:11.5px;font-weight:500;color:rgba(255,255,255,0.22);transition:color 180ms;padding:0;letter-spacing:0.02em;}
          .pin-back-btn:hover{color:rgba(255,255,255,0.55);}
          .pin-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);display:inline-block;animation:pinDotPulse 1.2s ease-in-out infinite;}
          @media(max-width:400px){
            .pin-cell{width:40px;height:52px;border-radius:12px;}
          }
          @media(max-width:340px){
            .pin-cell{width:35px;height:46px;border-radius:10px;}
          }
        `}</style>

        <div style={{ position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none' }}>
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 60% at 50% 40%,rgba(14,165,233,0.09) 0%,transparent 70%)' }} />
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 50% 40% at 80% 80%,rgba(129,140,248,0.06) 0%,transparent 60%)' }} />
          <div style={{ position:'absolute',top:'20%',left:'15%',width:180,height:180,borderRadius:'50%',background:'rgba(56,189,248,0.04)',filter:'blur(50px)' }} />
          <div style={{ position:'absolute',bottom:'15%',right:'10%',width:220,height:220,borderRadius:'50%',background:'rgba(129,140,248,0.04)',filter:'blur(60px)' }} />
          <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.025) 1px,transparent 1px)',backgroundSize:'28px 28px',maskImage:'radial-gradient(ellipse 80% 70% at 50% 50%,black 30%,transparent 80%)' }} />
        </div>

        <div className="pin-card" style={{ background:'rgba(10,12,20,0.92)',backdropFilter:'blur(40px) saturate(150%)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:24,maxWidth:340,width:'100%',padding:'32px 24px 24px',boxShadow:'0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06)',position:'relative',overflow:'hidden' }}>

          <div style={{ position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(56,189,248,0.4),rgba(129,140,248,0.4),transparent)' }} />

          {!pinSuccess && !pinVerifying && (
            <div className="pin-scan" style={{ position:'absolute',left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(56,189,248,0.25),transparent)',pointerEvents:'none' }} />
          )}

          <div style={{ display:'flex',justifyContent:'center',marginBottom:24 }}>
            <div style={{ position:'relative',width:72,height:72 }}>
              <div className="pin-aura" style={{ width:130,height:130,borderRadius:'50%',background:pinSuccess?'radial-gradient(circle,rgba(52,211,153,0.12) 0%,transparent 70%)':pinError?'radial-gradient(circle,rgba(248,113,113,0.1) 0%,transparent 70%)':'radial-gradient(circle,rgba(56,189,248,0.1) 0%,transparent 70%)',transition:'background 500ms' }} />

              <svg style={{ position:'absolute',inset:-14,width:'calc(100% + 28px)',height:'calc(100% + 28px)' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke={pinSuccess?'rgba(52,211,153,0.18)':pinError?'rgba(248,113,113,0.18)':'rgba(56,189,248,0.15)'} strokeWidth="0.8" strokeDasharray="4 3" style={{ transformOrigin:'50% 50%',animation:'pinSpinCW 18s linear infinite',transition:'stroke 400ms' }} />
              </svg>
              <svg style={{ position:'absolute',inset:-8,width:'calc(100% + 16px)',height:'calc(100% + 16px)' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke={pinSuccess?'rgba(52,211,153,0.1)':pinError?'rgba(248,113,113,0.1)':'rgba(129,140,248,0.12)'} strokeWidth="1" strokeDasharray="2 6" style={{ transformOrigin:'50% 50%',animation:'pinSpinCCW 12s linear infinite',transition:'stroke 400ms' }} />
              </svg>

              {pinSuccess && (
                <>
                  <div className="pin-ring-pulse" style={{ position:'absolute',inset:-4,borderRadius:'50%',border:'1.5px solid rgba(52,211,153,0.4)' }} />
                  <div className="pin-ring-pulse" style={{ position:'absolute',inset:-4,borderRadius:'50%',border:'1.5px solid rgba(52,211,153,0.25)',animationDelay:'0.4s' }} />
                </>
              )}

              <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:pinSuccess?'linear-gradient(135deg,rgba(52,211,153,0.15),rgba(16,185,129,0.1))':pinError?'linear-gradient(135deg,rgba(248,113,113,0.15),rgba(239,68,68,0.1))':'linear-gradient(135deg,rgba(56,189,248,0.12),rgba(129,140,248,0.08))',border:`1.5px solid ${pinSuccess?'rgba(52,211,153,0.4)':pinError?'rgba(248,113,113,0.4)':'rgba(56,189,248,0.25)'}`,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',transition:'all 400ms' }}>
                {pinSuccess
                  ? <FiCheckCircle className="pin-success-icon" style={{ fontSize:28,color:'#34d399' }} />
                  : <FiShield style={{ fontSize:26,color:pinError?'#f87171':'#38bdf8',transition:'color 300ms',filter:pinError?'drop-shadow(0 0 8px rgba(248,113,113,0.6))':'drop-shadow(0 0 8px rgba(56,189,248,0.5))' }} />
                }
              </div>
            </div>
          </div>

          <div style={{ textAlign:'center',marginBottom:22 }}>
            <h2 style={{ fontSize:19,fontWeight:800,letterSpacing:'-0.04em',marginBottom:6,color:pinSuccess?'#34d399':pinError?'#f87171':'#f1f5f9',transition:'color 350ms',lineHeight:1.2 }}>
              {pinSuccess ? 'Access Granted' : 'Admin Verification'}
            </h2>
            <p style={{ fontSize:12,color:'rgba(255,255,255,0.3)',lineHeight:1.7,margin:0,fontWeight:400 }}>
              {pinSuccess ? 'Initializing secure dashboard...' : pinError ? 'Incorrect PIN — try again' : 'Enter your 6-digit admin PIN'}
            </p>
          </div>

          <div style={{ marginBottom:6 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
              <span style={{ fontSize:10,color:'rgba(255,255,255,0.2)',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' }}>Security Code</span>
              <span style={{ fontSize:10,color:pinError?'#f87171':filledCount===6?'#34d399':'rgba(255,255,255,0.2)',fontWeight:600,transition:'color 250ms' }}>{filledCount}/6</span>
            </div>
            <div style={{ marginBottom:4,height:2,background:'rgba(255,255,255,0.06)',borderRadius:99,overflow:'hidden' }}>
              <div className="pin-progress-bar" style={{ width:`${(filledCount/6)*100}%`,background:pinSuccess?'linear-gradient(90deg,#34d399,#10b981)':pinError?'linear-gradient(90deg,#f87171,#fb923c)':'linear-gradient(90deg,#38bdf8,#818cf8)',transition:'background 400ms' }} />
            </div>
          </div>

          <div className={pinShake ? 'pin-shake' : ''} style={{ display:'flex',gap:6,justifyContent:'center',marginBottom:16 }}>
            {pinDigits.map((d, i) => (
              <input
                key={i} id={`pin-${i}`} type="password" inputMode="numeric" maxLength={1} value={d}
                disabled={pinVerifying || pinSuccess}
                className={['pin-cell', d?'filled':'', pinError?'err':'', pinSuccess?'success-cell':''].filter(Boolean).join(' ')}
                onChange={e => handlePinInput(i, e.target.value)}
                onKeyDown={e => handlePinKey(i, e)}
                autoFocus={i === 0} autoComplete="off"
                style={{ animationDelay:`${i * 0.06}s` }}
              />
            ))}
          </div>

          <div style={{ minHeight:20,marginBottom:14,textAlign:'center' }}>
            {pinError && !pinVerifying && (
              <p className="pin-err-msg" style={{ fontSize:11.5,color:'#f87171',margin:0,display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontWeight:500 }}>
                <FiAlertCircle style={{ fontSize:12,flexShrink:0 }} />
                Incorrect PIN. Please try again.
              </p>
            )}
          </div>

          <button
            className="pin-btn"
            disabled={filledCount < 6 || pinVerifying || pinSuccess}
            onClick={() => verifyPin(pinDigits.join(''))}
            style={{ background:pinSuccess?'linear-gradient(135deg,#34d399,#10b981,#059669)':pinError?'linear-gradient(135deg,#f87171,#ef4444)':'linear-gradient(135deg,#38bdf8,#818cf8,#3b82f6)',boxShadow:pinSuccess?'0 6px 24px rgba(52,211,153,0.35)':pinError?'0 6px 20px rgba(248,113,113,0.3)':'0 6px 24px rgba(56,189,248,0.3)',transition:'background 400ms,box-shadow 400ms' }}
          >
            {pinVerifying ? (
              <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
                <span className="pin-dot" style={{ animationDelay:'0ms' }} />
                <span className="pin-dot" style={{ animationDelay:'180ms' }} />
                <span className="pin-dot" style={{ animationDelay:'360ms' }} />
              </span>
            ) : pinSuccess ? (
              <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
                <FiCheckCircle style={{ fontSize:14 }} />
                Access Granted
              </span>
            ) : (
              <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
                <FiShield style={{ fontSize:13 }} />
                Verify PIN
              </span>
            )}
          </button>

          <div style={{ textAlign:'center',marginTop:16 }}>
            <button className="pin-back-btn" onClick={() => window.location.href='/console'}>
              ← Back to Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a0f]">

      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0a0e17]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06]">
        <div className="flex items-center justify-between px-3 sm:px-5 h-12 sm:h-13">

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <DiSwift className="flex-shrink-0 text-[28px] sm:text-[32px] text-sky-500 dark:text-sky-400" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-[15px] font-bold text-slate-800 dark:text-white leading-none tracking-tight truncate">
                Admin Dashboard
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">Aichixia Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all duration-150 disabled:opacity-40"
            >
              <FiRefreshCw className={`text-xs flex-shrink-0 transition-transform duration-700 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-0.5" />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex w-full overflow-x-auto scrollbar-none border-t border-slate-100 dark:border-white/[0.04]">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 font-semibold transition-all duration-200 whitespace-nowrap text-[10px] sm:text-[11px] min-w-[52px] group ${
                  active
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50/80 dark:hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`flex-shrink-0 transition-all duration-200 text-xs sm:text-[13px] ${active ? 'text-sky-500' : 'group-hover:scale-105'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {active && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      <main className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <Overview users={users} promoCodes={promoCodes} redemptions={redemptions} onNavigate={handleTabChange} onCreatePromo={() => setShowCreateModal(true)} />
          )}
          {activeTab === 'monitoring' && (
            <Monitoring recentLogs={requestLogs} users={users} onRefresh={() => fetchAllData(true)} loading={false} refreshing={refreshing} />
          )}
          {activeTab === 'analytics' && (
            <Analytics dailyUsage={dailyUsage} requestLogs={requestLogs} loading={false} />
          )}
          {activeTab === 'promos' && (
            <Promos promoCodes={promoCodes} onCreatePromo={() => setShowCreateModal(true)} onTogglePromo={handleTogglePromo} onCopyCode={copyToClipboard} copiedCode={copiedCode} loading={false} />
          )}
          {activeTab === 'redemptions' && (
            <Redemptions redemptions={redemptions} loading={false} />
          )}
          {activeTab === 'users' && (
            <Users users={users} onViewUser={openUserDetail} loading={false} />
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Create Promo Code</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <FiX className="text-base text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Promo Code</label>
                <input type="text" value={newPromo.code} onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} placeholder="SUMMER2025"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all" autoFocus />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Plan Type</label>
                <select value={newPromo.plan_type} onChange={e => setNewPromo({ ...newPromo, plan_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all">
                  <option value="pro">Pro (4000 req/day)</option>
                  <option value="enterprise">Enterprise (8000 req/day)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration (days)</label>
                  <input type="number" value={newPromo.duration_days} onChange={e => setNewPromo({ ...newPromo, duration_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Max Uses</label>
                  <input type="number" value={newPromo.max_uses} onChange={e => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4">
              <button onClick={() => setShowCreateModal(false)} disabled={actionLoading} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition-colors text-xs disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleCreatePromo} disabled={actionLoading} className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20">
                {actionLoading ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Promo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserDetailModal && selectedUser && (() => {
        const PlanIcon = getPlanIcon(selectedUser.plan);
        const isExpired = selectedUser.plan_expires_at && new Date(selectedUser.plan_expires_at) < new Date();
        const userChartData = getUserChartData(selectedUser.user_id);
        const userStats = getUserTotalStats(selectedUser.user_id);
        const activeLine = chartLines.find(l => l.key === activeChartLine)!;

        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ animation: 'udBgIn 0.25s ease both' }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeUserDetail} />

            <div
              ref={userDetailRef}
              className="relative w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-sky-100/80 dark:border-sky-900/40 shadow-2xl shadow-sky-500/10 overflow-hidden"
              style={{
                animation: userDetailVisible
                  ? 'udModalIn 0.32s cubic-bezier(0.22,1,0.36,1) both'
                  : 'udModalOut 0.28s cubic-bezier(0.4,0,1,1) both',
                maxHeight: '92vh',
                overflowY: 'auto',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-sky-500/10 via-blue-500/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative px-4 sm:px-5 pt-4 sm:pt-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {selectedUser.avatar_url ? (
                        <img
                          src={selectedUser.avatar_url}
                          alt={selectedUser.display_name || selectedUser.email}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-400/40"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getPlanGradient(selectedUser.plan)} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-black text-xl">
                            {(selectedUser.display_name || selectedUser.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-gradient-to-br ${getPlanGradient(selectedUser.plan)} flex items-center justify-center shadow-md`}>
                        <PlanIcon className="text-white" style={{ fontSize: 10 }} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[160px]">
                        {selectedUser.display_name || 'No Name'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{selectedUser.email}</p>
                      <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${getPlanBadge(selectedUser.plan)}`}>
                        <PlanIcon style={{ fontSize: 9 }} />
                        {selectedUser.plan.charAt(0).toUpperCase() + selectedUser.plan.slice(1)}
                      </div>
                    </div>
                  </div>
                  <button onClick={closeUserDetail} className="flex-shrink-0 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <FiX className="text-sm text-slate-500 dark:text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Requests', value: userStats.totalRequests.toLocaleString(), color: 'text-sky-600 dark:text-sky-400' },
                    { label: 'Success', value: userStats.successCount.toLocaleString(), color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Errors', value: userStats.errorCount.toLocaleString(), color: 'text-red-500 dark:text-red-400' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 text-center border border-slate-100 dark:border-slate-700/50">
                      <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 mb-3">
                  <button
                    onClick={() => openKeysModal(selectedUser)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-200 dark:hover:border-sky-800/60 transition-all duration-150 group"
                  >
                    <FiKey className="text-sky-500 flex-shrink-0" style={{ fontSize: 10 }} />
                    <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-1 text-left">Active Keys</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedUser.active_keys}</p>
                    <FiChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-sky-400 dark:group-hover:text-sky-500 transition-colors" style={{ fontSize: 10 }} />
                  </button>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                    <FiCalendar className="text-sky-500 flex-shrink-0" style={{ fontSize: 10 }} />
                    <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-1">Joined</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {selectedUser.plan_expires_at && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                      <FiCheckCircle className={isExpired ? 'text-red-500' : 'text-emerald-500'} style={{ fontSize: 10 }} />
                      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-1">Plan {isExpired ? 'Expired' : 'Expires'}</p>
                      <p className={`text-xs font-bold ${isExpired ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {new Date(selectedUser.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-sky-50/40 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-800/30 p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <FiTrendingUp className="text-sky-500 text-xs" />
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Usage · 30 days</p>
                    </div>
                    <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-sky-100 dark:border-sky-800/40">
                      {chartLines.map(line => (
                        <button
                          key={line.key}
                          onClick={() => setActiveChartLine(line.key)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold transition-all duration-200 ${activeChartLine === line.key ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: line.color }} />
                          {line.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {userChartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-1.5">
                      <div className="w-8 h-8 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
                        <FiTrendingUp className="text-sky-400" style={{ fontSize: 14 }} />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">No usage data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={userChartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                        <defs>
                          {chartLines.map(line => (
                            <linearGradient key={line.gradId} id={line.gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={line.color} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-sky-100 dark:text-sky-900/50" />
                        <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-slate-400 dark:text-slate-500" />
                        <YAxis tick={{ fontSize: 8, fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-slate-400 dark:text-slate-500" />
                        <Tooltip content={<UserDetailTooltip />} cursor={{ stroke: activeLine.color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                          type="monotone"
                          dataKey={activeChartLine}
                          stroke={activeLine.color}
                          fillOpacity={1}
                          fill={`url(#${activeLine.gradId})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3.5, fill: activeLine.color, strokeWidth: 2, stroke: '#fff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="border-t border-sky-100 dark:border-sky-900/40 pt-3">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <FiEdit2 className="text-sky-500 text-xs" />
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Edit Plan</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[9px] font-semibold text-sky-600 dark:text-sky-500 uppercase tracking-wider mb-1">Plan</label>
                      <select
                        value={editUser.plan}
                        onChange={e => setEditUser({ ...editUser, plan: e.target.value })}
                        className="w-full px-3 py-2 bg-sky-50/60 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                      >
                        <option value="free">Free (1000 req/day)</option>
                        <option value="pro">Pro (4000 req/day)</option>
                        <option value="enterprise">Enterprise (8000 req/day)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-sky-600 dark:text-sky-500 uppercase tracking-wider mb-1">Expires At</label>
                      <input
                        type="datetime-local"
                        value={editUser.plan_expires_at}
                        onChange={e => setEditUser({ ...editUser, plan_expires_at: e.target.value })}
                        className="w-full px-3 py-2 bg-sky-50/60 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={closeUserDetail}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-800/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50 rounded-xl font-semibold transition-all text-xs disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateUserPlan}
                      disabled={actionLoading}
                      className="relative flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl font-semibold transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 overflow-hidden"
                      style={{ boxShadow: '0 4px 16px rgba(14,165,233,0.35)' }}
                    >
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-y-0 w-1/3 bg-white/20 skew-x-[-15deg] animate-shimmer-pass" />
                      </div>
                      {actionLoading
                        ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                        : <><FiSave className="text-xs" />Save Changes</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes udBgIn { from{opacity:0;} to{opacity:1;} }
              @keyframes udModalIn { from{opacity:0;transform:translateY(20px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
              @keyframes udModalOut { from{opacity:1;transform:translateY(0) scale(1);} to{opacity:0;transform:translateY(16px) scale(0.97);} }
              @keyframes shimmerPass { 0%{transform:translateX(-200%);} 100%{transform:translateX(200%);} }
              .animate-shimmer-pass { animation:shimmerPass 2.5s ease-in-out infinite; }
              @media(max-width:640px) {
                @keyframes udModalIn { from{opacity:0;transform:translateY(100%);} to{opacity:1;transform:translateY(0);} }
                @keyframes udModalOut { from{opacity:1;transform:translateY(0);} to{opacity:0;transform:translateY(60px);} }
              }
            `}</style>
          </div>
        );
      })()}

      {showKeysModal && selectedUser && (() => {
        const getRateLimitColor = (used: number, limit: number) => {
          const pct = limit > 0 ? (used / limit) * 100 : 0;
          if (pct >= 90) return { bar: '#f87171', text: 'text-red-500 dark:text-red-400', bg: 'bg-red-500' };
          if (pct >= 60) return { bar: '#fb923c', text: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500' };
          return { bar: '#0ea5e9', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500' };
        };

        return (
          <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ animation: 'kmBgIn 0.2s ease both' }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeKeysModal} />

            <div
              ref={keysModalRef}
              className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
              style={{
                animation: keysModalVisible
                  ? 'kmIn 0.35s cubic-bezier(0.22,1,0.36,1) both'
                  : 'kmOut 0.25s cubic-bezier(0.4,0,1,1) both',
                maxHeight: '88vh',
                background: 'rgba(10,14,23,0.96)',
                border: '1px solid rgba(14,165,233,0.15)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: 'blur(40px) saturate(160%)',
              }}
            >
              <div style={{ position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.5),rgba(56,189,248,0.4),transparent)' }} />
              <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(14,165,233,0.07) 0%,transparent 70%)',pointerEvents:'none' }} />

              <div className="relative px-4 sm:px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center" style={{ boxShadow:'0 0 16px rgba(14,165,233,0.15)' }}>
                      <FiKey className="text-sky-400" style={{ fontSize:13 }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">API Keys</p>
                      <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[180px]">{selectedUser.display_name || selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeKeysModal}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.09)')}
                    onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.05)')}
                  >
                    <FiX style={{ fontSize:12,color:'rgba(255,255,255,0.5)' }} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mb-4 mt-3">
                  <div className="h-px flex-1" style={{ background:'linear-gradient(90deg,rgba(14,165,233,0.3),transparent)' }} />
                  <span style={{ fontSize:9,color:'rgba(14,165,233,0.5)',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase' }}>
                    {keysLoading ? 'Loading...' : `${userKeys.length} key${userKeys.length !== 1 ? 's' : ''}`}
                  </span>
                  <div className="h-px flex-1" style={{ background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.3))' }} />
                </div>

                <div className="overflow-y-auto space-y-2.5" style={{ maxHeight:'60vh' }}>
                  {keysLoading ? (
                    <div className="space-y-2.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl p-3.5 animate-pulse" style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg" style={{ background:'rgba(14,165,233,0.08)' }} />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 rounded-full w-1/3" style={{ background:'rgba(255,255,255,0.07)' }} />
                              <div className="h-2.5 rounded-full w-1/2" style={{ background:'rgba(255,255,255,0.04)' }} />
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.04)' }} />
                        </div>
                      ))}
                    </div>
                  ) : userKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:'rgba(14,165,233,0.06)',border:'1px solid rgba(14,165,233,0.12)' }}>
                        <FiKey style={{ fontSize:18,color:'rgba(14,165,233,0.4)' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-slate-400 mb-0.5">No API Keys</p>
                        <p style={{ fontSize:11,color:'rgba(255,255,255,0.2)' }}>This user has no active keys</p>
                      </div>
                    </div>
                  ) : (
                    userKeys.map((key, idx) => {
                      const pct = key.rate_limit > 0 ? Math.min((key.requests_today / key.rate_limit) * 100, 100) : 0;
                      const colors = getRateLimitColor(key.requests_today, key.rate_limit);
                      return (
                        <div
                          key={key.id}
                          className="group rounded-xl p-3.5 transition-all duration-200"
                          style={{
                            background:'rgba(255,255,255,0.03)',
                            border:'1px solid rgba(255,255,255,0.07)',
                            animation:`kmItemIn 0.3s cubic-bezier(0.22,1,0.36,1) ${idx * 0.05}s both`,
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(14,165,233,0.05)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(14,165,233,0.18)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.07)'; }}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(14,165,233,0.08)',border:'1px solid rgba(14,165,233,0.15)' }}>
                              <FiKey style={{ fontSize:12,color:'#38bdf8' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs font-bold text-white truncate">{key.name || 'Unnamed Key'}</p>
                                <span
                                  className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                                  style={{
                                    background: key.is_active ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                                    border: `1px solid ${key.is_active ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                                    color: key.is_active ? '#34d399' : '#f87171',
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {key.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="font-mono text-[9px] truncate" style={{ color:'rgba(255,255,255,0.25)' }}>
                                {key.key_prefix}••••••••••••
                              </p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(key.key_prefix, key.id)}
                              className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150"
                              style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)' }}
                              onMouseEnter={e => (e.currentTarget.style.background='rgba(14,165,233,0.1)')}
                              onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.04)')}
                            >
                              {copiedCode === key.id
                                ? <FiCheck style={{ fontSize:9,color:'#34d399' }} />
                                : <FiCopy style={{ fontSize:9,color:'rgba(255,255,255,0.3)' }} />
                              }
                            </button>
                          </div>

                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1.5">
                              <span style={{ fontSize:9,color:'rgba(255,255,255,0.25)',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' }}>Rate Limit Today</span>
                              <span className={`text-[10px] font-bold tabular-nums ${colors.text}`}>
                                {key.requests_today.toLocaleString()} / {key.rate_limit.toLocaleString()}
                              </span>
                            </div>
                            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                              <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                                style={{ width:`${pct}%`,background:`linear-gradient(90deg,${colors.bar}cc,${colors.bar})`,boxShadow:`0 0 8px ${colors.bar}50` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span style={{ fontSize:8,color:'rgba(255,255,255,0.18)' }}>
                                {key.last_used_at
                                  ? `Last used ${new Date(key.last_used_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}`
                                  : 'Never used'
                                }
                              </span>
                              <span style={{ fontSize:8,fontWeight:700,color:colors.bar }}>{Math.round(pct)}%</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-2" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                            <FiCalendar style={{ fontSize:8,color:'rgba(255,255,255,0.2)',flexShrink:0 }} />
                            <span style={{ fontSize:9,color:'rgba(255,255,255,0.2)' }}>
                              Created {new Date(key.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-4 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={closeKeysModal}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-150"
                    style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.7)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.5)'; }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes kmBgIn { from{opacity:0;} to{opacity:1;} }
              @keyframes kmIn { from{opacity:0;transform:translateY(24px) scale(0.96);} to{opacity:1;transform:translateY(0) scale(1);} }
              @keyframes kmOut { from{opacity:1;transform:translateY(0) scale(1);} to{opacity:0;transform:translateY(16px) scale(0.97);} }
              @keyframes kmItemIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
              @media(max-width:640px) {
                @keyframes kmIn { from{opacity:0;transform:translateY(100%);} to{opacity:1;transform:translateY(0);} }
                @keyframes kmOut { from{opacity:1;transform:translateY(0);} to{opacity:0;transform:translateY(60px);} }
              }
            `}</style>
          </div>
        );
      })()}

      {toast && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[60] animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-sm flex-shrink-0" /> : <FiAlertCircle className="text-sm flex-shrink-0" />}
            <p className="font-semibold text-xs">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
