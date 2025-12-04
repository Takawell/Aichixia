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
      className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-300 px-3 py-1.5 rounded-md font-semibold text-sm active:scale-95 transition hover:bg-slate-300 dark:hover:bg-slate-700"
    >
      <code className="truncate max-w-[160px]">{text}</code>
      {copied ? <FaCheckCircle size={14} className="text-green-500" /> : <FaCopy size={14} />}
    </button>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-bold shadow-sm
      ${active ? "bg-emerald-500" : "bg-rose-500"}`}
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
      className="group border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-4 mb-3 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:border-sky-400 dark:hover:border-sky-500 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="px-2.5 py-1 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded font-bold text-xs tracking-wider whitespace-nowrap shadow-sm">
            {method}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-sky-600 dark:text-sky-300 rounded text-xs font-mono truncate flex-1 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
            {path}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
          {copied ? (
            <FaCheckCircle className="text-emerald-500" size={14} />
          ) : (
            <FaCopy className="text-slate-400 group-hover:text-sky-500 transition-colors" size={14} />
          )}
        </div>
      </div>
      <p className="relative text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{desc}</p>
    </div>
  );
};

export default function Docs() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-between items-start mb-8 sm:mb-12">
          <div className="flex-1" />
          <ThemeToggle />
        </div>

        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            <FaBookOpen className="text-sky-500 dark:text-sky-400" size={40} />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              Aichixia API
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with multi-provider AI intelligence.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link
              href="/chat"
              className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <FaComments size={20} />
              <span>Try AI Chat</span>
              <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={14} />
            </Link>
            
            <a
              href="#endpoints"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300"
            >
              <FaRocket size={18} />
              <span>Explore API</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                <FaFilm className="text-sky-600 dark:text-sky-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Rich Data</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Access comprehensive anime, manga, and light novel information from AniList
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaBrain className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Multi-AI</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Smart fallback system with OpenAI, Gemini, Qwen, GPT-OSS, and Llama
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <FaRocket className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Fast & Free</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Lightning-fast responses with no authentication required
            </p>
          </div>
        </div>

        <section id="endpoints" className="mb-12 scroll-mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg shadow-lg">
              <FaFilm className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              API Endpoints
            </h2>
          </div>

          <div className="space-y-1">
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=search&query={text}`} desc="Search anime (requires query)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manga&action=search&query={text}`} desc="Search manga (requires query)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=search&query={text}`} desc="Search manhwa (requires query)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhua&action=search&query={text}`} desc="Search manhua (requires query)" />
            <Row method="GET" path={`${base}/api/aichixia?category=ln&action=search&query={text}`} desc="Search light novels (requires query)" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=detail&id={value}`} desc="Media detail by ID (requires id)" />
            <Row method="GET" path={`${base}/api/aichixia?action=trending`} desc="Trending anime & manga" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=seasonal`} desc="Seasonal anime list" />
            <Row method="GET" path={`${base}/api/aichixia?action=airing`} desc="Airing schedule" />
            <Row method="GET" path={`${base}/api/aichixia?category=anime&action=recommendations&id={value}`} desc="Recommendations (requires id)" />
            <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=top-genre&genre={name}`} desc="Top by genre (requires genre)" />
            <Row method="GET" path={`${base}/api/aichixia?action=character&id={value}`} desc="Character detail (requires id)" />
            <Row method="GET" path={`${base}/api/aichixia?action=staff&id={value}`} desc="Staff detail (requires id)" active={false} overrideLabel="Maintenance" />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
              <FaComments className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              AI Chat
            </h2>
          </div>
          <Row method="POST" path={`${base}/api/chat`} desc="Tsundere AI assistant with multi-provider fallback (OpenAI → Gemini → Qwen → GPT-OSS → Llama)" />
          
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-5">
            <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
              <FaBrain size={16} />
              AI Provider Chain
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full font-semibold">OpenAI</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1 bg-indigo-500 text-white rounded-full font-semibold">Gemini</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full font-semibold">Qwen</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1 bg-pink-500 text-white rounded-full font-semibold">GPT-OSS</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1 bg-rose-500 text-white rounded-full font-semibold">Llama</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
              Automatic fallback ensures 99.9% uptime with intelligent provider switching on rate limits or quota exhaustion
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg">
              <FaStickyNote className="text-white" size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
              Important Notes
            </h2>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-6 shadow-sm">
            <ul className="text-slate-700 dark:text-slate-300 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-1">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100">Categories:</strong> anime, manga, manhwa, manhua, ln</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-1">•</span>
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">Required parameters:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">→</span>
                      <code className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs">id</code>
                      <span className="text-slate-600 dark:text-slate-400">for detail, character, staff, recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">→</span>
                      <code className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs">query</code>
                      <span className="text-slate-600 dark:text-slate-400">for search</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">→</span>
                      <code className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs">genre</code>
                      <span className="text-slate-600 dark:text-slate-400">for top-genre</span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-1">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100">Chat Persona:</strong> Default is tsundere, or send custom persona in POST body</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 mt-1">•</span>
                <span><strong className="text-slate-900 dark:text-slate-100">Rate Limit:</strong> Please be respectful with API usage</span>
              </li>
            </ul>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-slate-300 dark:border-slate-700">
          <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <FaTerminal size={16} />
              <span>© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            <p className="text-xs">BY TAKAWELL</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
