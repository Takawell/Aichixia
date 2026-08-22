const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

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

async function uploadToImgbb(base64Image: string): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error("IMGBB_API_KEY not defined in environment variables.");
  }

  const cleanBase64 = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  const form = new URLSearchParams();
  form.append("key", IMGBB_API_KEY);
  form.append("image", cleanBase64);

  let response;
  try {
    response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  } catch (fetchError: any) {
    console.error("[lib/nano] imgbb fetch failed:", fetchError.message);
    throw new Error(`imgbb network error: ${fetchError.message}`);
  }

  const responseText = await response.text();
  console.log("[lib/nano] imgbb response status:", response.status);
  console.log("[lib/nano] imgbb response body:", responseText);

  if (!response.ok) {
    throw new Error(`imgbb upload failed: ${response.status} - ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    throw new Error("Invalid JSON response from imgbb");
  }

  const uploadedUrl = data?.data?.url;
  if (!uploadedUrl) {
    console.error("[lib/nano] imgbb response missing url:", data);
    throw new Error("imgbb upload did not return a URL");
  }

  return uploadedUrl;
}

export async function generateNano(
  prompt: string,
  opts?: { aspectRatio?: string; imageUrl?: string; imageBase64Input?: string }
): Promise<{ imageBase64: string }> {
  let sourceUrl = opts?.imageUrl;

  if (!sourceUrl && opts?.imageBase64Input) {
    sourceUrl = await uploadToImgbb(opts.imageBase64Input);
    console.log("[lib/nano] Uploaded to imgbb:", sourceUrl);
  }

  if (!sourceUrl) {
    throw new Error("imageUrl or imageBase64Input is required for this API.");
  }

  const endpoint = `https://axlyapi.qzz.io/ai/nanobanana?url=${encodeURIComponent(
    sourceUrl
  )}&prompt=${encodeURIComponent(prompt)}`;

  console.log("[lib/nano] Request URL:", endpoint);

  let response;
  try {
    response = await fetch(endpoint, { method: "GET" });
    console.log("[lib/nano] Fetch completed, status:", response.status);
  } catch (fetchError: any) {
    console.error("[lib/nano] Fetch failed:", fetchError.message);
    throw new Error(`Network error: ${fetchError.message}`);
  }

  console.log("[lib/nano] Response status:", response.status);
  console.log("[lib/nano] Response headers:", Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[lib/nano] Error response:", errorText);

    if (response.status === 429) {
      throw new NanoRateLimitError(`Rate limit exceeded: ${errorText}`);
    }
    if (response.status === 402) {
      throw new NanoQuotaError(`Quota exceeded: ${errorText}`);
    }
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    const bodyText = await response.text();
    console.error("[lib/nano] Unexpected non-image response:", bodyText);
    throw new Error("No image data in response");
  }

  const arrayBuffer = await response.arrayBuffer();
  const imageBase64 = Buffer.from(arrayBuffer).toString("base64");

  return { imageBase64 };
}

export async function quickGenerateNano(
  prompt: string,
  opts?: { aspectRatio?: string; imageUrl?: string; imageBase64Input?: string }
) {
  const { imageBase64 } = await generateNano(prompt, opts);
  return imageBase64;
}

export default {
  generateNano,
  quickGenerateNano,
};
