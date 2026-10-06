import { sendJson, type ServerlessRequest, type ServerlessResponse } from './health';
import { fetchGoogleBooksVolumes } from './youtube';

/**
 * Serverless Google Books v1 Endpoint (/api/books.ts)
 * Calls https://www.googleapis.com/books/v1/volumes?q=QUERY&maxResults=10
 * using X-goog-api-key header (never leaking keys into URL logs).
 */
export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
) {
  const q = String(req.query?.q || req.body?.q || '').trim();
  const maxResults = Number(req.query?.maxResults || 10);

  if (!q) {
    sendJson(res, 400, { error: 'Missing required search query parameter "q".' });
    return;
  }

  const data = await fetchGoogleBooksVolumes(q, maxResults);
  if (!data) {
    sendJson(res, 503, {
      error: 'Google Books v1 API unavailable or GOOGLE_API_KEY / YOUTUBE_API_KEY not configured.'
    });
    return;
  }

  sendJson(res, 200, data);
}
