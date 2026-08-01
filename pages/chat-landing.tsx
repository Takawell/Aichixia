import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiClock, FiChevronDown, FiArrowUp, FiEdit3, FiBookOpen, FiCode, FiHome } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';

const NAME_STORAGE_KEY = 'aichixia_user_name';

const quickActions = [
  { id: 'write', label: 'Write', icon: FiEdit3 },
  { id: 'learn', label: 'Learn', icon: FiBookOpen },
  { id: 'code', label: 'Code', icon: FiCode },
  { id: 'life', label: 'Life stuff', icon: FiHome },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function ChatLanding() {
  const router = useRouter();
  const [name, setName] = useState('there');
  const [message, setMessage] = useState('');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [selectedModel] = useState('Sonnet 4.5');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NAME_STORAGE_KEY);
      if (saved) setName(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) setModelMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;
    router.push('/chat/session');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
      </div>

      <header className="relative flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-150 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
        >
          Console
        </button>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors duration-150">
            <FiClock className="text-zinc-400 dark:text-zinc-500" style={{ fontSize: 15 }} />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 -mt-14">
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/20 animate-in fade-in zoom-in-95 duration-500">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 sm:w-7 sm:h-7" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L13.8 9.2L20 11L13.8 12.8L12 19L10.2 12.8L4 11L10.2 9.2L12 3Z" fill="white" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif text-zinc-800 dark:text-zinc-100 text-center mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {getGreeting()},{' '}
            <span className="relative inline-block">
              {name}
              <svg
                className="absolute left-0 -bottom-1 w-full"
                height="6"
                viewBox="0 0 100 6"
                preserveAspectRatio="none"
              >
                <path d="M0 3 Q 25 0, 50 3 T 100 3" stroke="#0ea5e9" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <div className="w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:border-sky-300 dark:focus-within:border-sky-700 transition-all duration-200 p-3">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                rows={1}
                className="w-full resize-none bg-transparent px-1 py-1 text-sm sm:text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none max-h-48"
              />

              <div className="flex items-center justify-between mt-2 pt-1">
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors duration-150">
                    <FiPlus className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 16 }} />
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors duration-150">
                    <FiClock className="text-zinc-500 dark:text-zinc-400" style={{ fontSize: 15 }} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative" ref={modelMenuRef}>
                    <button
                      onClick={() => setModelMenuOpen((v) => !v)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition-colors duration-150"
                    >
                      {selectedModel}
                      <FiChevronDown className={`transition-transform duration-200 ${modelMenuOpen ? 'rotate-180' : ''}`} style={{ fontSize: 12 }} />
                    </button>
                    {modelMenuOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
                        {['Opus 4.8', 'Sonnet 4.5', 'Haiku 4.5'].map((m) => (
                          <button
                            key={m}
                            onClick={() => setModelMenuOpen(false)}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 active:scale-90"
                  >
                    <FiArrowUp className="text-white" style={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-600 mt-3">
              AI can make mistakes. Please check important information.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 sm:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
      </main>
    </div>
  );
}
