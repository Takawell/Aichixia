import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiClock, FiAlertTriangle, FiArrowUpRight, FiX } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';

type DeprecatedModel = {
  id: string;
  name: string;
  provider: string;
  replacement?: string;
  reason: string;
  color: string;
};

const deprecatedModels: DeprecatedModel[] = [
  { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'Anthropic', replacement: 'Claude Opus 4.8', reason: 'Superseded by a newer, more capable version', color: 'from-orange-500 to-amber-600' },
  { id: 'qwen3-coder-480b', name: 'Qwen3 Coder 480B', provider: 'Alibaba', reason: 'No longer maintained on this platform', color: 'from-violet-500 to-purple-600' },
  { id: 'minimax-m2-1', name: 'MiniMax M2.1', provider: 'MiniMax', reason: 'No longer maintained on this platform', color: 'from-red-500 to-rose-600' },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'Moonshot AI', reason: 'No longer maintained on this platform', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'mistral-3-1', name: 'Mistral 3.1', provider: 'Mistral AI', reason: 'No longer maintained on this platform', color: 'from-orange-400 to-red-500' },
  { id: 'deepseek-v3-1', name: 'DeepSeek V3.1', provider: 'DeepSeek', reason: 'No longer maintained on this platform', color: 'from-blue-500 to-indigo-600' },
];

export default function DeprecatedModels() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-zinc-950/60 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 transition-all duration-200 active:scale-95 group"
          >
            <FiArrowLeft className="text-zinc-600 dark:text-zinc-400 group-hover:-translate-x-0.5 transition-transform duration-200" style={{ fontSize: 13 }} />
            <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
              <FiClock className="text-amber-500" style={{ fontSize: 12 }} />
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Deprecated</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 mb-3">
            <FiClock className="text-amber-500" style={{ fontSize: 10 }} />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 tracking-wide uppercase">Sunset Notice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-1.5">
            Deprecated Models
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
            These models are being phased out and will stop responding to new requests. Migrate to an active model to avoid interruptions.
          </p>
        </div>

        {!dismissed && (
          <div className="relative mb-5 sm:mb-6 rounded-2xl overflow-hidden border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/[0.06] backdrop-blur-sm">
            <div className="flex items-start gap-3 p-3.5 sm:p-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                <FiAlertTriangle className="text-amber-600 dark:text-amber-400" style={{ fontSize: 14 }} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Requests to deprecated models may be rate-limited or rejected at any time.
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Update your integration to a supported model as soon as possible.
                </p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 w-6 h-6 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/15 flex items-center justify-center transition-colors duration-150"
              >
                <FiX className="text-amber-500" style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {deprecatedModels.map((model, i) => (
            <div
              key={model.id}
              className="group relative rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md p-4 sm:p-5 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Retired</span>
              </div>

              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center mb-3 opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300`}>
                <FiClock className="text-white" style={{ fontSize: 16 }} />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-100 mb-0.5 pr-16">
                {model.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-2.5">
                {model.provider}
              </p>

              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                {model.reason}
              </p>

              {model.replacement && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20">
                  <FiArrowUpRight className="text-sky-500 flex-shrink-0" style={{ fontSize: 12 }} />
                  <span className="text-[11px] sm:text-xs font-semibold text-sky-700 dark:text-sky-400 truncate">
                    Use {model.replacement} instead
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-600">
            Need help migrating? Check the docs or contact support for guidance.
          </p>
        </div>
      </main>
    </div>
  );
}
