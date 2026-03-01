# Sprea Terraform

Provisions a DigitalOcean droplet for Sprea. This is **step 1** of the infra pipeline: Terraform → Ansible → Docker → K8s → CI/CD.

## Concepts (learn in depth)

- **Terraform** = Infrastructure as Code. You declare *what* you want (a VM, a network, etc.), Terraform figures out *how* to create it and keeps state so it can update/destroy later.
- **Provider** = plugin that talks to a cloud (DigitalOcean, AWS, etc.). We use `digitalocean/digitalocean`.
- **Resource** = one thing Terraform manages (e.g. `digitalocean_droplet`).
- **Variable** = input you pass in (token, region, etc.) so you don't hardcode secrets.
- **Output** = value Terraform prints after apply (e.g. the droplet IP for Ansible).

## Prerequisites

1. **DigitalOcean account** – [Sign up](https://www.digitalocean.com/)
2. **API token** – [Create one](https://cloud.digitalocean.com/account/api/tokens) (read + write)
3. **SSH key in DO** – Add your public key at [Security → SSH Keys](https://cloud.digitalocean.com/account/security). Note the *name* you give it.

## Quick start

```bash
cd infra/terraform

# 1. Copy example vars and fill in do_token + ssh_key_name
cp terraform.tfvars.example terraform.tfvars
vim terraform.tfvars   # or: export TF_VAR_do_token=xxx and TF_VAR_ssh_key_name=xxx

# 2. Initialize (downloads provider)
terraform init

# 3. Preview changes (dry run)
terraform plan

# 4. Create the droplet
terraform apply

# 5. Get the IP for Ansible
terraform output droplet_ip
```

## Commands reference

| Command | What it does |
|---------|--------------|
| `terraform init` | Downloads providers, initializes backend (state) |
| `terraform plan` | Shows what would change (no changes made) |
| `terraform apply` | Creates/updates resources |
| `terraform destroy` | Tears everything down |
| `terraform output` | Prints output values |

## State

Terraform stores state (e.g. `terraform.tfstate`) so it knows what exists. By default it's local. **Never commit state** if it might contain secrets. For production, use a remote backend (S3, Terraform Cloud). For learning, local is fine.

## Next step

After `terraform apply`, you have a droplet IP. Use that in Ansible to configure the VM (install Docker, etc.).
