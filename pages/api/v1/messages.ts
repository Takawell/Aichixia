import type { NextApiRequest, NextApiResponse } from "next";
import { encode } from 'gpt-tokenizer';
import { chatGemini, streamGemini, GeminiRateLimitError, GeminiQuotaError } from "@/lib/gemini";
import { chatAichixia, AichixiaRateLimitError, AichixiaQuotaError } from "@/lib/aichixia";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatKimi, streamKimi, KimiRateLimitError, KimiQuotaError } from "@/lib/kimi";
import { chatGlm, streamGlm, GlmRateLimitError, GlmQuotaError } from "@/lib/glm";
import { chatGPT, GPTRateLimitError, GPTQuotaError } from "@/lib/gpt";
import { chatClaude, ClaudeRateLimitError, ClaudeQuotaError } from "@/lib/claude";
import { chatOpus, OpusRateLimitError, OpusQuotaError } from "@/lib/opus";
import { chatCohere, streamCohere, CohereRateLimitError, CohereQuotaError } from "@/lib/cohere";
import { chatDeepSeek, streamDeepSeek, DeepSeekRateLimitError, DeepSeekQuotaError } from "@/lib/deepseek";
import { chatDeepSeekV, streamDeepSeekV, DeepSeekVRateLimitError, DeepSeekVQuotaError } from "@/lib/deepseek-v";
import { chatQwen, streamQwen, QwenRateLimitError, QwenQuotaError } from "@/lib/qwen";
import { chatQwenV2, QwenV2RateLimitError, QwenV2QuotaError } from "@/lib/qwen3";
import { chatGptOss, streamGptOss, GptOssRateLimitError, GptOssQuotaError } from "@/lib/gpt-oss";
import { chatCompound, CompoundRateLimitError, CompoundQuotaError } from "@/lib/compound";
import { chatLlama, streamLlama, LlamaRateLimitError, LlamaQuotaError } from "@/lib/llama";
import { chatMistral, streamMistral, MistralRateLimitError, MistralQuotaError } from "@/lib/mistral";
import { chatMimo, streamMimo, MimoRateLimitError, MimoQuotaError } from "@/lib/mimo";
import { chatMinimax, streamMinimax, MinimaxRateLimitError, MinimaxQuotaError } from "@/lib/minimax";
import { chatGrokFast, GrokFastRateLimitError, GrokFastQuotaError } from "@/lib/grok-fast";
import { chatGrok, GrokRateLimitError, GrokQuotaError } from "@/lib/grok";
import { chatZhipu, ZhipuRateLimitError, ZhipuQuotaError } from "@/lib/zhipu";
import { chatPhi, PhiRateLimitError, PhiQuotaError } from "@/lib/phi";
import { chatStepfun, streamStepfun, StepfunRateLimitError, StepfunQuotaError } from "@/lib/stepfun";
import { chatNemotron, streamNemotron, NemotronRateLimitError, NemotronQuotaError } from "@/lib/nemotron";
import { chatGpt55, Gpt55RateLimitError, Gpt55QuotaError } from "@/lib/gpt-5-5";
import { chatGemma, streamGemma, GemmaRateLimitError, GemmaQuotaError } from "@/lib/gemma";
import { chatHaiku, HaikuRateLimitError, HaikuQuotaError } from "@/lib/haiku";
import { chatLaguna, streamLaguna, LagunaRateLimitError, LagunaQuotaError } from "@/lib/laguna";
import { chatFable, streamFable, FableRateLimitError, FableQuotaError } from "@/lib/fable";
import { verifyApiKey, incrementUsage, logRequest, updateDailyUsage } from "@/lib/console-utils";
import { getServiceSupabase } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
    responseLimit: false,
  },
};

type ChatFunction = (
  history: { role: "user" | "assistant" | "system"; content: any }[],
  opts?: { temperature?: number; maxTokens?: number }
) => Promise<{ reply: string }>;

type StreamFunction = (
  history: { role: "user" | "assistant" | "system"; content: any }[],
  opts?: { temperature?: number; maxTokens?: number }
) => Promise<ReadableStream<Uint8Array>>;

const MODEL_MAPPING: Record<string, { fn: ChatFunction; provider: string }> = {
  "deepseek-v3.2": { fn: chatDeepSeek, provider: "deepseek" },
  "deepseek-v4-flash": { fn: chatDeepSeekV, provider: "deepseek-v" },
  "gpt-5-mini": { fn: chatOpenAI, provider: "openai" },
  "claude-sonnet-4.6": { fn: chatClaude, provider: "claude" },
  "claude-opus-4.8": { fn: chatOpus, provider: "opus" },
  "claude-haiku-4.5": { fn: chatHaiku, provider: "haiku" },
  "claude-fable-5": { fn: chatFable, provider: "fable" },
  "gemini-3-flash": { fn: chatGemini, provider: "gemini" },
  "kimi-k2.6": { fn: chatKimi, provider: "kimi" },
  "glm-5.2": { fn: chatGlm, provider: "glm" },
  "gpt-5.2": { fn: chatGPT, provider: "gpt" },
  "gpt-5.5": { fn: chatGpt55, provider: "gpt55" },
  "mistral-large-3-675b-instruct": { fn: chatMistral, provider: "mistral" },
  "qwen3.6-27b": { fn: chatQwenV2, provider: "qwen3" },
  "qwen3-coder-plus": { fn: chatQwen, provider: "qwen" },
  "minimax-m3": { fn: chatMinimax, provider: "minimax" },
  "llama-3.3-70b": { fn: chatLlama, provider: "llama" },
  "gpt-oss-120b": { fn: chatGptOss, provider: "gptoss" },
  "mimo-v2.5-pro": { fn: chatMimo, provider: "mimo" },
  "phi-4-multimodal-instruct": { fn: chatPhi, provider: "phi" },
  "groq-compound": { fn: chatCompound, provider: "compound" },
  "cohere-command-a": { fn: chatCohere, provider: "cohere" },
  "grok-3": { fn: chatGrok, provider: "grok" },
  "grok-4-fast": { fn: chatGrokFast, provider: "grok-fast" },
  "glm-4.7-flash": { fn: chatZhipu, provider: "zhipu" },
  "step-3.7-flash": { fn: chatStepfun, provider: "stepfun" },
  "nemotron-3-ultra-550b-a55b": { fn: chatNemotron, provider: "nemotron" },
  "aichixia-flash": { fn: chatAichixia, provider: "aichixia" },
  "gemma-4-31b": { fn: chatGemma, provider: "gemma" },
  "laguna-s-2.1": { fn: chatLaguna, provider: "laguna" },
};

const STREAM_MODEL_MAPPING: Record<string, StreamFunction> = {
  "kimi-k2.6": streamKimi,
  "mistral-large-3-675b-instruct": streamMistral,
  "minimax-m3": streamMinimax,
  "step-3.7-flash": streamStepfun,
  "nemotron-3-ultra-550b-a55b": streamNemotron,
  "gpt-oss-120b": streamGptOss,
  "deepseek-v4-flash": streamDeepSeekV,
  "glm-5.2": streamGlm,
  "gemma-4-31b": streamGemma,
  "laguna-s-2.1": streamLaguna,
  "cohere-command-a": streamCohere,
  "gemini-3-flash": streamGemini,
  "llama-3.3-70b": streamLlama,
  "deepseek-v3.2": streamDeepSeek,
  "claude-fable-5": streamFable,
  "mimo-v2.5-pro": streamMimo,
  "qwen3-coder-plus": streamQwen,
};

const LOCKED_MODELS_PRO = ['deepseek-v3.2', 'minimax-m3', 'mimo-v2.5-pro', 'claude-sonnet-4.6', 'glm-5.2', 'aichixia-flash', 'grok-4-fast', 'kimi-k2.6', 'gpt-5.2', 'gpt-5.5', 'laguna-s-2.1', 'claude-opus-4.8'];
const LOCKED_MODELS_ENTERPRISE = ['claude-fable-5'];

const RATE_LIMIT_ERRORS = [
  OpenAIRateLimitError, KimiRateLimitError, GlmRateLimitError, GPTRateLimitError,
  ClaudeRateLimitError, CohereRateLimitError, DeepSeekRateLimitError, DeepSeekVRateLimitError,
  QwenRateLimitError, QwenV2RateLimitError, GptOssRateLimitError, CompoundRateLimitError,
  LlamaRateLimitError, MistralRateLimitError, MimoRateLimitError, PhiRateLimitError,
  MinimaxRateLimitError, GrokRateLimitError, GrokFastRateLimitError, ZhipuRateLimitError,
  AichixiaRateLimitError, StepfunRateLimitError, NemotronRateLimitError, Gpt55RateLimitError, OpusRateLimitError,
  GemmaRateLimitError, HaikuRateLimitError, LagunaRateLimitError, GeminiRateLimitError, FableRateLimitError,
];

const QUOTA_ERRORS = [
  OpenAIQuotaError, KimiQuotaError, GlmQuotaError, GPTQuotaError,
  ClaudeQuotaError, CohereQuotaError, DeepSeekQuotaError, DeepSeekVQuotaError,
  QwenQuotaError, QwenV2QuotaError, GptOssQuotaError, CompoundQuotaError,
  LlamaQuotaError, MistralQuotaError, MimoQuotaError, PhiQuotaError,
  MinimaxQuotaError, GrokQuotaError, GrokFastQuotaError, ZhipuQuotaError,
  AichixiaQuotaError, StepfunQuotaError, NemotronQuotaError, Gpt55QuotaError, OpusQuotaError,
  GemmaQuotaError, HaikuQuotaError, LagunaQuotaError, GeminiQuotaError, FableQuotaError,
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

function sendSSE(res: NextApiResponse, event: string, data: any) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function checkModelAccess(userId: string, model: string): Promise<{ allowed: boolean; error?: string }> {
  const supabaseAdmin = getServiceSupabase();
  const { data: settings, error } = await supabaseAdmin
    .from('user_settings')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const modelLower = model.toLowerCase();

  if (error || !settings) {
    if (LOCKED_MODELS_ENTERPRISE.includes(modelLower) || LOCKED_MODELS_PRO.includes(modelLower)) {
      return {
        allowed: false,
        error: `Unable to verify plan for model '${model}'.`,
      };
    }
    return { allowed: true };
  }

  const userPlan = settings.plan;

  if (LOCKED_MODELS_ENTERPRISE.includes(modelLower) && userPlan !== 'enterprise') {
    return {
      allowed: false,
      error: `Model '${model}' requires Enterprise plan.`,
    };
  }

  if (userPlan === 'free' && LOCKED_MODELS_PRO.includes(modelLower)) {
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

  const {
    model,
    messages,
    system,
    max_tokens = 4096,
    temperature = 0.8,
    stream = false,
  } = req.body;

  if (!model || typeof model !== "string") {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model: 'unknown', endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'model is required', ip_address: ip, user_agent: userAgent });
    return anthropicError("invalid_request_error", "model is required and must be a string.", 400, res);
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'messages is required', ip_address: ip, user_agent: userAgent });
    return anthropicError("invalid_request_error", "messages is required and must be a non-empty array.", 400, res);
  }

  if (!max_tokens || typeof max_tokens !== 'number') {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'max_tokens is required', ip_address: ip, user_agent: userAgent });
    return anthropicError("invalid_request_error", "max_tokens is required.", 400, res);
  }

  const modelAccess = await checkModelAccess(apiKeyData.user_id, model);
  if (!modelAccess.allowed) {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 403, tokens_used: 0, error_message: modelAccess.error || 'Model access denied', ip_address: ip, user_agent: userAgent });
    return anthropicError("permission_error", modelAccess.error || "Model access denied.", 403, res);
  }

  const modelConfig = MODEL_MAPPING[model.toLowerCase()];
  if (!modelConfig) {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
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
      const hasImage = msg.content.some((b: any) => b.type === "image");
      if (hasImage) {
        content = msg.content.map((b: any) => {
          if (b.type === "text") {
            return { type: "text", text: b.text };
          }
          if (b.type === "image") {
            const mediaType = b.source?.media_type || "image/png";
            const data = b.source?.data || "";
            const url = b.source?.type === "url"
              ? b.source.url
              : `data:${mediaType};base64,${data}`;
            return { type: "image_url", image_url: { url } };
          }
          return { type: "text", text: "" };
        });
      } else {
        content = msg.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join(" ");
      }
    } else {
      content = String(msg.content);
    }
    history.push({ role, content });
  }

  const streamFn = STREAM_MODEL_MAPPING[model.toLowerCase()];

  if (stream) {
    if (!streamFn) {
      await incrementUsage(apiKeyData.id);
      await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
      await logRequest({ api_key_id: apiKeyData.id, user_id: apiKeyData.user_id, model, endpoint: '/api/v1/messages', status: 400, tokens_used: 0, error_message: 'streaming not supported for this model', ip_address: ip, user_agent: userAgent });
      return anthropicError("invalid_request_error", `Streaming is not supported for model '${model}'. Streaming-capable models: ${Object.keys(STREAM_MODEL_MAPPING).join(", ")}`, 400, res);
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });

    const messageId = `msg_${Date.now()}`;
    const promptText = messages.map((m: any) => typeof m.content === "string" ? m.content : "").join(" ");
    const inputTokens = calculateTokens(promptText + (system || ""));

    try {
      sendSSE(res, "message_start", {
        type: "message_start",
        message: {
          id: messageId,
          type: "message",
          role: "assistant",
          content: [],
          model,
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: inputTokens, output_tokens: 0 },
        },
      });

      sendSSE(res, "content_block_start", {
        type: "content_block_start",
        index: 0,
        content_block: { type: "text", text: "" },
      });

      const readable = await streamFn(history, { temperature, maxTokens: max_tokens });
      const reader = readable.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const payload = part.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              fullText += parsed.text;
              sendSSE(res, "content_block_delta", {
                type: "content_block_delta",
                index: 0,
                delta: { type: "text_delta", text: parsed.text },
              });
            }
          } catch {
            continue;
          }
        }
      }

      const outputTokens = calculateTokens(fullText);

      sendSSE(res, "content_block_stop", { type: "content_block_stop", index: 0 });
      sendSSE(res, "message_delta", {
        type: "message_delta",
        delta: { stop_reason: "end_turn", stop_sequence: null },
        usage: { output_tokens: outputTokens },
      });
      sendSSE(res, "message_stop", { type: "message_stop" });
      res.end();

      const latency = Date.now() - startTime;
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
    } catch (err: any) {
      const latency = Date.now() - startTime;
      await incrementUsage(apiKeyData.id);
      await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model,
        endpoint: '/api/v1/messages',
        status: isRateLimitError(err) ? 429 : 500,
        latency_ms: latency,
        tokens_used: 0,
        error_message: err.message,
        ip_address: ip,
        user_agent: userAgent,
      });

      if (!res.headersSent) {
        const status = isRateLimitError(err) ? 429 : isQuotaError(err) ? 429 : 500;
        return anthropicError("api_error", err.message || "Internal server error", status, res);
      }
      sendSSE(res, "error", { type: "error", error: { type: "api_error", message: err.message || "Internal server error" } });
      res.end();
    }
    return;
  }

  try {
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

    await incrementUsage(apiKeyData.id);
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
