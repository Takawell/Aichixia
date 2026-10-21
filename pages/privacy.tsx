import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { FaTerminal, FaBars, FaTimes, FaLock, FaEnvelope, FaArrowRight } from 'react-icons/fa';

const LAST_UPDATED = 'October 2026';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
];

const SECTIONS = [
  {
    id: 'content',
    title: 'Your content stays private',
    summary: 'What happens to the prompts and data you send us.',
    items: [
      {
        heading: 'Prompts and responses',
        body: 'Everything you send to the API, including prompts, messages, files, and the responses generated, is processed in transit only. We do not store, record, or review it.',
      },
      {
        heading: 'No content logs',
        body: 'Our logs never contain the text of your requests or responses. When something goes wrong, we debug with request metadata, not with your content.',
      },
      {
        heading: 'No secondary use',
        body: 'Because your content is never retained, it can’t be used to train models, build user profiles, or feed analytics.',
      },
    ],
  },
  {
    id: 'collection',
    title: 'What we collect',
    summary: 'The limited data we need to run your account and the API.',
    items: [
      {
        heading: 'Account data',
        body: 'When you register, we collect your email address, display name, and an optional avatar URL. It is used only to identify your account and personalize your experience.',
      },
      {
        heading: 'Request metadata',
        body: 'For each API request we record the model used, endpoint, HTTP status, latency, token count, and IP address. This powers rate limiting, billing, abuse prevention, and your activity dashboard. It never includes prompt or response content.',
      },
      {
        heading: 'Technical data',
        body: 'We collect browser user agent strings, request timestamps, and session tokens to debug issues and keep the platform secure and reliable.',
      },
    ],
  },
  {
    id: 'usage',
    title: 'How we use data',
    summary: 'The purpose behind each piece of data we process.',
    items: [
      {
        heading: 'Service operation',
        body: 'Your data authenticates requests, enforces plan-based rate limits, populates your analytics dashboard, and keeps the API console working.',
      },
      {
        heading: 'Communication',
        body: 'We use your email for critical service notifications and security alerts only. We never send marketing emails without your explicit consent.',
      },
      {
        heading: 'Platform improvement',
        body: 'Aggregated, anonymized metadata helps us understand performance and improve our infrastructure. Individual data is never sold to third parties.',
      },
    ],
  },
  {
    id: 'storage',
    title: 'Storage and security',
    summary: 'How we protect your data and how long we keep it.',
    items: [
      {
        heading: 'Infrastructure',
        body: 'Data lives on Supabase infrastructure with PostgreSQL databases, encrypted at rest and in transit using TLS 1.3.',
      },
      {
        heading: 'API key hashing',
        body: 'API keys are hashed before storage. The full key is shown once at creation and can’t be retrieved later. We keep only a short prefix for identification.',
      },
      {
        heading: 'Retention',
        body: 'Prompts and responses are not retained at all. Request metadata is kept for 90 days. Account data is kept for the lifetime of your account, and after deletion all personal data is purged within 30 days.',
      },
    ],
  },
  {
    id: 'rights',
    title: 'Your rights',
    summary: 'Access, correct, or delete your data at any time.',
    items: [
      {
        heading: 'Access and portability',
        body: 'Request a full export of your account data from Settings. We provide it as machine-readable JSON within 7 business days.',
      },
      {
        heading: 'Correction and deletion',
        body: 'Update your profile at any time from Settings. You can also request full account deletion, which permanently removes all associated data from our systems.',
      },
      {
        heading: 'Right to object',
        body: 'You may object to any processing of your personal data. Contact us and we will respond promptly and transparently.',
      },
    ],
  },
  {
    id: 'sharing',
    title: 'Data sharing',
    summary: 'We never sell your data.',
    items: [
      {
        heading: 'No sale of data',
        body: 'We never sell, rent, or trade your personal information to third parties for commercial purposes.',
      },
      {
        heading: 'Service providers',
        body: 'We use Supabase for databases and Vercel for hosting. They process data on our behalf under strict data processing agreements.',
      },
      {
        heading: 'Legal requirements',
        body: 'We may disclose information if required by law or court order, and will notify affected users to the extent the law permits.',
      },
    ],
  },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60';

const navLink = `px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors duration-200 ${focusRing}`;

export default function PrivacyPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(SECTIONS[0].id);

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
    SECTIONS.forEach(s => {
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
            @keyframes prvIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: none; }
            }
            .prv-in { animation: prvIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
            @media (prefers-reduced-motion: reduce) {
              html { scroll-behavior: auto; }
              .prv-in { animation: none; }
            }
          `,
        }}
      />

      <Head>
        <title>Privacy Policy | Aichixia</title>
        <meta
          name="description"
          content="Aichixia Privacy Policy. We don’t store your prompts or responses, and we never sell your data."
        />
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
          <div className="prv-in mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Last updated {LAST_UPDATED}</p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">Privacy Policy</h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              How Aichixia collects, uses, and protects your data, in plain language.
            </p>

            <div className="mt-8 flex gap-3 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-4 sm:p-5">
              <FaLock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-semibold">We don’t store your prompts or responses</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Your content is processed in transit and never saved, logged, or reviewed. We keep only request
                  metadata, such as latency and token count, to run the service.
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
                {SECTIONS.map(s => (
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
            {SECTIONS.map(sec => (
              <section key={sec.id} id={sec.id} className="scroll-mt-24">
                <h2 className="text-lg font-semibold tracking-tight">{sec.title}</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{sec.summary}</p>
                <dl className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
                  {sec.items.map(item => (
                    <div key={item.heading} className="py-4 sm:grid sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                      <dt className="text-sm font-medium">{item.heading}</dt>
                      <dd className="mt-1 sm:mt-0 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {item.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}

            <section className="flex gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5">
              <FaEnvelope className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
              <div>
                <p className="text-sm font-semibold">Questions about privacy?</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Email{' '}
                  <a
                    href="mailto:contact@aichixia.xyz"
                    className={`rounded font-medium text-blue-600 dark:text-blue-400 hover:underline ${focusRing}`}
                  >
                    contact@aichixia.xyz
                  </a>
                  . We reply within 48 hours on business days.
                </p>
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
                href="/terms"
                className={`flex items-center gap-1 rounded font-medium text-blue-600 dark:text-blue-400 hover:underline ${focusRing}`}
              >
                Terms of Service <FaArrowRight className="h-2.5 w-2.5" />
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
