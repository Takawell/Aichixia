const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const LUCID_MODEL = process.env.LUCID_MODEL || "@cf/leonardo/lucid-origin";

if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
  console.warn("[lib/lucid] Warning: CLOUDFLARE credentials not set in env.");
}

export class LucidRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LucidRateLimitError";
  }
}

export class LucidQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LucidQuotaError";
  }
}

export async function generateLucid(
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
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${LUCID_MODEL}`,
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
        throw new LucidRateLimitError("Lucid rate limit exceeded");
      }
      if (response.status === 402) {
        throw new LucidQuotaError("Lucid quota exceeded");
      }
      const errorText = await response.text();
      throw new Error(`Lucid API error: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return { imageBase64: data.result.image };
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return { imageBase64: base64 };
    }
  } catch (error: any) {
    if (error instanceof LucidRateLimitError || error instanceof LucidQuotaError) {
      throw error;
    }
    throw error;
  }
}

export async function quickGenerateLucid(
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
  const { imageBase64 } = await generateLucid(prompt, opts);
  return imageBase64;
}

export default {
  generateLucid,
  quickGenerateLucid,
};
