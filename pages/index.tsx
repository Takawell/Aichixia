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
        border: "1px solid #3b82f6",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        background: hovered ? "#1e40af" : "#111827",
        boxShadow: hovered
          ? "0 0 15px 3px rgba(59,130,246,0.6)"
          : "0 2px 10px rgba(0,0,0,0.4)",
        color: "#e0e7ff",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <code
          style={{
            padding: "4px 12px",
            borderRadius: 8,
            background: "#2563eb",
            fontWeight: 700,
            fontSize: 14,
            color: "#e0e7ff",
            userSelect: "none",
            letterSpacing: 1,
          }}
        >
          {method}
        </code>
        <code
          style={{
            padding: "4px 12px",
            borderRadius: 8,
            background: "#3b82f6",
            fontSize: 14,
            color: "#dbeafe",
            userSelect: "all",
            fontWeight: "600",
          }}
          title="Click to copy"
          onClick={() => {
            navigator.clipboard.writeText(path);
            alert("Path copied to clipboard!");
          }}
        >
          {path}
        </code>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.4 }}>{desc}</div>
    </div>
  );
};

export default function Docs() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "0 24px 48px",
        fontFamily: "'Poppins', sans-serif",
        background: "#000000",
        color: "#d1d5db",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          marginBottom: 48,
          textAlign: "center",
          borderBottom: "2px solid #3b82f6",
          paddingBottom: 16,
          userSelect: "none",
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "#3b82f6",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FaBookOpen size={48} />
          Aichixia API Docs
        </h1>
        <p
          style={{
            color: "#9ca3af",
            fontSize: 18,
            maxWidth: 650,
            margin: "8px auto 0",
            fontWeight: 500,
          }}
        >
          Public endpoints for anime & AI chat. Deployed on{" "}
          <span style={{ fontWeight: 700, color: "#3b82f6" }}>Vercel</span>, no extra backend needed.
        </p>
      </header>

      {/* Auth Section */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#2563eb",
            userSelect: "none",
          }}
        >
          <FaKey /> Auth
        </h2>
        <p style={{ fontSize: 16, color: "#9ca3af" }}>
          AniList endpoints don’t require API keys. For chat, set{" "}
          <code
            style={{
              background: "#1e40af",
              padding: "4px 8px",
              borderRadius: 6,
              fontWeight: 700,
              userSelect: "all",
            }}
          >
            GEMINI_API_KEY
          </code>{" "}
          in <b>Vercel Project Settings → Environment Variables</b>.
        </p>
      </section>

      {/* Anime Section */}
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#3b82f6",
            userSelect: "none",
          }}
        >
          <FaFilm /> Anime
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
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#2563eb",
            userSelect: "none",
          }}
        >
          <FaComments /> Chat
        </h2>
        <Row method="POST" path={`${base}/api/chat`} desc="Unified chat endpoint (intent routing: AniList or Gemini)" />
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#1e293b",
            color: "#bfdbfe",
            padding: 20,
            borderRadius: 14,
            fontSize: 14,
            overflowX: "auto",
            boxShadow: "0 0 20px 2px rgba(59, 130, 246, 0.5)",
            userSelect: "all",
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
      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#3b82f6",
            userSelect: "none",
          }}
        >
          <FaStickyNote /> Notes
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af" }}>
          <li>
            Make sure{" "}
            <code
              style={{
                background: "#1e40af",
                padding: "4px 8px",
                borderRadius: 6,
                fontWeight: 700,
                userSelect: "all",
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
                background: "#1e40af",
                padding: "4px 8px",
                borderRadius: 6,
                fontWeight: 700,
                userSelect: "all",
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
          color: "#64748b",
          fontSize: 14,
          userSelect: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <FaTerminal size={16} />
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
