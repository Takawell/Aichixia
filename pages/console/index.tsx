import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FiKey, FiActivity, FiSettings, FiLogOut, FiCopy, FiTrash2, FiPlus, FiCheck, FiX, FiEdit2, FiSave, FiMenu, FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp, FiZap, FiLayers, FiRefreshCw, FiLock, FiUser, FiGift, FiCamera } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ThemeToggle from '@/components/ThemeToggle';

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

const AVAILABLE_MODELS = [
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', category: 'Advanced', requiresPlan: 'pro' },
  { id: 'deepseek-v3.1', name: 'DeepSeek V3.1', category: 'Advanced' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', category: 'Fast' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', category: 'Fast', requiresPlan: 'pro' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', category: 'Fast' },
  { id: 'kimi-k2', name: 'Kimi K2', category: 'Standard', requiresPlan: 'pro' },
  { id: 'glm-4.7', name: 'GLM 4.7', category: 'Standard' },
  { id: 'mistral-3.1', name: 'Mistral 3.1', category: 'Advanced' },
  { id: 'qwen3-235b', name: 'Qwen3 235B', category: 'Advanced' },
  { id: 'qwen3-coder-480b', name: 'Qwen3 Coder 480B', category: 'Specialized' },
  { id: 'minimax-m2.1', name: 'MiniMax M2.1', category: 'Standard', requiresPlan: 'pro' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', category: 'Advanced' },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', category: 'Advanced' },
  { id: 'mimo-v2-flash', name: 'MiMo V2 Flash', category: 'Fast' },
  { id: 'groq-compound', name: 'Groq Compound', category: 'Advanced' },
  { id: 'cohere-command-a', name: 'Cohere Command A', category: 'Standard' },
  { id: 'grok-3', name: 'Grok 3', category: 'Advanced' },
];

export default function Console() {
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
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'activity' | 'settings' | 'models'>('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [editProfile, setEditProfile] = useState({ display_name: '', avatar_url: '' });
  const [promoCode, setPromoCode] = useState('');

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
      setEditProfile({
        display_name: data.profile.display_name || '',
        avatar_url: data.profile.avatar_url || '',
      });
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

  const handleUpdateProfile = async () => {
    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(editProfile),
    });

    setActionLoading(false);

    if (res.ok) {
      fetchProfile();
      showToast('Profile updated successfully', 'success');
    } else {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) {
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
      body: JSON.stringify({ promo_code: promoCode }),
    });

    const data = await res.json();
    setActionLoading(false);

    if (res.ok) {
      setPromoCode('');
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

  const handleUpdateKeyName = async (keyId: string) => {
    if (!editingName.trim()) return;

    setActionLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch('/api/console/keys', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ keyId, name: editingName }),
    });

    setActionLoading(false);

    if (res.ok) {
      setEditingKeyId(null);
      setEditingName('');
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

  const chartData = usageData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    requests: d.requests_count,
  }));

  const isModelLocked = (model: any) => {
    if (!model.requiresPlan) return false;
    if (!settings) return true;
    if (settings.plan === 'free') return true;
    if (model.requiresPlan === 'enterprise' && settings.plan === 'pro') return true;
    return false;
  };

  const filteredModels = AVAILABLE_MODELS.filter(model =>
    model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    model.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.category]) acc[model.category] = [];
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_MODELS>);

  const getPlanInfo = () => {
    if (!settings) return { name: 'Free', limit: '1,000', color: 'slate' };
    switch (settings.plan) {
      case 'enterprise':
        return { name: 'Enterprise', limit: '10,000', color: 'pink' };
      case 'pro':
        return { name: 'Pro', limit: '4,000', color: 'purple' };
      default:
        return { name: 'Free', limit: '1,000', color: 'sky' };
    }
  };

  const planInfo = getPlanInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="flex h-screen overflow-hidden">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 transition-transform duration-300`}>
          <div className="flex flex-col h-full">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiZap className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Aichixia</h1>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">API Console</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
              <button
                onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${activeTab === 'overview' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
              >
                <FiTrendingUp className="text-base sm:text-lg" />
                <span className="font-medium">Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('keys'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${activeTab === 'keys' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
              >
                <FiKey className="text-base sm:text-lg" />
                <span className="font-medium">API Keys</span>
              </button>

              <button
                onClick={() => { setActiveTab('activity'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${activeTab === 'activity' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
              >
                <FiActivity className="text-base sm:text-lg" />
                <span className="font-medium">Activity</span>
              </button>

              <button
                onClick={() => { setActiveTab('models'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${activeTab === 'models' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
              >
                <FiLayers className="text-base sm:text-lg" />
                <span className="font-medium">Models</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${activeTab === 'settings' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
              >
                <FiSettings className="text-base sm:text-lg" />
                <span className="font-medium">Settings</span>
              </button>
            </nav>

            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white truncate">
                    {profile?.display_name || user?.email}
                  </p>
                  <p className={`text-[10px] sm:text-xs font-medium bg-${planInfo.color}-100 dark:bg-${planInfo.color}-900/30 text-${planInfo.color}-700 dark:text-${planInfo.color}-400 px-1.5 py-0.5 rounded w-fit`}>
                    {planInfo.name}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-sm sm:text-base"
              >
                <FiLogOut className="text-base sm:text-lg" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <FiMenu className="text-lg sm:text-xl text-slate-600 dark:text-slate-400" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white truncate">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'keys' && 'API Keys'}
                    {activeTab === 'activity' && 'Recent Activity'}
                    {activeTab === 'models' && 'Available Models'}
                    {activeTab === 'settings' && 'Settings'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                    {activeTab === 'overview' && 'Monitor your API usage'}
                    {activeTab === 'keys' && 'Manage your API keys'}
                    {activeTab === 'activity' && 'View recent requests'}
                    {activeTab === 'models' && 'Browse AI models'}
                    {activeTab === 'settings' && 'Configure your account'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  <FiRefreshCw className={`text-lg text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                        <FiActivity className="text-xl sm:text-2xl text-sky-600 dark:text-sky-400" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Live</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Requests</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stats.totalRequests.toLocaleString()}</p>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <FiKey className="text-xl sm:text-2xl text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Keys</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stats.activeKeys}</p>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <FiZap className="text-xl sm:text-2xl text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Rate Limit</h3>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{stats.rateLimitUsage}%</p>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${stats.rateLimitUsage > 80 ? 'bg-red-500' : stats.rateLimitUsage > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${stats.rateLimitUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">Usage Over Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="date" className="text-xs fill-slate-600 dark:fill-slate-400" />
                      <YAxis className="text-xs fill-slate-600 dark:fill-slate-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        wrapperClassName="dark:bg-slate-800 dark:border-slate-700"
                      />
                      <Area type="monotone" dataKey="requests" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRequests)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => { setActiveTab('keys'); setShowCreateModal(true); }}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-all group"
                    >
                      <div className="p-2 sm:p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <FiPlus className="text-lg sm:text-xl text-sky-600 dark:text-sky-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">Create API Key</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Generate a new key</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('activity')}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group"
                    >
                      <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <FiActivity className="text-lg sm:text-xl text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">View Activity</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Check recent requests</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-end">
                  <button onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    <FiPlus className="text-base sm:text-lg" />
                    Create New Key
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {keys.length === 0 ? (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiKey className="text-2xl sm:text-3xl text-slate-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No API Keys Yet</h3>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">Create your first API key to get started</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                      >
                        Create API Key
                      </button>
                    </div>
                  ) : (
                    keys.map((key) => (
                      <div key={key.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 hover:shadow-lg transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className={`w-2 h-2 rounded-full ${key.is_active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                              {editingKeyId === key.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleUpdateKeyName(key.id)}
                                    disabled={actionLoading}
                                    className="p-1.5 sm:p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    <FiSave className="text-sm sm:text-base" />
                                  </button>
                                  <button
                                    onClick={() => { setEditingKeyId(null); setEditingName(''); }}
                                    className="p-1.5 sm:p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                  >
                                    <FiX className="text-sm sm:text-base" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">{key.name}</h3>
                                  <button
                                    onClick={() => { setEditingKeyId(key.id); setEditingName(key.name); }}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  >
                                    <FiEdit2 className="text-sm text-slate-400" />
                                  </button>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                              <code className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-xs sm:text-sm text-slate-800 dark:text-white truncate flex-1">
                                {key.prefix}
                              </code>
                              <button
                                onClick={() => copyToClipboard(key.key, key.id)}
                                className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                              >
                                {copiedKey === key.id ? <FiCheck className="text-green-500 text-sm sm:text-base" /> : <FiCopy className="text-slate-400 text-sm sm:text-base" />}
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Usage</span>
                                <span className="font-semibold text-slate-800 dark:text-white">
                                  {key.requests_used.toLocaleString()} / {key.rate_limit.toLocaleString()}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${(key.requests_used / key.rate_limit) * 100 > 80 ? 'bg-red-500' : (key.requests_used / key.rate_limit) * 100 > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                                  style={{ width: `${(key.requests_used / key.rate_limit) * 100}%` }}
                                />
                              </div>
                            </div>

                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2 sm:mt-3">
                              Created {new Date(key.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex lg:flex-col gap-2">
                            <button
                              onClick={() => { setSelectedKey(key); setShowRevokeModal(true); }}
                              disabled={!key.is_active}
                              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                              <FiTrash2 className="text-sm sm:text-base" />
                              <span className="hidden lg:inline">Revoke</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Recent Requests</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Last 20 API requests</p>
                  </div>

                  {logs.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiActivity className="text-2xl sm:text-3xl text-slate-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No Activity Yet</h3>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Your API requests will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                      {logs.map((log) => (
                        <div key={log.id} className="p-3 sm:p-4 lg:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                <div className={`w-2 h-2 rounded-full ${log.status >= 200 && log.status < 300 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">{log.model}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${log.status >= 200 && log.status < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                  {log.status}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 truncate">{log.endpoint}</p>
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <FiClock className="text-xs sm:text-sm" />
                                  <span>{new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {log.latency_ms && (
                                  <div className="flex items-center gap-1">
                                    <FiZap className="text-xs sm:text-sm" />
                                    <span>{log.latency_ms}ms</span>
                                  </div>
                                )}
                                {log.tokens_used > 0 && (
                                  <span>{log.tokens_used.toLocaleString()} tokens</span>
                                )}
                              </div>
                              {log.error_message && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-[10px] sm:text-xs text-red-600 dark:text-red-400 break-words">
                                  {log.error_message}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {log.status >= 200 && log.status < 300 ? (
                                <FiCheckCircle className="text-green-500 text-lg sm:text-xl" />
                              ) : (
                                <FiAlertCircle className="text-red-500 text-lg sm:text-xl" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'models' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Available Models</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Browse all AI models you can use</p>
                    </div>
                    <div className="w-full sm:w-auto">
                      <input
                        type="text"
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        placeholder="Search models..."
                        className="w-full px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {Object.keys(groupedModels).length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400">No models found</p>
                      </div>
                    ) : (
                      Object.entries(groupedModels).map(([category, models]) => (
                        <div key={category}>
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{category}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {models.map((model) => {
                              const locked = isModelLocked(model);
                              return (
                                <div
                                  key={model.id}
                                  className={`p-4 rounded-lg border transition-all ${locked ? 'bg-slate-50/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-500'}`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{model.name}</h5>
                                        {locked && (
                                          <FiLock className="text-slate-400 text-xs flex-shrink-0" />
                                        )}
                                      </div>
                                      <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">{model.id}</code>
                                    </div>
                                    <button
                                      onClick={() => copyToClipboard(model.id, model.id)}
                                      disabled={locked}
                                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {copiedKey === model.id ? <FiCheck className="text-green-500 text-sm" /> : <FiCopy className="text-slate-400 text-sm" />}
                                    </button>
                                  </div>
                                  {locked && (
                                    <div className="mt-2 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-400">
                                      {model.requiresPlan === 'enterprise' ? 'Enterprise' : 'Pro'} required
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={editProfile.display_name}
                        onChange={(e) => setEditProfile({ ...editProfile, display_name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Avatar URL</label>
                      <input
                        type="text"
                        value={editProfile.avatar_url}
                        onChange={(e) => setEditProfile({ ...editProfile, avatar_url: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={actionLoading}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCheck />
                          Update Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">Account Information</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Plan</label>
                      <div className={`px-3 sm:px-4 py-2 sm:py-3 bg-${planInfo.color}-50 dark:bg-${planInfo.color}-900/20 border border-${planInfo.color}-200 dark:border-${planInfo.color}-800 rounded-lg`}>
                        <p className={`text-xs sm:text-sm font-semibold text-${planInfo.color}-900 dark:text-${planInfo.color}-100`}>{planInfo.name} Plan</p>
                        <p className={`text-[10px] sm:text-xs text-${planInfo.color}-700 dark:text-${planInfo.color}-300 mt-1`}>{planInfo.limit} requests per day</p>
                        {settings?.plan_expires_at && (
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Expires: {new Date(settings.plan_expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <FiGift className="text-lg text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">Redeem Promo Code</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Upgrade your plan with a promo code</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="PROMO-CODE"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-slate-700 border border-purple-300 dark:border-purple-700 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-purple-500 font-mono"
                    />
                    <button
                      onClick={handleRedeemPromo}
                      disabled={actionLoading}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all text-sm sm:text-base disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Redeeming...
                        </>
                      ) : (
                        'Redeem'
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <FiAlertCircle className="text-red-600 dark:text-red-400 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-red-900 dark:text-red-100 mb-2">Danger Zone</h3>
                      <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                  </div>
                  <button className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {createdKey ? (
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FiCheck className="text-xl sm:text-2xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white text-center mb-2">API Key Created!</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center mb-4 sm:mb-6">Save this key securely. You won't be able to see it again.</p>
                
                <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4 sm:mb-6">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2">Your API Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-xs sm:text-sm text-slate-800 dark:text-white break-all">{createdKey}</code>
                    <button
                      onClick={() => copyToClipboard(createdKey, 'created')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedKey === 'created' ? <FiCheck className="text-green-500 text-sm sm:text-base" /> : <FiCopy className="text-slate-400 text-sm sm:text-base" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { setShowCreateModal(false); setCreatedKey(null); }}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">Create New API Key</h3>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Key"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500 transition-colors"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => { setShowCreateModal(false); setNewKeyName(''); }}
                    disabled={actionLoading}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    disabled={actionLoading}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FiAlertCircle className="text-xl sm:text-2xl text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white text-center mb-2">Revoke API Key?</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center mb-4 sm:mb-6">
              Are you sure you want to revoke <span className="font-semibold text-slate-800 dark:text-white">{selectedKey.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => { setShowRevokeModal(false); setSelectedKey(null); }}
                disabled={actionLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeKey}
                disabled={actionLoading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-lg sm:text-xl" /> : <FiAlertCircle className="text-lg sm:text-xl" />}
            <p className="font-medium text-sm sm:text-base">{toast.message}</p>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}
    </div>
  );
}
