# Sprea on Kubernetes (k3s)

Deploy Sprea to k3s. Caddy (on host) proxies to NodePorts. Replace `YOUR_DOMAIN` in configmap and Caddyfile.

## 1. Install k3s (disable Traefik to keep Caddy)

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -
```

## 2. Stop Docker Compose

```bash
docker compose down
```

## 3. Update ConfigMap

Edit `base/configmap.yaml`: replace `YOUR_DOMAIN` with your domain (e.g. `sprea.live`).

## 4. Apply manifests

```bash
kubectl apply -f base/
```

## 5. Update Caddy

NodePorts: api=30080, web=30081. Update `/etc/caddy/Caddyfile`:

```
YOUR_DOMAIN {
    reverse_proxy localhost:30081
}
api.YOUR_DOMAIN {
    reverse_proxy localhost:30080
}
```

Then `systemctl restart caddy`.

## 6. Verify

```bash
kubectl get pods
kubectl get svc
```
