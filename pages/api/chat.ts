import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/ai";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatGroq, GroqRateLimitError, GroqQuotaError } from "@/lib/groq";

const SIMPLE_QUERIES = [
  /hello|hi|hey|halo/i,
  /how are you|apa kabar/i,
  /thank|thanks|terima kasih/i,
];

async function askAI(
  provider: "openai" | "groq" | "gemini",
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

  hist.unshift({ role: "system", content: systemPrompt });
  hist.push({ role: "user", content: msg });

  if (provider === "openai") {
    return chatOpenAI(hist as any);
  } else if (provider === "groq") {
    return chatGroq(hist as any);
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

    const shouldUseGeminiFirst = SIMPLE_QUERIES.some(pattern => pattern.test(message));

    let reply: string;
    let provider: "openai" | "groq" | "gemini" = shouldUseGeminiFirst ? "gemini" : "openai";
    
    try {
      const result = await askAI(provider, message, history || [], persona);
      reply = result.reply;
    } catch (err: any) {
      if (err instanceof OpenAIRateLimitError || err instanceof OpenAIQuotaError) {
        console.warn("[Chat] OpenAI error, fallback to Groq:", err.message);
        provider = "groq";
      } else if (err instanceof GroqRateLimitError || err instanceof GroqQuotaError) {
        console.warn("[Chat] Groq error, fallback to Gemini:", err.message);
        provider = "gemini";
      } else {
        console.warn("[Chat] Primary provider error, fallback:", err.message);
        provider = provider === "openai" ? "groq" : provider === "groq" ? "gemini" : "openai";
      }
      
      try {
        const result = await askAI(provider, message, history || [], persona);
        reply = result.reply;
      } catch (fallbackErr: any) {
        console.warn("[Chat] Second provider failed, trying final fallback:", fallbackErr.message);
        
        const finalProvider = provider === "openai" ? "gemini" : provider === "groq" ? "gemini" : "groq";
        
        try {
          const result = await askAI(finalProvider, message, history || [], persona);
          reply = result.reply;
          provider = finalProvider;
        } catch (finalErr: any) {
          console.error("[Chat] All providers failed");
          reply = "Hmph! I'm having some technical issues right now... n-not that I care if you wait! Come back later, baka! 😤";
        }
      }
    }

    return res.status(200).json({ type: "ai", reply, provider });
  } catch (err: any) {
    console.error("[API Chat] Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
