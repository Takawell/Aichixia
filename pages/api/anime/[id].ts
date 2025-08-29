// pages/api/anime/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getMediaById } from "@/lib/anilist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, type = "ANIME" } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    const data = await getMediaById(Number(id), type as any);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
