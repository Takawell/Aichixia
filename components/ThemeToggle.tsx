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
      className="relative flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 shadow-md transition-all duration-500 hover:shadow-xl"
      whileTap={{ scale: 0.9 }}
    >
      <motion.span
        key={isDark ? "dark-bg" : "light-bg"}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.15, scale: 2 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300 to-pink-400 dark:from-blue-500 dark:to-purple-600"
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -120, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 120, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 text-yellow-400"
          >
            <Sun size={24} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 120, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -120, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 text-blue-600"
          >
            <Moon size={22} />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        key={isDark ? "glow-dark" : "glow-light"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.9 }}
        className="absolute inset-0 blur-xl rounded-full pointer-events-none bg-gradient-to-br from-yellow-300/40 to-pink-400/40 dark:from-blue-600/40 dark:to-purple-600/40"
      />
    </motion.button>
  )
}
