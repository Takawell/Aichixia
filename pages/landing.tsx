import { useState, useEffect } from "react";
import { FaTerminal, FaPlay, FaCode, FaBook, FaRocket, FaArrowRight, FaMoon, FaSun, FaBars, FaTimes, FaCopy, FaCheck, FaKey, FaServer, FaGlobe, FaChevronDown } from "react-icons/fa";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://www.aichixia.xyz";

const models = [
  { id: "deepseek-v3.2", name: "DeepSeek V3.2", provider: "DeepSeek", description: "Deep reasoning and code generation" },
  { id: "claude-opus-4.5", name: "Claude Opus 4.5", provider: "Anthropic", description: "World's #1 AI model for complex tasks" },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google", description: "Multimodal understanding and accuracy" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI", description: "Balanced performance for general tasks" },
  { id: "kimi-k2", name: "Kimi K2", provider: "Moonshot", description: "Superior tool calling and reasoning" },
  { id: "qwen3-235b", name: "Qwen3 235B", provider: "Alibaba", description: "Large multilingual model" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Meta", description: "Efficient open-source powerhouse" },
  { id: "mistral-3.1", name: "Mistral 3.1", provider: "Mistral AI", description: "Fast inference with European focus" },
];

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek-v3.2");
  const [message, setMessage] = useState("Explain quantum computing in simple terms");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleSendRequest = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();

    try {
      const res = await fetch(`${base}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: message }],
          temperature: 0.8,
          max_tokens: 1080,
        }),
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (!res.ok) {
        setError(data.error?.message || "Request failed");
      } else {
        setResponse({ ...data, latency });
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurl = () => {
    return `curl -X POST ${base}/api/v1/chat/completions \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel}",
    "messages": [
      {"role": "user", "content": "${message}"}
    ]
  }'`;
  };

  const copyToClipboard = (text: string, type: 'request' | 'response') => {
    navigator.clipboard.writeText(text);
    if (type === 'request') {
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <FaTerminal className="w-3.5 h-3.5 text-white" />
              </div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-white">Aichixia API</h1>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/docs"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaBook className="w-3 h-3" />
                Docs
              </Link>
              <Link
                href="/console"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaTerminal className="w-3 h-3" />
                Console
              </Link>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {isDark ? <FaSun className="w-3.5 h-3.5 text-zinc-400" /> : <FaMoon className="w-3.5 h-3.5 text-zinc-600" />}
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <div className="px-3 py-2 space-y-1">
              <Link
                href="/docs"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <FaBook className="w-3 h-3" />
                Docs
              </Link>
              <Link
                href="/console"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <FaTerminal className="w-3 h-3" />
                Console
              </Link>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                {isDark ? <FaSun className="w-3 h-3" /> : <FaMoon className="w-3 h-3" />}
                {isDark ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-black dark:to-cyan-950/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTIyIDIydi0yaDJ2MmgtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 dark:opacity-20" />
        
        <div className="relative max-w-5xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 mb-3">
              <FaRocket className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">18+ AI Models</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
              Build with the best
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                AI models
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              Access DeepSeek, Claude, Gemini through OpenAI-compatible API
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                href="/console"
                className="group flex items-center gap-1.5 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaKey className="w-3 h-3" />
                Get API Key
                <FaArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <FaBook className="w-3 h-3" />
                View Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FaPlay className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">Interactive Playground</h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Test our API with your own key</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-3">
          <div className="space-y-3 min-w-0">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-900 dark:text-white mb-1.5">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKeyInput ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    <FaKey className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-900 dark:text-white mb-1.5">Model</label>
                <button
                  onClick={() => setShowModelModal(true)}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-left text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between"
                >
                  <span className="truncate">{selectedModelData?.name} ({selectedModelData?.provider})</span>
                  <FaChevronDown className="w-2.5 h-2.5 text-zinc-500 flex-shrink-0 ml-2" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-900 dark:text-white mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter your message..."
                />
              </div>

              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPlay className="w-2.5 h-2.5" />
                    Send Request
                  </>
                )}
              </button>

              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg">
                  <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="flex items-center gap-1.5">
                  <FaCode className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">cURL</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateCurl(), 'request')}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  {copiedRequest ? (
                    <FaCheck className="w-2.5 h-2.5 text-green-500" />
                  ) : (
                    <FaCopy className="w-2.5 h-2.5 text-zinc-500" />
                  )}
                </button>
              </div>
              <div className="p-2.5 overflow-x-auto">
                <SyntaxHighlighter
                  language="bash"
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                    fontSize: '10px',
                  }}
                  wrapLongLines={true}
                >
                  {generateCurl()}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="flex items-center gap-1.5">
                  <FaTerminal className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Response</span>
                </div>
                {response && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(response, null, 2), 'response')}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                  >
                    {copiedResponse ? (
                      <FaCheck className="w-2.5 h-2.5 text-green-500" />
                    ) : (
                      <FaCopy className="w-2.5 h-2.5 text-zinc-500" />
                    )}
                  </button>
                )}
              </div>
              <div className="p-3">
                {!response && !error && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-2">
                      <FaTerminal className="w-4 h-4 text-zinc-400" />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Response will appear here</p>
                  </div>
                )}

                {response && (
                  <div className="space-y-3">
                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <p className="text-xs text-zinc-900 dark:text-white leading-relaxed break-words">
                        {response.choices?.[0]?.message?.content || "No content"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">Tokens</div>
                        <div className="text-base font-bold text-blue-700 dark:text-blue-300">
                          {response.usage?.total_tokens || 0}
                        </div>
                      </div>
                      <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-900/30">
                        <div className="text-xs text-cyan-600 dark:text-cyan-400 mb-0.5">Latency</div>
                        <div className="text-base font-bold text-cyan-700 dark:text-cyan-300">
                          {response.latency || 0}ms
                        </div>
                      </div>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        View full response
                      </summary>
                      <div className="mt-2 p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                        <pre className="text-[10px] text-zinc-700 dark:text-zinc-300">
                          {JSON.stringify(response, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/10 dark:to-zinc-950">
            <div className="flex items-start gap-2.5">
              <FaKey className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mb-0.5">Authentication</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Use Bearer token in Authorization header
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/10 dark:to-zinc-950">
            <div className="flex items-start gap-2.5">
              <FaServer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mb-0.5">Rate Limits</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  1,000 requests/day with API key
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/10 dark:to-zinc-950">
            <div className="flex items-start gap-2.5">
              <FaGlobe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mb-0.5">OpenAI Compatible</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Drop-in replacement for OpenAI SDK
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowModelModal(false)}>
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-zinc-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Select Model</h3>
              <button
                onClick={() => setShowModelModal(false)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <FaTimes className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelModal(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-colors mb-2 ${
                    selectedModel === model.id
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500 dark:border-blue-400'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{model.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{model.provider}</div>
                    </div>
                    {selectedModel === model.id && (
                      <FaCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{model.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-12">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <FaTerminal className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Aichixia API</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Modern AI Infrastructure</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/docs"
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/console"
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Console
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              © {new Date().getFullYear()} Aichixia. All Right reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
