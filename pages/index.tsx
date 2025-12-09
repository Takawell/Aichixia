import { useState, useEffect, useRef } from "react";
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
  FaBolt,
  FaCogs,
  FaServer,
  FaDatabase,
  FaShieldAlt,
  FaArrowRight,
  FaStar,
  FaFire,
  FaZap,
  FaLink,
  FaGlobe,
  FaMobileAlt,
  FaDesktop,
  FaSyncAlt,
  FaNetworkWired,
} from "react-icons/fa";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

const base = "https://aichixia.vercel.app";

const CopyableCode = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-sky-600 dark:text-sky-300 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md"
    >
      <code className="truncate max-w-[180px] font-mono">{text}</code>
      {copied ? <FaCheckCircle size={16} className="text-green-500 animate-pulse" /> : <FaCopy size={16} className="group-hover:rotate-12 transition-transform" />}
    </button>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
          : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
      }`}
    >
      {active ? <FaCheckCircle size={12} className="animate-bounce" /> : <FaTimesCircle size={12} className="animate-pulse" />} {label}
    </span>
  );
};

const Row = ({
  method,
  path,
  desc,
  active = true,
  overrideLabel,
}: {
  method: string;
  path: string;
  desc: string;
  active?: boolean;
  overrideLabel?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const copy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={copy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-6 mb-4 cursor-pointer transition-all duration-500 overflow-hidden"
      style={{
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-purple-400/0 to-blue-400/0 group-hover:from-sky-400/5 group-hover:via-purple-400/5 group-hover:to-blue-400/5 transition-all duration-700" 
           style={{
             mask: 'radial-gradient(300px at var(--mouse-x, 50%) var(--mouse-y, 50%), white, transparent)'
           }} />
      
      <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl font-bold text-sm tracking-wider whitespace-nowrap shadow-lg transform group-hover:scale-105 transition-transform">
            {method}
          </span>
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-sky-600 dark:text-sky-300 rounded-xl text-sm font-mono truncate flex-1 transition-all group-hover:bg-slate-200 dark:group-hover:bg-slate-600 group-hover:pl-4">
            {path}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
          <div className="relative">
            <div className={`absolute inset-0 bg-emerald-500 rounded-full blur transition-all duration-300 ${copied ? 'opacity-100 scale-125' : 'opacity-0 scale-50'}`} />
            {copied ? (
              <FaCheckCircle className="relative text-emerald-500 animate-ping-once" size={18} />
            ) : (
              <FaCopy className="relative text-slate-400 group-hover:text-sky-500 transition-all duration-300 group-hover:rotate-12" size={18} />
            )}
          </div>
        </div>
      </div>
      <p className="relative text-slate-600 dark:text-slate-400 text-sm lg:text-base transition-all duration-300 group-hover:translate-x-1">
        {desc}
      </p>
    </div>
  );
};

const FloatingOrb = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const moveOrb = () => {
      setPosition({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });
    };
    
    const interval = setInterval(moveOrb, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute w-96 h-96 bg-gradient-to-r from-sky-400/20 to-purple-400/20 rounded-full blur-3xl animate-spin-slow"
           style={{ left: `${position.x}%`, top: `${position.y}%` }} />
    </div>
  );
};

const ProviderChain = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const providers = [
    { name: "OpenAI", color: "bg-gradient-to-r from-purple-500 to-violet-500", icon: FaBolt },
    { name: "Gemini", color: "bg-gradient-to-r from-amber-500 to-orange-500", icon: FaStar },
    { name: "DeepSeek", color: "bg-gradient-to-r from-blue-500 to-cyan-500", icon: FaZap },
    { name: "Qwen", color: "bg-gradient-to-r from-rose-500 to-pink-500", icon: FaFire },
    { name: "GPT-OSS", color: "bg-gradient-to-r from-indigo-500 to-purple-500", icon: FaCogs },
    { name: "Llama", color: "bg-gradient-to-r from-emerald-500 to-green-500", icon: FaServer },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % providers.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-300/50 dark:border-slate-700/50 backdrop-blur-sm shadow-2xl">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
        <FaNetworkWired className="text-sky-500" />
        Intelligent Fallback Chain
      </h3>
      
      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600 -translate-y-1/2" />
        
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 relative z-10">
          {providers.map((provider, index) => {
            const Icon = provider.icon;
            const isActive = index === activeIndex;
            
            return (
              <div
                key={provider.name}
                className="relative group"
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={`absolute -ins-2 rounded-full blur-lg transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'} ${provider.color}`} />
                
                <div
                  className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-500 transform ${
                    isActive
                      ? 'scale-110 rotate-3 shadow-2xl'
                      : 'scale-100 hover:scale-105'
                  } ${provider.color}`}
                >
                  <Icon className="text-white mb-1" size={20} />
                  <span className="text-xs font-bold text-white text-center px-1">{provider.name}</span>
                </div>
                
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  {isActive && (
                    <div className="animate-pulse flex items-center gap-1 px-3 py-1 bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full">
                      <FaSyncAlt size={10} className="text-sky-400" />
                      <span className="text-xs font-bold text-white">Active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20 border border-sky-400/30 dark:border-sky-500/30 rounded-2xl">
            <FaShieldAlt className="text-sky-500" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              99.9% Uptime • Automatic Failover • Zero Downtime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Docs() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors duration-700 overflow-hidden">
      <FloatingOrb />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="flex justify-between items-start mb-10 sm:mb-16">
          <div className="flex-1" />
          <div className="transform hover:rotate-180 transition-transform duration-500">
            <ThemeToggle />
          </div>
        </div>

        <header className="text-center mb-16 sm:mb-24 relative">
          <div className="inline-flex items-center justify-center gap-4 mb-6 animate-float">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 rounded-full blur-xl opacity-70" />
              <FaBookOpen className="relative text-sky-500 dark:text-sky-400" size={48} />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
              Aichixia API
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4 mb-10 animate-fade-in">
            Next-generation anime intelligence platform with multi-AI fallback system.
            Experience seamless API access and intelligent conversations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 animate-slide-up">
            <Link
              href="/chat"
              className="group relative overflow-hidden inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 hover:from-sky-600 hover:via-blue-600 hover:to-purple-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <FaComments size={24} className="relative group-hover:animate-bounce" />
              <span className="relative text-lg">Try AI Chat</span>
              <FaChevronRight className="relative group-hover:translate-x-2 transition-transform duration-300" size={16} />
            </Link>
            
            <a
              href="#endpoints"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-300/50 dark:border-slate-600/50 hover:border-sky-400 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              <FaRocket size={20} className="group-hover:animate-spin" />
              <span className="text-lg">Explore Endpoints</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-500 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <FaFilm className="text-sky-600 dark:text-sky-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Rich Data</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Comprehensive anime, manga, and light novel database with real-time updates
            </p>
          </div>

          <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-500 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <FaBrain className="text-purple-600 dark:text-purple-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Multi-AI</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Intelligent fallback across multiple AI providers for maximum reliability
            </p>
          </div>

          <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-500 hover:scale-105">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <FaRocket className="text-emerald-600 dark:text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Fast & Free</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Lightning-fast responses with no authentication or rate limits
            </p>
          </div>
        </div>

        <div className="mb-20">
          <ProviderChain />
        </div>

        <section id="endpoints" className="mb-20 scroll-mt-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl shadow-2xl">
              <FaDatabase className="text-white" size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">
              API <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">Endpoints</span>
            </h2>
          </div>

          <div className="space-y-2">
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=search&query={text}`} desc="Search anime with advanced filtering and sorting" />
            <Row method="GET" path={`${base}/api/aichixia?category=manga&action=search&query={text}`} desc="Search manga series with detailed metadata" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=search&query={text}`} desc="Search Korean manhwa with webtoon support" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhua&action=search&query={text}`} desc="Search Chinese manhua with translation info" />
            <Row method="GET" path={`${base}/api/aichixia?category=ln&action=search&query={text}`} desc="Search light novels with volume tracking" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=detail&id={value}`} desc="Get detailed media information by ID" />
            <Row method="GET" path={`${base}/api/aichixia?action=trending`} desc="Real-time trending anime & manga rankings" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=seasonal`} desc="Current seasonal anime with airing schedules" />
            <Row method="GET" path={`${base}/api/aichixia?action=airing`} desc="Upcoming anime airing schedule" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=recommendations&id={value}`} desc="Personalized recommendations based on media" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=top-genre&genre={name}`} desc="Top manhwa by specific genre" />
            <Row method="GET" path={`${base}/api/aichixia?action=character&id={value}`} desc="Detailed character information" />
            <Row method="GET" path={`${base}/api/aichixia?action=staff&id={value}`} desc="Staff details and works" active={false} overrideLabel="Coming Soon" />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-2xl">
              <FaComments className="text-white" size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">
              AI <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Chat</span>
            </h2>
          </div>
          
          <Row method="POST" path={`${base}/api/chat`} desc="Intelligent anime assistant with tsundere personality and multi-provider fallback" />

        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-2xl">
              <FaStickyNote className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              Usage <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Guide</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <FaLink size={18} />
                API Parameters
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full" />
                  <span><code className="font-bold">query</code> - Search term for finding media</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span><code className="font-bold">id</code> - Unique identifier for detailed info</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span><code className="font-bold">genre</code> - Filter content by specific genre</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span><code className="font-bold">category</code> - anime, manga, manhwa, manhua, ln</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <FaGlobe size={18} />
                Features
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full" />
                  <span>Real-time data from AniList database</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>Multi-AI provider fallback system</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span>Zero configuration required</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span>Completely free with no rate limits</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="text-center pt-12 border-t border-slate-300/50 dark:border-slate-700/50">
          <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-lg">
                <FaTerminal className="text-sky-500" size={20} />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
                Aichixia API v5.0
              </span>
            </div>
            <p className="text-xs opacity-75">© {new Date().getFullYear()} Next-Gen Anime Intelligence Platform</p>
            <p className="text-xs font-bold tracking-widest opacity-50">BY TAKAWELL</p>
          </div>
        </footer>
      </div>
      
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-ping-once {
          animation: ping-once 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </main>
  );
}
