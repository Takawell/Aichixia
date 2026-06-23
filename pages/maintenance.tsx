import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import {
  RiRobot2Line,
  RiCpuLine,
  RiShieldCheckLine,
  RiDatabase2Line,
  RiCodeSSlashLine,
  RiWifiOffLine,
  RiTimeLine,
  RiMailLine,
  RiCheckLine,
  RiFileCopyLine,
  RiArrowRightLine,
  RiPulseLine,
} from "react-icons/ri";

const LOG_LINES = [
  { icon: RiRobot2Line,      text: "AI maintenance agent initialized",                  status: "ok"      },
  { icon: RiCpuLine,         text: "Human developers unavailable — reason: classified",  status: "warn"    },
  { icon: RiDatabase2Line,   text: "Running database integrity checks",                  status: "ok"      },
  { icon: RiShieldCheckLine, text: "Patching security vulnerabilities",                  status: "ok"      },
  { icon: RiCodeSSlashLine,  text: "Rebuilding API route handlers",                      status: "loading" },
  { icon: RiWifiOffLine,     text: "External traffic suspended",                         status: "warn"    },
];

const STATUSES = [
  { label: "API Gateway",    up: false },
  { label: "Auth Service",   up: true  },
  { label: "Model Router",   up: false },
  { label: "Usage Tracker",  up: true  },
  { label: "Billing Engine", up: true  },
  { label: "Playground",     up: false },
];

export default function Maintenance() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady]             = useState(false);
  const [progress, setProgress]       = useState(0);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [copied, setCopied]           = useState(false);
  const [tick, setTick]               = useState(0);

  useEffect(() => {
    setReady(true);

    const t1 = setTimeout(() => {
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random() * 1.8 + 0.2;
        if (p >= 63) { p = 63; clearInterval(iv); }
        setProgress(+p.toFixed(1));
      }, 80);
    }, 600);

    const t2 = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setVisibleLogs(i);
        if (i >= LOG_LINES.length) clearInterval(iv);
      }, 340);
    }, 900);

    const tickIv = setInterval(() => setTick(t => t + 1), 1000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(tickIv); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;
    let W = 0, H = 0;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    type Dot = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
    const dots: Dot[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.1 + 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.phase += 0.013;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        const a = 0.08 + 0.12 * Math.sin(d.phase);
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${a})`; ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(14,165,233,${0.06 * (1 - dist / 115)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const copy = () => {
    navigator.clipboard.writeText("contact@aichixia.xyz");
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const elapsed = `${String(Math.floor(tick / 3600)).padStart(2,"0")}:${String(Math.floor((tick % 3600) / 60)).padStart(2,"0")}:${String(tick % 60).padStart(2,"0")}`;

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>Aichixia — System Maintenance</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #04080f; overflow: hidden; }
        :root {
          --sky: #0ea5e9;
          --sky-dim: rgba(14,165,233,0.12);
          --sky-border: rgba(14,165,233,0.18);
          --surface: rgba(255,255,255,0.022);
          --border: rgba(255,255,255,0.058);
          --mono: 'Fira Code', monospace;
          --sans: 'Outfit', sans-serif;
        }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spinCW  { to{transform:rotate(360deg)} }
        @keyframes spinCCW { to{transform:rotate(-360deg)} }
        @keyframes floatY  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.22} }
        @keyframes scanline{ from{transform:translateY(-100vh)} to{transform:translateY(100vh)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes barGlow { 0%,100%{box-shadow:0 0 8px rgba(14,165,233,0.35)} 50%{box-shadow:0 0 20px rgba(14,165,233,0.65)} }
        @keyframes gradShift{0%,100%{background-position:0% 50%} 50%{background-position:100% 50%}}

        .fu1{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .05s both}
        .fu2{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .18s both}
        .fu3{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .3s both}
        .fu4{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .44s both}
        .fu5{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .58s both}
        .fu6{animation:fadeUp .65s cubic-bezier(.22,1,.36,1) .72s both}
        .fi {animation:fadeIn 1.2s ease .2s both}

        .headline-grad {
          background: linear-gradient(120deg,#f0f4f8 0%,#94a3b8 45%,#f0f4f8 90%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 5s ease infinite;
        }
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          backdrop-filter: blur(12px);
        }
        .log-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.038);
          animation: slideIn .3s ease both;
        }
        .log-row:last-child { border-bottom: none; }
        .svc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5.5px 0;
          border-bottom: 1px solid rgba(255,255,255,0.038);
        }
        .svc-row:last-child { border-bottom: none; }
        .btn-copy {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid var(--sky-border);
          background: var(--sky-dim);
          color: var(--sky);
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: .01em;
          transition: all .2s ease;
        }
        .btn-copy:hover { background: rgba(14,165,233,0.2); border-color: rgba(14,165,233,0.3); }
        .btn-copy.ok    { border-color: rgba(34,197,94,.32); background: rgba(34,197,94,.07); color: #4ade80; }
      `}</style>

      <div style={{position:"fixed",inset:0,overflow:"hidden",fontFamily:"'Outfit',sans-serif"}}>

        <canvas ref={canvasRef} style={{position:"absolute",inset:0,zIndex:0}} />

        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 75% 55% at 50% -5%,rgba(14,165,233,0.07) 0%,transparent 65%)",zIndex:1,pointerEvents:"none"}} />
        <div style={{position:"absolute",top:"25%",left:"-5%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(14,165,233,0.04) 0%,transparent 70%)",filter:"blur(70px)",zIndex:1,pointerEvents:"none"}} />
        <div style={{position:"absolute",bottom:"10%",right:"-5%",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(56,189,248,0.04) 0%,transparent 70%)",filter:"blur(60px)",zIndex:1,pointerEvents:"none"}} />
        <div style={{position:"absolute",left:0,right:0,top:0,height:"1px",background:"linear-gradient(90deg,transparent,rgba(14,165,233,0.5),transparent)",animation:"scanline 8s linear infinite",zIndex:2,pointerEvents:"none"}} />

        <div style={{position:"relative",zIndex:10,height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px",overflowY:"auto"}}>

          <div className="fu1" style={{marginBottom:28,animation:"floatY 5s ease-in-out infinite"}}>
            <div style={{position:"relative",width:76,height:76}}>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1px solid rgba(14,165,233,0.13)",animation:"spinCW 14s linear infinite"}} />
              <div style={{position:"absolute",inset:9,borderRadius:"50%",border:"1px dashed rgba(14,165,233,0.08)",animation:"spinCCW 9s linear infinite"}} />
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(14,165,233,0.07)",border:"1px solid rgba(14,165,233,0.2)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
                  <RiRobot2Line style={{fontSize:22,color:"#0ea5e9"}} />
                </div>
              </div>
            </div>
          </div>

          <div className="fu2" style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 7px #f59e0b",animation:"pulse 1.6s ease infinite"}} />
            <span style={{fontFamily:"'Fira Code',monospace",fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(245,158,11,0.75)",fontWeight:500}}>
              sys.maintenance — auto-agent active
            </span>
          </div>

          <div className="fu3" style={{textAlign:"center",marginBottom:8}}>
            <h1 className="headline-grad" style={{fontSize:"clamp(2.2rem, 6.5vw, 4rem)",fontWeight:800,letterSpacing:"-0.035em",lineHeight:1.08}}>
              System Offline
            </h1>
          </div>

          <div className="fu3" style={{textAlign:"center",maxWidth:480,marginBottom:28}}>
            <p style={{color:"rgba(148,163,184,0.65)",fontSize:"clamp(0.82rem, 2vw, 0.94rem)",lineHeight:1.78,fontWeight:400}}>
              Our AI maintenance agent has taken over while the engineering team is{" "}
              <span style={{color:"rgba(203,213,225,0.9)",fontWeight:500}}>temporarily unavailable</span>.
              Services will resume once the agent completes its current patch cycle.
            </p>
          </div>

          <div className="fu4" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(270px, 1fr))",gap:12,width:"100%",maxWidth:680,marginBottom:14}}>

            <div className="card" style={{padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <RiPulseLine style={{fontSize:13,color:"#0ea5e9"}} />
                  <span style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:"rgba(148,163,184,0.5)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Patch progress</span>
                </div>
                <span style={{fontFamily:"'Fira Code',monospace",fontSize:12,color:"#0ea5e9",fontWeight:500}}>{progress}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#0284c7,#0ea5e9,#38bdf8)",borderRadius:99,transition:"width .5s ease",animation:"barGlow 2.5s ease infinite"}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
                <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:"rgba(148,163,184,0.32)",display:"flex",alignItems:"center",gap:4}}>
                  <RiTimeLine style={{fontSize:10}} />
                  {elapsed}
                </span>
                <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:"rgba(245,158,11,0.55)"}}>ETA: unknown</span>
              </div>
            </div>

            <div className="card" style={{padding:"16px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                <RiDatabase2Line style={{fontSize:13,color:"#0ea5e9"}} />
                <span style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:"rgba(148,163,184,0.5)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Service status</span>
              </div>
              {STATUSES.map((s, i) => (
                <div key={i} className="svc-row">
                  <span style={{fontSize:12,color:"rgba(203,213,225,0.65)",fontWeight:400}}>{s.label}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:s.up?"#22c55e":"#ef4444",boxShadow:`0 0 5px ${s.up?"#22c55e":"#ef4444"}`,animation:s.up?undefined:"pulse 1.4s ease infinite"}} />
                    <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:s.up?"rgba(34,197,94,0.65)":"rgba(239,68,68,0.65)"}}>
                      {s.up ? "operational" : "degraded"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="card fu5" style={{width:"100%",maxWidth:680,padding:"14px 18px",marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
              <RiCodeSSlashLine style={{fontSize:13,color:"#0ea5e9"}} />
              <span style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:"rgba(148,163,184,0.5)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Agent log</span>
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#0ea5e9",boxShadow:"0 0 5px #0ea5e9",animation:"pulse 1s ease infinite"}} />
                <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:"rgba(14,165,233,0.5)"}}>live</span>
              </div>
            </div>
            {LOG_LINES.slice(0, visibleLogs).map((line, i) => (
              <div key={i} className="log-row" style={{animationDelay:`${i*0.04}s`}}>
                <line.icon style={{fontSize:13,flexShrink:0,color:line.status==="ok"?"rgba(34,197,94,0.65)":line.status==="warn"?"rgba(245,158,11,0.65)":"rgba(14,165,233,0.65)"}} />
                <span style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:line.status==="warn"?"rgba(245,158,11,0.72)":line.status==="loading"?"rgba(203,213,225,0.78)":"rgba(148,163,184,0.52)",flex:1,letterSpacing:"0.01em"}}>
                  {line.text}
                </span>
                {line.status==="ok"      && <RiCheckLine style={{fontSize:12,color:"rgba(34,197,94,0.55)",flexShrink:0}} />}
                {line.status==="warn"    && <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:"rgba(245,158,11,0.6)",background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.14)",borderRadius:4,padding:"1px 6px",flexShrink:0}}>warn</span>}
                {line.status==="loading" && <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:"rgba(14,165,233,0.6)",background:"rgba(14,165,233,0.06)",border:"1px solid rgba(14,165,233,0.12)",borderRadius:4,padding:"1px 6px",flexShrink:0}}>running</span>}
              </div>
            ))}
          </div>

          <div className="fu6" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <p style={{fontSize:11,color:"rgba(148,163,184,0.32)",fontWeight:500,letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:5}}>
              <RiMailLine style={{fontSize:12}} />
              Inquiries
            </p>
            <button onClick={copy} className={`btn-copy${copied?" ok":""}`}>
              {copied
                ? <><RiCheckLine style={{fontSize:14}} /> Copied to clipboard</>
                : <><RiFileCopyLine style={{fontSize:13}} /> contact@aichixia.xyz <RiArrowRightLine style={{fontSize:12,opacity:.55}} /></>
              }
            </button>
          </div>

        </div>

        <div className="fi" style={{position:"absolute",bottom:16,left:0,right:0,display:"flex",justifyContent:"center",zIndex:11}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 5px #f59e0b",animation:"pulse 2s ease infinite"}} />
            <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:"rgba(148,163,184,0.26)",letterSpacing:"0.1em"}}>
              © {new Date().getFullYear()} Aichixia · Aichiverse
            </span>
          </div>
        </div>

      </div>
    </>
  );
}
