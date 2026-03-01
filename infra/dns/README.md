# DNS Setup (Manual)

Sprea uses **manual DNS** because the Namecheap API requires a $50 account balance. Set up these records in your registrar (e.g. Namecheap) **after** provisioning the droplet.

## Required records

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `DROPLET_IP` | 300 |
| A | api | `DROPLET_IP` | 300 |
| A | www | `DROPLET_IP` | 300 (optional) |

Replace `DROPLET_IP` with your droplet's public IP (from `terraform output droplet_ip`).

## Namecheap steps

1. Log in → Domain List → Manage (sprea.live)
2. **Advanced DNS** tab
3. Add these **A Records**:
   - Host: `@` → Value: `YOUR_DROPLET_IP`
   - Host: `api` → Value: `YOUR_DROPLET_IP`
   - Host: `www` → Value: `YOUR_DROPLET_IP` (optional)
4. Save. Propagation can take 5–30 minutes.

## After DNS propagates

- https://sprea.live → web app
- https://api.sprea.live → API

Caddy obtains and renews Let's Encrypt certificates automatically.
