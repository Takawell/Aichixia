import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/ai";
import { chatOpenAI } from "@/lib/openai";
import anilist from "@/lib/anilist";

async function askAI(
  provider: "openai" | "gemini",
  msg: string,
  history: any[],
  persona?: string
) {
  const hist = Array.isArray(history) ? [...history] : [];
  hist.unshift({
    role: "system",
    content: persona
      ? `You are ${persona}, a cheerful anime girl assistant who explains with energy and cuteness.`
      : `You are Aichixia, a cheerful anime girl AI assistant who loves anime.`,
  });
  hist.push({ role: "user", content: msg });

  if (provider === "openai") {
    return chatOpenAI(hist as any);
  } else {
    return chatGemini(hist as any);
  }
}

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

    let data: any = null;
    let aiMessage = message;

    // AniList Integration
    if (/trending|populer/i.test(message)) {
      data = await anilist.getTrending();
      aiMessage = `Here is AniList trending anime data: ${JSON.stringify(data)}. Summarize it cutely for the user.`;
    } else if (/season|musim|winter|spring|summer|fall/i.test(message)) {
      const year = parseInt(message.match(/\b(20\d{2})\b/)?.[0] ?? "") || new Date().getFullYear();
      const seasonMatch = message.match(/winter|spring|summer|fall/i)?.[0]?.toUpperCase() as any;
      if (seasonMatch) {
        data = await anilist.getSeasonal(seasonMatch, year);
        aiMessage = `Here is AniList seasonal anime for ${seasonMatch} ${year}: ${JSON.stringify(
          data
        )}. Present it nicely in anime-girl style.`;
      }
    } else if (/character|karakter/i.test(message)) {
      const name = message.replace(/character|karakter/gi, "").trim();
      if (name) {
        data = await anilist.searchMedia("ANIME", name);
        aiMessage = `AniList search result for character/anime "${name}": ${JSON.stringify(
          data
        )}. Explain it in cute style.`;
      }
    } else if (/staff|seiyuu|va/i.test(message)) {
      const name = message.replace(/staff|seiyuu|va/gi, "").trim();
      if (name) {
        data = await anilist.searchMedia("ANIME", name);
        aiMessage = `AniList staff/VA search for "${name}": ${JSON.stringify(
          data
        )}. Summarize for the user cutely.`;
      }
    } else if (/recommend|rekomendasi|saran/i.test(message)) {
      data = await anilist.getTrending();
      aiMessage = `AniList recommended anime (based on trending): ${JSON.stringify(
        data
      )}. Suggest cutely like an anime girl.`;
    } else {
      const genreKeywords = ["action", "romance", "comedy", "drama", "fantasy", "isekai"];
      const genre = genreKeywords.find((g) => message.toLowerCase().includes(g));
      if (genre) {
        data = await anilist.getTopByGenre(genre, "ANIME");
        aiMessage = `AniList top anime in genre "${genre}": ${JSON.stringify(
          data
        )}. Present it with kawaii explanation.`;
      }
    }

    // AI Fallback: OpenAI → Gemini
    let reply: string;
    let provider: "openai" | "gemini" = "openai";
    try {
      const result = await askAI("openai", aiMessage, history || [], persona);
      reply = result.reply;
    } catch (err) {
      console.warn("[Chat] OpenAI failed, fallback Gemini:", err);
      provider = "gemini";
      const result = await askAI("gemini", aiMessage, history || [], persona);
      reply = result.reply;
    }

    return res
      .status(200)
      .json({ type: data ? "ai+anilist" : "ai", reply, data, provider });
  } catch (err: any) {
    console.error("[API Chat] Error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}
