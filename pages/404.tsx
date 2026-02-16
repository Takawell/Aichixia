import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaHome, FaBook, FaTerminal, FaRocket, FaSearch, FaMoon, FaSun, FaCode, FaDatabase, FaKey, FaShieldAlt, FaChevronRight, FaGithub, FaTwitter, FaDiscord, FaArrowLeft, FaLightbulb, FaCompass, FaMapMarkedAlt, FaQuestionCircle } from "react-icons/fa";

export default function Custom404() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    setIsDark(theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);
    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        const nextParticle = particles[(index + 1) % particles.length];
        
        ctx.strokeStyle = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo((particle.x / 100) * canvas.width, (particle.y / 100) * canvas.height);
        ctx.lineTo((nextParticle.x / 100) * canvas.width, (nextParticle.y / 100) * canvas.height);
        ctx.stroke();

        ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)';
        ctx.beginPath();
        ctx.arc((particle.x / 100) * canvas.width, (particle.y / 100) * canvas.height, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + 0.1) % 100,
        y: (p.y + Math.sin(Date.now() / 1000 + p.id) * 0.05 + 100) % 100
      })));
      drawParticles();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [particles, isDark]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/docs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickLinks = [
    { icon: FaHome, label: "Home", path: "/", color: "from-blue-600 to-cyan-600" },
    { icon: FaBook, label: "Documentation", path: "/docs", color: "from-purple-600 to-pink-600" },
    { icon: FaTerminal, label: "API Console", path: "/console", color: "from-orange-600 to-red-600" },
    { icon: FaRocket, label: "Get Started", path: "/#quickstart", color: "from-green-600 to-emerald-600" }
  ];

  const popularPages = [
    { title: "API Reference", description: "Complete API documentation", icon: FaCode, path: "/docs" },
    { title: "Models", description: "Available AI models", icon: FaDatabase, path: "/docs#models" },
    { title: "Authentication", description: "API key management", icon: FaKey, path: "/docs#auth" },
    { title: "Security", description: "Security & compliance", icon: FaShieldAlt, path: "/security" }
  ];

  const funFacts = [
    "This page doesn't exist, but your API key does! 🔑",
    "404: The only error code with its own fan club 🎉",
    "Lost? Our AI models never get lost in their training data 🤖",
    "This page is as rare as a bug-free code on first try 🐛",
    "Even our 404 page is API-powered... just kidding! 😄",
    "Don't worry, our AI can't find this page either 🔍",
    "You've discovered the secret void of the internet! 🌌",
    "This page went to train a new AI model 🎓",
    "Error 404: Page is taking a coffee break ☕",
    "Congratulations! You found the digital Bermuda Triangle 🔺"
  ];

  const [currentFact, setCurrentFact] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [konami, setKonami] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % funFacts.length);
    }, 4000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    if (clickCount >= 10) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 5000);
      setClickCount(0);
    }
  }, [clickCount]);

  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const newKonami = [...konami, e.key];
      const sliced = newKonami.slice(-10);
      setKonami(sliced);
      
      if (sliced.join(',') === konamiCode.join(',')) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        setKonami([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konami]);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Aichixia</title>
        <meta name="description" content="Oops! The page you're looking for doesn't exist." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-glitch {
          animation: glitch 0.2s infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .gradient-text {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hover-lift {
          transition: transform 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
        .glow {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        .dark .glow {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }
      `}} />

      <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
        />

        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200 shadow-lg"
          >
            {isDark ? <FaSun className="w-4 h-4 text-yellow-500" /> : <FaMoon className="w-4 h-4 text-blue-600" />}
          </button>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 lg:px-6 py-12">
          <div className="max-w-5xl w-full">
            <div className="text-center space-y-6 sm:space-y-8 mb-8 sm:mb-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 animate-pulse-ring">
                  <div className="w-full h-full rounded-full bg-blue-600/20 dark:bg-blue-400/20" />
                </div>
                <div 
                  className={`relative text-8xl sm:text-9xl lg:text-[12rem] font-black leading-none cursor-pointer ${glitchActive ? 'animate-glitch' : ''}`}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={() => setClickCount(prev => prev + 1)}
                  title="Click me 10 times for a surprise!"
                >
                  <span className="gradient-text">404</span>
                </div>
                {clickCount > 0 && clickCount < 10 && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {clickCount}/10 clicks
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  <FaCompass className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin-slow" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Lost in Space</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white px-4">
                  Oops! Page Not Found
                </h1>

                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-4">
                  The page you're looking for has gone on vacation. But don't worry, we'll help you find your way back!
                </p>

                <div className="pt-2">
                  <div className="inline-block px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium animate-fade-in-up">
                      {funFacts[currentFact]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-xl mx-auto mb-8 sm:mb-12 animate-fade-in-up stagger-2">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <FaSearch className="absolute left-3 sm:left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
              {quickLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.path}
                  className={`group p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover-lift animate-fade-in-up stagger-${idx + 1}`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <link.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1">{link.label}</h3>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Go <FaChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mb-8 sm:mb-12 animate-fade-in-up stagger-4">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">Popular Pages</h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Maybe you were looking for one of these?</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {popularPages.map((page, idx) => (
                  <Link
                    key={idx}
                    href={page.path}
                    className="group p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/30 transition-colors duration-300">
                        <page.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{page.title}</h3>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{page.description}</p>
                      </div>
                      <FaChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 animate-fade-in-up stagger-4">
              <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 animate-bounce-gentle">
                    <FaLightbulb className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-100 mb-1.5">Need Help?</h3>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mb-3">Check our documentation or reach out to support</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/docs" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                        <FaBook className="w-3 h-3" />
                        Read Docs
                      </Link>
                      <a href="mailto:support@aichixia.xyz" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-900 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 transition-colors duration-200">
                        <FaQuestionCircle className="w-3 h-3" />
                        Get Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 animate-float">
                    <FaMapMarkedAlt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-purple-900 dark:text-purple-100 mb-1.5">Explore More</h3>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mb-3">Discover all the features Aichixia has to offer</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/#features" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200">
                        <FaRocket className="w-3 h-3" />
                        View Features
                      </Link>
                      <Link href="/console" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-900 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900 transition-colors duration-200">
                        <FaTerminal className="w-3 h-3" />
                        Try Console
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 sm:mb-12 animate-fade-in-up stagger-4">
              <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border border-orange-200 dark:border-orange-900">
                <div className="text-center mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-orange-900 dark:text-orange-100 mb-2">Did You Know?</h3>
                  <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Click the 404 number above for a surprise! 🎉</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-orange-200 dark:border-orange-900 text-center">
                    <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mb-1">20+</div>
                    <p className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300">AI Models</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-orange-200 dark:border-orange-900 text-center">
                    <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mb-1">99.9%</div>
                    <p className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300">Uptime</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-orange-200 dark:border-orange-900 text-center">
                    <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mb-1">&lt;100ms</div>
                    <p className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300">Latency</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-orange-200 dark:border-orange-900 text-center">
                    <div className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 mb-1">Free</div>
                    <p className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300">To Start</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 sm:mb-12 animate-fade-in-up stagger-4">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2">Common Searches</h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">What others are looking for</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: "API Keys", path: "/console" },
                  { label: "Pricing", path: "/#pricing" },
                  { label: "Models List", path: "/docs#models" },
                  { label: "Quick Start", path: "/docs#quickstart" },
                  { label: "Examples", path: "/docs#examples" },
                  { label: "Rate Limits", path: "/docs#limits" },
                  { label: "Streaming", path: "/docs#streaming" },
                  { label: "SDKs", path: "/docs#sdks" },
                  { label: "Status Page", path: "/status" },
                  { label: "Changelog", path: "/changelog" },
                  { label: "Community", path: "/community" },
                  { label: "Blog", path: "/blog" }
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.path}
                    className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg transition-all duration-200 hover-lift"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-8 sm:mb-12 animate-fade-in-up stagger-4">
              <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Homepage
                  </Link>
                  <Link href="/docs" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Documentation
                  </Link>
                  <Link href="/console" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    API Console
                  </Link>
                  <Link href="/pricing" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Pricing
                  </Link>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Resources</h3>
                <div className="space-y-2">
                  <Link href="/blog" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Blog
                  </Link>
                  <Link href="/guides" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Guides
                  </Link>
                  <Link href="/tutorials" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Tutorials
                  </Link>
                  <Link href="/examples" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Examples
                  </Link>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Company</h3>
                <div className="space-y-2">
                  <Link href="/about" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    About Us
                  </Link>
                  <Link href="/careers" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Careers
                  </Link>
                  <Link href="/contact" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Contact
                  </Link>
                  <Link href="/security" className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                    <FaChevronRight className="w-3 h-3" />
                    Security
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4 animate-fade-in-up stagger-4">
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover-lift glow"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3">Connect with us</p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="https://github.com/aichixia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                  >
                    <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 dark:text-zinc-300" />
                  </a>
                  <a
                    href="https://twitter.com/aichixia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                  >
                    <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 dark:text-zinc-300" />
                  </a>
                  <a
                    href="https://discord.gg/aichixia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                  >
                    <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700 dark:text-zinc-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-4 z-10">
          <div className="flex flex-col gap-2">
            <div className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg">
              <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400">
                Error Code: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">404</span>
              </p>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg">
              <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400">
                Path: <span className="font-mono text-zinc-900 dark:text-white">{router.asPath}</span>
              </p>
            </div>
          </div>
        </div>

        <div 
          className="fixed w-6 h-6 rounded-full bg-blue-600/20 dark:bg-blue-400/20 pointer-events-none transition-all duration-200 ease-out z-50"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
            opacity: isHovering ? 1 : 0
          }}
        />

        {showEasterEgg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-bounce-gentle">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">You Found It!</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Congratulations on discovering our hidden easter egg! You're clearly someone who pays attention to details. 
                  That's exactly the kind of person we want using Aichixia!
                </p>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-purple-900 mb-4">
                  <p className="text-xs font-mono text-blue-700 dark:text-blue-300">
                    Secret Code: <span className="font-bold">CURIOUS_EXPLORER_2024</span>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Use this code in the console for a surprise! 😉
                  </p>
                </div>
                <button
                  onClick={() => setShowEasterEgg(false)}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Awesome!
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfetti && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-fade-in-up"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)],
                  animation: `fall ${2 + Math.random() * 3}s linear forwards`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
        `}} />

        <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </main>
    </>
  );
}
