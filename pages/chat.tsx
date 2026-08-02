import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/lib/supabase';
import {
  FiPlus, FiMenu, FiX, FiTrash2, FiMoreVertical, FiEdit2,
  FiChevronDown, FiCheck, FiCopy, FiArrowLeft, FiMessageSquare, FiLogOut,
  FiSearch, FiCode, FiMaximize2, FiMinimize2, FiExternalLink, FiEdit3,
  FiBookOpen, FiHome, FiArrowUp, FiStopCircle, FiRefreshCw, FiThumbsUp, FiThumbsDown,
} from 'react-icons/fi';
import {
  SiAnthropic, SiAlibabacloud, SiMaze, SiDigikeyelectronics, SiAirbrake,
  SiGooglegemini, SiMeta, SiXiaomi, SiNvidia,
} from 'react-icons/si';
import { RiOpenaiFill } from 'react-icons/ri';
import { GiSpermWhale, GiPowerLightning, GiClover } from 'react-icons/gi';
import { DiBower } from 'react-icons/di';
import { TbSquareLetterZ, TbLetterM } from 'react-icons/tb';
import { TiVendorMicrosoft } from 'react-icons/ti';
import { FaXTwitter } from 'react-icons/fa6';
import ThemeToggle from '@/components/ThemeToggle';

type ChatModel = {
  id: string;
  name: string;
  icon: any;
  color: string;
  endpoint: string;
  description: string;
  requiresPlan?: 'pro' | 'enterprise';
};

const CHAT_MODELS: ChatModel[] = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', icon: RiOpenaiFill, color: 'from-emerald-600 to-green-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Balanced performance for general tasks' },
  { id: 'aichixia-flash', name: 'Aichixia 114B', icon: SiAirbrake, color: 'from-blue-600 via-blue-800 to-slate-900', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Ultra-fast inference, multimodal', requiresPlan: 'pro' },
  { id: 'mistral-large-3-675b-instruct', name: 'Mistral Large 3 675B', icon: TbLetterM, color: 'from-orange-600 to-amber-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Strong reasoning, multilingual' },
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', icon: GiSpermWhale, color: 'from-cyan-600 to-blue-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Deep reasoning and code generation', requiresPlan: 'pro' },
  { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', icon: GiSpermWhale, color: 'from-cyan-600 to-teal-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Multi-purpose, reliable' },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', icon: SiAnthropic, color: 'from-orange-600 to-amber-700', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Advanced coding, deep reasoning', requiresPlan: 'pro' },
  { id: 'claude-opus-4.8', name: 'Claude Opus 4.8', icon: SiAnthropic, color: 'from-orange-600 to-amber-700', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Ultimate intelligence for complex tasks' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', icon: SiGooglegemini, color: 'from-indigo-600 to-purple-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Multimodal understanding and accuracy' },
  { id: 'grok-3', name: 'Grok 3', icon: FaXTwitter, color: 'from-slate-600 to-zinc-800', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: "xAI's flagship model with real-time data" },
  { id: 'phi-4-multimodal-instruct', name: 'Phi 4 Multimodal', icon: TiVendorMicrosoft, color: 'from-cyan-500 to-blue-700', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Compact multimodal model' },
  { id: 'glm-4.7', name: 'GLM 4.7', icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-900', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Multilingual excellence with strong reasoning', requiresPlan: 'pro' },
  { id: 'glm-4.7-flash', name: 'GLM 4.7 Flash', icon: TbSquareLetterZ, color: 'from-blue-700 to-indigo-900', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Very fast, suitable for real time apps' },
  { id: 'kimi-k2.6', name: 'Kimi K2.6', icon: SiDigikeyelectronics, color: 'from-blue-600 to-cyan-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Superior tool calling and complex reasoning', requiresPlan: 'pro' },
  { id: 'step-3.7-flash', name: 'Step 3.7 Flash', icon: DiBower, color: 'from-blue-500 to-blue-700', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Native multimodal, agentic, coding' },
  { id: 'nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', icon: SiNvidia, color: 'from-emerald-600 to-green-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Large-scale MoE for complex reasoning' },
  { id: 'qwen3.6-27b', name: 'Qwen3.6 27B', icon: SiAlibabacloud, color: 'from-purple-500 to-pink-500', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Multimodal model from Alibaba Qwen series' },
  { id: 'qwen3-coder-480b', name: 'Qwen3 Coder 480B', icon: SiAlibabacloud, color: 'from-purple-600 to-fuchsia-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Specialized in coding and Asian languages', requiresPlan: 'pro' },
  { id: 'minimax-m3', name: 'MiniMax M3', icon: SiMaze, color: 'from-cyan-600 to-blue-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Multilingual coding specialist', requiresPlan: 'pro' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', icon: SiMeta, color: 'from-blue-600 to-indigo-700', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Efficient open-source powerhouse' },
  { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', icon: RiOpenaiFill, color: 'from-pink-600 to-rose-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Large open-source with browser search' },
  { id: 'mimo-v2-flash', name: 'MiMo V2 Flash', icon: SiXiaomi, color: 'from-blue-600 to-purple-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Efficient MoE for reasoning and coding' },
  { id: 'groq-compound', name: 'Groq Compound', icon: GiPowerLightning, color: 'from-orange-600 to-red-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Multi-model agentic system with tools' },
  { id: 'cohere-command-a', name: 'Cohere Command A', icon: GiClover, color: 'from-emerald-600 to-teal-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Enterprise-grade with excellent tool use' },
  { id: 'grok-4-fast', name: 'Grok 4 Fast', icon: FaXTwitter, color: 'from-zinc-700 to-slate-900', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: "xAI's fastest Grok 4 model", requiresPlan: 'pro' },
  { id: 'gpt-5.2', name: 'GPT-5.2', icon: RiOpenaiFill, color: 'from-green-500 to-emerald-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: 'Enhanced reasoning, latest generation' },
  { id: 'gpt-5.5', name: 'GPT-5.5', icon: RiOpenaiFill, color: 'from-green-500 to-emerald-600', endpoint: 'https://www.aichixia.xyz/api/v1/chat/completions', description: "OpenAI's most advanced model", requiresPlan: 'pro' },
];

type UserProfile = {
  email: string;
  display_name: string | null;
  avatar_url: string | null;
};

type UserSettings = {
  plan: 'free' | 'pro' | 'enterprise';
  plan_expires_at: string | null;
  is_admin: boolean;
};

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

type Artifact = {
  id: string;
  title: string;
  language: string;
  code: string;
};

const STORAGE_KEY = 'aichixia_chat_sessions';
const API_KEY_STORAGE_KEY = 'aichixia_chat_api_key';

const quickActions = [
  { id: 'write', label: 'Write', icon: FiEdit3 },
  { id: 'learn', label: 'Learn', icon: FiBookOpen },
  { id: 'code', label: 'Code', icon: FiCode },
  { id: 'life', label: 'Life stuff', icon: FiHome },
];

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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function extractArtifact(text: string): Artifact | null {
  const match = text.match(/```(\w+)?\n([\s\S]*?)```/);
  if (!match) return null;
  const code = match[2].trim();
  if (code.split('\n').length < 6 && code.length < 200) return null;
  return { id: genId(), title: 'Generated code', language: match[1] || 'text', code };
}

function getPlanInfo(settings: UserSettings | null) {
  if (!settings) return { name: 'Free', color: 'sky' };
  if (settings.plan === 'enterprise') return { name: 'Enterprise', color: 'rose' };
  if (settings.plan === 'pro') return { name: 'Pro', color: 'purple' };
  return { name: 'Free', color: 'sky' };
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [artifactExpanded, setArtifactExpanded] = useState(false);
  const [artifactCopied, setArtifactCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  const profileModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    setActiveId(loaded[0]?.id ?? null);
    try {
      const savedKey = window.localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) setApiKey(savedKey);
    } catch {}
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUser(session.user);
    const res = await fetch('/api/console/profile', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
      setSettings(data.settings);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeId, sessions, isSending]);

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

  const openProfileModal = () => {
    setShowProfileModal(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setProfileModalVisible(true)));
  };
  const closeProfileModal = () => {
    setProfileModalVisible(false);
    setTimeout(() => setShowProfileModal(false), 250);
  };

  useEffect(() => {
    if (!showProfileModal) return;
    const onClickOutside = (e: MouseEvent) => {
      if (profileModalRef.current && !profileModalRef.current.contains(e.target as Node)) closeProfileModal();
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showProfileModal]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;
  const activeModel = CHAT_MODELS.find((m) => m.id === activeSession?.modelId) ?? CHAT_MODELS[0];
  const planInfo = getPlanInfo(settings);

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
    setArtifact(null);
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
    if (!activeSession) return;
    setSessions((prev) => prev.map((s) => (s.id === activeSession.id ? { ...s, modelId } : s)));
  };

  const saveApiKey = () => {
    setApiKey(apiKeyDraft);
    try {
      window.localStorage.setItem(API_KEY_STORAGE_KEY, apiKeyDraft);
    } catch {}
    setApiKeyModalOpen(false);
  };

  const stopGenerating = () => {
    abortRef.current?.abort();
    setIsSending(false);
  };

  const handleSend = async (presetText?: string) => {
    const text = (presetText ?? input).trim();
    if (!text || isSending) return;
    if (!apiKey.trim()) {
      setApiKeyDraft(apiKey);
      setApiKeyModalOpen(true);
      return;
    }

    let sessionId = activeId;
    if (!sessionId) sessionId = createSession();

    const userMsg: ChatMessage = { id: genId(), role: 'user', content: text, createdAt: Date.now() };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, title: s.messages.length === 0 ? titleFromMessage(text) : s.title, messages: [...s.messages, userMsg], updatedAt: Date.now() }
          : s
      )
    );
    setInput('');
    setError(null);
    setIsSending(true);
    abortRef.current = new AbortController();

    try {
      const session = sessions.find((s) => s.id === sessionId);
      const model = CHAT_MODELS.find((m) => m.id === (session?.modelId ?? activeModel.id)) ?? activeModel;
      const history = [...(session?.messages ?? []), userMsg].map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(model.endpoint, {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: model.id, messages: history, temperature: 0.7, max_tokens: 2048 }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);

      const replyText: string = data?.choices?.[0]?.message?.content ?? '';
      const assistantMsg: ChatMessage = { id: genId(), role: 'assistant', content: replyText, createdAt: Date.now() };

      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, assistantMsg], updatedAt: Date.now() } : s)));

      const found = extractArtifact(replyText);
      if (found) setArtifact(found);
    } catch (err: any) {
      if (err?.name !== 'AbortError') setError(err?.message || 'Something went wrong. Please try again.');
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

  const filteredSessions = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, sidebarSearch]);

  const groupedSessions = groupByDate(filteredSessions);
  const ModelIcon = activeModel.icon;
  const hasMessages = !!activeSession && activeSession.messages.length > 0;

  return (
    <div className="h-screen w-full flex bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl" />
      </div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-zinc-900/40 backdrop-blur-sm lg:hidden" />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 flex-shrink-0 flex flex-col bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-r border-zinc-200/70 dark:border-zinc-800/70 transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-7 h-7 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center">
            <FiX className="text-zinc-500" style={{ fontSize: 14 }} />
          </button>
        </div>

        <div className="p-3 space-y-2">
          <button
            onClick={() => createSession()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-200 active:scale-[0.98]"
          >
            <FiPlus style={{ fontSize: 14 }} />
            New chat
          </button>

          {sessions.length > 0 && (
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" style={{ fontSize: 12 }} />
              <input
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search chats"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-900/60 border border-transparent focus:border-sky-300 dark:focus:border-sky-700 text-xs text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 outline-none transition-colors duration-150"
              />
            </div>
          )}
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
              <p className="px-3 mb-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">{group.label}</p>
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
                          setArtifact(null);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium truncate pr-8 transition-colors duration-150 ${
                          activeId === s.id ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
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

        <div className="px-2.5 py-3 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1">
          <button
            onClick={openProfileModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 hover:border-sky-300 dark:hover:border-sky-700/60 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-all duration-200 group text-left"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-sky-300 dark:group-hover:ring-sky-700 transition-all duration-200" />
            ) : (
              <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-[10px] ring-1 ring-sky-300/50 group-hover:ring-sky-400/80 transition-all duration-200">
                {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate leading-tight">
                {profile?.display_name || user?.email || 'Guest'}
              </p>
              <span
                className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                  planInfo.color === 'sky' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400' :
                  planInfo.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                }`}
              >
                {planInfo.name}
              </span>
            </div>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all duration-200 group"
          >
            <FiLogOut className="flex-shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-200" style={{ fontSize: 13 }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className={`flex-1 flex min-w-0 relative transition-all duration-300 ${artifact ? 'lg:mr-[45%]' : ''}`}>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl z-20">
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center flex-shrink-0">
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
                  <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-none">{activeModel.name}</span>
                  <FiChevronDown className={`text-zinc-400 transition-transform duration-200 ${modelMenuOpen ? 'rotate-180' : ''}`} style={{ fontSize: 12 }} />
                </button>

                {modelMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 rounded-2xl shadow-2xl p-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto">
                    {CHAT_MODELS.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => switchModel(m.id)}
                          className="w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 text-left"
                        >
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className="text-white" style={{ fontSize: 13 }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{m.name}</span>
                              {m.requiresPlan && (
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  {m.requiresPlan === 'enterprise' ? 'ENTERPRISE' : 'PRO'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{m.description}</p>
                          </div>
                          {activeModel.id === m.id && <FiCheck className="text-sky-500 flex-shrink-0 mt-1" style={{ fontSize: 13 }} />}
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
            {!hasMessages ? (
              <div className="h-full flex flex-col items-center justify-center px-4 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/20 animate-in fade-in zoom-in-95 duration-500">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 sm:w-7 sm:h-7" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L13.8 9.2L20 11L13.8 12.8L12 19L10.2 12.8L4 11L10.2 9.2L12 3Z" fill="white" />
                  </svg>
                </div>

                <h1 className="text-2xl sm:text-4xl font-serif text-zinc-800 dark:text-zinc-100 text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {getGreeting()},{' '}
                  <span className="relative inline-block">
                    {profile?.display_name || 'there'}
                    <svg className="absolute left-0 -bottom-1 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                      <path d="M0 3 Q 25 0, 50 3 T 100 3" stroke="#0ea5e9" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  {quickActions.map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.id}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-all duration-200 active:scale-95"
                      >
                        <Icon style={{ fontSize: 13 }} />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 space-y-5">
                {activeSession!.messages.map((m) => (
                  <MessageBubble key={m.id} message={m} modelIcon={ModelIcon} modelColor={activeModel.color} onViewArtifact={setArtifact} />
                ))}
                {isSending && (
                  <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
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
              <div className="max-w-3xl mx-auto mb-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-[11px] sm:text-xs font-medium text-red-600 dark:text-red-400 flex items-center justify-between gap-2">
                <span>{error}</span>
                <button onClick={() => handleSend(activeSession?.messages.slice(-1)[0]?.content)} className="flex-shrink-0 flex items-center gap-1 font-semibold hover:underline">
                  <FiRefreshCw style={{ fontSize: 10 }} />
                  Retry
                </button>
              </div>
            )}

            <div className="max-w-3xl mx-auto">
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg focus-within:shadow-xl focus-within:border-sky-300 dark:focus-within:border-sky-700 transition-all duration-200 p-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="How can I help you today?"
                  rows={1}
                  className="w-full resize-none bg-transparent px-1 py-1 text-sm sm:text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none max-h-48"
                />

                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-600 px-1">Shift + Enter for new line</span>

                  {isSending ? (
                    <button
                      onClick={stopGenerating}
                      className="w-8 h-8 rounded-lg bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-700 dark:hover:bg-white flex items-center justify-center transition-all duration-200 active:scale-90"
                    >
                      <FiStopCircle className="text-white dark:text-zinc-900" style={{ fontSize: 14 }} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="w-8 h-8 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-90"
                    >
                      <FiArrowUp className="text-white" style={{ fontSize: 14 }} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-center text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-600 mt-3">
                AI can make mistakes. Please check important information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {artifact && (
        <div
          className={`fixed inset-y-0 right-0 z-40 bg-white dark:bg-zinc-950 border-l border-zinc-200/70 dark:border-zinc-800/70 shadow-2xl flex flex-col transition-all duration-300 ease-out ${
            artifactExpanded ? 'w-full' : 'w-full sm:w-[85%] lg:w-[45%]'
          } animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200/60 dark:border-zinc-800/60 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <FiCode className="text-white" style={{ fontSize: 13 }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">{artifact.title}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{artifact.language}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(artifact.code);
                  setArtifactCopied(true);
                  setTimeout(() => setArtifactCopied(false), 1500);
                }}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors duration-150"
              >
                {artifactCopied ? <FiCheck className="text-emerald-500" style={{ fontSize: 14 }} /> : <FiCopy className="text-zinc-500" style={{ fontSize: 14 }} />}
              </button>
              <button
                onClick={() => setArtifactExpanded((v) => !v)}
                className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 items-center justify-center transition-colors duration-150"
              >
                {artifactExpanded ? <FiMinimize2 className="text-zinc-500" style={{ fontSize: 13 }} /> : <FiMaximize2 className="text-zinc-500" style={{ fontSize: 13 }} />}
              </button>
              <button
                onClick={() => setArtifact(null)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors duration-150"
              >
                <FiX className="text-zinc-500" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900">
            <pre className="text-xs sm:text-[13px] leading-relaxed p-4 font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
              <code>{artifact.code}</code>
            </pre>
          </div>
        </div>
      )}

      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div onClick={() => setApiKeyModalOpen(false)} className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-250">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                <FiCode className="text-sky-500" style={{ fontSize: 15 }} />
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

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-250 ${profileModalVisible ? 'opacity-100' : 'opacity-0'}`} />
          <div
            ref={profileModalRef}
            className={`relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-2xl p-5 sm:p-6 transition-all duration-300 ${
              profileModalVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 sm:translate-y-2 opacity-0 scale-[0.98]'
            }`}
          >
            <button onClick={closeProfileModal} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all duration-150">
              <FiX className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 13 }} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-sky-200 dark:ring-sky-800" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-sky-200 dark:ring-sky-800">
                  {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-base font-black text-zinc-900 dark:text-white truncate">{profile?.display_name || 'Guest'}</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{profile?.email || user?.email}</p>
              </div>
            </div>

            <div
              className={`px-3.5 py-2.5 rounded-xl border text-center mb-4 ${
                planInfo.color === 'sky' ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/50 text-sky-700 dark:text-sky-400' :
                planInfo.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-400' :
                'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400'
              }`}
            >
              <span className="text-xs font-bold">{planInfo.name} Plan</span>
            </div>

            <button
              onClick={() => router.push('/console')}
              className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition-colors duration-150"
            >
              Manage account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  modelIcon: ModelIcon,
  modelColor,
  onViewArtifact,
}: {
  message: ChatMessage;
  modelIcon: any;
  modelColor: string;
  onViewArtifact: (a: Artifact) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const isUser = message.role === 'user';

  const copyText = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm shadow-md whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${modelColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <ModelIcon className="text-white" style={{ fontSize: 13 }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="px-4 py-2.5 rounded-2xl rounded-tl-md bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-sm text-zinc-800 dark:text-zinc-100">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-pre:my-2 prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800 prose-pre:rounded-xl prose-code:text-sky-600 dark:prose-code:text-sky-400 prose-code:before:content-none prose-code:after:content-none prose-headings:font-bold prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const codeText = String(children).replace(/\n$/, '');
                  if (inline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                  const langMatch = /language-(\w+)/.exec(className || '');
                  const isBigBlock = codeText.split('\n').length >= 6 || codeText.length >= 200;
                  return (
                    <div className="relative group/code">
                      <pre className="!my-0">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                      {isBigBlock && (
                        <button
                          onClick={() =>
                            onViewArtifact({
                              id: genId(),
                              title: 'Generated code',
                              language: langMatch?.[1] || 'text',
                              code: codeText,
                            })
                          }
                          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-700/60 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 opacity-0 group-hover/code:opacity-100 transition-opacity duration-150 shadow-sm"
                        >
                          <FiExternalLink style={{ fontSize: 10 }} />
                          Open
                        </button>
                      )}
                    </div>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button onClick={copyText} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-150">
            {copied ? <FiCheck style={{ fontSize: 10 }} /> : <FiCopy style={{ fontSize: 10 }} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-150 ${feedback === 'up' ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
          >
            <FiThumbsUp style={{ fontSize: 11 }} />
          </button>
          <button
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-150 ${feedback === 'down' ? 'text-red-500' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
          >
            <FiThumbsDown style={{ fontSize: 11 }} />
          </button>
        </div>
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
