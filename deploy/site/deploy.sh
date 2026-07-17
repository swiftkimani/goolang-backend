#!/usr/bin/env bash
set -euo pipefail

# GooLang Backend — Deployment Script
# Deploys to dev.benardkimani.co.ke via Docker Compose + Traefik

REMOTE_HOST="${REMOTE_HOST:-root@173.212.209.92}"
REMOTE_DIR="/root/projects/goolang-backend"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$DEPLOY_DIR/../.." && pwd)"
DOMAIN="dev.benardkimani.co.ke"

log() { echo -e "\033[1;36m▸ $1\033[0m"; }
ok() { echo -e "\033[1;32m✓ $1\033[0m"; }
err() { echo -e "\033[1;31m✗ $1\033[0m"; exit 1; }

# Pre-flight checks
command -v ssh >/dev/null 2>&1 || err "ssh not found"
command -v docker >/dev/null 2>&1 || err "docker not found locally"

log "Testing SSH connection..."
ssh -o ConnectTimeout=10 "$REMOTE_HOST" "echo ok" >/dev/null 2>&1 || err "Cannot connect to $REMOTE_HOST"

log "Ensuring remote directory exists..."
ssh "$REMOTE_HOST" "mkdir -p $REMOTE_DIR"

log "Syncing project to server..."
# Use rsync for efficient transfer, excluding build artifacts and git
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.venv' \
  --exclude='dist' \
  --exclude='build/dist' \
  --exclude='.cover' \
  --exclude='bin' \
  --exclude='data' \
  "$PROJECT_ROOT/" "$REMOTE_HOST:$REMOTE_DIR/"

log "Verifying Docker network..."
ssh "$REMOTE_HOST" "docker network ls | grep -q traefik" || \
  ssh "$REMOTE_HOST" "docker network create traefik" 

log "Building and starting containers..."
ssh "$REMOTE_HOST" "cd $REMOTE_DIR/deploy/site && docker compose down --remove-orphans 2>/dev/null; docker compose up -d --build"

log "Waiting for containers to start..."
sleep 5

log "Checking container status..."
ssh "$REMOTE_HOST" "cd $REMOTE_DIR/deploy/site && docker compose ps"

log "Verifying API health..."
ssh "$REMOTE_HOST" "docker exec \$(docker ps -q -f name=go-server) wget -qO- http://localhost:8080/health" 2>/dev/null && \
  ok "API health check passed" || \
  echo "⚠ Health check may take a moment (containers still starting)"

echo ""
ok "Deployment complete!"
echo ""
echo "  🌐 Site:       https://$DOMAIN"
echo "  📡 API:        https://$DOMAIN/api/health"
echo ""
echo "  Next steps:"
echo "  1. Ensure DNS A record: $DOMAIN → 173.212.209.92"
echo "  2. Traefik will auto-provision SSL via Let's Encrypt"
echo "  3. Check logs: ssh $REMOTE_HOST 'cd $REMOTE_DIR/deploy/site && docker compose logs -f'"
echo ""
