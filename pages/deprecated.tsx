import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiClock, FiAlertTriangle, FiArrowUpRight, FiX, FiSearch, FiArchive } from 'react-icons/fi';
import { SiAnthropic, SiAlibabacloud, SiMaze, SiDigikeyelectronics, SiAirbrake } from 'react-icons/si';
import { TbLetterM } from 'react-icons/tb';
import { GiSpermWhale, GiWormMouth } from 'react-icons/gi';
import ThemeToggle from '@/components/ThemeToggle';

type DeprecatedModel = {
  id: string;
  name: string;
  provider: string;
  icon: any;
  replacement?: string;
  reason: string;
  color: string;
};

const deprecatedModels: DeprecatedModel[] = [
  { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'Anthropic', icon: SiAnthropic, replacement: 'Claude Opus 4.8', reason: 'Superseded by a newer, more capable version', color: 'from-orange-500 to-amber-600' },
  { id: 'qwen3-235b', name: 'Qwen3 235B', provider: 'Alibaba', icon: SiAlibabacloud, reason: 'No longer maintained on this platform', color: 'from-purple-500 to-pink-500' },
  { id: 'minimax-m2-1', name: 'MiniMax M2.1', provider: 'MiniMax', icon: SiMaze, reason: 'No longer maintained on this platform', color: 'from-cyan-600 to-blue-600' },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'Moonshot AI', icon: SiDigikeyelectronics, reason: 'No longer maintained on this platform', color: 'from-blue-600 to-cyan-600' },
  { id: 'mistral-3-1', name: 'Mistral 3.1', provider: 'Mistral AI', icon: TbLetterM, reason: 'No longer maintained on this platform', color: 'from-orange-500 to-amber-600' },
  { id: 'deepseek-v3-1', name: 'DeepSeek V3.1', provider: 'DeepSeek', icon: GiSpermWhale, reason: 'No longer maintained on this platform', color: 'from-cyan-600 to-blue-600' },
  { id: 'aichixia-411b', name: 'Aichixia 411B', provider: 'Aichixia', icon: SiAirbrake, replacement: 'Aichixia 114B', reason: 'Replaced by a lighter, more multimodal and agentic version', color: 'from-blue-600 via-blue-800 to-slate-900' },
  { id: 'wormgpt-v4', name: 'WormGPT V4', provider: 'Third-party', icon: GiWormMouth, reason: 'No longer maintained on this platform', color: 'from-lime-600 to-emerald-700' },
];

export default function DeprecatedModels() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return deprecatedModels;
    return deprecatedModels.filter(
      (m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl animate-float-slow" />
        <div className="absolute top-1/4 -right-40 w-[28rem] h-[28rem] rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-3xl animate-float-slower" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl animate-float-slow" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/60 dark:bg-zinc-950/50 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 transition-all duration-200 active:scale-95 group"
          >
            <FiArrowLeft className="text-zinc-600 dark:text-zinc-400 group-hover:-translate-x-0.5 transition-transform duration-200" style={{ fontSize: 13 }} />
            <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
              <FiClock className="text-amber-500" style={{ fontSize: 12 }} />
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Deprecated</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-500/20 mb-3 shadow-sm">
            <FiArchive className="text-amber-500" style={{ fontSize: 10 }} />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 tracking-wide uppercase">Sunset Notice</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-1.5 bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Deprecated Models
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
            These models are being phased out and will stop responding to new requests. Migrate to an active model to avoid interruptions.
          </p>
        </div>

        <div className="relative mb-5 sm:mb-6">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" style={{ fontSize: 14 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deprecated models..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/70 dark:border-zinc-800/70 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-300 dark:focus:border-sky-700 transition-all duration-200 shadow-sm"
          />
        </div>

        {!dismissed && (
          <div className="relative mb-5 sm:mb-6 rounded-2xl overflow-hidden border border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-r from-amber-50/70 to-orange-50/50 dark:from-amber-500/[0.06] dark:to-orange-500/[0.04] backdrop-blur-sm shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer-pass pointer-events-none" />
            <div className="relative flex items-start gap-3 p-3.5 sm:p-4">
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
          {filtered.map((model, i) => {
            const Icon = model.icon;
            const isHovered = hovered === model.id;
            return (
              <div
                key={model.id}
                onMouseEnter={() => setHovered(model.id)}
                onMouseLeave={() => setHovered(null)}
                className="group relative rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md p-4 sm:p-5 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/30 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 70}ms`, animationDuration: '400ms', animationFillMode: 'backwards' }}
              >
                <div
                  className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none`}
                />

                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Retired</span>
                </div>

                <div
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${model.color} flex items-center justify-center mb-3 transition-all duration-500 ${isHovered ? 'scale-110 rotate-3' : 'scale-100'}`}
                  style={{ boxShadow: isHovered ? '0 8px 24px -6px rgba(0,0,0,0.35)' : '0 2px 8px -2px rgba(0,0,0,0.2)' }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-zinc-900/10 dark:bg-black/20" />
                  <Icon className="relative text-white" style={{ fontSize: 18 }} />
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
                  <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 group-hover:border-sky-300 dark:group-hover:border-sky-500/40 transition-colors duration-300">
                    <FiArrowUpRight className="text-sky-500 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" style={{ fontSize: 12 }} />
                    <span className="text-[11px] sm:text-xs font-semibold text-sky-700 dark:text-sky-400 truncate">
                      Use {model.replacement} instead
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
              <FiSearch className="text-zinc-400 dark:text-zinc-600" style={{ fontSize: 18 }} />
            </div>
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">No matching models</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">Try a different search term</p>
          </div>
        )}

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-600">
            Need help migrating? Check the docs or contact support for guidance.
          </p>
        </div>
      </main>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-25px, 15px); }
        }
        @keyframes shimmer-pass {
          100% { transform: translateX(200%); }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 14s ease-in-out infinite; }
        .animate-shimmer-pass { animation: shimmer-pass 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
