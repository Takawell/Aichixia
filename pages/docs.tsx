import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaCopy, FaCheck, FaChevronRight, FaTerminal, FaBolt, FaBook, FaMoon, FaSun, FaBars, FaTimes, FaKey, FaMicrophone, FaImage, FaVideo, FaCode, FaCheckCircle, FaRocket, FaLayerGroup, FaDatabase, FaPlay, FaInfoCircle, FaFileAudio, FaGlobe, FaCloudUploadAlt } from "react-icons/fa";
import { FiSend, FiX, FiMessageSquare, FiRefreshCw, FiChevronDown } from "react-icons/fi";
import { SiGooglegemini, SiAlibabacloud, SiMaze } from "react-icons/si";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://www.aichixia.xyz";

export default function Docs() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'video' | 'tts' | 'quickstart' | 'anthropic' | 'stt'>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('chat-completions');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<{role:'user'|'assistant';content:string}[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantPulse, setAssistantPulse] = useState(true);
  const assistantEndRef = useRef<HTMLDivElement>(null);
  const assistantInputRef = useRef<HTMLTextAreaElement>(null);

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

  const openAssistant = () => {
    setAssistantOpen(true);
    setAssistantPulse(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setAssistantVisible(true)));
    setTimeout(() => assistantInputRef.current?.focus(), 350);
  };

  const closeAssistant = () => {
    setAssistantVisible(false);
    setTimeout(() => setAssistantOpen(false), 300);
  };

  const sendAssistantMessage = useCallback(async () => {
    const content = assistantInput.trim();
    if (!content || assistantLoading) return;
    const userMsg = { role: 'user' as const, content };
    const newMessages = [...assistantMessages, userMsg];
    setAssistantMessages(newMessages);
    setAssistantInput('');
    setAssistantLoading(true);
    setTimeout(() => assistantEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const res = await fetch('https://www.aichixia.xyz/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_AICHIXIA_API_KEY },
        body: JSON.stringify({
          model: 'openai/gpt-5-mini',
          max_tokens: 4096,
          messages: [
            { role: 'system', content: 'You are a helpful API assistant for Aichixia, an AI API aggregation platform. Help users integrate and use the Aichixia API. Keep answers concise and clear. Aichixia base URL: https://www.aichixia.xyz. Auth: Bearer token or x-api-key header.\n\nEndpoints:\n- Chat (OpenAI-compat): POST /api/v1/chat/completions\n- Messages (Anthropic-compat): POST /api/v1/messages\n- Image generation: POST /api/v1/images/generations\n- Video generation: POST /api/v1/videos/generations\n- TTS: POST /api/v1/audio/speech\n- STT Transcription: POST /api/v1/audio/transcriptions\n- STT Translation: POST /api/v1/audio/translations\n\nText models (free): openai/gpt-5-mini, openai/gpt-5.2, openai/gpt-oss-120b, google/gemini-3-flash-preview, xai/grok-3, deepseek-v4-flash, mistralai/mistral-large-latest, z-ai/glm-4.7-flash, stepfun-ai/step-3.7-flash, nvidia/nemotron-3-ultra-550b-a55b, alibaba/qwen3.6-27b, alibaba/qwen3-coder-plus, meta/llama-3.3-70b, minimax-m3, groq/compound, cohere/command-a, microsoft/phi-4-multimodal-instruct, anthropic/claude-haiku-4-5\\nText models (pro): anthropic/claude-sonnet-4-6, anthropic/claude-opus-4-8, xai/grok-4-fast, deepseek/deepseek-v4-pro, z-ai/glm-5.2, moonshotai/kimi-k2.6, aichixia/aichixia-flash, openai/gpt-5.5, xiaomi/mimo-v2.5-pro, poolside/laguna-s-2.1, thinkingmachines/inkling\\nText models (enterprise): anthropic/claude-fable-5\\\\nStreaming (stream: true) supported only on: moonshotai/kimi-k2.6, mistralai/mistral-large-latest, minimax-m3, stepfun-ai/step-3.7-flash, nvidia/nemotron-3-ultra-550b-a55b, openai/gpt-oss-120b, deepseek-v4-flash, z-ai/glm-5.2, google/gemma-4-31b, poolside/laguna-s-2.1, cohere/command-a, google/gemini-3-flash-preview, meta/llama-3.3-70b, deepseek/deepseek-v4-pro, anthropic/claude-fable-5, xiaomi/mimo-v2.5-pro, alibaba/qwen3-coder-plus, thinkingmachines/inkling -- returns SSE for supported models; other models return a 400 error if stream is requested.\\\\nVision models: openai/gpt-5.2, moonshotai/kimi-k2.6, google/gemini-3-flash-preview, xai/grok-4-fast, microsoft/phi-4-multimodal-instruct, alibaba/qwen3.6-27b, stepfun-ai/step-3.7-flash, anthropic/claude-fable-5, thinkingmachines/inkling\\nImage generation models: flux-2-dev, lucid-origin, phoenix-1.0, gemini-3-pro-image\\nVideo generation models (pro): wan2.2-i2v (Alibaba, image-to-video, requires input_image), hailuo-h3 (MiniMax, text-to-video and image-to-video with synced soundtrack)\\nTTS models: starling-tts, lindsay-tts, miu-tts, catherine-tts, nana-tts, stephanie-tts (Typecast, support: eng, kor, jpn, cmn, spa), alexandra-tts (ElevenLabs, support: ind, eng, rus, cmn), eve-tts (ElevenLabs, support: kor, eng, msa, vie)\\nSTT models: whisper-large-v3 (max accuracy), whisper-large-v3-turbo (max speed 216x real-time)\\n\\nPlans: Free=1000 req/day, Pro=4000 req/day, Enterprise=custom (contact sales team via email). Enterprise-tier models (e.g. anthropic/claude-fable-5) require the Enterprise plan even for otherwise Pro-eligible accounts.\\nContact: contact@aichixia.xyz | Telegram community: https://t.me/AichixiaAPI\\nDo not use tool calling or function calling. Use code examples when relevant.' },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
      setAssistantMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setAssistantMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not connect. Please try again.' }]);
    }
    setAssistantLoading(false);
    setTimeout(() => assistantEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [assistantInput, assistantLoading, assistantMessages]);

  const handleAssistantKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAssistantMessage(); }
  };

  const resetAssistant = () => {
    setAssistantMessages([]);
    setAssistantInput('');
    assistantInputRef.current?.focus();
  };

  const codeExamples = {
    chatCompletionsJS: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1",
});

const response = await client.chat.completions.create({
  model: "anthropic/claude-opus-4-8",
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
    model="anthropic/claude-opus-4-8",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    temperature=0.7,
    max_tokens=1000,
)

print(response.choices[0].message.content)`,

    chatCompletionsNode: `const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1",
});

async function main() {
  const response = await client.chat.completions.create({
    model: "openai/gpt-5-mini",
    messages: [{ role: "user", content: "Hello!" }],
    temperature: 0.7,
    max_tokens: 500,
  });
  console.log(response.choices[0].message.content);
}

main();`,

    chatCompletionsCurl: `curl -X POST ${base}/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai/gpt-5-mini",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7,
    "max_tokens": 500
  }'`,

    chatStreamingJS: `const res = await fetch("${base}/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({
    model: "moonshotai/kimi-k2.6",
    messages: [{ role: "user", content: "Tell me a short story" }],
    stream: true,
  }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const parts = buffer.split("\\n\\n");
  buffer = parts.pop() || "";

  for (const part of parts) {
    if (!part.startsWith("data: ")) continue;
    const payload = part.slice(6).trim();
    if (payload === "[DONE]") continue;
    const parsed = JSON.parse(payload);
    const delta = parsed.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
}`,

    chatStreamingPython: `import requests
import json

response = requests.post(
    "${base}/api/v1/chat/completions",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY",
    },
    json={
        "model": "moonshotai/kimi-k2.6",
        "messages": [{"role": "user", "content": "Tell me a short story"}],
        "stream": True,
    },
    stream=True,
)

for line in response.iter_lines():
    if not line or not line.startswith(b"data: "):
        continue
    payload = line[6:].decode("utf-8").strip()
    if payload == "[DONE]":
        continue
    parsed = json.loads(payload)
    delta = parsed.get("choices", [{}])[0].get("delta", {}).get("content")
    if delta:
        print(delta, end="", flush=True)`,

    visionJS: `const response = await fetch('${base}/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'google/gemini-3-flash-preview',
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

    geminiProImageTS: `import fs from 'fs';

const sourceImage = fs.readFileSync('./input.jpg');
const base64Image = \`data:image/jpeg;base64,\${sourceImage.toString('base64')}\`;

const response = await fetch('${base}/api/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gemini-3-pro-image',
    prompt: 'Turn this into anime style with black hair',
    image: base64Image,
    response_format: 'b64_json'
  })
});

const data: { data: { b64_json: string }[] } = await response.json();
const imageBase64 = data.data[0].b64_json;

fs.writeFileSync('./output.png', Buffer.from(imageBase64, 'base64'));`,

    videoWanJS: `const response = await fetch('${base}/api/v1/videos/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'wan2.2-i2v',
    input_image: 'data:image/png;base64,YOUR_BASE64_IMAGE',
    prompt: 'make this image come alive, cinematic motion, smooth animation',
    duration_seconds: 3.5,
    steps: 6,
    frame_multiplier: '16'
  })
});

const data = await response.json();
console.log(data.data.video);`,

    videoWanPython: `import requests

response = requests.post(
    '${base}/api/v1/videos/generations',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'model': 'wan2.2-i2v',
        'input_image': 'data:image/png;base64,YOUR_BASE64_IMAGE',
        'prompt': 'make this image come alive, cinematic motion, smooth animation',
        'duration_seconds': 3.5,
        'steps': 6,
        'frame_multiplier': '16'
    }
)

data = response.json()
print(data['data']['video'])`,

    videoWanCurl: `curl -X POST ${base}/api/v1/videos/generations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "wan2.2-i2v",
    "input_image": "data:image/png;base64,YOUR_BASE64_IMAGE",
    "prompt": "make this image come alive, cinematic motion, smooth animation",
    "duration_seconds": 3.5,
    "steps": 6,
    "frame_multiplier": "16"
  }'`,

    videoHailuoJS: `const response = await fetch('${base}/api/v1/videos/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'hailuo-h3',
    prompt: 'A red fox trotting through a snowy pine forest at dawn, snow crunching underfoot',
    canvas: '960x544 · 16:9 fast',
    duration: 5,
    steps: 28,
    seed: 42
  })
});

const data = await response.json();
console.log(data.data.video);`,

    videoHailuoPython: `import requests

response = requests.post(
    '${base}/api/v1/videos/generations',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'model': 'hailuo-h3',
        'prompt': 'A red fox trotting through a snowy pine forest at dawn, snow crunching underfoot',
        'canvas': '960x544 · 16:9 fast',
        'duration': 5,
        'steps': 28,
        'seed': 42
    }
)

data = response.json()
print(data['data']['video'])`,

    videoHailuoCurl: `curl -X POST ${base}/api/v1/videos/generations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "hailuo-h3",
    "prompt": "A red fox trotting through a snowy pine forest at dawn, snow crunching underfoot",
    "canvas": "960x544 · 16:9 fast",
    "duration": 5,
    "steps": 28,
    "seed": 42
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
    language: 'eng',
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
        'language': 'eng',
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
    "language": "eng",
    "emotion": "normal",
    "volume": 100,
    "pitch": 0,
    "tempo": 1,
    "response_format": "mp3"
  }'`,

    anthropicTS: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1",
});

const message = await client.messages.create({
  model: "anthropic/claude-opus-4-8",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Explain quantum computing" }
  ],
});

console.log(message.content[0].text);`,

    anthropicPython: `import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",
    base_url="${base}/api/v1",
)

message = client.messages.create(
    model="anthropic/claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
)

print(message.content[0].text)`,

    anthropicSystem: `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "YOUR_API_KEY",
  baseURL: "${base}/api/v1",
});

const message = await client.messages.create({
  model: "xai/grok-3",
  max_tokens: 1024,
  system: "You are a helpful assistant that speaks concisely.",
  messages: [
    { role: "user", content: "What is the capital of France?" }
  ],
});

console.log(message.content[0].text);`,

    anthropicCurl: `curl -X POST ${base}/api/v1/messages \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "anthropic/claude-opus-4-8",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ]
  }'`,

    anthropicStreamingJS: `const res = await fetch("${base}/api/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
  },
  body: JSON.stringify({
    model: "moonshotai/kimi-k2.6",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Tell me a short story" }],
    stream: true,
  }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const parts = buffer.split("\\n\\n");
  buffer = parts.pop() || "";

  for (const part of parts) {
    if (!part.startsWith("data: ")) continue;
    const payload = part.slice(6).trim();
    if (payload === "[DONE]") continue;
    const parsed = JSON.parse(payload);
    const delta = parsed.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
}`,

    sttTS: `const formData = new FormData();
formData.append("file", audioFile); // File object from input
formData.append("model", "whisper-large-v3-turbo");
formData.append("response_format", "verbose_json");
// formData.append("language", "en"); // optional ISO-639-1

const response = await fetch("${base}/api/v1/audio/transcriptions", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_API_KEY" },
  body: formData,
});

const data = await response.json();
console.log(data.text);`,

    sttPython: `import requests

with open("audio.mp3", "rb") as f:
    response = requests.post(
        "${base}/api/v1/audio/transcriptions",
        headers={"Authorization": "Bearer YOUR_API_KEY"},
        files={"file": ("audio.mp3", f, "audio/mpeg")},
        data={
            "model": "whisper-large-v3-turbo",
            "response_format": "verbose_json",
            # "language": "en",  # optional
        },
    )

data = response.json()
print(data["text"])`,

    sttCurl: `curl -X POST ${base}/api/v1/audio/transcriptions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F file=@audio.mp3 \\
  -F model=whisper-large-v3-turbo \\
  -F response_format=verbose_json`,

    sttTranslateTS: `const formData = new FormData();
formData.append("file", audioFile);
formData.append("model", "whisper-large-v3");
formData.append("response_format", "json");

const response = await fetch("${base}/api/v1/audio/translations", {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_API_KEY" },
  body: formData,
});

const data = await response.json();
console.log(data.text);`,

    sttTranslateCurl: `curl -X POST ${base}/api/v1/audio/translations \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F file=@audio_japanese.mp3 \\
  -F model=whisper-large-v3 \\
  -F response_format=json`,
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
          language={lang.toLowerCase().includes('curl') ? 'bash' : lang.toLowerCase().includes('python') ? 'python' : 'typescript'}
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
                <Link href="/" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">Home</Link>
                <Link href="/console" className="px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">Console</Link>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <Link href="/console" className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all duration-200">
                  <FaKey className="w-2.5 h-2.5" />
                  Get API Key
                </Link>
              </nav>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button onClick={toggleTheme} className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200" aria-label="Toggle theme">
                  {isDark ? <FaSun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <FaMoon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200" aria-label="Toggle menu">
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
                Complete guide to integrating Aichixia's AI models. Chat, images, voice, and more all through one unified API.
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap pt-1">
                {['OpenAI Compatible', 'Anthropic Compatible', 'Image Generation', 'Text-to-Speech', 'Speech-to-Text'].map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-500 animate-pulse' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-pink-500' : i === 3 ? 'bg-violet-500' : 'bg-teal-500'}`} />
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
                  { id: 'anthropic', label: 'Anthropic SDK', icon: FaLayerGroup },
                  { id: 'image', label: 'Image Generation', icon: FaImage },
                  { id: 'video', label: 'Video Generation', icon: FaVideo },
                  { id: 'tts', label: 'Text-to-Speech', icon: FaMicrophone },
                  { id: 'stt', label: 'Speech-to-Text', icon: FaFileAudio },
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
                      Get your API key and start building in under 60 seconds. Supports both OpenAI and Anthropic SDK.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { icon: FaKey, color: 'text-blue-600 dark:text-blue-400', title: '1. Get API Key', desc: 'Sign up and generate your free API key from the console' },
                      { icon: FaCode, color: 'text-purple-600 dark:text-purple-400', title: '2. Make Request', desc: 'Use OpenAI SDK, Anthropic SDK, or plain HTTP client' },
                      { icon: FaCheckCircle, color: 'text-green-600 dark:text-green-400', title: '3. Ship Fast', desc: 'Deploy your AI features with confidence and scale' },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div key={title} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Icon className={`w-5 h-5 ${color} mb-3`} />
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{title}</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">OpenAI SDK</h3>
                        <CopyButton code="npm install openai" id="install-openai" />
                      </div>
                      <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3">
                        <code className="text-xs text-zinc-800 dark:text-zinc-200">npm install openai</code>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Anthropic SDK</h3>
                        <CopyButton code="npm install @anthropic-ai/sdk" id="install-anthropic" />
                      </div>
                      <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3">
                        <code className="text-xs text-zinc-800 dark:text-zinc-200">npm install @anthropic-ai/sdk</code>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Endpoints</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Chat Completions (OpenAI)', url: `${base}/api/v1/chat/completions` },
                        { label: 'Messages (Anthropic)', url: `${base}/api/v1/messages` },
                        { label: 'Image Generation', url: `${base}/api/v1/images/generations` },
                        { label: 'Video Generation', url: `${base}/api/v1/videos/generations` },
                        { label: 'Text-to-Speech', url: `${base}/api/v1/audio/speech` },
                        { label: 'Transcriptions (STT)', url: `${base}/api/v1/audio/transcriptions` },
                        { label: 'Translations (STT)', url: `${base}/api/v1/audio/translations` },
                      ].map(({ label, url }) => (
                        <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 min-w-[180px]">{label}</span>
                          <code className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded break-all">{url}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <CodeBlock code={codeExamples.chatCompletionsJS} lang="TypeScript (OpenAI SDK)" id="quickstart-js" />
                  <CodeBlock code={codeExamples.anthropicTS} lang="TypeScript (Anthropic SDK)" id="quickstart-anthropic" />
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
                        <code className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded break-all inline-block max-w-full">POST {base}/api/v1/chat/completions</code>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1.5">Fully OpenAI-compatible. Set <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">baseURL: "{base}/api/v1"</code> in any OpenAI SDK.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button onClick={() => toggleSection('chat-request')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'chat-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'chat-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="Model ID. e.g. anthropic/claude-opus-4-8, openai/gpt-5-mini, deepseek/deepseek-v4-pro, google/gemini-3-flash-preview, xai/grok-3" />
                        <Param name="messages" required type="array" desc="Array of message objects with role (system | user | assistant) and content" />
                        <Param name="temperature" type="number" desc="Sampling temperature 0–2. Higher = more creative. Default: 0.8" />
                        <Param name="max_tokens" type="number" desc="Maximum tokens to generate. Default: 1080" />
                        <Param name="stream" type="boolean" desc="Streaming via SSE, returning standard OpenAI chat.completion.chunk events. Default: false. Supported only on: moonshotai/kimi-k2.6, openai/gpt-5-mini, openai/gpt-5.2, aichixia/aichixia-flash, anthropic/claude-sonnet-4-6, anthropic/claude-fable-5, mistralai/mistral-large-latest, minimaxai/minimax-m3, stepfun-ai/step-3.7-flash, nvidia/nemotron-3-ultra-550b-a55b, openai/gpt-oss-120b, deepseek/deepseek-v4-flash, deepseek/deepseek-v4-pro, z-ai/glm-5.2, z-ai/glm-4.7-flash, google/gemma-4-31b, google/gemini-3-flash-preview, poolside/laguna-s-2.1, cohere/command-a, meta/llama-3.3-70b, meta/llama-4-scout-17b-16e-instruct, xiaomi/mimo-v2.5-pro, alibaba/qwen3-coder-plus, alibaba/qwen3.8-27b, thinkingmachines/inkling, groq/compound" />
                        <Param name="top_p" type="number" desc="Nucleus sampling 0–1. Alternative to temperature." />
                      </div>
                    )}

                    <button onClick={() => toggleSection('chat-response')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
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
  "model": "anthropic/claude-opus-4-8",
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

                    <button onClick={() => toggleSection('chat-models')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Available Text Models</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'chat-models' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'chat-models' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="grid sm:grid-cols-2 gap-2">
                          {[
                            { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini', plan: 'free' },
                            { id: 'openai/gpt-5.2', label: 'GPT-5.2', plan: 'free' },
                            { id: 'openai/gpt-5.5', label: 'GPT-5.5', plan: 'pro' },
                            { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', plan: 'free' },
                            { id: 'aichixia/aichixia-flash', label: 'Aichixia 114B', plan: 'pro' },
                            { id: 'mistralai/mistral-large-latest', label: 'Mistral Large', plan: 'free' },
                            { id: 'deepseek/deepseek-v4-pro', label: 'DeepSeek V3.2', plan: 'pro' },
                            { id: 'deepseek/deepseek-v4-flash', label: 'DeepSeek V4 Flash', plan: 'free' },
                            { id: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6', plan: 'pro' },
                            { id: 'anthropic/claude-opus-4-8', label: 'Claude Opus 4.8', plan: 'pro' },
                            { id: 'anthropic/claude-haiku-4-5', label: 'Claude Haiku 4.5', plan: 'free' },
                            { id: 'anthropic/claude-fable-5', label: 'Claude Fable 5', plan: 'enterprise' },
                            { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash', plan: 'free' },
                            { id: 'xai/grok-3', label: 'Grok 3', plan: 'free' },
                            { id: 'microsoft/phi-4-multimodal-instruct', label: 'Phi 4 Multimodal', plan: 'free' },
                            { id: 'z-ai/glm-5.2', label: 'GLM 5.2', plan: 'pro' },
                            { id: 'z-ai/glm-4.7-flash', label: 'GLM 4.7 Flash', plan: 'pro' },
                            { id: 'moonshotai/kimi-k2.6', label: 'Kimi K2.6', plan: 'pro' },
                            { id: 'stepfun-ai/step-3.7-flash', label: 'Step 3.7 Flash', plan: 'free' },
                            { id: 'nvidia/nemotron-3-ultra-550b-a55b', label: 'Nemotron 3 Ultra 550B', plan: 'free' },
                            { id: 'alibaba/qwen3.6-27b', label: 'Qwen3.6 27B', plan: 'free' },
                            { id: 'alibaba/qwen3-coder-plus', label: 'Qwen3 Coder Plus', plan: 'free' },
                            { id: 'minimaxai/minimax-m3', label: 'MiniMax M3', plan: 'free' },
                            { id: 'meta/llama-3.3-70b', label: 'Llama 3.3 70B', plan: 'free' },
                            { id: 'xiaomi/mimo-v2.5-pro', label: 'MiMo V2.5 Pro', plan: 'pro' },
                            { id: 'groq/compound', label: 'Groq Compound', plan: 'free' },
                            { id: 'cohere/command-a', label: 'Cohere Command A', plan: 'free' },
                            { id: 'xai/grok-4-fast', label: 'Grok 4 Fast', plan: 'pro' },
                            { id: 'poolside/laguna-s-2.1', label: 'Laguna S 2.1', plan: 'pro' },
                            { id: 'thinkingmachines/inkling', label: 'Inkling', plan: 'pro' },
                          ].map(({ id, label, plan }) => (
                            <div key={id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <div>
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{label}</p>
                                <code className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono break-all">{id}</code>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2 ${plan === 'enterprise' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' : plan === 'pro' ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'}`}>
                                {plan === 'enterprise' ? 'Enterprise' : plan === 'pro' ? 'Pro' : 'Free'}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">Vision models: <code className="text-zinc-600 dark:text-zinc-400">openai/gpt-5.2</code>, <code className="text-zinc-600 dark:text-zinc-400">moonshotai/kimi-k2.6</code>, <code className="text-zinc-600 dark:text-zinc-400">google/gemini-3-flash-preview</code>, <code className="text-zinc-600 dark:text-zinc-400">xai/grok-4-fast</code>, <code className="text-zinc-600 dark:text-zinc-400">microsoft/phi-4-multimodal-instruct</code>, <code className="text-zinc-600 dark:text-zinc-400">alibaba/qwen3.6-27b</code>, <code className="text-zinc-600 dark:text-zinc-400">stepfun-ai/step-3.7-flash</code>, <code className="text-zinc-600 dark:text-zinc-400">anthropic/claude-fable-5</code>, <code className="text-zinc-600 dark:text-zinc-400">thinkingmachines/inkling</code></p>
                      </div>
                    )}

                    <button onClick={() => toggleSection('chat-streaming')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Streaming</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'chat-streaming' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'chat-streaming' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                          Set <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">stream: true</code> in the request body to receive the response as Server-Sent Events instead of a single JSON payload. Each chunk follows the standard OpenAI <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">chat.completion.chunk</code> shape — read the text from <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">choices[0].delta.content</code> — terminated by <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">data: [DONE]</code>.
                        </p>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                          <p className="text-xs text-amber-800 dark:text-amber-300">Streaming is currently only available for a subset of models. Requesting <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">stream: true</code> on an unsupported model returns a 400 error.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'moonshotai/kimi-k2.6', label: 'Kimi K2.6' },
                            { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
                            { id: 'openai/gpt-5.2', label: 'GPT-5.2' },
                            { id: 'aichixia/aichixia-flash', label: 'Aichixia 114B' },
                            { id: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
                            { id: 'anthropic/claude-fable-5', label: 'Claude Fable 5' },
                            { id: 'mistralai/mistral-large-latest', label: 'Mistral Large' },
                            { id: 'minimaxai/minimax-m3', label: 'MiniMax M3' },
                            { id: 'stepfun-ai/step-3.7-flash', label: 'Step 3.7 Flash' },
                            { id: 'nvidia/nemotron-3-ultra-550b-a55b', label: 'Nemotron 3 Ultra' },
                            { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
                            { id: 'deepseek/deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
                            { id: 'deepseek/deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
                            { id: 'z-ai/glm-5.2', label: 'GLM 5.2' },
                            { id: 'z-ai/glm-4.7-flash', label: 'GLM 4.7 Flash' },
                            { id: 'google/gemma-4-31b', label: 'Gemma 4 31B' },
                            { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash' },
                            { id: 'poolside/laguna-s-2.1', label: 'Laguna S 2.1' },
                            { id: 'cohere/command-a', label: 'Cohere Command A' },
                            { id: 'meta/llama-3.3-70b', label: 'Llama 3.3 70B' },
                            { id: 'meta/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout' },
                            { id: 'xiaomi/mimo-v2.5-pro', label: 'MiMo V2.5 Pro' },
                            { id: 'alibaba/qwen3-coder-plus', label: 'Qwen3 Coder Plus' },
                            { id: 'alibaba/qwen3.8-27b', label: 'Qwen3.8 27B' },
                            { id: 'thinkingmachines/inkling', label: 'Inkling' },
                            { id: 'groq/compound', label: 'Groq Compound' },
                          ].map(({ id, label }) => (
                            <div key={id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-xs font-semibold text-zinc-900 dark:text-white">{label}</p>
                              <code className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono break-all">{id}</code>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="javascript" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`const res = await fetch("${base}/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: JSON.stringify({
    model: "moonshotai/kimi-k2.6",
    messages: [{ role: "user", content: "Tell me a short story" }],
    stream: true,
  }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const parts = buffer.split("\\n\\n");
  buffer = parts.pop() || "";

  for (const part of parts) {
    if (!part.startsWith("data: ")) continue;
    const payload = part.slice(6).trim();
    if (payload === "[DONE]") continue;
    const parsed = JSON.parse(payload);
    const delta = parsed.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
}`}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.chatCompletionsJS} lang="TypeScript (OpenAI SDK)" id="chat-js" />
                  <CodeBlock code={codeExamples.chatCompletionsPython} lang="Python (OpenAI SDK)" id="chat-python" />
                  <CodeBlock code={codeExamples.chatCompletionsNode} lang="Node.js (CommonJS)" id="chat-node" />
                  <CodeBlock code={codeExamples.chatCompletionsCurl} lang="cURL" id="chat-curl" />
                  <CodeBlock code={codeExamples.chatStreamingJS} lang="JavaScript — Streaming" id="chat-streaming-js" />
                  <CodeBlock code={codeExamples.chatStreamingPython} lang="Python — Streaming" id="chat-streaming-python" />

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Vision (Image Input)</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Supported by: <code>google/gemini-3-flash-preview</code>, <code>openai/gpt-5.2</code>, <code>aichixia/aichixia-flash</code>, <code>xai/grok-4-fast</code></p>
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

              {activeTab === 'anthropic' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Anthropic SDK</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Use the official Anthropic SDK with Aichixia by setting a custom <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">baseURL</code>. All Aichixia models available — not just Claude.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-900/50">
                    <div className="flex items-start gap-3">
                      <FaBolt className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-orange-900 dark:text-orange-100 mb-1">Endpoint</h4>
                        <code className="text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded break-all inline-block max-w-full">POST {base}/api/v1/messages</code>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1.5">Set <code className="bg-orange-100 dark:bg-orange-900/30 px-1 rounded">baseURL: "{base}/api/v1"</code> in the Anthropic SDK constructor.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Installation</h3>
                      <CopyButton code="npm install @anthropic-ai/sdk" id="install-anthropic-tab" />
                    </div>
                    <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3">
                      <code className="text-xs text-zinc-800 dark:text-zinc-200">npm install @anthropic-ai/sdk</code>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button onClick={() => toggleSection('anthropic-request')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'anthropic-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'anthropic-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="Model ID. Any model supported by Aichixia — not just Claude models." />
                        <Param name="messages" required type="array" desc="Array of message objects with role (user | assistant) and content." />
                        <Param name="max_tokens" required type="number" desc="Maximum tokens to generate. Required by Anthropic SDK." />
                        <Param name="system" type="string" desc="System prompt — passed as a separate field, not inside messages." />
                        <Param name="temperature" type="number" desc="Sampling temperature 0–2. Default: 0.8" />
                        <Param name="stream" type="boolean" desc="Streaming via native Anthropic SSE events (message_start, content_block_delta, message_stop). Default: false. Supported only on: moonshotai/kimi-k2.6, mistralai/mistral-large-latest, minimax-m3, stepfun-ai/step-3.7-flash, nvidia/nemotron-3-ultra-550b-a55b, openai/gpt-oss-120b, deepseek-v4-flash, z-ai/glm-5.2, google/gemma-4-31b, poolside/laguna-s-2.1, cohere/command-a, google/gemini-3-flash-preview, meta/llama-3.3-70b, deepseek/deepseek-v4-pro, anthropic/claude-fable-5, xiaomi/mimo-v2.5-pro, alibaba/qwen3-coder-plus, thinkingmachines/inkling" />
                      </div>
                    )}

                    <button onClick={() => toggleSection('anthropic-response')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Response Format</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'anthropic-response' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'anthropic-response' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`{
  "id": "msg_1234567890",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Your response here..."
    }
  ],
  "model": "anthropic/claude-opus-4-8",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 10,
    "output_tokens": 50
  }
}`}
                          </SyntaxHighlighter>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Access text via: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">message.content[0].text</code></p>
                      </div>
                    )}

                    <button onClick={() => toggleSection('anthropic-streaming')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Streaming</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'anthropic-streaming' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'anthropic-streaming' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                          Set <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">stream: true</code> to receive Server-Sent Events. This endpoint streams the same underlying <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">chat.completion.chunk</code> events as the OpenAI-compatible endpoint (read text from <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">choices[0].delta.content</code>), not native Anthropic events. Because of this, the Anthropic SDK's built-in <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">client.messages.stream()</code> helper is not compatible — use a manual <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">fetch</code> request instead, as shown below.
                        </p>
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                          <p className="text-xs text-amber-800 dark:text-amber-300">Streaming is currently only available for a subset of models. Requesting <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">stream: true</code> on an unsupported model returns a 400 error.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'moonshotai/kimi-k2.6', label: 'Kimi K2.6' },
                            { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
                            { id: 'openai/gpt-5.2', label: 'GPT-5.2' },
                            { id: 'aichixia/aichixia-flash', label: 'Aichixia 114B' },
                            { id: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
                            { id: 'anthropic/claude-fable-5', label: 'Claude Fable 5' },
                            { id: 'mistralai/mistral-large-latest', label: 'Mistral Large' },
                            { id: 'minimaxai/minimax-m3', label: 'MiniMax M3' },
                            { id: 'stepfun-ai/step-3.7-flash', label: 'Step 3.7 Flash' },
                            { id: 'nvidia/nemotron-3-ultra-550b-a55b', label: 'Nemotron 3 Ultra' },
                            { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
                            { id: 'deepseek/deepseek-v4-flash', label: 'DeepSeek V4 Flash' },
                            { id: 'deepseek/deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
                            { id: 'z-ai/glm-5.2', label: 'GLM 5.2' },
                            { id: 'z-ai/glm-4.7-flash', label: 'GLM 4.7 Flash' },
                            { id: 'google/gemma-4-31b', label: 'Gemma 4 31B' },
                            { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash' },
                            { id: 'poolside/laguna-s-2.1', label: 'Laguna S 2.1' },
                            { id: 'cohere/command-a', label: 'Cohere Command A' },
                            { id: 'meta/llama-3.3-70b', label: 'Llama 3.3 70B' },
                            { id: 'meta/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout' },
                            { id: 'xiaomi/mimo-v2.5-pro', label: 'MiMo V2.5 Pro' },
                            { id: 'alibaba/qwen3-coder-plus', label: 'Qwen3 Coder Plus' },
                            { id: 'alibaba/qwen3.8-27b', label: 'Qwen3.8 27B' },
                            { id: 'thinkingmachines/inkling', label: 'Inkling' },
                            { id: 'groq/compound', label: 'Groq Compound' },
                          ].map(({ id, label }) => (
                            <div key={id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <p className="text-xs font-semibold text-zinc-900 dark:text-white">{label}</p>
                              <code className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono break-all">{id}</code>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="javascript" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`const res = await fetch("${base}/api/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
  },
  body: JSON.stringify({
    model: "moonshotai/kimi-k2.6",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Tell me a short story" }],
    stream: true,
  }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const parts = buffer.split("\\n\\n");
  buffer = parts.pop() || "";

  for (const part of parts) {
    if (!part.startsWith("data: ")) continue;
    const payload = part.slice(6).trim();
    if (payload === "[DONE]") continue;
    const parsed = JSON.parse(payload);
    const delta = parsed.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
}`}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}

                    <button onClick={() => toggleSection('anthropic-diff')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Differences from OpenAI SDK</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'anthropic-diff' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'anthropic-diff' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="grid grid-cols-3 gap-2 mb-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          <span></span><span>OpenAI</span><span className="text-orange-500 dark:text-orange-400">Anthropic</span>
                        </div>
                        {[
                          { label: 'Auth header', openai: 'Authorization: Bearer', anthropic: 'x-api-key' },
                          { label: 'System prompt', openai: 'Inside messages', anthropic: 'Separate system field' },
                          { label: 'max_tokens', openai: 'Optional', anthropic: 'Required' },
                          { label: 'Response text', openai: 'choices[0].message.content', anthropic: 'content[0].text' },
                          { label: 'Token usage', openai: 'prompt_tokens / completion_tokens', anthropic: 'input_tokens / output_tokens' },
                        ].map(({ label, openai, anthropic }) => (
                          <div key={label} className="grid grid-cols-3 gap-2 text-xs py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 items-start">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
                            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-600 dark:text-zinc-400 break-all">{openai}</code>
                            <code className="bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded text-[10px] text-orange-600 dark:text-orange-400 break-all">{anthropic}</code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.anthropicTS} lang="TypeScript (Anthropic SDK)" id="anthropic-ts" />
                  <CodeBlock code={codeExamples.anthropicPython} lang="Python (Anthropic SDK)" id="anthropic-python" />
                  <CodeBlock code={codeExamples.anthropicSystem} lang="TypeScript — with system prompt" id="anthropic-system" />
                  <CodeBlock code={codeExamples.anthropicCurl} lang="cURL" id="anthropic-curl" />
                  <CodeBlock code={codeExamples.anthropicStreamingJS} lang="JavaScript — Streaming" id="anthropic-streaming-js" />
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
                        <code className="text-xs text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded break-all inline-block max-w-full">POST {base}/api/v1/images/generations</code>
                        <p className="text-xs text-pink-700 dark:text-pink-300 mt-1.5">Response returns base64-encoded image in <code className="bg-pink-100 dark:bg-pink-900/30 px-1 rounded">data[0].b64_json</code></p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button onClick={() => toggleSection('image-request')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'image-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'image-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="Image model ID: flux-2-dev, lucid-origin, phoenix-1.0, gemini-3-pro-image" />
                        <Param name="prompt" required type="string" desc="Text description of the image to generate" />
                        <Param name="image" type="string" desc="Base64-encoded source image (data URL). Required for gemini-3-pro-image, ignored by other models." />
                        <Param name="size" type="string" desc="Image dimensions WxH. e.g. 1024x1024, 512x512. Default: 1024x1024. Not used by gemini-3-pro-image." />
                        <Param name="steps" type="number" desc="Diffusion steps. Higher = better quality but slower. Default: 25–30. Not used by gemini-3-pro-image." />
                        <Param name="seed" type="number" desc="Random seed for reproducibility. Optional. Not used by gemini-3-pro-image." />
                        <Param name="guidance" type="number" desc="Guidance scale. How closely image follows prompt. Optional. Not used by gemini-3-pro-image." />
                        <Param name="negative_prompt" type="string" desc="What to exclude from the image. Not supported by gemini-3-pro-image." />
                        <Param name="response_format" type="string" desc="Output format: b64_json (default) or url" />
                        <Param name="n" type="number" desc="Number of images to generate. Default: 1" />
                      </div>
                    )}

                    <button onClick={() => toggleSection('image-response')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
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
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">To display: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{'`data:image/png;base64,${data.data[0].b64_json}`'}</code></p>
                      </div>
                    )}

                    <button onClick={() => toggleSection('image-models')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
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
                            { id: 'gemini-3-pro-image', name: 'Nano Banana Pro', provider: 'Google Gemini', desc: 'Image-to-image editing from a source image + prompt' },
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
                  <CodeBlock code={codeExamples.geminiProImageTS} lang="TypeScript · Gemini 3 Pro Image" id="image-gemini-ts" />
                </div>
              )}

              {activeTab === 'video' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Video Generation API</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Generate videos from images or text prompts using Wan 2.2 I2V and Hailuo H3.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border-l-4 border-purple-500 bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/50">
                    <div className="flex items-start gap-3">
                      <FaVideo className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-1">Endpoint</h4>
                        <code className="text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded break-all inline-block max-w-full">POST {base}/api/v1/videos/generations</code>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1.5">Response returns a direct video URL in <code className="bg-purple-100 dark:bg-purple-900/30 px-1 rounded">data.video</code>. Requires Pro or Enterprise plan.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button onClick={() => toggleSection('video-wan')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-2">
                        <SiAlibabacloud className="w-3.5 h-3.5 text-purple-500" />
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Wan 2.2 I2V (Alibaba)</h3>
                      </div>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'video-wan' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'video-wan' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="Must be wan2.2-i2v" />
                        <Param name="input_image" required type="string" desc="Base64 data URL or image URL. Required for this model." />
                        <Param name="last_image" type="string" desc="Optional last frame to guide the animation, same format as input_image" />
                        <Param name="prompt" type="string" desc="Motion description. Default: make this image come alive, cinematic motion, smooth animation" />
                        <Param name="duration_seconds" type="number" desc="Video length in seconds. Range: 0.5–20.1. Default: 3.5" />
                        <Param name="steps" type="number" desc="Inference steps. Range: 1–30. Default: 6" />
                        <Param name="frame_multiplier" type="string" desc="Frame interpolation multiplier. One of: 16, 32, 64, 128. Default: 16" />
                        <Param name="negative_prompt" type="string" desc="What to avoid in the generated motion. Optional." />
                        <Param name="guidance_scale" type="number" desc="High noise stage guidance. Range: 0–10. Default: 6.5" />
                        <Param name="guidance_scale_2" type="number" desc="Low noise stage guidance. Range: 0–10. Default: 1" />
                        <Param name="seed" type="number" desc="Seed for reproducibility. Range: 0–2147483647. Default: 42" />
                        <Param name="randomize_seed" type="boolean" desc="Ignore seed and randomize each call. Default: false" />
                        <Param name="quality" type="number" desc="Output video quality. Range: 1–10. Default: 6" />
                        <Param name="scheduler" type="string" desc="Sampling scheduler. Default: UniPCMultistep" />
                        <Param name="flow_shift" type="number" desc="Flow shift value. Range: 0.5–15. Default: 3" />
                        <Param name="safe_mode" type="boolean" desc="Enable safety filtering. Default: true" />
                      </div>
                    )}

                    <button onClick={() => toggleSection('video-hailuo')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-2">
                        <SiMaze className="w-3.5 h-3.5 text-cyan-500" />
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Hailuo H3 (MiniMax)</h3>
                      </div>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'video-hailuo' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'video-hailuo' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="Must be hailuo-h3" />
                        <Param name="prompt" type="string" desc="Text prompt describing the video. Works with or without an input image." />
                        <Param name="input_image" type="string" desc="Optional first frame, base64 data URL or image URL" />
                        <Param name="last_image" type="string" desc="Optional last frame, same format as input_image" />
                        <Param name="canvas" type="string" desc="Resolution and aspect ratio preset, e.g. 960x544 · 16:9 fast. 'fast' presets are lighter on GPU quota." />
                        <Param name="duration" type="number" desc="Video length in seconds. Range: 2–14. Default: 5" />
                        <Param name="steps" type="number" desc="Sampling steps. Range: 10–40. Default: 28" />
                        <Param name="seed" type="number" desc="Seed for reproducibility. Default: 42" />
                        <Param name="upsample" type="boolean" desc="Upsample the prompt for richer detail. Default: false" />
                      </div>
                    )}

                    <button onClick={() => toggleSection('video-response')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Response Format</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'video-response' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'video-response' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`{
  "id": "video-1234567890",
  "object": "video.generation",
  "created": 1677652288,
  "model": "wan2.2-i2v",
  "data": {
    "video": "https://.../generated.mp4",
    "download": "https://.../generated.mp4",
    "seed": 42
  }
}`}
                          </SyntaxHighlighter>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">Video generation can take significantly longer than text or image requests. Increase client-side timeouts accordingly.</p>
                      </div>
                    )}

                    <button onClick={() => toggleSection('video-models')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Available Video Models</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'video-models' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'video-models' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="space-y-2">
                          {[
                            { id: 'wan2.2-i2v', name: 'Wan 2.2 I2V', provider: 'Alibaba', desc: 'Image-to-video with cinematic motion, requires an input image' },
                            { id: 'hailuo-h3', name: 'Hailuo H3', provider: 'MiniMax', desc: 'Text-to-video and image-to-video with fully synced soundtrack' },
                          ].map(({ id, name, provider, desc }) => (
                            <div key={id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{name}</p>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{provider}</span>
                              </div>
                              <code className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">{id}</code>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.videoWanJS} lang="JavaScript · Wan 2.2 I2V" id="video-wan-js" />
                  <CodeBlock code={codeExamples.videoWanPython} lang="Python · Wan 2.2 I2V" id="video-wan-python" />
                  <CodeBlock code={codeExamples.videoWanCurl} lang="cURL · Wan 2.2 I2V" id="video-wan-curl" />
                  <CodeBlock code={codeExamples.videoHailuoJS} lang="JavaScript · Hailuo H3" id="video-hailuo-js" />
                  <CodeBlock code={codeExamples.videoHailuoPython} lang="Python · Hailuo H3" id="video-hailuo-python" />
                  <CodeBlock code={codeExamples.videoHailuoCurl} lang="cURL · Hailuo H3" id="video-hailuo-curl" />
                </div>
              )}

              {activeTab === 'tts' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Text-to-Speech API</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Convert text to natural-sounding speech with emotional control using Starling TTS, Lindsay TTS, Miu Kobayashi TTS, and Catherine TTS.
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl border-l-4 border-violet-500 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-200 dark:border-violet-900/50">
                    <div className="flex items-start gap-3">
                      <FaMicrophone className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-violet-900 dark:text-violet-100 mb-1">Endpoint</h4>
                        <code className="text-xs text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded break-all inline-block max-w-full">POST {base}/api/v1/audio/speech</code>
                        <p className="text-xs text-violet-700 dark:text-violet-300 mt-1.5">Returns audio as data URI in <code className="bg-violet-100 dark:bg-violet-900/30 px-1 rounded">audio_url</code> and raw base64 in <code className="bg-violet-100 dark:bg-violet-900/30 px-1 rounded">audio</code></p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button onClick={() => toggleSection('tts-request')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Body</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'tts-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'tts-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="model" required type="string" desc="TTS model ID: starling-tts, lindsay-tts, miu-tts, catherine-tts, nana-tts, stephanie-tts, alexandra-tts, or eve-tts" />
                        <Param name="input" required type="string" desc="The text to convert to speech. Max 2000 characters (5000 for alexandra-tts / eve-tts)." />
                        <Param name="emotion" type="string" desc="Typecast models only. Emotional tone: normal, happy, sad, angry, fearful, disgusted, surprised. Default: normal" />
                        <Param name="emotion_intensity" type="number" desc="Typecast models only. Emotion intensity 0–2. Default: 1" />
                        <Param name="volume" type="number" desc="Typecast models only. Output volume 0–200. Default: 100" />
                        <Param name="pitch" type="number" desc="Typecast models only. Pitch in semitones -12 to 12. Default: 0" />
                        <Param name="tempo" type="number" desc="Typecast models only. Speed multiplier 0.5–2.0. Default: 1" />
                        <Param name="stability" type="number" desc="ElevenLabs models only (alexandra-tts, eve-tts). Voice stability 0–1. Default: 0.5" />
                        <Param name="similarity_boost" type="number" desc="ElevenLabs models only. Similarity to original voice 0–1. Default: 0.75" />
                        <Param name="style" type="number" desc="ElevenLabs models only. Style exaggeration 0–1. Default: 0" />
                        <Param name="speaker_boost" type="boolean" desc="ElevenLabs models only. Boost speaker clarity. Default: true" />
                        <Param name="response_format" type="string" desc="Audio format: mp3 or wav. Default: mp3" />
                        <Param name="language" type="string" desc="Language code, varies by model. Default: eng (Typecast) / eng (ElevenLabs)" />
                        <Param name="seed" type="number" desc="Random seed for reproducibility. Optional." />
                      </div>
                    )}

                    <button onClick={() => toggleSection('tts-response')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
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
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">To play: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{'new Audio(data.audio_url).play()'}</code></p>
                      </div>
                    )}

                    <button onClick={() => toggleSection('tts-models')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Available TTS Models</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'tts-models' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'tts-models' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="grid sm:grid-cols-2 gap-2">
                          {[
                            { id: 'starling-tts', name: 'Starling TTS', provider: 'Typecast', desc: 'Natural voice with emotional control. Standard quality.' },
                            { id: 'lindsay-tts', name: 'Lindsay TTS', provider: 'Typecast', desc: 'Premium voice with enhanced prosody and clarity.' },
                            { id: 'miu-tts', name: 'Miu Kobayashi TTS', provider: 'Typecast', desc: 'Expressive voice actor model with vivid emotional range.' },
                            { id: 'catherine-tts', name: 'Catherine TTS', provider: 'Typecast', desc: 'Warm, polished voice for professional narration.' },
                            { id: 'nana-tts', name: 'Nana TTS', provider: 'Typecast', desc: 'Bright, energetic voice with lively delivery.' },
                            { id: 'stephanie-tts', name: 'Stephanie TTS', provider: 'Typecast', desc: 'Confident, articulate voice for versatile use.' },
                            { id: 'alexandra-tts', name: 'Alexandra TTS', provider: 'ElevenLabs', desc: 'Multilingual voice supporting Indonesian, English, Russian, Mandarin.' },
                            { id: 'eve-tts', name: 'Eve TTS', provider: 'ElevenLabs', desc: 'Multilingual voice supporting Korean, English, Malay, Vietnamese.' },
                          ].map(({ id, name, provider, desc }) => (
                            <div key={id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{name}</p>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">{provider}</span>
                              </div>
                              <code className="text-[10px] text-violet-600 dark:text-violet-400 font-mono break-all">{id}</code>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => toggleSection('tts-languages')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Supported Languages</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'tts-languages' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'tts-languages' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Typecast models (starling-tts, lindsay-tts, miu-tts, catherine-tts, nana-tts, stephanie-tts)</p>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {[
                              { code: 'eng', label: 'English', flag: '🇺🇸' },
                              { code: 'kor', label: 'Korean', flag: '🇰🇷' },
                              { code: 'jpn', label: 'Japanese', flag: '🇯🇵' },
                              { code: 'cmn', label: 'Mandarin', flag: '🇨🇳' },
                              { code: 'spa', label: 'Spanish', flag: '🇪🇸' },
                            ].map(({ code, label, flag }) => (
                              <div key={code} className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <span className="text-base leading-none">{flag}</span>
                                <code className="text-[10px] font-mono text-violet-600 dark:text-violet-400">{code}</code>
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400">{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Alexandra TTS (ElevenLabs)</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { code: 'ind', label: 'Indonesian', flag: '🇮🇩' },
                              { code: 'eng', label: 'English', flag: '🇺🇸' },
                              { code: 'rus', label: 'Russian', flag: '🇷🇺' },
                              { code: 'cmn', label: 'Mandarin', flag: '🇨🇳' },
                            ].map(({ code, label, flag }) => (
                              <div key={code} className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <span className="text-base leading-none">{flag}</span>
                                <code className="text-[10px] font-mono text-violet-600 dark:text-violet-400">{code}</code>
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400">{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Eve TTS (ElevenLabs)</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { code: 'kor', label: 'Korean', flag: '🇰🇷' },
                              { code: 'eng', label: 'English', flag: '🇺🇸' },
                              { code: 'msa', label: 'Malay', flag: '🇲🇾' },
                              { code: 'vie', label: 'Vietnamese', flag: '🇻🇳' },
                            ].map(({ code, label, flag }) => (
                              <div key={code} className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <span className="text-base leading-none">{flag}</span>
                                <code className="text-[10px] font-mono text-violet-600 dark:text-violet-400">{code}</code>
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400">{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.ttsJS} lang="JavaScript" id="tts-js" />
                  <CodeBlock code={codeExamples.ttsPython} lang="Python" id="tts-python" />
                  <CodeBlock code={codeExamples.ttsCurl} lang="cURL" id="tts-curl" />
                </div>
              )}

              {activeTab === 'stt' && (
                <div className="space-y-6 animate-fade-in-up">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">Speech-to-Text API</h2>
                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                      Transcribe audio files into text or translate spoken audio to English using Whisper Large V3 and Whisper V3 Turbo — powered by Groq for ultra-fast inference.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 sm:p-5 rounded-xl border-l-4 border-teal-500 bg-teal-50/50 dark:bg-teal-950/10 border border-teal-200 dark:border-teal-900/50">
                      <div className="flex items-start gap-3">
                        <FaCloudUploadAlt className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-teal-900 dark:text-teal-100 mb-1">Transcriptions</h4>
                          <code className="text-xs text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded break-all inline-block max-w-full">POST {base}/api/v1/audio/transcriptions</code>
                          <p className="text-xs text-teal-700 dark:text-teal-300 mt-1.5">Transcribes audio into the original language of the recording.</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50">
                      <div className="flex items-start gap-3">
                        <FaGlobe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">Translations</h4>
                          <code className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded break-all inline-block max-w-full">POST {base}/api/v1/audio/translations</code>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1.5">Transcribes and translates audio to English, regardless of source language.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10">
                    <div className="flex items-start gap-2.5">
                      <FaInfoCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Important: multipart/form-data</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                          Unlike other endpoints, STT uses <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">multipart/form-data</code> — not JSON. Do not set <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">Content-Type: application/json</code>. Let the browser or SDK set it automatically from the FormData object.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button onClick={() => toggleSection('stt-request')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request (Form Fields)</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'stt-request' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'stt-request' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <Param name="file" required type="file" desc="Audio file to transcribe. Supported: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm. Max 25MB." />
                        <Param name="model" required type="string" desc="Model ID: whisper-large-v3 (max accuracy) or whisper-large-v3-turbo (max speed, 216× real-time)." />
                        <Param name="response_format" type="string" desc="Output format: json (default), verbose_json (includes segments + timestamps), or text (plain string)." />
                        <Param name="language" type="string" desc="ISO-639-1 language code of the audio (e.g. en, id, ja). Improves accuracy. Transcriptions only — ignored on translations." />
                        <Param name="prompt" type="string" desc="Optional context to guide the model style or help with spelling. Max 224 tokens." />
                        <Param name="temperature" type="number" desc="Sampling temperature 0–1. Default: 0 (deterministic). Higher values add randomness." />
                      </div>
                    )}

                    <button onClick={() => toggleSection('stt-response')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Response Format</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'stt-response' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'stt-response' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">json / text</p>
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
                            {`{ "text": "Hello, this is the transcribed text." }`}
                          </SyntaxHighlighter>
                        </div>
                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">verbose_json — includes segments with timestamps</p>
                        <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                          <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight} customStyle={{ margin: 0, padding: '12px', background: 'transparent', fontSize: '11px' }}>
{`{
  "text": "Hello, this is the transcribed text.",
  "task": "transcribe",
  "language": "english",
  "duration": 3.5,
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 3.5,
      "text": "Hello, this is the transcribed text.",
      "avg_logprob": -0.21,
      "no_speech_prob": 0.01
    }
  ]
}`}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}

                    <button onClick={() => toggleSection('stt-models')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Available STT Models</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'stt-models' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'stt-models' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="space-y-2">
                          {[
                            { id: 'whisper-large-v3', name: 'Whisper Large V3', provider: 'Groq', desc: 'Maximum accuracy. 8.4% WER on short-form. 1550M params. Best for difficult audio, strong accents, noisy environments.' },
                            { id: 'whisper-large-v3-turbo', name: 'Whisper V3 Turbo', provider: 'Groq', desc: '216× real-time speed. Excellent accuracy with significantly faster inference. Ideal for high-volume and latency-sensitive apps.' },
                          ].map(({ id, name, provider, desc }) => (
                            <div key={id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{name}</p>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{provider}</span>
                              </div>
                              <code className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">{id}</code>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Supported Audio Formats</p>
                          <div className="flex flex-wrap gap-1.5">
                            {['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm'].map(fmt => (
                              <code key={fmt} className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50">{fmt}</code>
                            ))}
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-2">Max file size: 25MB · Audio is downsampled to 16kHz mono internally.</p>
                        </div>
                      </div>
                    )}

                    <button onClick={() => toggleSection('stt-compare')} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Transcribe vs Translate</h3>
                      <FaChevronRight className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedSection === 'stt-compare' ? 'rotate-90' : ''}`} />
                    </button>
                    {expandedSection === 'stt-compare' && (
                      <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div className="grid grid-cols-3 gap-2 mb-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          <span></span><span className="text-teal-600 dark:text-teal-400">Transcriptions</span><span className="text-emerald-600 dark:text-emerald-400">Translations</span>
                        </div>
                        {[
                          { label: 'Endpoint', a: '/audio/transcriptions', b: '/audio/translations' },
                          { label: 'Output language', a: 'Same as audio', b: 'Always English' },
                          { label: 'language param', a: 'Supported', b: 'Ignored' },
                          { label: 'Use case', a: 'Meeting notes, podcasts', b: 'Foreign content → EN' },
                          { label: 'Best model', a: 'whisper-large-v3-turbo', b: 'whisper-large-v3' },
                        ].map(({ label, a, b }) => (
                          <div key={label} className="grid grid-cols-3 gap-2 text-xs py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 items-start">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
                            <code className="bg-teal-50 dark:bg-teal-950/20 px-1.5 py-0.5 rounded text-[10px] text-teal-600 dark:text-teal-400 break-all">{a}</code>
                            <code className="bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded text-[10px] text-emerald-600 dark:text-emerald-400 break-all">{b}</code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <CodeBlock code={codeExamples.sttTS} lang="TypeScript" id="stt-ts" />
                  <CodeBlock code={codeExamples.sttPython} lang="Python" id="stt-python" />
                  <CodeBlock code={codeExamples.sttCurl} lang="cURL — Transcription" id="stt-curl" />
                  <CodeBlock code={codeExamples.sttTranslateTS} lang="TypeScript — Translation" id="stt-translate-ts" />
                  <CodeBlock code={codeExamples.sttTranslateCurl} lang="cURL — Translation" id="stt-translate-curl" />
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

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes assistIn {
            from { opacity:0; transform:translateY(16px) scale(0.95); }
            to   { opacity:1; transform:translateY(0) scale(1); }
          }
          @keyframes assistOut {
            from { opacity:1; transform:translateY(0) scale(1); }
            to   { opacity:0; transform:translateY(16px) scale(0.95); }
          }
          @keyframes assistBtnIn {
            0%   { opacity:0; transform:scale(0.4) rotate(-20deg); }
            70%  { transform:scale(1.12) rotate(3deg); }
            100% { opacity:1; transform:scale(1) rotate(0deg); }
          }
          @keyframes pulseRing {
            0%   { transform:scale(1);    opacity:0.55; }
            100% { transform:scale(1.75); opacity:0; }
          }
          @keyframes msgIn {
            from { opacity:0; transform:translateY(8px) scale(0.97); }
            to   { opacity:1; transform:translateY(0) scale(1); }
          }
          @keyframes typingBounce {
            0%,60%,100% { transform:translateY(0); }
            30%         { transform:translateY(-5px); }
          }
          @keyframes shimmerSlide {
            0%   { transform:translateX(-100%); }
            100% { transform:translateX(200%); }
          }
          @keyframes floatBob {
            0%,100% { transform:translateY(0px); }
            50%     { transform:translateY(-4px); }
          }
          @keyframes sparkle {
            0%,100% { opacity:0; transform:scale(0); }
            50%     { opacity:1; transform:scale(1); }
          }
          .assist-modal-in  { animation: assistIn  0.35s cubic-bezier(0.22,1,0.36,1) both; }
          .assist-modal-out { animation: assistOut 0.25s cubic-bezier(0.4,0,1,1) both; }
          .assist-btn-in    { animation: assistBtnIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.6s both; }
          .assist-msg-in    { animation: msgIn 0.22s cubic-bezier(0.22,1,0.36,1) both; }
          .assist-typing span { animation: typingBounce 1.1s ease-in-out infinite; display:inline-block; }
          .assist-typing span:nth-child(2) { animation-delay:0.15s; }
          .assist-typing span:nth-child(3) { animation-delay:0.3s; }
          .assist-float { animation: floatBob 3s ease-in-out infinite; }
          .assist-sparkle-1 { animation: sparkle 2s ease-in-out infinite 0s; }
          .assist-sparkle-2 { animation: sparkle 2s ease-in-out infinite 0.6s; }
          .assist-sparkle-3 { animation: sparkle 2s ease-in-out infinite 1.2s; }
          .assist-shimmer {
            position:absolute; inset:0; pointer-events:none;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
            animation:shimmerSlide 2.5s ease-in-out infinite;
          }
          .assist-scroll::-webkit-scrollbar { width:3px; }
          .assist-scroll::-webkit-scrollbar-track { background:transparent; }
          .assist-scroll::-webkit-scrollbar-thumb { background:rgba(14,165,233,0.2); border-radius:99px; }
          .assist-md p { margin:0 0 6px 0; }
          .assist-md p:last-child { margin-bottom:0; }
          .assist-md code { font-family:monospace; font-size:10px; padding:1px 4px; border-radius:4px; }
          .assist-md pre { margin:6px 0; border-radius:10px; overflow-x:auto; }
          .assist-md pre code { padding:0; background:transparent; }
          .assist-md ul,
          .assist-md ol { margin:4px 0 4px 14px; padding:0; }
          .assist-md li { margin:2px 0; }
          .assist-md h1,.assist-md h2,.assist-md h3 { margin:8px 0 4px; font-weight:700; }
          .assist-md a { text-decoration:underline; opacity:0.85; }
          .assist-md blockquote { border-left:3px solid rgba(14,165,233,0.35); padding-left:8px; margin:4px 0; opacity:0.85; }
          .assist-md table { border-collapse:collapse; min-width:100%; margin:6px 0; font-size:10px; display:block; overflow-x:auto; }
          .assist-md th,.assist-md td { border:1px solid rgba(0,0,0,0.1); padding:3px 6px; }
          .assist-md-dark code { background:rgba(255,255,255,0.1); color:#e2e8f0; }
          .assist-md-dark th,.assist-md-dark td { border-color:rgba(255,255,255,0.1); }
          .assist-md-light code { background:rgba(0,0,0,0.06); color:#1e293b; }
          @media(max-width:640px) {
            @keyframes assistIn {
              from { opacity:0; transform:translateY(100%); }
              to   { opacity:1; transform:translateY(0); }
            }
            @keyframes assistOut {
              from { opacity:1; transform:translateY(0); }
              to   { opacity:0; transform:translateY(60px); }
            }
          }
        `}} />

        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-2.5" style={{ isolation: 'isolate' }}>
          {assistantOpen && (
            <div
              className={`relative flex flex-col overflow-hidden ${assistantVisible ? 'assist-modal-in' : 'assist-modal-out'}`}
              style={{
                width: 'min(380px, calc(100vw - 32px))',
                height: 'min(600px, calc(100vh - 90px))',
                borderRadius: 26,
                background: isDark
                  ? 'linear-gradient(155deg,#191a1f,#0d0e11)'
                  : 'linear-gradient(155deg,#ffffff,#f8faff)',
                border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.14)',
                boxShadow: isDark
                  ? '0 28px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(56,189,248,0.06), inset 0 1px 0 rgba(255,255,255,0.05)'
                  : '0 28px 70px rgba(37,99,235,0.14), 0 10px 28px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-44 pointer-events-none"
                style={{
                  background: isDark
                    ? 'radial-gradient(ellipse at 50% 0%,rgba(99,102,241,0.14) 0%,transparent 70%)'
                    : 'radial-gradient(ellipse at 50% 0%,rgba(99,102,241,0.08) 0%,transparent 70%)',
                }}
              />
              <div className="absolute top-3 right-8 w-1 h-1 rounded-full bg-sky-400 assist-sparkle-1" style={{ boxShadow: '0 0 4px rgba(14,165,233,0.8)' }} />
              <div className="absolute top-6 right-16 w-1.5 h-1.5 rounded-full bg-indigo-400 assist-sparkle-2" style={{ boxShadow: '0 0 4px rgba(99,102,241,0.8)' }} />
              <div className="absolute top-2 right-24 w-1 h-1 rounded-full bg-purple-400 assist-sparkle-3" style={{ boxShadow: '0 0 4px rgba(168,85,247,0.8)' }} />

              <div className="relative z-10 flex items-center justify-between px-4 py-3.5 flex-shrink-0" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(99,102,241,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0 assist-float">
                    <img
                      src="/my.png"
                      alt="Assistant"
                      className="w-9 h-9 rounded-2xl object-cover"
                      style={{ border: isDark ? '2px solid rgba(99,102,241,0.4)' : '2px solid rgba(99,102,241,0.25)', boxShadow: '0 0 14px rgba(99,102,241,0.3)' }}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 items-center justify-center" style={{ display: 'none', boxShadow: '0 0 14px rgba(99,102,241,0.4)' }}>
                      <SiGooglegemini className="text-white text-base" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 z-10" style={{ borderColor: isDark ? '#0d0e11' : '#ffffff', boxShadow: '0 0 6px rgba(52,211,153,0.7)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-black leading-tight bg-clip-text text-transparent" style={{ backgroundImage: isDark ? 'linear-gradient(90deg,#f0f9ff,#c7d2fe)' : 'linear-gradient(90deg,#0f172a,#4338ca)' }}>Aichixia Assistant</p>
                    <p className="text-[9px]" style={{ color: isDark ? 'rgba(165,180,252,0.6)' : 'rgba(99,102,241,0.5)' }}>Always online · Powered by Aichixia</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {assistantMessages.length > 0 && (
                    <button
                      onClick={resetAssistant}
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.07)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(14,165,233,0.12)' }}
                      title="Clear chat"
                    >
                      <FiRefreshCw style={{ fontSize: 11, color: isDark ? 'rgba(125,211,252,0.7)' : 'rgba(14,165,233,0.55)' }} />
                    </button>
                  )}
                  <button
                    onClick={closeAssistant}
                    className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(14,165,233,0.07)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(14,165,233,0.12)' }}
                  >
                    <FiX style={{ fontSize: 12, color: isDark ? 'rgba(125,211,252,0.7)' : 'rgba(14,165,233,0.55)' }} />
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 assist-scroll">
                {assistantMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-2">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-3xl blur-2xl animate-pulse" style={{ background: 'radial-gradient(circle,rgba(14,165,233,0.2),transparent)' }} />
                      <img
                        src="/my.png"
                        alt="Assistant"
                        className="relative w-20 h-20 rounded-3xl object-cover"
                        style={{ border: '2px solid rgba(14,165,233,0.3)', boxShadow: '0 8px 28px rgba(14,165,233,0.2), 0 0 0 4px rgba(14,165,233,0.07)' }}
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 items-center justify-center" style={{ display: 'none', boxShadow: '0 8px 28px rgba(14,165,233,0.25)' }}>
                        <SiGooglegemini className="text-white text-3xl" />
                      </div>
                      
                    </div>
                    <div>
                      <p className="text-sm font-black mb-1" style={{ color: isDark ? '#f0f9ff' : '#0f172a' }}>Hi! I'm Aichixia Assistant.</p>
                      <p className="text-xs leading-relaxed max-w-[210px]" style={{ color: isDark ? 'rgba(125,211,252,0.6)' : 'rgba(14,165,233,0.5)' }}>Ask me anything about the Aichixia API and I'll help you get started.</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        'How do I get started?',
                        'Show Python example',
                        'What models are free?',
                        'How does TTS work?',
                      ].map(q => (
                        <button
                          key={q}
                          onClick={() => { setAssistantInput(q); assistantInputRef.current?.focus(); }}
                          className="px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: isDark ? 'rgba(14,165,233,0.08)' : 'rgba(14,165,233,0.05)',
                            border: isDark ? '1px solid rgba(14,165,233,0.2)' : '1px solid rgba(14,165,233,0.18)',
                            color: isDark ? 'rgba(125,211,252,0.9)' : 'rgba(14,165,233,0.75)',
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {assistantMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 assist-msg-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 mt-0.5">
                        <img
                          src="/my.png"
                          alt="Assistant"
                          className="w-6 h-6 rounded-xl object-cover"
                          style={{ border: '1.5px solid rgba(14,165,233,0.25)' }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                            const fb = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fb) fb.style.display = 'flex';
                          }}
                        />
                        <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 items-center justify-center" style={{ display: 'none' }}>
                          <SiGooglegemini className="text-white" style={{ fontSize: 9 }} />
                        </div>
                      </div>
                    )}
                    <div
                      className={`relative max-w-[80%] px-3 py-2 text-xs leading-relaxed break-words ${msg.role === 'user' ? 'rounded-2xl rounded-tr-sm overflow-hidden' : 'rounded-2xl rounded-tl-sm overflow-x-auto'}`}
                      style={msg.role === 'user' ? {
                        background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                        color: '#fff',
                        boxShadow: '0 4px 14px rgba(14,165,233,0.25)',
                      } : {
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(14,165,233,0.05)',
                        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(14,165,233,0.1)',
                        color: isDark ? '#e0f2fe' : '#0f172a',
                      }}
                    >
                      {msg.role === 'user' && <span className="assist-shimmer" />}
                      {msg.role === 'user' ? (
                        <span>{msg.content}</span>
                      ) : (
                        <div className={`assist-md ${isDark ? 'assist-md-dark' : 'assist-md-light'}`} style={{ overflowX: 'auto', maxWidth: '100%' }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                              code: ({ node, className, children, ...props }: any) => {
                                const isBlock = className?.includes('language-');
                                return isBlock ? (
                                  <pre style={{ background: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.06)', padding: '8px 10px', borderRadius: 8, overflowX: 'auto', margin: '6px 0' }}>
                                    <code style={{ fontSize: 10, fontFamily: 'monospace', color: isDark ? '#7dd3fc' : '#0ea5e9' }}>{children}</code>
                                  </pre>
                                ) : (
                                  <code style={{ background: isDark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.08)', color: isDark ? '#7dd3fc' : '#0ea5e9', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontFamily: 'monospace' }} {...props}>{children}</code>
                                );
                              },
                              a: ({ href, children }: any) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#a78bfa' : '#0ea5e9', textDecoration: 'underline' }}>{children}</a>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {assistantLoading && (
                  <div className="flex gap-2.5 assist-msg-in">
                    <div className="flex-shrink-0 mt-0.5">
                      <img
                        src="/my.png"
                        alt="Assistant"
                        className="w-6 h-6 rounded-xl object-cover"
                        style={{ border: '1.5px solid rgba(14,165,233,0.25)' }}
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          const fb = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                      <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 items-center justify-center" style={{ display: 'none' }}>
                        <SiGooglegemini className="text-white" style={{ fontSize: 9 }} />
                      </div>
                    </div>
                    <div
                      className="assist-typing inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(14,165,233,0.05)',
                        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(14,165,233,0.1)',
                        width: 'fit-content',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isDark ? 'rgba(125,211,252,0.6)' : 'rgba(14,165,233,0.35)' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isDark ? 'rgba(125,211,252,0.6)' : 'rgba(14,165,233,0.35)' }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isDark ? 'rgba(125,211,252,0.6)' : 'rgba(14,165,233,0.35)' }} />
                    </div>
                  </div>
                )}
                <div ref={assistantEndRef} />
              </div>

              <div className="relative z-10 flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(14,165,233,0.08)' }}>
                <div
                  className="flex items-end gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(168,85,247,0.04)',
                    border: isDark ? '1px solid rgba(14,165,233,0.18)' : '1px solid rgba(14,165,233,0.12)',
                  }}
                >
                  <textarea
                    ref={assistantInputRef}
                    value={assistantInput}
                    onChange={e => setAssistantInput(e.target.value)}
                    onKeyDown={handleAssistantKey}
                    placeholder="Ask about the Aichixia API..."
                    rows={1}
                    disabled={assistantLoading}
                    className="flex-1 bg-transparent text-xs outline-none resize-none leading-relaxed max-h-20 overflow-y-auto disabled:opacity-50"
                    style={{ minHeight: '20px', color: isDark ? '#e0f2fe' : '#0f172a' }}
                  />
                  <button
                    onClick={sendAssistantMessage}
                    disabled={!assistantInput.trim() || assistantLoading}
                    className="relative flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 overflow-hidden disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', boxShadow: '0 3px 10px rgba(14,165,233,0.35)' }}
                  >
                    <span className="assist-shimmer" />
                    {assistantLoading
                      ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                      : <FiSend className="text-white relative z-10" style={{ fontSize: 11 }} />
                    }
                  </button>
                </div>
                <p className="text-[9px] text-center mt-1.5" style={{ color: isDark ? 'rgba(125,211,252,0.35)' : 'rgba(14,165,233,0.3)' }}>Enter to send · Shift+Enter newline</p>
              </div>
            </div>
          )}

          <button
            onClick={assistantOpen ? closeAssistant : openAssistant}
            className="relative assist-btn-in group"
            style={{ width: 52, height: 52 }}
            aria-label="Open Aichixia Assistant"
          >
            {assistantPulse && !assistantOpen && (
              <>
                <span className="absolute inset-0 rounded-full bg-sky-500" style={{ animation: 'pulseRing 2.2s ease-out infinite', opacity: 0.35 }} />
                <span className="absolute inset-0 rounded-full bg-blue-400" style={{ animation: 'pulseRing 2.2s ease-out infinite 0.8s', opacity: 0.2 }} />
              </>
            )}
            <div
              className="absolute -inset-[3px] rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(135deg,#38bdf8,#6366f1,#a855f7)', filter: 'blur(6px)' }}
            />
            <div
              className="relative w-full h-full rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-[1.08] active:scale-95 overflow-hidden"
              style={{
                background: 'linear-gradient(140deg,#0ea5e9 0%,#2563eb 55%,#4f46e5 100%)',
                boxShadow: '0 8px 24px rgba(37,99,235,0.4), 0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <span className="assist-shimmer" />
              <div className="relative z-10 flex items-center justify-center transition-transform duration-300" style={{ transform: assistantOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                {assistantOpen
                  ? <FiChevronDown className="text-white" style={{ fontSize: 19 }} />
                  : <SiGooglegemini className="text-white" style={{ fontSize: 20 }} />
                }
              </div>
            </div>
          </button>
        </div>
      </main>
    </>
  );
}
