'use client';

import { useEffect, useState } from 'react';
import { FiShield, FiArrowRight, FiX } from 'react-icons/fi';

const NOTICE_KEY = 'aichixia_notice';

export default function Notice() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(NOTICE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(NOTICE_KEY, '1');
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  const handleSettings = () => {
    localStorage.setItem(NOTICE_KEY, '1');
    window.location.href = 'https://www.aichixia.xyz/console?tab=settings';
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={dismiss}
      />

      <div
        className={`relative w-full sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300 ${
          closing
            ? 'translate-y-4 opacity-0 scale-[0.98]'
            : 'translate-y-0 opacity-100 scale-100'
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center flex-shrink-0">
                <FiShield className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Security Notice
                </span>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug mt-0.5">
                  Set a Display Name
                </h2>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150 flex-shrink-0"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-1">
            We recommend setting a display name in your account settings to better protect your personal data and improve your experience across the platform.
          </p>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed mb-5">
            Your display name replaces your email address in shared sessions and activity logs.
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={dismiss}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-transparent transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              Maybe Later
            </button>
            <button
              onClick={handleSettings}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100 border border-transparent transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm"
            >
              Go to Settings
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-4 sm:pb-5">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center">
            This notice will not appear again after you close it.
          </p>
        </div>
      </div>
    </div>
  );
}
