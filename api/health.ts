import type { IncomingMessage, ServerResponse } from 'http';

export interface ServerlessRequest extends IncomingMessage {
  query?: Record<string, any>;
  body?: any;
  method?: string;
}

export interface ServerlessResponse extends ServerResponse {
  status?: (code: number) => ServerlessResponse;
  json?: (data: any) => ServerlessResponse | void;
}

export function sendJson(res: ServerlessResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function isKeyConfigured(val: string | undefined): boolean {
  return Boolean(val && val.trim().length > 0);
}

/**
 * Serverless Health Check Endpoint (/api/health.ts)
 * Verifies API service configuration and header-based key availability
 * without exposing any secret values.
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

  const youtubeConfigured =
    isKeyConfigured(process.env.YOUTUBE_API_KEY) ||
    isKeyConfigured(process.env.GOOGLE_API_KEY);
  const booksConfigured =
    isKeyConfigured(process.env.GOOGLE_API_KEY) ||
    isKeyConfigured(process.env.YOUTUBE_API_KEY);
  const fontsConfigured =
    isKeyConfigured(process.env.GOOGLE_API_KEY) ||
    isKeyConfigured(process.env.YOUTUBE_API_KEY);
  const soraConfigured =
    isKeyConfigured(process.env.SORA_API_KEY) ||
    isKeyConfigured(process.env.OPENAI_API_KEY);

  sendJson(res, 200, {
    status: 'ok',
    service: 'pulseframe-serverless-api',
    timestamp: new Date().toISOString(),
    authHeaderMode: 'X-goog-api-key',
    endpoints: {
      youtubeVideos: 'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=VIDEO_ID',
      youtubeChannels: 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=SOME_HANDLE',
      youtubePlaylistItems: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLAYLIST_ID&maxResults=50',
      youtubeCommentThreads: 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=VIDEO_ID&maxResults=100',
      youtubeSearch: 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=QUERY&type=video',
      googleBooks: 'https://www.googleapis.com/books/v1/volumes?q=QUERY&maxResults=10',
      googleFonts: 'https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity',
      sora: '/api/sora'
    },
    keysConfigured: {
      youtubeDataV3: youtubeConfigured,
      googleBooksV1: booksConfigured,
      googleFontsV1: fontsConfigured,
      sora: soraConfigured
    }
  });
}
