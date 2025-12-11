"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = stored === "dark" || (!stored && prefersDark)
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = isDark ? "light" : "dark"
    document.documentElement.classList.toggle("dark", !isDark)
    localStorage.setItem("theme", next)
    setIsDark(!isDark)
  }

  if (!mounted) return null

  return (
    <motion.button
      onClick={toggle}
      aria-label="theme toggle"
      className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-105"
      whileTap={{ scale: 0.85 }}
    >
      <motion.span
        key={isDark ? "dark-bg" : "light-bg"}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: 2 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-purple-600"
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -120, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 120, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="relative z-10 text-yellow-400"
          >
            <Sun size={18} className="sm:w-5 sm:h-5" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 120, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -120, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="relative z-10 text-blue-600 dark:text-blue-400"
          >
            <Moon size={17} className="sm:w-[19px] sm:h-[19px]" />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        key={isDark ? "glow-dark" : "glow-light"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 0.9 }}
        className="absolute inset-0 blur-xl rounded-full pointer-events-none bg-gradient-to-br from-blue-400/30 to-blue-600/30 dark:from-blue-500/40 dark:to-purple-600/40"
      />
    </motion.button>
  )
}
