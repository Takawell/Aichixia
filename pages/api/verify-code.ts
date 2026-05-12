import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { answer } = req.body;
  const code = process.env.SECRET_CODE ?? "";

  if (!code) {
    return res.status(500).json({ message: "Server misconfigured" });
  }

  if (typeof answer !== "string" || answer.trim().toLowerCase() !== code.toLowerCase()) {
    return res.status(200).json({ correct: false });
  }

  return res.status(200).json({ correct: true, code });
}
