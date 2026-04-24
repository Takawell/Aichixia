import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiSearch, FiX, FiZap } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';

type Category = 'all' | 'text' | 'multimodal' | 'code' | 'reasoning';

type DeprecatedModel = {
  id: string;
  name: string;
  provider: string;
  color: string;
  deprecatedAt: string;
  replacedBy: string | null;
  category: 'text' | 'multimodal' | 'code' | 'reasoning';
  contextWindow: string;
  reason: string;
  tag: string;
};

const MODELS: DeprecatedModel[] = [
  {
    id: 'kimi-k2',
    name: 'Kimi K2',
    provider: 'Moonshot AI',
    color: '#818cf8',
    deprecatedAt: '2025-06-15',
    replacedBy: 'Kimi K2.5',
    category: 'reasoning',
    contextWindow: '128K',
    reason: 'Superseded by Kimi K2.5 with improved reasoning and longer context support.',
    tag: 'Reasoning',
  },
  {
    id: 'minimax-m2-1',
    name: 'MiniMax M2.1',
    provider: 'MiniMax',
    color: '#fbbf24',
    deprecatedAt: '2025-05-20',
    replacedBy: 'MiniMax M3',
    category: 'multimodal',
    contextWindow: '256K',
    reason: 'Replaced by MiniMax M3 with enhanced multimodal capabilities and performance.',
    tag: 'Multimodal',
  },
  {
    id: 'glm-4-6',
    name: 'GLM 4.6',
    provider: 'Zhipu AI',
    color: '#34d399',
    deprecatedAt: '2025-04-10',
    replacedBy: 'GLM 4.7',
    category: 'text',
    contextWindow: '128K',
    reason: 'Updated to GLM 4.7 with better instruction following and coding tasks.',
    tag: 'Text',
  },
  {
    id: 'deepseek-v2-5',
    name: 'DeepSeek V2.5',
    provider: 'DeepSeek',
    color: '#38bdf8',
    deprecatedAt: '2025-03-01',
    replacedBy: 'DeepSeek V3',
    category: 'code',
    contextWindow: '64K',
    reason: 'Superseded by DeepSeek V3 with major performance and coding improvements.',
    tag: 'Code',
  },
  {
    id: 'qwen2-72b',
    name: 'Qwen 2 72B',
    provider: 'Alibaba',
    color: '#fb923c',
    deprecatedAt: '2025-02-14',
    replacedBy: 'Qwen3 235B',
    category: 'text',
    contextWindow: '128K',
    reason: 'Replaced by the Qwen3 series with significantly expanded scale and capability.',
    tag: 'Text',
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    color: '#60a5fa',
    deprecatedAt: '2025-01-30',
    replacedBy: 'Llama 3.3 70B',
    category: 'text',
    contextWindow: '8K',
    reason: 'Superseded by Llama 3.3 70B with significantly enhanced chat capabilities.',
    tag: 'Open',
  },
];

const CATS: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'text', label: 'Text' },
  { key: 'multimodal', label: 'Multi' },
  { key: 'code', label: 'Code' },
  { key: 'reasoning', label: 'Reason' },
];

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d < 30) return `${d}d`;
  const m = Math.floor(d / 30);
  return m < 12 ? `${m}mo` : `${Math.floor(m / 12)}y`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DeprecatedModels() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<Category>('all');
  const [active, setActive] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const detailRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { setTimeout(() => setShow(true), 30); }, []);

  useEffect(() => {
    const next: Record<string, number> = {};
    MODELS.forEach((m) => {
      const el = detailRefs.current[m.id];
      if (el) next[m.id] = el.scrollHeight;
    });
    setHeights(next);
  }, []);

  const filtered = MODELS.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)) &&
      (cat === 'all' || m.category === cat)
    );
  });

  const toggle = (id: string) => setActive((p) => (p === id ? null : id));

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        .dep-root { font-family: 'Syne', sans-serif; }
        .dep-mono { font-family: 'DM Mono', monospace; }

        @keyframes depSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes depRowIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes depDotPing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes depScanLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100vw); }
        }
        @keyframes depShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes depReveal {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }

        .slide-up { animation: depSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .row-in   { animation: depRowIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .dep-dot-ping::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #ef4444;
          animation: depDotPing 1.8s ease-out infinite;
        }

        .dep-title-shimmer {
          background: linear-gradient(90deg,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.55) 35%,
            rgba(0,0,0,0.85) 65%,
            rgba(0,0,0,0.85) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: depShimmer 5s linear infinite;
        }
        .dark .dep-title-shimmer {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.9) 0%,
            rgba(255,255,255,0.45) 35%,
            rgba(255,255,255,0.9) 65%,
            rgba(255,255,255,0.9) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: depShimmer 5s linear infinite;
        }

        .dep-row {
          transition: background 0.2s ease;
        }
        .dep-row:hover .dep-row-name {
          opacity: 1;
        }
        .dep-row-name {
          transition: opacity 0.2s ease;
        }
        .dep-detail-wrap {
          overflow: hidden;
          transition: height 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;
        }
        .dep-cat-btn {
          transition: all 0.18s cubic-bezier(0.22,1,0.36,1);
          position: relative;
          overflow: hidden;
        }
        .dep-cat-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: currentColor;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .dep-cat-btn:hover::after { opacity: 0.06; }
        .dep-cat-btn:active { transform: scale(0.95); }
        .dep-search {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .dep-search:focus {
          box-shadow: 0 0 0 3px rgba(14,165,233,0.12);
        }
        .dep-search::placeholder { color: rgba(161,161,170,0.45); }
        .dep-line-reveal {
          animation: depReveal 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }

        .dep-provider-chip {
          transition: all 0.18s ease;
        }
        .dep-row:hover .dep-provider-chip {
          opacity: 1;
        }
      `}</style>

      <div className="dep-root max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-8">

        <div className={`flex items-center justify-between mb-8 sm:mb-10 ${show ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0s' }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 group"
          >
            <FiArrowLeft
              className="text-zinc-400 dark:text-zinc-500 transition-all duration-200 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 group-hover:-translate-x-0.5"
              style={{ fontSize: 13 }}
            />
            <span className="dep-mono text-[10px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-200 tracking-widest uppercase">back</span>
          </button>
          <ThemeToggle />
        </div>

        <div className={`mb-7 sm:mb-8 ${show ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.06s' }}>
          <div className="flex items-end justify-between mb-1.5">
            <div>
              <div className="dep-mono text-[9px] tracking-[0.22em] text-zinc-400 dark:text-zinc-500 uppercase mb-2 dep-line-reveal" style={{ animationDelay: '0.15s' }}>
                Model Registry · Archived
              </div>
              <h1 className="dep-title-shimmer text-2xl sm:text-3xl font-800 tracking-tight leading-none" style={{ fontWeight: 800 }}>
                Deprecated
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="relative w-2 h-2 dep-dot-ping flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-red-500" />
              </div>
              <span className="dep-mono text-[9px] text-red-400 font-500 tracking-widest uppercase">{MODELS.length} archived</span>
            </div>
          </div>
          <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 dep-line-reveal" style={{ animationDelay: '0.2s' }} />
        </div>

        <div className={`flex flex-col sm:flex-row gap-2 mb-5 sm:mb-6 ${show ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.12s' }}>
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" style={{ fontSize: 11 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model or provider…"
              className="dep-search w-full pl-8 pr-7 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] text-zinc-900 dark:text-white outline-none focus:border-sky-400 dark:focus:border-sky-500"
              style={{ fontFamily: 'Syne, sans-serif' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <FiX style={{ fontSize: 10 }} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {CATS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCat(key)}
                className={`dep-cat-btn px-3 py-2 rounded-lg text-[10px] font-700 tracking-wide ${
                  cat === key
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
                    : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: cat === key ? 700 : 600 }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 slide-up">
            <p className="dep-mono text-[10px] text-zinc-300 dark:text-zinc-700 tracking-widest uppercase">No results</p>
          </div>
        ) : (
          <div className={`${show ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.18s' }}>
            {filtered.map((model, idx) => {
              const isOpen = active === model.id;
              const h = heights[model.id] ?? 0;
              return (
                <div key={model.id} className="row-in" style={{ animationDelay: `${0.18 + idx * 0.055}s` }}>
                  <div
                    className={`dep-row cursor-pointer rounded-xl transition-all duration-200 ${isOpen ? 'bg-zinc-50 dark:bg-zinc-900/70' : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50'}`}
                    onClick={() => toggle(model.id)}
                  >
                    <div className="flex items-center gap-3 px-3 py-2.5 sm:py-3">

                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-800 text-[11px]"
                        style={{
                          background: `${model.color}16`,
                          color: model.color,
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 800,
                        }}
                      >
                        {model.name[0]}
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                        <span
                          className="dep-row-name text-[12px] sm:text-[13px] font-700 text-zinc-900 dark:text-white truncate leading-none"
                          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
                        >
                          {model.name}
                        </span>
                        <span
                          className="dep-provider-chip hidden sm:inline dep-mono text-[9px] text-zinc-400 dark:text-zinc-500 opacity-70 truncate"
                        >
                          {model.provider}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span
                          className="dep-mono text-[8px] font-500 px-1.5 py-0.5 rounded-md"
                          style={{
                            background: `${model.color}14`,
                            color: model.color,
                            border: `1px solid ${model.color}24`,
                          }}
                        >
                          {model.tag}
                        </span>
                        <span className="dep-mono hidden sm:inline text-[9px] text-zinc-400 dark:text-zinc-500">{model.contextWindow}</span>
                        <span className="dep-mono text-[9px] text-zinc-400 dark:text-zinc-600">{timeAgo(model.deprecatedAt)}</span>
                        <div
                          className="w-4 h-4 flex items-center justify-center"
                          style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                        >
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 4h6M4 1v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zinc-400 dark:text-zinc-500" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div
                      className="dep-detail-wrap"
                      style={{ height: isOpen ? h : 0, opacity: isOpen ? 1 : 0 }}
                      ref={(el) => { detailRefs.current[model.id] = el; }}
                    >
                      <div className="px-3 pb-3 pt-0">
                        <div className="ml-10 sm:ml-11 pl-3 border-l border-zinc-100 dark:border-zinc-800 space-y-2.5">
                          <div>
                            <p className="dep-mono text-[8px] tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-1">Reason</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed" style={{ fontFamily: 'Syne, sans-serif' }}>{model.reason}</p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <div>
                              <p className="dep-mono text-[8px] tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-1">Deprecated</p>
                              <p className="dep-mono text-[10px] text-zinc-600 dark:text-zinc-400 font-500">{fmtDate(model.deprecatedAt)}</p>
                            </div>
                            {model.replacedBy && (
                              <div>
                                <p className="dep-mono text-[8px] tracking-widest text-emerald-500 uppercase mb-1">Replaced by</p>
                                <div className="flex items-center gap-1">
                                  <FiZap className="text-emerald-500" style={{ fontSize: 9 }} />
                                  <p className="dep-mono text-[10px] text-emerald-500 font-500">{model.replacedBy}</p>
                                </div>
                              </div>
                            )}
                            <div className="sm:hidden">
                              <p className="dep-mono text-[8px] tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-1">Provider</p>
                              <p className="dep-mono text-[10px] text-zinc-600 dark:text-zinc-400">{model.provider}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {idx < filtered.length - 1 && (
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 mx-3" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className={`mt-7 sm:mt-8 flex items-center justify-between ${show ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.45s' }}>
          <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800/60" />
          <span className="dep-mono text-[9px] text-zinc-300 dark:text-zinc-700 px-3 tracking-widest whitespace-nowrap">
            {filtered.length}/{MODELS.length} · Aichixia
          </span>
          <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}
