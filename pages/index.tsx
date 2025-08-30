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

const base = "https://aichixia.vercel.app";

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
        background: "#1e293b",
        color: "#38f8d5",
        padding: "4px 10px",
        borderRadius: 6,
        fontWeight: "600",
        userSelect: "all",
        transition: "background-color 0.3s ease",
        fontSize: 14,
      }}
      title={copied ? "Copied!" : "Click to copy"}
    >
      <code>{text}</code>
      <FaCopy size={14} />
    </div>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: active ? "#22c55e" : "#ef4444",
      color: "white",
      fontWeight: "700",
      padding: "3px 10px",
      borderRadius: 12,
      fontSize: 13,
      userSelect: "none",
      boxShadow: active ? "0 0 12px #22c55eaa" : "0 0 12px #ef4444aa",
      animation: active ? "pulseGreen 2s infinite" : "none",
    }}
  >
    {active ? <FaCheckCircle /> : <FaTimesCircle />} {label}
    <style>{`
      @keyframes pulseGreen {
        0%, 100% { box-shadow: 0 0 12px #22c55eaa; }
        50% { box-shadow: 0 0 22px #22c55eff; }
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
  return (
    <div
      style={{
        border: "1px solid #334155",
        padding: 20,
        borderRadius: 14,
        marginBottom: 20,
        background: "#0f172a",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        color: "#e2e8f0",
        transition: "all 0.3s ease",
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
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <code
            style={{
              padding: "5px 14px",
              borderRadius: 10,
              background: "#38bdf8",
              fontWeight: 700,
              fontSize: 14,
              color: "#0f172a",
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
              background: "#1e293b",
              fontSize: 14,
              color: "#38f8d5",
              fontWeight: 600,
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
      <div style={{ fontSize: 15, lineHeight: 1.5, color: "#94a3b8" }}>
        {desc}
      </div>
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
        background: "#0a0f1c",
        color: "#e2e8f0",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          marginBottom: 56,
          textAlign: "center",
          borderBottom: "3px solid #38bdf8",
          paddingBottom: 20,
        }}
      >
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#38f8d5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            letterSpacing: "0.07em",
          }}
        >
          <FaBookOpen size={52} />
          Aichixia API Docs
        </h1>
        <p
          style={{
            color: "#94a3b8",
            fontSize: 18,
            maxWidth: 700,
            margin: "12px auto 0",
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          Centralized API for anime, manga, manhwa, manhua, and light novels.  
          Powered by AniList + AI Assistant.
        </p>
      </header>

      {/* AniList Section */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#38bdf8",
          }}
        >
          <FaFilm />
          AniList Endpoints
        </h2>

        <Row method="GET" path={`${base}/api/aichixia?category=anime&action=search`} desc="Search anime" />
        <Row method="GET" path={`${base}/api/aichixia?category=manga&action=search`} desc="Search manga" />
        <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=search`} desc="Search manhwa" />
        <Row method="GET" path={`${base}/api/aichixia?category=manhua&action=search`} desc="Search manhua" />
        <Row method="GET" path={`${base}/api/aichixia?category=ln&action=search`} desc="Search light novels" />
        <Row method="GET" path={`${base}/api/aichixia?category=anime&action=detail`} desc="Media detail by ID" />
        <Row method="GET" path={`${base}/api/aichixia?action=trending`} desc="Trending anime & manga" />
        <Row method="GET" path={`${base}/api/aichixia?category=anime&action=seasonal`} desc="Seasonal anime list" />
        <Row method="GET" path={`${base}/api/aichixia?action=airing`} desc="Airing schedule" />
        <Row method="GET" path={`${base}/api/aichixia?category=anime&action=recommendations`} desc="Recommendations" />
        <Row method="GET" path={`${base}/api/aichixia?category=manhwa&action=top-genre`} desc="Top by genre" />
        <Row method="GET" path={`${base}/api/aichixia?action=character`} desc="Character detail" />
        <Row method="GET" path={`${base}/api/aichixia?action=staff`} desc="Staff detail" />
      </section>

      {/* Chat Section */}
      <section style={{ marginBottom: 48 }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#38bdf8",
          }}
        >
          <FaComments />
          Chat
        </h2>
        <Row method="POST" path={`${base}/api/chat`} desc="AI-powered anime assistant" />
      </section>

      {/* Notes */}
      <section>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#38bdf8",
          }}
        >
          <FaStickyNote />
          Notes
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 1.75, color: "#94a3b8", paddingLeft: 24 }}>
          <li>AniList endpoints are public and don’t need an API key.</li>
          <li><CopyableCode text="GEMINI_API_KEY" /> is required for <CopyableCode text="/api/chat" />.</li>
          <li>Categories: <b>anime</b>, <b>manga</b>, <b>manhwa</b>, <b>manhua</b>, <b>ln</b>.</li>
        </ul>
      </section>

      <footer
        style={{
          marginTop: 64,
          textAlign: "center",
          color: "#64748b",
          fontSize: 14,
        }}
      >
        <FaTerminal style={{ verticalAlign: "middle", marginRight: 6 }} />
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
