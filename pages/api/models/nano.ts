import type { NextApiRequest, NextApiResponse } from "next";
import { generateNano, NanoRateLimitError, NanoQuotaError } from "@/lib/nano";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, aspectRatio } = req.body as {
      prompt: string;
      aspectRatio?: string;
    };

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateNano(prompt, { aspectRatio });
    
    return res.status(200).json({ 
      type: "image", 
      imageBase64: result.imageBase64,
      provider: "nano" 
    });

  } catch (err: any) {
    if (err instanceof NanoRateLimitError) {
      return res.status(429).json({ 
        error: "Nano Banana rate limit exceeded",
        details: err.message 
      });
    }
    
    if (err instanceof NanoQuotaError) {
      return res.status(402).json({ 
        error: "Nano Banana quota exceeded",
        details: err.message 
      });
    }

    console.error("Nano Banana API error:", err.message);
    return res.status(500).json({ 
      error: "Nano Banana is currently unavailable",
      details: err.message 
    });
  }
}
