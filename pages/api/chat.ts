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

const FALLBACK_CHAIN: Record<ProviderType, ProviderType[]> = {
  openai: ["gemini", "qwen", "gptoss", "llama"],
  gemini: ["qwen", "gptoss", "llama", "openai"],
  qwen: ["gptoss", "llama", "openai", "gemini"],
  gptoss: ["llama", "openai", "gemini", "qwen"],
  llama: ["openai", "gemini", "qwen", "gptoss"],
};

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

async function tryWithFallback(
  startProvider: ProviderType,
  message: string,
  history: any[],
  persona?: string
): Promise<{ reply: string; provider: ProviderType }> {
  const providers = [startProvider, ...FALLBACK_CHAIN[startProvider]];
  const attemptedProviders = new Set<ProviderType>();

  for (const provider of providers) {
    if (attemptedProviders.has(provider)) continue;
    attemptedProviders.add(provider);

    try {
      console.log(`🔄 Trying provider: ${provider}`);
      const result = await askAI(provider, message, history, persona);
      console.log(`✅ Success with: ${provider}`);
      return { reply: result.reply, provider };
    } catch (err: any) {
      console.log(`❌ Failed with ${provider}:`, err.message);
      continue;
    }
  }

  throw new Error("All providers failed");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history, persona, selectedProvider } = req.body as {
      message: string;
      history?: { role: "user" | "assistant" | "system"; content: string }[];
      persona?: string;
      selectedProvider?: ProviderType;
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    let startProvider: ProviderType;
    
    if (selectedProvider) {
      startProvider = selectedProvider;
    } else {
      const shouldUseGeminiFirst = SIMPLE_QUERIES.some(p => p.test(message));
      startProvider = shouldUseGeminiFirst ? "gemini" : "openai";
    }

    try {
      const { reply, provider } = await tryWithFallback(
        startProvider,
        message,
        history || [],
        persona
      );

      return res.status(200).json({ 
        type: "ai", 
        reply, 
        provider,
        requestedProvider: selectedProvider || "auto" 
      });
    } catch (err: any) {
      return res.status(500).json({ 
        type: "ai",
        reply: "Hmph! Everything is broken right now... I-I'll fix it later! B-baka!",
        provider: null,
        error: "All providers failed"
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
