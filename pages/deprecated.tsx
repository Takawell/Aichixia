import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiSearch, FiX, FiClock, FiZap, FiChevronDown } from 'react-icons/fi';
import { HiOutlineArchive } from 'react-icons/hi';
import ThemeToggle from '@/components/ThemeToggle';

type Category = 'all' | 'text' | 'multimodal' | 'code' | 'reasoning';

type DeprecatedModel = {
  id: string;
  name: string;
  provider: string;
  providerColor: string;
  deprecatedAt: string;
  replacedBy: string | null;
  category: 'text' | 'multimodal' | 'code' | 'reasoning';
  contextWindow: string;
  reason: string;
  badge: string;
};

const DEPRECATED_MODELS: DeprecatedModel[] = [
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'Moonshot AI',
    providerColor: '#6366f1',
    deprecatedAt: '2025-06-15',
    replacedBy: 'Kimi K2.5',
    category: 'reasoning',
    contextWindow: '128K',
    reason: 'Superseded by Kimi K2.5 with improved reasoning and longer context support.',
    badge: 'Reasoning',
  },
  {
    id: 'minimax-m2-1',
    name: 'MiniMax M2.1',
    provider: 'MiniMax',
    providerColor: '#f59e0b',
    deprecatedAt: '2025-05-20',
    replacedBy: 'MiniMax M3',
    category: 'multimodal',
    contextWindow: '256K',
    reason: 'Replaced by MiniMax M3 with enhanced multimodal capabilities and performance.',
    badge: 'Multimodal',
  },
  {
    id: 'glm-4-6',
    name: 'GLM 4.6',
    provider: 'Zhipu AI',
    providerColor: '#10b981',
    deprecatedAt: '2025-04-10',
    replacedBy: 'GLM 4.7',
    category: 'text',
    contextWindow: '128K',
    reason: 'Updated to GLM 4.7 with better instruction following and coding tasks.',
    badge: 'Text',
  },
  {
    id: 'deepseek-v2-5',
    name: 'DeepSeek V2.5',
    provider: 'DeepSeek',
    providerColor: '#0ea5e9',
    deprecatedAt: '2025-03-01',
    replacedBy: 'DeepSeek V3',
    category: 'code',
    contextWindow: '64K',
    reason: 'Superseded by DeepSeek V3 with major performance and coding improvements.',
    badge: 'Code',
  },
  {
    id: 'qwen2-72b',
    name: 'Qwen 2 72B',
    provider: 'Alibaba',
    providerColor: '#f97316',
    deprecatedAt: '2025-02-14',
    replacedBy: 'Qwen3 235B',
    category: 'text',
    contextWindow: '128K',
    reason: 'Replaced by the Qwen3 series with significantly expanded scale and capability.',
    badge: 'Text',
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    providerColor: '#3b82f6',
    deprecatedAt: '2025-01-30',
    replacedBy: 'Llama 3.3 70B',
    category: 'text',
    contextWindow: '8K',
    reason: 'Superseded by Llama 3.3 70B with significantly enhanced chat capabilities.',
    badge: 'Open Source',
  },
];

const CATS: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'text', label: 'Text' },
  { key: 'multimodal', label: 'Multimodal' },
  { key: 'code', label: 'Code' },
  { key: 'reasoning', label: 'Reasoning' },
];

const CAT_COLORS: Record<string, string> = {
  text: '#6366f1',
  multimodal: '#ec4899',
  code: '#10b981',
  reasoning: '#f59e0b',
};

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 30) return `${days}d ago`;
  const m = Math.floor(days / 30);
  return m < 12 ? `${m}mo ago` : `${Math.floor(m / 12)}y ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DeprecatedModels() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  const filtered = DEPRECATED_MODELS.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)) &&
      (category === 'all' || m.category === category)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      <style>{`
        @keyframes depFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes depCardIn {
          from { opacity: 0; transform: translateY(8px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes depPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
        }
        @keyframes depShimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        @keyframes expandOpen {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dep-fade-up { animation: depFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .dep-card-in { animation: depCardIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .dep-pulse { animation: depPulse 2.2s ease-in-out infinite; }
        .dep-shimmer { animation: depShimmer 2.8s ease-in-out infinite; }
        .expand-open { animation: expandOpen 0.25s cubic-bezier(0.22,1,0.36,1) both; }

        .dep-card {
          transition: border-color 0.2s ease, box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .dep-card:hover {
          transform: translateY(-1px);
        }
        .dep-search::placeholder { color: rgba(161,161,170,0.55); }
        .dep-cat {
          transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
        }
        .dep-cat:active { transform: scale(0.94); }
        .chevron-icon {
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <div className={`flex items-center justify-between mb-6 sm:mb-8 ${visible ? 'dep-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0s' }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs font-semibold tracking-wider uppercase transition-colors duration-200 group"
          >
            <FiArrowLeft style={{ fontSize: 12 }} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back
          </button>
          <ThemeToggle />
        </div>

        <div className={`mb-6 sm:mb-7 ${visible ? 'dep-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.06s' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                <HiOutlineArchive className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 14 }} />
              </div>
              <span
                className="dep-pulse absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center border-[1.5px] border-white dark:border-black"
                style={{ fontSize: 7 }}
              >
                <span className="text-white font-black" style={{ fontSize: 7 }}>{DEPRECATED_MODELS.length}</span>
              </span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
                Deprecated Models
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Models no longer available on the platform
              </p>
            </div>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row gap-2.5 mb-4 sm:mb-5 ${visible ? 'dep-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.12s' }}>
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" style={{ fontSize: 12 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model or provider..."
              className="dep-search w-full pl-8 pr-8 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-sky-400 dark:focus:border-sky-500 transition-colors duration-200"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <FiX style={{ fontSize: 11 }} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`dep-cat px-3 py-2 rounded-xl text-[10px] font-bold tracking-wide ${
                  category === key
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md'
                    : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 dep-fade-up">
            <FiSearch className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" style={{ fontSize: 24 }} />
            <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-600">No models found</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-700 mt-1">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((model, idx) => {
              const isOpen = expanded === model.id;
              return (
                <div
                  key={model.id}
                  className={`dep-card dep-card-in rounded-2xl border overflow-hidden ${
                    isOpen
                      ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-md dark:shadow-none'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'
                  }`}
                  style={{ animationDelay: `${0.16 + idx * 0.06}s` }}
                >
                  <button
                    className="w-full flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 text-left"
                    onClick={() => setExpanded(isOpen ? null : model.id)}
                  >
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black"
                      style={{
                        background: `${model.providerColor}14`,
                        border: `1px solid ${model.providerColor}28`,
                        color: model.providerColor,
                      }}
                    >
                      {model.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white truncate tracking-tight">
                          {model.name}
                        </span>
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-md tracking-widest uppercase flex-shrink-0"
                          style={{
                            background: `${CAT_COLORS[model.category]}14`,
                            color: CAT_COLORS[model.category],
                            border: `1px solid ${CAT_COLORS[model.category]}28`,
                          }}
                        >
                          {model.badge}
                        </span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md tracking-widest uppercase flex-shrink-0 bg-red-50 dark:bg-red-500/8 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                          Deprecated
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: model.providerColor }} />
                          {model.provider}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">·</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{model.contextWindow} ctx</span>
                        <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">·</span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                          <FiClock style={{ fontSize: 9 }} />
                          {timeAgo(model.deprecatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {model.replacedBy && (
                        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20">
                          <FiZap className="text-emerald-500 dark:text-emerald-400" style={{ fontSize: 9 }} />
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{model.replacedBy}</span>
                        </div>
                      )}
                      <FiChevronDown
                        className="chevron-icon text-zinc-400 dark:text-zinc-500"
                        style={{ fontSize: 14, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="expand-open px-3.5 sm:px-4 pb-3.5 pt-0">
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 mb-3" />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
                          <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Reason</p>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{model.reason}</p>
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:w-36 flex-shrink-0">
                          <div className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
                            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Deprecated</p>
                            <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{formatDate(model.deprecatedAt)}</p>
                          </div>
                          {model.replacedBy && (
                            <div className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-100 dark:border-emerald-500/20">
                              <p className="text-[9px] font-bold text-emerald-500 dark:text-emerald-500 uppercase tracking-widest mb-1">Replaced by</p>
                              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{model.replacedBy}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className={`mt-6 flex items-center justify-between ${visible ? 'dep-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.45s' }}>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">
            {filtered.length} of {DEPRECATED_MODELS.length} models
          </span>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-medium">Aichixia · Deprecated Registry</span>
        </div>
      </div>
    </div>
  );
}
