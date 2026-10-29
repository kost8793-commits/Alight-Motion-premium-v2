import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MayaSession {
  cookie: string;
  csrf: string;
  fetchedAt: number;
}

let cachedSession: MayaSession | null = null;
let isFetchingSession = false;
let sessionFetchPromise: Promise<MayaSession> | null = null;

// Dynamically fetch and pre-warm live session cookie and CSRF token from maya327.my.id/tool
async function getMayaSession(forceRefresh = false): Promise<MayaSession> {
  const now = Date.now();
  if (!forceRefresh && cachedSession && now - cachedSession.fetchedAt < 3.5 * 60 * 1000) {
    return cachedSession;
  }

  // Prevent multiple concurrent fetches from stomping on each other
  if (isFetchingSession && sessionFetchPromise) {
    return sessionFetchPromise;
  }

  isFetchingSession = true;
  sessionFetchPromise = (async () => {
    try {
      const toolResp = await fetch('http://maya327.my.id/tool', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Cache-Control': 'no-cache',
        },
      });

      const cookies = (toolResp.headers as any).getSetCookie
        ? (toolResp.headers as any).getSetCookie()
        : [toolResp.headers.get('set-cookie') || ''];

      const alightAdmin = cookies.find((c: string) => c && c.includes('alight_admin='))?.split(';')[0];
      const html = await toolResp.text();
      const csrfMatch = html.match(/const csrf="([a-f0-9]{64})"/);

      if (!alightAdmin || !csrfMatch) {
        throw new Error('Gagal mengekstrak sesi atau CSRF token dari maya327.my.id');
      }

      cachedSession = {
        cookie: alightAdmin,
        csrf: csrfMatch[1],
        fetchedAt: Date.now(),
      };

      return cachedSession;
    } finally {
      isFetchingSession = false;
      sessionFetchPromise = null;
    }
  })();

  return sessionFetchPromise;
}

// Background session pre-warmer and keeper
function startSessionKeeper() {
  getMayaSession(true)
    .then((s) => console.log('✓ Maya327 session pre-warmed successfully (CSRF:', s.csrf.slice(0, 8) + '...)'))
    .catch((err) => console.warn('Pre-warm notice:', err.message));

  // Refresh every 3 minutes
  setInterval(() => {
    getMayaSession(true).catch(() => {});
  }, 3 * 60 * 1000);
}

startSessionKeeper();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '5mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      online: true,
      service: 'Alight Premium Tool API',
      time: new Date().toISOString(),
    });
  });

  // Live session health & diagnostics
  app.get('/api/session-status', async (_req: Request, res: Response) => {
    try {
      const session = await getMayaSession();
      res.json({
        status: 'connected',
        server: 'http://maya327.my.id',
        hasCookie: Boolean(session.cookie),
        csrf: session.csrf,
        sessionAgeSeconds: Math.floor((Date.now() - session.fetchedAt) / 1000),
      });
    } catch (err: any) {
      res.status(502).json({
        status: 'error',
        message: err.message,
      });
    }
  });

  // Real action handler (Kirim link & Verifikasi link)
  app.post('/api/action', async (req: Request, res: Response) => {
    const { action, email, link, consent, customEndpoint, apiKey } = req.body;

    const targetUrl = customEndpoint && customEndpoint.trim() !== ''
      ? customEndpoint.trim()
      : 'http://maya327.my.id/api.php';

    try {
      let session: MayaSession | null = null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };

      if (!customEndpoint || customEndpoint.includes('maya327.my.id')) {
        session = await getMayaSession();
        headers['Cookie'] = session.cookie;
        headers['Referer'] = 'http://maya327.my.id/tool';
        headers['Origin'] = 'http://maya327.my.id';
      }

      if (apiKey && typeof apiKey === 'string' && apiKey.trim() !== '') {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`;
        headers['X-API-Key'] = apiKey.trim();
      }

      const payload = {
        action,
        email: email ? String(email).trim() : '',
        link: link ? String(link).trim() : '',
        csrf: session ? session.csrf : req.body.csrf || '',
        consent: Boolean(consent),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000);

      let remoteResp = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      let raw = await remoteResp.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      // If remote server returns 403 or invalid session message, refresh session immediately and retry once
      const isSessionError =
        remoteResp.status === 403 ||
        (data && !data.success && typeof data.message === 'string' && (
          data.message.toLowerCase().includes('sesi') ||
          data.message.toLowerCase().includes('csrf')
        ));

      if (isSessionError) {
        session = await getMayaSession(true);
        headers['Cookie'] = session.cookie;
        payload.csrf = session.csrf;

        remoteResp = await fetch(targetUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        raw = await remoteResp.text();
        try {
          data = JSON.parse(raw);
        } catch {
          data = null;
        }
      }

      clearTimeout(timeoutId);

      if (!data) {
        return res.status(remoteResp.status || 500).json({
          success: false,
          message: `Server maya327 mengirim format teks/HTML (HTTP ${remoteResp.status}).`,
          preview: raw.slice(0, 250),
        });
      }

      return res.status(remoteResp.status).json({
        ...data,
        isReal: true,
        source: targetUrl,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          message: 'Permintaan timeout (>28 detik). Server maya327 atau Alight Motion lambat merespons.',
        });
      }
      return res.status(502).json({
        success: false,
        message: `Gagal menghubungi server maya327: ${err.message}`,
      });
    }
  });

  // Mount Vite in dev or static dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
