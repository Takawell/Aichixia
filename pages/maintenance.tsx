"use client";

import { useEffect, useMemo, useState } from "react";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    opacity: 0.06 + i * 0.05,
    duration: 18 + (i % 10),
  }));

  return (
    <div className="paths-layer" aria-hidden="true">
      <svg viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            className="floating-path"
            style={{ animationDuration: `${path.duration}s` }}
          />
        ))}
      </svg>
      <style jsx>{`
        .paths-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .paths-layer svg {
          width: 100%;
          height: 100%;
          color: #7dd3fc;
        }

        .floating-path {
          stroke-dasharray: 1400;
          animation-name: dash-flow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes dash-flow {
          0% {
            stroke-dashoffset: 1400;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1400;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-path {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function MaintenancePage() {
  const target = useMemo(() => Date.now() + 1000 * 60 * 60 * 44, []);
  const { days, hours, minutes, seconds } = useCountdown(target);

  const title = "Under Maintenance";
  const words = title.split(" ");

  const units = [
    { value: days, label: "days" },
    { value: hours, label: "hrs" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];

  return (
    <main className="page">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      <div className="content">
        <h1 className="headline">
          {words.map((word, wi) => (
            <span className="word" key={wi}>
              {word.split("").map((letter, li) => (
                <span
                  className="letter"
                  key={`${wi}-${li}`}
                  style={{ animationDelay: `${wi * 0.08 + li * 0.03}s` }}
                >
                  {letter}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="subcopy">
          We&rsquo;re upgrading the infrastructure behind every request.
          API keys, credits, and usage history remain untouched.
        </p>

        <div className="countdown" role="timer" aria-label="Estimated time remaining">
          {units.map((u, i) => (
            <div className="unit" key={u.label}>
              <span className="unit-value">{pad(u.value)}</span>
              <span className="unit-label">{u.label}</span>
              {i < units.length - 1 && <span className="unit-sep">:</span>}
            </div>
          ))}
        </div>

        <a href="mailto:support@aichixia.xyz" className="footer-link">
          support@aichixia.xyz
        </a>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap");

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #050505;
        }

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          background: radial-gradient(
              120% 90% at 50% 0%,
              #0d0d10 0%,
              #050505 60%
            ),
            #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 1.5rem;
        }

        .content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .headline {
          font-size: clamp(2rem, 8vw, 3.1rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.08;
          margin: 0 0 1.1rem;
        }

        .word {
          display: inline-block;
          margin-right: 0.32em;
        }

        .word:last-child {
          margin-right: 0;
        }

        .letter {
          display: inline-block;
          background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: letter-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .subcopy {
          font-size: 0.94rem;
          line-height: 1.6;
          color: #9a9a9e;
          max-width: 36ch;
          margin: 0 0 2.25rem;
          animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.5s;
        }

        .countdown {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 2.25rem;
          animation: fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.6s;
        }

        .unit {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .unit-value {
          font-family: "Geist Mono", ui-monospace, "SF Mono", monospace;
          font-size: clamp(1.1rem, 4vw, 1.4rem);
          font-weight: 500;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9px;
          padding: 0.5rem 0.65rem;
          min-width: 46px;
          text-align: center;
        }

        .unit-label {
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b6b70;
          display: none;
        }

        .unit-sep {
          color: #4a4a4e;
          font-family: "Geist Mono", ui-monospace, monospace;
          font-size: 1rem;
        }

        .footer-link {
          font-size: 0.78rem;
          color: #6b6b70;
          text-decoration: none;
          transition: color 0.2s ease;
          animation: fade-in 1s ease both;
          animation-delay: 0.75s;
        }

        .footer-link:hover {
          color: #b0b0b4;
          text-decoration: underline;
        }

        @keyframes letter-in {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (min-width: 480px) {
          .unit-label {
            display: inline;
          }
        }

        @media (min-width: 640px) {
          .page {
            padding: 2rem;
          }
        }
      `}</style>
    </main>
  );
}
