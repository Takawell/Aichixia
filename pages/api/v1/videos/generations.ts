import type { NextApiRequest, NextApiResponse } from "next";
import { generateVideo, WanRateLimitError, WanQuotaError } from "@/lib/wan";
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

const MODEL_MAPPING: Record<string, { provider: string }> = {
  "wan2.2-i2v": { provider: "wan22" },
};

const LOCKED_MODELS_PRO = ['wan2.2-i2v'];

const RATE_LIMIT_ERRORS = [WanRateLimitError];
const QUOTA_ERRORS = [WanQuotaError];

function isRateLimitError(error: any): boolean {
  return RATE_LIMIT_ERRORS.some((ErrorClass) => error instanceof ErrorClass);
}

function isQuotaError(error: any): boolean {
  return QUOTA_ERRORS.some((ErrorClass) => error instanceof ErrorClass);
}

async function checkModelAccess(userId: string, model: string): Promise<{ allowed: boolean; error?: string }> {
  const supabaseAdmin = getServiceSupabase();
  const { data: settings, error } = await supabaseAdmin
    .from('user_settings')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (error || !settings) return { allowed: true };

  const userPlan = settings.plan;
  const modelLower = model.toLowerCase();

  if (userPlan === 'free' && LOCKED_MODELS_PRO.includes(modelLower)) {
    return {
      allowed: false,
      error: `Model '${model}' requires Pro or Enterprise plan. Upgrade your plan at https://aichixia.xyz/console`,
    };
  }
  return { allowed: true };
}

async function fetchAsBlob(source: string): Promise<Blob> {
  if (source.startsWith("data:")) {
    const [meta, base64] = source.split(",");
    const mimeMatch = meta.match(/data:(.*?);base64/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const buffer = Buffer.from(base64, "base64");
    return new Blob([buffer], { type: mime });
  }
  const response = await fetch(source);
  return await response.blob();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: { message: "Method not allowed", type: "invalid_request_error", param: null, code: null },
    });
  }

  const startTime = Date.now();
  const apiKey = req.headers.authorization?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({
      error: { message: "Missing API key in Authorization header", type: "invalid_request_error", param: null, code: "missing_api_key" },
    });
  }

  const verifyResult = await verifyApiKey(apiKey);

  if (!verifyResult || !verifyResult.key) {
    return res.status(401).json({
      error: { message: "Invalid API key", type: "invalid_request_error", param: null, code: "invalid_api_key" },
    });
  }

  if (verifyResult.error) {
    await logRequest({
      api_key_id: verifyResult.key.id,
      user_id: verifyResult.key.user_id,
      model: req.body.model || 'unknown',
      endpoint: '/api/v1/videos/generations',
      status: 429,
      tokens_used: 0,
      error_message: verifyResult.error,
      ip_address: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
    });

    return res.status(429).json({
      error: { message: verifyResult.error, type: "rate_limit_error", param: null, code: "rate_limit_exceeded" },
    });
  }

  const apiKeyData = verifyResult.key;
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  const {
    model,
    input_image,
    last_image,
    prompt,
    steps,
    negative_prompt,
    duration_seconds,
    guidance_scale,
    guidance_scale_2,
    seed,
    randomize_seed,
    quality,
    scheduler,
    flow_shift,
    frame_multiplier,
    safe_mode,
    lora_groups,
    video_component,
  } = req.body;

  if (!model || typeof model !== "string") {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id, user_id: apiKeyData.user_id,
      model: 'unknown', endpoint: '/api/v1/videos/generations',
      status: 400, tokens_used: 0, error_message: 'model is required',
      ip_address: ipAddress, user_agent: userAgent,
    });
    return res.status(400).json({
      error: { message: "model is required and must be a string", type: "invalid_request_error", param: "model", code: null },
    });
  }

  const modelAccess = await checkModelAccess(apiKeyData.user_id, model);

  if (!modelAccess.allowed) {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id, user_id: apiKeyData.user_id,
      model, endpoint: '/api/v1/videos/generations',
      status: 403, tokens_used: 0, error_message: modelAccess.error || 'Model access denied',
      ip_address: ipAddress, user_agent: userAgent,
    });
    return res.status(403).json({
      error: { message: modelAccess.error, type: "insufficient_quota", param: "model", code: "model_access_denied" },
    });
  }

  const modelConfig = MODEL_MAPPING[model.toLowerCase()];

  if (!modelConfig) {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id, user_id: apiKeyData.user_id,
      model, endpoint: '/api/v1/videos/generations',
      status: 400, tokens_used: 0, error_message: 'model not found',
      ip_address: ipAddress, user_agent: userAgent,
    });
    return res.status(400).json({
      error: {
        message: `Model '${model}' is not supported. Available models: ${Object.keys(MODEL_MAPPING).join(", ")}`,
        type: "invalid_request_error", param: "model", code: "model_not_found",
      },
    });
  }

  if (!input_image || typeof input_image !== "string") {
    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id, user_id: apiKeyData.user_id,
      model, endpoint: '/api/v1/videos/generations',
      status: 400, tokens_used: 0, error_message: 'input_image is required',
      ip_address: ipAddress, user_agent: userAgent,
    });
    return res.status(400).json({
      error: { message: "input_image is required and must be a base64 data URL or an image URL", type: "invalid_request_error", param: "input_image", code: null },
    });
  }

  try {
    const inputImageBlob = await fetchAsBlob(input_image);
    const lastImageBlob = last_image ? await fetchAsBlob(last_image) : undefined;

    const result = await generateVideo({
      input_image: inputImageBlob,
      last_image: lastImageBlob,
      prompt,
      steps,
      negative_prompt,
      duration_seconds,
      guidance_scale,
      guidance_scale_2,
      seed,
      randomize_seed,
      quality,
      scheduler,
      flow_shift,
      frame_multiplier,
      safe_mode,
      lora_groups,
      video_component,
    });

    const latency = Date.now() - startTime;

    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, true);
    await logRequest({
      api_key_id: apiKeyData.id, user_id: apiKeyData.user_id,
      model, endpoint: '/api/v1/videos/generations',
      status: 200, latency_ms: latency, tokens_used: 0,
      ip_address: ipAddress, user_agent: userAgent,
    });

    return res.status(200).json({
      id: `video-${Date.now()}`,
      object: "video.generation",
      created: Math.floor(Date.now() / 1000),
      model,
      data: {
        video: result.video,
        download: result.downloadFile,
        seed: result.seed,
      },
    });
  } catch (err: any) {
    console.error("Video generation API error:", err);

    const latency = Date.now() - startTime;

    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id, user_id: apiKeyData.user_id,
      model: req.body.model || 'unknown', endpoint: '/api/v1/videos/generations',
      status: isRateLimitError(err) ? 429 : 500,
      latency_ms: latency, tokens_used: 0, error_message: err.message,
      ip_address: ipAddress, user_agent: userAgent,
    });

    if (isRateLimitError(err)) {
      return res.status(429).json({
        error: { message: "Rate limit exceeded. Please try again later.", type: "rate_limit_error", param: null, code: "rate_limit_exceeded" },
      });
    }

    if (isQuotaError(err)) {
      return res.status(429).json({
        error: { message: "Quota exceeded. Please check your plan.", type: "insufficient_quota", param: null, code: "insufficient_quota" },
      });
    }

    return res.status(500).json({
      error: { message: err.message || "Internal server error", type: "server_error", param: null, code: null },
    });
  }
}
