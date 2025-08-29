import React, { useState, createContext, useContext } from "react";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";

const base = "";

type Lang = "en" | "id";
const LangContext = createContext<[Lang, (val: Lang) => void]>(["en", () => {}]);

const Row = ({
  method,
  path,
  desc,
}: {
  method: string;
  path: string;
  desc: { en: string; id: string };
}) => {
  const [copied, setCopied] = useState(false);
  const [lang] = useContext(LangContext);

  const copy = async () => {
    await navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-1 rounded bg-slate-700 text-slate-200 text-xs font-mono">
          {method}
        </span>
        <code className="px-2 py-1 rounded bg-indigo-900 text-indigo-300 font-mono">
          {path}
        </code>
        <button
          onClick={copy}
          className="ml-auto text-slate-400 hover:text-white text-sm"
        >
          {copied ? "Copied!" : <Copy className="h-4 w-4 inline" />}
        </button>
      </div>
      <p className="text-slate-300 text-sm">{desc[lang]}</p>
    </div>
  );
};

export default function Docs() {
  const [lang, setLang] = useState<Lang>("en");
  const [open, setOpen] = useState(true);

  return (
    <LangContext.Provider value={[lang, setLang]}>
      <main className="min-h-screen bg-slate-900 text-white max-w-4xl mx-auto p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Aichixia API Docs</h1>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${
                lang === "en"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              className={`px-3 py-1 rounded ${
                lang === "id"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-300"
              }`}
              onClick={() => setLang("id")}
            >
              ID
            </button>
          </div>
        </div>

        <p className="text-slate-400 mb-6">
          {lang === "en"
            ? "Public endpoints for anime & chat. Deployable on Vercel, no backend needed."
            : "Endpoint publik untuk anime & chat. Bisa deploy di Vercel tanpa backend tambahan."}
        </p>

        {/* Anime Section */}
        <section>
          <button
            className="flex items-center justify-between w-full text-lg font-semibold py-2"
            onClick={() => setOpen(!open)}
          >
            {lang === "en" ? "Anime Endpoints" : "Endpoint Anime"}
            {open ? <ChevronUp /> : <ChevronDown />}
          </button>
          {open && (
            <div className="mt-2">
              <Row
                method="GET"
                path={`${base}/api/anime/search?q=naruto&type=ANIME`}
                desc={{
                  en: "Search anime/manga (q required, type: ANIME|MANGA).",
                  id: "Cari anime/manga (q wajib, type: ANIME|MANGA).",
                }}
              />
              <Row
                method="GET"
                path={`${base}/api/anime/trending`}
                desc={{
                  en: "Current trending anime.",
                  id: "Anime trending saat ini.",
                }}
              />
            </div>
          )}
        </section>

        {/* Chat Section */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-2">
            {lang === "en" ? "Chat" : "Chat"}
          </h2>
          <Row
            method="POST"
            path={`${base}/api/chat`}
            desc={{
              en: "Unified chat endpoint (AniList + Gemini).",
              id: "Endpoint chat terpadu (AniList + Gemini).",
            }}
          />

          <pre className="bg-slate-800 text-slate-100 text-sm p-4 rounded-lg overflow-x-auto mt-4">
{`curl -X POST "$HOST/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Rekomendasi anime isekai dong",
    "persona": "friendly"
  }'`}
          </pre>
        </section>

        <footer className="mt-10 text-sm text-slate-500">
          © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
        </footer>
      </main>
    </LangContext.Provider>
  );
}
