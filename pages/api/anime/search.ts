// pages/api/anime/search.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { searchMedia } from "@/lib/anilist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { q, type = "ANIME", page = "1", perPage = "10" } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query (q)" });
    const data = await searchMedia(type as any, q as string, Number(page), Number(perPage));
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
