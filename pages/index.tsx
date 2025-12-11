import { useState, useEffect } from "react";
import {
  FaBookOpen,
  FaFilm,
  FaComments,
  FaTerminal,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaRocket,
  FaChevronRight,
  FaBrain,
  FaCode,
  FaServer,
  FaLightbulb,
  FaTimes,
  FaInfoCircle,
  FaStar,
  FaGlobe,
  FaLayerGroup,
  FaRobot,
  FaArrowRight,
  FaPlay,
  FaMoon,
  FaSun,
  FaDatabase,
  FaShieldAlt,
  FaBolt,
  FaChartLine,
  FaGithub,
  FaTiktok,
} from "react-icons/fa";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

const base = "https://aichixia.vercel.app";

const Modal = ({ 
  isOpen, 
  onClose, 
  path, 
  desc, 
  method,
  note 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  path: string; 
  desc: string;
  method: string;
  note?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
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
  
  const copy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose} 
      />
      <div className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 border border-slate-200 dark:border-slate-700 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FaCode className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white">Endpoint Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <FaTimes className="text-white" size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-auto max-h-[calc(90vh-100px)] bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaServer className="text-blue-600 dark:text-blue-400" size={16} />
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Method</h4>
            </div>
            <span className="inline-block px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/30">
              {method}
            </span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaInfoCircle className="text-blue-600 dark:text-blue-400" size={16} />
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Description</h4>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{desc}</p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaCode className="text-blue-600 dark:text-blue-400" size={16} />
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Endpoint URL</h4>
            </div>
            <div className="bg-slate-100 dark:bg-slate-950 rounded-lg p-4 mb-3 border border-slate-200 dark:border-slate-800">
              <code className="text-blue-600 dark:text-blue-400 text-sm break-all font-mono">{path}</code>
            </div>
            <button
              onClick={copy}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {copied ? (
                <>
                  <FaCheckCircle size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy size={16} />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>

          {note && (
            <>
              <div className="border-t border-slate-200 dark:border-slate-700" />
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-400 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaLightbulb className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Note</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{note}</p>
                  </div>
                </div>
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg transition-all duration-300
      ${active ? "bg-emerald-600 dark:bg-emerald-500 shadow-emerald-500/30" : "bg-rose-600 dark:bg-rose-500 shadow-rose-500/30"}`}
    >
      {active ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />} {label}
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
}: {
  method: string;
  path: string;
  desc: string;
  active?: boolean;
  overrideLabel?: string;
  note?: string;
}) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <div className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-bold text-xs whitespace-nowrap shadow-lg shadow-blue-500/30">
              {method}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-white text-sm font-semibold mb-1.5">{desc}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono truncate">{path.replace(base, '')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold text-xs transition-all duration-200 shadow-lg"
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
      />
    </>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: any) => {
  return (
    <div className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl flex-shrink-0 shadow-lg shadow-blue-500/30">
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-all duration-300 ${scrolled ? 'bg-blue-600 dark:bg-blue-500' : 'bg-white dark:bg-slate-900'} shadow-lg`}>
              <FaBookOpen className={`${scrolled ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Aichixia API</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-slate-50 to-slate-50 dark:from-blue-950/30 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-400 text-sm font-semibold mb-6">
              <FaStar size={14} />
              <span>Free & Open API</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Aichixia API
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">Powered by AI</span>
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
              Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with multi-provider AI intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/chat"
                className="group inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <FaComments size={20} />
                <span>Try AI Chat</span>
                <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={14} />
              </Link>
              
              <a
                href="#endpoints"
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <FaRocket size={20} />
                <span>Explore Endpoints</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <FeatureCard
              icon={FaFilm}
              title="Rich Data"
              description="Access comprehensive anime, manga, and light novel information from AniList database"
            />
            <FeatureCard
              icon={FaBrain}
              title="Multi-AI"
              description="Smart fallback system with 6 AI providers ensuring 99.9% uptime"
            />
            <FeatureCard
              icon={FaRocket}
              title="Fast & Free"
              description="Lightning-fast responses with no authentication required"
            />
          </div>

          <section id="endpoints" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <FaFilm className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">API Endpoints</h2>
            </div>

            <div className="space-y-4">
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
                path={`${base}/api/aichixia?action=trending`} 
                desc="Get currently trending anime and manga" 
                note="Returns a list of the most popular trending titles right now."
              />
              <Row 
                method="GET" 
                path={`${base}/api/aichixia?category=anime&action=seasonal`} 
                desc="Get current seasonal anime releases" 
                note="Returns anime airing in the current season with broadcast schedules."
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

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <FaComments className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">AI Chat</h2>
            </div>
            
            <Row 
              method="POST" 
              path={`${base}/api/chat`} 
              desc="AI assistant with multi-provider intelligent fallback" 
              note="Send POST with JSON: { message: 'text', persona: 'optional' }. Auto-switches between OpenAI, Gemini, Deepseek, Qwen, GPT-OSS, Llama."
            />
            
            <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaBrain size={16} className="text-blue-600 dark:text-blue-400" />
                AI Provider Chain
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold shadow-lg shadow-blue-500/30">OpenAI</span>
                <FaChevronRight className="text-slate-400" size={10} />
                <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full font-semibold shadow-lg shadow-indigo-500/30">Gemini</span>
                <FaChevronRight className="text-slate-400" size={10} />
                <span className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-full font-semibold shadow-lg shadow-violet-500/30">Deepseek</span>
                <FaChevronRight className="text-slate-400" size={10} />
                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-semibold shadow-lg shadow-purple-500/30">Qwen</span>
                <FaChevronRight className="text-slate-400" size={10} />
                <span className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-full font-semibold shadow-lg shadow-pink-500/30">GPT-OSS</span>
                <FaChevronRight className="text-slate-400" size={10} />
                <span className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-full font-semibold shadow-lg shadow-rose-500/30">Llama</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Automatic fallback ensures 99.9% uptime with intelligent provider switching
              </p>
            </div>
          </section>

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <FaRobot className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Specific AI Models</h2>
            </div>

            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-blue-600 dark:text-blue-400 mt-0.5" size={16} />
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Target specific AI models for consistent responses from a particular provider.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Row 
                method="POST" 
                path={`${base}/api/models/deepseek`} 
                desc="Chat with Deepseek AI model" 
                note="Excels at code generation and technical discussions with deep reasoning."
              />
              <Row 
                method="POST" 
                path={`${base}/api/models/openai`} 
                desc="Chat with OpenAI GPT model" 
                note="Balanced performance for general conversations and creative tasks."
              />
              <Row 
                method="POST" 
                path={`${base}/api/models/gemini`} 
                desc="Chat with Google Gemini model" 
                note="Excellent multimodal understanding and factual accuracy."
              />
              <Row 
                method="POST" 
                path={`${base}/api/models/qwen`} 
                desc="Chat with Qwen AI model" 
                note="Specializes in multilingual support and Asian language processing."
              />
              <Row 
                method="POST" 
                path={`${base}/api/models/gptoss`} 
                desc="Chat with GPT-OSS model" 
                note="Open-source model compatibility with fast inference."
              />
              <Row 
                method="POST" 
                path={`${base}/api/models/llama`} 
                desc="Chat with Llama model" 
                note="Efficient performance for resource-constrained scenarios."
              />
            </div>
          </section>

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <FaInfoCircle className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Important Notes</h2>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <FaLayerGroup className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-2 text-sm font-bold">Categories:</strong>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">anime, manga, manhwa, manhua, ln</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <FaCode className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-2 text-sm font-bold">Required Parameters:</strong>
                    <div className="text-slate-600 dark:text-slate-400 space-y-2 text-sm">
                      <div><code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-400 font-mono text-xs">id</code> for detail, character, staff, recommendations</div>
                      <div><code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-400 font-mono text-xs">query</code> for search</div>
                      <div><code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-700 dark:text-blue-400 font-mono text-xs">genre</code> for top-genre</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <FaComments className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-2 text-sm font-bold">Chat Persona:</strong>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Default is tsundere, or send custom persona in POST body</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <FaServer className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-2 text-sm font-bold">Rate Limit:</strong>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Please be respectful with API usage</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <FaBrain className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-2 text-sm font-bold">Model Selection:</strong>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Use /api/chat for auto-fallback or /api/models/&#123;provider&#125; for specific models</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <FaBookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Aichixia API</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://github.com/Takawell/Aichixia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <FaGithub size={24} />
              </a>
              <a 
                href="https://tiktok.com/putrawangyyy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <FaTiktok size={24} />
              </a>
            </div>

            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
              <FaTerminal size={14} />
              <span className="text-sm">© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            
            <p className="text-xs font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text tracking-widest">BY TAKAWELL</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
