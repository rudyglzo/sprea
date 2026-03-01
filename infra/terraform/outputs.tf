# =============================================================================
# Outputs - values Terraform prints after apply. Use these for Ansible inventory,
# or: terraform output droplet_ip
# =============================================================================

output "droplet_ip" {
  description = "Public IP of the droplet. Use this to SSH and for Ansible."
  value       = digitalocean_droplet.sprea.ipv4_address
}

output "droplet_id" {
  description = "DigitalOcean droplet ID (useful for doctl or API)"
  value       = digitalocean_droplet.sprea.id
}
