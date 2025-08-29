// pages/api/anime/seasonal.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSeasonal } from "@/lib/anilist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { season, year, page = "1", perPage = "10" } = req.query;
    if (!season || !year) return res.status(400).json({ error: "Missing season or year" });
    const data = await getSeasonal(season as any, Number(year), Number(page), Number(perPage));
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
