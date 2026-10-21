import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FaTerminal, FaBars, FaTimes, FaCheck, FaChevronDown, FaArrowRight,
  FaShieldAlt, FaLock, FaFingerprint, FaUserShield, FaNetworkWired,
  FaSyncAlt, FaCodeBranch, FaEnvelope,
} from 'react-icons/fa';

const LAST_UPDATED = 'October 2026';

type Item = { heading: string; body: string };

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { href: '/playground', label: 'Playground' },
];

const TOC = [
  { id: 'overview', title: 'How we protect your data' },
  { id: 'handling', title: 'Data handling' },
  { id: 'lifecycle', title: 'Request lifecycle' },
  { id: 'access', title: 'Authentication and access' },
  { id: 'monitoring', title: 'Monitoring and incidents' },
  { id: 'compliance', title: 'Compliance' },
  { id: 'practices', title: 'Developer best practices' },
  { id: 'disclosure', title: 'Responsible disclosure' },
  { id: 'faq', title: 'FAQ' },
];

const PILLARS = [
  {
    icon: FaLock,
    title: 'Encryption',
    desc: 'Traffic is encrypted with TLS 1.3, and data at rest is encrypted with AES-256.',
    tag: 'TLS 1.3 and AES-256',
  },
  {
    icon: FaFingerprint,
    title: 'No content retention',
    desc: 'Prompts and responses are never written to persistent storage. They are held in memory while a request is processed, then discarded.',
    tag: 'Memory-only processing',
  },
  {
    icon: FaUserShield,
    title: 'Access control',
    desc: 'API keys can be scoped, restricted by IP allowlist, and given their own rate limits, so only authorized traffic gets through.',
    tag: 'Scoped keys and IP allowlist',
  },
  {
    icon: FaNetworkWired,
    title: 'Tenant isolation',
    desc: 'Tenant environments are isolated from one another, so one account can’t reach another account’s data.',
    tag: 'Isolated environments',
  },
  {
    icon: FaSyncAlt,
    title: 'Continuous monitoring',
    desc: 'Automated threat detection runs around the clock, with anomaly alerts raised in under 5 minutes.',
    tag: '24/7 detection',
  },
  {
    icon: FaCodeBranch,
    title: 'Secure development',
    desc: 'Every change goes through peer review, static and dynamic analysis, and dependency scanning before it reaches production.',
    tag: 'SAST and DAST',
  },
];

const HANDLING = [
  {
    data: 'Prompts and responses',
    status: 'Not stored',
    good: true,
    detail: 'Processed in memory and discarded when the request ends.',
  },
  {
    data: 'Request metadata',
    status: 'Stored',
    good: false,
    detail: 'Model, endpoint, status, latency, token count, and IP address. Kept for 90 days.',
  },
  {
    data: 'API keys',
    status: 'Hashed only',
    good: true,
    detail: 'The full key is shown once at creation. We keep a hash and a short prefix.',
  },
  {
    data: 'Account data',
    status: 'Stored',
    good: false,
    detail: 'Kept while your account exists and purged within 30 days of deletion.',
  },
];

const LIFECYCLE = [
  {
    phase: 'Request',
    steps: [
      'TLS 1.3 handshake at the edge',
      'API key checked against its hash',
      'IP allowlist and rate limit enforced',
    ],
  },
  {
    phase: 'Processing',
    steps: [
      'Routed to an isolated tenant environment',
      'Payload held in memory only',
      'Inference runs without writing content to disk',
    ],
  },
  {
    phase: 'Response',
    steps: [
      'Response encrypted in transit',
      'Metadata-only audit record written',
      'Request context discarded immediately',
    ],
  },
];

const ACCESS: Item[] = [
  {
    heading: 'Key hashing',
    body: 'API keys are hashed with bcrypt before storage. The full key is shown once at creation and can’t be retrieved afterwards.',
  },
  {
    heading: 'Scoping and expiry',
    body: 'Scope keys to specific models and set expiry dates from your dashboard, so each key can do only what it needs to.',
  },
  {
    heading: 'IP allowlisting',
    body: 'Restrict a key to your known server IPs. A stolen key is useless from any other address.',
  },
  {
    heading: 'Per-key rate limits',
    body: 'Every key has its own rate limit, which keeps the damage contained if one is ever abused.',
  },
];

const MONITORING: Item[] = [
  {
    heading: 'Detection',
    body: 'Automated threat detection and anomaly alerting run 24/7 across the platform.',
  },
  {
    heading: 'Response',
    body: 'We follow a documented incident response playbook, with automated alerts raised in under 5 minutes.',
  },
  {
    heading: 'Notification',
    body: 'If a breach is confirmed, affected users are notified within 72 hours, in line with GDPR Article 33.',
  },
  {
    heading: 'Review',
    body: 'After every incident we run a post-incident review and ship fixes so the same problem doesn’t repeat.',
  },
];

const COMPLIANCE = [
  { label: 'SOC 2 Type II', status: 'In progress', dot: 'bg-amber-500' },
  { label: 'GDPR', status: 'Compliant', dot: 'bg-emerald-500' },
  { label: 'ISO 27001', status: 'Aligned', dot: 'bg-blue-500' },
  { label: 'CCPA', status: 'Compliant', dot: 'bg-emerald-500' },
];

const PRACTICES: Item[] = [
  {
    heading: 'Keep keys server-side',
    body: 'Never expose keys in client-side code. Load them from environment variables on your server. Hardcoded keys are a critical vulnerability.',
  },
  {
    heading: 'Rotate every 90 days',
    body: 'Generate a fresh key on a 90-day cycle and revoke the old one as soon as the new one is active.',
  },
  {
    heading: 'Separate environments',
    body: 'Use different keys for development, staging, and production, so a leak in one doesn’t affect the others.',
  },
  {
    heading: 'Enable IP allowlisting',
    body: 'Lock each key to your known server IPs. A stolen key becomes useless without a matching address.',
  },
  {
    heading: 'Watch for anomalies',
    body: 'Alert on sudden token spikes or unusual request patterns. They are often the first sign of a compromised key.',
  },
  {
    heading: 'Sanitize user input',
    body: 'Validate every prompt built from user input to guard against prompt injection and jailbreak attempts.',
  },
];

const DISCLOSURE: Item[] = [
  {
    heading: 'How to report',
    body: 'Email security@aichixia.xyz with a clear description, steps to reproduce, and the impact you observed.',
  },
  {
    heading: 'Our commitment',
    body: 'We reply within 48 hours, keep you updated while we investigate, and never pursue action against good-faith researchers.',
  },
  {
    heading: 'Ground rules',
    body: 'Test only your own accounts, don’t access or modify other users’ data, avoid denial of service and social engineering, and give us reasonable time to fix an issue before disclosing it publicly.',
  },
];

const FAQS = [
  {
    q: 'Do you store my prompts or responses?',
    a: 'No. Prompts and responses are processed in memory and never written to persistent storage. We keep only request metadata (model, endpoint, status, latency, token count, and IP address) for billing, rate limiting, and abuse prevention, and it is retained for 90 days.',
  },
  {
    q: 'How are API keys stored?',
    a: 'Keys are hashed with bcrypt before storage, and the plaintext key is shown exactly once at creation. You can set expiry dates, scope keys to specific models, and restrict them by IP allowlist from your dashboard.',
  },
  {
    q: 'Is my data used to train models?',
    a: 'No. We don’t use your data for training. Requests are forwarded to upstream providers under Data Processing Agreements that prohibit training on customer data, and we only work with providers that offer zero-training guarantees.',
  },
  {
    q: 'Do model providers see my requests?',
    a: 'Yes. To generate a response, your request is sent over an encrypted connection to the model provider you choose. That handling is covered by our agreements with each provider.',
  },
  {
    q: 'How are security incidents handled?',
    a: 'We maintain a documented incident response playbook with automated alerting in under 5 minutes. Affected users are notified within 72 hours of a confirmed breach, in line with GDPR Article 33.',
  },
  {
    q: 'How do I delete my data?',
    a: 'Request account deletion from Settings. Your account data is purged within 30 days, as described in our Privacy Policy.',
  },
  {
    q: 'Can I request a penetration test report?',
    a: 'Enterprise customers can request our latest third-party pentest summary under NDA. Email contact@aichixia.xyz with the subject “Security Report Request” and we’ll respond within one business day.',
  },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60';

const navLink = `px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors duration-200 ${focusRing}`;

function SectionHead({ title, summary }: { title: string; summary: string }) {
  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{summary}</p>
    </>
  );
}

function ItemList({ items }: { items: Item[] }) {
  return (
    <dl className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
      {items.map(item => (
        <div key={item.heading} className="py-4 sm:grid sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
          <dt className="text-sm font-medium">{item.heading}</dt>
          <dd className="mt-1 sm:mt-0 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function SecurityPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(TOC[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(max > 0 ? Math.min((window.scrollY / max) * 100, 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    TOC.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html { scroll-behavior: smooth; }
            @keyframes secIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: none; }
            }
            .sec-in { animation: secIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
            @media (prefers-reduced-motion: reduce) {
              html { scroll-behavior: auto; }
              .sec-in { animation: none; }
            }
          `,
        }}
      />

      <Head>
        <title>Security | Aichixia</title>
        <meta
          name="description"
          content="How Aichixia protects your data, API keys, and infrastructure. Your prompts and responses are never stored."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="fixed top-0 left-0 z-50 h-0.5 bg-blue-600 dark:bg-blue-500"
        style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
      />

      <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
        <header
          className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
            scrolled
              ? 'border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md'
              : 'border-transparent bg-white dark:bg-black'
          }`}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="flex h-12 sm:h-14 items-center justify-between">
              <Link href="/" className={`group flex items-center gap-2 rounded-lg ${focusRing}`}>
                <FaTerminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold tracking-tight">Aichixia</span>
                <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400">API Platform</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1" aria-label="Main">
                {NAV.map(n => (
                  <Link key={n.href} href={n.href} className={navLink}>
                    {n.label}
                  </Link>
                ))}
                <Link
                  href="/console"
                  className={`ml-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 ${focusRing}`}
                >
                  Console
                </Link>
              </nav>

              <div className="flex items-center gap-1.5">
                <ThemeToggle />
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  className={`md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors duration-200 ${focusRing}`}
                >
                  {menuOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <nav className="mx-auto max-w-4xl flex flex-col gap-1 p-3" aria-label="Mobile">
                {NAV.map(n => (
                  <Link key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className={navLink}>
                    {n.label}
                  </Link>
                ))}
                <Link
                  href="/console"
                  onClick={() => setMenuOpen(false)}
                  className={`mt-1 px-3 py-2 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 ${focusRing}`}
                >
                  Console
                </Link>
              </nav>
            </div>
          )}
        </header>

        <section className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="sec-in mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Last updated {LAST_UPDATED}</p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">Security</h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              How Aichixia protects your data, API keys, and infrastructure. Security is built into every request,
              not added afterwards.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href="mailto:security@aichixia.xyz"
                className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200 ${focusRing}`}
              >
                Report a vulnerability
                <FaArrowRight className="h-2.5 w-2.5" />
              </a>
              <a
                href="mailto:contact@aichixia.xyz"
                className={`inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-200 ${focusRing}`}
              >
                <FaEnvelope className="h-3 w-3" />
                Contact us
              </a>
            </div>

            <div className="mt-8 flex gap-3 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-4 sm:p-5">
              <FaShieldAlt className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-semibold">Your prompts and responses are never stored</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Requests are processed in memory and discarded. We record only metadata, such as model, latency, and
                  token count, to run and protect the service.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14 lg:grid lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <nav className="sticky top-24" aria-label="On this page">
              <p className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">On this page</p>
              <ul className="border-l border-zinc-200 dark:border-zinc-800">
                {TOC.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block -ml-px border-l py-1.5 pl-3 text-[13px] leading-snug transition-colors duration-200 ${focusRing} ${
                        active === s.id
                          ? 'border-blue-600 dark:border-blue-400 font-medium text-zinc-900 dark:text-white'
                          : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 space-y-12 sm:space-y-14">
            <section id="overview" className="scroll-mt-24">
              <SectionHead
                title="How we protect your data"
                summary="Six layers that apply to every API call."
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {PILLARS.map(p => (
                  <div key={p.title} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                      <p.icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="mt-3 text-sm font-semibold">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{p.desc}</p>
                    <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{p.tag}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="handling" className="scroll-mt-24">
              <SectionHead
                title="Data handling"
                summary="What we keep, what we don’t, and for how long."
              />
              <div className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
                <div className="hidden py-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid sm:grid-cols-[150px_110px_minmax(0,1fr)] sm:gap-6">
                  <span>Data</span>
                  <span>Status</span>
                  <span>Details</span>
                </div>
                {HANDLING.map(r => (
                  <div key={r.data} className="py-4 sm:grid sm:grid-cols-[150px_110px_minmax(0,1fr)] sm:gap-6">
                    <p className="text-sm font-medium">{r.data}</p>
                    <p className="mt-1 sm:mt-0 flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                      <span
                        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                          r.good ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'
                        }`}
                      />
                      {r.status}
                    </p>
                    <p className="mt-1 sm:mt-0 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{r.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Our{' '}
                <Link href="/privacy" className={`rounded font-medium text-blue-600 dark:text-blue-400 hover:underline ${focusRing}`}>
                  Privacy Policy
                </Link>{' '}
                covers this in full.
              </p>
            </section>

            <section id="lifecycle" className="scroll-mt-24">
              <SectionHead
                title="Request lifecycle"
                summary="The path every API request follows, from arrival to cleanup."
              />
              <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800 sm:grid-cols-3">
                {LIFECYCLE.map((t, i) => (
                  <div key={t.phase} className="bg-white dark:bg-black p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-medium text-white">
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold">{t.phase}</p>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {t.steps.map(s => (
                        <li key={s} className="flex gap-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
                          <FaCheck className="mt-1 h-2.5 w-2.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Only metadata is recorded along the way. The content of your request is never part of the record.
              </p>
            </section>

            <section id="access" className="scroll-mt-24">
              <SectionHead
                title="Authentication and access"
                summary="Controls that keep your API keys and account in your hands."
              />
              <ItemList items={ACCESS} />
            </section>

            <section id="monitoring" className="scroll-mt-24">
              <SectionHead
                title="Monitoring and incidents"
                summary="How we detect problems and what happens when one occurs."
              />
              <ItemList items={MONITORING} />
            </section>

            <section id="compliance" className="scroll-mt-24">
              <SectionHead
                title="Compliance"
                summary="The standards and regulations we work to."
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {COMPLIANCE.map(c => (
                  <div
                    key={c.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3.5"
                  >
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                      {c.status}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Statuses reflect where we are today. If you need documentation for a vendor review, contact us.
              </p>
            </section>

            <section id="practices" className="scroll-mt-24">
              <SectionHead
                title="Developer best practices"
                summary="Security is shared. We protect the platform, and you protect your keys and your application."
              />
              <ItemList items={PRACTICES} />
            </section>

            <section id="disclosure" className="scroll-mt-24">
              <SectionHead
                title="Responsible disclosure"
                summary="Found a vulnerability? We want to hear about it."
              />
              <ItemList items={DISCLOSURE} />
              <a
                href="mailto:security@aichixia.xyz"
                className={`mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200 ${focusRing}`}
              >
                security@aichixia.xyz
                <FaArrowRight className="h-2.5 w-2.5" />
              </a>
            </section>

            <section id="faq" className="scroll-mt-24">
              <SectionHead
                title="FAQ"
                summary="Answers to the security questions we hear most."
              />
              <div className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
                {FAQS.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={faq.q}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-${i}`}
                        className={`flex w-full items-center justify-between gap-4 py-4 text-left rounded ${focusRing}`}
                      >
                        <span className="text-sm font-medium">{faq.q}</span>
                        <FaChevronDown
                          className={`h-3 w-3 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p id={`faq-${i}`} className="pb-4 pr-7 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-4 sm:px-6 py-6 sm:flex-row">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              © {new Date().getFullYear()} Aichixia. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/privacy"
                className={`rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 ${focusRing}`}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={`rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 ${focusRing}`}
              >
                Terms
              </Link>
              <a
                href="mailto:contact@aichixia.xyz"
                className={`rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 ${focusRing}`}
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
