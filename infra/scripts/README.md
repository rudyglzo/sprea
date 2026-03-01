# Provision Scripts

## provision.sh

One-command provision: Terraform → Ansible → first deploy.

```bash
cd infra/scripts
# Terraform needs do_token + ssh_key_name. Use terraform.tfvars (recommended) or env vars:
cp ../terraform/terraform.tfvars.example ../terraform/terraform.tfvars   # once, fill in
./provision.sh
```

**Options:**
- `--no-deploy` – Skip first deploy (only provision + configure)
- `--no-k3s` – Docker Compose only (recommended for 1GB droplet)

**Env (optional if terraform.tfvars exists):**
- `SPREA_DOMAIN` – Domain (default: sprea.live)
- `TF_VAR_do_token` – DigitalOcean API token
- `TF_VAR_ssh_key_name` – SSH key name in DO account

**Prereqs:** `terraform.tfvars` with `do_token` and `ssh_key_name` (recommended); or `TF_VAR_*` env vars. Ansible installed.
