import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { FaSearch, FaCopy, FaCheck, FaChevronDown, FaChevronRight, FaTerminal, FaBolt, FaStar, FaBook, FaMoon, FaSun, FaBars, FaTimes, FaKey, FaServer, FaGlobe, FaMicrophone, FaImage, FaCode, FaShieldAlt, FaClock, FaCheckCircle, FaRocket, FaLayerGroup, FaDatabase, FaPlay } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://www.aichixia.xyz";

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif' " },
  header: { position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
  headerInner: { maxWidth: 1280, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 },
  logo: { display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' },
  logoIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 },
  nav: { display: 'flex', alignItems: 'center', gap: 2 },
  navLink: { padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all 150ms' },
  heroSection: { borderBottom: '1px solid', position: 'relative', overflow: 'hidden' },
  heroInner: { maxWidth: 1280, margin: '0 auto', padding: '56px 16px 48px', textAlign: 'center' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, border: '1px solid', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 20 },
  h1: { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' },
  heroDesc: { fontSize: 'clamp(13px, 2vw, 16px)', maxWidth: 520, margin: '0 auto 20px', lineHeight: 1.65 },
  pills: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' as const },
  pill: { display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, border: '1px solid', fontSize: 11, fontWeight: 500 },
  dot: { width: 6, height: 6, borderRadius: '50%' },
  body: { maxWidth: 1280, margin: '0 auto', padding: '32px 16px 0', display: 'flex', gap: 28 },
  aside: { width: 220, flexShrink: 0 },
  asideSticky: { position: 'sticky', top: 68 },
  sideLabel: { padding: '0 10px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
  sideBtn: { width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', textAlign: 'left' as const, transition: 'all 150ms' },
  sideDivider: { height: 1, margin: '10px 0' },
  sideLink: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'all 150ms' },
  main: { flex: 1, minWidth: 0, paddingBottom: 80 },
  section: { marginBottom: 6 },
  sectionTitle: { fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px' },
  sectionDesc: { fontSize: 14, lineHeight: 1.65, margin: '0 0 24px' },
  endpointBox: { padding: '14px 18px', borderRadius: 12, border: '1px solid', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 },
  card: { padding: '16px', borderRadius: 12, border: '1px solid' },
  cardIcon: { marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 4px' },
  cardDesc: { fontSize: 12, lineHeight: 1.55, margin: 0 },
  codeBlock: { borderRadius: 12, border: '1px solid', marginBottom: 16, overflow: 'hidden' },
  codeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid' },
  codeTitle: { fontSize: 13, fontWeight: 600 },
  copyBtn: { display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: '1px solid', background: 'transparent', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 150ms' },
  accordion: { borderRadius: 12, border: '1px solid', marginBottom: 10, overflow: 'hidden' },
  accordionBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const },
  accordionTitle: { fontSize: 14, fontWeight: 600 },
  accordionBody: { padding: '0 18px 18px' },
  paramRow: { display: 'flex', flexDirection: 'column' as const, gap: 3, padding: '10px 0', borderBottom: '1px solid' },
  paramName: { display: 'flex', alignItems: 'center', gap: 6 },
  tag: { fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const },
  inlineCode: { fontSize: 11, padding: '3px 8px', borderRadius: 5, fontFamily: 'monospace', fontWeight: 600 },
  footer: { borderTop: '1px solid', marginTop: 64 },
  footerInner: { maxWidth: 1280, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 14 },
  footerLinks: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const, justifyContent: 'center' },
  mobileMenu: { borderTop: '1px solid' },
  mobileNav: { display: 'flex', flexDirection: 'column' as const, padding: 8, gap: 2 },
  mobileLink: { padding: '9px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all 150ms' },
};

export default function Docs() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'models' | 'quickstart'>('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('chat-completions');

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDark(theme ? theme === 'dark' : true);
  }, []);

  const toggleTheme = () => {
    const n = !isDark;
    setIsDark(n);
    localStorage.setItem('theme', n ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const c = {
    bg: isDark ? '#0a0a0b' : '#ffffff',
    bgSub: isDark ? '#111113' : '#f8f8fa',
    bgCard: isDark ? '#141416' : '#ffffff',
    bgHover: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
    borderHover: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)',
    text: isDark ? 'rgba(255,255,255,0.92)' : '#0f0f10',
    textSub: isDark ? 'rgba(255,255,255,0.5)' : '#6b7280',
    textMuted: isDark ? 'rgba(255,255,255,0.28)' : '#9ca3af',
    accent: '#38bdf8',
    accentSub: isDark ? 'rgba(56,189,248,0.08)' : 'rgba(56,189,248,0.06)',
    accentBorder: isDark ? 'rgba(56,189,248,0.18)' : 'rgba(56,189,248,0.25)',
    accentText: isDark ? '#7dd3fc' : '#0284c7',
    blue: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)',
    blueBorder: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.25)',
    blueText: isDark ? '#93c5fd' : '#1d4ed8',
    purple: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.06)',
    purpleBorder: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.25)',
    purpleText: isDark ? '#c4b5fd' : '#6d28d9',
    green: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.06)',
    greenBorder: isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.22)',
    greenText: isDark ? '#86efac' : '#15803d',
    pink: isDark ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.06)',
    pinkBorder: isDark ? 'rgba(236,72,153,0.18)' : 'rgba(236,72,153,0.22)',
    pinkText: isDark ? '#f9a8d4' : '#be185d',
    red: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
    redText: isDark ? '#fca5a5' : '#b91c1c',
    codeHeaderBg: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    codeBg: isDark ? '#0d0d0f' : '#f4f4f6',
    headerBg: isDark ? 'rgba(10,10,11,0.85)' : 'rgba(255,255,255,0.85)',
  };

  const codeExamples = {
    chatCompletionsJS: `const response = await fetch('${base}/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'claude-opus-4.5',
    messages: [
      { role: 'user', content: 'Explain quantum computing' }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`,
    chatCompletionsPython: `import requests

response = requests.post(
    '${base}/api/v1/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'model': 'claude-opus-4.5',
        'messages': [
            {'role': 'user', 'content': 'Explain quantum computing'}
        ],
        'temperature': 0.7,
        'max_tokens': 1000
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`,
    modelsListJS: `const response = await fetch('${base}/api/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const models = await response.json();
console.log(models.data);`,
    modelsListPython: `import requests

response = requests.get(
    '${base}/api/v1/models',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

models = response.json()
print(models['data'])`,
    imageGenerationJS: `const response = await fetch('${base}/api/models/flux', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prompt: 'A serene landscape with mountains',
    steps: 4
  })
});

const data = await response.json();
console.log(data.imageBase64);`,
    voiceGenerationJS: `const response = await fetch('${base}/api/models/starling', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    text: 'Hello, this is a text to speech demo',
    emotion: 'neutral',
    volume: 100,
    pitch: 0,
    tempo: 1
  })
});

const data = await response.json();
console.log(data.audio);`,
    chatCompletionsOpenAI: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${base}/api/v1",
)

response = client.chat.completions.create(
    model="claude-opus-4.5",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    temperature=0.7,
    max_tokens=1000,
)

print(response.choices[0].message.content)`,
    streamingJS: `const response = await fetch('${base}/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-5-mini',
    messages: [{ role: 'user', content: 'Tell me a story' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n').filter(line => line.trim());
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const parsed = JSON.parse(data);
      const content = parsed.choices[0]?.delta?.content;
      if (content) process.stdout.write(content);
    }
  }
}`
  };

  const CodeBlock = ({ code, lang, id, title }: { code: string; lang: string; id: string; title: string }) => (
    <div style={{ ...s.codeBlock, border: `1px solid ${c.border}`, background: c.bgCard, marginBottom: 16 }}>
      <div style={{ ...s.codeHeader, borderBottom: `1px solid ${c.border}`, background: c.codeHeaderBg }}>
        <span style={{ ...s.codeTitle, color: c.text }}>{title}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          style={{
            ...s.copyBtn,
            border: `1px solid ${c.border}`,
            color: copiedCode === id ? c.greenText : c.textSub,
            background: copiedCode === id ? c.green : 'transparent',
          }}
        >
          {copiedCode === id
            ? <><FaCheck size={9} /><span>Copied</span></>
            : <><FaCopy size={9} /><span>Copy</span></>}
        </button>
      </div>
      <div style={{ background: c.codeBg }}>
        <SyntaxHighlighter
          language={lang}
          style={isDark ? oneDark : oneLight}
          customStyle={{ margin: 0, padding: '14px', background: 'transparent', fontSize: '12px', lineHeight: 1.6 }}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );

  const Accordion = ({ id, title, icon, children }: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) => {
    const open = expandedSection === id;
    return (
      <div style={{ ...s.accordion, border: `1px solid ${open ? c.accentBorder : c.border}`, background: c.bgCard, transition: 'border-color 200ms', marginBottom: 10 }}>
        <button
          onClick={() => toggleSection(id)}
          style={{ ...s.accordionBtn, borderBottom: open ? `1px solid ${c.border}` : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && <span style={{ color: c.textMuted }}>{icon}</span>}
            <span style={{ ...s.accordionTitle, color: c.text }}>{title}</span>
          </div>
          <FaChevronRight
            size={12}
            style={{ color: c.textMuted, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}
          />
        </button>
        {open && <div style={s.accordionBody}>{children}</div>}
      </div>
    );
  };

  const SideTab = ({ tab, icon, label }: { tab: 'quickstart' | 'chat' | 'models'; icon: React.ReactNode; label: string }) => {
    const active = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        style={{
          ...s.sideBtn,
          background: active ? c.accentSub : 'transparent',
          color: active ? c.accentText : c.textSub,
          border: `1px solid ${active ? c.accentBorder : 'transparent'}`,
        }}
      >
        <span style={{ color: active ? c.accent : c.textMuted, flexShrink: 0 }}>{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <>
      <Head>
        <title>API Documentation - Aichixia Developer Docs</title>
        <meta name="description" content="Complete API reference for Aichixia. Learn how to integrate text models, image generation, voice synthesis, and more." />
      </Head>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pulse-dot { animation: pulseDot 2s infinite; }
        @media (max-width: 900px) {
          .docs-aside { display: none !important; }
          .docs-mobile-tabs { display: flex !important; }
        }
        @media (min-width: 901px) {
          .docs-mobile-tabs { display: none !important; }
          .mobile-header-btn { display: none !important; }
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
        }
      `}} />

      <main style={{ ...s.page, background: c.bg, color: c.text }}>
        <header style={{ ...s.header, borderColor: c.border, background: c.headerBg }}>
          <div style={s.headerInner}>
            <Link href="/" style={s.logo}>
              <span style={{ ...s.logoIcon }}>
                <FaTerminal size={16} style={{ color: c.accent }} />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: c.text, letterSpacing: '-0.02em', lineHeight: 1 }}>Aichixia</div>
                <div style={{ fontSize: 10, color: c.textMuted, marginTop: 1, letterSpacing: '0.02em' }}>API Docs</div>
              </div>
            </Link>

            <nav className="desktop-nav" style={s.nav}>
              {[{ href: '/', label: 'Home' }, { href: '/console', label: 'Console' }].map(({ href, label }) => (
                <Link key={href} href={href} style={{ ...s.navLink, color: c.textSub, background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = c.text; (e.currentTarget as HTMLAnchorElement).style.background = c.bgHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = c.textSub; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                >
                  {label}
                </Link>
              ))}
              <div style={{ width: 1, height: 16, background: c.border, margin: '0 4px' }} />
              <Link href="/console" style={{ ...s.navLink, color: '#fff', background: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FaKey size={10} />
                Get API Key
              </Link>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={toggleTheme} style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', color: c.textSub, cursor: 'pointer', display: 'flex' }}>
                {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
              </button>
              <button
                className="mobile-header-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', color: c.textSub, cursor: 'pointer', display: 'flex' }}
              >
                {mobileMenuOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div style={{ ...s.mobileMenu, borderColor: c.border, background: c.bg }}>
              <nav style={s.mobileNav}>
                {[{ href: '/', label: 'Home' }, { href: '/console', label: 'Console' }].map(({ href, label }) => (
                  <Link key={href} href={href} style={{ ...s.mobileLink, color: c.textSub }} onClick={() => setMobileMenuOpen(false)}>{label}</Link>
                ))}
              </nav>
            </div>
          )}
        </header>

        <section style={{ ...s.heroSection, borderColor: c.border, background: isDark ? 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(56,189,248,0.07) 0%, transparent 70%)' : 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(56,189,248,0.08) 0%, transparent 70%)' }}>
          <div style={s.heroInner} className="fade-up">
            <div style={{ ...s.badge, background: c.accentSub, borderColor: c.accentBorder, color: c.accentText }}>
              <FaBook size={10} />
              Technical Documentation
            </div>
            <h1 style={{ ...s.h1, color: c.text }}>
              API{' '}
              <span style={{ background: `linear-gradient(135deg, ${c.accent}, #818cf8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Reference
              </span>
            </h1>
            <p style={{ ...s.heroDesc, color: c.textSub }}>
              Complete guide to integrating Aichixia's AI models. Chat, images, voice, and more—all through one unified API.
            </p>
            <div style={s.pills}>
              <div style={{ ...s.pill, border: `1px solid ${c.border}`, background: c.bgCard, color: c.textSub }}>
                <span className="pulse-dot" style={{ ...s.dot, background: '#22c55e' }} />
                OpenAI Compatible
              </div>
              <div style={{ ...s.pill, border: `1px solid ${c.border}`, background: c.bgCard, color: c.textSub }}>
                <span style={{ ...s.dot, background: c.accent }} />
                20+ Models
              </div>
              <div style={{ ...s.pill, border: `1px solid ${c.border}`, background: c.bgCard, color: c.textSub }}>
                <span style={{ ...s.dot, background: '#a78bfa' }} />
                Streaming SSE
              </div>
            </div>
          </div>
        </section>

        <div style={s.body}>
          <aside className="docs-aside" style={s.aside}>
            <div style={s.asideSticky}>
              <div style={{ marginBottom: 4 }}>
                <div style={{ ...s.sideLabel, color: c.textMuted }}>Documentation</div>
                <SideTab tab="quickstart" icon={<FaRocket size={12} />} label="Quick Start" />
                <SideTab tab="chat" icon={<FaTerminal size={12} />} label="Chat Completions" />
                <SideTab tab="models" icon={<FaLayerGroup size={12} />} label="Models & Media" />
              </div>
              <div style={{ ...s.sideDivider, background: c.border }} />
              <div>
                <div style={{ ...s.sideLabel, color: c.textMuted }}>Resources</div>
                {[
                  { href: '/console?tab=playground', icon: <FaPlay size={11} />, label: 'Playground' },
                  { href: '/console?tab=models', icon: <FaDatabase size={11} />, label: 'Model List' },
                ].map(({ href, icon, label }) => (
                  <Link key={href} href={href} style={{ ...s.sideLink, color: c.textMuted }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = c.text; (e.currentTarget as HTMLAnchorElement).style.background = c.bgHover; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = c.textMuted; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                  >
                    <span style={{ flexShrink: 0 }}>{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div style={s.main}>
            <div className="docs-mobile-tabs" style={{ display: 'none', gap: 6, marginBottom: 20, overflowX: 'auto' as const, paddingBottom: 2 }}>
              {([
                { tab: 'quickstart', icon: <FaRocket size={11} />, label: 'Quick Start' },
                { tab: 'chat', icon: <FaTerminal size={11} />, label: 'Chat' },
                { tab: 'models', icon: <FaLayerGroup size={11} />, label: 'Models' },
              ] as { tab: 'quickstart' | 'chat' | 'models'; icon: React.ReactNode; label: string }[]).map(({ tab, icon, label }) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                      borderRadius: 8, border: `1px solid ${active ? c.accentBorder : c.border}`,
                      background: active ? c.accentSub : c.bgCard,
                      color: active ? c.accentText : c.textSub,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: active ? c.accent : c.textMuted }}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'quickstart' && (
              <div className="fade-up">
                <div style={s.section}>
                  <h2 style={{ ...s.sectionTitle, color: c.text }}>Getting Started</h2>
                  <p style={{ ...s.sectionDesc, color: c.textSub }}>
                    Get your API key and start building in under 60 seconds. All endpoints are OpenAI-compatible.
                  </p>
                </div>

                <div style={s.grid3}>
                  {[
                    { icon: <FaKey size={14} style={{ color: c.blueText }} />, title: '1. Get API Key', desc: 'Sign up and generate your free API key from the console', accent: c.blue, border: c.blueBorder },
                    { icon: <FaCode size={14} style={{ color: c.purpleText }} />, title: '2. Make Request', desc: 'Use any OpenAI SDK or HTTP client to call our API', accent: c.purple, border: c.purpleBorder },
                    { icon: <FaCheckCircle size={14} style={{ color: c.greenText }} />, title: '3. Ship Fast', desc: 'Deploy your AI features with confidence and scale', accent: c.green, border: c.greenBorder },
                  ].map(({ icon, title, desc, accent, border }) => (
                    <div key={title} style={{ ...s.card, background: accent, border: `1px solid ${border}` }}>
                      <div style={s.cardIcon}>{icon}</div>
                      <div style={{ ...s.cardTitle, color: c.text }}>{title}</div>
                      <div style={{ ...s.cardDesc, color: c.textSub }}>{desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ ...s.codeBlock, border: `1px solid ${c.border}`, background: c.bgCard }}>
                  <div style={{ ...s.codeHeader, borderBottom: `1px solid ${c.border}`, background: c.codeHeaderBg }}>
                    <span style={{ ...s.codeTitle, color: c.text }}>Installation</span>
                    <button
                      onClick={() => copyToClipboard('npm install openai', 'install')}
                      style={{ ...s.copyBtn, border: `1px solid ${c.border}`, color: copiedCode === 'install' ? c.greenText : c.textSub }}
                    >
                      {copiedCode === 'install' ? <><FaCheck size={9} /><span>Copied</span></> : <><FaCopy size={9} /><span>Copy</span></>}
                    </button>
                  </div>
                  <div style={{ padding: '12px 14px', background: c.codeBg }}>
                    <code style={{ fontSize: 13, fontFamily: 'monospace', color: c.text }}>npm install openai</code>
                  </div>
                </div>

                <CodeBlock code={codeExamples.chatCompletionsJS} lang="javascript" id="quickstart-js" title="First Request (JavaScript)" />
                <CodeBlock code={codeExamples.chatCompletionsOpenAI} lang="python" id="quickstart-openai" title="Using OpenAI SDK (Python)" />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="fade-up">
                <div style={s.section}>
                  <h2 style={{ ...s.sectionTitle, color: c.text }}>Chat Completions API</h2>
                  <p style={{ ...s.sectionDesc, color: c.textSub }}>
                    Generate text responses using state-of-the-art language models. OpenAI-compatible endpoint for seamless integration.
                  </p>
                </div>

                <div style={{ ...s.endpointBox, background: c.blue, borderColor: c.blueBorder }}>
                  <FaBolt size={14} style={{ color: c.blueText, marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.blueText, marginBottom: 5 }}>Endpoint</div>
                    <code style={{ ...s.inlineCode, background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', color: c.blueText }}>
                      POST {base}/api/v1/chat/completions
                    </code>
                  </div>
                </div>

                <Accordion id="chat-request" title="Request Body" icon={<FaCode size={12} />}>
                  <div style={{ paddingTop: 8 }}>
                    {[
                      { name: 'model', required: true, desc: 'Model ID to use (e.g., claude-opus-4.5, gpt-5-mini, deepseek-v3.2)' },
                      { name: 'messages', required: true, desc: 'Array of message objects with role (system/user/assistant) and content' },
                      { name: 'temperature', required: false, desc: 'Sampling temperature (0–2). Higher = more creative. Default: 1' },
                      { name: 'max_tokens', required: false, desc: "Maximum tokens to generate. Default: model's max" },
                      { name: 'stream', required: false, desc: 'Enable streaming responses via SSE. Default: false' },
                      { name: 'top_p', required: false, desc: 'Nucleus sampling (0–1). Alternative to temperature' },
                    ].map(({ name, required, desc }, i, arr) => (
                      <div key={name} style={{ ...s.paramRow, borderColor: i < arr.length - 1 ? c.border : 'transparent' }}>
                        <div style={s.paramName}>
                          <code style={{ ...s.inlineCode, background: c.blue, color: c.blueText, padding: '2px 7px' }}>{name}</code>
                          {required && <span style={{ ...s.tag, background: c.red, color: c.redText }}>required</span>}
                        </div>
                        <p style={{ fontSize: 12, color: c.textSub, margin: 0, lineHeight: 1.6 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </Accordion>

                <Accordion id="chat-response" title="Response Format" icon={<FaServer size={12} />}>
                  <div style={{ paddingTop: 10 }}>
                    <div style={{ borderRadius: 8, overflow: 'hidden', background: c.codeBg }}>
                      <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight}
                        customStyle={{ margin: 0, padding: '14px', background: 'transparent', fontSize: '12px' }}>
{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "claude-opus-4.5",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Your response here..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}`}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </Accordion>

                <div style={{ height: 8 }} />
                <CodeBlock code={codeExamples.chatCompletionsJS} lang="javascript" id="chat-js" title="JavaScript Example" />
                <CodeBlock code={codeExamples.chatCompletionsPython} lang="python" id="chat-python" title="Python Example" />
                <CodeBlock code={codeExamples.streamingJS} lang="javascript" id="streaming" title="Streaming Example" />
              </div>
            )}

            {activeTab === 'models' && (
              <div className="fade-up">
                <div style={s.section}>
                  <h2 style={{ ...s.sectionTitle, color: c.text }}>Models & Media API</h2>
                  <p style={{ ...s.sectionDesc, color: c.textSub }}>
                    List available models and generate images, voice, and other media types.
                  </p>
                </div>

                <div style={{ ...s.endpointBox, background: c.purple, borderColor: c.purpleBorder }}>
                  <FaLayerGroup size={14} style={{ color: c.purpleText, marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.purpleText, marginBottom: 5 }}>List Models Endpoint</div>
                    <code style={{ ...s.inlineCode, background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)', color: c.purpleText }}>
                      GET {base}/api/v1/models
                    </code>
                    <p style={{ fontSize: 12, color: c.purpleText, margin: '8px 0 0', opacity: 0.75 }}>
                      Returns all available models including text, image, voice, and multimodal models.
                    </p>
                  </div>
                </div>

                <div style={s.grid2}>
                  <div style={{ ...s.card, background: c.pink, border: `1px solid ${c.pinkBorder}` }}>
                    <div style={s.cardIcon}><FaImage size={14} style={{ color: c.pinkText }} /></div>
                    <div style={{ ...s.cardTitle, color: c.text }}>Image Generation</div>
                    <p style={{ ...s.cardDesc, color: c.textSub, marginBottom: 10 }}>Generate images from text prompts using Flux 2 and other models</p>
                    <code style={{ ...s.inlineCode, background: isDark ? 'rgba(236,72,153,0.1)' : 'rgba(236,72,153,0.07)', color: c.pinkText }}>POST /api/models/{'{name}'}</code>
                  </div>
                  <div style={{ ...s.card, background: c.green, border: `1px solid ${c.greenBorder}` }}>
                    <div style={s.cardIcon}><FaMicrophone size={14} style={{ color: c.greenText }} /></div>
                    <div style={{ ...s.cardTitle, color: c.text }}>Voice Synthesis</div>
                    <p style={{ ...s.cardDesc, color: c.textSub, marginBottom: 10 }}>Convert text to natural-sounding speech in multiple voices</p>
                    <code style={{ ...s.inlineCode, background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.07)', color: c.greenText }}>POST /api/models/{'{name}'}</code>
                  </div>
                </div>

                <CodeBlock code={codeExamples.modelsListJS} lang="javascript" id="models-js" title="List Models (JavaScript)" />

                <div style={{ ...s.codeBlock, border: `1px solid ${c.border}`, background: c.bgCard }}>
                  <div style={{ ...s.codeHeader, borderBottom: `1px solid ${c.border}`, background: c.codeHeaderBg }}>
                    <span style={{ ...s.codeTitle, color: c.text }}>Response Format</span>
                  </div>
                  <div style={{ background: c.codeBg }}>
                    <SyntaxHighlighter language="json" style={isDark ? oneDark : oneLight}
                      customStyle={{ margin: 0, padding: '14px', background: 'transparent', fontSize: '12px' }}>
{`{
  "object": "list",
  "data": [
    {
      "id": "claude-opus-4.5",
      "object": "model",
      "created": 1677610602,
      "owned_by": "anthropic",
      "capabilities": ["chat", "multimodal"]
    },
    {
      "id": "flux",
      "object": "model",
      "created": 1698785189,
      "owned_by": "black forest",
      "capabilities": ["image-generation"]
    },
    {
      "id": "starling",
      "object": "model",
      "created": 1699053241,
      "owned_by": "typecast",
      "capabilities": ["text-to-speech"]
    }
  ]
}`}
                    </SyntaxHighlighter>
                  </div>
                </div>

                <CodeBlock code={codeExamples.imageGenerationJS} lang="javascript" id="image-gen" title="Image Generation Example" />
                <CodeBlock code={codeExamples.voiceGenerationJS} lang="javascript" id="voice-gen" title="Voice Synthesis Example" />

                <Accordion id="tts-params" title="TTS Request Parameters" icon={<FaMicrophone size={12} />}>
                  <div style={{ paddingTop: 8 }}>
                    {[
                      { name: 'text', required: true, desc: 'The text to convert to speech' },
                      { name: 'emotion', required: false, desc: 'Emotional tone — neutral, happy, sad, angry, fearful. Default: neutral' },
                      { name: 'volume', required: false, desc: 'Output volume 0–100. Default: 100' },
                      { name: 'pitch', required: false, desc: 'Pitch adjustment. Default: 0' },
                      { name: 'tempo', required: false, desc: 'Speech speed multiplier. Default: 1.0' },
                    ].map(({ name, required, desc }, i, arr) => (
                      <div key={name} style={{ ...s.paramRow, borderColor: i < arr.length - 1 ? c.border : 'transparent' }}>
                        <div style={s.paramName}>
                          <code style={{ ...s.inlineCode, background: c.green, color: c.greenText, padding: '2px 7px' }}>{name}</code>
                          {required && <span style={{ ...s.tag, background: c.red, color: c.redText }}>required</span>}
                        </div>
                        <p style={{ fontSize: 12, color: c.textSub, margin: 0, lineHeight: 1.6 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </Accordion>
              </div>
            )}
          </div>
        </div>

        <footer style={{ ...s.footer, borderColor: c.border, background: c.bg }}>
          <div style={s.footerInner}>
            <Link href="/" style={{ ...s.logo, textDecoration: 'none' }}>
              <FaTerminal size={16} style={{ color: c.accent }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: c.text, letterSpacing: '-0.02em' }}>Aichixia</div>
                <div style={{ fontSize: 10, color: c.textMuted }}>AI API Platform</div>
              </div>
            </Link>
            <p style={{ fontSize: 12, color: c.textMuted, margin: 0 }}>
              © {new Date().getFullYear()} Aichixia. All rights reserved.
            </p>
            <div style={s.footerLinks}>
              {[
                { href: 'mailto:contact@aichixia.xyz', label: 'Contact', external: true },
                { href: '/privacy', label: 'Privacy', external: false },
                { href: '/terms', label: 'Terms', external: false },
                { href: '/security', label: 'Security', external: false },
              ].map(({ href, label, external }, i, arr) => (
                <span key={href} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {external
                    ? <a href={href} style={{ fontSize: 12, color: c.textMuted, textDecoration: 'none' }}>{label}</a>
                    : <Link href={href} style={{ fontSize: 12, color: c.textMuted, textDecoration: 'none' }}>{label}</Link>
                  }
                  {i < arr.length - 1 && <span style={{ color: c.border }}>·</span>}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
