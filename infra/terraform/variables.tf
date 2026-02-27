variable "do_token" {
  description = "DigitalOcean API token. Create at: https://cloud.digitalocean.com/account/api/tokens"
  type        = string
  sensitive   = true
}

variable "ssh_key_name" {
  description = "Name of the SSH key in your DigitalOcean account (Settings → Security → SSH Keys)"
  type        = string
}

variable "droplet_name" {
  description = "Hostname for the droplet"
  type        = string
  default     = "sprea"
}

variable "region" {
  description = "DigitalOcean region (e.g. nyc1, sfo3, sgp1)"
  type        = string
  default     = "atl1"
}

variable "droplet_size" {
  description = "Droplet size slug. s-1vcpu-1gb = $6/mo, s-1vcpu-2gb = $12/mo"
  type        = string
  default     = "s-1vcpu-1gb"
}

variable "droplet_image" {
  description = "Image slug. ubuntu-24-04-x64 is a good default"
  type        = string
  default     = "ubuntu-24-04-x64"
}
