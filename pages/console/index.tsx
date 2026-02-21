import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { FiKey, FiActivity, FiSettings, FiLogOut, FiMenu, FiRefreshCw, FiTrendingUp, FiZap, FiLayers, FiAlertCircle, FiShield, FiLock, FiCheck, FiCpu, FiDatabase, FiCode } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';
import Overview from '@/components/console/overview';
import ApiKeys from '@/components/console/apikeys';
import Activity from '@/components/console/activity';
import Models from '@/components/console/models';
import Settings from '@/components/console/settings';
import Playground from '@/components/console/playground';
import Notice from '@/components/console/notice';
import Image from 'next/image';

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

type UserProfile = {
  email: string;
  display_name: string | null;
  avatar_url: string | null;
};

type UserSettings = {
  plan: 'free' | 'pro' | 'enterprise';
  plan_expires_at: string | null;
  is_admin: boolean;
};

type TabType = 'overview' | 'keys' | 'activity' | 'settings' | 'models' | 'playground';

export default function Console() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [usageData, setUsageData] = useState<DailyUsage[]>([]);
  const [stats, setStats] = useState({ totalRequests: 0, activeKeys: 0, rateLimitUsage: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);

  useEffect(() => {
    const tab = router.query.tab as TabType;
    if (tab && ['overview', 'keys', 'activity', 'settings', 'models', 'playground'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (initialLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          const increment = Math.random() * 10 + 5;
          return Math.min(prev + increment, 95);
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (loadingProgress < 20) {
      setLoadingStep(0);
    } else if (loadingProgress < 40) {
      setLoadingStep(1);
    } else if (loadingProgress < 60) {
      setLoadingStep(2);
    } else if (loadingProgress < 80) {
      setLoadingStep(3);
    } else if (loadingProgress < 95) {
      setLoadingStep(4);
    } else {
      setLoadingStep(5);
    }
  }, [loadingProgress]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(session.user);
    await fetchAllData();
    await fetchProfile();
    setLoadingProgress(100);
    setTimeout(() => setInitialLoading(false), 700);
  };

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/profile', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const data = await res.json();
    if (res.ok) {
      setProfile(data.profile);
      setSettings(data.settings);
    }
  };

  const fetchAllData = async (force = false) => {
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;

    if (!force && now - lastFetch < twelveHours) {
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const token = session.access_token;

    try {
      const [keysRes, statsRes, usageRes, logsRes] = await Promise.all([
        fetch('/api/console/keys', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/stats?type=total', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/stats?type=usage&days=7', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/stats?type=logs&limit=20', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const keysData = await keysRes.json();
      const statsData = await statsRes.json();
      const usageDataRes = await usageRes.json();
      const logsData = await logsRes.json();

      setKeys(keysData.keys || []);
      setStats(statsData.stats || { totalRequests: 0, activeKeys: 0, rateLimitUsage: 0 });
      setUsageData(usageDataRes.usage || []);
      setLogs(logsData.logs || []);
      setLastFetch(now);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData(true);
    fetchProfile();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push({ pathname: '/console', query: { tab } }, undefined, { shallow: true });
    setSidebarOpen(false);
  };

  const handleUpdateProfile = async (data: { display_name: string; avatar_url: string }) => {
    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    setActionLoading(false);

    if (res.ok) {
      fetchProfile();
      showToast('Profile updated successfully', 'success');
    } else {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleRedeemPromo = async (code: string) => {
    if (!code.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }

    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ promo_code: code }),
    });

    const data = await res.json();
    setActionLoading(false);

    if (res.ok) {
      fetchProfile();
      fetchAllData(true);
      showToast(`Promo redeemed! Plan upgraded to ${data.plan}`, 'success');
    } else {
      showToast(data.error || 'Failed to redeem promo code', 'error');
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      showToast('Please enter a key name', 'error');
      return;
    }

    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ name: newKeyName }),
    });

    const data = await res.json();
    setActionLoading(false);

    if (res.ok) {
      setCreatedKey(data.key.key);
      setNewKeyName('');
      fetchAllData(true);
      showToast('API key created successfully', 'success');
    } else {
      showToast(data.error || 'Failed to create key', 'error');
    }
  };

  const handleRevokeKey = async () => {
    if (!selectedKey) return;

    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/keys', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ keyId: selectedKey.id }),
    });

    setActionLoading(false);

    if (res.ok) {
      setShowRevokeModal(false);
      setSelectedKey(null);
      fetchAllData(true);
      showToast('API key revoked successfully', 'success');
    } else {
      showToast('Failed to revoke key', 'error');
    }
  };

  const handleUpdateKeyName = async (keyId: string, name: string) => {
    if (!name.trim()) return;

    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/keys', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ keyId, name }),
    });

    setActionLoading(false);

    if (res.ok) {
      fetchAllData(true);
      showToast('Key name updated', 'success');
    } else {
      showToast('Failed to update key name', 'error');
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const getPlanInfo = () => {
    if (!settings) return { name: 'Free', limit: '100', color: 'sky' };
    switch (settings.plan) {
      case 'enterprise':
        return { name: 'Enterprise', limit: '800', color: 'rose' };
      case 'pro':
        return { name: 'Pro', limit: '400', color: 'purple' };
      default:
        return { name: 'Free', limit: '100', color: 'sky' };
    }
  };

  const planInfo = getPlanInfo();
  const loadingSteps = [
    { icon: FiShield, text: 'Initializing security layer', color: 'from-sky-400 to-blue-500' },
    { icon: FiLock, text: 'Authenticating credentials', color: 'from-blue-400 to-indigo-500' },
    { icon: FiDatabase, text: 'Loading user data', color: 'from-indigo-400 to-purple-500' },
    { icon: FiKey, text: 'Fetching API keys', color: 'from-purple-400 to-pink-500' },
    { icon: FiCpu, text: 'Preparing dashboard', color: 'from-pink-400 to-rose-500' },
    { icon: FiCheck, text: 'All systems ready', color: 'from-emerald-400 to-green-500' }
  ];

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-zinc-50 to-white dark:from-black dark:via-zinc-950 dark:to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.15),transparent_70%)]" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/20 dark:bg-sky-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="absolute inset-0 opacity-30 dark:opacity-50">
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-sky-400 rounded-full animate-twinkle" />
          <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-twinkle-delayed" />
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-twinkle-delayed" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/4 left-2/3 w-1 h-1 bg-purple-400 rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-twinkle-delayed" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 px-4 w-full max-w-lg">
          <div className="relative group">
            <div className="absolute -inset-8 bg-gradient-to-r from-sky-400/20 via-blue-500/20 to-cyan-400/20 dark:from-sky-400/30 dark:via-blue-500/30 dark:to-cyan-400/30 rounded-full blur-3xl animate-pulse-slow" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center">
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
              
              <div className="absolute inset-3 rounded-full border border-dashed border-sky-400/30 dark:border-sky-400/40 animate-spin-slow" />
              
              <div className="relative z-10 transform hover:scale-110 transition-transform duration-500">
                <Image 
                  src="/logo.png" 
                  alt="Aichixia" 
                  width={80} 
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="text-center space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-white bg-clip-text text-transparent animate-gradient">
                {loadingStep === 5 ? 'Welcome Back' : 'Aichixia Console'}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
              </div>
            </div>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium max-w-md">
              {loadingStep === 5 ? 'Your workspace is ready to use' : 'Establishing secure connection to your workspace'}
            </p>
          </div>

          <div className="w-full space-y-6 sm:space-y-7">
            <div className="relative">
              <div className="h-2.5 sm:h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${loadingSteps[loadingStep].color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-slide" />
                </div>
              </div>
              
              <div className="absolute -top-8 sm:-top-9 left-0 right-0 flex items-center justify-between px-1">
                <div className="text-xs sm:text-sm font-bold text-transparent bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text">
                  {Math.round(loadingProgress)}%
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${loadingSteps[loadingStep].color}`}
                      style={{
                        animation: `bounce 1s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {loadingSteps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx === loadingStep;
                const isComplete = idx < loadingStep;
                
                return (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center gap-2"
                  >
                    <div className={`relative transition-all duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                        isActive 
                          ? `bg-gradient-to-br ${step.color} shadow-lg shadow-sky-500/30 dark:shadow-sky-500/50` 
                          : isComplete
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                      }`}>
                        <StepIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-500 ${
                          isActive 
                            ? 'text-white' 
                            : isComplete 
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-400 dark:text-zinc-600'
                        }`} />
                      </div>
                      {isActive && (
                        <>
                          <div className="absolute -inset-1.5 bg-sky-500/20 dark:bg-sky-400/20 rounded-xl animate-ping" />
                          <div className={`absolute -inset-2 bg-gradient-to-br ${step.color} opacity-20 dark:opacity-30 rounded-xl blur-md animate-pulse`} />
                        </>
                      )}
                      {isComplete && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <FiCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className={`w-full h-1 rounded-full transition-all duration-500 ${
                      isComplete 
                        ? 'bg-emerald-500/30 dark:bg-emerald-500/40' 
                        : isActive
                        ? `bg-gradient-to-r ${step.color} opacity-50`
                        : 'bg-zinc-200 dark:bg-zinc-800'
                    }`} />
                  </div>
                );
              })}
            </div>

            <div className="flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-100/50 to-zinc-50/50 dark:from-zinc-900/50 dark:to-zinc-950/50 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
              <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${loadingSteps[loadingStep].color} shadow-lg`}>
                {loadingStep === 5 ? (
                  <FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-bold mb-1 ${
                  loadingStep === 5 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-zinc-800 dark:text-zinc-200'
                }`}>
                  {loadingSteps[loadingStep].text}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-500">
                  {loadingStep !== 5 && (
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                  <span className="font-medium">
                    {loadingStep === 5 ? 'Completed successfully' : 'Processing...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-600 font-medium">
             Aichixia Console
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-30px) scale(1.08); }
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
          .animate-slide {
            animation: slide 2s ease-in-out infinite;
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300`}>
          <div className="flex flex-col h-full">
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiZap className="text-white text-base sm:text-lg" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">Aichixia</h1>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400">API Console</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 sm:p-4 space-y-1">
              <button
                onClick={() => handleTabChange('overview')}
                className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'overview' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <FiTrendingUp className="text-sm sm:text-base" />
                <span className="font-semibold">Overview</span>
              </button>

              <button
                onClick={() => handleTabChange('keys')}
                className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'keys' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <FiKey className="text-sm sm:text-base" />
                <span className="font-semibold">API Keys</span>
              </button>

              <button
                onClick={() => handleTabChange('activity')}
                className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'activity' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <FiActivity className="text-sm sm:text-base" />
                <span className="font-semibold">Activity</span>
              </button>

              <button
                onClick={() => handleTabChange('models')}
                className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'models' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <FiLayers className="text-sm sm:text-base" />
                <span className="font-semibold">Models</span>
              </button>

              <button
                onClick={() => handleTabChange('playground')}
                className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'playground' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <FiCode className="text-sm sm:text-base" />
                <span className="font-semibold">Playground</span>
              </button>

              <button
                onClick={() => handleTabChange('settings')}
                className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm ${activeTab === 'settings' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
              >
                <FiSettings className="text-sm sm:text-base" />
                <span className="font-semibold">Settings</span>
              </button>
            </nav>

            <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 sm:gap-2.5 mb-3 px-3 py-2 sm:py-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {profile?.display_name || user?.email}
                  </p>
                  <p className={`text-[9px] sm:text-[10px] font-bold bg-${planInfo.color}-100 dark:bg-${planInfo.color}-900/30 text-${planInfo.color}-700 dark:text-${planInfo.color}-400 px-1.5 py-0.5 rounded w-fit`}>
                    {planInfo.name}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-xs sm:text-sm font-semibold"
              >
                <FiLogOut className="text-sm sm:text-base" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <FiMenu className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg lg:text-xl font-black text-zinc-900 dark:text-white truncate">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'keys' && 'API Keys'}
                    {activeTab === 'activity' && 'Recent Activity'}
                    {activeTab === 'models' && 'Available Models'}
                    {activeTab === 'playground' && 'API Playground'}
                    {activeTab === 'settings' && 'Settings'}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {activeTab === 'overview' && 'Monitor your API usage'}
                    {activeTab === 'keys' && 'Manage your API keys'}
                    {activeTab === 'activity' && 'View recent requests'}
                    {activeTab === 'models' && 'Browse AI models'}
                    {activeTab === 'playground' && 'Test models live with your API key'}
                    {activeTab === 'settings' && 'Configure your account'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  <FiRefreshCw className={`text-sm sm:text-base text-zinc-600 dark:text-zinc-400 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {activeTab === 'overview' && (
              <Overview 
                stats={stats} 
                usageData={usageData} 
                onNavigate={handleTabChange} 
              />
            )}

            {activeTab === 'keys' && (
              <ApiKeys
                keys={keys}
                onCopy={copyToClipboard}
                copiedKey={copiedKey}
                onCreateKey={() => setShowCreateModal(true)}
                onRevokeKey={(key) => {
                  setSelectedKey(key);
                  setShowRevokeModal(true);
                }}
                onUpdateKeyName={handleUpdateKeyName}
                actionLoading={actionLoading}
              />
            )}

            {activeTab === 'activity' && (
              <Activity 
                logs={logs} 
                loading={loading} 
                onRefresh={handleRefresh} 
              />
            )}

            {activeTab === 'models' && (
              <Models
                settings={settings}
                onCopy={copyToClipboard}
                copiedKey={copiedKey}
              />
            )}

            {activeTab === 'playground' && (
              <Playground keys={keys} />
            )}

            {activeTab === 'settings' && (
              <Settings
                profile={profile}
                settings={settings}
                onUpdateProfile={handleUpdateProfile}
                onRedeemPromo={handleRedeemPromo}
                actionLoading={actionLoading}
              />
            )}
          </main>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-4 sm:p-5 shadow-2xl">
            {createdKey ? (
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FiKey className="text-lg sm:text-xl text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white text-center mb-1 sm:mb-2">API Key Created!</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center mb-4 sm:mb-5">Save this key securely. You won't be able to see it again.</p>
                
                <div className="p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-4 sm:mb-5">
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-1.5 sm:mb-2">Your API Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-xs sm:text-sm text-zinc-900 dark:text-white break-all">{createdKey}</code>
                    <button
                      onClick={() => copyToClipboard(createdKey, 'created')}
                      className="p-1.5 sm:p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedKey === 'created' ? <FiActivity className="text-emerald-500 text-xs sm:text-sm" /> : <FiKey className="text-zinc-400 text-xs sm:text-sm" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { setShowCreateModal(false); setCreatedKey(null); }}
                  className="w-full px-4 py-2 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm shadow-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-4 sm:mb-5">Create New API Key</h3>
                <div className="mb-4 sm:mb-5">
                  <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Key"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-sky-500 transition-colors"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => { setShowCreateModal(false); setNewKeyName(''); }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 sm:py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      'Create Key'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showRevokeModal && selectedKey && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-4 sm:p-5 shadow-2xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiAlertCircle className="text-lg sm:text-xl text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white text-center mb-1 sm:mb-2">Revoke API Key?</h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center mb-4 sm:mb-5">
              Are you sure you want to revoke <span className="font-semibold text-zinc-900 dark:text-white">{selectedKey.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => { setShowRevokeModal(false); setSelectedKey(null); }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 sm:py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeKey}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg"
              >
                {actionLoading ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Revoking...</span>
                  </>
                ) : (
                  'Revoke Key'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
            {toast.type === 'success' ? <FiActivity className="text-sm sm:text-base" /> : <FiAlertCircle className="text-sm sm:text-base" />}
            <p className="font-semibold text-xs sm:text-sm">{toast.message}</p>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <Notice />
    </div>
  );
}
