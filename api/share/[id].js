const escapeHtml = value => String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

export default async function sharePage(req, res) {
  const backend = process.env.BACKEND_URL;
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  if (!backend || !/^[\w-]{1,100}$/.test(id)) return res.status(400).send('Tautan utas tidak valid.');
  try {
    const response = await fetch(`${backend.replace(/\/$/, '')}/api/threads/${encodeURIComponent(id)}`);
    if (!response.ok) return res.status(404).send('Utas tidak ditemukan.');
    const thread = await response.json();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
    const origin = `${proto}://${host}`;
    const canonical = `${origin}/t/${encodeURIComponent(id)}`;
    const redirect = `${origin}/#thread/${encodeURIComponent(id)}`;
    const title = escapeHtml(thread.title || `Utas dari ${thread.profile?.name || 'Utasan'}`);
    const description = escapeHtml(String(thread.content || '').replace(/\s+/g, ' ').slice(0, 220));
    let image = thread.imageUrl || '';
    if (image.startsWith('/uploads/')) image = `${origin}${image}`;
    else if (image.startsWith('http://') && image.includes('/uploads/')) image = `${origin}${new URL(image).pathname}`;
    const imageTag = image ? `<meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:image" content="${escapeHtml(image)}">` : '';
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Utasan</title><meta name="description" content="${description}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="article"><meta property="og:site_name" content="Utasan"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${escapeHtml(canonical)}">${imageTag}<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta http-equiv="refresh" content="0;url=${escapeHtml(redirect)}"><script>location.replace(${JSON.stringify(redirect)})</script></head><body><p>Membuka utas… <a href="${escapeHtml(redirect)}">Lanjutkan</a></p></body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.status(200).send(html);
  } catch (error) {
    console.error('Share preview error:', error);
    res.status(502).send('Utas sedang tidak tersedia.');
  }
}
