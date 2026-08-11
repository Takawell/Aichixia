import { Client } from "@gradio/client";

const WAN22_SPACE = process.env.WAN22_SPACE || "cinderholm/wan2-2-i2v-v3";
const HF_TOKEN = process.env.HF_TOKEN;

export type WanParams = {
  input_image: Blob | File | Buffer;
  last_image?: Blob | File | Buffer;
  prompt?: string;
  steps?: number;
  negative_prompt?: string;
  duration_seconds?: number;
  guidance_scale?: number;
  guidance_scale_2?: number;
  seed?: number;
  randomize_seed?: boolean;
  quality?: number;
  scheduler?: string;
  flow_shift?: number;
  frame_multiplier?: string | number;
  safe_mode?: boolean;
  lora_groups?: any[];
  video_component?: boolean;
};

export type WanResult = {
  video: string;
  downloadFile: string;
  seed: number;
};

export const WAN_LIMITS = {
  duration_seconds: { min: 0.5, max: 20.1 },
  quality: { min: 1, max: 10 },
  seed: { min: 0, max: 2147483647 },
  steps: { min: 1, max: 30 },
  guidance_scale: { min: 0, max: 10 },
  guidance_scale_2: { min: 0, max: 10 },
  flow_shift: { min: 0.5, max: 15 },
  frame_multiplier: [16, 32, 64, 128],
};

export class WanRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WanRateLimitError";
  }
}

export class WanQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WanQuotaError";
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveFileUrl(file: any): string {
  if (!file) return "";
  if (typeof file === "string") return file;
  if (typeof file.url === "string" && file.url) return file.url;
  if (typeof file.path === "string" && file.path) {
    const base = WAN22_SPACE.startsWith("http") ? WAN22_SPACE : `https://huggingface.co/spaces/${WAN22_SPACE}`;
    return `${base.replace(/\/$/, "")}/file=${file.path.replace(/^\//, "")}`;
  }
  return "";
}

let clientPromise: Promise<Client> | null = null;

async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = Client.connect(WAN22_SPACE, HF_TOKEN ? { token: HF_TOKEN as `hf_${string}` } : undefined);
  }
  return clientPromise;
}

export async function generateVideo(params: WanParams): Promise<WanResult> {
  if (!params.input_image) {
    throw new Error("input_image is required.");
  }

  const duration = clamp(params.duration_seconds ?? 3.5, WAN_LIMITS.duration_seconds.min, WAN_LIMITS.duration_seconds.max);
  const quality = clamp(params.quality ?? 6, WAN_LIMITS.quality.min, WAN_LIMITS.quality.max);
  const seed = clamp(params.seed ?? 42, WAN_LIMITS.seed.min, WAN_LIMITS.seed.max);
  const steps = clamp(params.steps ?? 6, WAN_LIMITS.steps.min, WAN_LIMITS.steps.max);
  const guidanceScale = clamp(params.guidance_scale ?? 6.5, WAN_LIMITS.guidance_scale.min, WAN_LIMITS.guidance_scale.max);
  const guidanceScale2 = clamp(params.guidance_scale_2 ?? 1, WAN_LIMITS.guidance_scale_2.min, WAN_LIMITS.guidance_scale_2.max);
  const flowShift = clamp(params.flow_shift ?? 3, WAN_LIMITS.flow_shift.min, WAN_LIMITS.flow_shift.max);
  const frameMultiplier = WAN_LIMITS.frame_multiplier.includes(Number(params.frame_multiplier))
    ? Number(params.frame_multiplier)
    : 128;

  try {
    const client = await getClient();

    const result: any = await client.predict("/generate_video", {
      input_image: params.input_image,
      last_image: params.last_image ?? params.input_image,
      prompt: params.prompt ?? "make this image come alive, cinematic motion, smooth animation",
      steps,
      negative_prompt: params.negative_prompt ?? "色调艳丽, 过曝, 静态, 细节模糊不清, 字幕, 风格, 作品, 画作, 画面, 静止, 整体发灰, 最差质量, 低质量, JPEG压缩残留, 丑陋的, 残缺的, 多余的手指, 画得不好的手部, 画得不好的脸部, 畸形的, 毁容的, 形态畸形的肢体, 手指融合, 静止不动的画面, 杂乱的背景, 三条腿, 背景人很多, 倒着走",
      duration_seconds: duration,
      guidance_scale: guidanceScale,
      guidance_scale_2: guidanceScale2,
      seed,
      randomize_seed: params.randomize_seed ?? false,
      quality,
      scheduler: params.scheduler ?? "UniPCMultistep",
      flow_shift: flowShift,
      frame_multiplier: frameMultiplier,
      safe_mode: params.safe_mode ?? true,
      lora_groups: params.lora_groups ?? [],
      video_component: params.video_component ?? true,
    });

    const data = result.data as any[];

    return {
      video: resolveFileUrl(data[0]),
      downloadFile: resolveFileUrl(data[1]),
      seed: data[2],
    };
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      throw new WanRateLimitError(`Wan2.2 rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.message?.includes("quota")) {
      throw new WanQuotaError(`Wan2.2 quota exceeded: ${error.message}`);
    }
    throw error;
  }
}

export async function extractFrame(videoPath: any, timestamp: number = 0): Promise<string> {
  try {
    const client = await getClient();

    const result: any = await client.predict("/extract_frame", {
      video_path: videoPath,
      timestamp,
    });

    return result.data[0];
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      throw new WanRateLimitError(`Wan2.2 rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.message?.includes("quota")) {
      throw new WanQuotaError(`Wan2.2 quota exceeded: ${error.message}`);
    }
    throw error;
  }
}

export default {
  generateVideo,
  extractFrame,
};
