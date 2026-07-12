const TTS_API_KEY = process.env.TTS_API_KEY;
const TTS_VOICE_ID = process.env.TTS_VOICE_ID_NANA || "tc_6076e25ac80469168e3771cf";
const TTS_MODEL = process.env.TTS_MODEL_NANA || "ssfm-v30";
const TTS_API_URL = "https://api.typecast.ai/v1/text-to-speech";

if (!TTS_API_KEY) {
  console.warn("[lib/nana] Warning: TTS_API_KEY not set in env.");
}

export type EmotionPreset = "normal" | "happy" | "sad" | "angry" | "fearful" | "disgusted" | "surprised";

export type AudioFormat = "wav" | "mp3";

export type SupportedLanguage = "eng" | "kor" | "jpn" | "cmn" | "spa";

export type TTSConfig = {
  text: string;
  voiceId?: string;
  model?: string;
  language?: SupportedLanguage | string;
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

export class NanaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NanaError";
  }
}

export class NanaRateLimitError extends NanaError {
  constructor(message: string) {
    super(message);
    this.name = "NanaRateLimitError";
  }
}

export class NanaQuotaError extends NanaError {
  constructor(message: string) {
    super(message);
    this.name = "NanaQuotaError";
  }
}

function validateText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new NanaError("Text cannot be empty");
  }

  if (text.length > 2000) {
    throw new NanaError("Text exceeds maximum length of 2000 characters");
  }
}

function validateVolume(volume?: number): void {
  if (volume !== undefined && (volume < 0 || volume > 200)) {
    throw new NanaError("Volume must be between 0 and 200");
  }
}

function validatePitch(pitch?: number): void {
  if (pitch !== undefined && (pitch < -12 || pitch > 12)) {
    throw new NanaError("Pitch must be between -12 and 12 semitones");
  }
}

function validateTempo(tempo?: number): void {
  if (tempo !== undefined && (tempo < 0.5 || tempo > 2.0)) {
    throw new NanaError("Tempo must be between 0.5 and 2.0");
  }
}

function validateEmotionIntensity(intensity?: number): void {
  if (intensity !== undefined && (intensity < 0 || intensity > 2)) {
    throw new NanaError("Emotion intensity must be between 0 and 2");
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
        throw new NanaRateLimitError("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new NanaQuotaError("Monthly credit quota exceeded.");
      }
      if (response.status === 401) {
        throw new NanaError("Invalid API key.");
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new NanaError(`Bad request: ${JSON.stringify(errorData)}`);
      }

      const errorText = await response.text();
      throw new NanaError(`API error (${response.status}): ${errorText}`);
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
    if (error instanceof NanaError) {
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
  NanaError,
  NanaRateLimitError,
  NanaQuotaError
};
