# Infrastructure as code — fennerframework.com

Terraform (Cloudflare provider v5) describes the Cloudflare side of the site:

| Resource | What |
|---|---|
| `cloudflare_pages_project.site` | Pages project `fennerframework` (production branch `main`, serves `./public`) |
| `cloudflare_pages_domain.custom[*]` | Custom hostnames on the project (`fennerframework.com`, `www.fennerframework.com`) |
| `cloudflare_dns_record.pages[*]` | Proxied CNAMEs for those hostnames → `fennerframework.pages.dev` |
| `cloudflare_workers_kv_namespace.leads` | KV for contact-form leads (prod) |
| `cloudflare_workers_kv_namespace.leads_preview` | KV for PR preview deployments |

**Deliberately not managed here** — `deployment_configs` (KV bindings, secrets): those come from
`../wrangler.toml`, applied by every `wrangler pages deploy` in GitHub Actions. Terraform ignores
that attribute so it never fights wrangler or wipes `LEAD_WEBHOOK_URL`.
The KV **namespace ids** in `wrangler.toml` must equal the ids Terraform outputs; CI checks that
against `imports.tf`.

## Usage
```sh
. ~/.cloudflare-token            # CLOUDFLARE_API_TOKEN (Pages:Edit, DNS:Edit on this zone, Workers KV:Edit)
cd terraform
terraform init
terraform plan                   # should be "No changes" unless you edited .tf files
terraform apply
```

## State
State is **local** (`terraform.tfstate`, gitignored) on Holden's homelab, same as ishufenner.com.

## Rebuild from scratch
1. Zone `fennerframework.com` must exist in the account (not managed here).
2. `terraform apply`.
3. Put the KV ids from `terraform output kv_namespace_ids` into `../wrangler.toml` and `imports.tf`.
4. (Optional) `npx wrangler pages secret put LEAD_WEBHOOK_URL --project-name=fennerframework`.
5. Push to `main` — GitHub Actions deploys.
