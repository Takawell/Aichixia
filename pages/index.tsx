import { useState } from "react";
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
      className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-sky-600 dark:text-sky-300 px-4 py-2 rounded-lg font-semibold text-sm active:scale-95 transition-all duration-300 hover:shadow-md hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600"
    >
      <code className="truncate max-w-[160px]">{text}</code>
      {copied ? <FaCheckCircle size={14} className="text-green-500 animate-bounce" /> : <FaCopy size={14} className="opacity-70" />}
    </button>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md transition-all duration-300 hover:scale-105
      ${active ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-rose-500 to-red-500"}`}
    >
      {active ? <FaCheckCircle size={10} className="animate-pulse" /> : <FaTimesCircle size={10} />} {label}
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
  const copy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  
  return (
    <div
      onClick={copy}
      className="group border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 mb-4 shadow-sm hover:shadow-2xl cursor-pointer transition-all duration-500 hover:border-sky-400 dark:hover:border-sky-500 relative overflow-hidden hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="px-3 py-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white rounded-lg font-bold text-xs tracking-wider whitespace-nowrap shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            {method}
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 text-sky-600 dark:text-sky-300 rounded-lg text-xs font-mono truncate flex-1 group-hover:from-slate-200 group-hover:to-slate-100 dark:group-hover:from-slate-600 dark:group-hover:to-slate-700 transition-all duration-300 shadow-sm">
            {path}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
          {copied ? (
            <FaCheckCircle className="text-emerald-500 animate-bounce" size={16} />
          ) : (
            <FaCopy className="text-slate-400 group-hover:text-sky-500 transition-all duration-300 group-hover:scale-110" size={16} />
          )}
        </div>
      </div>
      <p className="relative text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

export default function Docs() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50 transition-all duration-700">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/20 via-transparent to-purple-200/20 dark:from-sky-900/10 dark:via-transparent dark:to-purple-900/10 pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="flex justify-between items-start mb-10 sm:mb-14 animate-fade-in">
          <div className="flex-1" />
          <div className="animate-slide-in-right">
            <ThemeToggle />
          </div>
        </div>

        <header className="text-center mb-14 sm:mb-20 animate-fade-in-up">
          <div className="inline-flex items-center justify-center gap-4 mb-6 animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <FaBookOpen className="relative text-sky-500 dark:text-sky-400 drop-shadow-lg" size={48} />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Aichixia API
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4 animate-fade-in-up animation-delay-200">
            Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with advanced multi-provider AI intelligence.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-5 justify-center items-center px-4 animate-fade-in-up animation-delay-400">
            <Link
              href="/chat"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-700 text-white rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <FaComments size={22} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Try AI Chat</span>
              <FaChevronRight className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" size={16} />
            </Link>
            
            <a
              href="#endpoints"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <FaRocket size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Explore API</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14 animate-fade-in-up animation-delay-600">
          {[
            {
              icon: FaFilm,
              title: "Rich Data",
              desc: "Access comprehensive anime, manga, and light novel information from AniList",
              gradient: "from-sky-500 to-blue-500",
              bgGradient: "from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30"
            },
            {
              icon: FaBrain,
              title: "Multi-AI Chain",
              desc: "7-provider intelligent fallback: DeepSeek → OpenAI → Gemini → DeepSeek → Qwen → GPT-OSS → Llama",
              gradient: "from-purple-500 to-pink-500",
              bgGradient: "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
            },
            {
              icon: FaRocket,
              title: "Fast & Free",
              desc: "Lightning-fast responses with no authentication required and 99.9% uptime",
              gradient: "from-emerald-500 to-green-500",
              bgGradient: "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden relative"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-3 bg-gradient-to-br ${item.gradient} rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <item.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section id="endpoints" className="mb-14 scroll-mt-8 animate-fade-in-up animation-delay-800">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-xl shadow-xl animate-pulse-slow">
              <FaFilm className="text-white" size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              API Endpoints
            </h2>
          </div>

          <div className="space-y-2">
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=search&query={text}`} desc="Search anime (requires query parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manga&action=search&query={text}`} desc="Search manga (requires query parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=search&query={text}`} desc="Search manhwa (requires query parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhua&action=search&query={text}`} desc="Search manhua (requires query parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?category=ln&action=search&query={text}`} desc="Search light novels (requires query parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=detail&id={value}`} desc="Get detailed media information by ID (requires id parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?action=trending`} desc="Get trending anime and manga" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=seasonal`} desc="Get current seasonal anime list" />
            <Row method="GET" path={`${base}/api/aichixia?action=airing`} desc="Get airing schedule" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=recommendations&id={value}`} desc="Get recommendations based on media ID (requires id parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=top-genre&genre={name}`} desc="Get top media by genre (requires genre parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?action=character&id={value}`} desc="Get character details by ID (requires id parameter)" />
            <Row method="GET" path={`${base}/api/aichixia?action=staff&id={value}`} desc="Get staff details by ID (requires id parameter)" active={false} overrideLabel="Maintenance" />
          </div>
        </section>

        <section className="mb-14 animate-fade-in-up animation-delay-1000">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-xl animate-pulse-slow">
              <FaComments className="text-white" size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              AI Chat
            </h2>
          </div>
          
          <Row method="POST" path={`${base}/api/chat`} desc="Tsundere AI assistant with 7-provider intelligent fallback chain (DeepSeek → OpenAI → Gemini → DeepSeek → Qwen → GPT-OSS → Llama)" />
          
          <div className="mt-8 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-2 border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-500">
            <h3 className="text-base font-bold text-purple-800 dark:text-purple-300 mb-5 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                <FaBrain size={20} className="text-white" />
              </div>
              <span>AI Provider Fallback Chain</span>
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {[
                { name: "DeepSeek", color: "from-red-500 to-orange-500" },
                { name: "OpenAI", color: "from-green-500 to-emerald-500" },
                { name: "Gemini", color: "from-blue-500 to-indigo-500" },
                { name: "DeepSeek", color: "from-red-500 to-orange-500" },
                { name: "Qwen", color: "from-purple-500 to-violet-500" },
                { name: "GPT-OSS", color: "from-pink-500 to-rose-500" },
                { name: "Llama", color: "from-amber-500 to-yellow-500" }
              ].map((provider, idx) => (
                <div key={idx} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className={`px-4 py-2 bg-gradient-to-r ${provider.color} text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}>
                    {provider.name}
                  </span>
                  {idx < 6 && <FaChevronRight className="text-slate-400 dark:text-slate-500" size={12} />}
                </div>
              ))}
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-purple-700 dark:text-purple-400">Intelligent Auto-Fallback:</strong> Automatic provider switching ensures 99.9% uptime even during rate limits, quota exhaustion, or service disruptions
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Each provider is tested sequentially until a successful response is received. The system intelligently handles errors and seamlessly transitions between providers without user intervention.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14 animate-fade-in-up animation-delay-1200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-xl">
              <FaStickyNote className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Important Notes
            </h2>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-500">
            <ul className="text-slate-700 dark:text-slate-300 space-y-4 text-sm sm:text-base">
              <li className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <span className="text-sky-500 mt-1.5 text-lg group-hover:scale-125 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Categories:</strong> anime, manga, manhwa, manhua, ln (light novels)</span>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <span className="text-sky-500 mt-1.5 text-lg group-hover:scale-125 transition-transform duration-300">•</span>
                <div className="flex-1">
                  <strong className="text-slate-900 dark:text-slate-100 font-bold">Required parameters:</strong>
                  <ul className="ml-5 mt-2 space-y-2">
                    {[
                      { param: "id", desc: "for detail, character, staff, recommendations" },
                      { param: "query", desc: "for search endpoints" },
                      { param: "genre", desc: "for top-genre filtering" }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform duration-300">
                        <span className="text-purple-500 mt-1">→</span>
                        <code className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 px-3 py-1 rounded-lg text-xs font-mono shadow-sm group-hover/item:shadow-md transition-all duration-300">{item.param}</code>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <span className="text-sky-500 mt-1.5 text-lg group-hover:scale-125 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Chat Persona:</strong> Default is tsundere personality, or send custom persona in POST request body</span>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <span className="text-sky-500 mt-1.5 text-lg group-hover:scale-125 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Rate Limit:</strong> Please be respectful with API usage to ensure availability for all users</span>
              </li>
              <li className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
                <span className="text-sky-500 mt-1.5 text-lg group-hover:scale-125 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Response Format:</strong> All endpoints return JSON with consistent structure</span>
              </li>
            </ul>
          </div>
        </section>

        <footer className="text-center pt-10 border-t-2 border-slate-300/50 dark:border-slate-700/50 animate-fade-in-up animation-delay-1400">
          <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-3 group">
              <FaTerminal size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium">© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            <p className="text-xs font-bold bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              BY TAKAWELL
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
        
        .animation-delay-1400 {
          animation-delay: 1.4s;
        }
      `}</style>
    </main>
  );
}
