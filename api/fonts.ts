import { sendJson, type ServerlessRequest, type ServerlessResponse } from './health';
import { fetchGoogleWebfonts } from './youtube';

/**
 * Serverless Google Webfonts v1 Endpoint (/api/fonts.ts)
 * Calls https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity
 * using X-goog-api-key header (never leaking keys into URL logs).
 */
export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  const sort = String(req.query?.sort || 'popularity').trim();
  const data = await fetchGoogleWebfonts(sort);

  if (!data) {
    sendJson(res, 503, {
      error: 'Google Webfonts v1 API unavailable or GOOGLE_API_KEY / YOUTUBE_API_KEY not configured.'
    });
    return;
  }

  sendJson(res, 200, data);
}
