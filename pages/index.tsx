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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16 sm:mb-24"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <img
                src="/aichixia.png"
                alt="Aichixia"
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-400/50 shadow-2xl shadow-blue-500/50"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent"
          >
            Aichixia API
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-xl text-blue-200/80 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4"
          >
            Your gateway to anime, manga, manhwa, and AI-powered conversations. Built for developers who love anime culture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
          >
            <Link
              href="/docs"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/50 w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-3">
                <FaBook className="text-2xl" />
                <span>View Documentation</span>
              </span>
            </Link>

            <Link
              href="/chat"
              className="group px-8 py-4 bg-slate-800/50 backdrop-blur-xl border-2 border-blue-500/30 hover:border-blue-400/50 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-3">
                <FaBrain className="text-2xl text-cyan-400" />
                <span>Try AI Chat</span>
              </span>
            </Link>
          </motion.div>
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16 sm:mb-24"
        >
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12 px-4">
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
                  className={`relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl shadow-blue-500/50 scale-105"
                      : "bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/50 text-blue-200"
                  }`}
                >
                  <Icon className="text-xl" />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/60 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl"
          >
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text mb-4 sm:mb-6">
                    What is Aichixia API?
                  </h2>
                  <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed mb-6">
                    Aichixia is a powerful RESTful API that combines comprehensive anime/manga data from AniList with multi-provider AI capabilities. Whether you're building an anime recommendation app, a chatbot, or a content discovery platform, Aichixia provides everything you need.
                  </p>
                  <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed">
                    Our API is designed with simplicity in mind - no complex authentication flows, no API key management headaches. Just pure, instant access to rich anime data and intelligent AI conversations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {[
                    {
                      title: "Rich Database",
                      desc: "Access millions of anime, manga, manhwa, manhua, and light novel entries with detailed information including characters, staff, and recommendations",
                      color: "from-blue-500 to-cyan-500",
                      icon: FaBook
                    },
                    {
                      title: "AI Intelligence",
                      desc: "6-provider fallback system (OpenAI, Gemini, DeepSeek, Qwen, GPT-OSS, Llama) ensures 99.9% uptime for conversational AI",
                      color: "from-purple-500 to-pink-500",
                      icon: FaBrain
                    },
                    {
                      title: "Developer Friendly",
                      desc: "Clean REST architecture with JSON responses, comprehensive documentation, and no authentication required for public endpoints",
                      color: "from-green-500 to-emerald-500",
                      icon: FaCode
                    },
                    {
                      title: "Production Ready",
                      desc: "Built for scale with intelligent caching, rate limiting, edge deployment, and real-time monitoring",
                      color: "from-orange-500 to-red-500",
                      icon: FaShieldAlt
                    }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/50 rounded-2xl p-6 transition-all duration-300 hover:scale-105 overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                        <div className="relative flex items-start gap-4 mb-3">
                          <div className={`p-3 bg-gradient-to-r ${item.color} rounded-xl`}>
                            <Icon className="text-white text-xl" />
                          </div>
                          <h3 className="text-xl font-bold text-blue-100 flex-1">{item.title}</h3>
                        </div>
                        <p className="relative text-sm text-blue-200/70 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center gap-2">
                    <FaLightbulb />
                    Why Choose Aichixia?
                  </h3>
                  <ul className="space-y-2 text-blue-100/80">
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Unified access to anime data and AI in a single API</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Automatic failover ensures your app never goes down</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Free tier with generous rate limits for indie developers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Open source and community-driven development</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "quickstart" && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text mb-4 sm:mb-6">
                    Get Started in Minutes
                  </h2>
                  <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed mb-4">
                    No API keys, no complex setup. Just start making HTTP requests!
                  </p>
                  <p className="text-sm text-blue-200/60">
                    All you need is a basic understanding of REST APIs and your favorite HTTP client. Our API speaks standard JSON and follows RESTful conventions.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {[
                    {
                      title: "1. Search for Content",
                      desc: "Search across anime, manga, manhwa, manhua, and light novels with a simple query parameter. Results include titles, images, scores, and metadata.",
                      category: "Data Retrieval"
                    },
                    {
                      title: "2. Fetch Detailed Info",
                      desc: "Get comprehensive details about any title including synopsis, episodes, characters, staff, and related content. Perfect for building detailed pages.",
                      category: "Data Retrieval"
                    },
                    {
                      title: "3. Discover Trending",
                      desc: "Access real-time trending content, seasonal anime, airing schedules, and personalized recommendations based on user preferences.",
                      category: "Discovery"
                    },
                    {
                      title: "4. AI Conversations",
                      desc: "Integrate conversational AI with customizable personas (tsundere, friendly, professional, kawaii). Perfect for chatbots and recommendation engines.",
                      category: "AI Features"
                    }
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 sm:p-6 hover:border-blue-400/40 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <span className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-xs font-bold">
                          {step.category}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-cyan-300 mb-2">{step.title}</h3>
                      <p className="text-sm text-blue-200/70 leading-relaxed">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2">
                    <FaRocket />
                    Ready to Code?
                  </h3>
                  <p className="text-blue-100/80 mb-4">
                    Check out our comprehensive documentation for detailed endpoint references, request/response examples, and best practices.
                  </p>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
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
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text mb-4 sm:mb-6">
                    Powerful Features
                  </h2>
                  <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed">
                    Everything you need to build modern anime applications, from simple search tools to complex recommendation systems.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {[
                    {
                      title: "Multi-Provider AI System",
                      features: ["OpenAI GPT-4 - Most intelligent responses", "Google Gemini - Fast and efficient", "DeepSeek - Advanced reasoning", "Qwen - Balanced performance", "GPT-OSS - Open source alternative", "Llama via Groq - Ultra-fast inference"],
                      color: "from-purple-500 to-pink-500",
                      icon: FaBrain
                    },
                    {
                      title: "Comprehensive Database",
                      features: ["Full-text search with autocomplete", "Trending and seasonal content", "Character and staff details", "Episode information and schedules", "Genre-based recommendations", "Related content suggestions"],
                      color: "from-blue-500 to-cyan-500",
                      icon: FaBook
                    },
                    {
                      title: "Developer Experience",
                      features: ["RESTful API design", "Clean JSON responses", "No authentication for public data", "Intelligent rate limiting", "CORS enabled for web apps", "TypeScript types available"],
                      color: "from-green-500 to-emerald-500",
                      icon: FaCode
                    }
                  ].map((category, idx) => {
                    const Icon = category.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="group relative bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/50 rounded-2xl p-6 transition-all duration-300 overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                        <div className="relative flex items-center gap-3 mb-4">
                          <div className={`p-3 bg-gradient-to-r ${category.color} rounded-xl`}>
                            <Icon className="text-white text-2xl" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-bold text-blue-100">{category.title}</h3>
                        </div>
                        <ul className="relative space-y-2">
                          {category.features.map((feature, fidx) => (
                            <li key={fidx} className="flex items-start gap-3 text-sm sm:text-base text-blue-200/80">
                              <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mb-16 sm:mb-24"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 sm:p-12 md:p-16">
            <FaHeart className="text-5xl sm:text-6xl text-pink-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-100 mb-4 sm:mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-base sm:text-lg text-blue-200/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join hundreds of developers using Aichixia API to create the next generation of anime applications. From simple hobby projects to production-scale platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link
                href="/docs"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-blue-500/50"
              >
                <span className="flex items-center justify-center gap-3">
                  <FaBook className="text-2xl" />
                  <span>Read Documentation</span>
                </span>
              </Link>
              <a
                href="https://github.com/Takawell/Aichixia"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-xl border-2 border-blue-500/30 hover:border-blue-400/50 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-3">
                  <FaGithub className="text-2xl" />
                  <span>View on GitHub</span>
                </span>
              </a>
            </div>
          </div>
        </motion.section>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center py-8 border-t border-blue-500/20"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-4">
            <Link href="/docs" className="text-blue-300 hover:text-blue-200 transition-colors text-sm sm:text-base">
              Documentation
            </Link>
            <span className="hidden sm:inline text-blue-500/50">•</span>
            <Link href="/chat" className="text-blue-300 hover:text-blue-200 transition-colors text-sm sm:text-base">
              Try AI Chat
            </Link>
            <span className="hidden sm:inline text-blue-500/50">•</span>
            <a href="https://github.com/Takawell/Aichixia" className="text-blue-300 hover:text-blue-200 transition-colors text-sm sm:text-base">
              GitHub
            </a>
          </div>
          <p className="text-blue-300/60 text-xs sm:text-sm">
            © {new Date().getFullYear()} Aichixia - Anime-first AI Assistant
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
