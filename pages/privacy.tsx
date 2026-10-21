import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import {
  FaTerminal,
  FaShieldAlt,
  FaDatabase,
  FaEye,
  FaLock,
  FaUserCheck,
  FaGlobe,
  FaEnvelope,
  FaChevronDown,
  FaArrowUpRightFromSquare
} from 'react-icons/fa';

const LAST_UPDATED = 'October 2026';

const SECTIONS = [
  {
    id: 'information',
    number: '01',
    icon: FaDatabase,
    title: 'Information We Process',
    summary: 'Account details and technical usage information.',
    items: [
      {
        title: 'Account information',
        body: 'When you create an Aichixia account, we may process information such as your email address, display name, and profile details you choose to provide. This information is used to operate and maintain your account.'
      },
      {
        title: 'Usage and technical metadata',
        body: 'We may process technical and usage metadata needed to operate the platform, such as the requested model, endpoint, response status, latency, token usage, timestamps, and security-related information. This information helps with service operation, usage limits, troubleshooting, and abuse prevention.'
      },
      {
        title: 'API request and response content',
        body: 'Aichixia does not store the content of API requests or responses—such as prompts and generated outputs—as application data. Technical logs and metadata are separate from request and response content; our exact technical-log retention practices are still being reviewed.'
      }
    ]
  },
  {
    id: 'use',
    number: '02',
    icon: FaEye,
    title: 'How We Use Information',
    summary: 'Information is used to operate and protect Aichixia.',
    items: [
      {
        title: 'Operate the service',
        body: 'Account information and relevant technical metadata may be used to authenticate requests, operate the API platform, enforce applicable usage limits, display usage information, maintain reliability, and investigate technical issues.'
      },
      {
        title: 'Security and support',
        body: 'Relevant information may be processed to detect abuse, protect the service, respond to support requests, and address security incidents.'
      },
      {
        title: 'No model training by Aichixia',
        body: 'Aichixia does not use API request or response content to train or improve AI models. This statement concerns Aichixia’s own use of content and does not by itself determine the practices of upstream providers.'
      }
    ]
  },
  {
    id: 'providers',
    number: '03',
    icon: FaGlobe,
    title: 'Upstream Providers and Data Sharing',
    summary: 'Requests are forwarded to providers to generate model responses.',
    items: [
      {
        title: 'Upstream model providers',
        body: 'When you make an API request, Aichixia forwards the relevant request content to the third-party upstream model provider serving the selected model so that the provider can process the request and return a response. The provider involved may vary depending on the model or route.'
      },
      {
        title: 'Provider policies',
        body: 'Upstream providers operate under their own data handling, retention, and model-training policies. These practices may differ by provider and service. We do not make a blanket guarantee that every provider follows the same policy; review the relevant provider’s terms and privacy information where available.'
      },
      {
        title: 'Other disclosures',
        body: 'Aichixia does not sell personal information. Information may be disclosed where necessary to protect the service, respond to valid legal requirements, or address security and abuse issues, subject to applicable law.'
      }
    ]
  },
  {
    id: 'security',
    number: '04',
    icon: FaLock,
    title: 'Storage and Security',
    summary: 'How account information and technical records are handled.',
    items: [
      {
        title: 'Request content',
        body: 'Aichixia does not store API prompts or generated outputs as application data. Because requests are forwarded to upstream model providers, processing and any retention by those providers are governed by their respective policies.'
      },
      {
        title: 'Technical logs and metadata',
        body: 'Technical logs or usage metadata may be processed to maintain the service, enforce usage limits, and protect against abuse. We are reviewing the exact retention periods and deletion procedures for these records and do not currently publish a fixed retention period for them.'
      },
      {
        title: 'Security measures',
        body: 'We take reasonable steps to protect information handled by the platform. No online service or method of transmission can be guaranteed to be completely secure.'
      }
    ]
  },
  {
    id: 'rights',
    number: '05',
    icon: FaUserCheck,
    title: 'Your Choices and Requests',
    summary: 'Contact us about account information or privacy concerns.',
    items: [
      {
        title: 'Access, correction, and deletion',
        body: 'You may contact us to ask about personal information associated with your account, request a correction, or request deletion where applicable. We may need to verify your identity before acting on a request.'
      },
      {
        title: 'Request content and provider records',
        body: 'Because Aichixia does not store API request and response content as application data, we generally cannot retrieve or delete content that we do not hold. If an upstream provider retains information, requests concerning that provider’s records may need to be directed to the provider, subject to its policies and applicable law.'
      },
      {
        title: 'Contact',
        body: 'For privacy questions or data-related requests, email contact@aichixia.xyz. We will review your request and respond as reasonably practicable.'
      }
    ]
  },
  {
    id: 'international',
    number: '06',
    icon: FaGlobe,
    title: 'International Processing',
    summary: 'Processing locations depend on the infrastructure and model provider.',
    items: [
      {
        title: 'Provider locations',
        body: 'Because Aichixia routes requests to third-party model providers, request content may be processed in countries where the relevant provider operates. The location can vary by provider and model. Please review the applicable provider information for details.'
      },
      {
        title: 'Aichixia infrastructure',
        body: 'The location of Aichixia’s own infrastructure and the countries in which the service is legally established should be confirmed through the relevant hosting and business records. Contact us if you need further information for a compliance assessment.'
      }
    ]
  },
  {
    id: 'changes',
    number: '07',
    icon: FaShieldAlt,
    title: 'Changes to This Policy',
    summary: 'We may update this policy as the service evolves.',
    items: [
      {
        title: 'Updates',
        body: 'We may update this Privacy Policy to reflect changes to Aichixia or our data-handling practices. The date at the top of this page indicates when this policy was last updated. Please review this page periodically.'
      }
    ]
  }
];

export default function PrivacyPage() {
  const [openSection, setOpenSection] = useState<string | null>('information');

  return (
    <>
      <Head>
        <title>Privacy Policy — Aichixia</title>
        <meta
          name="description"
          content="Learn how Aichixia processes account information, API request content, technical metadata, and third-party model requests."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
                <FaTerminal className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Aichixia</span>
              <span className="hidden border-l border-zinc-200 pl-2.5 text-xs text-zinc-500 dark:border-zinc-700 sm:inline">
                Privacy
              </span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-4">
              <Link href="/docs" className="text-sm text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
                Docs
              </Link>
              <Link href="/terms" className="hidden text-sm text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white sm:inline">
                Terms
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <section className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                <FaShieldAlt className="h-3 w-3" />
                Last updated {LAST_UPDATED}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Privacy Policy
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base sm:leading-7">
                This policy explains what information Aichixia processes, how API requests are handled, and what to know when requests are sent to third-party model providers.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  <FaLock className="h-3 w-3" />
                  Prompts and outputs not stored by Aichixia
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  <FaUserCheck className="h-3 w-3" />
                  No Aichixia training on API content
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                On this page
              </p>
              <nav className="space-y-1">
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-md px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  >
                    {section.number}. {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-5">
              <div className="flex items-start gap-3">
                <FaLock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700 dark:text-zinc-300" />
                <div>
                  <h2 className="text-sm font-semibold">API content and model training</h2>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Aichixia does not store API prompts or generated responses as application data and does not use that content to train AI models. Requests are forwarded to the upstream provider serving the selected model, whose own data-handling policies may apply.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isOpen = openSection === section.id;

                return (
                  <section
                    id={section.id}
                    key={section.id}
                    className="scroll-mt-20 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${section.id}-content`}
                      onClick={() => setOpenSection(isOpen ? null : section.id)}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50 sm:px-5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold tracking-tight">
                          <span className="mr-2 font-mono text-xs text-zinc-400">{section.number}</span>
                          {section.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                          {section.summary}
                        </span>
                      </span>
                      <FaChevronDown className={`h-3 w-3 shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div id={`${section.id}-content`} className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:px-5">
                        <div className="space-y-5">
                          {section.items.map((item) => (
                            <div key={item.title}>
                              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {item.title}
                              </h3>
                              <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                {item.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <section className="mt-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:p-5">
              <div className="flex items-start gap-3">
                <FaEnvelope className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-400" />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold">Privacy questions?</h2>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Contact us at{' '}
                    <a href="mailto:contact@aichixia.xyz" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-white">
                      contact@aichixia.xyz
                    </a>
                    {' '}for privacy questions or data-related requests.
                  </p>
                </div>
              </div>
            </section>

            <footer className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-5 text-xs text-zinc-500 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} Aichixia. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/terms" className="inline-flex items-center gap-1.5 transition hover:text-zinc-900 dark:hover:text-white">
                  Terms of Service <FaArrowUpRightFromSquare className="h-2.5 w-2.5" />
                </Link>
                <a href="mailto:contact@aichixia.xyz" className="transition hover:text-zinc-900 dark:hover:text-white">
                  Contact
                </a>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}
