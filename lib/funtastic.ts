const FUNTASTIC_BASE_URL = process.env.FUNTASTIC_BASE_URL;
const FUNTASTIC_API_KEY = process.env.FUNTASTIC_API_KEY;

export type FuntasticParams = {
  prompt: string;
  ratio?: string;
  aspect_ratio?: string;
  sound?: number;
  ai_sound?: number;
};

export type FuntasticResult = {
  video: string;
};

export const FUNTASTIC_LIMITS = {
  ratio: ["auto", "1:1", "16:9", "9:16"],
};

export class FuntasticRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FuntasticRateLimitError";
  }
}

export class FuntasticQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FuntasticQuotaError";
  }
}

export async function generateVideo(params: FuntasticParams): Promise<FuntasticResult> {
  if (!FUNTASTIC_API_KEY) {
    throw new Error("FUNTASTIC_API_KEY not defined in environment variables.");
  }
  if (!params.prompt) {
    throw new Error("prompt is required.");
  }

  const ratio = FUNTASTIC_LIMITS.ratio.includes(params.ratio ?? "") ? (params.ratio as string) : "16:9";
  const aspectRatio = FUNTASTIC_LIMITS.ratio.includes(params.aspect_ratio ?? "") ? (params.aspect_ratio as string) : ratio;

  const query = new URLSearchParams({
    prompt: params.prompt,
    ratio,
    aspect_ratio: aspectRatio,
    sound: String(params.sound ?? 2),
    ai_sound: String(params.ai_sound ?? 2),
    json: "1",
    apikey: FUNTASTIC_API_KEY,
  });

  try {
    const response = await fetch(`${FUNTASTIC_BASE_URL}?${query.toString()}`);

    if (response.status === 429) {
      throw new FuntasticRateLimitError("Funtastic rate limit exceeded.");
    }
    if (response.status === 402) {
      throw new FuntasticQuotaError("Funtastic quota exceeded.");
    }
    if (!response.ok) {
      throw new Error(`Funtastic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.status || !data.url) {
      throw new Error("Funtastic returned no video URL.");
    }

    return {
      video: data.url,
    };
  } catch (error: any) {
    if (error instanceof FuntasticRateLimitError || error instanceof FuntasticQuotaError) {
      throw error;
    }
    throw error;
  }
}

export default {
  generateVideo,
};
