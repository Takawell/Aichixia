const TTS_API_KEY = process.env.TTS_API_KEY;
const TTS_VOICE_ID = process.env.TTS_VOICE_ID || "tc_66bc60339ab2db047154b94e";
const TTS_MODEL = process.env.TTS_MODEL || "ssfm-v21";
const TTS_API_URL = "https://api.typecast.ai/v1/text-to-speech";

if (!TTS_API_KEY) {
  console.warn("[lib/starling] Warning: TTS_API_KEY not set in env.");
}

export type EmotionPreset = "normal" | "happy" | "sad" | "angry" | "fearful" | "disgusted" | "surprised";

export type AudioFormat = "wav" | "mp3";

export type TTSConfig = {
  text: string;
  voiceId?: string;
  model?: string;
  language?: string;
  emotion?: EmotionPreset;
  emotionIntensity?: number;
  volume?: number;
  pitch?: number;
  tempo?: number;
  format?: AudioFormat;
  seed?: number;
};

export type TTSResponse = {
  success: boolean;
  audioBase64?: string;
  audioUrl?: string;
  format?: AudioFormat;
  error?: string;
  textLength?: number;
  creditsUsed?: number;
};

export class StarlingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StarlingError";
  }
}

export class StarlingRateLimitError extends StarlingError {
  constructor(message: string) {
    super(message);
    this.name = "StarlingRateLimitError";
  }
}

export class StarlingQuotaError extends StarlingError {
  constructor(message: string) {
    super(message);
    this.name = "StarlingQuotaError";
  }
}

function validateText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new StarlingError("Text cannot be empty");
  }

  if (text.length > 2000) {
    throw new StarlingError("Text exceeds maximum length of 2000 characters");
  }
}

function validateVolume(volume?: number): void {
  if (volume !== undefined && (volume < 0 || volume > 200)) {
    throw new StarlingError("Volume must be between 0 and 200");
  }
}

function validatePitch(pitch?: number): void {
  if (pitch !== undefined && (pitch < -12 || pitch > 12)) {
    throw new StarlingError("Pitch must be between -12 and 12 semitones");
  }
}

function validateTempo(tempo?: number): void {
  if (tempo !== undefined && (tempo < 0.5 || tempo > 2.0)) {
    throw new StarlingError("Tempo must be between 0.5 and 2.0");
  }
}

function validateEmotionIntensity(intensity?: number): void {
  if (intensity !== undefined && (intensity < 0 || intensity > 2)) {
    throw new StarlingError("Emotion intensity must be between 0 and 2");
  }
}

export async function generateSpeech(config: TTSConfig): Promise<TTSResponse> {
  if (!TTS_API_KEY) {
    return {
      success: false,
      error: "TTS_API_KEY not configured in environment variables"
    };
  }

  try {
    validateText(config.text);
    validateVolume(config.volume);
    validatePitch(config.pitch);
    validateTempo(config.tempo);
    validateEmotionIntensity(config.emotionIntensity);

    const requestBody = {
      voice_id: config.voiceId || TTS_VOICE_ID,
      text: config.text,
      model: config.model || TTS_MODEL,
      language: config.language || "eng",
      prompt: {
        emotion_preset: config.emotion || "normal",
        emotion_intensity: config.emotionIntensity ?? 1
      },
      output: {
        volume: config.volume ?? 100,
        audio_pitch: config.pitch ?? 0,
        audio_tempo: config.tempo ?? 1,
        audio_format: config.format || "mp3"
      },
      ...(config.seed !== undefined && { seed: config.seed })
    };

    const response = await fetch(TTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": TTS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new StarlingRateLimitError("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new StarlingQuotaError("Monthly credit quota exceeded.");
      }
      if (response.status === 401) {
        throw new StarlingError("Invalid API key.");
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new StarlingError(`Bad request: ${JSON.stringify(errorData)}`);
      }

      const errorText = await response.text();
      throw new StarlingError(`API error (${response.status}): ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const audioFormat = config.format || "mp3";
    const audioUrl = `data:audio/${audioFormat};base64,${audioBase64}`;

    return {
      success: true,
      audioBase64,
      audioUrl,
      format: audioFormat,
      textLength: config.text.length,
      creditsUsed: config.text.length
    };
  } catch (error: any) {
    if (error instanceof StarlingError) {
      throw error;
    }

    return {
      success: false,
      error: error.message || "Unknown error occurred during TTS generation"
    };
  }
}

export function isConfigured(): boolean {
  return !!TTS_API_KEY;
}

export function getConfig() {
  return {
    apiKey: TTS_API_KEY ? "***configured***" : null,
    voiceId: TTS_VOICE_ID,
    model: TTS_MODEL,
    apiUrl: TTS_API_URL
  };
}

export default {
  generateSpeech,
  isConfigured,
  getConfig,
  StarlingError,
  StarlingRateLimitError,
  StarlingQuotaError
};
