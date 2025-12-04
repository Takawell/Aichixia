"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) {
    return (
      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
    );
  }

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 dark:from-indigo-500 dark:to-purple-600 p-1 transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
      aria-label="Toggle theme"
    >
      <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-500">
        <div className="relative w-6 h-6">
          <svg
            className={`absolute inset-0 w-6 h-6 text-amber-500 transition-all duration-500 ${
              theme === "light"
                ? "rotate-0 opacity-100 scale-100"
                : "rotate-90 opacity-0 scale-50"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className={`absolute inset-0 w-6 h-6 text-indigo-400 transition-all duration-500 ${
              theme === "dark"
                ? "rotate-0 opacity-100 scale-100"
                : "-rotate-90 opacity-0 scale-50"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
