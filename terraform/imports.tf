# Resources created by `terraform apply` on 2026-08-19. These import blocks are
# no-ops while the resources are in state; they let a fresh checkout (no local
# state) re-adopt everything, and CI reads the KV ids from here to cross-check
# wrangler.toml.
import {
  to = cloudflare_pages_project.site
  id = "75a44c24972882499891e5ad7f4c11ad/fennerframework"
}

import {
  to = cloudflare_pages_domain.custom["fennerframework.com"]
  id = "75a44c24972882499891e5ad7f4c11ad/fennerframework/fennerframework.com"
}

import {
  to = cloudflare_pages_domain.custom["www.fennerframework.com"]
  id = "75a44c24972882499891e5ad7f4c11ad/fennerframework/www.fennerframework.com"
}

import {
  to = cloudflare_workers_kv_namespace.leads
  id = "75a44c24972882499891e5ad7f4c11ad/ca0a87c3c848418384c1dce078656523"
}

import {
  to = cloudflare_workers_kv_namespace.leads_preview
  id = "75a44c24972882499891e5ad7f4c11ad/d768acd88e0f4e1bb89e60485752401d"
}
