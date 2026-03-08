"use client"

import { useEffect, useState } from "react"
import { FaMoon, FaSun } from "react-icons/fa"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored) {
      const dark = stored === "dark"
      setIsDark(dark)
      document.documentElement.classList.toggle("dark", dark)
    } else {
      setIsDark(true)
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = !isDark
    const root = document.documentElement

    root.style.transition = "background-color 400ms ease, color 400ms ease, border-color 400ms ease"

    root.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
    setIsDark(next)

    setTimeout(() => {
      root.style.transition = ""
    }, 420)
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        @keyframes spinIn {
          from { transform: rotate(-90deg) scale(0.5); opacity: 0; }
          to   { transform: rotate(0deg)   scale(1);   opacity: 1; }
        }
        @keyframes spinOut {
          from { transform: rotate(0deg)   scale(1);   opacity: 1; }
          to   { transform: rotate(90deg)  scale(0.5); opacity: 0; }
        }
        .theme-icon-enter {
          animation: spinIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
      >
        <span key={isDark ? "sun" : "moon"} className="theme-icon-enter block">
          {isDark
            ? <FaSun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            : <FaMoon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          }
        </span>
      </button>
    </>
  )
}
