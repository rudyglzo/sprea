#!/usr/bin/env bash
# Provision Sprea: Terraform → Ansible → first deploy
# Usage: ./provision.sh [--no-deploy] [--no-k3s]
# Terraform: use terraform.tfvars (do_token, ssh_key_name) or TF_VAR_* env vars
# Env: SPREA_DOMAIN (default: sprea.live)

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$INFRA_DIR/terraform"
ANSIBLE_DIR="$INFRA_DIR/ansible"
REPO_ROOT="$(dirname "$INFRA_DIR")"

SPREA_DOMAIN="${SPREA_DOMAIN:-sprea.live}"
NO_DEPLOY=false
NO_K3S=false

for arg in "$@"; do
  case "$arg" in
    --no-deploy) NO_DEPLOY=true ;;
    --no-k3s)    NO_K3S=true ;;
    -h|--help)
      echo "Usage: $0 [--no-deploy] [--no-k3s]"
      echo "  --no-deploy  Skip first deploy (only provision + configure)"
      echo "  --no-k3s     Skip k3s install (Docker Compose only, good for 1GB droplet)"
      echo "Terraform: terraform.tfvars or TF_VAR_do_token, TF_VAR_ssh_key_name"
      exit 0
      ;;
  esac
done

echo "==> Sprea provision (domain: $SPREA_DOMAIN)"
echo ""

# 1. Terraform
echo "==> Terraform apply"
cd "$TERRAFORM_DIR"
terraform init -input=false
terraform apply -auto-approve -input=false

DROPLET_IP=$(terraform output -raw droplet_ip)
echo "    Droplet IP: $DROPLET_IP"
echo ""

# 2. Ansible inventory
echo "==> Ansible inventory"
INVENTORY="$ANSIBLE_DIR/inventory"
echo "$DROPLET_IP ansible_user=root" > "$INVENTORY"
echo "    Wrote $INVENTORY"
echo ""

# 2.5 Wait for SSH (droplet can take 1–2 min to boot)
echo "==> Waiting for SSH..."
for i in {1..30}; do
  if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes "root@$DROPLET_IP" exit 2>/dev/null; then
    echo "    SSH ready"
    break
  fi
  sleep 10
  if [[ $i -eq 30 ]]; then
    echo "    SSH not ready after 5 min. Aborting."
    exit 1
  fi
done
echo ""

# 3. Ansible playbooks
echo "==> Ansible: install-docker"
ansible-playbook -i "$INVENTORY" "$ANSIBLE_DIR/install-docker.yml"

if [[ "$NO_K3S" != "true" ]]; then
  echo "==> Ansible: install-k3s"
  ansible-playbook -i "$INVENTORY" "$ANSIBLE_DIR/install-k3s.yml"
fi

echo "==> Ansible: install-caddy"
if [[ "$NO_K3S" == "true" ]]; then
  # Docker Compose: localhost:3000, localhost:8000
  ansible-playbook -i "$INVENTORY" "$ANSIBLE_DIR/install-caddy.yml" \
    -e "sprea_domain=$SPREA_DOMAIN" \
    -e "sprea_web_port=3000" \
    -e "sprea_api_port=8000"
else
  # k3s: NodePorts 30081 (web), 30080 (api)
  ansible-playbook -i "$INVENTORY" "$ANSIBLE_DIR/install-caddy.yml" \
    -e "sprea_domain=$SPREA_DOMAIN" \
    -e "sprea_web_port=30081" \
    -e "sprea_api_port=30080"
fi
echo ""

# 4. First deploy (optional)
if [[ "$NO_DEPLOY" == "true" ]]; then
  echo "==> Skipping first deploy (--no-deploy)"
  echo "    Next: set up DNS A records for $SPREA_DOMAIN and api.$SPREA_DOMAIN -> $DROPLET_IP"
  echo "    Then: docker compose pull && docker compose up -d (or kubectl apply)"
  exit 0
fi

echo "==> First deploy"
if [[ "$NO_K3S" == "true" ]]; then
  # Docker Compose
  ENV_TMP=$(mktemp)
  sed "s/SPREA_DOMAIN_PLACEHOLDER/$SPREA_DOMAIN/g" "$SCRIPT_DIR/env.provision.template" > "$ENV_TMP"
  ansible all -i "$INVENTORY" -m file -a "path=/root/sprea state=directory" -b
  ansible all -i "$INVENTORY" -m copy -a "src=$REPO_ROOT/docker-compose.yml dest=/root/sprea/docker-compose.yml" -b
  ansible all -i "$INVENTORY" -m copy -a "src=$ENV_TMP dest=/root/sprea/.env" -b
  rm -f "$ENV_TMP"
  ansible all -i "$INVENTORY" -m shell -a "cd /root/sprea && docker compose pull && docker compose up -d" -b
else
  # k3s
  ansible all -i "$INVENTORY" -m file -a "path=/root/k3s-manifests state=directory" -b
  ansible all -i "$INVENTORY" -m synchronize -a "src=$INFRA_DIR/k3s/base/ dest=/root/k3s-manifests" -b
  ansible all -i "$INVENTORY" -m shell -a "kubectl apply -f /root/k3s-manifests/" -b
fi

echo ""
echo "==> Done. Set up DNS: $SPREA_DOMAIN and api.$SPREA_DOMAIN -> $DROPLET_IP"
echo "    (Namecheap: Advanced DNS → A records)"
