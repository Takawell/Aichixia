import { useState, useEffect } from "react";
import {
  FaBookOpen,
  FaFilm,
  FaComments,
  FaStickyNote,
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
  FaBolt,
  FaShieldAlt,
  FaGlobe,
  FaChevronDown,
  FaLayerGroup,
  FaRobot,
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
        className={`absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/80 to-black/80 backdrop-blur-xl transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose} 
      />
      <div className={`relative bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200/50 dark:border-slate-700/50 transition-all duration-500 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}`}>
        <div className="sticky top-0 bg-gradient-to-br from-sky-500 via-blue-600 to-purple-600 p-8 relative overflow-hidden z-10">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 transform hover:scale-110 transition-transform duration-300">
                <FaCode className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Endpoint Details</h3>
                <p className="text-white/80 text-sm font-medium">Complete API Information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 group border border-transparent hover:border-white/30 backdrop-blur-xl transform hover:rotate-90"
            >
              <FaTimes className="text-white group-hover:scale-110 transition-transform" size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <FaServer className="text-white" size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                Method
              </h4>
            </div>
            <div className="pl-11">
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                {method}
              </span>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

          <div className="group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <FaInfoCircle className="text-white" size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                Description
              </h4>
            </div>
            <div className="pl-11">
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed font-medium">
                {desc}
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

          <div className="group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <FaCode className="text-white" size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                Endpoint URL
              </h4>
            </div>
            <div className="pl-11 space-y-4">
              <div className="relative group/code">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-xl opacity-0 group-hover/code:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 border border-slate-700/50 dark:border-slate-600/50 rounded-2xl p-6 shadow-xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400" />
                  <code className="text-emerald-400 dark:text-emerald-300 text-sm break-all font-mono block leading-relaxed">
                    {path}
                  </code>
                </div>
              </div>
              <button
                onClick={copy}
                className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 hover:from-sky-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3 px-6 py-4">
                  {copied ? (
                    <>
                      <FaCheckCircle size={20} className="animate-bounce" />
                      <span>Copied Successfully!</span>
                    </>
                  ) : (
                    <>
                      <FaCopy size={20} />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {note && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-amber-400/20 animate-pulse" />
                <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border-l-4 border-amber-500 p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-500/20 rounded-xl mt-1">
                      <FaLightbulb className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                        Important Note
                        <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-xs">READ</span>
                      </h4>
                      <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                        {note}
                      </p>
                    </div>
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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg transform hover:scale-105 transition-all duration-300
      ${active ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" : "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600"}`}
    >
      {active ? <FaCheckCircle size={12} className="animate-pulse" /> : <FaTimesCircle size={12} />} {label}
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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <>
      <div 
        className="group relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl mb-4 shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-[1.02]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-sky-400/0 via-purple-400/0 to-pink-400/0 transition-all duration-700 ${isHovered ? 'from-sky-400/10 via-purple-400/10 to-pink-400/10' : ''}`} />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        
        <div className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative block px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white rounded-xl font-black text-xs tracking-widest whitespace-nowrap shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  {method}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 dark:text-slate-200 text-base font-bold mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
                  {desc}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-mono truncate">
                  {path.replace(base, '')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
              <button
                onClick={() => setShowModal(true)}
                className="relative group/btn px-5 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  Details
                  <FaChevronRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
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

const FeatureCard = ({ icon: Icon, title, description, gradient, delay }: any) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-500 overflow-hidden transform hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/10 to-purple-400/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className={`inline-flex p-4 bg-gradient-to-br ${gradient} rounded-2xl shadow-xl mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
            <Icon className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className={`fixed top-4 right-4 z-40 transition-all duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
          <ThemeToggle />
        </div>

        <header className="text-center mb-16 sm:mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center justify-center gap-4 mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse" />
            <div className="relative p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <FaBookOpen className="text-white" size={48} />
            </div>
            <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 dark:from-sky-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Aichixia API
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: '200ms' }}>
            Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with multi-provider AI intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationDelay: '400ms' }}>
            <Link
              href="/chat"
              className="group relative px-8 py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 hover:from-sky-600 hover:via-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-2xl hover:shadow-sky-500/50 transition-all duration-500 transform hover:scale-110 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative flex items-center gap-3 text-lg">
                <FaComments size={24} />
                <span>Try AI Chat</span>
                <FaChevronRight className="group-hover:translate-x-2 transition-transform duration-300" size={16} />
              </span>
            </Link>
            
            <a
              href="#endpoints"
              className="group px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95"
            >
              <span className="flex items-center gap-3 text-lg">
                <FaRocket size={24} />
                <span>Explore API</span>
              </span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <FeatureCard
            icon={FaFilm}
            title="Rich Data"
            description="Access comprehensive anime, manga, and light novel information from AniList database"
            gradient="from-sky-400 via-blue-500 to-indigo-600"
            delay={0}
          />
          <FeatureCard
            icon={FaBrain}
            title="Multi-AI"
            description="Smart fallback system with OpenAI, Gemini, Deepseek, Qwen, GPT-OSS, and Llama"
            gradient="from-purple-400 via-pink-500 to-rose-600"
            delay={200}
          />
          <FeatureCard
            icon={FaRocket}
            title="Fast & Free"
            description="Lightning-fast responses with no authentication required for seamless integration"
            gradient="from-emerald-400 via-green-500 to-teal-600"
            delay={400}
          />
        </div>

        <section id="endpoints" className="mb-20 scroll-mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-4 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FaFilm className="text-white" size={28} />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-200">
              API Endpoints
            </h2>
          </div>

          <div className="space-y-2">
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=search&query={text}`} 
              desc="Search anime by title or keywords" 
              note="Replace {text} with your search query. Example: query=naruto. Returns matching anime with details like title, synopsis, rating, and cover image."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=manga&action=search&query={text}`} 
              desc="Search manga by title or keywords" 
              note="Replace {text} with your search query. Returns Japanese manga results with comprehensive metadata including authors, chapters, and publication status."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=manhwa&action=search&query={text}`} 
              desc="Search manhwa by title or keywords" 
              note="Replace {text} with your search query. Returns Korean manhwa results with full-color webtoon information and reading direction."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=manhua&action=search&query={text}`} 
              desc="Search manhua by title or keywords" 
              note="Replace {text} with your search query. Returns Chinese manhua results with cultivation and xianxia genre tags."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=ln&action=search&query={text}`} 
              desc="Search light novels by title" 
              note="Replace {text} with your search query. Returns light novel results from AniList with volume information and web novel links."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=detail&id={value}`} 
              desc="Get detailed information by media ID" 
              note="Replace {value} with the AniList media ID (e.g., id=21). Works for anime, manga, manhwa, manhua, and light novels. Returns full details including characters, staff, relations, and recommendations."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=trending`} 
              desc="Get currently trending anime and manga" 
              note="Returns a curated list of the most popular and trending titles right now based on AniList user activity and ratings."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=seasonal`} 
              desc="Get current seasonal anime releases" 
              note="Returns anime airing in the current season (Winter: Jan-Mar, Spring: Apr-Jun, Summer: Jul-Sep, Fall: Oct-Dec) with broadcast schedules."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=airing`} 
              desc="Get anime airing schedule" 
              note="Returns the weekly schedule of when anime episodes are airing with episode numbers, air dates, and countdown timers."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=recommendations&id={value}`} 
              desc="Get recommendations based on media ID" 
              note="Replace {value} with the AniList media ID. Returns similar anime/manga recommendations based on genre, themes, and user preferences."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=manhwa&action=top-genre&genre={name}`} 
              desc="Get top titles by genre" 
              note="Replace {name} with genre (e.g., Action, Romance, Fantasy, Isekai, Slice of Life). Works with any category (anime, manga, manhwa, manhua, ln)."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=character&id={value}`} 
              desc="Get character details by ID" 
              note="Replace {value} with the AniList character ID. Returns detailed character information including voice actors, appearances, and relationships."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=staff&id={value}`} 
              desc="Get staff/creator details by ID" 
              active={false} 
              overrideLabel="Maintenance"
              note="Currently under maintenance. This endpoint will return staff information including directors, animators, and manga authors once restored."
            />
          </div>
        </section>

        <section className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-4 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FaComments className="text-white" size={28} />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-200">
              AI Chat
            </h2>
          </div>
          
          <Row 
            method="POST" 
            path={`${base}/api/chat`} 
            desc="AI assistant with multi-provider intelligent fallback" 
            note="Send POST request with JSON body: { message: 'your message', persona: 'optional custom persona' }. Default persona is tsundere anime character. The system automatically switches between OpenAI, Gemini, Deepseek, Qwen, GPT-OSS, and Llama for 99.9% uptime."
          />
          
          <div className="mt-6 relative group overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse" />
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-lg font-black text-purple-800 dark:text-purple-300 mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <FaBrain size={20} />
                </div>
                AI Provider Chain
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold shadow-lg transform hover:scale-110 transition-all duration-300">OpenAI</span>
                <FaChevronRight className="text-slate-400 animate-pulse" size={12} />
                <span className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full font-bold shadow-lg transform hover:scale-110 transition-all duration-300">Gemini</span>
                <FaChevronRight className="text-slate-400 animate-pulse" size={12} />
                <span className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full font-bold shadow-lg transform hover:scale-110 transition-all duration-300">Deepseek</span>
                <FaChevronRight className="text-slate-400 animate-pulse" size={12} />
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-bold shadow-lg transform hover:scale-110 transition-all duration-300">Qwen</span>
                <FaChevronRight className="text-slate-400 animate-pulse" size={12} />
                <span className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-bold shadow-lg transform hover:scale-110 transition-all duration-300">GPT-OSS</span>
                <FaChevronRight className="text-slate-400 animate-pulse" size={12} />
                <span className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full font-bold shadow-lg transform hover:scale-110 transition-all duration-300">Llama</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatic fallback ensures 99.9% uptime with intelligent provider switching on rate limits or quota exhaustion
              </p>
            </div>
          </div>
        </section>

        <section className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-4 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FaRobot className="text-white" size={28} />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-200">
              Specific AI Models
            </h2>
          </div>

          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl mt-0.5">
                <FaInfoCircle className="text-emerald-600 dark:text-emerald-400" size={18} />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-300 mb-2">
                  Direct Model Access
                </h4>
                <p className="text-emerald-800 dark:text-emerald-300 text-sm leading-relaxed">
                  Use these endpoints to target specific AI models instead of the auto-fallback system. Perfect for developers who need consistent responses from a particular provider.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Row 
              method="POST" 
              path={`${base}/api/models/deepseek`} 
              desc="Chat with Deepseek AI model directly" 
              note="Send POST request with JSON body: { message: 'your message', persona: 'optional' }. Deepseek excels at code generation and technical discussions with deep reasoning capabilities."
            />
            <Row 
              method="POST" 
              path={`${base}/api/models/openai`} 
              desc="Chat with OpenAI GPT model directly" 
              note="Send POST request with JSON body: { message: 'your message', persona: 'optional' }. OpenAI provides balanced performance for general conversations and creative tasks."
            />
            <Row 
              method="POST" 
              path={`${base}/api/models/gemini`} 
              desc="Chat with Google Gemini model directly" 
              note="Send POST request with JSON body: { message: 'your message', persona: 'optional' }. Gemini offers excellent multimodal understanding and factual accuracy."
            />
            <Row 
              method="POST" 
              path={`${base}/api/models/qwen`} 
              desc="Chat with Qwen AI model directly" 
              note="Send POST request with JSON body: { message: 'your message', persona: 'optional' }. Qwen specializes in multilingual support and Asian language processing."
            />
            <Row 
              method="POST" 
              path={`${base}/api/models/gptoss`} 
              desc="Chat with GPT-OSS model directly" 
              note="Send POST request with JSON body: { message: 'your message', persona: 'optional' }. GPT-OSS provides open-source model compatibility with fast inference."
            />
            <Row 
              method="POST" 
              path={`${base}/api/models/llama`} 
              desc="Chat with Llama model directly" 
              note="Send POST request with JSON body: { message: 'your message', persona: 'optional' }. Llama offers efficient performance for resource-constrained scenarios."
            />
          </div>
        </section>

        <section className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center gap-4 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FaStickyNote className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
              Important Notes
            </h2>
          </div>
          
          <div className="relative group overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 opacity-50" />
            <div className="relative bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
              <ul className="space-y-6">
                <li className="flex items-start gap-4 group/item">
                  <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-lg mt-1 transform group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <FaLayerGroup className="text-white" size={16} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 dark:text-slate-100 text-base block mb-1">Available Categories</strong>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">anime, manga, manhwa, manhua, ln (light novels)</span>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 group/item">
                  <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg mt-1 transform group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <FaCode className="text-white" size={16} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 dark:text-slate-100 text-base block mb-2">Required Parameters</strong>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold">→</span>
                        <code className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg text-sm text-sky-600 dark:text-sky-400 font-mono">id</code>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">for detail, character, staff, recommendations endpoints</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold">→</span>
                        <code className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg text-sm text-sky-600 dark:text-sky-400 font-mono">query</code>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">for search endpoints</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold">→</span>
                        <code className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg text-sm text-sky-600 dark:text-sky-400 font-mono">genre</code>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">for top-genre endpoint</span>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 group/item">
                  <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-lg mt-1 transform group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <FaComments className="text-white" size={16} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 dark:text-slate-100 text-base block mb-1">Chat Persona</strong>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">Default is tsundere anime character, or send custom persona in POST body for personalized responses</span>
                  </div>
                </li>
                
                <li className="flex items-start gap-4 group/item">
                  <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg mt-1 transform group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <FaServer className="text-white" size={16} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 dark:text-slate-100 text-base block mb-1">Rate Limit</strong>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">Please be respectful with API usage. No strict limits but excessive requests may be throttled</span>
                  </div>
                </li>

                <li className="flex items-start gap-4 group/item">
                  <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-lg mt-1 transform group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300">
                    <FaBrain className="text-white" size={16} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 dark:text-slate-100 text-base block mb-1">Model Selection</strong>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">Use /api/chat for auto-fallback or /api/models/{provider} for specific AI models</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative group overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
            <div className="relative bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 dark:from-sky-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-sky-200 dark:border-sky-800 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl shadow-xl">
                  <FaLightbulb className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-sky-900 dark:text-sky-300 mb-3">
                    Pro Tip
                  </h3>
                  <p className="text-sky-800 dark:text-sky-300 text-sm leading-relaxed mb-4">
                    For the best experience, combine multiple endpoints! For example, search for anime, get its ID, then fetch detailed information, recommendations, and character data in sequence.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-sky-500/20 text-sky-900 dark:text-sky-300 rounded-full text-xs font-bold">Chain Requests</span>
                    <span className="px-3 py-1.5 bg-purple-500/20 text-purple-900 dark:text-purple-300 rounded-full text-xs font-bold">Cache Results</span>
                    <span className="px-3 py-1.5 bg-pink-500/20 text-pink-900 dark:text-pink-300 rounded-full text-xs font-bold">Batch Queries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center pt-12 border-t-2 border-slate-300 dark:border-slate-700 animate-in fade-in duration-1000">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl">
                <FaTerminal size={20} />
              </div>
              <span className="text-base font-medium">© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" />
              <p className="text-sm font-black bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-widest">
                BY TAKAWELL
              </p>
              <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
            </div>
            <div className="flex gap-3 mt-2">
              <a href="#" className="p-3 bg-slate-200 dark:bg-slate-800 hover:bg-sky-500 dark:hover:bg-sky-500 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <FaGlobe className="text-slate-600 dark:text-slate-400 group-hover:text-white" size={18} />
              </a>
              <a href="#" className="p-3 bg-slate-200 dark:bg-slate-800 hover:bg-purple-500 dark:hover:bg-purple-500 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <FaCode className="text-slate-600 dark:text-slate-400 group-hover:text-white" size={18} />
              </a>
              <a href="#" className="p-3 bg-slate-200 dark:bg-slate-800 hover:bg-pink-500 dark:hover:bg-pink-500 rounded-xl transition-all duration-300 transform hover:scale-110 group">
                <FaStar className="text-slate-600 dark:text-slate-400 group-hover:text-white" size={18} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
