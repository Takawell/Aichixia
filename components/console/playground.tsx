import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiCopy, FiCheck, FiChevronDown, FiZap, FiCode, FiTerminal, FiSettings, FiClock, FiCpu, FiAlertCircle, FiRotateCcw, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiAirbrake } from 'react-icons/si';
import { GiSpermWhale, GiPowerLightning, GiClover, GiCloverSpiked } from 'react-icons/gi';
import { TbSquareLetterZ, TbLetterM } from 'react-icons/tb';
import { FaXTwitter } from 'react-icons/fa6';

const base = 'https://www.aichixia.xyz';

const TEXT_MODELS = [
  { id: 'aichixia-thinking', name: 'Aichixia 411B', provider: 'Aichixia', icon: SiAirbrake, color: 'from-blue-600 via-blue-800 to-slate-900', pricing: 'Premium', context: '128K' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', icon: GiSpermWhale, color: 'from-cyan-500 to-blue-600', pricing: 'Premium', context: '128K' },
  { id: 'deepseek-v3.1', name: 'DeepSeek V3.1', provider: 'DeepSeek', icon: GiSpermWhale, color: 'from-cyan-600 to-teal-600', pricing: 'Standard', context: '128K' },
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', icon: SiAnthropic, color: 'from-orange-500 to-amber-600', pricing: 'Premium', context: '200K' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google', icon: SiGooglegemini, color: 'from-indigo-500 to-purple-600', pricing: 'Budget', context: '1M' },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', icon: SiOpenai, color: 'from-emerald-500 to-green-600', pricing: 'Budget', context: '400K' },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'Moonshot', icon: GiCloverSpiked, color: 'from-blue-500 to-cyan-600', pricing: 'Premium', context: '256K' },
  { id: 'glm-4.7', name: 'GLM 4.7', provider: 'Zhipu', icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-800', pricing: 'Standard', context: '200K' },
  { id: 'mistral-3.1', name: 'Mistral 3.1', provider: 'Mistral AI', icon: TbLetterM, color: 'from-orange-500 to-amber-500', pricing: 'Standard', context: '128K' },
  { id: 'qwen3-235b', name: 'Qwen3 235B', provider: 'Alibaba', icon: SiAlibabacloud, color: 'from-purple-500 to-pink-500', pricing: 'Premium', context: '256K' },
  { id: 'qwen3-coder-480b', name: 'Qwen3 Coder 480B', provider: 'Alibaba', icon: SiAlibabacloud, color: 'from-purple-600 to-fuchsia-600', pricing: 'Premium', context: '256K' },
  { id: 'minimax-m2.1', name: 'MiniMax M2.1', provider: 'MiniMax', icon: GiClover, color: 'from-cyan-600 to-blue-600', pricing: 'Premium', context: '200K' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta', icon: SiMeta, color: 'from-blue-600 to-indigo-700', pricing: 'Standard', context: '130K' },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'OpenAI', icon: SiOpenai, color: 'from-pink-600 to-rose-600', pricing: 'Budget', context: '128K' },
  { id: 'mimo-v2-flash', name: 'MiMo V2 Flash', provider: 'Xiaomi', icon: FiZap, color: 'from-blue-600 to-purple-600', pricing: 'Budget', context: '256K' },
  { id: 'groq-compound', name: 'Groq Compound', provider: 'Groq', icon: GiPowerLightning, color: 'from-orange-600 to-red-600', pricing: 'Standard', context: '131K' },
  { id: 'cohere-command-a', name: 'Cohere Command A', provider: 'Cohere', icon: GiClover, color: 'from-emerald-600 to-teal-600', pricing: 'Standard', context: '256K' },
  { id: 'grok-3', name: 'Grok 3', provider: 'xAI', icon: FaXTwitter, color: 'from-slate-600 to-zinc-700', pricing: 'Premium', context: '128K' },
];

const PRICING_STYLE: Record<string, string> = {
  Premium: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  Standard: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
  Budget: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
};

type Lang = 'typescript' | 'python' | 'curl' | 'ruby' | 'go' | 'php';

const LANGS: { id: Lang; label: string }[] = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'curl', label: 'cURL' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'go', label: 'Go' },
  { id: 'php', label: 'PHP' },
];

function generateCode(lang: Lang, model: string, message: string, apiKey: string, temperature: number, maxTokens: number): string {
  const key = apiKey || 'YOUR_API_KEY';
  const msg = message.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

  if (lang === 'typescript') return `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "${key}",
  baseURL: "${base}/api/v1",
});

const response = await client.chat.completions.create({
  model: "${model}",
  messages: [{ role: "user", content: "${msg}" }],
  temperature: ${temperature},
  max_tokens: ${maxTokens},
});

console.log(response.choices[0].message.content);`;

  if (lang === 'python') return `from openai import OpenAI

client = OpenAI(
    api_key="${key}",
    base_url="${base}/api/v1",
)

response = client.chat.completions.create(
    model="${model}",
    messages=[{"role": "user", "content": "${msg}"}],
    temperature=${temperature},
    max_tokens=${maxTokens},
)

print(response.choices[0].message.content)`;

  if (lang === 'curl') return `curl -X POST ${base}/api/v1/chat/completions \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model}",
    "messages": [{"role": "user", "content": "${msg}"}],
    "temperature": ${temperature},
    "max_tokens": ${maxTokens}
  }'`;

  if (lang === 'ruby') return `require "openai"

client = OpenAI::Client.new(
  access_token: "${key}",
  uri_base: "${base}/api/v1",
)

response = client.chat(
  parameters: {
    model: "${model}",
    messages: [{ role: "user", content: "${msg}" }],
    temperature: ${temperature},
    max_tokens: ${maxTokens},
  }
)

puts response.dig("choices", 0, "message", "content")`;

  if (lang === 'go') return `package main

import (
  "context"
  "fmt"
  openai "github.com/sashabaranov/go-openai"
)

func main() {
  config := openai.DefaultConfig("${key}")
  config.BaseURL = "${base}/api/v1"
  client := openai.NewClientWithConfig(config)

  resp, _ := client.CreateChatCompletion(
    context.Background(),
    openai.ChatCompletionRequest{
      Model: "${model}",
      Messages: []openai.ChatCompletionMessage{
        {Role: openai.ChatMessageRoleUser, Content: "${msg}"},
      },
      Temperature: ${temperature},
      MaxTokens:   ${maxTokens},
    },
  )

  fmt.Println(resp.Choices[0].Message.Content)
}`;

  if (lang === 'php') return `<?php
require_once 'vendor/autoload.php';

$client = OpenAI::factory()
    ->withApiKey('${key}')
    ->withBaseUri('${base}/api/v1')
    ->make();

$response = $client->chat()->create([
    'model' => '${model}',
    'messages' => [
        ['role' => 'user', 'content' => '${msg}'],
    ],
    'temperature' => ${temperature},
    'max_tokens' => ${maxTokens},
]);

echo $response->choices[0]->message->content;`;

  return '';
}

type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'plain';
type Token = { type: TokenType; value: string };

const KEYWORDS: Record<Lang, string[]> = {
  typescript: ['import','from','const','let','var','async','await','new','return','function','export','default','true','false','null','undefined','typeof','instanceof'],
  python: ['import','from','def','class','return','with','as','await','async','True','False','None','print','if','else','elif','for','while','in','not','and','or'],
  curl: ['curl','POST','GET','PUT','DELETE','PATCH'],
  ruby: ['require','def','end','puts','do','class','module','return','true','false','nil','if','else','unless','then'],
  go: ['package','import','func','return','var','const','type','struct','interface','true','false','nil','if','else','for','range','map','chan','go','defer'],
  php: ['echo','require_once','true','false','null','new','return','function','class','if','else','foreach','while'],
};

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword:  'text-purple-500 dark:text-purple-400',
  string:   'text-emerald-600 dark:text-emerald-400',
  number:   'text-orange-500 dark:text-orange-400',
  comment:  'text-zinc-400 dark:text-zinc-500 italic',
  function: 'text-sky-500 dark:text-sky-400',
  operator: 'text-zinc-500 dark:text-zinc-400',
  plain:    'text-zinc-700 dark:text-zinc-300',
};

function tokenizeLine(line: string, lang: Lang): Token[] {
  const kwSet = new Set(KEYWORDS[lang]);
  const tokens: Token[] = [];
  let i = 0;

  const isCommentStart = (s: string): boolean => {
    if ((lang === 'typescript' || lang === 'go' || lang === 'php' || lang === 'ruby') && s.startsWith('//')) return true;
    if ((lang === 'python' || lang === 'ruby') && s[0] === '#') return true;
    if (lang === 'curl' && s[0] === '#') return true;
    return false;
  };

  while (i < line.length) {
    const rest = line.slice(i);

    if (isCommentStart(rest)) {
      tokens.push({ type: 'comment', value: rest });
      break;
    }

    if (rest[0] === '"' || rest[0] === "'" || rest[0] === '`') {
      const q = rest[0];
      let j = 1;
      while (j < rest.length) {
        if (rest[j] === '\\') { j += 2; continue; }
        if (rest[j] === q) { j++; break; }
        j++;
      }
      tokens.push({ type: 'string', value: rest.slice(0, j) });
      i += j;
      continue;
    }

    const numMatch = rest.match(/^\d+\.?\d*/);
    if (numMatch && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1]))) {
      tokens.push({ type: 'number', value: numMatch[0] });
      i += numMatch[0].length;
      continue;
    }

    const wordMatch = rest.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      const after = line[i + word.length];
      if (kwSet.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (after === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i += word.length;
      continue;
    }

    const opMatch = rest.match(/^[{}[\]().,;:=<>!+\-*/%&|^~?\\@]+/);
    if (opMatch) {
      tokens.push({ type: 'operator', value: opMatch[0] });
      i += opMatch[0].length;
      continue;
    }

    tokens.push({ type: 'plain', value: rest[0] });
    i++;
  }

  return tokens;
}

function CodeHighlight({ code, lang }: { code: string; lang: Lang }) {
  const lines = code.split('\n');
  return (
    <code className="block w-full">
      {lines.map((line, lineIdx) => {
        const tokens = tokenizeLine(line, lang);
        return (
          <div key={lineIdx} className="flex w-full min-w-0">
            <span className="w-7 sm:w-8 text-right text-zinc-400 dark:text-zinc-600 select-none mr-3 flex-shrink-0 tabular-nums text-[9px] sm:text-[10px] leading-5 pt-px">
              {lineIdx + 1}
            </span>
            <span className="flex-1 min-w-0 break-words whitespace-pre-wrap leading-5 text-[10px] sm:text-xs">
              {tokens.length > 0
                ? tokens.map((tok, ti) => (
                    <span key={ti} className={TOKEN_COLORS[tok.type]}>{tok.value}</span>
                  ))
                : <span>&nbsp;</span>
              }
            </span>
          </div>
        );
      })}
    </code>
  );
}

type PlaygroundProps = {
  keys?: { key: string; name: string; is_active: boolean }[];
};

export default function Playground({ keys = [] }: PlaygroundProps) {
  const [selectedModel, setSelectedModel] = useState(TEXT_MODELS[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [message, setMessage] = useState('Explain quantum computing in simple terms.');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystem, setShowSystem] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'code'>('response');
  const [activeLang, setActiveLang] = useState<Lang>('typescript');
  const [copied, setCopied] = useState<string | null>(null);
  const [modelSearch, setModelSearch] = useState('');
  const modelDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelDropRef.current && !modelDropRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredModels = TEXT_MODELS.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRun = async () => {
    if (!apiKey.trim()) { setError('Please enter your API key'); return; }
    if (!message.trim()) { setError('Please enter a message'); return; }
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setLatency(null);
    const t0 = Date.now();

    try {
      const messages: any[] = [];
      if (systemPrompt.trim()) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: message });

      const res = await fetch(`${base}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      const data = await res.json();
      const ms = Date.now() - t0;
      setLatency(ms);

      if (!res.ok) {
        setError(data.error?.message || `Error ${res.status}`);
      } else {
        setResponse(data);
        setActiveTab('response');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const responseText = response?.choices?.[0]?.message?.content ?? '';
  const tokensUsed = response?.usage?.total_tokens ?? null;
  const ModelIcon = selectedModel.icon as any;

  return (
    <div className="space-y-3 sm:space-y-4 min-h-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">API Playground</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Test models live with your API key</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white/80 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-1.5 mb-1">
              <FiSettings className="w-3 h-3 text-zinc-400" />
              <span className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Configuration</span>
            </div>

            <div ref={modelDropRef} className="relative">
              <label className="block text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Model</label>
              <button
                onClick={() => setModelOpen(!modelOpen)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-br ${selectedModel.color} flex items-center justify-center flex-shrink-0`}>
                    <ModelIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs font-bold text-zinc-900 dark:text-white truncate">{selectedModel.name}</div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-500 truncate">{selectedModel.provider} · {selectedModel.context}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                  <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${PRICING_STYLE[selectedModel.pricing]}`}>
                    {selectedModel.pricing}
                  </span>
                  <FiChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${modelOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {modelOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                    <input
                      type="text"
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      placeholder="Search models..."
                      className="w-full px-2.5 py-1.5 text-[10px] sm:text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:border-sky-400 dark:focus:border-sky-500 text-zinc-900 dark:text-white placeholder-zinc-400 transition-colors"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredModels.map(model => {
                      const Icon = model.icon as any;
                      return (
                        <button
                          key={model.id}
                          onClick={() => { setSelectedModel(model); setModelOpen(false); setModelSearch(''); }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 text-left group ${
                            selectedModel.id === model.id
                              ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-semibold text-zinc-900 dark:text-white truncate">{model.name}</div>
                            <div className="text-[9px] text-zinc-500 dark:text-zinc-500 truncate">{model.provider} · {model.context}</div>
                          </div>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded border flex-shrink-0 ${PRICING_STYLE[model.pricing]}`}>
                            {model.pricing}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="acv-••••••••••••••••"
                  className="w-full pr-8 px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-400/20 outline-none transition-all"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showKey ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                </button>
              </div>
              {keys.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {keys.filter(k => k.is_active).slice(0, 3).map(k => (
                    <button
                      key={k.key}
                      onClick={() => setApiKey(k.key)}
                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors font-medium"
                    >
                      {k.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setShowSystem(!showSystem)}
                className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-1"
              >
                <FiChevronDown className={`w-3 h-3 transition-transform duration-200 ${showSystem ? 'rotate-180' : ''}`} />
                System Prompt <span className="text-[9px] font-normal text-zinc-400">(optional)</span>
              </button>
              {showSystem && (
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={2}
                  placeholder="You are a helpful assistant..."
                  className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-400/20 outline-none transition-all resize-none"
                />
              )}
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Enter your prompt..."
                className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-1 focus:ring-sky-400/20 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400">Temperature</label>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tabular-nums">{temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-800 accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between mt-0.5">
                  <span className="text-[8px] text-zinc-400">Precise</span>
                  <span className="text-[8px] text-zinc-400">Creative</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400">Max Tokens</label>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tabular-nums">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="4096"
                  step="64"
                  value={maxTokens}
                  onChange={e => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-800 accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between mt-0.5">
                  <span className="text-[8px] text-zinc-400">64</span>
                  <span className="text-[8px] text-zinc-400">4096</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-0.5">
              <button
                onClick={handleRun}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-[10px] sm:text-xs shadow-lg hover:shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <FiPlay className="w-3 h-3" />
                    <span>Run</span>
                  </>
                )}
              </button>
              <button
                onClick={() => { setResponse(null); setError(null); setLatency(null); }}
                className="px-2.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all duration-200"
                title="Clear"
              >
                <FiRotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="bg-white/80 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setActiveTab('response')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                    activeTab === 'response'
                      ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <FiTerminal className="w-3 h-3" />
                  Response
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                    activeTab === 'code'
                      ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <FiCode className="w-3 h-3" />
                  Code
                </button>
              </div>

              {(latency || tokensUsed) && (
                <div className="flex items-center gap-2">
                  {latency && (
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      <FiClock className="w-2.5 h-2.5" />
                      {latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`}
                    </div>
                  )}
                  {tokensUsed && (
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      <FiCpu className="w-2.5 h-2.5" />
                      {tokensUsed} tokens
                    </div>
                  )}
                </div>
              )}
            </div>

            {activeTab === 'response' && (
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-[280px] sm:min-h-[360px]">
                {!response && !error && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
                      <FiTerminal className="w-5 h-5 text-zinc-400" />
                    </div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Configure and run your request</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Response will appear here</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <div className="relative w-10 h-10 mb-3">
                      <div className="absolute inset-0 rounded-full border-2 border-sky-200 dark:border-sky-900" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-sky-500 border-transparent animate-spin" />
                    </div>
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Processing request...</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{selectedModel.name}</p>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                    <div className="flex gap-2">
                      <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-0.5">Error</p>
                        <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {response && responseText && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded bg-gradient-to-br ${selectedModel.color} flex items-center justify-center`}>
                          <ModelIcon className="w-2 h-2 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">{selectedModel.name}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(responseText, 'response')}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        {copied === 'response' ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
                        {copied === 'response' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-[10px] sm:text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 p-3">
                      {responseText}
                    </div>
                    {response.usage && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[
                          { label: 'Prompt', val: response.usage.prompt_tokens },
                          { label: 'Completion', val: response.usage.completion_tokens },
                          { label: 'Total', val: response.usage.total_tokens },
                        ].map(item => item.val != null && (
                          <div key={item.label} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-400">{item.label}:</span>
                            <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">{item.val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center gap-0.5 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60 overflow-x-auto flex-shrink-0">
                  {LANGS.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setActiveLang(lang.id)}
                      className={`px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-semibold whitespace-nowrap transition-all duration-150 ${
                        activeLang === lang.id
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                  <button
                    onClick={() => handleCopy(generateCode(activeLang, selectedModel.id, message, apiKey, temperature, maxTokens), 'code')}
                    className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    {copied === 'code' ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
                    {copied === 'code' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[280px] sm:min-h-[320px]">
                  <pre className="p-3 sm:p-4 font-mono w-full min-w-0">
                    <CodeHighlight
                      code={generateCode(activeLang, selectedModel.id, message, apiKey, temperature, maxTokens)}
                      lang={activeLang}
                    />
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
