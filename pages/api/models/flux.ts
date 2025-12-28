import type { NextApiRequest, NextApiResponse } from "next";
import { generateFlux, FluxRateLimitError, FluxQuotaError } from "@/lib/flux";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, steps } = req.body as {
      prompt: string;
      steps?: number;
    };

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await generateFlux(prompt, { steps: steps ?? 4 });
    
    return res.status(200).json({ 
      type: "image", 
      imageBase64: result.imageBase64,
      provider: "flux" 
    });

  } catch (err: any) {
    if (err instanceof FluxRateLimitError) {
      return res.status(429).json({ 
        error: "Flux rate limit exceeded",
        details: err.message 
      });
    }
    
    if (err instanceof FluxQuotaError) {
      return res.status(402).json({ 
        error: "Flux quota exceeded",
        details: err.message 
      });
    }

    console.error("Flux API error:", err.message);
    return res.status(500).json({ 
      error: "Flux is currently unavailable",
      details: err.message 
    });
  }
}
