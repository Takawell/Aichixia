import { Client } from "@gradio/client";

const HAILUO_SPACE = process.env.HAILUO_SPACE || "multimodalart/minimax-h3";
const HAILUO_TOKEN = process.env.HAILUO_TOKEN;

export type HailuoParams = {
  prompt?: string;
  image_path?: Blob | File | Buffer;
  last_image_path?: Blob | File | Buffer;
  canvas?: string;
  duration?: number;
  steps?: number;
  seed?: number;
  upsample?: boolean;
};

export type HailuoResult = {
  video: string;
  markdown: string;
  seedUsed: string;
};

export const HAILUO_LIMITS = {
  duration: { min: 2, max: 14 },
  steps: { min: 10, max: 40 },
  canvas: [
    "960x544 · 16:9 fast",
    "1024x576 · 16:9 fast",
    "1152x640 · 16:9",
    "1280x704 · 16:9",
    "1344x768 · 16:9 full",
    "544x960 · 9:16 fast",
    "640x1152 · 9:16",
    "768x1344 · 9:16 full",
    "544x544 · 1:1 fast",
    "768x768 · 1:1 full",
    "768x576 · 4:3 fast",
    "1024x768 · 4:3 full",
    "576x768 · 3:4 fast",
    "768x1024 · 3:4 full",
    "1152x512 · 21:9 fast",
    "1536x672 · 21:9 full",
  ],
};

export class HailuoRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HailuoRateLimitError";
  }
}

export class HailuoQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HailuoQuotaError";
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveFileUrl(file: any): string {
  if (!file) return "";
  if (typeof file === "string") return file;
  if (typeof file.url === "string" && file.url) return file.url;
  if (file.video && typeof file.video === "object") return resolveFileUrl(file.video);
  if (file.value && typeof file.value === "object") return resolveFileUrl(file.value);
  if (Array.isArray(file) && file.length > 0) return resolveFileUrl(file[0]);
  if (typeof file.path === "string" && file.path && /^https?:\/\//.test(file.path)) return file.path;
  return "";
}

let clientPromise: Promise<Client> | null = null;

async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = Client.connect(HAILUO_SPACE, HAILUO_TOKEN ? { token: HAILUO_TOKEN as `hf_${string}` } : undefined);
  }
  return clientPromise;
}

export async function generateVideo(params: HailuoParams): Promise<HailuoResult> {
  const duration = clamp(params.duration ?? 5, HAILUO_LIMITS.duration.min, HAILUO_LIMITS.duration.max);
  const steps = clamp(params.steps ?? 28, HAILUO_LIMITS.steps.min, HAILUO_LIMITS.steps.max);
  const canvas = HAILUO_LIMITS.canvas.includes(params.canvas ?? "") ? (params.canvas as string) : "960x544 · 16:9 fast";

  try {
    const client = await getClient();

    const result: any = await client.predict("/generate", {
      prompt: params.prompt ?? "A red fox trotting through a snowy pine forest at dawn, snow crunching underfoot",
      image_path: params.image_path,
      last_image_path: params.last_image_path,
      canvas,
      duration,
      steps,
      seed: params.seed ?? 42,
      upsample: params.upsample ?? false,
    });

    const data = result.data as any[];

    const videoUrl = resolveFileUrl(data[0]);

    if (!videoUrl) {
      throw new Error(`Hailuo returned no resolvable video URL. Raw data[0]: ${JSON.stringify(data[0])}`);
    }

    return {
      video: videoUrl,
      markdown: data[1],
      seedUsed: data[2],
    };
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      throw new HailuoRateLimitError(`Hailuo rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.message?.includes("quota")) {
      throw new HailuoQuotaError(`Hailuo quota exceeded: ${error.message}`);
    }
    throw error;
  }
}

export async function fitKeyframe(imagePath: Blob | File | Buffer, currentCanvas: string = "960x544 · 16:9 fast"): Promise<{ image: string; canvas: string }> {
  try {
    const client = await getClient();

    const result: any = await client.predict("/_fit_keyframe", {
      image_path: imagePath,
      current_canvas: currentCanvas,
    });

    return {
      image: result.data[0],
      canvas: result.data[1],
    };
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      throw new HailuoRateLimitError(`Hailuo rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.message?.includes("quota")) {
      throw new HailuoQuotaError(`Hailuo quota exceeded: ${error.message}`);
    }
    throw error;
  }
}

export default {
  generateVideo,
  fitKeyframe,
};
