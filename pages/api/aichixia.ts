// api from anilist.co/graphql.anilist.co
import type { NextApiRequest, NextApiResponse } from "next";
import anilist, {
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
  const { id, search, page, perPage, season, year, genre } = req.query;

  try {
    let data: any;

    // normalize query
    const p = page ? parseInt(page as string) : 1;
    const pp = perPage ? parseInt(perPage as string) : 10;

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
      case "search":
        if (!search) throw new Error("Missing search query");
        data = await searchMedia(type!, search as string, p, pp);
        break;

      case "detail":
        if (!id) throw new Error("Missing id");
        data = await getMediaById(parseInt(id as string), type);
        break;

      case "trending":
        data = await getTrending(p, pp);
        break;

      case "seasonal":
        if (!season || !year) throw new Error("Missing season/year");
        data = await getSeasonal(season as any, parseInt(year as string), p, pp);
        break;

      case "airing":
        data = await getAiringSchedule(p, pp);
        break;

      case "character":
        if (!id) throw new Error("Missing id");
        data = await getCharacterById(parseInt(id as string));
        break;

      case "staff":
        if (!id) throw new Error("Missing id");
        data = await getStaffById(parseInt(id as string));
        break;

      case "recommendations":
        if (!id) throw new Error("Missing id");
        data = await getRecommendationsForMedia(parseInt(id as string));
        break;

      case "top-genre":
        if (!genre) throw new Error("Missing genre");
        data = await getTopByGenre(genre as string, type!, p, pp);
        break;

      default:
        res.status(400).json({ error: "Invalid action" });
        return;
    }

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
