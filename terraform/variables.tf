variable "account_id" {
  type    = string
  default = "75a44c24972882499891e5ad7f4c11ad"
}

variable "zone_id" {
  type        = string
  description = "fennerframework.com zone"
  default     = "b6136bdfd0c1677fd485bad88bc5478a"
}

variable "project_name" {
  type    = string
  default = "fennerframework"
}

variable "custom_domains" {
  type        = list(string)
  description = "Hostnames attached to the Pages project (each gets a proxied CNAME to <project>.pages.dev)"
  default     = ["fennerframework.com", "www.fennerframework.com"]
}
