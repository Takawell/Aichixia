import { motion } from 'framer-motion';
import { FiActivity, FiTrendingUp, FiZap, FiCheckCircle } from 'react-icons/fi';
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiDigikeyelectronics, SiAirbrake, SiMaze, SiXiaomi, SiFlux, SiImagedotsc, SiSecurityscorecard, SiLapce } from 'react-icons/si';
import { GiSpermWhale, GiPowerLightning, GiClover, GiFire } from 'react-icons/gi';
import { TbSquareLetterZ, TbLetterM } from 'react-icons/tb';
import { FaXTwitter } from 'react-icons/fa6';
import { HiSpeakerWave } from 'react-icons/hi2';

type ModelStats = {
  model_id: string;
  model_name: string;
  total_requests: number;
  total_tokens: number;
  success_rate: number;
  avg_latency: number;
};

type ModelGridProps = {
  models: ModelStats[];
  onModelClick: (modelId: string) => void;
  loading?: boolean;
};

const MODEL_CONFIGS: Record<string, { icon: any; color: string }> = {
  'aichixia-thinking': { icon: SiAirbrake, color: 'from-blue-600 via-blue-800 to-slate-900' },
  'deepseek-v3.2': { icon: GiSpermWhale, color: 'from-cyan-600 to-blue-600' },
  'deepseek-v3.1': { icon: GiSpermWhale, color: 'from-cyan-600 to-teal-600' },
  'gpt-5-mini': { icon: SiOpenai, color: 'from-emerald-600 to-green-600' },
  'claude-opus-4.5': { icon: SiAnthropic, color: 'from-orange-600 to-amber-700' },
  'gemini-3-flash': { icon: SiGooglegemini, color: 'from-indigo-600 to-purple-600' },
  'kimi-k2': { icon: SiDigikeyelectronics, color: 'from-blue-600 to-cyan-600' },
  'glm-4.7': { icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-900' },
  'mistral-3.1': { icon: TbLetterM, color: 'from-orange-600 to-amber-600' },
  'qwen3-235b': { icon: SiAlibabacloud, color: 'from-purple-500 to-pink-500' },
  'qwen3-coder-480b': { icon: SiAlibabacloud, color: 'from-purple-600 to-fuchsia-600' },
  'minimax-m2.1': { icon: SiMaze, color: 'from-cyan-600 to-blue-600' },
  'llama-3.3-70b': { icon: SiMeta, color: 'from-blue-600 to-indigo-700' },
  'gpt-oss-120b': { icon: SiOpenai, color: 'from-pink-600 to-rose-600' },
  'mimo-v2-flash': { icon: SiXiaomi, color: 'from-blue-600 to-purple-600' },
  'groq-compound': { icon: GiPowerLightning, color: 'from-orange-600 to-red-600' },
  'cohere-command-a': { icon: GiClover, color: 'from-emerald-600 to-teal-600' },
  'grok-3': { icon: FaXTwitter, color: 'from-slate-600 to-zinc-800' },
  'flux-2': { icon: SiFlux, color: 'from-purple-500 to-pink-500' },
  'lucid-origin': { icon: SiImagedotsc, color: 'from-red-500 to-orange-500' },
  'phoenix-1.0': { icon: GiFire, color: 'from-red-500 to-orange-500' },
  'nano-banana-pro': { icon: SiGooglegemini, color: 'from-yellow-400 to-orange-400' },
  'starling-tts': { icon: SiSecurityscorecard, color: 'from-violet-500 to-purple-500' },
  'lindsay-tts': { icon: SiLapce, color: 'from-rose-500 to-pink-500' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 }
};

export default function ModelGrid({ models, onModelClick, loading }: ModelGridProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 animate-pulse">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 sm:mb-3 mx-auto" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto mb-2" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3"
    >
      {models.map((model) => {
        const config = MODEL_CONFIGS[model.model_id] || { icon: FiActivity, color: 'from-slate-500 to-slate-600' };
        const Icon = config.icon;
        const isUnused = model.total_requests === 0;

        return (
          <motion.button
            key={model.model_id}
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onModelClick(model.model_id)}
            className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 text-left transition-all hover:shadow-xl hover:border-sky-400 dark:hover:border-sky-500 group relative overflow-hidden ${
              isUnused ? 'opacity-60' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${config.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 mx-auto shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="text-white text-base sm:text-lg" />
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mb-1.5 sm:mb-2 text-center truncate px-1">
                {model.model_name}
              </h3>

              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <FiActivity className="text-[10px]" />
                    Requests
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatNumber(model.total_requests)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <FiTrendingUp className="text-[10px]" />
                    Tokens
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatNumber(model.total_tokens)}
                  </span>
                </div>

                {model.total_requests > 0 && (
                  <>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <FiCheckCircle className="text-[10px]" />
                        Success
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {model.success_rate.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <FiZap className="text-[10px]" />
                        Latency
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {model.avg_latency}ms
                      </span>
                    </div>
                  </>
                )}

                {isUnused && (
                  <div className="pt-1 sm:pt-2 text-center">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      No activity yet
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                  <FiActivity className="text-white text-[10px] sm:text-xs" />
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
