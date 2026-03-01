# CI/CD

GitHub Actions: build → push to Docker Hub → deploy to k3s.

## Secrets (Settings → Secrets and variables → Actions)

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `DEPLOY_HOST` | Droplet IP |
| `SSH_PRIVATE_KEY` | Private key for `ssh root@DEPLOY_HOST` |

## Deploy step

SSHs to droplet and runs `kubectl rollout restart` to pull new images. Remove that step if you deploy manually.
