import { motion } from 'framer-motion';
import { FiTrendingUp, FiZap, FiAward } from 'react-icons/fi';
import { RiVipDiamondLine, RiVipCrownLine, RiMedalLine, RiMedal2Line } from 'react-icons/ri';
import { GiTrophyCup, GiPodium, GiRibbonMedal } from 'react-icons/gi';

type User = {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: string;
  total_requests: number;
  total_tokens: number;
  rank: number;
};

type TopUsersProps = {
  users: User[];
  loading?: boolean;
};

const RANK_MEDALS = {
  1: { icon: GiTrophyCup, color: 'from-amber-400 via-yellow-500 to-amber-600', glow: 'shadow-amber-500/50', iconColor: 'text-amber-100' },
  2: { icon: RiMedalLine, color: 'from-slate-300 via-slate-400 to-slate-500', glow: 'shadow-slate-400/50', iconColor: 'text-slate-100' },
  3: { icon: RiMedal2Line, color: 'from-orange-600 via-amber-700 to-orange-800', glow: 'shadow-orange-600/50', iconColor: 'text-orange-100' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TopUsers({ users, loading }: TopUsersProps) {
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

  const getProgressPercent = (requests: number) => {
    if (users.length === 0) return 0;
    const maxRequests = users[0]?.total_requests || 1;
    return (requests / maxRequests) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 animate-pulse">
              <div className="h-16 sm:h-20 bg-slate-200 dark:bg-slate-700 rounded-full w-16 sm:w-20 mx-auto mb-3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiTrendingUp className="text-3xl sm:text-4xl text-slate-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">No Activity Yet</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Start making requests to appear on the leaderboard</p>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-3 sm:space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {topThree.map((user) => {
          const medal = RANK_MEDALS[user.rank as keyof typeof RANK_MEDALS];
          const PlanIcon = getPlanIcon(user.plan);
          const MedalIcon = medal.icon;

          return (
            <motion.div
              key={user.user_id}
              variants={cardVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${medal.color} rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl ${medal.glow} border-2 border-white/20 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              
              <div className="text-center relative">
                <div className="mb-2 sm:mb-3 flex justify-center">
                  <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30">
                    <MedalIcon className={`text-3xl sm:text-4xl ${medal.iconColor}`} />
                  </div>
                </div>
                
                <div className="relative inline-block mb-3 sm:mb-4">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || user.email}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white/50 shadow-lg mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg mx-auto border-4 border-white/50"
                    style={{ display: user.avatar_url ? 'none' : 'flex' }}
                  >
                    {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate px-2">
                  {user.display_name || user.email.split('@')[0]}
                </h3>

                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-bold bg-white/20 text-white border-white/30 flex items-center gap-1`}>
                    {PlanIcon && <PlanIcon className="text-xs" />}
                    {user.plan.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 sm:space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border border-white/20">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[10px] sm:text-xs flex items-center gap-1">
                      <FiZap className="text-xs" />
                      Requests
                    </span>
                    <span className="text-xs sm:text-sm font-bold">{user.total_requests.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[10px] sm:text-xs flex items-center gap-1">
                      <FiTrendingUp className="text-xs" />
                      Tokens
                    </span>
                    <span className="text-xs sm:text-sm font-bold">{user.total_tokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {restUsers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {restUsers.map((user) => {
            const PlanIcon = getPlanIcon(user.plan);
            const progress = getProgressPercent(user.total_requests);

            return (
              <motion.div
                key={user.user_id}
                variants={cardVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base shadow-md">
                      #{user.rank}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.email}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border-2 border-slate-200 dark:border-slate-600 shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md"
                      style={{ display: user.avatar_url ? 'none' : 'flex' }}
                    >
                      {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm truncate">
                        {user.display_name || user.email.split('@')[0]}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded border text-[8px] sm:text-[9px] font-bold flex-shrink-0 ${getPlanColor(user.plan)} flex items-center gap-0.5`}>
                        {PlanIcon && <PlanIcon className="text-[10px]" />}
                        {user.plan.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="flex items-center gap-0.5">
                        <FiZap className="text-[10px]" />
                        {user.total_requests.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 truncate">
                        <FiTrendingUp className="text-[10px]" />
                        {user.total_tokens.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
