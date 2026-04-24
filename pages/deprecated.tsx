import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiAlertTriangle, FiSearch, FiX, FiClock, FiCpu, FiZap, FiChevronDown, FiInfo } from 'react-icons/fi';
import { HiOutlineArchive } from 'react-icons/hi';

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
  badge?: string;
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
    reason: 'Superseded by Kimi K2.5 with improved reasoning and longer context.',
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
    reason: 'Replaced by MiniMax M3 offering enhanced multimodal capabilities.',
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
    reason: 'Updated to GLM 4.7 with better instruction following and coding.',
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
    reason: 'Superseded by DeepSeek V3 with major performance improvements.',
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
    reason: 'Replaced by Qwen3 series with significantly expanded scale.',
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
    reason: 'Superseded by Llama 3.3 70B with enhanced chat capabilities.',
    badge: 'Open Source',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  text: 'Text',
  multimodal: 'Multimodal',
  code: 'Code',
  reasoning: 'Reasoning',
};

const CATEGORY_COLORS: Record<string, string> = {
  text: '#6366f1',
  multimodal: '#ec4899',
  code: '#10b981',
  reasoning: '#f59e0b',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function DeprecatedModels() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const filtered = DEPRECATED_MODELS.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
    const matchCat = category === 'all' || m.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-sky-500/30">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes glitch {
          0%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
          10% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(50% 0 30% 0); transform: translate(2px, -1px); }
          30% { clip-path: inset(70% 0 10% 0); transform: translate(-1px, 2px); }
          40% { clip-path: inset(0 0 0 0); transform: translate(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }

        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-in { animation: fadeIn 0.4s ease both; }
        .card-in { animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .shimmer-text {
          background: linear-gradient(90deg, #94a3b8 0%, #e2e8f0 40%, #94a3b8 60%, #64748b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .badge-pulse { animation: badgePulse 2s ease-in-out infinite; }
        .ticker-wrap { overflow: hidden; }
        .ticker-inner { display: flex; animation: ticker 30s linear infinite; }
        .scanline {
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 50%, rgba(0,0,0,0.03) 50%);
          background-size: 100% 4px;
          pointer-events: none;
          opacity: 0.4;
        }
        .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.5;
          z-index: 0;
        }
        .card-hover {
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
        }
        .search-input::placeholder { color: rgba(148,163,184,0.5); }
        .grid-bg {
          background-image:
            linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .expand-content {
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;
        }
        .expand-content.closed { max-height: 0; opacity: 0; }
        .expand-content.open { max-height: 200px; opacity: 1; }
        .provider-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .cat-pill {
          transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
        }
        .cat-pill:active { transform: scale(0.95); }
        .replaced-badge {
          background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05));
          border: 1px solid rgba(16,185,129,0.25);
        }
        .dep-badge {
          background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05));
          border: 1px solid rgba(239,68,68,0.25);
        }
      `}</style>

      <div className="noise-bg relative min-h-screen grid-bg">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-red-500/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full bg-zinc-800/30 blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <div className={`mb-8 sm:mb-10 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '0s' }}>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 mb-6 sm:mb-8 group"
            >
              <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" style={{ fontSize: 13 }} />
              Back
            </button>

            <div className="flex items-start gap-4 sm:gap-5 mb-5">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <HiOutlineArchive className="text-zinc-400" style={{ fontSize: 22 }} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 badge-pulse flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">{DEPRECATED_MODELS.length}</span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
                    Deprecated Models
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Archived
                  </span>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
                  Models that have been sunset and are no longer available. Check their replacements below.
                </p>
              </div>
            </div>

            <div className="ticker-wrap h-8 rounded-lg bg-zinc-900/50 border border-zinc-800/60 overflow-hidden">
              <div className="ticker-inner h-full flex items-center">
                {[...DEPRECATED_MODELS, ...DEPRECATED_MODELS].map((m, i) => (
                  <span key={i} className="flex items-center gap-2 px-4 text-[10px] font-semibold whitespace-nowrap text-zinc-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                    {m.name}
                    <span className="text-zinc-700 mx-1">·</span>
                    <span className="text-zinc-700">{m.provider}</span>
                    <span className="text-zinc-800 mx-2">|</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" style={{ fontSize: 13 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search model or provider..."
                className="search-input w-full pl-9 pr-9 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors duration-200"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <FiX style={{ fontSize: 13 }} />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(CATEGORY_LABELS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`cat-pill px-3.5 py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 ${
                    category === cat
                      ? 'bg-white text-zinc-950 shadow-lg shadow-white/10'
                      : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={`text-center py-20 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <FiSearch className="mx-auto text-zinc-700 mb-3" style={{ fontSize: 28 }} />
              <p className="text-zinc-500 text-sm font-semibold">No models match your search</p>
              <p className="text-zinc-700 text-xs mt-1">Try a different keyword or category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((model, idx) => {
                const isExpanded = expanded === model.id;
                const isHovered = hoveredCard === model.id;
                return (
                  <div
                    key={model.id}
                    className={`card-in card-hover rounded-2xl border bg-zinc-900/60 backdrop-blur-sm overflow-hidden ${
                      isExpanded || isHovered
                        ? 'border-zinc-700/80'
                        : 'border-zinc-800/80'
                    }`}
                    style={{
                      animationDelay: `${0.15 + idx * 0.07}s`,
                      boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.4)' : isHovered ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredCard(model.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div
                      className="px-4 sm:px-5 py-4 cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : model.id)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">

                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black"
                          style={{
                            background: `linear-gradient(135deg, ${model.providerColor}20, ${model.providerColor}08)`,
                            border: `1px solid ${model.providerColor}30`,
                            color: model.providerColor,
                          }}
                        >
                          {model.name.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                              {model.name}
                            </span>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest flex-shrink-0"
                              style={{
                                background: `${CATEGORY_COLORS[model.category]}18`,
                                color: CATEGORY_COLORS[model.category],
                                border: `1px solid ${CATEGORY_COLORS[model.category]}30`,
                              }}
                            >
                              {model.badge || model.category}
                            </span>
                            <span className="dep-badge text-[9px] font-bold px-1.5 py-0.5 rounded-md text-red-400 uppercase tracking-widest flex-shrink-0">
                              Deprecated
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                              <span className="provider-dot" style={{ background: model.providerColor }} />
                              {model.provider}
                            </span>
                            <span className="text-zinc-700 text-[10px]">·</span>
                            <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                              <FiCpu style={{ fontSize: 9 }} />
                              {model.contextWindow}
                            </span>
                            <span className="text-zinc-700 text-[10px]">·</span>
                            <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                              <FiClock style={{ fontSize: 9 }} />
                              {timeAgo(model.deprecatedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          {model.replacedBy && (
                            <div className="hidden sm:flex replaced-badge items-center gap-1.5 px-2.5 py-1.5 rounded-lg">
                              <FiZap className="text-emerald-400" style={{ fontSize: 10 }} />
                              <span className="text-[10px] font-bold text-emerald-400 whitespace-nowrap">{model.replacedBy}</span>
                            </div>
                          )}
                          <FiChevronDown
                            className="text-zinc-500 transition-transform duration-300"
                            style={{ fontSize: 15, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`expand-content ${isExpanded ? 'open' : 'closed'}`}>
                      <div className="px-4 sm:px-5 pb-4 pt-0">
                        <div className="h-px bg-zinc-800/60 mb-4" />
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="flex-1 flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                            <FiInfo className="text-zinc-500 mt-0.5 flex-shrink-0" style={{ fontSize: 12 }} />
                            <p className="text-xs text-zinc-400 leading-relaxed">{model.reason}</p>
                          </div>
                          <div className="flex sm:flex-col gap-2 sm:gap-2 sm:flex-shrink-0">
                            <div className="flex-1 sm:flex-none p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                              <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1 font-bold">Deprecated</p>
                              <p className="text-xs font-bold text-zinc-300">{formatDate(model.deprecatedAt)}</p>
                            </div>
                            {model.replacedBy && (
                              <div className="flex-1 sm:flex-none p-3 rounded-xl replaced-badge">
                                <p className="text-[9px] text-emerald-600 uppercase tracking-widest mb-1 font-bold">Replaced by</p>
                                <p className="text-xs font-bold text-emerald-400">{model.replacedBy}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={`mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiAlertTriangle className="text-amber-400" style={{ fontSize: 12 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-300 mb-1">Adding New Deprecated Models</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  To add a model, append a new entry to the <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">DEPRECATED_MODELS</code> array at the top of this file. Each entry requires <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">id</code>, <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">name</code>, <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">provider</code>, <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">deprecatedAt</code>, and <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">reason</code>. Set <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">replacedBy</code> to <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px]">null</code> if no replacement exists.
                </p>
              </div>
            </div>
          </div>

          <div className={`mt-6 flex items-center justify-between text-[10px] text-zinc-700 ${mounted ? 'fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.55s' }}>
            <span>{DEPRECATED_MODELS.length} models archived</span>
            <span>Aichixia · Deprecated Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
