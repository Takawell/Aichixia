const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PHOENIX_MODEL = process.env.PHOENIX_MODEL || "@cf/leonardo/phoenix-1.0";

if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
  console.warn("[lib/phoenix] Warning: CLOUDFLARE credentials not set in env.");
}

export class PhoenixRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhoenixRateLimitError";
  }
}

export class PhoenixQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhoenixQuotaError";
  }
}

export async function generatePhoenix(
  prompt: string,
  opts?: { 
    steps?: number; 
    width?: number; 
    height?: number;
    seed?: number;
    guidance?: number;
    negative_prompt?: string;
  }
): Promise<{ imageBase64: string }> {
  if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
    throw new Error("CLOUDFLARE credentials not defined in environment variables.");
  }

  try {
    const payload = {
      prompt: prompt,
      steps: opts?.steps ?? 25,
      width: opts?.width ?? 1024,
      height: opts?.height ?? 1024,
      ...(opts?.seed !== undefined && { seed: opts.seed }),
      ...(opts?.guidance !== undefined && { guidance: opts.guidance }),
      ...(opts?.negative_prompt && { negative_prompt: opts.negative_prompt })
    };

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${PHOENIX_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new PhoenixRateLimitError("Phoenix rate limit exceeded");
      }
      if (response.status === 402) {
        throw new PhoenixQuotaError("Phoenix quota exceeded");
      }
      const errorText = await response.text();
      throw new Error(`Phoenix API error: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return { imageBase64: base64 };
  } catch (error: any) {
    if (error instanceof PhoenixRateLimitError || error instanceof PhoenixQuotaError) {
      throw error;
    }
    throw error;
  }
}

export async function quickGeneratePhoenix(
  prompt: string, 
  opts?: { 
    steps?: number; 
    width?: number; 
    height?: number;
    seed?: number;
    guidance?: number;
    negative_prompt?: string;
  }
) {
  const { imageBase64 } = await generatePhoenix(prompt, opts);
  return imageBase64;
}

export default {
  generatePhoenix,
  quickGeneratePhoenix,
};
