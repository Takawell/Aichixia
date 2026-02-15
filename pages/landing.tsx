import { useState, useEffect } from "react";
import { FaSearch, FaCopy, FaCheck, FaChevronDown, FaChevronRight, FaTerminal, FaBolt, FaCode, FaStar, FaArrowRight, FaExternalLinkAlt, FaGithub, FaPlay, FaBookOpen, FaTimes, FaBars, FaMoon, FaSun, FaRobot, FaKey, FaServer, FaGlobe, FaTiktok, FaImage, FaMicrophone } from "react-icons/fa";
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiAirbrake, SiMaze, SiXiaomi, SiSecurityscorecard, SiDigikeyelectronics } from "react-icons/si";
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

const QuickStartGuide = ({ isDark }: { isDark: boolean }) => {
  const [copied, setCopied] = useState<number | null>(null);

  const steps = [
    {
      title: "Get your API key",
      code: "Visit console to generate your key",
      language: "bash" as const
    },
    {
      title: "Install OpenAI SDK",
      code: `npm install openai`,
      language: "bash" as const
    },
    {
      title: "Make your first request",
      code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1"
});

const response = await client.chat.completions.create({
  model: "deepseek-v3.2",
  messages: [
    { role: "user", content: "Hello, AI!" }
  ]
});

console.log(response.choices[0].message.content);`,
      language: "javascript" as const
    }
  ];

  const copy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm font-bold">
              {index + 1}
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{step.title}</h3>
          </div>
          <div className="relative group">
            <SyntaxHighlighter
              language={step.language}
              style={isDark ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                borderRadius: '8px',
                fontSize: '13px',
                padding: '16px'
              }}
            >
              {step.code}
            </SyntaxHighlighter>
            <button
              onClick={() => copy(step.code, index)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 dark:bg-zinc-200/10 dark:hover:bg-zinc-200/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              {copied === index ? (
                <FaCheck className="w-4 h-4 text-green-400" />
              ) : (
                <FaCopy className="w-4 h-4 text-zinc-300" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

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
    <div className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 bg-white dark:bg-zinc-950">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
      >
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${endpoint.color} flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{endpoint.title}</h3>
                {endpoint.provider && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {endpoint.provider}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{endpoint.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded font-mono font-semibold ${
                  endpoint.method === 'POST' 
                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {endpoint.method}
                </span>
                {endpoint.modelInfo && (
                  <>
                    <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <FaBolt className="w-3 h-3" />
                      <span>{endpoint.modelInfo.speed}/5</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <FaStar className="w-3 h-3" />
                      <span>{endpoint.modelInfo.quality}/5</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {isExpanded ? (
                <FaChevronDown className="w-5 h-5 text-zinc-400" />
              ) : (
                <FaChevronRight className="w-5 h-5 text-zinc-400" />
              )}
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/30">
          {endpoint.modelInfo && (
            <div className="space-y-2">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">Use case:</span> {endpoint.modelInfo.useCase}
              </div>
              {endpoint.modelInfo.contextWindow && (
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-white">Context:</span> {endpoint.modelInfo.contextWindow}
                </div>
              )}
            </div>
          )}

          {endpoint.note && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
              <p className="text-sm text-blue-900 dark:text-blue-300">{endpoint.note}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Code Example</h4>
              <div className="flex gap-1 p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                {(['javascript', 'python', 'bash', 'php'] as CodeLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
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
                  borderRadius: '8px',
                  fontSize: '13px',
                  padding: '16px'
                }}
              >
                {generateCode(activeTab)}
              </SyntaxHighlighter>
              <button
                onClick={() => copy(generateCode(activeTab), `${endpoint.id}-${activeTab}`)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 dark:bg-zinc-200/10 dark:hover:bg-zinc-200/20 backdrop-blur-sm opacity-0 group-hover/code:opacity-100 transition-all duration-200"
              >
                {copied === `${endpoint.id}-${activeTab}` ? (
                  <FaCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <FaCopy className="w-4 h-4 text-zinc-300" />
                )}
              </button>
            </div>
          </div>

          {endpoint.category === 'chat' && (
            <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">model: "{endpoint.id}"</code>
                <button
                  onClick={() => copy(endpoint.id, `model-${endpoint.id}`)}
                  className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                >
                  {copied === `model-${endpoint.id}` ? (
                    <FaCheck className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <FaCopy className="w-3.5 h-3.5 text-zinc-500" />
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

export default function APIDocumentation() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showQuickStart, setShowQuickStart] = useState(false);
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
    { id: "all", name: "All Endpoints", count: allEndpoints.length },
    { id: "chat", name: "Chat Models", count: chatModels.length },
    { id: "tts", name: "Text-to-Speech", count: ttsModels.length },
    { id: "image", name: "Image Generation", count: imageModels.length },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                <FaTerminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Aichixia API</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Modern AI Infrastructure</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/console"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaTerminal className="w-4 h-4" />
                Console
              </Link>
              <a
                href="https://github.com/Takawell/Aichixia"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {isDark ? <FaSun className="w-5 h-5 text-zinc-400" /> : <FaMoon className="w-5 h-5 text-zinc-600" />}
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/console"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <FaTerminal className="w-4 h-4" />
                Console
              </Link>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                {isDark ? (
                  <>
                    <FaSun className="w-4 h-4" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <FaMoon className="w-4 h-4" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950/20 dark:via-black dark:to-cyan-950/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTAtNGgtMnYyaDJ2LTJ6bTIyIDIydi0yaDJ2MmgtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnptMC00aC0ydjJoMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 dark:opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 mb-6">
              <FaRobot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">18+ AI Models</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">
              Build with the best
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                AI models
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Access DeepSeek, Claude, Gemini, and more through OpenAI-compatible API.
              Simple pricing, fast responses, no complexity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowQuickStart(true)}
                className="group flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaPlay className="w-4 h-4" />
                Quick Start
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/console"
                className="flex items-center gap-2 px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <FaKey className="w-4 h-4" />
                Get API Key
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1">18+</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">AI Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1">99.9%</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1">&lt;100ms</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Latency</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showQuickStart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <FaBookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Quick Start Guide</h2>
              </div>
              <button
                onClick={() => setShowQuickStart(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <QuickStartGuide isDark={isDark} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {category.name}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
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

        <div className="space-y-3">
          {filteredEndpoints.length > 0 ? (
            filteredEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} isDark={isDark} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-4">
                <FaSearch className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No endpoints found</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Try adjusting your search or filter</p>
            </div>
          )}
        </div>

        <section className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/10 dark:to-zinc-950">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <FaKey className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Authentication</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Get your API key from the console and include it in all requests:
                </p>
                <code className="block px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg text-xs text-blue-600 dark:text-blue-400 font-mono border border-zinc-200 dark:border-zinc-800">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/10 dark:to-zinc-950">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500 rounded-lg">
                <FaServer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Rate Limits</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  1,000 requests per day with API key. Track your usage in the console dashboard.
                </p>
                <Link
                  href="/console"
                  className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                >
                  View Console
                  <FaExternalLinkAlt className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <FaTerminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Aichixia API</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Modern AI Infrastructure</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/console"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Console
              </Link>
              <a
                href="https://github.com/Takawell/Aichixia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@putrawangyyy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              © {new Date().getFullYear()} Aichixia. All Right reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
