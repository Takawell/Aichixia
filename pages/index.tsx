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
} from "react-icons/fa";
import ThemeToggle from "@/components/ThemeToggle";

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
      className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-300 px-3 py-1.5 rounded-md font-semibold text-sm active:scale-95 transition"
    >
      <code className="truncate max-w-[160px]">{text}</code>
      <FaCopy size={14} />
    </button>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow 
      ${active ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
    >
      {active ? <FaCheckCircle /> : <FaTimesCircle />} {label}
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
  const copy = () => navigator.clipboard.writeText(path);
  return (
    <div
      onClick={copy}
      className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-5 mb-5 shadow-sm hover:shadow-md cursor-pointer transition"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="px-4 py-1.5 bg-sky-400 text-white rounded-lg font-bold text-sm tracking-wider whitespace-nowrap">
            {method}
          </span>
          <span className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-sky-600 dark:text-sky-300 rounded-lg text-sm font-semibold truncate flex-1">
            {path}
          </span>
        </div>
        <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{desc}</p>
    </div>
  );
};

export default function Docs() {
  return (
    <main className="max-w-4xl mx-auto px-5 py-10 min-h-screen bg-slate-100 dark:bg-slate-900 transition">
      <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div>

      <header className="text-center mb-14 border-b-4 border-sky-400 pb-6">
        <h1 className="text-5xl font-black text-sky-600 dark:text-sky-300 flex items-center justify-center gap-4 tracking-wider">
          <FaBookOpen size={48} />
          Aichixia API Docs
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto mt-4">
          Centralized API for anime, manga, manhwa, manhua, and light novels.
          Powered by AniList + Gemini AI.
        </p>
      </header>

      <section className="mb-14">
        <h2 className="text-3xl font-bold text-sky-600 dark:text-sky-300 mb-6 flex items-center gap-3">
          <FaFilm />
          Aichixia Endpoints
        </h2>

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
      </section>

      <section className="mb-14">
        <h2 className="text-3xl font-bold text-sky-600 dark:text-sky-300 mb-6 flex items-center gap-3">
          <FaComments />
          Chat
        </h2>
        <Row method="POST" path={`${base}/api/chat`} desc="AI-powered anime assistant" />
      </section>

      <section className="">
        <h2 className="text-3xl font-bold text-sky-600 dark:text-sky-300 mb-4 flex items-center gap-3">
          <FaStickyNote />
          Notes
        </h2>
        <ul className="text-slate-700 dark:text-slate-300 space-y-2 text-sm ml-6 list-disc">
          <li>Categories: anime, manga, manhwa, manhua, ln.</li>
          <li>Required parameters:
            <ul className="ml-6 list-disc">
              <li><code>id</code> → detail, character, staff, recommendations</li>
              <li><code>query</code> → search</li>
              <li><code>genre</code> → top-genre</li>
            </ul>
          </li>
        </ul>
      </section>

      <footer className="text-center mt-16 text-slate-500 dark:text-slate-400 text-sm">
        <div className="flex justify-center items-center gap-2">
          <FaTerminal />
          © {new Date().getFullYear()} Aichixia Anime-first AI Assistant.
        </div>
      </footer>
    </main>
  );
}
