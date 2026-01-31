import { useState, useEffect } from "react";
import { FaBookOpen, FaTerminal, FaCheckCircle, FaTimesCircle, FaCopy, FaChevronRight, FaCode, FaServer, FaLightbulb, FaTimes, FaInfoCircle, FaStar, FaGlobe, FaLayerGroup, FaRobot, FaBolt, FaGithub, FaTiktok, FaImage, FaKey, FaShieldAlt, FaExternalLinkAlt, FaBars, FaSearch } from "react-icons/fa";
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiDigikeyelectronics, SiAirbrake, SiMaze, SiXiaomi, SiSecurityscorecard } from "react-icons/si";
import { GiSpermWhale, GiPowerLightning, GiClover } from "react-icons/gi";
import { TbSquareLetterZ, TbLetterM } from "react-icons/tb";
import { FaXTwitter } from "react-icons/fa6";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://aichixia.vercel.app";

type CodeLanguage = 'javascript' | 'python' | 'bash' | 'php';

const SpeedIndicator = ({ level }: { level: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(4)].map((_, i) => (
        <FaBolt
          key={i}
          className={`${i < level ? 'text-blue-500' : 'text-zinc-300 dark:text-zinc-700'}`}
          size={10}
        />
      ))}
    </div>
  );
};

const QualityIndicator = ({ level }: { level: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={`${i < level ? 'text-blue-500' : 'text-zinc-300 dark:text-zinc-700'}`}
          size={10}
        />
      ))}
    </div>
  );
};

const Modal = ({ 
  isOpen, 
  onClose, 
  path, 
  desc, 
  method,
  note,
  modelInfo
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  path: string; 
  desc: string;
  method: string;
  note?: string;
  modelInfo?: {
    speed: number;
    quality: number;
    useCase: string;
    contextWindow?: string;
  };
}) => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'examples'>('overview');
  const [activeLanguage, setActiveLanguage] = useState<CodeLanguage>('javascript');
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCodeExample = (lang: CodeLanguage) => {
    const isPost = method === 'POST';
    const isTTS = path.includes('/starling') || path.includes('/lindsay');
    const isImage = path.includes('/flux') || path.includes('/lucid') || path.includes('/phoenix') || path.includes('/nano');
    
    if (lang === 'javascript') {
      if (isPost) {
        if (isTTS) {
          return `const response = await fetch('${path}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
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
        } else if (isImage) {
          return `const response = await fetch('${path}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A beautiful landscape',
    steps: 4
  })
});

const data = await response.json();
const img = document.createElement('img');
img.src = \`data:image/jpeg;base64,\${data.imageBase64}\`;`;
        } else {
          return `const response = await fetch('${path}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Your message here'
  })
});

const data = await response.json();
console.log(data.reply);`;
        }
      } else {
        return `const response = await fetch('${path}');
const data = await response.json();
console.log(data);`;
      }
    } else if (lang === 'python') {
      if (isPost) {
        if (isTTS) {
          return `import requests

response = requests.post('${path}', 
  json={
    'text': 'Hello world!',
    'emotion': 'normal',
    'volume': 100,
    'pitch': 0,
    'tempo': 1
  }
)

data = response.json()
audio_url = data['audio']
print(audio_url)`;
        } else if (isImage) {
          return `import requests

response = requests.post('${path}', 
  json={
    'prompt': 'A beautiful landscape',
    'steps': 4
  }
)

data = response.json()
image_base64 = data['imageBase64']
print(image_base64)`;
        } else {
          return `import requests

response = requests.post('${path}', 
  json={
    'message': 'Your message here'
  }
)

data = response.json()
print(data['reply'])`;
        }
      } else {
        return `import requests

response = requests.get('${path}')
data = response.json()
print(data)`;
      }
    } else if (lang === 'bash') {
      if (isPost) {
        if (isTTS) {
          return `curl -X POST '${path}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "text": "Hello world!",
    "emotion": "normal",
    "volume": 100,
    "pitch": 0,
    "tempo": 1
  }'`;
        } else if (isImage) {
          return `curl -X POST '${path}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "prompt": "A beautiful landscape",
    "steps": 4
  }'`;
        } else {
          return `curl -X POST '${path}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "message": "Your message here"
  }'`;
        }
      } else {
        return `curl '${path}'`;
      }
    } else if (lang === 'php') {
      if (isPost) {
        if (isTTS) {
          return `<?php
$ch = curl_init('${path}');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'text' => 'Hello world!',
  'emotion' => 'normal',
  'volume' => 100,
  'pitch' => 0,
  'tempo' => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response);
echo $data->audio;`;
        } else if (isImage) {
          return `<?php
$ch = curl_init('${path}');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'prompt' => 'A beautiful landscape',
  'steps' => 4
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response);
echo $data->imageBase64;`;
        } else {
          return `<?php
$ch = curl_init('${path}');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'message' => 'Your message here'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response);
echo $data->reply;`;
        }
      } else {
        return `<?php
$response = file_get_contents('${path}');
$data = json_decode($response);
print_r($data);`;
      }
    }
    return '';
  };

  if (!mounted && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose} 
      />
      <div className={`relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden transition-all duration-500 border border-zinc-200 dark:border-zinc-800 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="relative bg-white dark:bg-zinc-950 p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <FaCode className="text-white" size={18} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Endpoint Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <FaTimes className="text-zinc-500 dark:text-zinc-400" size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'examples'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              Code Examples
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-auto max-h-[calc(85vh-140px)]">
          {activeTab === 'overview' ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaServer className="text-blue-500" size={14} />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Method</h4>
                </div>
                <span className="inline-block px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm">
                  {method}
                </span>
              </div>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaInfoCircle className="text-blue-500" size={14} />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Description</h4>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>

              {modelInfo && (
                <>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">Speed</div>
                      <SpeedIndicator level={modelInfo.speed} />
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">Quality</div>
                      <QualityIndicator level={modelInfo.quality} />
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 col-span-2">
                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">Use Case</div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">{modelInfo.useCase}</div>
                    </div>
                    {modelInfo.contextWindow && (
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 col-span-2">
                        <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">Context Window</div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">{modelInfo.contextWindow}</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaCode className="text-blue-500" size={14} />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Endpoint URL</h4>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 mb-3 border border-zinc-200 dark:border-zinc-800">
                  <code className="text-blue-500 text-xs break-all font-mono">{path}</code>
                </div>
                <button
                  onClick={() => copy(path)}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <FaCheckCircle size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy size={14} />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>

              {note && (
                <>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                  <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FaLightbulb className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">Note</h4>
                        <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{note}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                {(['javascript', 'python', 'bash', 'php'] as CodeLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeLanguage === lang
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => copy(generateCodeExample(activeLanguage))}
                  className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <FaCheckCircle size={12} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <SyntaxHighlighter
                  language={activeLanguage === 'bash' ? 'bash' : activeLanguage}
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    fontSize: '0.813rem',
                    border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
                  }}
                  showLineNumbers
                >
                  {generateCodeExample(activeLanguage)}
                </SyntaxHighlighter>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-3">
                  <FaInfoCircle className="text-blue-500" size={14} />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide">Expected Response</h4>
                </div>
                <SyntaxHighlighter
                  language="json"
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    fontSize: '0.813rem',
                    margin: 0,
                  }}
                >
                  {path.includes('/starling') || path.includes('/lindsay')
                    ? `{
  "success": true,
  "audio": "data:audio/mp3;base64,...",
  "format": "mp3",
  "textLength": 12,
  "creditsUsed": 12
}`
                    : path.includes('/flux') || path.includes('/lucid') || path.includes('/phoenix') || path.includes('/nano')
                    ? `{
  "imageBase64": "base64_encoded_image_data",
  "provider": "model-name"
}`
                    : method === 'POST' 
                    ? `{
  "reply": "Response text here",
  "provider": "model-name"
}`
                    : `{
  "data": [...],
  "count": 10
}`}
                </SyntaxHighlighter>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold transition-all
      ${active ? "bg-emerald-500" : "bg-rose-500"}`}
    >
      {active ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />} {label}
    </span>
  );
};

const EndpointRow = ({
  method,
  path,
  desc,
  active = true,
  overrideLabel,
  note,
  modelInfo,
}: {
  method: string;
  path: string;
  desc: string;
  active?: boolean;
  overrideLabel?: string;
  note?: string;
  modelInfo?: {
    speed: number;
    quality: number;
    useCase: string;
    contextWindow?: string;
  };
}) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <div className="group bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:border-blue-500/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="px-3 py-1.5 bg-blue-500 text-white rounded-xl font-bold text-xs whitespace-nowrap">
              {method}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-900 dark:text-white text-sm font-semibold mb-1.5">{desc}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono truncate">{path.replace(base, '')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-xs transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        path={path}
        desc={desc}
        method={method}
        note={note}
        modelInfo={modelInfo}
      />
    </>
  );
};

const ModelCard = ({
  icon: Icon,
  name,
  endpoint,
  description,
  speed,
  quality,
}: {
  icon: any;
  name: string;
  endpoint: string;
  description: string;
  speed: number;
  quality: number;
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-all duration-200 text-left w-full hover:border-blue-500/50"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-xl flex-shrink-0">
            <Icon className="text-white" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">{name}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2">{description}</p>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <FaBolt className="text-blue-500 flex-shrink-0" size={12} />
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Speed</span>
                <SpeedIndicator level={speed} />
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="text-blue-500 flex-shrink-0" size={12} />
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Quality</span>
                <QualityIndicator level={quality} />
              </div>
            </div>
          </div>
        </div>
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        path={`${base}${endpoint}`}
        desc={description}
        method="POST"
        note="Send POST with JSON body containing 'message' field."
        modelInfo={{
          speed,
          quality,
          useCase: description,
        }}
      />
    </>
  );
};

export default function Docs() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setSidebarOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-blue-500 rounded-xl">
              <FaBookOpen className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Aichixia API</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Documentation</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <FaBars className="text-zinc-600 dark:text-zinc-400" size={18} />
            </button>
            <Link
              href="/console"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-sm transition-colors"
            >
              <FaKey size={14} />
              <span>Console</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className={`lg:col-span-3 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-28 space-y-1">
              <button
                onClick={() => scrollToSection('quick-start')}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Quick Start
              </button>
              <button
                onClick={() => scrollToSection('authentication')}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Authentication
              </button>
              <button
                onClick={() => scrollToSection('endpoints')}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                API Endpoints
              </button>
              <button
                onClick={() => scrollToSection('models')}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                AI Models
              </button>
              <button
                onClick={() => scrollToSection('tts')}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Text-to-Speech
              </button>
              <button
                onClick={() => scrollToSection('image')}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Image Generation
              </button>
              <button
                onClick={() => scrollToSection('errors')}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Error Handling
              </button>
            </div>
          </aside>

          <div className="lg:col-span-9 mt-8 lg:mt-0 space-y-16">
            <section id="quick-start">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Quick Start</h2>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Get started with Aichixia API in minutes. Our OpenAI-compatible endpoint makes integration seamless with existing tools and libraries.
                </p>
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
                  <SyntaxHighlighter
                    language="javascript"
                    style={oneDark}
                    customStyle={{
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      fontSize: '0.875rem',
                      margin: 0,
                      background: 'transparent',
                    }}
                  >
{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "your-api-key",
  baseURL: "${base}/api/v1"
});

const response = await client.chat.completions.create({
  model: "deepseek-v3.2",
  messages: [{ role: "user", content: "Hello!" }]
});

console.log(response.choices[0].message.content);`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>

            <section id="authentication">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Authentication</h2>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Getting Your API Key</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    Visit the <Link href="/console" className="text-blue-500 hover:underline font-semibold">console</Link> to generate your API key. Keep it secure and never expose it in client-side code.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FaShieldAlt className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">Security Best Practices</h4>
                        <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                          <li>• Store API keys in environment variables</li>
                          <li>• Never commit keys to version control</li>
                          <li>• Rotate keys periodically</li>
                          <li>• Use different keys for development and production</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Making Authenticated Requests</h3>
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
                    <SyntaxHighlighter
                      language="bash"
                      style={oneDark}
                      customStyle={{
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        fontSize: '0.875rem',
                        margin: 0,
                        background: 'transparent',
                      }}
                    >
{`curl -X POST '${base}/api/v1/chat/completions' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "model": "deepseek-v3.2",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
                    </SyntaxHighlighter>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">Rate Limits</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">Requests per Day</div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">1,000</div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">Concurrent Requests</div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">10</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="endpoints">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">API Endpoints</h2>
              <div className="space-y-4">
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/v1/chat/completions`} 
                  desc="OpenAI-compatible chat endpoint with 20+ models" 
                  note="Compatible with OpenAI SDK. Supports streaming, function calling, and all standard parameters. Choose from GPT, Claude, Gemini, DeepSeek, and more."
                />
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/chat`} 
                  desc="Smart routing chat endpoint - automatically selects optimal model" 
                  note="Send POST with JSON: { message: 'text' }. System analyzes your request and routes to the best model based on task type and complexity."
                />
              </div>
            </section>

            <section id="models">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">AI Models</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Access 20+ state-of-the-art AI models through a single API. Each model is optimized for specific use cases.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <ModelCard
                  icon={SiAirbrake}
                  name="Aichixia 411B"
                  endpoint="/api/models/aichixia"
                  description="Ultra-large flagship model with 411B parameters"
                  speed={5}
                  quality={5}
                />
                <ModelCard
                  icon={SiDigikeyelectronics}
                  name="Kimi K2"
                  endpoint="/api/models/kimi"
                  description="Superior tool calling and complex reasoning"
                  speed={4}
                  quality={5}
                />
                <ModelCard
                  icon={GiSpermWhale}
                  name="DeepSeek V3.2"
                  endpoint="/api/models/deepseek"
                  description="Deep reasoning and code generation"
                  speed={3}
                  quality={5}
                />
                <ModelCard
                  icon={SiAnthropic}
                  name="Claude Opus 4.5"
                  endpoint="/api/models/claude"
                  description="World's #1 AI model for complex tasks"
                  speed={3}
                  quality={5}
                />
                <ModelCard
                  icon={SiGooglegemini}
                  name="Gemini 3 Flash"
                  endpoint="/api/models/gemini"
                  description="Multimodal understanding and accuracy"
                  speed={4}
                  quality={5}
                />
                <ModelCard
                  icon={SiOpenai}
                  name="GPT-5 Mini"
                  endpoint="/api/models/openai"
                  description="Balanced performance for general tasks"
                  speed={3}
                  quality={4}
                />
                <ModelCard
                  icon={SiMeta}
                  name="Llama 3.3 70B"
                  endpoint="/api/models/llama"
                  description="Efficient open-source powerhouse"
                  speed={4}
                  quality={4}
                />
                <ModelCard
                  icon={SiAlibabacloud}
                  name="Qwen3 Coder 480B"
                  endpoint="/api/models/qwen"
                  description="Specialized in coding and Asian languages"
                  speed={3}
                  quality={5}
                />
                <ModelCard
                  icon={FaXTwitter}
                  name="Grok 3"
                  endpoint="/api/models/grok"
                  description="xAI's flagship with real-time data"
                  speed={4}
                  quality={5}
                />
                <ModelCard
                  icon={TbSquareLetterZ}
                  name="GLM 4.7"
                  endpoint="/api/models/glm"
                  description="Multilingual excellence with strong reasoning"
                  speed={3}
                  quality={4}
                />
              </div>
            </section>

            <section id="tts">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Text-to-Speech</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Convert text to natural-sounding speech with emotional control and voice customization.
              </p>
              <div className="space-y-4">
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/models/starling`} 
                  desc="Starling TTS - Natural voice synthesis" 
                  note="Send POST with JSON: { text: 'your text', emotion: 'normal', volume: 100, pitch: 0, tempo: 1 }. Returns base64 encoded audio."
                  modelInfo={{
                    speed: 4,
                    quality: 5,
                    useCase: "Standard text-to-speech with emotional control",
                  }}
                />
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/models/lindsay`} 
                  desc="Lindsay TTS - Enhanced voice quality" 
                  note="Send POST with JSON: { text: 'your text', emotion: 'happy', volume: 100, pitch: 0, tempo: 1 }. Premium quality with advanced emotional range."
                  modelInfo={{
                    speed: 5,
                    quality: 4,
                    useCase: "Premium text-to-speech with advanced emotional range",
                  }}
                />
              </div>
            </section>

            <section id="image">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Image Generation</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Create stunning AI-generated images from text descriptions using state-of-the-art models.
              </p>
              <div className="space-y-4">
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/models/flux`} 
                  desc="Flux 2 - Photorealistic image generation" 
                  note="Send POST with JSON: { prompt: 'description', steps: 4 }. Returns base64 encoded image."
                  modelInfo={{
                    speed: 4,
                    quality: 5,
                    useCase: "Text-to-image with photorealistic results",
                  }}
                />
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/models/lucid`} 
                  desc="Lucid Origin - Creative image synthesis" 
                  note="Send POST with JSON: { prompt: 'description', steps: 4 }. Returns base64 encoded image."
                  modelInfo={{
                    speed: 4,
                    quality: 5,
                    useCase: "Artistic and creative image generation",
                  }}
                />
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/models/phoenix`} 
                  desc="Phoenix 1.0 - Fast image generation" 
                  note="Send POST with JSON: { prompt: 'description', steps: 4 }. Quick artistic results."
                  modelInfo={{
                    speed: 4,
                    quality: 4,
                    useCase: "Quick artistic image generation",
                  }}
                />
                <EndpointRow 
                  method="POST" 
                  path={`${base}/api/models/nano`} 
                  desc="Nano Banana Pro - Compact image model" 
                  note="Send POST with JSON: { prompt: 'description', steps: 4 }. Lightweight and efficient."
                  modelInfo={{
                    speed: 4,
                    quality: 4,
                    useCase: "Lightweight image generation",
                  }}
                />
              </div>
            </section>

            <section id="errors">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Error Handling</h2>
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
                <p className="text-zinc-600 dark:text-zinc-400">
                  The API uses conventional HTTP response codes to indicate success or failure.
                </p>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <code className="text-emerald-700 dark:text-emerald-400 font-bold">200</code>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-1">Success</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">Request completed successfully</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <code className="text-amber-700 dark:text-amber-400 font-bold">400</code>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">Bad Request</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">Invalid parameters or malformed request</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <code className="text-rose-700 dark:text-rose-400 font-bold">401</code>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 mb-1">Unauthorized</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-300">Missing or invalid API key</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <code className="text-rose-700 dark:text-rose-400 font-bold">429</code>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 mb-1">Rate Limit Exceeded</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-300">Too many requests, please slow down</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <code className="text-rose-700 dark:text-rose-400 font-bold">500</code>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 mb-1">Server Error</h4>
                        <p className="text-sm text-rose-700 dark:text-rose-300">Internal server error, please try again</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Example Error Response</h4>
                  <SyntaxHighlighter
                    language="json"
                    style={oneDark}
                    customStyle={{
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      fontSize: '0.875rem',
                      margin: 0,
                      background: 'transparent',
                    }}
                  >
{`{
  "error": {
    "message": "Invalid API key provided",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500 rounded-xl">
                <FaBookOpen className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Aichixia API</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/console"
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm font-semibold"
              >
                <FaKey size={14} />
                <span>Console</span>
                <FaExternalLinkAlt size={10} />
              </Link>
              <a 
                href="https://github.com/Takawell/Aichixia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <FaGithub size={20} />
              </a>
              <a 
                href="https://tiktok.com/@putrawangyyy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <FaTiktok size={20} />
              </a>
            </div>

            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
            
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 text-sm">
              <FaTerminal size={14} />
              <span>© {new Date().getFullYear()} Aichixia - AI Assistant</span>
            </div>
            
            <p className="text-xs font-bold text-blue-500 tracking-widest">BY TAKAWELL</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
