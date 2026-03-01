# Sprea Infrastructure v1

Learning path for deploying Sprea to a self-managed DigitalOcean droplet: Terraform → Ansible → Docker → Kubernetes → CI/CD.

## Pipeline overview

```
Terraform → Ansible → Docker → K3s → CI/CD
   ↓           ↓         ↓       ↓       ↓
  VM        config    images   deploy   automate
```

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

Installs Docker (and optionally k3s) on the droplet.

```bash
cd infra/ansible
cp inventory.example inventory
# Edit inventory: replace YOUR_DROPLET_IP with terraform output droplet_ip
ansible-playbook -i inventory playbook.yml
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

## Prerequisites

- Terraform, Ansible, Docker, kubectl installed (see project README)
- DigitalOcean account + API token
- SSH key added to DigitalOcean
