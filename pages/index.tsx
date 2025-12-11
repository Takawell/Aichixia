import { useState } from "react";
import { FaRocket, FaCode, FaBrain, FaHeart, FaGithub, FaBook, FaLightbulb, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState<"overview" | "quickstart" | "features">("overview");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex justify-between items-center mb-8 sm:mb-12">
          <div className="flex-1"></div>
          <ThemeToggle />
        </div>

        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-4 sm:mb-6"
          >
            <img
              src="/aichixia.png"
              alt="Aichixia"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-sky-500 shadow-lg"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white"
          >
            Aichixia API
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-4"
          >
            Your gateway to anime, manga, manhwa, and AI-powered conversations
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
          >
            <Link
              href="/docs"
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md w-full sm:w-auto text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <FaBook />
                <span>View Documentation</span>
              </span>
            </Link>

            <Link
              href="/chat"
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <FaBrain className="text-sky-600 dark:text-sky-400" />
                <span>Try AI Chat</span>
              </span>
            </Link>
          </motion.div>
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 sm:mb-16"
        >
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-4">
            {[
              { id: "overview", label: "Overview", icon: FaRocket },
              { id: "quickstart", label: "Quick Start", icon: FaLightbulb },
              { id: "features", label: "Features", icon: FaBrain }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  variants={itemVariants}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                    activeTab === tab.id
                      ? "bg-sky-600 dark:bg-sky-500 text-white shadow-md"
                      : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500 dark:hover:border-sky-500"
                  }`}
                >
                  <Icon className="text-base sm:text-lg" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 shadow-sm"
          >
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
                    What is Aichixia API?
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    Aichixia is a powerful RESTful API that combines comprehensive anime/manga data from AniList with multi-provider AI capabilities. Whether you're building an anime recommendation app, a chatbot, or a content discovery platform, Aichixia provides everything you need.
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our API is designed with simplicity in mind - no complex authentication flows, no API key management headaches. Just pure, instant access to rich anime data and intelligent AI conversations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Rich Database",
                      desc: "Access millions of anime, manga, manhwa, manhua, and light novel entries with detailed information",
                      icon: FaBook,
                      color: "sky"
                    },
                    {
                      title: "AI Intelligence",
                      desc: "6-provider fallback system ensures 99.9% uptime for conversational AI",
                      icon: FaBrain,
                      color: "purple"
                    },
                    {
                      title: "Developer Friendly",
                      desc: "Clean REST architecture with JSON responses and comprehensive documentation",
                      icon: FaCode,
                      color: "green"
                    },
                    {
                      title: "Production Ready",
                      desc: "Built for scale with intelligent caching, rate limiting, and edge deployment",
                      icon: FaShieldAlt,
                      color: "orange"
                    }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5 hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-2 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-lg`}>
                            <Icon className={`text-${item.color}-600 dark:text-${item.color}-400 text-lg`} />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex-1">{item.title}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-sky-900 dark:text-sky-300 mb-3 flex items-center gap-2">
                    <FaLightbulb />
                    Why Choose Aichixia?
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-0.5">•</span>
                      <span>Unified access to anime data and AI in a single API</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-0.5">•</span>
                      <span>Automatic failover ensures your app never goes down</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-0.5">•</span>
                      <span>Free tier with generous rate limits for indie developers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 dark:text-sky-400 mt-0.5">•</span>
                      <span>Open source and community-driven development</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "quickstart" && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
                    Get Started in Minutes
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    No API keys, no complex setup. Just start making HTTP requests!
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                    All you need is a basic understanding of REST APIs and your favorite HTTP client.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      title: "1. Search for Content",
                      desc: "Search across anime, manga, manhwa, manhua, and light novels with a simple query parameter.",
                      category: "Data Retrieval"
                    },
                    {
                      title: "2. Fetch Detailed Info",
                      desc: "Get comprehensive details about any title including synopsis, episodes, characters, and staff.",
                      category: "Data Retrieval"
                    },
                    {
                      title: "3. Discover Trending",
                      desc: "Access real-time trending content, seasonal anime, airing schedules, and recommendations.",
                      category: "Discovery"
                    },
                    {
                      title: "4. AI Conversations",
                      desc: "Integrate conversational AI with customizable personas for chatbots and recommendation engines.",
                      category: "AI Features"
                    }
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded text-xs font-semibold">
                          {step.category}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <FaRocket />
                    Ready to Code?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-4">
                    Check out our comprehensive documentation for detailed endpoint references and examples.
                  </p>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <FaBook />
                    <span>View Full Documentation</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
                    Powerful Features
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Everything you need to build modern anime applications
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      title: "Multi-Provider AI System",
                      features: ["OpenAI GPT-4", "Google Gemini", "DeepSeek", "Qwen", "GPT-OSS", "Llama via Groq"],
                      icon: FaBrain
                    },
                    {
                      title: "Comprehensive Database",
                      features: ["Full-text search", "Trending & seasonal", "Character details", "Episode schedules", "Recommendations", "Related content"],
                      icon: FaBook
                    },
                    {
                      title: "Developer Experience",
                      features: ["RESTful API", "JSON responses", "No authentication", "Rate limiting", "CORS enabled", "TypeScript types"],
                      icon: FaCode
                    }
                  ].map((category, idx) => {
                    const Icon = category.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-5"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="text-sky-600 dark:text-sky-400 text-lg" />
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">{category.title}</h3>
                        </div>
                        <ul className="space-y-1.5">
                          {category.features.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                              <span className="w-1.5 h-1.5 bg-sky-500 dark:bg-sky-400 rounded-full mt-1.5 flex-shrink-0"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-8 sm:p-10">
            <FaHeart className="text-4xl sm:text-5xl text-pink-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto px-4">
              Join hundreds of developers using Aichixia API to create the next generation of anime applications
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
              <Link
                href="/docs"
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaBook />
                  <span>Read Documentation</span>
                </span>
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaGithub />
                  <span>View on GitHub</span>
                </span>
              </a>
            </div>
          </div>
        </motion.section>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-6 border-t border-slate-200 dark:border-slate-700"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-3 text-sm">
            <Link href="/docs" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Documentation
            </Link>
            <span className="hidden sm:inline text-slate-400">•</span>
            <Link href="/chat" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              Try AI Chat
            </Link>
            <span className="hidden sm:inline text-slate-400">•</span>
            <a href="https://github.com" className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
              GitHub
            </a>
          </div>
          <p className="text-slate-500 dark:text-slate-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} Aichixia - by Takawell
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
