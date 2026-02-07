import type { NextApiRequest, NextApiResponse } from "next";
import { encode } from 'gpt-tokenizer';
import { chatGemini, chatGeminiStream } from "@/lib/gemini";
import { chatAichixia, AichixiaRateLimitError, AichixiaQuotaError } from "@/lib/aichixia";
import { chatOpenAI, OpenAIRateLimitError, OpenAIQuotaError } from "@/lib/openai";
import { chatKimi, chatKimiStream, KimiRateLimitError, KimiQuotaError } from "@/lib/kimi";
import { chatGlm, GlmRateLimitError, GlmQuotaError } from "@/lib/glm";
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
import { chatGrok, GrokRateLimitError, GrokQuotaError } from "@/lib/grok";
import { verifyApiKey, incrementUsage, logRequest, updateDailyUsage } from "@/lib/console-utils";
import { getServiceSupabase } from "@/lib/supabase";

type ChatFunction = (
  history: { role: "user" | "assistant" | "system"; content: string }[],
  opts?: { temperature?: number; maxTokens?: number }
) => Promise<{ reply: string }>;

type StreamFunction = (
  history: { role: "user" | "assistant" | "system"; content: string }[],
  opts?: { temperature?: number; maxTokens?: number }
) => AsyncGenerator<string, void, unknown>;

const MODEL_MAPPING: Record<string, { fn: ChatFunction; streamFn?: StreamFunction; provider: string }> = {
  "deepseek-v3.2": { fn: chatDeepSeek, provider: "deepseek" },
  "deepseek-v3.1": { fn: chatDeepSeekV, provider: "deepseek-v" },
  "gpt-5-mini": { fn: chatOpenAI, provider: "openai" },
  "claude-opus-4.5": { fn: chatClaude, provider: "claude" },
  "gemini-3-flash": { fn: chatGemini, streamFn: chatGeminiStream, provider: "gemini" },
  "kimi-k2": { fn: chatKimi, streamFn: chatKimiStream, provider: "kimi" },
  "glm-4.7": { fn: chatGlm, provider: "glm" },
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
  "aichixia-thinking": { fn: chatAichixia, provider: "aichixia" },
};

const LOCKED_MODELS_PRO = ['deepseek-v3.2', 'qwen3-235b', 'minimax-m2.1', 'claude-opus-4.5', 'glm-4.7', 'kimi-k2', 'aichixia-thinking'];

const RATE_LIMIT_ERRORS = [
  OpenAIRateLimitError,
  KimiRateLimitError,
  GlmRateLimitError,
  ClaudeRateLimitError,
  CohereRateLimitError,
  DeepSeekRateLimitError,
  DeepSeekVRateLimitError,
  QwenRateLimitError,
  QwenV2RateLimitError,
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
  DeepSeekVQuotaError,
  QwenQuotaError,
  QwenV2QuotaError,
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

function calculateTokens(text: string): number {
  try {
    return encode(text).length;
  } catch (error) {
    return Math.ceil(text.length / 4);
  }
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
      tokens_used: 0,
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
    } = req.body;

    if (!model || typeof model !== "string") {
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: 'unknown',
        endpoint: '/api/v1/chat/completions',
        status: 400,
        tokens_used: 0,
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
        tokens_used: 0,
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
        tokens_used: 0,
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

    const modelConfig = MODEL_MAPPING[model.toLowerCase()];

    if (!modelConfig) {
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: model,
        endpoint: '/api/v1/chat/completions',
        status: 400,
        tokens_used: 0,
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

    const history = messages.map((msg: any) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    if (stream) {
      if (!modelConfig.streamFn) {
        await logRequest({
          api_key_id: apiKeyData.id,
          user_id: apiKeyData.user_id,
          model: model,
          endpoint: '/api/v1/chat/completions',
          status: 400,
          tokens_used: 0,
          error_message: 'streaming not supported for this model',
          ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
          user_agent: req.headers['user-agent'] || null,
        });

        return res.status(400).json({
          error: {
            message: `Streaming is not supported for model '${model}'`,
            type: "invalid_request_error",
            param: "stream",
            code: null,
          },
        });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        let fullContent = '';
        const promptText = messages.map((m: any) => m.content).join(' ');

        for await (const chunk of modelConfig.streamFn(history, { temperature, maxTokens: max_tokens })) {
          fullContent += chunk;

          const streamData = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [
              {
                index: 0,
                delta: { content: chunk },
                finish_reason: null,
              },
            ],
          };

          res.write(`data: ${JSON.stringify(streamData)}\n\n`);
        }

        const latency = Date.now() - startTime;
        const promptTokens = calculateTokens(promptText);
        const completionTokens = calculateTokens(fullContent);
        const totalTokens = promptTokens + completionTokens;

        const finalChunk = {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
          },
        };

        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
        res.write('data: [DONE]\n\n');

        incrementUsage(apiKeyData.key);
        updateDailyUsage(apiKeyData.id, apiKeyData.user_id, totalTokens);
        logRequest({
          api_key_id: apiKeyData.id,
          user_id: apiKeyData.user_id,
          model: model,
          endpoint: '/api/v1/chat/completions',
          status: 200,
          latency_ms: latency,
          tokens_used: totalTokens,
          ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
          user_agent: req.headers['user-agent'] || null,
        });

        res.end();
      } catch (err: any) {
        console.error("Streaming error:", err);
        
        const latency = Date.now() - startTime;
        await logRequest({
          api_key_id: apiKeyData.id,
          user_id: apiKeyData.user_id,
          model: model,
          endpoint: '/api/v1/chat/completions',
          status: isRateLimitError(err) ? 429 : 500,
          latency_ms: latency,
          tokens_used: 0,
          error_message: err.message,
          ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
          user_agent: req.headers['user-agent'] || null,
        });

        const errorData = {
          error: {
            message: err.message || "Internal server error",
            type: isRateLimitError(err) ? "rate_limit_error" : isQuotaError(err) ? "insufficient_quota" : "server_error",
            param: null,
            code: null,
          },
        };

        res.write(`data: ${JSON.stringify(errorData)}\n\n`);
        res.end();
      }
    } else {
      const result = await modelConfig.fn(history, {
        temperature,
        maxTokens: max_tokens,
      });

      const latency = Date.now() - startTime;
      const promptText = messages.map((m: any) => m.content).join(' ');
      const promptTokens = calculateTokens(promptText);
      const completionTokens = calculateTokens(result.reply);
      const totalTokens = promptTokens + completionTokens;

      await incrementUsage(apiKeyData.key);
      await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, totalTokens);
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model: model,
        endpoint: '/api/v1/chat/completions',
        status: 200,
        latency_ms: latency,
        tokens_used: totalTokens,
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
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
        },
      };

      return res.status(200).json(response);
    }
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
      tokens_used: 0,
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
