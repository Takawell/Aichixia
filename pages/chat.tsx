import { useState, useRef, useEffect } from "react";
import {
  FaPaperPlane,
  FaTrash,
  FaUser,
  FaHome,
  FaCircle,
  FaChevronDown,
  FaAngry,
  FaSmile,
  FaBriefcase,
  FaHeart,
  FaFire,
  FaBook,
  FaQuestion,
  FaSearch,
  FaMicrophone,
  FaImage,
  FaCopy,
  FaCheck,
  FaVolumeUp,
  FaStop,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { SiOpenai, SiGooglegemini, SiAnthropic, SiMeta, SiAlibabacloud, SiDigikeyelectronics, SiFlux, SiXiaomi, SiMaze, SiMatternet, } from "react-icons/si";
import { GiSpermWhale, GiPowerLightning, GiBlackHoleBolas, GiClover, } from "react-icons/gi";
import { TbSquareLetterZ, TbLetterM, } from "react-icons/tb";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  isImage?: boolean;
  imageFile?: string;
};

type Persona = "tsundere" | "friendly" | "professional" | "kawaii";

type Model = {
  id: string;
  name: string;
  endpoint: string;
  icon: any;
  color: string;
  type?: "text" | "image";
  supportsVision?: boolean;
};

const personaConfig: Record<
  Persona,
  { name: string; description: string; color: string; icon: any }
> = {
  tsundere: {
    name: "Tsundere Mode",
    description: "B-baka! Classic tsundere personality",
    color: "from-pink-500 to-rose-500",
    icon: FaAngry,
  },
  friendly: {
    name: "Friendly Mode",
    description: "Warm and welcoming assistant",
    color: "from-green-500 to-emerald-500",
    icon: FaSmile,
  },
  professional: {
    name: "Professional Mode",
    description: "Formal and efficient helper",
    color: "from-blue-500 to-indigo-500",
    icon: FaBriefcase,
  },
  kawaii: {
    name: "Kawaii Mode",
    description: "Super cute and energetic!",
    color: "from-purple-500 to-pink-500",
    icon: FaHeart,
  },
};

const models: Model[] = [
  {
    id: "aichixia",
    name: "Aichixia | Auto",
    endpoint: "/api/chat",
    icon: GiBlackHoleBolas,
    color: "from-sky-500 to-blue-500",
    type: "text",
  },
  {
    id: "flux",
    name: "Flux 2",
    endpoint: "/api/models/flux",
    icon: SiFlux,
    color: "from-purple-500 to-pink-500",
    type: "image",
  },
  {
    id: "kimi",
    name: "Kimi K2",
    endpoint: "/api/models/kimi",
    icon: SiDigikeyelectronics,
    color: "from-blue-500 to-black-500",
    type: "text",
  },
  {
    id: "glm",
    name: "GLM 4.6",
    endpoint: "/api/models/glm",
    icon: TbSquareLetterZ,
    color: "from-[#1835D4] to-[#010B24]",
    type: "text",
  },
  {
    id: "mistral",
    name: "Mistral 3.1",
    endpoint: "/api/models/mistral",
    icon: TbLetterM,
    color: "from-[#FF4F00] to-[#FF9000]",
    type: "text",
  },
  {
    id: "gpt4mini",
    name: "GPT-4 Mini",
    endpoint: "/api/models/openai",
    icon: SiOpenai,
    color: "from-green-500 to-emerald-500",
    type: "text",
    supportsVision: true,
  },
  {
    id: "qwen3",
    name: "Qwen3 235B",
    endpoint: "/api/models/qwen3",
    icon: SiMatternet,
    color: "from-purple-500 to-pink-500",
    type: "text",
  },
  {
    id: "minimax",
    name: "MiniMax M2.1",
    endpoint: "/api/models/minimax",
    icon: SiMaze,
    color: "from-cyan-500 to-blue-500",
    type: "text",
  },
  {
    id: "llama",
    name: "Llama 3.3 70B",
    endpoint: "/api/models/llama",
    icon: SiMeta,
    color: "from-orange-500 to-red-500",
    type: "text",
  },
  {
    id: "gptoss",
    name: "GPT-OSS 120B",
    endpoint: "/api/models/gptoss",
    icon: SiOpenai,
    color: "from-pink-500 to-rose-500",
    type: "text",
  },
  {
    id: "gemini",
    name: "Gemini 3 Flash",
    endpoint: "/api/models/gemini",
    icon: SiGooglegemini,
    color: "from-indigo-500 to-purple-500",
    type: "text",
    supportsVision: true,
  },
  {
    id: "mimo",
    name: "MiMo V2 Flash",
    endpoint: "/api/models/mimo",
    icon: SiXiaomi,
    color: "from-blue-500 to-purple-500",
    type: "text",
  },
  {
    id: "deepseek-v",
    name: "DeepSeek V3.1",
    endpoint: "/api/models/deepseek-v",
    icon: GiSpermWhale,
    color: "from-cyan-500 to-blue-500",
    type: "text",
  },
  {
    id: "deepseek",
    name: "DeepSeek V3.2",
    endpoint: "/api/models/deepseek",
    icon: GiSpermWhale,
    color: "from-cyan-500 to-blue-500",
    type: "text",
  },
  {
    id: "compound",
    name: "Groq Compound",
    endpoint: "/api/models/compound",
    icon: GiPowerLightning,
    color: "from-orange-500 to-blue-500",
    type: "text",
  },
  {
    id: "claude",
    name: "Claude Haiku 4.5",
    endpoint: "/api/models/claude",
    icon: SiAnthropic,
    color: "from-orange-500 to-purple-500",
    type: "text",
    supportsVision: true,
  },
  {
    id: "qwen",
    name: "Qwen3 Coder 480B",
    endpoint: "/api/models/qwen",
    icon: SiAlibabacloud,
    color: "from-purple-500 to-pink-500",
    type: "text",
  },
  {
    id: "cohere",
    name: "Cohere Command A",
    endpoint: "/api/models/cohere",
    icon: GiClover,
    color: "from-emerald-500 to-purple-500",
    type: "text",
  },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [persona, setPersona] = useState<Persona>("tsundere");
  const [selectedModel, setSelectedModel] = useState<Model>(models[0]);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    const savedMessages = localStorage.getItem("aichixia-chat-history");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(
          parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      } catch (e) {
        console.error("Failed to load chat history");
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("aichixia-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async () => {
    if ((!input.trim() && !uploadedImage) || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      imageFile: uploadedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedImage(null);
    setLoading(true);
    setTyping(true);

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
            : {
                message: userMessage.content,
                imageData: uploadedImage,
                history: messages.slice(-10).map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
                persona: persona === "tsundere" ? undefined : personaConfig[persona].description,
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const aiMessage: Message = {
        role: "assistant",
        content: selectedModel.type === "image" ? data.imageBase64 : data.reply,
        timestamp: new Date(),
        provider: data.provider,
        isImage: selectedModel.type === "image",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Gomen! Something went wrong... Please try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
  };

  const clearChat = () => {
    if (confirm("Clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem("aichixia-chat-history");
    }
  };

  const getProviderBadge = (provider?: string) => {
    if (!provider) return null;

    const colors: Record<string, string> = {
      glm: "bg-[#1835D4]",
      kimi: "bg-[#0091FF]",
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
      minimax: "bg-red-500"
    };

    return (
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${
          colors[provider] || "bg-gray-500"
        }`}
      >
        {provider.toUpperCase()}
      </span>
    );
  };

  const PersonaIcon = personaConfig[persona].icon;
  const ModelIcon = selectedModel.icon;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static shadow-2xl`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">Chat History</h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <FaTimes />
              </button>
            </div>
            <button className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              <span>New Chat</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-600 text-sm py-8">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-2">
                {messages.filter(m => m.role === 'user').slice(-10).reverse().map((msg, idx) => (
                  <button key={idx} className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all group">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      {msg.content.substring(0, 40)}...
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {msg.timestamp.toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <FaChevronRight className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="w-12 h-12 rounded-full border-2 border-sky-400 dark:border-sky-500 shadow-lg"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <FaCircle size={5} className="text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 truncate">
                  <span className="truncate">Aichixia 5.0</span>
                  <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full font-semibold flex-shrink-0">
                    AI
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <FaCircle size={5} className="text-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="truncate">Multi-AI Assistant</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
              >
                <PersonaIcon className="text-lg" />
                <span className="hidden md:inline">{personaConfig[persona].name.split(" ")[0]}</span>
                <FaChevronDown
                  size={10}
                  className={`transition-transform hidden sm:block ${showPersonaMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showPersonaMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowPersonaMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-20">
                    {(Object.keys(personaConfig) as Persona[]).map((p) => {
                      const Icon = personaConfig[p].icon;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setPersona(p);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${
                            persona === p ? "bg-sky-50 dark:bg-sky-900/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="text-2xl flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                                {personaConfig[p].name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {personaConfig[p].description}
                              </div>
                            </div>
                            {persona === p && (
                              <FaCircle size={6} className="text-sky-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={clearChat}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl transition-all flex-shrink-0 shadow-sm"
              title="Clear chat"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                <div className="relative mb-8">
                  <img
                    src="https://aichiow.vercel.app/aichixia.png"
                    alt="Aichixia"
                    className="w-24 h-24 rounded-full border-4 border-sky-400 dark:border-sky-500 shadow-2xl animate-bounce"
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <FaHeart className="text-white text-sm" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent mb-3">
                  Konnichiwa! I'm Aichixia!
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mb-8">
                  Your anime-loving AI assistant powered by multiple AI providers. Ask me anything!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                  {[
                    { q: "Recommend me some anime", icon: FaHeart },
                    { q: "What's trending right now?", icon: FaFire },
                    { q: "Tell me about Manhwa", icon: FaBook },
                    { q: "Who are you?", icon: FaQuestion },
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion.q)}
                      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 rounded-xl transition-all hover:shadow-lg text-left group"
                    >
                      <suggestion.icon className="text-2xl flex-shrink-0 text-sky-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        {suggestion.q}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <img
                      src="https://aichiow.vercel.app/aichixia.png"
                      alt="Aichixia"
                      className="w-10 h-10 rounded-full border-2 border-sky-400 dark:border-sky-500 shadow-lg"
                    />
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[75%] ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.imageFile && (
                      <img src={msg.imageFile} alt="Uploaded" className="rounded-lg mb-2 max-w-xs shadow-md" />
                    )}
                    
                    {msg.role === "assistant" ? (
                      msg.isImage ? (
                        <img 
                          src={`data:image/jpeg;base64,${msg.content}`}
                          alt="Generated"
                          className="rounded-lg shadow-lg max-w-full h-auto"
                        />
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 px-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.role === "assistant" && msg.provider && getProviderBadge(msg.provider)}
                    {msg.role === "assistant" && !msg.isImage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title="Copy"
                        >
                          {copiedIndex === idx ? (
                            <FaCheck size={12} className="text-green-500" />
                          ) : (
                            <FaCopy size={12} className="text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTextToSpeech(msg.content)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title={isSpeaking ? "Stop" : "Read aloud"}
                        >
                          {isSpeaking ? (
                            <FaStop size={12} className="text-red-500" />
                          ) : (
                            <FaVolumeUp size={12} className="text-slate-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-900 shadow-lg">
                      <FaUser size={14} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex gap-3 justify-start animate-fadeIn">
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="w-10 h-10 rounded-full border-2 border-sky-400 dark:border-sky-500 flex-shrink-0 shadow-lg"
                />
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm shadow-lg overflow-hidden min-w-[250px] max-w-[350px]">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${selectedModel.color} shadow-sm`}>
                        <ModelIcon className="text-white text-xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {selectedModel.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {selectedModel.type === "image" ? "Generating..." : "Thinking..."}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
                      <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-4 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            {uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img src={uploadedImage} alt="Upload" className="max-h-32 rounded-lg shadow-lg border-2 border-sky-400" />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            )}

            <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 shadow-lg">
              <div className="flex gap-2 items-end">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-2">
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowModelMenu(!showModelMenu);
                          setModelSearch("");
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-all group"
                      >
                        <ModelIcon className="text-slate-600 dark:text-slate-300 text-base" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                          {selectedModel.name}
                        </span>
                        <FaChevronDown
                          size={10}
                          className={`text-slate-500 dark:text-slate-400 transition-transform ${showModelMenu ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showModelMenu && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowModelMenu(false)}
                          />
                          <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-20">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                              <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <input
                                  type="text"
                                  value={modelSearch}
                                  onChange={(e) => setModelSearch(e.target.value)}
                                  placeholder="Search models..."
                                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-sky-400 dark:focus:border-sky-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors"
                                  autoFocus
                                />
                              </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              {filteredModels.length > 0 ? (
                                filteredModels.map((model) => {
                                  const Icon = model.icon;
                                  return (
                                    <button
                                      key={model.id}
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setShowModelMenu(false);
                                        setModelSearch("");
                                      }}
                                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${
                                        selectedModel.id === model.id ? "bg-sky-50 dark:bg-sky-900/20" : ""
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <Icon className="text-slate-600 dark:text-slate-300 text-lg flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate flex items-center gap-2">
                                            {model.name}
                                            {model.supportsVision && (
                                              <span className="text-[9px] px-1.5 py-0.5 bg-purple-500 text-white rounded-full">VISION</span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                            {model.type === "image" ? "Image Generation" : "Text Generation"}
                                          </div>
                                        </div>
                                        {selectedModel.id === model.id && (
                                          <FaCircle size={8} className="text-sky-500 flex-shrink-0" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                  No models found
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {selectedModel.supportsVision && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-all text-slate-600 dark:text-slate-400"
                            title="Upload image"
                          >
                            <FaImage size={16} />
                          </button>
                        </>
                      )}
                      
                      {recognitionRef.current && (
                        <button
                          onClick={handleVoiceInput}
                          className={`p-2 rounded-lg transition-all ${
                            isRecording 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                          }`}
                          title={isRecording ? "Stop recording" : "Voice input"}
                        >
                          <FaMicrophone size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedModel.type === "image" ? "Describe the image you want to generate..." : "Ask anything or @mention"}
                    disabled={loading}
                    rows={1}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-400 dark:focus:border-sky-500 rounded-xl resize-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm max-h-32 shadow-sm"
                    style={{
                      minHeight: "48px",
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "48px";
                      target.style.height = Math.min(target.scrollHeight, 128) + "px";
                    }}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !uploadedImage) || loading}
                  className="px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 group flex-shrink-0"
                  style={{
                    minHeight: "48px",
                  }}
                >
                  <FaPaperPlane
                    size={16}
                    className={`${loading ? "animate-pulse" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"} transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
