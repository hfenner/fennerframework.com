terraform {
  required_version = ">= 1.10"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }
  }
  # State is local (terraform.tfstate is gitignored), same as ishufenner.com.
}

# Auth: export CLOUDFLARE_API_TOKEN (see ~/.cloudflare-token). Needs Pages:Edit and
# Workers KV Storage:Edit on the account, and DNS:Edit on the fennerframework.com zone.
provider "cloudflare" {}
