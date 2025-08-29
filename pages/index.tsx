import React, { useState } from "react";
import { FaBookOpen, FaKey, FaFilm, FaComments, FaStickyNote, FaTerminal } from "react-icons/fa";

const base = "";

const Row = ({ method, path, desc }: { method: string; path: string; desc: string }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: hovered ? "2px solid #4f46e5" : "1px solid #e0e7ff",
        padding: 20,
        borderRadius: 14,
        marginBottom: 20,
        background: hovered ? "#eef2ff" : "#ffffff",
        boxShadow: hovered
          ? "0 10px 20px rgba(79, 70, 229, 0.3)"
          : "0 2px 6px rgba(0,0,0,0.07)",
        color: "#1e293b",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => {
        navigator.clipboard.writeText(path);
        alert("Path copied to clipboard!");
      }}
      title="Click to copy path"
    >
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 8 }}>
        <code
          style={{
            padding: "5px 14px",
            borderRadius: 8,
            background: "#c7d2fe",
            fontWeight: 700,
            fontSize: 14,
            color: "#3730a3",
            letterSpacing: 1,
            userSelect: "none",
          }}
        >
          {method}
        </code>
        <code
          style={{
            padding: "5px 14px",
            borderRadius: 8,
            background: "#6366f1",
            fontSize: 14,
            color: "white",
            fontWeight: 600,
            userSelect: "all",
            flexGrow: 1,
            overflowWrap: "anywhere",
          }}
        >
          {path}
        </code>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.5, color: "#334155" }}>{desc}</div>
    </div>
  );
};

export default function Docs() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "48px auto",
        padding: "0 24px 64px",
        fontFamily: "'Poppins', sans-serif",
        background: "#ffffff",
        color: "#334155",
        minHeight: "100vh",
        userSelect: "text",
      }}
    >
      <header
        style={{
          marginBottom: 56,
          textAlign: "center",
          borderBottom: "3px solid #4f46e5",
          paddingBottom: 20,
          userSelect: "none",
        }}
      >
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#4f46e5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            letterSpacing: "0.05em",
          }}
        >
          <FaBookOpen size={50} />
          Aichixia API Docs
        </h1>
        <p
          style={{
            color: "#64748b",
            fontSize: 18,
            maxWidth: 680,
            margin: "12px auto 0",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Public endpoints for anime & AI chat. Deployed on{" "}
          <span style={{ fontWeight: 700, color: "#4338ca" }}>Vercel</span>, no extra backend needed.
        </p>
      </header>

      {/* Auth Section */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 700,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#4338ca",
            userSelect: "none",
          }}
        >
          <FaKey />
          Auth
        </h2>
        <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.6 }}>
          AniList endpoints don’t require API keys. For chat, set{" "}
          <code
            style={{
              background: "#e0e7ff",
              padding: "5px 10px",
              borderRadius: 6,
              fontWeight: 700,
              userSelect: "all",
              color: "#4338ca",
            }}
          >
            GEMINI_API_KEY
          </code>{" "}
          in <b>Vercel Project Settings → Environment Variables</b>.
        </p>
      </section>

      {/* Anime Section */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 700,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#6366f1",
            userSelect: "none",
          }}
        >
          <FaFilm />
          Anime
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
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 700,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#4338ca",
            userSelect: "none",
          }}
        >
          <FaComments />
          Chat
        </h2>
        <Row method="POST" path={`${base}/api/chat`} desc="Unified chat endpoint (intent routing: AniList or Gemini)" />
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#eef2ff",
            color: "#4338ca",
            padding: 20,
            borderRadius: 16,
            fontSize: 15,
            overflowX: "auto",
            boxShadow: "0 6px 18px rgba(99, 102, 241, 0.3)",
            userSelect: "all",
            cursor: "pointer",
            fontFamily: "'Fira Code', monospace",
          }}
          onClick={() => {
            navigator.clipboard.writeText(
              `curl -X POST "$HOST/api/chat" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "message": "Recommend me some isekai anime",\n    "persona": "friendly"\n  }'`
            );
            alert("Curl command copied!");
          }}
          title="Click to copy curl command"
        >
          {`curl -X POST "$HOST/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Recommend me some isekai anime",
    "persona": "friendly"
  }'`}
        </pre>
      </section>

      {/* Notes Section */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 700,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#6366f1",
            userSelect: "none",
          }}
        >
          <FaStickyNote />
          Notes
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 1.8, color: "#475569" }}>
          <li>
            Make sure{" "}
            <code
              style={{
                background: "#e0e7ff",
                padding: "5px 10px",
                borderRadius: 6,
                fontWeight: 700,
                userSelect: "all",
                color: "#4338ca",
              }}
            >
              GEMINI_API_KEY
            </code>{" "}
            is set in Vercel (Production/Preview/Development).
          </li>
          <li>All AniList endpoints are public and don’t require an API key.</li>
          <li>
            Use{" "}
            <code
              style={{
                background: "#e0e7ff",
                padding: "5px 10px",
                borderRadius: 6,
                fontWeight: 700,
                userSelect: "all",
                color: "#4338ca",
              }}
            >
              /api/chat
            </code>{" "}
            for natural language; intent will auto-route to AniList/Gemini.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 80,
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 14,
          userSelect: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <FaTerminal size={18} />
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
