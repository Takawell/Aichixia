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
  FaMicrophone,
  FaCopy,
  FaEdit,
  FaCheck,
  FaSearch,
  FaDownload,
  FaTimes,
  FaThumbsUp,
  FaLaugh,
  FaSadTear,
  FaFire,
  FaSun,
  FaMoon,
  FaEllipsisV,
  FaFilm,
  FaBookOpen,
  FaQuestionCircle,
} from "react-icons/fa";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
  id: string;
  reactions?: string[];
};

type Persona = "tsundere" | "friendly" | "professional" | "kawaii";

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

const reactionIcons = [
  { icon: FaThumbsUp, color: "text-blue-500" },
  { icon: FaLaugh, color: "text-yellow-500" },
  { icon: FaHeart, color: "text-red-500" },
  { icon: FaFire, color: "text-orange-500" },
  { icon: FaSadTear, color: "text-gray-500" },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [persona, setPersona] = useState<Persona>("tsundere");
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    const saved = localStorage.getItem("aichixia-chat-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(
          parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
            id: m.id || Date.now().toString() + Math.random(),
            reactions: m.reactions || [],
          }))
        );
      } catch (e) {
        console.error("Failed to load chat history");
      }
    }

    const darkMode = localStorage.getItem("aichixia-dark-mode");
    if (darkMode === "true") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("aichixia-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      id: Date.now().toString(),
      reactions: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          persona: persona === "tsundere" ? undefined : personaConfig[persona].description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        provider: data.provider,
        id: (Date.now() + 1).toString(),
        reactions: [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Gomen! Something went wrong... Please try again!",
        timestamp: new Date(),
        id: (Date.now() + 1).toString(),
        reactions: [],
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

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setShowMessageMenu(null);
  };

  const startEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
    setShowMessageMenu(null);
  };

  const saveEdit = () => {
    if (!editContent.trim()) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === editingId ? { ...m, content: editContent.trim() } : m
      )
    );
    setEditingId(null);
    setEditContent("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const addReaction = (messageId: string, index: number) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const reactions = m.reactions || [];
          const reactionStr = index.toString();
          const hasReaction = reactions.includes(reactionStr);
          return {
            ...m,
            reactions: hasReaction
              ? reactions.filter((r) => r !== reactionStr)
              : [...reactions, reactionStr],
          };
        }
        return m;
      })
    );
    setShowReactions(null);
  };

  const deleteMessage = (id: string) => {
    if (confirm("Delete this message?")) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setShowMessageMenu(null);
    }
  };

  const exportChat = () => {
    const chatText = messages
      .map(
        (m) =>
          `[${m.timestamp.toLocaleString()}] ${m.role === "user" ? "You" : "Aichixia"}: ${m.content}`
      )
      .join("\n\n");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aichixia-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setInput("Voice input coming soon!");
        setIsListening(false);
      }, 2000);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("aichixia-dark-mode", (!isDark).toString());
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const getProviderBadge = (provider?: string) => {
    if (!provider) return null;

    const colors: Record<string, string> = {
      openai: "bg-blue-500",
      gemini: "bg-indigo-500",
      deepseek: "bg-cyan-500",
      qwen: "bg-purple-500",
      gptoss: "bg-pink-500",
      llama: "bg-rose-500",
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

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${isDark ? "dark bg-slate-950" : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"}`}>
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <a
            href="/"
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110"
          >
            <FaHome className="text-slate-600 dark:text-slate-300" size={18} />
          </a>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src="https://aichiow.vercel.app/aichixia.png"
                alt="Aichixia"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-sky-400 dark:border-sky-500 shadow-md transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <FaCircle size={5} className="text-white animate-pulse" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="truncate">Aichixia 5.0</span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full font-semibold flex-shrink-0">
                  AI
                </span>
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                <FaCircle size={5} className="text-emerald-500 animate-pulse flex-shrink-0" />
                <span className="truncate">Online Multi-AI Assistant</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110 ${
              showSearch
                ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600"
                : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
            title="Search chat"
          >
            <FaSearch size={14} />
          </button>

          <button
            onClick={exportChat}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110 text-slate-600 dark:text-slate-300"
            title="Export chat"
          >
            <FaDownload size={14} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:scale-105"
            >
              <PersonaIcon className="text-base sm:text-lg" />
              <span className="hidden md:inline">{personaConfig[persona].name.split(" ")[0]}</span>
              <FaChevronDown
                size={10}
                className={`transition-transform duration-200 hidden sm:block ${showPersonaMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showPersonaMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowPersonaMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20 animate-fadeIn">
                  {(Object.keys(personaConfig) as Persona[]).map((p) => {
                    const Icon = personaConfig[p].icon;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPersona(p);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                          persona === p ? "bg-sky-50 dark:bg-sky-900/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Icon className="text-xl sm:text-2xl flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm truncate">
                              {personaConfig[p].name}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
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
            className="p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110"
            title="Clear chat"
          >
            <FaTrash size={14} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110 text-slate-600 dark:text-slate-300"
            title="Toggle theme"
          >
            {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>
        </div>
      </header>

      {showSearch && (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-3 animate-slideDown">
          <div className="max-w-4xl mx-auto relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-400 dark:focus:border-sky-500 rounded-lg outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {filteredMessages.length === 0 && !searchQuery && (
          <div className="flex flex-col items-center justify-center h-full text-center px-3 sm:px-4">
            <img
              src="https://aichiow.vercel.app/aichixia.png"
              alt="Aichixia"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-sky-400 dark:border-sky-500 shadow-lg mb-4 sm:mb-6 animate-bounce"
            />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3 flex items-center justify-center gap-2">
              Konnichiwa! I'm Aichixia! <FaHeart className="text-pink-500 animate-pulse" />
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mb-4 sm:mb-6">
              Your anime-loving AI assistant powered by multiple AI providers. Ask me anything
              about anime, manga, or just chat!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl w-full">
              {[
                { q: "Recommend me some anime", icon: FaFilm },
                { q: "What's trending right now?", icon: FaFire },
                { q: "Tell me about manhwa", icon: FaBookOpen },
                { q: "Who are you?", icon: FaQuestionCircle },
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion.q)}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 rounded-lg transition-all duration-200 hover:shadow-md text-left group hover:scale-105"
                >
                  <suggestion.icon className="text-xl sm:text-2xl flex-shrink-0 text-slate-600 dark:text-slate-400 group-hover:text-sky-500 transition-colors" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {suggestion.q}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredMessages.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center h-full text-center px-3 sm:px-4">
            <FaSearch className="text-5xl text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No messages found</p>
          </div>
        )}

        {filteredMessages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex gap-2 sm:gap-3 animate-fadeIn ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0">
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-sky-400 dark:border-sky-500 transition-transform duration-300 hover:scale-110"
                />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[80%] sm:max-w-[75%] md:max-w-[70%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {editingId === msg.id ? (
                <div className="w-full">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-sky-400 dark:border-sky-500 rounded-lg outline-none text-slate-800 dark:text-slate-200 text-sm resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-1"
                    >
                      <FaCheck size={10} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-1"
                    >
                      <FaTimes size={10} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative group">
                    <div
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                      }`}
                    >
                      <p className="text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </p>
                    </div>

                    <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="relative">
                        <button
                          onClick={() => setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id)}
                          className="p-1.5 bg-white dark:bg-slate-700 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-110"
                        >
                          <FaEllipsisV size={12} className="text-slate-600 dark:text-slate-300" />
                        </button>

                        {showMessageMenu === msg.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowMessageMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20 animate-fadeIn">
                              <button
                                onClick={() => copyMessage(msg.content, msg.id)}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <FaCheck size={12} className="text-green-500" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <FaCopy size={12} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              {msg.role === "user" && (
                                <button
                                  onClick={() => startEdit(msg)}
                                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300"
                                >
                                  <FaEdit size={12} />
                                  <span>Edit</span>
                                </button>
                              )}
                              <button
                                onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300"
                              >
                                <FaSmile size={12} />
                                <span>React</span>
                              </button>
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs flex items-center gap-2 text-red-500"
                              >
                                <FaTrash size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {showReactions === msg.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowReactions(null)}
                        />
                        <div className="absolute -bottom-12 left-0 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 px-2 py-1 flex gap-1 z-20 animate-fadeIn">
                          {reactionIcons.map((reaction, index) => (
                            <button
                              key={index}
                              onClick={() => addReaction(msg.id, index)}
                              className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-125 ${
                                msg.reactions?.includes(index.toString()) ? "bg-slate-100 dark:bg-slate-700" : ""
                              }`}
                            >
                              <reaction.icon size={16} className={reaction.color} />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {msg.reactions.map((r, idx) => {
                        const reactionIndex = parseInt(r);
                        const ReactionIcon = reactionIcons[reactionIndex]?.icon;
                        const reactionColor = reactionIcons[reactionIndex]?.color;
                        return ReactionIcon ? (
                          <div
                            key={idx}
                            className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs"
                          >
                            <ReactionIcon size={12} className={reactionColor} />
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 px-2">
                    <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.role === "assistant" && msg.provider && getProviderBadge(msg.provider)}
                  </div>
                </>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800 shadow-md transition-transform duration-300 hover:scale-110">
                  <FaUser size={12} className="sm:text-sm" />
                </div>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex gap-2 sm:gap-3 justify-start animate-fadeIn">
            <img
              src="https://aichiow.vercel.app/aichixia.png"
              alt="Aichixia"
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border-2 border-sky-400 dark:border-sky-500"
            />
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl rounded-tl-sm shadow-md">
              <div className="flex gap-1 sm:gap-1.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-stretch">
            <button
              onClick={toggleVoice}
              className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300"
              }`}
              title="Voice input"
            >
              <FaMicrophone size={16} />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              rows={1}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-400 dark:focus:border-sky-500 rounded-xl resize-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base max-h-32"
              style={{
                minHeight: "46px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "46px";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 sm:px-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 group flex-shrink-0 hover:scale-105"
              style={{
                minHeight: "46px",
              }}
            >
              <span className="hidden sm:inline text-sm md:text-base">Send</span>
              <FaPaperPlane
                size={14}
                className={`${loading ? "animate-pulse" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"} transition-transform sm:text-base`}
              />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
