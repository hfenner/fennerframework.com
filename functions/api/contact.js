// POST /api/contact — store a contact-form lead in KV (binding LEADS) and optionally
// forward it to a webhook (LEAD_WEBHOOK_URL secret). Accepts JSON or form-encoded bodies.
// No auth: this is the public lead form. Honeypot field `company` must be empty.
const MAX = { name: 120, phone: 40, email: 160, project: 60, message: 4000 };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequest(ctx) {
  if (ctx.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  return handlePost(ctx);
}

async function handlePost({ request, env }) {
  const ct = request.headers.get('content-type') || '';
  const wantsJson = ct.includes('application/json') || (request.headers.get('accept') || '').includes('application/json');
  let data;
  try {
    if (ct.includes('application/json')) data = await request.json();
    else data = Object.fromEntries((await request.formData()).entries());
  } catch { return json({ error: 'Could not read the form.' }, 400); }

  const clean = (k) => String(data[k] ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX[k]);
  const lead = { name: clean('name'), phone: clean('phone'), email: clean('email'), project: clean('project'), message: String(data.message ?? '').trim().slice(0, MAX.message) };

  const fail = (msg) => wantsJson ? json({ error: msg }, 400) : Response.redirect(new URL('/?sent=0#contact', request.url), 303);
  if (String(data.company ?? '').trim()) return wantsJson ? json({ ok: true }) : Response.redirect(new URL('/?sent=1#contact', request.url), 303); // bot: pretend success
  if (!lead.name) return fail('Please tell us your name.');
  if (lead.message.length < 10) return fail('Please add a few details about the project.');
  if (!lead.email && !lead.phone) return fail('Please include a phone number or an email so we can reach you.');
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return fail('That email address does not look right.');

  const now = new Date();
  const id = `${now.toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID().slice(0, 8)}`;
  const record = { id, receivedAt: now.toISOString(), ...lead, ip: request.headers.get('cf-connecting-ip') || null, country: request.headers.get('cf-ipcountry') || null, ua: (request.headers.get('user-agent') || '').slice(0, 200) };

  if (!env.LEADS) return wantsJson ? json({ error: 'Lead storage is not configured.' }, 503) : fail('Lead storage is not configured.');
  await env.LEADS.put(`lead:${id}`, JSON.stringify(record), { metadata: { name: lead.name, project: lead.project, receivedAt: record.receivedAt } });

  if (env.LEAD_WEBHOOK_URL) {
    try { await fetch(env.LEAD_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'fennerframework.com', ...record }) }); }
    catch (e) { console.log('lead webhook failed: ' + (e && e.message)); }
  }

  return wantsJson ? json({ ok: true, id }) : Response.redirect(new URL('/?sent=1#contact', request.url), 303);
}
