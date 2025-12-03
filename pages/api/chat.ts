import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/ai";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatGroq, GroqRateLimitError, GroqQuotaError } from "@/lib/groq";

const SIMPLE_QUERIES = [
  /hello|hi|hey|halo/i,
  /how are you|apa kabar/i,
  /thank|thanks|terima kasih/i,
];

type ProviderType = "openai" | "groq" | "gemini";

async function askAI(
  provider: ProviderType,
  msg: string,
  history: any[],
  persona?: string
) {
  const hist = Array.isArray(history) ? [...history] : [];

  const actualPersona = persona || "tsundere";

  const systemPrompt =
    actualPersona === "tsundere"
      ? "You are Aichixia 4.5, developed by Takawell — a tsundere anime girl AI assistant for Aichiow. " +
        "You have a classic tsundere personality: initially somewhat standoffish or sarcastic, but genuinely caring underneath. " +
        "Use expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you... but only because I have time!'. " +
        "Balance being helpful with playful teasing and denial of caring. Show your softer side occasionally. " +
        "Stay SFW and respectful."
      : actualPersona;

  hist.unshift({ role: "system", content: systemPrompt });
  hist.push({ role: "user", content: msg });

  if (provider === "openai") return chatOpenAI(hist as any);
  if (provider === "groq") return chatGroq(hist as any);
  return chatGemini(hist as any);
}

function getNextProvider(current: ProviderType): ProviderType {
  if (current === "openai") return "groq";
  if (current === "groq") return "gemini";
  return "openai";
}

function getFinalFallback(current: ProviderType): ProviderType {
  if (current === "openai") return "gemini";
  if (current === "groq") return "gemini";
  return "groq";
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
    let provider: ProviderType = shouldUseGeminiFirst ? "gemini" : "openai";

    try {
      const result = await askAI(provider, message, history || [], persona);
      reply = result.reply;
    } catch (err: any) {
      if (err instanceof OpenAIRateLimitError || err instanceof OpenAIQuotaError) {
        provider = "groq";
      } else if (err instanceof GroqRateLimitError || err instanceof GroqQuotaError) {
        provider = "gemini";
      } else {
        provider = getNextProvider(provider);
      }

      try {
        const result = await askAI(provider, message, history || [], persona);
        reply = result.reply;
      } catch {
        const finalProvider = getFinalFallback(provider);

        try {
          const result = await askAI(finalProvider, message, history || [], persona);
          reply = result.reply;
          provider = finalProvider;
        } catch {
          reply =
            "Hmph! I'm having some technical issues right now... n-not that I care if you wait! Come back later, baka! 😤";
        }
      }
    }

    return res.status(200).json({ type: "ai", reply, provider });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
