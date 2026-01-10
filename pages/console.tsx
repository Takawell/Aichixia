import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FiKey, FiActivity, FiSettings, FiLogOut, FiCopy, FiTrash2, FiPlus, FiCheck, FiX, FiEdit2, FiSave, FiMenu, FiSun, FiMoon, FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp, FiUsers, FiZap, FiLock } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

export default function Console() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'activity' | 'settings'>('overview');

  useEffect(() => {
    checkUser();
    const interval = setInterval(() => {
      if (user) fetchAllData();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(session.user);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const token = session.access_token;

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
    setLoading(false);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      showToast('Please enter a key name', 'error');
      return;
    }

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

    if (res.ok) {
      setCreatedKey(data.key.key);
      setNewKeyName('');
      fetchAllData();
      showToast('API key created successfully', 'success');
    } else {
      showToast(data.error || 'Failed to create key', 'error');
    }
  };

  const handleRevokeKey = async () => {
    if (!selectedKey) return;

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

    if (res.ok) {
      setShowRevokeModal(false);
      setSelectedKey(null);
      fetchAllData();
      showToast('API key revoked successfully', 'success');
    } else {
      showToast('Failed to revoke key', 'error');
    }
  };

  const handleUpdateKeyName = async (keyId: string) => {
    if (!editingName.trim()) return;

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

    if (res.ok) {
      setEditingKeyId(null);
      setEditingName('');
      fetchAllData();
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
    window.location.href = '/login';
  };

  const chartData = usageData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    requests: d.requests_count,
  }));

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <div className="flex h-screen overflow-hidden">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiZap className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">Aichixia</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">API Console</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <FiTrendingUp className="text-lg" />
                <span className="font-medium">Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('keys'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'keys' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <FiKey className="text-lg" />
                <span className="font-medium">API Keys</span>
              </button>

              <button
                onClick={() => { setActiveTab('activity'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'activity' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <FiActivity className="text-lg" />
                <span className="font-medium">Activity</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <FiSettings className="text-lg" />
                <span className="font-medium">Settings</span>
              </button>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Free Plan</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <FiLogOut className="text-lg" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <FiMenu className="text-xl text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'keys' && 'API Keys'}
                    {activeTab === 'activity' && 'Recent Activity'}
                    {activeTab === 'settings' && 'Settings'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {activeTab === 'overview' && 'Monitor your API usage and performance'}
                    {activeTab === 'keys' && 'Manage your API keys'}
                    {activeTab === 'activity' && 'View recent API requests'}
                    {activeTab === 'settings' && 'Configure your account'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {darkMode ? <FiSun className="text-xl text-yellow-500" /> : <FiMoon className="text-xl text-slate-600" />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <FiActivity className="text-2xl text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Live</span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Requests</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalRequests.toLocaleString()}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <FiKey className="text-2xl text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Keys</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeKeys}</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <FiZap className="text-2xl text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Rate Limit</h3>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.rateLimitUsage}%</p>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${stats.rateLimitUsage > 80 ? 'bg-red-500' : stats.rateLimitUsage > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${stats.rateLimitUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Usage Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} />
                      <XAxis dataKey="date" stroke={darkMode ? '#64748b' : '#94a3b8'} />
                      <YAxis stroke={darkMode ? '#64748b' : '#94a3b8'} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
                          borderRadius: '8px',
                        }}
                      />
                      <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRequests)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => { setActiveTab('keys'); setShowCreateModal(true); }}
                      className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                    >
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <FiPlus className="text-xl text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 dark:text-white">Create API Key</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Generate a new API key</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('activity')}
                      className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group"
                    >
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <FiActivity className="text-xl text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 dark:text-white">View Activity</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Check recent requests</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <FiPlus className="text-lg" />
                    Create New Key
                  </button>
                </div>

                <div className="space-y-4">
                  {keys.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiKey className="text-3xl text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No API Keys Yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first API key to get started</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Create API Key
                      </button>
                    </div>
                  ) : (
                    keys.map((key) => (
                      <div key={key.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-2 h-2 rounded-full ${key.is_active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                              {editingKeyId === key.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleUpdateKeyName(key.id)}
                                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                  >
                                    <FiSave />
                                  </button>
                                  <button
                                    onClick={() => { setEditingKeyId(null); setEditingName(''); }}
                                    className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                  >
                                    <FiX />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{key.name}</h3>
                                  <button
                                    onClick={() => { setEditingKeyId(key.id); setEditingName(key.name); }}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <FiEdit2 className="text-slate-400" />
                                  </button>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              <code className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm text-slate-900 dark:text-white">
                                {key.prefix}
                              </code>
                              <button
                                onClick={() => copyToClipboard(key.key, key.id)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                {copiedKey === key.id ? <FiCheck className="text-green-500" /> : <FiCopy className="text-slate-400" />}
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Usage</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
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

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                              Created {new Date(key.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex lg:flex-col gap-2">
                            <button
                              onClick={() => { setSelectedKey(key); setShowRevokeModal(true); }}
                              disabled={!key.is_active}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiTrash2 />
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
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Requests</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last 20 API requests</p>
                  </div>

                  {logs.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiActivity className="text-3xl text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Activity Yet</h3>
                      <p className="text-slate-500 dark:text-slate-400">Your API requests will appear here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 lg:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-2 h-2 rounded-full ${log.status >= 200 && log.status < 300 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{log.model}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.status >= 200 && log.status < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                  {log.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{log.endpoint}</p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <FiClock />
                                  <span>{new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {log.latency_ms && (
                                  <div className="flex items-center gap-1">
                                    <FiZap />
                                    <span>{log.latency_ms}ms</span>
                                  </div>
                                )}
                                {log.tokens_used > 0 && (
                                  <span>{log.tokens_used.toLocaleString()} tokens</span>
                                )}
                              </div>
                              {log.error_message && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
                                  {log.error_message}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {log.status >= 200 && log.status < 300 ? (
                                <FiCheckCircle className="text-green-500 text-xl" />
                              ) : (
                                <FiAlertCircle className="text-red-500 text-xl" />
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

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Plan</label>
                      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Free Plan</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">1,000 requests per day</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Toggle dark mode theme</p>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <FiAlertCircle className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-700 dark:text-red-300">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl">
            {createdKey ? (
              <div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">API Key Created!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">Save this key securely. You won't be able to see it again.</p>
                
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Your API Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm text-slate-900 dark:text-white break-all">{createdKey}</code>
                    <button
                      onClick={() => copyToClipboard(createdKey, 'created')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedKey === 'created' ? <FiCheck className="text-green-500" /> : <FiCopy className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { setShowCreateModal(false); setCreatedKey(null); }}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New API Key</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Key"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowCreateModal(false); setNewKeyName(''); }}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showRevokeModal && selectedKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="text-2xl text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Revoke API Key?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
              Are you sure you want to revoke <span className="font-semibold text-slate-900 dark:text-white">{selectedKey.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRevokeModal(false); setSelectedKey(null); }}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeKey}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-xl" /> : <FiAlertCircle className="text-xl" />}
            <p className="font-medium">{toast.message}</p>
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
