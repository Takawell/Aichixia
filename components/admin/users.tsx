import { useState } from 'react';
import { FiUsers, FiSearch, FiX, FiChevronRight, FiFilter } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';

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

type UsersProps = {
  users: User[];
  onViewUser: (user: User) => void;
  loading?: boolean;
};

export default function Users({ users, onViewUser, loading }: UsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_active'>('newest');

  const filteredUsers = users
    .filter(user => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getPlanGradient = (plan: string) => {
    if (plan === 'enterprise') return 'from-violet-500 to-purple-600';
    if (plan === 'pro') return 'from-sky-500 to-blue-600';
    return 'from-sky-400 to-cyan-500';
  };

  const getPlanBadge = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/60';
    if (plan === 'pro') return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60';
    return 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-500 border-sky-100 dark:border-sky-800/40';
  };

  const getPlanIcon = (plan: string) => {
    if (plan === 'enterprise') return RiVipCrownLine;
    if (plan === 'pro') return RiVipDiamondLine;
    return FiUsers;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-sky-100 dark:bg-sky-900/30 rounded-full w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-1/2" />
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
        {[
          { label: 'Total Users', value: stats.total, icon: FiUsers, gradient: 'from-sky-500 to-blue-600', bg: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20', border: 'border-sky-200 dark:border-sky-800/50', text: 'text-sky-700 dark:text-sky-300', sub: 'text-sky-600 dark:text-sky-400' },
          { label: 'Free', value: stats.free, icon: FiUsers, gradient: 'from-slate-400 to-slate-500', bg: 'from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300', sub: 'text-slate-500 dark:text-slate-400' },
          { label: 'Pro', value: stats.pro, icon: RiVipDiamondLine, gradient: 'from-sky-500 to-blue-600', bg: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20', border: 'border-sky-200 dark:border-sky-800/50', text: 'text-sky-700 dark:text-sky-300', sub: 'text-sky-600 dark:text-sky-400' },
          { label: 'Enterprise', value: stats.enterprise, icon: RiVipCrownLine, gradient: 'from-violet-500 to-purple-600', bg: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20', border: 'border-violet-200 dark:border-violet-800/50', text: 'text-violet-700 dark:text-violet-300', sub: 'text-violet-600 dark:text-violet-400' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`relative bg-gradient-to-br ${item.bg} rounded-xl border ${item.border} p-3 sm:p-4 overflow-hidden`}>
              <div className="absolute top-0 right-0 w-16 h-16 -translate-y-1/2 translate-x-1/2 rounded-full opacity-10 bg-gradient-to-br" style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="text-white" style={{ fontSize: 10 }} />
                </div>
                <p className={`text-[10px] sm:text-xs font-semibold ${item.sub}`}>{item.label}</p>
              </div>
              <p className={`text-xl sm:text-2xl font-black tabular-nums ${item.text}`}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 dark:text-sky-500 text-sm pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-9 pr-9 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-sky-100 dark:hover:bg-sky-800 transition-colors">
              <FiX className="text-slate-500 dark:text-slate-300" style={{ fontSize: 9 }} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 dark:text-sky-500 text-sm pointer-events-none" />
            <select
              value={filterPlan}
              onChange={e => setFilterPlan(e.target.value as any)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 appearance-none cursor-pointer transition-all"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 appearance-none cursor-pointer transition-all"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_active">Most Active</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiUsers className="text-sky-400 text-xl" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">No Users Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchTerm || filterPlan !== 'all' ? 'Try adjusting your filters' : 'No users registered yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map(user => {
            const PlanIcon = getPlanIcon(user.plan);
            const isExpired = user.plan_expires_at && new Date(user.plan_expires_at) < new Date();
            return (
              <div
                key={user.user_id}
                className="group bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-3 sm:p-4 hover:border-sky-300 dark:hover:border-sky-600/60 hover:shadow-md hover:shadow-sky-500/5 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.email}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-200 dark:ring-sky-700/50"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 bg-gradient-to-br ${getPlanGradient(user.plan)} rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md`}
                      style={{ display: user.avatar_url ? 'none' : 'flex', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' }}
                    >
                      {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    {user.is_admin && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
                        <span className="text-white" style={{ fontSize: 7, fontWeight: 900 }}>A</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate leading-tight">
                        {user.display_name || user.email}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${getPlanBadge(user.plan)}`}>
                        {user.plan.toUpperCase()}
                      </span>
                    </div>
                    {user.display_name && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mb-0.5">{user.email}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <PlanIcon style={{ fontSize: 9 }} />
                        {user.active_keys} {user.active_keys === 1 ? 'key' : 'keys'}
                      </span>
                      {user.plan_expires_at && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${isExpired ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                          {isExpired ? 'Expired' : 'Exp.'} {new Date(user.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <span className="hidden sm:inline">
                        Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewUser(user)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-800/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-700/50 hover:border-sky-300 dark:hover:border-sky-600 font-semibold text-xs transition-all duration-200 group-hover:shadow-sm"
                  >
                    <span>Detail</span>
                    <FiChevronRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="bg-sky-50/50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-800/30 px-4 py-2.5 text-center">
          <p className="text-xs text-sky-600/80 dark:text-sky-500">
            Showing <span className="font-bold text-sky-700 dark:text-sky-400">{filteredUsers.length}</span> of <span className="font-bold text-sky-700 dark:text-sky-400">{users.length}</span> users
          </p>
        </div>
      )}
    </div>
  );
}
