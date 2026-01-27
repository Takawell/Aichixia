import { useState } from 'react';
import { FiCalendar, FiUser, FiGift, FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiClock, FiTrendingUp } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';

type Redemption = {
  id: string;
  promo_codes: { code: string; plan_type: string };
  user_email: string;
  redeemed_at: string;
  expires_at: string;
};

type RedemptionsProps = {
  redemptions: Redemption[];
  loading?: boolean;
};

export default function Redemptions({ redemptions, loading }: RedemptionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'pro' | 'enterprise'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'expiring'>('newest');

  const filteredRedemptions = redemptions
    .filter(redemption => {
      const matchesSearch = redemption.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           redemption.promo_codes.code.toLowerCase().includes(searchTerm.toLowerCase());
      const isExpired = new Date(redemption.expires_at) < new Date();
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && !isExpired) || 
                           (filterStatus === 'expired' && isExpired);
      const matchesPlan = filterPlan === 'all' || redemption.promo_codes.plan_type === filterPlan;
      return matchesSearch && matchesStatus && matchesPlan;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime();
      if (sortBy === 'oldest') return new Date(a.redeemed_at).getTime() - new Date(b.redeemed_at).getTime();
      if (sortBy === 'expiring') return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
      return 0;
    });

  const stats = {
    total: redemptions.length,
    active: redemptions.filter(r => new Date(r.expires_at) > new Date()).length,
    expired: redemptions.filter(r => new Date(r.expires_at) < new Date()).length,
    thisMonth: redemptions.filter(r => {
      const redeemedDate = new Date(r.redeemed_at);
      const now = new Date();
      return redeemedDate.getMonth() === now.getMonth() && redeemedDate.getFullYear() === now.getFullYear();
    }).length,
  };

  const getPlanColor = (plan: string) => {
    return plan === 'enterprise' 
      ? 'from-violet-500 to-purple-600' 
      : 'from-blue-500 to-indigo-600';
  };

  const getPlanBadgeColor = (plan: string) => {
    return plan === 'enterprise'
      ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800'
      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  };

  const getPlanIcon = (plan: string) => {
    return plan === 'enterprise' ? RiVipCrownLine : RiVipDiamondLine;
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg sm:rounded-xl border border-sky-200 dark:border-sky-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiCalendar className="text-sky-600 dark:text-sky-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-sky-600 dark:text-sky-400">Total</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-sky-800 dark:text-sky-300">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiCheckCircle className="text-green-600 dark:text-green-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">Active</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">{stats.active}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiXCircle className="text-red-600 dark:text-red-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-red-600 dark:text-red-400">Expired</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-300">{stats.expired}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiTrendingUp className="text-purple-600 dark:text-purple-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">This Month</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-300">{stats.thisMonth}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm sm:text-base" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or promo code..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filterStatus === 'active'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filterStatus === 'expired'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500'
            }`}
          >
            Expired
          </button>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as any)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
      </div>

      {filteredRedemptions.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiCalendar className="text-2xl sm:text-3xl text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">
            {redemptions.length === 0 ? 'No Redemptions Yet' : 'No Matching Redemptions'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {redemptions.length === 0 ? 'Redemption history will appear here' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredRedemptions.map((redemption) => {
            const isExpired = new Date(redemption.expires_at) < new Date();
            const daysRemaining = getDaysRemaining(redemption.expires_at);
            const isExpiringSoon = !isExpired && daysRemaining <= 7;
            const PlanIcon = getPlanIcon(redemption.promo_codes.plan_type);

            return (
              <div
                key={redemption.id}
                className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border transition-all duration-200 p-3 sm:p-4 ${
                  isExpired
                    ? 'border-slate-300 dark:border-slate-600 opacity-60'
                    : 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getPlanColor(redemption.promo_codes.plan_type)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <PlanIcon className="text-white text-lg sm:text-xl" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base truncate">
                        {redemption.user_email}
                      </p>
                      
                      <code className={`px-2 py-0.5 bg-gradient-to-r ${getPlanColor(redemption.promo_codes.plan_type)} text-white rounded font-mono text-[10px] sm:text-xs font-bold shadow-md`}>
                        {redemption.promo_codes.code}
                      </code>

                      <span className={`px-2 py-0.5 rounded border text-[9px] sm:text-[10px] font-bold ${getPlanBadgeColor(redemption.promo_codes.plan_type)}`}>
                        {redemption.promo_codes.plan_type.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FiClock className="text-[10px] sm:text-xs" />
                        <span>Redeemed {getTimeAgo(redemption.redeemed_at)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-[10px] sm:text-xs" />
                        {isExpired ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Expired {new Date(redemption.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        ) : (
                          <span>
                            Expires {new Date(redemption.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpired ? (
                      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md">
                        <FiXCircle className="text-sm sm:text-base" />
                        <span>Expired</span>
                      </div>
                    ) : isExpiringSoon ? (
                      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md animate-pulse">
                        <FiClock className="text-sm sm:text-base" />
                        <span>{daysRemaining}d left</span>
                      </div>
                    ) : (
                      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md">
                        <FiCheckCircle className="text-sm sm:text-base" />
                        <span>{daysRemaining}d left</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredRedemptions.length > 0 && (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
            Showing <span className="font-bold text-slate-800 dark:text-white">{filteredRedemptions.length}</span> of <span className="font-bold text-slate-800 dark:text-white">{redemptions.length}</span> redemptions
          </p>
        </div>
      )}
    </div>
  );
}
