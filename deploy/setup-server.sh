#!/usr/bin/env bash
# Server setup script for production deploy.
# Run as root on a fresh Ubuntu 22.04 LTS (Volcengine ECS).
#
# Installs: Node 20 (via nvm), PM2, Nginx, Certbot.
# Creates deploy user, sets up directories and systemd log rotation.
# Idempotent: safe to re-run.

set -euo pipefail

APP_USER="shuanghong"
APP_DIR="/home/${APP_USER}/shuanghong-web"
LOG_DIR="/var/log/shuanghong"

echo "=== 1. System update + base tools ==="
apt-get update -qq
apt-get install -y -qq curl git build-essential ufw

echo "=== 2. Firewall (SSH + HTTP + HTTPS) ==="
ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable

echo "=== 3. Node 20 via nvm ==="
if [ ! -d /root/.nvm ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

echo "=== 4. PM2 + Nginx + Certbot ==="
npm install -g pm2
apt-get install -y -qq nginx certbot python3-certbot-nginx

echo "=== 5. Create app user (skip if exists) ==="
if ! id "${APP_USER}" &>/dev/null; then
  adduser --disabled-password --gecos "" "${APP_USER}"
  mkdir -p "${APP_DIR}"
  chown -R "${APP_USER}:${APP_USER}" "/home/${APP_USER}"
fi

echo "=== 6. Log directory ==="
mkdir -p "${LOG_DIR}"
chown "${APP_USER}:${APP_USER}" "${LOG_DIR}"

echo "=== 7. Clone or update repo (assumes SSH key already authorized) ==="
if [ ! -d "${APP_DIR}/.git" ]; then
  sudo -u "${APP_USER}" git clone git@github.com:YOUR_ORG/shuanghong-web.git "${APP_DIR}"
else
  sudo -u "${APP_USER}" git -C "${APP_DIR}" pull --ff-only
fi

echo "=== 8. Install deps (CMS first, then web) ==="
sudo -u "${APP_USER}" bash -lc "source /home/${APP_USER}/.nvm/nvm.sh && cd ${APP_DIR}/cms && npm ci --omit=dev"
sudo -u "${APP_USER}" bash -lc "source /home/${APP_USER}/.nvm/nvm.sh && cd ${APP_DIR}/web && npm ci && npm run build"

echo "=== 9. Nginx site config (skip if already configured) ==="
if [ ! -f /etc/nginx/sites-enabled/shuanghongtech.com ]; then
  cp "${APP_DIR}/deploy/nginx.conf.example" /etc/nginx/sites-available/shuanghongtech.com
  ln -s /etc/nginx/sites-available/shuanghongtech.com /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
fi

echo "=== 10. SSL cert (interactive — run manually) ==="
echo "After DNS A records point to this server, run:"
echo "  certbot --nginx -d shuanghongtech.com -d www.shuanghongtech.com"

echo "=== 11. PM2 startup + save ==="
pm2 startup systemd -u "${APP_USER}" --hp "/home/${APP_USER}" | grep "sudo env" | bash
sudo -u "${APP_USER}" bash -lc "source /home/${APP_USER}/.nvm/nvm.sh && cd ${APP_DIR} && pm2 start deploy/ecosystem.config.cjs"
sudo -u "${APP_USER}" bash -lc "source /home/${APP_USER}/.nvm/nvm.sh && pm2 save"

echo "=== ✅ Setup complete ==="
echo "Next steps:"
echo "  1. Add DNS A records for shuanghongtech.com + www → $(curl -s ifconfig.me)"
echo "  2. certbot --nginx -d shuanghongtech.com -d www.shuanghongtech.com"
echo "  3. Set GitHub repo secrets (SSH key for ${APP_USER}@$(hostname))"
echo "  4. Push to main branch to trigger CI/CD deploy"
