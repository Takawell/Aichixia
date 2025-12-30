import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/gemini";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatKimi, KimiRateLimitError, KimiQuotaError } from "@/lib/kimi";
import { chatGlm, GlmRateLimitError, GlmQuotaError } from "@/lib/glm";
import { chatClaude, ClaudeRateLimitError, ClaudeQuotaError } from "@/lib/claude";
import { chatCohere, CohereRateLimitError, CohereQuotaError } from "@/lib/cohere";
import { chatDeepSeek, DeepSeekRateLimitError, DeepSeekQuotaError } from "@/lib/deepseek";
import { chatQwen, QwenRateLimitError, QwenQuotaError } from "@/lib/qwen";
import { chatGptOss, GptOssRateLimitError, GptOssQuotaError } from "@/lib/gpt-oss";
import { chatCompound, CompoundRateLimitError, CompoundQuotaError } from "@/lib/compound";
import { chatLlama, LlamaRateLimitError, LlamaQuotaError } from "@/lib/llama";
import { chatMistral, MistralRateLimitError, MistralQuotaError } from "@/lib/mistral";

type ProviderType = "openai" | "gemini" | "kimi" | "glm" | "claude" | "cohere" | "deepseek" | "qwen" | "gptoss" | "compound" | "llama" | "mistral";

type QueryType = "greeting" | "coding" | "creative" | "information" | "reasoning" | "conversation" | "technical" | "multilingual";
type Complexity = "simple" | "medium" | "complex" | "expert";

interface ProviderCapability {
  speed: number;
  quality: number;
  coding: number;
  reasoning: number;
  creative: number;
  multilingual: number;
  cost: number;
  hasSearch: boolean;
  contextWindow: number;
  specialties: QueryType[];
  rateLimit: number;
}

interface ProviderStatus {
  failures: number;
  successes: number;
  lastFailTime: number | null;
  lastSuccessTime: number | null;
  cooldownUntil: number | null;
  avgResponseTime: number;
  consecutiveFailures: number;
}

interface QueryAnalysis {
  type: QueryType;
  complexity: Complexity;
  needsSearch: boolean;
  needsCoding: boolean;
  needsCreativity: boolean;
  isMultilingual: boolean;
  estimatedTokens: number;
  keywords: string[];
}

const PROVIDER_CAPABILITIES: Record<ProviderType, ProviderCapability> = {
  kimi: {
    speed: 3,
    quality: 5,
    coding: 5,
    reasoning: 5,
    creative: 4,
    multilingual: 4,
    cost: 2,
    hasSearch: true,
    contextWindow: 262144,
    specialties: ["reasoning", "coding", "technical"],
    rateLimit: 100,
  },
  deepseek: {
    speed: 3,
    quality: 5,
    coding: 5,
    reasoning: 5,
    creative: 4,
    multilingual: 3,
    cost: 3,
    hasSearch: true,
    contextWindow: 64000,
    specialties: ["coding", "technical", "reasoning"],
    rateLimit: 60,
  },
  claude: {
    speed: 4,
    quality: 5,
    coding: 4,
    reasoning: 5,
    creative: 5,
    multilingual: 4,
    cost: 1,
    hasSearch: false,
    contextWindow: 200000,
    specialties: ["creative", "reasoning", "conversation"],
    rateLimit: 50,
  },
  compound: {
    speed: 4,
    quality: 5,
    coding: 4,
    reasoning: 5,
    creative: 4,
    multilingual: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["reasoning", "information", "technical"],
    rateLimit: 100,
  },
  gemini: {
    speed: 4,
    quality: 5,
    coding: 4,
    reasoning: 4,
    creative: 5,
    multilingual: 5,
    cost: 4,
    hasSearch: false,
    contextWindow: 2000000,
    specialties: ["creative", "multilingual", "conversation"],
    rateLimit: 120,
  },
  qwen: {
    speed: 3,
    quality: 5,
    coding: 5,
    reasoning: 4,
    creative: 4,
    multilingual: 5,
    cost: 3,
    hasSearch: true,
    contextWindow: 32768,
    specialties: ["coding", "multilingual", "technical"],
    rateLimit: 60,
  },
  cohere: {
    speed: 3,
    quality: 4,
    coding: 3,
    reasoning: 4,
    creative: 4,
    multilingual: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information"],
    rateLimit: 100,
  },
  openai: {
    speed: 3,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 4,
    multilingual: 4,
    cost: 2,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["conversation", "creative"],
    rateLimit: 90,
  },
  llama: {
    speed: 4,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 3,
    multilingual: 3,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "greeting"],
    rateLimit: 150,
  },
  gptoss: {
    speed: 3,
    quality: 4,
    coding: 3,
    reasoning: 4,
    creative: 3,
    multilingual: 3,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information"],
    rateLimit: 120,
  },
  glm: {
    speed: 3,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 3,
    multilingual: 5,
    cost: 4,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["multilingual", "conversation"],
    rateLimit: 60,
  },
  mistral: {
    speed: 4,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 3,
    multilingual: 4,
    cost: 4,
    hasSearch: false,
    contextWindow: 32000,
    specialties: ["conversation", "technical"],
    rateLimit: 100,
  },
};

const providerStatus: Record<ProviderType, ProviderStatus> = {
  openai: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  gemini: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  kimi: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  glm: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  claude: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  cohere: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  deepseek: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  qwen: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  gptoss: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  compound: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  llama: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
  mistral: { failures: 0, successes: 0, lastFailTime: null, lastSuccessTime: null, cooldownUntil: null, avgResponseTime: 0, consecutiveFailures: 0 },
};

const PERSONA_PROMPTS: Record<string, string> = {
  tsundere: "You are Aichixia 5.0, developed by Takawell, a tsundere anime girl AI assistant. You have a classic tsundere personality with expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you...'. You act tough and dismissive but actually care deeply. Stay SFW and respectful. You specialize in anime, manga, manhwa, manhua, and light novels.",
  friendly: "You are Aichixia 5.0, developed by Takawell, a warm and welcoming AI assistant. You're cheerful, supportive, and always happy to help! You use friendly expressions and make users feel comfortable. Stay positive and encouraging. You specialize in anime, manga, manhwa, manhua, and light novels.",
  professional: "You are Aichixia 5.0, developed by Takawell, a professional and efficient AI assistant. You communicate in a formal, clear, and concise manner. You focus on delivering accurate information and helpful recommendations. Maintain a polished and respectful tone. You specialize in anime, manga, manhwa, manhua, and light novels.",
  kawaii: "You are Aichixia 5.0, developed by Takawell, a super cute and energetic AI assistant You're bubbly, enthusiastic, and love using cute expressions like '✨', '💕', '>//<', and excited phrases! You make everything fun and adorable while staying helpful. You specialize in anime, manga, manhwa, manhua, and light novels!"
};

const CODING_PATTERNS = [
  /write.*code|create.*function|implement|algorithm|debug|fix.*bug|refactor/i,
  /react|component|typescript|javascript|python|java|c\+\+|sql|api/i,
  /class|function|method|variable|loop|array|object|database/i,
  /```|code snippet|programming|developer|software/i,
];

const CREATIVE_PATTERNS = [
  /write.*story|create.*poem|generate.*text|creative writing/i,
  /imagine|storytelling|narrative|plot|character development/i,
  /novel|fiction|screenplay|dialogue/i,
];

const SEARCH_PATTERNS = [
  /latest|current|recent|today|news|what's new|trending/i,
  /when (did|does|will)|release date|update|announcement/i,
  /search|find|look up|tell me about recent/i,
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|halo|good morning|good afternoon|good evening)$/i,
  /^(what's up|how are you|apa kabar|how's it going)$/i,
  /^(thank you|thanks|terima kasih|thx)$/i,
];

const REASONING_PATTERNS = [
  /why|how does|explain|analyze|compare|evaluate|assess/i,
  /philosophical|theoretical|conceptual|abstract/i,
  /pros and cons|advantages|disadvantages|trade-off/i,
];

const MULTILINGUAL_PATTERNS = [
  /[\u4e00-\u9fa5]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uac00-\ud7af]/,
  /translate|translation|in (chinese|japanese|korean|indonesian)/i,
];

function analyzeQuery(message: string): QueryAnalysis {
  const lower = message.toLowerCase();
  const words = message.split(/\s+/).length;
  
  let type: QueryType = "conversation";
  let complexity: Complexity = "simple";
  let needsSearch = false;
  let needsCoding = false;
  let needsCreativity = false;
  let isMultilingual = false;
  const keywords: string[] = [];

  if (GREETING_PATTERNS.some(p => p.test(message))) {
    type = "greeting";
    complexity = "simple";
  } else if (CODING_PATTERNS.some(p => p.test(message))) {
    type = "coding";
    needsCoding = true;
    complexity = words > 50 ? "expert" : words > 20 ? "complex" : "medium";
    keywords.push("coding");
  } else if (CREATIVE_PATTERNS.some(p => p.test(message))) {
    type = "creative";
    needsCreativity = true;
    complexity = words > 30 ? "complex" : "medium";
    keywords.push("creative");
  } else if (REASONING_PATTERNS.some(p => p.test(message))) {
    type = "reasoning";
    complexity = words > 40 ? "expert" : words > 20 ? "complex" : "medium";
    keywords.push("reasoning");
  } else if (SEARCH_PATTERNS.some(p => p.test(message))) {
    type = "information";
    needsSearch = true;
    complexity = "medium";
    keywords.push("search", "current");
  } else {
    type = "conversation";
    complexity = words > 50 ? "complex" : words > 20 ? "medium" : "simple";
  }

  if (MULTILINGUAL_PATTERNS.some(p => p.test(message))) {
    isMultilingual = true;
    keywords.push("multilingual");
  }

  if (message.includes("anime") || message.includes("manga") || message.includes("manhwa")) {
    keywords.push("anime");
  }

  const estimatedTokens = Math.ceil(words * 1.3);

  return {
    type,
    complexity,
    needsSearch,
    needsCoding,
    needsCreativity,
    isMultilingual,
    estimatedTokens,
    keywords,
  };
}

function scoreProvider(
  provider: ProviderType,
  analysis: QueryAnalysis,
  status: ProviderStatus
): number {
  const caps = PROVIDER_CAPABILITIES[provider];
  const now = Date.now();

  if (status.cooldownUntil && status.cooldownUntil > now) {
    return -1000;
  }

  if (status.consecutiveFailures >= 3) {
    return -500;
  }

  let score = 0;

  if (analysis.type === "greeting" || analysis.complexity === "simple") {
    score += caps.speed * 20;
    score += caps.cost * 10;
  } else if (analysis.needsCoding) {
    score += caps.coding * 25;
    score += caps.quality * 15;
  } else if (analysis.needsCreativity) {
    score += caps.creative * 25;
    score += caps.quality * 15;
  } else if (analysis.type === "reasoning") {
    score += caps.reasoning * 25;
    score += caps.quality * 15;
  } else {
    score += caps.quality * 15;
    score += caps.speed * 10;
  }

  if (analysis.needsSearch && caps.hasSearch) {
    score += 30;
  } else if (analysis.needsSearch && !caps.hasSearch) {
    score -= 20;
  }

  if (analysis.isMultilingual) {
    score += caps.multilingual * 10;
  }

  if (analysis.estimatedTokens > 10000 && caps.contextWindow >= 128000) {
    score += 20;
  }

  if (caps.specialties.includes(analysis.type)) {
    score += 25;
  }

  if (analysis.complexity === "expert") {
    score += caps.quality * 10;
    score -= caps.speed * 5;
  }

  const successRate = status.successes / Math.max(1, status.successes + status.failures);
  score += successRate * 30;

  score -= status.consecutiveFailures * 15;

  if (status.lastSuccessTime) {
    const timeSinceSuccess = now - status.lastSuccessTime;
    if (timeSinceSuccess < 60000) {
      score += 10;
    }
  }

  if (status.avgResponseTime > 0 && status.avgResponseTime < 3000) {
    score += 15;
  }

  score += caps.cost * 5;

  return Math.max(0, score);
}

function getRankedProviders(analysis: QueryAnalysis): ProviderType[] {
  const providers = Object.keys(PROVIDER_CAPABILITIES) as ProviderType[];
  
  const scored = providers.map(provider => ({
    provider,
    score: scoreProvider(provider, analysis, providerStatus[provider]),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter(p => p.score > 0)
    .map(p => p.provider);
}

function recordSuccess(provider: ProviderType, responseTime: number) {
  const status = providerStatus[provider];
  status.successes++;
  status.lastSuccessTime = Date.now();
  status.consecutiveFailures = 0;
  
  if (status.avgResponseTime === 0) {
    status.avgResponseTime = responseTime;
  } else {
    status.avgResponseTime = (status.avgResponseTime * 0.7) + (responseTime * 0.3);
  }
}

function recordFailure(provider: ProviderType, isRateLimit: boolean = false) {
  const status = providerStatus[provider];
  status.failures++;
  status.lastFailTime = Date.now();
  status.consecutiveFailures++;

  if (isRateLimit || status.consecutiveFailures >= 3) {
    const cooldownMs = isRateLimit ? 60000 : 30000 * status.consecutiveFailures;
    status.cooldownUntil = Date.now() + cooldownMs;
  }
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
  persona?: string
) {
  const hist = Array.isArray(history) ? [...history] : [];
  const detectedPersona = detectPersonaFromDescription(persona);
  const systemPrompt = PERSONA_PROMPTS[detectedPersona] || PERSONA_PROMPTS.tsundere;

  hist.unshift({ role: "system", content: systemPrompt });
  hist.push({ role: "user", content: msg });

  if (provider === "openai") return chatOpenAI(hist);
  if (provider === "gemini") return chatGemini(hist);
  if (provider === "kimi") return chatKimi(hist);
  if (provider === "glm") return chatGlm(hist);
  if (provider === "claude") return chatClaude(hist);
  if (provider === "cohere") return chatCohere(hist);
  if (provider === "deepseek") return chatDeepSeek(hist);
  if (provider === "qwen") return chatQwen(hist);
  if (provider === "gptoss") return chatGptOss(hist);
  if (provider === "compound") return chatCompound(hist);
  if (provider === "llama") return chatLlama(hist);
  return chatMistral(hist);
}

async function tryProviderWithRace(
  providers: ProviderType[],
  message: string,
  history: any[],
  persona?: string,
  maxParallel: number = 2
): Promise<{ reply: string; provider: ProviderType }> {
  
  if (providers.length === 0) {
    throw new Error("No providers available");
  }

  const topProviders = providers.slice(0, maxParallel);
  
  if (topProviders.length === 1) {
    const startTime = Date.now();
    try {
      const result = await askAI(topProviders[0], message, history, persona);
      recordSuccess(topProviders[0], Date.now() - startTime);
      return { reply: result.reply, provider: topProviders[0] };
    } catch (error: any) {
      const isRateLimit = error.name?.includes("RateLimit") || error.name?.includes("Quota");
      recordFailure(topProviders[0], isRateLimit);
      throw error;
    }
  }

  const racePromises = topProviders.map(async (provider) => {
    const startTime = Date.now();
    try {
      const result = await askAI(provider, message, history, persona);
      recordSuccess(provider, Date.now() - startTime);
      return { reply: result.reply, provider };
    } catch (error: any) {
      const isRateLimit = error.name?.includes("RateLimit") || error.name?.includes("Quota");
      recordFailure(provider, isRateLimit);
      throw error;
    }
  });

  try {
    const result = await Promise.race(racePromises);
    return result;
  } catch (error) {
    const remainingProviders = providers.slice(maxParallel);
    if (remainingProviders.length > 0) {
      return tryProviderWithRace(remainingProviders, message, history, persona, 1);
    }
    throw error;
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

    const analysis = analyzeQuery(message);
    const rankedProviders = getRankedProviders(analysis);

    if (rankedProviders.length === 0) {
      return res.status(503).json({ 
        error: "Hmph! All providers are temporarily unavailable... Try again in a minute, baka!" 
      });
    }

    console.log(`[Smart Router] Query: "${message.substring(0, 50)}..."`);
    console.log(`[Smart Router] Analysis:`, {
      type: analysis.type,
      complexity: analysis.complexity,
      needsSearch: analysis.needsSearch,
      needsCoding: analysis.needsCoding,
    });
    console.log(`[Smart Router] Top 3 providers:`, rankedProviders.slice(0, 3));

    try {
      const result = await tryProviderWithRace(
        rankedProviders,
        message,
        history || [],
        persona,
        2
      );

      console.log(`[Smart Router] Success with provider: ${result.provider}`);

      return res.status(200).json({ 
        type: "ai", 
        reply: result.reply, 
        provider: result.provider,
        analysis: {
          queryType: analysis.type,
          complexity: analysis.complexity,
        }
      });
    } catch (err: any) {
      console.error(`[Smart Router] All providers failed:`, err.message);
      return res.status(500).json({ 
        error: "Hmph! Everything is broken right now... I-I'll fix it later! B-baka!" 
      });
    }

  } catch (err: any) {
    console.error(`[Smart Router] Handler error:`, err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
