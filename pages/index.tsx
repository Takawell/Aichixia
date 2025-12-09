import { useState, useEffect, useRef } from "react";
import {
  FaBookOpen,
  FaFilm,
  FaComments,
  FaStickyNote,
  FaTerminal,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaRocket,
  FaChevronRight,
  FaBrain,
  FaStar,
  FaBolt,
  FaServer,
  FaShieldAlt,
} from "react-icons/fa";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

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
      className="copyable-code-btn"
    >
      <div className="copyable-code-shine" />
      <code className="copyable-code-text">{text}</code>
      <div className="copyable-code-icon">
        {copied ? (
          <FaCheckCircle size={16} className="text-emerald-500 copyable-code-check" />
        ) : (
          <FaCopy size={16} className="copyable-code-copy" />
        )}
      </div>
    </button>
  );
};

const StatusBadge = ({ active, label }: { active: boolean; label: string }) => {
  return (
    <span
      className={`status-badge ${active ? "status-badge-active" : "status-badge-inactive"}`}
    >
      {active ? (
        <FaCheckCircle size={12} className="status-badge-icon" />
      ) : (
        <FaTimesCircle size={12} />
      )}{" "}
      {label}
    </span>
  );
};

const Row = ({
  method,
  path,
  desc,
  active = true,
  overrideLabel,
  index,
}: {
  method: string;
  path: string;
  desc: string;
  active?: boolean;
  overrideLabel?: string;
  index: number;
}) => {
  const [copied, setCopied] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  
  const copy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    if (rowRef.current) {
      rowRef.current.classList.add("row-pulse");
      setTimeout(() => {
        rowRef.current?.classList.remove("row-pulse");
      }, 300);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("row-slide-up");
          }
        });
      },
      { threshold: 0.1 }
    );
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      onClick={copy}
      style={{ animationDelay: `${index * 50}ms` }}
      className="api-row"
    >
      <div className="row-gradient-overlay" />
      <div className="row-glow" />    
      <div className="row-content">
        <div className="row-method-path">
          <span className="row-method">
            {method}
          </span>
          <span className="row-path">
            {path}
          </span>
        </div>
        <div className="row-status-copy">
          <StatusBadge active={active} label={overrideLabel ?? (active ? "Active" : "Inactive")} />
          <div className="copy-icon-wrapper">
            <div className="copy-icon-bg" />
            {copied ? (
              <FaCheckCircle className="copy-icon-success" size={18} />
            ) : (
              <FaCopy className="copy-icon-normal" size={18} />
            )}
          </div>
        </div>
      </div>
      <p className="row-description">
        {desc}
      </p>
    </div>
  );
};

const FloatingOrb = () => {
  return (
    <div className="floating-orb" />
  );
};

const StatsCard = ({ icon: Icon, value, label, color }: any) => {
  return (
    <div className="stats-card">
      <div className={`stats-icon ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
      <div className="stats-value">
        {value}
      </div>
      <div className="stats-label">
        {label}
      </div>
    </div>
  );
};

export default function Docs() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("header-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="docs-main">
      <FloatingOrb />
      <div className="docs-container">
        <div className="theme-toggle-wrapper">
          <div className="flex-1" />
          <div className="theme-toggle-spin">
            <ThemeToggle />
          </div>
        </div>

        <header ref={headerRef} className="docs-header">
          <div className="header-title-wrapper">
            <div className="header-icon">
              <FaBookOpen className="text-white" size={32} />
            </div>
            <h1 className="header-title">
              Aichixia API
            </h1>
          </div>
          <p className="header-subtitle">
            Centralized API for anime, manga, manhwa, manhua, and light novels. Powered by AniList database with multi-provider AI intelligence.
          </p>
          
          <div className="stats-grid">
            <StatsCard icon={FaBolt} value="99.9%" label="Uptime" color="stats-icon-green" />
            <StatsCard icon={FaServer} value="6" label="AI Providers" color="stats-icon-purple" />
            <StatsCard icon={FaShieldAlt} value="Free" label="No Auth" color="stats-icon-amber" />
          </div>
          
          <div className="header-buttons">
            <Link
              href="/chat"
              className="chat-button"
            >
              <div className="button-shine" />
              <FaComments size={24} className="button-icon" />
              <span className="button-text">Try AI Chat</span>
              <FaChevronRight className="button-chevron" size={16} />
            </Link>
            
            <a
              href="#endpoints"
              className="explore-button"
            >
              <FaRocket size={20} className="explore-icon" />
              <span className="explore-text">Explore API</span>
            </a>
          </div>
        </header>

        <section id="endpoints" className="endpoints-section">
          <div className="section-header">
            <div className="section-icon-blue">
              <FaFilm className="text-white" size={28} />
            </div>
            <h2 className="section-title">
              API Endpoints
            </h2>
          </div>

          <div className="endpoints-list">
            {[
              { method: "GET", path: `${base}/api/aichixia?category=anime&action=search&query={text}`, desc: "Search anime (requires query)" },
              { method: "GET", path: `${base}/api/aichixia?category=manga&action=search&query={text}`, desc: "Search manga (requires query)" },
              { method: "GET", path: `${base}/api/aichixia?category=manhwa&action=search&query={text}`, desc: "Search manhwa (requires query)" },
              { method: "GET", path: `${base}/api/aichixia?category=manhua&action=search&query={text}`, desc: "Search manhua (requires query)" },
              { method: "GET", path: `${base}/api/aichixia?category=ln&action=search&query={text}`, desc: "Search light novels (requires query)" },
              { method: "GET", path: `${base}/api/aichixia?category=anime&action=detail&id={value}`, desc: "Media detail by ID (requires id)" },
              { method: "GET", path: `${base}/api/aichixia?action=trending`, desc: "Trending anime & manga" },
              { method: "GET", path: `${base}/api/aichixia?category=anime&action=seasonal`, desc: "Seasonal anime list" },
              { method: "GET", path: `${base}/api/aichixia?action=airing`, desc: "Airing schedule" },
              { method: "GET", path: `${base}/api/aichixia?category=anime&action=recommendations&id={value}`, desc: "Recommendations (requires id)" },
              { method: "GET", path: `${base}/api/aichixia?category=manhwa&action=top-genre&genre={name}`, desc: "Top by genre (requires genre)" },
              { method: "GET", path: `${base}/api/aichixia?action=character&id={value}`, desc: "Character detail (requires id)" },
              { method: "GET", path: `${base}/api/aichixia?action=staff&id={value}`, desc: "Staff detail (requires id)", active: false, overrideLabel: "Maintenance" },
            ].map((endpoint, index) => (
              <Row key={index} {...endpoint} index={index} />
            ))}
          </div>
        </section>

        <section className="ai-chat-section">
          <div className="section-header">
            <div className="section-icon-purple">
              <FaComments className="text-white" size={28} />
            </div>
            <h2 className="section-title">
              AI Chat
            </h2>
          </div>
          <Row
            method="POST"
            path={`${base}/api/chat`}
            desc="AI assistant with multi-provider fallback (OpenAI → Gemini → Deepseek → Qwen → GPT-OSS → Llama)"
            index={13}
          />
          
          <div className="ai-providers-card">
            <h3 className="ai-providers-title">
              <FaBrain size={20} className="ai-brain-icon" />
              AI Provider Chain
            </h3>
            <div className="providers-chain">
              {["OpenAI", "Gemini", "Deepseek", "Qwen", "GPT-OSS", "Llama"].map((provider, i) => (
                <div key={provider} className="provider-item">
                  <span
                    style={{ animationDelay: `${i * 200}ms` }}
                    className="provider-badge"
                  >
                    {provider}
                  </span>
                  {i < 5 && (
                    <FaChevronRight className="provider-chevron" size={12} />
                  )}
                </div>
              ))}
            </div>
            <p className="ai-providers-desc">
              Automatic fallback ensures 99.9% uptime with intelligent provider switching on rate limits or quota exhaustion
            </p>
          </div>
        </section>

        <section className="notes-section">
          <div className="section-header">
            <div className="section-icon-amber">
              <FaStickyNote className="text-white" size={24} />
            </div>
            <h2 className="section-title">
              Important Notes
            </h2>
          </div>
          <div className="notes-card">
            <ul className="notes-list">
              <li className="notes-item">
                <div className="notes-bullet-blue">
                  <FaStar className="text-white" size={12} />
                </div>
                <div>
                  <strong className="notes-heading">Categories:</strong>
                  <div className="categories-list">
                    {["anime", "manga", "manhwa", "manhua", "ln"].map((cat) => (
                      <span
                        key={cat}
                        className="category-tag"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
              <li className="notes-item">
                <div className="notes-bullet-purple">
                  <FaStar className="text-white" size={12} />
                </div>
                <div>
                  <strong className="notes-heading">Required Parameters:</strong>
                  <div className="params-grid">
                    <div className="param-card">
                      <code className="param-code param-code-blue">id</code>
                      <p className="param-desc">for detail, character, staff, recommendations</p>
                    </div>
                    <div className="param-card">
                      <code className="param-code param-code-green">query</code>
                      <p className="param-desc">for search operations</p>
                    </div>
                    <div className="param-card">
                      <code className="param-code param-code-amber">genre</code>
                      <p className="param-desc">for top-genre filtering</p>
                    </div>
                  </div>
                </div>
              </li>
              <li className="notes-item">
                <div className="notes-bullet-green">
                  <FaStar className="text-white" size={12} />
                </div>
                <div className="notes-content-full">
                  <strong className="notes-heading">Chat Persona:</strong>
                  <p className="notes-text">
                    Default is tsundere, or send custom persona in POST body
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <footer className="docs-footer">
          <div className="footer-content">
            <div className="footer-copyright">
              <FaTerminal size={20} className="footer-icon" />
              <span className="footer-text">© {new Date().getFullYear()} Aichixia - Anime-first AI Assistant</span>
            </div>
            <p className="footer-signature">
              BY TAKAWELL
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
