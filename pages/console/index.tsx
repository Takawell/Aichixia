import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { FiKey, FiActivity, FiSettings, FiLogOut, FiMenu, FiRefreshCw, FiTrendingUp, FiZap, FiLayers, FiAlertCircle } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';
import Overview from '@/components/console/overview';
import ApiKeys from '@/components/console/apikeys';
import Activity from '@/components/console/activity';
import Models from '@/components/console/models';
import Settings from '@/components/console/settings';

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

type TabType = 'overview' | 'keys' | 'activity' | 'settings' | 'models';

export default function Console() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (tab && ['overview', 'keys', 'activity', 'settings', 'models'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(session.user);
    fetchAllData();
    fetchProfile();
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
    if (!settings) return { name: 'Free', limit: '200', color: 'sky' };
    switch (settings.plan) {
      case 'enterprise':
        return { name: 'Enterprise', limit: '1,000', color: 'rose' };
      case 'pro':
        return { name: 'Pro', limit: '600', color: 'purple' };
      default:
        return { name: 'Free', limit: '200', color: 'sky' };
    }
  };

  const planInfo = getPlanInfo();

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
                    {activeTab === 'settings' && 'Settings'}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {activeTab === 'overview' && 'Monitor your API usage'}
                    {activeTab === 'keys' && 'Manage your API keys'}
                    {activeTab === 'activity' && 'View recent requests'}
                    {activeTab === 'models' && 'Browse AI models'}
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
    </div>
  );
}
