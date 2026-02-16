import { useState, useEffect, useRef } from "react";
import { FaTerminal, FaPlay, FaCode, FaBook, FaRocket, FaArrowRight, FaMoon, FaSun, FaBars, FaTimes, FaCopy, FaCheck, FaKey, FaServer, FaGlobe, FaChevronDown, FaBolt, FaShieldAlt, FaClock, FaInfinity, FaCheckCircle, FaStar, FaUsers, FaChartLine, FaLock, FaCog, FaCloud, FaDatabase, FaLayerGroup, FaStream, FaCircle, FaExternalLinkAlt, FaGithub, FaTwitter, FaDiscord, FaBoxOpen, FaFileCode, FaLightbulb, FaRobot, FaSpinner, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const base = "https://www.aichixia.xyz";

const models = [
  { id: "deepseek-v3.2", name: "DeepSeek V3.2", provider: "DeepSeek", description: "Deep reasoning and code generation", color: "from-purple-500 to-pink-500" },
  { id: "claude-opus-4.5", name: "Claude Opus 4.5", provider: "Anthropic", description: "World's #1 AI model for complex tasks", color: "from-orange-500 to-red-500" },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google", description: "Multimodal understanding and accuracy", color: "from-blue-500 to-cyan-500" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI", description: "Balanced performance for general tasks", color: "from-green-500 to-emerald-500" },
  { id: "kimi-k2", name: "Kimi K2", provider: "Moonshot", description: "Superior tool calling and reasoning", color: "from-indigo-500 to-purple-500" },
  { id: "qwen3-235b", name: "Qwen3 235B", provider: "Alibaba", description: "Large multilingual model", color: "from-yellow-500 to-orange-500" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Meta", description: "Efficient open-source powerhouse", color: "from-teal-500 to-green-500" },
  { id: "mistral-3.1", name: "Mistral 3.1", provider: "Mistral AI", description: "Fast inference with European focus", color: "from-rose-500 to-pink-500" },
];

const features = [
  {
    icon: FaBolt,
    title: "Lightning Fast",
    description: "Sub-100ms latency with optimized routing to the fastest available model",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: FaShieldAlt,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption and zero data retention",
    gradient: "from-green-400 to-emerald-500"
  },
  {
    icon: FaInfinity,
    title: "Unlimited Scale",
    description: "Auto-scaling infrastructure handles any workload from 1 to 1M requests",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    icon: FaGlobe,
    title: "OpenAI Compatible",
    description: "Drop-in replacement for OpenAI API - migrate in minutes, not months",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    icon: FaClock,
    title: "99.9% Uptime",
    description: "Multi-region redundancy ensures your applications never go down",
    gradient: "from-red-400 to-pink-500"
  },
  {
    icon: FaCode,
    title: "Developer First",
    description: "Comprehensive SDKs, detailed docs, and responsive support when you need it",
    gradient: "from-indigo-400 to-purple-500"
  }
];

const quickStartSteps = [
  {
    step: "1",
    title: "Get Your API Key",
    description: "Sign up and generate your key in under 30 seconds. Free tier includes 1000 requests.",
    code: `curl https://console.aichixia.xyz/api/keys \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-key"}'`,
    icon: FaKey,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    step: "2",
    title: "Install SDK",
    description: "Use OpenAI's official SDK or any HTTP client. Works with all major languages.",
    code: `npm install openai
pip install openai
gem install ruby-openai
go get github.com/sashabaranov/go-openai`,
    icon: FaBoxOpen,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    step: "3",
    title: "Make Your First Call",
    description: "Start building AI-powered features with just a few lines of code.",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AICHIXIA_KEY,
  baseURL: "${base}/api/v1"
});

const response = await client.chat.completions.create({
  model: "deepseek-v3.2",
  messages: [{ role: "user", content: "Hello!" }]
});

console.log(response.choices[0].message.content);`,
    icon: FaRocket,
    gradient: "from-green-500 to-emerald-500"
  }
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for testing and small projects",
    features: [
      "1,000 requests/month",
      "All models included",
      "Community support",
      "Basic analytics",
      "99% uptime SLA"
    ],
    cta: "Start Free",
    popular: false,
    gradient: "from-zinc-500 to-zinc-600"
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing apps and startups",
    features: [
      "100,000 requests/month",
      "Priority model access",
      "Email support",
      "Advanced analytics",
      "99.9% uptime SLA",
      "Custom rate limits"
    ],
    cta: "Start Pro",
    popular: true,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large-scale production apps",
    features: [
      "Unlimited requests",
      "Dedicated infrastructure",
      "24/7 priority support",
      "Custom model training",
      "99.99% uptime SLA",
      "SOC 2 compliance",
      "Custom contracts"
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-purple-500 to-pink-500"
  }
];

const stats = [
  { label: "API Calls", value: "1.2B+", icon: FaChartLine },
  { label: "Developers", value: "50K+", icon: FaUsers },
  { label: "Uptime", value: "99.99%", icon: FaClock },
  { label: "Models", value: "20+", icon: FaRobot }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at TechStart",
    avatar: "SC",
    content: "Aichixia's API cut our AI infrastructure costs by 70% while improving response times. The OpenAI compatibility made migration seamless.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Lead Engineer at DataFlow",
    avatar: "MR",
    content: "Best AI API we've tested. Lightning fast, reliable, and the multi-model support lets us optimize for each use case.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Founder of CodeAssist",
    avatar: "EW",
    content: "The developer experience is incredible. Great docs, responsive support, and the playground made testing so much easier.",
    rating: 5
  }
];

const useCases = [
  {
    icon: FaRobot,
    title: "AI Chatbots",
    description: "Build conversational AI that understands context and responds naturally",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: FaFileCode,
    title: "Code Generation",
    description: "Generate, review, and debug code across all major programming languages",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: FaLightbulb,
    title: "Content Creation",
    description: "Create blog posts, marketing copy, and creative content at scale",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: FaChartLine,
    title: "Data Analysis",
    description: "Extract insights from data, generate reports, and visualize trends",
    gradient: "from-orange-500 to-red-500"
  }
];

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek-v3.2");
  const [message, setMessage] = useState("Explain quantum computing in simple terms");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRefs = useRef<{ [key: string]: IntersectionObserver }>({});

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => {
      const id = el.getAttribute('data-animate') || '';
      observerRefs.current[id] = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible((prev) => ({ ...prev, [id]: true }));
            }
          });
        },
        { threshold: 0.1 }
      );
      observerRefs.current[id].observe(el);
    });

    return () => {
      Object.values(observerRefs.current).forEach((observer) => observer.disconnect());
    };
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleSendRequest = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();

    try {
      const res = await fetch(`${base}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: "user", content: message }],
          temperature: 0.8,
          max_tokens: 1080,
        }),
      });

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (!res.ok) {
        setError(data.error?.message || "Request failed");
      } else {
        setResponse({ ...data, latency });
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurl = () => {
    return `curl -X POST ${base}/api/v1/chat/completions \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel}",
    "messages": [
      {"role": "user", "content": "${message}"}
    ]
  }'`;
  };

  const copyToClipboard = (text: string, type: 'request' | 'response') => {
    navigator.clipboard.writeText(text);
    if (type === 'request') {
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300 overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
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
        .stagger-delay-1 { animation-delay: 0.1s; }
        .stagger-delay-2 { animation-delay: 0.2s; }
        .stagger-delay-3 { animation-delay: 0.3s; }
        .stagger-delay-4 { animation-delay: 0.4s; }
        .stagger-delay-5 { animation-delay: 0.5s; }
        .stagger-delay-6 { animation-delay: 0.6s; }
      `}</style>

      <header 
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrollY > 20 
            ? 'border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-lg' 
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <FaTerminal className="w-4 h-4 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Aichixia</h1>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5">API Platform</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="#features"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
              >
                Features
              </Link>
              <Link
                href="#playground"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
              >
                Playground
              </Link>
              <Link
                href="#pricing"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
              >
                Docs
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                aria-label="Toggle theme"
              >
                {isDark ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
              </button>

              <Link
                href="/console"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <FaRocket className="w-3.5 h-3.5" />
                <span>Console</span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <nav className="flex flex-col p-4 space-y-2">
              <Link
                href="#features"
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#playground"
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Playground
              </Link>
              <Link
                href="#pricing"
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <Link
                href="/console"
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg shadow-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaRocket className="w-3.5 h-3.5" />
                <span>Console</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4 opacity-0 fade-in-up stagger-delay-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <FaStar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">20+ AI Models in One API</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight">
                Build AI Apps
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  10x Faster
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                One unified API for Claude, GPT, Gemini, and more. Switch models instantly, scale effortlessly, and ship AI features in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 fade-in-up stagger-delay-2">
              <Link
                href="/console"
                className="group flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <FaRocket className="w-5 h-5" />
                <span>Start Building Free</span>
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <Link
                href="/docs"
                className="group flex items-center gap-2 px-8 py-4 text-base font-bold text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <FaBook className="w-5 h-5" />
                <span>View Docs</span>
                <FaChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-12 opacity-0 fade-in-up stagger-delay-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="group p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950/50" id="features" data-animate="features">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center space-y-4 mb-16 transition-all duration-700 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
              <FaBolt className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Enterprise-Grade Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white">
              Everything You Need to Build
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Production-ready AI infrastructure with enterprise security, blazing-fast performance, and developer-first experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`group p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                  isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8" data-animate="quickstart">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center space-y-4 mb-16 transition-all duration-700 ${isVisible.quickstart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
              <FaRocket className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Get Started in 60 Seconds</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white">
              Quick Start Guide
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              From zero to production in three simple steps. No credit card required for free tier.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {quickStartSteps.map((step, idx) => (
              <div
                key={idx}
                className={`group relative transition-all duration-700 ${
                  isVisible.quickstart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
                onMouseEnter={() => setActiveStep(idx)}
              >
                <div className="relative h-full p-8 rounded-2xl bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-2xl transition-all duration-300">
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg flex items-center justify-center">
                    <span className="text-xl font-black text-white">{step.step}</span>
                  </div>

                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">{step.description}</p>

                  <div className="rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-200 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">terminal</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <SyntaxHighlighter
                        language={idx === 0 ? "bash" : idx === 1 ? "bash" : "javascript"}
                        style={isDark ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          padding: 0,
                          background: 'transparent',
                          fontSize: '11px',
                        }}
                        wrapLongLines={true}
                      >
                        {step.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>

                {idx < quickStartSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <FaChevronRight className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950/50" data-animate="usecases">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center space-y-4 mb-16 transition-all duration-700 ${isVisible.usecases ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50">
              <FaLightbulb className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">Endless Possibilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white">
              Built for Every Use Case
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              From chatbots to code generation, power any AI application with our versatile API.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className={`group p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                  isVisible.usecases ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${useCase.gradient} shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <useCase.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{useCase.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8" id="playground" data-animate="playground">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center space-y-4 mb-16 transition-all duration-700 ${isVisible.playground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              <FaPlay className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Try It Live</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white">
              Interactive API Playground
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Test our API right here. No signup required. Just add your key and start building.
            </p>
          </div>

          <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 ${isVisible.playground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Request Configuration</h3>
                  <FaCog className="w-5 h-5 text-zinc-400" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Model</label>
                    <button
                      onClick={() => setShowModelModal(true)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedModelData?.color} shadow-lg flex items-center justify-center`}>
                          <FaRobot className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">{selectedModelData?.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{selectedModelData?.provider}</div>
                        </div>
                      </div>
                      <FaChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors duration-200" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKeyInput ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                      />
                      <button
                        onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-200"
                      >
                        {showApiKeyInput ? <FaLock className="w-4 h-4 text-zinc-400" /> : <FaKey className="w-4 h-4 text-zinc-400" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Don't have an API key? <Link href="/console" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Get one free →</Link>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Enter your prompt..."
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSendRequest}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaPlay className="w-4 h-4" />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaTerminal className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">cURL Example</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateCurl(), 'request')}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors duration-200"
                  >
                    {copiedRequest ? (
                      <FaCheck className="w-4 h-4 text-green-500" />
                    ) : (
                      <FaCopy className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                </div>
                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-900 p-4 overflow-x-auto">
                  <SyntaxHighlighter
                    language="bash"
                    style={isDark ? oneDark : oneLight}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: 'transparent',
                      fontSize: '12px',
                    }}
                    wrapLongLines={true}
                  >
                    {generateCurl()}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FaTerminal className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Response</span>
                  </div>
                  {response && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(response, null, 2), 'response')}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors duration-200"
                    >
                      {copiedResponse ? (
                        <FaCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <FaCopy className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                  )}
                </div>

                {!response && !error && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-[320px] text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                      <FaTerminal className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Send a request to see the response</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-[320px]">
                    <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Processing your request...</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FaTimes className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-900 dark:text-red-200 mb-1">Error</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {response && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm text-zinc-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                        {response.choices?.[0]?.message?.content || "No content"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900/30">
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Total Tokens</div>
                        <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                          {response.usage?.total_tokens || 0}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 border border-cyan-200 dark:border-cyan-900/30">
                        <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Latency</div>
                        <div className="text-2xl font-black text-cyan-700 dark:text-cyan-300">
                          {response.latency || 0}ms
                        </div>
                      </div>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-2">
                        <span className="inline-flex items-center gap-2">
                          <FaChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform duration-200" />
                          View Full Response
                        </span>
                      </summary>
                      <div className="mt-3 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                        <pre className="text-xs text-zinc-700 dark:text-zinc-300">
                          {JSON.stringify(response, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950/50" id="pricing" data-animate="pricing">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center space-y-4 mb-16 transition-all duration-700 ${isVisible.pricing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
              <FaCheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">Simple, Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white">
              Start Free, Scale as You Grow
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              No hidden fees. No surprises. Pay only for what you use.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-2xl transition-all duration-700 hover:scale-105 ${
                  plan.popular 
                    ? 'bg-white dark:bg-zinc-950 border-2 border-blue-500 dark:border-blue-400 shadow-2xl shadow-blue-500/20' 
                    : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl'
                } ${isVisible.pricing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                    <span className="text-xs font-bold text-white">Most Popular</span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-5xl font-black text-zinc-900 dark:text-white">{plan.price}</span>
                    <span className="text-lg text-zinc-500 dark:text-zinc-400">{plan.period}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center mt-0.5`}>
                        <FaCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/console"
                  className={`block w-full text-center px-6 py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                      : 'text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8" data-animate="testimonials">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center space-y-4 mb-16 transition-all duration-700 ${isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50">
              <FaStar className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">Loved by Developers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white">
              What Our Users Say
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Join thousands of developers building the future with Aichixia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                  isVisible.testimonials ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 animate-gradient" data-animate="cta">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`space-y-8 transition-all duration-700 ${isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <FaRocket className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">Ready to Build?</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Start Building AI Apps Today
            </h2>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join 50,000+ developers using Aichixia to power their AI applications. Get started in 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/console"
                className="group flex items-center gap-2 px-8 py-4 text-base font-bold text-blue-600 bg-white hover:bg-zinc-50 rounded-xl shadow-2xl hover:shadow-white/30 transition-all duration-300 hover:scale-105"
              >
                <FaRocket className="w-5 h-5" />
                <span>Get Started Free</span>
                <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <Link
                href="/docs"
                className="group flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                <FaBook className="w-5 h-5" />
                <span>Read Documentation</span>
                <FaExternalLinkAlt className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowModelModal(false)}>
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-zinc-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">Select AI Model</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Choose from 20+ state-of-the-art models</p>
              </div>
              <button
                onClick={() => setShowModelModal(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors duration-200"
              >
                <FaTimes className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelModal(false);
                    }}
                    className={`relative p-6 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                      selectedModel === model.id
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/20'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} shadow-lg flex items-center justify-center`}>
                        <FaRobot className="w-6 h-6 text-white" />
                      </div>
                      {selectedModel === model.id && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center">
                          <FaCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{model.name}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{model.provider}</div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <FaTerminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">Aichixia</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">AI API Platform</p>
                </div>
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
                Build powerful AI applications with one unified API. Access 20+ models from OpenAI, Anthropic, Google, and more.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://github.com/aichiversee" className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">
                  <FaGithub className="w-5 h-5" />
                </a>
                <a href="Aichiverse" className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200">
                  <FaDiscord className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">Features</Link></li>
                <li><Link href="#playground" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">Playground</Link></li>
                <li><Link href="#pricing" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">Pricing</Link></li>
                <li><Link href="/console" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">Console</Link></li>
              </ul>
            </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              © {new Date().getFullYear()} Aichixia. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">
                Terms
              </Link>
              <Link href="/security" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
