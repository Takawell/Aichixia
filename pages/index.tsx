import React, { useState } from "react";
import {
  FaBookOpen,
  FaKey,
  FaFilm,
  FaComments,
  FaStickyNote,
  FaTerminal,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
} from "react-icons/fa";

const base = "";

const CopyableCode = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={copyToClipboard}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        background: "#e0f2f1",
        color: "#00796b",
        padding: "4px 10px",
        borderRadius: 6,
        fontWeight: "600",
        userSelect: "all",
        transition: "background-color 0.3s ease",
        fontSize: 14,
      }}
      title={copied ? "Copied!" : "Click to copy"}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b2dfdb")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e0f2f1")}
    >
      <code>{text}</code>
      <FaCopy size={14} />
    </div>
  );
};

const StatusBadge = ({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: active ? "#4caf50" : "#ef5350",
      color: "white",
      fontWeight: "700",
      padding: "3px 10px",
      borderRadius: 12,
      fontSize: 13,
      userSelect: "none",
      boxShadow: active
        ? "0 0 8px #4caf50aa"
        : "0 0 8px #ef5350aa",
      animation: active ? "pulseGreen 2s infinite" : "none",
    }}
  >
    {active ? <FaCheckCircle /> : <FaTimesCircle />} {label}
    <style>{`
      @keyframes pulseGreen {
        0%, 100% { box-shadow: 0 0 8px #4caf50aa; }
        50% { box-shadow: 0 0 20px #4caf50ff; }
      }
    `}</style>
  </span>
);

const Row = ({
  method,
  path,
  desc,
  active = true,
}: {
  method: string;
  path: string;
  desc: string;
  active?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: hovered ? "2px solid #00796b" : "1px solid #b2dfdb",
        padding: 20,
        borderRadius: 14,
        marginBottom: 20,
        background: hovered ? "#e0f2f1" : "#f9fafb",
        boxShadow: hovered
          ? "0 10px 18px rgba(0,121,107,0.35)"
          : "0 2px 6px rgba(0,0,0,0.08)",
        color: "#263238",
        transition: "all 0.3s ease",
        cursor: "pointer",
        userSelect: "none",
        wordBreak: "break-word",
      }}
      onClick={() => {
        navigator.clipboard.writeText(path);
        alert("API path copied!");
      }}
      title="Click to copy API path"
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          marginBottom: 10,
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexGrow: 1, minWidth: 0 }}>
          <code
            style={{
              padding: "5px 14px",
              borderRadius: 10,
              background: "#00796b",
              fontWeight: 700,
              fontSize: 14,
              color: "white",
              letterSpacing: 1,
              userSelect: "none",
              flexShrink: 0,
            }}
          >
            {method}
          </code>
          <code
            style={{
              padding: "5px 14px",
              borderRadius: 10,
              background: "#004d40",
              fontSize: 14,
              color: "#a7ffeb",
              fontWeight: 600,
              userSelect: "all",
              overflowWrap: "break-word",
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            {path}
          </code>
        </div>
        <StatusBadge active={active} label={active ? "Active" : "Inactive"} />
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.5, color: "#37474f" }}>{desc}</div>
    </div>
  );
};

export default function Docs() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "48px auto",
        padding: "0 20px 64px",
        fontFamily: "'Poppins', sans-serif",
        background: "#fff",
        color: "#263238",
        minHeight: "100vh",
        userSelect: "text",
      }}
    >
      <header
        style={{
          marginBottom: 56,
          textAlign: "center",
          borderBottom: "4px solid #00796b",
          paddingBottom: 20,
          position: "relative",
          userSelect: "none",
        }}
      >
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#00796b",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            letterSpacing: "0.07em",
            flexWrap: "wrap",
          }}
        >
          <FaBookOpen size={52} />
          Aichixia API Docs
          <span
            style={{
              marginLeft: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: 18,
              color: "#4caf50",
              userSelect: "none",
            }}
            title="API status"
          >
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                boxShadow: "0 0 6px #4caf50cc",
                animation: "blinkGreen 1.5s infinite",
              }}
            />
            API is Active
            <style>{`
              @keyframes blinkGreen {
                0%, 100% { opacity: 1; box-shadow: 0 0 6px #4caf50cc; }
                50% { opacity: 0.3; box-shadow: 0 0 12px #4caf50ff; }
              }
              @media (max-width: 600px) {
                h1 {
                  font-size: 36px !important;
                  gap: 10px !important;
                }
              }
            `}</style>
          </span>
        </h1>
        <p
          style={{
            color: "#455a64",
            fontSize: 18,
            maxWidth: 700,
            margin: "12px auto 0",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          Public endpoints for anime & AI chat. Deployed on{" "}
          <span style={{ fontWeight: 700, color: "#004d40" }}>Vercel</span>, no extra backend needed.
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
            color: "#00796b",
            userSelect: "none",
          }}
        >
          <FaKey />
          Auth
        </h2>
        <p style={{ fontSize: 16, color: "#455a64", lineHeight: 1.6 }}>
          AniList endpoints don’t require API keys. For chat, set{" "}
          <CopyableCode text="GEMINI_API_KEY" /> in{" "}
          <b>Vercel Project Settings → Environment Variables</b>.
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
            color: "#004d40",
            userSelect: "none",
          }}
        >
          <FaFilm />
          Anime
        </h2>
        <Row
          method="GET"
          path={`${base}/api/anime/search?q=naruto&type=ANIME`}
          desc="Search anime/manga (type: ANIME|MANGA, q required)"
          active
        />
        <Row method="GET" path={`${base}/api/anime/1?type=ANIME`} desc="Media detail by ID" active />
        <Row method="GET" path={`${base}/api/anime/trending`} desc="Trending anime now" active />
        <Row method="GET" path={`${base}/api/anime/seasonal?season=SUMMER&year=2025`} desc="Seasonal list by season & year" active />
        <Row method="GET" path={`${base}/api/anime/airing`} desc="Airing schedules" active />
        <Row method="GET" path={`${base}/api/anime/recommendations?id=1`} desc="Recommendations by media ID" active />
        <Row method="GET" path={`${base}/api/anime/genre?genre=Action&type=ANIME`} desc="Top by genre (ANIME|MANGA)" active />
        <Row method="GET" path={`${base}/api/character/1`} desc="Character detail by ID" active />
        <Row method="GET" path={`${base}/api/staff/1`} desc="Staff detail by ID" active />
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
            color: "#004d40",
            userSelect: "none",
          }}
        >
          <FaComments />
          Chat
        </h2>
        <Row method="POST" path={`${base}/api/chat`} desc="Unified chat endpoint (intent routing: AniList or Gemini)" active />
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#004d40",
            color: "#a7ffeb",
            padding: 20,
            borderRadius: 16,
            fontSize: 14,
            overflowX: "auto",
            fontFamily: "'Fira Mono', monospace",
          }}
          onClick={() => {
            navigator.clipboard.writeText(`curl -X POST "$HOST/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Recommend me some isekai anime",
    "persona": "friendly"
  }'`);
            alert("Curl command copied!");
          }}
          title="Click to copy cURL command"
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
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#004d40",
            userSelect: "none",
          }}
        >
          <FaStickyNote />
          Notes
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 1.75, color: "#455a64", paddingLeft: 24 }}>
          <li>
            Make sure <CopyableCode text="GEMINI_API_KEY" /> is set in Vercel (Production/Preview/Development).
          </li>
          <li>All AniList endpoints are public and don’t require an API key.</li>
          <li>
            Use <CopyableCode text="/api/chat" /> for natural language; intent will auto-route to AniList/Gemini.
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 64,
          textAlign: "center",
          color: "#789262",
          fontSize: 14,
          userSelect: "none",
        }}
      >
        <FaTerminal style={{ verticalAlign: "middle", marginRight: 6 }} />
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
