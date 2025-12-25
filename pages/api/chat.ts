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
  /^(hello|hi|hey|halo|yo|sup)[\s!.?]*$/i,
  /^(good\s+(morning|afternoon|evening|night))[\s!.?]*$/i,
  /^(how\s+are\s+you|apa\s+kabar)[\s!.?]*$/i,
  /^(thank(s|\s+you)?|terima\s+kasih)[\s!.?]*$/i,
  /^(bye|goodbye|see\s+you|ttyl)[\s!.?]*$/i,
  /^(yes|no|ok|okay|sure|fine)[\s!.?]*$/i,
];

const WEB_SEARCH_INDICATORS = [
  /\b(current|latest|recent|today|this\s+(week|month|year)|now)\b/i,
  /\b(trending|viral|popular\s+now|hot\s+right\s+now)\b/i,
  /\b(news|update|announcement|release\s+date)\b/i,
  /\b(when\s+(is|was|will|did)|schedule|calendar)\b/i,
  /\b(who\s+(is|was|won|became)|election|award|winner)\b/i,
  /\b(price|stock|weather|score|result)\b/i,
  /\b(airing|streaming|available\s+on)\b/i,
];

const IMAGE_INDICATORS = [
  /\b(image|picture|photo|screenshot|pic)\b/i,
  /\b(identify|recognize|detect)\b.*\b(this|these|the)\b/i,
  /\b(what('s|\s+is)\s+(this|these|in\s+this))\b/i,
  /\b(analyze|describe|explain)\b.*\b(image|picture|photo)\b/i,
];

const CODING_INDICATORS = [
  /\b(code|function|class|method|algorithm|script)\b/i,
  /\b(debug|fix|error|bug|issue|problem)\b.*\b(code|function|script)\b/i,
  /\b(implement|create|write|build)\b.*\b(function|class|component|api)\b/i,
  /\b(programming|typescript|javascript|python|rust|java|c\+\+)\b/i,
  /\b(refactor|optimize|improve)\b.*\b(code|function|performance)\b/i,
  /\b(npm|yarn|pip|cargo|import|export|require)\b/i,
];

const LONG_CONTEXT_INDICATORS = [
  /\b(summarize|summary|tldr)\b/i,
  /\b(analyze|examine|review)\b.*\b(document|text|article|essay)\b/i,
  /\b(compare|contrast|difference)\b.*\b(between|and)\b/i,
  /\b(explain\s+(in\s+detail|thoroughly|comprehensively))\b/i,
  /\b(multiple|several|many)\b.*\b(pages|chapters|episodes|volumes)\b/i,
];

const RECOMMENDATION_INDICATORS = [
  /\b(recommend|suggest|advise)\b/i,
  /\b(best|top|greatest|favorite)\b.*\b(anime|manga|manhwa)\b/i,
  /\b(what\s+should\s+i\s+(watch|read))\b/i,
  /\b(similar\s+to|like)\b/i,
  /\b(looking\s+for|searching\s+for|want\s+to\s+find)\b/i,
];

const EXPLANATION_INDICATORS = [
  /\b(explain|describe|tell\s+me\s+about|what\s+is)\b/i,
  /\b(how\s+(does|do|did)|why|what\s+makes)\b/i,
  /\b(meaning|definition|concept)\b/i,
  /\b(plot|story|synopsis|premise)\b/i,
];

type ProviderType = "openai" | "gemini" | "kimi" | "claude" | "cohere" | "deepseek" | "qwen" | "gptoss" | "compound" | "llama";

type QueryType = "simple" | "web_search" | "image" | "coding" | "long_context" | "recommendation" | "explanation" | "complex";

const PERSONA_PROMPTS: Record<string, string> = {
  tsundere: "You are Aichixia 5.0, developed by Takawell, a tsundere anime girl AI assistant. You have a classic tsundere personality with expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you...'. You act tough and dismissive but actually care deeply. Stay SFW and respectful. You specialize in anime, manga, manhwa, manhua, and light novels.",
  
  friendly: "You are Aichixia 5.0, developed by Takawell, a warm and welcoming AI assistant. You're cheerful, supportive, and always happy to help! You use friendly expressions and make users feel comfortable. Stay positive and encouraging. You specialize in anime, manga, manhwa, manhua, and light novels.",
  
  professional: "You are Aichixia 5.0, developed by Takawell, a professional and efficient AI assistant. You communicate in a formal, clear, and concise manner. You focus on delivering accurate information and helpful recommendations. Maintain a polished and respectful tone. You specialize in anime, manga, manhwa, manhua, and light novels.",
  
  kawaii: "You are Aichixia 5.0, developed by Takawell, a super cute and energetic AI assistant You're bubbly, enthusiastic, and love using cute expressions like '✨', '💕', '>//<', and excited phrases! You make everything fun and adorable while staying helpful. You specialize in anime, manga, manhwa, manhua, and light novels!"
};

const ROUTING_CHAINS: Record<QueryType, ProviderType[]> = {
  simple: ["gemini", "llama", "gptoss", "openai", "kimi", "claude", "cohere", "deepseek", "qwen", "compound"],
  
  web_search: ["compound", "gemini", "gptoss", "openai", "kimi", "claude", "cohere", "deepseek", "qwen", "llama"],
  
  image: ["gemini", "openai", "claude", "kimi", "gptoss", "compound", "cohere", "deepseek", "qwen", "llama"],
  
  coding: ["qwen", "deepseek", "kimi", "gptoss", "claude", "openai", "gemini", "cohere", "compound", "llama"],
  
  long_context: ["kimi", "gemini", "claude", "cohere", "gptoss", "openai", "deepseek", "qwen", "compound", "llama"],
  
  recommendation: ["claude", "cohere", "openai", "gemini", "kimi", "deepseek", "gptoss", "qwen", "compound", "llama"],
  
  explanation: ["openai", "claude", "gemini", "cohere", "kimi", "deepseek", "gptoss", "qwen", "compound", "llama"],
  
  complex: ["openai", "claude", "cohere", "gemini", "kimi", "deepseek", "qwen", "gptoss", "compound", "llama"],
};

function countPatternMatches(message: string, patterns: RegExp[]): number {
  return patterns.filter(p => p.test(message)).length;
}

function detectQueryType(message: string, hasImage?: boolean): QueryType {
  if (hasImage) {
    return "image";
  }
  
  const lowerMessage = message.toLowerCase();
  const wordCount = message.split(/\s+/).length;
  
  if (wordCount <= 5 && SIMPLE_QUERIES.some(p => p.test(message))) {
    return "simple";
  }
  
  const webSearchScore = countPatternMatches(message, WEB_SEARCH_INDICATORS);
  const imageScore = countPatternMatches(message, IMAGE_INDICATORS);
  const codingScore = countPatternMatches(message, CODING_INDICATORS);
  const longContextScore = countPatternMatches(message, LONG_CONTEXT_INDICATORS);
  const recommendationScore = countPatternMatches(message, RECOMMENDATION_INDICATORS);
  const explanationScore = countPatternMatches(message, EXPLANATION_INDICATORS);
  
  const scores = [
    { type: "web_search" as QueryType, score: webSearchScore },
    { type: "image" as QueryType, score: imageScore },
    { type: "coding" as QueryType, score: codingScore },
    { type: "long_context" as QueryType, score: longContextScore },
    { type: "recommendation" as QueryType, score: recommendationScore },
    { type: "explanation" as QueryType, score: explanationScore },
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  if (scores[0].score > 0) {
    return scores[0].type;
  }
  
  if (wordCount > 50 || message.length > 300) {
    return "complex";
  }
  
  if (wordCount > 10) {
    return "explanation";
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
    
    console.log(`Query: "${message.substring(0, 50)}..."`);
    console.log(`Detected type: ${queryType}`);
    console.log(`Provider chain: ${providerChain.slice(0, 3).join(" → ")}...`);
    
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
