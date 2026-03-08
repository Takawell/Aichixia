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
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
    setIsDark(next)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all duration-200"
    >
      {isDark ? <FaSun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <FaMoon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
    </button>
  )
}
