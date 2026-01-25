import { useState } from 'react';
import { FiUsers, FiSearch, FiFilter, FiEdit2, FiLock, FiCheckCircle, FiClock } from 'react-icons/fi';
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
};

const PLAN_CONFIG = {
  free: {
    name: 'Free',
    color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
    icon: FiUsers,
  },
  pro: {
    name: 'Pro',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: RiVipDiamondLine,
  },
  enterprise: {
    name: 'Enterprise',
    color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    icon: RiVipCrownLine,
  },
};

export default function Users({ users, onEditUser }: UsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const stats = {
    total: users.length,
    free: users.filter(u => u.plan === 'free').length,
    pro: users.filter(u => u.plan === 'pro').length,
    enterprise: users.filter(u => u.plan === 'enterprise').length,
    admins: users.filter(u => u.is_admin).length,
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-lg border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <FiUsers className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400" />
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Total</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-zinc-900 dark:text-white">{stats.total.toLocaleString('en-US')}</p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-lg border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <RiVipDiamondLine className="text-xs sm:text-sm text-blue-500 dark:text-blue-400" />
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Pro</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-zinc-900 dark:text-white">{stats.pro.toLocaleString('en-US')}</p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-lg border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <RiVipCrownLine className="text-xs sm:text-sm text-violet-500 dark:text-violet-400" />
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Enterprise</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-zinc-900 dark:text-white">{stats.enterprise.toLocaleString('en-US')}</p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-lg border border-zinc-200 dark:border-zinc-800 p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <FiLock className="text-xs sm:text-sm text-sky-500 dark:text-sky-400" />
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Admins</span>
          </div>
          <p className="text-base sm:text-xl font-bold text-zinc-900 dark:text-white">{stats.admins.toLocaleString('en-US')}</p>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-zinc-950 backdrop-blur-lg rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs sm:text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs sm:text-sm" />
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value as any)}
              className="w-full sm:w-auto pl-8 pr-8 py-1.5 sm:py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:border-sky-500 appearance-none cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-2.5">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiUsers className="text-xl sm:text-3xl text-zinc-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1">No Users Found</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Try adjusting your filters</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const planConfig = PLAN_CONFIG[user.plan as keyof typeof PLAN_CONFIG];
              const PlanIcon = planConfig.icon;
              const isExpired = user.plan_expires_at && new Date(user.plan_expires_at) < new Date();

              return (
                <div
                  key={user.user_id}
                  className="group bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 hover:shadow-lg hover:shadow-sky-400/5 dark:hover:shadow-sky-400/10 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        {user.email[0].toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                            {user.display_name || user.email}
                          </p>
                          {user.is_admin && (
                            <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded text-[9px] sm:text-[10px] font-bold flex-shrink-0">
                              ADMIN
                            </span>
                          )}
                        </div>
                        
                        {user.display_name && (
                          <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate mb-2">
                            {user.email}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold ${planConfig.color}`}>
                            <PlanIcon className="text-[10px] sm:text-xs" />
                            {planConfig.name}
                          </span>
                          
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded text-[9px] sm:text-[10px] font-medium">
                            {user.active_keys.toLocaleString('en-US')} keys
                          </span>

                          {user.plan_expires_at && (
                            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-medium ${
                              isExpired
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>
                              <FiClock className="text-[10px]" />
                              {isExpired ? 'Expired' : new Date(user.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}

                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded text-[9px] sm:text-[10px] font-medium">
                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onEditUser(user)}
                      className="w-full lg:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all text-xs sm:text-sm shadow-lg group-hover:shadow-xl flex-shrink-0"
                    >
                      <FiEdit2 className="text-xs sm:text-sm" />
                      Edit Plan
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredUsers.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              <span>Showing {filteredUsers.length.toLocaleString('en-US')} of {users.length.toLocaleString('en-US')} users</span>
              {filterPlan !== 'all' && (
                <button
                  onClick={() => setFilterPlan('all')}
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
