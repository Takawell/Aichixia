import { useState, useRef, useEffect, useCallback } from 'react';
import { FiPlay, FiCopy, FiCheck, FiChevronDown, FiZap, FiSettings, FiClock, FiPlus, FiX, FiAlertCircle, FiHash, FiTrash2, FiRotateCcw, FiEye, FiEyeOff, FiThumbsUp, FiSquare } from 'react-icons/fi';
import { SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiMistralai, SiXiaomi, SiSecurityscorecard, SiMaze, SiNvidia } from 'react-icons/si';
import { RiOpenaiFill, RiMoonFill } from 'react-icons/ri';
import { GiSpermWhale, GiPowerLightning, GiClover } from 'react-icons/gi';
import { DiBower } from 'react-icons/di';
import { TbSquareLetterZ } from 'react-icons/tb';
import { TiVendorMicrosoft } from 'react-icons/ti';
import { FaXTwitter } from 'react-icons/fa6';

const base = 'https://www.aichixia.xyz';

type AnyModel = {
  id: string;
  name: string;
  provider: string;
  icon: any;
  logoSlug?: string;
  color: string;
  pricing: string;
  context: string;
  endpoint: string;
  requiresPro?: boolean;
  requiresEnterprise?: boolean;
};

const STREAM_CAPABLE_MODELS = new Set(['kimi-k2.6', 'mistral-large-latest', 'minimax-m3', 'step-3.7-flash', 'nemotron-3-ultra-550b-a55b', 'gpt-oss-120b', 'deepseek-v4-flash', 'gemma-4-31b', 'glm-5.2', 'laguna-s-2.1', 'cohere-command-a', 'gemini-3-flash', 'llama-3.3-70b', 'deepseek-v3.2', 'claude-fable-5', 'qwen3-coder-plus', 'mimo-v2.5-pro', 'thinkingmachines/inkling', 'glm-4.7-flash', 'llama-4-scout-17b-16e-instruct']);

const TEXT_MODELS: AnyModel[] = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', icon: RiOpenaiFill, color: 'from-emerald-500 to-green-600', pricing: 'Budget', context: '400K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'aichixia-flash', name: 'Aichixia 114B', provider: 'Aichiverse', icon: SiSecurityscorecard, color: 'from-blue-600 via-blue-800 to-slate-900', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral AI', icon: SiMistralai, color: 'from-orange-500 to-amber-500', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', icon: GiSpermWhale, color: 'from-cyan-500 to-blue-600', pricing: 'Premium', context: '128K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek', icon: GiSpermWhale, color: 'from-cyan-600 to-teal-600', pricing: 'Standard', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', icon: SiAnthropic, color: 'from-orange-500 to-amber-600', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'claude-opus-4.8', name: 'Claude Opus 4.8', provider: 'Anthropic', icon: SiAnthropic, color: 'from-orange-500 to-amber-600', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'Anthropic', icon: SiAnthropic, color: 'from-orange-600 to-amber-700', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true, requiresEnterprise: true },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', icon: SiAnthropic, color: 'from-orange-400 to-amber-500', pricing: 'Standard', context: '200K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google', icon: SiGooglegemini, color: 'from-indigo-500 to-purple-600', pricing: 'Budget', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'phi-4-multimodal-instruct', name: 'Phi 4 Multimodal', provider: 'Microsoft', icon: TiVendorMicrosoft, color: 'from-cyan-500 to-blue-700', pricing: 'Budget', context: '128K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'grok-3', name: 'Grok 3', provider: 'xAI', icon: FaXTwitter, color: 'from-slate-600 to-zinc-700', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'glm-5.2', name: 'GLM 5.2', provider: 'Zhipu', icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-800', pricing: 'Premium', context: '200K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'kimi-k2.6', name: 'Kimi K2.6', provider: 'Moonshot', icon: RiMoonFill, color: 'from-blue-500 to-cyan-600', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'glm-4.7-flash', name: 'GLM 4.7 Flash', provider: 'Zhipu', icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-800', pricing: 'Standard', context: '131K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'gemma-4-31b', name: 'Gemma 4 31B', provider: 'Google', icon: SiGooglegemini, color: 'from-indigo-500 to-purple-600', pricing: 'Budget', context: '128K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'qwen3.6-27b', name: 'Qwen3.6 27B', provider: 'Alibaba', icon: SiAlibabacloud, color: 'from-purple-500 to-pink-500', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus 480B', provider: 'Alibaba', icon: SiAlibabacloud, color: 'from-purple-600 to-fuchsia-600', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'minimax-m3', name: 'MiniMax M3', provider: 'MiniMax', icon: SiMaze, color: 'from-cyan-600 to-blue-600', pricing: 'Premium', context: '204K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'thinkingmachines/inkling', name: 'Inkling', provider: 'Thinking Machines', icon: SiNvidia, color: 'from-yellow-500 to-orange-500', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', icon: SiMeta, color: 'from-blue-600 to-indigo-700', pricing: 'Standard', context: '130K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'OpenAI', icon: RiOpenaiFill, color: 'from-pink-600 to-rose-600', pricing: 'Budget', context: '128K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'mimo-v2.5-pro', name: 'MiMo V2.5 Pro', provider: 'Xiaomi', icon: SiXiaomi, color: 'from-blue-600 to-purple-600', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'groq-compound', name: 'Groq Compound', provider: 'Groq', icon: GiPowerLightning, color: 'from-orange-600 to-red-600', pricing: 'Standard', context: '131K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'cohere-command-a', name: 'Cohere Command A', provider: 'Cohere', icon: GiClover, color: 'from-emerald-600 to-teal-600', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'grok-4-fast', name: 'Grok 4 Fast', provider: 'xAI', icon: FaXTwitter, color: 'from-zinc-700 to-slate-900', pricing: 'Premium', context: '2M', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'step-3.7-flash', name: 'Step 3.7 Flash', provider: 'StepFun', icon: DiBower, color: 'from-blue-500 to-blue-700', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', provider: 'NVIDIA', icon: SiNvidia, color: 'from-emerald-600 to-green-600', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'laguna-s-2.1', name: 'Laguna S 2.1', provider: 'Poolside', icon: FiZap, color: 'from-sky-600 to-blue-700', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', icon: RiOpenaiFill, color: 'from-green-500 to-emerald-600', pricing: 'Standard', context: '400K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', icon: RiOpenaiFill, color: 'from-green-600 to-teal-600', pricing: 'Premium', context: '400K', endpoint: `${base}/api/v1/chat/completions`, requiresPro: true },
];

const PRICING_STYLE: Record<string, string> = {
  Premium: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  Standard: 'text-blue-400 dark:text-blue-300 bg-blue-50 dark:bg-blue-800/20 border-blue-100 dark:border-blue-700',
  Budget: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
};

const brandSvgCache: Record<string, string> = {};

const BrandIcon = ({ model, className }: { model: AnyModel; className?: string }) => {
  const [svg, setSvg] = useState<string | null>(model.logoSlug ? brandSvgCache[model.logoSlug] ?? null : null);
  const [failed, setFailed] = useState(false);
  const Icon = model.icon;

  useEffect(() => {
    if (!model.logoSlug) { setSvg(null); setFailed(false); return; }
    const cached = brandSvgCache[model.logoSlug];
    if (cached) { setSvg(cached); setFailed(false); return; }
    setSvg(null); setFailed(false);
    let cancelled = false;
    fetch(`https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${model.logoSlug}.svg`)
      .then(res => { if (!res.ok) throw new Error('missing'); return res.text(); })
      .then(text => {
        const clean = text.replace(/<script[\s\S]*?<\/script>/gi, '');
        brandSvgCache[model.logoSlug!] = clean;
        if (!cancelled) setSvg(clean);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [model.logoSlug]);

  if (!model.logoSlug || failed || !svg) return <Icon className={className} />;
  return <span className={`inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
};

async function safeParseJson(res: Response): Promise<{ data: any; error: string | null }> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    return { data: null, error: `Server returned non-JSON response (${res.status}): ${text.slice(0, 150).trim()}` };
  }
  try {
    const data = await res.json();
    return { data, error: null };
  } catch {
    return { data: null, error: `Failed to parse server response (${res.status})` };
  }
}

function renderInline(str: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`\n]+`|\*\*([^*]+)\*\*|\*([^*\n]+)\*)/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = regex.exec(str)) !== null) {
    if (m.index > last) parts.push(str.slice(last, m.index));
    const raw = m[0];
    const k = `${keyPrefix}-${m.index}`;
    if (raw.startsWith('`')) parts.push(<code key={k} className="px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 font-mono text-[10px] border border-blue-100 dark:border-blue-900/40">{raw.slice(1, -1)}</code>);
    else if (raw.startsWith('**')) parts.push(<strong key={k} className="font-bold text-zinc-900 dark:text-white">{raw.slice(2, -2)}</strong>);
    else parts.push(<em key={k} className="italic">{raw.slice(1, -1)}</em>);
    last = m.index + raw.length;
  }
  if (last < str.length) parts.push(str.slice(last));
  return parts;
}

function MiniMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3);
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      blocks.push(
        <pre key={key++} className="my-2 rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 overflow-x-auto">
          <code className="text-[10px] font-mono text-zinc-200 whitespace-pre">{code.join('\n')}</code>
        </pre>
      );
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const content = line.replace(/^#{1,3}\s/, '');
      blocks.push(<div key={key++} className={`font-bold text-zinc-900 dark:text-white mt-2 mb-1 ${level === 1 ? 'text-[13px]' : level === 2 ? 'text-[12px]' : 'text-[11px]'}`}>{renderInline(content, `h${key}`)}</div>);
      i++;
      continue;
    }
    if (/^[-*]\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s/, '')); i++; }
      blocks.push(
        <ul key={key++} className="my-1 space-y-0.5 pl-1">
          {items.map((it, idx) => (
            <li key={idx} className="flex gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span className="text-blue-400 flex-shrink-0">·</span>
              <span>{renderInline(it, `li${key}-${idx}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^[-*#]/.test(lines[i].trim()) && !lines[i].trim().startsWith('```')) { para.push(lines[i]); i++; }
    blocks.push(<p key={key++} className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed mb-1.5">{renderInline(para.join(' '), `p${key}`)}</p>);
  }
  return <>{blocks}</>;
}

type SlotStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

type CompareSlot = {
  uid: string;
  model: AnyModel;
  status: SlotStatus;
  text: string;
  error: string | null;
  latencyMs: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  liked: boolean;
};

const makeSlot = (model: AnyModel): CompareSlot => ({
  uid: `${model.id}-${Math.random().toString(36).slice(2, 9)}`,
  model,
  status: 'idle',
  text: '',
  error: null,
  latencyMs: null,
  promptTokens: null,
  completionTokens: null,
  totalTokens: null,
  liked: false,
});

function ModelPicker({ value, onChange, exclude }: { value: AnyModel; onChange: (m: AnyModel) => void; exclude: string[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = TEXT_MODELS.filter(m => (m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase())));

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-500/60 transition-colors duration-150"
      >
        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${value.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <BrandIcon model={value} className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[10.5px] font-bold text-zinc-900 dark:text-white truncate leading-tight">{value.name}</div>
          <div className="text-[9px] text-zinc-500 truncate leading-tight">{value.provider}</div>
        </div>
        <FiChevronDown className={`w-3 h-3 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="compare-slide-down absolute top-full left-0 mt-1.5 w-[min(85vw,300px)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full px-2.5 py-1.5 text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:border-blue-300 dark:focus:border-blue-400 text-zinc-900 dark:text-white placeholder-zinc-400 transition-colors"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <p className="text-center text-[10px] text-zinc-400 py-4">No models found</p>
            ) : filtered.map(m => {
              const disabled = exclude.includes(m.id) && m.id !== value.id;
              return (
                <button
                  key={m.id}
                  disabled={disabled}
                  onClick={() => { onChange(m); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors duration-150 text-left ${disabled ? 'opacity-30 cursor-not-allowed' : m.id === value.id ? 'bg-blue-50 dark:bg-blue-800/20 border border-blue-100 dark:border-blue-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                >
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0`}>
                    <BrandIcon model={m} className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-semibold text-zinc-900 dark:text-white truncate">{m.name}</div>
                    <div className="text-[9px] text-zinc-500 truncate">{m.provider} · {m.context}</div>
                  </div>
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded border flex-shrink-0 ${PRICING_STYLE[m.pricing]}`}>{m.pricing}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SlotStatus }) {
  if (status === 'idle') return <span className="flex items-center gap-1 text-[9px] font-semibold text-zinc-400"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />Idle</span>;
  if (status === 'loading') return <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 compare-pulse" />Connecting</span>;
  if (status === 'streaming') return <span className="flex items-center gap-1 text-[9px] font-semibold text-blue-400"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 compare-pulse" />Streaming</span>;
  if (status === 'error') return <span className="flex items-center gap-1 text-[9px] font-semibold text-rose-500"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Failed</span>;
  return <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Done</span>;
}

function SlotCard({ slot, onModelChange, onRemove, onToggleLike, exclude, canRemove, apiKey }: {
  slot: CompareSlot;
  onModelChange: (m: AnyModel) => void;
  onRemove: () => void;
  onToggleLike: () => void;
  exclude: string[];
  canRemove: boolean;
  apiKey: string;
}) {
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slot.status === 'streaming' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [slot.text, slot.status]);

  const handleCopy = () => {
    navigator.clipboard.writeText(slot.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`compare-fade-in flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden bg-white/90 dark:bg-zinc-950 ${slot.status === 'streaming' ? 'border-blue-300 dark:border-blue-500/50 shadow-[0_0_0_3px_rgba(96,165,250,0.08)]' : slot.status === 'error' ? 'border-rose-200 dark:border-rose-900/50' : slot.liked ? 'border-emerald-300 dark:border-emerald-600/50' : 'border-zinc-200 dark:border-zinc-800'}`}>
      <div className="flex items-center gap-2 px-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800/70 bg-zinc-50/60 dark:bg-zinc-900/40 flex-shrink-0">
        <ModelPicker value={slot.model} onChange={onModelChange} exclude={exclude} />
        {canRemove && (
          <button onClick={onRemove} className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors duration-150">
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800/70 flex-shrink-0">
        <StatusBadge status={slot.status} />
        <div className="flex items-center gap-2">
          {slot.latencyMs != null && (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-zinc-400 tabular-nums">
              <FiClock className="w-2.5 h-2.5" />{slot.latencyMs < 1000 ? `${slot.latencyMs}ms` : `${(slot.latencyMs / 1000).toFixed(1)}s`}
            </span>
          )}
          {slot.totalTokens != null && (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-zinc-400 tabular-nums">
              <FiHash className="w-2.5 h-2.5" />{slot.totalTokens}
            </span>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-[160px] max-h-[360px] overflow-y-auto px-3 py-2.5 scroll-smooth">
        {slot.status === 'idle' && (
          <div className="h-full flex items-center justify-center text-center py-6">
            <p className="text-[10.5px] text-zinc-400 dark:text-zinc-600">Waiting to run</p>
          </div>
        )}
        {slot.status === 'loading' && !slot.text && (
          <div className="space-y-2 pt-1">
            <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 compare-shimmer w-[85%]" />
            <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 compare-shimmer w-[70%]" />
            <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 compare-shimmer w-[92%]" />
            <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 compare-shimmer w-[55%]" />
          </div>
        )}
        {slot.text && <MiniMarkdown text={slot.text} />}
        {slot.status === 'streaming' && slot.text && <span className="inline-block w-1.5 h-3.5 bg-blue-400 compare-caret align-middle ml-0.5" />}
        {slot.status === 'error' && (
          <div className="flex items-start gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/40 px-2.5 py-2 mt-1">
            <FiAlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-rose-600 dark:text-rose-400 leading-relaxed break-words">{slot.error}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-zinc-100 dark:border-zinc-800/70 flex-shrink-0">
        <button
          onClick={onToggleLike}
          disabled={!slot.text}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${slot.liked ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}`}
        >
          <FiThumbsUp className={`w-3 h-3 ${slot.liked ? 'fill-current' : ''}`} />
          {slot.liked ? 'Best answer' : 'Mark best'}
        </button>
        <button
          onClick={handleCopy}
          disabled={!slot.text}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {copied ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function Compare({ keys }: { keys?: { key: string; name: string; is_active: boolean }[] }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [prompt, setPrompt] = useState('Explain the difference between REST and GraphQL in three sentences.');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystem, setShowSystem] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [isRunning, setIsRunning] = useState(false);
  const [slots, setSlots] = useState<CompareSlot[]>([makeSlot(TEXT_MODELS[5]), makeSlot(TEXT_MODELS[9])]);
  const [error, setError] = useState<string | null>(null);
  const abortRefs = useRef<Record<string, AbortController>>({});

  const usedIds = slots.map(s => s.model.id);

  const updateSlot = (uid: string, patch: Partial<CompareSlot>) => {
    setSlots(prev => prev.map(s => (s.uid === uid ? { ...s, ...patch } : s)));
  };

  const addSlot = () => {
    if (slots.length >= 4) return;
    const next = TEXT_MODELS.find(m => !usedIds.includes(m.id)) ?? TEXT_MODELS[0];
    setSlots(prev => [...prev, makeSlot(next)]);
  };

  const removeSlot = (uid: string) => {
    const ctrl = abortRefs.current[uid];
    if (ctrl) ctrl.abort();
    setSlots(prev => prev.filter(s => s.uid !== uid));
  };

  const changeSlotModel = (uid: string, model: AnyModel) => {
    setSlots(prev => prev.map(s => (s.uid === uid ? { ...makeSlot(model), uid } : s)));
  };

  const toggleLike = (uid: string) => {
    setSlots(prev => prev.map(s => (s.uid === uid ? { ...s, liked: !s.liked } : { ...s, liked: false })));
  };

  const runOne = useCallback(async (slot: CompareSlot) => {
    const controller = new AbortController();
    abortRefs.current[slot.uid] = controller;
    const t0 = Date.now();
    const msgs: any[] = [];
    if (systemPrompt.trim()) msgs.push({ role: 'system', content: systemPrompt });
    msgs.push({ role: 'user', content: prompt });

    const canStream = STREAM_CAPABLE_MODELS.has(slot.model.id);

    updateSlot(slot.uid, { status: 'loading', text: '', error: null, latencyMs: null, totalTokens: null, liked: false });

    try {
      if (canStream) {
        let res: Response;
        try {
          res = await fetch(slot.model.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model: slot.model.id, messages: msgs, temperature, max_tokens: maxTokens, stream: true }),
            signal: controller.signal,
          });
        } catch (e: any) {
          if (e.name === 'AbortError') return;
          updateSlot(slot.uid, { status: 'error', error: e?.message || 'Network error', latencyMs: Date.now() - t0 });
          return;
        }

        if (!res.ok || !res.body) {
          const { data, error: parseError } = await safeParseJson(res);
          updateSlot(slot.uid, { status: 'error', error: parseError || data?.error?.message || `Error ${res.status}`, latencyMs: Date.now() - t0 });
          return;
        }

        updateSlot(slot.uid, { status: 'streaming' });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!value) continue;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';
            for (const part of parts) {
              if (!part.startsWith('data: ')) continue;
              const payload = part.slice(6).trim();
              if (!payload || payload === '[DONE]') continue;
              try {
                const parsed = JSON.parse(payload);
                if (typeof parsed?.text === 'string') { fullText += parsed.text; updateSlot(slot.uid, { text: fullText }); }
                if (parsed?.error) updateSlot(slot.uid, { status: 'error', error: String(parsed.error) });
              } catch { continue; }
            }
          }
        } catch (e: any) {
          if (e.name !== 'AbortError' && !fullText) {
            updateSlot(slot.uid, { status: 'error', error: e?.message || 'Stream interrupted', latencyMs: Date.now() - t0 });
            return;
          }
        }

        if (fullText) {
          const approxPrompt = Math.ceil(prompt.length / 4);
          const approxCompletion = Math.ceil(fullText.length / 4);
          updateSlot(slot.uid, {
            status: 'done',
            latencyMs: Date.now() - t0,
            promptTokens: approxPrompt,
            completionTokens: approxCompletion,
            totalTokens: approxPrompt + approxCompletion,
          });
        }
        return;
      }

      const res = await fetch(slot.model.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: slot.model.id, messages: msgs, temperature, max_tokens: maxTokens }),
        signal: controller.signal,
      });
      const { data, error: parseError } = await safeParseJson(res);
      if (parseError) { updateSlot(slot.uid, { status: 'error', error: parseError, latencyMs: Date.now() - t0 }); return; }
      if (!res.ok) { updateSlot(slot.uid, { status: 'error', error: data?.error?.message || `Error ${res.status}`, latencyMs: Date.now() - t0 }); return; }
      const txt = data?.choices?.[0]?.message?.content ?? '';
      updateSlot(slot.uid, {
        status: 'done',
        text: txt,
        latencyMs: Date.now() - t0,
        promptTokens: data?.usage?.prompt_tokens ?? null,
        completionTokens: data?.usage?.completion_tokens ?? null,
        totalTokens: data?.usage?.total_tokens ?? null,
      });
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      updateSlot(slot.uid, { status: 'error', error: e?.message || 'Network error', latencyMs: Date.now() - t0 });
    }
  }, [apiKey, prompt, systemPrompt, temperature, maxTokens]);

  const runAll = async () => {
    if (!apiKey.trim()) { setError('Please enter your API key'); return; }
    if (!prompt.trim()) { setError('Please enter a prompt'); return; }
    setError(null);
    setIsRunning(true);
    await Promise.allSettled(slots.map(runOne));
    setIsRunning(false);
  };

  const stopAll = () => {
    Object.values(abortRefs.current).forEach(c => c.abort());
    setIsRunning(false);
    setSlots(prev => prev.map(s => (s.status === 'loading' || s.status === 'streaming' ? { ...s, status: 'idle' } : s)));
  };

  const resetAll = () => {
    setSlots(prev => prev.map(s => ({ ...makeSlot(s.model), uid: s.uid })));
    setError(null);
  };

  const gridCols = slots.length <= 2 ? 'sm:grid-cols-2' : slots.length === 3 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0 w-full max-w-full">
      <style>{`
        @keyframes compareFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes compareSlideDown { from { opacity: 0; transform: translateY(-6px) scaleY(0.97); } to { opacity: 1; transform: translateY(0) scaleY(1); } }
        @keyframes comparePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.75); } }
        @keyframes compareShimmer { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.9; } }
        @keyframes compareCaretBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes compareRunPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0.35); } 50% { box-shadow: 0 0 0 6px rgba(96,165,250,0); } }
        .compare-fade-in { animation: compareFadeIn 0.25s ease-out; }
        .compare-slide-down { animation: compareSlideDown 0.16s ease-out; transform-origin: top; }
        .compare-pulse { animation: comparePulse 1.1s ease-in-out infinite; }
        .compare-shimmer { animation: compareShimmer 1.3s ease-in-out infinite; }
        .compare-caret { animation: compareCaretBlink 0.85s step-start infinite; }
        .compare-run-active { animation: compareRunPulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .compare-fade-in, .compare-slide-down, .compare-pulse, .compare-shimmer, .compare-caret, .compare-run-active { animation: none !important; }
        }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">Compare Models</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Run one prompt across multiple models side by side</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-blue-400 compare-pulse' : 'bg-emerald-500'}`} />
          <span className={`text-[10px] font-semibold ${isRunning ? 'text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{isRunning ? 'Running' : 'Live'}</span>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <FiSettings className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Shared configuration</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="acv-••••••••••••••••"
                className="w-full pr-8 px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-300 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-300/20 outline-none transition-all"
              />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                {showKey ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
              </button>
            </div>
            {keys && keys.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {keys.filter(k => k.is_active).slice(0, 3).map(k => (
                  <button key={k.key} onClick={() => setApiKey(k.key)} className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-800/20 text-blue-400 dark:text-blue-300 border border-blue-100 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-800/30 transition-colors font-medium">{k.name}</button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Temperature <span className="text-zinc-400 font-normal tabular-nums">{temperature.toFixed(1)}</span>
              </label>
              <input
                type="range" min={0} max={2} step={0.1} value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-400"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Max tokens</label>
              <input
                type="number" min={1} max={8192} value={maxTokens}
                onChange={e => setMaxTokens(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10.5px] text-zinc-900 dark:text-white focus:border-blue-300 dark:focus:border-blue-400 outline-none transition-all tabular-nums"
              />
            </div>
          </div>
        </div>

        <div>
          <button onClick={() => setShowSystem(!showSystem)} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-1">
            <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${showSystem ? 'rotate-180' : ''}`} />
            System prompt <span className="text-[9px] font-normal text-zinc-400">(optional, applied to all)</span>
          </button>
          {showSystem && (
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={2}
              placeholder="You are a helpful assistant..."
              className="compare-slide-down w-full px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-300 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-300/20 outline-none transition-all resize-none"
            />
          )}
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ask something to compare across models..."
            className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-300 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-300/20 outline-none transition-all resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/40 px-2.5 py-2 compare-fade-in">
            <FiAlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-rose-600 dark:text-rose-400 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={isRunning ? stopAll : runAll}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold text-white transition-all duration-200 ${isRunning ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-400 hover:bg-blue-500 compare-run-active'}`}
          >
            {isRunning ? <FiSquare className="w-3 h-3" /> : <FiPlay className="w-3 h-3" />}
            {isRunning ? 'Stop all' : `Run on ${slots.length} model${slots.length > 1 ? 's' : ''}`}
          </button>
          <button
            onClick={resetAll}
            disabled={isRunning}
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiRotateCcw className="w-3 h-3" />
            Reset
          </button>
          {slots.length < 4 && (
            <button
              onClick={addSlot}
              disabled={isRunning}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-semibold text-blue-500 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiPlus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        {slots.map(slot => (
          <SlotCard
            key={slot.uid}
            slot={slot}
            onModelChange={m => changeSlotModel(slot.uid, m)}
            onRemove={() => removeSlot(slot.uid)}
            onToggleLike={() => toggleLike(slot.uid)}
            exclude={usedIds}
            canRemove={slots.length > 2}
            apiKey={apiKey}
          />
        ))}
      </div>
    </div>
  );
}
