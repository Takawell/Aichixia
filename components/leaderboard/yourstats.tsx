import { motion } from 'framer-motion';
import { FiTrendingUp, FiZap, FiAward, FiActivity } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine } from 'react-icons/ri';
import { GiTrophyCup } from 'react-icons/gi';

type UserRankData = {
  user: {
    user_id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    plan: string;
    total_requests: number;
    total_tokens: number;
    rank: number;
  } | null;
  total_users: number;
  most_used_model: string | null;
};

type YourStatsProps = {
  rankData: UserRankData | null;
  loading?: boolean;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function YourStats({ rankData, loading }: YourStatsProps) {
  const getPlanColor = (plan: string) => {
    if (plan === 'enterprise') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
    if (plan === 'pro') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
  };

  const getPlanIcon = (plan: string) => {
    if (plan === 'enterprise') return RiVipCrownLine;
    if (plan === 'pro') return RiVipDiamondLine;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-amber-400 via-yellow-500 to-amber-600';
    if (rank === 2) return 'from-slate-300 via-slate-400 to-slate-500';
    if (rank === 3) return 'from-orange-600 via-amber-700 to-orange-800';
    if (rank <= 10) return 'from-sky-500 to-blue-600';
    return 'from-slate-500 to-slate-600';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: GiTrophyCup, text: 'Champion', color: 'text-amber-100' };
    if (rank === 2) return { icon: FiAward, text: 'Runner-up', color: 'text-slate-100' };
    if (rank === 3) return { icon: FiAward, text: 'Top 3', color: 'text-orange-100' };
    if (rank <= 10) return { icon: FiTrendingUp, text: 'Top 10', color: 'text-sky-100' };
    return { icon: FiActivity, text: `Rank #${rank}`, color: 'text-slate-100' };
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!rankData?.user) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 backdrop-blur-lg rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 sm:p-8 text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiActivity className="text-3xl sm:text-4xl text-slate-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No Activity Yet</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Start making API requests to appear on the leaderboard
        </p>
      </motion.div>
    );
  }

  const user = rankData.user;
  const rankBadge = getRankBadge(user.rank);
  const RankIcon = rankBadge.icon;
  const PlanIcon = getPlanIcon(user.plan);
  const isTopThree = user.rank <= 3;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 shadow-xl ${
        isTopThree
          ? 'border-amber-400 dark:border-amber-500'
          : user.rank <= 10
          ? 'border-sky-400 dark:border-sky-500'
          : 'border-slate-300 dark:border-slate-600'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getRankColor(user.rank)} opacity-10`} />
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${getRankColor(user.rank)} rounded-lg shadow-lg`}>
              <RankIcon className={`text-xl sm:text-2xl ${rankBadge.color}`} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Your Position</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
                {rankBadge.text}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Rank</p>
            <p className={`text-2xl sm:text-3xl font-bold ${
              isTopThree ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
            }`}>
              #{user.rank}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              of {rankData.total_users}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name || user.email}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-600 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg"
            style={{ display: user.avatar_url ? 'none' : 'flex' }}
          >
            {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-1 truncate">
              {user.display_name || user.email.split('@')[0]}
            </h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded border text-[9px] sm:text-[10px] font-bold ${getPlanColor(user.plan)} flex items-center gap-1`}>
                {PlanIcon && <PlanIcon className="text-xs" />}
                {user.plan.toUpperCase()}
              </span>
              {rankData.most_used_model && (
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Most used: {rankData.most_used_model}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <FiZap className="text-white text-xs sm:text-sm" />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400">Requests</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300">
              {user.total_requests.toLocaleString()}
            </p>
            <div className="mt-2 w-full h-1.5 bg-blue-200 dark:bg-blue-900/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <div className="p-1.5 bg-purple-500 rounded-lg">
                <FiTrendingUp className="text-white text-xs sm:text-sm" />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-purple-600 dark:text-purple-400">Tokens</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-300">
              {user.total_tokens.toLocaleString()}
            </p>
            <div className="mt-2 w-full h-1.5 bg-purple-200 dark:bg-purple-900/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
              />
            </div>
          </div>
        </div>

        {isTopThree && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 text-center font-medium flex items-center justify-center gap-2">
              <GiTrophyCup className="text-amber-600 dark:text-amber-400" />
              Outstanding performance! You're in the top 3!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
