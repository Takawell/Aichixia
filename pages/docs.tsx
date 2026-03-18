import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaCopy, FaCheck, FaChevronRight, FaTerminal, FaBolt, FaBook, FaMoon, FaSun, FaBars, FaTimes, FaKey, FaMicrophone, FaImage, FaCode, FaCheckCircle, FaRocket, FaLayerGroup, FaDatabase, FaPlay } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://www.aichixia.xyz";

export default function Docs() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'tts' | 'quickstart'>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('chat-completions');

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      setIsDark(theme === 'dark');
    } else {
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const codeExamples = {
    chatCompletionsJS: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1",
});

const response = await client.chat.completions.create({
  model: "claude-opus-4.5",
  messages: [
    { role: "user", content: "Explain quantum computing" }
  ],
  temperature: 0.7,
  max_tokens: 1000,
});

console.log(response.choices[0].message.content);`,

    chatCompletionsPython: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${base}/api/v1",
)

response = client.chat.completions.create(
    model="claude-opus-4.5",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    temperature=0.7,
    max_tokens=1000,
)

print(response.choices[0].message.content)`,

    chatCompletionsOpenAI: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${base}/api/v1",
)

response = client.chat.completions.create(
    model="claude-opus-4.5",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    temperature=0.7,
    max_tokens=1000,
)

print(response.choices[0].message.content)`,

    chatCompletionsCurl: `curl -X POST ${base}/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-5-mini",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 500
  }'`,

    chatCompletionsNode: `const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1",
});

async function main() {
  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: "Hello!" }],
    temperature: 0.7,
    max_tokens: 500,
  });
  console.log(response.choices[0].message.content);
}

main();`,

    visionJS: `const response = await fetch('${base}/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gemini-3-flash',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this image?' },
          {
            type: 'image_url',
            image_url: { url: 'data:image/jpeg;base64,YOUR_BASE64_IMAGE' }
          }
        ]
      }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`,

    imageGenerationJS: `const response = await fetch('${base}/api/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'flux-2-dev',
    prompt: 'A serene landscape with mountains at sunset',
    size: '1024x1024',
    steps: 30,
    response_format: 'b64_json'
  })
});

const data = await response.json();
const imageBase64 = data.data[0].b64_json;
console.log(imageBase64);`,

    imageGenerationPython: `import requests
import base64

response = requests.post(
    '${base}/api/v1/images/generations',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'model': 'flux-2-dev',
        'prompt': 'A serene landscape with mountains at sunset',
        'size': '1024x1024',
        'steps': 30,
        'response_format': 'b64_json'
    }
)

data = response.json()
image_base64 = data['data'][0]['b64_json']
print(image_base64)`,

    imageGenerationCurl: `curl -X POST ${base}/api/v1/images/generations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "flux-2-dev",
    "prompt": "A serene landscape with mountains at sunset",
    "size": "1024x1024",
    "steps": 30,
    "response_format": "b64_json"
  }'`,

    ttsJS: `const response = await fetch('${base}/api/v1/audio/speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'starling-tts',
    input: 'Hello, this is a text to speech demo',
    emotion: 'normal',
    volume: 100,
    pitch: 0,
    tempo: 1,
    response_format: 'mp3'
  })
});

const data = await response.json();
const audio = new Audio(data.audio_url);
audio.play();`,

    ttsPython: `import requests

response = requests.post(
    '${base}/api/v1/audio/speech',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'model': 'starling-tts',
        'input': 'Hello, this is a text to speech demo',
        'emotion': 'normal',
        'volume': 100,
        'pitch': 0,
        'tempo': 1,
        'response_format': 'mp3'
    }
)

data = response.json()
print(data['audio_url'])`,

    ttsCurl: `curl -X POST ${base}/api/v1/audio/speech \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "starling-tts",
    "input": "Hello, this is a text to speech demo",
    "emotion": "normal",
    "volume": 100,
    "pitch": 0,
    "tempo": 1,
    "response_format": "mp3"
  }'`,
  };

  const CopyButton = ({ code, id }: { code: string; id: string }) => (
    <button
      onClick={() => copyToClipboard(code, id)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
    >
      {copiedCode === id ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
    </button>
  );

  const CodeBlock = ({ code, lang, id }: { code: string; lang: string; id: string }) => (
    <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{lang}</span>
        <CopyButton code={code} id={id} />
      </div>
      <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <SyntaxHighlighter
          language={lang === 'cURL' ? 'bash' : lang.toLowerCase()}
          style={isDark ? oneDark : oneLight}
          customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );

  const Param = ({ name, required, type, desc }: { name: string; required?: boolean; type?: string; desc: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
      <div className="flex items-center gap-2 flex-shrink-0 min-w-[140px]">
        <code className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">{name}</code>
        {required && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold">required</span>}
        {type && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">{type}</span>}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <>
      <Head>
        <title>API Documentation - Aichixia Developer Docs</title>
        <meta name="description" content="Complete API reference for Aichixia. Learn how to integrate text models, image generation, voice synthesis, and more." />
      </Head>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      `}} />

      <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-12 sm:h-14">
              <Link href="/" className="flex items-center gap-1.5 group">
                <FaTerminal className="w-4 h-4 text-blue-500 group-hover:text-cyan-500 transition-colors duration-200" />
                <div>
                  <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight">Aichixia</h1>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5">API Docs</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-0.5">
                <Link href="/" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">
                  Home
                </Link>
                <Link href="/console" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">
                  Console
                </Link>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <Link href="/console" className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all duration-200">
                  <FaKey className="w-2.5 h-2.5" />
                  Get API Key
                </Link>
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  {isDark ? <FaSun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <FaMoon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <nav className="flex flex-col p-2 space-y-1">
                <Link href="/" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/console" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>Console</Link>
              </nav>
            </div>
          )}
        </header>

        <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-black dark:to-cyan-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_70%)]" />
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16">
            <div className="text-center space-y-3 animate-fade-in-up">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <FaBook className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Technical Documentation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                API <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Reference</span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Complete guide to integrating Aichixia's AI models. Chat, images, voice, and more — all through one unified API.
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
                {['OpenAI Compatible', '20+ Models', 'Image Generation', 'Text-to-Speech'].map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-500 animate-pulse' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-pink-500' : 'bg-violet-500'}`} />
                    <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-20 space-y-1.5">
                {([
                  { id: 'quickstart', label: 'Quick Start', icon: FaRocket },
                  { id: 'chat', label: 'Chat Completions', icon: FaTerminal },
                  { id: 'image', label: 'Image Generation', icon: FaImage },
                  { id: 'tts', label: 'Text-to-Speech', icon: FaMicrophone },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === id ? 'bg-blue-600 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                  <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Resources</p>
                  <Link href="/console?tab=playground" className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200">
                    <FaPlay className="w-3 h-3 flex-shrink-0" /> Playground
                  </Link>
                  <Link href="/console?tab=models" className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200">
                    <FaDatabase className="w-3 h-3 flex-shrink-0" /> Model List
                  </Link>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0 space-y-6">

              {activeTab === 'quickstart' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Getting Started</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Get your API key and start building in under 60 seconds. All endpoints are OpenAI-compatible.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { icon: FaKey, color: 'text-blue-600 dark:text-blue-400', title: '1. Get API Key', desc: 'Sign up and generate your free API key from the console' },
                      { icon: FaCode, color: 'text-purple-600 dark:text-purple-400', title: '2. Make Request', desc: 'Use any OpenAI SDK or HTTP client to call our API' },
                      { icon: FaCheckCircle, color: 'text-green-600 dark:text-green-400', title: '3. Ship Fast', desc: 'Deploy your AI features with confidence and scale' },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div key={title} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Icon className={`w-5 h-5 ${color} mb-3`} />
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{title}</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Installation</h3>
                      <CopyButton code="npm install openai" id="install" />
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 overflow-x-auto">
                      <code className="text-xs text-zinc-800 dark:text-zinc-200">npm install openai</code>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Base URLs</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Chat Completions', url: `${base}/api/v1/chat/completions` },
                        { label: 'Image Generation', url: `${base}/api/v1/images/generations` },
                        { label: 'Text-to-Speech', url: `${base}/api/v1/audio/speech` },
                      ].map(({ label, url }) => (
                        <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 min-w-[140px]">{label}</span>
                          <code className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded break-all">{url}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <CodeBlock code={codeExamples.chatCompletionsJS} lang="TypeScript (OpenAI SDK)" id="quickstart-js" />
                  <CodeBlock code={codeExamples.chatCompletionsPython} lang="Python (OpenAI SDK)" id="quickstart-openai" />
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Chat Completions API</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Generate text responses using state-of-the-art language models. OpenAI-compatible endpoint for seamless integration.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-start gap-3">
                      <FaBolt className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">Endpoint</h4>
                        <code className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">POST {base}/api/v1/chat/completions</code>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1.5">Fully OpenAI-compatible. Use any OpenAI SDK with <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">baseURL: "{base}/api/v1"</code></p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => toggleSection('chat-request')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'chat-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'chat-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="Model ID to use. e.g. claude-opus-4.5, gpt-5-mini, deepseek-v3.2, gemini-3-flash, grok-3" />
                        <Param name="messages" required type="array" desc="Array of message objects with role (system | user | assistant) and content" />
                        <Param name="temperature" type="number" desc="Sampling temperature 0–2. Higher = more creative. Default: 0.8" />
                        <Param name="max_tokens" type="number" desc="Maximum tokens to generate. Default: 1080" />
                        <Param name="stream" type="boolean" desc="Enable streaming responses via SSE. Default: false. Note: not supported on this endpoint." />
                        <Param name="top_p" type="number" desc="Nucleus sampling 0–1. Alternative to temperature" />
                      </div>
                    )}

                    <button
                      onClick={() => toggleSection('chat-response')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Response Format</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'chat-response' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'chat-response' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "claude-opus-4.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Your response here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}`}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => toggleSection('chat-models')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Available Text Models</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'chat-models' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'chat-models' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="grid sm:grid-cols-2 gap-2">
                          {[
                            { id: 'gpt-5-mini', label: 'GPT-5 Mini', plan: 'free' },
                            { id: 'gpt-5.2', label: 'GPT-5.2', plan: 'free' },
                            { id: 'gpt-oss-120b', label: 'GPT-OSS 120B', plan: 'free' },
                            { id: 'claude-opus-4.5', label: 'Claude Opus 4.5', plan: 'pro' },
                            { id: 'gemini-3-flash', label: 'Gemini 3 Flash', plan: 'free' },
                            { id: 'grok-3', label: 'Grok 3', plan: 'free' },
                            { id: 'grok-4-fast', label: 'Grok 4 Fast', plan: 'pro' },
                            { id: 'deepseek-v3.2', label: 'DeepSeek V3.2', plan: 'pro' },
                            { id: 'deepseek-v3.1', label: 'DeepSeek V3.1', plan: 'free' },
                            { id: 'mistral-3.1', label: 'Mistral 3.1', plan: 'free' },
                            { id: 'glm-4.7', label: 'GLM 4.7', plan: 'pro' },
                            { id: 'glm-4.7-flash', label: 'GLM 4.7 Flash', plan: 'free' },
                            { id: 'kimi-k2', label: 'Kimi K2', plan: 'free' },
                            { id: 'qwen3-235b', label: 'Qwen3 235B', plan: 'pro' },
                            { id: 'qwen3-coder-480b', label: 'Qwen3 Coder 480B', plan: 'free' },
                            { id: 'minimax-m2.1', label: 'MiniMax M2.1', plan: 'pro' },
                            { id: 'llama-3.3-70b', label: 'Llama 3.3 70B', plan: 'free' },
                            { id: 'mimo-v2-flash', label: 'MiMo V2 Flash', plan: 'free' },
                            { id: 'groq-compound', label: 'Groq Compound', plan: 'free' },
                            { id: 'cohere-command-a', label: 'Cohere Command A', plan: 'free' },
                            { id: 'aichixia-flash', label: 'Aichixia 114B', plan: 'pro' },
                          ].map(({ id, label, plan }) => (
                            <div key={id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <div>
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{label}</p>
                                <code className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">{id}</code>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${plan === 'pro' ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'}`}>
                                {plan === 'pro' ? 'Pro' : 'Free'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">Vision models: <code className="text-zinc-600 dark:text-zinc-400">gemini-3-flash</code>, <code className="text-zinc-600 dark:text-zinc-400">gpt-5.2</code>, <code className="text-zinc-600 dark:text-zinc-400">aichixia-flash</code>, <code className="text-zinc-600 dark:text-zinc-400">grok-4-fast</code></p>
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.chatCompletionsJS} lang="TypeScript (OpenAI SDK)" id="chat-js" />
                  <CodeBlock code={codeExamples.chatCompletionsPython} lang="Python (OpenAI SDK)" id="chat-python" />
                  <CodeBlock code={codeExamples.chatCompletionsNode} lang="Node.js (CommonJS)" id="chat-node" />
                  <CodeBlock code={codeExamples.chatCompletionsCurl} lang="cURL" id="chat-curl" />

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3">Vision (Image Input)</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Supported by: <code>gemini-3-flash</code>, <code>gpt-5.2</code>, <code>aichixia-flash</code>, <code>grok-4-fast</code></p>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <SyntaxHighlighter language="javascript" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }} wrapLongLines={true}>
                        {codeExamples.visionJS}
                      </SyntaxHighlighter>
                    </div>
                    <button onClick={() => copyToClipboard(codeExamples.visionJS, 'vision-js')} className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150">
                      {copiedCode === 'vision-js' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Image Generation API</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Generate high-quality images from text prompts using Flux 2, Lucid Origin, Phoenix, and Nano Banana Pro.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border-l-4 border-pink-500 bg-pink-50/50 dark:bg-pink-950/10 border border-pink-200 dark:border-pink-900/50">
                    <div className="flex items-start gap-3">
                      <FaImage className="w-4 h-4 text-pink-600 dark:text-pink-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-pink-900 dark:text-pink-100 mb-1">Endpoint</h4>
                        <code className="text-xs text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded">POST {base}/api/v1/images/generations</code>
                        <p className="text-xs text-pink-700 dark:text-pink-300 mt-1.5">Response returns base64-encoded image in <code className="bg-pink-100 dark:bg-pink-900/30 px-1 rounded">data[0].b64_json</code></p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => toggleSection('image-request')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'image-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'image-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="Image model ID: flux-2-dev, lucid-origin, phoenix-1.0, nano-image" />
                        <Param name="prompt" required type="string" desc="Text description of the image to generate" />
                        <Param name="size" type="string" desc="Image dimensions in WxH format. e.g. 1024x1024, 512x512. Default: 1024x1024" />
                        <Param name="steps" type="number" desc="Number of diffusion steps. Higher = better quality but slower. Default: 25–30" />
                        <Param name="seed" type="number" desc="Random seed for reproducibility. Optional." />
                        <Param name="guidance" type="number" desc="Guidance scale. Controls how closely image follows prompt. Optional." />
                        <Param name="negative_prompt" type="string" desc="What to exclude from the image. Not supported by nano-image." />
                        <Param name="response_format" type="string" desc="Output format: b64_json (default) or url" />
                        <Param name="n" type="number" desc="Number of images to generate. Default: 1" />
                      </div>
                    )}

                    <button
                      onClick={() => toggleSection('image-response')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Response Format</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'image-response' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'image-response' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`{
  "created": 1677652288,
  "data": [
    {
      "b64_json": "BASE64_ENCODED_IMAGE_STRING"
    }
  ]
}`}
                          </SyntaxHighlighter>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">To display the image: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{'`data:image/png;base64,${data.data[0].b64_json}`'}</code></p>
                      </div>
                    )}

                    <button
                      onClick={() => toggleSection('image-models')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Available Image Models</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'image-models' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'image-models' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="space-y-2">
                          {[
                            { id: 'flux-2-dev', name: 'Flux 2', provider: 'Black Forest Labs', desc: 'High quality photorealistic images' },
                            { id: 'lucid-origin', name: 'Lucid Origin', provider: 'Leonardo', desc: 'Creative & artistic image synthesis' },
                            { id: 'phoenix-1.0', name: 'Phoenix 1.0', provider: 'Leonardo', desc: 'Fast artistic image generation' },
                            { id: 'nano-image', name: 'Nano Banana Pro', provider: 'Google Gemini', desc: 'Lightweight compact image model' },
                          ].map(({ id, name, provider, desc }) => (
                            <div key={id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{name}</p>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{provider}</span>
                              </div>
                              <code className="text-[10px] text-pink-600 dark:text-pink-400 font-mono">{id}</code>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.imageGenerationJS} lang="JavaScript" id="image-js" />
                  <CodeBlock code={codeExamples.imageGenerationPython} lang="Python" id="image-python" />
                  <CodeBlock code={codeExamples.imageGenerationCurl} lang="cURL" id="image-curl" />
                </div>
              )}

              {activeTab === 'tts' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Text-to-Speech API</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Convert text to natural-sounding speech with emotional control using Starling TTS and Lindsay TTS.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border-l-4 border-violet-500 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-200 dark:border-violet-900/50">
                    <div className="flex items-start gap-3">
                      <FaMicrophone className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-violet-900 dark:text-violet-100 mb-1">Endpoint</h4>
                        <code className="text-xs text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded">POST {base}/api/v1/audio/speech</code>
                        <p className="text-xs text-violet-700 dark:text-violet-300 mt-1.5">Returns audio as base64 in <code className="bg-violet-100 dark:bg-violet-900/30 px-1 rounded">audio_url</code> (data URI) and raw base64 in <code className="bg-violet-100 dark:bg-violet-900/30 px-1 rounded">audio</code></p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => toggleSection('tts-request')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'tts-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'tts-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="TTS model ID: starling-tts or lindsay-tts" />
                        <Param name="input" required type="string" desc="The text to convert to speech. Max 2000 characters." />
                        <Param name="emotion" type="string" desc="Emotional tone: normal, happy, sad, angry, fearful, disgusted, surprised. Default: normal" />
                        <Param name="volume" type="number" desc="Output volume 0–200. Default: 100" />
                        <Param name="pitch" type="number" desc="Pitch adjustment in semitones -12 to 12. Default: 0" />
                        <Param name="tempo" type="number" desc="Speech speed multiplier 0.5–2.0. Default: 1" />
                        <Param name="response_format" type="string" desc="Audio format: mp3 or wav. Default: mp3" />
                        <Param name="emotion_intensity" type="number" desc="Emotion intensity 0–2. Default: 1" />
                        <Param name="language" type="string" desc="Language code. Default: eng" />
                        <Param name="seed" type="number" desc="Random seed for reproducibility. Optional." />
                      </div>
                    )}

                    <button
                      onClick={() => toggleSection('tts-response')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Response Format</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'tts-response' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'tts-response' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`{
  "object": "audio",
  "model": "starling-tts",
  "audio": "BASE64_ENCODED_AUDIO",
  "audio_url": "data:audio/mp3;base64,BASE64...",
  "format": "mp3",
  "text_length": 36,
  "credits_used": 36
}`}
                          </SyntaxHighlighter>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">To play audio: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{'new Audio(data.audio_url).play()'}</code></p>
                      </div>
                    )}

                    <button
                      onClick={() => toggleSection('tts-models')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Available TTS Models</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'tts-models' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'tts-models' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="space-y-2">
                          {[
                            { id: 'starling-tts', name: 'Starling TTS', provider: 'Typecast', desc: 'Natural voice with emotional control. Standard quality.' },
                            { id: 'lindsay-tts', name: 'Lindsay TTS', provider: 'Typecast', desc: 'Premium voice with enhanced prosody and clarity.' },
                          ].map(({ id, name, provider, desc }) => (
                            <div key={id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{name}</p>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{provider}</span>
                              </div>
                              <code className="text-[10px] text-violet-600 dark:text-violet-400 font-mono">{id}</code>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.ttsJS} lang="JavaScript" id="tts-js" />
                  <CodeBlock code={codeExamples.ttsPython} lang="Python" id="tts-python" />
                  <CodeBlock code={codeExamples.ttsCurl} lang="cURL" id="tts-curl" />
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black mt-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10">
            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5">
              <Link href="/" className="inline-flex items-center gap-1.5 group">
                <FaTerminal className="w-4 h-4 text-blue-500 group-hover:text-cyan-500 transition-colors duration-200" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">Aichixia</h3>
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">AI API Platform</p>
                </div>
              </Link>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center">
                © {new Date().getFullYear()} Aichixia. All rights reserved.
              </p>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <a href="mailto:contact@aichixia.xyz" className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Contact</a>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Link href="/privacy" className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Privacy</Link>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Link href="/terms" className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Terms</Link>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Link href="/security" className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Security</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
