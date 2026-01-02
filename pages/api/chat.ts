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

type QueryType = "greeting" | "coding" | "creative" | "information" | "reasoning" | "conversation" | "technical" | "multilingual" | "agentic" | "mobile" | "fullstack" | "mobileFullstack" | "webdev" | "backend" | "frontend" | "devops" | "database" | "algorithm" | "security" | "testing" | "architecture";

type Complexity = "trivial" | "simple" | "medium" | "complex" | "expert" | "advanced";

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
  webdev: number;
  backend: number;
  frontend: number;
  devops: number;
  database: number;
  algorithm: number;
  security: number;
  testing: number;
  cost: number;
  hasSearch: boolean;
  contextWindow: number;
  specialties: QueryType[];
  rateLimit: number;
  bestFor: string[];
  weaknesses: string[];
  optimalComplexity: Complexity[];
}

interface ProviderStatus {
  failures: number;
  successes: number;
  lastFailTime: number | null;
  lastSuccessTime: number | null;
  cooldownUntil: number | null;
  avgResponseTime: number;
  consecutiveFailures: number;
  taskSuccessRate: Map<QueryType, number>;
  recentPerformance: number[];
  totalRequests: number;
  lastHourRequests: number;
  hourResetTime: number;
  complexityPerformance: Map<Complexity, number>;
  searchQuality: number;
  codeQuality: number;
  creativityQuality: number;
}

interface QueryAnalysis {
  type: QueryType;
  subTypes: QueryType[];
  complexity: Complexity;
  needsSearch: boolean;
  needsCoding: boolean;
  needsCreativity: boolean;
  isMultilingual: boolean;
  needsMobile: boolean;
  needsFullstack: boolean;
  needsAgentic: boolean;
  needsWebdev: boolean;
  needsBackend: boolean;
  needsFrontend: boolean;
  needsDevops: boolean;
  needsDatabase: boolean;
  needsAlgorithm: boolean;
  needsSecurity: boolean;
  needsTesting: boolean;
  estimatedTokens: number;
  keywords: string[];
  confidence: number;
  priority: "low" | "medium" | "high" | "critical";
  languages: string[];
  frameworks: string[];
  technologies: string[];
  contextComplexity: number;
  semanticDepth: number;
  requiresPrecision: boolean;
  requiresSpeed: boolean;
  multiStep: boolean;
  longContext: boolean;
}

interface ProviderScore {
  provider: ProviderType;
  score: number;
  breakdown: {
    capabilityScore: number;
    reliabilityScore: number;
    performanceScore: number;
    contextScore: number;
    specialtyBonus: number;
    penaltyScore: number;
  };
  reasoning: string[];
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
    webdev: 5,
    backend: 5,
    frontend: 5,
    devops: 4,
    database: 5,
    algorithm: 5,
    security: 4,
    testing: 4,
    cost: 3,
    hasSearch: false,
    contextWindow: 131072,
    specialties: ["coding", "multilingual", "mobile", "fullstack", "agentic", "mobileFullstack", "backend", "algorithm", "architecture"],
    rateLimit: 100,
    bestFor: ["rust", "java", "golang", "cpp", "kotlin", "swift", "typescript", "javascript", "android", "ios", "web3", "full-stack", "agent workflows", "multi-file edits", "code review", "multilingual code", "system design", "microservices", "api design", "complex algorithms", "mobile architecture", "cross-platform"],
    weaknesses: ["simple queries", "fast responses needed", "search required", "creative writing"],
    optimalComplexity: ["complex", "expert", "advanced"],
  },
  mimo: {
    speed: 5,
    quality: 4,
    coding: 3,
    reasoning: 3,
    creative: 3,
    multilingual: 5,
    mobile: 2,
    fullstack: 2,
    agentic: 2,
    webdev: 2,
    backend: 2,
    frontend: 2,
    devops: 2,
    database: 2,
    algorithm: 2,
    security: 2,
    testing: 2,
    cost: 5,
    hasSearch: false,
    contextWindow: 32768,
    specialties: ["greeting", "conversation", "multilingual"],
    rateLimit: 200,
    bestFor: ["fast responses", "greetings", "simple queries", "multilingual chat", "casual conversation", "quick answers", "chitchat", "basic questions", "translation", "language practice"],
    weaknesses: ["complex coding", "deep reasoning", "technical depth", "long context", "specialized tasks"],
    optimalComplexity: ["trivial", "simple"],
  },
  kimi: {
    speed: 3,
    quality: 5,
    coding: 5,
    reasoning: 5,
    creative: 4,
    multilingual: 4,
    mobile: 4,
    fullstack: 5,
    agentic: 5,
    webdev: 5,
    backend: 5,
    frontend: 4,
    devops: 4,
    database: 5,
    algorithm: 5,
    security: 4,
    testing: 5,
    cost: 2,
    hasSearch: true,
    contextWindow: 262144,
    specialties: ["reasoning", "coding", "technical", "agentic", "fullstack", "backend", "algorithm", "architecture"],
    rateLimit: 100,
    bestFor: ["complex reasoning", "tool use", "long context", "deep analysis", "technical problems", "code generation", "system architecture", "performance optimization", "large codebases", "refactoring", "technical documentation", "database design", "distributed systems", "scalability"],
    weaknesses: ["simple greetings", "quick tasks", "very fast responses"],
    optimalComplexity: ["medium", "complex", "expert", "advanced"],
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
    webdev: 5,
    backend: 5,
    frontend: 4,
    devops: 4,
    database: 5,
    algorithm: 5,
    security: 5,
    testing: 5,
    cost: 3,
    hasSearch: true,
    contextWindow: 64000,
    specialties: ["coding", "technical", "reasoning", "algorithm", "backend", "security"],
    rateLimit: 60,
    bestFor: ["code generation", "debugging", "algorithm design", "technical documentation", "code optimization", "security analysis", "code review", "performance tuning", "data structures", "computational complexity", "low-level programming", "systems programming", "compiler design"],
    weaknesses: ["creative writing", "casual conversation", "multilingual", "frontend design"],
    optimalComplexity: ["medium", "complex", "expert", "advanced"],
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
    webdev: 4,
    backend: 4,
    frontend: 4,
    devops: 3,
    database: 4,
    algorithm: 4,
    security: 4,
    testing: 4,
    cost: 1,
    hasSearch: false,
    contextWindow: 200000,
    specialties: ["creative", "reasoning", "conversation", "architecture"],
    rateLimit: 50,
    bestFor: ["creative writing", "long documents", "nuanced reasoning", "ethical analysis", "content creation", "narrative design", "technical writing", "documentation", "code explanation", "architectural decisions", "design patterns", "code philosophy", "best practices"],
    weaknesses: ["real-time search", "extremely fast responses", "rate-limited"],
    optimalComplexity: ["simple", "medium", "complex", "expert"],
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
    webdev: 4,
    backend: 4,
    frontend: 3,
    devops: 4,
    database: 4,
    algorithm: 4,
    security: 4,
    testing: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["reasoning", "information", "technical", "agentic"],
    rateLimit: 100,
    bestFor: ["multi-step reasoning", "real-time info", "complex queries", "research", "tool orchestration", "data analysis", "information synthesis", "comparative analysis", "trend analysis", "market research", "competitive analysis"],
    weaknesses: ["simple greetings", "pure creative writing"],
    optimalComplexity: ["medium", "complex", "expert"],
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
    webdev: 4,
    backend: 4,
    frontend: 4,
    devops: 3,
    database: 4,
    algorithm: 4,
    security: 3,
    testing: 4,
    cost: 4,
    hasSearch: false,
    contextWindow: 2000000,
    specialties: ["creative", "multilingual", "conversation"],
    rateLimit: 120,
    bestFor: ["extreme long context", "multilingual", "creative content", "multimodal tasks", "diverse queries", "document analysis", "massive codebases", "historical context", "cross-lingual tasks", "translation", "localization", "content adaptation"],
    weaknesses: ["specialized deep coding", "highly technical tasks"],
    optimalComplexity: ["simple", "medium", "complex"],
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
    webdev: 4,
    backend: 5,
    frontend: 4,
    devops: 3,
    database: 4,
    algorithm: 5,
    security: 4,
    testing: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 32768,
    specialties: ["coding", "multilingual", "technical", "algorithm"],
    rateLimit: 60,
    bestFor: ["coding", "chinese language", "asian languages", "technical writing", "multilingual code", "algorithm implementation", "competitive programming", "math problems", "chinese tech stack", "mandarin documentation"],
    weaknesses: ["creative writing in english", "western frameworks"],
    optimalComplexity: ["medium", "complex", "expert"],
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
    webdev: 3,
    backend: 3,
    frontend: 3,
    devops: 3,
    database: 3,
    algorithm: 3,
    security: 3,
    testing: 3,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information"],
    rateLimit: 100,
    bestFor: ["conversational AI", "search-augmented generation", "enterprise use", "RAG applications", "semantic search", "document retrieval", "knowledge bases", "chatbots", "customer support"],
    weaknesses: ["deep coding", "mobile development", "specialized technical tasks"],
    optimalComplexity: ["simple", "medium"],
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
    webdev: 4,
    backend: 4,
    frontend: 4,
    devops: 3,
    database: 4,
    algorithm: 4,
    security: 4,
    testing: 4,
    cost: 2,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["conversation", "creative", "webdev", "fullstack"],
    rateLimit: 90,
    bestFor: ["general purpose", "balanced tasks", "creative writing", "conversation", "web development", "javascript", "typescript", "react", "nodejs", "api integration", "general coding", "tutorials"],
    weaknesses: ["very specialized tasks", "extreme performance optimization"],
    optimalComplexity: ["simple", "medium", "complex"],
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
    webdev: 4,
    backend: 4,
    frontend: 3,
    devops: 3,
    database: 3,
    algorithm: 4,
    security: 3,
    testing: 3,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "greeting", "webdev"],
    rateLimit: 150,
    bestFor: ["fast responses", "cost efficiency", "simple tasks", "high throughput", "basic coding", "general queries", "web development", "scripting", "automation"],
    weaknesses: ["complex reasoning", "specialized expertise", "creative writing"],
    optimalComplexity: ["trivial", "simple", "medium"],
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
    webdev: 3,
    backend: 3,
    frontend: 3,
    devops: 2,
    database: 3,
    algorithm: 3,
    security: 3,
    testing: 3,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information"],
    rateLimit: 120,
    bestFor: ["browser search", "open-source", "cost effective", "general queries", "information lookup", "fact checking", "research", "documentation search"],
    weaknesses: ["specialized coding", "mobile dev", "deep technical tasks"],
    optimalComplexity: ["trivial", "simple", "medium"],
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
    webdev: 3,
    backend: 4,
    frontend: 3,
    devops: 3,
    database: 3,
    algorithm: 4,
    security: 3,
    testing: 3,
    cost: 4,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["multilingual", "conversation"],
    rateLimit: 60,
    bestFor: ["chinese language", "multilingual", "conversation", "translation", "chinese coding", "mandarin support", "asian languages", "localization"],
    weaknesses: ["english-only tasks", "western frameworks", "mobile dev"],
    optimalComplexity: ["simple", "medium"],
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
    webdev: 4,
    backend: 4,
    frontend: 4,
    devops: 3,
    database: 3,
    algorithm: 4,
    security: 4,
    testing: 3,
    cost: 4,
    hasSearch: false,
    contextWindow: 32000,
    specialties: ["conversation", "technical", "webdev"],
    rateLimit: 100,
    bestFor: ["european languages", "fast inference", "technical content", "efficiency", "french", "spanish", "italian", "web development", "modern frameworks"],
    weaknesses: ["very long context", "mobile dev", "extreme specialization"],
    optimalComplexity: ["simple", "medium", "complex"],
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
    taskSuccessRate: new Map<QueryType, number>(),
    recentPerformance: [],
    totalRequests: 0,
    lastHourRequests: 0,
    hourResetTime: Date.now() + 3600000,
    complexityPerformance: new Map<Complexity, number>(),
    searchQuality: 0,
    codeQuality: 0,
    creativityQuality: 0,
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
  "implement", "refactor", "fix bug", "error", "exception", "syntax", "component", "module", "package",
  "repository", "commit", "branch", "merge", "pull request", "CI/CD", "testing", "unit test", "integration test"
];

const MOBILE_KEYWORDS = [
  "android", "ios", "mobile app", "react native", "flutter", "swift", "kotlin", "xcode", 
  "app development", "mobile development", "phone app", "native app", "cross-platform",
  "swiftui", "jetpack compose", "mobile ui", "app store", "play store", "mobile optimization",
  "responsive mobile", "mobile first", "touch", "gesture", "mobile navigation", "push notification"
];

const FULLSTACK_KEYWORDS = [
  "fullstack", "full-stack", "full stack", "web app", "web application", "mern", "mean", "lamp",
  "nextjs", "next.js", "nestjs", "express", "django", "rails", "laravel", "spring boot",
  "monorepo", "microservices", "api gateway", "load balancer", "reverse proxy", "authentication",
  "authorization", "jwt", "oauth", "session management", "state management", "server-side rendering",
  "client-side rendering", "static generation", "incremental static regeneration"
];

const BACKEND_KEYWORDS = [
  "server", "server-side", "rest api", "graphql", "websocket", "grpc", "database design",
  "orm", "prisma", "sequelize", "typeorm", "migration", "seeding", "indexing", "query optimization",
  "caching", "redis", "memcached", "message queue", "rabbitmq", "kafka", "event driven",
  "saga pattern", "cqrs", "domain driven design", "clean architecture", "hexagonal architecture"
];

const FRONTEND_KEYWORDS = [
  "ui", "ux", "user interface", "component", "jsx", "tsx", "css", "scss", "tailwind",
  "styled-components", "emotion", "chakra", "material-ui", "shadcn", "state management",
  "redux", "zustand", "recoil", "jotai", "form", "validation", "animation", "transition",
  "responsive", "mobile-first", "accessibility", "a11y", "seo", "performance optimization"
];

const DEVOPS_KEYWORDS = [
  "deployment", "ci/cd", "pipeline", "jenkins", "github actions", "gitlab ci", "circleci",
  "kubernetes", "k8s", "helm", "terraform", "ansible", "cloudformation", "infrastructure as code",
  "containerization", "orchestration", "monitoring", "logging", "prometheus", "grafana",
  "elk stack", "splunk", "datadog", "new relic", "cloud", "aws", "azure", "gcp"
];

const DATABASE_KEYWORDS = [
  "database", "sql", "nosql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
  "cassandra", "dynamodb", "firestore", "supabase", "planetscale", "neon", "schema design",
  "normalization", "denormalization", "indexing", "query optimization", "transaction",
  "acid", "cap theorem", "replication", "sharding", "partitioning"
];

const ALGORITHM_KEYWORDS = [
  "algorithm", "data structure", "complexity", "big o", "time complexity", "space complexity",
  "sorting", "searching", "tree", "graph", "dynamic programming", "greedy", "divide and conquer",
  "backtracking", "recursion", "iteration", "hash table", "linked list", "stack", "queue",
  "heap", "binary search", "dfs", "bfs", "dijkstra", "bellman-ford", "floyd-warshall",
  "kruskal", "prim", "topological sort", "trie", "segment tree", "fenwick tree"
];

const SECURITY_KEYWORDS = [
  "security", "authentication", "authorization", "encryption", "hashing", "salt", "bcrypt",
  "jwt", "oauth", "oauth2", "openid", "saml", "xss", "csrf", "sql injection", "cors",
  "https", "tls", "ssl", "certificate", "penetration testing", "vulnerability", "exploit",
  "secure coding", "owasp", "security audit", "compliance", "gdpr", "hipaa", "pci-dss"
];

const TESTING_KEYWORDS = [
  "test", "testing", "unit test", "integration test", "e2e", "end-to-end", "jest", "vitest",
  "mocha", "chai", "cypress", "playwright", "selenium", "test coverage", "mocking", "stubbing",
  "test driven development", "tdd", "behavior driven development", "bdd", "assertion",
  "test suite", "test case", "regression testing", "smoke testing", "performance testing"
];

const WEBDEV_KEYWORDS = [
  "web", "website", "web development", "frontend", "backend", "html", "css", "javascript",
  "responsive", "spa", "single page application", "pwa", "progressive web app", "ssr",
  "csr", "ssg", "jamstack", "headless cms", "static site", "dynamic site"
];

const AGENT_KEYWORDS = [
  "agent", "agentic", "workflow", "automation", "multi-step", "tool use", "function calling",
  "autonomous", "orchestration", "pipeline", "chain", "sequential", "langchain", "autogen",
  "crew", "agent framework", "task planning", "reasoning loop", "reflection", "self-correction"
];

const MULTILINGUAL_KEYWORDS = [
  "translate", "translation", "chinese", "japanese", "korean", "indonesian", "spanish", "french",
  "bahasa", "mandarin", "cantonese", "multilingual", "language", "localization", "i18n", "l10n",
  "bilingual", "polyglot", "cross-lingual", "language detection", "transcription"
];

const CREATIVE_KEYWORDS = [
  "write story", "create poem", "generate text", "creative writing", "imagine", "storytelling",
  "narrative", "plot", "character", "novel", "fiction", "screenplay", "dialogue", "article", "blog",
  "content creation", "copywriting", "marketing copy", "slogan", "tagline", "world building",
  "character development", "scene description", "prose", "poetry", "verse", "haiku", "sonnet"
];

const SEARCH_KEYWORDS = [
  "latest", "current", "recent", "today", "news", "trending", "new", "update", "release",
  "when did", "when does", "when will", "search", "find", "look up", "what's happening",
  "real-time", "live", "now", "breaking", "just announced", "recently released", "upcoming"
];

const GREETING_KEYWORDS = [
  "hi", "hello", "hey", "halo", "good morning", "good afternoon", "good evening",
  "what's up", "how are you", "apa kabar", "thanks", "thank you", "terima kasih",
  "sup", "yo", "greetings", "howdy", "bonjour", "hola", "ciao", "namaste"
];

const REASONING_KEYWORDS = [
  "why", "how does", "explain", "analyze", "compare", "evaluate", "assess", "understand",
  "philosophical", "theoretical", "conceptual", "abstract", "pros and cons", "advantages", "disadvantages",
  "reasoning", "logic", "deduction", "induction", "inference", "conclusion", "premise", "argument",
  "critical thinking", "analysis", "synthesis", "evaluation", "interpretation"
];

const ARCHITECTURE_KEYWORDS = [
  "architecture", "design pattern", "system design", "scalability", "high availability", "fault tolerance",
  "distributed system", "microservices", "monolith", "service mesh", "api design", "rest", "graphql",
  "event sourcing", "cqrs", "saga", "circuit breaker", "bulkhead", "rate limiting", "throttling",
  "load balancing", "caching strategy", "database architecture", "multi-tenancy", "serverless"
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

function extractLanguages(text: string): string[] {
  const languages: string[] = [];
  const langPatterns: Record<string, RegExp[]> = {
    javascript: [/\bjs\b/i, /javascript/i, /node\.?js/i, /npm/i, /yarn/i],
    typescript: [/typescript/i, /\bts\b/i, /\.tsx?\b/i],
    python: [/python/i, /\bpy\b/i, /django/i, /flask/i, /fastapi/i],
    java: [/\bjava\b/i, /spring/i, /maven/i, /gradle/i],
    rust: [/rust/i, /cargo/i, /rustc/i],
    golang: [/\bgo\b/i, /golang/i],
    kotlin: [/kotlin/i],
    swift: [/swift/i, /swiftui/i],
    cpp: [/c\+\+/i, /\bcpp\b/i],
    csharp: [/c#/i, /csharp/i, /\.net/i],
    php: [/php/i, /laravel/i, /symfony/i],
    ruby: [/ruby/i, /rails/i],
  };

  for (const [lang, patterns] of Object.entries(langPatterns)) {
    if (patterns.some(pattern => pattern.test(text))) {
      languages.push(lang);
    }
  }

  return languages;
}

function extractFrameworks(text: string): string[] {
  const frameworks: string[] = [];
  const fwPatterns: Record<string, RegExp[]> = {
    react: [/react/i, /\bjsx\b/i, /\btsx\b/i],
    vue: [/vue/i, /nuxt/i],
    angular: [/angular/i],
    svelte: [/svelte/i, /sveltekit/i],
    nextjs: [/next\.?js/i, /next\s+js/i],
    nestjs: [/nest\.?js/i],
    express: [/express/i, /express\.js/i],
    fastify: [/fastify/i],
    django: [/django/i],
    flask: [/flask/i],
    rails: [/rails/i, /ruby on rails/i],
    laravel: [/laravel/i],
    spring: [/spring/i, /spring boot/i],
    flutter: [/flutter/i, /dart/i],
    "react-native": [/react native/i, /react-native/i],
  };

  for (const [fw, patterns] of Object.entries(fwPatterns)) {
    if (patterns.some(pattern => pattern.test(text))) {
      frameworks.push(fw);
    }
  }

  return frameworks;
}

function extractTechnologies(text: string): string[] {
  const technologies: string[] = [];
  const techPatterns: Record<string, RegExp[]> = {
    docker: [/docker/i, /container/i],
    kubernetes: [/kubernetes/i, /\bk8s\b/i],
    aws: [/\baws\b/i, /amazon web services/i],
    gcp: [/\bgcp\b/i, /google cloud/i],
    azure: [/azure/i, /microsoft azure/i],
    postgresql: [/postgres/i, /postgresql/i],
    mongodb: [/mongo/i, /mongodb/i],
    redis: [/redis/i],
    graphql: [/graphql/i],
    grpc: [/grpc/i],
    websocket: [/websocket/i, /\bws\b/i],
    rest: [/rest api/i, /restful/i],
    git: [/\bgit\b/i, /github/i, /gitlab/i],
    ci: [/ci\/cd/i, /continuous integration/i],
    terraform: [/terraform/i],
    ansible: [/ansible/i],
  };

  for (const [tech, patterns] of Object.entries(techPatterns)) {
    if (patterns.some(pattern => pattern.test(text))) {
      technologies.push(tech);
    }
  }

  return technologies;
}

function calculateSemanticDepth(message: string, keywords: string[]): number {
  const words = message.split(/\s+/).length;
  const sentences = message.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / Math.max(1, sentences);
  const keywordDensity = keywords.length / Math.max(1, words);
  const hasQuestions = /\?/.test(message);
  const hasCodeBlock = /```/.test(message);
  const hasLists = /^\s*[-*•]\s/m.test(message);
  
  let depth = 0;
  
  if (avgWordsPerSentence > 20) depth += 2;
  else if (avgWordsPerSentence > 15) depth += 1;
  
  if (keywordDensity > 0.15) depth += 3;
  else if (keywordDensity > 0.10) depth += 2;
  else if (keywordDensity > 0.05) depth += 1;
  
  if (hasQuestions) depth += 1;
  if (hasCodeBlock) depth += 2;
  if (hasLists) depth += 1;
  if (sentences > 5) depth += 1;
  if (words > 100) depth += 2;
  
  return Math.min(10, depth);
}

function analyzeQuery(message: string): QueryAnalysis {
  const lower = message.toLowerCase();
  const words = message.split(/\s+/).length;
  
  let type: QueryType = "conversation";
  const subTypes: QueryType[] = [];
  let complexity: Complexity = "simple";
  let needsSearch = false;
  let needsCoding = false;
  let needsCreativity = false;
  let isMultilingual = false;
  let needsMobile = false;
  let needsFullstack = false;
  let needsAgentic = false;
  let needsWebdev = false;
  let needsBackend = false;
  let needsFrontend = false;
  let needsDevops = false;
  let needsDatabase = false;
  let needsAlgorithm = false;
  let needsSecurity = false;
  let needsTesting = false;
  const keywords: string[] = [];
  let confidence = 0.5;
  let priority: "low" | "medium" | "high" | "critical" = "medium";
  let requiresPrecision = false;
  let requiresSpeed = false;
  let multiStep = false;
  let longContext = false;

  const codingScore = containsKeywords(message, CODING_KEYWORDS);
  const mobileScore = containsKeywords(message, MOBILE_KEYWORDS);
  const fullstackScore = containsKeywords(message, FULLSTACK_KEYWORDS);
  const backendScore = containsKeywords(message, BACKEND_KEYWORDS);
  const frontendScore = containsKeywords(message, FRONTEND_KEYWORDS);
  const devopsScore = containsKeywords(message, DEVOPS_KEYWORDS);
  const databaseScore = containsKeywords(message, DATABASE_KEYWORDS);
  const algorithmScore = containsKeywords(message, ALGORITHM_KEYWORDS);
  const securityScore = containsKeywords(message, SECURITY_KEYWORDS);
  const testingScore = containsKeywords(message, TESTING_KEYWORDS);
  const webdevScore = containsKeywords(message, WEBDEV_KEYWORDS);
  const agentScore = containsKeywords(message, AGENT_KEYWORDS);
  const multilingualScore = containsKeywords(message, MULTILINGUAL_KEYWORDS);
  const creativeScore = containsKeywords(message, CREATIVE_KEYWORDS);
  const searchScore = containsKeywords(message, SEARCH_KEYWORDS);
  const greetingScore = containsKeywords(message, GREETING_KEYWORDS);
  const reasoningScore = containsKeywords(message, REASONING_KEYWORDS);
  const architectureScore = containsKeywords(message, ARCHITECTURE_KEYWORDS);

  const hasCodeBlock = /```/.test(message);
  const hasMultilingualChars = /[\u4e00-\u9fa5]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uac00-\ud7af]/.test(message);
  const hasMultipleSteps = /step|steps|first|second|then|next|finally|after that/i.test(message);
  const hasPrecisionWords = /exact|precise|accurate|correct|specific|detailed/i.test(message);
  const hasSpeedWords = /quick|fast|asap|urgent|immediately|now/i.test(message);

  const languages = extractLanguages(message);
  const frameworks = extractFrameworks(message);
  const technologies = extractTechnologies(message);

  if (greetingScore > 0 && words <= 10 && codingScore === 0) {
    type = "greeting";
    complexity = "trivial";
    confidence = 0.95;
    requiresSpeed = true;
    priority = "low";
  } else if (codingScore >= 2 || hasCodeBlock) {
    type = "coding";
    needsCoding = true;
    confidence = 0.9;
    keywords.push("coding");
    requiresPrecision = true;
    
    if (mobileScore > 0) {
      needsMobile = true;
      subTypes.push("mobile");
      keywords.push("mobile");
      confidence = 0.95;
    }
    
    if (fullstackScore > 0) {
      needsFullstack = true;
      subTypes.push("fullstack");
      keywords.push("fullstack");
      confidence = 0.95;
    }
    
    if (mobileScore > 0 && fullstackScore > 0) {
      type = "mobileFullstack";
      confidence = 0.98;
      priority = "high";
    }
    
    if (backendScore > 0) {
      needsBackend = true;
      subTypes.push("backend");
      keywords.push("backend");
    }
    
    if (frontendScore > 0) {
      needsFrontend = true;
      subTypes.push("frontend");
      keywords.push("frontend");
    }
    
    if (webdevScore > 0) {
      needsWebdev = true;
      subTypes.push("webdev");
      keywords.push("webdev");
    }
    
    if (devopsScore > 0) {
      needsDevops = true;
      subTypes.push("devops");
      keywords.push("devops");
    }
    
    if (databaseScore > 0) {
      needsDatabase = true;
      subTypes.push("database");
      keywords.push("database");
    }
    
    if (algorithmScore >= 2) {
      needsAlgorithm = true;
      subTypes.push("algorithm");
      keywords.push("algorithm");
      requiresPrecision = true;
    }
    
    if (securityScore > 0) {
      needsSecurity = true;
      subTypes.push("security");
      keywords.push("security");
      requiresPrecision = true;
      priority = "high";
    }
    
    if (testingScore > 0) {
      needsTesting = true;
      subTypes.push("testing");
      keywords.push("testing");
    }
    
    if (architectureScore >= 2) {
      subTypes.push("architecture");
      keywords.push("architecture");
      requiresPrecision = true;
      priority = "high";
    }
    
    if (agentScore > 0) {
      needsAgentic = true;
      type = "agentic";
      subTypes.push("agentic");
      keywords.push("agentic");
      confidence = 0.95;
      multiStep = true;
      priority = "high";
    }
    
    if (words > 150 || hasCodeBlock) {
      complexity = "advanced";
      priority = "critical";
    } else if (words > 100) {
      complexity = "expert";
      priority = "high";
    } else if (words > 60) {
      complexity = "complex";
    } else if (words > 25) {
      complexity = "medium";
    } else {
      complexity = "simple";
    }
    
    if (hasCodeBlock) {
      complexity = complexity === "simple" ? "medium" : complexity === "medium" ? "complex" : complexity;
    }
    
  } else if (creativeScore >= 2) {
    type = "creative";
    needsCreativity = true;
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    confidence = 0.85;
    keywords.push("creative");
    priority = "medium";
  } else if (reasoningScore >= 2 || architectureScore >= 1) {
    type = "reasoning";
    subTypes.push("reasoning");
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    confidence = 0.8;
    keywords.push("reasoning");
    requiresPrecision = true;
    priority = "medium";
    
    if (architectureScore >= 2) {
      subTypes.push("architecture");
      complexity = "expert";
      priority = "high";
    }
  } else if (searchScore >= 2) {
    type = "information";
    needsSearch = true;
    complexity = "medium";
    confidence = 0.85;
    keywords.push("search", "current");
    priority = "medium";
  } else {
    type = "conversation";
    complexity = words > 80 ? "complex" : words > 40 ? "medium" : "simple";
    confidence = 0.6;
    priority = "low";
  }

  if (multilingualScore > 0 || hasMultilingualChars) {
    isMultilingual = true;
    subTypes.push("multilingual");
    keywords.push("multilingual");
    confidence = Math.min(0.98, confidence + 0.1);
  }

  if (searchScore > 0 && type !== "information") {
    needsSearch = true;
  }

  if (hasMultipleSteps) {
    multiStep = true;
    complexity = complexity === "simple" ? "medium" : complexity === "medium" ? "complex" : complexity;
  }

  if (hasPrecisionWords) {
    requiresPrecision = true;
  }

  if (hasSpeedWords) {
    requiresSpeed = true;
    priority = priority === "low" ? "medium" : priority === "medium" ? "high" : priority;
  }

  if (words > 200 || message.length > 1500) {
    longContext = true;
  }

  const estimatedTokens = Math.ceil(words * 1.3);
  const contextComplexity = Math.ceil((words / 50) + (subTypes.length * 0.5));
  const semanticDepth = calculateSemanticDepth(message, keywords);

  if (semanticDepth >= 7) {
    complexity = complexity === "simple" ? "complex" : complexity === "medium" ? "expert" : "advanced";
  }

  return {
    type,
    subTypes,
    complexity,
    needsSearch,
    needsCoding,
    needsCreativity,
    isMultilingual,
    needsMobile,
    needsFullstack,
    needsAgentic,
    needsWebdev,
    needsBackend,
    needsFrontend,
    needsDevops,
    needsDatabase,
    needsAlgorithm,
    needsSecurity,
    needsTesting,
    estimatedTokens,
    keywords,
    confidence,
    priority,
    languages,
    frameworks,
    technologies,
    contextComplexity,
    semanticDepth,
    requiresPrecision,
    requiresSpeed,
    multiStep,
    longContext,
  };
}

function scoreProvider(
  provider: ProviderType,
  analysis: QueryAnalysis,
  status: ProviderStatus
): ProviderScore {
  const caps = PROVIDER_CAPABILITIES[provider];
  const now = Date.now();

  const breakdown = {
    capabilityScore: 0,
    reliabilityScore: 0,
    performanceScore: 0,
    contextScore: 0,
    specialtyBonus: 0,
    penaltyScore: 0,
  };

  const reasoning: string[] = [];

  if (status.cooldownUntil && status.cooldownUntil > now) {
    return {
      provider,
      score: -1000,
      breakdown,
      reasoning: ["Provider in cooldown period"],
    };
  }

  if (status.consecutiveFailures >= 4) {
    breakdown.penaltyScore -= 600;
    reasoning.push(`${status.consecutiveFailures} consecutive failures`);
  } else if (status.consecutiveFailures >= 3) {
    breakdown.penaltyScore -= 400;
    reasoning.push("Multiple recent failures");
  }

  if (status.hourResetTime < now) {
    status.lastHourRequests = 0;
    status.hourResetTime = now + 3600000;
  }

  const rateLimitUsage = status.lastHourRequests / caps.rateLimit;
  if (rateLimitUsage > 0.9) {
    breakdown.penaltyScore -= 200;
    reasoning.push("Near rate limit");
  } else if (rateLimitUsage > 0.7) {
    breakdown.penaltyScore -= 100;
    reasoning.push("High rate limit usage");
  }

  if (analysis.type === "greeting" || analysis.complexity === "trivial") {
    breakdown.capabilityScore += caps.speed * 30;
    breakdown.capabilityScore += caps.cost * 25;
    reasoning.push("Optimized for speed and cost");
  } else if (analysis.needsCoding) {
    breakdown.capabilityScore += caps.coding * 35;
    breakdown.capabilityScore += caps.quality * 25;
    reasoning.push("Strong coding capability");
    
    if (analysis.needsMobile) {
      breakdown.capabilityScore += caps.mobile * 40;
      reasoning.push("Mobile development expertise");
    }
    
    if (analysis.needsFullstack) {
      breakdown.capabilityScore += caps.fullstack * 35;
      reasoning.push("Full-stack development capability");
    }
    
    if (analysis.needsBackend) {
      breakdown.capabilityScore += caps.backend * 30;
      reasoning.push("Backend specialization");
    }
    
    if (analysis.needsFrontend) {
      breakdown.capabilityScore += caps.frontend * 30;
      reasoning.push("Frontend specialization");
    }
    
    if (analysis.needsWebdev) {
      breakdown.capabilityScore += caps.webdev * 30;
      reasoning.push("Web development expertise");
    }
    
    if (analysis.needsDevops) {
      breakdown.capabilityScore += caps.devops * 35;
      reasoning.push("DevOps capability");
    }
    
    if (analysis.needsDatabase) {
      breakdown.capabilityScore += caps.database * 30;
      reasoning.push("Database expertise");
    }
    
    if (analysis.needsAlgorithm) {
      breakdown.capabilityScore += caps.algorithm * 40;
      reasoning.push("Algorithm design strength");
    }
    
    if (analysis.needsSecurity) {
      breakdown.capabilityScore += caps.security * 40;
      reasoning.push("Security expertise");
    }
    
    if (analysis.needsTesting) {
      breakdown.capabilityScore += caps.testing * 25;
      reasoning.push("Testing capability");
    }
    
    if (analysis.needsAgentic) {
      breakdown.capabilityScore += caps.agentic * 45;
      reasoning.push("Agentic workflow support");
    }
    
    if (analysis.type === "mobileFullstack") {
      breakdown.specialtyBonus += 50;
      reasoning.push("Mobile + Full-stack combo bonus");
    }
  } else if (analysis.needsCreativity) {
    breakdown.capabilityScore += caps.creative * 35;
    breakdown.capabilityScore += caps.quality * 25;
    reasoning.push("Creative writing capability");
  } else if (analysis.type === "reasoning") {
    breakdown.capabilityScore += caps.reasoning * 35;
    breakdown.capabilityScore += caps.quality * 25;
    reasoning.push("Strong reasoning ability");
  } else if (analysis.type === "agentic") {
    breakdown.capabilityScore += caps.agentic * 40;
    breakdown.capabilityScore += caps.reasoning * 30;
    reasoning.push("Agentic task handling");
  } else {
    breakdown.capabilityScore += caps.quality * 25;
    breakdown.capabilityScore += caps.speed * 20;
  }

  if (analysis.needsSearch) {
    if (caps.hasSearch) {
      breakdown.capabilityScore += 50;
      reasoning.push("Search capability available");
    } else {
      breakdown.penaltyScore -= 40;
      reasoning.push("No search capability");
    }
  }

  if (analysis.isMultilingual) {
    breakdown.capabilityScore += caps.multilingual * 20;
    if (caps.multilingual >= 5) {
      reasoning.push("Excellent multilingual support");
    }
  }

  if (analysis.longContext || analysis.estimatedTokens > 30000) {
    if (caps.contextWindow >= 200000) {
      breakdown.contextScore += 60;
      reasoning.push("Excellent long context handling");
    } else if (caps.contextWindow >= 128000) {
      breakdown.contextScore += 40;
      reasoning.push("Good long context support");
    } else if (caps.contextWindow >= 64000) {
      breakdown.contextScore += 20;
    } else {
      breakdown.penaltyScore -= 30;
      reasoning.push("Limited context window");
    }
  }

  if (analysis.estimatedTokens > 50000 && caps.contextWindow < 100000) {
    breakdown.penaltyScore -= 50;
    reasoning.push("Context window may be insufficient");
  }

  const complexityMatch = caps.optimalComplexity.includes(analysis.complexity);
  if (complexityMatch) {
    breakdown.specialtyBonus += 40;
    reasoning.push(`Optimal for ${analysis.complexity} tasks`);
  } else {
    if (analysis.complexity === "advanced" && !caps.optimalComplexity.includes("expert")) {
      breakdown.penaltyScore -= 30;
    } else if (analysis.complexity === "trivial" && caps.optimalComplexity.includes("expert")) {
      breakdown.penaltyScore -= 20;
      reasoning.push("Overqualified for simple task");
    }
  }

  if (caps.specialties.includes(analysis.type)) {
    breakdown.specialtyBonus += 40;
    reasoning.push(`Specialty: ${analysis.type}`);
  }

  analysis.subTypes.forEach(subType => {
    if (caps.specialties.includes(subType)) {
      breakdown.specialtyBonus += 25;
      reasoning.push(`Specialty: ${subType}`);
    }
  });

  const languageMatch = analysis.languages.some(lang => 
    caps.bestFor.some(bf => bf.toLowerCase().includes(lang.toLowerCase()))
  );
  if (languageMatch) {
    breakdown.specialtyBonus += 30;
    reasoning.push("Language expertise match");
  }

  const frameworkMatch = analysis.frameworks.some(fw => 
    caps.bestFor.some(bf => bf.toLowerCase().includes(fw.toLowerCase()))
  );
  if (frameworkMatch) {
    breakdown.specialtyBonus += 25;
    reasoning.push("Framework expertise match");
  }

  const hasWeakness = caps.weaknesses.some(weakness => 
    analysis.keywords.some(kw => weakness.toLowerCase().includes(kw.toLowerCase())) ||
    analysis.type.toLowerCase().includes(weakness.toLowerCase())
  );
  if (hasWeakness) {
    breakdown.penaltyScore -= 35;
    reasoning.push("Query matches provider weakness");
  }

  if (analysis.complexity === "expert" || analysis.complexity === "advanced") {
    breakdown.capabilityScore += caps.quality * 20;
    breakdown.penaltyScore -= caps.speed * 5;
  }

  if (analysis.requiresSpeed) {
    breakdown.performanceScore += caps.speed * 25;
    reasoning.push("Speed prioritized");
  }

  if (analysis.requiresPrecision) {
    breakdown.performanceScore += caps.quality * 20;
    reasoning.push("Precision prioritized");
  }

  if (analysis.multiStep) {
    breakdown.capabilityScore += caps.reasoning * 15;
    breakdown.capabilityScore += caps.agentic * 20;
  }

  const totalAttempts = status.successes + status.failures;
  if (totalAttempts > 0) {
    const successRate = status.successes / totalAttempts;
    breakdown.reliabilityScore += successRate * 50;
    
    if (successRate > 0.9) {
      reasoning.push("Excellent reliability (>90%)");
    } else if (successRate > 0.7) {
      reasoning.push("Good reliability");
    } else if (successRate < 0.5) {
      reasoning.push("Poor reliability");
    }
  }

  const taskSuccess = status.taskSuccessRate.get(analysis.type);
  if (taskSuccess !== undefined && taskSuccess > 0) {
    breakdown.reliabilityScore += taskSuccess * 40;
    if (taskSuccess > 0.8) {
      reasoning.push(`High success rate for ${analysis.type} tasks`);
    }
  }

  const complexityPerf = status.complexityPerformance.get(analysis.complexity);
  if (complexityPerf !== undefined && complexityPerf > 0) {
    breakdown.reliabilityScore += complexityPerf * 30;
  }

  if (status.lastSuccessTime) {
    const timeSinceSuccess = now - status.lastSuccessTime;
    if (timeSinceSuccess < 60000) {
      breakdown.performanceScore += 25;
      reasoning.push("Recent successful execution");
    } else if (timeSinceSuccess < 300000) {
      breakdown.performanceScore += 15;
    }
  }

  if (status.avgResponseTime > 0) {
    if (status.avgResponseTime < 1500) {
      breakdown.performanceScore += 30;
      reasoning.push("Very fast average response");
    } else if (status.avgResponseTime < 3000) {
      breakdown.performanceScore += 20;
      reasoning.push("Fast average response");
    } else if (status.avgResponseTime < 5000) {
      breakdown.performanceScore += 10;
    } else {
      breakdown.penaltyScore -= 10;
    }
  }

  if (status.recentPerformance.length >= 5) {
    const recentAvg = status.recentPerformance.reduce((a, b) => a + b, 0) / status.recentPerformance.length;
    if (recentAvg > 0.8) {
      breakdown.reliabilityScore += 20;
      reasoning.push("Strong recent performance");
    } else if (recentAvg < 0.4) {
      breakdown.penaltyScore -= 20;
      reasoning.push("Weak recent performance");
    }
  }

  breakdown.performanceScore += caps.cost * 10;

  if (analysis.priority === "critical") {
    breakdown.reliabilityScore *= 1.3;
    breakdown.capabilityScore *= 1.2;
  } else if (analysis.priority === "high") {
    breakdown.reliabilityScore *= 1.2;
    breakdown.capabilityScore *= 1.1;
  }

  const confidenceMultiplier = 0.7 + (analysis.confidence * 0.3);
  
  let totalScore = 
    breakdown.capabilityScore +
    breakdown.reliabilityScore +
    breakdown.performanceScore +
    breakdown.contextScore +
    breakdown.specialtyBonus +
    breakdown.penaltyScore;

  totalScore *= confidenceMultiplier;

  if (analysis.semanticDepth >= 8) {
    totalScore *= 1.1;
  }

  totalScore = Math.max(0, totalScore);

  return {
    provider,
    score: totalScore,
    breakdown,
    reasoning: reasoning.slice(0, 5),
  };
}

function getRankedProviders(analysis: QueryAnalysis): ProviderType[] {
  const providers = Object.keys(PROVIDER_CAPABILITIES) as ProviderType[];
  
  const scored = providers.map(provider => 
    scoreProvider(provider, analysis, providerStatus[provider])
  );

  scored.sort((a, b) => b.score - a.score);

  const validProviders = scored.filter(p => p.score > 0);

  if (validProviders.length > 0) {
    console.log(`[Smart Router] Top provider: ${validProviders[0].provider} (score: ${validProviders[0].score.toFixed(2)})`);
    console.log(`[Smart Router] Reasoning:`, validProviders[0].reasoning);
  }

  return validProviders.map(p => p.provider);
}

function recordSuccess(provider: ProviderType, responseTime: number, queryType: QueryType, complexity: Complexity) {
  const status = providerStatus[provider];
  status.successes++;
  status.totalRequests++;
  status.lastHourRequests++;
  status.lastSuccessTime = Date.now();
  status.consecutiveFailures = 0;
  
  if (status.avgResponseTime === 0) {
    status.avgResponseTime = responseTime;
  } else {
    status.avgResponseTime = (status.avgResponseTime * 0.8) + (responseTime * 0.2);
  }

  const currentTaskRate = status.taskSuccessRate.get(queryType) || 0;
  status.taskSuccessRate.set(queryType, currentTaskRate * 0.85 + 1.0 * 0.15);

  const currentComplexityRate = status.complexityPerformance.get(complexity) || 0;
  status.complexityPerformance.set(complexity, currentComplexityRate * 0.85 + 1.0 * 0.15);

  status.recentPerformance.push(1);
  if (status.recentPerformance.length > 10) {
    status.recentPerformance.shift();
  }
}

function recordFailure(provider: ProviderType, isRateLimit: boolean = false, queryType?: QueryType, complexity?: Complexity) {
  const status = providerStatus[provider];
  status.failures++;
  status.totalRequests++;
  status.lastHourRequests++;
  status.lastFailTime = Date.now();
  status.consecutiveFailures++;

  if (queryType) {
    const currentTaskRate = status.taskSuccessRate.get(queryType) || 0.5;
    status.taskSuccessRate.set(queryType, currentTaskRate * 0.85);
  }

  if (complexity) {
    const currentComplexityRate = status.complexityPerformance.get(complexity) || 0.5;
    status.complexityPerformance.set(complexity, currentComplexityRate * 0.85);
  }

  status.recentPerformance.push(0);
  if (status.recentPerformance.length > 10) {
    status.recentPerformance.shift();
  }

  if (isRateLimit) {
    status.cooldownUntil = Date.now() + 90000;
  } else if (status.consecutiveFailures >= 4) {
    status.cooldownUntil = Date.now() + 120000;
  } else if (status.consecutiveFailures >= 3) {
    status.cooldownUntil = Date.now() + 60000;
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

async function tryProviderWithAdaptiveRacing(
  providers: ProviderType[],
  message: string,
  history: any[],
  persona: string | undefined,
  analysis: QueryAnalysis
): Promise<{ reply: string; provider: ProviderType; responseTime: number }> {
  
  if (providers.length === 0) {
    throw new Error("No providers available");
  }

  const maxParallel = analysis.priority === "critical" ? 3 : 
                      analysis.priority === "high" ? 2 : 
                      analysis.requiresSpeed ? 3 : 1;

  const topProviders = providers.slice(0, Math.min(maxParallel, providers.length));
  
  if (topProviders.length === 1 || !analysis.requiresSpeed) {
    const startTime = Date.now();
    try {
      const result = await askAI(topProviders[0], message, history, persona);
      const responseTime = Date.now() - startTime;
      recordSuccess(topProviders[0], responseTime, analysis.type, analysis.complexity);
      return { reply: result.reply, provider: topProviders[0], responseTime };
    } catch (error: any) {
      const isRateLimit = 
        error instanceof OpenAIRateLimitError || error instanceof OpenAIQuotaError ||
        error instanceof KimiRateLimitError || error instanceof KimiQuotaError ||
        error instanceof GlmRateLimitError || error instanceof GlmQuotaError ||
        error instanceof ClaudeRateLimitError || error instanceof ClaudeQuotaError ||
        error instanceof CohereRateLimitError || error instanceof CohereQuotaError ||
        error instanceof DeepSeekRateLimitError || error instanceof DeepSeekQuotaError ||
        error instanceof QwenRateLimitError || error instanceof QwenQuotaError ||
        error instanceof GptOssRateLimitError || error instanceof GptOssQuotaError ||
        error instanceof CompoundRateLimitError || error instanceof CompoundQuotaError ||
        error instanceof LlamaRateLimitError || error instanceof LlamaQuotaError ||
        error instanceof MistralRateLimitError || error instanceof MistralQuotaError ||
        error instanceof MimoRateLimitError || error instanceof MimoQuotaError ||
        error instanceof MinimaxRateLimitError || error instanceof MinimaxQuotaError ||
        error.name?.includes("RateLimit") || error.name?.includes("Quota");
      
      recordFailure(topProviders[0], isRateLimit, analysis.type, analysis.complexity);
      
      const remainingProviders = providers.slice(1);
      if (remainingProviders.length > 0) {
        console.log(`[Smart Router] ${topProviders[0]} failed, trying next provider`);
        return tryProviderWithAdaptiveRacing(remainingProviders, message, history, persona, analysis);
      }
      throw error;
    }
  }

  const racePromises = topProviders.map(async (provider) => {
    const startTime = Date.now();
    try {
      const result = await askAI(provider, message, history, persona);
      const responseTime = Date.now() - startTime;
      recordSuccess(provider, responseTime, analysis.type, analysis.complexity);
      return { reply: result.reply, provider, responseTime };
    } catch (error: any) {
      const isRateLimit = 
        error instanceof OpenAIRateLimitError || error instanceof OpenAIQuotaError ||
        error instanceof KimiRateLimitError || error instanceof KimiQuotaError ||
        error instanceof GlmRateLimitError || error instanceof GlmQuotaError ||
        error instanceof ClaudeRateLimitError || error instanceof ClaudeQuotaError ||
        error instanceof CohereRateLimitError || error instanceof CohereQuotaError ||
        error instanceof DeepSeekRateLimitError || error instanceof DeepSeekQuotaError ||
        error instanceof QwenRateLimitError || error instanceof QwenQuotaError ||
        error instanceof GptOssRateLimitError || error instanceof GptOssQuotaError ||
        error instanceof CompoundRateLimitError || error instanceof CompoundQuotaError ||
        error instanceof LlamaRateLimitError || error instanceof LlamaQuotaError ||
        error instanceof MistralRateLimitError || error instanceof MistralQuotaError ||
        error instanceof MimoRateLimitError || error instanceof MimoQuotaError ||
        error instanceof MinimaxRateLimitError || error instanceof MinimaxQuotaError ||
        error.name?.includes("RateLimit") || error.name?.includes("Quota");
      
      recordFailure(provider, isRateLimit, analysis.type, analysis.complexity);
      throw error;
    }
  });

  try {
    const result = await Promise.race(racePromises);
    console.log(`[Smart Router] Race won by ${result.provider} in ${result.responseTime}ms`);
    return result;
  } catch (error) {
    const remainingProviders = providers.slice(maxParallel);
    if (remainingProviders.length > 0) {
      console.log(`[Smart Router] All racing providers failed, trying remaining providers`);
      return tryProviderWithAdaptiveRacing(remainingProviders, message, history, persona, analysis);
    }
    throw error;
  }
}

function generateAnalysisReport(analysis: QueryAnalysis): string {
  const parts: string[] = [];
  
  parts.push(`Type: ${analysis.type}`);
  if (analysis.subTypes.length > 0) {
    parts.push(`SubTypes: ${analysis.subTypes.join(", ")}`);
  }
  parts.push(`Complexity: ${analysis.complexity}`);
  parts.push(`Priority: ${analysis.priority}`);
  parts.push(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
  
  const features: string[] = [];
  if (analysis.needsCoding) features.push("coding");
  if (analysis.needsMobile) features.push("mobile");
  if (analysis.needsFullstack) features.push("fullstack");
  if (analysis.needsBackend) features.push("backend");
  if (analysis.needsFrontend) features.push("frontend");
  if (analysis.needsWebdev) features.push("webdev");
  if (analysis.needsDevops) features.push("devops");
  if (analysis.needsDatabase) features.push("database");
  if (analysis.needsAlgorithm) features.push("algorithm");
  if (analysis.needsSecurity) features.push("security");
  if (analysis.needsTesting) features.push("testing");
  if (analysis.needsAgentic) features.push("agentic");
  if (analysis.needsSearch) features.push("search");
  if (analysis.needsCreativity) features.push("creative");
  if (analysis.isMultilingual) features.push("multilingual");
  if (analysis.multiStep) features.push("multi-step");
  if (analysis.longContext) features.push("long-context");
  if (analysis.requiresPrecision) features.push("precision");
  if (analysis.requiresSpeed) features.push("speed");
  
  if (features.length > 0) {
    parts.push(`Features: ${features.join(", ")}`);
  }
  
  if (analysis.languages.length > 0) {
    parts.push(`Languages: ${analysis.languages.join(", ")}`);
  }
  
  if (analysis.frameworks.length > 0) {
    parts.push(`Frameworks: ${analysis.frameworks.join(", ")}`);
  }
  
  if (analysis.technologies.length > 0) {
    parts.push(`Technologies: ${analysis.technologies.join(", ")}`);
  }
  
  parts.push(`Tokens: ~${analysis.estimatedTokens}`);
  parts.push(`Semantic Depth: ${analysis.semanticDepth}/10`);
  
  return parts.join(" | ");
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

    console.log(`[Smart Router] Query: "${message.substring(0, 60)}..."`);
    console.log(`[Smart Router] Analysis: ${generateAnalysisReport(analysis)}`);
    console.log(`[Smart Router] Top 5 providers:`, rankedProviders.slice(0, 5));

    try {
      const result = await tryProviderWithAdaptiveRacing(
        rankedProviders,
        message,
        history || [],
        persona,
        analysis
      );

      console.log(`[Smart Router] ✓ Success with ${result.provider} (${result.responseTime}ms)`);
      
      const providerStats = providerStatus[result.provider];
      const successRate = providerStats.successes / Math.max(1, providerStats.successes + providerStats.failures);

      return res.status(200).json({ 
        type: "ai", 
        reply: result.reply, 
        provider: result.provider,
        responseTime: result.responseTime,
        analysis: {
          queryType: analysis.type,
          subTypes: analysis.subTypes,
          complexity: analysis.complexity,
          priority: analysis.priority,
          confidence: analysis.confidence,
          semanticDepth: analysis.semanticDepth,
          features: {
            coding: analysis.needsCoding,
            mobile: analysis.needsMobile,
            fullstack: analysis.needsFullstack,
            backend: analysis.needsBackend,
            frontend: analysis.needsFrontend,
            webdev: analysis.needsWebdev,
            devops: analysis.needsDevops,
            database: analysis.needsDatabase,
            algorithm: analysis.needsAlgorithm,
            security: analysis.needsSecurity,
            testing: analysis.needsTesting,
            agentic: analysis.needsAgentic,
            search: analysis.needsSearch,
            creative: analysis.needsCreativity,
            multilingual: analysis.isMultilingual,
          },
          languages: analysis.languages,
          frameworks: analysis.frameworks,
          technologies: analysis.technologies,
        },
        providerStats: {
          successRate: (successRate * 100).toFixed(1) + "%",
          avgResponseTime: Math.round(providerStats.avgResponseTime) + "ms",
          totalRequests: providerStats.totalRequests,
        }
      });
    } catch (err: any) {
      console.error(`[Smart Router] ✗ All providers failed:`, err.message);
      
      const failureDetails = rankedProviders.slice(0, 3).map(p => {
        const status = providerStatus[p];
        return `${p} (failures: ${status.consecutiveFailures}, cooldown: ${status.cooldownUntil ? 'yes' : 'no'})`;
      }).join(", ");
      
      console.error(`[Smart Router] Provider status:`, failureDetails);
      
      return res.status(500).json({ 
        error: "Hmph! Everything is broken right now... I-I'll fix it later! B-baka!",
        details: process.env.NODE_ENV === "development" ? {
          attemptedProviders: rankedProviders.slice(0, 5),
          errorMessage: err.message,
        } : undefined
      });
    }

  } catch (err: any) {
    console.error(`[Smart Router] Handler error:`, err);
    return res.status(500).json({ 
      error: err.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
}
