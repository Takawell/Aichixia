import { NextRequest, NextResponse } from "next/server";
import { generateSpeech, isConfigured, getConfig, StarlingError, StarlingRateLimitError, StarlingQuotaError } from "@/lib/starling";

export async function POST(req: NextRequest) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { error: "TTS service not configured. Please set TTS_API_KEY in environment variables." },
        { status: 503 }
      );
    }

    const body = await req.json();

    if (!body.text) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: result.error || "TTS generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audio: result.audioUrl,
      audioBase64: result.audioBase64,
      format: result.format,
      textLength: result.textLength,
      creditsUsed: result.creditsUsed
    });

  } catch (error: any) {
    if (error instanceof StarlingRateLimitError) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    if (error instanceof StarlingQuotaError) {
      return NextResponse.json(
        { error: "Monthly credit quota exceeded." },
        { status: 402 }
      );
    }

    if (error instanceof StarlingError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error("[api/models/starling] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const config = getConfig();
    return NextResponse.json({
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
    return NextResponse.json(
      { error: "Failed to retrieve configuration" },
      { status: 500 }
    );
  }
}
