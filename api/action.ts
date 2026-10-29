interface MayaSession {
  cookie: string;
  csrf: string;
  fetchedAt: number;
}

let cachedSession: MayaSession | null = null;

async function getMayaSession(forceRefresh = false): Promise<MayaSession> {
  const now = Date.now();
  if (!forceRefresh && cachedSession && now - cachedSession.fetchedAt < 3.5 * 60 * 1000) {
    return cachedSession;
  }

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
}

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  let parsedBody = req.body;
  if (typeof parsedBody === 'string') {
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch {
      parsedBody = {};
    }
  }

  const { action, email, link, consent, customEndpoint, apiKey } = parsedBody || {};

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
      csrf: session ? session.csrf : (req.body && req.body.csrf) || '',
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

    // Auto retry on session expiry
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
}
