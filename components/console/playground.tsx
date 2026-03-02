import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  FiPlay, FiCopy, FiCheck, FiChevronDown, FiZap, FiCode, FiTerminal,
  FiClock, FiCpu, FiAlertCircle, FiRotateCcw, FiEye, FiEyeOff, FiImage,
  FiVolume2, FiDownload, FiPause, FiX, FiUpload, FiMaximize2, FiMinimize2,
  FiLayout, FiSearch, FiRefreshCw, FiExternalLink, FiChevronRight
} from 'react-icons/fi';
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiAirbrake, SiFlux, SiLapce, SiSecurityscorecard } from 'react-icons/si';
import { GiSpermWhale, GiPowerLightning, GiClover, GiCloverSpiked, GiFire } from 'react-icons/gi';
import { TbSquareLetterZ, TbLetterM, TbBrandJavascript, TbBrandPython, TbBrandGolang, TbBrandRust, TbBrandHtml5, TbBrandCss3 } from 'react-icons/tb';
import { FaXTwitter } from 'react-icons/fa6';

const BASE = 'https://www.aichixia.xyz';

const VISION_IDS = new Set(['gpt-5.2', 'gemini-3-flash', 'aichixia-flash', 'grok-4-fast']);

type ModelType = 'text' | 'image' | 'tts';

interface AnyModel {
  id: string;
  name: string;
  provider: string;
  icon: any;
  gradient: string;
  pricing: 'Premium' | 'Standard' | 'Budget';
  context: string;
  type: ModelType;
  endpoint: string;
  requiresPro?: boolean;
  limited?: boolean;
}

const TEXT_MODELS: AnyModel[] = [
  { id: 'aichixia-flash', name: 'Aichixia 114B', provider: 'Aichixia', icon: SiAirbrake, gradient: 'from-blue-500 to-indigo-700', pricing: 'Standard', context: '256K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', icon: GiSpermWhale, gradient: 'from-cyan-400 to-blue-600', pricing: 'Premium', context: '128K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'deepseek-v3.1', name: 'DeepSeek V3.1', provider: 'DeepSeek', icon: GiSpermWhale, gradient: 'from-cyan-500 to-teal-600', pricing: 'Standard', context: '128K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', icon: SiAnthropic, gradient: 'from-orange-400 to-rose-600', pricing: 'Premium', context: '200K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google', icon: SiGooglegemini, gradient: 'from-violet-500 to-purple-700', pricing: 'Budget', context: '1M', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', icon: SiOpenai, gradient: 'from-emerald-400 to-green-600', pricing: 'Budget', context: '400K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'Moonshot', icon: GiCloverSpiked, gradient: 'from-sky-400 to-blue-600', pricing: 'Premium', context: '256K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'glm-4.7', name: 'GLM 4.7', provider: 'Zhipu', icon: TbSquareLetterZ, gradient: 'from-blue-600 to-indigo-800', pricing: 'Standard', context: '200K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'mistral-3.1', name: 'Mistral 3.1', provider: 'Mistral AI', icon: TbLetterM, gradient: 'from-amber-400 to-orange-600', pricing: 'Standard', context: '128K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'qwen3-235b', name: 'Qwen3 235B', provider: 'Alibaba', icon: SiAlibabacloud, gradient: 'from-fuchsia-500 to-pink-600', pricing: 'Premium', context: '256K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'qwen3-coder-480b', name: 'Qwen3 Coder 480B', provider: 'Alibaba', icon: SiAlibabacloud, gradient: 'from-purple-500 to-fuchsia-700', pricing: 'Premium', context: '256K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'minimax-m2.1', name: 'MiniMax M2.1', provider: 'MiniMax', icon: GiClover, gradient: 'from-cyan-500 to-blue-700', pricing: 'Premium', context: '200K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', icon: SiMeta, gradient: 'from-blue-500 to-indigo-700', pricing: 'Standard', context: '130K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'OpenAI', icon: SiOpenai, gradient: 'from-pink-500 to-rose-700', pricing: 'Budget', context: '128K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'mimo-v2-flash', name: 'MiMo V2 Flash', provider: 'Xiaomi', icon: FiZap, gradient: 'from-blue-500 to-violet-700', pricing: 'Budget', context: '256K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'groq-compound', name: 'Groq Compound', provider: 'Groq', icon: GiPowerLightning, gradient: 'from-orange-500 to-red-700', pricing: 'Standard', context: '131K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'cohere-command-a', name: 'Cohere Command A', provider: 'Cohere', icon: GiClover, gradient: 'from-emerald-500 to-teal-700', pricing: 'Standard', context: '256K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'grok-3', name: 'Grok 3', provider: 'xAI', icon: FaXTwitter, gradient: 'from-zinc-500 to-slate-700', pricing: 'Premium', context: '1M', type: 'text', endpoint: `${BASE}/api/v1/chat/completions` },
  { id: 'grok-4-fast', name: 'Grok 4 Fast', provider: 'xAI', icon: FaXTwitter, gradient: 'from-zinc-600 to-slate-900', pricing: 'Premium', context: '2M', type: 'text', endpoint: `${BASE}/api/v1/chat/completions`, requiresPro: true },
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', icon: SiOpenai, gradient: 'from-green-400 to-emerald-700', pricing: 'Standard', context: '400K', type: 'text', endpoint: `${BASE}/api/v1/chat/completions`, limited: true },
];

const IMAGE_MODELS: AnyModel[] = [
  { id: 'flux', name: 'Flux 2', provider: 'Black Forest', icon: SiFlux, gradient: 'from-purple-500 to-pink-600', pricing: 'Standard', context: '—', type: 'image', endpoint: `${BASE}/api/models/flux` },
  { id: 'lucid', name: 'Lucid Origin', provider: 'Lucid', icon: FiImage, gradient: 'from-teal-500 to-cyan-600', pricing: 'Standard', context: '—', type: 'image', endpoint: `${BASE}/api/models/lucid` },
  { id: 'phoenix', name: 'Phoenix 1.0', provider: 'Phoenix', icon: GiFire, gradient: 'from-red-500 to-orange-600', pricing: 'Budget', context: '—', type: 'image', endpoint: `${BASE}/api/models/phoenix` },
  { id: 'nano', name: 'Nano Banana Pro', provider: 'Nano', icon: SiGooglegemini, gradient: 'from-yellow-400 to-orange-500', pricing: 'Budget', context: '—', type: 'image', endpoint: `${BASE}/api/models/nano` },
];

const TTS_MODELS: AnyModel[] = [
  { id: 'lindsay', name: 'Lindsay TTS', provider: 'Aichixia', icon: SiLapce, gradient: 'from-rose-500 to-pink-600', pricing: 'Standard', context: '—', type: 'tts', endpoint: `${BASE}/api/models/lindsay` },
  { id: 'starling', name: 'Starling TTS', provider: 'Aichixia', icon: SiSecurityscorecard, gradient: 'from-violet-500 to-purple-700', pricing: 'Standard', context: '—', type: 'tts', endpoint: `${BASE}/api/models/starling` },
];

const PRICING_CHIP: Record<string, string> = {
  Premium: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  Standard: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Budget: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

type Lang = 'typescript' | 'python' | 'curl' | 'ruby' | 'go' | 'php';

const LANGS: { id: Lang; label: string; icon: any }[] = [
  { id: 'typescript', label: 'TypeScript', icon: TbBrandJavascript },
  { id: 'python', label: 'Python', icon: TbBrandPython },
  { id: 'curl', label: 'cURL', icon: FiTerminal },
  { id: 'ruby', label: 'Ruby', icon: FiCode },
  { id: 'go', label: 'Go', icon: TbBrandGolang },
  { id: 'php', label: 'PHP', icon: FiCode },
];

type ArtifactLang = 'html' | 'svg' | 'javascript' | 'css' | 'react' | 'markdown';

const ARTIFACT_LANGS: Set<ArtifactLang> = new Set(['html', 'svg', 'javascript', 'css', 'react', 'markdown']);

interface ArtifactData {
  type: ArtifactLang;
  content: string;
  title: string;
}

interface UploadedImage {
  file: File;
  base64: string;
  preview: string;
  mimeType: string;
}

type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'fn' | 'op' | 'plain';

const KW: Record<string, string[]> = {
  typescript: ['import','from','const','let','var','async','await','new','return','function','export','default','true','false','null','undefined','typeof','interface','type','class','extends'],
  python: ['import','from','def','class','return','with','as','await','async','True','False','None','print','if','else','elif','for','while','in','not','and','or','lambda'],
  curl: ['curl','POST','GET','PUT','DELETE','PATCH'],
  ruby: ['require','def','end','puts','do','class','module','return','true','false','nil','if','else','then'],
  go: ['package','import','func','return','var','const','type','struct','true','false','nil','if','else','for','map','range','make','new'],
  php: ['echo','require_once','true','false','null','new','return','function','class','if','else','foreach','use'],
};

const TC: Record<TokenType, string> = {
  keyword: '#60a5fa',
  string: '#34d399',
  number: '#fb923c',
  comment: '#6b7280',
  fn: '#38bdf8',
  op: '#94a3b8',
  plain: '#e2e8f0',
};

function tokenize(line: string, lang: string): Array<{ t: TokenType; v: string }> {
  const kwSet = new Set(KW[lang] ?? []);
  const out: Array<{ t: TokenType; v: string }> = [];
  let i = 0;
  const isCommentStart = (s: string) => {
    if (['typescript','go','php'].includes(lang) && s.startsWith('//')) return true;
    if (['python','ruby','curl'].includes(lang) && s[0] === '#') return true;
    return false;
  };
  while (i < line.length) {
    const rest = line.slice(i);
    if (isCommentStart(rest)) { out.push({ t: 'comment', v: rest }); break; }
    if (rest[0] === '"' || rest[0] === "'" || rest[0] === '`') {
      const q = rest[0]; let j = 1;
      while (j < rest.length) { if (rest[j] === '\\') { j += 2; continue; } if (rest[j] === q) { j++; break; } j++; }
      out.push({ t: 'string', v: rest.slice(0, j) }); i += j; continue;
    }
    const nm = rest.match(/^\d+\.?\d*/);
    if (nm && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1]))) { out.push({ t: 'number', v: nm[0] }); i += nm[0].length; continue; }
    const wm = rest.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wm) {
      const w = wm[0]; const after = line[i + w.length];
      out.push({ t: kwSet.has(w) ? 'keyword' : after === '(' ? 'fn' : 'plain', v: w });
      i += w.length; continue;
    }
    const om = rest.match(/^[{}[\]().,;:=<>!+\-*/%&|^~?\\@]+/);
    if (om) { out.push({ t: 'op', v: om[0] }); i += om[0].length; continue; }
    out.push({ t: 'plain', v: rest[0] }); i++;
  }
  return out;
}

function buildArtifactDoc(artifact: ArtifactData): string {
  const { type, content } = artifact;
  if (type === 'html') return content;
  if (type === 'svg') return `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;">${content}</body></html>`;
  if (type === 'react') {
    return `<!DOCTYPE html><html><head>
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>body{margin:0;padding:16px;background:#0f172a;color:#e2e8f0;font-family:sans-serif}</style>
</head><body><div id="root"></div>
<script type="text/babel">
${content}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
</script></body></html>`;
  }
  if (type === 'javascript') {
    return `<!DOCTYPE html><html><head><style>body{margin:0;padding:16px;background:#0f172a;color:#e2e8f0;font-family:monospace;font-size:13px}#out{white-space:pre-wrap}</style></head>
<body><div id="out"></div><script>
const _c=console.log;const _out=document.getElementById('out');
console.log=(...a)=>{_out.textContent+=a.join(' ')+'\\n';_c(...a)};
try{${content}}catch(e){_out.textContent+='Error: '+e.message}
</script></body></html>`;
  }
  if (type === 'css') {
    return `<!DOCTYPE html><html><head><style>body{margin:0;padding:24px;background:#0f172a;color:#e2e8f0}${content}</style></head>
<body><h1 class="demo">CSS Preview</h1><p class="demo">The quick brown fox jumps over the lazy dog.</p><button class="demo">Button Demo</button><div class="demo box"></div></body></html>`;
  }
  if (type === 'markdown') {
    return `<!DOCTYPE html><html><head>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>body{margin:0;padding:24px;background:#0f172a;color:#e2e8f0;font-family:sans-serif;max-width:720px}
h1,h2,h3{color:#60a5fa}code{background:#1e293b;padding:2px 6px;border-radius:4px;font-size:0.875em}
pre{background:#1e293b;padding:12px;border-radius:8px;overflow-x:auto}
a{color:#38bdf8}blockquote{border-left:3px solid #3b82f6;margin:0;padding-left:16px;color:#94a3b8}</style>
</head><body id="out"></body>
<script>document.getElementById('out').innerHTML=marked.parse(${JSON.stringify(content)})</script></html>`;
  }
  return content;
}

function detectAllArtifacts(text: string): ArtifactData[] {
  const out: ArtifactData[] = [];
  const rx = /```(html|svg|javascript|js|jsx|react|css|markdown|md)\n([\s\S]*?)```/gi;
  const map: Record<string, ArtifactLang> = { html: 'html', svg: 'svg', javascript: 'javascript', js: 'javascript', jsx: 'react', react: 'react', css: 'css', markdown: 'markdown', md: 'markdown' };
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text)) !== null) {
    const type = map[m[1].toLowerCase()];
    if (type) out.push({ type, content: m[2].trim(), title: `${type.toUpperCase()} Preview` });
  }
  return out;
}

function detectArtifact(text: string): ArtifactData | null {
  return detectAllArtifacts(text)[0] ?? null;
}

const ARTIFACT_LANG_COLORS: Record<ArtifactLang, string> = {
  html: 'from-orange-500 to-red-500',
  svg: 'from-pink-500 to-fuchsia-600',
  javascript: 'from-yellow-400 to-amber-500',
  css: 'from-blue-500 to-indigo-600',
  react: 'from-cyan-400 to-blue-500',
  markdown: 'from-slate-500 to-zinc-600',
};

const ARTIFACT_LANG_ICONS: Record<ArtifactLang, any> = {
  html: TbBrandHtml5,
  svg: FiImage,
  javascript: TbBrandJavascript,
  css: TbBrandCss3,
  react: FiCode,
  markdown: FiLayout,
};

const ARTIFACT_LANG_DESCRIPTIONS: Record<ArtifactLang, string> = {
  html: 'Full HTML page rendered in iframe with scripts',
  svg: 'SVG graphic displayed on dark background',
  javascript: 'JS executed with console.log output capture',
  css: 'CSS applied to demo elements for live preview',
  react: 'React component via CDN + Babel transpilation',
  markdown: 'Markdown rendered with syntax highlighting',
};

interface ArtifactViewerProps {
  artifact: ArtifactData;
  onClose: () => void;
  onRefresh: () => void;
}

function ArtifactViewer({ artifact, onClose, onRefresh }: ArtifactViewerProps) {
  const [fs, setFs] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const srcDoc = useMemo(() => buildArtifactDoc(artifact), [artifact]);
  const TypeIcon = ARTIFACT_LANG_ICONS[artifact.type];
  const typeGrad = ARTIFACT_LANG_COLORS[artifact.type];
  const typeDesc = ARTIFACT_LANG_DESCRIPTIONS[artifact.type];

  const doRefresh = () => { setLoaded(false); setFrameKey(k => k + 1); onRefresh(); };

  const wrapStyle: React.CSSProperties = fs
    ? { position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#07090f' }
    : { borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 12px 48px rgba(0,0,0,0.5)', width: '100%', maxWidth: '100%', boxSizing: 'border-box' };

  return (
    <div style={wrapStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(9,13,24,0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {[
            { bg: 'rgba(239,68,68,0.75)', hover: '#ef4444', action: onClose, icon: <FiX style={{ width: 6, height: 6, color: '#450a0a' }} /> },
            { bg: 'rgba(234,179,8,0.5)', hover: 'rgba(234,179,8,0.5)', action: undefined, icon: null },
            { bg: 'rgba(34,197,94,0.75)', hover: '#22c55e', action: () => setFs(f => !f), icon: fs ? <FiMinimize2 style={{ width: 6, height: 6, color: '#052e16' }} /> : <FiMaximize2 style={{ width: 6, height: 6, color: '#052e16' }} /> },
          ].map((btn, bi) => (
            <button key={bi} onClick={btn.action}
              style={{ width: 12, height: 12, borderRadius: '50%', background: btn.bg, border: 'none', cursor: btn.action ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.15s', flexShrink: 0 }}
              onMouseEnter={e => { if (btn.action) { e.currentTarget.style.background = btn.hover; if (btn.icon) (e.currentTarget.querySelector('svg') as HTMLElement).style.opacity = '1'; } }}
              onMouseLeave={e => { if (btn.action) { e.currentTarget.style.background = btn.bg; if (btn.icon) (e.currentTarget.querySelector('svg') as HTMLElement).style.opacity = '0'; } }}
            >
              {btn.icon && <span style={{ opacity: 0, transition: 'opacity 0.1s' }}>{btn.icon}</span>}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ width: 16, height: 16, borderRadius: 5, background: `linear-gradient(135deg, ${typeGrad.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TypeIcon style={{ width: 9, height: 9, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artifact.title}</span>
        </div>

        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button
            onClick={() => setShowInfo(s => !s)}
            style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid', borderColor: showInfo ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)', background: showInfo ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showInfo ? '#60a5fa' : 'rgba(255,255,255,0.25)', transition: 'all 0.15s' }}
            title="Runtime info"
          >
            <FiCpu style={{ width: 11, height: 11 }} />
          </button>
          <button
            onClick={doRefresh}
            style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', transition: 'all 0.15s' }}
            title="Refresh"
          >
            <FiRefreshCw style={{ width: 11, height: 11 }} />
          </button>
        </div>
      </div>

      {showInfo && (
        <div style={{ padding: '7px 14px', background: 'rgba(59,130,246,0.04)', borderBottom: '1px solid rgba(59,130,246,0.07)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', animation: 'fadeIn 0.15s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: `linear-gradient(135deg, ${typeGrad.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TypeIcon style={{ width: 8, height: 8, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.05em' }}>{artifact.type.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 9, color: '#1e293b' }}>·</span>
          <span style={{ fontSize: 10, color: '#475569', flex: 1 }}>{typeDesc}</span>
        </div>
      )}

      <div style={{ position: 'relative', background: '#07090f', flex: fs ? 1 : undefined }} className="art-viewport">
        <style>{`
          .art-viewport { height: 220px; }
          @media (min-width: 480px) { .art-viewport { height: 280px !important; } }
          @media (min-width: 768px) { .art-viewport { height: 340px !important; } }
        `}</style>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 2 }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.1)' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#3b82f6', animation: 'spin 0.7s linear infinite' }} />
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>Rendering {artifact.type}...</span>
          </div>
        )}
        <iframe
          key={frameKey}
          srcDoc={srcDoc}
          style={{ width: '100%', height: '100%', border: 'none', opacity: loaded ? 1 : 0, transition: 'opacity 0.35s ease', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          onLoad={() => setLoaded(true)}
          title={artifact.title}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 14px', background: 'rgba(0,0,0,0.35)', borderTop: '1px solid rgba(255,255,255,0.03)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: loaded ? '#22c55e' : '#f59e0b', boxShadow: loaded ? '0 0 5px rgba(34,197,94,0.4)' : '0 0 5px rgba(245,158,11,0.4)', transition: 'all 0.3s' }} />
          <span style={{ fontSize: 9, fontWeight: 600, color: loaded ? '#22c55e' : '#f59e0b', transition: 'color 0.3s' }}>{loaded ? 'Ready' : 'Loading'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 8, color: '#1e293b' }}>Sandboxed · {artifact.type}</span>
        </div>
      </div>
    </div>
  );
}

function generateCode(lang: Lang, model: AnyModel, msg: string, key: string, temp: number, maxTok: number): string {
  const k = key || 'YOUR_API_KEY';
  const m = msg.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').slice(0, 100);

  if (model.type === 'image') {
    if (lang === 'typescript') return `const res = await fetch("${model.endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${k}",
  },
  body: JSON.stringify({ prompt: "${m}", steps: 4 }),
});
const { imageBase64 } = await res.json();`;
    if (lang === 'python') return `import requests
res = requests.post(
    "${model.endpoint}",
    headers={"Authorization": "Bearer ${k}"},
    json={"prompt": "${m}", "steps": 4},
)
print(res.json()["imageBase64"])`;
    if (lang === 'curl') return `curl -X POST ${model.endpoint} \\
  -H "Authorization: Bearer ${k}" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"${m}","steps":4}'`;
    if (lang === 'ruby') return `require "net/http"; require "json"
uri = URI("${model.endpoint}")
res = Net::HTTP.post(uri, {prompt:"${m}",steps:4}.to_json,
  "Content-Type"=>"application/json","Authorization"=>"Bearer ${k}")
puts JSON.parse(res.body)["imageBase64"]`;
    if (lang === 'go') return `package main
import ("bytes";"encoding/json";"fmt";"net/http";"io")
func main() {
  b,_:=json.Marshal(map[string]any{"prompt":"${m}","steps":4})
  req,_:=http.NewRequest("POST","${model.endpoint}",bytes.NewBuffer(b))
  req.Header.Set("Authorization","Bearer ${k}")
  req.Header.Set("Content-Type","application/json")
  resp,_:=http.DefaultClient.Do(req)
  defer resp.Body.Close()
  body,_:=io.ReadAll(resp.Body)
  fmt.Println(string(body))
}`;
    if (lang === 'php') return `<?php
$ch = curl_init("${model.endpoint}");
curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_POST=>true,
  CURLOPT_HTTPHEADER=>["Content-Type: application/json","Authorization: Bearer ${k}"],
  CURLOPT_POSTFIELDS=>json_encode(["prompt"=>"${m}","steps"=>4])]);
$r=json_decode(curl_exec($ch),true);
echo $r["imageBase64"];`;
    return '';
  }

  if (model.type === 'tts') {
    const body = `{"text":"${m}","emotion":"normal","volume":100,"pitch":0,"tempo":1}`;
    if (lang === 'typescript') return `const res = await fetch("${model.endpoint}", {
  method: "POST",
  headers: { "Authorization": "Bearer ${k}", "Content-Type": "application/json" },
  body: JSON.stringify({ text: "${m}", emotion: "normal", volume: 100, pitch: 0, tempo: 1 }),
});
const { audio } = await res.json();`;
    if (lang === 'python') return `import requests
res = requests.post("${model.endpoint}",
  headers={"Authorization":"Bearer ${k}"},
  json={"text":"${m}","emotion":"normal","volume":100,"pitch":0,"tempo":1})
print(res.json()["audio"])`;
    if (lang === 'curl') return `curl -X POST ${model.endpoint} \\
  -H "Authorization: Bearer ${k}" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`;
    return `// See TypeScript/Python/cURL examples above`;
  }

  if (lang === 'typescript') return `import OpenAI from "openai";
const client = new OpenAI({
  apiKey: "${k}",
  baseURL: "${BASE}/api/v1",
});
const res = await client.chat.completions.create({
  model: "${model.id}",
  messages: [{ role: "user", content: "${m}" }],
  temperature: ${temp},
  max_tokens: ${maxTok},
});
console.log(res.choices[0].message.content);`;

  if (lang === 'python') return `from openai import OpenAI
client = OpenAI(api_key="${k}", base_url="${BASE}/api/v1")
res = client.chat.completions.create(
  model="${model.id}",
  messages=[{"role":"user","content":"${m}"}],
  temperature=${temp},
  max_tokens=${maxTok},
)
print(res.choices[0].message.content)`;

  if (lang === 'curl') return `curl -X POST ${BASE}/api/v1/chat/completions \\
  -H "Authorization: Bearer ${k}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "messages": [{"role":"user","content":"${m}"}],
    "temperature": ${temp},
    "max_tokens": ${maxTok}
  }'`;

  if (lang === 'ruby') return `require "openai"
client = OpenAI::Client.new(access_token:"${k}", uri_base:"${BASE}/api/v1")
res = client.chat(parameters:{
  model:"${model.id}",
  messages:[{role:"user",content:"${m}"}],
  temperature:${temp}, max_tokens:${maxTok}
})
puts res.dig("choices",0,"message","content")`;

  if (lang === 'go') return `package main
import ("context";"fmt";openai "github.com/sashabaranov/go-openai")
func main() {
  cfg := openai.DefaultConfig("${k}")
  cfg.BaseURL = "${BASE}/api/v1"
  c := openai.NewClientWithConfig(cfg)
  r,_ := c.CreateChatCompletion(context.Background(),
    openai.ChatCompletionRequest{
      Model: "${model.id}",
      Messages: []openai.ChatCompletionMessage{{Role:"user",Content:"${m}"}},
      Temperature: ${temp}, MaxTokens: ${maxTok},
    })
  fmt.Println(r.Choices[0].Message.Content)
}`;

  if (lang === 'php') return `<?php
require_once 'vendor/autoload.php';
$client = OpenAI::factory()->withApiKey('${k}')->withBaseUri('${BASE}/api/v1')->make();
$res = $client->chat()->create([
  'model' => '${model.id}',
  'messages' => [['role'=>'user','content'=>'${m}']],
  'temperature' => ${temp}, 'max_tokens' => ${maxTok},
]);
echo $res->choices[0]->message->content;`;
  return '';
}

interface MDProps {
  text: string;
  onCopy: (t: string, id: string) => void;
  copied: string | null;
  onArtifact: (a: ArtifactData) => void;
}

function renderInline(str: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const rx = /(`[^`\n]+`|\*\*([^*]+)\*\*|\*([^*\n]+)\*|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = rx.exec(str)) !== null) {
    if (m.index > last) out.push(str.slice(last, m.index));
    const raw = m[0]; const k2 = `${key}-${m.index}`;
    if (raw[0] === '`') out.push(<code key={k2} style={{ background: 'rgba(96,165,250,0.1)', color: '#93c5fd', fontFamily: 'ui-monospace,monospace', fontSize: '0.85em', padding: '2px 5px', borderRadius: 4, border: '1px solid rgba(96,165,250,0.15)' }}>{raw.slice(1, -1)}</code>);
    else if (raw.startsWith('**')) out.push(<strong key={k2} style={{ color: '#f1f5f9', fontWeight: 700 }}>{raw.slice(2, -2)}</strong>);
    else if (raw.startsWith('*')) out.push(<em key={k2} style={{ fontStyle: 'italic', color: '#cbd5e1' }}>{raw.slice(1, -1)}</em>);
    else if (raw.startsWith('~~')) out.push(<del key={k2} style={{ opacity: 0.5, textDecoration: 'line-through' }}>{raw.slice(2, -2)}</del>);
    else if (raw.startsWith('[')) out.push(<a key={k2} href={m[6]} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline', textUnderlineOffset: 3 }}>{m[5]}</a>);
    last = m.index + raw.length;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

function MarkdownRenderer({ text, onCopy, copied, onArtifact }: MDProps) {
  const lines = text.split('\n');
  const els: React.ReactNode[] = [];
  let i = 0; let cbIdx = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const langTag = line.slice(3).trim().toLowerCase();
      const codeLines: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      const code = codeLines.join('\n');
      const bid = `cb-${cbIdx++}`;
      const art = detectArtifact(`\`\`\`${langTag}\n${code}\n\`\`\``);

      els.push(
        <div key={bid} style={{ margin: '10px 0' }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: '#0a0f1c' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{langTag || 'code'}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {art && (
                  <button
                    onClick={() => onArtifact(art)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <FiLayout style={{ width: 10, height: 10 }} /> Preview
                  </button>
                )}
                <button
                  onClick={() => onCopy(code, bid)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                >
                  {copied === bid ? <FiCheck style={{ width: 10, height: 10, color: '#4ade80' }} /> : <FiCopy style={{ width: 10, height: 10 }} />}
                  {copied === bid ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto', padding: '12px 16px', maxWidth: '100%' }}>
              <pre style={{ margin: 0, fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontSize: 11, lineHeight: 1.7, whiteSpace: 'pre', width: 'max-content', minWidth: '100%' }}>
                {codeLines.map((cl, li) => (
                  <div key={li} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: '#374151', userSelect: 'none', minWidth: 20, textAlign: 'right', flexShrink: 0, fontSize: 10, paddingTop: 1 }}>{li + 1}</span>
                    <span>
                      {tokenize(cl, langTag).map((tok, ti) => (
                        <span key={ti} style={{ color: TC[tok.t] }}>{tok.v}</span>
                      ))}
                      {cl.length === 0 && '\u00a0'}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      );
      i++; continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      const lvl = (line.match(/^(#+)/)?.[1].length ?? 1);
      const txt = line.replace(/^#+\s/, '');
      const styles: React.CSSProperties[] = [
        { fontSize: '1.1em', fontWeight: 800, color: '#f1f5f9', margin: '14px 0 6px', lineHeight: 1.3 },
        { fontSize: '1em', fontWeight: 700, color: '#e2e8f0', margin: '12px 0 4px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 },
        { fontSize: '0.9em', fontWeight: 700, color: '#cbd5e1', margin: '10px 0 4px' },
      ];
      els.push(<div key={i} style={styles[lvl - 1]}>{renderInline(txt, `h${i}`)}</div>);
    } else if (line.startsWith('> ')) {
      els.push(<blockquote key={i} style={{ margin: '6px 0', paddingLeft: 12, borderLeft: '2px solid #3b82f6', color: '#94a3b8', fontSize: '0.9em', fontStyle: 'italic' }}>{renderInline(line.slice(2), `bq${i}`)}</blockquote>);
    } else if (/^[-*]\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(
          <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '3px 0' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', marginTop: 6, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{renderInline(lines[i].replace(/^[-*]\s/, ''), `li${i}`)}</span>
          </li>
        );
        i++;
      }
      els.push(<ul key={`ul${i}`} style={{ margin: '6px 0', padding: 0, listStyle: 'none', fontSize: '0.875em', color: '#cbd5e1' }}>{items}</ul>);
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = []; let n = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '3px 0' }}>
            <span style={{ minWidth: 18, height: 18, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{n}</span>
            <span style={{ flex: 1 }}>{renderInline(lines[i].replace(/^\d+\.\s/, ''), `ol${i}`)}</span>
          </li>
        );
        n++; i++;
      }
      els.push(<ol key={`ol${i}`} style={{ margin: '6px 0', padding: 0, listStyle: 'none', fontSize: '0.875em', color: '#cbd5e1' }}>{items}</ol>);
      continue;
    } else if (/^---+$/.test(line.trim())) {
      els.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '12px 0' }} />);
    } else if (line.trim() === '') {
      els.push(<div key={i} style={{ height: 6 }} />);
    } else {
      els.push(<p key={i} style={{ margin: '3px 0', fontSize: '0.875em', lineHeight: 1.7, color: '#cbd5e1' }}>{renderInline(line, `p${i}`)}</p>);
    }
    i++;
  }
  return <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{els}</div>;
}

interface PlaygroundProps {
  keys?: { key: string; name: string; is_active: boolean }[];
}

export default function Playground({ keys = [] }: PlaygroundProps) {
  const [model, setModel] = useState<AnyModel>(TEXT_MODELS[0]);
  const [dropOpen, setDropOpen] = useState(false);
  const [modelTab, setModelTab] = useState<ModelType>('text');
  const [modelQ, setModelQ] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [msg, setMsg] = useState('Explain quantum computing in simple terms.');
  const [sys, setSys] = useState('');
  const [showSys, setShowSys] = useState(false);
  const [temp, setTemp] = useState(0.7);
  const [maxTok, setMaxTok] = useState(1024);
  const [ttsEmo, setTtsEmo] = useState<'normal' | 'happy' | 'angry'>('normal');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'code'>('response');
  const [codeLang, setCodeLang] = useState<Lang>('typescript');
  const [copied, setCopied] = useState<string | null>(null);
  const [imgs, setImgs] = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [artifact, setArtifact] = useState<ArtifactData | null>(null);
  const [allArtifacts, setAllArtifacts] = useState<ArtifactData[]>([]);
  const [renderRaw, setRenderRaw] = useState(false);
  const [artifactKey, setArtifactKey] = useState(0);

  const dropRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const isVision = VISION_IDS.has(model.id);
  const responseText: string = resp?.choices?.[0]?.message?.content ?? '';

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { if (!isVision) setImgs([]); }, [model.id, isVision]);
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const filteredModels = useMemo(() => {
    const all = modelTab === 'text' ? TEXT_MODELS : modelTab === 'image' ? IMAGE_MODELS : TTS_MODELS;
    const q = modelQ.toLowerCase();
    return q ? all.filter(m => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)) : all;
  }, [modelTab, modelQ]);

  const copy = (t: string, id: string) => {
    navigator.clipboard.writeText(t);
    setCopied(id); setTimeout(() => setCopied(null), 2000);
  };

  const clearAll = () => {
    setResp(null); setImgB64(null); setAudioUrl(null);
    setErr(null); setLatency(null); setPlaying(false); setArtifact(null); setAllArtifacts([]);
    audioRef.current?.pause();
  };

  const processImg = useCallback((file: File): Promise<UploadedImage> => new Promise((res, rej) => {
    if (!file.type.startsWith('image/')) return rej(new Error('Not an image'));
    if (file.size > 10 * 1024 * 1024) return rej(new Error('Max 10MB per image'));
    const r = new FileReader();
    r.onload = e => {
      const data = e.target!.result as string;
      res({ file, base64: data.split(',')[1], preview: data, mimeType: file.type });
    };
    r.onerror = () => rej(new Error('Failed to read file'));
    r.readAsDataURL(file);
  }), []);

  const addImgs = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, 5 - imgs.length);
    try {
      const done = await Promise.all(arr.map(processImg));
      setImgs(prev => [...prev, ...done]);
    } catch (e: any) { setErr(e.message); }
  }, [imgs.length, processImg]);

  const run = async () => {
    if (!apiKey.trim()) return setErr('API key required');
    if (!msg.trim() && imgs.length === 0) return setErr('Message required');
    setLoading(true); clearAll();
    const t0 = Date.now();
    try {
      if (model.type === 'image') {
        const r = await fetch(model.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ prompt: msg, steps: 4 }) });
        const d = await r.json(); setLatency(Date.now() - t0);
        if (!r.ok) return setErr(d.error || `Error ${r.status}`);
        setImgB64(d.imageBase64); setActiveTab('response'); return;
      }
      if (model.type === 'tts') {
        const r = await fetch(model.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ text: msg, emotion: ttsEmo, volume: 100, pitch: 0, tempo: 1 }) });
        const d = await r.json(); setLatency(Date.now() - t0);
        if (!r.ok) return setErr(d.error || `Error ${r.status}`);
        setAudioUrl(d.audio); setActiveTab('response');
        if (d.audio) { const a = new Audio(d.audio); a.onended = () => setPlaying(false); a.play().catch(() => {}); audioRef.current = a; setPlaying(true); }
        return;
      }
      const messages: any[] = [];
      if (sys.trim()) messages.push({ role: 'system', content: sys });
      if (isVision && imgs.length > 0) {
        const blocks: any[] = [];
        if (msg.trim()) blocks.push({ type: 'text', text: msg });
        imgs.forEach(img => blocks.push({ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.base64}` } }));
        messages.push({ role: 'user', content: blocks });
      } else {
        messages.push({ role: 'user', content: msg });
      }
      const r = await fetch(model.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model.id, messages, temperature: temp, max_tokens: maxTok }) });
      const d = await r.json(); setLatency(Date.now() - t0);
      if (!r.ok) return setErr(d.error?.message || `Error ${r.status}`);
      setResp(d); setActiveTab('response');
      const txt = d?.choices?.[0]?.message?.content ?? '';
      const arts = detectAllArtifacts(txt);
      setAllArtifacts(arts);
      if (arts.length > 0) setArtifact(arts[0]);
    } catch (e: any) {
      setErr(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const ModelIcon = model.icon as any;

  const styles = {
    panel: {
      background: 'linear-gradient(135deg, rgba(13,18,36,0.95) 0%, rgba(10,14,28,0.98) 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      backdropFilter: 'blur(24px)',
    } as React.CSSProperties,
    input: {
      width: '100%',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      padding: '8px 12px',
      color: '#e2e8f0',
      fontSize: 12,
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    label: {
      display: 'block',
      fontSize: 10,
      fontWeight: 700,
      color: '#475569',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      marginBottom: 5,
    } as React.CSSProperties,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>API Playground</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Test models with your API key</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 2s infinite', boxShadow: '0 0 6px rgba(59,130,246,0.6)' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa' }}>Live</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }} className="pg-grid">
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          @media (min-width: 1024px) { .pg-grid { grid-template-columns: minmax(0,2fr) minmax(0,3fr) !important; } }
          .pg-input:focus { border-color: rgba(59,130,246,0.4) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.06) !important; }
          .pg-model-btn:hover { border-color: rgba(59,130,246,0.3) !important; background: rgba(59,130,246,0.04) !important; }
          .pg-run:hover:not(:disabled) { transform: scale(1.015); box-shadow: 0 4px 20px rgba(59,130,246,0.3) !important; }
          .pg-run:active:not(:disabled) { transform: scale(0.985); }
          .pg-run:disabled { opacity: 0.5; cursor: not-allowed; }
          .pg-tab-active { background: rgba(59,130,246,0.12) !important; color: #60a5fa !important; border-color: rgba(59,130,246,0.2) !important; }
          .pg-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .pg-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .pg-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
          .pg-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
          .pg-model-item:hover { background: rgba(255,255,255,0.03) !important; }
          .pg-model-item-active { background: rgba(59,130,246,0.08) !important; border: 1px solid rgba(59,130,246,0.15) !important; }
          .pg-img-rm:hover { opacity: 1 !important; }
          .pg-range::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; cursor: pointer; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
          .pg-range::-webkit-slider-runnable-track { height: 4px; border-radius: 4px; background: rgba(255,255,255,0.08); }
          .pg-art-btn:hover { background: rgba(255,255,255,0.06) !important; }
          .pg-close-btn:hover { background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; }
        `}</style>

        <div style={{ ...styles.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 3, height: 12, borderRadius: 2, background: 'linear-gradient(to bottom, #3b82f6, #6366f1)' }} />
            Configuration
          </div>

          <div ref={dropRef} style={{ position: 'relative' }}>
            <label style={styles.label}>Model</label>
            <button
              onClick={() => setDropOpen(d => !d)}
              className="pg-model-btn"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${model.gradient.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ModelIcon style={{ width: 13, height: 13, color: '#fff' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model.name}</span>
                    {isVision && <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 6px', borderRadius: 20, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>VISION</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569' }}>{model.provider}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, border: '1px solid', flexShrink: 0 }} className={PRICING_CHIP[model.pricing]}>{model.pricing}</span>
                <FiChevronDown style={{ width: 13, height: 13, color: '#475569', transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </button>

            {dropOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#0a0f1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 200, overflow: 'hidden', animation: 'fadeIn 0.15s ease' }}>
                <div style={{ padding: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    {(['text', 'image', 'tts'] as const).map(t => (
                      <button key={t} onClick={() => setModelTab(t)} style={{ flex: 1, padding: '4px 0', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.15s', border: 'none', background: modelTab === t ? 'rgba(59,130,246,0.2)' : 'transparent', color: modelTab === t ? '#60a5fa' : '#475569' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 11, height: 11, color: '#475569' }} />
                    <input
                      value={modelQ} onChange={e => setModelQ(e.target.value)} placeholder="Search models..."
                      className="pg-input"
                      style={{ ...styles.input, paddingLeft: 28, fontSize: 11 }}
                    />
                  </div>
                </div>
                <div className="pg-scrollbar" style={{ maxHeight: 220, overflowY: 'auto', padding: 6 }}>
                  {filteredModels.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 11, color: '#475569' }}>No models found</div>
                  ) : filteredModels.map(m => {
                    const Icon = m.icon as any;
                    const hasV = VISION_IDS.has(m.id);
                    const active = model.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m); setDropOpen(false); setModelQ(''); clearAll(); }}
                        className={`pg-model-item${active ? ' pg-model-item-active' : ''}`}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 9, cursor: 'pointer', background: 'transparent', border: active ? '' : '1px solid transparent', transition: 'all 0.15s', boxSizing: 'border-box', textAlign: 'left' }}
                      >
                        <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${m.gradient.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon style={{ width: 11, height: 11, color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                            {hasV && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)', flexShrink: 0, textTransform: 'uppercase' }}>Vision</span>}
                          </div>
                          <span style={{ fontSize: 10, color: '#475569' }}>{m.provider}{m.context !== '—' ? ` · ${m.context}` : ''}</span>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5, border: '1px solid', flexShrink: 0 }} className={PRICING_CHIP[m.pricing]}>{m.pricing}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={styles.label}>API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="acv-••••••••••••••••"
                className="pg-input"
                style={{ ...styles.input, paddingRight: 36 }}
              />
              <button onClick={() => setShowKey(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 2 }}>
                {showKey ? <FiEyeOff style={{ width: 13, height: 13 }} /> : <FiEye style={{ width: 13, height: 13 }} />}
              </button>
            </div>
            {keys.filter(k => k.is_active).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {keys.filter(k => k.is_active).slice(0, 3).map(k => (
                  <button key={k.key} onClick={() => setApiKey(k.key)} style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)', cursor: 'pointer' }}>{k.name}</button>
                ))}
              </div>
            )}
          </div>

          {model.type === 'text' && (
            <div>
              <button onClick={() => setShowSys(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: showSys ? 6 : 0 }}>
                <FiChevronRight style={{ width: 11, height: 11, transform: showSys ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                System Prompt
                <span style={{ fontSize: 9, fontWeight: 400, color: '#334155', textTransform: 'none' }}>(optional)</span>
              </button>
              {showSys && (
                <textarea
                  value={sys} onChange={e => setSys(e.target.value)} rows={2}
                  placeholder="You are a helpful assistant..."
                  className="pg-input"
                  style={{ ...styles.input, resize: 'none', lineHeight: 1.6 }}
                />
              )}
            </div>
          )}

          <div>
            <label style={styles.label}>
              {model.type === 'image' ? 'Image Prompt' : model.type === 'tts' ? 'Text to Speak' : 'Message'}
            </label>
            <textarea
              value={msg} onChange={e => setMsg(e.target.value)}
              rows={model.type === 'text' ? 4 : 3}
              placeholder={model.type === 'image' ? 'A futuristic city at dusk...' : model.type === 'tts' ? 'Enter text to vocalize...' : isVision ? 'Describe what you want to know...' : 'Enter your prompt...'}
              className="pg-input"
              style={{ ...styles.input, resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          {isVision && model.type === 'text' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ ...styles.label, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FiImage style={{ width: 11, height: 11 }} /> Images <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none' }}>up to 5</span>
                </label>
                {imgs.length > 0 && (
                  <button onClick={() => setImgs([])} style={{ fontSize: 9, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                )}
              </div>
              {imgs.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {imgs.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 52, height: 52, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                      <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => setImgs(p => p.filter((_, i) => i !== idx))}
                        className="pg-img-rm"
                        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s' }}
                      >
                        <FiX style={{ width: 14, height: 14, color: '#fff' }} />
                      </button>
                    </div>
                  ))}
                  {imgs.length < 5 && (
                    <button onClick={() => fileRef.current?.click()} style={{ width: 52, height: 52, borderRadius: 8, border: '2px dashed rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                      <FiUpload style={{ width: 16, height: 16 }} />
                    </button>
                  )}
                </div>
              )}
              {imgs.length === 0 && (
                <div
                  ref={dropZoneRef}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={e => { if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) setDragging(false); }}
                  onDrop={e => { e.preventDefault(); setDragging(false); addImgs(e.dataTransfer.files); }}
                  onClick={() => fileRef.current?.click()}
                  style={{ borderRadius: 10, border: `2px dashed ${dragging ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`, background: dragging ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.01)', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: dragging ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUpload style={{ width: 14, height: 14, color: dragging ? '#60a5fa' : '#475569' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: dragging ? '#60a5fa' : '#475569' }}>{dragging ? 'Drop here' : 'Upload or drag images'}</span>
                  <span style={{ fontSize: 9, color: '#334155' }}>PNG · JPG · WEBP · max 10MB</span>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) addImgs(e.target.files); e.target.value = ''; }} />
            </div>
          )}

          {model.type === 'text' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Temperature</label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', fontVariantNumeric: 'tabular-nums' }}>{temp.toFixed(1)}</span>
                </div>
                <input type="range" min={0} max={2} step={0.1} value={temp} onChange={e => setTemp(parseFloat(e.target.value))} className="pg-range" style={{ width: '100%', appearance: 'none', background: `linear-gradient(to right, #3b82f6 ${(temp / 2) * 100}%, rgba(255,255,255,0.06) ${(temp / 2) * 100}%)`, height: 4, borderRadius: 4, cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 9, color: '#334155' }}>Precise</span>
                  <span style={{ fontSize: 9, color: '#334155' }}>Creative</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Max Tokens</label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', fontVariantNumeric: 'tabular-nums' }}>{maxTok}</span>
                </div>
                <input type="range" min={64} max={4096} step={64} value={maxTok} onChange={e => setMaxTok(parseInt(e.target.value))} className="pg-range" style={{ width: '100%', appearance: 'none', background: `linear-gradient(to right, #3b82f6 ${((maxTok - 64) / (4096 - 64)) * 100}%, rgba(255,255,255,0.06) ${((maxTok - 64) / (4096 - 64)) * 100}%)`, height: 4, borderRadius: 4, cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 9, color: '#334155' }}>64</span>
                  <span style={{ fontSize: 9, color: '#334155' }}>4K</span>
                </div>
              </div>
            </div>
          )}

          {model.type === 'tts' && (
            <div>
              <label style={styles.label}>Emotion</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {(['normal', 'happy', 'angry'] as const).map(e => (
                  <button key={e} onClick={() => setTtsEmo(e)} style={{ padding: '7px 0', borderRadius: 9, fontSize: 10, fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', background: ttsEmo === e ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.02)', borderColor: ttsEmo === e ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)', color: ttsEmo === e ? '#60a5fa' : '#475569' }}>
                    {e === 'normal' ? '😐' : e === 'happy' ? '😊' : '😠'} {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
            <button
              onClick={run} disabled={loading}
              className="pg-run"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 11, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '-0.01em', boxShadow: '0 4px 14px rgba(59,130,246,0.2)' }}
            >
              {loading ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Running...
                </>
              ) : (
                <><FiPlay style={{ width: 13, height: 13 }} />Run</>
              )}
            </button>
            <button onClick={clearAll} style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', color: '#475569', transition: 'all 0.2s', flexShrink: 0 }}>
              <FiRotateCcw style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={{ ...styles.panel, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 320, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {(['response', 'code'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} className={activeTab === t ? 'pg-tab-active' : ''} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', border: '1px solid transparent', background: 'transparent', color: '#475569', transition: 'all 0.15s', letterSpacing: '0.02em' }}>
                    {t === 'response' ? <FiTerminal style={{ width: 11, height: 11 }} /> : <FiCode style={{ width: 11, height: 11 }} />}
                    {t === 'response' ? 'Response' : 'Code'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {activeTab === 'response' && responseText && (
                  <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {['MD', 'Raw'].map(m2 => {
                      const isActive = m2 === 'MD' ? !renderRaw : renderRaw;
                      return <button key={m2} onClick={() => setRenderRaw(m2 === 'Raw')} style={{ padding: '2px 8px', borderRadius: 5, fontSize: 9, fontWeight: 800, cursor: 'pointer', border: 'none', transition: 'all 0.15s', background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent', color: isActive ? '#60a5fa' : '#334155', letterSpacing: '0.05em' }}>{m2}</button>;
                    })}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {latency && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#475569' }}>
                      <FiClock style={{ width: 10, height: 10 }} />
                      {latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`}
                    </div>
                  )}
                  {resp?.usage?.total_tokens && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#475569' }}>
                      <FiCpu style={{ width: 10, height: 10 }} />
                      {resp.usage.total_tokens}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {activeTab === 'response' && (
              <div className="pg-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                {!resp && !err && !loading && !imgB64 && !audioUrl && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {model.type === 'image' ? <FiImage style={{ width: 18, height: 18, color: '#334155' }} /> : model.type === 'tts' ? <FiVolume2 style={{ width: 18, height: 18, color: '#334155' }} /> : <FiTerminal style={{ width: 18, height: 18, color: '#334155' }} />}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Configure and run</div>
                      <div style={{ fontSize: 10, color: '#334155', marginTop: 3 }}>{isVision ? 'Vision-capable model selected' : model.type === 'image' ? 'Image will appear here' : model.type === 'tts' ? 'Audio player will appear here' : 'Response will appear here'}</div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0' }}>
                    <div style={{ position: 'relative', width: 44, height: 44 }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.1)' }} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#3b82f6', animation: 'spin 0.7s linear infinite' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{model.type === 'image' ? 'Generating...' : model.type === 'tts' ? 'Vocalizing...' : 'Processing...'}</div>
                      <div style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>{model.name}</div>
                    </div>
                  </div>
                )}

                {err && (
                  <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', display: 'flex', gap: 10, animation: 'fadeIn 0.2s ease' }}>
                    <FiAlertCircle style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#fca5a5', marginBottom: 3 }}>Error</div>
                      <div style={{ fontSize: 11, color: '#f87171' }}>{err}</div>
                    </div>
                  </div>
                )}

                {imgB64 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 6, background: `linear-gradient(135deg, ${model.gradient.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ModelIcon style={{ width: 10, height: 10, color: '#fff' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{model.name}</span>
                      </div>
                      <button onClick={() => { const l = document.createElement('a'); l.href = `data:image/jpeg;base64,${imgB64}`; l.download = `img-${Date.now()}.jpg`; document.body.appendChild(l); l.click(); document.body.removeChild(l); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                        <FiDownload style={{ width: 11, height: 11 }} /> Download
                      </button>
                    </div>
                    <img src={`data:image/jpeg;base64,${imgB64}`} alt="Generated" style={{ width: '100%', height: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }} />
                  </div>
                )}

                {audioUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 6, background: `linear-gradient(135deg, ${model.gradient.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ModelIcon style={{ width: 10, height: 10, color: '#fff' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{model.name}</span>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => { if (playing) { audioRef.current?.pause(); setPlaying(false); } else { const a = new Audio(audioUrl); a.onended = () => setPlaying(false); a.play().catch(() => {}); audioRef.current = a; setPlaying(true); } }} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                          {playing ? <FiPause style={{ width: 14, height: 14, color: '#fff' }} /> : <FiPlay style={{ width: 14, height: 14, color: '#fff' }} />}
                        </button>
                        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'linear-gradient(to right, #3b82f6, #6366f1)', width: playing ? '100%' : '0%', transition: playing ? 'width 3s linear' : 'none', borderRadius: 3 }} />
                        </div>
                        <button onClick={() => { const l = document.createElement('a'); l.href = audioUrl; l.download = `audio-${Date.now()}.mp3`; document.body.appendChild(l); l.click(); document.body.removeChild(l); }} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
                          <FiDownload style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: 10, color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>"{msg}"</p>
                    </div>
                  </div>
                )}

                {resp && responseText && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.25s ease', minWidth: 0, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 6, background: `linear-gradient(135deg, ${model.gradient.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ModelIcon style={{ width: 10, height: 10, color: '#fff' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model.name}</span>
                        {imgs.length > 0 && <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.15)', flexShrink: 0, textTransform: 'uppercase' }}>{imgs.length} img</span>}
                      </div>
                      <button onClick={() => copy(responseText, 'resp')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b', fontSize: 10, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                        {copied === 'resp' ? <FiCheck style={{ width: 10, height: 10, color: '#4ade80' }} /> : <FiCopy style={{ width: 10, height: 10 }} />}
                        {copied === 'resp' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', minWidth: 0, width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                      {renderRaw ? (
                        <pre style={{ margin: 0, fontFamily: 'ui-monospace,monospace', fontSize: 11, lineHeight: 1.7, color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{responseText}</pre>
                      ) : (
                        <MarkdownRenderer text={responseText} onCopy={copy} copied={copied} onArtifact={setArtifact} />
                      )}
                    </div>
                    {resp.usage && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {[['Prompt', resp.usage.prompt_tokens], ['Completion', resp.usage.completion_tokens], ['Total', resp.usage.total_tokens]].map(([label, val]) => val != null && (
                          <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 7, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: 9, color: '#475569' }}>{label}:</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'code' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', overflowX: 'auto', flexShrink: 0 }}>
                  {LANGS.map(l => {
                    const LIcon = l.icon;
                    const active = codeLang === l.id;
                    return (
                      <button key={l.id} onClick={() => setCodeLang(l.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', flexShrink: 0, background: active ? 'rgba(59,130,246,0.12)' : 'transparent', borderColor: active ? 'rgba(59,130,246,0.2)' : 'transparent', color: active ? '#60a5fa' : '#475569' }}>
                        <LIcon style={{ width: 11, height: 11 }} />
                        {l.label}
                      </button>
                    );
                  })}
                  <button onClick={() => copy(generateCode(codeLang, model, msg, apiKey, temp, maxTok), 'code')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#64748b', flexShrink: 0 }}>
                    {copied === 'code' ? <FiCheck style={{ width: 10, height: 10, color: '#4ade80' }} /> : <FiCopy style={{ width: 10, height: 10 }} />}
                    {copied === 'code' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="pg-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '14px 16px' }}>
                  <pre style={{ margin: 0, fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontSize: 11, lineHeight: 1.7, minWidth: 'max-content' }}>
                    {generateCode(codeLang, model, msg, apiKey, temp, maxTok).split('\n').map((line, li) => (
                      <div key={li} style={{ display: 'flex', gap: 14 }}>
                        <span style={{ color: '#2d3748', userSelect: 'none', minWidth: 22, textAlign: 'right', flexShrink: 0, fontSize: 10, paddingTop: 1 }}>{li + 1}</span>
                        <span>
                          {tokenize(line, codeLang).map((tok, ti) => (
                            <span key={ti} style={{ color: TC[tok.t] }}>{tok.v}</span>
                          ))}
                          {line.length === 0 && '\u00a0'}
                        </span>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {(artifact || allArtifacts.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeIn 0.25s ease', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
              {allArtifacts.length > 1 && (
                <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
                  {allArtifacts.map((art, idx) => {
                    const AIcon = ARTIFACT_LANG_ICONS[art.type];
                    const aGrad = ARTIFACT_LANG_COLORS[art.type];
                    const isActive = artifact?.content === art.content;
                    return (
                      <button
                        key={idx}
                        onClick={() => setArtifact(art)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 9, border: '1px solid', borderColor: isActive ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)', background: isActive ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
                      >
                        <div style={{ width: 14, height: 14, borderRadius: 4, background: `linear-gradient(135deg, ${aGrad.replace('from-','').replace(' to-',', ')})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AIcon style={{ width: 8, height: 8, color: '#fff' }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#60a5fa' : '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{art.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {artifact && (
                <ArtifactViewer
                  artifact={artifact}
                  onClose={() => setArtifact(null)}
                  onRefresh={() => setArtifactKey(k => k + 1)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
