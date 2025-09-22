import type { NextApiRequest, NextApiResponse } from "next";
import { routeByIntent, IntentType } from "@/lib/intent";
import anilist from "@/lib/anilist";
import { chatGemini } from "@/lib/ai";
import { chatOpenAI } from "@/lib/openai"; // 🔥 kita pake handler OpenAI dulu

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history, persona } = req.body as {
      message: string;
      history?: { role: "user" | "assistant" | "system"; content: string }[];
      persona?: string;
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await routeByIntent(message, {
      openaiHandler: async (msg: string) => {
        const hist = Array.isArray(history) ? [...history] : [];
        if (persona) {
          hist.unshift({ role: "system", content: `Persona active: ${persona}` });
        }
        hist.push({ role: "user", content: msg });
        const { reply } = await chatOpenAI(hist as any);
        return { type: "ai", reply, provider: "openai" };
      },
      geminiHandler: async (msg: string) => {
        const hist = Array.isArray(history) ? [...history] : [];
        if (persona) {
          hist.unshift({ role: "system", content: `Persona active: ${persona}` });
        }
        hist.push({ role: "user", content: msg });
        const { reply } = await chatGemini(hist as any);
        return { type: "ai", reply, provider: "gemini" };
      },
      anilistHandler: async (query: string, type: IntentType) => {
        switch (type) {
          case "search_anime":
            return { type: "anilist", data: await anilist.searchMedia("ANIME", query) };
          case "search_manga":
          case "search_manhwa":
          case "search_lightnovel":
            return { type: "anilist", data: await anilist.searchMedia("MANGA", query) };
          case "character_info": {
            const num = parseInt(query, 10);
            if (!isNaN(num)) {
              return { type: "anilist", data: await anilist.getCharacterById(num) };
            }
            return { type: "anilist", data: await anilist.searchMedia("ANIME", query) };
          }
          case "genre_search":
            return { type: "anilist", data: await anilist.getTopByGenre(query) };
          case "seasonal_search": {
            const s = /winter|spring|summer|fall/i.exec(query)?.[0]?.toUpperCase() as any;
            const y = parseInt((/\b(20\d{2})\b/.exec(query)?.[1] ?? ""), 10);
            if (s && y) return { type: "anilist", data: await anilist.getSeasonal(s, y) };
            return { type: "anilist", data: await anilist.getTrending() };
          }
          case "recommendation":
            return { type: "anilist", data: await anilist.getTrending() };
          default:
            return { type: "anilist", data: {} };
        }
      },
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[API Chat] Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
