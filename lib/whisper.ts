import FormData from 'form-data';
import fetch from 'node-fetch';

const WHISPER_API_KEY = process.env.WHISPER_API_KEY!;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export type WhisperModel = 'whisper-large-v3' | 'whisper-large-v3-turbo';
export type ResponseFormat = 'json' | 'text' | 'verbose_json';

export interface WhisperTranscribeOptions {
  file: Buffer;
  filename: string;
  model?: WhisperModel;
  language?: string;
  prompt?: string;
  response_format?: ResponseFormat;
  temperature?: number;
}

export interface WhisperSegment {
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

export interface WhisperTranscription {
  text: string;
  task?: string;
  language?: string;
  duration?: number;
  segments?: WhisperSegment[];
  x_groq?: {
    id: string;
  };
}

export class WhisperRateLimitError extends Error {
  constructor() {
    super('Groq Whisper rate limit exceeded');
    this.name = 'WhisperRateLimitError';
  }
}

export class WhisperFileSizeError extends Error {
  constructor() {
    super('Audio file exceeds 25MB limit');
    this.name = 'WhisperFileSizeError';
  }
}

export class WhisperUnsupportedFormatError extends Error {
  constructor(filename: string) {
    super(`Unsupported audio format: ${filename}. Supported: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm`);
    this.name = 'WhisperUnsupportedFormatError';
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

export async function transcribeWhisper(options: WhisperTranscribeOptions): Promise<WhisperTranscription> {
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
    throw new WhisperFileSizeError();
  }

  const ext = getExtension(filename);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new WhisperUnsupportedFormatError(filename);
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
      Authorization: `Bearer ${WHISPER_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (res.status === 429) throw new WhisperRateLimitError();

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.error?.message ?? `Groq Whisper error ${res.status}`);
  }

  if (response_format === 'text') {
    const text = await res.text();
    return { text };
  }

  const data = await res.json() as WhisperTranscription;
  return data;
}

export async function translateWhisper(options: Omit<WhisperTranscribeOptions, 'language'>): Promise<WhisperTranscription> {
  const {
    file,
    filename,
    model = 'whisper-large-v3',
    prompt,
    response_format = 'json',
    temperature = 0,
  } = options;

  if (file.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new WhisperFileSizeError();
  }

  const ext = getExtension(filename);
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    throw new WhisperUnsupportedFormatError(filename);
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
      Authorization: `Bearer ${WHISPER_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (res.status === 429) throw new WhisperRateLimitError();

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err?.error?.message ?? `Groq Whisper translation error ${res.status}`);
  }

  const data = await res.json() as WhisperTranscription;
  return data;
}
