variable "account_id" {
  type    = string
  default = "75a44c24972882499891e5ad7f4c11ad"
}

variable "project_name" {
  type    = string
  default = "fennerframework"
}

variable "custom_domains" {
  type        = map(string)
  description = "Hostname => zone id. Each hostname is attached to the Pages project and gets a proxied CNAME to <project>.pages.dev in its zone. Non-canonical hosts 301 to the apex via public/_redirects."
  default = {
    "fennerframework.com"      = "b6136bdfd0c1677fd485bad88bc5478a"
    "www.fennerframework.com"  = "b6136bdfd0c1677fd485bad88bc5478a"
    "fennerframeworks.com"     = "802f834e3cbd89f049af5744c29848a4"
    "www.fennerframeworks.com" = "802f834e3cbd89f049af5744c29848a4"
  }
}
