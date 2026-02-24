import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaSearch, FaCopy, FaCheck, FaChevronDown, FaChevronRight, FaTerminal, FaBolt, FaStar, FaBook, FaMoon, FaSun, FaBars, FaTimes, FaKey, FaServer, FaGlobe, FaMicrophone, FaImage, FaCode, FaShieldAlt, FaClock, FaCheckCircle, FaRocket, FaLayerGroup, FaDatabase, FaPlay } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://www.aichixia.xyz";

export default function Docs() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'models' | 'quickstart'>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('chat-completions');

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDark(theme === 'dark');
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
    chatCompletionsJS: `const response = await fetch('${base}/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'claude-opus-4.5',
    messages: [
      { role: 'user', content: 'Explain quantum computing' }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`,

    chatCompletionsPython: `import requests

response = requests.post(
    '${base}/api/v1/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'model': 'claude-opus-4.5',
        'messages': [
            {'role': 'user', 'content': 'Explain quantum computing'}
        ],
        'temperature': 0.7,
        'max_tokens': 1000
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`,

    modelsListJS: `const response = await fetch('${base}/api/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const models = await response.json();
console.log(models.data);`,

    modelsListPython: `import requests

response = requests.get(
    '${base}/api/v1/models',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

models = response.json()
print(models['data'])`,

    imageGenerationJS: `const response = await fetch('${base}/api/models/flux', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prompt: 'A serene landscape with mountains',
    steps: 4
  })
});

const data = await response.json();
console.log(data.imageBase64);`,

    voiceGenerationJS: `const response = await fetch('${base}/api/models/starling', {
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

    streamingJS: `const response = await fetch('${base}/api/v1/chat/completions', {
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
}`
  };

  return (
    <>
      <Head>
        <title>API Documentation - Aichixia Developer Docs</title>
        <meta name="description" content="Complete API reference for Aichixia. Learn how to integrate text models, image generation, voice synthesis, and more." />
      </Head>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}} />

      <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
        <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-12 sm:h-14">
              <Link href="/" className="flex items-center gap-1.5 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-blue-500/25 group-hover:scale-105 transition-all duration-200"><FaTerminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" /></div>
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
                <Link href="/" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/console" className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                  Console
                </Link>
              </nav>
            </div>
          )}
        </header>

        <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-black dark:to-cyan-950/20"><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_70%)]" />
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
                Complete guide to integrating Aichixia's AI models. Chat, images, voice, and more—all through one unified API.
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">OpenAI Compatible</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">20+ Models</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Streaming SSE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-20 space-y-2">
                <button
                  onClick={() => setActiveTab('quickstart')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'quickstart'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <FaRocket className="w-3.5 h-3.5" />
                  Quick Start
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <FaTerminal className="w-3.5 h-3.5" />
                  Chat Completions
                </button>
                <button
                  onClick={() => setActiveTab('models')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTab === 'models'
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <FaLayerGroup className="w-3.5 h-3.5" />
                  Models & Media
                </button>
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
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mb-3">
                        <FaKey className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">1. Get API Key</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Sign up and generate your free API key from the console</p>
                    </div>
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mb-3">
                        <FaCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">2. Make Request</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Use any OpenAI SDK or HTTP client to call our API</p>
                    </div>
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center mb-3">
                        <FaCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">3. Ship Fast</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Deploy your AI features with confidence and scale</p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Installation</h3>
                      <button
                        onClick={() => copyToClipboard('npm install openai', 'install')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                      >
                        {copiedCode === 'install' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                      </button>
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 overflow-x-auto">
                      <code className="text-xs text-zinc-800 dark:text-zinc-200">npm install openai</code>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">First Request (JavaScript)</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.chatCompletionsJS, 'quickstart-js')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                      >
                        {copiedCode === 'quickstart-js' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                      </button>
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          padding: '12px',
                          background: 'transparent',
                          fontSize: '11px',
                        }}
                        wrapLongLines={true}
                      >
                        {codeExamples.chatCompletionsJS}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Using OpenAI SDK (Python)</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.chatCompletionsOpenAI, 'quickstart-openai')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                      >
                        {copiedCode === 'quickstart-openai' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                      </button>
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <SyntaxHighlighter
                        language="python"
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          padding: '12px',
                          background: 'transparent',
                          fontSize: '11px',
                        }}
                        wrapLongLines={true}
                      >
                        {codeExamples.chatCompletionsOpenAI}
                      </SyntaxHighlighter>
                    </div>
                  </div>
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
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => toggleSection('chat-request')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'chat-request' ? 'rotate-90' : ''}`} />
                    </button>

                    {expandedSection === 'chat-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <code className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">model</code>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-medium">required</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Model ID to use (e.g., claude-opus-4.5, gpt-5-mini, deepseek-v3.2)</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <code className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">messages</code>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-medium">required</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Array of message objects with role (system/user/assistant) and content</p>
                        </div>

                        <div className="space-y-2">
                          <code className="text-xs font-mono text-blue-600 dark:text-blue-400">temperature</code>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Sampling temperature (0-2). Higher = more creative. Default: 1</p>
                        </div>

                        <div className="space-y-2">
                          <code className="text-xs font-mono text-blue-600 dark:text-blue-400">max_tokens</code>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Maximum tokens to generate. Default: model's max</p>
                        </div>

                        <div className="space-y-2">
                          <code className="text-xs font-mono text-blue-600 dark:text-blue-400">stream</code>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Enable streaming responses. Default: false</p>
                        </div>

                        <div className="space-y-2">
                          <code className="text-xs font-mono text-blue-600 dark:text-blue-400">top_p</code>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Nucleus sampling (0-1). Alternative to temperature</p>
                        </div>
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
                          <SyntaxHighlighter
                            language="json"
                            style={isDark ? oneDark : oneLight}
                            customStyle={{
                              margin: 0,
                              padding: '12px',
                              background: 'transparent',
                              fontSize: '11px',
                            }}
                          >
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
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Python Example</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.chatCompletionsPython, 'chat-python')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                      >
                        {copiedCode === 'chat-python' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                      </button>
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <SyntaxHighlighter
                        language="python"
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          padding: '12px',
                          background: 'transparent',
                          fontSize: '11px',
                        }}
                        wrapLongLines={true}
                      >
                        {codeExamples.chatCompletionsPython}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Streaming Example</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.streamingJS, 'streaming')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                      >
                        {copiedCode === 'streaming' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                      </button>
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          padding: '12px',
                          background: 'transparent',
                          fontSize: '11px',
                        }}
                        wrapLongLines={true}
                      >
                        {codeExamples.streamingJS}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'models' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Models & Media API</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      List available models and generate images, voice, and other media types.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-xl border-l-4 border-purple-500 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/50">
                      <div className="flex items-start gap-3">
                        <FaLayerGroup className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">List Models Endpoint</h4>
                          <code className="text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">GET {base}/api/v1/models</code>
                          <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">Returns all available models including text, image, voice, and multimodal models.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">List Models (JavaScript)</h3>
                        <button
                          onClick={() => copyToClipboard(codeExamples.modelsListJS, 'models-js')}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                        >
                          {copiedCode === 'models-js' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                        </button>
                      </div>
                      <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                        <SyntaxHighlighter
                          language="javascript"
                          style={isDark ? oneDark : oneLight}
                          customStyle={{
                            margin: 0,
                            padding: '12px',
                            background: 'transparent',
                            fontSize: '11px',
                          }}
                          wrapLongLines={true}
                        >
                          {codeExamples.modelsListJS}
                        </SyntaxHighlighter>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Response Format</h3>
                      </div>
                      <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                        <SyntaxHighlighter
                          language="json"
                          style={isDark ? oneDark : oneLight}
                          customStyle={{
                            margin: 0,
                            padding: '12px',
                            background: 'transparent',
                            fontSize: '11px',
                          }}
                        >
{`{
  "object": "list",
  "data": [
    {
      "id": "claude-opus-4.5",
      "object": "model",
      "created": 1677610602,
      "owned_by": "anthropic",
      "capabilities": ["chat", "multimodal"]
    },
    {
      "id": "flux",
      "object": "model",
      "created": 1698785189,
      "owned_by": "black forest",
      "capabilities": ["image-generation"]
    },
    {
      "id": "starling",
      "object": "model",
      "created": 1699053241,
      "owned_by": "typecast",
      "capabilities": ["text-to-speech"]
    }
  ]
}`}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-sm hover:shadow-pink-500/5 transition-all duration-200 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/10 dark:to-zinc-950">
                      <FaImage className="w-5 h-5 text-pink-600 dark:text-pink-400 mb-3" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Image Generation</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">Generate images from text prompts using Flux 2 and other models</p>
                      <code className="text-xs text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded block">{"POST /api/models/{name}"}</code>
                    </div>

                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-sm hover:shadow-green-500/5 transition-all duration-200 bg-gradient-to-br from-green-50 to-white dark:from-green-950/10 dark:to-zinc-950">
                      <FaMicrophone className="w-5 h-5 text-green-600 dark:text-green-400 mb-3" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Voice Synthesis</h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">Convert text to natural-sounding speech in multiple voices</p>
                      <code className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded block">{"POST /api/models/{name}"}</code>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Image Generation Example</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.imageGenerationJS, 'image-gen')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                      >
                        {copiedCode === 'image-gen' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                      </button>
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          padding: '12px',
                          background: 'transparent',
                          fontSize: '11px',
                        }}
                        wrapLongLines={true}
                      >
                        {codeExamples.imageGenerationJS}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Voice Synthesis Example</h3>
                      <button
                        onClick={() => copyToClipboard(codeExamples.voiceGenerationJS, 'voice-gen')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-150"
                      >
                        {copiedCode === 'voice-gen' ? <><FaCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><FaCopy className="w-3 h-3" /><span>Copy</span></>}
                      </button>
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          padding: '12px',
                          background: 'transparent',
                          fontSize: '11px',
                        }}
                        wrapLongLines={true}
                      >
                        {codeExamples.voiceGenerationJS}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => toggleSection('tts-params')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <FaMicrophone className="w-3.5 h-3.5 text-zinc-400" />
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">TTS Request Parameters</h3>
                      </div>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'tts-params' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'tts-params' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 animate-fade-in-up">
                        {[
                          { name: 'text', required: true, desc: 'The text to convert to speech' },
                          { name: 'emotion', required: false, desc: 'Emotional tone — neutral, happy, sad, angry, fearful. Default: neutral' },
                          { name: 'volume', required: false, desc: 'Output volume 0–100. Default: 100' },
                          { name: 'pitch', required: false, desc: 'Pitch adjustment. Default: 0' },
                          { name: 'tempo', required: false, desc: 'Speech speed multiplier. Default: 1.0' },
                        ].map(({ name, required, desc }, i, arr) => (
                          <div key={name} className={`flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 py-2 ${i < arr.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/60' : ''}`}>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <code className="text-xs font-mono font-semibold text-green-600 dark:text-green-400">{name}</code>
                              {required && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold">required</span>}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black mt-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10">
            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5">
              <Link href="/" className="inline-flex items-center gap-1.5 group">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-blue-500/25 group-hover:scale-105 transition-all duration-200"><FaTerminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" /></div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">Aichixia</h3>
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">AI API Platform</p>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center">
                © {new Date().getFullYear()} Aichixia. All rights reserved.
              </p>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <a 
                  href="mailto:contact@aichixia.xyz"
                  className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Contact
                </a>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Link 
                  href="/privacy" 
                  className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Privacy
                </Link>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Link 
                  href="/terms" 
                  className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Terms
                </Link>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <Link 
                  href="/security" 
                  className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Security
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
