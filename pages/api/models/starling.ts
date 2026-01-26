import type { NextApiRequest, NextApiResponse } from "next";
import { generateSpeech, isConfigured, getConfig, StarlingError, StarlingRateLimitError, StarlingQuotaError } from "@/lib/starling";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      if (!isConfigured()) {
        return res.status(503).json({
          error: "TTS service not configured. Please set TTS_API_KEY in environment variables."
        });
      }

      const body = req.body;

      if (!body.text) {
        return res.status(400).json({
          error: "Missing required field: text"
        });
      }

      const result = await generateSpeech({
        text: body.text,
        voiceId: body.voiceId,
        model: body.model,
        language: body.language,
        emotion: body.emotion,
        emotionIntensity: body.emotionIntensity,
        volume: body.volume,
        pitch: body.pitch,
        tempo: body.tempo,
        format: body.format,
        seed: body.seed
      });

      if (!result.success) {
        return res.status(500).json({
          error: result.error || "TTS generation failed"
        });
      }

      return res.status(200).json({
        success: true,
        audio: result.audioUrl,
        audioBase64: result.audioBase64,
        format: result.format,
        textLength: result.textLength,
        creditsUsed: result.creditsUsed
      });

    } catch (error: any) {
      if (error instanceof StarlingRateLimitError) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please try again later."
        });
      }

      if (error instanceof StarlingQuotaError) {
        return res.status(402).json({
          error: "Monthly credit quota exceeded."
        });
      }

      if (error instanceof StarlingError) {
        return res.status(400).json({
          error: error.message
        });
      }

      console.error("[api/models/starling] Unexpected error:", error);
      return res.status(500).json({
        error: "Internal server error"
      });
    }
  } else if (req.method === "GET") {
    try {
      const config = getConfig();

      return res.status(200).json({
        status: isConfigured() ? "configured" : "not_configured",
        config: {
          voiceId: config.voiceId,
          model: config.model,
          apiUrl: config.apiUrl,
          apiKey: config.apiKey
        }
      });

    } catch (error: any) {
      console.error("[api/models/starling] GET error:", error);
      return res.status(500).json({
        error: "Failed to retrieve configuration"
      });
    }
  } else {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }
}
