#!/usr/bin/env node
// Static checks (CI and `npm run check`):
//  1. JS syntax: Pages Functions, public/*.js, scripts/*.js, and any inline <script> in public/*.html
//  2. Content guard: no API tokens / secrets / placeholder text left in public/ or functions/
//  3. Every local href/src in index.html points at a file that exists in public/
//  4. wrangler.toml KV ids are real (not the REPLACE_WITH_* placeholders)
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
let failed = false;
const fail = (m) => { console.error('✗ ' + m); failed = true; };
const ok = (m) => console.log('✓ ' + m);
const walk = (dir, ext) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(p, ext)) : (e.name.endsWith(ext) ? [p] : []);
}) : [];
const nodeCheck = (file, label) => {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); ok('syntax ' + (label || path.relative(root, file))); }
  catch (e) { fail('syntax ' + (label || file) + '\n' + e.stderr.toString()); }
};

// 1. syntax
[...walk(path.join(root, 'functions'), '.js'), ...walk(path.join(root, 'public'), '.js'), ...walk(path.join(root, 'scripts'), '.js')].forEach((f) => nodeCheck(f));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-'));
for (const html of walk(path.join(root, 'public'), '.html')) {
  let i = 0;
  for (const m of fs.readFileSync(html, 'utf8').matchAll(/<script(?![^>]*type=["']application\/ld\+json["'])(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const f = path.join(tmp, `inline-${i}.js`); fs.writeFileSync(f, m[1]); nodeCheck(f, `${path.relative(root, html)} inline <script> #${i++}`);
  }
}

// 2. content guard
const GUARDS = [
  { re: /\bcfat_[A-Za-z0-9_-]{20,}/, why: 'Cloudflare API token' },
  { re: /\bgh[pousr]_[A-Za-z0-9]{30,}/, why: 'GitHub token' },
  { re: /LEAD_WEBHOOK_URL\s*=\s*https?:\/\/(?!example\.invalid)/, why: 'webhook URL value' },
  { re: /lorem ipsum/i, why: 'placeholder copy' },
  { re: /\bTODO\b/, why: 'TODO left in shipped file' },
];
for (const f of [...walk(path.join(root, 'public'), '.html'), ...walk(path.join(root, 'public'), '.js'), ...walk(path.join(root, 'public'), '.css'), ...walk(path.join(root, 'functions'), '.js'), ...walk(path.join(root, 'scripts'), '.js'), ...walk(path.join(root, 'scripts'), '.sh')]) {
  if (f.endsWith('check.js')) continue;
  const text = fs.readFileSync(f, 'utf8');
  for (const g of GUARDS) { const m = text.match(g.re); if (m) fail(`${path.relative(root, f)}: contains ${g.why}: "${m[0]}"`); }
}
ok('content guard scanned');

// 3. local links resolve
const index = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
for (const m of index.matchAll(/\b(?:href|src)="(\/[^"#?]+)"/g)) {
  const rel = m[1];
  if (rel.startsWith('/api/')) continue;
  if (!fs.existsSync(path.join(root, 'public', rel))) fail(`index.html references ${rel} but public${rel} does not exist`);
}
ok('local links resolve');

// 4. wrangler.toml ids
const toml = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');
if (/REPLACE_WITH_/.test(toml)) fail('wrangler.toml still has REPLACE_WITH_* KV ids — run terraform apply and paste the ids');
else ok('wrangler.toml KV ids set');

process.exit(failed ? 1 : 0);
