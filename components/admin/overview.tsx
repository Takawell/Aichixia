import { FiUsers, FiGift, FiActivity, FiTrendingUp, FiPlus, FiEye, FiBarChart2, FiClock } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';

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

type OverviewProps = {
  users: User[];
  promoCodes: PromoCode[];
  redemptions: Redemption[];
  onNavigate: (tab: 'monitoring' | 'analytics' | 'promos' | 'users') => void;
  onCreatePromo: () => void;
};

export default function Overview({ users, promoCodes, redemptions, onNavigate, onCreatePromo }: OverviewProps) {
  const stats = {
    totalUsers: users.length,
    freeUsers: users.filter(u => u.plan === 'free').length,
    proUsers: users.filter(u => u.plan === 'pro').length,
    enterpriseUsers: users.filter(u => u.plan === 'enterprise').length,
    activePromos: promoCodes.filter(p => p.is_active).length,
    totalPromos: promoCodes.length,
    totalRedemptions: redemptions.length,
    activeRedemptions: redemptions.filter(r => new Date(r.expires_at) > new Date()).length,
    totalPromoUses: promoCodes.reduce((sum, p) => sum + p.used_count, 0),
    availableUses: promoCodes.reduce((sum, p) => sum + (p.max_uses - p.used_count), 0),
    newUsersThisMonth: users.filter(u => {
      const created = new Date(u.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    redemptionsThisMonth: redemptions.filter(r => {
      const redeemed = new Date(r.redeemed_at);
      const now = new Date();
      return redeemed.getMonth() === now.getMonth() && redeemed.getFullYear() === now.getFullYear();
    }).length,
  };

  const conversionRate = stats.totalUsers > 0 
    ? Math.round(((stats.proUsers + stats.enterpriseUsers) / stats.totalUsers) * 100)
    : 0;

  const promoUsageRate = promoCodes.length > 0
    ? Math.round((stats.totalPromoUses / promoCodes.reduce((sum, p) => sum + p.max_uses, 0)) * 100)
    : 0;

  const recentUsers = users
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const topPromos = promoCodes
    .sort((a, b) => b.used_count - a.used_count)
    .slice(0, 5);

  const getPlanColor = (plan: string) => {
    if (plan === 'enterprise') return 'from-violet-500 to-purple-600';
    if (plan === 'pro') return 'from-blue-500 to-indigo-600';
    return 'from-slate-400 to-slate-500';
  };

  const getPlanBadgeColor = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400';
    if (plan === 'pro') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffTime = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg sm:rounded-xl border border-sky-200 dark:border-sky-800 p-3 sm:p-4 hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => onNavigate('users')}>
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiUsers className="text-sky-600 dark:text-sky-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-sky-600 dark:text-sky-400">Total Users</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-sky-800 dark:text-sky-300">{stats.totalUsers}</p>
          <p className="text-[9px] sm:text-[10px] text-sky-600 dark:text-sky-400 mt-1">+{stats.newUsersThisMonth} this month</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full" />
            <p className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400">Free</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.freeUsers}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-1">{Math.round((stats.freeUsers / stats.totalUsers) * 100)}% of total</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <RiVipDiamondLine className="text-blue-600 dark:text-blue-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">Pro</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300">{stats.proUsers}</p>
          <p className="text-[9px] sm:text-[10px] text-blue-600 dark:text-blue-400 mt-1">{Math.round((stats.proUsers / stats.totalUsers) * 100)}% of total</p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg sm:rounded-xl border border-violet-200 dark:border-violet-800 p-3 sm:p-4 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <RiVipCrownLine className="text-violet-600 dark:text-violet-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-violet-600 dark:text-violet-400">Enterprise</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-violet-800 dark:text-violet-300">{stats.enterpriseUsers}</p>
          <p className="text-[9px] sm:text-[10px] text-violet-600 dark:text-violet-400 mt-1">{Math.round((stats.enterpriseUsers / stats.totalUsers) * 100)}% of total</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 p-3 sm:p-4 hover:shadow-lg transition-all duration-200" onClick={() => onNavigate('promos')}>
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiGift className="text-green-600 dark:text-green-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">Active Promos</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">{stats.activePromos}</p>
          <p className="text-[9px] sm:text-[10px] text-green-600 dark:text-green-400 mt-1">{stats.totalPromos} total codes</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-900/20 dark:to-sky-900/20 rounded-lg sm:rounded-xl border border-cyan-200 dark:border-cyan-800 p-3 sm:p-4 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiActivity className="text-cyan-600 dark:text-cyan-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-cyan-600 dark:text-cyan-400">Redemptions</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-800 dark:text-cyan-300">{stats.totalRedemptions}</p>
          <p className="text-[9px] sm:text-[10px] text-cyan-600 dark:text-cyan-400 mt-1">+{stats.redemptionsThisMonth} this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg">
              <FiTrendingUp className="text-white text-base sm:text-lg" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Conversion Rate</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-2">{conversionRate}%</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Users upgraded to paid plans</p>
          <div className="mt-3 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
              <FiGift className="text-white text-base sm:text-lg" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Promo Usage</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-2">{promoUsageRate}%</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{stats.totalPromoUses} of {promoCodes.reduce((sum, p) => sum + p.max_uses, 0)} codes used</p>
          <div className="mt-3 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${promoUsageRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <FiActivity className="text-white text-base sm:text-lg" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">Active Subscriptions</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-2">{stats.activeRedemptions}</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Currently active redemptions</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('monitoring')}
          className="bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-sky-400 p-4 sm:p-5 transition-all duration-200 shadow-lg hover:shadow-xl group text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <FiEye className="text-white text-lg sm:text-xl" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">Real-time Monitoring</h3>
          </div>
          <p className="text-xs sm:text-sm text-sky-100">View live activity and system health</p>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-purple-400 p-4 sm:p-5 transition-all duration-200 shadow-lg hover:shadow-xl group text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <FiBarChart2 className="text-white text-lg sm:text-xl" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">Analytics & Trends</h3>
          </div>
          <p className="text-xs sm:text-sm text-purple-100">View charts and usage statistics</p>
        </button>

        <button
          onClick={onCreatePromo}
          className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-green-400 p-4 sm:p-5 transition-all duration-200 shadow-lg hover:shadow-xl group text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <FiPlus className="text-white text-lg sm:text-xl" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">Create Promo Code</h3>
          </div>
          <p className="text-xs sm:text-sm text-green-100">Generate new promotional codes</p>
        </button>

        <button
          onClick={() => onNavigate('users')}
          className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl sm:rounded-2xl border-2 border-transparent hover:border-amber-400 p-4 sm:p-5 transition-all duration-200 shadow-lg hover:shadow-xl group text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
              <FiUsers className="text-white text-lg sm:text-xl" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">Manage Users</h3>
          </div>
          <p className="text-xs sm:text-sm text-amber-100">View and edit user accounts</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiUsers className="text-sky-600 dark:text-sky-400 text-lg sm:text-xl" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Recent Users</h3>
            </div>
            <button
              onClick={() => onNavigate('users')}
              className="text-xs sm:text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium"
            >
              View all
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No users yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-2 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${getPlanColor(user.plan)} rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg flex-shrink-0`}>
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {user.display_name || user.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${getPlanBadgeColor(user.plan)}`}>
                        {user.plan.toUpperCase()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                        {getTimeAgo(user.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiGift className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Top Promo Codes</h3>
            </div>
            <button
              onClick={() => onNavigate('promos')}
              className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              View all
            </button>
          </div>

          {topPromos.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No promo codes yet</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {topPromos.map((promo, index) => (
                <div
                  key={promo.id}
                  className="flex items-center gap-3 p-2 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <code className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-white">
                        {promo.code}
                      </code>
                      {!promo.is_active && (
                        <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{promo.used_count}/{promo.max_uses} uses</span>
                      <span>•</span>
                      <span className={promo.plan_type === 'enterprise' ? 'text-violet-600 dark:text-violet-400' : 'text-blue-600 dark:text-blue-400'}>
                        {promo.plan_type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
