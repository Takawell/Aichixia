// api from anilist.co/graphql.anilist.co
import type { NextApiRequest, NextApiResponse } from "next";
import {
  MediaType,
  getMediaById,
  searchMedia,
  getTrending,
  getSeasonal,
  getAiringSchedule,
  getCharacterById,
  getStaffById,
  getRecommendationsForMedia,
  getTopByGenre,
} from "@/lib/anilist";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { category, action } = req.query;
  const { id, search, query, page, perPage, season, year, genre } = req.query;

  try {
    let data: any;

    // normalize query
    const p = page ? parseInt(page as string, 10) : 1;
    const pp = perPage ? parseInt(perPage as string, 10) : 10;

    // Map category -> MediaType
    const mapCategory = (cat?: string): MediaType | undefined => {
      switch (cat?.toLowerCase()) {
        case "anime": return "ANIME";
        case "manga": return "MANGA";
        case "manhwa": return "MANHWA";
        case "manhua": return "MANHUA";
        case "ln":
        case "lightnovel":
        case "light_novel": return "LIGHT_NOVEL";
        default: return undefined;
      }
    };

    const type = mapCategory(category as string);

    switch (action) {
      case "search": {
        const q = (search as string) || (query as string);
        if (!q) return res.status(400).json({ error: "Missing search query (?search= or ?query=)" });
        if (!type) return res.status(400).json({ error: "Missing or invalid category" });
        data = await searchMedia(type, q, p, pp);
        break;
      }

      case "detail": {
        if (!id) return res.status(400).json({ error: "Missing id" });
        data = await getMediaById(parseInt(id as string, 10), type);
        break;
      }

      case "trending": {
        data = await getTrending(p, pp);
        break;
      }

      case "seasonal": {
        if (!season || !year) return res.status(400).json({ error: "Missing season/year" });
        data = await getSeasonal(season as any, parseInt(year as string, 10), p, pp);
        break;
      }

      case "airing": {
        data = await getAiringSchedule(p, pp);
        break;
      }

      case "character": {
        if (!id) return res.status(400).json({ error: "Missing id" });
        data = await getCharacterById(parseInt(id as string, 10));
        break;
      }

      case "staff": {
        if (!id) return res.status(400).json({ error: "Missing id" });
        data = await getStaffById(parseInt(id as string, 10));
        break;
      }

      case "recommendations": {
        if (!id) return res.status(400).json({ error: "Missing id" });
        data = await getRecommendationsForMedia(parseInt(id as string, 10));
        break;
      }

      case "top-genre": {
        if (!genre) return res.status(400).json({ error: "Missing genre" });
        if (!type) return res.status(400).json({ error: "Category required for top-genre" });
        data = await getTopByGenre(genre as string, type, p, pp);
        break;
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
