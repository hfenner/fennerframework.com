# fennerframework.com — Cloudflare Pages site for Fenner Framework, Holden's custom picture framing shop

## Infra
- Cloudflare account ID: 75a44c24972882499891e5ad7f4c11ad
- Zone: fennerframework.com, zone ID: b6136bdfd0c1677fd485bad88bc5478a
- CLOUDFLARE_API_TOKEN: exported by `~/.cloudflare-token` (run `. ~/.cloudflare-token` if missing). Never commit or echo it.
  As of 2026-08-19 the token has **no DNS permission on this zone** (error 10000) — ask Holden to re-scope it rather than debug.

## Infra as code
- `terraform/` (Cloudflare provider v5) manages the Pages project, custom domains + CNAMEs, and both KV namespaces; state is local on the homelab (gitignored). `wrangler.toml` owns bindings/deployment config (Terraform ignores `deployment_configs`). After editing `.tf`: `. ~/.cloudflare-token; terraform -chdir=terraform plan -out=tfplan && terraform -chdir=terraform apply tfplan`. CI checks fmt/validate and that KV ids in wrangler.toml match `terraform/imports.tf`.

## Project
- Public marketing site (no auth), Cloudflare Pages, project name: fennerframework, served from ./public
- Custom domains: fennerframework.com (apex) + www → 301 to apex via `public/_redirects`; both need proxied CNAMEs to `fennerframework.pages.dev` (Terraform, once the token can edit DNS)
- pages.dev URL: https://fennerframework.pages.dev
- Contact form → `functions/api/contact.js` → KV `LEADS` (prod `fennerframework-leads`, preview `fennerframework-leads-preview`); optional `LEAD_WEBHOOK_URL` secret forwards each lead as JSON (`npx wrangler pages secret put LEAD_WEBHOOK_URL --project-name=fennerframework`)
- Read leads: `. ~/.cloudflare-token; npm run leads` (`-- --preview`, `-- --json`)
- Business copy lives in `public/index.html`. Contact details appear in 3 places (JSON-LD, nav button, contact aside) — keep them in sync. Phone `(315) 555-0123`, service area, and shop hours are **placeholders** until Holden supplies real ones. It is a **picture framing** business (not construction) — confirmed by Holden 2026-08-19.
- Security headers + CSP in `public/_headers` (no inline scripts/styles — JS goes in `public/app.js`, CSS in `public/styles.css`)
- Images: `python3 scripts/make-images.py` regenerates `public/og.png` and the apple-touch-icon (Pillow)

## Workflow
- Feature branch → push → PR (never direct to main)
- CI on every PR (`.github/workflows/ci.yml`): `npm run check` (syntax, content guard, local links, wrangler ids), html-validate, gitleaks, terraform fmt/validate + KV id cross-check, smoke test against `wrangler pages dev` (`scripts/smoke.sh` with lead write round-trip on local KV), preview deploy to `<branch>.fennerframework.pages.dev` + smoke (writes one test lead to the *preview* KV only) + Lighthouse (perf ≥ .9, a11y ≥ .95, SEO ≥ .9, ≤ 400 KB) + PR comment
- Never test-write to the production KV; smoke against prod is read-only (SMOKE_WRITE unset)
- Local dev: `npm run dev` (wrangler pages dev ./public, local KV)
- Deploy: **automatic** — `.github/workflows/deploy.yml` runs `wrangler pages deploy` on every push to `main` (repo secrets `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`), stamps `public/version.json` with the commit and verifies pages.dev serves it (custom domain is a warning until DNS exists). Merging a PR = deploy; check `gh run list`. Manual fallback: `npm run deploy`
