import { useState, useEffect } from "react";
import { FaSearch, FaCopy, FaCheck, FaChevronDown, FaChevronRight, FaTerminal, FaBolt, FaStar, FaBook, FaMoon, FaSun, FaBars, FaTimes, FaKey, FaServer, FaGlobe, FaMicrophone, FaImage } from "react-icons/fa";
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiAirbrake, SiMaze, SiXiaomi, SiDigikeyelectronics } from "react-icons/si";
import { GiSpermWhale, GiPowerLightning, GiClover } from "react-icons/gi";
import { TbSquareLetterZ, TbLetterM } from "react-icons/tb";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://www.aichixia.xyz";

type CodeLanguage = 'javascript' | 'python' | 'bash' | 'php';

interface ModelInfo {
  speed: number;
  quality: number;
  useCase: string;
  contextWindow?: string;
}

interface EndpointData {
  id: string;
  method: string;
  path: string;
  title: string;
  description: string;
  category: string;
  note?: string;
  modelInfo?: ModelInfo;
  icon: any;
  color: string;
  provider?: string;
}

const chatModels: EndpointData[] = [
  {
    id: "deepseek-v3.2",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "DeepSeek V3.2",
    description: "Deep reasoning and code generation",
    category: "chat",
    modelInfo: { speed: 3, quality: 5, useCase: "Complex reasoning and coding tasks", contextWindow: "128k" },
    icon: GiSpermWhale,
    color: "from-cyan-600 to-blue-600",
    provider: "DeepSeek"
  },
  {
    id: "deepseek-v3.1",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "DeepSeek V3.1",
    description: "Previous generation DeepSeek model",
    category: "chat",
    modelInfo: { speed: 3, quality: 5, useCase: "Reasoning and analysis tasks", contextWindow: "128k" },
    icon: GiSpermWhale,
    color: "from-cyan-600 to-teal-600",
    provider: "DeepSeek"
  },
  {
    id: "gpt-5-mini",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "GPT-5 Mini",
    description: "Balanced performance for general tasks",
    category: "chat",
    modelInfo: { speed: 3, quality: 4, useCase: "General purpose conversations", contextWindow: "128k" },
    icon: SiOpenai,
    color: "from-emerald-600 to-green-600",
    provider: "OpenAI"
  },
  {
    id: "claude-opus-4.5",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Claude Opus 4.5",
    description: "World's #1 AI model for complex tasks",
    category: "chat",
    modelInfo: { speed: 3, quality: 5, useCase: "Complex reasoning and analysis", contextWindow: "200k" },
    icon: SiAnthropic,
    color: "from-orange-600 to-amber-700",
    provider: "Anthropic"
  },
  {
    id: "gemini-3-flash",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Gemini 3 Flash",
    description: "Multimodal understanding and accuracy",
    category: "chat",
    modelInfo: { speed: 4, quality: 5, useCase: "Fast multimodal processing", contextWindow: "1M" },
    icon: SiGooglegemini,
    color: "from-indigo-600 to-purple-600",
    provider: "Google"
  },
  {
    id: "kimi-k2",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Kimi K2",
    description: "Superior tool calling and complex reasoning",
    category: "chat",
    modelInfo: { speed: 4, quality: 5, useCase: "Tool use and agent workflows", contextWindow: "200k" },
    icon: SiDigikeyelectronics,
    color: "from-blue-600 to-cyan-600",
    provider: "Moonshot"
  },
  {
    id: "glm-4.7",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "GLM 4.7",
    description: "Multilingual excellence with strong reasoning",
    category: "chat",
    modelInfo: { speed: 3, quality: 4, useCase: "Multilingual tasks", contextWindow: "128k" },
    icon: TbSquareLetterZ,
    color: "from-blue-700 to-indigo-900",
    provider: "Zhipu AI"
  },
  {
    id: "mistral-3.1",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Mistral 3.1",
    description: "Fast inference with European focus",
    category: "chat",
    modelInfo: { speed: 4, quality: 4, useCase: "European languages", contextWindow: "128k" },
    icon: TbLetterM,
    color: "from-orange-600 to-amber-600",
    provider: "Mistral AI"
  },
  {
    id: "qwen3-235b",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Qwen3 235B",
    description: "Large multilingual model with strong reasoning",
    category: "chat",
    modelInfo: { speed: 4, quality: 5, useCase: "Multilingual and reasoning", contextWindow: "128k" },
    icon: SiAlibabacloud,
    color: "from-purple-500 to-pink-500",
    provider: "Alibaba"
  },
  {
    id: "qwen3-coder-480b",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Qwen3 Coder 480B",
    description: "Specialized in coding and Asian languages",
    category: "chat",
    modelInfo: { speed: 3, quality: 5, useCase: "Code generation", contextWindow: "128k" },
    icon: SiAlibabacloud,
    color: "from-purple-600 to-fuchsia-600",
    provider: "Alibaba"
  },
  {
    id: "minimax-m2.1",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "MiniMax M2.1",
    description: "Multilingual coding specialist with agent workflows",
    category: "chat",
    modelInfo: { speed: 4, quality: 5, useCase: "Coding and agents", contextWindow: "128k" },
    icon: SiMaze,
    color: "from-cyan-600 to-blue-600",
    provider: "MiniMax"
  },
  {
    id: "llama-3.3-70b",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Llama 3.3 70B",
    description: "Efficient open-source powerhouse",
    category: "chat",
    modelInfo: { speed: 4, quality: 4, useCase: "General purpose", contextWindow: "128k" },
    icon: SiMeta,
    color: "from-blue-600 to-indigo-700",
    provider: "Meta"
  },
  {
    id: "gpt-oss-120b",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "GPT-OSS 120B",
    description: "Large open-source with browser search",
    category: "chat",
    modelInfo: { speed: 3, quality: 4, useCase: "Open-source alternative", contextWindow: "128k" },
    icon: SiOpenai,
    color: "from-pink-600 to-rose-600",
    provider: "Community"
  },
  {
    id: "mimo-v2-flash",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "MiMo V2 Flash",
    description: "Efficient 309B MoE model for reasoning",
    category: "chat",
    modelInfo: { speed: 5, quality: 5, useCase: "Fast reasoning", contextWindow: "128k" },
    icon: SiXiaomi,
    color: "from-blue-600 to-purple-600",
    provider: "MiMo"
  },
  {
    id: "groq-compound",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Groq Compound",
    description: "Multi-model agentic system with tools",
    category: "chat",
    modelInfo: { speed: 4, quality: 5, useCase: "Agent workflows", contextWindow: "128k" },
    icon: GiPowerLightning,
    color: "from-orange-600 to-red-600",
    provider: "Groq"
  },
  {
    id: "cohere-command-a",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Cohere Command A",
    description: "Enterprise-grade with excellent tool use",
    category: "chat",
    modelInfo: { speed: 3, quality: 5, useCase: "Enterprise applications", contextWindow: "128k" },
    icon: GiClover,
    color: "from-emerald-600 to-teal-600",
    provider: "Cohere"
  },
  {
    id: "grok-3",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Grok 3",
    description: "xAI's flagship model with real-time data",
    category: "chat",
    modelInfo: { speed: 4, quality: 5, useCase: "Current events", contextWindow: "128k" },
    icon: FaXTwitter,
    color: "from-slate-600 to-zinc-800",
    provider: "xAI"
  },
  {
    id: "aichixia-thinking",
    method: "POST",
    path: `${base}/api/v1/chat/completions`,
    title: "Aichixia 411B",
    description: "Ultra-large flagship model with 411B parameters",
    category: "chat",
    modelInfo: { speed: 5, quality: 5, useCase: "Ultimate performance", contextWindow: "200k" },
    icon: SiAirbrake,
    color: "from-blue-600 via-blue-800 to-slate-900",
    provider: "Aichixia"
  }
];

const ttsModels: EndpointData[] = [
  {
    id: "starling",
    method: "POST",
    path: `${base}/api/models/starling`,
    title: "Starling TTS",
    description: "Natural voice synthesis with emotional control",
    category: "tts",
    note: "JSON: { text, emotion, volume, pitch, tempo }",
    modelInfo: { speed: 4, quality: 5, useCase: "Text-to-speech" },
    icon: FaMicrophone,
    color: "from-blue-500 to-cyan-500",
    provider: "Aichixia"
  },
  {
    id: "lindsay",
    method: "POST",
    path: `${base}/api/models/lindsay`,
    title: "Lindsay TTS",
    description: "Premium voice quality with advanced prosody",
    category: "tts",
    note: "JSON: { text, emotion, volume, pitch, tempo }",
    modelInfo: { speed: 5, quality: 4, useCase: "Enhanced voice" },
    icon: FaMicrophone,
    color: "from-purple-500 to-pink-500",
    provider: "Aichixia"
  }
];

const imageModels: EndpointData[] = [
  {
    id: "flux",
    method: "POST",
    path: `${base}/api/models/flux`,
    title: "Flux 2",
    description: "Photorealistic image generation",
    category: "image",
    note: "JSON: { prompt, steps }",
    modelInfo: { speed: 4, quality: 5, useCase: "Photorealistic images" },
    icon: FaImage,
    color: "from-violet-500 to-purple-600",
    provider: "Black Forest"
  },
  {
    id: "lucid",
    method: "POST",
    path: `${base}/api/models/lucid`,
    title: "Lucid Origin",
    description: "Creative artistic image generation",
    category: "image",
    note: "JSON: { prompt, steps }",
    modelInfo: { speed: 4, quality: 5, useCase: "Artistic images" },
    icon: FaImage,
    color: "from-pink-500 to-rose-600",
    provider: "Lucid"
  },
  {
    id: "phoenix",
    method: "POST",
    path: `${base}/api/models/phoenix`,
    title: "Phoenix 1.0",
    description: "Fast artistic image generation",
    category: "image",
    note: "JSON: { prompt, steps }",
    modelInfo: { speed: 4, quality: 4, useCase: "Quick images" },
    icon: FaImage,
    color: "from-orange-500 to-amber-600",
    provider: "Phoenix"
  },
  {
    id: "nano",
    method: "POST",
    path: `${base}/api/models/nano`,
    title: "Nano Banana Pro",
    description: "Lightweight image model",
    category: "image",
    note: "JSON: { prompt, steps }",
    modelInfo: { speed: 4, quality: 4, useCase: "Compact generation" },
    icon: FaImage,
    color: "from-yellow-500 to-orange-500",
    provider: "Nano"
  }
];

const allEndpoints = [...chatModels, ...ttsModels, ...imageModels];

const EndpointCard = ({ endpoint, isDark }: { endpoint: EndpointData; isDark: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CodeLanguage>('javascript');
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateCode = (lang: CodeLanguage) => {
    const isChat = endpoint.category === 'chat';
    const isTTS = endpoint.category === 'tts';
    const isImage = endpoint.category === 'image';

    if (lang === 'javascript') {
      if (isChat) {
        return `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1"
});

const response = await client.chat.completions.create({
  model: "${endpoint.id}",
  messages: [
    { role: "user", content: "Your message here" }
  ]
});

console.log(response.choices[0].message.content);`;
      } else if (isTTS) {
        return `const response = await fetch('${endpoint.path}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello world!',
    emotion: 'normal',
    volume: 100,
    pitch: 0,
    tempo: 1
  })
});

const data = await response.json();
const audio = new Audio(data.audio);
audio.play();`;
      } else {
        return `const response = await fetch('${endpoint.path}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A beautiful landscape',
    steps: 4
  })
});

const data = await response.json();
const img = document.createElement('img');
img.src = \`data:image/jpeg;base64,\${data.imageBase64}\`;`;
      }
    } else if (lang === 'python') {
      if (isChat) {
        return `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${base}/api/v1"
)

response = client.chat.completions.create(
    model="${endpoint.id}",
    messages=[
        {"role": "user", "content": "Your message here"}
    ]
)

print(response.choices[0].message.content)`;
      } else if (isTTS) {
        return `import requests

response = requests.post('${endpoint.path}',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'text': 'Hello world!',
    'emotion': 'normal',
    'volume': 100,
    'pitch': 0,
    'tempo': 1
  }
)

data = response.json()
audio_url = data['audio']`;
      } else {
        return `import requests

response = requests.post('${endpoint.path}',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'prompt': 'A beautiful landscape',
    'steps': 4
  }
)

data = response.json()
image_base64 = data['imageBase64']`;
      }
    } else if (lang === 'bash') {
      if (isChat) {
        return `curl -X POST ${base}/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${endpoint.id}",
    "messages": [
      {"role": "user", "content": "Your message here"}
    ]
  }'`;
      } else if (isTTS) {
        return `curl -X POST ${endpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello world!",
    "emotion": "normal",
    "volume": 100,
    "pitch": 0,
    "tempo": 1
  }'`;
      } else {
        return `curl -X POST ${endpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A beautiful landscape",
    "steps": 4
  }'`;
      }
    } else {
      if (isChat) {
        return `<?php
require 'vendor/autoload.php';

$client = OpenAI::client(
    'YOUR_API_KEY',
    '${base}/api/v1'
);

$response = $client->chat()->create([
    'model' => '${endpoint.id}',
    'messages' => [
        ['role' => 'user', 'content' => 'Your message here']
    ]
]);

echo $response->choices[0]->message->content;`;
      } else if (isTTS) {
        return `<?php
$response = file_get_contents('${endpoint.path}', false, stream_context_create([
  'http' => [
    'method' => 'POST',
    'header' => [
      'Authorization: Bearer YOUR_API_KEY',
      'Content-Type: application/json'
    ],
    'content' => json_encode([
      'text' => 'Hello world!',
      'emotion' => 'normal',
      'volume' => 100,
      'pitch' => 0,
      'tempo' => 1
    ])
  ]
]));

$data = json_decode($response);`;
      } else {
        return `<?php
$response = file_get_contents('${endpoint.path}', false, stream_context_create([
  'http' => [
    'method' => 'POST',
    'header' => [
      'Authorization: Bearer YOUR_API_KEY',
      'Content-Type: application/json'
    ],
    'content' => json_encode([
      'prompt' => 'A beautiful landscape',
      'steps' => 4
    ])
  ]
]));

$data = json_decode($response);`;
      }
    }
  };

  const Icon = endpoint.icon;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 bg-white dark:bg-zinc-950">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
      >
        <div className={`p-2 rounded-lg bg-gradient-to-br ${endpoint.color} flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{endpoint.title}</h3>
                {endpoint.provider && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {endpoint.provider}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 line-clamp-1">{endpoint.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-semibold ${
                  endpoint.method === 'POST' 
                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {endpoint.method}
                </span>
                {endpoint.modelInfo && (
                  <>
                    <div className="flex items-center gap-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <FaBolt className="w-2.5 h-2.5" />
                      <span>{endpoint.modelInfo.speed}/5</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <FaStar className="w-2.5 h-2.5" />
                      <span>{endpoint.modelInfo.quality}/5</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {isExpanded ? (
                <FaChevronDown className="w-4 h-4 text-zinc-400" />
              ) : (
                <FaChevronRight className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          {endpoint.modelInfo && (
            <div className="space-y-1.5">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">Use case:</span> {endpoint.modelInfo.useCase}
              </div>
              {endpoint.modelInfo.contextWindow && (
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-white">Context:</span> {endpoint.modelInfo.contextWindow}
                </div>
              )}
            </div>
          )}

          {endpoint.note && (
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
              <p className="text-xs text-blue-900 dark:text-blue-300">{endpoint.note}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Code Example</h4>
              <div className="flex gap-0.5 p-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                {(['javascript', 'python', 'bash', 'php'] as CodeLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                      activeTab === lang
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative group/code">
              <SyntaxHighlighter
                language={activeTab}
                style={isDark ? oneDark : oneLight}
                customStyle={{
                  margin: 0,
                  borderRadius: '6px',
                  fontSize: '11px',
                  padding: '12px'
                }}
                wrapLongLines={true}
              >
                {generateCode(activeTab)}
              </SyntaxHighlighter>
              <button
                onClick={() => copy(generateCode(activeTab), `${endpoint.id}-${activeTab}`)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 dark:bg-zinc-200/10 dark:hover:bg-zinc-200/20 backdrop-blur-sm opacity-0 group-hover/code:opacity-100 transition-all duration-200"
              >
                {copied === `${endpoint.id}-${activeTab}` ? (
                  <FaCheck className="w-3 h-3 text-green-400" />
                ) : (
                  <FaCopy className="w-3 h-3 text-zinc-300" />
                )}
              </button>
            </div>
          </div>

          {endpoint.category === 'chat' && (
            <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <code className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">model: "{endpoint.id}"</code>
                <button
                  onClick={() => copy(endpoint.id, `model-${endpoint.id}`)}
                  className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                >
                  {copied === `model-${endpoint.id}` ? (
                    <FaCheck className="w-2.5 h-2.5 text-green-500" />
                  ) : (
                    <FaCopy className="w-2.5 h-2.5 text-zinc-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Use this model ID with OpenAI-compatible endpoint</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function Docs() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const categories = [
    { id: "all", name: "All Models", count: allEndpoints.length },
    { id: "chat", name: "Chat", count: chatModels.length },
    { id: "tts", name: "TTS", count: ttsModels.length },
    { id: "image", name: "Image", count: imageModels.length },
  ];

  const filteredEndpoints = allEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endpoint.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <FaBook className="w-3.5 h-3.5 text-white" />
              </div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-white">API Documentation</h1>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaTerminal className="w-3 h-3" />
                Home
              </Link>
              <Link
                href="/console"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaKey className="w-3 h-3" />
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
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <FaTerminal className="w-3 h-3" />
                Home
              </Link>
              <Link
                href="/console"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <FaKey className="w-3 h-3" />
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
              <FaBook className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Complete Reference</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-3 tracking-tight">
              API <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">Documentation</span>
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Browse all available models with code examples and technical details
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6 space-y-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {category.name}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/20 dark:bg-black/20'
                    : 'bg-zinc-200 dark:bg-zinc-800'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredEndpoints.length > 0 ? (
            filteredEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} isDark={isDark} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-3">
                <FaSearch className="w-5 h-5 text-zinc-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">No models found</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Try adjusting your search or filter</p>
            </div>
          )}
        </div>

        <section className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                href="/"
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Home
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
