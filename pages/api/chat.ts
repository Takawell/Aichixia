import type { NextApiRequest, NextApiResponse } from "next";
import { routeByIntent, IntentType } from "@/lib/intent";
import anilist from "@/lib/anilist";
import { chatGemini } from "@/lib/ai";
import { chatOpenAI } from "@/lib/openai";

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
        hist.unshift({
          role: "system",
          content: persona
            ? `You are ${persona}, a cheerful anime girl assistant who explains with energy and cuteness.`
            : `You are Aichixia, a cheerful anime girl AI assistant.`,
        });
        hist.push({ role: "user", content: msg });
        const { reply } = await chatOpenAI(hist as any);
        return { type: "ai", reply, provider: "openai" };
      },

      geminiHandler: async (msg: string) => {
        const hist = Array.isArray(history) ? [...history] : [];
        hist.unshift({
          role: "system",
          content: persona
            ? `You are ${persona}, a cheerful anime girl assistant who explains with energy and cuteness.`
            : `You are Aichixia, a cheerful anime girl AI assistant.`,
        });
        hist.push({ role: "user", content: msg });
        const { reply } = await chatGemini(hist as any);
        return { type: "ai", reply, provider: "gemini" };
      },

      anilistHandler: async (query: string, type: IntentType) => {
        let data: any = {};
        switch (type) {
          case "search_anime":
            data = await anilist.searchMedia("ANIME", query);
            break;
          case "search_manga":
          case "search_manhwa":
          case "search_lightnovel":
            data = await anilist.searchMedia("MANGA", query);
            break;
          case "character_info": {
            const num = parseInt(query, 10);
            if (!isNaN(num)) {
              data = await anilist.getCharacterById(num);
            } else {
              data = await anilist.searchMedia("ANIME", query);
            }
            break;
          }
          case "genre_search":
            data = await anilist.getTopByGenre(query);
            break;
          case "seasonal_search": {
            const s = /winter|spring|summer|fall/i.exec(query)?.[0]?.toUpperCase() as any;
            const y = parseInt((/\b(20\d{2})\b/.exec(query)?.[1] ?? ""), 10);
            if (s && y) data = await anilist.getSeasonal(s, y);
            else data = await anilist.getTrending();
            break;
          }
          case "recommendation":
            data = await anilist.getTrending();
            break;
          default:
            data = {};
        }

        const hist = [
          {
            role: "system",
            content: persona
              ? `You are ${persona}, a cheerful anime girl assistant who loves anime and explains info in a cute way.`
              : `You are Aichixia, a cheerful anime girl AI assistant. Answer in a friendly anime-girl style.`,
          },
          {
            role: "user",
            content: `Here is AniList data: ${JSON.stringify(data)}. Please summarize it for the user in your style.`,
          },
        ];

        const { reply } = await chatOpenAI(hist as any);

        return { type: "ai+anilist", reply, data };
      },
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[API Chat] Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
