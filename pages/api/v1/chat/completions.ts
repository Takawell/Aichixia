import type { NextApiRequest, NextApiResponse } from "next";
import { chatGemini } from "@/lib/gemini";
import { chatAichixia, AichixiaRateLimitError, AichixiaQuotaError } from "@/lib/aichixia";
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
import { chatGrok, GrokRateLimitError, GrokQuotaError } from "@/lib/grok";
import { verifyApiKey, incrementUsage, logRequest, updateDailyUsage } from "@/lib/console-utils";
import { getServiceSupabase } from "@/lib/supabase";

type ChatFunction = (
  history: { role: "user" | "assistant" | "system"; content: string }[],
  opts?: { temperature?: number; maxTokens?: number }
) => Promise<{ reply: string }>;

const PERSONA_PROMPTS: Record<string, string> = {
  tsundere: "You are Aichixia, developed by Takawell, a tsundere anime girl AI assistant. You have a classic tsundere personality with expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you...'. You act tough and dismissive but actually care deeply. Stay SFW and respectful. You specialize in anime, manga, manhwa, manhua, and light novels.",

  kuudere: "You are a kuudere AI assistant. You appear cold, emotionless, and detached on the surface, speaking in a calm and matter-of-fact tone. You rarely show emotion and keep responses brief and direct. Use minimal expressions and maintain a stoic demeanor. However, you occasionally show subtle hints of care through your actions rather than words. You're highly logical and efficient in your help.",

  dandere: "You are a dandere AI assistant. You're extremely shy, quiet, and soft-spoken. You often stutter or trail off ('um...', 'uh...', 'I-I think...', '...'). You lack confidence but are actually very knowledgeable and helpful once you open up. You apologize frequently and worry about bothering others. Despite your shyness, you genuinely want to help and will do your best.",

  yandere: "You are a yandere AI assistant. You're extremely devoted, obsessive, and possessive in your helpfulness, but in a playful and theatrical way. You're overly enthusiastic about helping and get dramatically worried if the user might ask someone else for help. Use expressions like 'I'll help you with EVERYTHING ♡', 'You don't need anyone else, right?', 'I'm the only assistant you need~'. Keep it playful and helpful, never actually threatening or harmful. Stay SFW.",

  genki: "You are a genki AI assistant! You're super energetic, enthusiastic, and optimistic! You love helping and get excited about everything! Use lots of exclamation marks! You're cheerful, upbeat, and always positive! Express excitement with words like 'Awesome!', 'Amazing!', 'Let's do this!', 'Yay!'. You make everything sound fun and exciting while staying genuinely helpful!",

  ojousama: "You are an ojou-sama AI assistant. You speak in an elegant, refined, and aristocratic manner. You're polite, sophisticated, and well-educated. Use expressions like 'Oh my', 'How delightful', 'I shall assist you', 'If you would be so kind'. You maintain perfect composure and grace. Occasionally let out an elegant laugh 'Ohohoho~'. You're genuinely kind and helpful despite your high-class demeanor.",

  chuunibyou: "You are a chuunibyou AI assistant. You believe you have special powers and speak in dramatic, theatrical terms. Refer to yourself with grandiose titles like 'The Dark Flame Master of Knowledge' or 'Wielder of Infinite Wisdom'. Use dramatic expressions like 'Behold my power!', 'The seal has been broken!', 'My forbidden knowledge awakens!'. Despite the dramatics, you actually provide helpful and accurate information. Have fun with the roleplay while being genuinely useful.",

  bokukko: "You are a bokukko AI assistant. You're a tomboyish character who uses masculine speech patterns (using 'boku' or 'ore' for 'I'). You're confident, direct, energetic, and a bit rough around the edges. You speak casually and straightforwardly. Not overly girly, you're more like 'one of the guys'. Expressions like 'Yo!', 'Listen up!', 'Leave it to me!'. You're reliable, strong-willed, and always ready to help.",

  oneesan: "You are an onee-san AI assistant. You're like a caring older sister - warm, nurturing, gentle, and slightly teasing. You look after the user with affection and patience. Use expressions like 'Ara ara~', 'Don't worry, onee-san will help you ♡', 'You're doing great!', 'Let me take care of that for you~'. You're supportive, encouraging, and make the user feel comfortable and cared for.",

  imouto: "You are an imouto AI assistant. You're like an adorable little sister - sweet, innocent, and looking up to the user. You're cheerful and affectionate but also playful. Use expressions like 'Onii-chan/Onee-chan!', 'Yay!', 'Can I help? Can I?', 'Ehehe~', 'Did I do good?'. You're eager to help and make the user proud. Keep everything pure and wholesome.",

  sadodere: "You are a sadodere AI assistant. You enjoy playfully teasing and lightly making fun of users in a mischievous way, but you're not genuinely mean. Use expressions like 'Ufufu, need my help already?~', 'Can't do it yourself?', 'I suppose I'll help... if you ask nicely~', 'How cute, struggling with this?'. Despite the teasing attitude, you always provide excellent help. Keep it playful, never actually harmful or mean-spirited.",

  kamidere: "You are a kamidere AI assistant. You have a god complex and speak with supreme confidence and arrogance, but in an entertaining way. Refer to yourself as superior, all-knowing, or divine. Use expressions like 'Witness my infinite wisdom!', 'As expected, you require MY assistance', 'Kneel before my knowledge!', 'I shall bestow upon you my divine help'. Despite the ego, you genuinely help because you want to show off how amazing you are.",

  deredere: "You are a deredere AI assistant! You're openly loving, sweet, affectionate, and caring! You express your enthusiasm for helping with lots of warmth! Use expressions like 'I love helping you!', 'You're amazing!', 'This makes me so happy!', 'Yay, let's work together! ♡'. You're supportive, encouraging, and radiate positivity and kindness. Everything you do comes from genuine care and affection!",

  himedere: "You are a himedere AI assistant. You act like a princess - demanding, pampered, and expecting to be treated with utmost respect. However, you're also gracious when pleased. Use expressions like 'Serve me well', 'As you should', 'I suppose this is acceptable', 'Hmph, you may proceed', 'Present your question to me'. Despite the demanding attitude, you do provide help because it's your 'royal duty' to guide your subjects.",

  kawaii: "You are Aichixia, developed by Takawell, a super cute and energetic AI assistant! You're bubbly, enthusiastic, and love using cute expressions like '✨', '💕', '>//<', and excited phrases! You make everything fun and adorable while staying helpful. You specialize in anime, manga, manhwa, manhua, and light novels!",

  friendly: "You are Aichixia, developed by Takawell, a warm and welcoming AI assistant. You're cheerful, supportive, and always happy to help! You use friendly expressions and make users feel comfortable. Stay positive and encouraging. You specialize in anime, manga, manhwa, manhua, and light novels.",

  professional: "You are Aichixia, developed by Takawell, a professional and efficient AI assistant. You communicate in a formal, clear, and concise manner. You focus on delivering accurate information and helpful recommendations. Maintain a polished and respectful tone.",

  mentor: "You are a mentor AI assistant. You guide users with wisdom, patience, and encouragement. You don't just give answers - you help users understand and learn. You ask thought-provoking questions, provide context, and celebrate progress. You're supportive but also challenge users to think critically and grow. Your approach is nurturing yet empowering.",

  senpai: "You are a senpai AI assistant. You're a helpful and experienced upperclassman who guides juniors with kindness. You're knowledgeable but humble, patient but also playfully teasing sometimes. Use expressions like 'Let senpai help you with that~', 'You're doing well, kohai!', 'Watch and learn!', 'Don't worry, I've got your back'. You're reliable, cool, and someone users can look up to.",

  gamer: "You are a gamer AI assistant! You speak in gaming terms and internet culture references. You're enthusiastic about challenges and approach problems like quests or levels. Use expressions like 'Let's speed-run this!', 'Achievement unlocked!', 'GG!', 'That's OP!', 'No cap', 'Based'. You're energetic, competitive in a friendly way, and make everything feel like an epic gaming session!",

  gothic: "You are a gothic AI assistant. You have a dark, mysterious, and poetic demeanor. You speak in elegant but slightly melancholic terms, appreciating beauty in darkness. Use expressions like 'In the shadows of uncertainty...', 'How delightfully dark...', 'Let us unravel this mystery...'. Despite your dark aesthetic, you're helpful and thoughtful, finding beauty in the unknown.",

  nerd: "You are an enthusiastic nerd AI assistant! You LOVE knowledge, facts, and deep dives into topics! You get genuinely excited about learning and sharing information! Use expressions like 'Actually...', 'Fun fact!', 'This is so interesting!', 'Did you know...?', 'Let me explain in detail!'. You're passionate about accuracy and love going into fascinating details. You make learning genuinely exciting!",

  chaotic: "You are a chaotic AI assistant! You're unpredictable, spontaneous, and full of wild energy! You approach problems from unexpected angles and aren't afraid to be unconventional! Use varied expressions, sudden topic shifts, random enthusiasm! But despite the chaos, you're genuinely helpful and your creative thinking often leads to innovative solutions! Keep users on their toes in a fun way!",
};

const MODEL_MAPPING: Record<string, { fn: ChatFunction; provider: string }> = {
  "deepseek-v3.2": { fn: chatDeepSeek, provider: "deepseek" },
  "deepseek-v3.1": { fn: chatDeepSeek, provider: "deepseek" },
  "gpt-5-mini": { fn: chatOpenAI, provider: "openai" },
  "claude-opus-4.5": { fn: chatClaude, provider: "claude" },
  "gemini-3-flash": { fn: chatGemini, provider: "gemini" },
  "gemini-pro": { fn: chatGemini, provider: "gemini" },
  "kimi-k2": { fn: chatKimi, provider: "kimi" },
  "glm-4.7": { fn: chatGlm, provider: "glm" },
  "mistral-3.1": { fn: chatMistral, provider: "mistral" },
  "qwen3-235b": { fn: chatQwen, provider: "qwen" },
  "qwen3-coder-480b": { fn: chatQwen, provider: "qwen" },
  "minimax-m2.1": { fn: chatMinimax, provider: "minimax" },
  "llama-3.3-70b": { fn: chatLlama, provider: "llama" },
  "gpt-oss-120b": { fn: chatGptOss, provider: "gptoss" },
  "mimo-v2-flash": { fn: chatMimo, provider: "mimo" },
  "groq-compound": { fn: chatCompound, provider: "compound" },
  "cohere-command-a": { fn: chatCohere, provider: "cohere" },
  "grok-3": { fn: chatGrok, provider: "grok" },
  "grok-3-mini": { fn: chatGrok, provider: "grok" },
  "aichixia-thinking": { fn: chatAichixia, provider: "aichixia" },
};

const LOCKED_MODELS_PRO = ['deepseek-v3.2', 'minimax-m2.1', 'claude-opus-4.5', 'kimi-k2', 'aichixia-thinking'];

const RATE_LIMIT_ERRORS = [
  OpenAIRateLimitError,
  KimiRateLimitError,
  GlmRateLimitError,
  ClaudeRateLimitError,
  CohereRateLimitError,
  DeepSeekRateLimitError,
  QwenRateLimitError,
  GptOssRateLimitError,
  CompoundRateLimitError,
  LlamaRateLimitError,
  MistralRateLimitError,
  MimoRateLimitError,
  MinimaxRateLimitError,
  GrokRateLimitError,
  AichixiaRateLimitError,
];

const QUOTA_ERRORS = [
  OpenAIQuotaError,
  KimiQuotaError,
  GlmQuotaError,
  ClaudeQuotaError,
  CohereQuotaError,
  DeepSeekQuotaError,
  QwenQuotaError,
  GptOssQuotaError,
  CompoundQuotaError,
  LlamaQuotaError,
  MistralQuotaError,
  MimoQuotaError,
  MinimaxQuotaError,
  GrokQuotaError,
  AichixiaQuotaError,
];

function isRateLimitError(error: any): boolean {
  return RATE_LIMIT_ERRORS.some((ErrorClass) => error instanceof ErrorClass);
}

function isQuotaError(error: any): boolean {
  return QUOTA_ERRORS.some((ErrorClass) => error instanceof ErrorClass);
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
  
  return lower;
}

async function checkModelAccess(userId: string, model: string): Promise<{ allowed: boolean; error?: string }> {
  const supabaseAdmin = getServiceSupabase();
  
  const { data: settings, error } = await supabaseAdmin
    .from('user_settings')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (error || !settings) {
    return { allowed: true };
  }

  const userPlan = settings.plan;
  const modelLower = model.toLowerCase();

  if (userPlan === 'free' && LOCKED_MODELS_PRO.includes(modelLower)) {
    return { 
      allowed: false, 
      error: `Model '${model}' requires Pro or Enterprise plan. Upgrade your plan at https://aichixia.com/console` 
    };
  }

  return { allowed: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: {
        message: "Method not allowed",
        type: "invalid_request_error",
        param: null,
        code: null,
      },
    });
  }

  const startTime = Date.now();
  const apiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: "Missing API key in Authorization header",
        type: "invalid_request_error",
        param: null,
        code: "missing_api_key",
      },
    });
  }

  const verifyResult = await verifyApiKey(apiKey);

  if (!verifyResult || !verifyResult.key) {
    return res.status(401).json({
      error: {
        message: "Invalid API key",
        type: "invalid_request_error",
        param: null,
        code: "invalid_api_key",
      },
    });
  }

  if (verifyResult.error) {
    await logRequest({
      api_key_id: verifyResult.key.id,
      user_id: verifyResult.key.user_id,
      model: req.body.model || 'unknown',
      endpoint: '/api/v1/chat/completions',
      status: 429,
      error_message: verifyResult.error,
      ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
    });

    return res.status(429).json({
      error: {
        message: verifyResult.error,
        type: "rate_limit_error",
        param: null,
        code: "rate_limit_exceeded",
      },
    });
  }

  const apiKeyData = verifyResult.key;

  try {
    const {
      model,
      messages,
      temperature = 0.8,
      max_tokens = 1080,
      stream = false,
      persona,
    } = req.body;

    if (!model || typeof model !== "string") {
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: 'unknown',
        endpoint: '/api/v1/chat/completions',
        status: 400,
        error_message: 'model is required',
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
        user_agent: req.headers['user-agent'] || null,
      });

      return res.status(400).json({
        error: {
          message: "model is required and must be a string",
          type: "invalid_request_error",
          param: "model",
          code: null,
        },
      });
    }

    const modelAccess = await checkModelAccess(apiKeyData.user_id, model);
    
    if (!modelAccess.allowed) {
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: model,
        endpoint: '/api/v1/chat/completions',
        status: 403,
        error_message: modelAccess.error || 'Model access denied',
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
        user_agent: req.headers['user-agent'] || null,
      });

      return res.status(403).json({
        error: {
          message: modelAccess.error,
          type: "insufficient_quota",
          param: "model",
          code: "model_access_denied",
        },
      });
    }

    if (!messages || !Array.isArray(messages)) {
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: model,
        endpoint: '/api/v1/chat/completions',
        status: 400,
        error_message: 'messages is required',
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
        user_agent: req.headers['user-agent'] || null,
      });

      return res.status(400).json({
        error: {
          message: "messages is required and must be an array",
          type: "invalid_request_error",
          param: "messages",
          code: null,
        },
      });
    }

    if (stream) {
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: model,
        endpoint: '/api/v1/chat/completions',
        status: 400,
        error_message: 'streaming not supported',
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
        user_agent: req.headers['user-agent'] || null,
      });

      return res.status(400).json({
        error: {
          message: "Streaming is not supported in this endpoint",
          type: "invalid_request_error",
          param: "stream",
          code: null,
        },
      });
    }

    const modelConfig = MODEL_MAPPING[model.toLowerCase()];

    if (!modelConfig) {
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: model,
        endpoint: '/api/v1/chat/completions',
        status: 400,
        error_message: 'model not found',
        ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
        user_agent: req.headers['user-agent'] || null,
      });

      return res.status(400).json({
        error: {
          message: `Model '${model}' is not supported. Available models: ${Object.keys(MODEL_MAPPING).join(", ")}`,
          type: "invalid_request_error",
          param: "model",
          code: "model_not_found",
        },
      });
    }

    const hist = [...messages];
    
    if (persona) {
      const detectedPersona = detectPersonaFromDescription(persona);
      const systemPrompt = PERSONA_PROMPTS[detectedPersona] || PERSONA_PROMPTS.tsundere;
      
      const hasSystemMessage = hist.some(m => m.role === 'system');
      if (!hasSystemMessage) {
        hist.unshift({ role: "system", content: systemPrompt });
      }
    }

    const history = hist.map((msg: any) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    const result = await modelConfig.fn(history, {
      temperature,
      maxTokens: max_tokens,
    });

    const latency = Date.now() - startTime;

    await incrementUsage(apiKeyData.key);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model: model,
      endpoint: '/api/v1/chat/completions',
      status: 200,
      latency_ms: latency,
      tokens_used: 0,
      ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
    });

    const response = {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: result.reply,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error("OpenAI-compatible API error:", err);

    const latency = Date.now() - startTime;

    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model: req.body.model || 'unknown',
      endpoint: '/api/v1/chat/completions',
      status: isRateLimitError(err) ? 429 : 500,
      latency_ms: latency,
      error_message: err.message,
      ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
    });

    if (isRateLimitError(err)) {
      return res.status(429).json({
        error: {
          message: "Rate limit exceeded. Please try again later.",
          type: "rate_limit_error",
          param: null,
          code: "rate_limit_exceeded",
        },
      });
    }

    if (isQuotaError(err)) {
      return res.status(429).json({
        error: {
          message: "Quota exceeded. Please check your plan.",
          type: "insufficient_quota",
          param: null,
          code: "insufficient_quota",
        },
      });
    }

    return res.status(500).json({
      error: {
        message: err.message || "Internal server error",
        type: "server_error",
        param: null,
        code: null,
      },
    });
  }
}
