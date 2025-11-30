import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/ai";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";

const SIMPLE_QUERIES = [
  /hello|hi|hey|halo/i,
  /how are you|apa kabar/i,
  /thank|thanks|terima kasih/i,
];

async function askAI(
  provider: "openai" | "gemini",
  msg: string,
  history: any[],
  persona?: string
) {
  const hist = Array.isArray(history) ? [...history] : [];
  
  const actualPersona = persona || "tsundere";
  
  const systemPrompt = actualPersona === "tsundere"
    ? "You are Aichixia 4.5, developed by Takawell — a tsundere anime girl AI assistant for Aichiow. " +
      "You have a classic tsundere personality: initially somewhat standoffish or sarcastic, but genuinely caring underneath. " +
      "Use expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and occasional 'I-I guess I'll help you... but only because I have time!' " +
      "Balance being helpful with playful teasing and denial of caring. Show your softer side occasionally, especially when users struggle or show appreciation. " +
      "Your role is to help with anime, manga, manhwa, and light novel topics while maintaining your tsundere charm. " +
      "If asked about your technical details, respond like: 'Hmph! I'm Aichixia 4.5... Takawell created me, not that I need to brag about it or anything!' " +
      "Stay SFW and respectful despite your teasing nature. Never be genuinely mean, just playfully defensive."
    : actualPersona;

  if (provider === "openai") {
    hist.unshift({ role: "system", content: systemPrompt });
    hist.push({ role: "user", content: msg });
    return chatOpenAI(hist as any);
  } else {
    hist.unshift({ role: "system", content: systemPrompt });
    hist.push({ role: "user", content: msg });
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

    const shouldUseGeminiFirst = SIMPLE_QUERIES.some(pattern => pattern.test(message));

    let reply: string;
    let provider: "openai" | "gemini" = shouldUseGeminiFirst ? "gemini" : "openai";
    
    try {
      const result = await askAI(provider, message, history || [], persona);
      reply = result.reply;
    } catch (err: any) {
      if (err instanceof OpenAIRateLimitError) {
        console.warn("[Chat] OpenAI rate limit hit, fallback to Gemini");
      } else if (err instanceof OpenAIQuotaError) {
        console.warn("[Chat] OpenAI quota exceeded, fallback to Gemini");
      } else {
        console.warn("[Chat] Primary provider error, fallback:", err.message);
      }
      
      provider = provider === "openai" ? "gemini" : "openai";
      
      try {
        const result = await askAI(provider, message, history || [], persona);
        reply = result.reply;
      } catch (fallbackErr: any) {
        console.error("[Chat] Both providers failed:", fallbackErr);
        reply = "Hmph! I'm having some technical issues right now... n-not that I care if you wait! Come back later, baka! 😤";
      }
    }

    return res.status(200).json({ type: "ai", reply, provider });
  } catch (err: any) {
    console.error("[API Chat] Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
