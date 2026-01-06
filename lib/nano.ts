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

  let response;
  try {
    response = await fetch(
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
    console.log("[lib/nano] Fetch completed, status:", response.status);
  } catch (fetchError: any) {
    console.error("[lib/nano] Fetch failed:", fetchError.message);
    throw new Error(`Network error: ${fetchError.message}`);
  }

  console.log("[lib/nano] Response status:", response.status);
  console.log("[lib/nano] Response headers:", Object.fromEntries(response.headers.entries()));

  const responseText = await response.text();
  console.log("[lib/nano] Response body (raw):", responseText);

  if (!response.ok) {
    console.error("[lib/nano] Error response:", responseText);

    if (response.status === 429) {
      throw new NanoRateLimitError(`Nano Banana rate limit exceeded: ${responseText}`);
    }
    if (response.status === 402) {
      throw new NanoQuotaError(`Nano Banana quota exceeded: ${responseText}`);
    }
    throw new Error(`Nano Banana API error: ${response.status} - ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
    console.log("[lib/nano] Parsed response:", JSON.stringify(data, null, 2));
  } catch (parseError) {
    console.error("[lib/nano] JSON parse failed:", parseError);
    throw new Error("Invalid JSON response from API");
  }

  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (part: any) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    console.error("[lib/nano] No image data found. Full response:", data);
    throw new Error("No image data in response");
  }

  return { imageBase64: imagePart.inlineData.data };
}

export async function quickGenerateNano(prompt: string, opts?: { aspectRatio?: string }) {
  const { imageBase64 } = await generateNano(prompt, opts);
  return imageBase64;
}

export default {
  generateNano,
  quickGenerateNano,
};
