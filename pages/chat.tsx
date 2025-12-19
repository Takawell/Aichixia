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
  FaComments,
  FaStar,
} from "react-icons/fa";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
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

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [persona, setPersona] = useState<Persona>("tsundere");
  const [mode, setMode] = useState<"normal" | "deep">("normal");
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(mode === "normal" ? "/api/chat" : "/api/models/compound", {
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
      openai: "bg-gradient-to-r from-emerald-500 to-teal-600",
      gemini: "bg-gradient-to-r from-blue-500 to-indigo-600",
      deepseek: "bg-gradient-to-r from-cyan-500 to-blue-600",
      qwen: "bg-gradient-to-r from-purple-500 to-pink-600",
      gptoss: "bg-gradient-to-r from-pink-500 to-rose-600",
      compound: "bg-gradient-to-r from-orange-500 to-red-600",
      llama: "bg-gradient-to-r from-violet-500 to-purple-600",
    };

    return (
      <span
        className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full text-white font-bold shadow-sm ${
          colors[provider] || "bg-gradient-to-r from-gray-500 to-gray-600"
        }`}
      >
        {provider.toUpperCase()}
      </span>
    );
  };

  const PersonaIcon = personaConfig[persona].icon;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950/50">
      
      <header className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 lg:px-6 py-3 lg:py-4 shadow-sm z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
            <Link
              href="/"
              className="p-2 lg:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <FaHome className="text-slate-600 dark:text-slate-300 text-lg lg:text-xl" />
            </Link>

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                  <FaCircle size={6} className="text-white animate-pulse" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-base lg:text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2 truncate">
                  <span className="truncate">Aichixia 4.5</span>
                  <span className="text-[10px] lg:text-xs px-2 py-0.5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white rounded-full font-semibold shadow-md flex-shrink-0 animate-pulse">
                    AI
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                  <FaCircle size={5} className="text-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="truncate font-medium">Multi-AI Assistant</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            
            <div className="relative bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-1 shadow-inner">
              <button
                onClick={() => setMode("normal")}
                className={`relative flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl transition-all duration-300 text-xs lg:text-sm font-bold ${
                  mode === "normal"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-600/50"
                }`}
              >
                <FaComments className="text-sm lg:text-base" />
                <span className="hidden sm:inline">Normal</span>
              </button>
              <button
                onClick={() => setMode("deep")}
                className={`relative flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl transition-all duration-300 text-xs lg:text-sm font-bold ${
                  mode === "deep"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-600/50"
                }`}
              >
                <FaSearch className="text-sm lg:text-base" />
                <span className="hidden sm:inline">Deep</span>
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 rounded-xl transition-all duration-200 text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md active:scale-95"
              >
                <PersonaIcon className="text-base lg:text-lg" />
                <span className="hidden lg:inline">{personaConfig[persona].name.split(" ")[0]}</span>
                <FaChevronDown
                  size={10}
                  className={`transition-transform duration-300 ${showPersonaMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showPersonaMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowPersonaMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 lg:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    {(Object.keys(personaConfig) as Persona[]).map((p, idx) => {
                      const Icon = personaConfig[p].icon;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setPersona(p);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full px-4 py-3.5 text-left hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 last:border-b-0 group ${
                            persona === p ? "bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30" : ""
                          }`}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${personaConfig[p].color} text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                              <Icon className="text-lg" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                                {personaConfig[p].name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {personaConfig[p].description}
                              </div>
                            </div>
                            {persona === p && (
                              <div className="w-2 h-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full animate-pulse shadow-md"></div>
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
              className="p-2 lg:p-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md flex-shrink-0"
              title="Clear chat"
            >
              <FaTrash size={14} className="lg:text-base" />
            </button>

            <div className="hidden xl:block flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] text-center px-4">
              <div className="relative mb-8 lg:mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-2xl animate-bounce"
                />
                <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3">
                  <FaStar className="text-2xl lg:text-3xl text-yellow-400 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-2xl lg:text-4xl font-black bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 dark:from-slate-100 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3 lg:mb-4 flex items-center justify-center gap-2 lg:gap-3 flex-wrap">
                <span>Konnichiwa!</span>
                <span>I'm Aichixia!</span>
                <FaHeart className="text-pink-500 animate-pulse" />
              </h2>
              
              <p className="text-sm lg:text-lg text-slate-600 dark:text-slate-400 max-w-xl mb-8 lg:mb-12 leading-relaxed font-medium">
                Your anime-loving AI assistant powered by multiple AI providers. Ask me anything about anime, manga, or just chat!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 max-w-2xl w-full">
                {[
                  { q: "Recommend me some anime", icon: FaHeart, color: "from-pink-500 to-rose-500" },
                  { q: "What's trending right now?", icon: FaFire, color: "from-orange-500 to-red-500" },
                  { q: "Tell me about Manhwa", icon: FaBook, color: "from-blue-500 to-indigo-500" },
                  { q: "Who are you?", icon: FaQuestion, color: "from-purple-500 to-pink-500" },
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion.q)}
                    className="group relative overflow-hidden flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3.5 lg:py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-transparent rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 text-left"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${suggestion.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className={`relative p-3 lg:p-3.5 rounded-xl bg-gradient-to-br ${suggestion.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <suggestion.icon className="text-lg lg:text-xl" />
                    </div>
                    <span className="relative text-sm lg:text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
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
              className={`flex gap-2.5 lg:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 mt-1">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src="https://aichiow.vercel.app/aichixia.png"
                      alt="Aichixia"
                      className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white dark:border-slate-900 shadow-lg"
                    />
                  </div>
                </div>
              )}

              <div
                className={`flex flex-col max-w-[85%] lg:max-w-[75%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 lg:px-5 py-3 lg:py-4 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white rounded-tr-md"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-headings:font-bold prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm lg:text-base whitespace-pre-wrap break-words leading-relaxed font-medium">
                      {msg.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 px-2">
                  <span className="text-[10px] lg:text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.role === "assistant" && msg.provider && getProviderBadge(msg.provider)}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="flex-shrink-0 mt-1">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-900 shadow-lg">
                      <FaUser size={13} className="lg:text-base" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex gap-2.5 lg:gap-4 justify-start animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full blur-md opacity-50"></div>
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white dark:border-slate-900 shadow-lg"
                />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 lg:px-7 py-4 lg:py-5 rounded-2xl rounded-tl-md shadow-lg">
                <div className="flex gap-1.5 lg:gap-2">
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 px-4 lg:px-6 py-4 lg:py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 lg:gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              rows={1}
              className="flex-1 px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30 rounded-2xl resize-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm lg:text-base max-h-32 font-medium shadow-sm"
              style={{
                minHeight: "52px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "52px";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="relative overflow-hidden px-5 lg:px-6 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 group flex-shrink-0 active:scale-95 hover:scale-105"
              style={{
                minHeight: "52px",
              }}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative hidden sm:inline text-sm lg:text-base">Send</span>
              <FaPaperPlane
                size={15}
                className={`relative ${loading ? "animate-pulse" : "group-hover:translate-x-1 group-hover:-translate-y-1"} transition-transform duration-300 lg:text-base`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
