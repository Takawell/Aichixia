const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NANO_MODEL = process.env.NANO_MODEL || "gemini-2.5-flash-image";

if (!GEMINI_API_KEY) {
  console.warn("[lib/nano] Warning: GEMINI_API_KEY not set in env.");
}

export class NanoRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NanoRateLimitError";
  }
}

export class NanoQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NanoQuotaError";
  }
}

export async function generateNano(
  prompt: string,
  opts?: { aspectRatio?: string }
): Promise<{ imageBase64: string }> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not defined in environment variables.");
  }

  try {
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    };

    console.log("[lib/nano] Request URL:", `https://generativelanguage.googleapis.com/v1beta/models/${NANO_MODEL}:generateContent`);
    console.log("[lib/nano] Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${NANO_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("[lib/nano] Response status:", response.status);
    console.log("[lib/nano] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[lib/nano] Error response body:", errorText);

      if (response.status === 429) {
        throw new NanoRateLimitError(`Nano Banana rate limit exceeded: ${errorText}`);
      }
      if (response.status === 402) {
        throw new NanoQuotaError(`Nano Banana quota exceeded: ${errorText}`);
      }
      throw new Error(`Nano Banana API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[lib/nano] Success response:", JSON.stringify(data, null, 2));

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      console.error("[lib/nano] No image data found in response:", data);
      throw new Error("No image data in response");
    }

    return { imageBase64: imagePart.inlineData.data };
  } catch (error: any) {
    console.error("[lib/nano] Caught error:", error);
    if (error instanceof NanoRateLimitError || error instanceof NanoQuotaError) {
      throw error;
    }
    throw error;
  }
}

export async function quickGenerateNano(prompt: string, opts?: { aspectRatio?: string }) {
  const { imageBase64 } = await generateNano(prompt, opts);
  return imageBase64;
}

export default {
  generateNano,
  quickGenerateNano,
};
