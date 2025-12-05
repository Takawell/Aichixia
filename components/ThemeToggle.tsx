"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "dark"
      : "dark"
  );
  const [mounted, setMounted] = useState(false);
  const particles = Array.from({ length: 24 });
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-40, 40], [15, -15]);
  const rotateY = useTransform(x, [-40, 40], [-15, 15]);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const move = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx);
    y.set(dy);
  };

  const leave = () => {
    x.set(0);
    y.set(0);
  };

  if (!mounted) return <div className="w-24 h-24 rounded-3xl bg-gray-300 dark:bg-gray-700" />;

  return (
    <motion.button
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={toggle}
      aria-label="toggle theme"
      style={{ rotateX, rotateY }}
      className="group relative w-24 h-24 overflow-hidden rounded-3xl p-[3px] shadow-xl transition-all duration-500 hover:scale-[1.14] active:scale-95"
    >
      <motion.div
        className="absolute inset-0 rounded-3xl"
        animate={{
          background:
            theme === "light"
              ? [
                  "linear-gradient(135deg,#ff7a00,#ff1e56)",
                  "linear-gradient(135deg,#ffa600,#ff007a)",
                  "linear-gradient(135deg,#ff8800,#ff3e9f)"
                ]
              : [
                  "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  "linear-gradient(135deg,#6d28d9,#4f46e5)",
                  "linear-gradient(135deg,#5b21b6,#7c3aed)"
                ]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        animate={{
          opacity: theme === "light" ? 0 : 0.4,
          scale: theme === "light" ? 0.9 : 1.3
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 rounded-3xl blur-2xl bg-indigo-500 dark:bg-indigo-700"
      />

      <div className="relative w-full h-full rounded-3xl backdrop-blur-2xl bg-white/20 dark:bg-black/30 flex items-center justify-center overflow-hidden">

        <AnimatePresence mode="wait">
          {theme === "light" ? (
            <motion.div
              key="sun"
              initial={{ opacity: 0, scale: 0.2, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.2, rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute"
              >
                <Sun className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
              </motion.div>

              <motion.div
                animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.2, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-24 h-24 rounded-full bg-yellow-400/30 blur-xl"
              />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ opacity: 0, scale: 0.2, rotate: 180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.2, rotate: -180 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Moon className="w-12 h-12 text-indigo-300 drop-shadow-xl" />
              </motion.div>

              <motion.div
                animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute w-24 h-24 rounded-full bg-indigo-500/40 blur-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {particles.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [
                Math.random() * 80 - 40,
                Math.random() * 80 - 40,
                Math.random() * 80 - 40
              ],
              y: [
                Math.random() * 80 - 40,
                Math.random() * 80 - 40,
                Math.random() * 80 - 40
              ],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute w-[3px] h-[3px] rounded-full ${
              theme === "light" ? "bg-yellow-300" : "bg-indigo-300"
            }`}
          />
        ))}

        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-full rounded-3xl border border-white/20 dark:border-white/10"
        />

        <motion.div
          animate={{
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 360]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl border border-white/10 dark:border-white/5"
        />

        <motion.div
          animate={{
            opacity: theme === "light" ? 0 : 0.4,
            scale: theme === "light" ? 1 : 1.4
          }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none bg-purple-600/30"
        />
      </div>
    </motion.button>
  );
}
