# Caddy

Reverse proxy + automatic HTTPS. Installed and configured by Ansible (`install-caddy.yml`).

**Manual:** Copy `Caddyfile` to `/etc/caddy/Caddyfile`, replace `YOUR_DOMAIN`, then `systemctl restart caddy`.

**k3s:** Use NodePorts 30080 (api) and 30081 (web) instead of 8000 and 3000.
