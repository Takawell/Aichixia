import { useState, useRef, useEffect } from "react";
import {
  FaPaperPlane,
  FaTrash,
  FaRobot,
  FaUser,
  FaHome,
  FaCircle,
  FaCog,
  FaSmile,
  FaMoon,
  FaSun,
  FaChevronDown,
} from "react-icons/fa";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
};

type Persona = "tsundere" | "friendly" | "professional" | "kawaii";

const personaConfig: Record<
  Persona,
  { name: string; description: string; color: string; emoji: string }
> = {
  tsundere: {
    name: "Tsundere Mode",
    description: "B-baka! Classic tsundere personality",
    color: "from-pink-500 to-rose-500",
    emoji: "😤",
  },
  friendly: {
    name: "Friendly Mode",
    description: "Warm and welcoming assistant",
    color: "from-green-500 to-emerald-500",
    emoji: "😊",
  },
  professional: {
    name: "Professional Mode",
    description: "Formal and efficient helper",
    color: "from-blue-500 to-indigo-500",
    emoji: "💼",
  },
  kawaii: {
    name: "Kawaii Mode",
    description: "Super cute and energetic!",
    color: "from-purple-500 to-pink-500",
    emoji: "🌸",
  },
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [persona, setPersona] = useState<Persona>("tsundere");
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
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Gomen! Something went wrong... Please try again! 🙇‍♀️",
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
      openai: "bg-blue-500",
      gemini: "bg-indigo-500",
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FaHome className="text-slate-600 dark:text-slate-300" size={20} />
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://aichiow.vercel.app/aichixia.png"
                alt="Aichixia"
                className="w-12 h-12 rounded-full border-2 border-sky-400 dark:border-sky-500 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <FaCircle size={6} className="text-white" />
              </div>
            </div>

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Aichixia 4.5
                <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full font-semibold">
                  AI
                </span>
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <FaCircle size={6} className="text-emerald-500 animate-pulse" />
                <span>Online • Multi-AI Assistant</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="text-lg">{personaConfig[persona].emoji}</span>
              <span className="hidden sm:inline">{personaConfig[persona].name.split(" ")[0]}</span>
              <FaChevronDown
                size={12}
                className={`transition-transform ${showPersonaMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20">
                {(Object.keys(personaConfig) as Persona[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPersona(p);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                      persona === p ? "bg-sky-50 dark:bg-sky-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{personaConfig[p].emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {personaConfig[p].name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {personaConfig[p].description}
                        </div>
                      </div>
                      {persona === p && (
                        <FaCircle size={8} className="text-sky-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={clearChat}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
            title="Clear chat"
          >
            <FaTrash size={16} />
          </button>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img
              src="https://aichiow.vercel.app/aichixia.png"
              alt="Aichixia"
              className="w-24 h-24 rounded-full border-4 border-sky-400 dark:border-sky-500 shadow-lg mb-6 animate-bounce"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-3">
              Konnichiwa! I'm Aichixia! 👋
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
              Your anime-loving AI assistant powered by multiple AI providers. Ask me anything
              about anime, manga, or just chat!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {[
                { q: "Recommend me some anime", icon: "🎬" },
                { q: "What's trending right now?", icon: "🔥" },
                { q: "Tell me about One Piece", icon: "📚" },
                { q: "Who are you?", icon: "❓" },
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion.q)}
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 rounded-lg transition-all hover:shadow-md text-left group"
                >
                  <span className="text-2xl">{suggestion.icon}</span>
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
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0">
                <img
                  src="https://aichiow.vercel.app/aichixia.png"
                  alt="Aichixia"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-sky-400 dark:border-sky-500"
                />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl shadow-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-sm"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                }`}
              >
                <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                  {msg.content}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1.5 px-2">
                <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.role === "assistant" && msg.provider && getProviderBadge(msg.provider)}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800 shadow-md">
                  <FaUser size={14} />
                </div>
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex gap-3 justify-start">
            <img
              src="https://aichiow.vercel.app/aichixia.png"
              alt="Aichixia"
              className="w-10 h-10 rounded-full border-2 border-sky-400 dark:border-sky-500"
            />
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-2xl rounded-tl-sm shadow-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                disabled={loading}
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:border-sky-400 dark:focus:border-sky-500 rounded-xl resize-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base max-h-32"
                style={{
                  minHeight: "52px",
                  height: "auto",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "52px";
                  target.style.height = target.scrollHeight + "px";
                }}
              />

              <button
                onClick={() => setInput("")}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${
                  !input.trim() ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <FaSmile size={18} />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all disabled:cursor-not-allowed flex items-center gap-2 group"
            >
              <span className="hidden sm:inline">Send</span>
              <FaPaperPlane
                size={16}
                className={`${loading ? "animate-pulse" : "group-hover:translate-x-1"} transition-transform`}
              />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Powered by Multi-AI System</span>
            <span>•</span>
            <span>BY TAKAWELL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
