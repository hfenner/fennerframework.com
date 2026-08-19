output "pages_subdomain" {
  value = cloudflare_pages_project.site.subdomain
}

output "kv_namespace_ids" {
  description = "Must match wrangler.toml ([[kv_namespaces]] / [env.preview])"
  value = {
    production = cloudflare_workers_kv_namespace.leads.id
    preview    = cloudflare_workers_kv_namespace.leads_preview.id
  }
}
