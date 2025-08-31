export const ANILIST_API = "https://graphql.anilist.co";

export async function gql(query: string, variables?: Record<string, any>) {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`[AniList] ${res.status} ${res.statusText}: ${txt}`);
  }

  return res.json();
}

export type MediaType = "ANIME" | "MANGA" | "MANHWA" | "MANHUA" | "LIGHT_NOVEL";

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export interface Title {
  romaji?: string;
  english?: string;
  native?: string;
}

export interface CoverImage {
  extraLarge?: string;
  large: string;
  medium?: string;
  color?: string;
}

export interface Media {
  id: number;
  title: Title;
  coverImage: CoverImage;
  format?: MediaFormat;
  type: MediaType;
  status?: MediaStatus;
  description?: string;
  averageScore?: number;
  meanScore?: number;
  season?: MediaSeason;
  seasonYear?: number;
  episodes?: number | null;
  chapters?: number | null;
  volumes?: number | null;
  duration?: number | null;
  genres?: string[];
  bannerImage?: string | null;
}

function mapType(type?: MediaType): "ANIME" | "MANGA" | undefined {
  if (!type) return undefined;
  if (type === "ANIME") return "ANIME";
  if (["MANGA", "MANHWA", "MANHUA", "LIGHT_NOVEL"].includes(type)) {
    return "MANGA";
  }
  return undefined;
}

// Search
export async function searchMedia(
  type: MediaType,
  search: string,
  page = 1,
  perPage = 10
) {
  const query = `
    query ($search: String, $page: Int, $perPage: Int, $type: MediaType) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(
          search: $search,
          type: $type,
          sort: [SEARCH_MATCH, POPULARITY_DESC]
        ) {
          id
          title { romaji english native }
          coverImage { extraLarge large medium color }
          format
          type
          status
          averageScore
          meanScore
          season
          seasonYear
          episodes
          chapters
          volumes
          duration
          genres
        }
      }
    }
  `;
  return gql(query, { search, page, perPage, type: mapType(type) });
}

// Detail by ID
export async function getMediaById(id: number, type?: MediaType) {
  const query = `
    query ($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        id
        title { romaji english native }
        description(asHtml: false)
        episodes
        chapters
        volumes
        status
        season
        seasonYear
        format
        averageScore
        meanScore
        coverImage { extraLarge large medium color }
        bannerImage
        genres
        tags { name rank isMediaSpoiler }
        duration
        studios(isMain: true) { nodes { id name } }
        relations {
          edges {
            relationType
            node {
              id
              type
              title { romaji english native }
              coverImage { large }
              format
              averageScore
            }
          }
        }
        characters(perPage: 10) {
          nodes {
            id
            name { full native }
            image { large }
          }
        }
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
        trailer { id site thumbnail }
      }
    }
  `;
  return gql(query, { id, type: mapType(type) });
}

// Trending
export async function getTrending(page = 1, perPage = 10) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
          id
          title { romaji english }
          coverImage { large }
          averageScore
          trending
          popularity
        }
      }
    }
  `;
  return gql(query, { page, perPage });
}

// Seasonal
export async function getSeasonal(
  season: MediaSeason,
  year: number,
  page = 1,
  perPage = 10
) {
  const query = `
    query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(
          type: ANIME,
          season: $season,
          seasonYear: $year,
          sort: POPULARITY_DESC
        ) {
          id
          title { romaji english }
          coverImage { large }
          averageScore
          status
          episodes
        }
      }
    }
  `;
  return gql(query, { season, year, page, perPage });
}

// Airing schedule
export async function getAiringSchedule(page = 1, perPage = 10) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(notYetAired: false) {
          media {
            id
            title { romaji english }
            coverImage { large }
          }
          episode
          airingAt
        }
      }
    }
  `;
  return gql(query, { page, perPage });
}

// Character detail
export async function getCharacterById(id: number) {
  const query = `
    query ($id: Int) {
      Character(id: $id) {
        id
        name { full native }
        image { large }
        description(asHtml: false)
        media(perPage: 6) {
          nodes {
            id
            title { romaji english }
            coverImage { large }
          }
        }
      }
    }
  `;
  return gql(query, { id });
}

// Staff detail
export async function getStaffById(id: number) {
  const query = `
    query ($id: Int) {
      Staff(id: $id) {
        id
        name { full native }
        image { large }
        description(asHtml: false)
        primaryOccupations
      }
    }
  `;
  return gql(query, { id });
}

// Recommendations
export async function getRecommendationsForMedia(id: number) {
  const query = `
    query ($id: Int) {
      Media(id: $id) {
        recommendations(perPage: 10, sort: RATING_DESC) {
          nodes {
            rating
            mediaRecommendation {
              id
              title { romaji english }
              coverImage { large }
              averageScore
            }
          }
        }
      }
    }
  `;
  return gql(query, { id });
}

// Top by Genre
export async function getTopByGenre(
  genre: string,
  type: MediaType = "ANIME",
  page = 1,
  perPage = 10
) {
  const query = `
    query ($genre: String, $type: MediaType, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(
          genre_in: [$genre],
          type: $type,
          sort: [SCORE_DESC, POPULARITY_DESC]
        ) {
          id
          title { romaji english }
          coverImage { large }
          averageScore
        }
      }
    }
  `;
  return gql(query, { genre, type: mapType(type), page, perPage });
}

export default {
  searchMedia,
  getMediaById,
  getTrending,
  getSeasonal,
  getAiringSchedule,
  getCharacterById,
  getStaffById,
  getRecommendationsForMedia,
  getTopByGenre,
};
