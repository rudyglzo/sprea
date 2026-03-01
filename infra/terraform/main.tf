terraform {
  required_version = ">= 1.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

data "digitalocean_ssh_key" "main" {
  name = var.ssh_key_name
}

resource "digitalocean_droplet" "sprea" {
  name   = var.droplet_name
  region = var.region
  size   = var.droplet_size

  image = var.droplet_image

  ssh_keys = [data.digitalocean_ssh_key.main.id]

  tags = ["sprea", "terraform"]
}
