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

function getFallbackChain(startProvider: ProviderType): ProviderType[] {
  const allProviders: ProviderType[] = ["openai", "gemini", "qwen", "gptoss", "llama"];
  const startIndex = allProviders.indexOf(startProvider);
  return [...allProviders.slice(startIndex), ...allProviders.slice(0, startIndex)];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history, persona, preferredModel } = req.body as {
      message: string;
      history?: { role: "user" | "assistant" | "system"; content: string }[];
      persona?: string;
      preferredModel?: ProviderType;
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    let reply: string = "";
    let usedProvider: ProviderType;

    if (preferredModel && ["openai", "gemini", "qwen", "gptoss", "llama"].includes(preferredModel)) {
      usedProvider = preferredModel;
    } else {
      const shouldUseGeminiFirst = SIMPLE_QUERIES.some(p => p.test(message));
      usedProvider = shouldUseGeminiFirst ? "gemini" : "openai";
    }

    const fallbackChain = getFallbackChain(usedProvider);

    for (const currentProvider of fallbackChain) {
      try {
        const result = await askAI(currentProvider, message, history || [], persona);
        reply = result.reply;
        usedProvider = currentProvider;
        break;
      } catch (err: any) {
        console.error(`[Provider ${currentProvider}] Error:`, err.message || err);
        continue;
      }
    }

    if (!reply || reply === "") {
      reply = "Hmph! Everything is broken right now... I-I'll fix it later! B-baka!";
      usedProvider = fallbackChain[fallbackChain.length - 1];
    }

    return res.status(200).json({ type: "ai", reply, provider: usedProvider });
  } catch (err: any) {
    console.error("[Handler] Critical error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
