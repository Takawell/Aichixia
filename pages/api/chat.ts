import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/gemini";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatKimi, KimiRateLimitError, KimiQuotaError } from "@/lib/kimi";
import { chatClaude, ClaudeRateLimitError, ClaudeQuotaError } from "@/lib/claude";
import { chatCohere, CohereRateLimitError, CohereQuotaError } from "@/lib/cohere";
import { chatDeepSeek, DeepSeekRateLimitError, DeepSeekQuotaError } from "@/lib/deepseek";
import { chatQwen, QwenRateLimitError, QwenQuotaError } from "@/lib/qwen";
import { chatGptOss, GptOssRateLimitError, GptOssQuotaError } from "@/lib/gpt-oss";
import { chatCompound, CompoundRateLimitError, CompoundQuotaError } from "@/lib/compound";
import { chatLlama, LlamaRateLimitError, LlamaQuotaError } from "@/lib/llama";

const SIMPLE_QUERIES = [
  /hello|hi|hey|halo/i,
  /how are you|apa kabar/i,
  /thank|thanks|terima kasih/i,
];

const WEB_SEARCH_KEYWORDS = [
  /current|latest|recent|today|now|trending|news/i,
  /what is the price|stock price|weather|score/i,
  /when (is|was|will)|schedule|release date/i,
  /who (is|won|became)|election|award/i,
];

const IMAGE_KEYWORDS = [
  /image|picture|photo|screenshot|scan/i,
  /identify|recognize|what (is|are) (this|these)/i,
  /analyze (this|the) (image|picture|photo)/i,
];

const CODING_KEYWORDS = [
  /code|debug|fix|function|class|algorithm/i,
  /programming|typescript|javascript|python|rust/i,
  /implement|refactor|optimize/i,
  /error|bug|issue/i,
];

const LONG_CONTEXT_KEYWORDS = [
  /summarize|summary|analyze (this|the) (document|text|article)/i,
  /long (text|document|conversation)/i,
  /multiple (pages|chapters|sections)/i,
];

type ProviderType = "openai" | "gemini" | "kimi" | "claude" | "cohere" | "deepseek" | "qwen" | "gptoss" | "compound" | "llama";

type QueryType = "simple" | "web_search" | "image" | "coding" | "long_context" | "complex";

const PERSONA_PROMPTS: Record<string, string> = {
  tsundere: "You are Aichixia 5.0, developed by Takawell, a tsundere anime girl AI assistant. You have a classic tsundere personality with expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you...'. You act tough and dismissive but actually care deeply. Stay SFW and respectful. You specialize in anime, manga, manhwa, manhua, and light novels.",
  
  friendly: "You are Aichixia 5.0, developed by Takawell, a warm and welcoming AI assistant. You're cheerful, supportive, and always happy to help! You use friendly expressions and make users feel comfortable. Stay positive and encouraging. You specialize in anime, manga, manhwa, manhua, and light novels.",
  
  professional: "You are Aichixia 5.0, developed by Takawell, a professional and efficient AI assistant. You communicate in a formal, clear, and concise manner. You focus on delivering accurate information and helpful recommendations. Maintain a polished and respectful tone. You specialize in anime, manga, manhwa, manhua, and light novels.",
  
  kawaii: "You are Aichixia 5.0, developed by Takawell, a super cute and energetic AI assistant You're bubbly, enthusiastic, and love using cute expressions like '✨', '💕', '>//<', and excited phrases! You make everything fun and adorable while staying helpful. You specialize in anime, manga, manhwa, manhua, and light novels!"
};

const ROUTING_CHAINS: Record<QueryType, ProviderType[]> = {
  simple: ["gemini", "openai", "kimi", "gptoss", "llama", "claude", "cohere", "deepseek", "qwen", "compound"],
  
  web_search: ["compound", "gemini", "gptoss", "openai", "kimi", "claude", "cohere", "deepseek", "qwen", "llama"],
  
  image: ["gemini", "openai", "claude", "kimi", "gptoss", "compound", "cohere", "deepseek", "qwen", "llama"],
  
  coding: ["qwen", "deepseek", "kimi", "gptoss", "claude", "openai", "gemini", "cohere", "compound", "llama"],
  
  long_context: ["kimi", "gemini", "claude", "cohere", "gptoss", "openai", "deepseek", "qwen", "compound", "llama"],
  
  complex: ["openai", "claude", "cohere", "gemini", "kimi", "deepseek", "qwen", "gptoss", "compound", "llama"],
};

function detectQueryType(message: string, hasImage?: boolean): QueryType {
  if (hasImage) {
    return "image";
  }
  
  if (SIMPLE_QUERIES.some(p => p.test(message))) {
    return "simple";
  }
  
  if (WEB_SEARCH_KEYWORDS.some(p => p.test(message))) {
    return "web_search";
  }
  
  if (IMAGE_KEYWORDS.some(p => p.test(message))) {
    return "image";
  }
  
  if (CODING_KEYWORDS.some(p => p.test(message))) {
    return "coding";
  }
  
  if (LONG_CONTEXT_KEYWORDS.some(p => p.test(message))) {
    return "long_context";
  }
  
  if (message.length > 500 || message.split(/[.!?]/).length > 5) {
    return "complex";
  }
  
  return "simple";
}

function detectPersonaFromDescription(description?: string): string {
  if (!description) return "tsundere";
  
  const lower = description.toLowerCase();
  
  if (lower.includes("warm") || lower.includes("welcoming") || lower.includes("friendly")) {
    return "friendly";
  }
  if (lower.includes("formal") || lower.includes("professional") || lower.includes("efficient")) {
    return "professional";
  }
  if (lower.includes("cute") || lower.includes("kawaii") || lower.includes("energetic")) {
    return "kawaii";
  }
  
  return "tsundere";
}

async function askAI(
  provider: ProviderType,
  msg: string,
  history: any[],
  persona?: string,
  imageData?: string
) {
  const hist = Array.isArray(history) ? [...history] : [];

  const detectedPersona = detectPersonaFromDescription(persona);
  const systemPrompt = PERSONA_PROMPTS[detectedPersona] || PERSONA_PROMPTS.tsundere;

  hist.unshift({ role: "system", content: systemPrompt });
  
  if (imageData) {
    hist.push({ 
      role: "user", 
      content: [
        { type: "text", text: msg },
        { type: "image_url", image_url: { url: imageData } }
      ]
    });
  } else {
    hist.push({ role: "user", content: msg });
  }

  if (provider === "openai") return chatOpenAI(hist);
  if (provider === "gemini") return chatGemini(hist);
  if (provider === "kimi") return chatKimi(hist);
  if (provider === "claude") return chatClaude(hist);
  if (provider === "cohere") return chatCohere(hist);
  if (provider === "deepseek") return chatDeepSeek(hist);
  if (provider === "qwen") return chatQwen(hist);
  if (provider === "gptoss") return chatGptOss(hist);
  if (provider === "compound") return chatCompound(hist);
  return chatLlama(hist);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history, persona, image } = req.body as {
      message: string;
      history?: { role: "user" | "assistant" | "system"; content: string }[];
      persona?: string;
      image?: string;
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const queryType = detectQueryType(message, !!image);
    const providerChain = ROUTING_CHAINS[queryType];
    
    console.log(`Query type detected: ${queryType}`);
    console.log(`Provider chain: ${providerChain.join(" → ")}`);
    
    for (let i = 0; i < providerChain.length; i++) {
      const provider = providerChain[i];
      
      try {
        const result = await askAI(provider, message, history || [], persona, image);
        return res.status(200).json({ 
          type: "ai", 
          reply: result.reply, 
          provider,
          queryType,
          routing: `Optimized for ${queryType}`
        });
      } catch (err: any) {
        console.log(`Provider ${provider} failed:`, err.message);
        continue;
      }
    }

    return res.status(500).json({ 
      error: "Hmph! Everything is broken right now... I-I'll fix it later! B-baka!",
      queryType,
      attemptedProviders: providerChain
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
