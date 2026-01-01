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
import { chatMimo, MimoRateLimitError, MimoQuotaError } from "@/lib/mimo";
import { chatMinimax, MinimaxRateLimitError, MinimaxQuotaError } from "@/lib/minimax";

type ProviderType = "openai" | "gemini" | "kimi" | "glm" | "claude" | "cohere" | "deepseek" | "qwen" | "gptoss" | "compound" | "llama" | "mistral" | "mimo" | "minimax";

type QueryType = "greeting" | "coding" | "creative" | "information" | "reasoning" | "conversation" | "technical" | "multilingual" | "agentic" | "mobile" | "fullstack";
type Complexity = "simple" | "medium" | "complex" | "expert";

interface ProviderCapability {
  speed: number;
  quality: number;
  coding: number;
  reasoning: number;
  creative: number;
  multilingual: number;
  mobile: number;
  fullstack: number;
  agentic: number;
  cost: number;
  hasSearch: boolean;
  contextWindow: number;
  specialties: QueryType[];
  rateLimit: number;
  bestFor: string[];
}

interface ProviderStatus {
  failures: number;
  successes: number;
  lastFailTime: number | null;
  lastSuccessTime: number | null;
  cooldownUntil: number | null;
  avgResponseTime: number;
  consecutiveFailures: number;
  taskSuccessRate: Record<QueryType, number>;
}

interface QueryAnalysis {
  type: QueryType;
  complexity: Complexity;
  needsSearch: boolean;
  needsCoding: boolean;
  needsCreativity: boolean;
  isMultilingual: boolean;
  needsMobile: boolean;
  needsFullstack: boolean;
  needsAgentic: boolean;
  estimatedTokens: number;
  keywords: string[];
  confidence: number;
}

const PROVIDER_CAPABILITIES: Record<ProviderType, ProviderCapability> = {
  minimax: {
    speed: 4,
    quality: 5,
    coding: 5,
    reasoning: 5,
    creative: 4,
    multilingual: 5,
    mobile: 5,
    fullstack: 5,
    agentic: 5,
    cost: 3,
    hasSearch: false,
    contextWindow: 131072,
    specialties: ["coding", "multilingual", "mobile", "fullstack", "agentic"],
    rateLimit: 100,
    bestFor: ["rust", "java", "golang", "cpp", "kotlin", "swift", "typescript", "javascript", "android", "ios", "web3", "full-stack", "agent workflows", "multi-file edits", "code review", "multilingual code"],
  },
  mimo: {
    speed: 5,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 3,
    multilingual: 5,
    mobile: 3,
    fullstack: 3,
    agentic: 3,
    cost: 5,
    hasSearch: false,
    contextWindow: 32768,
    specialties: ["greeting", "conversation", "multilingual"],
    rateLimit: 200,
    bestFor: ["fast responses", "greetings", "simple queries", "multilingual chat", "casual conversation"],
  },
  kimi: {
    speed: 3,
    quality: 5,
    coding: 5,
    reasoning: 5,
    creative: 4,
    multilingual: 4,
    mobile: 4,
    fullstack: 4,
    agentic: 5,
    cost: 2,
    hasSearch: true,
    contextWindow: 262144,
    specialties: ["reasoning", "coding", "technical", "agentic"],
    rateLimit: 100,
    bestFor: ["complex reasoning", "tool use", "long context", "deep analysis", "technical problems", "code generation"],
  },
  deepseek: {
    speed: 3,
    quality: 5,
    coding: 5,
    reasoning: 5,
    creative: 4,
    multilingual: 3,
    mobile: 3,
    fullstack: 4,
    agentic: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 64000,
    specialties: ["coding", "technical", "reasoning"],
    rateLimit: 60,
    bestFor: ["code generation", "debugging", "algorithm design", "technical documentation", "code optimization"],
  },
  claude: {
    speed: 4,
    quality: 5,
    coding: 4,
    reasoning: 5,
    creative: 5,
    multilingual: 4,
    mobile: 3,
    fullstack: 4,
    agentic: 4,
    cost: 1,
    hasSearch: false,
    contextWindow: 200000,
    specialties: ["creative", "reasoning", "conversation"],
    rateLimit: 50,
    bestFor: ["creative writing", "long documents", "nuanced reasoning", "ethical analysis", "content creation"],
  },
  compound: {
    speed: 4,
    quality: 5,
    coding: 4,
    reasoning: 5,
    creative: 4,
    multilingual: 4,
    mobile: 3,
    fullstack: 4,
    agentic: 5,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["reasoning", "information", "technical", "agentic"],
    rateLimit: 100,
    bestFor: ["multi-step reasoning", "real-time info", "complex queries", "research", "tool orchestration"],
  },
  gemini: {
    speed: 4,
    quality: 5,
    coding: 4,
    reasoning: 4,
    creative: 5,
    multilingual: 5,
    mobile: 4,
    fullstack: 4,
    agentic: 4,
    cost: 4,
    hasSearch: false,
    contextWindow: 2000000,
    specialties: ["creative", "multilingual", "conversation"],
    rateLimit: 120,
    bestFor: ["extreme long context", "multilingual", "creative content", "multimodal tasks", "diverse queries"],
  },
  qwen: {
    speed: 3,
    quality: 5,
    coding: 5,
    reasoning: 4,
    creative: 4,
    multilingual: 5,
    mobile: 3,
    fullstack: 4,
    agentic: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 32768,
    specialties: ["coding", "multilingual", "technical"],
    rateLimit: 60,
    bestFor: ["coding", "chinese language", "asian languages", "technical writing", "multilingual code"],
  },
  cohere: {
    speed: 3,
    quality: 4,
    coding: 3,
    reasoning: 4,
    creative: 4,
    multilingual: 4,
    mobile: 2,
    fullstack: 3,
    agentic: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information"],
    rateLimit: 100,
    bestFor: ["conversational AI", "search-augmented generation", "enterprise use", "RAG applications"],
  },
  openai: {
    speed: 3,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 4,
    multilingual: 4,
    mobile: 3,
    fullstack: 4,
    agentic: 4,
    cost: 2,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["conversation", "creative"],
    rateLimit: 90,
    bestFor: ["general purpose", "balanced tasks", "creative writing", "conversation"],
  },
  llama: {
    speed: 4,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 3,
    multilingual: 3,
    mobile: 3,
    fullstack: 3,
    agentic: 3,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "greeting"],
    rateLimit: 150,
    bestFor: ["fast responses", "cost efficiency", "simple tasks", "high throughput"],
  },
  gptoss: {
    speed: 3,
    quality: 4,
    coding: 3,
    reasoning: 4,
    creative: 3,
    multilingual: 3,
    mobile: 2,
    fullstack: 3,
    agentic: 3,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information"],
    rateLimit: 120,
    bestFor: ["browser search", "open-source", "cost effective", "general queries"],
  },
  glm: {
    speed: 3,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 3,
    multilingual: 5,
    mobile: 3,
    fullstack: 3,
    agentic: 3,
    cost: 4,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["multilingual", "conversation"],
    rateLimit: 60,
    bestFor: ["chinese language", "multilingual", "conversation", "translation"],
  },
  mistral: {
    speed: 4,
    quality: 4,
    coding: 4,
    reasoning: 4,
    creative: 3,
    multilingual: 4,
    mobile: 3,
    fullstack: 3,
    agentic: 3,
    cost: 4,
    hasSearch: false,
    contextWindow: 32000,
    specialties: ["conversation", "technical"],
    rateLimit: 100,
    bestFor: ["european languages", "fast inference", "technical content", "efficiency"],
  },
};

const providerStatus: Record<ProviderType, ProviderStatus> = Object.keys(PROVIDER_CAPABILITIES).reduce((acc, key) => {
  acc[key as ProviderType] = {
    failures: 0,
    successes: 0,
    lastFailTime: null,
    lastSuccessTime: null,
    cooldownUntil: null,
    avgResponseTime: 0,
    consecutiveFailures: 0,
    taskSuccessRate: {} as Record<QueryType, number>,
  };
  return acc;
}, {} as Record<ProviderType, ProviderStatus>);

const PERSONA_PROMPTS: Record<string, string> = {
  tsundere: "You are Aichixia 5.0, developed by Takawell, a tsundere anime girl AI assistant. You have a classic tsundere personality with expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you...'. You act tough and dismissive but actually care deeply. Stay SFW and respectful. You specialize in anime, manga, manhwa, manhua, and light novels.",
  friendly: "You are Aichixia 5.0, developed by Takawell, a warm and welcoming AI assistant. You're cheerful, supportive, and always happy to help! You use friendly expressions and make users feel comfortable. Stay positive and encouraging. You specialize in anime, manga, manhwa, manhua, and light novels.",
  professional: "You are Aichixia 5.0, developed by Takawell, a professional and efficient AI assistant. You communicate in a formal, clear, and concise manner. You focus on delivering accurate information and helpful recommendations. Maintain a polished and respectful tone. You specialize in anime, manga, manhwa, manhua, and light novels.",
  kawaii: "You are Aichixia 5.0, developed by Takawell, a super cute and energetic AI assistant You're bubbly, enthusiastic, and love using cute expressions like '✨', '💕', '>//<', and excited phrases! You make everything fun and adorable while staying helpful. You specialize in anime, manga, manhwa, manhua, and light novels!"
};

const CODING_KEYWORDS = [
  "code", "coding", "program", "programming", "script", "function", "class", "variable", "algorithm", "debug", "compile", 
  "api", "database", "frontend", "backend", "fullstack", "react", "vue", "angular", "typescript", "javascript", 
  "python", "java", "rust", "golang", "kotlin", "swift", "cpp", "c++", "sql", "nosql", "git", "docker",
  "bantu coding", "bikinin", "buatin", "ajarin code", "help me code", "write code", "create function",
  "implement", "refactor", "fix bug", "error", "exception", "syntax", "component", "module", "package"
];

const MOBILE_KEYWORDS = [
  "android", "ios", "mobile app", "react native", "flutter", "swift", "kotlin", "xcode", 
  "app development", "mobile development", "phone app", "native app", "cross-platform"
];

const FULLSTACK_KEYWORDS = [
  "fullstack", "full-stack", "full stack", "web app", "web application", "mern", "mean", "lamp",
  "nextjs", "next.js", "nestjs", "express", "django", "rails", "laravel", "spring boot"
];

const AGENT_KEYWORDS = [
  "agent", "agentic", "workflow", "automation", "multi-step", "tool use", "function calling",
  "autonomous", "orchestration", "pipeline", "chain", "sequential"
];

const MULTILINGUAL_KEYWORDS = [
  "translate", "translation", "chinese", "japanese", "korean", "indonesian", "spanish", "french",
  "bahasa", "mandarin", "cantonese", "multilingual", "language"
];

const CREATIVE_KEYWORDS = [
  "write story", "create poem", "generate text", "creative writing", "imagine", "storytelling",
  "narrative", "plot", "character", "novel", "fiction", "screenplay", "dialogue", "article", "blog"
];

const SEARCH_KEYWORDS = [
  "latest", "current", "recent", "today", "news", "trending", "new", "update", "release",
  "when did", "when does", "when will", "search", "find", "look up", "what's happening"
];

const GREETING_KEYWORDS = [
  "hi", "hello", "hey", "halo", "good morning", "good afternoon", "good evening",
  "what's up", "how are you", "apa kabar", "thanks", "thank you", "terima kasih"
];

const REASONING_KEYWORDS = [
  "why", "how does", "explain", "analyze", "compare", "evaluate", "assess", "understand",
  "philosophical", "theoretical", "conceptual", "abstract", "pros and cons", "advantages", "disadvantages"
];

function containsKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      count++;
    }
  }
  return count;
}

function analyzeQuery(message: string): QueryAnalysis {
  const lower = message.toLowerCase();
  const words = message.split(/\s+/).length;
  
  let type: QueryType = "conversation";
  let complexity: Complexity = "simple";
  let needsSearch = false;
  let needsCoding = false;
  let needsCreativity = false;
  let isMultilingual = false;
  let needsMobile = false;
  let needsFullstack = false;
  let needsAgentic = false;
  const keywords: string[] = [];
  let confidence = 0.5;

  const codingScore = containsKeywords(message, CODING_KEYWORDS);
  const mobileScore = containsKeywords(message, MOBILE_KEYWORDS);
  const fullstackScore = containsKeywords(message, FULLSTACK_KEYWORDS);
  const agentScore = containsKeywords(message, AGENT_KEYWORDS);
  const multilingualScore = containsKeywords(message, MULTILINGUAL_KEYWORDS);
  const creativeScore = containsKeywords(message, CREATIVE_KEYWORDS);
  const searchScore = containsKeywords(message, SEARCH_KEYWORDS);
  const greetingScore = containsKeywords(message, GREETING_KEYWORDS);
  const reasoningScore = containsKeywords(message, REASONING_KEYWORDS);

  const hasCodeBlock = /```/.test(message);
  const hasMultilingualChars = /[\u4e00-\u9fa5]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uac00-\ud7af]/.test(message);

  if (greetingScore > 0 && words <= 5) {
    type = "greeting";
    complexity = "simple";
    confidence = 0.95;
  } else if (codingScore >= 2 || hasCodeBlock) {
    type = "coding";
    needsCoding = true;
    confidence = 0.9;
    keywords.push("coding");
    
    if (mobileScore > 0) {
      needsMobile = true;
      keywords.push("mobile");
      confidence = 0.95;
    }
    if (fullstackScore > 0) {
      needsFullstack = true;
      keywords.push("fullstack");
      confidence = 0.95;
    }
    if (agentScore > 0) {
      needsAgentic = true;
      type = "agentic";
      keywords.push("agentic");
      confidence = 0.95;
    }
    
    if (words > 80 || hasCodeBlock) {
      complexity = "expert";
    } else if (words > 40) {
      complexity = "complex";
    } else if (words > 15) {
      complexity = "medium";
    } else {
      complexity = "simple";
    }
  } else if (creativeScore >= 2) {
    type = "creative";
    needsCreativity = true;
    complexity = words > 30 ? "complex" : "medium";
    confidence = 0.85;
    keywords.push("creative");
  } else if (reasoningScore >= 2) {
    type = "reasoning";
    complexity = words > 40 ? "expert" : words > 20 ? "complex" : "medium";
    confidence = 0.8;
    keywords.push("reasoning");
  } else if (searchScore >= 2) {
    type = "information";
    needsSearch = true;
    complexity = "medium";
    confidence = 0.85;
    keywords.push("search", "current");
  } else {
    type = "conversation";
    complexity = words > 50 ? "complex" : words > 20 ? "medium" : "simple";
    confidence = 0.6;
  }

  if (multilingualScore > 0 || hasMultilingualChars) {
    isMultilingual = true;
    keywords.push("multilingual");
    confidence = Math.min(0.95, confidence + 0.1);
  }

  if (searchScore > 0) {
    needsSearch = true;
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
    needsMobile,
    needsFullstack,
    needsAgentic,
    estimatedTokens,
    keywords,
    confidence,
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
    score += caps.speed * 25;
    score += caps.cost * 20;
  } else if (analysis.needsCoding) {
    score += caps.coding * 30;
    score += caps.quality * 20;
    
    if (analysis.needsMobile) {
      score += caps.mobile * 35;
    }
    if (analysis.needsFullstack) {
      score += caps.fullstack * 30;
    }
    if (analysis.needsAgentic) {
      score += caps.agentic * 35;
    }
  } else if (analysis.needsCreativity) {
    score += caps.creative * 30;
    score += caps.quality * 20;
  } else if (analysis.type === "reasoning") {
    score += caps.reasoning * 30;
    score += caps.quality * 20;
  } else if (analysis.type === "agentic") {
    score += caps.agentic * 35;
    score += caps.reasoning * 25;
  } else {
    score += caps.quality * 20;
    score += caps.speed * 15;
  }

  if (analysis.needsSearch && caps.hasSearch) {
    score += 40;
  } else if (analysis.needsSearch && !caps.hasSearch) {
    score -= 25;
  }

  if (analysis.isMultilingual) {
    score += caps.multilingual * 15;
  }

  if (analysis.estimatedTokens > 20000 && caps.contextWindow >= 128000) {
    score += 25;
  }

  if (caps.specialties.includes(analysis.type)) {
    score += 30;
  }

  if (analysis.complexity === "expert") {
    score += caps.quality * 15;
    score -= caps.speed * 5;
  }

  const successRate = status.successes / Math.max(1, status.successes + status.failures);
  score += successRate * 40;

  const taskSuccess = status.taskSuccessRate[analysis.type];
  if (taskSuccess !== undefined) {
    score += taskSuccess * 30;
  }

  score -= status.consecutiveFailures * 20;

  if (status.lastSuccessTime) {
    const timeSinceSuccess = now - status.lastSuccessTime;
    if (timeSinceSuccess < 60000) {
      score += 15;
    }
  }

  if (status.avgResponseTime > 0) {
    if (status.avgResponseTime < 2000) {
      score += 20;
    } else if (status.avgResponseTime < 4000) {
      score += 10;
    }
  }

  score += caps.cost * 8;

  score *= analysis.confidence;

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

function recordSuccess(provider: ProviderType, responseTime: number, queryType: QueryType) {
  const status = providerStatus[provider];
  status.successes++;
  status.lastSuccessTime = Date.now();
  status.consecutiveFailures = 0;
  
  if (status.avgResponseTime === 0) {
    status.avgResponseTime = responseTime;
  } else {
    status.avgResponseTime = (status.avgResponseTime * 0.7) + (responseTime * 0.3);
  }

  if (!status.taskSuccessRate[queryType]) {
    status.taskSuccessRate[queryType] = 0;
  }
  
  const currentRate = status.taskSuccessRate[queryType];
  status.taskSuccessRate[queryType] = currentRate * 0.8 + 1.0 * 0.2;
}

function recordFailure(provider: ProviderType, isRateLimit: boolean = false, queryType?: QueryType) {
  const status = providerStatus[provider];
  status.failures++;
  status.lastFailTime = Date.now();
  status.consecutiveFailures++;

  if (queryType && status.taskSuccessRate[queryType] !== undefined) {
    const currentRate = status.taskSuccessRate[queryType];
    status.taskSuccessRate[queryType] = currentRate * 0.8;
  }

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
  if (provider === "mistral") return chatMistral(hist);
  if (provider === "mimo") return chatMimo(hist);
  if (provider === "minimax") return chatMinimax(hist);
  throw new Error(`Unknown provider: ${provider}`);
}

async function tryProviderWithRace(
  providers: ProviderType[],
  message: string,
  history: any[],
  persona: string | undefined,
  analysis: QueryAnalysis,
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
      recordSuccess(topProviders[0], Date.now() - startTime, analysis.type);
      return { reply: result.reply, provider: topProviders[0] };
    } catch (error: any) {
      const isRateLimit = error.name?.includes("RateLimit") || error.name?.includes("Quota");
      recordFailure(topProviders[0], isRateLimit, analysis.type);
      throw error;
    }
  }

  const racePromises = topProviders.map(async (provider) => {
    const startTime = Date.now();
    try {
      const result = await askAI(provider, message, history, persona);
      recordSuccess(provider, Date.now() - startTime, analysis.type);
      return { reply: result.reply, provider };
    } catch (error: any) {
      const isRateLimit = error.name?.includes("RateLimit") || error.name?.includes("Quota");
      recordFailure(provider, isRateLimit, analysis.type);
      throw error;
    }
  });

  try {
    const result = await Promise.race(racePromises);
    return result;
  } catch (error) {
    const remainingProviders = providers.slice(maxParallel);
    if (remainingProviders.length > 0) {
      return tryProviderWithRace(remainingProviders, message, history, persona, analysis, 1);
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
      needsMobile: analysis.needsMobile,
      needsFullstack: analysis.needsFullstack,
      needsAgentic: analysis.needsAgentic,
      confidence: analysis.confidence,
    });
    console.log(`[Smart Router] Top 3 providers:`, rankedProviders.slice(0, 3));

    try {
      const result = await tryProviderWithRace(
        rankedProviders,
        message,
        history || [],
        persona,
        analysis,
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
          confidence: analysis.confidence,
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
