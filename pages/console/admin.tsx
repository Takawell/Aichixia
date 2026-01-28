import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { FaServer } from 'react-icons/fa';
import { FiActivity, FiGift, FiCalendar, FiUsers, FiRefreshCw, FiX, FiCheckCircle, FiAlertCircle, FiLock, FiBarChart2, FiEye } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';
import Overview from '@/components/admin/overview';
import Monitoring from '@/components/admin/monitoring';
import Analytics from '@/components/admin/analytics';
import Promos from '@/components/admin/promos';
import Redemptions from '@/components/admin/redemptions';
import Users from '@/components/admin/users';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-8 shadow-2xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-3xl text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            You don't have permission to access the admin dashboard. This area is restricted to administrators only.
          </p>
          <button
            onClick={() => window.location.href = '/console'}
            className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Console
          </button>
        </div>
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
