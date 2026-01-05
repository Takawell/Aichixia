import type { NextApiRequest, NextApiResponse } from "next";
import { generateLucid, LucidRateLimitError, LucidQuotaError } from "@/lib/lucid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, steps, width, height, seed, guidance, negative_prompt } = req.body as {
      prompt: string;
      steps?: number;
      width?: number;
      height?: number;
      seed?: number;
      guidance?: number;
      negative_prompt?: string;
    };

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateLucid(prompt, { 
      steps: steps ?? 25,
      width: width ?? 1024,
      height: height ?? 1024,
      seed,
      guidance,
      negative_prompt
    });
    
    return res.status(200).json({ 
      type: "image", 
      imageBase64: result.imageBase64,
      provider: "lucid" 
    });

  } catch (err: any) {
    if (err instanceof LucidRateLimitError) {
      return res.status(429).json({ 
        error: "Lucid rate limit exceeded",
        details: err.message 
      });
    }
    
    if (err instanceof LucidQuotaError) {
      return res.status(402).json({ 
        error: "Lucid quota exceeded",
        details: err.message 
      });
    }

    console.error("Lucid API error:", err.message);
    return res.status(500).json({ 
      error: "Lucid is currently unavailable",
      details: err.message 
    });
  }
}
