# Production Deployment

## Stack

- **Server:** Volcengine ECS (4C8G, 80GB SSD), Ubuntu 22.04 LTS
- **Process manager:** PM2 (2 apps: cms + web)
- **Reverse proxy:** Nginx with Let's Encrypt SSL
- **Database:** SQLite (single instance; back up via cron)
- **CI/CD:** GitHub Actions → SSH deploy to `${DEPLOY_USER}@${DEPLOY_HOST}`

## Files

| File | Purpose |
|------|---------|
| `nginx.conf.example` | Production Nginx site config (HTTPS + reverse proxy) |
| `ecosystem.config.cjs` | PM2 process definitions (cms on 1337, web on 3000) |
| `setup-server.sh` | One-shot server bootstrap (run once on fresh ECS) |
| `../.github/workflows/deploy.yml` | CI/CD pipeline (test → deploy → notify) |

## First-time setup

1. **Buy domain + point DNS** to your ECS public IP (A records for `@` and `www`)
2. **Apply for ICP 备案** via your hosting provider (15-20 working days)
3. **SSH into the server** as root
4. **Run setup script**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/shuanghong-web/main/deploy/setup-server.sh | bash
   ```
5. **Add GitHub repo secrets** (Settings → Secrets → Actions):
   - `DEPLOY_HOST` — server public IP
   - `DEPLOY_USER` — `shuanghong`
   - `DEPLOY_SSH_KEY` — private key whose public counterpart is in `~shuanghong/.ssh/authorized_keys`
   - `WEBHOOK_URL` — optional, for deploy notifications (Feishu/Slack/etc.)
6. **Issue SSL cert** (interactive):
   ```bash
   certbot --nginx -d shuanghongtech.com -d www.shuanghongtech.com
   ```
7. **Push to `main` branch** to trigger first deploy

## Operating

```bash
# View logs
pm2 logs

# Restart services
pm2 restart ecosystem.config.cjs

# Update env without full deploy
ssh shuanghong@server 'nano ~/shuanghong-web/.env && pm2 reload ecosystem.config.cjs'

# Backup SQLite (cron recommended: daily at 03:00)
cp /home/shuanghong/shuanghong-web/cms/.tmp/data.db /home/shuanghong/backups/data-$(date +%F).db

# Cert auto-renewal (Certbot sets this up)
certbot renew --dry-run
```

## Health check endpoints

- `GET https://shuanghongtech.com/` — Next.js home (HTTP 200)
- `GET https://shuanghongtech.com/sitemap.xml` — XML sitemap
- `GET https://shuanghongtech.com/api/inquiry` — POST only, returns 405
- Admin: `https://shuanghongtech.com/admin/` (Strapi)
