// pages/api/anime/genre.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getTopByGenre } from "@/lib/anilist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { genre, type = "ANIME", page = "1", perPage = "10" } = req.query;
    if (!genre) return res.status(400).json({ error: "Missing genre" });
    const data = await getTopByGenre(genre as string, type as any, Number(page), Number(perPage));
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
