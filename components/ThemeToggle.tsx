import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme-mode");
    if (saved) setTheme(saved);
    else setTheme("light");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme-mode", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme, mounted]);

  const modes = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "system", icon: Monitor, label: "System" }
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 select-none">
      <div className="text-3xl font-bold">Theme Mode</div>

      <div className="flex gap-4">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setTheme(m.id)}
            className={`relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-300 hover:scale-[1.05] active:scale-[0.97] ${
              theme === m.id
                ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-xl"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <m.icon className="w-8 h-8 mb-2" />
            {m.label}
            <AnimatePresence>
              {theme === m.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-2xl border-4 border-blue-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      <motion.div
        className="mt-10 p-6 w-[90%] max-w-xl rounded-3xl shadow-lg bg-gray-100 dark:bg-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="text-center text-xl font-semibold mb-4"
          key={theme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {theme === "light" && "Mode: Light"}
          {theme === "dark" && "Mode: Dark"}
          {theme === "system" && "Mode: System"}
        </motion.div>

        <motion.div
          className="text-center text-base text-gray-700 dark:text-gray-300"
          key={theme + "desc"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          {theme === "light" && "Tampilan cerah dan bersih untuk kenyamanan mata di siang hari."}
          {theme === "dark" && "Tampilan gelap yang elegan, cocok untuk malam hari dan ruangan minim cahaya."}
          {theme === "system" && "Mengikuti pengaturan tema perangkat kamu secara otomatis."}
        </motion.div>
      </motion.div>
    </div>
  );
}
