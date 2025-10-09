import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/ai";
import { chatOpenAI } from "@/lib/openai";
import anilist, { MediaType, MediaSeason } from "@/lib/anilist";

async function getMediaData(message: string) {
  message = message.toLowerCase();

  let type: MediaType = "ANIME";
  if (/manga/i.test(message)) type = "MANGA";
  if (/manhwa/i.test(message)) type = "MANHWA";
  if (/manhua/i.test(message)) type = "MANHUA";
  if (/light\s*novel/i.test(message)) type = "LIGHT_NOVEL";
  if (/trending|populer/i.test(message)) {
    const data = await anilist.getTrending();
    return { type: "trending", data, mediaType: type };
  }

  if (/best|terbaik|top/i.test(message)) {
    const data = await anilist.getTopByGenre("ALL", type);
    return { type: "top", data, mediaType: type };
  }

  const seasonMatch = message.match(/winter|spring|summer|fall/i);
  const yearMatch = message.match(/\b(20\d{2})\b/);
  if (seasonMatch && type === "ANIME") {
    const season = seasonMatch[0].toUpperCase() as MediaSeason;
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    const data = await anilist.getSeasonal(season, year);
    return { type: "seasonal", data, mediaType: "ANIME" };
  }

  if (/character|karakter/i.test(message)) {
    const name = message.replace(/character|karakter/gi, "").trim();
    if (name) {
      const data = await anilist.searchMedia(type, name);
      return { type: "character", data, mediaType: type };
    }
  }

  if (/staff|seiyuu|va/i.test(message) && type === "ANIME") {
    const name = message.replace(/staff|seiyuu|va/gi, "").trim();
    if (name) {
      const data = await anilist.searchMedia("ANIME", name);
      return { type: "staff", data, mediaType: "ANIME" };
    }
  }

  const genreKeywords = ["action", "romance", "comedy", "drama", "fantasy", "isekai"];
  const genre = genreKeywords.find((g) => message.includes(g));
  if (genre) {
    const data = await anilist.getTopByGenre(genre, type);
    return { type: "genre", data, mediaType: type };
  }

  const data = await anilist.getTrending();
  return { type: "trending", data, mediaType: "ANIME" };
}

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
      ? `You are ${persona}, a cheerful anime/manga assistant who explains with energy and cuteness.`
      : `You are Aichixia, a cheerful anime/manga assistant who loves anime and manga.`,
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

    const { type: dataType, data, mediaType } = await getMediaData(message);
    const aiMessage = `Here is AniList ${mediaType} data (${dataType}) for your query: ${JSON.stringify(
      data
    )}. Present it in cute anime-girl style, playful and cheerful.`;

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

    return res.status(200).json({ type: dataType, mediaType, reply, data, provider });
  } catch (err: any) {
    console.error("[API Chat] Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
