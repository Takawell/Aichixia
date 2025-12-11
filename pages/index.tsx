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
        className={`absolute inset-0 bg-black/95 backdrop-blur-sm transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose} 
      />
      <div className={`relative bg-zinc-900 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCode className="text-white" size={24} />
              <h3 className="text-2xl font-bold text-white">Endpoint Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <FaTimes className="text-white" size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-auto max-h-[calc(90vh-100px)] bg-zinc-900">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaServer className="text-red-500" size={16} />
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Method</h4>
            </div>
            <span className="inline-block px-4 py-2 bg-red-600 text-white rounded font-bold text-sm">
              {method}
            </span>
          </div>

          <div className="border-t border-zinc-800" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaInfoCircle className="text-red-500" size={16} />
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</h4>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{desc}</p>
          </div>

          <div className="border-t border-zinc-800" />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaCode className="text-red-500" size={16} />
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Endpoint URL</h4>
            </div>
            <div className="bg-black rounded p-4 mb-3">
              <code className="text-green-400 text-sm break-all font-mono">{path}</code>
            </div>
            <button
              onClick={copy}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
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
              <div className="border-t border-zinc-800" />
              <div className="bg-zinc-800/50 border-l-4 border-yellow-500 rounded p-4">
                <div className="flex items-start gap-3">
                  <FaLightbulb className="text-yellow-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-500 mb-1">Note</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">{note}</p>
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-semibold
      ${active ? "bg-green-600" : "bg-red-600"}`}
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
      <div className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-4 transition-all duration-300 cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs whitespace-nowrap">
              {method}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium mb-1">{desc}</p>
              <p className="text-zinc-500 text-xs font-mono truncate">{path.replace(base, '')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded font-semibold text-xs transition-all duration-200"
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
    <div className="group bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg p-6 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-600 rounded-lg flex-shrink-0">
          <Icon className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
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
    <main className="min-h-screen bg-black text-white">
      <div className="fixed top-0 left-0 right-0 z-30 transition-all duration-300" style={{
        background: scrolled ? 'rgba(0,0,0,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaBookOpen className="text-red-600" size={28} />
            <h1 className="text-2xl font-black text-white">Aichixia API</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-black pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Anime & Manga API
              <br />
              <span className="text-red-600">Powered by AI</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with multi-provider AI intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/chat"
                className="group inline-flex items-center justify-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-all duration-300"
              >
                <FaComments size={20} />
                <span>Try AI Chat</span>
                <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={14} />
              </Link>
              
              <a
                href="#endpoints"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold transition-all duration-300"
              >
                <FaRocket size={20} />
                <span>Explore Endpoints</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
            <FeatureCard
              icon={FaFilm}
              title="Rich Data"
              description="Access comprehensive anime, manga, and light novel information from AniList"
            />
            <FeatureCard
              icon={FaBrain}
              title="Multi-AI"
              description="Smart fallback system with 6 AI providers for 99.9% uptime"
            />
            <FeatureCard
              icon={FaRocket}
              title="Fast & Free"
              description="Lightning-fast responses with no authentication required"
            />
          </div>

          <section id="endpoints" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <FaFilm className="text-red-600" size={24} />
              <h2 className="text-3xl font-bold">API Endpoints</h2>
            </div>

            <div className="space-y-3">
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
            <div className="flex items-center gap-3 mb-6">
              <FaComments className="text-red-600" size={24} />
              <h2 className="text-3xl font-bold">AI Chat</h2>
            </div>
            
            <Row 
              method="POST" 
              path={`${base}/api/chat`} 
              desc="AI assistant with multi-provider intelligent fallback" 
              note="Send POST with JSON: { message: 'text', persona: 'optional' }. Auto-switches between OpenAI, Gemini, Deepseek, Qwen, GPT-OSS, Llama."
            />
            
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaBrain size={16} className="text-red-600" />
                AI Provider Chain
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-full font-semibold">OpenAI</span>
                <FaChevronRight className="text-zinc-600" size={10} />
                <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-full font-semibold">Gemini</span>
                <FaChevronRight className="text-zinc-600" size={10} />
                <span className="px-3 py-1.5 bg-violet-600 text-white rounded-full font-semibold">Deepseek</span>
                <FaChevronRight className="text-zinc-600" size={10} />
                <span className="px-3 py-1.5 bg-purple-600 text-white rounded-full font-semibold">Qwen</span>
                <FaChevronRight className="text-zinc-600" size={10} />
                <span className="px-3 py-1.5 bg-pink-600 text-white rounded-full font-semibold">GPT-OSS</span>
                <FaChevronRight className="text-zinc-600" size={10} />
                <span className="px-3 py-1.5 bg-rose-600 text-white rounded-full font-semibold">Llama</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Automatic fallback ensures 99.9% uptime with intelligent provider switching
              </p>
            </div>
          </section>

          <section className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <FaRobot className="text-red-600" size={24} />
              <h2 className="text-3xl font-bold">Specific AI Models</h2>
            </div>

            <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="text-red-600 mt-0.5" size={16} />
                <p className="text-zinc-400 text-sm">
                  Target specific AI models for consistent responses from a particular provider.
                </p>
              </div>
            </div>

            <div className="space-y-3">
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
            <div className="flex items-center gap-3 mb-6">
              <FaInfoCircle className="text-red-600" size={24} />
              <h2 className="text-3xl font-bold">Important Notes</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <FaLayerGroup className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <strong className="text-white block mb-1">Categories:</strong>
                    <span className="text-zinc-400">anime, manga, manhwa, manhua, ln</span>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <FaCode className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <strong className="text-white block mb-1">Required Parameters:</strong>
                    <div className="text-zinc-400 space-y-1">
                      <div><code className="bg-zinc-800 px-2 py-0.5 rounded text-red-400">id</code> for detail, character, staff, recommendations</div>
                      <div><code className="bg-zinc-800 px-2 py-0.5 rounded text-red-400">query</code> for search</div>
                      <div><code className="bg-zinc-800 px-2 py-0.5 rounded text-red-400">genre</code> for top-genre</div>
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <FaComments className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <strong className="text-white block mb-1">Chat Persona:</strong>
                    <span className="text-zinc-400">Default is tsundere, or send custom persona in POST body</span>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <FaServer className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <strong className="text-white block mb-1">Rate Limit:</strong>
                    <span className="text-zinc-400">Please be respectful with API usage</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <FaBrain className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <strong className="text-white block mb-1">Model Selection:</strong>
                    <span className="text-zinc-400">Use /api/chat for auto-fallback or /api/models/&#123;provider&#125; for specific models</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-zinc-400">
              <FaTerminal size={16} />
              <span className="text-sm">© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            <p className="text-xs font-bold text-red-600 tracking-widest">BY TAKAWELL</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
