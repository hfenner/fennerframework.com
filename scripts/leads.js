#!/usr/bin/env node
// List contact-form leads from KV. Usage: npm run leads [-- --preview] [-- --json]
// Needs CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID in env (. ~/.cloudflare-token).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const toml = fs.readFileSync(path.join(__dirname, '..', 'wrangler.toml'), 'utf8');
const section = args.includes('--preview') ? toml.split('[env.preview]')[1] : toml.split('[env.preview]')[0];
const ns = (section.match(/^id\s*=\s*"([a-f0-9]{32})"/m) || [])[1];
if (!ns) { console.error('could not find KV namespace id in wrangler.toml'); process.exit(1); }
const wr = (a) => execFileSync('npx', ['wrangler', 'kv', ...a, '--namespace-id', ns, '--remote'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const keys = JSON.parse(wr(['key', 'list', '--prefix', 'lead:']));
const leads = keys.map((k) => JSON.parse(wr(['key', 'get', k.name]))).sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
if (args.includes('--json')) { console.log(JSON.stringify(leads, null, 2)); process.exit(0); }
if (!leads.length) console.log('no leads yet');
for (const l of leads) console.log(`${l.receivedAt}  ${l.name}  ${l.phone || ''} ${l.email || ''}  [${l.project || '-'}]\n    ${l.message.replace(/\n/g, '\n    ')}\n`);
