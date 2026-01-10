import { useState, useEffect } from "react";
import { FaBookOpen, FaFilm, FaComments, FaTerminal, FaCheckCircle, FaTimesCircle, FaCopy, FaRocket, FaChevronRight, FaBrain, FaCode, FaServer, FaLightbulb, FaTimes, FaInfoCircle, FaStar, FaGlobe, FaLayerGroup, FaRobot, FaBolt, FaGithub, FaTiktok, FaImage, FaKey, FaShieldAlt, FaExternalLinkAlt } from "react-icons/fa";
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiDigikeyelectronics, SiFlux, SiXiaomi, SiMaze, SiImagedotsc } from "react-icons/si";
import { GiSpermWhale, GiPowerLightning, GiBlackHoleBolas, GiClover, GiFire } from "react-icons/gi";
import { TbSquareLetterZ, TbLetterM } from "react-icons/tb";
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
          className={`${i < level ? 'text-sky-500 dark:text-sky-400' : 'text-zinc-300 dark:text-zinc-700'}`}
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
          className={`${i < level ? 'text-sky-500 dark:text-sky-400' : 'text-zinc-300 dark:text-zinc-700'}`}
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
    const endpoint = path.replace(base, '');
    
    if (lang === 'javascript') {
      if (isPost) {
        return `const response = await fetch('${path}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Your message here',
    persona: 'tsundere'
  })
});

const data = await response.json();
console.log(data.reply);`;
      } else {
        return `const response = await fetch('${path}');
const data = await response.json();
console.log(data);`;
      }
    } else if (lang === 'python') {
      if (isPost) {
        return `import requests

response = requests.post('${path}', 
  json={
    'message': 'Your message here',
    'persona': 'tsundere'
  }
)

data = response.json()
print(data['reply'])`;
      } else {
        return `import requests

response = requests.get('${path}')
data = response.json()
print(data)`;
      }
    } else if (lang === 'bash') {
      if (isPost) {
        return `curl -X POST '${path}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "message": "Your message here",
    "persona": "tsundere"
  }'`;
      } else {
        return `curl '${path}'`;
      }
    } else if (lang === 'php') {
      if (isPost) {
        return `<?php
$ch = curl_init('${path}');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'message' => 'Your message here',
  'persona' => 'tsundere'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response);
echo $data->reply;`;
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/70 dark:bg-black/90 backdrop-blur-md transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose} 
      />
      <div className={`relative bg-white dark:bg-zinc-950 rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-all duration-500 border border-zinc-200 dark:border-zinc-800 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="relative bg-gradient-to-r from-zinc-900 via-neutral-900 to-stone-900 dark:from-black dark:via-zinc-950 dark:to-neutral-950 p-4 sm:p-6 border-b border-sky-400/20">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-lg shadow-sky-400/20">
                <FaCode className="text-white" size={18} />
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-white">Endpoint Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <FaTimes className="text-white" size={18} />
            </button>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                activeTab === 'examples'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Examples
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-180px)] bg-white dark:bg-zinc-950">
          {activeTab === 'overview' ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FaServer className="text-sky-500 dark:text-sky-400" size={14} />
                  <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Method</h4>
                </div>
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg font-bold text-xs sm:text-sm shadow-lg shadow-sky-400/30">
                  {method}
                </span>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FaInfoCircle className="text-sky-500 dark:text-sky-400" size={14} />
                  <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Description</h4>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>

              {modelInfo && (
                <>
                  <div className="border-t border-zinc-200 dark:border-zinc-800" />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Speed</div>
                      <SpeedIndicator level={modelInfo.speed} />
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Quality</div>
                      <QualityIndicator level={modelInfo.quality} />
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800 col-span-2">
                      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Use Case</div>
                      <div className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white">{modelInfo.useCase}</div>
                    </div>
                    {modelInfo.contextWindow && (
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800 col-span-2">
                        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Context Window</div>
                        <div className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white">{modelInfo.contextWindow}</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FaCode className="text-sky-500 dark:text-sky-400" size={14} />
                  <h4 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Endpoint URL</h4>
                </div>
                <div className="bg-zinc-100 dark:bg-black rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 border border-zinc-200 dark:border-zinc-800">
                  <code className="text-sky-500 dark:text-sky-400 text-[10px] sm:text-xs break-all font-mono">{path}</code>
                </div>
                <button
                  onClick={() => copy(path)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-sky-400/30"
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
                  <div className="border-t border-zinc-200 dark:border-zinc-800" />
                  <div className="bg-sky-50 dark:bg-sky-950/20 border-l-4 border-sky-400 dark:border-sky-500 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <FaLightbulb className="text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400 mb-1">Note</h4>
                        <p className="text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed">{note}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {(['javascript', 'python', 'bash', 'php'] as CodeLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-[10px] sm:text-xs transition-all duration-200 ${
                      activeLanguage === lang
                        ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-400/30'
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
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-white rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <FaCheckCircle size={10} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy size={10} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <SyntaxHighlighter
                  language={activeLanguage === 'bash' ? 'bash' : activeLanguage}
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    fontSize: '0.75rem',
                    border: isDark ? '1px solid #27272a' : '1px solid #e4e4e7',
                  }}
                  showLineNumbers
                >
                  {generateCodeExample(activeLanguage)}
                </SyntaxHighlighter>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-sky-500 dark:text-sky-400" size={12} />
                  <h4 className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Expected Response</h4>
                </div>
                <SyntaxHighlighter
                  language="json"
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.65rem',
                    margin: 0,
                  }}
                >
                  {method === 'POST' 
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
      className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white text-[10px] sm:text-xs font-semibold shadow-lg transition-all duration-300
      ${active ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-400/30" : "bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-400/30"}`}
    >
      {active ? <FaCheckCircle size={8} /> : <FaTimesCircle size={8} />} {label}
    </span>
  );
};

const Row = ({
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
      <div className="group bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-sky-400/10 dark:hover:shadow-sky-400/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg font-bold text-[10px] sm:text-xs whitespace-nowrap shadow-lg shadow-sky-400/30">
              {method}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-900 dark:text-white text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5">{desc}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs font-mono truncate">{path.replace(base, '')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
            <button
              onClick={() => setShowModal(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-semibold text-[10px] sm:text-xs transition-all duration-200 shadow-lg"
            >
              Details
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

const FeatureCard = ({ icon: Icon, title, description }: any) => {
  return (
    <div className="group bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-sky-400/10 dark:hover:shadow-sky-400/20 hover:-translate-y-1">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg sm:rounded-xl flex-shrink-0 shadow-lg shadow-sky-400/30">
          <Icon className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white mb-1 sm:mb-2">{title}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

const ModelCard = ({ icon: Icon, name, endpoint, color, description, speed, quality }: any) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="group bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-3 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-sky-400/10 dark:hover:shadow-sky-400/20 hover:-translate-y-1 text-left w-full"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`p-2 sm:p-3 bg-gradient-to-br ${color} rounded-lg sm:rounded-xl flex-shrink-0 shadow-lg`}>
            <Icon className="text-white" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white mb-1">{name}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mb-2 sm:mb-3">{description}</p>
            <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs">
              <div className="flex items-center gap-1">
                <FaBolt className="text-sky-500 flex-shrink-0" size={10} />
                <span className="text-zinc-500 dark:text-zinc-500">Speed:</span>
                <SpeedIndicator level={speed} />
              </div>
              <div className="flex items-center gap-1">
                <FaStar className="text-sky-500 flex-shrink-0" size={10} />
                <span className="text-zinc-500 dark:text-zinc-500">Quality:</span>
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
        note="Send POST with JSON body containing 'message' and optional 'persona' fields."
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      <div className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${scrolled ? 'bg-gradient-to-br from-sky-400 to-blue-500' : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800'} shadow-lg`}>
              <FaBookOpen className={`${scrolled ? 'text-white' : 'text-sky-500 dark:text-sky-400'}`} size={20} />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white">Aichixia API</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/console"
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 shadow-lg"
            >
              <FaKey size={14} />
              <span>Console</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-zinc-50 to-zinc-50 dark:from-zinc-950/50 dark:via-black dark:to-black pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-sky-400/20 dark:bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute top-12 sm:top-20 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-sky-100 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 rounded-full text-sky-600 dark:text-sky-400 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              <FaStar size={12} />
              <span>Free & Open API</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-sky-500 to-blue-500 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                Aichixia API
              </span>
              <br />
              <span className="text-zinc-900 dark:text-white">Powered by AI</span>
            </h2>
            
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-4">
              Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with multi-provider AI intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/chat"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-lg sm:rounded-xl font-bold transition-all duration-300 shadow-lg shadow-sky-400/30 hover:shadow-xl hover:shadow-sky-400/40 hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <FaComments size={18} />
                <span>Try AI Chat</span>
                <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={12} />
              </Link>
              
              <a
                href="#endpoints"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <FaRocket size={18} />
                <span>Explore Endpoints</span>
              </a>

              <Link
                href="/console"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg sm:rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <FaKey size={18} />
                <span>Get API Key</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-20">
            <FeatureCard
              icon={FaFilm}
              title="Rich Data"
              description="Access comprehensive anime, manga, and light novel information from AniList database"
            />
            <FeatureCard
              icon={FaBrain}
              title="Multi-AI"
              description="Smart fallback system with 20+ AI providers ensuring 99.9% uptime"
            />
            <FeatureCard
              icon={FaShieldAlt}
              title="Secure & Fast"
              description="API key authentication with rate limiting and lightning-fast responses"
            />
          </div>

          <section className="mb-12 sm:mb-20">
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 border-2 border-sky-200 dark:border-sky-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg shadow-lg">
                  <FaRobot className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mb-2">OpenAI-Compatible Endpoint</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">Use our unified API with OpenAI SDK for seamless integration</p>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-zinc-200 dark:border-zinc-800 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-sky-500 dark:text-sky-400 text-xs sm:text-sm font-mono">POST /api/v1/chat/completions</code>
                  <span className="px-2 sm:px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] sm:text-xs font-bold">Recommended</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mb-4">
                  Compatible with OpenAI SDK - use any of our 20+ models with a single endpoint. Supports authentication, rate limiting, and request logging.
                </p>
                
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-3 sm:p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCode className="text-sky-500 dark:text-sky-400" size={12} />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Quick Start</span>
                  </div>
                  <SyntaxHighlighter
                    language="javascript"
                    style={oneDark}
                    customStyle={{
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.7rem',
                      margin: 0,
                    }}
                  >
{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "your-api-key",
  baseURL: "${base}/api/v1"
});

const response = await client.chat.completions.create({
  model: "deepseek-v3.2",
  messages: [
    { role: "user", content: "Hello!" }
  ]
});`}
                  </SyntaxHighlighter>
                </div>

                <div className="flex items-start gap-2 p-3 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-900">
                  <FaShieldAlt className="text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" size={14} />
                  <p className="text-xs sm:text-sm text-sky-700 dark:text-sky-300">
                    Get your API key from the <Link href="/auth/login" className="font-bold underline">console</Link> to start using authenticated endpoints with rate limiting and usage tracking.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-zinc-950 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="text-emerald-500" size={16} />
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Benefits</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-sky-500 rounded-full" />
                      <span>OpenAI SDK compatible</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-sky-500 rounded-full" />
                      <span>20+ AI models in one API</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-sky-500 rounded-full" />
                      <span>Usage analytics & tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-sky-500 rounded-full" />
                      <span>Secure API key authentication</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-zinc-950 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaLayerGroup className="text-sky-500" size={16} />
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Available Models</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['deepseek-v3.2', 'gpt-5-mini', 'claude-haiku-4.5', 'gemini-3-flash', 'grok-3', 'llama-3.3-70b'].map((model) => (
                      <span key={model} className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 rounded text-[10px] font-mono">
                        {model}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-semibold">
                      +14 more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="endpoints" className="mb-12 sm:mb-20 scroll-mt-20">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg sm:rounded-xl shadow-lg shadow-sky-400/30">
                <FaFilm className="text-white" size={20} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">API Endpoints</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=anime&action=search&query={text}`} 
                desc="Search anime by title or keywords" 
                note="Replace {text} with your search query. Example: query=naruto. Returns matching anime with details."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=manga&action=search&query={text}`} 
                desc="Search manga by title or keywords" 
                note="Replace {text} with your search query. Returns Japanese manga results."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=manhwa&action=search&query={text}`} 
                desc="Search manhwa by title or keywords" 
                note="Replace {text} with your search query. Returns Korean manhwa results."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=manhua&action=search&query={text}`} 
                desc="Search manhua by title or keywords" 
                note="Replace {text} with your search query. Returns Chinese manhua results."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=ln&action=search&query={text}`} 
                desc="Search light novels by title" 
                note="Replace {text} with your search query. Returns light novel results."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=anime&action=detail&id={value}`} 
                desc="Get detailed information by media ID" 
                note="Replace {value} with AniList media ID. Returns full details including characters, staff, and relations."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?action=trending&category=anime&page=1&perPage=20`} 
                desc="Get currently trending anime and manga" 
                note="Returns a list of the most popular trending titles right now. Supports category filtering and pagination."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=anime&action=seasonal&season=<SEASON>&year=<YEAR>&page=<PAGE>&perPage=<PERPAGE>`} 
                desc="Get seasonal anime releases" 
                note="Returns anime airing within the specified season and year. Params 'season' and 'year' are required."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?action=airing`} 
                desc="Get anime airing schedule" 
                note="Returns weekly schedule of when anime episodes are airing."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=anime&action=recommendations&id={value}`} 
                desc="Get recommendations based on media ID" 
                note="Replace {value} with media ID. Returns similar recommendations."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=manhwa&action=top-genre&genre={name}`} 
                desc="Get top titles by genre" 
                note="Replace {name} with genre (Action, Romance, Fantasy, etc)."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?action=character&id={value}`} 
                desc="Get character details by ID" 
                note="Replace {value} with character ID. Returns detailed character info."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?action=staff&id={value}`} 
                desc="Get staff/creator details by ID" 
                active={false} 
                overrideLabel="Maintenance"
                note="Currently under maintenance. Will return staff information once restored."
              />
            </div>
          </section>

          <section className="mb-12 sm:mb-20">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg sm:rounded-xl shadow-lg shadow-sky-400/30">
                <FaComments className="text-white" size={20} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">AI Chat (Legacy)</h2>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <FaInfoCircle className="text-amber-600 dark:text-amber-400 mt-0.5" size={16} />
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  <strong>Note:</strong> This endpoint is maintained for backward compatibility. We recommend using <code className="bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400">/api/v1/chat/completions</code> for new projects.
                </p>
              </div>
            </div>
            
            <Row 
              method="POST" 
              path={`${base}/api/chat`} 
              desc="AI assistant with multi-provider intelligent fallback" 
              note="Send POST with JSON: { message: 'text', persona: 'optional' }. Auto-switches between OpenAI, Gemini, Deepseek, Qwen, GPT-OSS, Llama."
            />
            
            <div className="mt-4 sm:mt-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                <FaBrain size={14} className="text-sky-500 dark:text-sky-400" />
                AI Provider Chain
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs mb-3 sm:mb-4">
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full font-semibold shadow-lg shadow-emerald-400/30">OpenAI</span>
                <FaChevronRight className="text-zinc-400" size={8} />
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full font-semibold shadow-lg shadow-indigo-400/30">Gemini</span>
                <FaChevronRight className="text-zinc-400" size={8} />
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-violet-400/30">Deepseek</span>
                <FaChevronRight className="text-zinc-400" size={8} />
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-full font-semibold shadow-lg shadow-purple-400/30">Qwen</span>
                <FaChevronRight className="text-zinc-400" size={8} />
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold shadow-lg shadow-pink-400/30">GPT-OSS</span>
                <FaChevronRight className="text-zinc-400" size={8} />
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-full font-semibold shadow-lg shadow-rose-400/30">Llama</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                Automatic fallback ensures 99.9% uptime with intelligent provider switching
              </p>
            </div>
          </section>

          <section className="mb-12 sm:mb-20">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg sm:rounded-xl shadow-lg shadow-sky-400/30">
                <FaRobot className="text-white" size={20} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">AI Models (Legacy)</h2>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <FaInfoCircle className="text-amber-600 dark:text-amber-400 mt-0.5" size={16} />
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  <strong>Legacy endpoints:</strong> These endpoints are maintained for backward compatibility. For new integrations, use <code className="bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400">/api/v1/chat/completions</code> with the model parameter.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <ModelCard
                icon={SiDigikeyelectronics}
                name="Kimi K2"
                endpoint="/api/models/kimi"
                color="from-blue-600 to-cyan-600"
                description="Superior tool calling and complex reasoning"
                speed={3}
                quality={5}
              />
              <ModelCard
                icon={TbSquareLetterZ}
                name="GLM 4.7"
                endpoint="/api/models/glm"
                color="from-blue-700 to-indigo-900"
                description="Multilingual excellence with strong reasoning"
                speed={3}
                quality={4}
              />
              <ModelCard
                icon={TbLetterM}
                name="Mistral 3.1"
                endpoint="/api/models/mistral"
                color="from-orange-600 to-amber-600"
                description="Fast inference with European focus"
                speed={4}
                quality={4}
              />
              <ModelCard
                icon={SiOpenai}
                name="GPT-5 Mini"
                endpoint="/api/models/openai"
                color="from-emerald-600 to-green-600"
                description="Balanced performance for general tasks"
                speed={3}
                quality={4}
              />
              <ModelCard
                icon={SiMeta}
                name="Llama 3.3 70B"
                endpoint="/api/models/llama"
                color="from-blue-600 to-indigo-700"
                description="Efficient open-source powerhouse"
                speed={4}
                quality={4}
              />
              <ModelCard
                icon={SiOpenai}
                name="GPT-OSS 120B"
                endpoint="/api/models/gptoss"
                color="from-pink-600 to-rose-600"
                description="Large open-source with browser search"
                speed={3}
                quality={4}
              />
              <ModelCard
                icon={SiGooglegemini}
                name="Gemini 3 Flash"
                endpoint="/api/models/gemini"
                color="from-indigo-600 to-purple-600"
                description="Multimodal understanding and accuracy"
                speed={4}
                quality={5}
              />
              <ModelCard
                icon={GiSpermWhale}
                name="DeepSeek V3.2"
                endpoint="/api/models/deepseek"
                color="from-cyan-600 to-blue-600"
                description="Deep reasoning and code generation"
                speed={3}
                quality={5}
              />
              <ModelCard
                icon={GiSpermWhale}
                name="DeepSeek V3.1"
                endpoint="/api/models/deepseek-v"
                color="from-cyan-600 to-teal-600"
                description="Previous generation DeepSeek model"
                speed={3}
                quality={5}
              />
              <ModelCard
                icon={GiPowerLightning}
                name="Groq Compound"
                endpoint="/api/models/compound"
                color="from-orange-600 to-red-600"
                description="Multi-model agentic system with tools"
                speed={4}
                quality={5}
              />
              <ModelCard
                icon={SiAnthropic}
                name="Claude Haiku 4.5"
                endpoint="/api/models/claude"
                color="from-orange-600 to-amber-700"
                description="Fast, capable, and balanced Anthropic model"
                speed={4}
                quality={4}
              />
              <ModelCard
                icon={SiAlibabacloud}
                name="Qwen3 Coder 480B"
                endpoint="/api/models/qwen"
                color="from-purple-600 to-fuchsia-600"
                description="Specialized in coding and Asian languages"
                speed={3}
                quality={5}
              />
              <ModelCard
                icon={SiAlibabacloud}
                name="Qwen3 235B"
                endpoint="/api/models/qwen3"
                color="from-purple-500 to-pink-500"
                description="Large multilingual model with strong reasoning"
                speed={3}
                quality={5}
              />
              <ModelCard
                icon={GiClover}
                name="Cohere Command A"
                endpoint="/api/models/cohere"
                color="from-emerald-600 to-teal-600"
                description="Enterprise-grade with excellent tool use"
                speed={3}
                quality={4}
              />
              <ModelCard
                icon={SiXiaomi}
                name="MiMo V2 Flash"
                endpoint="/api/models/mimo"
                color="from-blue-600 to-purple-600"
                description="Fast Chinese-English bilingual model"
                speed={4}
                quality={4}
              />
              <ModelCard
                icon={SiMaze}
                name="MiniMax M2.1"
                endpoint="/api/models/minimax"
                color="from-cyan-500 to-blue-500"
                description="Balanced performance with good reasoning"
                speed={3}
                quality={4}
              />
              <ModelCard
                icon={GiBlackHoleBolas}
                name="Grok 3"
                endpoint="/api/models/grok"
                color="from-slate-600 to-zinc-800"
                description="xAI's flagship model with real-time data"
                speed={3}
                quality={5}
              />
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <FaImage className="text-sky-500 dark:text-sky-400 mt-1" size={18} />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1">Image Generation</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">Create stunning AI-generated images</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Row 
                  method="POST" 
                  path={`${base}/api/models/flux`} 
                  desc="Flux 2 - Photorealistic image generation" 
                  note="Send POST with JSON: { prompt: 'description', steps: 4 }. Returns base64 encoded image."
                  modelInfo={{
                    speed: 4,
                    quality: 5,
                    useCase: "Text-to-image generation with photorealistic results",
                  }}
                />
                <Row 
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
                <Row 
                  method="POST" 
                  path={`${base}/api/models/phoenix`} 
                  desc="Phoenix 1.0 - Fast image generation" 
                  note="Send POST with JSON: { prompt: 'description', steps: 4 }. Returns base64 encoded image."
                  modelInfo={{
                    speed: 4,
                    quality: 4,
                    useCase: "Quick artistic image generation",
                  }}
                />
                <Row 
                  method="POST" 
                  path={`${base}/api/models/nano`} 
                  desc="Nano Banana Pro - Compact image model" 
                  note="Send POST with JSON: { prompt: 'description', steps: 4 }. Returns base64 encoded image."
                  modelInfo={{
                    speed: 4,
                    quality: 4,
                    useCase: "Lightweight image generation",
                  }}
                />
              </div>
            </div>
          </section>

          <section className="mb-12 sm:mb-20">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg sm:rounded-xl shadow-lg shadow-sky-400/30">
                <FaInfoCircle className="text-white" size={20} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Important Notes</h2>
            </div>
            
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-8 shadow-lg">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="p-1.5 sm:p-2 bg-sky-100 dark:bg-sky-950/30 rounded-lg flex-shrink-0">
                    <FaKey className="text-sky-500 dark:text-sky-400" size={16} />
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white block mb-1 sm:mb-2 text-xs sm:text-sm font-bold">Authentication:</strong>
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
                      Get your API key from the <Link href="/auth/login" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">console</Link>. Use header: <code className="bg-sky-100 dark:bg-sky-950/30 px-1.5 py-0.5 rounded text-sky-600 dark:text-sky-400 font-mono text-[10px]">Authorization: Bearer YOUR_KEY</code>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="p-1.5 sm:p-2 bg-sky-100 dark:bg-sky-950/30 rounded-lg flex-shrink-0">
                    <FaLayerGroup className="text-sky-500 dark:text-sky-400" size={16} />
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white block mb-1 sm:mb-2 text-xs sm:text-sm font-bold">Categories:</strong>
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">anime, manga, manhwa, manhua, ln</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="p-1.5 sm:p-2 bg-sky-100 dark:bg-sky-950/30 rounded-lg flex-shrink-0">
                    <FaCode className="text-sky-500 dark:text-sky-400" size={16} />
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white block mb-1 sm:mb-2 text-xs sm:text-sm font-bold">Required Parameters:</strong>
                    <div className="text-zinc-600 dark:text-zinc-400 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div><code className="bg-sky-100 dark:bg-sky-950/30 px-2 py-1 rounded text-sky-600 dark:text-sky-400 font-mono text-[10px] sm:text-xs">id</code> for detail, character, staff, recommendations</div>
                      <div><code className="bg-sky-100 dark:bg-sky-950/30 px-2 py-1 rounded text-sky-600 dark:text-sky-400 font-mono text-[10px] sm:text-xs">query</code> for search</div>
                      <div><code className="bg-sky-100 dark:bg-sky-950/30 px-2 py-1 rounded text-sky-600 dark:text-sky-400 font-mono text-[10px] sm:text-xs">genre</code> for top-genre</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="p-1.5 sm:p-2 bg-sky-100 dark:bg-sky-950/30 rounded-lg flex-shrink-0">
                    <FaComments className="text-sky-500 dark:text-sky-400" size={16} />
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white block mb-1 sm:mb-2 text-xs sm:text-sm font-bold">Chat Persona:</strong>
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">Default is tsundere, or send custom persona in POST body</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="p-1.5 sm:p-2 bg-sky-100 dark:bg-sky-950/30 rounded-lg flex-shrink-0">
                    <FaServer className="text-sky-500 dark:text-sky-400" size={16} />
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white block mb-1 sm:mb-2 text-xs sm:text-sm font-bold">Rate Limit:</strong>
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">1,000 requests per day with API key. Track usage in console dashboard.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="p-1.5 sm:p-2 bg-sky-100 dark:bg-sky-950/30 rounded-lg flex-shrink-0">
                    <FaBrain className="text-sky-500 dark:text-sky-400" size={16} />
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white block mb-1 sm:mb-2 text-xs sm:text-sm font-bold">Model Selection:</strong>
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">Use <code className="bg-sky-100 dark:bg-sky-950/30 px-1.5 py-0.5 rounded text-sky-600 dark:text-sky-400 font-mono text-[10px]">/api/v1/chat/completions</code> with model parameter for best experience</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="p-1.5 sm:p-2 bg-sky-100 dark:bg-sky-950/30 rounded-lg flex-shrink-0">
                    <FaGlobe className="text-sky-500 dark:text-sky-400" size={16} />
                  </div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white block mb-1 sm:mb-2 text-xs sm:text-sm font-bold">Web Search:</strong>
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">Most models support automatic web search when needed for current information</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-8 sm:py-12 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg sm:rounded-xl shadow-lg shadow-sky-400/30">
                <FaBookOpen className="text-white" size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">Aichixia API</h3>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <Link 
                href="/auth/login"
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200 text-sm font-semibold"
              >
                <FaKey size={16} />
                <span>API Console</span>
                <FaExternalLinkAlt size={12} />
              </Link>
              <a 
                href="https://github.com/Takawell/Aichixia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200"
              >
                <FaGithub size={20} />
              </a>
              <a 
                href="https://tiktok.com/@putrawangyyy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200"
              >
                <FaTiktok size={20} />
              </a>
            </div>

            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent"></div>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500">
              <FaTerminal size={14} />
              <span className="text-sm">© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            
            <p className="text-xs font-black text-transparent bg-gradient-to-r from-sky-500 to-blue-500 dark:from-sky-400 dark:to-blue-400 bg-clip-text tracking-widest">BY TAKAWELL</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
