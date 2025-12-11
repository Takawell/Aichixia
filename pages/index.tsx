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
  FaCode,
  FaServer,
  FaLightbulb,
  FaTimes,
  FaInfoCircle,
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
  
  const copy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <FaCode className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Endpoint Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FaTimes className="text-white" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaServer className="text-sky-500" size={16} />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Method
              </h4>
            </div>
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white rounded-lg font-bold text-sm shadow-md">
              {method}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaInfoCircle className="text-purple-500" size={16} />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Description
              </h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {desc}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaCode className="text-emerald-500" size={16} />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Endpoint URL
              </h4>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <code className="text-sky-600 dark:text-sky-400 text-sm break-all font-mono">
                {path}
              </code>
            </div>
            <button
              onClick={copy}
              className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
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
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaLightbulb className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                    Note
                  </h4>
                  <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
                    {note}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold shadow-md
      ${active ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-rose-500 to-red-500"}`}
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
      <div className="group border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl mb-3 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative p-4">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-sky-400/5 group-hover:via-purple-400/5 group-hover:to-pink-400/5 transition-all duration-500" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="px-3 py-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white rounded-lg font-bold text-xs tracking-wider whitespace-nowrap shadow-md">
                {method}
              </span>
              <span className="flex-1 text-slate-700 dark:text-slate-300 text-sm font-medium truncate">
                {desc}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                Details
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

export default function Docs() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-between items-start mb-8 sm:mb-12">
          <div className="flex-1" />
          <ThemeToggle />
        </div>

        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-4 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            <FaBookOpen className="text-sky-500 dark:text-sky-400 animate-pulse" size={40} />
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
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl shadow-lg">
                <FaFilm className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Rich Data</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Access comprehensive anime, manga, and light novel information from AniList
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                <FaBrain className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Multi-AI</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Smart fallback system with OpenAI, Gemini, Deepseek, Qwen, GPT-OSS, and Llama
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg">
                <FaRocket className="text-white" size={24} />
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
            <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg">
              <FaFilm className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              API Endpoints
            </h2>
          </div>

          <div className="space-y-1">
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=search&query={text}`} 
              desc="Search anime by title or keywords" 
              note="Replace {text} with your search query. Example: query=naruto"
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
              note="Replace {text} with your search query. Returns light novel results from AniList."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=detail&id={value}`} 
              desc="Get detailed information by media ID" 
              note="Replace {value} with the AniList media ID. Works for anime, manga, manhwa, manhua, and light novels."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=trending`} 
              desc="Get currently trending anime and manga" 
              note="Returns a list of the most popular and trending titles right now."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=seasonal`} 
              desc="Get current seasonal anime releases" 
              note="Returns anime airing in the current season (Winter, Spring, Summer, or Fall)."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=airing`} 
              desc="Get anime airing schedule" 
              note="Returns the schedule of when anime episodes are airing."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=anime&action=recommendations&id={value}`} 
              desc="Get recommendations based on media ID" 
              note="Replace {value} with the AniList media ID. Returns similar anime/manga recommendations."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?category=manhwa&action=top-genre&genre={name}`} 
              desc="Get top titles by genre" 
              note="Replace {name} with genre (e.g., Action, Romance, Fantasy). Works with any category."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=character&id={value}`} 
              desc="Get character details by ID" 
              note="Replace {value} with the AniList character ID. Returns detailed character information."
            />
            <Row 
              method="GET" 
              path={`${base}/api/aichixia?action=staff&id={value}`} 
              desc="Get staff/creator details by ID" 
              active={false} 
              overrideLabel="Maintenance"
              note="Currently under maintenance. This endpoint will return staff information once restored."
            />
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <FaComments className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
              AI Chat
            </h2>
          </div>
          <Row 
            method="POST" 
            path={`${base}/api/chat`} 
            desc="AI assistant with multi-provider intelligent fallback" 
            note="Send POST request with JSON body: { message: 'your message', persona: 'optional custom persona' }. Default persona is tsundere anime character. The system automatically switches between OpenAI, Gemini, Deepseek, Qwen, GPT-OSS, and Llama for 99.9% uptime."
          />
          
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
              <FaBrain size={16} />
              AI Provider Chain
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
              <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-sm">OpenAI</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full font-semibold shadow-sm">Gemini</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-full font-semibold shadow-sm">Deepseek</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-semibold shadow-sm">Qwen</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-semibold shadow-sm">GPT-OSS</span>
              <FaChevronRight className="text-slate-400" size={10} />
              <span className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full font-semibold shadow-sm">Llama</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Automatic fallback ensures 99.9% uptime with intelligent provider switching on rate limits or quota exhaustion
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <FaStickyNote className="text-white" size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
              Important Notes
            </h2>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-md">
            <ul className="text-slate-700 dark:text-slate-300 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-lg mt-0.5">
                  <FaInfoCircle className="text-sky-500" size={12} />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">Categories:</strong>
                  <span className="ml-2">anime, manga, manhwa, manhua, ln</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-0.5">
                  <FaCode className="text-purple-500" size={12} />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">Required parameters:</strong>
                  <ul className="ml-4 mt-2 space-y-1.5">
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
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg mt-0.5">
                  <FaComments className="text-pink-500" size={12} />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">Chat Persona:</strong>
                  <span className="ml-2">Default is tsundere, or send custom persona in POST body</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mt-0.5">
                  <FaServer className="text-emerald-500" size={12} />
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">Rate Limit:</strong>
                  <span className="ml-2">Please be respectful with API usage</span>
                </div>
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
            <p className="text-xs font-semibold bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              BY TAKAWELL
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
