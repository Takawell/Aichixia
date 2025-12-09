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
      className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-sky-600 dark:text-sky-300 px-3 py-1.5 rounded-lg font-semibold text-sm active:scale-95 transition-all duration-300 hover:shadow-md"
    >
      <code className="truncate max-w-[140px] sm:max-w-[180px]">{text}</code>
      {copied ? <FaCheckCircle size={12} className="text-green-500 animate-bounce" /> : <FaCopy size={12} className="opacity-70" />}
    </button>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-bold shadow-sm transition-all duration-300 hover:scale-105
      ${active ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-rose-500 to-red-500"}`}
    >
      {active ? <FaCheckCircle size={9} className="animate-pulse" /> : <FaTimesCircle size={9} />} {label}
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
      className="group border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 mb-3 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:border-sky-400 dark:hover:border-sky-500 relative overflow-hidden hover:-translate-y-0.5"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/5 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />    
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="px-2.5 py-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white rounded-md font-bold text-xs tracking-wider whitespace-nowrap shadow-sm group-hover:shadow-md transition-all duration-300">
            {method}
          </span>
          <span className="px-2.5 py-1 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 text-sky-600 dark:text-sky-300 rounded-md text-xs font-mono truncate flex-1 group-hover:from-slate-200 dark:group-hover:from-slate-600 transition-all duration-300 shadow-sm">
            {path}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
          {copied ? (
            <FaCheckCircle className="text-emerald-500 animate-bounce" size={14} />
          ) : (
            <FaCopy className="text-slate-400 group-hover:text-sky-500 transition-all duration-300" size={14} />
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
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-between items-start mb-8 sm:mb-10 animate-fade-in">
          <div className="flex-1" />
          <div className="animate-slide-in-right">
            <ThemeToggle />
          </div>
        </div>

        <header className="text-center mb-10 sm:mb-14 animate-fade-in-up">
          <div className="inline-flex items-center justify-center gap-3 mb-4 animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-purple-500 rounded-full blur-lg opacity-40 animate-pulse" />
              <FaBookOpen className="relative text-sky-500 dark:text-sky-400 drop-shadow-lg" size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Aichixia API
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-4 animate-fade-in-up animation-delay-200">
            Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with advanced multi-provider AI intelligence.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center px-4 animate-fade-in-up animation-delay-400">
            <Link
              href="/chat"
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <FaComments size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Try AI Chat</span>
              <FaChevronRight className="group-hover:translate-x-1 transition-transform duration-300" size={14} />
            </Link>
            
            <a
              href="#endpoints"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              <FaRocket size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>Explore API</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 animate-fade-in-up animation-delay-600">
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
              desc: "6-provider intelligent fallback: DeepSeek → OpenAI → Gemini → Qwen → GPT-OSS → Llama",
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
              className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2.5 bg-gradient-to-br ${item.gradient} rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="text-white" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section id="endpoints" className="mb-10 scroll-mt-8 animate-fade-in-up animation-delay-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 rounded-lg shadow-lg animate-pulse-slow">
              <FaFilm className="text-white" size={20} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
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

        <section className="mb-10 animate-fade-in-up animation-delay-1000">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-lg shadow-lg animate-pulse-slow">
              <FaComments className="text-white" size={20} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              AI Chat
            </h2>
          </div>
          
          <Row method="POST" path={`${base}/api/chat`} desc="AI assistant with 6-provider intelligent fallback chain (OpenAI → Gemini → DeepSeek → Qwen → GPT-OSS → Llama)" />
          
          <div className="mt-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 border-2 border-purple-200/50 dark:border-purple-700/50 rounded-xl p-5 shadow-md backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md shadow-sm">
                <FaBrain size={14} className="text-white" />
              </div>
              <span>AI Provider Fallback Chain</span>
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {[
                { name: "OpenAI", color: "bg-blue500" },
                { name: "Gemini", color: "bg-indigo-500" },
                { name: "DeepSeek", color: "bg-cyan-500" },
                { name: "Qwen", color: "bg-purple-500" },
                { name: "GPT-OSS", color: "bg-pink-500" },
                { name: "Llama", color: "bg-rose-500" }
              ].map((provider, idx) => (
                <div key={idx} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className={`px-3 py-1.5 bg-gradient-to-r ${provider.color} text-white rounded-lg font-bold text-xs shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer`}>
                    {provider.name}
                  </span>
                  {idx < 5 && <FaChevronRight className="text-slate-400 dark:text-slate-500" size={10} />}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-purple-700 dark:text-purple-400">Intelligent Auto-Fallback:</strong> Automatic provider switching ensures 99.9% uptime even during rate limits or quota exhaustion
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Each provider is tested sequentially until a successful response is received. The system intelligently handles errors and seamlessly transitions between providers.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10 animate-fade-in-up animation-delay-1200">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg">
              <FaStickyNote className="text-white" size={18} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Important Notes
            </h2>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <ul className="text-slate-700 dark:text-slate-300 space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2 group hover:translate-x-1 transition-transform duration-300">
                <span className="text-sky-500 mt-1 text-base group-hover:scale-110 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Categories:</strong> anime, manga, manhwa, manhua, ln (light novels)</span>
              </li>
              <li className="flex items-start gap-2 group hover:translate-x-1 transition-transform duration-300">
                <span className="text-sky-500 mt-1 text-base group-hover:scale-110 transition-transform duration-300">•</span>
                <div className="flex-1">
                  <strong className="text-slate-900 dark:text-slate-100 font-bold">Required parameters:</strong>
                  <ul className="ml-4 mt-1.5 space-y-1.5">
                    {[
                      { param: "id", desc: "for detail, character, staff, recommendations" },
                      { param: "query", desc: "for search endpoints" },
                      { param: "genre", desc: "for top-genre filtering" }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 group/item hover:translate-x-1 transition-transform duration-300">
                        <span className="text-purple-500 mt-0.5">→</span>
                        <code className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 px-2 py-0.5 rounded-md text-xs font-mono shadow-sm group-hover/item:shadow-md transition-all duration-300">{item.param}</code>
                        <span className="text-slate-600 dark:text-slate-400 text-xs">{item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li className="flex items-start gap-2 group hover:translate-x-1 transition-transform duration-300">
                <span className="text-sky-500 mt-1 text-base group-hover:scale-110 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Chat Persona:</strong> Default is tsundere personality, or send custom persona in POST request body</span>
              </li>
              <li className="flex items-start gap-2 group hover:translate-x-1 transition-transform duration-300">
                <span className="text-sky-500 mt-1 text-base group-hover:scale-110 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Rate Limit:</strong> Please be respectful with API usage to ensure availability for all users</span>
              </li>
              <li className="flex items-start gap-2 group hover:translate-x-1 transition-transform duration-300">
                <span className="text-sky-500 mt-1 text-base group-hover:scale-110 transition-transform duration-300">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100 font-bold">Response Format:</strong> All endpoints return JSON with consistent structure</span>
              </li>
            </ul>
          </div>
        </section>

        <footer className="text-center pt-8 border-t-2 border-slate-300/50 dark:border-slate-700/50 animate-fade-in-up animation-delay-1400">
          <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-2 group">
              <FaTerminal size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium">© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            <p className="text-xs font-bold bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              BY TAKAWELL
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
