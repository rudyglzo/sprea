# Sprea Infrastructure v1

Learning path for deploying Sprea to a self-managed DigitalOcean droplet: Terraform → Ansible → Docker → Kubernetes → CI/CD.

## Pipeline overview

```
Terraform → Ansible → Docker → K3s → CI/CD
   ↓           ↓         ↓       ↓       ↓
  VM        config    images   deploy   automate
```

## Quick start: one-command provision

```bash
cd infra/scripts
export TF_VAR_do_token="your-do-token"
export TF_VAR_ssh_key_name="your-ssh-key-name"
./provision.sh
```

This runs: Terraform apply → Ansible (Docker, k3s, Caddy) → first deploy. Use `--no-k3s` for Docker Compose only (1GB droplet). Use `--no-deploy` to skip the first deploy step.

**DNS is manual** 

## Step 1: Terraform (provision VM)

Creates a DigitalOcean droplet.

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: do_token, ssh_key_name
terraform init
terraform plan
terraform apply
terraform output droplet_ip   # save this for Ansible
```

See [terraform/README.md](terraform/README.md) for details.

## Step 2: Ansible (configure VM)

Installs Docker, k3s, and Caddy on the droplet.

```bash
cd infra/ansible
cp inventory.example inventory
# Edit inventory: replace YOUR_DROPLET_IP with terraform output droplet_ip
ansible-playbook -i inventory playbook.yml -e sprea_domain=sprea.live -e sprea_web_port=30081 -e sprea_api_port=30080
```

## Step 3: Docker

Build and run Sprea in containers. See **[docker/README.md](docker/README.md)** for the full guide.

**Quick start (local):**
```bash
cd /path/to/sprea
docker compose up --build
```

**Deploy:** `.env` + `docker compose up --build -d` (build on droplet) or `docker compose pull && docker compose up -d` (pull from registry). HTTPS: [caddy/README.md](caddy/README.md).

## Step 4: Kubernetes (k3s)

Deploy to k3s. See **[k3s/README.md](k3s/README.md)**.

## Step 5: CI/CD

GitHub Actions builds images, pushes to Docker Hub, and deploys to k3s. See **[cicd/README.md](cicd/README.md)** for secrets setup.

## DNS (manual)

Namecheap API requires $50 balance, so DNS is manual. After provision, add A records per **[dns/README.md](dns/README.md)**.

## Prerequisites

- Terraform, Ansible, Docker, kubectl installed (see project README)
- DigitalOcean account + API token
- SSH key added to DigitalOcean
