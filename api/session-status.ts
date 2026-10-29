export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    return res.json({
      status: 'connected',
      server: 'http://maya327.my.id',
      hasCookie: Boolean(alightAdmin),
      csrf: csrfMatch ? csrfMatch[1] : null,
      deployedOn: 'Vercel Serverless Function',
    });
  } catch (err: any) {
    return res.status(502).json({
      status: 'error',
      message: err.message,
    });
  }
}
