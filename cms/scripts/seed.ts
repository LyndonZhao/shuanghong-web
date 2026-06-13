/**
 * One-off seed script. Run with:
 *   cd cms && npx tsx scripts/seed.ts
 *
 * Populates:
 *   - 9 Solution entries (4 multimodal + 5 ai_application)
 *   - 1 SiteSetting entry
 *   - 4 Single Type entries (Home/Multimodal/AI/About)
 *
 * Idempotent: skips entries that already exist.
 */

import { createStrapi, compileStrapi } from '@strapi/strapi';

const SOLUTIONS = [
  {
    title: '导览产品',
    slug: 'tour-guide',
    category: 'multimodal',
    order: 1,
    description:
      '面向人形机器人、服务机器人打造的智慧导览解决方案,适配党群服务中心、园区、展馆等多场景。',
  },
  {
    title: '文旅智能互动',
    slug: 'culture-tourism',
    category: 'multimodal',
    order: 2,
    description: '面向文旅场景的沉浸式智能互动解决方案,提供多模态交互体验。',
  },
  {
    title: '企业服务',
    slug: 'enterprise-service',
    category: 'multimodal',
    order: 3,
    description:
      '面向企业的智能服务解决方案,提供业务咨询、办理、流程指引等多模态交互能力。',
  },
  {
    title: '汽车座舱',
    slug: 'automotive-cockpit',
    category: 'multimodal',
    order: 4,
    description: '新一代多模态 DMS 解决方案,实现驾驶员状态监测和智能座舱交互。',
  },
  {
    title: 'AI 辅助专利撰写',
    slug: 'ai-patent',
    category: 'ai_application',
    order: 5,
    description:
      '面向专利代理、企业研发的 AI 辅助专利撰写解决方案,大幅提升撰写效率与质量。',
  },
  {
    title: 'AI 辅助报价系统(门窗柜子装修)',
    slug: 'ai-quoting',
    category: 'ai_application',
    order: 6,
    description: '面向门窗、柜子、装修行业的 AI 辅助报价解决方案,自动生成精准报价。',
  },
  {
    title: 'AI 辅助图纸审核系统(装修)',
    slug: 'ai-drawing-review',
    category: 'ai_application',
    order: 7,
    description: '面向装修设计、工程行业的 AI 辅助图纸审核解决方案,自动识别问题。',
  },
  {
    title: '数字营销系统',
    slug: 'digital-marketing',
    category: 'ai_application',
    order: 8,
    description: '全行业 AI 数字营销解决方案,智能化提升营销效率与转化。',
  },
  {
    title: '整车 AUTOSAR CP 研发自动化',
    slug: 'autosar-automation',
    category: 'ai_application',
    order: 9,
    description: '面向汽车电子的 AUTOSAR CP 研发自动化解决方案,MCAL 自动生成。',
  },
] as const;

const SITE_SETTING = {
  logoSubtitle: '多模态交互专家｜智能AI应用普及者',
  navMenu: [
    { label: '首页', href: '/' },
    { label: '多模态交互', href: '/multimodal' },
    { label: '智能AI应用', href: '/ai-application' },
    { label: '关于双泓', href: '/about' },
  ],
  footerText: '© 2026 上海双泓信息科技有限公司 版权所有',
  contactEmailTo: 'sales@shuanghongtech.com',
};

const HOME_PAGE = {
  heroTitleLine1: '汽车与机器人领域的多模态交互专家',
  heroTitleLine2: '制造及建筑业的智能AI应用普及者',
  heroSubtitle:
    '我们专注于多模态交互技术与 AI 智能体应用,助力汽车、机器人、制造、建筑等行业实现智能化升级。',
  ctaPrimaryLabel: '多模态交互方案',
  ctaPrimaryLink: '/multimodal',
  ctaSecondaryLabel: '智能AI应用解决方案',
  ctaSecondaryLink: '/ai-application',
};

const MULTIMODAL_PAGE = {
  coreAdvantageTitle: '核心优势:端云协同的多模态交互',
  coreAdvantageDesc:
    '结合语音、视觉、触觉等多种模态,实现人与机器的自然交互。通过端云协同架构,既保障低延迟响应,又具备云端大模型的强大理解能力。',
};

const AI_APP_PAGE = {
  coreAdvantageTitle: '核心优势:AI智能体集成平台',
  coreAdvantageDesc:
    '面向行业垂直场景的 AI 智能体集成平台,快速部署、可视化编排、效果可观测,让 AI 真正落地业务。',
};

const ABOUT_PAGE = {
  pageTitle: '关于双泓',
  visionTitle: '公司愿景和目标',
  visionContent:
    '双泓科技致力于成为多模态交互与 AI 应用领域的领先者,以技术创新驱动行业智能化升级,创造更智能、更高效的未来。',
};

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    // Solutions
    const existingSolutions = await app.documents('api::solution.solution').findMany();
    if (existingSolutions.length === 0) {
      console.log('[seed] Creating 9 solutions...');
      for (const s of SOLUTIONS) {
        await app.documents('api::solution.solution').create({ data: s });
      }
    } else {
      console.log(`[seed] ${existingSolutions.length} solutions already exist, skipping`);
    }

    // Site Setting
    const existingSite = await app.documents('api::site-setting.site-setting').findMany();
    if (existingSite.length === 0) {
      console.log('[seed] Creating site setting...');
      await app.documents('api::site-setting.site-setting').create({ data: SITE_SETTING });
    } else {
      console.log('[seed] site setting exists, skipping');
    }

    // Home page
    const existingHome = await app.documents('api::home-page.home-page').findFirst();
    if (!existingHome) {
      console.log('[seed] Creating home page...');
      await app.documents('api::home-page.home-page').create({ data: HOME_PAGE });
    } else {
      console.log('[seed] home page exists, skipping');
    }

    // Multimodal page
    const existingMulti = await app.documents('api::multimodal-page.multimodal-page').findFirst();
    if (!existingMulti) {
      console.log('[seed] Creating multimodal page...');
      await app.documents('api::multimodal-page.multimodal-page').create({ data: MULTIMODAL_PAGE });
    } else {
      console.log('[seed] multimodal page exists, skipping');
    }

    // AI application page
    const existingAI = await app.documents('api::ai-application-page.ai-application-page').findFirst();
    if (!existingAI) {
      console.log('[seed] Creating ai-application page...');
      await app.documents('api::ai-application-page.ai-application-page').create({ data: AI_APP_PAGE });
    } else {
      console.log('[seed] ai-application page exists, skipping');
    }

    // About page
    const existingAbout = await app.documents('api::about-page.about-page').findFirst();
    if (!existingAbout) {
      console.log('[seed] Creating about page...');
      await app.documents('api::about-page.about-page').create({ data: ABOUT_PAGE });
    } else {
      console.log('[seed] about page exists, skipping');
    }

    console.log('[seed] ✅ Done');
  } catch (err) {
    console.error('[seed] ❌ Failed:', err);
    process.exit(1);
  } finally {
    await app.destroy();
  }
}

main();
