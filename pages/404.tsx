import Link from "next/link"
import { motion } from "framer-motion"
import {
  FaArrowLeft,
  FaCompass,
  FaLock,
  FaTerminal,
  FaKey,
} from "react-icons/fa"

export default function Custom404() {
  const encrypted = [
    80, 82, 79, 45, 87, 69, 76, 67, 79, 77, 69, 45, 50, 48, 50, 54,
  ]

  const decoded = encrypted.map((x) => String.fromCharCode(x)).join("")

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/10 blur-[180px] rounded-full"></div>

        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[160px] rounded-full"></div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-5 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="w-full max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-[0_0_120px_rgba(0,255,255,0.08)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.04),transparent)]"></div>

            <div className="relative p-6 sm:p-10 lg:p-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-60 rounded-full"></div>

                  <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600">
                    <FaCompass className="text-white text-sm" />
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300 font-bold">
                    Restricted Route
                  </p>

                  <h2 className="text-sm text-zinc-500 mt-1">
                    Error 404 • Unknown destination
                  </h2>
                </div>
              </div>

              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-[-0.04em]"
                >
                  You found
                  <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    nothing.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed"
                >
                  The page you requested no longer exists or was moved into a
                  protected environment. However, some visitors believe hidden
                  references still remain inside forgotten routes.
                </motion.p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-10">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-4">
                    <FaTerminal className="text-cyan-300 text-sm" />
                  </div>

                  <h3 className="font-semibold text-white text-sm">
                    Lost Endpoint
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    Certain experimental routes may still expose archived
                    fragments.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center mb-4">
                    <FaLock className="text-purple-300 text-sm" />
                  </div>

                  <h3 className="font-semibold text-white text-sm">
                    Access Layer
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    Some references remain intentionally obscured during this
                    phase.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-4">
                    <FaKey className="text-emerald-300 text-sm" />
                  </div>

                  <h3 className="font-semibold text-white text-sm">
                    Hidden Signal
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    Clues are never shown directly. Precision matters more than
                    visibility.
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="mt-10 rounded-3xl border border-white/10 bg-black/30 backdrop-blur-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>

                  <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-600">
                    encrypted-log
                  </span>
                </div>

                <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm space-y-3">
                  <div className="text-zinc-500">
                    searching hidden references...
                  </div>

                  <div className="text-cyan-300">
                    route.scan("/access/fragments")
                  </div>

                  <div className="text-zinc-500">
                    fragment signature detected
                  </div>

                  <div className="text-purple-300 break-all">
                    {btoa(decoded).split("").reverse().join("")}
                  </div>

                  <div className="text-zinc-600">
                    reverse → decode → verify
                  </div>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link
                  href="/"
                  className="group inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-sm font-bold text-white transition-all duration-500 hover:scale-[1.02]"
                >
                  <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-1" />
                  Return Home
                </Link>

                <button className="px-6 py-4 rounded-2xl border border-white/10 bg-white/[0.03] text-sm text-zinc-300 hover:bg-white/[0.06] transition-all duration-500">
                  Continue Exploring
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
