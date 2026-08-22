import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { FiPlay, FiCopy, FiCheck, FiChevronDown, FiZap, FiSettings, FiClock, FiPlus, FiX, FiAlertCircle, FiHash, FiRotateCcw, FiEye, FiEyeOff, FiThumbsUp, FiSquare, FiDownload, FiMaximize2, FiMinimize2, FiSliders, FiTarget, FiActivity, FiBarChart2, FiStar, FiCpu, FiCode, FiRefreshCw, FiSave, FiClock as FiHistory, FiTrash2, FiFileText, FiLayers, FiShuffle, FiThumbsDown, FiAward, FiCommand, FiType, FiTrendingUp, FiPercent } from 'react-icons/fi';
import { SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiMistralai, SiXiaomi, SiAirbrake, SiMaze, SiNvidia } from 'react-icons/si';
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
  requiresPlan?: 'pro' | 'enterprise';
};

const STREAM_CAPABLE_MODELS = new Set(['kimi-k2.6', 'mistral-large-latest', 'minimax-m3', 'step-3.7-flash', 'nemotron-3-ultra-550b-a55b', 'gpt-oss-120b', 'deepseek-v4-flash', 'gemma-4-31b', 'glm-5.2', 'laguna-s-2.1', 'cohere-command-a', 'gemini-3-flash', 'llama-3.3-70b', 'deepseek-v3.2', 'claude-fable-5', 'qwen3-coder-plus', 'mimo-v2.5-pro', 'thinkingmachines/inkling', 'glm-4.7-flash', 'llama-4-scout-17b-16e-instruct']);

const TEXT_MODELS: AnyModel[] = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', logoSlug: 'openai', icon: RiOpenaiFill, color: 'from-emerald-600 to-green-600', pricing: 'Budget', context: '400K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'aichixia-flash', name: 'Aichixia 114B', provider: 'Aichiverse', icon: SiAirbrake, color: 'from-blue-600 via-blue-800 to-slate-900', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral AI', logoSlug: 'mistral', icon: SiMistralai, color: 'from-orange-600 to-amber-600', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', logoSlug: 'deepseek', icon: GiSpermWhale, color: 'from-cyan-600 to-blue-600', pricing: 'Premium', context: '128K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', provider: 'DeepSeek', logoSlug: 'deepseek', icon: GiSpermWhale, color: 'from-cyan-600 to-teal-600', pricing: 'Standard', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', logoSlug: 'anthropic', icon: SiAnthropic, color: 'from-orange-600 to-amber-700', pricing: 'Premium', context: '200K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'claude-opus-4.8', name: 'Claude Opus 4.8', provider: 'Anthropic', logoSlug: 'anthropic', icon: SiAnthropic, color: 'from-orange-600 to-amber-700', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'Anthropic', logoSlug: 'anthropic', icon: SiAnthropic, color: 'from-orange-700 to-amber-800', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'enterprise' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', logoSlug: 'anthropic', icon: SiAnthropic, color: 'from-orange-500 to-amber-600', pricing: 'Standard', context: '200K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google', logoSlug: 'gemini', icon: SiGooglegemini, color: 'from-indigo-600 to-purple-600', pricing: 'Budget', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'grok-3', name: 'Grok 3', provider: 'xAI', logoSlug: 'xai', icon: FaXTwitter, color: 'from-slate-600 to-zinc-800', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'phi-4-multimodal-instruct', name: 'Phi 4 Multimodal', provider: 'Microsoft', logoSlug: 'microsoft', icon: TiVendorMicrosoft, color: 'from-cyan-500 to-blue-700', pricing: 'Budget', context: '128K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'glm-5.2', name: 'GLM 5.2', provider: 'Zhipu', logoSlug: 'zhipu', icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-900', pricing: 'Premium', context: '200K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'glm-4.7-flash', name: 'GLM 4.7 Flash', provider: 'Zhipu', logoSlug: 'zhipu', icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-900', pricing: 'Standard', context: '131K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'gemma-4-31b', name: 'Gemma 4 31B', provider: 'Google', logoSlug: 'gemini', icon: SiGooglegemini, color: 'from-indigo-600 to-purple-600', pricing: 'Budget', context: '128K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'kimi-k2.6', name: 'Kimi K2.6', provider: 'Moonshot', logoSlug: 'kimi', icon: RiMoonFill, color: 'from-blue-600 to-cyan-600', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'step-3.7-flash', name: 'Step 3.7 Flash', provider: 'StepFun', logoSlug: 'stepfun', icon: DiBower, color: 'from-blue-500 to-blue-700', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', provider: 'NVIDIA', logoSlug: 'nvidia', icon: SiNvidia, color: 'from-emerald-600 to-green-600', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'laguna-s-2.1', name: 'Laguna S 2.1', provider: 'Poolside', logoSlug: 'poolside', icon: FiZap, color: 'from-sky-600 to-blue-700', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'qwen3.6-27b', name: 'Qwen3.6 27B', provider: 'Alibaba', logoSlug: 'qwen', icon: SiAlibabacloud, color: 'from-purple-500 to-pink-500', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'qwen3-coder-plus', name: 'Qwen3 Coder Plus 480B', provider: 'Alibaba', logoSlug: 'qwen', icon: SiAlibabacloud, color: 'from-purple-600 to-fuchsia-600', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'minimax-m3', name: 'MiniMax M3', provider: 'MiniMax', logoSlug: 'minimax', icon: SiMaze, color: 'from-cyan-600 to-blue-600', pricing: 'Premium', context: '204K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'thinkingmachines/inkling', name: 'Inkling', provider: 'Thinking Machines', logoSlug: 'huggingface', icon: SiNvidia, color: 'from-yellow-500 to-orange-500', pricing: 'Premium', context: '256K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B 16E', provider: 'Meta', logoSlug: 'meta', icon: SiMeta, color: 'from-purple-600 to-blue-700', pricing: 'Standard', context: '131K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', logoSlug: 'meta', icon: SiMeta, color: 'from-blue-600 to-indigo-700', pricing: 'Standard', context: '130K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'OpenAI', logoSlug: 'openai', icon: RiOpenaiFill, color: 'from-pink-600 to-rose-600', pricing: 'Budget', context: '131K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'mimo-v2.5-pro', name: 'MiMo V2.5 Pro', provider: 'Xiaomi', logoSlug: 'xiaomi', icon: SiXiaomi, color: 'from-blue-600 to-purple-600', pricing: 'Premium', context: '1M', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'groq-compound', name: 'Groq Compound', provider: 'Groq', logoSlug: 'groq', icon: GiPowerLightning, color: 'from-orange-600 to-red-600', pricing: 'Standard', context: '131K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'cohere-command-a', name: 'Cohere Command A', provider: 'Cohere', logoSlug: 'cohere', icon: GiClover, color: 'from-emerald-600 to-teal-600', pricing: 'Standard', context: '256K', endpoint: `${base}/api/v1/chat/completions` },
  { id: 'grok-4-fast', name: 'Grok 4 Fast', provider: 'xAI', logoSlug: 'xai', icon: FaXTwitter, color: 'from-zinc-700 to-slate-900', pricing: 'Standard', context: '2M', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', logoSlug: 'openai', icon: RiOpenaiFill, color: 'from-green-500 to-emerald-600', pricing: 'Premium', context: '400K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', logoSlug: 'openai', icon: RiOpenaiFill, color: 'from-green-600 to-teal-600', pricing: 'Premium', context: '400K', endpoint: `${base}/api/v1/chat/completions`, requiresPlan: 'pro' },
];

const PRICING_STYLE: Record<string, string> = {
  Premium: 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-500/10 border-rose-200/80 dark:border-rose-500/30',
  Standard: 'text-blue-500 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-500/10 border-blue-200/80 dark:border-blue-500/30',
  Budget: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/30',
};

const brandSvgCache: Record<string, string> = {};

const BrandIcon = memo(({ model, className }: { model: AnyModel; className?: string }) => {
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
});
BrandIcon.displayName = 'BrandIcon';

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

type ArtifactData = { type: 'html' | 'svg'; content: string; title: string };

function detectArtifact(text: string): ArtifactData | null {
  const html = text.match(/```html\n([\s\S]*?)```/i);
  if (html) return { type: 'html', content: html[1].trim(), title: 'HTML Preview' };
  const svg = text.match(/```svg\n([\s\S]*?)```/i);
  if (svg) return { type: 'svg', content: svg[1].trim(), title: 'SVG Preview' };
  const rawSvg = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (rawSvg) return { type: 'svg', content: rawSvg[0], title: 'SVG Preview' };
  return null;
}

function ArtifactPreview({ artifact }: { artifact: ArtifactData }) {
  const [fullscreen, setFullscreen] = useState(false);
  const srcDoc = artifact.type === 'svg'
    ? `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff">${artifact.content}</body></html>`
    : artifact.content;

  return (
    <div className={`cmp-fade-in rounded-2xl overflow-hidden border border-blue-300/50 dark:border-blue-500/30 shadow-lg mt-2 ${fullscreen ? 'fixed inset-2 sm:inset-8 z-[90] flex flex-col' : ''}`}>
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/60 dark:from-blue-950/60 dark:to-indigo-950/30 border-b border-blue-200/60 dark:border-blue-800/40 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/80" />
            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[9px] font-bold text-blue-500 dark:text-blue-300">{artifact.title}</span>
        </div>
        <button onClick={() => setFullscreen(v => !v)} className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-blue-100/70 dark:hover:bg-blue-800/30 text-blue-400 dark:text-blue-300 transition-colors">
          {fullscreen ? <FiMinimize2 className="w-3 h-3" /> : <FiMaximize2 className="w-3 h-3" />}
        </button>
      </div>
      <iframe
        srcDoc={srcDoc}
        className={`w-full border-0 bg-white ${fullscreen ? 'flex-1' : 'h-40'}`}
        sandbox="allow-scripts allow-same-origin"
        title={artifact.title}
      />
    </div>
  );
}

function renderInline(str: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`\n]+`|\*\*([^*]+)\*\*|\*([^*\n]+)\*)/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = regex.exec(str)) !== null) {
    if (m.index > last) parts.push(str.slice(last, m.index));
    const raw = m[0];
    const k = `${keyPrefix}-${m.index}`;
    if (raw.startsWith('`')) parts.push(<code key={k} className="px-1 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-300 font-mono text-[10px] border border-blue-500/20">{raw.slice(1, -1)}</code>);
    else if (raw.startsWith('**')) parts.push(<strong key={k} className="font-bold text-zinc-900 dark:text-white">{raw.slice(2, -2)}</strong>);
    else parts.push(<em key={k} className="italic">{raw.slice(1, -1)}</em>);
    last = m.index + raw.length;
  }
  if (last < str.length) parts.push(str.slice(last));
  return parts;
}

function MiniMarkdown({ text, showArtifacts }: { text: string; showArtifacts: boolean }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      const langTag = line.trim().slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      i++;
      const codeStr = code.join('\n');
      const art = showArtifacts ? detectArtifact(`\`\`\`${langTag}\n${codeStr}\n\`\`\``) : null;
      blocks.push(
        <div key={key++}>
          <pre className="my-2 rounded-xl bg-zinc-950/90 border border-white/10 p-2.5 overflow-x-auto">
            <code className="text-[10px] font-mono text-zinc-200 whitespace-pre">{codeStr}</code>
          </pre>
          {art && <ArtifactPreview artifact={art} />}
        </div>
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

type SlotStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error' | 'aborted';

type RunConfig = {
  prompt: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  runId: number;
};

type SlotSummary = {
  uid: string;
  status: SlotStatus;
  latencyMs: number | null;
  totalTokens: number | null;
  liked: boolean;
  rating: number;
  charCount: number;
  text: string;
};

type HistoryEntry = { id: string; prompt: string; timestamp: number };

const PROMPT_TEMPLATES: { label: string; prompt: string }[] = [
  { label: 'Explain concept', prompt: 'Explain the difference between REST and GraphQL in three sentences.' },
  { label: 'Write code', prompt: 'Write a Python function that checks whether a string is a palindrome, with comments.' },
  { label: 'Summarize', prompt: 'Summarize the key benefits of server-side rendering versus client-side rendering.' },
  { label: 'Creative writing', prompt: 'Write a short, vivid opening paragraph for a sci-fi story set on a floating city.' },
  { label: 'Reasoning', prompt: 'A farmer has 17 sheep, all but 9 die. How many are left? Explain your reasoning step by step.' },
  { label: 'Build UI', prompt: 'Create a simple responsive pricing card component using HTML and CSS in a single html code block.' },
];

function ModelPicker({ value, onChange, exclude, disabled }: { value: AnyModel; onChange: (m: AnyModel) => void; exclude: string[]; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => TEXT_MODELS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.provider.toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/10 hover:border-blue-300/70 dark:hover:border-blue-400/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${value.color} flex items-center justify-center flex-shrink-0 shadow-md ring-1 ring-white/20`}>
          <BrandIcon model={value} className="w-3 h-3 text-white" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-[11px] font-bold text-zinc-900 dark:text-white truncate leading-tight tracking-tight">{value.name}</div>
          <div className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate leading-tight">{value.provider}</div>
        </div>
        <FiChevronDown className={`w-3.5 h-3.5 text-zinc-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="cmp-pop absolute top-full left-0 mt-2 w-[min(88vw,310px)] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-zinc-100/80 dark:border-white/5">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full px-3 py-2 text-[11px] bg-zinc-100/70 dark:bg-white/5 border border-transparent rounded-xl outline-none focus:border-blue-300 dark:focus:border-blue-400/50 text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 cmp-scroll">
            {filtered.length === 0 ? (
              <p className="text-center text-[10px] text-zinc-400 py-4">No models found</p>
            ) : filtered.map(m => {
              const isDisabled = exclude.includes(m.id) && m.id !== value.id;
              return (
                <button
                  key={m.id}
                  disabled={isDisabled}
                  onClick={() => { onChange(m); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors duration-150 text-left ${isDisabled ? 'opacity-30 cursor-not-allowed' : m.id === value.id ? 'bg-blue-500/10 border border-blue-400/30' : 'hover:bg-zinc-100/80 dark:hover:bg-white/5 border border-transparent'}`}
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <BrandIcon model={m} className="w-3 h-3 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-semibold text-zinc-900 dark:text-white truncate">{m.name}</div>
                    <div className="text-[9px] text-zinc-500 truncate">{m.provider} · {m.context}</div>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${PRICING_STYLE[m.pricing]}`}>{m.pricing}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: SlotStatus }) {
  const map: Record<SlotStatus, { dot: string; text: string; label: string; pulse: boolean }> = {
    idle: { dot: 'bg-zinc-300 dark:bg-zinc-700', text: 'text-zinc-400 dark:text-zinc-500', label: 'Idle', pulse: false },
    connecting: { dot: 'bg-amber-400', text: 'text-amber-500', label: 'Connecting', pulse: true },
    streaming: { dot: 'bg-blue-400', text: 'text-blue-500 dark:text-blue-300', label: 'Streaming', pulse: true },
    done: { dot: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', label: 'Complete', pulse: false },
    error: { dot: 'bg-rose-500', text: 'text-rose-500', label: 'Failed', pulse: false },
    aborted: { dot: 'bg-zinc-400', text: 'text-zinc-400', label: 'Stopped', pulse: false },
  };
  const s = map[status];
  return (
    <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${s.text}`}>
      <span className={`relative w-1.5 h-1.5 rounded-full ${s.dot}`}>
        {s.pulse && <span className={`absolute inset-0 rounded-full ${s.dot} cmp-ping`} />}
      </span>
      {s.label}
    </span>
  );
}

type SlotCardHandle = { stop: () => void; run: () => void };

const SlotCard = memo(function SlotCard({
  uid, model, config, exclude, canRemove, showArtifacts, onModelChange, onRemove, onReport, registerHandle,
}: {
  uid: string;
  model: AnyModel;
  config: RunConfig;
  exclude: string[];
  canRemove: boolean;
  showArtifacts: boolean;
  onModelChange: (m: AnyModel) => void;
  onRemove: () => void;
  onReport: (s: SlotSummary) => void;
  registerHandle: (uid: string, handle: SlotCardHandle | null) => void;
}) {
  const [status, setStatus] = useState<SlotStatus>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [, forceTick] = useState(0);

  const bufferRef = useRef('');
  const rafRef = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(0);
  const runIdRef = useRef(0);
  const elapsedTimerRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    setText(bufferRef.current);
    rafRef.current = null;
  }, []);

  const pushChunk = useCallback((chunk: string) => {
    bufferRef.current += chunk;
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  useEffect(() => {
    if (status === 'streaming' && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [text, status]);

  useEffect(() => {
    if (status === 'connecting' || status === 'streaming') {
      elapsedTimerRef.current = window.setInterval(() => forceTick(t => t + 1), 100);
    } else if (elapsedTimerRef.current) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    return () => { if (elapsedTimerRef.current) window.clearInterval(elapsedTimerRef.current); };
  }, [status]);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    setStatus(prev => (prev === 'streaming' || prev === 'connecting' ? 'aborted' : prev));
  }, []);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const controller = new AbortController();
    controllerRef.current = controller;
    const myRunId = ++runIdRef.current;

    bufferRef.current = '';
    setText('');
    setError(null);
    setLatencyMs(null);
    setTotalTokens(null);
    setLiked(false);
    setRating(0);
    setStatus('connecting');
    startRef.current = Date.now();

    const msgs: any[] = [];
    if (config.systemPrompt.trim()) msgs.push({ role: 'system', content: config.systemPrompt });
    msgs.push({ role: 'user', content: config.prompt });

    const canStream = STREAM_CAPABLE_MODELS.has(model.id);

    try {
      if (canStream) {
        let res: Response;
        try {
          res = await fetch(model.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
            body: JSON.stringify({ model: model.id, messages: msgs, temperature: config.temperature, max_tokens: config.maxTokens, stream: true }),
            signal: controller.signal,
          });
        } catch (e: any) {
          if (e.name === 'AbortError' || runIdRef.current !== myRunId) return;
          setStatus('error'); setError(e?.message || 'Network error'); setLatencyMs(Date.now() - startRef.current);
          return;
        }

        if (runIdRef.current !== myRunId) return;

        if (!res.ok || !res.body) {
          const { data, error: parseError } = await safeParseJson(res);
          if (runIdRef.current !== myRunId) return;
          setStatus('error');
          setError(parseError || data?.error?.message || `Error ${res.status}`);
          setLatencyMs(Date.now() - startRef.current);
          return;
        }

        setStatus('streaming');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        let streamErrored = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (runIdRef.current !== myRunId) { reader.cancel(); return; }
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
                if (typeof parsed?.text === 'string' && parsed.text.length) {
                  fullText += parsed.text;
                  pushChunk(parsed.text);
                }
                if (parsed?.error) { streamErrored = true; setStatus('error'); setError(String(parsed.error)); }
              } catch { continue; }
            }
          }
        } catch (e: any) {
          if (e.name !== 'AbortError' && !fullText && runIdRef.current === myRunId) {
            setStatus('error'); setError(e?.message || 'Stream interrupted'); setLatencyMs(Date.now() - startRef.current);
            return;
          }
        }

        if (runIdRef.current !== myRunId) return;
        if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        setText(fullText);

        if (fullText && !streamErrored) {
          const approxPrompt = Math.ceil(config.prompt.length / 4);
          const approxCompletion = Math.ceil(fullText.length / 4);
          const elapsed = Date.now() - startRef.current;
          setStatus('done');
          setLatencyMs(elapsed);
          setTotalTokens(approxPrompt + approxCompletion);
          onReport({ uid, status: 'done', latencyMs: elapsed, totalTokens: approxPrompt + approxCompletion, liked: false, rating: 0, charCount: fullText.length, text: fullText });
        }
        return;
      }

      setStatus('connecting');
      const res = await fetch(model.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: model.id, messages: msgs, temperature: config.temperature, max_tokens: config.maxTokens }),
        signal: controller.signal,
      });
      if (runIdRef.current !== myRunId) return;
      const { data, error: parseError } = await safeParseJson(res);
      if (runIdRef.current !== myRunId) return;
      const elapsed = Date.now() - startRef.current;
      if (parseError) { setStatus('error'); setError(parseError); setLatencyMs(elapsed); return; }
      if (!res.ok) { setStatus('error'); setError(data?.error?.message || `Error ${res.status}`); setLatencyMs(elapsed); return; }
      const txt = data?.choices?.[0]?.message?.content ?? '';
      setText(txt);
      setStatus('done');
      setLatencyMs(elapsed);
      const tk = data?.usage?.total_tokens ?? null;
      setTotalTokens(tk);
      onReport({ uid, status: 'done', latencyMs: elapsed, totalTokens: tk, liked: false, rating: 0, charCount: txt.length, text: txt });
    } catch (e: any) {
      if (e.name === 'AbortError' || runIdRef.current !== myRunId) return;
      setStatus('error'); setError(e?.message || 'Network error'); setLatencyMs(Date.now() - startRef.current);
    }
  }, [model, config, pushChunk, onReport, uid]);

  useEffect(() => {
    registerHandle(uid, { stop, run });
    return () => registerHandle(uid, null);
  }, [uid, stop, run, registerHandle]);

  useEffect(() => {
    if (config.runId > 0) run();
    return () => { controllerRef.current?.abort(); if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [config.runId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${model.id}-response.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleLike = () => {
    setLiked(v => {
      const next = !v;
      onReport({ uid, status, latencyMs, totalTokens, liked: next, rating, charCount: text.length, text });
      return next;
    });
  };

  const handleRate = (value: number) => {
    setRating(prev => {
      const next = prev === value ? 0 : value;
      onReport({ uid, status, latencyMs, totalTokens, liked, rating: next, charCount: text.length, text });
      return next;
    });
  };

  const elapsedLive = status === 'streaming' || status === 'connecting' ? Date.now() - startRef.current : latencyMs;
  const wordsPerSec = status === 'streaming' && elapsedLive ? (text.split(/\s+/).filter(Boolean).length / (elapsedLive / 1000)).toFixed(1) : null;
  const hasArtifact = showArtifacts && !!detectArtifact(text);

  return (
    <div className={`cmp-card cmp-fade-in group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-500 ${expanded ? 'fixed inset-2 sm:inset-6 z-[70]' : ''} ${
      status === 'streaming' ? 'border-blue-300/60 dark:border-blue-400/40 shadow-[0_0_0_1px_rgba(96,165,250,0.15),0_20px_60px_-15px_rgba(59,130,246,0.25)]'
      : status === 'error' ? 'border-rose-300/50 dark:border-rose-500/30 shadow-[0_10px_40px_-15px_rgba(244,63,94,0.2)]'
      : liked ? 'border-emerald-300/60 dark:border-emerald-500/40 shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_20px_50px_-18px_rgba(16,185,129,0.25)]'
      : 'border-white/50 dark:border-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]'
    } bg-white/70 dark:bg-zinc-950/60 backdrop-blur-2xl`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 20% 0%, currentColor 0.5px, transparent 0.5px)', backgroundSize: '14px 14px' }} />
      {status === 'streaming' && <div className="cmp-scanline pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-400/10 to-transparent" />}

      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-white/40 dark:border-white/5 flex-shrink-0">
        <ModelPicker value={model} onChange={onModelChange} exclude={exclude} disabled={status === 'streaming' || status === 'connecting'} />
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasArtifact && <span className="w-6 h-6 flex items-center justify-center rounded-lg text-blue-400 bg-blue-500/10"><FiCode className="w-3 h-3" /></span>}
          <button
            onClick={() => setShowStats(v => !v)}
            disabled={!text}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${showStats ? 'text-blue-500 bg-blue-500/10' : 'text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10'}`}
          >
            <FiTrendingUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => run()}
            disabled={status === 'streaming' || status === 'connecting'}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(v => !v)} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors duration-200">
            {expanded ? <FiMinimize2 className="w-3.5 h-3.5" /> : <FiMaximize2 className="w-3.5 h-3.5" />}
          </button>
          {canRemove && (
            <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors duration-200">
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-between px-3 py-2 border-b border-white/40 dark:border-white/5 flex-shrink-0">
        <StatusPill status={status} />
        <div className="flex items-center gap-2.5">
          {wordsPerSec && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-blue-400 tabular-nums">
              <FiActivity className="w-2.5 h-2.5" />{wordsPerSec}w/s
            </span>
          )}
          {elapsedLive != null && (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-zinc-400 tabular-nums">
              <FiClock className="w-2.5 h-2.5" />{elapsedLive < 1000 ? `${elapsedLive}ms` : `${(elapsedLive / 1000).toFixed(1)}s`}
            </span>
          )}
          {totalTokens != null && (
            <span className="flex items-center gap-0.5 text-[9px] font-semibold text-zinc-400 tabular-nums">
              <FiHash className="w-2.5 h-2.5" />{totalTokens}
            </span>
          )}
        </div>
      </div>

      <div ref={scrollRef} className={`relative flex-1 overflow-y-auto px-3.5 py-3 cmp-scroll ${expanded ? '' : 'min-h-[180px] max-h-[380px]'}`}>
        {status === 'idle' && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 gap-2">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${model.color} opacity-20 flex items-center justify-center`}>
              <FiCpu className="w-4 h-4 text-current" />
            </div>
            <p className="text-[10.5px] text-zinc-400 dark:text-zinc-600">Waiting to run</p>
          </div>
        )}
        {status === 'connecting' && !text && (
          <div className="space-y-2.5 pt-1">
            <div className="h-2.5 rounded-full bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 cmp-shimmer w-[85%]" />
            <div className="h-2.5 rounded-full bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 cmp-shimmer w-[70%]" />
            <div className="h-2.5 rounded-full bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 cmp-shimmer w-[92%]" />
          </div>
        )}
        {text && showStats && (
          <div className="cmp-pop grid grid-cols-3 gap-1.5 mb-2.5 pb-2.5 border-b border-zinc-100 dark:border-white/5">
            <div className="rounded-lg bg-zinc-50/80 dark:bg-white/[0.03] px-2 py-1.5 text-center">
              <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-100 tabular-nums">{text.length}</p>
              <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wide">Chars</p>
            </div>
            <div className="rounded-lg bg-zinc-50/80 dark:bg-white/[0.03] px-2 py-1.5 text-center">
              <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-100 tabular-nums">{text.split(/\s+/).filter(Boolean).length}</p>
              <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wide">Words</p>
            </div>
            <div className="rounded-lg bg-zinc-50/80 dark:bg-white/[0.03] px-2 py-1.5 text-center">
              <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-100 tabular-nums">{text.split(/[.!?]+/).filter(s => s.trim().length > 0).length}</p>
              <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wide">Sentences</p>
            </div>
          </div>
        )}
        {text && <MiniMarkdown text={text} showArtifacts={showArtifacts} />}
        {status === 'streaming' && text && <span className="inline-block w-[3px] h-3.5 bg-blue-400 cmp-caret align-middle ml-0.5 rounded-full" />}
        {status === 'error' && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-500/5 border border-rose-300/40 dark:border-rose-500/20 px-3 py-2.5 mt-1">
            <FiAlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-rose-600 dark:text-rose-400 leading-relaxed break-words">{error}</p>
          </div>
        )}
        {status === 'aborted' && !text && (
          <div className="h-full flex items-center justify-center py-8">
            <p className="text-[10.5px] text-zinc-400">Generation stopped</p>
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-between px-3 py-2 border-t border-white/40 dark:border-white/5 flex-shrink-0 gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleLike}
            disabled={!text}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[9px] font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${liked ? 'bg-emerald-500/15 text-emerald-500' : 'text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
          >
            <FiThumbsUp className={`w-3 h-3 transition-transform duration-200 ${liked ? 'fill-current scale-110' : ''}`} />
          </button>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => handleRate(v)} disabled={!text} className="disabled:opacity-20 disabled:cursor-not-allowed">
                <FiStar className={`w-3 h-3 transition-all duration-150 ${v <= rating ? 'text-amber-400 fill-amber-400 scale-105' : 'text-zinc-300 dark:text-zinc-700 hover:text-amber-300'}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleDownload} disabled={!text} className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-500/10 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed">
            <FiDownload className="w-3 h-3" />
          </button>
          <button onClick={handleCopy} disabled={!text} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-500/10 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed">
            {copied ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
});

function StatBar({ summaries, models, uids }: { summaries: Record<string, SlotSummary>; models: AnyModel[]; uids: string[] }) {
  const done = uids.map((uid, i) => ({ uid, model: models[i], s: summaries[uid] })).filter(x => x.s && x.s.status === 'done');
  if (done.length < 2) return null;
  const fastest = done.reduce((a, b) => ((a.s.latencyMs ?? Infinity) < (b.s.latencyMs ?? Infinity) ? a : b));
  const longest = done.reduce((a, b) => ((a.s.charCount ?? 0) > (b.s.charCount ?? 0) ? a : b));
  const rated = done.filter(x => x.s.rating > 0);
  const topRated = rated.length > 0 ? rated.reduce((a, b) => (a.s.rating > b.s.rating ? a : b)) : null;
  const maxLatency = Math.max(...done.map(x => x.s.latencyMs ?? 0), 1);

  return (
    <div className="cmp-fade-in bg-white/70 dark:bg-zinc-950/60 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-white/10 p-3.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5">
          <FiBarChart2 className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Latency comparison</span>
        </div>
        <div className="flex items-center gap-2.5">
          {topRated && (
            <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-500">
              <FiAward className="w-2.5 h-2.5" />Top rated: {topRated.model.name}
            </span>
          )}
          <span className="flex items-center gap-1 text-[9px] font-semibold text-zinc-400">
            <FiFileText className="w-2.5 h-2.5" />Longest: {longest.model.name}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {done.map(({ uid, model, s }) => {
          const pct = Math.max(6, ((s.latencyMs ?? 0) / maxLatency) * 100);
          const isFastest = uid === fastest.uid;
          return (
            <div key={uid} className="flex items-center gap-2">
              <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 w-20 truncate flex-shrink-0">{model.name}</span>
              <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden">
                <div className={`cmp-grow h-full rounded-full ${isFastest ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-[9px] font-bold tabular-nums w-12 text-right flex-shrink-0 ${isFastest ? 'text-emerald-500' : 'text-zinc-400'}`}>{(s.latencyMs ?? 0) < 1000 ? `${s.latencyMs}ms` : `${((s.latencyMs ?? 0) / 1000).toFixed(1)}s`}</span>
              {isFastest && <FiStar className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryPanel({ history, onSelect, onClear, onRemove }: { history: HistoryEntry[]; onSelect: (p: string) => void; onClear: () => void; onRemove: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      >
        <FiHistory className="w-3 h-3" />
        History
        {history.length > 0 && <span className="w-3.5 h-3.5 rounded-full bg-blue-400 text-white text-[8px] flex items-center justify-center font-bold">{history.length}</span>}
      </button>
      {open && (
        <div className="cmp-pop absolute top-full right-0 mt-2 w-[min(88vw,320px)] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100/80 dark:border-white/5">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Recent prompts</span>
            {history.length > 0 && (
              <button onClick={onClear} className="text-[9px] font-semibold text-rose-400 hover:text-rose-500 transition-colors">Clear all</button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 cmp-scroll">
            {history.length === 0 ? (
              <p className="text-center text-[10px] text-zinc-400 py-6">No history yet</p>
            ) : history.map(h => (
              <div key={h.id} className="group flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-white/5 transition-colors">
                <button onClick={() => { onSelect(h.prompt); setOpen(false); }} className="flex-1 min-w-0 text-left">
                  <p className="text-[10.5px] text-zinc-700 dark:text-zinc-300 truncate">{h.prompt}</p>
                  <p className="text-[8px] text-zinc-400">{new Date(h.timestamp).toLocaleTimeString()}</p>
                </button>
                <button onClick={() => onRemove(h.id)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 transition-all flex-shrink-0">
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [showArtifacts, setShowArtifacts] = useState(true);
  const [models, setModels] = useState<AnyModel[]>([TEXT_MODELS[5], TEXT_MODELS[9]]);
  const [uids, setUids] = useState<string[]>(['slot-a', 'slot-b']);
  const [runId, setRunId] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, SlotSummary>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const handlesRef = useRef<Record<string, SlotCardHandle>>({});
  const pendingRef = useRef(0);

  const usedIds = models.map(m => m.id);

  const registerHandle = useCallback((uid: string, handle: SlotCardHandle | null) => {
    if (handle) handlesRef.current[uid] = handle;
    else delete handlesRef.current[uid];
  }, []);

  const handleReport = useCallback((s: SlotSummary) => {
    setSummaries(prev => ({ ...prev, [s.uid]: s }));
    if (s.status === 'done' || s.status === 'error') {
      pendingRef.current = Math.max(0, pendingRef.current - 1);
      if (pendingRef.current === 0) setIsRunning(false);
    }
  }, []);

  const addSlot = () => {
    if (models.length >= 4) return;
    const next = TEXT_MODELS.find(m => !usedIds.includes(m.id)) ?? TEXT_MODELS[0];
    const uid = `slot-${Date.now()}`;
    setModels(prev => [...prev, next]);
    setUids(prev => [...prev, uid]);
  };

  const removeSlot = (idx: number) => {
    setModels(prev => prev.filter((_, i) => i !== idx));
    setUids(prev => prev.filter((_, i) => i !== idx));
  };

  const changeSlotModel = (idx: number, m: AnyModel) => {
    setModels(prev => prev.map((mm, i) => (i === idx ? m : mm)));
  };

  const shuffleModels = () => {
    if (isRunning) return;
    const pool = [...TEXT_MODELS].sort(() => Math.random() - 0.5);
    const picked: AnyModel[] = [];
    for (const m of pool) {
      if (picked.length >= models.length) break;
      if (!picked.find(p => p.id === m.id)) picked.push(m);
    }
    setModels(picked);
  };

  const runAll = () => {
    if (!apiKey.trim()) { setError('Please enter your API key'); return; }
    if (!prompt.trim()) { setError('Please enter a prompt'); return; }
    setError(null);
    setSummaries({});
    pendingRef.current = uids.length;
    setIsRunning(true);
    setRunId(id => id + 1);
    setHistory(prev => {
      const filtered = prev.filter(h => h.prompt !== prompt.trim());
      return [{ id: `h-${Date.now()}`, prompt: prompt.trim(), timestamp: Date.now() }, ...filtered].slice(0, 12);
    });
  };

  const stopAll = () => {
    Object.values(handlesRef.current).forEach(h => h.stop());
    pendingRef.current = 0;
    setIsRunning(false);
  };

  const resetAll = () => {
    setRunId(0);
    setSummaries({});
    setError(null);
    setUids(prev => prev.map((_, i) => `slot-${Date.now()}-${i}`));
  };

  const exportResults = () => {
    const lines: string[] = [`# Model Comparison`, ``, `**Prompt:** ${prompt}`, ``];
    if (systemPrompt.trim()) lines.push(`**System prompt:** ${systemPrompt}`, ``);
    models.forEach((m, i) => {
      const s = summaries[uids[i]];
      lines.push(`## ${m.name}`, ``);
      if (s) {
        lines.push(`- Latency: ${s.latencyMs ?? '-'}ms`, `- Tokens: ${s.totalTokens ?? '-'}`, `- Rating: ${s.rating > 0 ? `${s.rating}/5` : 'not rated'}`, `- Marked best: ${s.liked ? 'Yes' : 'No'}`, ``, s.text || '_no response_', ``);
      } else {
        lines.push('_not run_', ``);
      }
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `comparison-${Date.now()}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const config: RunConfig = useMemo(() => ({ prompt, systemPrompt, temperature, maxTokens, apiKey, runId }), [prompt, systemPrompt, temperature, maxTokens, apiKey, runId]);

  const gridCols = models.length <= 2 ? 'sm:grid-cols-2' : models.length === 3 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4';
  const anyDone = Object.values(summaries).some(s => s.status === 'done');

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0 w-full max-w-full">
      <style>{`
        @keyframes cmpFadeIn { from { opacity: 0; transform: translateY(8px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cmpPop { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cmpPing { 0% { transform: scale(1); opacity: 0.7; } 75%, 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes cmpShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes cmpCaretBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes cmpRunGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(96,165,250,0.4), 0 8px 24px -8px rgba(59,130,246,0.5); } 50% { box-shadow: 0 0 0 8px rgba(96,165,250,0), 0 8px 24px -8px rgba(59,130,246,0.5); } }
        @keyframes cmpScanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(400%); } }
        @keyframes cmpGrow { from { width: 0; } }
        @keyframes cmpFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .cmp-fade-in { animation: cmpFadeIn 0.4s cubic-bezier(0.16,1,0.3,1); }
        .cmp-pop { animation: cmpPop 0.18s cubic-bezier(0.16,1,0.3,1); transform-origin: top; }
        .cmp-ping { animation: cmpPing 1.4s cubic-bezier(0,0,0.2,1) infinite; }
        .cmp-shimmer { background-size: 200% 100%; animation: cmpShimmer 1.6s ease-in-out infinite; }
        .cmp-caret { animation: cmpCaretBlink 0.8s step-start infinite; }
        .cmp-run-active { animation: cmpRunGlow 2s ease-in-out infinite; }
        .cmp-scanline { animation: cmpScanline 2.5s ease-in-out infinite; }
        .cmp-grow { animation: cmpGrow 0.8s cubic-bezier(0.16,1,0.3,1); }
        .cmp-float { animation: cmpFloat 4s ease-in-out infinite; }
        .cmp-card { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
        .cmp-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .cmp-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 999px; }
        .cmp-scroll::-webkit-scrollbar-track { background: transparent; }
        @media (prefers-reduced-motion: reduce) {
          .cmp-fade-in, .cmp-pop, .cmp-ping, .cmp-shimmer, .cmp-caret, .cmp-run-active, .cmp-scanline, .cmp-grow, .cmp-float, .cmp-card { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white tracking-tight">Compare Models</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Run one prompt across multiple models side by side</p>
        </div>
        <div className="flex items-center gap-2">
          <HistoryPanel
            history={history}
            onSelect={p => setPrompt(p)}
            onClear={() => setHistory([])}
            onRemove={id => setHistory(prev => prev.filter(h => h.id !== id))}
          />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10">
            <div className={`relative w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-blue-400' : 'bg-emerald-500'}`}>
              {isRunning && <span className="absolute inset-0 rounded-full bg-blue-400 cmp-ping" />}
            </div>
            <span className={`text-[10px] font-bold ${isRunning ? 'text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{isRunning ? 'Running' : 'Live'}</span>
          </div>
        </div>
      </div>

      <div className="relative bg-white/70 dark:bg-zinc-950/60 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-white/10 p-3.5 sm:p-4 space-y-3.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl cmp-float" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FiSettings className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Shared configuration</span>
          </div>
          <button
            onClick={() => setShowArtifacts(v => !v)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-colors duration-200 ${showArtifacts ? 'bg-blue-500/10 text-blue-500 dark:text-blue-300' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
          >
            <FiLayers className="w-3 h-3" />
            Live preview
          </button>
        </div>

        <div className="relative grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="acv-••••••••••••••••"
                className="w-full pr-9 px-3 py-2.5 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/10 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-300 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-blue-300/20 outline-none transition-all"
              />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                {showKey ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
              </button>
            </div>
            {keys && keys.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {keys.filter(k => k.is_active).slice(0, 3).map(k => (
                  <button key={k.key} onClick={() => setApiKey(k.key)} className="text-[9px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-300 border border-blue-400/20 hover:bg-blue-500/20 transition-colors font-semibold">{k.name}</button>
                ))}
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setShowSystem(!showSystem)} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-1">
              <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${showSystem ? 'rotate-180' : ''}`} />
              System prompt <span className="text-[9px] font-normal text-zinc-400">(optional, applied to all)</span>
            </button>
            {showSystem ? (
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                rows={2}
                placeholder="You are a helpful assistant..."
                className="cmp-pop w-full px-3 py-2.5 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/10 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-300 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-blue-300/20 outline-none transition-all resize-none"
              />
            ) : (
              <div className="h-[42px] flex items-center px-3 text-[10px] text-zinc-400">No system prompt set</div>
            )}
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1"><FiSliders className="w-3 h-3" />Temperature</label>
              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-300 tabular-nums">{temperature.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-1 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-800 accent-blue-400 cursor-pointer" />
            <div className="flex justify-between mt-0.5"><span className="text-[8px] text-zinc-400">Precise</span><span className="text-[8px] text-zinc-400">Creative</span></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1"><FiTarget className="w-3 h-3" />Max Tokens</label>
              <span className="text-[10px] font-bold text-blue-500 dark:text-blue-300 tabular-nums">{maxTokens}</span>
            </div>
            <input type="range" min="64" max="4096" step="64" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} className="w-full h-1 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-800 accent-blue-400 cursor-pointer" />
            <div className="flex justify-between mt-0.5"><span className="text-[8px] text-zinc-400">64</span><span className="text-[8px] text-zinc-400">4096</span></div>
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400">Prompt</label>
            <span className="hidden sm:flex items-center gap-1 text-[9px] text-zinc-400 font-medium">
              <FiCommand className="w-2.5 h-2.5" />Enter to run
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {PROMPT_TEMPLATES.map(t => (
              <button
                key={t.label}
                onClick={() => setPrompt(t.prompt)}
                className="text-[9px] font-semibold px-2 py-1 rounded-full bg-zinc-100/80 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-blue-500/10 hover:text-blue-500 dark:hover:text-blue-300 border border-transparent hover:border-blue-400/20 transition-all duration-150"
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); runAll(); } }}
            rows={3}
            placeholder="Ask something to compare across models..."
            className="w-full px-3 py-2.5 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-white/50 dark:border-white/10 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-300 dark:focus:border-blue-400/50 focus:ring-2 focus:ring-blue-300/20 outline-none transition-all resize-none"
          />
        </div>

        {error && (
          <div className="relative flex items-start gap-1.5 rounded-xl bg-rose-500/5 border border-rose-300/40 dark:border-rose-500/20 px-3 py-2.5 cmp-fade-in">
            <FiAlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-rose-600 dark:text-rose-400 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="relative flex items-center gap-2 pt-0.5">
          <button
            onClick={isRunning ? stopAll : runAll}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold text-white transition-all duration-300 ${isRunning ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 cmp-run-active'}`}
          >
            {isRunning ? <FiSquare className="w-3 h-3" /> : <FiPlay className="w-3 h-3" />}
            {isRunning ? 'Stop all' : `Run on ${models.length} model${models.length > 1 ? 's' : ''}`}
          </button>
          <button
            onClick={resetAll}
            disabled={isRunning}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiRotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={shuffleModels}
            disabled={isRunning}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiShuffle className="w-3 h-3" />
          </button>
          {anyDone && (
            <button
              onClick={exportResults}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold text-blue-500 dark:text-blue-300 bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/20 transition-colors duration-200"
            >
              <FiSave className="w-3 h-3" />
            </button>
          )}
          {models.length < 4 && (
            <button
              onClick={addSlot}
              disabled={isRunning}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold text-blue-500 dark:text-blue-300 bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/20 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiPlus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>
      </div>

      <StatBar summaries={summaries} models={models} uids={uids} />

      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        {models.map((model, idx) => (
          <SlotCard
            key={uids[idx]}
            uid={uids[idx]}
            model={model}
            config={config}
            exclude={usedIds}
            canRemove={models.length > 2}
            showArtifacts={showArtifacts}
            onModelChange={m => changeSlotModel(idx, m)}
            onRemove={() => removeSlot(idx)}
            onReport={handleReport}
            registerHandle={registerHandle}
          />
        ))}
      </div>
    </div>
  );
}
