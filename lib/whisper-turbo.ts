import FormData from 'form-data';
import fetch from 'node-fetch';

const WHISPER_TURBO_API_KEY = process.env.WHISPER_TURBO_API_KEY!;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export type WhisperTurboModel = 'whisper-large-v3-turbo';
export type ResponseFormat = 'json' | 'text' | 'verbose_json';

export interface WhisperTurboTranscribeOptions {
  file: Buffer;
  filename: string;
  model?: WhisperTurboModel;
  language?: string;
  prompt?: string;
  response_format?: ResponseFormat;
  temperature?: number;
}

export interface WhisperTurboSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface WhisperTurboTranscription {
  text: string;
  task?: string;
  language?: string;
  duration?: number;
  segments?: WhisperTurboSegment[];
  x_groq?: {
    id: string;
  };
}

export class WhisperTurboRateLimitError extends Error {
  constructor() {
    super('Groq Whisper Turbo rate limit exceeded');
    this.name = 'WhisperTurboRateLimitError';
  }
}

export class WhisperTurboFileSizeError extends Error {
  constructor() {
    super('Audio file exceeds 25MB limit');
    this.name = 'WhisperTurboFileSizeError';
  }
}

export class WhisperTurboUnsupportedFormatError extends Error {
  constructor(filename: string) {
    super(`Unsupported audio format: ${filename}. Supported: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm`);
    this.name = 'WhisperTurboUnsupportedFormatError';
  }
}

const SUPPORTED_EXTENSIONS = new Set([
  'flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm',
]);

const MIME_MAP: Record<string, string> = {
  flac: 'audio/flac',
  mp3: 'audio/mpeg',
  mp4: 'audio/mp4',
  mpeg: 'audio/mpeg',
  mpga: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  webm: 'audio/webm',
};

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export async function transcribeWhisperTurbo(options: WhisperTurboTranscribeOptions): Promise<WhisperTurboTranscription> {
  const {
    file,
    filename,
    model = 'whisper-large-v3-turbo',
    language,
    prompt,
    response_format = 'verbose_json',
    temperature = 0,
  } = options;

  if (file.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new WhisperTurboFileSizeError();
  }

  const ext = getExtension(filename);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new WhisperTurboUnsupportedFormatError(filename);
  }

  const mimeType = MIME_MAP[ext] ?? 'application/octet-stream';

  const form = new FormData();
  form.append('file', file, { filename, contentType: mimeType });
  form.append('model', model);
  form.append('response_format', response_format);
  form.append('temperature', String(temperature));

  if (language) form.append('language', language);
  if (prompt) form.append('prompt', prompt);

  const res = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHISPER_TURBO_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (res.status === 429) throw new WhisperTurboRateLimitError();

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.error?.message ?? `Groq Whisper Turbo error ${res.status}`);
  }

  if (response_format === 'text') {
    const text = await res.text();
    return { text };
  }

  const data = await res.json() as WhisperTurboTranscription;
  return data;
}

export async function translateWhisperTurbo(options: Omit<WhisperTurboTranscribeOptions, 'language'>): Promise<WhisperTurboTranscription> {
  const {
    file,
    filename,
    model = 'whisper-large-v3-turbo',
    prompt,
    response_format = 'json',
    temperature = 0,
  } = options;

  if (file.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new WhisperTurboFileSizeError();
  }

  const ext = getExtension(filename);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new WhisperTurboUnsupportedFormatError(filename);
  }

  const mimeType = MIME_MAP[ext] ?? 'application/octet-stream';

  const form = new FormData();
  form.append('file', file, { filename, contentType: mimeType });
  form.append('model', model);
  form.append('response_format', response_format);
  form.append('temperature', String(temperature));

  if (prompt) form.append('prompt', prompt);

  const res = await fetch(`${GROQ_BASE_URL}/audio/translations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHISPER_TURBO_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (res.status === 429) throw new WhisperTurboRateLimitError();

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.error?.message ?? `Groq Whisper Turbo translation error ${res.status}`);
  }

  const data = await res.json() as WhisperTurboTranscription;
  return data;
}
