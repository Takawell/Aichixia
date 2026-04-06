import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { FaServer } from 'react-icons/fa';
import { FiActivity, FiGift, FiCalendar, FiUsers, FiRefreshCw, FiX, FiCheckCircle, FiAlertCircle, FiLock, FiBarChart2, FiEye, FiShield, FiDatabase, FiKey, FiCpu, FiCheck } from 'react-icons/fi';
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

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'overview',     label: 'Overview',     icon: FiActivity   },
  { id: 'monitoring',   label: 'Monitoring',   icon: FiEye        },
  { id: 'analytics',   label: 'Analytics',    icon: FiBarChart2  },
  { id: 'promos',      label: 'Promos',       icon: FiGift       },
  { id: 'redemptions', label: 'Redemptions',  icon: FiCalendar   },
  { id: 'users',       label: 'Users',        icon: FiUsers      },
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
  const [showEditUserModal, setShowEditUserModal] = useState(false);
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
        fetch('/api/console/stats?type=logs&limit=2000&admin=true', { headers: { Authorization: `Bearer ${token}` } }),
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
    if (res.ok) { setShowEditUserModal(false); setSelectedUser(null); fetchAllData(true); showToast('User plan updated successfully', 'success'); }
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

  const loadingSteps = [
    { icon: FiShield,   text: 'Initializing admin security', color: 'from-sky-400 to-blue-500'     },
    { icon: FiLock,     text: 'Verifying admin credentials', color: 'from-blue-400 to-indigo-500'  },
    { icon: FiDatabase, text: 'Loading system data',         color: 'from-indigo-400 to-purple-500'},
    { icon: FiUsers,    text: 'Fetching user database',      color: 'from-purple-400 to-pink-500'  },
    { icon: FiBarChart2,text: 'Preparing analytics',         color: 'from-pink-400 to-rose-500'    },
    { icon: FiCheck,    text: 'Admin panel ready',           color: 'from-emerald-400 to-green-500'},
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
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-sky-400/20 dark:border-sky-400/30"
                    style={{ animation: `ping ${2 + i * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`, animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
              <div className="absolute inset-2 rounded-full border border-dashed border-sky-400/30 dark:border-sky-400/40 animate-spin-slow" />
              <div className="relative z-10 transform hover:scale-110 transition-transform duration-500">
                <Image
                  src="/logo.png"
                  alt="Aichixia"
                  width={40}
                  height={40}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 drop-shadow-2xl"
                  priority
                />
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
                <div
                  className={`h-full bg-gradient-to-r ${loadingSteps[loadingStep].color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="absolute -top-7 sm:-top-8 left-0 right-0 flex items-center justify-between px-1">
                <div className="text-xs sm:text-sm font-bold text-transparent bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text">
                  {Math.round(loadingProgress)}%
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full bg-gradient-to-r ${loadingSteps[loadingStep].color}`}
                      style={{ animation: `bounce 1s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
                    />
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
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? `bg-gradient-to-br ${step.color} shadow-lg shadow-sky-500/30`
                          : isComplete
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                      }`}>
                        <StepIcon className={`w-4 h-4 transition-colors duration-500 ${
                          isActive ? 'text-white' : isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'
                        }`} />
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
                    <div className={`w-full h-0.5 rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-emerald-500/30' : isActive ? `bg-gradient-to-r ${step.color} opacity-50` : 'bg-slate-200 dark:bg-slate-800'
                    }`} />
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-2.5 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-100/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm">
              <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br ${loadingSteps[loadingStep].color} shadow-lg`}>
                {loadingStep === 5 ? (
                  <FiCheck className="w-3.5 h-3.5 text-white" />
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold mb-0.5 ${
                  loadingStep === 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                }`}>
                  {loadingSteps[loadingStep].text}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                  {loadingStep !== 5 && (
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 h-0.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                  <span className="font-medium">
                    {loadingStep === 5 ? 'Ready to use' : 'Processing...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-600 font-medium">
            Aichixia Admin Portal
          </div>
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
      <div style={{
        position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        padding:16, background:'radial-gradient(ellipse at 50% 40%,rgba(239,68,68,0.07) 0%,transparent 70%),#09090b',
      }}>
        <style>{`
          @keyframes adFadeUp{from{opacity:0;transform:translateY(20px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
          @keyframes adPulse{0%,100%{opacity:.5;transform:scale(1);}50%{opacity:1;transform:scale(1.08);}}
          @keyframes adOrbit{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
          .ad-card{animation:adFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;}
          .ad-orbit{animation:adOrbit 12s linear infinite;}
          .ad-pulse{animation:adPulse 2.5s ease-in-out infinite;}
          .ad-btn{width:100%;padding:11px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#38bdf8,#3b82f6);color:#fff;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:-0.01em;transition:opacity 150ms,transform 150ms,box-shadow 200ms;box-shadow:0 4px 16px rgba(56,189,248,0.3);}
          .ad-btn:hover{opacity:0.88;transform:translateY(-1px);box-shadow:0 6px 20px rgba(56,189,248,0.35);}
          .ad-btn:active{transform:scale(0.98);}
        `}</style>
        <div className="ad-card" style={{ background:'rgba(18,18,20,0.95)',backdropFilter:'blur(24px)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:20,maxWidth:380,width:'100%',padding:'32px 28px',boxShadow:'0 24px 64px rgba(0,0,0,0.6),0 0 0 1px rgba(239,68,68,0.08)' }}>
          <div style={{ display:'flex',justifyContent:'center',marginBottom:24 }}>
            <div style={{ position:'relative',width:72,height:72 }}>
              <div className="ad-orbit" style={{ position:'absolute',inset:-6,borderRadius:'50%',border:'1px dashed rgba(239,68,68,0.25)' }} />
              <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <FiLock style={{ fontSize:28,color:'#f87171' }} />
              </div>
              <div className="ad-pulse" style={{ position:'absolute',inset:-14,borderRadius:'50%',background:'rgba(239,68,68,0.06)' }} />
            </div>
          </div>
          <div style={{ textAlign:'center',marginBottom:20 }}>
            <h2 style={{ fontSize:22,fontWeight:800,color:'#fff',letterSpacing:'-0.03em',marginBottom:8 }}>Access Denied</h2>
            <p style={{ fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.6 }}>This area is restricted to administrators only.</p>
          </div>
          <div style={{ padding:'12px 14px',borderRadius:12,marginBottom:20,background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',display:'flex',alignItems:'flex-start',gap:10 }}>
            <FiAlertCircle style={{ fontSize:13,color:'#f87171',flexShrink:0,marginTop:1 }} />
            <p style={{ fontSize:12,color:'rgba(255,255,255,0.4)',margin:0,lineHeight:1.55 }}>If you believe this is an error, please contact your system administrator.</p>
          </div>
          <button className="ad-btn" onClick={() => window.location.href='/console'}>Back to Console</button>
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
        setTimeout(() => { setPinVerified(true); setShowPinModal(false); }, 500);
      } else {
        setPinError(true); setPinShake(true); setPinDigits(['','','','','','']);
        setTimeout(() => setPinShake(false), 500);
        setTimeout(() => { const el = document.getElementById('pin-0'); if (el) (el as HTMLInputElement).focus(); }, 50);
      }
    };

    return (
      <div style={{ position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',background:'#07090f' }}>
        <style>{`
          @keyframes pinBgPulse{0%,100%{opacity:.6;transform:scale(1);}50%{opacity:1;transform:scale(1.15);}}
          @keyframes pinCardIn{from{opacity:0;transform:translateY(24px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}
          @keyframes pinShakeAnim{0%,100%{transform:translateX(0);}12%{transform:translateX(-10px);}25%{transform:translateX(10px);}37%{transform:translateX(-8px);}50%{transform:translateX(8px);}62%{transform:translateX(-5px);}75%{transform:translateX(5px);}87%{transform:translateX(-2px);}}
          @keyframes pinOrbitA{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
          @keyframes pinOrbitB{from{transform:rotate(360deg);}to{transform:rotate(0deg);}}
          @keyframes pinSuccessScale{0%{transform:scale(0.5);opacity:0;}60%{transform:scale(1.2);}100%{transform:scale(1);opacity:1;}}
          @keyframes pinErrIn{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
          .pin-card-wrap{animation:pinCardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;}
          .pin-shake{animation:pinShakeAnim 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both;}
          .pin-orbit-a{animation:pinOrbitA 10s linear infinite;}
          .pin-orbit-b{animation:pinOrbitB 16s linear infinite;}
          .pin-bg-pulse{animation:pinBgPulse 3s ease-in-out infinite;}
          .pin-success-icon{animation:pinSuccessScale 0.4s cubic-bezier(0.34,1.56,0.64,1) both;}
          .pin-err-msg{animation:pinErrIn 0.2s ease both;}
          .pin-cell{width:46px;height:56px;border-radius:14px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.09);font-size:24px;font-weight:800;color:#fff;text-align:center;outline:none;caret-color:transparent;-webkit-text-security:disc;transition:border-color 180ms,box-shadow 180ms,background 180ms,transform 120ms;}
          .pin-cell:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,0.2),0 0 12px rgba(56,189,248,0.15);background:rgba(56,189,248,0.07);transform:scale(1.05);}
          .pin-cell.filled{border-color:rgba(56,189,248,0.4);background:rgba(56,189,248,0.06);}
          .pin-cell.err{border-color:rgba(248,113,113,0.55)!important;box-shadow:0 0 0 3px rgba(248,113,113,0.14)!important;background:rgba(248,113,113,0.07)!important;transform:scale(1)!important;}
          .pin-cell.success-cell{border-color:rgba(52,211,153,0.55)!important;box-shadow:0 0 0 3px rgba(52,211,153,0.14)!important;background:rgba(52,211,153,0.07)!important;}
          .pin-btn{width:100%;padding:13px;border-radius:14px;border:none;font-size:14px;font-weight:700;letter-spacing:-0.02em;cursor:pointer;position:relative;overflow:hidden;transition:opacity 150ms,transform 150ms,box-shadow 200ms;}
          .pin-btn:not(:disabled):hover{opacity:0.88;transform:translateY(-1px);}
          .pin-btn:not(:disabled):active{transform:scale(0.98);}
          .pin-btn:disabled{opacity:0.3;cursor:not-allowed;}
          .pin-back-btn{background:none;border:none;cursor:pointer;font-size:12px;color:rgba(255,255,255,0.28);transition:color 150ms;padding:0;}
          .pin-back-btn:hover{color:rgba(255,255,255,0.6);}
          @media(max-width:380px){.pin-cell{width:40px;height:50px;font-size:20px;border-radius:11px;}}
        `}</style>

        <div style={{ position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none' }}>
          <div className="pin-bg-pulse" style={{ position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',width:500,height:500,borderRadius:'50%',background:pinSuccess?'radial-gradient(circle,rgba(52,211,153,0.08) 0%,transparent 70%)':pinError?'radial-gradient(circle,rgba(248,113,113,0.08) 0%,transparent 70%)':'radial-gradient(circle,rgba(56,189,248,0.07) 0%,transparent 70%)',transition:'background 400ms' }} />
        </div>

        <div className="pin-card-wrap" style={{ background:'rgba(13,14,18,0.97)',backdropFilter:'blur(32px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:24,maxWidth:360,width:'100%',padding:'36px 28px 28px',boxShadow:'0 32px 80px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.05)',position:'relative' }}>
          <div style={{ display:'flex',justifyContent:'center',marginBottom:28 }}>
            <div style={{ position:'relative',width:76,height:76 }}>
              <div className="pin-bg-pulse" style={{ position:'absolute',inset:-20,borderRadius:'50%',background:pinSuccess?'rgba(52,211,153,0.07)':'rgba(56,189,248,0.07)',transition:'background 400ms' }} />
              <div className="pin-orbit-a" style={{ position:'absolute',inset:-8,borderRadius:'50%',border:`1px dashed ${pinSuccess?'rgba(52,211,153,0.25)':'rgba(56,189,248,0.2)'}`,transition:'border-color 400ms' }} />
              <div className="pin-orbit-b" style={{ position:'absolute',inset:-16,borderRadius:'50%',border:`1px solid ${pinSuccess?'rgba(52,211,153,0.1)':'rgba(56,189,248,0.08)'}`,transition:'border-color 400ms' }} />
              <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:pinSuccess?'rgba(52,211,153,0.1)':pinError?'rgba(248,113,113,0.1)':'rgba(56,189,248,0.08)',border:`1.5px solid ${pinSuccess?'rgba(52,211,153,0.3)':pinError?'rgba(248,113,113,0.3)':'rgba(56,189,248,0.2)'}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 400ms' }}>
                {pinSuccess ? (
                  <FiCheckCircle className="pin-success-icon" style={{ fontSize:30,color:'#34d399' }} />
                ) : (
                  <FiShield style={{ fontSize:28,color:pinError?'#f87171':'#38bdf8',transition:'color 300ms' }} />
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign:'center',marginBottom:28 }}>
            <h2 style={{ fontSize:21,fontWeight:800,letterSpacing:'-0.03em',marginBottom:7,color:pinSuccess?'#34d399':'#fff',transition:'color 300ms' }}>
              {pinSuccess ? 'Verified!' : 'Admin Verification'}
            </h2>
            <p style={{ fontSize:12,color:'rgba(255,255,255,0.32)',lineHeight:1.65,margin:0 }}>
              {pinSuccess ? 'Access granted. Loading dashboard...' : 'Enter your 6-digit admin PIN to continue'}
            </p>
          </div>

          <div className={pinShake ? 'pin-shake' : ''} style={{ display:'flex',gap:7,justifyContent:'center',marginBottom:18 }}>
            {pinDigits.map((d, i) => (
              <input key={i} id={`pin-${i}`} type="password" inputMode="numeric" maxLength={1} value={d}
                disabled={pinVerifying || pinSuccess}
                className={['pin-cell', d?'filled':'', pinError?'err':'', pinSuccess?'success-cell':''].filter(Boolean).join(' ')}
                onChange={(e) => handlePinInput(i, e.target.value)}
                onKeyDown={(e) => handlePinKey(i, e)}
                autoFocus={i === 0} autoComplete="off" />
            ))}
          </div>

          <div style={{ minHeight:22,marginBottom:16,textAlign:'center' }}>
            {pinError && !pinVerifying && (
              <p className="pin-err-msg" style={{ fontSize:12,color:'#f87171',margin:0 }}>Incorrect PIN. Please try again.</p>
            )}
          </div>

          <button className="pin-btn" disabled={pinDigits.join('').length < 6 || pinVerifying || pinSuccess}
            onClick={() => verifyPin(pinDigits.join(''))}
            style={{ background:pinSuccess?'linear-gradient(135deg,#34d399,#10b981)':'linear-gradient(135deg,#38bdf8,#3b82f6)',color:'#fff',boxShadow:pinSuccess?'0 4px 16px rgba(52,211,153,0.3)':'0 4px 16px rgba(56,189,248,0.25)',transition:'background 400ms,box-shadow 400ms' }}>
            {pinVerifying ? (
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                <div style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'pinOrbitA 0.7s linear infinite' }} />
                Verifying...
              </div>
            ) : pinSuccess ? 'Access Granted ✓' : 'Verify PIN'}
          </button>

          <div style={{ textAlign:'center',marginTop:18 }}>
            <button className="pin-back-btn" onClick={() => window.location.href='/console'}>← Back to Console</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <FaServer className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-800 dark:text-white leading-tight">Admin Dashboard</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Manage users, promos & system</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`text-sm sm:text-base text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg sticky top-[52px] sm:top-[60px] z-30">
        <div className="flex w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 font-semibold transition-all duration-200 whitespace-nowrap text-[10px] sm:text-xs border-b-2 relative group ${
                  active
                    ? 'text-sky-600 dark:text-sky-400 border-sky-500'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <Icon className={`text-xs sm:text-sm flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-500 mb-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

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
            <Users users={users} onEditUser={(user) => { setSelectedUser(user); setEditUser({ plan: user.plan, plan_expires_at: user.plan_expires_at ? new Date(user.plan_expires_at).toISOString().slice(0,16) : '' }); setShowEditUserModal(true); }} loading={false} />
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
                <input type="text" value={newPromo.code} onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} placeholder="SUMMER2025"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all" autoFocus />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Plan Type</label>
                <select value={newPromo.plan_type} onChange={(e) => setNewPromo({ ...newPromo, plan_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all">
                  <option value="pro">Pro (400 req/day)</option>
                  <option value="enterprise">Enterprise (800 req/day)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration (days)</label>
                  <input type="number" value={newPromo.duration_days} onChange={(e) => setNewPromo({ ...newPromo, duration_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Max Uses</label>
                  <input type="number" value={newPromo.max_uses} onChange={(e) => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4">
              <button onClick={() => setShowCreateModal(false)} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition-colors text-xs disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleCreatePromo} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                {actionLoading ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Promo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Edit User Plan</h3>
              <button onClick={() => setShowEditUserModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <FiX className="text-base text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div className="mb-3 p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedUser.email}</p>
              {selectedUser.display_name && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{selectedUser.display_name}</p>}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Plan</label>
                <select value={editUser.plan} onChange={(e) => setEditUser({ ...editUser, plan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all">
                  <option value="free">Free (100 req/day)</option>
                  <option value="pro">Pro (400 req/day)</option>
                  <option value="enterprise">Enterprise (800 req/day)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expires At (Optional)</label>
                <input type="datetime-local" value={editUser.plan_expires_at} onChange={(e) => setEditUser({ ...editUser, plan_expires_at: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all" />
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4">
              <button onClick={() => setShowEditUserModal(false)} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition-colors text-xs disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleUpdateUserPlan} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-all text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                {actionLoading ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</> : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-sm flex-shrink-0" /> : <FiAlertCircle className="text-sm flex-shrink-0" />}
            <p className="font-semibold text-xs">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
