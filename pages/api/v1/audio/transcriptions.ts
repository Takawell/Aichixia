import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files, File } from 'formidable';
import fs from 'fs';
import { verifyApiKey, logRequest, incrementUsage, updateDailyUsage } from '@/lib/console-utils';
import { transcribeWhisper, translateWhisper, WhisperRateLimitError, WhisperFileSizeError, WhisperUnsupportedFormatError } from '@/lib/whisper';
import { transcribeWhisperTurbo, translateWhisperTurbo, WhisperTurboRateLimitError, WhisperTurboFileSizeError, WhisperTurboUnsupportedFormatError } from '@/lib/whisper-turbo';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MODEL_MAPPING: Record<string, 'whisper-large-v3' | 'whisper-large-v3-turbo'> = {
  'whisper-large-v3': 'whisper-large-v3',
  'whisper-large-v3-turbo': 'whisper-large-v3-turbo',
};

const SUPPORTED_TASK = new Set(['transcriptions', 'translations']);

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 25 * 1024 * 1024,
      keepExtensions: true,
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function getField(fields: Fields, key: string): string | undefined {
  const val = fields[key];
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
}

function getFile(files: Files, key: string): File | undefined {
  const val = files[key];
  if (!val) return undefined;
  return Array.isArray(val) ? val[0] : val;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed', type: 'invalid_request_error' } });
  }

  const rawKey =
    req.headers['authorization']?.replace('Bearer ', '').trim() ||
    req.headers['x-api-key']?.toString().trim();

  if (!rawKey) {
    return res.status(401).json({ error: { message: 'Missing API key', type: 'authentication_error' } });
  }

  const authResult = await verifyApiKey(rawKey);
  if (!authResult) {
    return res.status(401).json({ error: { message: 'Invalid API key', type: 'authentication_error' } });
  }
  if ('error' in authResult) {
    return res.status(429).json({ error: { message: authResult.error, type: 'rate_limit_error' } });
  }

  const { key: apiKeyData } = authResult;
  const t0 = Date.now();
  const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const urlParts = req.url?.split('/') ?? [];
  const task = urlParts[urlParts.length - 1]?.split('?')[0];

  if (!SUPPORTED_TASK.has(task ?? '')) {
    return res.status(400).json({
      error: { message: `Unknown task: ${task}. Use 'transcriptions' or 'translations'.`, type: 'invalid_request_error' },
    });
  }

  let fields: Fields;
  let files: Files;

  try {
    ({ fields, files } = await parseForm(req));
  } catch (err: any) {
    const isFileSizeErr = err?.code === 1009 || err?.message?.includes('maxFileSize');
    return res.status(400).json({
      error: {
        message: isFileSizeErr ? 'Audio file exceeds 25MB limit' : 'Failed to parse multipart form',
        type: 'invalid_request_error',
      },
    });
  }

  const modelRaw = getField(fields, 'model') ?? 'whisper-large-v3-turbo';
  const model = MODEL_MAPPING[modelRaw];

  if (!model) {
    return res.status(400).json({
      error: {
        message: `Unknown model: ${modelRaw}. Supported: whisper-large-v3, whisper-large-v3-turbo`,
        type: 'invalid_request_error',
      },
    });
  }

  const audioFile = getFile(files, 'file');
  if (!audioFile) {
    return res.status(400).json({
      error: { message: 'Missing audio file. Send as multipart/form-data with field name "file".', type: 'invalid_request_error' },
    });
  }

  const language = getField(fields, 'language');
  const prompt = getField(fields, 'prompt');
  const response_format = (getField(fields, 'response_format') as 'json' | 'text' | 'verbose_json') ?? 'json';
  const temperature = parseFloat(getField(fields, 'temperature') ?? '0');

  const fileBuffer = fs.readFileSync(audioFile.filepath);
  const filename = audioFile.originalFilename ?? audioFile.newFilename ?? 'audio.mp3';

  try {
    let result;

    if (task === 'translations') {
      result = model === 'whisper-large-v3-turbo'
        ? await translateWhisperTurbo({ file: fileBuffer, filename, model, prompt, response_format, temperature })
        : await translateWhisper({ file: fileBuffer, filename, model, prompt, response_format, temperature });
    } else {
      result = model === 'whisper-large-v3-turbo'
        ? await transcribeWhisperTurbo({ file: fileBuffer, filename, model, language, prompt, response_format, temperature })
        : await transcribeWhisper({ file: fileBuffer, filename, model, language, prompt, response_format, temperature });
    }

    const latency = Date.now() - t0;

    await Promise.all([
      logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model,
        endpoint: `/api/v1/audio/${task}`,
        status: 200,
        latency_ms: latency,
        tokens_used: 0,
        ip_address: ip,
        user_agent: userAgent,
      }),
      incrementUsage(apiKeyData.id),
      updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, true),
    ]);

    if (response_format === 'text') {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(result.text);
    }

    return res.status(200).json(result);
  } catch (err: any) {
    const latency = Date.now() - t0;
    const isRateLimit =
      err instanceof WhisperRateLimitError ||
      err instanceof WhisperTurboRateLimitError;
    const isFileSize =
      err instanceof WhisperFileSizeError ||
      err instanceof WhisperTurboFileSizeError;
    const isFormat =
      err instanceof WhisperUnsupportedFormatError ||
      err instanceof WhisperTurboUnsupportedFormatError;

    const status = isRateLimit ? 429 : isFileSize || isFormat ? 400 : 500;
    const errorType = isRateLimit ? 'rate_limit_error' : isFileSize || isFormat ? 'invalid_request_error' : 'api_error';

    await Promise.all([
      logRequest({
        api_key_id: apiKeyData.id,
        user_id: apiKeyData.user_id,
        model,
        endpoint: `/api/v1/audio/${task}`,
        status,
        latency_ms: latency,
        error_message: err.message,
        ip_address: ip,
        user_agent: userAgent,
      }),
      updateDailyUsage(apiKeyData.id, apiKeyData.user_id, 0, false),
    ]).catch(() => {});

    return res.status(status).json({
      error: { message: err.message ?? 'Internal server error', type: errorType },
    });
  } finally {
    if (audioFile?.filepath) {
      fs.unlink(audioFile.filepath, () => {});
    }
  }
}
