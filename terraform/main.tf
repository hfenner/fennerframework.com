# ---------------------------------------------------------------------------
# fennerframework.com — Cloudflare Pages site + KV (leads) + DNS
#
# Ownership split (same as ishufenner.com):
#   * Terraform owns: the Pages project's existence, custom domains, DNS records,
#     KV namespaces.
#   * wrangler.toml (applied on every deploy by GitHub Actions) owns: KV bindings
#     and other per-environment deployment config. Secrets (LEAD_WEBHOOK_URL) are
#     set out-of-band and never in Git. deployment_configs is ignored here so
#     Terraform never fights wrangler or wipes secrets.
# ---------------------------------------------------------------------------

resource "cloudflare_pages_project" "site" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = "main"

  build_config = {
    destination_dir = "public"
  }

  lifecycle {
    ignore_changes = [deployment_configs, source, build_config]
  }
}

resource "cloudflare_pages_domain" "custom" {
  for_each     = var.custom_domains
  account_id   = var.account_id
  project_name = cloudflare_pages_project.site.name
  name         = each.key
}

# Pages does not create DNS for custom domains on the apex; we do it here.
resource "cloudflare_dns_record" "pages" {
  for_each = var.custom_domains
  zone_id  = each.value
  name     = each.key
  type     = "CNAME"
  content  = cloudflare_pages_project.site.subdomain
  proxied  = true
  ttl      = 1
  comment  = "Cloudflare Pages: ${var.project_name}"
}

# Contact-form leads. Bound as LEADS via wrangler.toml.
resource "cloudflare_workers_kv_namespace" "leads" {
  account_id = var.account_id
  title      = "fennerframework-leads"
}

# Separate namespace for PR preview deployments so previews never write real leads.
resource "cloudflare_workers_kv_namespace" "leads_preview" {
  account_id = var.account_id
  title      = "fennerframework-leads-preview"
}
