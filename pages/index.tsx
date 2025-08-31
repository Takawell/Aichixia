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
        background: "#f1f5f9",
        color: "#0284c7",
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
        border: "1px solid #e2e8f0",
        padding: 20,
        borderRadius: 14,
        marginBottom: 20,
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        color: "#334155",
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
              background: "#f1f5f9",
              fontSize: 14,
              color: "#0284c7",
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
      <div style={{ fontSize: 15, lineHeight: 1.5, color: "#64748b" }}>
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
        background: "#f9fafb",
        color: "#334155",
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
            color: "#0284c7",
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
            color: "#64748b",
            fontSize: 18,
            maxWidth: 700,
            margin: "12px auto 0",
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          Centralized API for anime, manga, manhwa, manhua, and light novels.  
          Powered by AniList + Gemini AI.
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
            color: "#0284c7",
          }}
        >
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
        <Row method="GET" path={`${base}/api/aichixia?action=staff&id={value}`} desc="Staff detail (requires id)" />
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
            color: "#0284c7",
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
            color: "#0284c7",
          }}
        >
          <FaStickyNote />
          Notes
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 1.75, color: "#475569", paddingLeft: 24 }}>
          <li>Categories: <b>anime</b>, <b>manga</b>, <b>manhwa</b>, <b>manhua</b>, <b>ln</b>.</li>
          <li><b>Required parameters:</b>  
            <ul>
              <li><code>id</code> → for <b>detail</b>, <b>character</b>, <b>staff</b>, <b>recommendations</b></li>
              <li><code>query</code> → for <b>search</b></li>
              <li><code>genre</code> → for <b>top-genre</b></li>
            </ul>
          </li>
        </ul>
      </section>

      <footer
        style={{
          marginTop: 64,
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        <FaTerminal style={{ verticalAlign: "middle", marginRight: 6 }} />
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
