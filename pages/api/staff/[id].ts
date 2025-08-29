import type { NextApiRequest, NextApiResponse } from "next";
import { getStaffById } from "@/lib/anilist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });
    const data = await getStaffById(Number(id));
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
