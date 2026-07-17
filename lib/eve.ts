const TTS_API_KEY = process.env.ELEVENLABS_API_KEY;
const TTS_VOICE_ID = process.env.TTS_VOICE_ID_EVE || "BZgkqPqms7Kj9ulSkVzn";
const TTS_MODEL = process.env.TTS_MODEL_EVE || "eleven_multilingual_v2";
const TTS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

if (!TTS_API_KEY) {
  console.warn("[lib/eve] Warning: ELEVENLABS_API_KEY not set in env.");
}

export type AudioFormat = "mp3" | "wav";

export type SupportedLanguage = "kor" | "eng" | "msa" | "vie";

const LANGUAGE_CODE_MAP: Record<string, string> = {
  kor: "ko",
  eng: "en",
  msa: "ms",
  vie: "vi",
};

const OUTPUT_FORMAT_MAP: Record<AudioFormat, string> = {
  mp3: "mp3_44100_128",
  wav: "pcm_44100",
};

export type TTSConfig = {
  text: string;
  voiceId?: string;
  model?: string;
  language?: SupportedLanguage | string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
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

export class EveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EveError";
  }
}

export class EveRateLimitError extends EveError {
  constructor(message: string) {
    super(message);
    this.name = "EveRateLimitError";
  }
}

export class EveQuotaError extends EveError {
  constructor(message: string) {
    super(message);
    this.name = "EveQuotaError";
  }
}

function validateText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new EveError("Text cannot be empty");
  }

  if (text.length > 5000) {
    throw new EveError("Text exceeds maximum length of 5000 characters");
  }
}

function validateStability(stability?: number): void {
  if (stability !== undefined && (stability < 0 || stability > 1)) {
    throw new EveError("Stability must be between 0 and 1");
  }
}

function validateSimilarityBoost(similarityBoost?: number): void {
  if (similarityBoost !== undefined && (similarityBoost < 0 || similarityBoost > 1)) {
    throw new EveError("Similarity boost must be between 0 and 1");
  }
}

function validateStyle(style?: number): void {
  if (style !== undefined && (style < 0 || style > 1)) {
    throw new EveError("Style must be between 0 and 1");
  }
}

export async function generateSpeech(config: TTSConfig): Promise<TTSResponse> {
  if (!TTS_API_KEY) {
    return {
      success: false,
      error: "ELEVENLABS_API_KEY not configured in environment variables"
    };
  }

  try {
    validateText(config.text);
    validateStability(config.stability);
    validateSimilarityBoost(config.similarityBoost);
    validateStyle(config.style);

    const voiceId = config.voiceId || TTS_VOICE_ID;
    const format = config.format || "mp3";
    const outputFormat = OUTPUT_FORMAT_MAP[format];
    const languageCode = config.language ? LANGUAGE_CODE_MAP[config.language] || config.language : undefined;

    const requestBody = {
      text: config.text,
      model_id: config.model || TTS_MODEL,
      language_code: languageCode,
      voice_settings: {
        stability: config.stability ?? 0.5,
        similarity_boost: config.similarityBoost ?? 0.75,
        style: config.style ?? 0,
        use_speaker_boost: config.speakerBoost ?? true,
      },
      ...(config.seed !== undefined && { seed: config.seed }),
    };

    const response = await fetch(`${TTS_API_URL}/${voiceId}?output_format=${outputFormat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": TTS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new EveRateLimitError("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new EveQuotaError("Monthly credit quota exceeded.");
      }
      if (response.status === 401) {
        throw new EveError("Invalid API key.");
      }
      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        throw new EveError(`Unprocessable request: ${JSON.stringify(errorData)}`);
      }

      const errorText = await response.text();
      throw new EveError(`API error (${response.status}): ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/${format};base64,${audioBase64}`;

    return {
      success: true,
      audioBase64,
      audioUrl,
      format,
      textLength: config.text.length,
      creditsUsed: config.text.length
    };
  } catch (error: any) {
    if (error instanceof EveError) {
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
  EveError,
  EveRateLimitError,
  EveQuotaError
};
