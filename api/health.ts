export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    online: true,
    platform: 'Vercel Serverless Function',
    time: new Date().toISOString(),
  });
}
