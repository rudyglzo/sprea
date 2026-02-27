# Sprea Infrastructure

Learning path for deploying Sprea to a self-managed DigitalOcean droplet: Terraform → Ansible → Docker → Kubernetes → CI/CD.

## Pipeline overview

```
Terraform → Ansible → Docker → K8s → CI/CD
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

## Step 3: Docker (coming next)

Build images for `apps/api` and `apps/web`, push to a registry.

## Step 4: Kubernetes (coming next)

Deploy containers to the cluster (k3s or similar).

## Step 5: CI/CD (coming next)

GitHub Actions: build on push → push images → deploy to cluster.

## Prerequisites

- Terraform, Ansible, Docker, kubectl installed (see project README)
- DigitalOcean account + API token
- SSH key added to DigitalOcean
