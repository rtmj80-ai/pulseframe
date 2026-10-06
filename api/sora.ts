import { sendJson, type ServerlessRequest, type ServerlessResponse } from './health';

function getSoraApiKey(): string {
  const key = process.env.SORA_API_KEY || process.env.OPENAI_API_KEY || '';
  return key.trim();
}

/**
 * Serverless Sora Endpoint (/api/sora.ts)
 * Reads SORA_API_KEY / OPENAI_API_KEY from environment variables (never hardcoded).
 * Supports GET status check and POST video generation / storyboard prompt requests.
 */
export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const apiKey = getSoraApiKey();

  if (req.method === 'GET') {
    sendJson(res, 200, {
      status: 'ready',
      endpoint: '/api/sora',
      configured: Boolean(apiKey),
      message: apiKey
        ? 'Sora serverless connection is configured via environment variables.'
        : 'SORA_API_KEY is not set yet. Add SORA_API_KEY in your environment variables.'
    });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed. Use GET or POST.' });
    return;
  }

  const body = req.body || {};
  const prompt = String(body.prompt || '').trim();
  const aspectRatio = String(body.aspectRatio || '16:9').trim();
  const durationSeconds = Number(body.durationSeconds || 5);

  if (!prompt) {
    sendJson(res, 400, { error: 'Missing required "prompt" in request body.' });
    return;
  }

  if (!apiKey) {
    sendJson(res, 503, {
      error: 'SORA_API_KEY is not configured in environment variables.',
      configured: false
    });
    return;
  }

  const soraEndpoint =
    process.env.SORA_API_ENDPOINT || 'https://api.openai.com/v1/videos/generations';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const upstreamRes = await fetch(soraEndpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: body.model || 'sora-1.0-turbo',
        prompt,
        aspect_ratio: aspectRatio,
        duration: durationSeconds
      })
    });
    clearTimeout(timeout);

    const data = await upstreamRes.json();
    sendJson(res, upstreamRes.status, data);
  } catch (err: any) {
    sendJson(res, 502, {
      error: 'Failed to reach upstream Sora API endpoint.',
      detail: err?.message || 'Upstream connection error'
    });
  }
}
