import { useState } from 'react';
import { FiGift, FiCopy, FiCheck, FiToggleLeft, FiToggleRight, FiPlus, FiCalendar, FiUsers, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

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

type PromosProps = {
  promoCodes: PromoCode[];
  onCreatePromo: () => void;
  onTogglePromo: (promoId: string, isActive: boolean) => void;
  onCopyCode: (code: string, id: string) => void;
  copiedCode: string | null;
  loading?: boolean;
};

export default function Promos({ promoCodes, onCreatePromo, onTogglePromo, onCopyCode, copiedCode, loading }: PromosProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'pro' | 'enterprise'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'expiring'>('newest');

  const filteredPromos = promoCodes
    .filter(promo => {
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && promo.is_active) || 
                           (filterStatus === 'inactive' && !promo.is_active);
      const matchesPlan = filterPlan === 'all' || promo.plan_type === filterPlan;
      return matchesStatus && matchesPlan;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'popular') return b.used_count - a.used_count;
      if (sortBy === 'expiring') return (a.max_uses - a.used_count) - (b.max_uses - b.used_count);
      return 0;
    });

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.is_active).length,
    totalUses: promoCodes.reduce((sum, p) => sum + p.used_count, 0),
    availableUses: promoCodes.reduce((sum, p) => sum + (p.max_uses - p.used_count), 0),
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

  const getUsagePercentage = (used: number, max: number) => {
    return Math.round((used / max) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-rose-600';
    if (percentage >= 70) return 'from-orange-500 to-amber-600';
    if (percentage >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-green-500 to-emerald-600';
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 animate-pulse">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
              <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
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
            <FiGift className="text-sky-600 dark:text-sky-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-sky-600 dark:text-sky-400">Total Codes</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-sky-800 dark:text-sky-300">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiToggleRight className="text-green-600 dark:text-green-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">Active</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">{stats.active}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiUsers className="text-purple-600 dark:text-purple-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">Total Uses</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-300">{stats.totalUses}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border border-amber-200 dark:border-amber-800 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <FiTrendingUp className="text-amber-600 dark:text-amber-400 text-sm sm:text-base" />
            <p className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400">Available</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-300">{stats.availableUses}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500'
            }`}
          >
            All
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
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
              filterStatus === 'inactive'
                ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500'
            }`}
          >
            Inactive
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
            <option value="newest">Newest</option>
            <option value="popular">Most Used</option>
            <option value="expiring">Running Out</option>
          </select>
        </div>

        <button
          onClick={onCreatePromo}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <FiPlus className="text-sm sm:text-base" />
          <span>Create Promo</span>
        </button>
      </div>

      {filteredPromos.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiGift className="text-2xl sm:text-3xl text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">
            {promoCodes.length === 0 ? 'No Promo Codes Yet' : 'No Matching Promos'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">
            {promoCodes.length === 0 ? 'Create your first promo code to get started' : 'Try adjusting your filters'}
          </p>
          {promoCodes.length === 0 && (
            <button
              onClick={onCreatePromo}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm inline-flex items-center gap-2"
            >
              <FiPlus className="text-sm sm:text-base" />
              <span>Create First Promo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredPromos.map((promo) => {
            const usagePercentage = getUsagePercentage(promo.used_count, promo.max_uses);
            const remainingUses = promo.max_uses - promo.used_count;
            const isRunningOut = remainingUses <= 10 && remainingUses > 0;
            const isFull = remainingUses <= 0;

            return (
              <div
                key={promo.id}
                className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl border transition-all duration-200 p-3 sm:p-4 ${
                  promo.is_active
                    ? 'border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-700'
                    : 'border-slate-300 dark:border-slate-600 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <code className={`px-3 py-1.5 bg-gradient-to-r ${getPlanColor(promo.plan_type)} text-white rounded-lg font-mono text-xs sm:text-sm font-bold shadow-lg`}>
                        {promo.code}
                      </code>
                      
                      <button
                        onClick={() => onCopyCode(promo.code, promo.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copiedCode === promo.id ? (
                          <FiCheck className="text-green-500 text-sm sm:text-base" />
                        ) : (
                          <FiCopy className="text-slate-400 text-sm sm:text-base" />
                        )}
                      </button>

                      <span className={`px-2 py-1 rounded-lg border text-[10px] sm:text-xs font-bold ${getPlanBadgeColor(promo.plan_type)}`}>
                        {promo.plan_type.toUpperCase()}
                      </span>

                      {isRunningOut && (
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1">
                          <FiAlertCircle className="text-[10px] sm:text-xs" />
                          <span className="hidden sm:inline">Running Out</span>
                          <span className="sm:hidden">Low</span>
                        </span>
                      )}

                      {isFull && (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-[10px] sm:text-xs font-bold">
                          FULL
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-[10px] sm:text-xs" />
                          <span>{promo.duration_days} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiUsers className="text-[10px] sm:text-xs" />
                          <span className="font-medium text-slate-800 dark:text-white">
                            {promo.used_count}
                          </span>
                          <span>/</span>
                          <span>{promo.max_uses} uses</span>
                        </div>
                        <span className="hidden sm:inline">
                          Created {new Date(promo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getUsageColor(usagePercentage)} transition-all duration-500 rounded-full`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            {usagePercentage}% used
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            {remainingUses} remaining
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onTogglePromo(promo.id, promo.is_active)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg w-full lg:w-auto ${
                      promo.is_active
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                        : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white'
                    }`}
                  >
                    {promo.is_active ? (
                      <>
                        <FiToggleRight className="text-base sm:text-lg" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <FiToggleLeft className="text-base sm:text-lg" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredPromos.length > 0 && (
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
            Showing <span className="font-bold text-slate-800 dark:text-white">{filteredPromos.length}</span> of <span className="font-bold text-slate-800 dark:text-white">{promoCodes.length}</span> promo codes
          </p>
        </div>
      )}
    </div>
  );
}
