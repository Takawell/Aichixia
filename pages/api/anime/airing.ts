// pages/api/anime/airing.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getAiringSchedule } from "@/lib/anilist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = "1", perPage = "10" } = req.query;
    const data = await getAiringSchedule(Number(page), Number(perPage));
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
