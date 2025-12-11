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
} from "react-icons/fa";
import Link from "next/link";

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
    name: "Tsundere",
    description: "B-baka! Classic tsundere personality",
    color: "from-pink-500 to-rose-500",
    icon: FaAngry,
  },
  friendly: {
    name: "Friendly",
    description: "Warm and welcoming assistant",
    color: "from-green-500 to-emerald-500",
    icon: FaSmile,
  },
  professional: {
    name: "Professional",
    description: "Formal and efficient helper",
    color: "from-blue-500 to-indigo-500",
    icon: FaBriefcase,
  },
  kawaii: {
    name: "Kawaii",
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
      openai: "bg-blue-600",
      gemini: "bg-indigo-600",
      deepseek: "bg-cyan-600",
      qwen: "bg-purple-600",
      gptoss: "bg-pink-600",
      llama: "bg-rose-600",
    };

    return (
      <span
        className={`text-[9px] px-2 py-0.5 rounded-full text-white font-semibold ${
          colors[provider] || "bg-zinc-600"
        }`}
      >
        {provider.toUpperCase()}
      </span>
    );
  };

  const PersonaIcon = personaConfig[persona].icon;

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/"
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
          >
            <FaHome className="text-zinc-400" size={18} />
          </Link>

          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src="https://aichiow.vercel.app/aichixia.png"
                alt="Aichixia"
                className="w-10 h-10 rounded-full border-2 border-red-600"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-white flex items-center gap-2 truncate">
                <span className="truncate">Aichixia 4.5</span>
                <span className="text-[10px] px-2 py-0.5 bg-red-600 text-white rounded-full font-semibold flex-shrink-0">
                  AI
                </span>
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <FaCircle size={6} className="text-green-500 flex-shrink-0" />
                <span className="truncate">Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all text-sm font-medium text-zinc-300"
            >
              <PersonaIcon size={16} />
              <span className="hidden sm:inline">{personaConfig[persona].name}</span>
              <FaChevronDown
                size={10}
                className={`transition-transform ${showPersonaMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showPersonaMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowPersonaMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 overflow-hidden z-20">
                  {(Object.keys(personaConfig) as Persona[]).map((p) => {
                    const Icon = personaConfig[p].icon;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPersona(p);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0 ${
                          persona === p ? "bg-zinc-800" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="text-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm truncate">
                              {personaConfig[p].name}
                            </div>
                            <div className="text-xs text-zinc-400 truncate">
                              {personaConfig[p].description}
                            </div>
                          </div>
                          {persona === p && (
                            <FaCircle size={6} className="text-red-600 flex-shrink-0" />
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
            className="p-2 hover:bg-zinc-800 text-red-500 rounded-lg transition-colors flex-shrink-0"
            title="Clear chat"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img
              src="https://aichiow.vercel.app/aichixia.png"
              alt="Aichixia"
              className="w-24 h-24 rounded-full border-4 border-red-600 shadow-lg mb-6"
            />
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-2">
              Konnichiwa! I'm Aichixia!
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              Your anime-loving AI assistant powered by multiple AI providers. Ask me anything
              about anime, manga, or just chat!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
              {[
                { q: "Recommend me some anime", icon: "💗" },
                { q: "What's trending right now?", icon: "🔥" },
                { q: "Tell me about Manhwa", icon: "📚" },
                { q: "Who are you?", icon: "❓" },
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion.q)}
                  className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded-lg transition-all text-left group"
                >
                  <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
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
                  className="w-8 h-8 rounded-full border-2 border-red-600"
                />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[75%] md:max-w-[70%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-red-600 text-white"
                    : "bg-zinc-900 text-white border border-zinc-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.content}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1 px-2">
                <span className="text-[10px] text-zinc-500">
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
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold border-2 border-zinc-900">
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
              className="w-8 h-8 rounded-full border-2 border-red-600"
            />
            <div className="bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-lg">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              rows={1}
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-zinc-600 rounded-lg resize-none outline-none text-white placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm max-h-32"
              style={{
                minHeight: "44px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white rounded-lg font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 group flex-shrink-0"
              style={{
                minHeight: "44px",
              }}
            >
              <span className="hidden sm:inline text-sm">Send</span>
              <FaPaperPlane
                size={14}
                className={`${loading ? "animate-pulse" : "group-hover:translate-x-0.5"} transition-transform`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
