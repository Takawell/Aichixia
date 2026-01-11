import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FiUsers, FiGift, FiActivity, FiPlus, FiX, FiCheck, FiAlertCircle, FiCalendar, FiTrendingUp, FiShield, FiEdit2, FiTrash2, FiCopy, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';

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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'promos' | 'redemptions' | 'users'>('overview');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
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
      window.location.href = '/console';
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
      const [promosRes, redemptionsRes, usersRes] = await Promise.all([
        fetch('/api/console/admin?type=promo-codes', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/admin?type=redemptions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/console/admin?type=users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const promosData = await promosRes.json();
      const redemptionsData = await redemptionsRes.json();
      const usersData = await usersRes.json();

      setPromoCodes(promosData.promoCodes || []);
      setRedemptions(redemptionsData.redemptions || []);
      setUsers(usersData.users || []);
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  const stats = {
    totalUsers: users.length,
    activePromos: promoCodes.filter(p => p.is_active).length,
    totalRedemptions: redemptions.length,
    proUsers: users.filter(u => u.plan === 'pro').length,
    enterpriseUsers: users.filter(u => u.plan === 'enterprise').length,
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiShield className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage users, promos & settings</p>
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

      <main className="p-3 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg transition-shadow">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-fit mb-2">
                <FiUsers className="text-lg sm:text-xl text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.totalUsers}</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg transition-shadow">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg w-fit mb-2">
                <FiGift className="text-lg sm:text-xl text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Promos</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.activePromos}</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg transition-shadow">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg w-fit mb-2">
                <FiActivity className="text-lg sm:text-xl text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Redemptions</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.totalRedemptions}</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg transition-shadow">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg w-fit mb-2">
                <FiTrendingUp className="text-lg sm:text-xl text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pro Users</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.proUsers}</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg transition-shadow">
              <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg w-fit mb-2">
                <FiShield className="text-lg sm:text-xl text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.enterpriseUsers}</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'overview' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
              >
                <FiActivity className="text-base sm:text-lg" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('promos')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'promos' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
              >
                <FiGift className="text-base sm:text-lg" />
                Promo Codes
              </button>
              <button
                onClick={() => setActiveTab('redemptions')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'redemptions' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
              >
                <FiCalendar className="text-base sm:text-lg" />
                Redemptions
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'users' ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-b-2 border-sky-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
              >
                <FiUsers className="text-base sm:text-lg" />
                Users
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Plan Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Free</span>
                          <span className="font-bold text-slate-800 dark:text-white">{users.filter(u => u.plan === 'free').length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Pro</span>
                          <span className="font-bold text-slate-800 dark:text-white">{stats.proUsers}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Enterprise</span>
                          <span className="font-bold text-slate-800 dark:text-white">{stats.enterpriseUsers}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Promo Stats</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Total Codes</span>
                          <span className="font-bold text-slate-800 dark:text-white">{promoCodes.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Active</span>
                          <span className="font-bold text-slate-800 dark:text-white">{stats.activePromos}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Total Uses</span>
                          <span className="font-bold text-slate-800 dark:text-white">{promoCodes.reduce((sum, p) => sum + p.used_count, 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => { setActiveTab('promos'); setShowCreateModal(true); }}
                      className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group"
                    >
                      <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <FiPlus className="text-lg sm:text-xl text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">Create Promo Code</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Generate new voucher</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                    >
                      <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
                        <FiUsers className="text-lg sm:text-xl text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-white">Manage Users</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">View all users</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'promos' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                    >
                      <FiPlus className="text-base sm:text-lg" />
                      Create Promo
                    </button>
                  </div>

                  <div className="space-y-3">
                    {promoCodes.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiGift className="text-2xl sm:text-3xl text-slate-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No Promo Codes Yet</h3>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Create your first promo code</p>
                      </div>
                    ) : (
                      promoCodes.map((promo) => (
                        <div key={promo.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <code className="px-3 py-1 bg-white dark:bg-slate-800 rounded font-mono text-sm font-bold text-slate-800 dark:text-white">
                                  {promo.code}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(promo.code, promo.id)}
                                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                                >
                                  {copiedCode === promo.id ? <FiCheck className="text-green-500 text-sm" /> : <FiCopy className="text-slate-400 text-sm" />}
                                </button>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${promo.plan_type === 'enterprise' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
                                  {promo.plan_type.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span>{promo.duration_days} days</span>
                                <span>{promo.used_count}/{promo.max_uses} uses</span>
                                <span>{new Date(promo.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleTogglePromo(promo.id, promo.is_active)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${promo.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'}`}
                            >
                              {promo.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'redemptions' && (
                <div className="space-y-3">
                  {redemptions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCalendar className="text-2xl sm:text-3xl text-slate-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No Redemptions Yet</h3>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Redemption history will appear here</p>
                    </div>
                  ) : (
                    redemptions.map((redemption) => (
                      <div key={redemption.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-800 dark:text-white text-sm">{redemption.user_email}</span>
                              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-mono text-slate-700 dark:text-slate-300">
                                {redemption.promo_codes.code}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span>Plan: {redemption.promo_codes.plan_type}</span>
                              <span>Redeemed: {new Date(redemption.redeemed_at).toLocaleDateString()}</span>
                              <span>Expires: {new Date(redemption.expires_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${new Date(redemption.expires_at) > new Date() ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {new Date(redemption.expires_at) > new Date() ? 'Active' : 'Expired'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by email or name..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="relative">
                      <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value as any)}
                        className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 appearance-none cursor-pointer"
                      >
                        <option value="all">All Plans</option>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiUsers className="text-2xl sm:text-3xl text-slate-400" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No Users Found</h3>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Try adjusting your filters</p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div key={user.user_id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {user.email[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                                      {user.display_name || user.email}
                                    </p>
                                    {user.is_admin && (
                                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>
                                  {user.display_name && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className={`px-2 py-1 rounded font-medium ${user.plan === 'enterprise' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400' : user.plan === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>
                                  {user.plan.toUpperCase()}
                                </span>
                                <span>{user.active_keys} keys</span>
                                {user.plan_expires_at && (
                                  <span>Expires: {new Date(user.plan_expires_at).toLocaleDateString()}</span>
                                )}
                                <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setEditUser({
                                  plan: user.plan,
                                  plan_expires_at: user.plan_expires_at || '',
                                });
                                setShowEditUserModal(true);
                              }}
                              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                            >
                              <FiEdit2 className="text-sm" />
                              Edit Plan
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500 font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Plan Type</label>
                <select
                  value={newPromo.plan_type}
                  onChange={(e) => setNewPromo({ ...newPromo, plan_type: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500"
                >
                  <option value="pro">Pro (4,000 req/day)</option>
                  <option value="enterprise">Enterprise (10,000 req/day)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={newPromo.duration_days}
                    onChange={(e) => setNewPromo({ ...newPromo, duration_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Uses</label>
                  <input
                    type="number"
                    value={newPromo.max_uses}
                    onChange={(e) => setNewPromo({ ...newPromo, max_uses: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500"
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
                className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500"
                >
                  <option value="free">Free (1,000 req/day)</option>
                  <option value="pro">Pro (4,000 req/day)</option>
                  <option value="enterprise">Enterprise (10,000 req/day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={editUser.plan_expires_at}
                  onChange={(e) => setEditUser({ ...editUser, plan_expires_at: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm sm:text-base text-slate-800 dark:text-white outline-none focus:border-sky-500"
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
                className="flex-1 px-4 py-2 sm:py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-lg sm:text-xl" /> : <FiAlertCircle className="text-lg sm:text-xl" />}
            <p className="font-medium text-sm sm:text-base">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
