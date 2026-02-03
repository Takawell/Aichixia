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

  const [newPromo, setNewPromo] = useState({
    code: '',
    plan_type: 'pro',
    duration_days: 30,
    max_uses: 100,
  });

  const [editUser, setEditUser] = useState({
    plan: 'free',
    plan_expires_at: '',
  });

  useEffect(() => {
    const tab = router.query.tab as TabType;
    if (tab && ['overview', 'monitoring', 'analytics', 'promos', 'redemptions', 'users'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (initialLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          const increment = Math.random() * 12 + 6;
          return Math.min(prev + increment, 95);
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (loadingProgress < 18) {
      setLoadingStep(0);
    } else if (loadingProgress < 36) {
      setLoadingStep(1);
    } else if (loadingProgress < 54) {
      setLoadingStep(2);
    } else if (loadingProgress < 72) {
      setLoadingStep(3);
    } else if (loadingProgress < 90) {
      setLoadingStep(4);
    } else {
      setLoadingStep(5);
    }
  }, [loadingProgress]);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }

    const token = session.access_token;
    const res = await fetch('/api/console/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!data.settings?.is_admin) {
      setAccessDenied(true);
      setInitialLoading(false);
      setLoading(false);
      return;
    }
    fetchAllData();
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
        fetch('/api/console/stats?type=logs&limit=1000&admin=true', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const promosData = await promosRes.json();
      const redemptionsData = await redemptionsRes.json();
      const usersData = await usersRes.json();
      const usageData = await usageRes.json();
      const logsData = await logsRes.json();

      setPromoCodes(promosData.promoCodes || []);
      setRedemptions(redemptionsData.redemptions || []);
      setUsers(usersData.users || []);
      setDailyUsage(usageData.usage || []);
      setRequestLogs(logsData.logs || []);
      
      setLoadingProgress(100);
      setTimeout(() => setInitialLoading(false), 600);
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push({ pathname: '/console/admin', query: { tab } }, undefined, { shallow: true });
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }

    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action: 'update-promo', promo_id: promoId, is_active: !isActive }),
    });

    if (res.ok) {
      fetchAllData(true);
      showToast(`Promo code ${!isActive ? 'activated' : 'deactivated'}`, 'success');
    } else {
      showToast('Failed to update promo code', 'error');
    }
  };

  const handleUpdateUserPlan = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'update-user-plan',
        user_id: selectedUser.user_id,
        plan: editUser.plan,
        plan_expires_at: editUser.plan_expires_at || null,
      }),
    });

    setActionLoading(false);

    if (res.ok) {
      setShowEditUserModal(false);
      setSelectedUser(null);
      fetchAllData(true);
      showToast('User plan updated successfully', 'success');
    } else {
      showToast('Failed to update user plan', 'error');
    }
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
    { icon: FiShield, text: 'Initializing admin security', color: 'from-sky-400 to-blue-500' },
    { icon: FiLock, text: 'Verifying admin credentials', color: 'from-blue-400 to-indigo-500' },
    { icon: FiDatabase, text: 'Loading system data', color: 'from-indigo-400 to-purple-500' },
    { icon: FiUsers, text: 'Fetching user database', color: 'from-purple-400 to-pink-500' },
    { icon: FiBarChart2, text: 'Preparing analytics', color: 'from-pink-400 to-rose-500' },
    { icon: FiCheck, text: 'Admin panel ready', color: 'from-emerald-400 to-green-500' }
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
                    style={{
                      animation: `ping ${2 + i * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
              
              <div className="absolute inset-2 rounded-full border border-dashed border-sky-400/30 dark:border-sky-400/40 animate-spin-slow" />
              
              <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-500">
                <FaServer className="text-white text-xl sm:text-2xl" />
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
                      style={{
                        animation: `bounce 1s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                      }}
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
                          isActive 
                            ? 'text-white' 
                            : isComplete 
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-slate-600'
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
                      isComplete 
                        ? 'bg-emerald-500/30' 
                        : isActive
                        ? `bg-gradient-to-r ${step.color} opacity-50`
                        : 'bg-slate-200 dark:bg-slate-800'
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
                  loadingStep === 5 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-800 dark:text-slate-200'
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
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.05); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.08); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes twinkle-delayed {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.3); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-shimmer {
            animation: shimmer 2s ease-in-out infinite;
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 10s ease-in-out infinite;
          }
          .animate-twinkle {
            animation: twinkle 3s ease-in-out infinite;
          }
          .animate-twinkle-delayed {
            animation: twinkle-delayed 3s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradient 3s ease infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_70%)]" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-200/10 dark:bg-red-500/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-200/10 dark:bg-orange-500/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 sm:p-8 shadow-2xl">
          <div className="relative mb-5">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-400/20 via-orange-400/20 to-red-400/20 rounded-full blur-xl animate-pulse-slow" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <FiLock className="text-3xl sm:text-4xl text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="text-center space-y-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              Access Denied
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              <div className="h-px w-8 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                You don't have permission to access the admin dashboard. This area is restricted to administrators only.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
              <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  If you believe this is an error, please contact your system administrator.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/console'}
            className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Console
          </button>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.05); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.08); }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          .animate-float-delayed {
            animation: float-delayed 10s ease-in-out infinite;
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaServer className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage users, promos & system</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`text-lg text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="overflow-x-auto border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg sticky top-[73px] sm:top-[81px] z-30">
        <div className="flex px-3 sm:px-4 lg:px-8">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'overview'
                ? 'text-sky-600 dark:text-sky-400 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiActivity className="text-sm sm:text-base" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleTabChange('monitoring')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'monitoring'
                ? 'text-sky-600 dark:text-sky-400 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiEye className="text-sm sm:text-base" />
            <span>Monitoring</span>
          </button>
          <button
            onClick={() => handleTabChange('analytics')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'analytics'
                ? 'text-sky-600 dark:text-sky-400 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiBarChart2 className="text-sm sm:text-base" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => handleTabChange('promos')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'promos'
                ? 'text-sky-600 dark:text-sky-400 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiGift className="text-sm sm:text-base" />
            <span>Promos</span>
          </button>
          <button
            onClick={() => handleTabChange('redemptions')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'redemptions'
                ? 'text-sky-600 dark:text-sky-400 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiCalendar className="text-sm sm:text-base" />
            <span>Redemptions</span>
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm border-b-2 ${
              activeTab === 'users'
                ? 'text-sky-600 dark:text-sky-400 border-sky-500'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FiUsers className="text-sm sm:text-base" />
            <span>Users</span>
          </button>
        </div>
      </div>

      <main className="p-3 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <Overview
              users={users}
              promoCodes={promoCodes}
              redemptions={redemptions}
              onNavigate={handleTabChange}
              onCreatePromo={() => setShowCreateModal(true)}
            />
          )}

          {activeTab === 'monitoring' && (
            <Monitoring
              recentLogs={requestLogs}
              users={users}
              onRefresh={() => fetchAllData(true)}
              loading={false}
              refreshing={refreshing}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics
              dailyUsage={dailyUsage}
              requestLogs={requestLogs}
              loading={false}
            />
          )}

          {activeTab === 'promos' && (
            <Promos
              promoCodes={promoCodes}
              onCreatePromo={() => setShowCreateModal(true)}
              onTogglePromo={handleTogglePromo}
              onCopyCode={copyToClipboard}
              copiedCode={copiedCode}
              loading={false}
            />
          )}

          {activeTab === 'redemptions' && (
            <Redemptions
              redemptions={redemptions}
              loading={false}
            />
          )}

          {activeTab === 'users' && (
            <Users
              users={users}
              onEditUser={(user) => {
                setSelectedUser(user);
                setEditUser({
                  plan: user.plan,
                  plan_expires_at: user.plan_expires_at ? new Date(user.plan_expires_at).toISOString().slice(0, 16) : '',
                });
                setShowEditUserModal(true);
              }}
              loading={false}
            />
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Create Promo Code</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Promo Code</label>
                <input
                  type="text"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2025"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Plan Type</label>
                <select
                  value={newPromo.plan_type}
                  onChange={(e) => setNewPromo({ ...newPromo, plan_type: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                >
                  <option value="pro">Pro (400 req/day)</option>
                  <option value="enterprise">Enterprise (800 req/day)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={newPromo.duration_days}
                    onChange={(e) => setNewPromo({ ...newPromo, duration_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Uses</label>
                  <input
                    type="number"
                    value={newPromo.max_uses}
                    onChange={(e) => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 sm:py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePromo}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Promo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Edit User Plan</h3>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedUser.email}</p>
              {selectedUser.display_name && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedUser.display_name}</p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Plan</label>
                <select
                  value={editUser.plan}
                  onChange={(e) => setEditUser({ ...editUser, plan: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                >
                  <option value="free">Free (100 req/day)</option>
                  <option value="pro">Pro (400 req/day)</option>
                  <option value="enterprise">Enterprise (800 req/day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={editUser.plan_expires_at}
                  onChange={(e) => setEditUser({ ...editUser, plan_expires_at: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditUserModal(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 sm:py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUserPlan}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-base sm:text-lg" /> : <FiAlertCircle className="text-base sm:text-lg" />}
            <p className="font-medium text-xs sm:text-sm">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
