# 双泓科技官网

> Next.js 14 + Strapi 5 + SQLite · 部署在火山引擎 ECS

## 快速开始(开发)

```bash
# 1. Strapi 后端
cd cms && npm install && npm run develop
# 运行在 http://localhost:1337

# 2. Next.js 前端
cd web && npm install && npm run dev
# 运行在 http://localhost:3000
```

## 生产部署

```bash
# 部署脚本
./deploy/deploy.sh
```

## 项目结构

```
shuanghong-web/
├── web/        # Next.js 14 前端
├── cms/        # Strapi 5 后端
└── deploy/     # 部署配置
```

## 文档

- 设计: `docs/superpowers/specs/2026-06-11-shuanghongtech-website-design.md`
- 计划: `docs/superpowers/plans/2026-06-11-shuanghongtech-website.md`
