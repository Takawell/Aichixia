import { useState, useRef, useEffect, useCallback } from "react";
import { 
  FaPaperPlane, FaTrash, FaUser, FaHome, FaCircle, FaChevronDown, 
  FaAngry, FaSmile, FaBriefcase, FaHeart, FaFire, FaBook, FaQuestion, 
  FaSearch, FaCode, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaDownload,
  FaCopy, FaCheck, FaEllipsisV, FaImage, FaMicrophone, FaStop, FaRedo,
  FaTimes, FaSparkles, FaRobot, FaMagic, FaWandMagicSparkles, FaBolt,
  FaStar, FaMoon, FaSun, FaCog, FaHistory, FaShare, FaThumbsUp, FaThumbsDown,
  FaRegClock, FaRegEdit, FaRegTrashAlt, FaRegCopy, FaRegCheckCircle,
  FaArrowUp, FaArrowDown, FaExpand, FaCompress, FaKeyboard, FaInfoCircle,
  FaRegLightbulb, FaRegCommentDots, FaPaperclip, FaRegImage, FaRegFile,
  FaExternalLinkAlt, FaRegBookmark, FaBookmark, FaSync, FaRegSmile, FaHashtag
} from "react-icons/fa";
import { 
  SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, 
  SiDigikeyelectronics, SiFlux, SiXiaomi, SiMaze, SiMatternet, 
  SiImagedotsc, SiAirbrake, SiSecurityscorecard, SiLapce, SiDiscord,
  SiGithub, SiTwitter, SiYoutube, SiLinkedin
} from "react-icons/si";
import { 
  GiSpermWhale, GiPowerLightning, GiBlackHoleBolas, GiClover, 
  GiFire, GiCrystalBall, GiBrain, GiRobotGolem
} from "react-icons/gi";
import { TbSquareLetterZ, TbLetterM, TbMessageChatbot } from "react-icons/tb";
import { FaXTwitter } from "react-icons/fa6";
import { 
  MdOutlineAutoAwesome, MdOutlineChat, MdOutlineSmartToy,
  MdOutlinePsychology, MdOutlinePalette, MdOutlineSpeed,
  MdOutlineSecurity, MdOutlineLanguage
} from "react-icons/md";
import { 
  BsLightningCharge, BsStars, BsGraphUp, BsCpu, BsGpuCard,
  BsShieldCheck, BsGlobe, BsLayers
} from "react-icons/bs";
import { 
  RiSparklingFill, RiAiGenerate, RiBrainLine, RiMessage3Line,
  RiSettings4Line, RiNotification3Line, RiUserSmileLine
} from "react-icons/ri";
import { 
  HiOutlineLightBulb, HiOutlineChatAlt2, HiOutlineChip,
  HiOutlineColorSwatch, HiOutlineCursorClick
} from "react-icons/hi";
import { 
  IoSparkles, IoFlash, IoColorPalette, IoRocket,
  IoDiamond, IoInfinite, IoPulse
} from "react-icons/io5";
import { 
  LuBrain, LuZap, LuSparkles, LuMessageSquare,
  LuSettings, LuHistory, LuShare2
} from "react-icons/lu";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  isImage?: boolean;
  audioUrl?: string;
  liked?: boolean;
  disliked?: boolean;
};

type Persona = "tsundere" | "friendly" | "professional" | "kawaii" | "sarcastic" | "wise";

type Model = {
  id: string;
  name: string;
  endpoint: string;
  icon: any;
  color: string;
  type?: "text" | "image" | "tts";
  description?: string;
  tags?: string[];
};

type QuickAction = {
  id: string;
  label: string;
  icon: any;
  prompt: string;
  color: string;
};

const personaConfig: Record<Persona, { name: string; description: string; color: string; icon: any; gradient: string }> = {
  tsundere: {
    name: "Tsundere",
    description: "B-baka! Classic tsundere personality",
    color: "from-pink-500 to-rose-500",
    icon: FaAngry,
    gradient: "bg-gradient-to-r from-pink-500 via-rose-500 to-red-500"
  },
  friendly: {
    name: "Friendly",
    description: "Warm and welcoming companion",
    color: "from-green-500 to-emerald-500",
    icon: FaSmile,
    gradient: "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"
  },
  professional: {
    name: "Professional",
    description: "Formal and efficient expert",
    color: "from-blue-500 to-indigo-500",
    icon: FaBriefcase,
    gradient: "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
  },
  kawaii: {
    name: "Kawaii",
    description: "Super cute and energetic!",
    color: "from-purple-500 to-pink-500",
    icon: FaHeart,
    gradient: "bg-gradient-to-r from-purple-400 via-pink-500 to-rose-400"
  },
  sarcastic: {
    name: "Sarcastic",
    description: "Witty with a sharp tongue",
    color: "from-orange-500 to-amber-500",
    icon: GiBrain,
    gradient: "bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400"
  },
  wise: {
    name: "Wise",
    description: "Thoughtful and philosophical",
    color: "from-violet-500 to-purple-500",
    icon: GiCrystalBall,
    gradient: "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
  }
};

const models: Model[] = [
  {
    id: "chat",
    name: "Aichixia Pro",
    endpoint: "/api/chat",
    icon: GiBlackHoleBolas,
    color: "from-sky-500 to-blue-500",
    type: "text",
    description: "Balanced performance for everyday tasks",
    tags: ["recommended", "balanced"]
  },
  {
    id: "aichixia",
    name: "Aichixia 411B",
    endpoint: "/api/models/aichixia",
    icon: SiAirbrake,
    color: "from-blue-600 via-blue-800 to-slate-900",
    type: "text",
    description: "Massive 411B parameter model",
    tags: ["powerful", "large"]
  },
  {
    id: "flux",
    name: "Flux 2",
    endpoint: "/api/models/flux",
    icon: SiFlux,
    color: "from-purple-500 to-pink-500",
    type: "image",
    description: "State-of-the-art image generation",
    tags: ["image", "creative"]
  },
  {
    id: "grok",
    name: "Grok 3",
    endpoint: "/api/models/grok",
    icon: FaXTwitter,
    color: "from-slate-700 via-slate-900 to-black",
    type: "text",
    description: "X's latest AI with real-time knowledge",
    tags: ["xai", "realtime"]
  },
  {
    id: "kimi",
    name: "Kimi K2",
    endpoint: "/api/models/kimi",
    icon: SiDigikeyelectronics,
    color: "from-blue-500 to-black-500",
    type: "text",
    description: "Moonshot's advanced reasoning model",
    tags: ["reasoning", "long-context"]
  },
  {
    id: "glm",
    name: "GLM 4.7",
    endpoint: "/api/models/glm",
    icon: TbSquareLetterZ,
    color: "from-[#1835D4] to-[#010B24]",
    type: "text",
    description: "Zhipu AI's flagship model",
    tags: ["chinese", "coding"]
  },
  {
    id: "mistral",
    name: "Mistral 3.1",
    endpoint: "/api/models/mistral",
    icon: TbLetterM,
    color: "from-[#FF4F00] to-[#FF9000]",
    type: "text",
    description: "European frontier AI model",
    tags: ["european", "efficient"]
  },
  {
    id: "gpt4mini",
    name: "GPT-5 Mini",
    endpoint: "/api/models/openai",
    icon: SiOpenai,
    color: "from-green-500 to-emerald-500",
    type: "text",
    description: "OpenAI's fast and affordable model",
    tags: ["fast", "affordable"]
  },
  {
    id: "lucid",
    name: "Lucid Origin",
    endpoint: "/api/models/lucid",
    icon: SiImagedotsc,
    color: "from-red-500 to-orange-500",
    type: "image",
    description: "Artistic image generation specialist",
    tags: ["image", "artistic"]
  },
  {
    id: "lindsay",
    name: "Lindsay TTS",
    endpoint: "/api/models/lindsay",
    icon: SiLapce,
    color: "from-rose-500 to-pink-500",
    type: "tts",
    description: "Natural-sounding voice synthesis",
    tags: ["voice", "tts"]
  },
  {
    id: "phoenix",
    name: "Phoenix 1.0",
    endpoint: "/api/models/phoenix",
    icon: GiFire,
    color: "from-red-500 to-orange-500",
    type: "image",
    description: "Phoenix image generation model",
    tags: ["image", "phoenix"]
  },
  {
    id: "qwen3",
    name: "Qwen3 235B",
    endpoint: "/api/models/qwen3",
    icon: SiMatternet,
    color: "from-purple-500 to-pink-500",
    type: "text",
    description: "Alibaba's massive language model",
    tags: ["chinese", "multilingual"]
  },
  {
    id: "starling",
    name: "Starling TTS",
    endpoint: "/api/models/starling",
    icon: SiSecurityscorecard,
    color: "from-violet-500 to-purple-500",
    type: "tts",
    description: "Expressive text-to-speech",
    tags: ["voice", "expressive"]
  },
  {
    id: "minimax",
    name: "MiniMax M2.1",
    endpoint: "/api/models/minimax",
    icon: SiMaze,
    color: "from-cyan-500 to-blue-500",
    type: "text",
    description: "MiniMax's conversational AI",
    tags: ["conversational", "creative"]
  },
  {
    id: "llama",
    name: "Llama 3.3 70B",
    endpoint: "/api/models/llama",
    icon: SiMeta,
    color: "from-orange-500 to-red-500",
    type: "text",
    description: "Meta's open-source powerhouse",
    tags: ["open-source", "meta"]
  },
  {
    id: "gptoss",
    name: "GPT-OSS 120B",
    endpoint: "/api/models/gptoss",
    icon: SiOpenai,
    color: "from-pink-500 to-rose-500",
    type: "text",
    description: "OpenAI's open-source release",
    tags: ["open-source", "gpt"]
  },
  {
    id: "gemini",
    name: "Gemini 3 Flash",
    endpoint: "/api/models/gemini",
    icon: SiGooglegemini,
    color: "from-indigo-500 to-purple-500",
    type: "text",
    description: "Google's fastest multimodal model",
    tags: ["google", "multimodal"]
  },
  {
    id: "mimo",
    name: "MiMo V2 Flash",
    endpoint: "/api/models/mimo",
    icon: SiXiaomi,
    color: "from-blue-500 to-purple-500",
    type: "text",
    description: "Xiaomi's efficient AI assistant",
    tags: ["xiaomi", "efficient"]
  },
  {
    id: "deepseek-v",
    name: "DeepSeek V3.1",
    endpoint: "/api/models/deepseek-v",
    icon: GiSpermWhale,
    color: "from-cyan-500 to-blue-500",
    type: "text",
    description: "DeepSeek's coding specialist",
    tags: ["coding", "chinese"]
  },
  {
    id: "deepseek",
    name: "DeepSeek V3.2",
    endpoint: "/api/models/deepseek",
    icon: GiSpermWhale,
    color: "from-cyan-500 to-blue-500",
    type: "text",
    description: "Latest DeepSeek with reasoning",
    tags: ["reasoning", "latest"]
  },
  {
    id: "compound",
    name: "Groq Compound",
    endpoint: "/api/models/compound",
    icon: GiPowerLightning,
    color: "from-orange-500 to-blue-500",
    type: "text",
    description: "Ultra-fast inference on Groq",
    tags: ["fast", "groq"]
  },
  {
    id: "claude",
    name: "Claude Opus 4.5",
    endpoint: "/api/models/claude",
    icon: SiAnthropic,
    color: "from-orange-500 to-purple-500",
    type: "text",
    description: "Anthropic's most capable model",
    tags: ["anthropic", "capable"]
  },
  {
    id: "nano",
    name: "Nano Banana Pro",
    endpoint: "/api/models/nano",
    icon: SiGooglegemini,
    color: "from-yellow-400 to-orange-400",
    type: "image",
    description: "Lightning-fast image generation",
    tags: ["image", "fast"]
  },
  {
    id: "qwen",
    name: "Qwen3 Coder 480B",
    endpoint: "/api/models/qwen",
    icon: SiAlibabacloud,
    color: "from-purple-500 to-pink-500",
    type: "text",
    description: "Massive coding specialist",
    tags: ["coding", "massive"]
  },
  {
    id: "cohere",
    name: "Cohere Command A",
    endpoint: "/api/models/cohere",
    icon: GiClover,
    color: "from-emerald-500 to-purple-500",
    type: "text",
    description: "Enterprise-grade AI model",
    tags: ["enterprise", "reliable"]
  }
];

const quickActions: QuickAction[] = [
  { id: "1", label: "Explain code", icon: FaCode, prompt: "Explain this code to me:", color: "from-blue-500 to-cyan-500" },
  { id: "2", label: "Write story", icon: FaBook, prompt: "Write a creative short story about", color: "from-purple-500 to-pink-500" },
  { id: "3", label: "Brainstorm", icon: HiOutlineLightBulb, prompt: "Help me brainstorm ideas for", color: "from-amber-500 to-orange-500" },
  { id: "4", label: "Summarize", icon: BsLayers, prompt: "Summarize the following:", color: "from-green-500 to-emerald-500" },
  { id: "5", label: "Translate", icon: MdOutlineLanguage, prompt: "Translate this to English:", color: "from-indigo-500 to-violet-500" },
  { id: "6", label: "Debug help", icon: BsCpu, prompt: "Help me debug this issue:", color: "from-red-500 to-rose-500" }
];

const generateId = () => Math.random().toString(36).substring(2, 15);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [persona, setPersona] = useState<Persona>("friendly");
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatTitle, setChatTitle] = useState("New Chat");
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [messageAnimations, setMessageAnimations] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<{id: string; title: string; date: Date; preview: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(30);
  const [streamResponse, setStreamResponse] = useState(true);
  const [codeTheme, setCodeTheme] = useState<"dark" | "light">("dark");
  const [markdownEnabled, setMarkdownEnabled] = useState(true);
  const [latexEnabled, setLatexEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [apiStatus, setApiStatus] = useState<"online" | "degraded" | "offline">("online");
  const [showApiStatus, setShowApiStatus] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: "success" | "error" | "info"} | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [shortcutModalOpen, setShortcutModalOpen] = useState(false);
  const [welcomeAnimation, setWelcomeAnimation] = useState(true);
  const [glowEffect, setGlowEffect] = useState(true);
  const [particleEffects, setParticleEffects] = useState(true);
  const [blurBackground, setBlurBackground] = useState(true);
  const [glassmorphism, setGlassmorphism] = useState(true);
  const [accentColor, setAccentColor] = useState("sky");
  const [borderRadius, setBorderRadius] = useState<"sm" | "md" | "lg" | "xl" | "2xl">("2xl");
  const [shadowIntensity, setShadowIntensity] = useState<"none" | "sm" | "md" | "lg" | "xl">("lg");
  const [animationSpeed, setAnimationSpeed] = useState<"slow" | "normal" | "fast">("normal");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentColors: Record<string, { primary: string; secondary: string; gradient: string }> = {
    sky: { primary: "sky-500", secondary: "blue-500", gradient: "from-sky-500 to-blue-500" },
    purple: { primary: "purple-500", secondary: "violet-500", gradient: "from-purple-500 to-violet-500" },
    emerald: { primary: "emerald-500", secondary: "green-500", gradient: "from-emerald-500 to-green-500" },
    rose: { primary: "rose-500", secondary: "pink-500", gradient: "from-rose-500 to-pink-500" },
    amber: { primary: "amber-500", secondary: "orange-500", gradient: "from-amber-500 to-orange-500" },
    indigo: { primary: "indigo-500", secondary: "purple-500", gradient: "from-indigo-500 to-purple-500" }
  };

  const getAccent = () => accentColors[accentColor];

  useEffect(() => {
    const timer = setTimeout(() => setWelcomeAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("aichixia-chat-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch {}
    }
    const savedHistory = localStorage.getItem("aichixia-chat-sessions");
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory).map((h: any) => ({ ...h, date: new Date(h.date) })));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("aichixia-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
    };
  }, [currentAudio]);

  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(progress);
        setShowScrollToBottom(scrollTop < scrollHeight - clientHeight - 200);
      }
    };
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (searchQuery && messages.length > 0) {
      const filtered = messages.filter(m => 
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
      setCurrentSearchIndex(0);
    } else {
      setFilteredMessages([]);
    }
  }, [searchQuery, messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, autoScroll, scrollToBottom]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    model.description?.toLowerCase().includes(modelSearch.toLowerCase()) ||
    model.tags?.some(tag => tag.toLowerCase().includes(modelSearch.toLowerCase()))
  );

  const handlePlayAudio = (audioUrl: string, messageId: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
    }
    if (playingMessageId === messageId) {
      setCurrentAudio(null);
      setPlayingMessageId(null);
      return;
    }
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setPlayingMessageId(null);
      setCurrentAudio(null);
    };
    audio.onerror = () => {
      showToast("Audio playback failed", "error");
      setPlayingMessageId(null);
      setCurrentAudio(null);
    };
    audio.play().catch(() => {
      showToast("Could not play audio", "error");
    });
    setCurrentAudio(audio);
    setPlayingMessageId(messageId);
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleLike = (id: string) => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, liked: !m.liked, disliked: false } : m
    ));
  };

  const handleDislike = (id: string) => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, disliked: !m.disliked, liked: false } : m
    ));
  };

  const handleDownloadAudio = (audioUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Download started!", "success");
  };

  const handleDownloadImage = (imageBase64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = `data:image/jpeg;base64,${imageBase64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Image downloaded!", "success");
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setRecordingTime(0);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);
    setShowQuickActions(false);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    try {
      const response = await fetch(selectedModel.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedModel.type === "image"
            ? { prompt: userMessage.content, steps: 4 }
            : selectedModel.type === "tts"
            ? { 
                text: userMessage.content,
                emotion: persona === "tsundere" ? "angry" : persona === "friendly" ? "happy" : "normal",
                volume: 100,
                pitch: persona === "kawaii" ? 2 : 0,
                tempo: 1
              }
            : {
                message: userMessage.content,
                history: messages.slice(-10).map(m => ({
                  role: m.role,
                  content: m.content
                })),
                persona: persona === "tsundere" ? undefined : personaConfig[persona].description,
                temperature,
                max_tokens: maxTokens
              }
        )
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }
      await new Promise(resolve => setTimeout(resolve, reduceMotion ? 100 : 500));
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: selectedModel.type === "image" 
          ? data.imageBase64 
          : selectedModel.type === "tts"
          ? userMessage.content
          : data.reply,
        timestamp: new Date(),
        provider: selectedModel.type === "tts" ? selectedModel.id : data.provider,
        isImage: selectedModel.type === "image",
        ...(selectedModel.type === "tts" && data.audio && { audioUrl: data.audio })
      };
      setMessages(prev => [...prev, aiMessage]);
      if (selectedModel.type === "tts" && data.audio) {
        const audio = new Audio(data.audio);
        audio.onended = () => setCurrentAudio(null);
        audio.play().catch(() => {});
        setCurrentAudio(audio);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: selectedModel.type === "tts" 
          ? "Gomen! TTS generation failed... Please check your API key!"
          : "Gomen! Something went wrong... Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      showToast("Request failed", "error");
    } finally {
      setLoading(false);
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "/" && !input) {
      e.preventDefault();
      setShowQuickActions(true);
    }
    if (e.key === "Escape") {
      setShowPersonaMenu(false);
      setShowModelMenu(false);
      setShowSuggestions(false);
    }
  };

  const clearChat = () => {
    if (confirm("Clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem("aichixia-chat-history");
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
        setCurrentAudio(null);
        setPlayingMessageId(null);
      }
      setShowQuickActions(true);
      showToast("Chat cleared!", "success");
    }
  };

  const regenerateResponse = async (messageIndex: number) => {
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== "user") return;
    setMessages(prev => prev.slice(0, messageIndex));
    setLoading(true);
    setTyping(true);
    try {
      const response = await fetch(selectedModel.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(0, messageIndex - 1).slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
          persona: persona === "tsundere" ? undefined : personaConfig[persona].description,
          temperature,
          max_tokens: maxTokens
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        provider: data.provider
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      showToast("Regeneration failed", "error");
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const getProviderBadge = (provider?: string) => {
    if (!provider) return null;
    const colors: Record<string, string> = {
      glm: "bg-[#1835D4]",
      grok: "bg-[#000000] border border-slate-700",
      kimi: "bg-[#0091FF]",
      nano: "bg-[#BDAA5D]",
      mimo: "bg-[#FFB800]",
      openai: "bg-slate-800",
      gemini: "bg-blue-500",
      mistral: "bg-[#FF4F00]",
      deepseek: "bg-indigo-500",
      qwen: "bg-violet-700",
      gptoss: "bg-pink-500",
      claude: "bg-[#d97757]",
      cohere: "bg-[#3d5941]",
      compound: "bg-[#F55036]",
      llama: "bg-[#0668E1]",
      flux: "bg-purple-500",
      lucid: "bg-teal-500",
      phoenix: "bg-orange-500",
      minimax: "bg-red-500",
      aichixia: "bg-[#0a1628] border border-cyan-500/50",
      starling: "bg-gradient-to-r from-violet-500 to-purple-500",
      lindsay: "bg-gradient-to-r from-rose-500 to-pink-500"
    };
    return (
      <span className={`text-[9px] px-2 py-0.5 rounded-full text-white font-semibold ${colors[provider] || "bg-gray-500"}`}>
        {provider.toUpperCase()}
      </span>
    );
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-xs";
      case "lg": return "text-base";
      default: return "text-sm";
    }
  };

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case "sm": return "rounded-sm";
      case "md": return "rounded-md";
      case "lg": return "rounded-lg";
      case "xl": return "rounded-xl";
      case "2xl": return "rounded-2xl";
      default: return "rounded-2xl";
    }
  };

  const getShadowClass = () => {
    switch (shadowIntensity) {
      case "none": return "";
      case "sm": return "shadow-sm";
      case "md": return "shadow-md";
      case "lg": return "shadow-lg";
      case "xl": return "shadow-xl";
      default: return "shadow-lg";
    }
  };

  const PersonaIcon = personaConfig[persona].icon;
  const ModelIcon = selectedModel.icon;
  const accent = getAccent();

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "dark" : ""}`}>
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeInOut" }}
            className={`${sidebarCollapsed ? "w-16" : "w-72"} bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col z-20`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                    <GiBlackHoleBolas className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-100">Aichixia</h2>
                    <p className="text-xs text-slate-400">AI Assistant</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? <FaChevronDown className="rotate-90 text-slate-400" /> : <FaChevronDown className="-rotate-90 text-slate-400" />}
              </button>
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="p-3">
                  <button
                    onClick={() => {
                      setMessages([]);
                      setChatTitle("New Chat");
                      setShowQuickActions(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl transition-all group"
                  >
                    <FaPlus className="text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sky-400 font-medium">New Chat</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Recent Chats</div>
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      <FaHistory className="mx-auto mb-2 text-2xl opacity-50" />
                      No chat history yet
                    </div>
                  ) : (
                    chatHistory.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => setChatTitle(chat.title)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <TbMessageChatbot className="text-slate-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-300 truncate group-hover:text-slate-200">{chat.title}</div>
                            <div className="text-xs text-slate-500 truncate">{chat.preview}</div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-slate-800">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-slate-200"
                  >
                    <FaCog />
                    <span className="text-sm">Settings</span>
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 relative">
        {blurBackground && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
          </div>
        )}

        <motion.header
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
          className={`relative ${glassmorphism ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl" : "bg-white dark:bg-slate-900"} border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between z-10`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FaEllipsisV className="text-slate-600 dark:text-slate-400" />
            </button>
            <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <FaHome className="text-slate-600 dark:text-slate-400" />
            </Link>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="w-10 h-10 rounded-full border-2 border-sky-400 dark:border-sky-500 shadow-lg"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"
                />
              </motion.div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Aichixia 5.0
                  <span className={`text-[10px] px-2 py-0.5 bg-gradient-to-r ${accent.gradient} text-white rounded-full`}>PRO</span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${showSearch ? "bg-sky-500/20 text-sky-500" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
            >
              <FaSearch size={16} />
            </button>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${personaConfig[persona].gradient}`}>
                  <PersonaIcon className="text-white text-xs" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">{personaConfig[persona].name}</span>
                <FaChevronDown size={10} className={`text-slate-500 transition-transform ${showPersonaMenu ? "rotate-180" : ""}`} />
              </motion.button>
              <AnimatePresence>
                {showPersonaMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Persona</div>
                    </div>
                    {(Object.keys(personaConfig) as Persona[]).map((p) => {
                      const Icon = personaConfig[p].icon;
                      return (
                        <motion.button
                          key={p}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            setPersona(p);
                            setShowPersonaMenu(false);
                            showToast(`Switched to ${personaConfig[p].name}`, "success");
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3 ${persona === p ? "bg-sky-50 dark:bg-sky-900/20" : ""}`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${personaConfig[p].gradient}`}>
                            <Icon className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{personaConfig[p].name}</div>
                            <div className="text-xs text-slate-500">{personaConfig[p].description}</div>
                          </div>
                          {persona === p && <FaCheck className="text-sky-500 text-xs" />}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChat}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl transition-colors"
            >
              <FaTrash size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-colors"
            >
              {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3"
            >
              <div className="max-w-2xl mx-auto relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-11 pr-20 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                />
                {filteredMessages.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{currentSearchIndex + 1} / {filteredMessages.length}</span>
                    <button
                      onClick={() => setCurrentSearchIndex(prev => Math.max(0, prev - 1))}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      <FaArrowUp size={10} />
                    </button>
                    <button
                      onClick={() => setCurrentSearchIndex(prev => Math.min(filteredMessages.length - 1, prev + 1))}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      <FaArrowDown size={10} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden relative">
          <div
            ref={messagesContainerRef}
            className="h-full overflow-y-auto px-4 py-6 scroll-smooth"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.length === 0 && showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: reduceMotion ? 0 : 0.6 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative mb-8"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${accent.gradient} blur-3xl opacity-30 rounded-full scale-150`} />
                      <img
                        src="https://aichiow.vercel.app/aichixia.png"
                        alt="Aichixia"
                        className="relative w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center"
                      >
                        <FaCircle size={10} className="text-white" />
                      </motion.div>
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2"
                    >
                      Konnichiwa! <FaHeart className="text-pink-500" />
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-slate-600 dark:text-slate-400 max-w-md mb-8"
                    >
                      I'm Aichixia, your AI companion powered by the world's best models. What can I help you with today?
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl w-full"
                    >
                      {quickActions.map((action, i) => (
                        <motion.button
                          key={action.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setInput(action.prompt)}
                          className={`flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 ${getBorderRadiusClass()} transition-all hover:shadow-lg group text-left`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="text-white text-sm" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3 }}
                    layout
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    onMouseEnter={() => setHoveredMessage(msg.id)}
                    onMouseLeave={() => setHoveredMessage(null)}
                  >
                    {msg.role === "assistant" && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex-shrink-0"
                      >
                        <img
                          src="https://aichiow.vercel.app/aichixia.png"
                          alt="Aichixia"
                          className="w-9 h-9 rounded-full border-2 border-sky-400 dark:border-sky-500 shadow-md"
                        />
                      </motion.div>
                    )}

                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`relative px-4 py-3 ${getBorderRadiusClass()} ${getShadowClass()} overflow-hidden ${
                          msg.role === "user"
                            ? `bg-gradient-to-r ${accent.gradient} text-white ${borderRadius === "2xl" ? "rounded-tr-sm" : ""}`
                            : `bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 ${borderRadius === "2xl" ? "rounded-tl-sm" : ""}`
                        }`}
                      >
                        {glowEffect && msg.role === "user" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
                        )}
                        {msg.role === "assistant" ? (
                          msg.isImage ? (
                            <div className="relative group">
                              <motion.img
                                whileHover={{ scale: 1.02 }}
                                src={`data:image/jpeg;base64,${msg.content}`}
                                alt="Generated"
                                className={`${getBorderRadiusClass()} shadow-lg max-w-full h-auto cursor-pointer`}
                                onClick={() => setFullscreenImage(msg.content)}
                              />
                              <motion.button
                                initial={{ opacity: 0 }}
                                whileHover={{ scale: 1.1 }}
                                animate={{ opacity: hoveredMessage === msg.id ? 1 : 0 }}
                                onClick={() => handleDownloadImage(msg.content, `image-${Date.now()}.jpg`)}
                                className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-sm transition-all"
                              >
                                <FaDownload size={14} />
                              </motion.button>
                            </div>
                          ) : msg.audioUrl ? (
                            <div className="flex flex-col gap-3 min-w-[240px]">
                              <div className="flex items-center gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handlePlayAudio(msg.audioUrl!, msg.id)}
                                  className="p-3 bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg"
                                >
                                  {playingMessageId === msg.id ? <FaPause size={14} /> : <FaPlay size={14} />}
                                </motion.button>
                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <motion.div
                                    animate={{ width: playingMessageId === msg.id ? ["0%", "100%"] : "0%" }}
                                    transition={{ duration: 30, ease: "linear" }}
                                    className="h-full bg-violet-500"
                                  />
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => handleDownloadAudio(msg.audioUrl!, `audio-${Date.now()}.mp3`)}
                                  className="p-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl"
                                >
                                  <FaDownload size={14} />
                                </motion.button>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{msg.content}"</p>
                            </div>
                          ) : (
                            <div className={`prose prose-sm dark:prose-invert max-w-none ${getFontSizeClass()}`}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )
                        ) : (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                        )}
                      </motion.div>

                      <AnimatePresence>
                        {hoveredMessage === msg.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-1 mt-1.5"
                          >
                            {showTimestamps && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                            {msg.role === "assistant" && msg.provider && getProviderBadge(msg.provider)}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                              {copiedId === msg.id ? <FaCheck size={12} className="text-emerald-500" /> : <FaCopy size={12} />}
                            </motion.button>
                            {msg.role === "assistant" && !msg.isImage && !msg.audioUrl && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => handleLike(msg.id)}
                                  className={`p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors ${msg.liked ? "text-pink-500" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                  <FaThumbsUp size={12} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => handleDislike(msg.id)}
                                  className={`p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors ${msg.disliked ? "text-red-500" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                  <FaThumbsDown size={12} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => regenerateResponse(idx)}
                                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  <FaRedo size={12} />
                                </motion.button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {msg.role === "user" && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex-shrink-0"
                      >
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800 shadow-md`}>
                          <FaUser size={14} />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-3 justify-start"
                  >
                    <img
                      src="https://aichiow.vercel.app/aichixia.png"
                      alt="Aichixia"
                      className="w-9 h-9 rounded-full border-2 border-sky-400 dark:border-sky-500"
                    />
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${getBorderRadiusClass()} ${getShadowClass()} overflow-hidden min-w-[280px] max-w-[350px]`}
                    >
                      <div className={`px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-800/30 border-b border-slate-200 dark:border-slate-700`}>
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className={`p-2 rounded-lg bg-gradient-to-r ${selectedModel.color}`}
                          >
                            <ModelIcon className="text-white text-sm" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedModel.name}</div>
                            <div className="text-xs text-slate-500">
                              {selectedModel.type === "image" ? "Generating image..." : selectedModel.type === "tts" ? "Synthesizing voice..." : "Thinking..."}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-4">
                        <div className="flex gap-2 items-center">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ 
                                y: [0, -8, 0],
                                opacity: [0.4, 1, 0.4]
                              }}
                              transition={{ 
                                duration: 0.8, 
                                repeat: Infinity, 
                                delay: i * 0.15,
                                ease: "easeInOut"
                              }}
                              className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${accent.gradient}`}
                            />
                          ))}
                          <span className="ml-2 text-xs text-slate-400">AI is responding</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          <AnimatePresence>
            {showScrollToBottom && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToBottom}
                className="absolute bottom-24 right-6 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all z-10"
              >
                <FaChevronDown className="text-slate-600 dark:text-slate-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: 0.2 }}
          className={`relative ${glassmorphism ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl" : "bg-white dark:bg-slate-900"} border-t border-slate-200 dark:border-slate-800 px-4 py-4`}
        >
          <div className="max-w-3xl mx-auto">
            <div className={`relative ${glassmorphism ? "bg-slate-100/50 dark:bg-slate-800/50" : "bg-slate-100 dark:bg-slate-800"} ${getBorderRadiusClass()} border border-slate-200 dark:border-slate-700 p-2`}>
              <div className="flex gap-2 items-end">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-2">
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowModelMenu(!showModelMenu);
                          setModelSearch("");
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-all"
                      >
                        <div className={`p-1.5 rounded-md bg-gradient-to-r ${selectedModel.color}`}>
                          <ModelIcon className="text-white text-xs" />
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-[100px] sm:max-w-[140px] truncate">{selectedModel.name}</span>
                        <FaChevronDown size={10} className={`text-slate-500 transition-transform ${showModelMenu ? "rotate-180" : ""}`} />
                      </motion.button>
                      <AnimatePresence>
                        {showModelMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                          >
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                              <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <input
                                  type="text"
                                  value={modelSearch}
                                  onChange={(e) => setModelSearch(e.target.value)}
                                  placeholder="Search AI models..."
                                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              {filteredModels.length > 0 ? (
                                filteredModels.map((model, i) => {
                                  const Icon = model.icon;
                                  return (
                                    <motion.button
                                      key={model.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.03 }}
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setShowModelMenu(false);
                                        setModelSearch("");
                                        showToast(`Switched to ${model.name}`, "success");
                                      }}
                                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex items-center gap-3 ${selectedModel.id === model.id ? "bg-sky-50 dark:bg-sky-900/20" : ""}`}
                                    >
                                      <div className={`p-2 rounded-lg bg-gradient-to-r ${model.color}`}>
                                        <Icon className="text-white" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{model.name}</div>
                                        <div className="text-xs text-slate-500">{model.description}</div>
                                      </div>
                                      {selectedModel.id === model.id && <FaCheck className="text-sky-500 text-xs" />}
                                    </motion.button>
                                  );
                                })
                              ) : (
                                <div className="px-4 py-8 text-center text-slate-500">
                                  <FaSearch className="mx-auto mb-2 text-2xl opacity-50" />
                                  <p className="text-sm">No models found</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      <FaPaperclip size={14} />
                    </motion.button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.txt,.md" />
                  </div>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder={selectedModel.type === "image" ? "Describe the image you want to create..." : selectedModel.type === "tts" ? "Enter text to convert to speech..." : "Ask me anything..."}
                    disabled={loading}
                    rows={1}
                    className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 ${getBorderRadiusClass()} resize-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm max-h-32`}
                    style={{ minHeight: "48px" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "48px";
                      target.style.height = Math.min(target.scrollHeight, 128) + "px";
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {isRecording ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
                    >
                      <FaStop size={14} />
                      <span className="text-sm">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startRecording}
                      className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                    >
                      <FaMicrophone size={16} />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className={`px-4 py-3 bg-gradient-to-r ${accent.gradient} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2`}
                    style={{ minHeight: "48px" }}
                  >
                    <FaPaperPlane size={14} className={loading ? "animate-pulse" : ""} />
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[10px] text-slate-400">
                AI can make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FaCog className="text-sky-500" />
                  Settings
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <FaTimes className="text-slate-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <IoColorPalette className="text-purple-500" />
                    Appearance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Accent Color</span>
                      <div className="flex gap-2">
                        {Object.keys(accentColors).map((color) => (
                          <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`w-6 h-6 rounded-full bg-gradient-to-r ${accentColors[color].gradient} ${accentColor === color ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Glassmorphism</span>
                      <button
                        onClick={() => setGlassmorphism(!glassmorphism)}
                        className={`w-12 h-6 rounded-full transition-colors ${glassmorphism ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <motion.div
                          animate={{ x: glassmorphism ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full mt-0.5"
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Glow Effects</span>
                      <button
                        onClick={() => setGlowEffect(!glowEffect)}
                        className={`w-12 h-6 rounded-full transition-colors ${glowEffect ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <motion.div
                          animate={{ x: glowEffect ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full mt-0.5"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <LuSettings className="text-emerald-500" />
                    Chat Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Auto-scroll</span>
                      <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`w-12 h-6 rounded-full transition-colors ${autoScroll ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <motion.div
                          animate={{ x: autoScroll ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full mt-0.5"
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Show Timestamps</span>
                      <button
                        onClick={() => setShowTimestamps(!showTimestamps)}
                        className={`w-12 h-6 rounded-full transition-colors ${showTimestamps ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <motion.div
                          animate={{ x: showTimestamps ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full mt-0.5"
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Markdown</span>
                      <button
                        onClick={() => setMarkdownEnabled(!markdownEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors ${markdownEnabled ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <motion.div
                          animate={{ x: markdownEnabled ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full mt-0.5"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <MdOutlineSpeed className="text-amber-500" />
                    Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Reduce Motion</span>
                      <button
                        onClick={() => setReduceMotion(!reduceMotion)}
                        className={`w-12 h-6 rounded-full transition-colors ${reduceMotion ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <motion.div
                          animate={{ x: reduceMotion ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full mt-0.5"
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Blur Background</span>
                      <button
                        onClick={() => setBlurBackground(!blurBackground)}
                        className={`w-12 h-6 rounded-full transition-colors ${blurBackground ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                      >
                        <motion.div
                          animate={{ x: blurBackground ? 24 : 2 }}
                          className="w-5 h-5 bg-white rounded-full mt-0.5"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={`data:image/jpeg;base64,${fullscreenImage}`}
              alt="Fullscreen"
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaTimes className="text-white" size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotification && notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 ${
              notification.type === "success" ? "bg-emerald-500" : notification.type === "error" ? "bg-red-500" : "bg-sky-500"
            }`}
          >
            {notification.type === "success" ? <FaCheck className="text-white" /> : notification.type === "error" ? <FaTimes className="text-white" /> : <FaInfoCircle className="text-white" />}
            <span className="text-white font-medium text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
