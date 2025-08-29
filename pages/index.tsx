import React from "react";
import { Terminal, Sparkles, Globe } from "lucide-react";

const base = "";

const Row = ({ method, path, desc }: { method: string; path: string; desc: string }) => (
  <div
    style={{
      border: "1px solid #1f2937",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      background: "#111827",
    }}
  >
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
      <code
        style={{
          padding: "2px 8px",
          borderRadius: 8,
          background: "#f59e0b",
          color: "#000",
          fontWeight: 600,
        }}
      >
        {method}
      </code>
      <code
        style={{
          padding: "2px 8px",
          borderRadius: 8,
          background: "#1e293b",
          color: "#f8fafc",
        }}
      >
        {path}
      </code>
    </div>
    <div style={{ color: "#d1d5db", fontSize: 14 }}>{desc}</div>
  </div>
);

export default function Docs() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "ui-sans-serif, system-ui",
        color: "#f9fafb",
        background: "#000",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, display: "flex", gap: 8, justifyContent: "center" }}>
          <Sparkles size={32} color="#f59e0b" /> Aichixia API Docs
        </h1>
        <p style={{ color: "#9ca3af", marginTop: 8, fontSize: 16 }}>
          Public endpoints for <span style={{ color: "#38bdf8" }}>Anime</span> &{" "}
          <span style={{ color: "#a78bfa" }}>Chat AI</span>. Powered by Vercel.
        </p>
      </header>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 12px", color: "#f59e0b" }}>
          <Globe size={20} style={{ display: "inline", marginRight: 6 }} /> Auth
        </h2>
        <p style={{ color: "#d1d5db", lineHeight: 1.6 }}>
          AniList endpoints are public and need no API key. For chat, set{" "}
          <code style={{ background: "#1f2937", padding: "2px 6px", borderRadius: 6 }}>GEMINI_API_KEY</code>{" "}
          in Project Settings → Environment Variables.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "32px 0 12px", color: "#38bdf8" }}>Anime</h2>
        <Row method="GET" path={`${base}/api/anime/search?q=naruto&type=ANIME`} desc="Search anime/manga (type: ANIME|MANGA, q required)" />
        <Row method="GET" path={`${base}/api/anime/1?type=ANIME`} desc="Media details by ID" />
        <Row method="GET" path={`${base}/api/anime/trending`} desc="Current trending anime" />
        <Row method="GET" path={`${base}/api/anime/seasonal?season=SUMMER&year=2025`} desc="Seasonal list by season & year" />
        <Row method="GET" path={`${base}/api/anime/airing`} desc="Airing schedules" />
        <Row method="GET" path={`${base}/api/anime/recommendations?id=1`} desc="Recommendations by media ID" />
        <Row method="GET" path={`${base}/api/anime/genre?genre=Action&type=ANIME`} desc="Top by genre (ANIME|MANGA)" />
        <Row method="GET" path={`${base}/api/character/1`} desc="Character details by ID" />
        <Row method="GET" path={`${base}/api/staff/1`} desc="Staff details by ID" />
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "32px 0 12px", color: "#a78bfa" }}>Chat</h2>
        <Row method="POST" path={`${base}/api/chat`} desc="Unified chat endpoint (intent routing: AniList or Gemini)" />
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#0b1020",
            color: "#f8fafc",
            padding: 16,
            borderRadius: 12,
            overflow: "auto",
            fontSize: 14,
          }}
        >{`
curl -X POST "$HOST/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Recommend me an isekai anime",
    "persona": "friendly"
  }'
        `}</pre>
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "32px 0 12px", color: "#f59e0b" }}>Notes</h2>
        <ul style={{ color: "#d1d5db", lineHeight: 1.7 }}>
          <li>Make sure <code>GEMINI_API_KEY</code> is set in Vercel (Production/Preview/Development).</li>
          <li>All AniList endpoints are public, no key required.</li>
          <li>
            Use <code>/api/chat</code> for natural language queries: intent auto-routes to AniList/Gemini.
          </li>
        </ul>
      </section>

      <footer style={{ marginTop: 40, textAlign: "center", color: "#6b7280" }}>
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
