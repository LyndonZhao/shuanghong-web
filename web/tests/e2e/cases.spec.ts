import { test, expect } from '@playwright/test';

test.describe('Case detail pages (/cases/[slug])', () => {
  test('manufacturing detail page renders all 7 sections + tables + mailto CTA', async ({ page }) => {
    await page.goto('/cases/manufacturing-ai-landing');

    // H1 标题
    await expect(page.getByRole('heading', { level: 1 })).toContainText('制造业 AI 落地服务');

    // 7 个 h2 sections
    const h2s = page.getByRole('heading', { level: 2 });
    await expect(h2s).toHaveCount(7);
    await expect(h2s.nth(0)).toContainText('我们做什么');
    await expect(h2s.nth(6)).toContainText('常见问题');

    // markdown 表格被渲染
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // mailto CTA
    const cta = page.getByRole('link', { name: /聊聊这个方案/ });
    await expect(cta).toHaveAttribute('href', /^mailto:/);
    expect(cta.getAttribute('href') ?? '').toContain('manufacturing');
  });

  test('drawing-review page has 8 sections with H3 nested sub-sections', async ({ page }) => {
    await page.goto('/cases/case-ai-drawing-review');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AI 图纸审核');
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8);
    // H3 子章节（来自核心能力 ### 1. ...）
    const h3s = page.getByRole('heading', { level: 3 });
    expect(await h3s.count()).toBeGreaterThan(0);
  });

  test('first-patent page has 6 sections including steps with H3', async ({ page }) => {
    await page.goto('/cases/case-ai-patent');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('写出第一篇专利');
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(6);
  });

  test('returns to correct category list page from back link', async ({ page }) => {
    await page.goto('/cases/case-ai-patent');
    await page.getByRole('link', { name: /返回智能 AI 应用/ }).click();
    await expect(page).toHaveURL('/ai-application');

    await page.goto('/cases/dual-system-contract-linkage');
    await page.getByRole('link', { name: /返回多模态交互/ }).click();
    await expect(page).toHaveURL('/multimodal');
  });

  test('non-existent slug hits the not-found page', async ({ page }) => {
    const res = await page.goto('/cases/this-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('案例未找到');
  });
});

test.describe('List page → case detail navigation', () => {
  test('clicking a card on /ai-application navigates to its detail page', async ({ page }) => {
    await page.goto('/ai-application');
    const card = page.getByRole('link', { name: /制造业 AI 落地服务/ }).first();
    await card.click();
    await expect(page).toHaveURL('/cases/manufacturing-ai-landing');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('制造业 AI 落地服务');
  });

  test('clicking a card on /multimodal navigates to its detail page', async ({ page }) => {
    await page.goto('/multimodal');
    const card = page.getByRole('link', { name: /双系统强契约联动/ }).first();
    await card.click();
    await expect(page).toHaveURL('/cases/dual-system-contract-linkage');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('双系统强契约联动');
  });
});

test.describe('SEO', () => {
  test('sitemap.xml includes all /cases/[slug] URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const text = await res.text();
    for (const slug of [
      'manufacturing-ai-landing',
      'case-ai-drawing-review',
      'case-ai-quoting',
      'case-ai-patent',
      'dual-system-contract-linkage',
    ]) {
      expect(text).toContain(`/cases/${slug}`);
    }
  });
});
