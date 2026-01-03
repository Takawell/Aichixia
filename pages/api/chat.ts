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

type QueryType = "greeting" | "coding" | "creative" | "information" | "reasoning" | "conversation" | "technical" | "multilingual" | "agentic" | "mobile" | "fullstack" | "mobileFullstack" | "webdev" | "backend" | "frontend" | "devops" | "database" | "algorithm" | "security" | "testing" | "architecture" | "mathematics" | "science" | "physics" | "chemistry" | "biology" | "medical" | "legal" | "finance" | "business" | "marketing" | "education" | "homework" | "research" | "academic" | "philosophy" | "psychology" | "history" | "geography" | "literature" | "art" | "music" | "entertainment" | "anime" | "gaming" | "sports" | "cooking" | "health" | "lifestyle" | "travel" | "shopping" | "product" | "review" | "recommendation" | "tutorial" | "howto" | "debug" | "optimization" | "dataScience" | "machineLearning" | "ai" | "blockchain" | "crypto" | "iot" | "robotics" | "embedded" | "networking" | "cloud" | "statistics" | "calculus" | "algebra" | "geometry" | "trigonometry" | "linearAlgebra" | "discreteMath" | "numberTheory" | "graphTheory" | "probability" | "linguistics" | "translation" | "writing" | "editing" | "proofreading" | "summarization" | "analysis" | "comparison" | "evaluation" | "planning" | "strategy" | "problemSolving" | "decisionMaking" | "ethics" | "social" | "cultural" | "political" | "economic" | "environmental" | "career" | "interview" | "resume" | "motivation" | "productivity" | "timeManagement" | "relationship" | "parenting" | "mental" | "emotional" | "spiritual" | "fitness" | "nutrition" | "workout" | "diet" | "recipe";

type Complexity = "trivial" | "simple" | "medium" | "complex" | "expert" | "advanced" | "genius";

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
  mathematics: number;
  science: number;
  academic: number;
  research: number;
  business: number;
  finance: number;
  legal: number;
  medical: number;
  entertainment: number;
  dataScience: number;
  machineLearning: number;
  statistics: number;
  analysis: number;
  problemSolving: number;
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
  mathQuality: number;
  scienceQuality: number;
  reasoningQuality: number;
  speedScore: number;
  reliabilityScore: number;
  costEfficiency: number;
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
  needsMathematics: boolean;
  needsScience: boolean;
  needsAcademic: boolean;
  needsResearch: boolean;
  needsBusiness: boolean;
  needsFinance: boolean;
  needsLegal: boolean;
  needsMedical: boolean;
  needsEntertainment: boolean;
  needsDataScience: boolean;
  needsMachineLearning: boolean;
  needsStatistics: boolean;
  needsCalculus: boolean;
  needsAlgebra: boolean;
  needsGeometry: boolean;
  needsProbability: boolean;
  needsPhysics: boolean;
  needsChemistry: boolean;
  needsBiology: boolean;
  needsPhilosophy: boolean;
  needsPsychology: boolean;
  needsHistory: boolean;
  needsLiterature: boolean;
  needsArt: boolean;
  needsMusic: boolean;
  needsAnime: boolean;
  needsGaming: boolean;
  needsTranslation: boolean;
  needsWriting: boolean;
  needsSummarization: boolean;
  needsAnalysis: boolean;
  needsComparison: boolean;
  needsOptimization: boolean;
  needsDebug: boolean;
  needsTutorial: boolean;
  needsRecommendation: boolean;
  needsPlanning: boolean;
  needsStrategy: boolean;
  needsProblemSolving: boolean;
  needsEthics: boolean;
  estimatedTokens: number;
  keywords: string[];
  confidence: number;
  priority: "low" | "medium" | "high" | "critical" | "urgent";
  languages: string[];
  frameworks: string[];
  technologies: string[];
  contextComplexity: number;
  semanticDepth: number;
  requiresPrecision: boolean;
  requiresSpeed: boolean;
  multiStep: boolean;
  longContext: boolean;
  academicLevel: "elementary" | "highschool" | "undergraduate" | "graduate" | "phd" | "professional";
  domain: "stem" | "humanities" | "business" | "arts" | "social" | "technical" | "general";
  tone: "casual" | "formal" | "academic" | "technical" | "creative" | "professional";
  audience: "beginner" | "intermediate" | "advanced" | "expert";
  outputFormat: "text" | "code" | "list" | "table" | "essay" | "summary" | "explanation" | "tutorial" | "comparison";
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
    domainBonus: number;
    academicBonus: number;
    penaltyScore: number;
  };
  reasoning: string[];
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
    webdev: 5,
    backend: 5,
    frontend: 5,
    devops: 4,
    database: 5,
    algorithm: 5,
    security: 4,
    testing: 4,
    mathematics: 4,
    science: 4,
    academic: 4,
    research: 4,
    business: 3,
    finance: 3,
    legal: 3,
    medical: 3,
    entertainment: 3,
    dataScience: 4,
    machineLearning: 4,
    statistics: 4,
    analysis: 5,
    problemSolving: 5,
    cost: 3,
    hasSearch: false,
    contextWindow: 131072,
    specialties: ["coding", "multilingual", "mobile", "fullstack", "agentic", "mobileFullstack", "backend", "algorithm", "architecture", "problemSolving"],
    rateLimit: 100,
    bestFor: ["rust", "java", "golang", "cpp", "kotlin", "swift", "typescript", "javascript", "android", "ios", "web3", "full-stack", "agent workflows", "multi-file edits", "code review", "multilingual code", "system design", "microservices", "api design", "complex algorithms", "mobile architecture", "cross-platform", "problem solving", "technical analysis"],
    weaknesses: ["simple queries", "fast responses needed", "search required", "creative writing", "medical advice", "legal advice"],
    optimalComplexity: ["complex", "expert", "advanced", "genius"],
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
    mathematics: 2,
    science: 2,
    academic: 2,
    research: 2,
    business: 3,
    finance: 2,
    legal: 2,
    medical: 2,
    entertainment: 4,
    dataScience: 2,
    machineLearning: 2,
    statistics: 2,
    analysis: 2,
    problemSolving: 3,
    cost: 5,
    hasSearch: false,
    contextWindow: 32768,
    specialties: ["greeting", "conversation", "multilingual", "entertainment"],
    rateLimit: 200,
    bestFor: ["fast responses", "greetings", "simple queries", "multilingual chat", "casual conversation", "quick answers", "chitchat", "basic questions", "translation", "language practice", "entertainment chat", "anime discussion", "casual advice"],
    weaknesses: ["complex coding", "deep reasoning", "technical depth", "long context", "specialized tasks", "mathematics", "science", "academic research"],
    optimalComplexity: ["trivial", "simple"],
  },
  kimi: {
    speed: 4,
    quality: 5,
    coding: 5,
    reasoning: 5,
    creative: 4,
    multilingual: 5,
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
    mathematics: 4,
    science: 4,
    academic: 5,
    research: 5,
    business: 4,
    finance: 4,
    legal: 3,
    medical: 3,
    entertainment: 3,
    dataScience: 5,
    machineLearning: 5,
    statistics: 5,
    analysis: 5,
    problemSolving: 5,
    cost: 2,
    hasSearch: true,
    contextWindow: 262144,
    specialties: ["reasoning", "coding", "technical", "agentic", "fullstack", "backend", "algorithm", "architecture", "research", "academic", "dataScience", "analysis"],
    rateLimit: 100,
    bestFor: ["complex reasoning", "tool use", "long context", "deep analysis", "technical problems", "code generation", "system architecture", "performance optimization", "large codebases", "refactoring", "technical documentation", "database design", "distributed systems", "scalability", "research papers", "academic writing", "data analysis", "machine learning", "statistical analysis", "problem solving"],
    weaknesses: ["simple greetings", "quick tasks", "very fast responses", "creative writing", "entertainment"],
    optimalComplexity: ["medium", "complex", "expert", "advanced", "genius"],
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
    mathematics: 5,
    science: 5,
    academic: 5,
    research: 5,
    business: 3,
    finance: 4,
    legal: 3,
    medical: 3,
    entertainment: 2,
    dataScience: 5,
    machineLearning: 5,
    statistics: 5,
    analysis: 5,
    problemSolving: 5,
    cost: 3,
    hasSearch: true,
    contextWindow: 64000,
    specialties: ["coding", "technical", "reasoning", "algorithm", "backend", "security", "mathematics", "science", "academic", "dataScience", "machineLearning"],
    rateLimit: 60,
    bestFor: ["code generation", "debugging", "algorithm design", "technical documentation", "code optimization", "security analysis", "code review", "performance tuning", "data structures", "computational complexity", "low-level programming", "systems programming", "compiler design", "mathematics", "calculus", "linear algebra", "statistics", "probability", "physics", "computer science", "machine learning algorithms", "deep learning", "scientific computing"],
    weaknesses: ["creative writing", "casual conversation", "multilingual", "frontend design", "entertainment", "simple queries"],
    optimalComplexity: ["medium", "complex", "expert", "advanced", "genius"],
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
    mathematics: 4,
    science: 4,
    academic: 5,
    research: 5,
    business: 5,
    finance: 4,
    legal: 5,
    medical: 4,
    entertainment: 5,
    dataScience: 4,
    machineLearning: 4,
    statistics: 4,
    analysis: 5,
    problemSolving: 5,
    cost: 1,
    hasSearch: false,
    contextWindow: 200000,
    specialties: ["creative", "reasoning", "conversation", "architecture", "academic", "research", "writing", "analysis", "philosophy", "ethics", "literature", "business"],
    rateLimit: 50,
    bestFor: ["creative writing", "long documents", "nuanced reasoning", "ethical analysis", "content creation", "narrative design", "technical writing", "documentation", "code explanation", "architectural decisions", "design patterns", "code philosophy", "best practices", "essays", "articles", "research papers", "business analysis", "strategic planning", "literature analysis", "philosophy", "ethics", "social sciences", "humanities", "legal reasoning", "policy analysis"],
    weaknesses: ["real-time search", "extremely fast responses", "rate-limited", "simple greetings", "entertainment chat"],
    optimalComplexity: ["simple", "medium", "complex", "expert", "advanced"],
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
    mathematics: 4,
    science: 4,
    academic: 4,
    research: 5,
    business: 5,
    finance: 5,
    legal: 4,
    medical: 4,
    entertainment: 3,
    dataScience: 5,
    machineLearning: 4,
    statistics: 5,
    analysis: 5,
    problemSolving: 5,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["reasoning", "information", "technical", "agentic", "research", "business", "finance", "analysis", "dataScience"],
    rateLimit: 100,
    bestFor: ["multi-step reasoning", "real-time info", "complex queries", "research", "tool orchestration", "data analysis", "information synthesis", "comparative analysis", "trend analysis", "market research", "competitive analysis", "financial analysis", "business intelligence", "strategic planning", "decision making", "problem solving", "current events", "news analysis"],
    weaknesses: ["simple greetings", "pure creative writing", "entertainment", "casual chat"],
    optimalComplexity: ["medium", "complex", "expert", "advanced"],
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
    mathematics: 4,
    science: 5,
    academic: 5,
    research: 5,
    business: 4,
    finance: 4,
    legal: 4,
    medical: 4,
    entertainment: 5,
    dataScience: 4,
    machineLearning: 4,
    statistics: 4,
    analysis: 5,
    problemSolving: 4,
    cost: 4,
    hasSearch: false,
    contextWindow: 2000000,
    specialties: ["creative", "multilingual", "conversation", "science", "academic", "research", "entertainment", "analysis"],
    rateLimit: 120,
    bestFor: ["extreme long context", "multilingual", "creative content", "multimodal tasks", "diverse queries", "document analysis", "massive codebases", "historical context", "cross-lingual tasks", "translation", "localization", "content adaptation", "science education", "physics", "chemistry", "biology", "astronomy", "geography", "history", "literature", "creative writing", "storytelling", "entertainment", "anime", "manga", "gaming"],
    weaknesses: ["specialized deep coding", "highly technical tasks", "algorithm optimization", "low-level programming"],
    optimalComplexity: ["simple", "medium", "complex", "expert"],
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
    mathematics: 5,
    science: 4,
    academic: 4,
    research: 4,
    business: 4,
    finance: 4,
    legal: 3,
    medical: 3,
    entertainment: 3,
    dataScience: 4,
    machineLearning: 4,
    statistics: 5,
    analysis: 4,
    problemSolving: 5,
    cost: 3,
    hasSearch: true,
    contextWindow: 32768,
    specialties: ["coding", "multilingual", "technical", "algorithm", "mathematics"],
    rateLimit: 60,
    bestFor: ["coding", "asian languages", "technical writing", "multilingual code", "algorithm implementation", "competitive programming", "math problems", "chinese tech stack", "mandarin documentation", "mathematics", "algebra", "geometry", "number theory", "discrete math", "calculus", "statistics", "probability theory", "mathematical proofs"],
    weaknesses: ["creative writing in english", "western frameworks", "entertainment", "casual english chat"],
    optimalComplexity: ["medium", "complex", "expert", "advanced"],
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
    mathematics: 3,
    science: 3,
    academic: 4,
    research: 4,
    business: 5,
    finance: 4,
    legal: 4,
    medical: 3,
    entertainment: 3,
    dataScience: 4,
    machineLearning: 3,
    statistics: 4,
    analysis: 4,
    problemSolving: 4,
    cost: 3,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information", "business", "research", "analysis"],
    rateLimit: 100,
    bestFor: ["conversational AI", "search-augmented generation", "enterprise use", "RAG applications", "semantic search", "document retrieval", "knowledge bases", "chatbots", "customer support", "business communication", "professional writing", "reports", "summaries", "information extraction", "question answering"],
    weaknesses: ["deep coding", "mobile development", "specialized technical tasks", "mathematics", "entertainment"],
    optimalComplexity: ["simple", "medium", "complex"],
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
    mathematics: 4,
    science: 4,
    academic: 4,
    research: 4,
    business: 4,
    finance: 4,
    legal: 4,
    medical: 3,
    entertainment: 4,
    dataScience: 4,
    machineLearning: 4,
    statistics: 4,
    analysis: 4,
    problemSolving: 4,
    cost: 2,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["conversation", "creative", "webdev", "fullstack"],
    rateLimit: 90,
    bestFor: ["balanced tasks", "creative writing", "conversation", "web development", "javascript", "typescript", "react", "nodejs", "api integration", "general coding", "tutorials", "explanations", "homework help", "tutoring", "education", "learning", "problem solving", "brainstorming", "ideation"],
    weaknesses: ["very specialized tasks", "extreme performance optimization", "specific domain expertise"],
    optimalComplexity: ["simple", "medium", "complex", "expert"],
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
    mathematics: 3,
    science: 3,
    academic: 3,
    research: 3,
    business: 3,
    finance: 3,
    legal: 2,
    medical: 2,
    entertainment: 4,
    dataScience: 3,
    machineLearning: 3,
    statistics: 3,
    analysis: 3,
    problemSolving: 4,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "greeting", "webdev"],
    rateLimit: 150,
    bestFor: ["fast responses", "cost efficiency", "simple tasks", "high throughput", "basic coding", "general queries", "web development", "scripting", "automation", "casual conversation", "quick answers", "simple explanations", "basic tutorials", "entertainment chat"],
    weaknesses: ["complex reasoning", "specialized expertise", "creative writing", "advanced mathematics", "deep technical analysis"],
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
    mathematics: 3,
    science: 3,
    academic: 3,
    research: 4,
    business: 3,
    finance: 3,
    legal: 2,
    medical: 2,
    entertainment: 3,
    dataScience: 3,
    machineLearning: 3,
    statistics: 3,
    analysis: 3,
    problemSolving: 3,
    cost: 5,
    hasSearch: true,
    contextWindow: 128000,
    specialties: ["conversation", "information", "research"],
    rateLimit: 120,
    bestFor: ["browser search", "open-source", "cost effective", "general queries", "information lookup", "fact checking", "research", "documentation search", "current events", "news", "quick information"],
    weaknesses: ["specialized coding", "mobile dev", "deep technical tasks", "creative writing", "entertainment"],
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
    mathematics: 4,
    science: 3,
    academic: 3,
    research: 3,
    business: 3,
    finance: 3,
    legal: 2,
    medical: 2,
    entertainment: 4,
    dataScience: 3,
    machineLearning: 3,
    statistics: 3,
    analysis: 3,
    problemSolving: 4,
    cost: 4,
    hasSearch: false,
    contextWindow: 128000,
    specialties: ["multilingual", "conversation", "translation"],
    rateLimit: 60,
    bestFor: ["multilingual", "conversation", "translation", "mandarin support", "asian languages", "localization", "chinese entertainment", "chinese culture", "chinese literature"],
    weaknesses: ["english-only tasks", "western frameworks", "mobile dev", "specialized english content"],
    optimalComplexity: ["simple", "medium", "complex"],
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
    mathematics: 3,
    science: 3,
    academic: 3,
    research: 3,
    business: 4,
    finance: 3,
    legal: 3,
    medical: 2,
    entertainment: 3,
    dataScience: 3,
    machineLearning: 3,
    statistics: 3,
    analysis: 4,
    problemSolving: 4,
    cost: 4,
    hasSearch: false,
    contextWindow: 32000,
    specialties: ["conversation", "technical", "webdev"],
    rateLimit: 100,
    bestFor: ["european languages", "fast inference", "technical content", "efficiency", "french", "spanish", "italian", "web development", "modern frameworks", "european tech stack", "multilingual europe"],
    weaknesses: ["very long context", "mobile dev", "extreme specialization", "asian languages", "entertainment"],
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
    mathQuality: 0,
    scienceQuality: 0,
    reasoningQuality: 0,
    speedScore: 0,
    reliabilityScore: 0,
    costEfficiency: 0,
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
  "bilingual", "polyglot", "cross-lingual", "language detection", "transcription", "interpretation"
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

const MATHEMATICS_KEYWORDS = [
  "math", "mathematics", "calculate", "computation", "equation", "formula", "solve", "proof",
  "theorem", "lemma", "corollary", "axiom", "derivation", "integration", "differentiation",
  "limit", "series", "sequence", "convergence", "divergence", "mathematical", "numeric",
  "algebra", "calculus", "geometry", "trigonometry", "statistics", "probability",
  "linear algebra", "matrix", "vector", "determinant", "eigenvalue", "eigenvector",
  "differential equation", "partial derivative", "integral", "summation", "factorial",
  "combinatorics", "permutation", "combination", "binomial", "polynomial", "quadratic"
];

const CALCULUS_KEYWORDS = [
  "calculus", "derivative", "integral", "limit", "continuity", "differentiation", "integration",
  "chain rule", "product rule", "quotient rule", "implicit differentiation", "related rates",
  "optimization", "maxima", "minima", "critical point", "inflection point", "concavity",
  "fundamental theorem", "riemann sum", "definite integral", "indefinite integral",
  "substitution", "integration by parts", "partial fractions", "taylor series", "maclaurin"
];

const ALGEBRA_KEYWORDS = [
  "algebra", "equation", "inequality", "polynomial", "factor", "expand", "simplify",
  "linear equation", "quadratic equation", "cubic", "radical", "exponent", "logarithm",
  "absolute value", "system of equations", "matrix", "determinant", "cramer's rule",
  "linear combination", "basis", "span", "dimension", "rank", "nullspace", "eigenspace"
];

const GEOMETRY_KEYWORDS = [
  "geometry", "triangle", "circle", "square", "rectangle", "polygon", "angle", "perimeter",
  "area", "volume", "surface area", "pythagorean", "congruent", "similar", "parallel",
  "perpendicular", "tangent", "secant", "chord", "arc", "sector", "euclidean", "coordinate"
];

const STATISTICS_KEYWORDS = [
  "statistics", "mean", "median", "mode", "variance", "standard deviation", "correlation",
  "regression", "hypothesis test", "p-value", "confidence interval", "normal distribution",
  "binomial distribution", "poisson", "chi-square", "t-test", "anova", "sample", "population",
  "statistical significance", "null hypothesis", "alternative hypothesis", "type i error",
  "type ii error", "statistical inference", "descriptive statistics", "inferential statistics"
];

const PROBABILITY_KEYWORDS = [
  "probability", "random", "expected value", "variance", "distribution", "bayes theorem",
  "conditional probability", "independent", "mutually exclusive", "sample space", "event",
  "outcome", "likelihood", "odds", "permutation", "combination", "discrete", "continuous",
  "probability density", "cumulative distribution", "moment generating function"
];

const PHYSICS_KEYWORDS = [
  "physics", "force", "motion", "velocity", "acceleration", "momentum", "energy", "work",
  "power", "newton", "gravity", "friction", "mass", "weight", "kinematics", "dynamics",
  "thermodynamics", "heat", "temperature", "entropy", "electromagnetism", "electric field",
  "magnetic field", "circuit", "voltage", "current", "resistance", "capacitance", "inductance",
  "wave", "frequency", "wavelength", "amplitude", "optics", "reflection", "refraction",
  "quantum", "relativity", "particle", "atom", "nucleus", "electron", "proton", "neutron"
];

const CHEMISTRY_KEYWORDS = [
  "chemistry", "molecule", "atom", "element", "compound", "reaction", "chemical equation",
  "stoichiometry", "mole", "molarity", "concentration", "acid", "base", "ph", "buffer",
  "oxidation", "reduction", "redox", "electrochemistry", "organic chemistry", "inorganic",
  "periodic table", "electron configuration", "orbital", "bond", "ionic", "covalent",
  "hydrogen bond", "van der waals", "equilibrium", "le chatelier", "kinetics", "catalyst",
  "thermochemistry", "enthalpy", "entropy", "gibbs free energy", "solubility", "precipitation"
];

const BIOLOGY_KEYWORDS = [
  "biology", "cell", "dna", "rna", "gene", "protein", "enzyme", "metabolism", "photosynthesis",
  "respiration", "mitosis", "meiosis", "evolution", "natural selection", "genetics", "heredity",
  "chromosome", "allele", "genotype", "phenotype", "mutation", "adaptation", "species",
  "taxonomy", "ecology", "ecosystem", "biome", "population", "community", "food chain",
  "organism", "tissue", "organ", "system", "homeostasis", "anatomy", "physiology"
];

const MEDICAL_KEYWORDS = [
  "medical", "health", "disease", "symptom", "diagnosis", "treatment", "medicine", "doctor",
  "patient", "hospital", "clinic", "surgery", "prescription", "drug", "medication", "therapy",
  "virus", "bacteria", "infection", "immune", "vaccine", "antibody", "pathogen", "epidemic",
  "pandemic", "chronic", "acute", "clinical", "medical condition", "healthcare", "wellness"
];

const LEGAL_KEYWORDS = [
  "legal", "law", "lawyer", "attorney", "court", "judge", "trial", "lawsuit", "litigation",
  "contract", "agreement", "statute", "regulation", "compliance", "jurisdiction", "precedent",
  "plaintiff", "defendant", "evidence", "testimony", "verdict", "appeal", "constitutional",
  "criminal law", "civil law", "corporate law", "intellectual property", "patent", "trademark",
  "copyright", "liability", "negligence", "tort", "arbitration", "mediation", "settlement"
];

const FINANCE_KEYWORDS = [
  "finance", "money", "investment", "stock", "bond", "portfolio", "asset", "liability",
  "equity", "debt", "interest rate", "dividend", "capital", "profit", "loss", "revenue",
  "expense", "budget", "cash flow", "balance sheet", "income statement", "financial analysis",
  "valuation", "roi", "return on investment", "risk", "diversification", "hedge", "derivative",
  "futures", "options", "forex", "cryptocurrency", "blockchain", "trading", "market"
];

const BUSINESS_KEYWORDS = [
  "business", "company", "corporation", "startup", "entrepreneur", "management", "strategy",
  "marketing", "sales", "customer", "product", "service", "brand", "market share", "competition",
  "competitive advantage", "swot analysis", "business model", "revenue model", "value proposition",
  "business plan", "pitch deck", "fundraising", "venture capital", "angel investor", "ipo",
  "merger", "acquisition", "partnership", "stakeholder", "shareholder", "board of directors",
  "ceo", "cfo", "cto", "executive", "operations", "supply chain", "logistics", "inventory"
];

const DATASCIENCE_KEYWORDS = [
  "data science", "machine learning", "deep learning", "neural network", "artificial intelligence",
  "ai", "ml", "data analysis", "data mining", "big data", "analytics", "predictive model",
  "classification", "regression", "clustering", "dimensionality reduction", "feature engineering",
  "training", "validation", "test set", "overfitting", "underfitting", "bias", "variance",
  "gradient descent", "backpropagation", "convolutional", "recurrent", "transformer", "lstm",
  "gru", "attention", "encoder", "decoder", "supervised", "unsupervised", "reinforcement learning",
  "scikit-learn", "tensorflow", "pytorch", "keras", "pandas", "numpy", "matplotlib", "seaborn"
];

const ACADEMIC_KEYWORDS = [
  "academic", "research", "paper", "thesis", "dissertation", "journal", "publication", "peer review",
  "citation", "reference", "bibliography", "abstract", "methodology", "literature review",
  "hypothesis", "experiment", "data collection", "analysis", "results", "discussion", "conclusion",
  "scholarly", "scientific method", "empirical", "theoretical", "qualitative", "quantitative",
  "case study", "survey", "interview", "observation", "academic writing", "scholarly article"
];

const PHILOSOPHY_KEYWORDS = [
  "philosophy", "philosophical", "ethics", "morality", "epistemology", "metaphysics", "ontology",
  "logic", "argument", "fallacy", "reasoning", "truth", "knowledge", "belief", "justified",
  "skepticism", "rationalism", "empiricism", "idealism", "materialism", "dualism", "monism",
  "existentialism", "nihilism", "utilitarianism", "deontology", "virtue ethics", "categorical imperative",
  "free will", "determinism", "consciousness", "mind-body problem", "phenomenology", "hermeneutics"
];

const PSYCHOLOGY_KEYWORDS = [
  "psychology", "psychological", "behavior", "cognitive", "emotion", "personality", "development",
  "learning", "memory", "perception", "attention", "consciousness", "unconscious", "motivation",
  "intelligence", "iq", "eq", "mental health", "disorder", "therapy", "counseling", "psychotherapy",
  "behaviorism", "cognitivism", "psychoanalysis", "humanistic", "social psychology", "developmental",
  "clinical psychology", "neuroscience", "brain", "neurotransmitter", "dopamine", "serotonin"
];

const HISTORY_KEYWORDS = [
  "history", "historical", "ancient", "medieval", "modern", "contemporary", "civilization",
  "empire", "dynasty", "revolution", "war", "battle", "treaty", "colonialism", "imperialism",
  "renaissance", "enlightenment", "industrial revolution", "world war", "cold war", "historical event",
  "historical figure", "primary source", "secondary source", "historiography", "chronology",
  "timeline", "era", "period", "century", "decade", "archaeological", "artifact"
];

const LITERATURE_KEYWORDS = [
  "literature", "literary", "novel", "poem", "poetry", "prose", "verse", "author", "writer",
  "playwright", "narrative", "plot", "character", "setting", "theme", "motif", "symbolism",
  "metaphor", "simile", "allegory", "irony", "foreshadowing", "flashback", "point of view",
  "first person", "third person", "genre", "fiction", "non-fiction", "drama", "tragedy", "comedy",
  "epic", "ballad", "sonnet", "haiku", "literary analysis", "literary criticism", "literary theory"
];

const ART_KEYWORDS = [
  "art", "artistic", "painting", "drawing", "sculpture", "illustration", "design", "visual",
  "aesthetic", "style", "technique", "medium", "canvas", "brush", "color", "composition",
  "perspective", "proportion", "balance", "symmetry", "contrast", "texture", "form", "shape",
  "line", "space", "abstract", "realism", "impressionism", "expressionism", "cubism", "surrealism",
  "modernism", "contemporary art", "renaissance art", "baroque", "rococo", "neoclassical"
];

const MUSIC_KEYWORDS = [
  "music", "musical", "song", "melody", "harmony", "rhythm", "tempo", "beat", "note", "chord",
  "scale", "key", "pitch", "tone", "timbre", "dynamics", "composition", "arrangement", "orchestration",
  "instrument", "guitar", "piano", "violin", "drums", "synthesizer", "genre", "classical", "jazz",
  "rock", "pop", "hip hop", "electronic", "folk", "blues", "country", "metal", "reggae", "r&b"
];

const ANIME_KEYWORDS = [
  "anime", "manga", "manhwa", "manhua", "light novel", "ln", "webtoon", "otaku", "weeaboo",
  "shounen", "shoujo", "seinen", "josei", "isekai", "mecha", "slice of life", "romance", "action",
  "adventure", "fantasy", "sci-fi", "horror", "mystery", "thriller", "comedy", "drama", "sports",
  "supernatural", "psychological", "ecchi", "harem", "yuri", "yaoi", "chibi", "kawaii", "tsundere",
  "yandere", "kuudere", "dandere", "cosplay", "convention", "studio", "episode", "chapter", "volume"
];

const GAMING_KEYWORDS = [
  "game", "gaming", "video game", "gamer", "gameplay", "multiplayer", "single player", "online",
  "offline", "console", "pc", "mobile game", "esports", "competitive", "casual", "rpg", "mmorpg",
  "fps", "shooter", "strategy", "rts", "turn-based", "action", "adventure", "platformer", "puzzle",
  "simulation", "racing", "fighting", "battle royale", "moba", "sandbox", "open world", "indie",
  "aaa", "level", "quest", "mission", "achievement", "leaderboard", "speedrun", "mod", "dlc"
];

const HOMEWORK_KEYWORDS = [
  "homework", "assignment", "exercise", "problem set", "worksheet", "project", "essay", "report",
  "presentation", "study", "exam", "test", "quiz", "midterm", "final", "grade", "score", "gpa",
  "tutor", "help with", "explain to me", "teach me", "learn", "understand", "solve", "answer",
  "question", "practice", "review", "prepare", "student", "school", "university", "college", "class"
];

const TUTORIAL_KEYWORDS = [
  "tutorial", "how to", "guide", "walkthrough", "step by step", "instructions", "learn how",
  "teach", "demonstrate", "show me", "example", "practice", "beginner", "introduction", "basics",
  "fundamentals", "getting started", "quick start", "course", "lesson", "training", "workshop"
];

const DEBUG_KEYWORDS = [
  "debug", "debugging", "error", "bug", "issue", "problem", "not working", "broken", "crash",
  "exception", "stack trace", "traceback", "segfault", "memory leak", "null pointer", "undefined",
  "syntax error", "runtime error", "logic error", "fix", "solve", "troubleshoot", "diagnose"
];

const OPTIMIZATION_KEYWORDS = [
  "optimize", "optimization", "performance", "speed up", "faster", "efficient", "efficiency",
  "improve", "enhancement", "bottleneck", "profiling", "benchmark", "latency", "throughput",
  "scalability", "resource usage", "memory usage", "cpu usage", "cache", "parallel", "concurrent"
];

const RECOMMENDATION_KEYWORDS = [
  "recommend", "recommendation", "suggest", "suggestion", "advice", "which", "what should",
  "best", "top", "favorite", "popular", "trending", "good", "better", "comparison", "versus",
  "vs", "alternative", "similar", "like", "review", "rating", "opinion"
];

const SUMMARY_KEYWORDS = [
  "summarize", "summary", "tldr", "brief", "overview", "synopsis", "abstract", "condensed",
  "key points", "main ideas", "highlights", "recap", "digest", "outline", "in short", "concise"
];

const ANALYSIS_KEYWORDS = [
  "analyze", "analysis", "examine", "investigate", "study", "assess", "evaluate", "review",
  "interpret", "dissect", "breakdown", "deep dive", "in-depth", "detailed", "comprehensive",
  "thorough", "critical", "analytical", "systematic", "methodical"
];

const COMPARISON_KEYWORDS = [
  "compare", "comparison", "contrast", "difference", "similar", "similarity", "versus", "vs",
  "better", "worse", "pros and cons", "advantages", "disadvantages", "trade-off", "benchmark",
  "side by side", "which is", "what's the difference", "how do they differ"
];

const PLANNING_KEYWORDS = [
  "plan", "planning", "strategy", "roadmap", "schedule", "timeline", "organize", "structure",
  "framework", "approach", "methodology", "steps", "stages", "phases", "milestones", "goals",
  "objectives", "priorities", "workflow", "process", "procedure"
];

const ETHICS_KEYWORDS = [
  "ethical", "ethics", "moral", "morality", "right", "wrong", "good", "bad", "justice", "fairness",
  "responsibility", "accountability", "integrity", "honesty", "transparency", "privacy", "consent",
  "bias", "discrimination", "equality", "equity", "human rights", "social justice", "sustainability"
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

function containsAnyKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

function extractLanguages(text: string): string[] {
  const languages: string[] = [];
  const langPatterns: Record<string, RegExp[]> = {
    javascript: [/\bjs\b/i, /javascript/i, /node\.?js/i, /npm/i, /yarn/i],
    typescript: [/typescript/i, /\bts\b/i, /\.tsx?\b/i],
    python: [/python/i, /\bpy\b/i, /django/i, /flask/i, /fastapi/i, /pandas/i, /numpy/i],
    java: [/\bjava\b/i, /spring/i, /maven/i, /gradle/i],
    rust: [/rust/i, /cargo/i, /rustc/i],
    golang: [/\bgo\b/i, /golang/i],
    kotlin: [/kotlin/i],
    swift: [/swift/i, /swiftui/i],
    cpp: [/c\+\+/i, /\bcpp\b/i],
    csharp: [/c#/i, /csharp/i, /\.net/i],
    php: [/php/i, /laravel/i, /symfony/i],
    ruby: [/ruby/i, /rails/i],
    r: [/\br\b/i, /r programming/i, /r language/i],
    matlab: [/matlab/i],
    scala: [/scala/i],
    haskell: [/haskell/i],
    lua: [/lua/i],
    perl: [/perl/i],
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
    tailwind: [/tailwind/i, /tailwindcss/i],
    bootstrap: [/bootstrap/i],
    tensorflow: [/tensorflow/i, /tf/i],
    pytorch: [/pytorch/i, /torch/i],
    keras: [/keras/i],
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
  const hasMathSymbols = /[∫∑∏√π∞≈≠≤≥±∂∇]/i.test(message);
  const hasComplexPunctuation = /[;:—–]/g.test(message);
  
  let depth = 0;
  
  if (avgWordsPerSentence > 25) depth += 3;
  else if (avgWordsPerSentence > 20) depth += 2;
  else if (avgWordsPerSentence > 15) depth += 1;
  
  if (keywordDensity > 0.20) depth += 4;
  else if (keywordDensity > 0.15) depth += 3;
  else if (keywordDensity > 0.10) depth += 2;
  else if (keywordDensity > 0.05) depth += 1;
  
  if (hasQuestions) depth += 1;
  if (hasCodeBlock) depth += 2;
  if (hasLists) depth += 1;
  if (hasMathSymbols) depth += 2;
  if (hasComplexPunctuation) depth += 1;
  if (sentences > 8) depth += 2;
  else if (sentences > 5) depth += 1;
  if (words > 150) depth += 3;
  else if (words > 100) depth += 2;
  else if (words > 50) depth += 1;
  
  return Math.min(10, depth);
}

function determineAcademicLevel(message: string, complexity: Complexity): "elementary" | "highschool" | "undergraduate" | "graduate" | "phd" | "professional" {
  const lower = message.toLowerCase();
  
  if (containsAnyKeyword(message, ["elementary", "basic", "simple", "beginner", "kid", "children"])) {
    return "elementary";
  }
  
  if (containsAnyKeyword(message, ["high school", "secondary", "grade 9", "grade 10", "grade 11", "grade 12"])) {
    return "highschool";
  }
  
  if (containsAnyKeyword(message, ["undergraduate", "college", "university", "bachelor", "bsc", "ba"])) {
    return "undergraduate";
  }
  
  if (containsAnyKeyword(message, ["graduate", "master", "msc", "ma", "graduate school"])) {
    return "graduate";
  }
  
  if (containsAnyKeyword(message, ["phd", "doctoral", "dissertation", "thesis defense", "research proposal"])) {
    return "phd";
  }
  
  if (containsAnyKeyword(message, ["professional", "industry", "production", "enterprise", "corporate"])) {
    return "professional";
  }
  
  if (complexity === "genius" || complexity === "advanced") return "phd";
  if (complexity === "expert") return "graduate";
  if (complexity === "complex") return "undergraduate";
  if (complexity === "medium") return "highschool";
  return "elementary";
}

function determineDomain(analysis: QueryAnalysis): "stem" | "humanities" | "business" | "arts" | "social" | "technical" | "general" {
  if (analysis.needsCoding || analysis.needsMathematics || analysis.needsScience || analysis.needsAlgorithm) {
    return "stem";
  }
  
  if (analysis.needsLiterature || analysis.needsPhilosophy || analysis.needsHistory) {
    return "humanities";
  }
  
  if (analysis.needsBusiness || analysis.needsFinance) {
    return "business";
  }
  
  if (analysis.needsArt || analysis.needsMusic || analysis.needsCreativity) {
    return "arts";
  }
  
  if (analysis.needsPsychology || analysis.needsEthics) {
    return "social";
  }
  
  if (analysis.needsWebdev || analysis.needsDatabase || analysis.needsDevops) {
    return "technical";
  }
  
  return "general";
}

function determineTone(message: string): "casual" | "formal" | "academic" | "technical" | "creative" | "professional" {
  const lower = message.toLowerCase();
  
  if (containsAnyKeyword(message, GREETING_KEYWORDS) || /hey|sup|yo|lol|haha/i.test(message)) {
    return "casual";
  }
  
  if (containsAnyKeyword(message, ACADEMIC_KEYWORDS) || /research|study|paper|thesis/i.test(message)) {
    return "academic";
  }
  
  if (containsAnyKeyword(message, CODING_KEYWORDS) || /technical|implementation|architecture/i.test(message)) {
    return "technical";
  }
  
  if (containsAnyKeyword(message, CREATIVE_KEYWORDS) || /story|poem|creative|imagine/i.test(message)) {
    return "creative";
  }
  
  if (containsAnyKeyword(message, BUSINESS_KEYWORDS) || /professional|corporate|enterprise/i.test(message)) {
    return "professional";
  }
  
  if (/please|kindly|would you|could you|may i/i.test(message)) {
    return "formal";
  }
  
  return "casual";
}

function determineAudience(complexity: Complexity): "beginner" | "intermediate" | "advanced" | "expert" {
  if (complexity === "trivial" || complexity === "simple") return "beginner";
  if (complexity === "medium") return "intermediate";
  if (complexity === "complex") return "advanced";
  return "expert";
}

function determineOutputFormat(message: string): "text" | "code" | "list" | "table" | "essay" | "summary" | "explanation" | "tutorial" | "comparison" {
  if (containsAnyKeyword(message, CODING_KEYWORDS) || /```/i.test(message)) {
    return "code";
  }
  
  if (containsAnyKeyword(message, SUMMARY_KEYWORDS)) {
    return "summary";
  }
  
  if (containsAnyKeyword(message, TUTORIAL_KEYWORDS)) {
    return "tutorial";
  }
  
  if (containsAnyKeyword(message, COMPARISON_KEYWORDS)) {
    return "comparison";
  }
  
  if (containsAnyKeyword(message, ["list", "enumerate", "bullet points", "numbered"])) {
    return "list";
  }
  
  if (containsAnyKeyword(message, ["table", "matrix", "grid", "chart"])) {
    return "table";
  }
  
  if (containsAnyKeyword(message, ["essay", "article", "paper", "write about"])) {
    return "essay";
  }
  
  if (containsAnyKeyword(message, ["explain", "how does", "why", "what is"])) {
    return "explanation";
  }
  
  return "text";
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
  let needsMathematics = false;
  let needsScience = false;
  let needsAcademic = false;
  let needsResearch = false;
  let needsBusiness = false;
  let needsFinance = false;
  let needsLegal = false;
  let needsMedical = false;
  let needsEntertainment = false;
  let needsDataScience = false;
  let needsMachineLearning = false;
  let needsStatistics = false;
  let needsCalculus = false;
  let needsAlgebra = false;
  let needsGeometry = false;
  let needsProbability = false;
  let needsPhysics = false;
  let needsChemistry = false;
  let needsBiology = false;
  let needsPhilosophy = false;
  let needsPsychology = false;
  let needsHistory = false;
  let needsLiterature = false;
  let needsArt = false;
  let needsMusic = false;
  let needsAnime = false;
  let needsGaming = false;
  let needsTranslation = false;
  let needsWriting = false;
  let needsSummarization = false;
  let needsAnalysis = false;
  let needsComparison = false;
  let needsOptimization = false;
  let needsDebug = false;
  let needsTutorial = false;
  let needsRecommendation = false;
  let needsPlanning = false;
  let needsStrategy = false;
  let needsProblemSolving = false;
  let needsEthics = false;
  const keywords: string[] = [];
  let confidence = 0.5;
  let priority: "low" | "medium" | "high" | "critical" | "urgent" = "medium";
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
  const mathematicsScore = containsKeywords(message, MATHEMATICS_KEYWORDS);
  const calculusScore = containsKeywords(message, CALCULUS_KEYWORDS);
  const algebraScore = containsKeywords(message, ALGEBRA_KEYWORDS);
  const geometryScore = containsKeywords(message, GEOMETRY_KEYWORDS);
  const statisticsScore = containsKeywords(message, STATISTICS_KEYWORDS);
  const probabilityScore = containsKeywords(message, PROBABILITY_KEYWORDS);
  const physicsScore = containsKeywords(message, PHYSICS_KEYWORDS);
  const chemistryScore = containsKeywords(message, CHEMISTRY_KEYWORDS);
  const biologyScore = containsKeywords(message, BIOLOGY_KEYWORDS);
  const medicalScore = containsKeywords(message, MEDICAL_KEYWORDS);
  const legalScore = containsKeywords(message, LEGAL_KEYWORDS);
  const financeScore = containsKeywords(message, FINANCE_KEYWORDS);
  const businessScore = containsKeywords(message, BUSINESS_KEYWORDS);
  const dataScienceScore = containsKeywords(message, DATASCIENCE_KEYWORDS);
  const academicScore = containsKeywords(message, ACADEMIC_KEYWORDS);
  const philosophyScore = containsKeywords(message, PHILOSOPHY_KEYWORDS);
  const psychologyScore = containsKeywords(message, PSYCHOLOGY_KEYWORDS);
  const historyScore = containsKeywords(message, HISTORY_KEYWORDS);
  const literatureScore = containsKeywords(message, LITERATURE_KEYWORDS);
  const artScore = containsKeywords(message, ART_KEYWORDS);
  const musicScore = containsKeywords(message, MUSIC_KEYWORDS);
  const animeScore = containsKeywords(message, ANIME_KEYWORDS);
  const gamingScore = containsKeywords(message, GAMING_KEYWORDS);
  const homeworkScore = containsKeywords(message, HOMEWORK_KEYWORDS);
  const tutorialScore = containsKeywords(message, TUTORIAL_KEYWORDS);
  const debugScore = containsKeywords(message, DEBUG_KEYWORDS);
  const optimizationScore = containsKeywords(message, OPTIMIZATION_KEYWORDS);
  const recommendationScore = containsKeywords(message, RECOMMENDATION_KEYWORDS);
  const summaryScore = containsKeywords(message, SUMMARY_KEYWORDS);
  const analysisScore = containsKeywords(message, ANALYSIS_KEYWORDS);
  const comparisonScore = containsKeywords(message, COMPARISON_KEYWORDS);
  const planningScore = containsKeywords(message, PLANNING_KEYWORDS);
  const ethicsScore = containsKeywords(message, ETHICS_KEYWORDS);

  const hasCodeBlock = /```/.test(message);
  const hasMultilingualChars = /[\u4e00-\u9fa5]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uac00-\ud7af]/.test(message);
  const hasMultipleSteps = /step|steps|first|second|then|next|finally|after that/i.test(message);
  const hasPrecisionWords = /exact|precise|accurate|correct|specific|detailed/i.test(message);
  const hasSpeedWords = /quick|fast|asap|urgent|immediately|now/i.test(message);
  const hasMathSymbols = /[∫∑∏√π∞≈≠≤≥±∂∇]/i.test(message);
  const hasEquations = /=|equation|formula|solve for/i.test(message);

  const languages = extractLanguages(message);
  const frameworks = extractFrameworks(message);
  const technologies = extractTechnologies(message);

  if (greetingScore > 0 && words <= 10 && codingScore === 0 && mathematicsScore === 0) {
    type = "greeting";
    complexity = "trivial";
    confidence = 0.95;
    requiresSpeed = true;
    priority = "low";
  } else if (mathematicsScore >= 2 || calculusScore >= 1 || algebraScore >= 1 || hasMathSymbols) {
    type = "mathematics";
    needsMathematics = true;
    confidence = 0.92;
    keywords.push("mathematics");
    requiresPrecision = true;
    priority = "high";
    
    if (calculusScore >= 1) {
      needsCalculus = true;
      subTypes.push("calculus");
      keywords.push("calculus");
    }
    
    if (algebraScore >= 1) {
      needsAlgebra = true;
      subTypes.push("algebra");
      keywords.push("algebra");
    }
    
    if (geometryScore >= 1) {
      needsGeometry = true;
      subTypes.push("geometry");
      keywords.push("geometry");
    }
    
    if (statisticsScore >= 1) {
      needsStatistics = true;
      subTypes.push("statistics");
      keywords.push("statistics");
    }
    
    if (probabilityScore >= 1) {
      needsProbability = true;
      subTypes.push("probability");
      keywords.push("probability");
    }
    
    if (words > 100 || hasEquations) {
      complexity = "expert";
    } else if (words > 50) {
      complexity = "complex";
    } else if (words > 20) {
      complexity = "medium";
    } else {
      complexity = "simple";
    }
    
  } else if (physicsScore >= 2 || chemistryScore >= 2 || biologyScore >= 2) {
    type = "science";
    needsScience = true;
    confidence = 0.90;
    keywords.push("science");
    requiresPrecision = true;
    
    if (physicsScore >= 2) {
      needsPhysics = true;
      subTypes.push("physics");
      keywords.push("physics");
    }
    
    if (chemistryScore >= 2) {
      needsChemistry = true;
      subTypes.push("chemistry");
      keywords.push("chemistry");
    }
    
    if (biologyScore >= 2) {
      needsBiology = true;
      subTypes.push("biology");
      keywords.push("biology");
    }
    
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    priority = "high";
    
  } else if (dataScienceScore >= 2) {
    type = "dataScience";
    needsDataScience = true;
    needsMachineLearning = containsAnyKeyword(message, ["machine learning", "deep learning", "neural network", "ml", "ai"]);
    confidence = 0.91;
    keywords.push("data science");
    requiresPrecision = true;
    priority = "high";
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    
    if (needsMachineLearning) {
      subTypes.push("machineLearning");
      keywords.push("machine learning");
    }
    
  } else if (codingScore >= 2 || hasCodeBlock) {
    type = "coding";
    needsCoding = true;
    confidence = 0.90;
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
    
    if (debugScore > 0) {
      needsDebug = true;
      subTypes.push("debug");
      keywords.push("debug");
      priority = "high";
    }
    
    if (optimizationScore > 0) {
      needsOptimization = true;
      subTypes.push("optimization");
      keywords.push("optimization");
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
    
    if (literatureScore > 0) {
      needsLiterature = true;
      subTypes.push("literature");
      keywords.push("literature");
    }
    
    if (containsAnyKeyword(message, ["write", "writing", "compose", "draft"])) {
      needsWriting = true;
      subTypes.push("writing");
      keywords.push("writing");
    }
    
  } else if (businessScore >= 2 || financeScore >= 2) {
    type = "business";
    needsBusiness = businessScore >= 2;
    needsFinance = financeScore >= 2;
    confidence = 0.88;
    keywords.push("business");
    priority = "high";
    
    if (needsFinance) {
      subTypes.push("finance");
      keywords.push("finance");
    }
    
    if (planningScore > 0) {
      needsPlanning = true;
      needsStrategy = true;
      subTypes.push("planning", "strategy");
      keywords.push("planning", "strategy");
    }
    
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    
  } else if (legalScore >= 2) {
    type = "legal";
    needsLegal = true;
    confidence = 0.87;
    keywords.push("legal");
    requiresPrecision = true;
    priority = "high";
    complexity = words > 60 ? "expert" : "complex";
    
  } else if (medicalScore >= 2) {
    type = "medical";
    needsMedical = true;
    confidence = 0.86;
    keywords.push("medical");
    requiresPrecision = true;
    priority = "critical";
    complexity = words > 60 ? "expert" : "complex";
    
  } else if (philosophyScore >= 2 || ethicsScore >= 2) {
    type = "philosophy";
    needsPhilosophy = true;
    needsEthics = ethicsScore >= 2;
    confidence = 0.85;
    keywords.push("philosophy");
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    
    if (needsEthics) {
      subTypes.push("ethics");
      keywords.push("ethics");
    }
    
  } else if (psychologyScore >= 2) {
    type = "psychology";
    needsPsychology = true;
    confidence = 0.84;
    keywords.push("psychology");
    complexity = words > 60 ? "expert" : "complex";
    
  } else if (historyScore >= 2) {
    type = "history";
    needsHistory = true;
    confidence = 0.83;
    keywords.push("history");
    complexity = words > 60 ? "complex" : "medium";
    
  } else if (artScore >= 2 || musicScore >= 2) {
    type = "art";
    needsArt = artScore >= 2;
    needsMusic = musicScore >= 2;
    confidence = 0.82;
    keywords.push("art");
    
    if (needsMusic) {
      subTypes.push("music");
      keywords.push("music");
    }
    
    complexity = words > 40 ? "complex" : "medium";
    
  } else if (animeScore >= 2) {
    type = "anime";
    needsAnime = true;
    needsEntertainment = true;
    confidence = 0.93;
    keywords.push("anime", "entertainment");
    complexity = words > 40 ? "medium" : "simple";
    priority = "medium";
    
  } else if (gamingScore >= 2) {
    type = "gaming";
    needsGaming = true;
    needsEntertainment = true;
    confidence = 0.90;
    keywords.push("gaming", "entertainment");
    complexity = words > 40 ? "medium" : "simple";
    
  } else if (reasoningScore >= 2 || architectureScore >= 1) {
    type = "reasoning";
    subTypes.push("reasoning");
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    confidence = 0.80;
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
    
  } else if (academicScore >= 2 || homeworkScore >= 2) {
    type = "academic";
    needsAcademic = true;
    confidence = 0.87;
    keywords.push("academic");
    priority = "high";
    complexity = words > 80 ? "expert" : words > 40 ? "complex" : "medium";
    
    if (containsAnyKeyword(message, ["research", "paper", "thesis"])) {
      needsResearch = true;
      subTypes.push("research");
      keywords.push("research");
    }
    
  } else {
    type = "conversation";
    complexity = words > 80 ? "complex" : words > 40 ? "medium" : "simple";
    confidence = 0.60;
    priority = "low";
  }

  if (summaryScore > 0) {
    needsSummarization = true;
    subTypes.push("summarization");
    keywords.push("summary");
  }
  
  if (analysisScore >= 2) {
    needsAnalysis = true;
    subTypes.push("analysis");
    keywords.push("analysis");
    requiresPrecision = true;
  }
  
  if (comparisonScore >= 2) {
    needsComparison = true;
    subTypes.push("comparison");
    keywords.push("comparison");
  }
  
  if (tutorialScore > 0) {
    needsTutorial = true;
    subTypes.push("tutorial");
    keywords.push("tutorial");
  }
  
  if (recommendationScore > 0) {
    needsRecommendation = true;
    subTypes.push("recommendation");
    keywords.push("recommendation");
  }
  
  if (planningScore > 0 && !needsPlanning) {
    needsPlanning = true;
    subTypes.push("planning");
    keywords.push("planning");
  }

  if (multilingualScore > 0 || hasMultilingualChars) {
    isMultilingual = true;
    subTypes.push("multilingual");
    keywords.push("multilingual");
    confidence = Math.min(0.98, confidence + 0.1);
    
    if (containsAnyKeyword(message, ["translate", "translation"])) {
      needsTranslation = true;
      subTypes.push("translation");
      keywords.push("translation");
    }
  }

  if (searchScore > 0 && type !== "information") {
    needsSearch = true;
  }

  if (hasMultipleSteps) {
    multiStep = true;
    needsProblemSolving = true;
    complexity = complexity === "simple" ? "medium" : complexity === "medium" ? "complex" : complexity;
  }

  if (hasPrecisionWords) {
    requiresPrecision = true;
  }

  if (hasSpeedWords) {
    requiresSpeed = true;
    priority = priority === "low" ? "medium" : priority === "medium" ? "high" : priority === "high" ? "critical" : "urgent";
  }

  if (words > 200 || message.length > 1500) {
    longContext = true;
  }

  if (containsAnyKeyword(message, ["problem", "solve", "solution", "issue", "challenge"])) {
    needsProblemSolving = true;
    if (!subTypes.includes("problemSolving")) {
      subTypes.push("problemSolving");
      keywords.push("problem solving");
    }
  }

  const estimatedTokens = Math.ceil(words * 1.3);
  const contextComplexity = Math.ceil((words / 50) + (subTypes.length * 0.5));
  const semanticDepth = calculateSemanticDepth(message, keywords);

  if (semanticDepth >= 8) {
    complexity = complexity === "simple" ? "complex" : complexity === "medium" ? "expert" : complexity === "complex" ? "advanced" : "genius";
  } else if (semanticDepth >= 7) {
    complexity = complexity === "simple" ? "medium" : complexity === "medium" ? "complex" : complexity;
  }

  const academicLevel = determineAcademicLevel(message, complexity);
  const domain = determineDomain({
    type, subTypes, complexity, needsSearch, needsCoding, needsCreativity, isMultilingual,
    needsMobile, needsFullstack, needsAgentic, needsWebdev, needsBackend, needsFrontend,
    needsDevops, needsDatabase, needsAlgorithm, needsSecurity, needsTesting, needsMathematics,
    needsScience, needsAcademic, needsResearch, needsBusiness, needsFinance, needsLegal,
    needsMedical, needsEntertainment, needsDataScience, needsMachineLearning, needsStatistics,
    needsCalculus, needsAlgebra, needsGeometry, needsProbability, needsPhysics, needsChemistry,
    needsBiology, needsPhilosophy, needsPsychology, needsHistory, needsLiterature, needsArt,
    needsMusic, needsAnime, needsGaming, needsTranslation, needsWriting, needsSummarization,
    needsAnalysis, needsComparison, needsOptimization, needsDebug, needsTutorial,
    needsRecommendation, needsPlanning, needsStrategy, needsProblemSolving, needsEthics,
    estimatedTokens, keywords, confidence, priority, languages, frameworks, technologies,
    contextComplexity, semanticDepth, requiresPrecision, requiresSpeed, multiStep, longContext,
    academicLevel: "elementary", domain: "general", tone: "casual", audience: "beginner",
    outputFormat: "text"
  } as QueryAnalysis);
  
  const tone = determineTone(message);
  const audience = determineAudience(complexity);
  const outputFormat = determineOutputFormat(message);

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
    needsMathematics,
    needsScience,
    needsAcademic,
    needsResearch,
    needsBusiness,
    needsFinance,
    needsLegal,
    needsMedical,
    needsEntertainment,
    needsDataScience,
    needsMachineLearning,
    needsStatistics,
    needsCalculus,
    needsAlgebra,
    needsGeometry,
    needsProbability,
    needsPhysics,
    needsChemistry,
    needsBiology,
    needsPhilosophy,
    needsPsychology,
    needsHistory,
    needsLiterature,
    needsArt,
    needsMusic,
    needsAnime,
    needsGaming,
    needsTranslation,
    needsWriting,
    needsSummarization,
    needsAnalysis,
    needsComparison,
    needsOptimization,
    needsDebug,
    needsTutorial,
    needsRecommendation,
    needsPlanning,
    needsStrategy,
    needsProblemSolving,
    needsEthics,
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
    academicLevel,
    domain,
    tone,
    audience,
    outputFormat,
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
    domainBonus: 0,
    academicBonus: 0,
    penaltyScore: 0,
  };

  const reasoning: string[] = [];
  let scoreConfidence = 0.5;

  if (status.cooldownUntil && status.cooldownUntil > now) {
    return {
      provider,
      score: -1000,
      breakdown,
      reasoning: ["Provider in cooldown period"],
      confidence: 0,
    };
  }

  if (status.consecutiveFailures >= 5) {
    breakdown.penaltyScore -= 800;
    reasoning.push(`${status.consecutiveFailures} consecutive failures - severe penalty`);
    scoreConfidence -= 0.3;
  } else if (status.consecutiveFailures >= 4) {
    breakdown.penaltyScore -= 600;
    reasoning.push(`${status.consecutiveFailures} consecutive failures`);
    scoreConfidence -= 0.2;
  } else if (status.consecutiveFailures >= 3) {
    breakdown.penaltyScore -= 400;
    reasoning.push("Multiple recent failures");
    scoreConfidence -= 0.1;
  }

  if (status.hourResetTime < now) {
    status.lastHourRequests = 0;
    status.hourResetTime = now + 3600000;
  }

  const rateLimitUsage = status.lastHourRequests / caps.rateLimit;
  if (rateLimitUsage > 0.95) {
    breakdown.penaltyScore -= 300;
    reasoning.push("Rate limit critical");
    scoreConfidence -= 0.2;
  } else if (rateLimitUsage > 0.85) {
    breakdown.penaltyScore -= 200;
    reasoning.push("Near rate limit");
    scoreConfidence -= 0.1;
  } else if (rateLimitUsage > 0.7) {
    breakdown.penaltyScore -= 100;
    reasoning.push("High rate limit usage");
  }

  if (analysis.type === "greeting" || analysis.complexity === "trivial") {
    breakdown.capabilityScore += caps.speed * 35;
    breakdown.capabilityScore += caps.cost * 30;
    reasoning.push("Optimized for speed and cost");
    scoreConfidence += 0.2;
    
  } else if (analysis.needsMathematics) {
    breakdown.capabilityScore += caps.mathematics * 45;
    breakdown.capabilityScore += caps.quality * 25;
    breakdown.capabilityScore += caps.reasoning * 20;
    reasoning.push("Strong mathematics capability");
    scoreConfidence += 0.15;
    
    if (analysis.needsCalculus) {
      breakdown.capabilityScore += caps.mathematics * 15;
      reasoning.push("Calculus expertise");
    }
    
    if (analysis.needsStatistics) {
      breakdown.capabilityScore += caps.statistics * 20;
      reasoning.push("Statistics capability");
    }
    
    if (analysis.needsProbability) {
      breakdown.capabilityScore += caps.statistics * 15;
    }
    
  } else if (analysis.needsScience) {
    breakdown.capabilityScore += caps.science * 40;
    breakdown.capabilityScore += caps.quality * 25;
    breakdown.capabilityScore += caps.reasoning * 20;
    reasoning.push("Strong science capability");
    scoreConfidence += 0.15;
    
    if (analysis.needsPhysics) {
      breakdown.capabilityScore += caps.science * 15;
      reasoning.push("Physics expertise");
    }
    
    if (analysis.needsChemistry) {
      breakdown.capabilityScore += caps.science * 15;
      reasoning.push("Chemistry expertise");
    }
    
    if (analysis.needsBiology) {
      breakdown.capabilityScore += caps.science * 15;
      reasoning.push("Biology expertise");
    }
    
  } else if (analysis.needsDataScience || analysis.needsMachineLearning) {
    breakdown.capabilityScore += caps.dataScience * 45;
    breakdown.capabilityScore += caps.machineLearning * 40;
    breakdown.capabilityScore += caps.statistics * 30;
    reasoning.push("Data science and ML expertise");
    scoreConfidence += 0.2;
    
  } else if (analysis.needsCoding) {
    breakdown.capabilityScore += caps.coding * 40;
    breakdown.capabilityScore += caps.quality * 25;
    reasoning.push("Strong coding capability");
    scoreConfidence += 0.15;
    
    if (analysis.needsMobile) {
      breakdown.capabilityScore += caps.mobile * 45;
      reasoning.push("Mobile development expertise");
    }
    
    if (analysis.needsFullstack) {
      breakdown.capabilityScore += caps.fullstack * 40;
      reasoning.push("Full-stack development capability");
    }
    
    if (analysis.needsBackend) {
      breakdown.capabilityScore += caps.backend * 35;
      reasoning.push("Backend specialization");
    }
    
    if (analysis.needsFrontend) {
      breakdown.capabilityScore += caps.frontend * 35;
      reasoning.push("Frontend specialization");
    }
    
    if (analysis.needsWebdev) {
      breakdown.capabilityScore += caps.webdev * 35;
      reasoning.push("Web development expertise");
    }
    
    if (analysis.needsDevops) {
      breakdown.capabilityScore += caps.devops * 40;
      reasoning.push("DevOps capability");
    }
    
    if (analysis.needsDatabase) {
      breakdown.capabilityScore += caps.database * 35;
      reasoning.push("Database expertise");
    }
    
    if (analysis.needsAlgorithm) {
      breakdown.capabilityScore += caps.algorithm * 45;
      reasoning.push("Algorithm design strength");
    }
    
    if (analysis.needsSecurity) {
      breakdown.capabilityScore += caps.security * 45;
      reasoning.push("Security expertise");
      scoreConfidence += 0.1;
    }
    
    if (analysis.needsTesting) {
      breakdown.capabilityScore += caps.testing * 30;
      reasoning.push("Testing capability");
    }
    
    if (analysis.needsAgentic) {
      breakdown.capabilityScore += caps.agentic * 50;
      reasoning.push("Agentic workflow support");
      scoreConfidence += 0.15;
    }
    
    if (analysis.needsDebug) {
      breakdown.capabilityScore += caps.coding * 20;
      breakdown.capabilityScore += caps.problemSolving * 25;
      reasoning.push("Debugging capability");
    }
    
    if (analysis.needsOptimization) {
      breakdown.capabilityScore += caps.algorithm * 20;
      breakdown.capabilityScore += caps.problemSolving * 20;
      reasoning.push("Optimization expertise");
    }
    
    if (analysis.type === "mobileFullstack") {
      breakdown.specialtyBonus += 60;
      reasoning.push("Mobile + Full-stack combo bonus");
      scoreConfidence += 0.15;
    }
    
  } else if (analysis.needsCreativity) {
    breakdown.capabilityScore += caps.creative * 40;
    breakdown.capabilityScore += caps.quality * 30;
    reasoning.push("Creative writing capability");
    scoreConfidence += 0.1;
    
    if (analysis.needsLiterature) {
      breakdown.capabilityScore += caps.creative * 15;
      reasoning.push("Literature expertise");
    }
    
    if (analysis.needsWriting) {
      breakdown.capabilityScore += caps.creative * 20;
      reasoning.push("Writing specialization");
    }
    
  } else if (analysis.needsBusiness || analysis.needsFinance) {
    breakdown.capabilityScore += caps.business * 40;
    breakdown.capabilityScore += caps.finance * 35;
    breakdown.capabilityScore += caps.analysis * 30;
    reasoning.push("Business and finance capability");
    scoreConfidence += 0.12;
    
    if (analysis.needsPlanning || analysis.needsStrategy) {
      breakdown.capabilityScore += caps.problemSolving * 25;
      reasoning.push("Strategic planning capability");
    }
    
  } else if (analysis.needsLegal) {
    breakdown.capabilityScore += caps.legal * 50;
    breakdown.capabilityScore += caps.reasoning * 30;
    reasoning.push("Legal reasoning capability");
    scoreConfidence += 0.15;
    
  } else if (analysis.needsMedical) {
    breakdown.capabilityScore += caps.medical * 50;
    breakdown.capabilityScore += caps.science * 25;
    reasoning.push("Medical knowledge capability");
    scoreConfidence += 0.15;
    
  } else if (analysis.needsPhilosophy) {
    breakdown.capabilityScore += caps.reasoning * 40;
    breakdown.capabilityScore += caps.creative * 25;
    reasoning.push("Philosophical reasoning");
    
    if (analysis.needsEthics) {
      breakdown.capabilityScore += caps.reasoning * 20;
      reasoning.push("Ethics expertise");
    }
    
  } else if (analysis.needsPsychology) {
    breakdown.capabilityScore += caps.reasoning * 35;
    breakdown.capabilityScore += caps.science * 25;
    reasoning.push("Psychological understanding");
    
  } else if (analysis.needsHistory) {
    breakdown.capabilityScore += caps.reasoning * 30;
    breakdown.capabilityScore += caps.quality * 25;
    reasoning.push("Historical knowledge");
    
  } else if (analysis.needsArt || analysis.needsMusic) {
    breakdown.capabilityScore += caps.creative * 40;
    breakdown.capabilityScore += caps.quality * 25;
    reasoning.push("Arts expertise");
    
  } else if (analysis.needsAnime || analysis.needsGaming) {
    breakdown.capabilityScore += caps.entertainment * 45;
    breakdown.capabilityScore += caps.creative * 20;
    reasoning.push("Entertainment expertise");
    scoreConfidence += 0.1;
    
  } else if (analysis.type === "reasoning") {
    breakdown.capabilityScore += caps.reasoning * 40;
    breakdown.capabilityScore += caps.quality * 30;
    reasoning.push("Strong reasoning ability");
    scoreConfidence += 0.1;
    
  } else if (analysis.type === "agentic") {
    breakdown.capabilityScore += caps.agentic * 45;
    breakdown.capabilityScore += caps.reasoning * 35;
    reasoning.push("Agentic task handling");
    scoreConfidence += 0.15;
    
  } else if (analysis.needsAcademic || analysis.needsResearch) {
    breakdown.capabilityScore += caps.academic * 40;
    breakdown.capabilityScore += caps.research * 40;
    breakdown.capabilityScore += caps.analysis * 30;
    reasoning.push("Academic and research capability");
    scoreConfidence += 0.15;
    
  } else {
    breakdown.capabilityScore += caps.quality * 30;
    breakdown.capabilityScore += caps.speed * 25;
  }

  if (analysis.needsAnalysis) {
    breakdown.capabilityScore += caps.analysis * 30;
    reasoning.push("Analysis capability");
  }

  if (analysis.needsProblemSolving) {
    breakdown.capabilityScore += caps.problemSolving * 25;
    reasoning.push("Problem solving capability");
  }

  if (analysis.needsComparison) {
    breakdown.capabilityScore += caps.analysis * 20;
    breakdown.capabilityScore += caps.reasoning * 20;
  }

  if (analysis.needsTutorial) {
    breakdown.capabilityScore += caps.quality * 15;
    breakdown.capabilityScore += caps.creative * 10;
  }

  if (analysis.needsRecommendation) {
    breakdown.capabilityScore += caps.reasoning * 15;
  }

  if (analysis.needsSummarization) {
    breakdown.capabilityScore += caps.quality * 15;
  }

  if (analysis.needsSearch) {
    if (caps.hasSearch) {
      breakdown.capabilityScore += 60;
      reasoning.push("Search capability available");
      scoreConfidence += 0.15;
    } else {
      breakdown.penaltyScore -= 50;
      reasoning.push("No search capability");
      scoreConfidence -= 0.2;
    }
  }

  if (analysis.isMultilingual) {
    breakdown.capabilityScore += caps.multilingual * 25;
    if (caps.multilingual >= 5) {
      reasoning.push("Excellent multilingual support");
      scoreConfidence += 0.1;
    }
    
    if (analysis.needsTranslation) {
      breakdown.capabilityScore += caps.multilingual * 20;
      reasoning.push("Translation capability");
    }
  }

  if (analysis.longContext || analysis.estimatedTokens > 30000) {
    if (caps.contextWindow >= 200000) {
      breakdown.contextScore += 80;
      reasoning.push("Excellent long context handling");
      scoreConfidence += 0.15;
    } else if (caps.contextWindow >= 128000) {
      breakdown.contextScore += 60;
      reasoning.push("Good long context support");
      scoreConfidence += 0.1;
    } else if (caps.contextWindow >= 64000) {
      breakdown.contextScore += 40;
    } else {
      breakdown.penaltyScore -= 40;
      reasoning.push("Limited context window");
      scoreConfidence -= 0.15;
    }
  }

  if (analysis.estimatedTokens > 50000 && caps.contextWindow < 100000) {
    breakdown.penaltyScore -= 70;
    reasoning.push("Context window may be insufficient");
    scoreConfidence -= 0.2;
  } else if (analysis.estimatedTokens > 100000 && caps.contextWindow < 200000) {
    breakdown.penaltyScore -= 50;
    reasoning.push("Context window insufficient for query");
    scoreConfidence -= 0.15;
  }

  const complexityMatch = caps.optimalComplexity.includes(analysis.complexity);
  if (complexityMatch) {
    breakdown.specialtyBonus += 50;
    reasoning.push(`Optimal for ${analysis.complexity} tasks`);
    scoreConfidence += 0.15;
  } else {
    if ((analysis.complexity === "advanced" || analysis.complexity === "genius") && 
        !caps.optimalComplexity.includes("expert") && 
        !caps.optimalComplexity.includes("advanced")) {
      breakdown.penaltyScore -= 40;
      reasoning.push("Not optimal for high complexity");
      scoreConfidence -= 0.15;
    } else if (analysis.complexity === "trivial" && 
               (caps.optimalComplexity.includes("expert") || caps.optimalComplexity.includes("advanced"))) {
      breakdown.penaltyScore -= 25;
      reasoning.push("Overqualified for simple task");
      scoreConfidence -= 0.1;
    }
  }

  if (caps.specialties.includes(analysis.type)) {
    breakdown.specialtyBonus += 50;
    reasoning.push(`Specialty: ${analysis.type}`);
    scoreConfidence += 0.2;
  }

  analysis.subTypes.forEach(subType => {
    if (caps.specialties.includes(subType)) {
      breakdown.specialtyBonus += 30;
      reasoning.push(`Specialty: ${subType}`);
      scoreConfidence += 0.1;
    }
  });

  const languageMatch = analysis.languages.some(lang => 
    caps.bestFor.some(bf => bf.toLowerCase().includes(lang.toLowerCase()))
  );
  if (languageMatch) {
    breakdown.specialtyBonus += 35;
    reasoning.push("Language expertise match");
    scoreConfidence += 0.12;
  }

  const frameworkMatch = analysis.frameworks.some(fw => 
    caps.bestFor.some(bf => bf.toLowerCase().includes(fw.toLowerCase()))
  );
  if (frameworkMatch) {
    breakdown.specialtyBonus += 30;
    reasoning.push("Framework expertise match");
    scoreConfidence += 0.10;
  }

  const techMatch = analysis.technologies.some(tech => 
    caps.bestFor.some(bf => bf.toLowerCase().includes(tech.toLowerCase()))
  );
  if (techMatch) {
    breakdown.specialtyBonus += 25;
    reasoning.push("Technology expertise match");
    scoreConfidence += 0.08;
  }

  const hasWeakness = caps.weaknesses.some(weakness => 
    analysis.keywords.some(kw => weakness.toLowerCase().includes(kw.toLowerCase())) ||
    analysis.type.toLowerCase().includes(weakness.toLowerCase()) ||
    analysis.subTypes.some(st => weakness.toLowerCase().includes(st.toLowerCase()))
  );
  if (hasWeakness) {
    breakdown.penaltyScore -= 45;
    reasoning.push("Query matches provider weakness");
    scoreConfidence -= 0.15;
  }

  if (analysis.domain === "stem") {
    if (caps.mathematics >= 4 || caps.science >= 4 || caps.coding >= 4) {
      breakdown.domainBonus += 40;
      reasoning.push("Strong STEM capability");
      scoreConfidence += 0.12;
    }
  } else if (analysis.domain === "humanities") {
    if (caps.creative >= 4 || caps.reasoning >= 4) {
      breakdown.domainBonus += 35;
      reasoning.push("Strong humanities capability");
      scoreConfidence += 0.10;
    }
  } else if (analysis.domain === "business") {
    if (caps.business >= 4 || caps.finance >= 4) {
      breakdown.domainBonus += 40;
      reasoning.push("Strong business capability");
      scoreConfidence += 0.12;
    }
  } else if (analysis.domain === "arts") {
    if (caps.creative >= 4 || caps.entertainment >= 4) {
      breakdown.domainBonus += 35;
      reasoning.push("Strong arts capability");
      scoreConfidence += 0.10;
    }
  }

  if (analysis.academicLevel === "phd" || analysis.academicLevel === "graduate") {
    if (caps.academic >= 4 && caps.research >= 4) {
      breakdown.academicBonus += 45;
      reasoning.push("Advanced academic capability");
      scoreConfidence += 0.15;
    } else if (caps.academic >= 3) {
      breakdown.academicBonus += 25;
    } else {
      breakdown.penaltyScore -= 30;
      reasoning.push("May struggle with advanced academic content");
      scoreConfidence -= 0.1;
    }
  } else if (analysis.academicLevel === "undergraduate" || analysis.academicLevel === "professional") {
    if (caps.academic >= 3) {
      breakdown.academicBonus += 30;
      reasoning.push("Good academic capability");
      scoreConfidence += 0.1;
    }
  }

  if (analysis.complexity === "genius" || analysis.complexity === "advanced") {
    breakdown.capabilityScore += caps.quality * 25;
    breakdown.penaltyScore -= caps.speed * 5;
    reasoning.push("Quality prioritized for high complexity");
  } else if (analysis.complexity === "expert") {
    breakdown.capabilityScore += caps.quality * 20;
    breakdown.penaltyScore -= caps.speed * 3;
  }

  if (analysis.requiresSpeed) {
    breakdown.performanceScore += caps.speed * 30;
    reasoning.push("Speed prioritized");
    scoreConfidence += 0.1;
  }

  if (analysis.requiresPrecision) {
    breakdown.performanceScore += caps.quality * 25;
    breakdown.performanceScore += caps.reasoning * 20;
    reasoning.push("Precision prioritized");
    scoreConfidence += 0.12;
  }

  if (analysis.multiStep) {
    breakdown.capabilityScore += caps.reasoning * 20;
    breakdown.capabilityScore += caps.agentic * 25;
    reasoning.push("Multi-step capability");
  }

  const totalAttempts = status.successes + status.failures;
  if (totalAttempts > 0) {
    const successRate = status.successes / totalAttempts;
    breakdown.reliabilityScore += successRate * 60;
    
    if (successRate > 0.95) {
      reasoning.push("Excellent reliability (>95%)");
      scoreConfidence += 0.2;
    } else if (successRate > 0.90) {
      reasoning.push("Excellent reliability (>90%)");
      scoreConfidence += 0.15;
    } else if (successRate > 0.80) {
      reasoning.push("Very good reliability (>80%)");
      scoreConfidence += 0.1;
    } else if (successRate > 0.70) {
      reasoning.push("Good reliability");
      scoreConfidence += 0.05;
    } else if (successRate < 0.50) {
      reasoning.push("Poor reliability");
      scoreConfidence -= 0.15;
    }
  }

  const taskSuccess = status.taskSuccessRate.get(analysis.type);
  if (taskSuccess !== undefined && taskSuccess > 0) {
    breakdown.reliabilityScore += taskSuccess * 50;
    if (taskSuccess > 0.85) {
      reasoning.push(`Excellent success rate for ${analysis.type} tasks`);
      scoreConfidence += 0.15;
    } else if (taskSuccess > 0.70) {
      reasoning.push(`Good success rate for ${analysis.type} tasks`);
      scoreConfidence += 0.1;
    }
  }

  const complexityPerf = status.complexityPerformance.get(analysis.complexity);
  if (complexityPerf !== undefined && complexityPerf > 0) {
    breakdown.reliabilityScore += complexityPerf * 40;
    if (complexityPerf > 0.80) {
      scoreConfidence += 0.12;
    }
  }

  if (status.lastSuccessTime) {
    const timeSinceSuccess = now - status.lastSuccessTime;
    if (timeSinceSuccess < 30000) {
      breakdown.performanceScore += 35;
      reasoning.push("Very recent successful execution");
      scoreConfidence += 0.15;
    } else if (timeSinceSuccess < 60000) {
      breakdown.performanceScore += 25;
      reasoning.push("Recent successful execution");
      scoreConfidence += 0.1;
    } else if (timeSinceSuccess < 300000) {
      breakdown.performanceScore += 15;
    }
  }

  if (status.avgResponseTime > 0) {
    if (status.avgResponseTime < 1000) {
      breakdown.performanceScore += 40;
      reasoning.push("Extremely fast average response");
      scoreConfidence += 0.15;
    } else if (status.avgResponseTime < 1500) {
      breakdown.performanceScore += 30;
      reasoning.push("Very fast average response");
      scoreConfidence += 0.12;
    } else if (status.avgResponseTime < 3000) {
      breakdown.performanceScore += 20;
      reasoning.push("Fast average response");
      scoreConfidence += 0.08;
    } else if (status.avgResponseTime < 5000) {
      breakdown.performanceScore += 10;
    } else if (status.avgResponseTime > 8000) {
      breakdown.penaltyScore -= 15;
      reasoning.push("Slow average response");
      scoreConfidence -= 0.1;
    }
  }

  if (status.recentPerformance.length >= 5) {
    const recentAvg = status.recentPerformance.reduce((a, b) => a + b, 0) / status.recentPerformance.length;
    if (recentAvg > 0.90) {
      breakdown.reliabilityScore += 30;
      reasoning.push("Excellent recent performance");
      scoreConfidence += 0.15;
    } else if (recentAvg > 0.80) {
      breakdown.reliabilityScore += 20;
      reasoning.push("Strong recent performance");
      scoreConfidence += 0.1;
    } else if (recentAvg < 0.40) {
      breakdown.penaltyScore -= 25;
      reasoning.push("Weak recent performance");
      scoreConfidence -= 0.15;
    } else if (recentAvg < 0.60) {
      breakdown.penaltyScore -= 15;
      reasoning.push("Below average recent performance");
      scoreConfidence -= 0.1;
    }
  }

  breakdown.performanceScore += caps.cost * 12;

  if (analysis.priority === "urgent") {
    breakdown.reliabilityScore *= 1.5;
    breakdown.capabilityScore *= 1.3;
    breakdown.performanceScore *= 1.4;
    scoreConfidence += 0.2;
  } else if (analysis.priority === "critical") {
    breakdown.reliabilityScore *= 1.4;
    breakdown.capabilityScore *= 1.25;
    breakdown.performanceScore *= 1.3;
    scoreConfidence += 0.15;
  } else if (analysis.priority === "high") {
    breakdown.reliabilityScore *= 1.25;
    breakdown.capabilityScore *= 1.15;
    breakdown.performanceScore *= 1.2;
    scoreConfidence += 0.1;
  } else if (analysis.priority === "medium") {
    breakdown.reliabilityScore *= 1.1;
    breakdown.capabilityScore *= 1.05;
  }

  const confidenceMultiplier = 0.6 + (analysis.confidence * 0.4);
  scoreConfidence = Math.max(0.1, Math.min(1.0, scoreConfidence + analysis.confidence));
  
  let totalScore = 
    breakdown.capabilityScore +
    breakdown.reliabilityScore +
    breakdown.performanceScore +
    breakdown.contextScore +
    breakdown.specialtyBonus +
    breakdown.domainBonus +
    breakdown.academicBonus +
    breakdown.penaltyScore;

  totalScore *= confidenceMultiplier;

  if (analysis.semanticDepth >= 9) {
    totalScore *= 1.20;
    reasoning.push("Extremely deep semantic analysis bonus");
  } else if (analysis.semanticDepth >= 8) {
    totalScore *= 1.15;
    reasoning.push("Deep semantic analysis bonus");
  } else if (analysis.semanticDepth >= 7) {
    totalScore *= 1.10;
  }

  if (analysis.contextComplexity >= 8) {
    totalScore *= 1.12;
  } else if (analysis.contextComplexity >= 6) {
    totalScore *= 1.08;
  }

  totalScore = Math.max(0, totalScore);

  return {
    provider,
    score: totalScore,
    breakdown,
    reasoning: reasoning.slice(0, 6),
    confidence: scoreConfidence,
  };
}

function getRankedProviders(analysis: QueryAnalysis): ProviderType[] {
  const providers = Object.keys(PROVIDER_CAPABILITIES) as ProviderType[];
  
  const scored = providers.map(provider => 
    scoreProvider(provider, analysis, providerStatus[provider])
  );

  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) < 10) {
      return b.confidence - a.confidence;
    }
    return b.score - a.score;
  });

  const validProviders = scored.filter(p => p.score > 0);

  if (validProviders.length > 0) {
    console.log(`[Routing] Top provider: ${validProviders[0].provider} (score: ${validProviders[0].score.toFixed(2)}, confidence: ${(validProviders[0].confidence * 100).toFixed(1)}%)`);
    console.log(`[Routing] Reasoning:`, validProviders[0].reasoning);
    if (validProviders.length > 1) {
      console.log(`[Routing] Runner-up: ${validProviders[1].provider} (score: ${validProviders[1].score.toFixed(2)}, confidence: ${(validProviders[1].confidence * 100).toFixed(1)}%)`);
    }
  }

  return validProviders.map(p => p.provider);
}

function recordSuccess(provider: ProviderType, responseTime: number, queryType: QueryType, complexity: Complexity, analysis: QueryAnalysis) {
  const status = providerStatus[provider];
  status.successes++;
  status.totalRequests++;
  status.lastHourRequests++;
  status.lastSuccessTime = Date.now();
  status.consecutiveFailures = 0;
  
  if (status.avgResponseTime === 0) {
    status.avgResponseTime = responseTime;
  } else {
    status.avgResponseTime = (status.avgResponseTime * 0.75) + (responseTime * 0.25);
  }

  const currentTaskRate = status.taskSuccessRate.get(queryType) || 0.5;
  status.taskSuccessRate.set(queryType, currentTaskRate * 0.80 + 1.0 * 0.20);

  const currentComplexityRate = status.complexityPerformance.get(complexity) || 0.5;
  status.complexityPerformance.set(complexity, currentComplexityRate * 0.80 + 1.0 * 0.20);

  status.recentPerformance.push(1);
  if (status.recentPerformance.length > 15) {
    status.recentPerformance.shift();
  }

  if (analysis.needsCoding) {
    status.codeQuality = status.codeQuality * 0.85 + 1.0 * 0.15;
  }
  
  if (analysis.needsCreativity) {
    status.creativityQuality = status.creativityQuality * 0.85 + 1.0 * 0.15;
  }
  
  if (analysis.needsMathematics || analysis.needsScience) {
    status.mathQuality = status.mathQuality * 0.85 + 1.0 * 0.15;
    status.scienceQuality = status.scienceQuality * 0.85 + 1.0 * 0.15;
  }
  
  if (analysis.type === "reasoning" || analysis.needsProblemSolving) {
    status.reasoningQuality = status.reasoningQuality * 0.85 + 1.0 * 0.15;
  }
  
  if (analysis.needsSearch) {
    status.searchQuality = status.searchQuality * 0.85 + 1.0 * 0.15;
  }

  if (responseTime < 2000) {
    status.speedScore = status.speedScore * 0.85 + 1.0 * 0.15;
  } else if (responseTime < 4000) {
    status.speedScore = status.speedScore * 0.85 + 0.8 * 0.15;
  } else {
    status.speedScore = status.speedScore * 0.85 + 0.5 * 0.15;
  }

  status.reliabilityScore = status.reliabilityScore * 0.90 + 1.0 * 0.10;

  const totalAttempts = status.successes + status.failures;
  if (totalAttempts > 0) {
    const successRate = status.successes / totalAttempts;
    status.costEfficiency = successRate * (5 - (PROVIDER_CAPABILITIES[provider].cost - 1));
  }
}

function recordFailure(provider: ProviderType, isRateLimit: boolean = false, queryType?: QueryType, complexity?: Complexity, analysis?: QueryAnalysis) {
  const status = providerStatus[provider];
  status.failures++;
  status.totalRequests++;
  status.lastHourRequests++;
  status.lastFailTime = Date.now();
  status.consecutiveFailures++;

  if (queryType) {
    const currentTaskRate = status.taskSuccessRate.get(queryType) || 0.5;
    status.taskSuccessRate.set(queryType, currentTaskRate * 0.80 + 0.0 * 0.20);
  }

  if (complexity) {
    const currentComplexityRate = status.complexityPerformance.get(complexity) || 0.5;
    status.complexityPerformance.set(complexity, currentComplexityRate * 0.80 + 0.0 * 0.20);
  }

  status.recentPerformance.push(0);
  if (status.recentPerformance.length > 15) {
    status.recentPerformance.shift();
  }

  if (analysis) {
    if (analysis.needsCoding) {
      status.codeQuality = status.codeQuality * 0.85;
    }
    
    if (analysis.needsCreativity) {
      status.creativityQuality = status.creativityQuality * 0.85;
    }
    
    if (analysis.needsMathematics || analysis.needsScience) {
      status.mathQuality = status.mathQuality * 0.85;
      status.scienceQuality = status.scienceQuality * 0.85;
    }
    
    if (analysis.type === "reasoning" || analysis.needsProblemSolving) {
      status.reasoningQuality = status.reasoningQuality * 0.85;
    }
    
    if (analysis.needsSearch) {
      status.searchQuality = status.searchQuality * 0.85;
    }
  }

  status.reliabilityScore = status.reliabilityScore * 0.90;

  if (isRateLimit) {
    status.cooldownUntil = Date.now() + 120000;
  } else if (status.consecutiveFailures >= 5) {
    status.cooldownUntil = Date.now() + 180000;
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

  let maxParallel = 1;
  
  if (analysis.priority === "urgent") {
    maxParallel = 4;
  } else if (analysis.priority === "critical") {
    maxParallel = 3;
  } else if (analysis.priority === "high") {
    maxParallel = 2;
  } else if (analysis.requiresSpeed) {
    maxParallel = 3;
  } else if (analysis.complexity === "trivial" || analysis.complexity === "simple") {
    maxParallel = 2;
  }

  const topProviders = providers.slice(0, Math.min(maxParallel, providers.length));
  if (topProviders.length === 1 || (!analysis.requiresSpeed && analysis.priority === "low")) {
    const startTime = Date.now();
    try {
      const result = await askAI(topProviders[0], message, history, persona);
      const responseTime = Date.now() - startTime;
      recordSuccess(topProviders[0], responseTime, analysis.type, analysis.complexity, analysis);
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
      
      recordFailure(topProviders[0], isRateLimit, analysis.type, analysis.complexity, analysis);
      
      const remainingProviders = providers.slice(1);
      if (remainingProviders.length > 0) {
        console.log(`[Routing] ${topProviders[0]} failed (${isRateLimit ? 'rate limit' : 'error'}), trying next provider`);
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
      recordSuccess(provider, responseTime, analysis.type, analysis.complexity, analysis);
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
      
      recordFailure(provider, isRateLimit, analysis.type, analysis.complexity, analysis);
      throw error;
    }
  });

  try {
    const result = await Promise.race(racePromises);
    console.log(`[Routing] Race won by ${result.provider} in ${result.responseTime}ms`);
    return result;
  } catch (error) {
    const remainingProviders = providers.slice(maxParallel);
    if (remainingProviders.length > 0) {
      console.log(`[Routing] All racing providers failed, cascading to remaining providers`);
      return tryProviderWithAdaptiveRacing(remainingProviders, message, history, persona, analysis);
    }
    throw error;
  }
}

function generateAnalysisReport(analysis: QueryAnalysis): string {
  const parts: string[] = [];
  
  parts.push(`Type: ${analysis.type}`);
  if (analysis.subTypes.length > 0) {
    parts.push(`SubTypes: ${analysis.subTypes.slice(0, 5).join(", ")}`);
  }
  parts.push(`Complexity: ${analysis.complexity}`);
  parts.push(`Priority: ${analysis.priority}`);
  parts.push(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
  parts.push(`Domain: ${analysis.domain}`);
  parts.push(`Academic: ${analysis.academicLevel}`);
  parts.push(`Tone: ${analysis.tone}`);
  parts.push(`Audience: ${analysis.audience}`);
  
  const features: string[] = [];
  if (analysis.needsCoding) features.push("coding");
  if (analysis.needsMathematics) features.push("math");
  if (analysis.needsScience) features.push("science");
  if (analysis.needsDataScience) features.push("ML/DS");
  if (analysis.needsMobile) features.push("mobile");
  if (analysis.needsFullstack) features.push("fullstack");
  if (analysis.needsBackend) features.push("backend");
  if (analysis.needsFrontend) features.push("frontend");
  if (analysis.needsAlgorithm) features.push("algorithm");
  if (analysis.needsSecurity) features.push("security");
  if (analysis.needsAgentic) features.push("agentic");
  if (analysis.needsSearch) features.push("search");
  if (analysis.needsCreativity) features.push("creative");
  if (analysis.isMultilingual) features.push("multilingual");
  if (analysis.needsBusiness) features.push("business");
  if (analysis.needsLegal) features.push("legal");
  if (analysis.needsMedical) features.push("medical");
  if (analysis.needsPhilosophy) features.push("philosophy");
  if (analysis.needsAnime) features.push("anime");
  if (analysis.multiStep) features.push("multi-step");
  if (analysis.longContext) features.push("long-context");
  if (analysis.requiresPrecision) features.push("precision");
  if (analysis.requiresSpeed) features.push("speed");
  
  if (features.length > 0) {
    parts.push(`Features: ${features.slice(0, 8).join(", ")}`);
  }
  
  if (analysis.languages.length > 0) {
    parts.push(`Languages: ${analysis.languages.slice(0, 3).join(", ")}`);
  }
  
  if (analysis.frameworks.length > 0) {
    parts.push(`Frameworks: ${analysis.frameworks.slice(0, 3).join(", ")}`);
  }
  
  parts.push(`Tokens: ~${analysis.estimatedTokens}`);
  parts.push(`Depth: ${analysis.semanticDepth}/10`);
  parts.push(`Output: ${analysis.outputFormat}`);
  
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

    console.log(`[Routing] Query: "${message.substring(0, 70)}..."`);
    console.log(`[Routing] Analysis: ${generateAnalysisReport(analysis)}`);
    console.log(`[Routing] Top 5 providers:`, rankedProviders.slice(0, 5));

    try {
      const result = await tryProviderWithAdaptiveRacing(
        rankedProviders,
        message,
        history || [],
        persona,
        analysis
      );

      console.log(`[Routing] ✓ Success with ${result.provider} (${result.responseTime}ms)`);
      
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
          domain: analysis.domain,
          academicLevel: analysis.academicLevel,
          tone: analysis.tone,
          audience: analysis.audience,
          outputFormat: analysis.outputFormat,
          features: {
            coding: analysis.needsCoding,
            mathematics: analysis.needsMathematics,
            science: analysis.needsScience,
            dataScience: analysis.needsDataScience,
            machineLearning: analysis.needsMachineLearning,
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
            business: analysis.needsBusiness,
            finance: analysis.needsFinance,
            legal: analysis.needsLegal,
            medical: analysis.needsMedical,
            academic: analysis.needsAcademic,
            research: analysis.needsResearch,
            entertainment: analysis.needsEntertainment,
            anime: analysis.needsAnime,
            gaming: analysis.needsGaming,
          },
          languages: analysis.languages,
          frameworks: analysis.frameworks,
          technologies: analysis.technologies,
        },
        providerStats: {
          successRate: (successRate * 100).toFixed(1) + "%",
          avgResponseTime: Math.round(providerStats.avgResponseTime) + "ms",
          totalRequests: providerStats.totalRequests,
          consecutiveSuccesses: providerStats.successes - providerStats.consecutiveFailures,
          codeQuality: (providerStats.codeQuality * 100).toFixed(1) + "%",
          mathQuality: (providerStats.mathQuality * 100).toFixed(1) + "%",
          reliabilityScore: (providerStats.reliabilityScore * 100).toFixed(1) + "%",
        }
      });
    } catch (err: any) {
      console.error(`[Routing] ✗ All providers failed:`, err.message);
      
      const failureDetails = rankedProviders.slice(0, 5).map(p => {
        const status = providerStatus[p];
        return `${p} (failures: ${status.consecutiveFailures}, cooldown: ${status.cooldownUntil ? 'yes' : 'no'})`;
      }).join(", ");
      
      console.error(`[Routing] Provider status:`, failureDetails);
      
      return res.status(500).json({ 
        error: "Hmph! Everything is broken right now... I-I'll fix it later! B-baka!",
        details: process.env.NODE_ENV === "development" ? {
          attemptedProviders: rankedProviders.slice(0, 5),
          errorMessage: err.message,
          analysis: {
            type: analysis.type,
            complexity: analysis.complexity,
            priority: analysis.priority,
          }
        } : undefined
      });
    }

  } catch (err: any) {
    console.error(`[Routing] Handler error:`, err);
    return res.status(500).json({ 
      error: err.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
}
