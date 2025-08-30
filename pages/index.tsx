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

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => (
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
      boxShadow: active ? "0 0 8px #4caf50aa" : "0 0 8px #ef5350aa",
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
      <div style={{ fontSize: 15, lineHeight: 1.5, color: "#37474f" }}>
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
          Centralized API for anime, manga, manhwa, manhua, and light novels.
          Fully powered by AniList + Gemini AI. No extra backend needed.
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
          AniList endpoints don’t require API keys. For AI chat, set{" "}
          <CopyableCode text="GEMINI_API_KEY" /> in{" "}
          <b>Vercel Project Settings → Environment Variables</b>.
        </p>
      </section>

      {/* AniList Section */}
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
          }}
        >
          <FaFilm />
          AniList Endpoints
        </h2>
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=anime&action=search&search=naruto`}
          desc="Search anime by title"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=manga&action=search&search=one piece`}
          desc="Search manga by title"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=manhwa&action=search&search=solo leveling`}
          desc="Search manhwa by title"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=manhua&action=search&search=the kings avatar`}
          desc="Search manhua by title"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=ln&action=search&search=overlord`}
          desc="Search light novels by title"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=anime&action=detail&id=1`}
          desc="Get media detail by ID"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?action=trending`}
          desc="Trending anime & manga"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=anime&action=seasonal&season=SPRING&year=2025`}
          desc="Seasonal anime list"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?action=airing`}
          desc="Airing schedule"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=anime&action=recommendations&id=1`}
          desc="Recommendations by media ID"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?category=manhwa&action=top-genre&genre=Action`}
          desc="Top titles by genre"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?action=character&id=1`}
          desc="Character detail by ID"
          active
        />
        <Row
          method="GET"
          path={`${base}/api/aichixia?action=staff&id=1`}
          desc="Staff detail by ID"
          active
        />
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
          }}
        >
          <FaComments />
          Chat
        </h2>
        <Row
          method="POST"
          path={`${base}/api/chat`}
          desc="AI-powered chat (routes automatically to AniList or Gemini)"
          active
        />
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
          }}
        >
          <FaStickyNote />
          Notes
        </h2>
        <ul
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            color: "#455a64",
            paddingLeft: 24,
          }}
        >
          <li>
            All AniList endpoints are public and don’t need an API key.
          </li>
          <li>
            <CopyableCode text="GEMINI_API_KEY" /> is required for{" "}
            <CopyableCode text="/api/chat" />.
          </li>
          <li>
            Categories: <b>anime</b>, <b>manga</b>, <b>manhwa</b>,{" "}
            <b>manhua</b>, <b>ln</b> (light novel).
          </li>
        </ul>
      </section>

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
