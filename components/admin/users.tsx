import { useState } from 'react';
import { FiUsers, FiSearch, FiFilter, FiEdit2, FiCheckCircle, FiX } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';

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

type UsersProps = {
  users: User[];
  onEditUser: (user: User) => void;
  loading?: boolean;
};

export default function Users({ users, onEditUser, loading }: UsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_active'>('newest');

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
      return matchesSearch && matchesPlan;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'most_active') return b.active_keys - a.active_keys;
      return 0;
    });

  const stats = {
    total: users.length,
    free: users.filter(u => u.plan === 'free').length,
    pro: users.filter(u => u.plan === 'pro').length,
    enterprise: users.filter(u => u.plan === 'enterprise').length,
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'enterprise') return 'from-violet-500 to-purple-600';
    if (plan === 'pro') return 'from-blue-500 to-indigo-600';
    return 'from-slate-400 to-slate-500';
  };

  const getPlanBadgeColor = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
    if (plan === 'pro') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
  };

  const getPlanIcon = (plan: string) => {
    if (plan === 'enterprise') return RiVipCrownLine;
    if (plan === 'pro') return RiVipDiamondLine;
    return FiUsers;
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiUsers className="text-slate-600 dark:text-slate-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Total</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full" />
            <p className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Free</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.free}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <RiVipDiamondLine className="text-blue-600 dark:text-blue-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">Pro</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{stats.pro}</p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg sm:rounded-xl border border-violet-200 dark:border-violet-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <RiVipCrownLine className="text-violet-600 dark:text-violet-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-violet-600 dark:text-violet-400">Enterprise</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-violet-800 dark:text-violet-300">{stats.enterprise}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <FiX className="text-slate-400 text-xs sm:text-sm" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm sm:text-base pointer-events-none" />
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as any)}
              className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_active">Most Active</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiUsers className="text-2xl sm:text-3xl text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">No Users Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || filterPlan !== 'all' ? 'Try adjusting your filters' : 'No users registered yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredUsers.map((user) => {
            const PlanIcon = getPlanIcon(user.plan);
            const isExpired = user.plan_expires_at && new Date(user.plan_expires_at) < new Date();
            
            return (
              <div
                key={user.user_id}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getPlanColor(user.plan)} rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg flex-shrink-0`}>
                      {user.email[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base truncate">
                          {user.display_name || user.email}
                        </p>
                        
                        {user.is_admin && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded text-[9px] sm:text-[10px] font-bold shadow-lg">
                            ADMIN
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded border text-[9px] sm:text-[10px] font-bold ${getPlanBadgeColor(user.plan)}`}>
                          <span className="hidden sm:inline">{user.plan.toUpperCase()}</span>
                          <span className="sm:hidden">{user.plan.charAt(0).toUpperCase()}</span>
                        </span>
                      </div>

                      {user.display_name && (
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                          {user.email}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <PlanIcon className="text-[10px] sm:text-xs" />
                          <span>{user.active_keys} {user.active_keys === 1 ? 'key' : 'keys'}</span>
                        </div>

                        {user.plan_expires_at && (
                          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${isExpired ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                            <FiCheckCircle className="text-[10px] sm:text-xs" />
                            <span>
                              {isExpired ? 'Expired' : 'Expires'} {new Date(user.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )}

                        <span className="hidden sm:inline">
                          Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditUser(user)}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl group-hover:scale-105 w-full lg:w-auto"
                  >
                    <FiEdit2 className="text-xs sm:text-sm" />
                    <span>Edit Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
            Showing <span className="font-bold text-slate-800 dark:text-white">{filteredUsers.length}</span> of <span className="font-bold text-slate-800 dark:text-white">{users.length}</span> users
          </p>
        </div>
      )}
    </div>
  );
}
