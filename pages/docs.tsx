import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { FiCopy, FiCheck, FiChevronRight, FiZap, FiBook, FiMoon, FiSun, FiMenu, FiX, FiKey, FiTerminal, FiMic, FiImage, FiCode, FiShield, FiLayers, FiPlay, FiArrowRight } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const BASE = "https://www.aichixia.xyz";

const CODE = {
  quickstartJS: `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: '${BASE}/api/v1',
});

const response = await client.chat.completions.create({
  model: 'gemini-3-flash',
  messages: [{ role: 'user', content: 'Hello!' }],
});

console.log(response.choices[0].message.content);`,

  quickstartPython: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${BASE}/api/v1",
)

response = client.chat.completions.create(
    model="gemini-3-flash",
    messages=[{"role": "user", "content": "Hello!"}],
)

print(response.choices[0].message.content)`,

  quickstartCurl: `curl -X POST ${BASE}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gemini-3-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,

  chatJS: `const response = await fetch('${BASE}/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'claude-opus-4.5',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain quantum computing' }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`,

  chatPython: `import requests

response = requests.post(
    '${BASE}/api/v1/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'model': 'claude-opus-4.5',
        'messages': [
            {'role': 'system', 'content': 'You are a helpful assistant.'},
            {'role': 'user', 'content': 'Explain quantum computing'}
        ],
        'temperature': 0.7,
        'max_tokens': 1000
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`,

  chatResponse: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "claude-opus-4.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Quantum computing uses quantum bits..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 120,
    "total_tokens": 138
  }
}`,

  streamingJS: `const response = await fetch('${BASE}/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-5-mini',
    messages: [{ role: 'user', content: 'Tell me a story' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n').filter(line => line.trim());

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const parsed = JSON.parse(data);
      const content = parsed.choices[0]?.delta?.content;
      if (content) process.stdout.write(content);
    }
  }
}`,

  imageJS: `const response = await fetch('${BASE}/api/models/flux', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prompt: 'A serene mountain landscape at golden hour',
    steps: 4
  })
});

const data = await response.json();
console.log(data.imageBase64);`,

  ttsJS: `const response = await fetch('${BASE}/api/models/starling', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    text: 'Hello, this is a text to speech demo',
    emotion: 'neutral',
    volume: 100,
    pitch: 0,
    tempo: 1
  })
});

const data = await response.json();
console.log(data.audio);`,
};

type Tab = 'quickstart' | 'chat' | 'media';
type Lang = 'js' | 'python' | 'curl';

function CodeBlock({ code, lang, id, copiedId, onCopy }: {
  code: string;
  lang: string;
  id: string;
  copiedId: string | null;
  onCopy: (code: string, id: string) => void;
  isDark?: boolean;
}) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{lang}</span>
        <button
          onClick={() => onCopy(code, id)}
          className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          {copiedId === id ? (
            <><FiCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></>
          ) : (
            <><FiCopy className="w-3 h-3" /><span>Copy</span></>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang === 'curl' ? 'bash' : lang === 'js' ? 'javascript' : lang}
        style={dark ? oneDark : oneLight}
        customStyle={{ margin: 0, padding: '14px 16px', background: 'transparent', fontSize: '11.5px', lineHeight: '1.6' }}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
      >
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</span>
        <FiChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/60 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Param({ name, required, type, desc }: { name: string; required?: boolean; type?: string; desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
      <div className="flex items-center gap-2 flex-shrink-0">
        <code className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400">{name}</code>
        {required && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold">required</span>}
        {type && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">{type}</span>}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Docs() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('quickstart');
  const [quickLang, setQuickLang] = useState<Lang>('js');
  const [chatLang, setChatLang] = useState<'js' | 'python'>('js');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const dark = theme === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'quickstart', label: 'Quick Start', icon: FiZap },
    { id: 'chat', label: 'Chat API', icon: FiTerminal },
    { id: 'media', label: 'Image & TTS', icon: FiImage },
  ];

  const quickCode = quickLang === 'js' ? CODE.quickstartJS : quickLang === 'python' ? CODE.quickstartPython : CODE.quickstartCurl;
  const chatCode = chatLang === 'js' ? CODE.chatJS : CODE.chatPython;

  return (
    <>
      <Head>
        <title>API Documentation — Aichixia</title>
        <meta name="description" content="Complete API reference for Aichixia. Integrate text, image, and voice AI through one unified OpenAI-compatible API." />
      </Head>

      <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-13 sm:h-14">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-sky-500/30 transition-shadow">
                  <FiTerminal className="text-white w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">Aichixia</span>
                  <span className="ml-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">Docs</span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === t.id
                        ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <Link href="/console" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
                  Console <FiArrowRight className="w-3 h-3" />
                </Link>
              </nav>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  {mobileMenuOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <div className="p-3 space-y-1">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === t.id
                        ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
                <Link
                  href="/console"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiKey className="w-4 h-4" />
                  Go to Console
                </Link>
              </div>
            </div>
          )}
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-20 space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-600 px-3 mb-2">Reference</p>
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === t.id
                        ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-600 px-3 mb-2">Links</p>
                  <Link href="/console" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                    <FiKey className="w-3.5 h-3.5" /> Console
                  </Link>
                  <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                    <FiArrowRight className="w-3.5 h-3.5" /> Home
                  </Link>
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0 space-y-5">
              {activeTab === 'quickstart' && (
                <div className="space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 mb-3">
                      <FiZap className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Quick Start</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-2">Getting Started</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      All endpoints are OpenAI-compatible — drop in your existing code, change the base URL, and you're done.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: FiKey, color: 'sky', step: '01', title: 'Get API Key', desc: 'Sign up and generate a free API key from the Console' },
                      { icon: FiCode, color: 'purple', step: '02', title: 'Make a Request', desc: 'Use any OpenAI SDK or HTTP client to call our API' },
                      { icon: FiZap, color: 'emerald', step: '03', title: 'Ship Fast', desc: 'Deploy your AI features with confidence and scale' },
                    ].map(({ icon: Icon, color, step, title, desc }) => (
                      <div key={step} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                          </div>
                          <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700">{step}</span>
                        </div>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">{title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/20">
                    <div className="flex items-start gap-3">
                      <FiShield className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-sky-800 dark:text-sky-200 mb-0.5">Base URL</p>
                        <code className="text-xs font-mono text-sky-700 dark:text-sky-300">{BASE}/api/v1</code>
                        <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">OpenAI-compatible — works with any OpenAI SDK out of the box.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Installation</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">terminal</span>
                        <button onClick={() => copy('npm install openai', 'install')} className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                          {copiedId === 'install' ? <><FiCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FiCopy className="w-3 h-3" />Copy</>}
                        </button>
                      </div>
                      <div className="px-4 py-3 bg-white dark:bg-zinc-950">
                        <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200">npm install openai</code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">First Request</p>
                      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5">
                        {(['js', 'python', 'curl'] as Lang[]).map(l => (
                          <button key={l} onClick={() => setQuickLang(l)} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${quickLang === l ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {l === 'js' ? 'JavaScript' : l === 'python' ? 'Python' : 'cURL'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <CodeBlock code={quickCode} lang={quickLang} id={`quick-${quickLang}`} copiedId={copiedId} onCopy={copy} />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: FiShield, label: 'Rate Limits', desc: '100 req/day free, 400 pro', color: 'text-sky-600 dark:text-sky-400' },
                      { icon: FiLayers, label: '20+ Models', desc: 'Text, image, voice, multimodal', color: 'text-purple-600 dark:text-purple-400' },
                      { icon: FiPlay, label: 'Streaming', desc: 'Server-sent events supported', color: 'text-emerald-600 dark:text-emerald-400' },
                    ].map(({ icon: Icon, label, desc, color }) => (
                      <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                        <div>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{label}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-3">
                      <FiTerminal className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Chat Completions</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-2">Chat API</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Generate text using state-of-the-art models. Fully OpenAI-compatible — works with any existing SDK.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20">
                    <div className="px-2 py-0.5 rounded-md bg-blue-200 dark:bg-blue-900/50 text-[10px] font-black text-blue-700 dark:text-blue-300">POST</div>
                    <code className="text-xs font-mono text-blue-700 dark:text-blue-300 break-all">{BASE}/api/v1/chat/completions</code>
                  </div>

                  <Section title="Request Parameters" defaultOpen>
                    <Param name="model" required type="string" desc="Model ID to use — e.g. claude-opus-4.5, gpt-5-mini, deepseek-v3.2, gemini-3-flash" />
                    <Param name="messages" required type="array" desc="Array of messages with role (system / user / assistant) and content fields" />
                    <Param name="temperature" type="number" desc="Sampling temperature 0–2. Higher = more creative. Default: 1" />
                    <Param name="max_tokens" type="integer" desc="Max tokens to generate. Defaults to the model's maximum" />
                    <Param name="stream" type="boolean" desc="Stream response as server-sent events. Default: false" />
                    <Param name="top_p" type="number" desc="Nucleus sampling 0–1. Alternative to temperature" />
                  </Section>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Example Request</p>
                      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5">
                        {(['js', 'python'] as const).map(l => (
                          <button key={l} onClick={() => setChatLang(l)} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${chatLang === l ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {l === 'js' ? 'JavaScript' : 'Python'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <CodeBlock code={chatCode} lang={chatLang} id={`chat-${chatLang}`} copiedId={copiedId} onCopy={copy} />
                  </div>

                  <Section title="Response Format">
                    <CodeBlock code={CODE.chatResponse} lang="json" id="chat-response" copiedId={copiedId} onCopy={copy} />
                  </Section>

                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">Streaming Example</p>
                    <CodeBlock code={CODE.streamingJS} lang="javascript" id="streaming" copiedId={copiedId} onCopy={copy} />
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex items-start gap-3">
                      <FiShield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">Authentication</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                          Pass your API key via <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">Authorization: Bearer YOUR_API_KEY</code> header on every request.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 mb-3">
                      <FiImage className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Image & TTS</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-2">Media API</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Generate images and synthesize speech. Each model has its own endpoint at <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">/api/models/{'{name}'}</code>
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                          <FiImage className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Image Generation</h3>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">Generate photorealistic images from text prompts using Flux 2 and other models.</p>
                      <div className="space-y-1.5">
                        {['flux', 'lucid', 'phoenix', 'nano'].map(m => (
                          <div key={m} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                            <code className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">/api/models/{m}</code>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[9px] text-zinc-400">POST</span>
                            </div>
                          </div>
                        ))}
                      </div>
                                    </div>

                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                          <FiMic className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Text to Speech</h3>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">Convert text to natural-sounding speech with emotional control and multiple voices.</p>
                      <div className="space-y-1.5">
                        {['starling', 'lindsay'].map(m => (
                          <div key={m} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                            <code className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">/api/models/{m}</code>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[9px] text-zinc-400">POST</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">Image Generation Example</p>
                    <CodeBlock code={CODE.imageJS} lang="javascript" id="image-gen" copiedId={copiedId} onCopy={copy} />
                  </div>

                  <Section title="Image Request Parameters" defaultOpen>
                    <Param name="prompt" required type="string" desc="Text description of the image to generate" />
                    <Param name="steps" type="integer" desc="Number of diffusion steps. Higher = better quality. Default: 4" />
                  </Section>

                  <div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">Text-to-Speech Example</p>
                    <CodeBlock code={CODE.ttsJS} lang="javascript" id="tts-gen" copiedId={copiedId} onCopy={copy} />
                  </div>

                  <Section title="TTS Request Parameters" defaultOpen>
                    <Param name="text" required type="string" desc="The text to convert to speech" />
                    <Param name="emotion" type="string" desc="Emotional tone — neutral, happy, sad, angry, fearful. Default: neutral" />
                    <Param name="volume" type="integer" desc="Output volume 0–100. Default: 100" />
                    <Param name="pitch" type="number" desc="Pitch adjustment. Default: 0" />
                    <Param name="tempo" type="number" desc="Speech speed multiplier. Default: 1.0" />
                  </Section>
                </div>
              )}
            </main>
          </div>
        </div>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-6 h-6 bg-gradient-to-br from-sky-500 to-blue-600 rounded-md flex items-center justify-center">
                  <FiTerminal className="text-white w-3 h-3" />
                </div>
                <span className="text-sm font-black text-zinc-900 dark:text-white">Aichixia</span>
              </Link>
              <p className="text-xs text-zinc-400 dark:text-zinc-600">© {new Date().getFullYear()} Aichixia. All rights reserved.</p>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {[
                  { href: 'mailto:contact@aichixia.xyz', label: 'Contact' },
                  { href: '/privacy', label: 'Privacy' },
                  { href: '/terms', label: 'Terms' },
                  { href: '/security', label: 'Security' },
                ].map(({ href, label }) => (
                  <a key={label} href={href} className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
