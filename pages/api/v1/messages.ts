import type { NextApiRequest, NextApiResponse } from "next";
import { encode } from 'gpt-tokenizer';
import { chatGemini } from "@/lib/gemini";
import { chatAichixia, AichixiaRateLimitError, AichixiaQuotaError } from "@/lib/aichixia";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatKimi, KimiRateLimitError, KimiQuotaError } from "@/lib/kimi";
import { chatGlm, GlmRateLimitError, GlmQuotaError } from "@/lib/glm";
import { chatGPT, GPTRateLimitError, GPTQuotaError } from "@/lib/gpt";
import { chatClaude, ClaudeRateLimitError, ClaudeQuotaError } from "@/lib/claude";
import { chatCohere, CohereRateLimitError, CohereQuotaError } from "@/lib/cohere";
import { chatDeepSeek, DeepSeekRateLimitError, DeepSeekQuotaError } from "@/lib/deepseek";
import { chatDeepSeekV, DeepSeekVRateLimitError, DeepSeekVQuotaError } from "@/lib/deepseek-v";
import { chatQwen, QwenRateLimitError, QwenQuotaError } from "@/lib/qwen";
import { chatQwenV2, QwenV2RateLimitError, QwenV2QuotaError } from "@/lib/qwen3";
import { chatGptOss, GptOssRateLimitError, GptOssQuotaError } from "@/lib/gpt-oss";
import { chatCompound, CompoundRateLimitError, CompoundQuotaError } from "@/lib/compound";
import { chatLlama, LlamaRateLimitError, LlamaQuotaError } from "@/lib/llama";
import { chatMistral, MistralRateLimitError, MistralQuotaError } from "@/lib/mistral";
import { chatMimo, MimoRateLimitError, MimoQuotaError } from "@/lib/mimo";
import { chatMinimax, MinimaxRateLimitError, MinimaxQuotaError } from "@/lib/minimax";
import { chatGrokFast, GrokFastRateLimitError, GrokFastQuotaError } from "@/lib/grok-fast";
import { chatGrok, GrokRateLimitError, GrokQuotaError } from "@/lib/grok";
import { chatZhipu, ZhipuRateLimitError, ZhipuQuotaError } from "@/lib/zhipu";
import { verifyApiKey, incrementUsage, logRequest, updateDailyUsage } from "@/lib/console-utils";
import { getServiceSupabase } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

type ChatFunction = (
  history: { role: "user" | "assistant" | "system"; content: any }[],
  opts?: { temperature?: number; maxTokens?: number }
) => Promise<{ reply: string }>;

const MODEL_MAPPING: Record<string, { fn: ChatFunction; provider: string }> = {
  "deepseek-v3.2": { fn: chatDeepSeek, provider: "deepseek" },
  "deepseek-v3.1": { fn: chatDeepSeekV, provider: "deepseek-v" },
  "gpt-5-mini": { fn: chatOpenAI, provider: "openai" },
  "claude-opus-4.5": { fn: chatClaude, provider: "claude" },
  "gemini-3-flash": { fn: chatGemini, provider: "gemini" },
  "kimi-k2.5": { fn: chatKimi, provider: "kimi" },
  "glm-4.7": { fn: chatGlm, provider: "glm" },
  "gpt-5.2": { fn: chatGPT, provider: "gpt" },
  "mistral-3.1": { fn: chatMistral, provider: "mistral" },
  "qwen3-235b": { fn: chatQwenV2, provider: "qwen3" },
  "qwen3-coder-480b": { fn: chatQwen, provider: "qwen" },
  "minimax-m2.1": { fn: chatMinimax, provider: "minimax" },
  "llama-3.3-70b": { fn: chatLlama, provider: "llama" },
  "gpt-oss-120b": { fn: chatGptOss, provider: "gptoss" },
  "mimo-v2-flash": { fn: chatMimo, provider: "mimo" },
  "groq-compound": { fn: chatCompound, provider: "compound" },
  "cohere-command-a": { fn: chatCohere, provider: "cohere" },
  "grok-3": { fn: chatGrok, provider: "grok" },
  "grok-4-fast": { fn: chatGrokFast, provider: "grok-fast" },
  "glm-4.7-flash": { fn: chatZhipu, provider: "zhipu" },
  "aichixia-flash": { fn: chatAichixia, provider: "aichixia" },
};

const LOCKED_MODELS_PRO = ['deepseek-v3.2', 'qwen3-235b', 'minimax-m2.1', 'claude-opus-4.5', 'glm-4.7', 'aichixia-flash', 'grok-4-fast', 'kimi-k2.5'];

const RATE_LIMIT_ERRORS = [
  OpenAIRateLimitError, KimiRateLimitError, GlmRateLimitError, GPTRateLimitError,
  ClaudeRateLimitError, CohereRateLimitError, DeepSeekRateLimitError, DeepSeekVRateLimitError,
  QwenRateLimitError, QwenV2RateLimitError, GptOssRateLimitError, CompoundRateLimitError,
  LlamaRateLimitError, MistralRateLimitError, MimoRateLimitError, MinimaxRateLimitError,
  GrokRateLimitError, GrokFastRateLimitError, ZhipuRateLimitError, AichixiaRateLimitError,
];

const QUOTA_ERRORS = [
  OpenAIQuotaError, KimiQuotaError, GlmQuotaError, GPTQuotaError,
  ClaudeQuotaError, CohereQuotaError, DeepSeekQuotaError, DeepSeekVQuotaError,
  QwenQuotaError, QwenV2QuotaError, GptOssQuotaError, CompoundQuotaError,
  LlamaQuotaError, MistralQuotaError, MimoQuotaError, MinimaxQuotaError,
  GrokQuotaError, GrokFastQuotaError, ZhipuQuotaError, AichixiaQuotaError,
];

function isRateLimitError(error: any): boolean {
  return RATE_LIMIT_ERRORS.some((ErrorClass) => error instanceof ErrorClass);
}

function isQuotaError(error: any): boolean {
  return QUOTA_ERRORS.some((ErrorClass) => error instanceof ErrorClass);
}

function calculateTokens(text: string): number {
  try {
    return encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}

function anthropicError(type: string, message: string, status: number, res: NextApiResponse) {
  return res.status(status).json({
    type: "error",
    error: { type, message },
  });
}

async function checkModelAccess(userId: string, model: string): Promise<{ allowed: boolean; error?: string }> {
  const supabaseAdmin = getServiceSupabase();
  const { data: settings, error } = await supabaseAdmin
    .from('user_settings')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (error || !settings) return { allowed: true };

  if (settings.plan === 'free' && LOCKED_MODELS_PRO.includes(model.toLowerCase())) {
    return {
      allowed: false,
      error: `Model '${model}' requires Pro or Enterprise plan.`,
    };
  }
  return { allowed: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return anthropicError("invalid_request_error", "Method not allowed", 405, res);
  }

  const startTime = Date.now();

  const apiKey =
    req.headers["x-api-key"] as string ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!apiKey) {
    return anthropicError("authentication_error", "Missing API key. Provide via x-api-key header or Authorization: Bearer.", 401, res);
  }

  const verifyResult = await verifyApiKey(apiKey);

  if (!verifyResult || !verifyResult.key) {
    return anthropicError("authentication_error", "Invalid API key.", 401, res);
  }

  if (verifyResult.error) {
    await logRequest({
      api_key_id: verifyResult.key.id,
      user_id: verifyResult.key.user_id,
      model: req.body.model || 'unknown',
      endpoint: '/api/v1/messages',
      status: 429,
      tokens_used: 0,
      error_message: verifyResult.error,
      ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
    });
    return anthropicError("rate_limit_error", verifyResult.error, 429, res);
  }

  const apiKeyData = verifyResult.key;
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  try {
    const {
      model,
      messages,
      system,
      max_tokens = 4096,
      temperature = 0.8,
    } = req.body;

    if (!model || typeof model !== "string") {
      await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model: 'unknown', endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'model is required', ip_address: ip, user_agent: userAgent });
      return anthropicError("invalid_request_error", "model is required and must be a string.", 400, res);
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'messages is required', ip_address: ip, user_agent: userAgent });
      return anthropicError("invalid_request_error", "messages is required and must be a non-empty array.", 400, res);
    }

    if (!max_tokens || typeof max_tokens !== 'number') {
      await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'max_tokens is required', ip_address: ip, user_agent: userAgent });
      return anthropicError("invalid_request_error", "max_tokens is required.", 400, res);
    }

    const modelAccess = await checkModelAccess(apiKeyData.user_id, model);
    if (!modelAccess.allowed) {
      await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 403, tokens_used: 0, error_message: modelAccess.error || 'Model access denied', ip_address: ip, user_agent: userAgent });
      return anthropicError("permission_error", modelAccess.error || "Model access denied.", 403, res);
    }

    const modelConfig = MODEL_MAPPING[model.toLowerCase()];
    if (!modelConfig) {
      await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'model not found', ip_address: ip, user_agent: userAgent });
      return anthropicError("invalid_request_error", `Model '${model}' is not supported. Available models: ${Object.keys(MODEL_MAPPING).join(", ")}`, 400, res);
    }

    const history: { role: "user" | "assistant" | "system"; content: any }[] = [];

    if (system) {
      history.push({ role: "system", content: typeof system === "string" ? system : system.map((s: any) => s.text || "").join("\n") });
    }

    for (const msg of messages) {
      const role = msg.role as "user" | "assistant";
      let content: any;

      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join(" ");
      } else {
        content = String(msg.content);
      }

      history.push({ role, content });
    }

    const result = await modelConfig.fn(history, { temperature, maxTokens: max_tokens });

    const latency = Date.now() - startTime;
    const promptText = messages.map((m: any) => typeof m.content === "string" ? m.content : "").join(" ");
    const inputTokens = calculateTokens(promptText + (system || ""));
    const outputTokens = calculateTokens(result.reply);
    const totalTokens = inputTokens + outputTokens;

    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, totalTokens, true);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: '/api/v1/messages',
      status: 200,
      latency_ms: latency,
      tokens_used: totalTokens,
      ip_address: ip,
      user_agent: userAgent,
    });

    return res.status(200).json({
      id: `msg_${Date.now()}`,
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: result.reply }],
      model,
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
    });

  } catch (err: any) {
    console.error("Anthropic-compatible API error:", err);

    const latency = Date.now() - startTime;

    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model: req.body.model || 'unknown',
      endpoint: '/api/v1/messages',
      status: isRateLimitError(err) ? 429 : 500,
      latency_ms: latency,
      tokens_used: 0,
      error_message: err.message,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (isRateLimitError(err)) {
      return anthropicError("rate_limit_error", "Rate limit exceeded. Please try again later.", 429, res);
    }

    if (isQuotaError(err)) {
      return anthropicError("rate_limit_error", "Quota exceeded. Please check your plan.", 429, res);
    }

    return anthropicError("api_error", err.message || "Internal server error", 500, res);
  }
}
