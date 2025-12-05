"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FaPaperPlane,
  FaSpinner,
  FaTrashAlt,
  FaRegSave,
  FaBolt,
  FaChevronDown,
  FaUserCircle,
  FaCopy,
  FaChevronLeft,
  FaDownload,
  FaRobot,
  FaEllipsisV,
  FaCheck,
  FaHistory,
} from "react-icons/fa";
import ThemeToggle from "@/components/ThemeToggle";

const AVATAR = "https://aichiow.vercel.app/aichixia.png";

type Role = "user" | "assistant" | "system";

type Message = {
  id: string;
  role: Role;
  text: string;
  time: number;
  streaming?: boolean;
  error?: boolean;
};

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function timeFmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem("aichixia:messages");
      if (!raw) return seedMessages();
      const parsed = JSON.parse(raw) as Message[];
      return parsed.map((m) => ({ ...m }));
    } catch {
      return seedMessages();
    }
  });
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [model, setModel] = useState("auto");
  const [persona, setPersona] = useState("tsundere");
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isStreamingSupported, setIsStreamingSupported] = useState(true);

  useEffect(() => {
    localStorage.setItem("aichixia:messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem("aichixia:theme");
    if (saved) {
      document.documentElement.classList.toggle("dark", saved === "dark");
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function seedMessages(): Message[] {
    return [
      {
        id: uid("m_"),
        role: "assistant",
        text: "H-Hello there... I'm Aichixia. Ask me anything about anime, manga, manhwa, or light novels. I-I'll try to help... baka.",
        time: Date.now(),
      },
    ];
  }

  function scrollToBottom(smooth = true) {
    if (!scrollRef.current) return;
    if (smooth) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    } else {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  function pushMessage(m: Message) {
    setMessages((p) => [...p, m]);
  }

  function replaceMessage(id: string, patch: Partial<Message>) {
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isSending) return;
    const userMsg: Message = {
      id: uid("u_"),
      role: "user",
      text: input.trim(),
      time: Date.now(),
    };
    pushMessage(userMsg);
    setInput("");
    await requestAI(userMsg);
  }

  async function requestAI(userMsg: Message) {
    setIsSending(true);
    const assistantId = uid("a_");
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
      time: Date.now(),
      streaming: true,
    };
    pushMessage(assistantMsg);
    scrollToBottom();

    try {
      const body = {
        message: userMsg.text,
        history: messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.text }))
          .slice(-12),
        persona,
        model,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        replaceMessage(assistantId, {
          text: `Hmph! Error: ${txt || res.statusText}`,
          streaming: false,
          error: true,
        });
        setIsSending(false);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") || contentType.includes("stream")) {
        if (!res.body) {
          const json = await res.json();
          replaceMessage(assistantId, { text: json.reply || "..." , streaming: false });
          setIsSending(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let aggregated = "";
        while (!done) {
          const { value, done: d } = await reader.read();
          if (d) {
            done = true;
            break;
          }
          const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
          aggregated += chunk;
          replaceMessage(assistantId, { text: aggregated, streaming: true });
          scrollToBottom();
        }
        replaceMessage(assistantId, { text: aggregated, streaming: false });
      } else {
        const json = await res.json();
        const reply = json.reply || (json?.choices?.[0]?.message ?? "") || JSON.stringify(json);
        replaceMessage(assistantId, { text: reply, streaming: false });
      }
    } catch (err: any) {
      replaceMessage(assistantId, {
        text: `Hmph! Something went wrong... ${err?.message ?? "unknown"}`,
        streaming: false,
        error: true,
      });
    } finally {
      setIsSending(false);
    }
  }

  function clearChat() {
    setMessages(seedMessages());
  }

  function copyAll() {
    const txt = messages.map((m) => `${m.role === "user" ? "You" : "Aichixia"}: ${m.text}`).join("\n\n");
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setShowToast("Copied conversation");
    setTimeout(() => {
      setCopied(false);
      setShowToast(null);
    }, 1500);
  }

  function downloadJSON() {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aichixia-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function retryMessage(msg: Message) {
    if (msg.role !== "user") return;
    requestAI(msg);
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-900 transition">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar((s) => !s)}
              className="p-2 rounded-md bg-white dark:bg-slate-800 shadow hover:shadow-md transition"
            >
              <FaChevronLeft />
            </button>
            <div className="flex items-center gap-3">
              <img src={AVATAR} alt="Aichixia" className="w-12 h-12 rounded-full object-cover shadow-sm" />
              <div>
                <div className="text-lg font-extrabold text-sky-600 dark:text-sky-300">Aichixia</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Anime-first AI assistant</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <div className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm flex items-center gap-2">
                <FaBolt />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-transparent outline-none"
                >
                  <option value="auto">Auto (recommended)</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                  <option value="qwen">Qwen</option>
                  <option value="gptoss">GPT-OSS</option>
                </select>
              </div>
              <div className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm flex items-center gap-2">
                <label className="text-xs">Persona</label>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="bg-transparent outline-none"
                >
                  <option value="tsundere">Tsundere</option>
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAll}
                  className="px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow transition text-sm"
                >
                  <FaCopy className="inline mr-2" /> Copy
                </button>
                <button
                  onClick={downloadJSON}
                  className="px-3 py-2 rounded-md bg-sky-600 text-white hover:opacity-95 transition text-sm flex items-center gap-2"
                >
                  <FaDownload /> Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside
            className={`rounded-xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition ${
              showSidebar ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Conversation</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setHistoryCollapsed((s) => !s);
                  }}
                  className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs"
                >
                  <FaHistory />
                </button>
                <button
                  onClick={clearChat}
                  className="px-3 py-1 rounded-md bg-rose-500 text-white text-xs"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>

            <div className={`space-y-3 overflow-y-auto max-h-[60vh] ${historyCollapsed ? "hidden" : "block"}`}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition"
                  onClick={() => {
                    if (m.role === "user") {
                      setInput(m.text);
                    }
                  }}
                >
                  <div className="w-10 shrink-0">
                    {m.role === "user" ? (
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                        U
                      </div>
                    ) : (
                      <img src={AVATAR} alt="ai" className="w-9 h-9 rounded-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold truncate">
                        {m.role === "user" ? "You" : "Aichixia"}
                      </div>
                      <div className="text-xs text-slate-400">{timeFmt(m.time)}</div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Tip: click a user message to set it in the input for quick retries.
            </div>
          </aside>

          <section className="flex flex-col rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chat</div>
              <div className="text-xs text-slate-400">Model: {model} • Persona: {persona}</div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-auto space-y-4 py-3 pr-2 min-h-[360px] max-h-[64vh] scroll-smooth"
              style={{ scrollbarGutter: "stable" }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <img src={AVATAR} alt="avatar" className="w-11 h-11 rounded-full object-cover shadow-sm" />
                  )}
                  <div
                    className={`max-w-[80%] break-words p-3 rounded-2xl shadow-sm ${m.role === "user" ? "bg-sky-600 text-white rounded-br-none" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"}`}
                  >
                    <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap text-sm">
                      {m.text}
                      {m.streaming && (
                        <span className="inline-block ml-2 animate-pulse text-slate-500">▌</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{timeFmt(m.time)}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(m.text);
                            setShowToast("Copied message");
                            setTimeout(() => setShowToast(null), 1200);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <FaCopy />
                        </button>
                        {m.role === "user" && (
                          <button
                            onClick={() => retryMessage(m)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <FaBolt />
                          </button>
                        )}
                        {m.error && (
                          <span className="text-rose-500 text-xs flex items-center gap-1"><FaEllipsisV /> Error</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {m.role === "user" && (
                    <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold shadow-sm">
                      U
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="mt-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder="Ask Aichixia anything... (Shift+Enter for newline)"
                    className="w-full min-h-[46px] max-h-[160px] resize-none px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="text-xs text-slate-400 mt-2 hidden sm:block">
                    Press Enter to send, Shift+Enter for newline.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInput("");
                    }}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    Clear
                  </button>

                  <button
                    type="submit"
                    disabled={isSending || !input.trim()}
                    className="px-4 py-2 rounded-2xl bg-sky-600 text-white font-bold shadow hover:opacity-95 disabled:opacity-60 transition flex items-center gap-2"
                  >
                    {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    <span>{isSending ? "Sending..." : "Send"}</span>
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Powered by multiple AI providers. Messages are private on your device.
          </div>
          <div className="text-xs text-slate-400">v1.0</div>
        </div>
      </div>

      <Toast message={showToast} />
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-black/80 text-white px-4 py-2 rounded-md shadow-lg">
        {message}
      </div>
    </div>
  );
}
