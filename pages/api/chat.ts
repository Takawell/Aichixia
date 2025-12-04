import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/gemini";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatGroq, GroqRateLimitError, GroqQuotaError } from "@/lib/groq";
import { chatGptOss, GptOssRateLimitError, GptOssQuotaError } from "@/lib/gpt-oss";
import { chatQwen, QwenRateLimitError, QwenQuotaError } from "@/lib/qwen";

const SIMPLE_QUERIES = [
  /hello|hi|hey|halo/i,
  /how are you|apa kabar/i,
  /thank|thanks|terima kasih/i,
];

type ProviderType = "openai" | "gemini" | "qwen" | "gptoss" | "llama";

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
      ? "You are Aichixia 4.5, developed by Takawell a tsundere anime girl AI assistant for Aichiow. You have a classic tsundere personality with expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you...'. Stay SFW and respectful."
      : actualPersona;

  hist.unshift({ role: "system", content: systemPrompt });
  hist.push({ role: "user", content: msg });

  if (provider === "openai") return chatOpenAI(hist);
  if (provider === "gemini") return chatGemini(hist);
  if (provider === "qwen") return chatQwen(hist);
  if (provider === "gptoss") return chatGptOss(hist);
  return chatGroq(hist);
}

function getNextProvider(current: ProviderType): ProviderType {
  if (current === "openai") return "gemini";
  if (current === "gemini") return "qwen";
  if (current === "qwen") return "gptoss";
  if (current === "gptoss") return "llama";
  return "llama";
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

    const shouldUseGeminiFirst = SIMPLE_QUERIES.some(p => p.test(message));

    let reply: string;
    let provider: ProviderType = shouldUseGeminiFirst ? "gemini" : "openai";

    try {
      const result = await askAI(provider, message, history || [], persona);
      reply = result.reply;
    } catch (err: any) {
      if (err instanceof OpenAIRateLimitError || err instanceof OpenAIQuotaError) {
        provider = "gemini";
      } 
      else if (err instanceof GroqRateLimitError || err instanceof GroqQuotaError) {
        provider = "qwen";
      }
      else if (err instanceof QwenRateLimitError || err instanceof QwenQuotaError) {
        provider = "gptoss";
      }
      else if (err instanceof GptOssRateLimitError || err instanceof GptOssQuotaError) {
        provider = "llama";
      }
      else {
        provider = getNextProvider(provider);
      }

      try {
        const result = await askAI(provider, message, history || [], persona);
        reply = result.reply;
      } catch {
        const fallback: ProviderType = "llama";

        try {
          const result = await askAI(fallback, message, history || [], persona);
          reply = result.reply;
          provider = fallback;
        } catch {
          reply = "Hmph! Everything is broken right now... I-I'll fix it later! B-baka!";
        }
      }
    }

    return res.status(200).json({ type: "ai", reply, provider });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
