import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import healthHandler from './api/health';
import soraHandler from './api/sora';
import youtubeHandler, {
  handleResolveChannel,
  handleAnalyzeVideo
} from './api/youtube';
import booksHandler from './api/books';
import fontsHandler from './api/fonts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Mount root-level /api serverless functions
  app.all('/api/health', (req, res) => healthHandler(req, res));
  app.all('/api/sora', (req, res) => soraHandler(req, res));
  app.all('/api/youtube', (req, res) => youtubeHandler(req, res));
  app.all('/api/books', (req, res) => booksHandler(req, res));
  app.all('/api/fonts', (req, res) => fontsHandler(req, res));

  // Sub-path aliases delegating to /api/youtube.ts serverless handlers
  app.get('/api/youtube/videos', (req, res) => {
    req.query.action = 'videos';
    return youtubeHandler(req, res);
  });
  app.get('/api/youtube/channels', (req, res) => {
    req.query.action = 'channels';
    return youtubeHandler(req, res);
  });
  app.get('/api/youtube/playlistItems', (req, res) => {
    req.query.action = 'playlistItems';
    return youtubeHandler(req, res);
  });
  app.get('/api/youtube/commentThreads', (req, res) => {
    req.query.action = 'commentThreads';
    return youtubeHandler(req, res);
  });
  app.get('/api/youtube/search', (req, res) => {
    req.query.action = 'search';
    return youtubeHandler(req, res);
  });
  app.post('/api/youtube/resolve-channel', (req, res) =>
    handleResolveChannel(req, res)
  );
  app.post('/api/youtube/analyze-video', (req, res) =>
    handleAnalyzeVideo(req, res)
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseFrame server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
