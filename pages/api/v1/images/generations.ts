import type { NextApiRequest, NextApiResponse } from "next";
import { generateFlux, FluxRateLimitError, FluxQuotaError } from "@/lib/flux";
import { generateLucid, LucidRateLimitError, LucidQuotaError } from "@/lib/lucid";
import { generatePhoenix, PhoenixRateLimitError, PhoenixQuotaError } from "@/lib/phoenix";
import { generateNano, NanoRateLimitError, NanoQuotaError } from "@/lib/nano";
import { logRequest, incrementUsage, updateDailyUsage, verifyApiKey } from "@/lib/console-utils";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

const MODEL_MAP: Record<string, "flux" | "lucid" | "phoenix" | "nano"> = {
  "flux-2-dev": "flux",
  "lucid-origin": "lucid",
  "phoenix-1.0": "phoenix",
  "nano-image": "nano",
};

const DEFAULT_MODEL = "flux-2-dev";

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
      endpoint: "/api/v1/images/generations",
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
    prompt,
    n = 1,
    size,
    steps,
    seed,
    guidance,
    negative_prompt,
    aspect_ratio,
    response_format = "b64_json",
  } = req.body;

  if (!prompt) {
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/images/generations",
      status: 400,
      tokens_used: 0,
      error_message: "Missing required field: prompt",
      ip_address: ip,
      user_agent: userAgent,
    });
    return res.status(400).json({ error: { message: "Missing required field: prompt", type: "invalid_request_error", param: "prompt", code: null } });
  }

  const provider = MODEL_MAP[model];
  if (!provider) {
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/images/generations",
      status: 400,
      tokens_used: 0,
      error_message: "Model not found",
      ip_address: ip,
      user_agent: userAgent,
    });
    return res.status(400).json({ error: { message: `Model '${model}' is not supported. Available models: ${Object.keys(MODEL_MAP).join(", ")}`, type: "invalid_request_error", param: "model", code: "model_not_found" } });
  }

  let width: number | undefined;
  let height: number | undefined;

  if (size) {
    const [w, h] = size.split("x").map(Number);
    if (w && h) {
      width = w;
      height = h;
    }
  }

  try {
    let imageBase64: string;

    if (provider === "flux") {
      const result = await generateFlux(prompt, { steps, width, height });
      imageBase64 = result.imageBase64;
    } else if (provider === "lucid") {
      const result = await generateLucid(prompt, { steps, width, height, seed, guidance, negative_prompt });
      imageBase64 = result.imageBase64;
    } else if (provider === "phoenix") {
      const result = await generatePhoenix(prompt, { steps, width, height, seed, guidance, negative_prompt });
      imageBase64 = result.imageBase64;
    } else {
      const result = await generateNano(prompt, { aspectRatio: aspect_ratio });
      imageBase64 = result.imageBase64;
    }

    const latency = Date.now() - startTime;

    await incrementUsage(apiKeyData.id);
    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, true);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/images/generations",
      status: 200,
      latency_ms: latency,
      tokens_used: 0,
      ip_address: ip,
      user_agent: userAgent,
    });

    const imageData = response_format === "url"
      ? { url: `data:image/png;base64,${imageBase64}` }
      : { b64_json: imageBase64 };

    return res.status(200).json({
      created: Math.floor(Date.now() / 1000),
      data: Array.from({ length: n }, () => imageData),
    });

  } catch (error: any) {
    const latency = Date.now() - startTime;

    const isRateLimit =
      error instanceof FluxRateLimitError ||
      error instanceof LucidRateLimitError ||
      error instanceof PhoenixRateLimitError ||
      error instanceof NanoRateLimitError;

    const isQuota =
      error instanceof FluxQuotaError ||
      error instanceof LucidQuotaError ||
      error instanceof PhoenixQuotaError ||
      error instanceof NanoQuotaError;

    const status = isRateLimit ? 429 : isQuota ? 402 : 500;

    await updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false);
    await logRequest({
      api_key_id: apiKeyData.id,
      user_id: apiKeyData.user_id,
      model,
      endpoint: "/api/v1/images/generations",
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
      return res.status(402).json({ error: { message: "Quota exceeded. Please check your plan.", type: "insufficient_quota", code: "insufficient_quota" } });
    }

    console.error("[api/v1/images/generations] Unexpected error:", error);
    return res.status(500).json({ error: { message: error.message || "Internal server error", type: "server_error", code: null } });
  }
}
