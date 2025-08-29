import React from "react";
import { BookOpen, MessageSquare, Terminal } from "lucide-react";

const base = "";

const Row = ({ method, path, desc }: { method: string; path: string; desc: string }) => (
  <div
    style={{
      border: "1px solid #e5e7eb",
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      background: "#ffffff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
      <code
        style={{
          padding: "2px 8px",
          borderRadius: 6,
          background: "#f3f4f6",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {method}
      </code>
      <code
        style={{
          padding: "2px 8px",
          borderRadius: 6,
          background: "#eef2ff",
          fontSize: 13,
          color: "#4f46e5",
        }}
      >
        {path}
      </code>
    </div>
    <div style={{ color: "#374151", fontSize: 14 }}>{desc}</div>
  </div>
);

export default function Docs() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "ui-sans-serif, system-ui",
        background: "#ffffff",
      }}
    >
      <header style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8, color: "#111827" }}>
          <BookOpen size={36} style={{ display: "inline", marginRight: 10, color: "#4f46e5" }} />
          Aichixia API Docs
        </h1>
        <p style={{ color: "#6b7280", fontSize: 16 }}>
          Public endpoints for anime & AI chat. Deployed on{" "}
          <span style={{ fontWeight: 600, color: "#111827" }}>Vercel</span>, no extra backend needed.
        </p>
      </header>

      {/* Auth Section */}
      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 12px", color: "#111827" }}>
          🔑 Auth
        </h2>
        <p style={{ color: "#374151", fontSize: 15 }}>
          AniList endpoints don’t require API keys.  
          For chat, set <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>GEMINI_API_KEY</code>{" "}
          in <b>Vercel Project Settings → Environment Variables</b>.
        </p>
      </section>

      {/* Anime Section */}
      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "32px 0 16px", color: "#111827" }}>
          🎬 Anime
        </h2>
        <Row method="GET" path={`${base}/api/anime/search?q=naruto&type=ANIME`} desc="Search anime/manga (type: ANIME|MANGA, q required)" />
        <Row method="GET" path={`${base}/api/anime/1?type=ANIME`} desc="Media detail by ID" />
        <Row method="GET" path={`${base}/api/anime/trending`} desc="Trending anime now" />
        <Row method="GET" path={`${base}/api/anime/seasonal?season=SUMMER&year=2025`} desc="Seasonal list by season & year" />
        <Row method="GET" path={`${base}/api/anime/airing`} desc="Airing schedules" />
        <Row method="GET" path={`${base}/api/anime/recommendations?id=1`} desc="Recommendations by media ID" />
        <Row method="GET" path={`${base}/api/anime/genre?genre=Action&type=ANIME`} desc="Top by genre (ANIME|MANGA)" />
        <Row method="GET" path={`${base}/api/character/1`} desc="Character detail by ID" />
        <Row method="GET" path={`${base}/api/staff/1`} desc="Staff detail by ID" />
      </section>

      {/* Chat Section */}
      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "32px 0 16px", color: "#111827" }}>
          💬 Chat
        </h2>
        <Row method="POST" path={`${base}/api/chat`} desc="Unified chat endpoint (intent routing: AniList or Gemini)" />
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#0f172a",
            color: "#f8fafc",
            padding: 16,
            borderRadius: 12,
            fontSize: 13,
            overflow: "auto",
          }}
        >{`curl -X POST "$HOST/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Recommend me some isekai anime",
    "persona": "friendly"
  }'`}</pre>
      </section>

      {/* Notes Section */}
      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "32px 0 12px", color: "#111827" }}>
          📝 Notes
        </h2>
        <ul style={{ color: "#374151", lineHeight: 1.7, fontSize: 15 }}>
          <li>
            Make sure <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>GEMINI_API_KEY</code> is
            set in Vercel (Production/Preview/Development).
          </li>
          <li>All AniList endpoints are public and don’t require an API key.</li>
          <li>
            Use <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>/api/chat</code> for natural
            language; intent will auto-route to AniList/Gemini.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 50, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
        <Terminal size={14} style={{ display: "inline", marginRight: 6 }} />
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
