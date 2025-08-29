import React from "react";

const base = "";

const Row = ({ method, path, desc }: { method: string; path: string; desc: string }) => (
  <div style={{ border: "1px solid #e5e7eb", padding: 12, borderRadius: 12, marginBottom: 12 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
      <code style={{ padding: "2px 6px", borderRadius: 8, background: "#f3f4f6" }}>{method}</code>
      <code style={{ padding: "2px 6px", borderRadius: 8, background: "#eef2ff" }}>{path}</code>
    </div>
    <div style={{ color: "#374151" }}>{desc}</div>
  </div>
);

export default function Docs() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Aichixia API Docs</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Public endpoints untuk anime & chat. Deploy di Vercel, no backend server tambahan.
      </p>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 8px" }}>Auth</h2>
        <p style={{ color: "#374151" }}>
          AniList endpoints tidak membutuhkan API key.
          Untuk chat, set <code>GEMINI_API_KEY</code> di Project Settings &rarr; Environment Variables.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 8px" }}>Anime</h2>
        <Row method="GET" path={`${base}/api/anime/search?q=naruto&type=ANIME`} desc="Cari anime/manga (type: ANIME|MANGA, q wajib)" />
        <Row method="GET" path={`${base}/api/anime/1?type=ANIME`} desc="Detail media berdasarkan ID" />
        <Row method="GET" path={`${base}/api/anime/trending`} desc="Trending anime saat ini" />
        <Row method="GET" path={`${base}/api/anime/seasonal?season=SUMMER&year=2025`} desc="Seasonal list by season & year" />
        <Row method="GET" path={`${base}/api/anime/airing`} desc="Jadwal tayang (airing schedules)" />
        <Row method="GET" path={`${base}/api/anime/recommendations?id=1`} desc="Rekomendasi berdasarkan media ID" />
        <Row method="GET" path={`${base}/api/anime/genre?genre=Action&type=ANIME`} desc="Top by genre (ANIME|MANGA)" />
        <Row method="GET" path={`${base}/api/character/1`} desc="Detail karakter berdasarkan ID" />
        <Row method="GET" path={`${base}/api/staff/1`} desc="Detail staff berdasarkan ID" />
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 8px" }}>Chat</h2>
        <Row method="POST" path={`${base}/api/chat`} desc="Endpoint chat terpadu (intent routing: AniList atau Gemini)" />
        <pre style={{ whiteSpace: "pre-wrap", background: "#0b1020", color: "#f8fafc", padding: 16, borderRadius: 12, overflow: "auto" }}>{`
curl -X POST "$HOST/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Rekomendasi anime isekai dong",
    "persona": "friendly"
  }'
`}</pre>
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "24px 0 8px" }}>Notes</h2>
        <ul style={{ color: "#374151", lineHeight: 1.7 }}>
          <li>Pastikan <code>GEMINI_API_KEY</code> diset di Vercel (Production/Preview/Development).</li>
          <li>Semua endpoint AniList bersifat public dan tidak perlu API key.</li>
          <li>Gunakan <code>/api/chat</code> untuk natural language: intent akan otomatis ke AniList/Gemini.</li>
        </ul>
      </section>

      <footer style={{ marginTop: 40, color: "#6b7280" }}>
        © {new Date().getFullYear()} Aichixia — Anime-first AI Assistant.
      </footer>
    </main>
  );
}
