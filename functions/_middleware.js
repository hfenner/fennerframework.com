// 301 every alias host to the canonical apex. Pages `_redirects` cannot match on
// hostname (sources are path-only), so this middleware does it instead.
// pages.dev and preview hosts are not aliases and fall through to the site.
const CANONICAL = 'fennerframework.com';
const ALIASES = new Set([
  'www.fennerframework.com',
  'fennerframeworks.com',
  'www.fennerframeworks.com',
]);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (ALIASES.has(url.hostname)) {
    url.hostname = CANONICAL;
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
