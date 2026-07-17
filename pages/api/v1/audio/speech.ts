import type { NextApiRequest, NextApiResponse } from "next";
import { generateSpeech as generateStarling, StarlingError, StarlingRateLimitError, StarlingQuotaError } from "@/lib/starling";
import { generateSpeech as generateLindsay, LindsayError, LindsayRateLimitError, LindsayQuotaError } from "@/lib/lindsay";
import { generateSpeech as generateMiu, MiuError, MiuRateLimitError, MiuQuotaError } from "@/lib/miu";
import { generateSpeech as generateCatherine, CatherineError, CatherineRateLimitError, CatherineQuotaError } from "@/lib/catherine";
import { generateSpeech as generateNana, NanaError, NanaRateLimitError, NanaQuotaError } from "@/lib/nana";
import { generateSpeech as generateStephanie, StephanieError, StephanieRateLimitError, StephanieQuotaError } from "@/lib/stephanie";
import { generateSpeech as generateAlexandra, AlexandraError, AlexandraRateLimitError, AlexandraQuotaError } from "@/lib/alexandra";
import { generateSpeech as generateEve, EveError, EveRateLimitError, EveQuotaError } from "@/lib/eve";
import { logRequest, incrementUsage, updateDailyUsage, verifyApiKey } from "@/lib/console-utils";
import { getServiceSupabase } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const VOICE_MODEL_MAP: Record<string, "starling" | "lindsay" | "miu" | "catherine" | "nana" | "stephanie" | "alexandra" | "eve"> = {
  "starling-tts": "starling",
  "lindsay-tts": "lindsay",
  "miu-tts": "miu",
  "catherine-tts": "catherine",
  "nana-tts": "nana",
  "stephanie-tts": "stephanie",
  "alexandra-tts": "alexandra",
  "eve-tts": "eve",
};

const DEFAULT_MODEL = "starling-tts";

const LOCKED_MODELS_PRO = ['alexandra-tts', 'eve-tts'];

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed", type: "invalid_request_error", code: null } });
  }

  const startTime = Date.now();
  const apiKey = req.headers.authorization?.replace("Bearer ", "");

  if (!apiKey) {
    return res.status(401).json({ error: { message: "Missing API key in Authorization header", type: "invalid_request_error", code: "missing_api_key" } });
  }

  const verifyResult = await verifyApiKey(apiKey);

  if (!verifyResult || !verifyResult.key) {
    return res.status(401).json({ error: { message: "Invalid API key", type: "invalid_request_error", code: "invalid_api_key" } });
  }

  const apiKeyData = verifyResult.key;
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || null;
  const userAgent = req.headers["user-agent"] || null;

  if (verifyResult.error) {
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model: req.body?.model || DEFAULT_MODEL,
      endpoint: "/api/v1/audio/speech",
      status: 429,
      tokens_used: 0,
      error_message: verifyResult.error,
      ip_address: ip,
      user_agent: userAgent,
    });
    return res.status(429).json({ error: { message: verifyResult.error, type: "rate_limit_error", code: "rate_limit_exceeded" } });
  }

  const {
    model = DEFAULT_MODEL,
    input,
    voice,
    voice_id,
    language,
    emotion,
    emotion_intensity,
    volume,
    pitch,
    tempo,
    stability,
    similarity_boost,
    style,
    speaker_boost,
    response_format = "mp3",
    seed,
  } = req.body;

  if (!input) {
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/audio/speech",
      status: 400,
      tokens_used: 0,
      error_message: "Missing required field: input",
      ip_address: ip,
      user_agent: userAgent,
    });
    return res.status(400).json({ error: { message: "Missing required field: input", type: "invalid_request_error", param: "input", code: null } });
  }

  const provider = VOICE_MODEL_MAP[model] ?? "starling";

  const modelAccess = await checkModelAccess(apiKeyData.user_id, model);

  if (!modelAccess.allowed) {
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/audio/speech",
      status: 403,
      tokens_used: 0,
      error_message: modelAccess.error || "Model access denied",
      ip_address: ip,
      user_agent: userAgent,
    });
    return res.status(403).json({ error: { message: modelAccess.error, type: "insufficient_quota", param: "model", code: "model_access_denied" } });
  }

  try {
    const ttsConfig = {
      text: input,
      voiceId: voice_id || voice,
      language,
      emotion,
      emotionIntensity: emotion_intensity,
      volume,
      pitch,
      tempo,
      format: response_format as "mp3" | "wav",
      seed,
    };

    const elevenLabsConfig = {
      text: input,
      voiceId: voice_id || voice,
      language,
      stability,
      similarityBoost: similarity_boost,
      style,
      speakerBoost: speaker_boost,
      format: response_format as "mp3" | "wav",
      seed,
    };

    const result = provider === "lindsay"
      ? await generateLindsay(ttsConfig)
      : provider === "miu"
      ? await generateMiu(ttsConfig)
      : provider === "catherine"
      ? await generateCatherine(ttsConfig)
      : provider === "nana"
      ? await generateNana(ttsConfig)
      : provider === "stephanie"
      ? await generateStephanie(ttsConfig)
      : provider === "alexandra"
      ? await generateAlexandra(elevenLabsConfig)
      : provider === "eve"
      ? await generateEve(elevenLabsConfig)
      : await generateStarling(ttsConfig);

    if (!result.success) {
      const latency = Date.now() - startTime;
      await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
      await logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model,
        endpoint: "/api/v1/audio/speech",
        status: 500,
        latency_ms: latency,
        tokens_used: 0,
        error_message: result.error || "TTS generation failed",
        ip_address: ip,
        user_agent: userAgent,
      });
      return res.status(500).json({ error: { message: result.error || "TTS generation failed", type: "server_error", code: null } });
    }

    const latency = Date.now() - startTime;

    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, true);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/audio/speech",
      status: 200,
      latency_ms: latency,
      tokens_used: 0,
      ip_address: ip,
      user_agent: userAgent,
    });

    return res.status(200).json({
      object: "audio",
      model,
      audio: result.audioBase64,
      audio_url: result.audioUrl,
      format: result.format,
      text_length: result.textLength,
      credits_used: result.creditsUsed,
    });

  } catch (error: any) {
    const latency = Date.now() - startTime;

    const isRateLimit = error instanceof StarlingRateLimitError || error instanceof LindsayRateLimitError || error instanceof MiuRateLimitError || error instanceof CatherineRateLimitError || error instanceof NanaRateLimitError || error instanceof StephanieRateLimitError || error instanceof AlexandraRateLimitError || error instanceof EveRateLimitError;
    const isQuota = error instanceof StarlingQuotaError || error instanceof LindsayQuotaError || error instanceof MiuQuotaError || error instanceof CatherineQuotaError || error instanceof NanaQuotaError || error instanceof StephanieQuotaError || error instanceof AlexandraQuotaError || error instanceof EveQuotaError;
    const status = isRateLimit ? 429 : isQuota ? 402 : 500;

    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/audio/speech",
      status,
      latency_ms: latency,
      tokens_used: 0,
      error_message: error.message,
      ip_address: ip,
      user_agent: userAgent,
    });

    if (isRateLimit) {
      return res.status(429).json({ error: { message: "Rate limit exceeded. Please try again later.", type: "rate_limit_error", code: "rate_limit_exceeded" } });
    }
    if (isQuota) {
      return res.status(402).json({ error: { message: "Monthly credit quota exceeded.", type: "insufficient_quota", code: "insufficient_quota" } });
    }
    if (error instanceof StarlingError || error instanceof LindsayError || error instanceof MiuError || error instanceof CatherineError || error instanceof NanaError || error instanceof StephanieError || error instanceof AlexandraError || error instanceof EveError) {
      return res.status(400).json({ error: { message: error.message, type: "invalid_request_error", code: null } });
    }

    console.error("[api/v1/audio/speech] Unexpected error:", error);
    return res.status(500).json({ error: { message: "Internal server error", type: "server_error", code: null } });
  }
}
