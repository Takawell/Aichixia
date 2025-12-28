const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const FLUX_MODEL = "@cf/black-forest-labs/flux-1-schnell";

if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
  console.warn("[lib/flux] Warning: CLOUDFLARE credentials not set in env.");
}

export class FluxRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FluxRateLimitError";
  }
}

export class FluxQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FluxQuotaError";
  }
}

export async function generateFlux(
  prompt: string,
  opts?: { steps?: number }
): Promise<{ imageBase64: string }> {
  if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
    throw new Error("CLOUDFLARE credentials not defined in environment variables.");
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${FLUX_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          steps: opts?.steps ?? 4,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new FluxRateLimitError("Flux rate limit exceeded");
      }
      if (response.status === 402) {
        throw new FluxQuotaError("Flux quota exceeded");
      }
      throw new Error(`Flux API error: ${response.status}`);
    }

    const data = await response.json();
    return { imageBase64: data.result.image };
  } catch (error: any) {
    if (error instanceof FluxRateLimitError || error instanceof FluxQuotaError) {
      throw error;
    }
    throw error;
  }
}
