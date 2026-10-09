export const config = { api: { bodyParser: false } };

export default async function proxy(req, res) {
  const base = process.env.BACKEND_URL;
  if (!base) return res.status(500).json({ error: 'BACKEND_URL belum diatur pada environment Vercel.' });
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const headers = { 'content-type': req.headers['content-type'] || '', authorization: req.headers.authorization || '', 'x-forwarded-for': req.headers['x-forwarded-for'] || '' };
    const backendPath = req.url.replace(/^\/api\/uploads(?=\/|\?|$)/, '/uploads');
    const upstream = await fetch(`${base.replace(/\/$/, '')}${backendPath}`, { method: req.method, headers, body, ...(body ? { duplex: 'half' } : {}) });
    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    console.error('Backend proxy error:', error);
    res.status(502).json({ error: 'Backend tidak dapat dijangkau. Periksa BACKEND_URL dan status server.' });
  }
}
