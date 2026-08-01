import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  FiPlus, FiMenu, FiX, FiSend, FiTrash2, FiMoreVertical, FiEdit2,
  FiChevronDown, FiCheck, FiCopy, FiRefreshCw, FiArrowLeft, FiMessageSquare,
  FiSettings, FiKey,
} from 'react-icons/fi';
import { SiAnthropic, SiAlibabacloud, SiMaze, SiDigikeyelectronics, SiAirbrake } from 'react-icons/si';
import { RiOpenaiFill } from 'react-icons/ri';
import { TbLetterM } from 'react-icons/tb';
import { GiSpermWhale } from 'react-icons/gi';
import ThemeToggle from '@/components/ThemeToggle';

type ChatModel = {
  id: string;
  name: string;
  icon: any;
  color: string;
  endpoint: string;
  requiresPlan?: 'pro';
};

const CHAT_MODELS: ChatModel[] = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', icon: RiOpenaiFill, color: 'from-emerald-600 to-green-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions' },
  { id: 'aichixia-flash', name: 'Aichixia 114B', icon: SiAirbrake, color: 'from-blue-600 via-blue-800 to-slate-900', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', requiresPlan: 'pro' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', icon: SiAnthropic, color: 'from-orange-500 to-amber-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions' },
  { id: 'qwen3-6-27b', name: 'Qwen3.6 27B', icon: SiAlibabacloud, color: 'from-purple-500 to-pink-500', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions' },
  { id: 'minimax-m2-7', name: 'MiniMax M2.7', icon: SiMaze, color: 'from-cyan-600 to-blue-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions' },
  { id: 'kimi-k2-6', name: 'Kimi K2.6', icon: SiDigikeyelectronics, color: 'from-blue-600 to-cyan-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions' },
  { id: 'mistral-large-3-675b-instruct', name: 'Mistral Large 3 675B', icon: TbLetterM, color: 'from-orange-600 to-amber-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', icon: GiSpermWhale, color: 'from-cyan-600 to-blue-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions' },
];

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

type ChatSession = {
  id: string;
  title: string;
  modelId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'aichixia_chat_sessions';
const API_KEY_STORAGE_KEY = 'aichixia_chat_api_key';

function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function titleFromMessage(text: string) {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > 42 ? clean.slice(0, 42) + '…' : clean || 'New chat';
}

export default function ChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [menuForId, setMenuForId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    setActiveId(loaded[0]?.id ?? null);
    try {
      const savedKey = window.localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) setApiKey(savedKey);
    } catch {}
  }, []);

  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeId, sessions]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) setModelMenuOpen(false);
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) setMenuForId(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;
  const activeModel = CHAT_MODELS.find((m) => m.id === activeSession?.modelId) ?? CHAT_MODELS[0];

  const createSession = useCallback((modelId?: string) => {
    const newSession: ChatSession = {
      id: genId(),
      title: 'New chat',
      modelId: modelId ?? activeModel.id,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
    setSidebarOpen(false);
    return newSession.id;
  }, [activeModel.id]);

  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      if (next.length === 0) window.localStorage.removeItem(STORAGE_KEY);
      return next;
    });
    setMenuForId(null);
  };

  const renameSession = (id: string, title: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: title.trim() || s.title } : s)));
    setRenamingId(null);
  };

  const switchModel = (modelId: string) => {
    setModelMenuOpen(false);
    if (!activeSession) {
      createSession(modelId);
      return;
    }
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? { ...s, modelId } : s)));
  };

  const saveApiKey = () => {
    setApiKey(apiKeyDraft);
    try {
      window.localStorage.setItem(API_KEY_STORAGE_KEY, apiKeyDraft);
    } catch {}
    setApiKeyModalOpen(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    if (!apiKey.trim()) {
      setApiKeyDraft(apiKey);
      setApiKeyModalOpen(true);
      return;
    }

    let sessionId = activeId;
    let currentModel = activeModel;
    if (!sessionId) {
      sessionId = createSession();
    }

    const userMsg: ChatMessage = { id: genId(), role: 'user', content: text, createdAt: Date.now() };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              title: s.messages.length === 0 ? titleFromMessage(text) : s.title,
              messages: [...s.messages, userMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );
    setInput('');
    setError(null);
    setIsSending(true);

    try {
      const session = sessions.find((s) => s.id === sessionId);
      const model = CHAT_MODELS.find((m) => m.id === (session?.modelId ?? currentModel.id)) ?? currentModel;
      const history = [...(session?.messages ?? []), userMsg].map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(model.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: model.id, messages: history, temperature: 0.7, max_tokens: 2048 }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error?.message || `Request failed (${res.status})`);
      }

      const replyText: string = data?.choices?.[0]?.message?.content ?? '';
      const assistantMsg: ChatMessage = { id: genId(), role: 'assistant', content: replyText, createdAt: Date.now() };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedSessions = groupByDate(sessions);
  const ModelIcon = activeModel.icon;

  return (
    <div className="h-screen w-full flex bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl" />
      </div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-zinc-900/40 backdrop-blur-sm sm:hidden" />
      )}

      <aside
        className={`fixed sm:static inset-y-0 left-0 z-40 w-72 flex-shrink-0 flex flex-col bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200/70 dark:border-zinc-800/70 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-150 group"
          >
            <FiArrowLeft className="text-zinc-500 dark:text-zinc-400 group-hover:-translate-x-0.5 transition-transform duration-200" style={{ fontSize: 13 }} />
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Console</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="sm:hidden w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center"
          >
            <FiX className="text-zinc-500" style={{ fontSize: 14 }} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={() => createSession()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-200 active:scale-[0.98]"
          >
            <FiPlus style={{ fontSize: 14 }} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
          {sessions.length === 0 && (
            <div className="px-3 py-8 text-center">
              <FiMessageSquare className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" style={{ fontSize: 22 }} />
              <p className="text-xs text-zinc-400 dark:text-zinc-600">No conversations yet</p>
            </div>
          )}

          {groupedSessions.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((s) => (
                  <div key={s.id} className="relative group">
                    {renamingId === s.id ? (
                      <input
                        autoFocus
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onBlur={() => renameSession(s.id, renameDraft)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') renameSession(s.id, renameDraft);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-sky-300 dark:border-sky-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setActiveId(s.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium truncate pr-8 transition-colors duration-150 ${
                          activeId === s.id
                            ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                      >
                        {s.title}
                      </button>
                    )}

                    {renamingId !== s.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuForId(menuForId === s.id ? null : s.id);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center transition-opacity duration-150"
                      >
                        <FiMoreVertical className="text-zinc-400" style={{ fontSize: 12 }} />
                      </button>
                    )}

                    {menuForId === s.id && (
                      <div
                        ref={rowMenuRef}
                        className="absolute right-0 top-9 z-20 w-36 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150"
                      >
                        <button
                          onClick={() => {
                            setRenamingId(s.id);
                            setRenameDraft(s.title);
                            setMenuForId(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
                        >
                          <FiEdit2 style={{ fontSize: 11 }} />
                          Rename
                        </button>
                        <button
                          onClick={() => deleteSession(s.id)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                        >
                          <FiTrash2 style={{ fontSize: 11 }} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <button
            onClick={() => {
              setApiKeyDraft(apiKey);
              setApiKeyModalOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-500 dark:text-zinc-400 transition-colors duration-150"
          >
            <FiKey style={{ fontSize: 13 }} />
            {apiKey ? 'API key set' : 'Set API key'}
            {apiKey && <FiCheck className="ml-auto text-emerald-500" style={{ fontSize: 12 }} />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="sm:hidden w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center flex-shrink-0"
            >
              <FiMenu className="text-zinc-600 dark:text-zinc-300" style={{ fontSize: 16 }} />
            </button>

            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={() => setModelMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-150"
              >
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${activeModel.color} flex items-center justify-center flex-shrink-0`}>
                  <ModelIcon className="text-white" style={{ fontSize: 12 }} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate max-w-[140px] sm:max-w-none">
                  {activeModel.name}
                </span>
                <FiChevronDown className={`text-zinc-400 transition-transform duration-200 ${modelMenuOpen ? 'rotate-180' : ''}`} style={{ fontSize: 12 }} />
              </button>

              {modelMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 rounded-2xl shadow-2xl p-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto">
                  {CHAT_MODELS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => switchModel(m.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
                      >
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="text-white" style={{ fontSize: 13 }} />
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{m.name}</span>
                        {m.requiresPlan === 'pro' && (
                          <span className="ml-auto text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            PRO
                          </span>
                        )}
                        {activeModel.id === m.id && <FiCheck className="text-sky-500 flex-shrink-0" style={{ fontSize: 13 }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <ThemeToggle />
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 text-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeModel.color} flex items-center justify-center mb-4 shadow-lg`}>
                <ModelIcon className="text-white" style={{ fontSize: 24 }} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-800 dark:text-zinc-100 mb-1">
                Chat with {activeModel.name}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-600 max-w-xs">
                Start typing below to begin the conversation.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 space-y-5">
              {activeSession.messages.map((m) => (
                <MessageBubble key={m.id} message={m} modelIcon={ModelIcon} modelColor={activeModel.color} />
              ))}
              {isSending && (
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${activeModel.color} flex items-center justify-center flex-shrink-0`}>
                    <ModelIcon className="text-white" style={{ fontSize: 13 }} />
                  </div>
                  <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-2">
          {error && (
            <div className="max-w-3xl mx-auto mb-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-[11px] sm:text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg focus-within:shadow-xl focus-within:border-sky-300 dark:focus-within:border-sky-700 transition-all duration-200 p-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message the model..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none max-h-48"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-90"
              >
                <FiSend className="text-white" style={{ fontSize: 14 }} />
              </button>
            </div>
            <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 mt-2">
              Conversations are saved locally in your browser.
            </p>
          </div>
        </div>
      </div>

      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div onClick={() => setApiKeyModalOpen(false)} className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-250">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                <FiKey className="text-sky-500" style={{ fontSize: 15 }} />
              </div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">Enter your API key</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Your key is used to call the model endpoint and is only stored in your browser.
            </p>
            <input
              autoFocus
              type="password"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
              placeholder="sk-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-sm font-mono text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-300 dark:focus:border-sky-700 transition-all duration-200 mb-4"
            />
            <button
              onClick={saveApiKey}
              disabled={!apiKeyDraft.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              Save and continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message, modelIcon: ModelIcon, modelColor }: { message: ChatMessage; modelIcon: any; modelColor: string }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyText = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm shadow-md whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 group">
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${modelColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <ModelIcon className="text-white" style={{ fontSize: 13 }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="px-4 py-2.5 rounded-2xl rounded-tl-md bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-sm text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <button
          onClick={copyText}
          className="mt-1 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          {copied ? <FiCheck style={{ fontSize: 10 }} /> : <FiCopy style={{ fontSize: 10 }} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function groupByDate(sessions: ChatSession[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 6 * 86400000;

  const buckets: { label: string; items: ChatSession[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 days', items: [] },
    { label: 'Older', items: [] },
  ];

  [...sessions]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((s) => {
      if (s.updatedAt >= today) buckets[0].items.push(s);
      else if (s.updatedAt >= yesterday) buckets[1].items.push(s);
      else if (s.updatedAt >= weekAgo) buckets[2].items.push(s);
      else buckets[3].items.push(s);
    });

  return buckets.filter((b) => b.items.length > 0);
}
