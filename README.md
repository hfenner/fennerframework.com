# fennerframework.com

Marketing site for **Fenner Framework**, a custom picture framing shop. Static HTML/CSS/JS on
Cloudflare Pages with one Pages Function (`/api/contact`) that stores estimate requests in KV.

- Live: https://fennerframework.com (pages.dev: https://fennerframework.pages.dev)
- Deploys automatically from `main` via GitHub Actions; PRs get a preview URL, smoke test, and Lighthouse run.
- Infra (Pages project, domains, DNS, KV) is Terraform in `terraform/`.

## Develop
```sh
npm ci
npm run dev          # http://127.0.0.1:8788 with a local KV
npm run check        # syntax / content guard / link check
npm run smoke -- http://127.0.0.1:8788
```

## Edit the business copy
Everything customer-facing is in `public/index.html`. Contact details (phone, email, service area,
hours) appear in the JSON-LD block, the nav button, and the Contact section — update all of them.
The phone number, service area, and shop hours are placeholders until the real ones are filled in.

## Leads
```sh
. ~/.cloudflare-token
npm run leads                 # production
npm run leads -- --preview    # PR preview submissions
```
Set `LEAD_WEBHOOK_URL` (`npx wrangler pages secret put LEAD_WEBHOOK_URL --project-name=fennerframework`)
to get each lead POSTed as JSON to ntfy / Home Assistant / Slack / etc.

See `CLAUDE.md` for the full operational notes.
